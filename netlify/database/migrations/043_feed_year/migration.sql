-- Seed one full year of feed items (June 2025 – June 2026)
-- Covers news, company updates, budget, and opportunities across the defense calendar

INSERT INTO feed_items (type, title, body, image_url, source, source_url, entity_name, entity_logo, tags, published_at) VALUES

-- ── JUNE 2025 ────────────────────────────────────────────────────────────

('news',
 'DoD Releases AI Adoption Strategy — Mandates AI Integration Across All Combatant Commands by 2027',
 'The Department of Defense released its updated AI Adoption Strategy, establishing binding timelines for integrating AI-enabled decision support tools across all 11 combatant commands by FY2027. The strategy prioritizes logistics optimization, ISR data fusion, and predictive maintenance — with CDAO designated as the coordinating authority and $1.8B in dedicated funding across the FYDP.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Seal_of_the_United_States_Department_of_Defense.svg/200px-Seal_of_the_United_States_Department_of_Defense.svg.png',
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['AI','DoD','CDAO','Strategy','Autonomy'],
 NOW() - INTERVAL '365 days'),

('company_update',
 'Granicus Expands Federal Footprint with $34M DHS Digital Notifications BPA',
 'Granicus has been awarded a $34 million Blanket Purchase Agreement with the Department of Homeland Security to deploy its govDelivery platform across FEMA, CBP, and ICE — reaching an estimated 80 million subscribers with emergency alerts, benefits notifications, and public safety updates.',
 NULL,
 'USASpending.gov', 'https://usaspending.gov', 'Granicus, LLC', 'https://granicus.com/wp-content/uploads/Granicus-Logo.svg',
 ARRAY['DHS','Digital Services','BPA','Award'],
 NOW() - INTERVAL '360 days'),

('budget',
 'Senate Armed Services Committee Marks Up FY2026 NDAA — $923B Topline with Major Shipbuilding Boost',
 'The Senate Armed Services Committee approved its version of the FY2026 National Defense Authorization Act with a $923 billion topline — $14B above the President''s request. Key additions include $4.2B for Virginia-class submarine production acceleration, $2.1B for Pacific missile defense infrastructure, and new language requiring DoD to publish a quantum computing roadmap within 180 days.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/The_Pentagon_January_2008.jpg/1200px-The_Pentagon_January_2008.jpg',
 'Breaking Defense', 'https://breakingdefense.com', 'U.S. Senate', NULL,
 ARRAY['NDAA','FY2026','Budget','Shipbuilding','Senate'],
 NOW() - INTERVAL '350 days'),

('opportunity',
 'RFP: SOCOM Advanced ISR Integration IDIQ — Est. $2.4B, Proposals Due 90 Days',
 'U.S. Special Operations Command released a draft RFP for a new $2.4B IDIQ covering advanced ISR sensor integration, data exploitation, and real-time dissemination for SOF operations. The vehicle includes both hardware and software requirements with a strong emphasis on contested environment operability and AI-assisted target identification.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'U.S. Special Operations Command', NULL,
 ARRAY['SOCOM','ISR','IDIQ','Opportunity','AI','SOF'],
 NOW() - INTERVAL '345 days'),

-- ── JULY 2025 ────────────────────────────────────────────────────────────

('news',
 'Army Awards $1.7B Integrated Tactical Network Contract to L3Harris',
 'L3Harris Technologies has been awarded a $1.7 billion sole-source contract to continue development and low-rate initial production of the Army''s Integrated Tactical Network (ITN) — the core communications architecture for multi-domain operations. The contract covers software-defined radios, tactical cloud nodes, and satellite connectivity for brigade combat teams.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Army','ITN','L3Harris','Communications','MDCO'],
 NOW() - INTERVAL '335 days'),

('company_update',
 'Skylight Digital Awarded HHS ACF Digital Platform VIBES IDIQ — $30M Modernization Contract',
 'Skylight Digital has been awarded the HHS Administration for Children & Families Digital Platform VIBES IDIQ, valued at approximately $30 million. The contract covers citizen-facing services modernization, cloud-native application development, and user experience transformation across ACF''s portfolio of benefit delivery programs — reaching millions of low-income families.',
 NULL,
 'USASpending.gov', 'https://usaspending.gov', 'Skylight Digital LLC', 'https://skylight.digital/img/logo.svg',
 ARRAY['HHS','ACF','Digital Services','Award','Modernization'],
 NOW() - INTERVAL '330 days'),

