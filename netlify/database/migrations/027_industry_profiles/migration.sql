-- Enrich Industry company profiles with mission, description, address, phone, website, logo
-- Data sourced from official company websites June 2026

-- Physical Sciences Inc.
UPDATE orgs SET
  website = 'https://www.psicorp.com',
  loc = '20 New England Business Center, Andover, MA 01810',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(978) 689-0003',
    'mission',          'Invent, demonstrate, and translate technologies that solve critical needs for our customers.',
    'full_description', 'Physical Sciences Inc. (PSI) develops advanced technologies across optical systems, sensors, propulsion, energetics, and materials for defense applications. The company specializes in CBRN detection systems, missile test equipment, and space systems supporting military modernization. With approximately 250 employee-owners, PSI serves defense and security markets through both fielded products and emerging prototype technologies.',
    'logo_url',         'https://www.psicorp.com/wp-content/uploads/2023/04/PSI-LogoArtboard-Logo-Color.svg'
  )
WHERE id = 'physical-sciences';

-- Triton Systems Inc.
UPDATE orgs SET
  website = 'https://tritonsystems.com',
  loc = '330 Billerica Road, Chelmsford, MA 01824',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(978) 250-4200',
    'mission',          'Driven to Innovate — creating mission-critical solutions for U.S. government and defense partners.',
    'full_description', 'Triton Systems is an agile defense contractor creating mission-critical solutions for the U.S. government and defense partners to strengthen national security and industrial resilience. The firm leverages cutting-edge innovations across homeland security, human health, and environmental sustainability. Triton specializes in rapid technology development from concept to prototype for military and government customers.',
    'logo_url',         'https://tritonsystems.com/wp-content/uploads/2022/06/New-Final-Logo.svg'
  )
WHERE id = 'triton-systems';

-- Corvid Technologies LLC
UPDATE orgs SET
  website = 'https://www.corvidtec.com',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission',          'Thinking Differently, Designing Faster, Building Smarter.',
    'full_description', 'Corvid Technologies is an employee-owned defense contractor specializing in advanced engineering solutions for national security. The company leverages elite talent, high-fidelity computational physics, advanced prototyping, and manufacturing to rapidly deliver end-to-end results. Corvid serves defense customers across advanced strike systems, missile defense, launch platforms, digital engineering, and range operations.'
  )
WHERE id = 'corvid-technologies';

-- Charles River Analytics Inc.
UPDATE orgs SET
  website = 'https://cra.com',
  loc = '625 Mt. Auburn St., Cambridge, MA 02138',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(617) 868-0780',
    'mission',          'Solutions to serve the warfighter, technology to serve the world.',
    'full_description', 'Charles River Analytics develops human-centered AI and autonomous systems to support military operations and national security. The company specializes in intelligent systems for warfighters, predictive maintenance using advanced AI, and robotics applications. Their research spans AI, autonomous systems, cybersecurity, and human-machine teaming with a focus on groundbreaking innovations that protect and empower the warfighter.'
  )
WHERE id = 'charles-river-analytics';

-- Arete Associates
UPDATE orgs SET
  website = 'https://arete.com',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission',          'Innovative Solutions To Our Nation''s Hardest Problems.',
    'full_description', 'Areté Associates develops advanced technologies across defense domains including space, aerospace, air, land, sea, and undersea operations. The company specializes in laser systems, counter-unmanned aircraft systems (counter-UAS), lidar technology, maritime surveillance, and software solutions. Their products support military and defense applications ranging from targeting and force protection to reconnaissance and threat detection.',
    'logo_url',         'https://arete.com/wp-content/uploads/2023/09/Component-1-–-1.png'
  )
WHERE id = 'arete';

-- Intellisense Systems Inc.
UPDATE orgs SET
  website = 'https://www.intellisenseinc.com',
  loc = '21041 S. Western Ave., Torrance, CA 90501',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(310) 320-1827',
    'mission',          'Agile, Innovative Solutions for defense electronics and environmental systems.',
    'full_description', 'Intellisense Systems develops and manufactures advanced defense electronics and environmental monitoring systems for military and aerospace applications. The company specializes in redesigning outdated systems through innovative replacements that enhance capabilities and extend platform lifespans. Their products include meteorological stations, avionics displays, and power management solutions that modernize Armed Forces operations.',
    'logo_url',         'https://eadn-wc01-7682670.nxedge.io/wp-content/uploads/2019/12/logo-color.svg'
  )
WHERE id = 'intellisense-systems';

