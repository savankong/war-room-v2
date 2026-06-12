module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},46786,(a,b,c)=>{b.exports=a.x("os",()=>require("os"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},4446,(a,b,c)=>{b.exports=a.x("net",()=>require("net"))},55004,(a,b,c)=>{b.exports=a.x("tls",()=>require("tls"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},88947,(a,b,c)=>{b.exports=a.x("stream",()=>require("stream"))},60438,(a,b,c)=>{b.exports=a.x("perf_hooks",()=>require("perf_hooks"))},26758,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},38872,a=>{"use strict";let b={src:a.i(26758).default,width:256,height:256};a.s(["default",0,b])},81663,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/DiscoverClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/DiscoverClient.tsx <module evaluation>","default")},9657,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/DiscoverClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/DiscoverClient.tsx","default")},16929,a=>{"use strict";a.i(81663);var b=a.i(9657);a.n(b)},50708,a=>{"use strict";var b=a.i(7997),c=a.i(66879),d=a.i(16929);async function e(){let a=(0,c.getDb)();return await a`
    SELECT
      o.id,
      o.full_name            AS name,
      o.organization_type,
      o.loc                  AS hq_address,
      o.branch,
      o.abs_hierarchy_level,
      o.hierarchy_level,
      o.parent_id,
      COUNT(DISTINCT c.id)::int   AS contact_count,
      COUNT(DISTINCT ct.id)::int  AS contract_count,
      (
        SELECT c2.name FROM contacts c2
        WHERE c2.org_id = o.id AND c2.hierarchy_order = 1
        ORDER BY c2.name LIMIT 1
      ) AS top_leader_name,
      (
        SELECT c2.title FROM contacts c2
        WHERE c2.org_id = o.id AND c2.hierarchy_order = 1
        ORDER BY c2.name LIMIT 1
      ) AS top_leader_title
    FROM orgs o
    LEFT JOIN contacts c  ON c.org_id  = o.id
    LEFT JOIN contracts ct ON ct.org_id = o.id
    WHERE o.is_active = true
    GROUP BY o.id
    ORDER BY o.abs_hierarchy_level NULLS LAST, o.full_name
  `}async function f(){let a=await e();return(0,b.jsx)(d.default,{orgs:a})}a.s(["default",0,f,"revalidate",0,600])},26030,a=>{a.n(a.i(50708))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__20u6oml._.js.map