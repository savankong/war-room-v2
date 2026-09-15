/**
 * Integration tests for incumbent detection, the recompete read, and brief
 * caching. Needs TEST_DATABASE_URL; see lib/ingestion/opportunities/sync.test.ts.
 *
 * The Anthropic client is always injected, so this suite never calls the API
 * and never needs a key.
 *
 * Covers acceptance criteria 5 (incumbent detection, or a brief that says it
 * could not find one), 6 (brief generation is idempotent) and 7 (every person
 * named resolves to a real contacts.id).
 */
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type Anthropic from '@anthropic-ai/sdk';
import postgres from 'postgres';
import { findIncumbent } from './incumbent';
import { readRecompete } from './recompete';
import { inferRole, findCandidatePeople } from './people';
import { buildBriefContext } from './context';
import { buildFallbackBrief } from './fallback';
import { generateCaptureBrief, getCachedBrief } from './generate';
import type { BriefOutput } from './schema';

const TEST_DB = process.env.TEST_DATABASE_URL;

type Sql = ReturnType<typeof postgres>;
let sql: Sql;
let companyId: string;
let opportunityId: string;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Minimal stand-in for the SDK surface generateCaptureBrief touches. Counts
 * calls so the caching criterion can be asserted directly.
 */
function fakeClient(responses: Array<BriefOutput | null>) {
  const calls: unknown[] = [];
  const client = {
    messages: {
      parse: async (params: unknown) => {
        calls.push(params);
        const next = responses.shift() ?? null;
        return {
          parsed_output: next,
          usage: { input_tokens: 1000, output_tokens: 200 },
        };
      },
    },
  };
  return { client: client as unknown as Anthropic, calls };
}

function validBrief(personId: string): BriefOutput {
  return {
    summary: 'DISA posted a Sources Sought for enterprise cloud migration support.',
    why_it_matters: ['Same NAICS as your past DISA work.'],
    recommendation: 'position_now',
    recommendation_rationale: ['Pre-RFP, so the requirement is still being shaped.'],
    people: [{ person_id: personId, why: 'Contracting Officer at DISA.', suggested_action: 'Introduce the company.' }],
    next_action: 'Respond to the Sources Sought before the deadline.',
  };
}

async function seed(): Promise<{ companyId: string; opportunityId: string; personId: string }> {
  const [user] = await sql<{ id: number }[]>`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${`capture-${Date.now()}@example.test`}, 'x', 'Capture Test')
    RETURNING id
  `;
  const [company] = await sql<{ id: string }[]>`
    INSERT INTO user_companies (name, owner_user_id, plan)
    VALUES ('Capture Test Co', ${user.id}, 'trial')
    RETURNING id
  `;
  await sql`
    INSERT INTO company_profiles (user_company_id, naics_codes, psc_codes, target_org_ids, capabilities)
    VALUES (${company.id}, ARRAY['541512'], ARRAY['D399'], ARRAY['disa'], ARRAY['cloud migration'])
  `;

  const [opportunity] = await sql<{ id: string }[]>`
    INSERT INTO opportunities (
      external_id, source, title, description, notice_type, naics_code, psc_code,
      response_deadline, canonical_org_id, posted_date
    ) VALUES (
      ${`cap-${Math.random().toString(36).slice(2)}`}, 'sam',
      'Enterprise Cloud Migration Support', 'Cloud migration support services.',
      'Sources Sought', '541512', 'D399',
      ${daysFromNow(30)}, 'disa', current_date
    ) RETURNING id
  `;

  await sql`
    INSERT INTO matches (user_company_id, opportunity_id, score, fit, evidence)
    VALUES (${company.id}, ${opportunity.id}, 80, 'strong',
            ${sql.json([{ factor: 'naics_exact', points: 25, line: 'Same NAICS as your past work (541512)' }])})
  `;

  const personId = `contact-${Math.random().toString(36).slice(2)}`;
  await sql`
    INSERT INTO contacts (id, name, title, canonical_org_id, email)
    VALUES (${personId}, 'Dana Reyes', 'Contracting Officer', 'disa', 'dana.reyes@disa.mil')
  `;

  return { companyId: company.id, opportunityId: opportunity.id, personId };
}

