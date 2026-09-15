-- Enrich major defense prime contractors with logos and mission statements
-- Covers $10B+ and $1B–$10B tiers in industry_companies table
-- Data sourced from company websites and Wikimedia Commons June 2026

ALTER TABLE industry_companies ADD COLUMN IF NOT EXISTS profile JSONB;

-- ── $10B+ Tier ────────────────────────────────────────────────────────────

-- Lockheed Martin ($62.1B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Lockheed_Martin_logo_%282011%E2%80%932022%29.svg',
  profile  = jsonb_build_object(
    'mission', 'We solve complex challenges, advance scientific discovery and deliver innovative solutions to help our customers keep people safe.',
    'contract_vehicles', ARRAY['F-35 JSF Program', 'LRIP Contracts', 'IDIQ – Aeronautics', 'IDIQ – Missiles & Fire Control', 'SBIRS GEO', 'GPS III'],
    'services', ARRAY['Aeronautics', 'Missiles & Fire Control', 'Rotary & Mission Systems', 'Space']
  )
WHERE legal_name = 'LOCKHEED MARTIN CORPORATION';

-- Boeing Defense ($16.5B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Boeing_full_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Connect, protect, explore and inspire the world through aerospace innovation.',
    'contract_vehicles', ARRAY['F/A-18 Production', 'P-8 Poseidon', 'KC-46 Pegasus', 'AH-64 Apache', 'GMD – Ground-based Midcourse Defense'],
    'services', ARRAY['Combat Aircraft', 'Vertical Lift', 'Autonomous Systems', 'Space & Satellites']
  )
WHERE legal_name = 'THE BOEING COMPANY';

-- RTX Corporation ($19.8B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/3/30/RTX_Raytheon_Technologies_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'We are the world''s largest aerospace and defense company, delivering advanced systems for air, space, and cyber domains.',
    'contract_vehicles', ARRAY['Patriot PAC-3', 'SM-3 Standard Missile', 'Tomahawk', 'AIM-120 AMRAAM', 'F135 Engine', 'NextGen Jammer'],
    'services', ARRAY['Missiles & Munitions', 'Propulsion', 'Avionics & Sensors', 'Missile Defense']
  )
WHERE legal_name = 'RTX CORPORATION';

-- Northrop Grumman ($17.4B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/3/36/Northrop_Grumman_logo_blue-on-clear_2020.svg',
  profile  = jsonb_build_object(
    'mission', 'Defining possible — developing and integrating advanced defense technologies from air, land, sea, space, and cyber domains.',
    'contract_vehicles', ARRAY['B-21 Raider', 'E-2D Hawkeye', 'JSTARS', 'Sentinel ICBM', 'GBSD', 'James Webb Space Telescope'],
    'services', ARRAY['Aeronautics', 'Space Systems', 'Mission Systems', 'Cyber & C4ISR']
  )
WHERE legal_name = 'NORTHROP GRUMMAN SYSTEMS CORPORATION';

-- General Dynamics ($15.9B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/General_Dynamics_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Be Ready — delivering a broad portfolio of products, technologies and services for mission success across land, sea, air, and cyber.',
    'contract_vehicles', ARRAY['M1 Abrams Tank', 'Virginia-class SSN', 'Columbia-class SSBN', 'Stryker', 'Gulfstream G700'],
    'services', ARRAY['Combat Systems', 'Marine Systems', 'IT & Intelligence', 'Aerospace']
  )
WHERE legal_name = 'GENERAL DYNAMICS LAND SYSTEMS INC.';

-- L3Harris ($12.5B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/2/23/L3Harris_Technologies_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Trusted disruptive innovator — delivering end-to-end technology solutions at the intersection of aerospace, electronic systems, and communication.',
    'contract_vehicles', ARRAY['F108 Engine', 'Wideband Global SATCOM', 'AEHF', 'Night Vision Systems', 'ECM Systems', 'AN/PRC-163 Multiband Radio'],
    'services', ARRAY['Space & Intelligence', 'Communication Systems', 'Aviation Systems', 'Electronic Warfare']
  )
WHERE legal_name = 'L3HARRIS TECHNOLOGIES, INC.';

-- Raytheon ($14.6B DoD — RTX business)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/3/30/RTX_Raytheon_Technologies_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Creating solutions that keep people safe on land, sea, and in the air with cutting-edge missiles, radar, and electronic warfare systems.',
    'contract_vehicles', ARRAY['Patriot Air Defense', 'SM-6', 'Tomahawk Block V', 'AIM-9X Sidewinder', 'SPY-6 AMDR', 'StormBreaker'],
    'services', ARRAY['Missiles & Munitions', 'Missile Defense', 'Electronic Warfare', 'Air & Space Defense']
  )
WHERE legal_name = 'RAYTHEON COMPANY';

-- Huntington Ingalls ($10.2B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b9/HII_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Provide the Navy and Coast Guard the ships they need to accomplish their missions — for the nation''s security and freedom.',
    'contract_vehicles', ARRAY['Gerald R. Ford-class CVN', 'Virginia-class SSN', 'Arleigh Burke DDG', 'Legend-class NSC', 'Mission Technologies IDIQ'],
    'services', ARRAY['Aircraft Carriers', 'Nuclear Submarines', 'Surface Combatants', 'Mission Technologies']
  )
WHERE legal_name = 'HUNTINGTON INGALLS INCORPORATED';

-- ── $1B–$10B Tier ─────────────────────────────────────────────────────────

-- Electric Boat ($9.1B DoD — GD subsidiary)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/General_Dynamics_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Design and build nuclear-powered submarines that protect American freedom and advance national security.',
    'contract_vehicles', ARRAY['Virginia-class SSN Block V', 'Columbia-class SSBN', 'Attack Submarine Lifecycle Support'],
    'services', ARRAY['Nuclear Submarines', 'Columbia-class SSBN', 'Virginia-class SSN', 'Submarine Lifecycle Support']
  )
