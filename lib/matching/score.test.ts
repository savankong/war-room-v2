import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { scoreOpportunity, disqualify, WEIGHTS } from './score';
import { bucketFor } from './types';
import type { CompanyProfile, OpportunityForScoring, PastPerformanceSummary } from './types';
import type { OrgLineage } from '../ingestion/org-resolver';

const NOW = new Date('2026-09-15T00:00:00Z');

function profile(overrides: Partial<CompanyProfile> = {}): CompanyProfile {
  return {
    userCompanyId: 'company-1',
    naicsCodes: ['541512'],
    pscCodes: ['D399'],
    setAsides: ['Small Business'],
    vehicles: [],
    targetOrgIds: ['disa'],
    capabilities: ['cloud migration', 'zero trust'],
    keywords: [],
    excludedKeywords: ['janitorial'],
    minValue: 500_000,
    maxValue: 10_000_000,
    primePref: 'either',
    geoConstraints: [],
    version: 1,
    ...overrides,
  };
}

function opportunity(overrides: Partial<OpportunityForScoring> = {}): OpportunityForScoring {
  return {
    id: 'opp-1',
    title: 'Enterprise Cloud Migration Support',
    description: 'Seeking support for cloud migration and zero trust architecture.',
    noticeType: 'Sources Sought',
    naicsCode: '541512',
    pscCode: 'D399',
    setAside: null,
    estimatedValue: 2_000_000,
    responseDeadline: new Date('2026-10-30T00:00:00Z'),
    canonicalOrgId: 'disa',
    orgBranch: 'DoW',
    orgName: 'DISA',
    ...overrides,
  };
}

function pastPerformance(overrides: Partial<PastPerformanceSummary> = {}): PastPerformanceSummary {
  return {
    naicsCounts: new Map(),
    pscCounts: new Map(),
    orgLineage: new Set(),
    orgNames: new Map(),
    ...overrides,
  };
}

function lineage(overrides: Partial<OrgLineage> = {}): OrgLineage {
  return {
    targets: new Set(['disa']),
    related: new Set(),
    branches: new Set(['DoW']),
    ...overrides,
  };
}

function score(
  opp: Partial<OpportunityForScoring> = {},
  prof: Partial<CompanyProfile> = {},
  pp: Partial<PastPerformanceSummary> = {},
  lin: Partial<OrgLineage> = {},
) {
  return scoreOpportunity({
    opportunity: opportunity(opp),
    profile: profile(prof),
    pastPerformance: pastPerformance(pp),
    lineage: lineage(lin),
    now: NOW,
  });
}

describe('hard disqualifiers (§5)', () => {
  test('an excluded keyword in the title disqualifies', () => {
    const result = score({ title: 'Janitorial Services for Building 4' });
    assert.equal(result.disqualified?.reason, 'excluded_keyword');
    assert.equal(result.score, 0);
    assert.deepEqual(result.evidence, []);
  });

  test('an excluded keyword in the description disqualifies', () => {
    const result = score({ description: 'Includes janitorial support as a subtask.' });
    assert.equal(result.disqualified?.reason, 'excluded_keyword');
  });

  test('an excluded keyword inside a longer word does not disqualify', () => {
    // Substring matching would make "AI" disqualify "maintenance".
    const result = score({ title: 'Aircraft Maintenance Support' }, { excludedKeywords: ['ai'] });
    assert.equal(result.disqualified, null);
  });

  test('a set-aside the company does not hold disqualifies', () => {
    const result = score({ setAside: 'HUBZone Set-Aside' }, { setAsides: ['Small Business'] });
    assert.equal(result.disqualified?.reason, 'set_aside_not_held');
  });

  test('a small business set-aside is satisfied by an 8(a) holder', () => {
    const result = score({ setAside: 'Total Small Business Set-Aside' }, { setAsides: ['8(a)'] });
    assert.equal(result.disqualified, null);
  });

  test('an 8(a) set-aside is NOT satisfied by a plain small business', () => {
    const result = score({ setAside: '8(a) Set-Aside' }, { setAsides: ['Small Business'] });
    assert.equal(result.disqualified?.reason, 'set_aside_not_held');
  });

  test('an unrecognised set-aside does not disqualify', () => {
    // Failing open is deliberate: a false negative hides an opportunity the
    // customer never learns existed.
    const result = score({ setAside: 'Some New Pilot Program Set-Aside' }, { setAsides: ['Small Business'] });
    assert.equal(result.disqualified, null);
  });

  test('full and open competition does not disqualify anyone', () => {
    const result = score({ setAside: 'Full and Open Competition' }, { setAsides: [] });
    assert.equal(result.disqualified, null);
  });

  test('a value more than 2x above the ceiling disqualifies', () => {
    const result = score({ estimatedValue: 25_000_000 }); // ceiling 10M
    assert.equal(result.disqualified?.reason, 'value_far_outside_band');
  });

  test('a value between 1x and 2x the ceiling survives', () => {
    const result = score({ estimatedValue: 15_000_000 });
    assert.equal(result.disqualified, null);
    // Outside the band, so no value-band points, but still scored.
    assert.ok(!result.evidence.some((e) => e.factor === 'value_band'));
  });

  test('a value less than half the floor disqualifies', () => {
    const result = score({ estimatedValue: 100_000 }); // floor 500K
    assert.equal(result.disqualified?.reason, 'value_far_outside_band');
  });

  test('a null value is unknown, not out of band', () => {
    // The common case on a pre-solicitation, which is exactly what §2 says to
    // weight highest — disqualifying these would gut the product thesis.
    const result = score({ estimatedValue: null });
    assert.equal(result.disqualified, null);
  });

  test('a passed deadline disqualifies', () => {
    const result = score({ responseDeadline: new Date('2026-09-01T00:00:00Z') });
    assert.equal(result.disqualified?.reason, 'deadline_passed');
  });

  test('a null deadline does not disqualify', () => {
    const result = score({ responseDeadline: null });
    assert.equal(result.disqualified, null);
  });
});

