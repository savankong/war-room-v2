import { NextRequest, NextResponse } from 'next/server';
import { getWriteDb, getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

/** One row of the feed_items SELECT below. */
interface SeededRow {
  id: string; type: string | null; title: string | null; body: string | null;
  image_url: string | null; video_url: string | null;
  source: string | null; source_url: string | null;
  entity_name: string | null; entity_logo: string | null;
  tags: string[] | null; value_b: number | null;
  published_at: string | null; pinned: boolean | null;
}

/** One row of the follows SELECT. entity_meta is free-form JSONB. */
interface FollowRow {
  entity_type: string | null;
  entity_id: string;
  entity_name: string | null;
  entity_meta: { logo_url?: string | null } | null;
}

/** One contract row joined for a followed org or company. */
interface FeedContractRow {
  id: string; title: string | null; value: number | null;
  signal_type: string | null; award_date: string | null;
  agency_or_lab: string | null;
  canonical_org_id?: string | null;
  org_name?: string | null;
  logo_url?: string | null;
  awardee?: string | null;
}

/** An item as the feed returns it. */
interface FeedItem {
  feed_id: string; type: string | null; title: string | null; body: string | null;
  image_url: string | null; video_url?: string | null;
  source: string | null; source_url: string | null;
  entity_name: string | null; entity_logo: string | null;
  tags: (string | null)[]; value_b: number | null;
  timestamp: string | null; pinned?: boolean | null;
  is_following: boolean; agency: string | null;
}


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
  const seeded: SeededRow[] = await writeDb`
    SELECT id, type, title, body, image_url, video_url, source, source_url,
           entity_name, entity_logo, tags, value_b, published_at, pinned
    FROM feed_items
    WHERE pinned = true OR published_at > NOW() - INTERVAL '1 year'
    ORDER BY pinned DESC, published_at DESC LIMIT 500
  `;
  const seededItems: FeedItem[] = seeded.map(r => ({
    feed_id: r.id, type: r.type, title: r.title, body: r.body,
    image_url: r.image_url, video_url: r.video_url,
    source: r.source, source_url: r.source_url,
    entity_name: r.entity_name, entity_logo: r.entity_logo,
    tags: r.tags ?? [], value_b: r.value_b,
    timestamp: r.published_at, pinned: r.pinned,
    is_following: false, agency: null,
  }));

  const contractItems: FeedItem[] = [];

  if (userId) {
    const follows: FollowRow[] = await writeDb`
      SELECT entity_type, entity_id, entity_name, entity_meta FROM follows WHERE user_id = ${userId}
    `;

    const orgIds       = follows.filter(f => f.entity_type === 'org').map(f => f.entity_id);
    const companyNames = follows.filter(f => f.entity_type === 'company').map(f => f.entity_id);
    const followedOrgSet  = new Set(orgIds);
    const followedCoSet   = new Set(companyNames);

    // Build name→meta map for logos
    const metaMap = new Map<string, FollowRow['entity_meta']>();
    for (const f of follows) metaMap.set(f.entity_id, f.entity_meta);

    if (orgIds.length > 0) {
      const rows: FeedContractRow[] = await readDb`
        SELECT c.id, c.title, c.value, c.signal_type, c.award_date, c.agency_or_lab,
               c.canonical_org_id, o.full_name AS org_name, o.profile->>'logo_url' AS logo_url
        FROM contracts c JOIN orgs o ON o.id = c.canonical_org_id
        WHERE c.canonical_org_id = ANY(${orgIds})
          AND c.signal_type IN ('Award','Opportunity')
          AND c.award_date > NOW() - INTERVAL '365 days'
        ORDER BY c.award_date DESC LIMIT 60
      `;
      for (const c of rows) {
        const meta = (c.canonical_org_id ? metaMap.get(c.canonical_org_id) : null) ?? {};
        contractItems.push({
          feed_id: `org-${c.id}`, type: c.signal_type === 'Opportunity' ? 'opportunity' : 'contract',
          title: c.title ?? `${c.signal_type} — ${c.org_name}`,
          body: null, image_url: null,
          source: 'USASpending', source_url: null,
          entity_name: c.org_name ?? null, entity_logo: meta?.logo_url ?? c.logo_url ?? null,
          tags: [c.signal_type, c.agency_or_lab].filter(Boolean),
          value_b: c.value ? c.value / 1e9 : null,
          timestamp: c.award_date, is_following: true, agency: c.agency_or_lab,
        });
      }
    }

    if (companyNames.length > 0) {
      const rows: FeedContractRow[] = await readDb`
        SELECT c.id, c.title, c.value, c.signal_type, c.award_date, c.agency_or_lab, c.awardee
        FROM contracts c
        WHERE c.awardee = ANY(${companyNames})
          AND c.signal_type IN ('Award','Opportunity')
          AND c.award_date > NOW() - INTERVAL '365 days'
        ORDER BY c.award_date DESC LIMIT 60
      `;
      for (const c of rows) {
        const meta = (c.awardee ? metaMap.get(c.awardee) : null) ?? {};
        contractItems.push({
          feed_id: `co-${c.id}`, type: c.signal_type === 'Opportunity' ? 'opportunity' : 'contract',
          title: c.title ?? `${c.signal_type} — ${c.awardee}`,
          body: null, image_url: null,
          source: 'USASpending', source_url: null,
          entity_name: c.awardee ?? null, entity_logo: meta?.logo_url ?? null,
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
    return new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime();
  });

  return NextResponse.json(all.slice(0, 300));
}