('news',
 'Space Force Awards $900M Satellite Ground Architecture Contract to Raytheon',
 'The U.S. Space Force Space Systems Command has awarded Raytheon Technologies a $900 million contract to modernize the Enterprise Ground Services (EGS) architecture — replacing legacy satellite command and control systems with a cloud-native, AI-augmented platform supporting over 60 satellite constellations.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Space Force','Satellite','Raytheon','Ground Systems','Cloud'],
 NOW() - INTERVAL '320 days'),

-- ── AUGUST 2025 ──────────────────────────────────────────────────────────

('news',
 'DISA Awards $450M Zero Trust Pilot to Booz Allen and Leidos',
 'The Defense Information Systems Agency has awarded a combined $450 million to Booz Allen Hamilton and Leidos for an 18-month zero trust architecture pilot spanning 14 DoD networks. The pilot covers identity and access management, micro-segmentation, continuous monitoring, and data-centric security across classified and unclassified environments.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/DISA_logo.png/320px-DISA_logo.png',
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['DISA','Zero Trust','Booz Allen','Leidos','Cybersecurity'],
 NOW() - INTERVAL '310 days'),

('company_update',
 'NuAxis Innovations Wins VA Contact Center Modernization Task Order — $18M',
 'NuAxis Innovations has been awarded an $18 million task order under the VA''s NGITS contract to modernize the Veterans Crisis Line contact center infrastructure. The project deploys NuAI for CX — an AI-powered contact center solution — to reduce average handle time, improve veteran routing accuracy, and provide real-time sentiment analysis for crisis counselors.',
 'https://nuaxis.com/wp-content/uploads/2023/06/NuAxis-Logo.png',
 'NuAxis Innovations', 'https://nuaxis.com', 'NuAxis Innovations', '/logos/nuaxis.png',
 ARRAY['VA','Contact Center','AI','Award','CX'],
 NOW() - INTERVAL '305 days'),

('opportunity',
 'Sources Sought: Air Force ABMS Data Mesh Platform — Est. $800M, Industry Day Sept 15',
 'The Air Force Life Cycle Management Center published a Sources Sought notice for the Advanced Battle Management System (ABMS) Data Mesh Platform — a cloud-native data fabric enabling real-time data sharing across joint and coalition forces. An industry day is scheduled for September 15. Responses to the Sources Sought are due in 30 days.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'U.S. Air Force', NULL,
 ARRAY['Air Force','ABMS','Data Mesh','Cloud','Opportunity','JADC2'],
 NOW() - INTERVAL '300 days'),

-- ── SEPTEMBER 2025 ───────────────────────────────────────────────────────

('news',
 'Navy Releases 30-Year Shipbuilding Plan — Calls for 381-Ship Fleet by 2054',
 'The U.S. Navy released its FY2026–FY2055 30-year shipbuilding plan, projecting a 381-ship fleet by 2054. The plan prioritizes Virginia-class attack submarines (3 per year), DDG-51 Arleigh Burke destroyers, and a new class of large surface combatants. Distributed Maritime Operations drives the force structure away from carrier strike groups and toward a more disaggregated fleet.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/USS_Virginia_%28SSN-774%29.jpg/1200px-USS_Virginia_%28SSN-774%29.jpg',
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Navy','Shipbuilding','Fleet','Submarines','DMO'],
 NOW() - INTERVAL '285 days'),

('company_update',
 'Qualtrics Wins OPM Federal Employee Viewpoint Survey Platform Renewal — $22M',
 'Qualtrics has been awarded a multi-year renewal to power the Office of Personnel Management''s Federal Employee Viewpoint Survey (FEVS) platform. The $22 million contract extends through FY2029 and adds new AI-driven analysis capabilities, real-time agency dashboards, and a new pulse survey module for use between annual administrations.',
 '/logos/qualtrics.svg',
 'USASpending.gov', 'https://usaspending.gov', 'Qualtrics', '/logos/qualtrics.svg',
 ARRAY['OPM','FEVS','Employee Experience','Award','AI'],
 NOW() - INTERVAL '280 days'),