describe('weighted factors (§5)', () => {
  test('NAICS exact match scores 25', () => {
    const result = score();
    const naics = result.evidence.find((e) => e.factor === 'naics_exact');
    assert.equal(naics?.points, WEIGHTS.naics_exact);
  });

  test('NAICS family match scores 15 and does not stack with exact', () => {
    const result = score({ naicsCode: '541519' });
    assert.equal(result.evidence.find((e) => e.factor === 'naics_family')?.points, WEIGHTS.naics_family);
    assert.equal(result.evidence.find((e) => e.factor === 'naics_exact'), undefined);
  });

  test('PSC exact scores 15, family scores 8, never both', () => {
    const exact = score();
    assert.equal(exact.evidence.find((e) => e.factor === 'psc_exact')?.points, WEIGHTS.psc_exact);
    assert.equal(exact.evidence.find((e) => e.factor === 'psc_family'), undefined);

    const family = score({ pscCode: 'D302' });
    assert.equal(family.evidence.find((e) => e.factor === 'psc_family')?.points, WEIGHTS.psc_family);
  });

  test('org factors do not stack — target wins', () => {
    const result = score();
    const orgFactors = result.evidence.filter((e) => e.factor.startsWith('org_'));
    assert.equal(orgFactors.length, 1);
    assert.equal(orgFactors[0].factor, 'org_target');
    assert.equal(orgFactors[0].points, WEIGHTS.org_target);
  });

  test('org lineage scores 12 when the org is not a direct target', () => {
    const result = score(
      { canonicalOrgId: 'disa-child' },
      {},
      {},
      { targets: new Set(['disa']), related: new Set(['disa-child']) },
    );
    const orgFactors = result.evidence.filter((e) => e.factor.startsWith('org_'));
    assert.equal(orgFactors.length, 1);
    assert.equal(orgFactors[0].factor, 'org_lineage');
    assert.equal(orgFactors[0].points, WEIGHTS.org_lineage);
  });

  test('org branch scores 5 as the weakest org factor', () => {
    const result = score(
      { canonicalOrgId: 'unrelated-org' },
      {},
      {},
      { targets: new Set(['disa']), related: new Set(), branches: new Set(['DoW']) },
    );
    const orgFactors = result.evidence.filter((e) => e.factor.startsWith('org_'));
    assert.equal(orgFactors.length, 1);
    assert.equal(orgFactors[0].factor, 'org_branch');
  });

  test('no org factor at all when nothing aligns', () => {
    const result = score(
      { canonicalOrgId: 'unrelated-org', orgBranch: 'Other' },
      {},
      {},
      { targets: new Set(['disa']), related: new Set(), branches: new Set(['DoW']) },
    );
    assert.equal(result.evidence.filter((e) => e.factor.startsWith('org_')).length, 0);
  });

  test('past performance in the org lineage scores 15', () => {
    const result = score({}, {}, { orgLineage: new Set(['disa']), orgNames: new Map([['disa', 'DISA']]) });
    const pp = result.evidence.find((e) => e.factor === 'past_performance_org');
    assert.equal(pp?.points, WEIGHTS.past_performance_org);
    assert.equal(pp?.line, 'You have past performance with DISA');
  });

  test('capability keyword hits cap at 15', () => {
    const result = score(
      { description: 'cloud migration, zero trust, devsecops, kubernetes support' },
      { capabilities: ['cloud migration', 'zero trust', 'devsecops', 'kubernetes'] },
    );
    const kw = result.evidence.find((e) => e.factor === 'capability_keywords');
    // Four hits at 5 each is 20, capped at 15.
    assert.equal(kw?.points, WEIGHTS.capability_keywords_max);
  });

  test('value inside the band scores 10', () => {
    const result = score();
    assert.equal(result.evidence.find((e) => e.factor === 'value_band')?.points, WEIGHTS.value_band);
  });

  test('a pre-RFP notice outscores an equivalent solicitation', () => {
    // §5: "The pre-RFP weighting is the thesis of the product."
    const sourcesSought = score({ noticeType: 'Sources Sought' });
    const solicitation = score({ noticeType: 'Solicitation' });
    assert.ok(sourcesSought.score > solicitation.score);
    assert.equal(sourcesSought.score - solicitation.score, WEIGHTS.pre_rfp - WEIGHTS.solicitation);
  });
});

