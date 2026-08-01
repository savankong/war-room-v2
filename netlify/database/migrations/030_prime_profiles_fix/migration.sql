-- Fix migration 029: convert contract_vehicles and services from text[] to JSONB object arrays
-- Component (CompanyVehicleRow / services renderer) expects objects with {name, description, ...}

-- Lockheed Martin
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','F-35 Joint Strike Fighter','description','Multi-role 5th-generation stealth fighter produced under Low-Rate Initial Production (LRIP) contracts for the Air Force, Navy, and Marine Corps.'),
    jsonb_build_object('name','IDIQ – Aeronautics','description','Indefinite-delivery, indefinite-quantity vehicle covering sustainment, modifications, and upgrades for Lockheed aeronautics platforms.'),
    jsonb_build_object('name','IDIQ – Missiles & Fire Control','description','Covers Hellfire, JASSM, HIMARS, and related missile/fire-control systems.'),
    jsonb_build_object('name','SBIRS GEO','description','Space-Based Infrared System geosynchronous satellites providing missile warning for the U.S. Space Force.'),
    jsonb_build_object('name','GPS III','description','Next-generation GPS satellite production contract, delivering improved accuracy and anti-jamming capabilities.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Aeronautics','description','Design, production, and sustainment of advanced combat aircraft including F-35, F-22, C-130, and U-2.'),
    jsonb_build_object('name','Missiles & Fire Control','description','Precision strike weapons, tactical missiles, air and missile defense systems, and fire control radars.'),
    jsonb_build_object('name','Rotary & Mission Systems','description','Sikorsky helicopters, ship/submarine combat systems, littoral combat ships, and C2 systems.'),
    jsonb_build_object('name','Space','description','Satellite systems, missile defense interceptors, hypersonic programs, and classified space programs.')
  )
) WHERE legal_name = 'LOCKHEED MARTIN CORPORATION';

-- Boeing Defense
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','F/A-18 Super Hornet Production','description','Multi-year procurement contract for F/A-18E/F Block III Super Hornets for the U.S. Navy and international customers.'),
    jsonb_build_object('name','P-8 Poseidon','description','Maritime patrol and reconnaissance aircraft program for the Navy, replacing the P-3 Orion fleet.'),
    jsonb_build_object('name','KC-46 Pegasus','description','Air refueling and strategic airlift tanker program for the U.S. Air Force under a fixed-price development contract.'),
    jsonb_build_object('name','AH-64 Apache','description','Attack helicopter production and remanufacture for the U.S. Army and Foreign Military Sales customers.'),
    jsonb_build_object('name','GMD – Ground-based Midcourse Defense','description','Homeland missile defense system operated on behalf of the Missile Defense Agency.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Combat Aircraft','description','F/A-18, EA-18G Growler, T-7A Red Hawk trainer, and MQ-25 unmanned refueler programs.'),
    jsonb_build_object('name','Vertical Lift','description','CH-47 Chinook heavy-lift helicopter production and sustainment for the Army.'),
    jsonb_build_object('name','Autonomous Systems','description','MQ-25 Stingray, ScanEagle, and other unmanned aerial and undersea systems.'),
    jsonb_build_object('name','Space & Satellites','description','Space Launch System (SLS), satellites, and missile defense solutions for government and commercial customers.')
  )
) WHERE legal_name = 'THE BOEING COMPANY';

