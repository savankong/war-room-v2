module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},46786,(a,b,c)=>{b.exports=a.x("os",()=>require("os"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},4446,(a,b,c)=>{b.exports=a.x("net",()=>require("net"))},55004,(a,b,c)=>{b.exports=a.x("tls",()=>require("tls"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},88947,(a,b,c)=>{b.exports=a.x("stream",()=>require("stream"))},60438,(a,b,c)=>{b.exports=a.x("perf_hooks",()=>require("perf_hooks"))},26758,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},38872,a=>{"use strict";let b={src:a.i(26758).default,width:256,height:256};a.s(["default",0,b])},48585,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/signals/SignalsClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/signals/SignalsClient.tsx <module evaluation>","default")},67072,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/signals/SignalsClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/signals/SignalsClient.tsx","default")},58301,a=>{"use strict";a.i(48585);var b=a.i(67072);a.n(b)},87216,a=>{"use strict";var b=a.i(7997),c=a.i(66879),d=a.i(58301);let e=`(
  recipient ILIKE 'LOCKHEED MARTIN%'
  OR recipient ILIKE 'THE BOEING COMPANY%'
  OR recipient ILIKE 'BOEING%'
  OR recipient ILIKE '%RAYTHEON%'
  OR recipient ILIKE 'RTX CORPORATION%'
  OR recipient ILIKE 'NORTHROP GRUMMAN%'
  OR recipient ILIKE 'HUNTINGTON INGALLS%'
  OR recipient ILIKE 'GENERAL DYNAMICS%'
  OR recipient ILIKE 'LEIDOS%'
  OR recipient ILIKE 'SCIENCE APPLICATIONS%'
  OR recipient ILIKE 'BAE SYSTEMS%'
  OR recipient ILIKE 'KBR SERVICES%'
  OR recipient ILIKE 'AMENTUM%'
  OR recipient ILIKE 'ELECTRIC BOAT%'
  OR recipient ILIKE 'BATH IRON WORKS%'
  OR recipient ILIKE 'SIKORSKY%'
  OR recipient ILIKE 'GENERAL ATOMICS%'
)`;async function f(){let a=(0,c.getDb)(),[b,d,f,g,h]=await Promise.all([a`
      SELECT
        c.id, c.external_id, c.title, c.value, c.set_aside AS status, c.signal_type,
        COALESCE(c.award_date, c.created_at::date) AS award_date,
        c.source, c.set_aside, c.deadline, c.org_id, c.recipient,
        c.award_amt, c.poc_email, c.naics, c.sub_agency,
        o.full_name AS org_name, o.id AS org_slug,
        o.organization_type AS badge_text, NULL::text AS badge_color
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.org_id
      WHERE c.signal_type IS NOT NULL
      ORDER BY c.created_at DESC NULLS LAST
      LIMIT 5000
    `,a`SELECT id, full_name AS name, id AS slug FROM orgs WHERE is_active = true ORDER BY full_name`,a`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE signal_type = 'Opportunity')::int AS opps,
        COUNT(*) FILTER (WHERE signal_type = 'Award')::int AS awards,
        COALESCE(SUM(value::numeric) FILTER (WHERE signal_type = 'Award'), 0)::bigint AS total_value
      FROM contracts
      WHERE signal_type IS NOT NULL
    `,a`
      SELECT
        c.id, c.title, c.award_amt, c.award_date, c.recipient,
        c.sub_agency, c.agency, c.naics, c.set_aside, c.source,
        c.org_id, o.full_name AS org_name
      FROM contracts c
      LEFT JOIN orgs o ON o.id = c.org_id
      WHERE c.signal_type = 'Award'
        AND c.recipient IS NOT NULL
        AND ${a.unsafe(e)}
      ORDER BY c.award_amt::numeric DESC NULLS LAST
      LIMIT 2000
    `,a`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT recipient)::int AS companies,
        COALESCE(SUM(award_amt::numeric), 0)::bigint AS total_value
      FROM contracts
      WHERE signal_type = 'Award'
        AND recipient IS NOT NULL
        AND ${a.unsafe(e)}
    `]);return{contracts:b,orgs:d,stats:f[0]??{total:0,opps:0,awards:0,total_value:0},industryContracts:g,indStats:h[0]??{total:0,companies:0,total_value:0}}}async function g(){let a=await f();return(0,b.jsx)(d.default,{...a})}a.s(["default",0,g,"revalidate",0,300])},97411,a=>{a.n(a.i(87216))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0_9nu6t._.js.map