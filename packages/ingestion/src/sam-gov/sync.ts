import sql from '../db';
import { startRun, completeRun, failRun } from '../logger';
import { fetchSamOpportunities } from './fetch';
import { transformOpportunity } from './transform';
import { resolveOrgId } from '../org-matcher';

export async function syncSamGov(): Promise<void> {
  const runId = await startRun('sam_gov');
  try {
    const opportunities = await fetchSamOpportunities();
    const rows = await Promise.all(
      opportunities.map(async (opp) => {
        const row = transformOpportunity(opp);
        row.org_id = await resolveOrgId(row.office_code, row.awarding_agency);
        return row;
      })
    );

    for (const row of rows) {
      await sql`
        INSERT INTO contracts (
          external_id, source, title, value, set_aside, signal_type,
          award_date, raw_payload, org_id,
          description, naics, psc_code, solicitation_number, notice_type,
          deadline, published_date, poc, poc_email, poc_phone,
          place_of_performance, agency, sub_agency, recipient
        ) VALUES (
          ${row.external_id}, ${row.source}, ${row.title}, ${row.value},
          ${row.set_aside}, ${row.signal_type}, ${row.award_date},
          ${sql.json(row.raw_payload as any)}, ${row.org_id},
          ${row.description}, ${row.naics}, ${row.psc_code},
          ${row.solicitation_number}, ${row.notice_type},
          ${row.deadline}, ${row.published_date},
          ${row.poc}, ${row.poc_email}, ${row.poc_phone},
          ${row.place_of_performance}, ${row.agency}, ${row.sub_agency},
          ${row.recipient}
        )
        ON CONFLICT (external_id)
        DO UPDATE SET
          value                = EXCLUDED.value,
          set_aside            = EXCLUDED.set_aside,
          award_date           = EXCLUDED.award_date,
          raw_payload          = EXCLUDED.raw_payload,
          org_id               = COALESCE(EXCLUDED.org_id, contracts.org_id),
          description          = EXCLUDED.description,
          naics                = EXCLUDED.naics,
          psc_code             = EXCLUDED.psc_code,
          solicitation_number  = EXCLUDED.solicitation_number,
          notice_type          = EXCLUDED.notice_type,
          deadline             = EXCLUDED.deadline,
          published_date       = EXCLUDED.published_date,
          poc                  = EXCLUDED.poc,
          poc_email            = EXCLUDED.poc_email,
          poc_phone            = EXCLUDED.poc_phone,
          place_of_performance = EXCLUDED.place_of_performance,
          agency               = EXCLUDED.agency,
          sub_agency           = EXCLUDED.sub_agency,
          recipient            = COALESCE(EXCLUDED.recipient, contracts.recipient)
        WHERE contracts.source != 'manual'
      `;
    }

    const linked = rows.filter((r) => r.org_id).length;
    await completeRun(runId, rows.length);
    console.log(`SAM.gov sync complete: ${rows.length} records (${linked} linked to orgs)`);
  } catch (err) {
    await failRun(runId, (err as Error).message);
    throw err;
  }
}
