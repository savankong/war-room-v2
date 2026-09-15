-- Enrich government org profiles with mission, description, and website
-- Data sourced from official .mil/.gov websites June 2026

-- Air Force Research Laboratory
UPDATE orgs SET website = 'https://afrl.af.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Lead the discovery, development, and integration of warfighting technologies for air, space, and cyberspace forces.',
    'full_description', 'The Air Force Research Laboratory (AFRL) is the primary scientific research and development center for the Department of the Air Force, headquartered at Wright-Patterson AFB, Ohio. AFRL conducts research across nine technical directorates covering aerospace systems, directed energy, information, materials, munitions, sensors, space vehicles, propulsion, and human performance. Its work drives the technologies that underpin next-generation Air Force and Space Force capabilities.'
  )
WHERE id = 'afrl';

-- Air Force Life Cycle Management Center
UPDATE orgs SET website = 'https://aflcmc.af.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Develop, field, and sustain dominant aerospace systems and capabilities for the warfighter.',
    'full_description', 'The Air Force Life Cycle Management Center (AFLCMC), headquartered at Wright-Patterson AFB, Ohio, is the Air Force''s single enterprise program executive office for life cycle management of almost all Air Force and many joint aerospace weapon systems. AFLCMC manages acquisition, sustainment, and modernization of aircraft, engines, and associated systems from development through retirement. It is one of the largest organizations in the Department of the Air Force, managing a portfolio worth hundreds of billions of dollars.'
  )
WHERE id = 'aflcmc';

-- Air Force Nuclear Weapons Center
UPDATE orgs SET website = 'https://www.afnwc.af.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Deliver safe, secure, and effective nuclear capabilities to deter adversaries and assure allies.',
    'full_description', 'The Air Force Nuclear Weapons Center (AFNWC), headquartered at Kirtland AFB, New Mexico, serves as the Air Force''s single-manager for nuclear materiel and systems. AFNWC oversees acquisition, sustainment, and modernization of the Air Force''s nuclear weapons systems, including intercontinental ballistic missiles, nuclear-capable aircraft, and associated command-and-control infrastructure. It plays a central role in maintaining the credibility and safety of the U.S. nuclear deterrent.'
  )
WHERE id = 'afnwc';

-- Space Development Agency
UPDATE orgs SET website = 'https://www.sda.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Accelerate delivery of a proliferated low-Earth orbit satellite constellation to provide resilient, low-latency military communications and sensing.',
    'full_description', 'The Space Development Agency (SDA), located in El Segundo, California, was established in 2019 and transferred to the U.S. Space Force in 2022. SDA is responsible for developing and fielding the National Defense Space Architecture (NDSA), a layered constellation of small satellites in low-Earth orbit providing data transport, missile warning, and GPS-denied navigation for joint warfighters. SDA uses commercial acquisition approaches and rapid iterative development to field capabilities on two-year tranches.',
    'logo_url', 'https://www.sda.mil/wp-content/uploads/2021/03/SDA-Seal.png'
  )
WHERE id = 'sda';

-- Air Combat Command
UPDATE orgs SET website = 'https://www.acc.af.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Provide combat-ready forces to combatant commanders to conduct global aerospace operations.',
    'full_description', 'Air Combat Command (ACC), headquartered at Langley AFB, Virginia, is the primary provider of combat air forces to America''s warfighting commanders. ACC organizes, trains, equips, and maintains combat-ready forces for rapid deployment and employment across the full spectrum of conflict. As the Air Force component of U.S. Strategic Command, ACC is responsible for fighter, bomber, reconnaissance, battle management, and command-and-control aircraft.'
  )
WHERE id = 'af_acc';

-- DARPA
UPDATE orgs SET website = 'https://www.darpa.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Make pivotal investments in breakthrough technologies for national security.',
    'full_description', 'The Defense Advanced Research Projects Agency (DARPA), headquartered in Arlington, Virginia, is the central research and development organization of the Department of Defense responsible for developing emerging technologies for use by the military. Founded in 1958 in response to Sputnik, DARPA funds high-risk, high-reward research across domains including AI, hypersonics, biotechnology, cyber, space, and quantum computing. DARPA has produced foundational innovations including the internet (ARPANET), GPS, and stealth technology.'
  )
