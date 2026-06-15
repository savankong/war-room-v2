import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SEED_MAP: Record<string, string> = {
  'orgs-master':             '../../../../../../netlify/functions/seed-orgs-master.mjs',
  'pdf-orgs':                '../../../../../../netlify/functions/seed-pdf-orgs.mjs',
  'pdf-army':                '../../../../../../netlify/functions/seed-pdf-army.mjs',
  'pdf-remaining':           '../../../../../../netlify/functions/seed-pdf-remaining.mjs',
  'pdf-remaining-1':         '../../../../../../netlify/functions/seed-pdf-remaining-1.mjs',
  'pdf-remaining-2':         '../../../../../../netlify/functions/seed-pdf-remaining-2.mjs',
  'pdf-remaining-3':         '../../../../../../netlify/functions/seed-pdf-remaining-3.mjs',
  'senior-1':                '../../../../../../netlify/functions/seed-senior-1.mjs',
  'senior-2':                '../../../../../../netlify/functions/seed-senior-2.mjs',
  'dod-procurement-offices': '../../../../../../netlify/functions/seed-dod-procurement-offices.mjs',
  'dow-directory':           '../../../../../../netlify/functions/seed-dow-directory.mjs',
  'org-abbreviations':       '../../../../../../netlify/functions/seed-org-abbreviations.mjs',
  'org-metadata':            '../../../../../../netlify/functions/seed-org-metadata.mjs',
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ fn: string }> }) {
  const { fn } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (token !== process.env.SAM_SYNC_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!SEED_MAP[fn])
    return NextResponse.json({ error: `Unknown seed: ${fn}`, available: Object.keys(SEED_MAP) }, { status: 400 });

  try {
    const mod = await import(SEED_MAP[fn]);
    const syntheticReq = new Request(
      `https://localhost/api/seed/${fn}?token=${token}`,
      { method: 'GET' }
    );
    // Override Netlify.env.get for compatibility
    (globalThis as any).Netlify = { env: { get: (k: string) => process.env[k] } };

    const response = await mod.default(syntheticReq);
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