-- RTX Corporation
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Patriot PAC-3','description','Phased Array Tracking Radar to Intercept on Target – advanced air and missile defense system deployed globally.'),
    jsonb_build_object('name','SM-3 Standard Missile','description','Ballistic missile interceptor launched from Aegis-equipped ships and Aegis Ashore sites.'),
    jsonb_build_object('name','Tomahawk Cruise Missile','description','All-weather, long-range precision strike cruise missile for the Navy and allied forces.'),
    jsonb_build_object('name','AIM-120 AMRAAM','description','Advanced Medium-Range Air-to-Air Missile, the world''s most capable and widely deployed air-to-air missile.'),
    jsonb_build_object('name','F135 Propulsion System','description','Engine powering all three variants of the F-35 Lightning II, produced by Pratt & Whitney.'),
    jsonb_build_object('name','NextGen Jammer','description','Airborne electronic attack system for the EA-18G Growler, replacing the legacy ALQ-99 system.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Missiles & Munitions','description','Precision strike weapons including Tomahawk, StormBreaker, JSOW, and Excalibur.'),
    jsonb_build_object('name','Propulsion','description','Pratt & Whitney fighter and helicopter engines — F135, F100, T700, and commercial derivatives.'),
    jsonb_build_object('name','Avionics & Sensors','description','Collins Aerospace cockpit systems, communications, ISR sensors, and cyber capabilities.'),
    jsonb_build_object('name','Missile Defense','description','Patriot, SM-3, SM-6, and NASAMS ground-based and shipboard missile defense systems.')
  )
) WHERE legal_name = 'RTX CORPORATION';

-- Northrop Grumman
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','B-21 Raider','description','Next-generation strategic stealth bomber for the U.S. Air Force under a cost-plus-incentive-fee contract.'),
    jsonb_build_object('name','E-2D Advanced Hawkeye','description','Carrier-based airborne early warning aircraft for the U.S. Navy.'),
    jsonb_build_object('name','Sentinel ICBM / GBSD','description','Ground-Based Strategic Deterrent — modernized ICBM replacing the Minuteman III for Air Force Global Strike Command.'),
    jsonb_build_object('name','Wideband Global SATCOM','description','Military communications satellites providing high-bandwidth connectivity for joint warfighters.'),
    jsonb_build_object('name','James Webb Space Telescope','description','Prime contractor for the world''s largest and most powerful space science telescope, deployed December 2021.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Aeronautics','description','Manned and unmanned aircraft including B-21, B-2, RQ-4 Global Hawk, and MQ-4C Triton.'),
    jsonb_build_object('name','Space Systems','description','Satellites, launch vehicles, missile warning systems, and hypersonic vehicles.'),
    jsonb_build_object('name','Mission Systems','description','C4ISR systems, electronic warfare, radar, and cyber capabilities.'),
    jsonb_build_object('name','Cyber & C4ISR','description','Advanced command and control, cybersecurity, and multi-domain operations solutions.')
  )
) WHERE legal_name = 'NORTHROP GRUMMAN SYSTEMS CORPORATION';

-- General Dynamics
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','M1 Abrams Tank','description','Multi-year Army procurement contract for M1A2 SEPv3 tanks and upgrade kits for U.S. and allied forces.'),
    jsonb_build_object('name','Virginia-class SSN','description','Nuclear-powered attack submarine production contract shared with Huntington Ingalls Industries.'),
    jsonb_build_object('name','Columbia-class SSBN','description','Next-generation ballistic missile submarine program, the Navy''s highest acquisition priority.'),
    jsonb_build_object('name','Stryker','description','Eight-wheeled armored fighting vehicle for Army brigade combat teams; multiple production variants.'),
    jsonb_build_object('name','Gulfstream G700 VIP/C-37','description','Executive transport aircraft used by senior DoD and government officials worldwide.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Combat Systems','description','M1 Abrams, Stryker, Hydra-Shok, M2 Bradley, and ammunition systems for ground combat.'),
    jsonb_build_object('name','Marine Systems','description','Virginia-class and Columbia-class submarines, surface combatants, and nuclear ship maintenance.'),
    jsonb_build_object('name','IT & Intelligence','description','GDIT provides IT modernization, cloud, AI/ML, and mission system support to federal agencies.'),
    jsonb_build_object('name','Aerospace','description','Gulfstream business jets and special mission aircraft for defense and government customers.')
  )
) WHERE legal_name = 'GENERAL DYNAMICS LAND SYSTEMS INC.';

