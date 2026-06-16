import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@netlify/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.SAM_SYNC_TOKEN ?? 'warroom-seed-2026';

// Public data sourced from company annual reports, SEC filings, and investor relations pages
const COMPANIES = [
  {
    legal_name: 'LOCKHEED MARTIN CORPORATION',
    name: 'Lockheed Martin',
    ticker: 'LMT',
    headquarters: 'Bethesda, MD',
    website: 'https://www.lockheedmartin.com',
    employees: 122000,
    revenue_b: 67.6,
    description: 'Lockheed Martin is the world\'s largest defense contractor, specializing in aerospace, defense, and security products. Key programs include the F-35 fighter jet, C-130 Hercules, Aegis Combat System, and Orion spacecraft. It serves all branches of the U.S. military and 70+ international customers.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Lockheed_Martin_logo.svg/320px-Lockheed_Martin_logo.svg.png',
    focus_areas: ['Aeronautics', 'Missiles & Fire Control', 'Rotary & Mission Systems', 'Space'],
  },
  {
    legal_name: 'THE BOEING COMPANY',
    name: 'Boeing Defense',
    ticker: 'BA',
    headquarters: 'Arlington, VA',
    website: 'https://www.boeing.com/defense',
    employees: 172000,
    revenue_b: 22.0,
    description: 'Boeing Defense, Space & Security is one of the world\'s largest defense, space, and security businesses. It develops military aircraft, missile defense systems, satellite systems, and cybersecurity products. Major programs include the F/A-18 Super Hornet, P-8 Poseidon, AH-64 Apache, KC-46 Pegasus, and Ground-based Midcourse Defense.',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Boeing_full_logo.svg/320px-Boeing_full_logo.svg.png',
    focus_areas: ['Combat Aircraft', 'Vertical Lift', 'Autonomous Systems', 'Space & Satellites'],
  },
  {
    legal_name: 'RTX CORPORATION',
    name: 'RTX Corporation',
    ticker: 'RTX',
    headquarters: 'Arlington, VA',
    website: 'https://www.rtx.com',
    employees: 185000,
    revenue_b: 68.9,
    description: 'RTX Corporation (formerly Raytheon Technologies) is a premier aerospace and defense company. Through its Raytheon, Pratt & Whitney, and Collins Aerospace businesses, RTX delivers advanced systems and services for commercial, military, and government customers. Key systems include Patriot missile defense, StormBreaker smart bomb, and F135 jet engine.',
    logo_url: null,
    focus_areas: ['Missiles & Munitions', 'Propulsion', 'Avionics & Sensors', 'Missile Defense'],
  },
  {
    legal_name: 'NORTHROP GRUMMAN SYSTEMS CORPORATION',
    name: 'Northrop Grumman',
    ticker: 'NOC',
    headquarters: 'Falls Church, VA',
    website: 'https://www.northropgrumman.com',
    employees: 101000,
    revenue_b: 39.3,
    description: 'Northrop Grumman is a global aerospace and defense technology company. It delivers innovative systems and solutions for government and commercial customers worldwide, with major programs including the B-21 Raider stealth bomber, E-2D Hawkeye, James Webb Space Telescope, and Sentinel ICBM modernization. A leader in autonomous systems, cyber, and C4ISR.',
    logo_url: null,
    focus_areas: ['Aeronautics', 'Space Systems', 'Mission Systems', 'Cyber & C4ISR'],
  },
  {
    legal_name: 'GENERAL DYNAMICS LAND SYSTEMS INC.',
    name: 'General Dynamics',
    ticker: 'GD',
    headquarters: 'Reston, VA',
    website: 'https://www.gd.com',
    employees: 106700,
    revenue_b: 42.3,
    description: 'General Dynamics is a global aerospace and defense company offering a broad portfolio of products and services in business aviation, ship construction and repair, land combat vehicles, weapons systems, and technology products and services. Major programs include the M1 Abrams tank, Virginia-class submarine, Stryker vehicle, and Gulfstream business jets.',
    logo_url: null,
    focus_areas: ['Combat Systems', 'Marine Systems', 'IT & Intelligence', 'Aerospace'],
  },
  {
    legal_name: 'L3HARRIS TECHNOLOGIES, INC.',
    name: 'L3Harris Technologies',
    ticker: 'LHX',
    headquarters: 'Melbourne, FL',
    website: 'https://www.l3harris.com',
    employees: 50000,
    revenue_b: 21.3,
    description: 'L3Harris Technologies is an agile global aerospace and defense technology innovator, delivering end-to-end solutions that meet customers\' mission-critical needs. The company provides advanced defense and commercial technologies across Space, Air, Land, Sea, and Cyber domains. Key capabilities include ISR systems, tactical radios, night vision, and electronic warfare.',
    logo_url: null,
    focus_areas: ['Space & Intelligence', 'Communication Systems', 'Aviation Systems', 'Electronic Warfare'],
  },
  {
    legal_name: 'HUNTINGTON INGALLS INCORPORATED',
    name: 'Huntington Ingalls Industries',
    ticker: 'HII',
    headquarters: 'Newport News, VA',
    website: 'https://www.huntingtoningalls.com',
    employees: 44000,
    revenue_b: 11.5,
    description: 'Huntington Ingalls Industries is America\'s largest military shipbuilding company, the sole designer, builder and refueler of nuclear-powered aircraft carriers, and one of two providers of nuclear-powered submarines to the U.S. Navy. Through its Mission Technologies division, it also delivers advanced IT, engineering, and technical services to defense and federal customers.',
    logo_url: null,
    focus_areas: ['Aircraft Carriers', 'Nuclear Submarines', 'Surface Combatants', 'Mission Technologies'],
  },
  {
    legal_name: 'LEIDOS, INC.',
    name: 'Leidos',
    ticker: 'LDOS',
    headquarters: 'Reston, VA',
    website: 'https://www.leidos.com',
    employees: 47000,
    revenue_b: 15.4,
    description: 'Leidos is a FORTUNE 500 science and technology solutions leader working to address some of the world\'s toughest challenges in defense, intelligence, civil, and health markets. The company focuses on advanced technology solutions in areas such as advanced ISR, C4ISR, cybersecurity, logistics, training, and IT services.',
    logo_url: null,
    focus_areas: ['Defense Solutions', 'Intelligence', 'Civil', 'Health'],
  },
  {
    legal_name: 'BAE SYSTEMS LAND & ARMAMENTS L.P.',
    name: 'BAE Systems',
    ticker: 'BA.L',
    headquarters: 'Falls Church, VA',
    website: 'https://www.baesystems.com/en-us',
    employees: 107500,
    revenue_b: 28.3,
    description: 'BAE Systems is a global defence, aerospace, and security company. In the U.S., BAE Systems designs, develops, produces, and supports advanced defense systems across combat vehicles, naval ships, munitions, electronic systems, and cyber/intelligence solutions. Major U.S. programs include Bradley IFV upgrades, Paladin howitzer, and M109A7.',
    logo_url: null,
    focus_areas: ['Combat Vehicles', 'Electronic Systems', 'Cyber & Intelligence', 'Platforms & Services'],
  },
  {
    legal_name: 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION',
    name: 'SAIC',
    ticker: 'SAIC',
    headquarters: 'Reston, VA',
    website: 'https://www.saic.com',
    employees: 24000,
    revenue_b: 7.5,
    description: 'SAIC is a premier technology integrator providing full life-cycle services and solutions in the technical, engineering, intelligence, and enterprise information technology markets. SAIC is the government\'s trusted partner for IT modernization and digital transformation, with deep expertise in network operations, cybersecurity, software development, and systems engineering.',
    logo_url: null,
    focus_areas: ['IT Modernization', 'Cybersecurity', 'Systems Engineering', 'Digital Transformation'],
  },
  {
    legal_name: 'BOOZ ALLEN HAMILTON INC.',
    name: 'Booz Allen Hamilton',
    ticker: 'BAH',
    headquarters: 'McLean, VA',
    website: 'https://www.boozallen.com',
    employees: 33300,
    revenue_b: 10.7,
    description: 'Booz Allen Hamilton is a leading provider of management consulting, technology, and engineering services to the U.S. government in defense, intelligence, and civil sectors. The firm combines modern analytics, digital solutions, engineering, and cyber capabilities with decades of domain expertise and a culture of innovation to deliver mission outcomes.',
    logo_url: null,
    focus_areas: ['Analytics & AI', 'Cybersecurity', 'Digital Solutions', 'Engineering'],
  },
  {
    legal_name: 'KBR SERVICES, LLC',
    name: 'KBR',
    ticker: 'KBR',
    headquarters: 'Houston, TX',
    website: 'https://www.kbr.com',
    employees: 37000,
    revenue_b: 6.9,
    description: 'KBR is a global provider of science, technology, and engineering solutions to governments and companies around the world. KBR\'s Government Services business provides professional services, project management, and integrated base operations support across DoD, intelligence community, NASA, and other federal agencies.',
    logo_url: null,
    focus_areas: ['Professional Services', 'Science & Space', 'Sustainment', 'Base Operations'],
  },
  {
    legal_name: 'AMENTUM SERVICES, INC.',
    name: 'Amentum',
    ticker: null,
    headquarters: 'Germantown, MD',
    website: 'https://www.amentum.com',
    employees: 65000,
    revenue_b: 13.5,
    description: 'Amentum is a premier global government services provider supporting critical missions across defense, intelligence, energy, and environment markets. The company offers technical and engineering services across the full project life cycle, specializing in operations & maintenance, nuclear services, environmental management, and program management.',
    logo_url: null,
    focus_areas: ['Operations & Maintenance', 'Nuclear Services', 'Environmental', 'Defense & Intel'],
  },
  {
    legal_name: 'ELECTRIC BOAT CORPORATION',
    name: 'Electric Boat',
    ticker: null,
    headquarters: 'Groton, CT',
    website: 'https://www.gdeb.com',
    employees: 22000,
    revenue_b: 9.5,
    description: 'Electric Boat, a subsidiary of General Dynamics, is the primary designer and builder of U.S. Navy nuclear-powered submarines. Electric Boat is responsible for the Virginia-class attack submarine program and leads development of the Columbia-class ballistic missile submarine, the Navy\'s top acquisition priority.',
    logo_url: null,
    focus_areas: ['Nuclear Submarines', 'Columbia-class SSBN', 'Virginia-class SSN', 'Submarine Lifecycle'],
  },
  {
    legal_name: 'SIKORSKY AIRCRAFT CORPORATION',
    name: 'Sikorsky',
    ticker: null,
    headquarters: 'Stratford, CT',
    website: 'https://www.lockheedmartin.com/sikorsky',
    employees: 15000,
    revenue_b: 5.8,
    description: 'Sikorsky, a Lockheed Martin Company, develops and manufactures military and commercial helicopters and rotary-wing aircraft. Key programs include the UH-60 Black Hawk, CH-53K King Stallion, SB>1 DEFIANT, and MH-60R Seahawk. Sikorsky also leads the Future Long Range Assault Aircraft (FLRAA) competition with the DEFIANT X design.',
    logo_url: null,
    focus_areas: ['Rotary Wing', 'Black Hawk Family', 'Naval Helicopters', 'Future Vertical Lift'],
  },
  {
    legal_name: 'GENERAL ATOMICS AERONAUTICAL SYSTEMS, INC.',
    name: 'General Atomics',
    ticker: null,
    headquarters: 'San Diego, CA',
    website: 'https://www.ga.com',
    employees: 16000,
    revenue_b: 3.2,
    description: 'General Atomics is a privately held defense and diversified technologies company. GA Aeronautical Systems is the world leader in Unmanned Aircraft Systems (UAS), developing the iconic MQ-1 Predator, MQ-9 Reaper, and next-generation MQ-9B SkyGuardian. GA also leads in electromagnetic aircraft launch systems (EMALS), hypervelocity railguns, and fusion energy research.',
    logo_url: null,
    focus_areas: ['Unmanned Systems', 'EMALS/AAG', 'Multi-Domain ISR', 'Advanced Energy'],
  },
  {
    legal_name: 'BATH IRON WORKS CORPORATION',
    name: 'Bath Iron Works',
    ticker: null,
    headquarters: 'Bath, ME',
    website: 'https://www.gdbiw.com',
    employees: 7800,
    revenue_b: 2.1,
    description: 'Bath Iron Works (BIW), a subsidiary of General Dynamics, is a leading designer and builder of U.S. Navy surface combatants. BIW constructs Arleigh Burke-class (DDG-51) guided-missile destroyers and has been building warships for the Navy for over 130 years. The shipyard is a critical element of America\'s naval industrial base.',
    logo_url: null,
    focus_areas: ['Destroyers', 'DDG-51 Arleigh Burke', 'Surface Combatants', 'Ship Repair'],
  },
  {
    legal_name: 'RAYTHEON COMPANY',
    name: 'Raytheon',
    ticker: 'RTX',
    headquarters: 'Tucson, AZ',
    website: 'https://www.rtx.com/raytheon',
    employees: 40000,
    revenue_b: 24.0,
    description: 'Raytheon, a business of RTX, is a defense technology leader known for developing missiles, munitions, and advanced weapons systems. Key programs include the Patriot air defense system, SM-3 Standard Missile, Tomahawk cruise missile, AIM-120 AMRAAM, StormBreaker, and the Next Generation Interceptor (NGI) for homeland defense.',
    logo_url: null,
    focus_areas: ['Missiles & Munitions', 'Missile Defense', 'Electronic Warfare', 'Air & Space Defense'],
  },
  {
    legal_name: 'GENERAL DYNAMICS INFORMATION TECHNOLOGY, INC.',
    name: 'GDIT',
    ticker: null,
    headquarters: 'Fairfax, VA',
    website: 'https://www.gdit.com',
    employees: 30000,
    revenue_b: 5.4,
    description: 'General Dynamics Information Technology (GDIT) is a defense IT company that applies advanced data analytics, artificial intelligence, cybersecurity, cloud computing, and software development to solve the most complex and sensitive challenges facing the U.S. government. GDIT provides IT services across defense, intelligence, federal civilian, and health markets.',
    logo_url: null,
    focus_areas: ['Cloud & Infrastructure', 'AI & Analytics', 'Cybersecurity', 'Software Development'],
  },
  {
    legal_name: 'PERATON INC.',
    name: 'Peraton',
    ticker: null,
    headquarters: 'Herndon, VA',
    website: 'https://www.peraton.com',
    employees: 24000,
    revenue_b: 7.0,
    description: 'Peraton is a national security company driving missions of consequence across the U.S. government. The company integrates advanced capabilities in space, air, land, sea, and cyberspace to deliver solutions for the hardest problems in defense, intelligence, civil, health, and state & local markets. Key customers include NSA, DISA, NRO, and military services.',
    logo_url: null,
    focus_areas: ['Space & Intelligence', 'Cyber Operations', 'Digital Transformation', 'Communications'],
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (getDatabase() as any).sql;

  // Create table if it doesn't exist
  await db`
    CREATE TABLE IF NOT EXISTS industry_companies (
      id          SERIAL PRIMARY KEY,
      legal_name  TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      ticker      TEXT,
      headquarters TEXT,
      website     TEXT,
      employees   INT,
      revenue_b   NUMERIC(8,1),
      description TEXT,
      logo_url    TEXT,
      focus_areas TEXT[],
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  let upserted = 0;
  const errors: string[] = [];

  for (const c of COMPANIES) {
    try {
      await db`
        INSERT INTO industry_companies
          (legal_name, name, ticker, headquarters, website, employees, revenue_b, description, logo_url, focus_areas)
        VALUES (
          ${c.legal_name}, ${c.name}, ${c.ticker ?? null}, ${c.headquarters},
          ${c.website}, ${c.employees}, ${c.revenue_b}, ${c.description},
          ${c.logo_url ?? null}, ${c.focus_areas}
        )
        ON CONFLICT (legal_name) DO UPDATE SET
          name         = EXCLUDED.name,
          ticker       = EXCLUDED.ticker,
          headquarters = EXCLUDED.headquarters,
          website      = EXCLUDED.website,
          employees    = EXCLUDED.employees,
          revenue_b    = EXCLUDED.revenue_b,
          description  = EXCLUDED.description,
          logo_url     = EXCLUDED.logo_url,
          focus_areas  = EXCLUDED.focus_areas
      `;
      upserted++;
    } catch (err: unknown) {
      errors.push(`${c.legal_name}: ${err instanceof Error ? err.message.slice(0, 100) : String(err)}`);
    }
  }

  return NextResponse.json({ upserted, total: COMPANIES.length, errors: errors.length ? errors : undefined });
}
