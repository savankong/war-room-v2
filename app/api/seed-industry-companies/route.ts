import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@netlify/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.SAM_SYNC_TOKEN ?? 'warroom-seed-2026';

// Public data: annual reports, SEC filings, FPDS (FY2023).
// dod_contract_value_b = approximate annual DoD prime contract value in $B
const COMPANIES = [
  { legal_name: 'LOCKHEED MARTIN CORPORATION',                    name: 'Lockheed Martin',          ticker: 'LMT',   headquarters: 'Bethesda, MD',      website: 'https://www.lockheedmartin.com',       employees: 122000, revenue_b: 67.6, dod_contract_value_b: 62.1, logo_url: null,  focus_areas: ['Aeronautics', 'Missiles & Fire Control', 'Rotary & Mission Systems', 'Space'],          description: 'Lockheed Martin is the world\'s largest defense contractor, specializing in aerospace, defense, and security products. Key programs include the F-35 fighter jet, C-130 Hercules, Aegis Combat System, and Orion spacecraft. It serves all branches of the U.S. military and 70+ international customers.' },
  { legal_name: 'THE BOEING COMPANY',                             name: 'Boeing Defense',            ticker: 'BA',    headquarters: 'Arlington, VA',      website: 'https://www.boeing.com/defense',       employees: 172000, revenue_b: 22.0, dod_contract_value_b: 16.5, logo_url: null,  focus_areas: ['Combat Aircraft', 'Vertical Lift', 'Autonomous Systems', 'Space & Satellites'],        description: 'Boeing Defense, Space & Security is one of the world\'s largest defense, space, and security businesses. It develops military aircraft, missile defense systems, satellite systems, and cybersecurity products. Major programs include the F/A-18 Super Hornet, P-8 Poseidon, AH-64 Apache, KC-46 Pegasus, and Ground-based Midcourse Defense.' },
  { legal_name: 'RTX CORPORATION',                                name: 'RTX Corporation',           ticker: 'RTX',   headquarters: 'Arlington, VA',      website: 'https://www.rtx.com',                 employees: 185000, revenue_b: 68.9, dod_contract_value_b: 19.8, logo_url: null,  focus_areas: ['Missiles & Munitions', 'Propulsion', 'Avionics & Sensors', 'Missile Defense'],         description: 'RTX Corporation (formerly Raytheon Technologies) is a premier aerospace and defense company. Through its Raytheon, Pratt & Whitney, and Collins Aerospace businesses, RTX delivers advanced systems and services for commercial, military, and government customers worldwide. Key systems include the Patriot missile defense system, StormBreaker smart bomb, and F135 jet engine.' },
  { legal_name: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',           name: 'Northrop Grumman',          ticker: 'NOC',   headquarters: 'Falls Church, VA',   website: 'https://www.northropgrumman.com',      employees: 101000, revenue_b: 39.3, dod_contract_value_b: 17.4, logo_url: null,  focus_areas: ['Aeronautics', 'Space Systems', 'Mission Systems', 'Cyber & C4ISR'],                   description: 'Northrop Grumman is a global aerospace and defense technology company. Major programs include the B-21 Raider stealth bomber, E-2D Hawkeye, James Webb Space Telescope, and Sentinel ICBM modernization. A leader in autonomous systems, cyber, and C4ISR.' },
  { legal_name: 'GENERAL DYNAMICS LAND SYSTEMS INC.',             name: 'General Dynamics',          ticker: 'GD',    headquarters: 'Reston, VA',         website: 'https://www.gd.com',                  employees: 106700, revenue_b: 42.3, dod_contract_value_b: 15.9, logo_url: null,  focus_areas: ['Combat Systems', 'Marine Systems', 'IT & Intelligence', 'Aerospace'],                  description: 'General Dynamics is a global aerospace and defense company. Major programs include the M1 Abrams tank, Virginia-class submarine, Stryker vehicle, and Gulfstream business jets.' },
  { legal_name: 'L3HARRIS TECHNOLOGIES, INC.',                    name: 'L3Harris Technologies',     ticker: 'LHX',   headquarters: 'Melbourne, FL',      website: 'https://www.l3harris.com',            employees:  50000, revenue_b: 21.3, dod_contract_value_b: 12.5, logo_url: null,  focus_areas: ['Space & Intelligence', 'Communication Systems', 'Aviation Systems', 'Electronic Warfare'], description: 'L3Harris Technologies is an agile global aerospace and defense technology innovator. Key capabilities include ISR systems, tactical radios, night vision, and electronic warfare.' },
  { legal_name: 'HUNTINGTON INGALLS INCORPORATED',                name: 'Huntington Ingalls',        ticker: 'HII',   headquarters: 'Newport News, VA',   website: 'https://www.huntingtoningalls.com',    employees:  44000, revenue_b: 11.5, dod_contract_value_b: 10.2, logo_url: null,  focus_areas: ['Aircraft Carriers', 'Nuclear Submarines', 'Surface Combatants', 'Mission Technologies'], description: 'Huntington Ingalls Industries is America\'s largest military shipbuilding company, the sole designer, builder and refueler of nuclear-powered aircraft carriers, and one of two providers of nuclear-powered submarines to the U.S. Navy.' },
  { legal_name: 'LEIDOS, INC.',                                   name: 'Leidos',                    ticker: 'LDOS',  headquarters: 'Reston, VA',         website: 'https://www.leidos.com',              employees:  47000, revenue_b: 15.4, dod_contract_value_b:  8.3, logo_url: null,  focus_areas: ['Defense Solutions', 'Intelligence', 'Civil', 'Health'],                                description: 'Leidos is a FORTUNE 500 science and technology solutions leader. It focuses on advanced ISR, C4ISR, cybersecurity, logistics, training, and IT services for defense and government customers.' },
  { legal_name: 'BAE SYSTEMS LAND & ARMAMENTS L.P.',              name: 'BAE Systems',               ticker: 'BA.L',  headquarters: 'Falls Church, VA',   website: 'https://www.baesystems.com/en-us',    employees: 107500, revenue_b: 28.3, dod_contract_value_b:  7.1, logo_url: null,  focus_areas: ['Combat Vehicles', 'Electronic Systems', 'Cyber & Intelligence', 'Platforms & Services'], description: 'BAE Systems is a global defence, aerospace, and security company. U.S. programs include Bradley IFV upgrades, Paladin howitzer, M109A7, and electronic warfare systems.' },
  { legal_name: 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION', name: 'SAIC',                      ticker: 'SAIC',  headquarters: 'Reston, VA',         website: 'https://www.saic.com',                employees:  24000, revenue_b:  7.5, dod_contract_value_b:  5.8, logo_url: null,  focus_areas: ['IT Modernization', 'Cybersecurity', 'Systems Engineering', 'Digital Transformation'],  description: 'SAIC is a premier technology integrator providing full life-cycle services in technical, engineering, intelligence, and enterprise IT markets for the U.S. government.' },
  { legal_name: 'BOOZ ALLEN HAMILTON INC.',                       name: 'Booz Allen Hamilton',       ticker: 'BAH',   headquarters: 'McLean, VA',         website: 'https://www.boozallen.com',           employees:  33300, revenue_b: 10.7, dod_contract_value_b:  6.4, logo_url: null,  focus_areas: ['Analytics & AI', 'Cybersecurity', 'Digital Solutions', 'Engineering'],                 description: 'Booz Allen Hamilton is a leading provider of management consulting, technology, and engineering services to the U.S. government in defense, intelligence, and civil sectors.' },
  { legal_name: 'KBR SERVICES, LLC',                              name: 'KBR',                       ticker: 'KBR',   headquarters: 'Houston, TX',        website: 'https://www.kbr.com',                 employees:  37000, revenue_b:  6.9, dod_contract_value_b:  3.8, logo_url: null,  focus_areas: ['Professional Services', 'Science & Space', 'Sustainment', 'Base Operations'],           description: 'KBR is a global provider of science, technology, and engineering solutions. Its Government Services business provides professional services and integrated base operations support across DoD and federal agencies.' },
  { legal_name: 'AMENTUM SERVICES, INC.',                         name: 'Amentum',                   ticker: null,    headquarters: 'Germantown, MD',     website: 'https://www.amentum.com',             employees:  65000, revenue_b: 13.5, dod_contract_value_b:  8.1, logo_url: null,  focus_areas: ['Operations & Maintenance', 'Nuclear Services', 'Environmental', 'Defense & Intel'],     description: 'Amentum is a premier global government services provider supporting critical missions across defense, intelligence, energy, and environment markets worldwide.' },
  { legal_name: 'ELECTRIC BOAT CORPORATION',                      name: 'Electric Boat',             ticker: null,    headquarters: 'Groton, CT',         website: 'https://www.gdeb.com',                employees:  22000, revenue_b:  9.5, dod_contract_value_b:  9.1, logo_url: null,  focus_areas: ['Nuclear Submarines', 'Columbia-class SSBN', 'Virginia-class SSN', 'Submarine Lifecycle'], description: 'Electric Boat, a General Dynamics subsidiary, is the primary designer and builder of U.S. Navy nuclear-powered submarines, including the Virginia-class and Columbia-class SSBN.' },
  { legal_name: 'SIKORSKY AIRCRAFT CORPORATION',                  name: 'Sikorsky',                  ticker: null,    headquarters: 'Stratford, CT',      website: 'https://www.lockheedmartin.com/sikorsky', employees: 15000, revenue_b: 5.8, dod_contract_value_b: 4.2, logo_url: null,  focus_areas: ['Rotary Wing', 'Black Hawk Family', 'Naval Helicopters', 'Future Vertical Lift'],      description: 'Sikorsky, a Lockheed Martin Company, develops and manufactures military and commercial helicopters. Key programs include the UH-60 Black Hawk, CH-53K King Stallion, and Future Long Range Assault Aircraft (FLRAA).' },
  { legal_name: 'GENERAL ATOMICS AERONAUTICAL SYSTEMS, INC.',     name: 'General Atomics',           ticker: null,    headquarters: 'San Diego, CA',      website: 'https://www.ga.com',                  employees:  16000, revenue_b:  3.2, dod_contract_value_b:  2.1, logo_url: null,  focus_areas: ['Unmanned Systems', 'EMALS/AAG', 'Multi-Domain ISR', 'Advanced Energy'],                description: 'General Atomics is the world leader in Unmanned Aircraft Systems, developing the MQ-1 Predator, MQ-9 Reaper, and next-generation MQ-9B SkyGuardian. GA also leads in electromagnetic aircraft launch systems (EMALS) and fusion energy research.' },
  { legal_name: 'BATH IRON WORKS CORPORATION',                    name: 'Bath Iron Works',           ticker: null,    headquarters: 'Bath, ME',           website: 'https://www.gdbiw.com',               employees:   7800, revenue_b:  2.1, dod_contract_value_b:  2.0, logo_url: null,  focus_areas: ['Destroyers', 'DDG-51 Arleigh Burke', 'Surface Combatants', 'Ship Repair'],             description: 'Bath Iron Works, a General Dynamics subsidiary, is a leading builder of U.S. Navy surface combatants, including Arleigh Burke-class DDG-51 guided-missile destroyers.' },
  { legal_name: 'RAYTHEON COMPANY',                               name: 'Raytheon',                  ticker: 'RTX',   headquarters: 'Tucson, AZ',         website: 'https://www.rtx.com/raytheon',         employees:  40000, revenue_b: 24.0, dod_contract_value_b: 14.6, logo_url: null,  focus_areas: ['Missiles & Munitions', 'Missile Defense', 'Electronic Warfare', 'Air & Space Defense'],  description: 'Raytheon, a business of RTX, is a defense technology leader known for the Patriot air defense system, SM-3 Standard Missile, Tomahawk cruise missile, AIM-120 AMRAAM, and Next Generation Interceptor.' },
  { legal_name: 'GENERAL DYNAMICS INFORMATION TECHNOLOGY, INC.',  name: 'GDIT',                      ticker: null,    headquarters: 'Fairfax, VA',        website: 'https://www.gdit.com',                employees:  30000, revenue_b:  5.4, dod_contract_value_b:  4.8, logo_url: null,  focus_areas: ['Cloud & Infrastructure', 'AI & Analytics', 'Cybersecurity', 'Software Development'],   description: 'GDIT applies advanced data analytics, AI, cybersecurity, cloud computing, and software development to solve the most complex challenges facing the U.S. government across defense and federal markets.' },
  { legal_name: 'PERATON INC.',                                   name: 'Peraton',                   ticker: null,    headquarters: 'Herndon, VA',        website: 'https://www.peraton.com',             employees:  24000, revenue_b:  7.0, dod_contract_value_b:  5.5, logo_url: null,  focus_areas: ['Space & Intelligence', 'Cyber Operations', 'Digital Transformation', 'Communications'],  description: 'Peraton is a national security company driving missions of consequence across the U.S. government, with deep expertise in space, cyber, communications, and digital transformation for defense and intelligence customers.' },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (getDatabase() as any).sql;

  await db`
    CREATE TABLE IF NOT EXISTS industry_companies (
      id                   SERIAL PRIMARY KEY,
      legal_name           TEXT NOT NULL UNIQUE,
      name                 TEXT NOT NULL,
      ticker               TEXT,
      headquarters         TEXT,
      website              TEXT,
      employees            INT,
      revenue_b            NUMERIC(8,1),
      dod_contract_value_b NUMERIC(8,1),
      description          TEXT,
      logo_url             TEXT,
      focus_areas          TEXT[],
      created_at           TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`ALTER TABLE industry_companies ADD COLUMN IF NOT EXISTS dod_contract_value_b NUMERIC(8,1)`;

  let upserted = 0;
  const errors: string[] = [];

  for (const c of COMPANIES) {
    try {
      await db`
        INSERT INTO industry_companies
          (legal_name, name, ticker, headquarters, website, employees, revenue_b,
           dod_contract_value_b, description, logo_url, focus_areas)
        VALUES (
          ${c.legal_name}, ${c.name}, ${c.ticker ?? null}, ${c.headquarters},
          ${c.website}, ${c.employees}, ${c.revenue_b}, ${c.dod_contract_value_b},
          ${c.description}, ${c.logo_url ?? null}, ${c.focus_areas}
        )
        ON CONFLICT (legal_name) DO UPDATE SET
          name                 = EXCLUDED.name,
          ticker               = EXCLUDED.ticker,
          headquarters         = EXCLUDED.headquarters,
          website              = EXCLUDED.website,
          employees            = EXCLUDED.employees,
          revenue_b            = EXCLUDED.revenue_b,
          dod_contract_value_b = EXCLUDED.dod_contract_value_b,
          description          = EXCLUDED.description,
          logo_url             = EXCLUDED.logo_url,
          focus_areas          = EXCLUDED.focus_areas
      `;
      upserted++;
    } catch (err: unknown) {
      errors.push(`${c.legal_name}: ${err instanceof Error ? err.message.slice(0, 100) : String(err)}`);
    }
  }

  return NextResponse.json({ upserted, total: COMPANIES.length, errors: errors.length ? errors : undefined });
}