-- L3Harris Technologies
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Wideband Global SATCOM','description','Military satellite communications ground terminals and payload support contracts.'),
    jsonb_build_object('name','AEHF Satellite Program','description','Advanced Extremely High Frequency satellite support — protected communications for nuclear command and control.'),
    jsonb_build_object('name','Night Vision Systems','description','Image intensifier tubes and thermal weapon sights fielded across all U.S. military services.'),
    jsonb_build_object('name','AN/PRC-163 Multiband Radio','description','Handheld tactical radio delivering broadband networking and voice for dismounted soldiers.'),
    jsonb_build_object('name','ECM Systems – DEWS','description','Directed energy and electronic warfare systems protecting aircraft and ground vehicles from threats.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Space & Intelligence','description','Satellite payloads, intelligence systems, and ground infrastructure for classified and unclassified missions.'),
    jsonb_build_object('name','Communication Systems','description','Tactical radios, SATCOM terminals, and waveforms enabling secure joint force communications.'),
    jsonb_build_object('name','Aviation Systems','description','ISR sensors, aircraft modification, pilot training systems, and aviation sustainment.'),
    jsonb_build_object('name','Electronic Warfare','description','Jamming systems, radar warning receivers, directed energy, and EW mission planning tools.')
  )
) WHERE legal_name = 'L3HARRIS TECHNOLOGIES, INC.';

-- Raytheon Company
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Patriot Air Defense','description','Integrated air and missile defense system production, fielding, and sustainment for the U.S. Army and 18 allied nations.'),
    jsonb_build_object('name','SM-6 Standard Missile','description','Multi-mission surface-to-air missile providing terminal missile defense, anti-surface, and over-the-horizon strike.'),
    jsonb_build_object('name','Tomahawk Block V','description','Upgraded cruise missile with Maritime Strike Tomahawk capability and enhanced targeting.'),
    jsonb_build_object('name','SPY-6 AMDR','description','Air and Missile Defense Radar for the Flight III Arleigh Burke destroyers — the most advanced naval radar ever built.'),
    jsonb_build_object('name','StormBreaker (SDB II)','description','Small Diameter Bomb II — tri-mode seeker precision glide bomb capable of defeating moving targets in adverse weather.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Missiles & Munitions','description','Air-to-air, air-to-ground, and surface-to-air precision munitions for all services.'),
    jsonb_build_object('name','Missile Defense','description','Patriot, SM-3, SM-6, NASAMS, and THAAD radar integration for layered missile defense.'),
    jsonb_build_object('name','Electronic Warfare','description','Jamming systems, radar warning receivers, and cyber electromagnetic activities (CEMA).'),
    jsonb_build_object('name','Air & Space Defense','description','Radars, sensors, battle management systems, and C2 for integrated air and missile defense.')
  )
) WHERE legal_name = 'RAYTHEON COMPANY';

-- Huntington Ingalls Industries
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Gerald R. Ford-class CVN','description','Nuclear-powered aircraft carrier construction at Newport News Shipbuilding — the Navy''s most capable carriers.'),
    jsonb_build_object('name','Virginia-class SSN','description','Fast-attack nuclear submarine construction at Newport News alongside General Dynamics Electric Boat.'),
    jsonb_build_object('name','Arleigh Burke DDG','description','Guided-missile destroyer construction at Ingalls Shipbuilding in Pascagoula, MS.'),
    jsonb_build_object('name','Legend-class NSC','description','National Security Cutter construction for the U.S. Coast Guard.'),
    jsonb_build_object('name','Mission Technologies IDIQ','description','IT, cybersecurity, and mission support services delivered by HII''s Mission Technologies division.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Aircraft Carriers','description','Design, construction, refueling, and complex overhaul of nuclear-powered aircraft carriers.'),
    jsonb_build_object('name','Nuclear Submarines','description','Virginia-class and Columbia-class submarine construction, maintenance, and crew training.'),
    jsonb_build_object('name','Surface Combatants','description','Arleigh Burke destroyers, amphibious assault ships, and Coast Guard cutters.'),
    jsonb_build_object('name','Mission Technologies','description','C5ISR, cybersecurity, AI/ML analytics, and live-virtual-constructive training for defense agencies.')
  )
) WHERE legal_name = 'HUNTINGTON INGALLS INCORPORATED';

