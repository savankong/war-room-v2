import { NextRequest, NextResponse } from 'next/server';
import { getWriteDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TOKEN = 'warroom-seed-2026';

/* Current USSOCOM / SOF AT&L leadership — sourced from socom.mil and
   SOF Week 2025 briefing slides (public release, Distribution A). */
const contacts = [
  /* ── T1: Commander ─────────────────────────────────────────── */
  {
    id: 'socom-bradley',
    name: 'ADM Frank M. Bradley',
    title: 'Commander, US Special Operations Command (USSOCOM)',
    hierarchy_order: 1,
    tags: ['flag-officer'],
  },

  /* ── T2: Command leadership ─────────────────────────────────── */
  {
    id: 'socom-farrell',
    name: 'Lt. Gen. Sean M. Farrell',
    title: 'Deputy Commander, USSOCOM',
    hierarchy_order: 2,
    tags: ['flag-officer'],
  },
  {
    id: 'socom-marks',
    name: 'Lt. Gen. Steven M. Marks',
    title: 'Vice Commander, USSOCOM',
    hierarchy_order: 2,
    tags: ['flag-officer'],
  },
  {
    id: 'socom-beaurpere',
    name: 'Maj. Gen. Guillaume Beaurpere',
    title: 'Chief of Staff, USSOCOM',
    hierarchy_order: 2,
    tags: ['flag-officer'],
  },
  {
    id: 'socom-krogman',
    name: 'CSM Andrew J. Krogman',
    title: 'Senior Enlisted Leader, USSOCOM',
    hierarchy_order: 2,
    tags: [],
  },
  {
    id: 'socom-johnson',
    name: 'Melissa Johnson',
    title: 'Acquisition Executive, SOF AT&L',
    hierarchy_order: 2,
    tags: ['acquisition', 'tech-leader'],
  },

  /* ── T3: SOF AT&L Deputy + PEOs + Directors ─────────────────── */
  {
    id: 'socom-innes',
    name: 'William J. Innes',
    title: 'Deputy Director for Acquisition, SOF AT&L',
    hierarchy_order: 3,
    tags: ['acquisition'],
  },
  {
    id: 'socom-bronder',
    name: 'COL Justin Bronder',
    title: 'Program Executive Officer, Fixed Wing',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo'],
  },
  {
    id: 'socom-wyrick',
    name: 'CAPT Jared Wyrick',
    title: 'Program Executive Officer, Maritime',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo'],
  },
  {
    id: 'socom-smith-rw',
    name: 'Dr. Steve Smith',
    title: 'Program Executive Officer, Rotary Wing',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo'],
  },
  {
    id: 'socom-pritchett',
    name: 'COL Rhea Pritchett',
    title: 'Program Executive Officer, SOF Digital Applications',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo', 'tech-leader'],
  },
  {
    id: 'socom-marsalis',
    name: 'COL Jesse Marsalis',
    title: 'Program Executive Officer, SOF Support Activity (SOFSA)',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo'],
  },
  {
    id: 'socom-greany',
    name: 'Peter Greany',
    title: 'Program Executive Officer, Services',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo'],
  },
  {
    id: 'socom-oliver',
    name: 'COL Ramsey Oliver',
    title: 'Program Executive Officer, SOF Warrior',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo'],
  },
  {
    id: 'socom-breede',
    name: 'David Breede',
    title: 'Program Executive Officer, Tactical Information Systems',
    hierarchy_order: 3,
    tags: ['acquisition', 'peo', 'tech-leader'],
  },
  {
    id: 'socom-coon',
    name: 'Art Coon',
    title: 'Director, Enterprise Information Systems',
    hierarchy_order: 3,
    tags: ['acquisition', 'tech-leader'],
  },
  {
    id: 'socom-strahan',
    name: 'Howard Strahan',
    title: 'Deputy Director, Science & Technology',
    hierarchy_order: 3,
    tags: ['acquisition', 'r&d', 'tech-leader'],
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = getWriteDb();

  // Remove stale SOCOM contacts before inserting current ones
  await db`DELETE FROM contacts WHERE org_id = 'socom'`;

  let inserted = 0;
  const errors: string[] = [];

  for (const p of contacts) {
    try {
      await db`
        INSERT INTO contacts (id, name, title, org_id, org_full, tags, hierarchy_order)
        VALUES (
          ${p.id}, ${p.name}, ${p.title},
          'socom', 'US Special Operations Command',
          ${db.array(p.tags)}, ${p.hierarchy_order}
        )
        ON CONFLICT (id) DO UPDATE SET
          name             = EXCLUDED.name,
          title            = EXCLUDED.title,
          org_id           = EXCLUDED.org_id,
          org_full         = EXCLUDED.org_full,
          tags             = EXCLUDED.tags,
          hierarchy_order  = EXCLUDED.hierarchy_order
      `;
      inserted++;
    } catch (e: any) {
      errors.push(`${p.id}: ${e.message?.slice(0, 120)}`);
    }
  }

  return NextResponse.json({ ok: true, inserted, errors });
}
