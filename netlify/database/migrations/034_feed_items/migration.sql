CREATE TABLE IF NOT EXISTS feed_items (
  id          SERIAL PRIMARY KEY,
  type        TEXT NOT NULL, -- 'news' | 'contract' | 'opportunity' | 'company_update' | 'budget'
  title       TEXT NOT NULL,
  body        TEXT,
  image_url   TEXT,
  video_url   TEXT,
  source      TEXT,
  source_url  TEXT,
  entity_name TEXT,
  entity_logo TEXT,
  tags        TEXT[],
  value_b     NUMERIC,
  published_at TIMESTAMPTZ DEFAULT now(),
  pinned      BOOLEAN DEFAULT false
);

-- Pre-seeded feed items: defense news + company updates + SAM highlights

INSERT INTO feed_items (type, title, body, image_url, source, source_url, entity_name, entity_logo, tags, published_at) VALUES

-- NEWS: Breaking Defense
('news',
 'Army Requesting $2.1B for Long-Range Precision Fires in FY2026 Budget',
 'The Army''s FY2026 budget request includes a significant boost for long-range precision fires, with $2.1 billion earmarked for Extended Range Cannon Artillery (ERCA), Precision Strike Missile (PrSM) procurement, and hypersonic weapon development. The request reflects a strategic shift toward multi-domain operations and pacing threat competition with China and Russia.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/US_Army_M109A7_Paladin_Self-Propelled_Howitzer.jpg/1200px-US_Army_M109A7_Paladin_Self-Propelled_Howitzer.jpg',
 'Breaking Defense', 'https://breakingdefense.com',
 NULL, NULL,
 ARRAY['Army','Budget','Precision Fires','FY2026'],
 NOW() - INTERVAL '2 days'),

-- NEWS: DefenseScoop
('news',
 'DISA Expands Zero Trust Implementation Across DoD Enterprise Networks',
 'The Defense Information Systems Agency is accelerating zero trust adoption across DoD networks, awarding task orders totaling $340M under the SCTS vehicle to Leidos and SAIC. The initiative covers identity, credential and access management (ICAM), micro-segmentation, and continuous monitoring for classified and unclassified environments.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/DISA_logo.png/320px-DISA_logo.png',
 'DefenseScoop', 'https://defensescoop.com',
 NULL, NULL,
 ARRAY['DISA','Zero Trust','Cybersecurity','Network'],
 NOW() - INTERVAL '3 days'),

-- COMPANY UPDATE: Granicus
('company_update',
 'Granicus Wins $28M HHS Task Order for Citizen Engagement Platform',
 'Granicus has been awarded a $28 million task order under the HHS ITES vehicle to deploy its govDelivery communications platform across 14 HHS operating divisions. The contract covers digital notifications, two-way SMS communications, and citizen subscription management — reaching an estimated 140 million subscribers.',
 NULL,
 'USASpending.gov', 'https://usaspending.gov',
 'Granicus, LLC', 'https://granicus.com/wp-content/uploads/Granicus-Logo.svg',
 ARRAY['HHS','Citizen Engagement','Digital Services','Award'],
 NOW() - INTERVAL '4 days'),

-- COMPANY UPDATE: NuAxis
('company_update',
 'NuAxis Innovations Launches NuAI for CX — AI-Powered Contact Center Solution for Federal Agencies',
 'NuAxis Innovations unveiled NuAI for CX, an AI-powered contact center solution built on GPT-4 large language models. The platform proactively analyzes federal agency websites for content gaps, accessibility issues, and usability friction — helping agencies consolidate their digital footprint and boost citizen satisfaction scores. Currently deployed under the HHS NGITS contract.',
 'https://nuaxis.com/wp-content/uploads/2023/06/NuAxis-Logo.png',
 'NuAxis Innovations', 'https://nuaxis.com',
 'NuAxis Innovations', '/logos/nuaxis.png',
 ARRAY['AI','Contact Center','HHS','Digital Services','Innovation'],
 NOW() - INTERVAL '5 days'),

-- COMPANY UPDATE: Qualtrics
('company_update',
 'Qualtrics Federal Expands Experience Management Platform Across DoD',
 'Qualtrics is expanding its XM (Experience Management) platform into additional DoD commands, following successful deployments at TRANSCOM and USTRATCOM. The platform enables real-time feedback loops from servicemembers, civilian employees, and contractors — measuring experience gaps in HR, training, and mission readiness programs.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Qualtrics_logo.svg/1200px-Qualtrics_logo.svg.png',
 'Qualtrics Federal', 'https://www.qualtrics.com/government/',
 'Qualtrics', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Qualtrics_logo.svg/200px-Qualtrics_logo.svg.png',
 ARRAY['DoD','Experience Management','HR Technology','Analytics'],
 NOW() - INTERVAL '6 days'),