-- Electric Boat (GD subsidiary)
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Virginia-class SSN Block V','description','Attack submarine production contract, including Virginia Payload Module adding 28 additional VLS cells.'),
    jsonb_build_object('name','Columbia-class SSBN','description','Lead design agent for the Navy''s next ballistic missile submarine, the nation''s highest acquisition priority.'),
    jsonb_build_object('name','Submarine Lifecycle Support','description','Overhaul, refueling, and life-extension work on all active Navy nuclear submarines.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Nuclear Attack Submarines','description','Design and construction of Virginia-class SSNs at the Groton, CT facility.'),
    jsonb_build_object('name','Ballistic Missile Submarines','description','Lead design and construction partner for Columbia-class SSBN program.'),
    jsonb_build_object('name','Submarine Sustainment','description','Overhaul, repair, and modernization of attack and ballistic missile submarines.')
  )
) WHERE legal_name = 'ELECTRIC BOAT CORPORATION';

-- Leidos
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','NGEN-R Service Management, Integration & Transport','description','$7.7B Navy/Marine Corps next-generation enterprise network contract providing end-to-end IT services.'),
    jsonb_build_object('name','DHMSM – MHS GENESIS','description','Defense Healthcare Management System Modernization — DoD''s electronic health record deployed globally.'),
    jsonb_build_object('name','GSA OASIS+','description','Multi-agency professional services IDIQ vehicle covering management consulting, engineering, and logistics.'),
    jsonb_build_object('name','ITES-3S (Army IT)','description','Information Technology Enterprise Solutions for Services — Army enterprise IT support and integration.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Defense & Intelligence','description','ISR systems, missile defense, directed energy, and classified mission systems for DoD and IC.'),
    jsonb_build_object('name','Civil & Health','description','IT modernization, health IT, and analytics for DHS, HHS, VA, and civilian agencies.'),
    jsonb_build_object('name','Intelligence & National Security','description','Advanced solutions for the intelligence community including data analytics, AI, and system integration.'),
    jsonb_build_object('name','Commercial Energy','description','Power delivery modernization, smart grid, and utility infrastructure services.')
  )
) WHERE legal_name = 'LEIDOS, INC.';

-- Amentum
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','LOGCAP V','description','Logistics Civil Augmentation Program — Army''s primary vehicle for theater logistics and base operations support worldwide.'),
    jsonb_build_object('name','Mission Support Alliance (MSC)','description','Hanford Site nuclear cleanup and infrastructure operations for the Department of Energy.'),
    jsonb_build_object('name','AFCAP V','description','Air Force Contract Augmentation Program for contingency construction and base support.'),
    jsonb_build_object('name','NAVSEA Nuclear Support','description','Technical and maintenance support for the Navy''s nuclear propulsion program.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Operations & Maintenance','description','Base operations, facilities management, and life-cycle sustainment for military installations worldwide.'),
    jsonb_build_object('name','Nuclear & Environmental','description','Nuclear facility operation, deactivation, and decommissioning at DOE and DoD sites.'),
    jsonb_build_object('name','Engineering & Technology','description','Systems engineering, program management, and technology insertion for defense programs.'),
    jsonb_build_object('name','Contingency & Logistics','description','Rapid-response logistics, theater support, and base camp operations in austere environments.')
  )
) WHERE legal_name = 'AMENTUM SERVICES, INC.';

