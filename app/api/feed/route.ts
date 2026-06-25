import { NextRequest, NextResponse } from 'next/server';
import { getWriteDb, getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function getUserId(req: NextRequest): number | null {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    return payload.userId;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId  = getUserId(req);
  const writeDb = getWriteDb();
  const readDb  = getDb();

  // Always include pre-seeded feed items
  const seeded = await writeDb`
    SELECT id, type, title, body, image_url, video_url, source, source_url,
           entity_name, entity_logo, tags, value_b, published_at, pinned
    FROM feed_items
    WHERE pinned = true OR published_at > NOW() - INTERVAL '1 year'
    ORDER BY pinned DESC, published_at DESC LIMIT 500
  `;
  const seededItems = (seeded as any[]).map(r => ({
    feed_id: r.id, type: r.type, title: r.title, body: r.body,
    image_url: r.image_url, video_url: r.video_url,
    source: r.source, source_url: r.source_url,
    entity_name: r.entity_name, entity_logo: r.entity_logo,
    tags: r.tags ?? [], value_b: r.value_b,
    timestamp: r.published_at, pinned: r.pinned,
    is_following: false, agency: null,
  }));

  const contractItems: any[] = [];

  if (userId) {
    const follows = await writeDb`
      SELECT entity_type, entity_id, entity_name, entity_meta FROM follows WHERE user_id = ${userId}
    `;

    const orgIds       = follows.filter((f: any) => f.entity_type === 'org').map((f: any) => f.entity_id);
    const companyNames = follows.filter((f: any) => f.entity_type === 'company').map((f: any) => f.entity_id);
    const followedOrgSet  = new Set(orgIds);
    const followedCoSet   = new Set(companyNames);

    // Build name→meta map for logos
    const metaMap = new Map<string, any>();
    for (const f of follows as any[]) metaMap.set(f.entity_id, f.entity_meta);

    if (orgIds.length > 0) {
      const rows = await readDb`
        SELECT c.id, c.title, c.value, c.signal_type, c.award_date, c.agency_or_lab,
               c.canonical_org_id, o.full_name AS org_name, o.profile->>'logo_url' AS logo_url
        FROM contracts c JOIN orgs o ON o.id = c.canonical_org_id
        WHERE c.canonical_org_id = ANY(${orgIds})
          AND c.signal_type IN ('Award','Opportunity')
          AND c.award_date > NOW() - INTERVAL '365 days'
        ORDER BY c.award_date DESC LIMIT 60
      `;
      for (const c of rows as any[]) {
        const meta = metaMap.get(c.canonical_org_id) ?? {};
        contractItems.push({
          feed_id: `org-${c.id}`, type: c.signal_type === 'Opportunity' ? 'opportunity' : 'contract',
          title: c.title ?? `${c.signal_type} — ${c.org_name}`,
          body: null, image_url: null,
          source: 'USASpending', source_url: null,
          entity_name: c.org_name, entity_logo: meta?.logo_url ?? c.logo_url,
          tags: [c.signal_type, c.agency_or_lab].filter(Boolean),
          value_b: c.value ? c.value / 1e9 : null,
          timestamp: c.award_date, is_following: true, agency: c.agency_or_lab,
        });
      }
    }

    if (companyNames.length > 0) {
      const rows = await readDb`
        SELECT c.id, c.title, c.value, c.signal_type, c.award_date, c.agency_or_lab, c.awardee
        FROM contracts c
        WHERE c.awardee = ANY(${companyNames})
          AND c.signal_type IN ('Award','Opportunity')
          AND c.award_date > NOW() - INTERVAL '365 days'
        ORDER BY c.award_date DESC LIMIT 60
      `;
      for (const c of rows as any[]) {
        const meta = metaMap.get(c.awardee) ?? {};
        contractItems.push({
          feed_id: `co-${c.id}`, type: c.signal_type === 'Opportunity' ? 'opportunity' : 'contract',
          title: c.title ?? `${c.signal_type} — ${c.awardee}`,
          body: null, image_url: null,
          source: 'USASpending', source_url: null,
          entity_name: c.awardee, entity_logo: meta?.logo_url ?? null,
          tags: [c.signal_type, c.agency_or_lab].filter(Boolean),
          value_b: c.value ? c.value / 1e9 : null,
          timestamp: c.award_date, is_following: true, agency: c.agency_or_lab,
        });
      }
    }

    // Mark seeded items as is_following if they mention a followed entity
    for (const item of seededItems) {
      if (item.entity_name && (followedCoSet.has(item.entity_name) || followedOrgSet.has(item.entity_name))) {
        item.is_following = true;
      }
    }
  }

  const all = [...seededItems, ...contractItems].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Followed items bubble up slightly
    if (a.is_following && !b.is_following) return -1;
    if (!a.is_following && b.is_following) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return NextResponse.json(all.slice(0, 300));
}