('news',
 'DARPA Announces $340M Replicator-2 Program — Autonomous Systems at Scale',
 'DARPA has launched Replicator-2, a $340 million program to develop manufacturing and logistics infrastructure capable of producing thousands of autonomous air and sea vehicles per month. Building on the DoD''s first Replicator initiative, the program focuses on supply chain resilience, modular payload systems, and autonomous teaming for contested environments.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/DARPA_Logo.jpg/220px-DARPA_Logo.jpg',
 'Orange Slices', 'https://orangeslices.ai', NULL, NULL,
 ARRAY['DARPA','Autonomy','Replicator','Drones','Manufacturing'],
 NOW() - INTERVAL '270 days'),

-- ── OCTOBER 2025 (FY2026 START) ──────────────────────────────────────────

('budget',
 'FY2026 Begins Under Continuing Resolution — DoD Operations Constrained Through December',
 'The federal government entered FY2026 under a Continuing Resolution after Congress failed to pass appropriations before the October 1 deadline. DoD operations are constrained to FY2025 spending rates, blocking new program starts, multi-year contracts, and procurement ramp-ups. Defense analysts warn the CR could delay key modernization programs by 6–12 months if extended.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/The_Pentagon_January_2008.jpg/1200px-The_Pentagon_January_2008.jpg',
 'Breaking Defense', 'https://breakingdefense.com', 'Department of Defense', NULL,
 ARRAY['Budget','CR','FY2026','Congress','Appropriations'],
 NOW() - INTERVAL '260 days'),

('news',
 'Army Selects Microsoft for $9B IVAS 1.1 Augmented Reality Headset Contract',
 'The U.S. Army has selected Microsoft for a $9 billion contract to deliver the Integrated Visual Augmentation System (IVAS) 1.1 — a next-generation augmented reality headset for close combat soldiers. IVAS 1.1 integrates thermal imaging, night vision, and AI-enabled targeting data into a single wearable platform tested with the 82nd Airborne Division.',
 NULL,
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['Army','IVAS','Microsoft','AR','Soldier Systems'],
 NOW() - INTERVAL '255 days'),

('company_update',
 'Granicus Launches AI Meeting Intelligence Across 2,500 Local Governments',
 'Granicus has deployed AI-powered meeting intelligence to 2,500 local and county governments — automatically generating meeting summaries, action items, and public minutes within 2 hours of adjournment. The platform uses large language models fine-tuned on government meeting transcripts and integrates with legistar and govMeetings.',
 NULL,
 'Granicus Blog', 'https://granicus.com/blog', 'Granicus, LLC', 'https://granicus.com/wp-content/uploads/Granicus-Logo.svg',
 ARRAY['Local Government','AI','Meeting Intelligence','Product','LLM'],
 NOW() - INTERVAL '250 days'),

-- ── NOVEMBER 2025 ────────────────────────────────────────────────────────

('news',
 'Air Force Awards $480M BESPIN Software Factory Expansion to Skylight Digital and Consortium',
 'The Air Force BESPIN program has awarded a $480 million expansion contract to a consortium led by Skylight Digital to grow its software factory capabilities to 18 bases. The expansion includes embedded product designers, agile coaches, and DevSecOps engineers — targeting a 10x increase in software delivery throughput across Air Force programs.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', 'Skylight Digital LLC', 'https://skylight.digital/img/logo.svg',
 ARRAY['Air Force','BESPIN','Software Factory','Award','DevSecOps'],
 NOW() - INTERVAL '235 days'),

('opportunity',
 'Pre-Solicitation: DHS Homeland Artificial Intelligence Platform — Est. $1.8B IDIQ',
 'The Department of Homeland Security published a pre-solicitation notice for the Homeland Artificial Intelligence Platform (HAIP) — a $1.8 billion IDIQ to deploy AI capabilities across CBP, CISA, ICE, and FEMA. The platform covers biometric AI, threat detection, and AI-enabled operational planning. Full RFP expected in 60 days.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'Department of Homeland Security', NULL,
 ARRAY['DHS','AI','HAIP','IDIQ','Biometrics','CISA'],
 NOW() - INTERVAL '230 days'),

