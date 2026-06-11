module.exports=[93695,(a,b,c)=>{b.exports=a.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},50640,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"InvariantError",{enumerable:!0,get:function(){return d}});class d extends Error{constructor(a,b){super(`Invariant: ${a.endsWith(".")?a:a+"."} This is a bug in Next.js.`,b),this.name="InvariantError"}}},64240,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},26758,a=>{a.v("/_next/static/media/favicon.2vob68tjqpejf.ico"+(globalThis.NEXT_CLIENT_ASSET_SUFFIX||""))},38872,a=>{"use strict";let b={src:a.i(26758).default,width:256,height:256};a.s(["default",0,b])},48585,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/signals/SignalsClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/signals/SignalsClient.tsx <module evaluation>","default")},67072,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/signals/SignalsClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/signals/SignalsClient.tsx","default")},58301,a=>{"use strict";a.i(48585);var b=a.i(67072);a.n(b)},87216,a=>a.a(async(b,c)=>{try{var d=a.i(7997),e=a.i(66879),f=a.i(58301),g=b([e]);async function h(){let a=(0,e.getDb)(),[b,c,d]=await Promise.all([a`
      SELECT
        c.id, c.external_id, c.title, c.value, c.status, c.signal_type,
        c.award_date, c.source, c.set_aside, c.deadline, c.org_id,
        o.name AS org_name, o.slug AS org_slug, o.badge_color
      FROM contracts c
      LEFT JOIN organizations o ON o.id = c.org_id
      ORDER BY c.award_date DESC NULLS LAST, c.created_at DESC
      LIMIT 200
    `,a`SELECT id, name, slug, badge_color, badge_text FROM organizations ORDER BY name`,a`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE signal_type = 'Opportunity')::int AS opps,
        COUNT(*) FILTER (WHERE signal_type = 'Award')::int AS awards,
        COALESCE(SUM(value) FILTER (WHERE signal_type = 'Award'), 0)::bigint AS total_value
      FROM contracts
    `]);return{contracts:b,orgs:c,stats:d[0]??{total:0,opps:0,awards:0,total_value:0}}}async function i(){let a=await h();return(0,d.jsx)(f.default,{...a})}[e]=g.then?(await g)():g,a.s(["default",0,i,"dynamic",0,"force-dynamic"]),c()}catch(a){c(a)}},!1),97411,a=>{a.n(a.i(87216))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1vuen4h._.js.map