WHERE id = 'darpa';

-- DISA
UPDATE orgs SET website = 'https://www.disa.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Connect and protect the warfighter in cyberspace by providing resilient, globally accessible, end-to-end information capabilities.',
    'full_description', 'The Defense Information Systems Agency (DISA), headquartered at Fort Meade, Maryland, is a combat support agency that provides information technology and communications support to the President, Vice President, Secretary of Defense, the military services, and combatant commands. DISA manages the Department of Defense Information Network (DODIN) and operates critical command-and-control systems essential to DoD''s cyber defense and secure communications posture worldwide.'
  )
WHERE id = 'disa';

-- Defense Innovation Unit
UPDATE orgs SET website = 'https://www.diu.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Accelerate the adoption of commercial technology throughout the U.S. military to strengthen national security.',
    'full_description', 'The Defense Innovation Unit (DIU), headquartered in Mountain View, California, is the only DoD organization focused exclusively on fielding commercial technology at speed and scale. Established in 2015, DIU contracts directly with commercial companies using Other Transaction Authority (OTA) to prototype and field solutions in AI, autonomy, cyber, human systems, and space within 12–24 months. DIU acts as a bridge between Silicon Valley and the Pentagon, helping the military access cutting-edge technologies that would otherwise bypass traditional defense acquisition.',
    'logo_url', 'https://www.diu.mil/assets/img/diu-seal.png'
  )
WHERE id = 'diu';

-- Missile Defense Agency
UPDATE orgs SET website = 'https://www.mda.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Develop, test, and field an integrated, layered missile defense system to defend the U.S., its deployed forces, allies, and partners.',
    'full_description', 'The Missile Defense Agency (MDA), headquartered in Huntsville, Alabama, is a DoD agency responsible for developing, testing, and fielding a Ballistic Missile Defense System capable of defeating ballistic missiles of all ranges in all phases of flight. MDA oversees programs including Ground-based Midcourse Defense (GMD), Aegis BMD, Terminal High Altitude Area Defense (THAAD), and Patriot. It coordinates with military services and combatant commands to ensure integrated layered defenses.'
  )
WHERE id = 'mda';

-- CDAO
UPDATE orgs SET website = 'https://www.cdao.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Accelerate the DoD''s adoption of data, analytics, and artificial intelligence to generate decision advantage.',
    'full_description', 'The Chief Digital and Artificial Intelligence Office (CDAO), headquartered in Washington, D.C., was established in 2022 by consolidating the JAIC, the Defense Digital Service, the DoD Chief Data Officer, and the Advancing Analytics office. The CDAO is the principal advisor to the Secretary of Defense on matters related to AI and data, responsible for overseeing DoD''s data, analytics, and AI strategy. It manages the Advana analytics platform and DoD-wide AI adoption and policy programs.'
  )
WHERE id = 'cdao';

-- US Army Corps of Engineers
UPDATE orgs SET website = 'https://www.usace.army.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Deliver vital engineering services and capabilities to strengthen national security, energize the economy, and reduce disaster risk.',
    'full_description', 'The U.S. Army Corps of Engineers (USACE), headquartered in Washington, D.C., is a federal agency of approximately 37,000 civilian and military personnel providing engineering services and project management for the Army and Air Force installations worldwide. USACE manages civil works including navigation, flood risk reduction, and environmental restoration, and responds to natural disasters as the lead federal agency for emergency infrastructure support. USACE also executes major construction and contracting programs for DoD and other federal agencies.'
  )
WHERE id = 'usace';

