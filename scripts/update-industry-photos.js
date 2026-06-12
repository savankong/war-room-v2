/**
 * Updates photo_url and linkedin for seeded industry executives.
 * Sources: official company leadership/IR pages, LinkedIn public profiles.
 * Run: node scripts/update-industry-photos.js
 */
const postgres = require('../node_modules/postgres');

const sql = postgres(
  process.env.DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_r3FGVA1pbSWY@ep-mute-dream-aj877gn6.c-3.us-east-2.db.netlify.com/netlifydb?sslmode=require',
  { ssl: 'require', max: 1, prepare: false }
);

const UPDATES = [
  /* ── Lockheed Martin ─────────────────────────────── */
  { id: 'ind-lmt-taiclet',   linkedin: 'james-taiclet',                photo_url: 'https://www.lockheedmartin.com/content/dam/lockheed-martin/eo/photo/leadership-governance/portraits/jim-taiclet-280.jpg.pc-adaptive.full.medium.jpg' },
  { id: 'ind-lmt-stjohn',    linkedin: null,                            photo_url: 'https://www.lockheedmartin.com/content/dam/lockheed-martin/eo/photo/leadership-governance/portraits/frank-st-john-280.jpg.pc-adaptive.full.medium.jpg' },
  { id: 'ind-lmt-lightfoot', linkedin: null,                            photo_url: 'https://www.lockheedmartin.com/content/dam/lockheed-martin/eo/photo/leadership-governance/portraits/robert-lightfoot-280.jpg.pc-adaptive.full.medium.jpg' },

  /* ── Boeing ──────────────────────────────────────── */
  { id: 'ind-ba-ortberg',    linkedin: 'kelly-ortberg',                 photo_url: 'https://www.boeing.com/content/theboeingcompany/us/en/company/bios/_jcr_content/root/container/section/card_holder/card_copy.coreimg.jpeg/1768492884183/kelly-ortberg-bio.jpeg' },
  { id: 'ind-ba-pope',       linkedin: null,                            photo_url: 'https://www.boeing.com/content/theboeingcompany/us/en/company/bios/_jcr_content/root/container/section/card_holder/card_copy_270401371.coreimg.jpeg/1768492884195/spope-bio.jpeg' },
  { id: 'ind-ba-delaney',    linkedin: null,                            photo_url: 'https://www.boeing.com/content/theboeingcompany/us/en/company/bios/_jcr_content/root/container/section/card_holder/card_copy_59427322.coreimg.jpeg/1768492884207/dana-deasy-bio-21.jpeg' },

  /* ── RTX ─────────────────────────────────────────── */
  { id: 'ind-rtx-calio',     linkedin: null,                            photo_url: 'https://prd-sc102-cdn.rtx.com/-/media/rtx/c/calio/chris-calio-landscape.jpg' },
  { id: 'ind-rtx-mitchill',  linkedin: null,                            photo_url: 'https://prd-sc102-cdn.rtx.com/-/media/rtx/our-company/our-leadership/media/leadership/06-2023/rtx-slt-mitchill-648x776.png' },

  /* ── Northrop Grumman ────────────────────────────── */
  { id: 'ind-noc-warden',    linkedin: 'kathywarden',                   photo_url: 'https://media.northropgrumman.com/93fbea65-e6ae-4c3a-9d9b-b4260003b489/kathy-warden_Original%20file.jpg' },
  { id: 'ind-noc-jones',     linkedin: null,                            photo_url: 'https://media.northropgrumman.com/d26d6bd5-4c84-40f6-abdb-b38500254e6e/Tom-Jones-headshot-2_Original%20file.jpg' },

  /* ── HII ─────────────────────────────────────────── */
  { id: 'ind-hii-kastner',   linkedin: 'christopher-kastner-a7746275',  photo_url: 'https://pub-456e3044e5bb4e29a2840263f837feca.r2.dev/1/Chris_Kastner_HII_web_ed1963137b.png' },
  { id: 'ind-hii-stiehle',   linkedin: null,                            photo_url: 'https://pub-456e3044e5bb4e29a2840263f837feca.r2.dev/1/Thomas_E_Stiehle_657e72526c.png' },

  /* ── Leidos ──────────────────────────────────────── */
  { id: 'ind-ldos-bell',     linkedin: 'tom-bell-leidos',               photo_url: 'https://www.leidos.com/sites/leidos/files/styles/focal_point_profile_card_image/public/2026-03/HEAD-Tom-Bell.jpg' },
  { id: 'ind-ldos-cage',     linkedin: null,                            photo_url: 'https://www.leidos.com/sites/leidos/files/styles/focal_point_profile_card_image/public/2026-03/HEAD-Chris-Cage.jpg' },
  { id: 'ind-ldos-stevens',  linkedin: null,                            photo_url: 'https://www.leidos.com/sites/leidos/files/styles/focal_point_profile_card_image/public/2026-03/HEAD-Roy-Stevens.jpg' },
];

async function run() {
  console.log(`Updating ${UPDATES.length} industry executive profiles…`);
  for (const u of UPDATES) {
    await sql`
      UPDATE contacts
      SET
        photo_url = COALESCE(${u.photo_url}, photo_url),
        linkedin  = COALESCE(${u.linkedin},  linkedin)
      WHERE id = ${u.id}
    `;
    process.stdout.write('.');
  }
  console.log(`\nDone.`);
  await sql.end();
}

run().catch(e => { console.error(e); process.exit(1); });