-- NEWS: Breaking Defense
('news',
 'Navy Awards $9.4B Multi-Year Contract for Virginia-Class SSN Block VI',
 'The U.S. Navy has awarded a $9.4 billion multi-year submarine procurement contract split between General Dynamics Electric Boat and Huntington Ingalls Industries for construction of eight Virginia-class Block VI fast-attack submarines. The deal includes enhanced manufacturing efficiency provisions and a new emphasis on schedule recovery after years of delivery delays.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/USS_Virginia_%28SSN-774%29.jpg/1200px-USS_Virginia_%28SSN-774%29.jpg',
 'Breaking Defense', 'https://breakingdefense.com',
 NULL, NULL,
 ARRAY['Navy','Submarines','Virginia-class','General Dynamics','HII'],
 NOW() - INTERVAL '7 days'),

-- BUDGET
('budget',
 'Pentagon FY2026 Budget: $850B Request Prioritizes Indo-Pacific, Space, and AI',
 'The Department of Defense submitted its FY2026 budget request of $850.4 billion — a 3.5% increase over FY2025. Key priorities include a $14.1B investment in space systems, $3.1B for AI and autonomy programs, and a $6.8B increase for the Pacific Deterrence Initiative (PDI). Procurement accounts total $167B, with significant growth in ship construction and advanced munitions.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/The_Pentagon_January_2008.jpg/1200px-The_Pentagon_January_2008.jpg',
 'DoD Budget Office', 'https://comptroller.defense.gov',
 'Department of Defense', NULL,
 ARRAY['Budget','FY2026','Pentagon','Indo-Pacific','AI','Space'],
 NOW() - INTERVAL '8 days'),

-- NEWS: DefenseScoop
('news',
 'Air Force Selects Palantir for $480M AI-Powered Logistics Platform',
 'The Air Force Life Cycle Management Center has selected Palantir Technologies for a $480 million contract to deploy an AI-driven logistics and supply chain platform across 72 Air Force bases. The Palantir Foundry platform will integrate real-time parts tracking, predictive maintenance alerts, and demand forecasting — targeting a 23% reduction in aircraft-on-ground events.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Palantir_logo.svg/1200px-Palantir_logo.svg.png',
 'DefenseScoop', 'https://defensescoop.com',
 NULL, NULL,
 ARRAY['Air Force','AI','Logistics','Palantir','AFLCMC'],
 NOW() - INTERVAL '10 days'),

-- OPPORTUNITY (SAM highlight)
('opportunity',
 'RFP: Army Next-Generation Squad Weapon Sustainment IDIQ — Est. $1.2B',
 'The U.S. Army is seeking proposals for a new IDIQ contract covering sustainment, spare parts, training devices, and technical publications for the Next Generation Squad Weapon (NGSW) system. Responses are due within 60 days. Small business set-asides are expected to be a key evaluation factor. The contract has a 10-year base + option period.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/SIG_MCX_Spear_NGSW.jpg/1200px-SIG_MCX_Spear_NGSW.jpg',
 'SAM.gov', 'https://sam.gov',
 'U.S. Army', NULL,
 ARRAY['Army','NGSW','Opportunity','Sustainment','IDIQ','Small Business'],
 NOW() - INTERVAL '1 day'),

-- COMPANY UPDATE: Granicus product news
('company_update',
 'Granicus Rolls Out AI-Powered Meeting Agenda Tool for 2,000+ Local Governments',
 'Granicus has launched an AI-powered agenda management tool for local and county governments, now live across 2,100 jurisdictions. The tool auto-generates meeting summaries, flags conflicts of interest in agenda items, and publishes minutes within 2 hours of adjournment — integrating directly with Granicus govMeetings and legistar platforms.',
 NULL,
 'Granicus Blog', 'https://granicus.com/blog',
 'Granicus, LLC', 'https://granicus.com/wp-content/uploads/Granicus-Logo.svg',
 ARRAY['Local Government','AI','Meeting Management','Product'],
 NOW() - INTERVAL '12 days'),

-- NEWS: Orange Slices
('news',
 'DoD''s CDAO Publishes New Responsible AI Framework — Vendors Required to Certify by Q1 FY2026',
 'The Chief Digital and Artificial Intelligence Office (CDAO) has published its updated Responsible AI (RAI) framework, requiring all vendors deploying AI-enabled capabilities under DoD contracts to obtain RAI certification by Q1 FY2026. The framework covers explainability, bias testing, human-in-the-loop requirements, and continuous monitoring standards.',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Seal_of_the_United_States_Department_of_Defense.svg/200px-Seal_of_the_United_States_Department_of_Defense.svg.png',
 'Orange Slices', 'https://orangeslices.ai',
 NULL, NULL,
 ARRAY['AI','CDAO','Responsible AI','Policy','Compliance'],
 NOW() - INTERVAL '9 days');