-- BAE Systems
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','M109A7 Paladin Self-Propelled Howitzer','description','155mm self-propelled artillery system modernization for the U.S. Army.'),
    jsonb_build_object('name','Bradley IFV Modernization','description','Infantry Fighting Vehicle upgrades and new-build production for Army brigade combat teams.'),
    jsonb_build_object('name','AMPV – Armored Multi-Purpose Vehicle','description','Replacement for the M113 family of vehicles providing protected mobility for the Army.'),
    jsonb_build_object('name','F-35 Distributed Aperture System','description','360-degree situational awareness system integrated on every F-35 variant.'),
    jsonb_build_object('name','Electronic Systems IDIQ','description','Electronic warfare, tactical communications, and intelligence systems contracts.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Combat Vehicles','description','M109 Paladin, Bradley, AMPV, and CV90 armored vehicle production and upgrades.'),
    jsonb_build_object('name','Electronic Systems','description','Electronic warfare, avionics, HUD systems, and threat countermeasures.'),
    jsonb_build_object('name','Platforms & Services','description','Ship repair, aircraft maintenance, and defense services for the Royal Navy and U.S. Navy.'),
    jsonb_build_object('name','Intelligence & Security','description','Cyber, intelligence analysis, and C2 systems for DoD and intelligence community customers.')
  )
) WHERE legal_name = 'BAE SYSTEMS LAND & ARMAMENTS L.P.';

-- Booz Allen Hamilton
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','DISA GSM-O II','description','Global Solutions Management – Operations II: $11.7B DISA IT infrastructure and cyber operations contract.'),
    jsonb_build_object('name','NGA ADVANCE','description','Geospatial intelligence analytics, systems engineering, and operations support for the National Geospatial-Intelligence Agency.'),
    jsonb_build_object('name','Army ITES-3S','description','IT enterprise solutions supporting Army networks, cybersecurity, and digital transformation.'),
    jsonb_build_object('name','GSA OASIS+','description','Multi-agency IDIQ vehicle for professional and technical services across the federal government.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Defense & Intelligence','description','AI/ML, analytics, and systems integration for DoD combatant commands and intelligence agencies.'),
    jsonb_build_object('name','Cyber','description','Defensive cyber operations, threat hunting, and cyber engineering for military and civilian agencies.'),
    jsonb_build_object('name','Digital Solutions','description','Cloud migration, DevSecOps, and enterprise IT modernization across the federal enterprise.'),
    jsonb_build_object('name','Consulting','description','Strategy, organizational performance, and management consulting for defense and national security missions.')
  )
) WHERE legal_name = 'BOOZ ALLEN HAMILTON INC.';

-- SAIC
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','GSA OASIS+','description','Unrestricted and small-business professional services IDIQ covering all NAICS technical service codes.'),
    jsonb_build_object('name','DISA SCTS','description','Storage, Computing, and Telecommunications Services supporting DISA global infrastructure.'),
    jsonb_build_object('name','SPAWAR IT Infrastructure','description','Navy space and naval warfare systems IT network and infrastructure operations.'),
    jsonb_build_object('name','Air Force Life Cycle Management','description','Engineering, sustainment, and modernization support for Air Force weapon systems.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Defense Systems','description','C4ISR, weapons systems engineering, vehicle integration, and sustainment for the Army and Marine Corps.'),
    jsonb_build_object('name','Digital & IT','description','Cloud, DevSecOps, cybersecurity, and enterprise IT modernization for DoD and civilian agencies.'),
    jsonb_build_object('name','Mission Technology','description','Space systems, AI/ML, and advanced analytics for national security and intelligence missions.'),
    jsonb_build_object('name','Government Health','description','Health IT, logistics, and administrative support for military health and VA programs.')
  )
) WHERE legal_name = 'SCIENCE APPLICATIONS INTERNATIONAL CORPORATION';