('news',
 'CISA Releases Updated National Cyber Incident Response Plan — Expands Private Sector Coordination',
 'The Cybersecurity and Infrastructure Security Agency released an updated National Cyber Incident Response Plan (NCIRP), significantly expanding requirements for private sector coordination during significant cyber events. The plan establishes new information sharing timelines, mandatory reporting thresholds for critical infrastructure operators, and a new Joint Cyber Defense Collaborative (JCDC) operating model.',
 NULL,
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['CISA','Cybersecurity','NCIRP','Incident Response','Policy'],
 NOW() - INTERVAL '225 days'),

-- ── DECEMBER 2025 ────────────────────────────────────────────────────────

('budget',
 'Congress Passes FY2026 NDAA — $895B Signed into Law with Pacific Deterrence Surge',
 'President Biden signed the FY2026 National Defense Authorization Act into law, authorizing $895 billion in defense spending — a 4.2% increase over FY2025. Key provisions include a $9.4B Pacific Deterrence Initiative surge, new requirements for hypersonic weapon stockpile levels, $3.6B for AI and autonomy, and the creation of a new joint operational domain for information warfare.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/The_Pentagon_January_2008.jpg/1200px-The_Pentagon_January_2008.jpg',
 'Breaking Defense', 'https://breakingdefense.com', 'Department of Defense', NULL,
 ARRAY['NDAA','FY2026','Budget','PDI','Hypersonics','AI'],
 NOW() - INTERVAL '200 days'),

('news',
 'Navy Awards $14B Columbia-Class SSBN Production Contract to General Dynamics',
 'General Dynamics Electric Boat has been awarded a $14 billion contract modification for continued production of the Columbia-class ballistic missile submarine — the U.S. nuclear deterrent''s at-sea leg. The contract covers construction milestones for the lead ship USS Columbia and accelerates key long-lead material procurement for the second and third hulls.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Navy','Columbia-class','SSBN','Nuclear','General Dynamics','Submarines'],
 NOW() - INTERVAL '195 days'),

('company_update',
 'NuAxis Innovations Unveils NuAI for DataOps — Intelligent Data Pipeline for Federal Agencies',
 'NuAxis Innovations has launched NuAI for DataOps, an AI-powered data pipeline automation platform built for federal agencies. The solution reduces data integration time by 70%, provides real-time pipeline observability, and includes FedRAMP-ready connectors for major federal data sources including Data.gov, USASpending, and SAM.gov.',
 'https://nuaxis.com/wp-content/uploads/2023/06/NuAxis-Logo.png',
 'NuAxis Innovations', 'https://nuaxis.com', 'NuAxis Innovations', '/logos/nuaxis.png',
 ARRAY['AI','DataOps','Federal','FedRAMP','Data Pipeline','Product'],
 NOW() - INTERVAL '190 days'),

-- ── JANUARY 2026 ─────────────────────────────────────────────────────────

('news',
 'DARPA Selects 8 Teams for Autonomous Air Combat Vehicle Program — $220M Phase 2',
 'DARPA announced selection of eight teams for Phase 2 of the Autonomous Air Combat Vehicle (AACV) program — moving to flight demonstrations of AI-enabled dogfighting capability. Phase 2 awards total $220 million and include Lockheed Martin Skunk Works, Northrop Grumman, Anduril Industries, and five non-traditional defense firms.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['DARPA','AACV','Autonomy','AI','Air Combat','Anduril'],
 NOW() - INTERVAL '170 days'),

('opportunity',
 'RFP Released: Army Unified Network Transport Layer — $3.2B IDIQ, 5-Year PoP',
 'The U.S. Army Program Executive Office Command, Control, Communications-Tactical released the full RFP for the Unified Network Transport Layer (UNTL) — a $3.2 billion IDIQ for tactical communications infrastructure across brigade and division echelons. Responses due in 75 days. Small business participation plan required.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'U.S. Army', NULL,
 ARRAY['Army','Communications','UNTL','IDIQ','Tactical Networks','Opportunity'],
 NOW() - INTERVAL '165 days'),

