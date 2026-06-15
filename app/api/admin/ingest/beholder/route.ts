import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  fetchBeholderAuditLeads,
  fetchBeholderAwards,
  type BeholderAuditLead,
  type BeholderAward,
} from '@/lib/ingestion/beholder-gov/fetch';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function riskSummary(indicators: { severity: string; signal_type: string }[] = []): string {
  if (!indicators.length) return '';
  return indicators.map(i => `[${i.severity}] ${i.signal_type}`).join('; ');
}

export async function POST() {
  try {
    const [auditLeads, awards] = await Promise.all([
      fetchBeholderAuditLeads(1, 50),
      fetchBeholderAwards(1, 100),
    ]);

    const db = getDb();
    let inserted = 0;
    let skipped = 0;

    for (const lead of auditLeads as BeholderAuditLead[]) {
      const id = `beholder-audit-${lead.id}`;
      const description = [
        lead.description,
        lead.risk_indicators?.length ? `Risk indicators: ${riskSummary(lead.risk_indicators)}` : null,
        lead.risk_score != null ? `Risk score: ${lead.risk_score}` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const result = await db`
        INSERT INTO contracts (
          id, title, signal_type, source, award_amt,
          award_date, recipient, naics, sub_agency, description
        ) VALUES (
          ${id},
          ${lead.title ?? 'Beholder Audit Lead'},
          'Audit Lead',
          'beholder-gov',
          ${lead.award_amount ?? null},
          ${lead.award_date ? new Date(lead.award_date) : null},
          ${lead.contractor ?? null},
          ${lead.naics ?? null},
          ${lead.office ?? lead.agency ?? null},
          ${description || null}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      if (result.count > 0) inserted++;
      else skipped++;
    }

    for (const award of awards as BeholderAward[]) {
      const id = `beholder-award-${award.id}`;
      const description = [
        award.description,
        award.risk_indicators?.length ? `Risk indicators: ${riskSummary(award.risk_indicators)}` : null,
        award.risk_score != null ? `Risk score: ${award.risk_score}` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const result = await db`
        INSERT INTO contracts (
          id, title, signal_type, source, award_amt,
          award_date, recipient, naics, sub_agency, set_aside, description
        ) VALUES (
          ${id},
          ${award.title ?? 'Beholder Award'},
          'Award',
          'beholder-gov',
          ${award.award_amount ?? null},
          ${award.award_date ? new Date(award.award_date) : null},
          ${award.recipient_name ?? null},
          ${award.naics ?? null},
          ${award.sub_agency ?? award.office ?? award.agency ?? null},
          ${award.set_aside ?? null},
          ${description || null}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      if (result.count > 0) inserted++;
      else skipped++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      auditLeads: auditLeads.length,
      awards: awards.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
