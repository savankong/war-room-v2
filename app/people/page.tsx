import { getDb } from '@/lib/db';
import PeopleClient from './PeopleClient';

export const revalidate = 300;

async function getPeopleData() {
  const db = getDb();
  const [people, topOrgs] = await Promise.all([
    db`
      SELECT
        c.id,
        c.name           AS full_name,
        c.title          AS role_title,
        c.color          AS avatar_color,
        c.photo_url,
        c.email,
        c.phone,
        c.opps,
        c.awards,
        c.hierarchy_order,
        c.tags,
        c.linkedin,
        c.org_id,
        c.org_full,
        o.full_name      AS org_name,
        o.id             AS org_slug,
        o.abs_hierarchy_level AS org_level,
        o.loc            AS org_hq,
        o.branch         AS org_branch,
        COALESCE(cs.total_contracts, 0)::int  AS org_contracts,
        COALESCE(cs.awards_3yr,      0)::int  AS org_awards_3yr,
        COALESCE(cs.open_opps,       0)::int  AS org_open_opps
      FROM contacts c
      LEFT JOIN orgs o ON o.id = c.org_id
      LEFT JOIN (
        SELECT
          org_id,
          COUNT(*)::int                                                                     AS total_contracts,
          COUNT(*) FILTER (WHERE signal_type = 'Award'
                           AND award_date IS NOT NULL
                           AND award_date::date > NOW() - INTERVAL '3 years')::int         AS awards_3yr,
          COUNT(*) FILTER (WHERE signal_type = 'Opportunity')::int                         AS open_opps
        FROM contracts
        GROUP BY org_id
      ) cs ON cs.org_id = c.org_id
      ORDER BY c.hierarchy_order NULLS LAST, c.name
    `,
    /* only top 2 absolute levels for the org filter */
    db`
      SELECT id, full_name AS name, abs_hierarchy_level
      FROM orgs
      WHERE is_active = true
        AND abs_hierarchy_level IS NOT NULL
        AND abs_hierarchy_level <= 1
      ORDER BY abs_hierarchy_level, full_name
    `,
  ]);

  return {
    people: people as any[],
    topOrgs: topOrgs as any[],
  };
}

export default async function PeoplePage() {
  const data = await getPeopleData();
  return <PeopleClient {...data} />;
}
