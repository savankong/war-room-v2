import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@netlify/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.SAM_SYNC_TOKEN ?? 'warroom-seed-2026';

const EXECS = [
  // ── Lockheed Martin ─────────────────────────────────────────────────
  { id: 'ind-lmt-taiclet',    name: 'James D. Taiclet',        title: 'Chairman, President & CEO',                        org_full: 'LOCKHEED MARTIN CORPORATION',                   hierarchy_order: 1, linkedin: 'james-taiclet' },
  { id: 'ind-lmt-malave',     name: 'Jesus Malave Jr.',         title: 'EVP & Chief Financial Officer',                    org_full: 'LOCKHEED MARTIN CORPORATION',                   hierarchy_order: 3 },
  { id: 'ind-lmt-stjohn',     name: 'Frank A. St. John',        title: 'EVP, Aeronautics',                                 org_full: 'LOCKHEED MARTIN CORPORATION',                   hierarchy_order: 3 },
  { id: 'ind-lmt-lightfoot',  name: 'Robert Lightfoot',         title: 'EVP, Space',                                       org_full: 'LOCKHEED MARTIN CORPORATION',                   hierarchy_order: 3 },
  { id: 'ind-lmt-evans',      name: 'Michele Evans',            title: 'EVP, Rotary & Mission Systems',                    org_full: 'LOCKHEED MARTIN CORPORATION',                   hierarchy_order: 3 },
  // ── The Boeing Company ───────────────────────────────────────────────
  { id: 'ind-ba-ortberg',     name: 'Kelly Ortberg',            title: 'President & CEO',                                  org_full: 'THE BOEING COMPANY',                            hierarchy_order: 1 },
  { id: 'ind-ba-west',        name: 'Brian West',               title: 'EVP & Chief Financial Officer',                    org_full: 'THE BOEING COMPANY',                            hierarchy_order: 3 },
  { id: 'ind-ba-pope',        name: 'Stephanie Pope',           title: 'President, Boeing Commercial Airplanes',           org_full: 'THE BOEING COMPANY',                            hierarchy_order: 2 },
  { id: 'ind-ba-colbert',     name: 'Ted Colbert',              title: 'President, Boeing Defense, Space & Security',      org_full: 'THE BOEING COMPANY',                            hierarchy_order: 2 },
  { id: 'ind-ba-delaney',     name: 'Dana Deasy',               title: 'EVP & Chief Information Officer',                  org_full: 'THE BOEING COMPANY',                            hierarchy_order: 3 },
  // ── RTX Corporation ─────────────────────────────────────────────────
  { id: 'ind-rtx-calio',      name: 'Christopher T. Calio',     title: 'President & CEO',                                  org_full: 'RTX CORPORATION',                               hierarchy_order: 1 },
  { id: 'ind-rtx-mitchill',   name: 'Neil G. Mitchill Jr.',     title: 'EVP & Chief Financial Officer',                    org_full: 'RTX CORPORATION',                               hierarchy_order: 3 },
  { id: 'ind-rtx-kremer',     name: 'Wesley D. Kremer',         title: 'President, Raytheon',                              org_full: 'RTX CORPORATION',                               hierarchy_order: 2 },
  { id: 'ind-rtx-mahoney',    name: 'Colin Mahoney',            title: 'President, Pratt & Whitney',                       org_full: 'RTX CORPORATION',                               hierarchy_order: 2 },
  { id: 'ind-rtx-sullivan',   name: 'Paul Thomas',              title: 'President, Collins Aerospace',                     org_full: 'RTX CORPORATION',                               hierarchy_order: 2 },
  // ── Northrop Grumman ─────────────────────────────────────────────────
  { id: 'ind-noc-warden',     name: 'Kathy J. Warden',          title: 'Chairman, President & CEO',                        org_full: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',          hierarchy_order: 1 },
  { id: 'ind-noc-porges',     name: 'David F. Porges',          title: 'EVP & Chief Financial Officer',                    org_full: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',          hierarchy_order: 3 },
  { id: 'ind-noc-caylor',     name: 'Mark Caylor',              title: 'President, Mission Systems',                       org_full: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',          hierarchy_order: 2 },
  { id: 'ind-noc-jones',      name: 'Tom Jones',                title: 'President, Space Systems',                         org_full: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',          hierarchy_order: 2 },
  { id: 'ind-noc-sheridan',   name: 'Mary Sheridan',            title: 'CVP & Chief Human Resources Officer',              org_full: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',          hierarchy_order: 3 },
  // ── Huntington Ingalls ───────────────────────────────────────────────
  { id: 'ind-hii-kastner',    name: 'Christopher D. Kastner',   title: 'President & CEO',                                  org_full: 'HUNTINGTON INGALLS INCORPORATED',               hierarchy_order: 1 },
  { id: 'ind-hii-stiehle',    name: 'Thomas E. Stiehle',        title: 'EVP & Chief Financial Officer',                    org_full: 'HUNTINGTON INGALLS INCORPORATED',               hierarchy_order: 3 },
  { id: 'ind-hii-southall',   name: 'Charles Southall',         title: 'President, Ingalls Shipbuilding',                  org_full: 'HUNTINGTON INGALLS INCORPORATED',               hierarchy_order: 2 },
  { id: 'ind-hii-west',       name: 'Todd West',                title: 'EVP, Mission Technologies',                        org_full: 'HUNTINGTON INGALLS INCORPORATED',               hierarchy_order: 2 },
  // ── General Dynamics ─────────────────────────────────────────────────
  { id: 'ind-gd-novakovic',   name: 'Phebe N. Novakovic',       title: 'Chairman & CEO',                                   org_full: 'GENERAL DYNAMICS LAND SYSTEMS INC.',            hierarchy_order: 1 },
  { id: 'ind-gd-aiken',       name: 'Jason W. Aiken',           title: 'SVP & Chief Financial Officer',                    org_full: 'GENERAL DYNAMICS LAND SYSTEMS INC.',            hierarchy_order: 3 },
  { id: 'ind-gd-burns',       name: 'Mark C. Burns',            title: 'President, Combat Systems',                        org_full: 'GENERAL DYNAMICS LAND SYSTEMS INC.',            hierarchy_order: 2 },
  { id: 'ind-gd-brady',       name: 'Chris Brady',              title: 'President, Marine Systems',                        org_full: 'GENERAL DYNAMICS LAND SYSTEMS INC.',            hierarchy_order: 2 },
  // ── Leidos ───────────────────────────────────────────────────────────
  { id: 'ind-ldos-bell',      name: 'Tom Bell',                 title: 'Chairman & CEO',                                   org_full: 'LEIDOS, INC.',                                  hierarchy_order: 1 },
  { id: 'ind-ldos-cage',      name: 'Christopher Cage',         title: 'EVP & Chief Financial Officer',                    org_full: 'LEIDOS, INC.',                                  hierarchy_order: 3 },
  { id: 'ind-ldos-fasano',    name: 'Gerry Fasano',             title: 'President, National Security Sector',              org_full: 'LEIDOS, INC.',                                  hierarchy_order: 2 },
  { id: 'ind-ldos-stevens',   name: 'Roy Stevens',              title: 'President, Health & Civil Sector',                 org_full: 'LEIDOS, INC.',                                  hierarchy_order: 2 },
  // ── SAIC ─────────────────────────────────────────────────────────────
  { id: 'ind-saic-whitley',   name: 'Toni Townes-Whitley',      title: 'President & CEO',                                  org_full: 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION', hierarchy_order: 1 },
  { id: 'ind-saic-natarajan', name: 'Prabu Natarajan',          title: 'EVP & Chief Financial Officer',                    org_full: 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION', hierarchy_order: 3 },
  { id: 'ind-saic-genter',    name: 'Bob Genter',               title: 'EVP & Chief Operating Officer',                    org_full: 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION', hierarchy_order: 2 },
  { id: 'ind-saic-reese',     name: 'Justin Reese',             title: 'EVP, Business Development',                        org_full: 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION', hierarchy_order: 3 },
  // ── BAE Systems ──────────────────────────────────────────────────────
  { id: 'ind-bae-arseneault', name: 'Tom Arseneault',           title: 'President & CEO, BAE Systems Inc.',                org_full: 'BAE SYSTEMS LAND & ARMAMENTS L.P.',             hierarchy_order: 1 },
  { id: 'ind-bae-woodburn',   name: 'Charles Woodburn',         title: 'Group Chief Executive Officer',                    org_full: 'BAE SYSTEMS LAND & ARMAMENTS L.P.',             hierarchy_order: 1 },
  { id: 'ind-bae-hudson',     name: 'Brad Pfeifer',             title: 'SVP, Business Development & Strategy',             org_full: 'BAE SYSTEMS LAND & ARMAMENTS L.P.',             hierarchy_order: 3 },
  // ── KBR ──────────────────────────────────────────────────────────────
  { id: 'ind-kbr-bradie',     name: 'Stuart J.B. Bradie',       title: 'President & CEO',                                  org_full: 'KBR SERVICES, LLC',                             hierarchy_order: 1 },
  { id: 'ind-kbr-sopp',       name: 'Mark Sopp',                title: 'SVP & Chief Financial Officer',                    org_full: 'KBR SERVICES, LLC',                             hierarchy_order: 3 },
  { id: 'ind-kbr-bright',     name: 'Byron Bright',             title: 'President, Government Services',                   org_full: 'KBR SERVICES, LLC',                             hierarchy_order: 2 },
  // ── Amentum ──────────────────────────────────────────────────────────
  { id: 'ind-amentum-heller', name: 'John Heller',              title: 'Chief Executive Officer',                          org_full: 'AMENTUM SERVICES, INC.',                        hierarchy_order: 1 },
  { id: 'ind-amentum-sherwood', name: 'Susan Sherwood',         title: 'Chief Financial Officer',                          org_full: 'AMENTUM SERVICES, INC.',                        hierarchy_order: 3 },
  { id: 'ind-amentum-tucker', name: 'Steve Tucker',             title: 'President, Defense & Intelligence',                org_full: 'AMENTUM SERVICES, INC.',                        hierarchy_order: 2 },
  // ── L3Harris ─────────────────────────────────────────────────────────
  { id: 'ind-lhx-brown',      name: 'Christopher E. Kubasik',   title: 'Chair & CEO',                                      org_full: 'L3HARRIS TECHNOLOGIES, INC.',                   hierarchy_order: 1 },
  { id: 'ind-lhx-souza',      name: 'Jesus Malave',             title: 'EVP & CFO',                                        org_full: 'L3HARRIS TECHNOLOGIES, INC.',                   hierarchy_order: 3 },
  { id: 'ind-lhx-dean',       name: 'Sean Stackley',            title: 'President, Mission & Mobility Solutions',          org_full: 'L3HARRIS TECHNOLOGIES, INC.',                   hierarchy_order: 2 },
  // ── Booz Allen Hamilton ───────────────────────────────────────────────
  { id: 'ind-bah-moorman',    name: 'Horacio Rozanski',         title: 'President & CEO',                                  org_full: 'BOOZ ALLEN HAMILTON INC.',                      hierarchy_order: 1 },
  { id: 'ind-bah-walsh',      name: 'Matthew S. Walsh',         title: 'EVP & CFO',                                        org_full: 'BOOZ ALLEN HAMILTON INC.',                      hierarchy_order: 3 },
  { id: 'ind-bah-moore',      name: 'Susan Penfield',           title: 'EVP & Chief Technology Officer',                   org_full: 'BOOZ ALLEN HAMILTON INC.',                      hierarchy_order: 2 },
  { id: 'ind-bah-durbin',     name: 'Brad Medairy',             title: 'EVP, Defense',                                     org_full: 'BOOZ ALLEN HAMILTON INC.',                      hierarchy_order: 2 },
  // ── Electric Boat ─────────────────────────────────────────────────────
  { id: 'ind-eb-graney',      name: 'Kevin Graney',             title: 'President, Electric Boat',                         org_full: 'ELECTRIC BOAT CORPORATION',                     hierarchy_order: 1 },
  { id: 'ind-eb-nash',        name: 'Jeffrey Nash',             title: 'VP, Business Development',                         org_full: 'ELECTRIC Boat CORPORATION',                     hierarchy_order: 3 },
  // ── Bath Iron Works ───────────────────────────────────────────────────
  { id: 'ind-biw-lynch',      name: 'William Fitzgerald',       title: 'President, Bath Iron Works',                       org_full: 'BATH IRON WORKS CORPORATION',                   hierarchy_order: 1 },
  // ── Sikorsky ─────────────────────────────────────────────────────────
  { id: 'ind-sik-girard',     name: 'Paul Lemmo',               title: 'President, Sikorsky',                              org_full: 'SIKORSKY AIRCRAFT CORPORATION',                 hierarchy_order: 1 },
  // ── General Atomics ───────────────────────────────────────────────────
  { id: 'ind-ga-blue',        name: 'Neal Blue',                title: 'Chairman & CEO',                                   org_full: 'GENERAL ATOMICS AERONAUTICAL SYSTEMS, INC.',    hierarchy_order: 1 },
  { id: 'ind-ga-lall',        name: 'Vivek Lall',               title: 'Chief Business Development Officer',               org_full: 'GENERAL ATOMICS AERONAUTICAL SYSTEMS, INC.',    hierarchy_order: 2 },
  { id: 'ind-ga-moore',       name: 'David R. Alexander',       title: 'President, General Atomics Aeronautical Systems',  org_full: 'GENERAL ATOMICS AERONAUTICAL SYSTEMS, INC.',    hierarchy_order: 2 },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (getDatabase() as any).sql;

  // Remove existing industry exec entries (ind-* prefix) then re-insert
  const del = await db`DELETE FROM contacts WHERE id LIKE 'ind-%' RETURNING id`;

  let inserted = 0;
  const errors: string[] = [];

  for (const e of EXECS) {
    try {
      await db`
        INSERT INTO contacts (id, name, title, org_full, tags, hierarchy_order, linkedin)
        VALUES (
          ${e.id},
          ${e.name},
          ${e.title},
          ${e.org_full},
          ARRAY['INDUSTRY'],
          ${e.hierarchy_order ?? 5},
          ${(e as { linkedin?: string }).linkedin ?? null}
        )
        ON CONFLICT (id) DO UPDATE SET
          name           = EXCLUDED.name,
          title          = EXCLUDED.title,
          org_full       = EXCLUDED.org_full,
          tags           = EXCLUDED.tags,
          hierarchy_order = EXCLUDED.hierarchy_order
      `;
      inserted++;
    } catch (err: unknown) {
      errors.push(`${e.id}: ${err instanceof Error ? err.message.slice(0, 80) : String(err)}`);
    }
  }

  return NextResponse.json({
    deleted: del.length,
    inserted,
    errors: errors.length ? errors : undefined,
  });
}
