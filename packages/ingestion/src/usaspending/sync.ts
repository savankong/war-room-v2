import sql from '../db';
import { startRun, completeRun, failRun } from '../logger';
import { fetchUsaSpendingAwards } from './fetch';
import { transformAward } from './transform';
import { resolveOrgId } from '../org-matcher';

export async function syncUsaSpending(): Promise<void> {
  const runId = await startRun('usaspending');
  try {
    const awards = await fetchUsaSpendingAwards();
    const rows = await Promise.all(
      awards.map(async (award) => {
        const row = transformAward(award);
        row.org_id = await resolveOrgId(null, row.awarding_agency);
        return row;
      })
    );

    for (const row of rows) {
      await sql`
        INSERT INTO contracts (
          external_id, source, title, value, signal_type, award_date, raw_payload, org_id,
          recipient, agency, sub_agency, description, naics, psc_code, notice_type,
          place_of_performance
        ) VALUES (
          ${row.external_id}, ${row.source}, ${row.title}, ${row.value},
          ${row.signal_type}, ${row.award_date}, ${sql.json(row.raw_payload as any)}, ${row.org_id},
          ${row.recipient}, ${row.agency}, ${row.sub_agency}, ${row.description},
          ${row.naics}, ${row.psc_code}, ${row.notice_type}, ${row.place_of_performance}
        )
        ON CONFLICT (external_id)
        DO UPDATE SET
          value                = EXCLUDED.value,
          award_date           = EXCLUDED.award_date,
          raw_payload          = EXCLUDED.raw_payload,
          org_id               = COALESCE(EXCLUDED.org_id, contracts.org_id),
          recipient            = COALESCE(EXCLUDED.recipient, contracts.recipient),
          agency               = COALESCE(EXCLUDED.agency, contracts.agency),
          sub_agency           = COALESCE(EXCLUDED.sub_agency, contracts.sub_agency),
          description          = COALESCE(EXCLUDED.description, contracts.description),
          naics                = COALESCE(EXCLUDED.naics, contracts.naics),
          psc_code             = COALESCE(EXCLUDED.psc_code, contracts.psc_code),
          notice_type          = COALESCE(EXCLUDED.notice_type, contracts.notice_type),
          place_of_performance = COALESCE(EXCLUDED.place_of_performance, contracts.place_of_performance)
        WHERE contracts.source != 'manual'
      `;
    }

    const linked = rows.filter((r) => r.org_id).length;
    await completeRun(runId, rows.length);
    console.log(`USASpending sync complete: ${rows.length} records (${linked} linked to orgs)`);
  } catch (err) {
    await failRun(runId, (err as Error).message);
    throw err;
  }
}