-- Defense Logistics Agency
UPDATE orgs SET website = 'https://www.dla.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Provide effective and efficient global logistics support to America''s military forces in peace and war.',
    'full_description', 'The Defense Logistics Agency (DLA), headquartered at Fort Belvoir, Virginia, is the nation''s largest combat support agency providing worldwide logistics support in peacetime and wartime to the military services and other federal agencies. DLA manages the global supply chain for food, fuel, medical, clothing, construction, and spare parts — over 5 million items — and executes more than $40 billion in transactions annually. It also manages the disposition of excess DoD property and provides acquisition support services.'
  )
WHERE id = 'dla';

-- Army Research Laboratory
UPDATE orgs SET website = 'https://www.arl.army.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Discover, innovate, and transition science and technology to ensure dominant strategic land power.',
    'full_description', 'The Army Research Laboratory (ARL), headquartered in Adelphi, Maryland, is the Army''s corporate research laboratory and the largest laboratory in the Department of the Army. ARL conducts fundamental and applied research in areas including materials science, computational sciences, human sciences, sensors and electron devices, vehicle technology, and survivability. Its Open Campus initiative fosters collaboration with academia, industry, and other government agencies to accelerate scientific breakthroughs into Army-relevant capabilities.'
  )
WHERE id = 'army-research-lab';

-- Army Futures Command
UPDATE orgs SET website = 'https://www.armyfutures.army.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Modernize the Army by organizing and integrating all Army modernization efforts under a single command.',
    'full_description', 'Army Futures Command (AFC), headquartered in Austin, Texas, was established in 2018 as the Army''s newest four-star command dedicated to modernization. AFC manages the Army''s eight cross-functional teams focused on top modernization priorities including long-range precision fires, next-generation combat vehicles, future vertical lift, the network, air and missile defense, and soldier lethality. By co-locating with the innovation ecosystem in Austin and other tech hubs, AFC accelerates development and fielding of future Army capabilities.'
  )
WHERE id = 'army-futures';

-- NAVSEA
UPDATE orgs SET website = 'https://www.navsea.navy.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Design, build, deliver, and maintain ships, submarines, and combat systems that enable the Navy to meet the nation''s security needs.',
    'full_description', 'Naval Sea Systems Command (NAVSEA), headquartered at the Washington Navy Yard, is the largest of the Navy''s five system commands and manages more than one-third of the Navy''s budget. NAVSEA is responsible for the acquisition, design, construction, overhaul, repair, and modernization of all ships and submarines, as well as ship combat systems and components. It operates a network of naval shipyards, warfare centers, and field activities supporting the full lifecycle of the U.S. naval fleet.'
  )
WHERE id = 'navsea';

-- NAVAIR
UPDATE orgs SET website = 'https://www.navair.navy.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Provide full life-cycle support of naval aviation aircraft, weapons, and systems for the Navy and Marine Corps.',
    'full_description', 'Naval Air Systems Command (NAVAIR), headquartered at Naval Air Station Patuxent River, Maryland, provides full lifecycle support — research, design, development, test and evaluation, acquisition, and product support — for naval aviation aircraft, airborne weapon systems, avionics, and related systems. NAVAIR supports over 4,000 aircraft operated by the U.S. Navy and Marine Corps, managing programs ranging from F/A-18s and F-35s to unmanned systems and naval weapons.'
  )
WHERE id = 'navair';

-- Air Force Sustainment Center
UPDATE orgs SET website = 'https://www.afsc.af.mil',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission', 'Sustain and modernize Air Force weapon systems to ensure they are always ready to fly, fight, and win.',
    'full_description', 'The Air Force Sustainment Center (AFSC), headquartered at Tinker AFB, Oklahoma, is the Air Force''s primary logistics and sustainment command responsible for depot-level maintenance, repair, and overhaul of aircraft and associated systems. AFSC manages five air logistics complexes and provides worldwide aircraft sustainment services for bombers, tankers, fighters, and advanced aircraft systems. It is responsible for keeping the Air Force''s aging and new-generation fleets combat-ready and mission capable.'
  )
WHERE id = 'af_sustainment';