describe('capture pipeline', { skip: TEST_DB ? false : 'TEST_DATABASE_URL not set' }, () => {
  let personId: string;

  before(() => {
    sql = postgres(TEST_DB!, { max: 1, prepare: false, onnotice: () => {} });
  });

  after(async () => {
    await sql?.end({ timeout: 5 });
  });

  beforeEach(async () => {
    await sql`DELETE FROM capture_briefs`;
    await sql`DELETE FROM matches`;
    await sql`DELETE FROM company_profiles`;
    await sql`DELETE FROM user_companies`;
    await sql`DELETE FROM opportunities`;
    await sql`DELETE FROM contracts`;
    await sql`DELETE FROM contacts WHERE id LIKE 'contact-%'`;
    const seeded = await seed();
    companyId = seeded.companyId;
    opportunityId = seeded.opportunityId;
    personId = seeded.personId;
  });

  describe('incumbent detection (§6)', () => {
    test('says plainly that it found nothing rather than guessing', async () => {
      // Acceptance criterion 5's second half, and §8 rule 1.
      const result = await findIncumbent(sql, {
        orgLineage: ['disa'],
        title: 'Enterprise Cloud Migration Support',
        naicsCode: '541512',
        pscCode: 'D399',
      });
      assert.equal(result.incumbent, null);
      assert.match(result.evidence[0], /No prior contract identified/i);
    });

    test('finds a matching contract in the org lineage', async () => {
      await sql`
        INSERT INTO contracts (id, title, recipient, canonical_org_id, naics_code, end_date, total_obligation)
        VALUES ('c-live', 'Cloud Migration Support Services', 'Acme Systems', 'disa', '541512',
                ${daysFromNow(200)}, 4200000)
      `;
      const result = await findIncumbent(sql, {
        orgLineage: ['disa'],
        title: 'Enterprise Cloud Migration Support',
        naicsCode: '541512',
        pscCode: null,
      });
      assert.equal(result.incumbent?.recipient, 'Acme Systems');
      assert.ok(result.evidence.some((e) => e.includes('Acme Systems')));
    });

    test('ignores a contract with no end_date rather than assuming it is live', async () => {
      await sql`
        INSERT INTO contracts (id, title, recipient, canonical_org_id, naics_code, end_date)
        VALUES ('c-noend', 'Cloud Migration Support Services', 'Acme Systems', 'disa', '541512', NULL)
      `;
      const result = await findIncumbent(sql, {
        orgLineage: ['disa'],
        title: 'Enterprise Cloud Migration Support',
        naicsCode: '541512',
        pscCode: null,
      });
      assert.equal(result.incumbent, null);
    });

    test('ignores a contract that expired more than six months ago', async () => {
      await sql`
        INSERT INTO contracts (id, title, recipient, canonical_org_id, naics_code, end_date)
        VALUES ('c-old', 'Cloud Migration Support Services', 'Acme Systems', 'disa', '541512', ${daysFromNow(-400)})
      `;
      const result = await findIncumbent(sql, {
        orgLineage: ['disa'],
        title: 'Enterprise Cloud Migration Support',
        naicsCode: '541512',
        pscCode: null,
      });
      assert.equal(result.incumbent, null);
    });

    test('ignores an unrelated title at the same office', async () => {
      await sql`
        INSERT INTO contracts (id, title, recipient, canonical_org_id, naics_code, end_date, total_obligation)
        VALUES ('c-unrelated', 'Grounds Maintenance and Landscaping', 'Mow Co', 'disa', '541512',
                ${daysFromNow(100)}, 900000)
      `;
      const result = await findIncumbent(sql, {
        orgLineage: ['disa'],
        title: 'Enterprise Cloud Migration Support',
        naicsCode: '541512',
        pscCode: null,
      });
      assert.equal(result.incumbent, null, 'title similarity must reject an unrelated contract');
    });

    test('ranks by total obligation', async () => {
      await sql`
        INSERT INTO contracts (id, title, recipient, canonical_org_id, naics_code, end_date, total_obligation)
        VALUES
          ('c-small', 'Cloud Migration Support', 'Small Co', 'disa', '541512', ${daysFromNow(150)}, 500000),
          ('c-big',   'Cloud Migration Support', 'Big Co',   'disa', '541512', ${daysFromNow(150)}, 9000000)
      `;
      const result = await findIncumbent(sql, {
        orgLineage: ['disa'],
        title: 'Enterprise Cloud Migration Support',
        naicsCode: '541512',
        pscCode: null,
      });
      assert.equal(result.incumbent?.recipient, 'Big Co');
      assert.equal(result.alternates.length, 1);
    });
  });

  describe('recompete confidence (§6)', () => {
    const base = { opportunityId: 'x', orgLineage: ['disa'], naicsCode: '541512', orgLabel: 'DISA' };

    test('low with no incumbent, and says the read is inferred', async () => {
      const read = await readRecompete(sql, { ...base, incumbent: null, isPreRfp: true });
      assert.equal(read.confidence, 'low');
      assert.match(read.evidence.join(' '), /inferred/i);
    });

    test('high when expiring within 12 months and the notice is itself pre-RFP', async () => {
      const read = await readRecompete(sql, {
        ...base,
        incumbent: { endDate: daysFromNow(200) } as never,
        isPreRfp: true,
      });
      assert.equal(read.confidence, 'high');
    });

    test('medium when expiring within 18 months with no pre-solicitation activity', async () => {
      const read = await readRecompete(sql, {
        ...base,
        incumbent: { endDate: daysFromNow(500) } as never,
        isPreRfp: false,
      });
      assert.equal(read.confidence, 'medium');
      assert.match(read.evidence.join(' '), /No pre-solicitation activity/i);
    });

    test('low when the contract runs beyond 18 months', async () => {
      const read = await readRecompete(sql, {
        ...base,
        incumbent: { endDate: daysFromNow(900) } as never,
        isPreRfp: false,
      });
      assert.equal(read.confidence, 'low');
    });

    test('always returns evidence alongside the label (§8 rule 3)', async () => {
      for (const days of [200, 500, 900]) {
        const read = await readRecompete(sql, {
          ...base,
          incumbent: { endDate: daysFromNow(days) } as never,
          isPreRfp: false,
        });
        assert.ok(read.evidence.length > 0, `no evidence for a ${read.confidence} read`);
      }
    });
  });

  describe('candidate people (§6)', () => {
    test('infers the roles the brief is built around', () => {
      assert.equal(inferRole('Contracting Officer'), 'contracting_officer');
      assert.equal(inferRole('Deputy Program Manager'), 'program_manager');
      assert.equal(inferRole('Small Business Specialist'), 'small_business_specialist');
      assert.equal(inferRole('Chief Engineer'), 'technical_lead');
      assert.equal(inferRole('Director of Operations'), 'leadership');
      assert.equal(inferRole(null), 'other');
    });

    test('a small business specialist is not misread as a contracting officer', () => {
      // Order matters: the CO pattern would otherwise swallow this.
      assert.equal(inferRole('Office of Small Business Programs Director'), 'small_business_specialist');
    });

    test('returns at most eight candidates', async () => {
      const people = await findCandidatePeople(sql, ['disa'], 'disa');
      assert.ok(people.length <= 8);
      assert.ok(people.some((p) => p.personId === personId));
    });
  });

  describe('brief generation (§6)', () => {
    test('is idempotent — the second call makes no API call', async () => {
      // Acceptance criterion 6.
      const { client, calls } = fakeClient([validBrief(personId), validBrief(personId)]);

      const first = await generateCaptureBrief(sql, companyId, opportunityId, { client });
      assert.equal(first.fromCache, false);
      assert.equal(calls.length, 1);

      const second = await generateCaptureBrief(sql, companyId, opportunityId, { client });
      assert.equal(second.fromCache, true);
      assert.equal(calls.length, 1, 'opening the same brief twice must make one LLM call');
      assert.equal(second.brief.id, first.brief.id);
    });

    test('retries once on a validation failure, then accepts the corrected brief', async () => {
      const invalid = { ...validBrief(personId), summary: 'We put this at a 70% chance.' };
      const { client, calls } = fakeClient([invalid, validBrief(personId)]);

      const result = await generateCaptureBrief(sql, companyId, opportunityId, { client });
      assert.equal(calls.length, 2);
      assert.equal(result.brief.generator, 'llm');
      assert.ok(!/%/.test(result.brief.summary ?? ''));
    });

    test('falls back to the deterministic template after two failures', async () => {
      const invalid = { ...validBrief(personId), people: [{ person_id: 'invented', why: 'x', suggested_action: 'y' }] };
      const { client, calls } = fakeClient([invalid, invalid]);

      const result = await generateCaptureBrief(sql, companyId, opportunityId, { client });
      assert.equal(calls.length, 2);
      assert.equal(result.brief.generator, 'template');
      assert.ok(result.brief.summary);
    });

    test('falls back when the response cannot be parsed at all', async () => {
      const { client } = fakeClient([null, null]);
      const result = await generateCaptureBrief(sql, companyId, opportunityId, { client });
      assert.equal(result.brief.generator, 'template');
    });

    // Acceptance criterion 7.
    test('every person in the stored brief resolves to a real contacts.id', async () => {
      const withGhost = {
        ...validBrief(personId),
        people: [
          { person_id: personId, why: 'Contracting Officer.', suggested_action: 'Reach out.' },
          { person_id: 'ghost', why: 'Invented.', suggested_action: 'Nothing.' },
        ],
      };
      // Both attempts return the ghost, so this lands on the template.
      const { client } = fakeClient([withGhost, withGhost]);
      const result = await generateCaptureBrief(sql, companyId, opportunityId, { client });

      for (const person of result.brief.people) {
        const rows = await sql`SELECT id FROM contacts WHERE id = ${person.person_id}`;
        assert.equal(rows.length, 1, `brief names a person that does not exist: ${person.person_id}`);
      }
    });

    test('stores the recompete and incumbent evidence alongside the brief', async () => {
      const { client } = fakeClient([validBrief(personId)]);
      const result = await generateCaptureBrief(sql, companyId, opportunityId, { client });
      assert.ok(result.brief.recompeteEvidence.length > 0);
      assert.ok(result.brief.incumbentEvidence.length > 0);
      assert.ok(result.brief.fitRationale.length > 0);
    });

    test('getCachedBrief returns null before anything is generated', async () => {
      assert.equal(await getCachedBrief(sql, companyId, opportunityId), null);
    });
  });

  describe('deterministic fallback brief', () => {
    test('never names an incumbent that was not found', async () => {
      const built = await buildBriefContext(sql, { userCompanyId: companyId, opportunityId });
      const fallback = buildFallbackBrief(built!.context);
      const text = [fallback.summary, ...fallback.why_it_matters, fallback.next_action].join(' ');
      assert.match(text, /No prior contract was identified/i);
    });

    test('recommends position_now for a strong pre-RFP fit', async () => {
      const built = await buildBriefContext(sql, { userCompanyId: companyId, opportunityId });
      const fallback = buildFallbackBrief(built!.context);
      assert.equal(fallback.recommendation, 'position_now');
    });

    test('recommends pass on a weak fit', async () => {
      await sql`UPDATE matches SET fit = 'weak', score = 10 WHERE user_company_id = ${companyId}`;
      const built = await buildBriefContext(sql, { userCompanyId: companyId, opportunityId });
      const fallback = buildFallbackBrief(built!.context);
      // §7: "PASS has to be real. A tool that says pursue to everything is a
      // newsletter."
      assert.equal(fallback.recommendation, 'pass');
    });

    test('caps people at five', async () => {
      const built = await buildBriefContext(sql, { userCompanyId: companyId, opportunityId });
      const fallback = buildFallbackBrief(built!.context);
      assert.ok(fallback.people.length <= 5);
    });
  });
});