('company_update',
 'Qualtrics Federal Launches AI-Powered Resident Sentiment Dashboard for 50 Federal HISPs',
 'Qualtrics Federal has deployed an AI-powered resident sentiment dashboard for 50 of the government''s High-Impact Service Providers, meeting OMB''s A-11 Section 280 reporting requirements. The platform processes over 4 million feedback data points per quarter, automatically surfacing the top 10 service friction points for each agency.',
 '/logos/qualtrics.svg',
 'Qualtrics Federal', 'https://www.qualtrics.com/government/', 'Qualtrics', '/logos/qualtrics.svg',
 ARRAY['OMB','A-11','HISP','CX','AI','Federal','Product'],
 NOW() - INTERVAL '160 days'),

-- ── FEBRUARY 2026 ────────────────────────────────────────────────────────

('news',
 'Pentagon Inspector General Flags $2.1B in Unsupported DoD IT Spending — Calls for Cloud Audit',
 'The DoD Inspector General released a report identifying $2.1 billion in unsupported IT expenditures across 23 DoD components, citing inadequate lifecycle tracking, duplicate contracts, and a lack of centralized cloud spending visibility. The IG recommended DISA establish a unified cloud cost management function and that CDAO conduct a portfolio rationalization within 12 months.',
 NULL,
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['DoD IG','IT Spending','Cloud','Audit','DISA','CDAO'],
 NOW() - INTERVAL '145 days'),

('news',
 'Air Force B-21 Raider Reaches Initial Operational Capability — First Nuclear-Capable Stealth Bomber in 30 Years',
 'The U.S. Air Force declared the B-21 Raider bomber at Initial Operational Capability, making it the first nuclear-capable stealth bomber to reach IOC since the B-2 Spirit in 1997. The B-21 is built by Northrop Grumman and is designed for both conventional and nuclear missions in highly contested environments, with an open architecture enabling rapid sensor and weapons integration.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Air Force','B-21','Raider','Northrop Grumman','Nuclear','Stealth'],
 NOW() - INTERVAL '140 days'),

('company_update',
 'Skylight Digital Wins VA Mobile Product Strategy & API Governance Engagement',
 'Skylight Digital has been awarded a task order to develop an evidence-based mobile product strategy and API governance roadmap for the Department of Veterans Affairs flagship mobile app — VA: Health and Benefits. The engagement will produce an architecture recommendation, developer outreach playbook, and a two-year product roadmap for VA''s mobile portfolio.',
 NULL,
 'USASpending.gov', 'https://usaspending.gov', 'Skylight Digital LLC', 'https://skylight.digital/img/logo.svg',
 ARRAY['VA','Mobile','API','Product Strategy','Award'],
 NOW() - INTERVAL '135 days'),

-- ── MARCH 2026 ───────────────────────────────────────────────────────────

('budget',
 'President''s FY2027 Budget Request: $1.01T Defense Topline — First Trillion-Dollar Defense Budget',
 'The White House submitted its FY2027 budget request, including a $1.01 trillion national defense topline — the first time defense spending has crossed the trillion-dollar threshold. The request prioritizes nuclear modernization ($45B), space superiority ($22B), AI and autonomy ($8.4B), and hypersonic weapons ($6.2B). The Army faces cuts while the Navy and Space Force see significant growth.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/The_Pentagon_January_2008.jpg/1200px-The_Pentagon_January_2008.jpg',
 'Breaking Defense', 'https://breakingdefense.com', 'Department of Defense', NULL,
 ARRAY['Budget','FY2027','Pentagon','Nuclear','Space','AI','Hypersonics'],
 NOW() - INTERVAL '115 days'),

('news',
 'DoD CDAO Launches Responsible AI Certification Program — 1,200 Vendors Must Certify by Q4 FY2026',
 'The Chief Digital and Artificial Intelligence Office launched its Responsible AI (RAI) certification program, requiring all vendors deploying AI under DoD contracts to obtain certification by Q4 FY2026. Certification covers explainability testing, bias audits, human-in-the-loop requirements, and continuous monitoring. The CDAO estimates 1,200 active vendor relationships are in scope.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Seal_of_the_United_States_Department_of_Defense.svg/200px-Seal_of_the_United_States_Department_of_Defense.svg.png',
 'Orange Slices', 'https://orangeslices.ai', NULL, NULL,
 ARRAY['CDAO','Responsible AI','Certification','DoD','Policy','Compliance'],
 NOW() - INTERVAL '110 days'),

