module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},46786,(a,b,c)=>{b.exports=a.x("os",()=>require("os"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},4446,(a,b,c)=>{b.exports=a.x("net",()=>require("net"))},55004,(a,b,c)=>{b.exports=a.x("tls",()=>require("tls"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},88947,(a,b,c)=>{b.exports=a.x("stream",()=>require("stream"))},60438,(a,b,c)=>{b.exports=a.x("perf_hooks",()=>require("perf_hooks"))},26758,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},38872,a=>{"use strict";let b={src:a.i(26758).default,width:256,height:256};a.s(["default",0,b])},40442,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/admin/AdminClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/admin/AdminClient.tsx <module evaluation>","default")},19974,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/admin/AdminClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/admin/AdminClient.tsx","default")},15169,a=>{"use strict";a.i(40442);var b=a.i(19974);a.n(b)},86607,a=>{"use strict";var b=a.i(7997),c=a.i(66879),d=a.i(15169);async function e(){let a=(0,c.getDb)();await a`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_inbox boolean DEFAULT false`;let[b,d,e,f]=await Promise.all([a`
      SELECT o.id, o.full_name AS name, o.abbreviation, o.branch,
             o.organization_type AS type, o.organization_type,
             o.description, o.website, o.parent_id,
             o.is_active, o.loc, o.abs_hierarchy_level,
             COUNT(DISTINCT c.id)::int  AS contacts,
             COUNT(DISTINCT ct.id)::int AS contracts
      FROM orgs o
      LEFT JOIN contacts  c  ON c.org_id  = o.id
      LEFT JOIN contracts ct ON ct.org_id = o.id
      GROUP BY o.id ORDER BY o.full_name
    `,a`
      SELECT c.id, c.name, c.title, c.org_id, c.org_full,
             c.email, c.phone, c.linkedin,
             c.hierarchy_order, c.is_inbox,
             c.tags, c.opps, c.last_signal
      FROM contacts c
      ORDER BY c.hierarchy_order NULLS LAST, c.name
    `,a`
      SELECT id, title, signal_type, value, award_amt, award_date,
             set_aside, org_id, source, recipient,
             poc, poc_email, naics, description, deadline
      FROM contracts
      ORDER BY created_at DESC NULLS LAST
      LIMIT 2000
    `,a`
      SELECT
        (SELECT COUNT(*) FROM orgs)::int      AS org_count,
        (SELECT COUNT(*) FROM contacts)::int  AS contact_count,
        (SELECT COUNT(*) FROM contracts)::int AS contract_count,
        (SELECT COUNT(*) FROM orgs WHERE is_active = true)::int AS active_orgs
    `]),g=f[0]??{};return{orgs:b,contacts:d,contracts:e,stats:{orgCount:g.org_count??0,contactCount:g.contact_count??0,contractCount:g.contract_count??0,activeOrgs:g.active_orgs??0}}}async function f(){let a=await e();return(0,b.jsx)(d.default,{...a})}a.s(["default",0,f,"dynamic",0,"force-dynamic"])},17222,a=>{a.n(a.i(86607))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1g0rj37._.js.map