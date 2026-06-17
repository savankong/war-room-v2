import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@netlify/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.SAM_SYNC_TOKEN ?? 'warroom-seed-2026';

/* ──────────────────────────────────────────────────────────────────
   Carahsoft / Granicus contract vehicles
   Source: https://www.carahsoft.com/granicus/contracts
   Carahsoft is the Prime contractor/Master Aggregator holding all
   vehicles below. Granicus is the ISV/manufacturer selling through them.
   Updated: 2026-06-16
────────────────────────────────────────────────────────────────── */
const CONTRACTS = [
  /* ── Federal ─────────────────────────────────────────────────── */
  {
    id: 'carah-gran-gsa-2git',
    title: 'GSA 2GIT — Carahsoft / Granicus',
    type: 'GSA Schedule',
    agency: 'General Services Administration',
    sub_agency: '2GIT',
    sol_num: '47QTCA21A000R',
    deadline: '2026-09-30',
    recipient: 'Carahsoft Technology Corp',
    description: 'GSA 2nd Generation IT (2GIT) contract vehicle for Granicus software. Carahsoft holds the Prime; eligible agencies: all federal.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-gsa-mas-1',
    title: 'GSA MAS GS-35F-0119Y — Carahsoft / Granicus',
    type: 'GSA Schedule',
    agency: 'General Services Administration',
    sub_agency: 'Multiple Award Schedule',
    sol_num: 'GS-35F-0119Y',
    deadline: '2026-12-09',
    recipient: 'Carahsoft Technology Corp',
    description: 'GSA Multiple Award Schedule for Granicus software (SIN 518210C). All federal, state, local, and education agencies eligible.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-gsa-mas-2',
    title: 'GSA MAS 47QSWA18D008F — Carahsoft / Granicus',
    type: 'GSA Schedule',
    agency: 'General Services Administration',
    sub_agency: 'Multiple Award Schedule',
    sol_num: '47QSWA18D008F',
    deadline: '2028-08-21',
    recipient: 'Carahsoft Technology Corp',
    description: 'GSA Multiple Award Schedule (second vehicle) for Granicus software. All federal, state, local, and education agencies eligible.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-sewp-v',
    title: 'NASA SEWP V — Carahsoft / Granicus',
    type: 'GWAC',
    agency: 'NASA',
    sub_agency: 'Solutions for Enterprise-Wide Procurement V',
    sol_num: 'NNG15SC03B / NNG15SC27B',
    deadline: '2026-09-30',
    recipient: 'Carahsoft Technology Corp',
    description: 'NASA SEWP V GWAC for Granicus software. Eligible: all federal agencies. Carahsoft is the contract holder.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-ites-sw2',
    title: 'ITES-SW2 W52P1J-20-D-0042 — Carahsoft / Granicus',
    type: 'IDIQ',
    agency: 'Department of the Army',
    sub_agency: 'ITES-SW2',
    sol_num: 'W52P1J-20-D-0042',
    deadline: '2030-08-30',
    recipient: 'Carahsoft Technology Corp',
    description: 'Army ITES-SW2 (IT Enterprise Solutions — Software 2) contract for Granicus software. Eligible: all DoD and federal agencies.',
    source: 'carahsoft',
    org_id: 'granicus',
  },

  /* ── Education ────────────────────────────────────────────────── */
  {
    id: 'carah-gran-ei-cloud',
    title: 'E&I Cloud Solutions EI00063-2021MA — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'E&I Cooperative Services',
    sol_num: 'EI00063-2021MA',
    deadline: '2031-03-31',
    recipient: 'Carahsoft Technology Corp',
    description: 'E&I Cooperative Cloud Solutions contract. Eligible: higher education institutions nationwide.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-quilt',
    title: 'The Quilt MSA-05012019F — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'The Quilt',
    sol_num: 'MSA-05012019F',
    deadline: '2028-05-02',
    recipient: 'Carahsoft Technology Corp',
    description: 'The Quilt cooperative MSA for Granicus software. Eligible: research universities and R&E network members.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-mhec',
    title: 'MHEC MC15-F04 — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'Midwestern Higher Education Compact',
    sol_num: 'MC15-F04',
    deadline: '2029-09-30',
    recipient: 'Carahsoft Technology Corp',
    description: 'MHEC cooperative contract for Granicus software. Eligible: higher education in Midwest states.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-vascupp',
    title: 'VASCUPP UVA1482501 — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'Virginia Association of State College and University Purchasing Professionals',
    sol_num: 'UVA1482501',
    deadline: '2026-12-19',
    recipient: 'Carahsoft Technology Corp',
    description: 'VASCUPP cooperative contract for Granicus software. Eligible: VA colleges and universities.',
    source: 'carahsoft',
    org_id: 'granicus',
  },

  /* ── State & Local (representative sample — key cooperatives) ── */
  {
    id: 'carah-gran-omnia',
    title: 'OMNIA Partners R240303 — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'OMNIA Partners',
    sol_num: 'R240303',
    deadline: '2027-12-31',
    recipient: 'Carahsoft Technology Corp',
    description: 'OMNIA Partners Software Solutions and Services cooperative. Eligible: state, local, and education agencies nationwide.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-coretrust',
    title: 'CoreTrust 24COR-018GR — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'CoreTrust',
    sol_num: '24COR-018GR',
    deadline: '2029-02-14',
    recipient: 'Carahsoft Technology Corp',
    description: 'CoreTrust cooperative purchasing contract for Granicus software. Eligible: multiple states.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-tips',
    title: 'TIPS 220105 — Carahsoft / Granicus',
    type: 'Cooperative Contract',
    agency: 'Texas DIR / TIPS',
    sol_num: '220105',
    deadline: '2027-05-31',
    recipient: 'Carahsoft Technology Corp',
    description: 'TIPS Technology Solutions cooperative. Eligible: state, local, and education agencies (TX-anchored, nationwide use).',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-tx-dir',
    title: 'Texas DIR-CPO-5687 — Carahsoft / Granicus',
    type: 'State Contract',
    agency: 'Texas Department of Information Resources',
    sol_num: 'DIR-CPO-5687',
    deadline: '2027-05-19',
    recipient: 'Carahsoft Technology Corp',
    description: 'Texas DIR cooperative contract for Granicus software. Eligible: Texas state and local agencies.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-cmas',
    title: 'CA CMAS 3-20-70-2247G — Carahsoft / Granicus',
    type: 'State Contract',
    agency: 'California Department of General Services',
    sol_num: '3-20-70-2247G',
    deadline: '2028-08-21',
    recipient: 'Carahsoft Technology Corp',
    description: 'California CMAS contract for Granicus software. Eligible: CA state, local, and education agencies.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-md-master',
    title: 'Maryland Master Contract 060B2490021 — Carahsoft / Granicus',
    type: 'State Contract',
    agency: 'Maryland Department of General Services',
    sol_num: '060B2490021',
    deadline: '2027-09-30',
    recipient: 'Carahsoft Technology Corp',
    description: 'Maryland COTS master contract. Eligible: MD state, local, and cooperative members.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
  {
    id: 'carah-gran-ok-omes',
    title: 'Oklahoma OMES SW1041C — Carahsoft / Granicus',
    type: 'State Contract',
    agency: 'Oklahoma Office of Management and Enterprise Services',
    sol_num: 'SW1041C',
    deadline: '2030-10-26',
    recipient: 'Carahsoft Technology Corp',
    description: 'Oklahoma OMES statewide contract for Granicus software.',
    source: 'carahsoft',
    org_id: 'granicus',
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (getDatabase() as any).sql;
  let inserted = 0;
  const errors: string[] = [];

  // Wipe previous carahsoft/granicus vehicles for idempotency
  await db`DELETE FROM contracts WHERE source = 'carahsoft' AND canonical_org_id = 'granicus'`;

  for (const c of CONTRACTS) {
    try {
      await db`
        INSERT INTO contracts (
          id, external_id, title, description,
          signal_type, source, awardee, canonical_org_id,
          raw_payload
        ) VALUES (
          gen_random_uuid(),
          ${c.id},
          ${c.title},
          ${c.description},
          'Contract Vehicle',
          ${c.source},
          ${c.recipient},
          ${c.org_id},
          '{}'
        )
      `;
      inserted++;
    } catch (e: unknown) {
      const x = e as any;
      errors.push(`${c.id}: code=${x?.code} detail=${x?.detail} tail=${x?.message?.slice(-150)}`);
    }
  }

  return NextResponse.json({ ok: true, inserted, total: CONTRACTS.length, errors });
}