-- Peraton
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','NASA SEWP V','description','Solutions for Enterprise-Wide Procurement — government-wide IT hardware and services vehicle.'),
    jsonb_build_object('name','IC Enterprise IT (ITES)','description','Intelligence community enterprise IT support covering network, cloud, and cyber operations.'),
    jsonb_build_object('name','DHS EAGLE II','description','Enterprise Acquisition Gateway for Leading-Edge Solutions II — DHS IT services IDIQ.'),
    jsonb_build_object('name','DoD C5ISR Services','description','Command, control, communications, computers, cyber, intelligence, surveillance, and reconnaissance support contracts.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Space & Intelligence','description','Satellite operations, ground systems, and intelligence community mission support.'),
    jsonb_build_object('name','Cyber & Digital','description','Cybersecurity operations, zero trust architecture, and digital engineering solutions.'),
    jsonb_build_object('name','C5ISR Systems','description','Communications, ISR platform integration, and mission systems for joint warfighters.'),
    jsonb_build_object('name','Enterprise IT','description','Cloud, ERP modernization, and managed services across DoD and civilian agency customers.')
  )
) WHERE legal_name = 'PERATON INC.';

-- GDIT (General Dynamics IT)
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Alliant 2','description','$50B GSA government-wide IT solutions IDIQ — one of GDIT''s primary multi-agency contract vehicles.'),
    jsonb_build_object('name','Army ITES-3S','description','IT enterprise solutions supporting Army networks, cybersecurity, and help desk operations.'),
    jsonb_build_object('name','DISA JEDI / JWCC','description','Joint Warfighting Cloud Capability — multi-cloud support for DoD classified and unclassified workloads.'),
    jsonb_build_object('name','DHS EAGLE II','description','DHS enterprise IT solutions and professional services IDIQ vehicle.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Cloud & Digital Transformation','description','Multi-cloud migration, DevSecOps pipelines, and AI/ML platform services for federal agencies.'),
    jsonb_build_object('name','Cybersecurity','description','Zero trust implementation, SOC operations, vulnerability management, and SIEM/SOAR services.'),
    jsonb_build_object('name','Enterprise IT','description','Managed IT services, service desk, network operations, and end-user device management.'),
    jsonb_build_object('name','Application Development','description','Custom software development, legacy modernization, and Agile program delivery for DoD.')
  )
) WHERE legal_name = 'GENERAL DYNAMICS INFORMATION TECHNOLOGY, INC.';

-- Sikorsky Aircraft
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','UH-60 Black Hawk Multi-Year','description','Multi-year Army procurement contract for UH-60M Black Hawk utility helicopters and variants.'),
    jsonb_build_object('name','CH-53K King Stallion','description','Heavy-lift helicopter production for the Marine Corps — the most powerful helicopter in the U.S. inventory.'),
    jsonb_build_object('name','MH-60R/S Seahawk','description','Navy maritime helicopter production for anti-submarine warfare and logistics support.'),
    jsonb_build_object('name','Combat Rescue Helicopter (HH-60W)','description','Air Force combat search and rescue helicopter replacing the HH-60G Pave Hawk.'),
    jsonb_build_object('name','Presidential Helicopter VH-92A','description','Production contract for the Marine One replacement helicopter for the Executive Transport fleet.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Military Rotorcraft','description','Black Hawk, Seahawk, King Stallion, and Jayhawk helicopters for all U.S. military services.'),
    jsonb_build_object('name','Special Mission Aircraft','description','VH-92A Presidential transport, combat search and rescue, and special operations variants.'),
    jsonb_build_object('name','Sustainment & Training','description','Fleet-wide maintenance, modifications, pilot/crew training, and performance-based logistics.'),
    jsonb_build_object('name','Commercial Aviation','description','S-76, S-92, and S-300 helicopters for offshore energy, emergency medical services, and VIP transport.')
  )
) WHERE legal_name = 'SIKORSKY AIRCRAFT CORPORATION';