('opportunity',
 'RFP: GSA STARS IV GWAC — $25B Ceiling, HUBZone and WOSB Set-Aside, Proposals Due June 30',
 'GSA released the RFP for its next-generation STARS IV Governmentwide Acquisition Contract — a $25 billion GWAC for small business IT services. The contract includes dedicated pools for HUBZone and Women-Owned Small Business firms and is expected to serve 60+ agencies. Proposals are due June 30. This is the most competitive small business IT vehicle of the decade.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'General Services Administration', NULL,
 ARRAY['GSA','STARS IV','GWAC','Small Business','IT Services','Opportunity'],
 NOW() - INTERVAL '105 days'),

-- ── APRIL 2026 ───────────────────────────────────────────────────────────

('news',
 'Navy CIO Announces CANES 2.0 — $6.8B Ship IT Modernization Program Goes to Leidos',
 'The U.S. Navy has awarded Leidos a $6.8 billion contract for CANES 2.0 — the next generation Consolidated Afloat Networks and Enterprise Services architecture. CANES 2.0 replaces legacy shipboard IT across 200+ warships with a zero trust, cloud-native networking stack supporting classified and unclassified workloads at sea.',
 NULL,
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['Navy','CANES','Leidos','Shipboard IT','Zero Trust','Award'],
 NOW() - INTERVAL '90 days'),

('company_update',
 'Granicus Acquires CivicPlus Constituent Experience Suite — 3,000 Additional Government Clients',
 'Granicus announced the acquisition of CivicPlus, adding 3,000 state and local government clients and expanding its constituent experience platform to include permitting, licensing, code enforcement, and parks and recreation management. The combined company now serves over 7,000 government entities and 340 million residents.',
 NULL,
 'Granicus Blog', 'https://granicus.com/blog', 'Granicus, LLC', 'https://granicus.com/wp-content/uploads/Granicus-Logo.svg',
 ARRAY['Granicus','Acquisition','Local Government','CivicPlus','Growth'],
 NOW() - INTERVAL '85 days'),

('news',
 'Space Force Awards $2.1B Protected Tactical Satcom Contract to Boeing and Northrop',
 'The U.S. Space Force has awarded production contracts for the Protected Tactical Satcom (PTS) satellite constellation — $1.2B to Boeing and $900M to Northrop Grumman — for a constellation of 6 satellites providing jam-resistant communications to tactical users in contested environments. First launch is targeted for FY2029.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Space Force','Satcom','Boeing','Northrop Grumman','Satellite','Award'],
 NOW() - INTERVAL '80 days'),

-- ── MAY 2026 ─────────────────────────────────────────────────────────────

('news',
 'Army''s Project Convergence 2026 Demonstrates AI-Enabled Kill Chain at 30-Second Decision Speed',
 'Project Convergence 2026 at Yuma Proving Ground demonstrated an AI-enabled kill chain compressing sensor-to-shooter decision time to under 30 seconds across 200km. The exercise integrated ABMS, IBCS, and commercial AI targeting tools from Palantir and Anduril — validating joint all-domain operations at division scale for the first time.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Army','Project Convergence','AI','Kill Chain','Palantir','Anduril','JADC2'],
 NOW() - INTERVAL '60 days'),

('company_update',
 'NuAxis Innovations Awarded $24M SSA Digital Modernization Task Order',
 'NuAxis Innovations has been awarded a $24 million task order under the Social Security Administration''s Unified Technology Solutions vehicle to modernize SSA''s citizen-facing services. The project deploys NuAI for CX to reduce average call center handle time by 35% and launches a new digital self-service portal for disability claims management.',
 'https://nuaxis.com/wp-content/uploads/2023/06/NuAxis-Logo.png',
 'NuAxis Innovations', 'https://nuaxis.com', 'NuAxis Innovations', '/logos/nuaxis.png',
 ARRAY['SSA','Digital Modernization','CX','AI','Award'],
 NOW() - INTERVAL '55 days'),