-- TDA Research Inc.
UPDATE orgs SET
  website = 'https://www.tda-i.com',
  loc = '22299 Exploration Drive, Suite 200, Lexington Park, MD 20653',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(301) 866-9400',
    'mission',          'Solving meaningful, complex problems through extensive engineering expertise.',
    'full_description', 'TDA Research provides aeronautical engineering solutions primarily for military aircraft platforms, collaborating extensively with the U.S. Navy Aircraft Structures Division on fixed- and rotary-wing aircraft issues. Their solutions typically extend the useful life of aircraft by 10–25% through structural analysis and innovative engineering. TDA''s work supports fleet readiness and airworthiness while delivering significant cost savings to government operations.',
    'logo_url',         'https://tda-i.com/wp-content/uploads/2017/11/TDA_Site_Logo_20171109.jpg'
  )
WHERE id = 'tda-research';

-- Toyon Research Corporation
UPDATE orgs SET
  website = 'https://www.toyon.com',
  loc = '6800 Cortona Drive, Goleta, CA 93117',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(805) 968-6787',
    'mission',          'Nationally recognized small business performing technology development and defense systems analysis.',
    'full_description', 'Toyon Research Corporation is an employee-owned defense contractor that has supported more than 50 government and commercial customers on over 1,000 contracts since 1980. The company specializes in radar signal processing, electronic warfare, sensor systems, and systems analysis for the Department of Defense. With approximately 260 employees based in Goleta, California, Toyon delivers rigorous technical solutions across the full spectrum of defense research and development.'
  )
WHERE id = 'toyon-research';

-- Kitware Inc.
UPDATE orgs SET
  website = 'https://www.kitware.com',
  loc = '1712 Route 9, Suite 300, Clifton Park, NY 12065',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(518) 371-3971',
    'mission',          'Delivering innovation through customized software solutions for complex scientific challenges.',
    'full_description', 'Kitware develops AI testing and evaluation tools, computer vision systems, and advanced software solutions supporting defense and national security missions. The company collaborates with DARPA, the Department of Defense, and national laboratories to develop AI frameworks, autonomous systems, and data analytics platforms. Kitware''s open-source approach enables rapid deployment of cutting-edge algorithms for intelligence, surveillance, and reconnaissance applications.'
  )
WHERE id = 'kitware';

-- Creare LLC
UPDATE orgs SET
  website = 'https://www.creare.com',
  loc = '16 Great Hollow Rd, Hanover, NH 03755',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(603) 643-3800',
    'mission',          'Innovative technology and product development combining engineering judgment with sophisticated analytical and experimental methods.',
    'full_description', 'Creare develops advanced technologies for military and government applications, including cryogenic cooling systems for space-based defense platforms, hearing protection equipment for naval personnel, and manufacturing innovations that enhance defense system production. The firm has created solutions supporting missile tracking satellites, aircraft inspection technology for military aircraft production, and oxygen delivery systems for submarine rescue operations. Creare combines deep engineering expertise with hands-on experimental development to solve the most challenging technical problems.',
    'logo_url',         'https://www.creare.com/wp-content/uploads/2016/01/Creare-Logo.jpg'
  )
WHERE id = 'creare';

-- Oceanit Laboratories Inc.
UPDATE orgs SET
  website = 'https://www.oceanit.com',
  loc = '828 Fort Street Mall, Suite 600, Honolulu, HI 96813',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(808) 531-3017',
    'mission',          'We solve the most important scientific challenges — from Mind to Market.',
    'full_description', 'Oceanit partners directly with U.S. Indo-Pacific Command and armed services to develop and rapidly deploy advanced technologies for military applications. The firm creates disruptive solutions and asymmetric advantages for warfighters, leveraging its strategic Hawaii location adjacent to combatant command headquarters to work at the tip of the spear with defense personnel. Oceanit''s interdisciplinary team translates breakthrough science into fielded capabilities across sensors, materials, and information systems.',
    'logo_url',         'https://oceanit.com/wp-content/uploads/2025/11/Oceanit_Logo_Blue.png'
  )
WHERE id = 'oceanit-laboratories';

-- CFD Research Corporation
UPDATE orgs SET
  website = 'https://www.cfd-research.com',
  loc = '6820 Moquin Dr NW, Huntsville, AL 35806',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(256) 361-0811',
    'mission',          'Delivering innovative technology solutions for Aerospace & Defense, Life Sciences, and Intelligence & Sensing.',
    'full_description', 'CFD Research Corporation is a 100% employee-owned Inc. 5000 company that has been developing innovative technology solutions for Aerospace & Defense, Life Sciences, Intelligence & Sensing, and Energy & Materials since 1987. Headquartered in Huntsville, AL — the Rocket City — CFDRC delivers award-winning prototypes, advanced software, and expert services to military and government customers. The company''s multidisciplinary team combines computational modeling with hardware development to accelerate technology from concept to deployment.'
  )
