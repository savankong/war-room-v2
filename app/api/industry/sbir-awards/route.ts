import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgName = searchParams.get('org_id') ?? '';
  const db = getDb();

  const rows = await db`
    SELECT
      sa.id,
      sa.award_title          AS title,
      sa.agency,
      sa.branch,
      sa.phase,
      sa.program,
      sa.award_year,
      sa.award_amount,
      sa.award_start_date,
      sa.award_end_date,
      sa.contract_number,
      sa.agency_tracking_number,
      sa.solicitation_number,
      sa.solicitation_topic_code,
      sa.poc_name,
      sa.poc_email,
      sa.poc_phone,
      sa.pi_name,
      sa.pi_email,
      sa.pi_phone,
      sa.abstract,
      sa.hubzone_owned,
      sa.women_owned,
      sa.socially_economically_disadvantaged,
      sa.number_employees,
      sa.city,
      sa.state
    FROM sbir_awards sa
    JOIN orgs o ON o.id = sa.org_id
    WHERE LOWER(o.full_name) = LOWER(${orgName})
    ORDER BY sa.award_year DESC, sa.award_amount DESC NULLS LAST
    LIMIT 200
  `;

  return NextResponse.json(rows);
}