WHERE legal_name = 'ELECTRIC BOAT CORPORATION';

-- Leidos ($8.3B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Leidos_logo_2023.svg',
  profile  = jsonb_build_object(
    'mission', 'Make the world safer, healthier, and more efficient through information technology, engineering, and science solutions.',
    'contract_vehicles', ARRAY['DHMSM – Defense Healthcare', 'SETA – Missile Defense', 'ITES-3S Army IT', 'NGEN-R Navy IT', 'IDIQ – ISR Systems'],
    'services', ARRAY['Defense Solutions', 'Intelligence', 'Civil', 'Health']
  )
WHERE legal_name = 'LEIDOS, INC.';

-- Amentum ($8.1B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Amentum_Logo-RGB-Full_Color_H.svg',
  profile  = jsonb_build_object(
    'mission', 'Deliver solutions to the world''s most complex and critical challenges in defense, intelligence, energy, and environment.',
    'contract_vehicles', ARRAY['LOGCAP V Army Logistics', 'AFCAP Air Force', 'Worldwide Protective Services', 'Nuclear Cleanup IDIQ'],
    'services', ARRAY['Operations & Maintenance', 'Nuclear Services', 'Environmental', 'Defense & Intel']
  )
WHERE legal_name = 'AMENTUM SERVICES, INC.';

-- BAE Systems ($7.1B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/7/73/BAE_Systems_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Help our customers stay a step ahead when protecting people and national security, critical infrastructure, and vital information.',
    'contract_vehicles', ARRAY['M109A7 Paladin', 'Bradley IFV Upgrade', 'M88A2 HERCULES', 'CV90', 'Beowulf', 'Next Generation Combat Vehicle'],
    'services', ARRAY['Combat Vehicles', 'Electronic Systems', 'Cyber & Intelligence', 'Platforms & Services']
  )
WHERE legal_name = 'BAE SYSTEMS LAND & ARMAMENTS L.P.';

-- Booz Allen Hamilton ($6.4B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Booz_Allen_Hamilton_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Empower people to change the world by combining functional expertise with cutting-edge technology for defense and intelligence.',
    'contract_vehicles', ARRAY['NSA SITE III', 'Army Cyber IDIQ', 'DoD AI & Analytics IDIQ', 'DHS CDM', 'NASA SEWP V'],
    'services', ARRAY['Analytics & AI', 'Cybersecurity', 'Digital Solutions', 'Engineering']
  )
WHERE legal_name = 'BOOZ ALLEN HAMILTON INC.';

-- SAIC ($5.8B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/SAIC_Logo_2013-05-10.svg',
  profile  = jsonb_build_object(
    'mission', 'Make the world a safer and more connected place by delivering innovative solutions to government customers across defense and national security.',
    'contract_vehicles', ARRAY['AMCOM Express', 'SeaPort-NxG', 'ITES-3H Army IT', 'Air Force AFLCMC IT', 'GSA Alliant 2'],
    'services', ARRAY['IT Modernization', 'Cybersecurity', 'Systems Engineering', 'Digital Transformation']
  )
WHERE legal_name = 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION';

-- Peraton ($5.5B DoD)
UPDATE industry_companies SET
  logo_url = 'https://www.peraton.com/wp-content/uploads/2025_peraton-logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Perform missions of consequence in space, intelligence, cyber, and communications for the nation''s most critical missions.',
    'contract_vehicles', ARRAY['NASA End-to-End Services', 'DHS CDM', 'DISA SETI', 'NRO IT Modernization', 'GSA Alliant 2'],
    'services', ARRAY['Space & Intelligence', 'Cyber Operations', 'Digital Transformation', 'Communications']
  )
WHERE legal_name = 'PERATON INC.';

-- GDIT ($4.8B DoD — GD subsidiary)
UPDATE industry_companies SET
  logo_url = 'https://images.ctfassets.net/szx3os6exj55/5cf7WvmX1dxq03hXnlKBer/90999b9c690993129ca1fc5a1c7faf54/gdit-sht-lg-200x64px.png',
  profile  = jsonb_build_object(
    'mission', 'Apply advanced data analytics, AI, cybersecurity, cloud, and software development to solve the most complex government challenges.',
    'contract_vehicles', ARRAY['ITES-3S Army IT', 'GSA Alliant 2', 'Air Force NETCENTS-2', 'DHS USCIS ITMS', 'Army PaYS'],
    'services', ARRAY['Cloud & Infrastructure', 'AI & Analytics', 'Cybersecurity', 'Software Development']
  )
WHERE legal_name = 'GENERAL DYNAMICS INFORMATION TECHNOLOGY, INC.';

-- Sikorsky ($4.2B DoD — LM subsidiary)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Sikorsky_Aircraft_Logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Build the world''s best rotary wing aircraft for the warfighters and first responders who protect freedom.',
    'contract_vehicles', ARRAY['UH-60M Black Hawk MYP', 'CH-53K King Stallion', 'HH-60W Combat Rescue', 'MH-60R Seahawk', 'FLRAA – Future Long Range Assault Aircraft'],
    'services', ARRAY['Rotary Wing', 'Black Hawk Family', 'Naval Helicopters', 'Future Vertical Lift']
  )
WHERE legal_name = 'SIKORSKY AIRCRAFT CORPORATION';

-- KBR ($3.8B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/KBR_Logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Deliver science, technology and engineering solutions to governments and companies around the world, creating tomorrow today.',
    'contract_vehicles', ARRAY['LOGCAP IV Army Logistics', 'AFCAP IV', 'NASA JETS', 'MDA Systems Engineering', 'DARPA Research IDIQ'],
    'services', ARRAY['Professional Services', 'Science & Space', 'Sustainment', 'Base Operations']
  )
WHERE legal_name = 'KBR SERVICES, LLC';

-- General Atomics ($2.1B DoD)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/General_Atomics_Aeronautical_Systems_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Deliver world-class unmanned aircraft systems, electromagnetic launch technology, and advanced energy solutions for U.S. national security.',
    'contract_vehicles', ARRAY['MQ-9 Reaper FMS', 'MQ-9B SkyGuardian', 'EMALS/AAG CVN-78 Class', 'Lynx SAR', 'Certifiable Predator B'],
    'services', ARRAY['Unmanned Systems', 'EMALS/AAG', 'Multi-Domain ISR', 'Advanced Energy']
  )
WHERE legal_name = 'GENERAL ATOMICS AERONAUTICAL SYSTEMS, INC.';

-- Bath Iron Works ($2.0B DoD — GD subsidiary)
UPDATE industry_companies SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/General_Dynamics_logo.svg',
  profile  = jsonb_build_object(
    'mission', 'Build and maintain the finest surface combatants in the world for the United States Navy.',
    'contract_vehicles', ARRAY['DDG-51 Arleigh Burke Flight III', 'DDG-1000 Zumwalt', 'Surface Ship Overhaul & Repair'],
    'services', ARRAY['Destroyers', 'DDG-51 Arleigh Burke', 'Surface Combatants', 'Ship Repair']
  )
WHERE legal_name = 'BATH IRON WORKS CORPORATION';