('opportunity',
 'Sources Sought: DoD Joint Logistics Enterprise AI Platform — Est. $4.5B, Comments Due 45 Days',
 'The Defense Logistics Agency published a Sources Sought notice for the Joint Logistics Enterprise AI Platform (JLEAP) — a $4.5B program to deploy predictive maintenance, supply chain optimization, and autonomous inventory management across the DLA''s $90B annual supply chain. This is one of the largest AI procurements in DoD history.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'Defense Logistics Agency', NULL,
 ARRAY['DLA','AI','Logistics','Supply Chain','Opportunity','Predictive Maintenance'],
 NOW() - INTERVAL '50 days'),

('news',
 'Cyber Command Awards $1.1B Persistent Cyber Training Environment to Peraton',
 'U.S. Cyber Command has awarded Peraton a $1.1 billion contract to operate and expand the Persistent Cyber Training Environment (PCTE) — the DoD''s online platform for cyber mission force training. The contract covers platform operations, scenario development, and integration of AI-powered red team simulations for 10,000+ cyber operators.',
 NULL,
 'DefenseScoop', 'https://defensescoop.com', NULL, NULL,
 ARRAY['Cyber Command','PCTE','Peraton','Cybersecurity','Training','Award'],
 NOW() - INTERVAL '45 days'),

-- ── JUNE 2026 (RECENT) ───────────────────────────────────────────────────

('company_update',
 'Qualtrics Federal Achieves DISA IL5 Authorization — Enables Secret-Level Employee Experience Programs',
 'Qualtrics Federal has received DISA Impact Level 5 authorization, enabling deployment of the XM Platform for classified workforce listening programs within DoD components cleared at the Secret level. This makes Qualtrics the first experience management platform to achieve IL5, unlocking employee engagement measurement for classified programs and special access programs.',
 '/logos/qualtrics.svg',
 'Qualtrics Federal', 'https://www.qualtrics.com/government/', 'Qualtrics', '/logos/qualtrics.svg',
 ARRAY['Qualtrics','DISA','IL5','FedRAMP','DoD','Security Clearance'],
 NOW() - INTERVAL '30 days'),

('news',
 'Pentagon Releases DIU 2026 Commercial Technology Report — 47 Solutions Fast-Tracked to Program of Record',
 'The Defense Innovation Unit published its 2026 Commercial Technology Report, highlighting 47 commercial technologies that have been successfully transitioned to program of record status. Categories include AI/ML (14), autonomous systems (11), biotechnology (7), space (8), and cyber (7). DIU''s transition rate is now 34% — up from 12% in 2021.',
 NULL,
 'Orange Slices', 'https://orangeslices.ai', NULL, NULL,
 ARRAY['DIU','Commercial Technology','Innovation','Transition','AI','Autonomy'],
 NOW() - INTERVAL '20 days'),

('opportunity',
 'RFP Alert: DISA ENCORE IV — $17.5B IT Services GWAC, Unrestricted and SBSA Pools, Due July 31',
 'DISA released the RFP for ENCORE IV — its flagship $17.5 billion IT services GWAC replacing ENCORE III. The contract includes unrestricted and small business set-aside pools across cloud, cybersecurity, software development, and IT operations. Industry estimates 200+ prime awardees. Proposals are due July 31, 2026.',
 NULL,
 'SAM.gov', 'https://sam.gov', 'DISA', NULL,
 ARRAY['DISA','ENCORE IV','GWAC','IT Services','Opportunity','Cybersecurity','Cloud'],
 NOW() - INTERVAL '15 days'),

('news',
 'Army Selects Anduril for Counter-UAS LASSO System — $1B Production Contract',
 'Anduril Industries has been awarded a $1 billion production contract for the LASSO (Light Autonomous Surveillance and Sentry Operations) counter-UAS system following successful operational testing with the 101st Airborne Division. LASSO uses AI-enabled radar, EO/IR sensors, and kinetic effectors to autonomously detect and defeat Group 1–3 UAS threats at the platoon level.',
 NULL,
 'Breaking Defense', 'https://breakingdefense.com', NULL, NULL,
 ARRAY['Army','Anduril','Counter-UAS','LASSO','Autonomy','Award'],
 NOW() - INTERVAL '8 days');