describe('score assembly', () => {
  test('clamps at 100 when every factor fires', () => {
    const result = score(
      { description: 'cloud migration and zero trust' },
      {},
      { orgLineage: new Set(['disa']), naicsCounts: new Map([['541512', 3]]) },
    );
    // Raw would be 25+15+20+15+10+10+10 = 105.
    assert.equal(result.score, 100);
    assert.equal(result.fit, 'strong');
  });

  test('evidence is ordered strongest first, for the two lines the briefing shows', () => {
    const result = score({}, {}, { orgLineage: new Set(['disa']) });
    const points = result.evidence.map((e) => e.points);
    assert.deepEqual(points, [...points].sort((a, b) => b - a));
  });

  test('every evidence line has readable text', () => {
    // §5: "If a factor cannot produce a readable line, it should not be a factor."
    const result = score({}, {}, { orgLineage: new Set(['disa']) });
    assert.ok(result.evidence.length > 0);
    for (const line of result.evidence) {
      assert.ok(line.line.trim().length > 10, `evidence line too short: ${JSON.stringify(line)}`);
      assert.ok(!/undefined|null|NaN/.test(line.line), `evidence line leaks a placeholder: ${line.line}`);
    }
  });

  test('no evidence line exposes a numeric score', () => {
    // Product spec §8 rule 2: no numeric probabilities anywhere in the UI.
    const result = score({}, {}, { orgLineage: new Set(['disa']) });
    for (const line of result.evidence) {
      assert.ok(!/\d+(\.\d+)?\s*%/.test(line.line), `evidence line shows a percentage: ${line.line}`);
    }
  });

  test('a strong match carries at least three evidence lines', () => {
    // Acceptance criterion 4.
    const result = score({}, {}, { orgLineage: new Set(['disa']) });
    assert.equal(result.fit, 'strong');
    assert.ok(result.evidence.length >= 3);
  });

  test('a bare notice with no alignment scores weak', () => {
    const result = score(
      {
        title: 'Grounds Maintenance',
        description: 'Mowing and landscaping.',
        naicsCode: '561730',
        pscCode: 'S208',
        canonicalOrgId: 'unrelated-org',
        orgBranch: 'Other',
        estimatedValue: null,
        noticeType: 'Solicitation',
      },
      {},
      {},
      { targets: new Set(['disa']), related: new Set(), branches: new Set(['DoW']) },
    );
    assert.equal(result.fit, 'weak');
    assert.ok(result.score < 40);
  });
});

describe('bucketFor (§5 fit buckets)', () => {
  test('strong at 65 and above', () => {
    assert.equal(bucketFor(65), 'strong');
    assert.equal(bucketFor(100), 'strong');
  });

  test('fair from 40 to 64', () => {
    assert.equal(bucketFor(40), 'fair');
    assert.equal(bucketFor(64), 'fair');
  });

  test('weak below 40', () => {
    assert.equal(bucketFor(39), 'weak');
    assert.equal(bucketFor(0), 'weak');
  });
});

describe('disqualify is independent of scoring', () => {
  test('returns null when nothing disqualifies', () => {
    assert.equal(disqualify(opportunity(), profile(), NOW), null);
  });
});