-- KBR
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','LOGCAP IV','description','Logistics Civil Augmentation Program IV — base operations, construction, and logistics in Southwest Asia.'),
    jsonb_build_object('name','AFCAP V','description','Air Force Contract Augmentation Program for rapid contingency response and base support services.'),
    jsonb_build_object('name','NASA JSC Engineering','description','Technical and engineering services for NASA Johnson Space Center human spaceflight programs.'),
    jsonb_build_object('name','DoE Environmental IDIQ','description','Nuclear cleanup, decontamination, and environmental restoration at DOE legacy sites.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Government Services','description','Base operations, logistics, facilities maintenance, and contingency support for global military installations.'),
    jsonb_build_object('name','Science & Space','description','Human spaceflight systems engineering, mission operations, and advanced technology for NASA.'),
    jsonb_build_object('name','Sustainable Technology','description','Clean energy, emissions reduction, and environmental engineering for industrial and government clients.'),
    jsonb_build_object('name','Engineering & Construction','description','Large-scale engineering, procurement, and construction for defense, energy, and industrial projects.')
  )
) WHERE legal_name = 'KBR, INC.';

-- General Atomics
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','MQ-9 Reaper','description','Remotely Piloted Aircraft System production and sustainment for the Air Force, Army, and allied nations.'),
    jsonb_build_object('name','MQ-1C Gray Eagle','description','Army unmanned aircraft system for reconnaissance, surveillance, target acquisition, and strike missions.'),
    jsonb_build_object('name','Electromagnetic Aircraft Launch System (EALS)','description','EMALS and Advanced Arresting Gear systems for Ford-class aircraft carriers.'),
    jsonb_build_object('name','Nuclear Fuel Cycle','description','Uranium enrichment and fuel fabrication for commercial and government reactors under DOE contracts.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Aeronautical Systems','description','MQ-9 Reaper, MQ-1C Gray Eagle, and Avenger UAS production, sustainment, and operator training.'),
    jsonb_build_object('name','Defense Technologies','description','Directed energy weapons, electromagnetic systems, and advanced munitions development.'),
    jsonb_build_object('name','Nuclear Energy','description','Uranium enrichment, fuel fabrication, reactor design, and nuclear materials processing.'),
    jsonb_build_object('name','Space & Sensors','description','Satellite sensors, ISR payloads, and space situational awareness systems.')
  )
) WHERE legal_name = 'GENERAL ATOMICS';

-- Bath Iron Works
UPDATE industry_companies SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
  'contract_vehicles', jsonb_build_array(
    jsonb_build_object('name','Arleigh Burke DDG-51 Production','description','Multi-year contract for guided-missile destroyer construction at the Bath, ME shipyard.'),
    jsonb_build_object('name','Zumwalt-class DDG-1000','description','Stealth guided-missile destroyer construction — three ships built at Bath Iron Works.'),
    jsonb_build_object('name','DDG-51 Restart and Follow-On','description','Production restart contract following the 2009 program gap, establishing multi-year procurement.'),
    jsonb_build_object('name','Ship Repair & Modernization','description','Availability and depot-level maintenance for U.S. Navy surface combatants.')
  ),
  'services', jsonb_build_array(
    jsonb_build_object('name','Destroyer Construction','description','Arleigh Burke Flight III and Zumwalt-class guided-missile destroyers for the U.S. Navy.'),
    jsonb_build_object('name','Ship Modernization','description','Combat system upgrades, phased maintenance availabilities, and life-extension work.'),
    jsonb_build_object('name','Engineering & Design','description','Naval architecture, systems integration, and design for next-generation surface combatants.'),
    jsonb_build_object('name','Production & Test','description','Integrated construction, outfitting, and sea trials for delivery to the U.S. Navy.')
  )
) WHERE legal_name = 'BATH IRON WORKS CORPORATION';
