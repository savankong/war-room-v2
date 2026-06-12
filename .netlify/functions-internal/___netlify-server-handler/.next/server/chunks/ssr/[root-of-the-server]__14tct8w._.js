module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},46786,(a,b,c)=>{b.exports=a.x("os",()=>require("os"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},4446,(a,b,c)=>{b.exports=a.x("net",()=>require("net"))},55004,(a,b,c)=>{b.exports=a.x("tls",()=>require("tls"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},88947,(a,b,c)=>{b.exports=a.x("stream",()=>require("stream"))},60438,(a,b,c)=>{b.exports=a.x("perf_hooks",()=>require("perf_hooks"))},26758,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},38872,a=>{"use strict";let b={src:a.i(26758).default,width:256,height:256};a.s(["default",0,b])},91581,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/people/PeopleClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/people/PeopleClient.tsx <module evaluation>","default")},45462,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/people/PeopleClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/people/PeopleClient.tsx","default")},56128,a=>{"use strict";a.i(91581);var b=a.i(45462);a.n(b)},42427,a=>{"use strict";var b=a.i(7997),c=a.i(66879),d=a.i(56128);async function e(){let a=(0,c.getDb)(),[b,d]=await Promise.all([a`
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
    `,a`
      SELECT id, full_name AS name, abs_hierarchy_level
      FROM orgs
      WHERE is_active = true
        AND abs_hierarchy_level IS NOT NULL
        AND abs_hierarchy_level <= 1
      ORDER BY abs_hierarchy_level, full_name
    `]);return{people:b,topOrgs:d}}async function f(){let a=await e();return(0,b.jsx)(d.default,{...a})}a.s(["default",0,f,"revalidate",0,300])},84127,a=>{a.n(a.i(42427))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__14tct8w._.js.map