WHERE id = 'cfd-research';

-- Luna Labs USA LLC
UPDATE orgs SET
  website = 'https://www.lunalabs.us',
  loc = '706 Forest Street, Suite A, Charlottesville, VA 22903',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(434) 972-9950',
    'mission',          'Creating unique solutions for complex challenges in defense, industrial, and healthcare markets.',
    'full_description', 'Luna Labs develops transformative dual-use technologies serving both military and civilian markets, focusing on strengthening defense capabilities and safeguarding critical infrastructure and personnel. Working with leading organizations and key government agencies, Luna Labs translates breakthrough science into products that protect warfighters and first responders. Their in-house expertise spans materials science, sensors, and biomedical technologies with applications across national security.',
    'logo_url',         'https://www.lunalabs.us/luna-labs-logo.png'
  )
WHERE id = 'luna-labs-usa';

-- GreenSight Inc.
UPDATE orgs SET
  website = 'https://www.greensightag.com',
  loc = '529 Main St, Suite 600, Boston, MA 02129',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(844) 484-7336',
    'mission',          'Reliable, mission-critical robotic systems for defense and government applications.',
    'full_description', 'GreenSight provides reliable autonomous robotic systems and data analytics for defense, government, and commercial applications. Their defense division delivers dependable autonomous systems tailored to support critical operations and specialized mission requirements within the defense sector. GreenSight''s technology enables persistent monitoring, inspection, and data collection in environments where precision and reliability are paramount.',
    'logo_url',         'https://cdn.prod.website-files.com/682cb2ae218ef5672933807a/682e1c94a06d1144954f3922_Greensight-Logo-color-and-KO.png'
  )
WHERE id = 'greensight';

-- Lynntech Inc.
UPDATE orgs SET
  website = 'https://www.lynntech.com',
  loc = '2501 Earl Rudder Freeway South, Suite 100, College Station, TX 77845',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(979) 764-2200',
    'mission',          'Nurturing and harvesting scientific creativity to produce life-changing products that solve complex problems others won''t.',
    'full_description', 'Lynntech develops advanced training systems and medical technologies for military applications, including the Flight Breathing Awareness Trainer which replicates physiological phenomena for aircraft like the F-18 and T-45. The company engineers the TRIAD-MP™ three-channel pump enhancing DoD''s expeditionary medical capabilities for field and en route care operations. Lynntech''s work spans aerospace physiology, energy storage, chemical processes, and biomedical systems for defense customers.',
    'logo_url',         'https://www.lynntech.com/wp-content/uploads/2016/04/HeaderLogo_Sticky.png'
  )
WHERE id = 'lynntech';

-- Near Earth Autonomy Inc.
UPDATE orgs SET
  website = 'https://www.nearearth.aero',
  loc = '150 N Lexington Street, Pittsburgh, PA 15208',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'mission',          'Fly Beyond — enabling uncrewed aircraft to reliably perceive and avoid environmental hazards.',
    'full_description', 'Near Earth Autonomy develops autonomous flight systems for military applications, including integration with platforms like the Black Hawk helicopter and Boeing''s Unmanned Little Bird. The company provides end-to-end support encompassing mission definition, integration, testing, certification, and deployment of aerial autonomy technology. Their work has earned recognition from U.S. European Command and partnerships with aerospace leaders including Boeing and Kaman.'
  )
WHERE id = 'near-earth-autonomy';

-- Aptima Inc.
UPDATE orgs SET
  website = 'https://aptima.com',
  loc = '8 Cabot Road, Suite 4000, Woburn, MA 01801',
  profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
    'phone',            '(781) 935-3966',
    'mission',          'Engineering the Future of National Security by fusing human potential with advanced innovation.',
    'full_description', 'Aptima improves and optimizes human performance in mission-critical, technology-intensive defense and national security settings. The company applies deep expertise in how humans think, learn, and perform — delivering solutions across Readiness, Decision Advantage, Modeling & Simulation, Cognitive Warfare, and Operational Health & Safety. Aptima''s customers include all branches of the U.S. military, intelligence agencies, and federal law enforcement organizations.'
  )
WHERE id = 'aptima';
