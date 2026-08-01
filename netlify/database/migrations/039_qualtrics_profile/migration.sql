-- Qualtrics — full industry org profile, people, and feed item
-- Sources: qualtrics.com/government, public filings, USASpending.gov

INSERT INTO orgs (
  id, full_name, branch, website, loc,
  profile
) VALUES (
  'qualtrics',
  'Qualtrics',
  'Industry',
  'https://www.qualtrics.com/government/',
  'Provo, UT',
  jsonb_build_object(
    'logo_url',         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Qualtrics_logo.svg/200px-Qualtrics_logo.svg.png',
    'mission',          'Help organizations deliver experiences that keep customers and employees coming back.',
    'full_description', 'Qualtrics is the leading experience management (XM) platform, trusted by 300+ federal agencies and 650+ state and local governments to capture, analyze, and act on feedback from residents and employees. Founded in 2002, Qualtrics is FedRAMP High authorized and DISA IL4 certified — meeting the most stringent federal security and data residency requirements. The platform powers citizen experience programs, employee listening, and digital services measurement across every federal cabinet-level department, helping agencies operate with leaner teams and rising public expectations.',
    'employees',        '5000',
    'founded',          '2002',
    'company_type',     'Experience Management (XM) Platform',
    'phone',            NULL,
    'contract_vehicles', jsonb_build_array(
      jsonb_build_object(
        'name',        'GSA MAS Schedule 70',
        'number',      '47QTCA19D00DE',
        'description', 'Multiple Award Schedule for IT products and services. Covers XM Platform SaaS licenses, professional services, and implementation support for federal agencies.'
      ),
      jsonb_build_object(
        'name',        'VA Enterprise XM BPA',
        'number',      '36C10B21A0039',
        'description', 'Department of Veterans Affairs enterprise Blanket Purchase Agreement for the Qualtrics XM Platform — enabling veteran and employee experience measurement across VA facilities and programs.'
      ),
      jsonb_build_object(
        'name',        'NASA SEWP V',
        'number',      'NNG15SC98B',
        'description', 'NASA Solutions for Enterprise-Wide Procurement (SEWP) V vehicle for IT products including Qualtrics XM Platform licenses and support across federal agencies.'
      ),
      jsonb_build_object(
        'name',        'DoD CX IDIQ',
        'number',      NULL,
        'description', 'Department of Defense customer experience IDIQ supporting servicemember and civilian employee experience measurement across DoD commands including USTRANSCOM and USTRATCOM.'
      ),
      jsonb_build_object(
        'name',        'OPM Federal Employee Viewpoint Survey (FEVS) Platform',
        'number',      NULL,
        'description', 'Multi-year agreement with the Office of Personnel Management to power the Federal Employee Viewpoint Survey — the government-wide annual employee engagement and satisfaction survey.'
      )
    ),
    'services', jsonb_build_array(
      jsonb_build_object(
        'name',        'Citizen Experience (CX)',
        'tagline',     'Turn resident feedback into faster service.',
        'description', 'Qualtrics captures omnichannel feedback from residents across digital services, contact centers, and in-person touchpoints. AI-powered analytics surface friction points, and automated workflows route issues to the right teams — helping agencies improve CSAT and digital adoption at scale.',
        'sub_services', jsonb_build_array(
          jsonb_build_object('name', 'Omnichannel Feedback Capture',    'description', 'Unified collection across web, mobile, phone, email, and in-person channels — meeting residents where they are.'),
          jsonb_build_object('name', 'AI-Powered Insights',              'description', 'Automated pattern detection across millions of feedback signals to surface root causes of service failure.'),
          jsonb_build_object('name', 'Closed-Loop Service Recovery',     'description', 'Automated workflows that route negative feedback to the right team member for real-time resolution.'),
          jsonb_build_object('name', 'Digital Services Measurement',     'description', 'Measure resident satisfaction with digital properties in compliance with OMB Circular A-11 Section 280.'),
          jsonb_build_object('name', '21st Century IDEA Compliance',     'description', 'Purpose-built measurement and reporting tools to meet federal digital experience improvement mandates.')
        )
      ),
      jsonb_build_object(
        'name',        'Employee Experience (EX)',
        'tagline',     'Listen to your workforce. Act on what matters.',
        'description', 'Qualtrics powers federal employee listening programs — from annual viewpoint surveys to pulse checks and lifecycle surveys — giving agency leaders real-time visibility into workforce engagement, retention risk, and mission readiness.',
        'sub_services', jsonb_build_array(
          jsonb_build_object('name', 'Annual Employee Surveys',           'description', 'Scalable survey programs including FEVS administration, analysis, and action planning for agencies of any size.'),
          jsonb_build_object('name', 'Pulse & Lifecycle Listening',       'description', 'Continuous listening at key moments — onboarding, milestone check-ins, and exit — to reduce attrition and improve retention.'),
          jsonb_build_object('name', 'Manager Effectiveness Dashboards',  'description', 'Real-time visibility into team health and engagement signals, enabling managers to act before issues escalate.'),
          jsonb_build_object('name', 'DE&I Measurement',                  'description', 'Benchmark and track diversity, equity, and inclusion progress across workforce segments.'),
          jsonb_build_object('name', 'Workforce Wellbeing',               'description', 'Measure and monitor employee wellbeing, burnout risk, and psychological safety across agency teams.')
        )
      ),
      jsonb_build_object(
        'name',        'XM Platform & Integrations',
        'tagline',     'Connect experience data to your existing systems.',
        'description', 'The Qualtrics XM Platform integrates with ServiceNow, Salesforce, Adobe, and Oracle to connect experience data to operational workflows. FedRAMP High authorized with CONUS-based data centers and DISA IL4 certification for the most sensitive government use cases.',
        'sub_services', jsonb_build_array(
          jsonb_build_object('name', 'FedRAMP High Authorization',        'description', 'Full FedRAMP High ATO covering the XM Platform for federal civilian and DoD use cases with sensitive data.'),
          jsonb_build_object('name', 'DISA IL4 Certification',            'description', 'Impact Level 4 certification enabling deployment for Controlled Unclassified Information (CUI) in DoD environments.'),
          jsonb_build_object('name', 'ServiceNow Integration',            'description', 'Bi-directional integration routing experience signals into ServiceNow ITSM workflows for automated ticket creation and resolution.'),
          jsonb_build_object('name', 'CONUS Data Residency',              'description', 'All government data stored exclusively in US-based data centers meeting federal data sovereignty requirements.'),
          jsonb_build_object('name', 'API & Developer Tools',             'description', 'RESTful APIs and pre-built connectors for integrating Qualtrics data into agency dashboards, CRMs, and BI tools.')
        )
      ),
      jsonb_build_object(
        'name',        'Contact Center Analytics',
        'tagline',     'Make every interaction count.',
        'description', 'Qualtrics captures and analyzes every resident interaction across phone, chat, email, and web — using AI to surface trends, reduce call volume through self-service optimization, and improve agent performance across federal contact center operations.',
        'sub_services', jsonb_build_array(
          jsonb_build_object('name', 'Post-Call Surveys',                 'description', 'Automated feedback capture immediately after contact center interactions to measure resolution and satisfaction.'),
          jsonb_build_object('name', 'Conversational Analytics',          'description', 'AI analysis of call recordings and chat transcripts to identify root causes and coaching opportunities.'),
          jsonb_build_object('name', 'Agent Performance Coaching',        'description', 'Data-driven coaching recommendations for contact center managers based on interaction quality scores.'),
          jsonb_build_object('name', 'Deflection Analytics',              'description', 'Identify the most common reasons residents call and prioritize self-service improvements to reduce volume.')
        )
      )
    ),
    'case_studies', jsonb_build_array(
      jsonb_build_object(
        'title',    'VA Enterprise XM — Veteran Experience Measurement at Scale',
        'client',   'U.S. Department of Veterans Affairs',
        'problem',  'VA needed a unified platform to measure veteran experience across 170+ medical centers and 1,400+ clinics — replacing fragmented survey tools with inconsistent data.',
        'approach', 'Deployed Qualtrics XM Platform under the VA Enterprise BPA, enabling standardized veteran feedback collection across facilities and providing real-time dashboards for facility directors and VHA leadership.',
        'outcome',  'VA now measures veteran experience consistently across the enterprise, with facility-level and system-wide dashboards enabling data-driven service improvements.',
        'url',      'https://www.qualtrics.com/government/'
      ),
      jsonb_build_object(
        'title',    'USTRANSCOM — Servicemember & Employee Experience Program',
        'client',   'U.S. Transportation Command',
        'problem',  'USTRANSCOM lacked real-time visibility into servicemember and civilian employee satisfaction, making it difficult to identify and address experience gaps across a globally distributed workforce.',
        'approach', 'Implemented Qualtrics XM Platform for continuous employee listening, post-interaction surveys for transportation services, and executive dashboards tracking experience KPIs.',
        'outcome',  'USTRANSCOM gained a continuous view of workforce and servicemember satisfaction, enabling faster identification and resolution of experience pain points.',
        'url',      'https://www.qualtrics.com/government/'
      ),
      jsonb_build_object(
        'title',    'OPM Federal Employee Viewpoint Survey (FEVS)',
        'client',   'Office of Personnel Management',
        'problem',  'OPM needed a modern, scalable platform to administer the annual FEVS across the entire federal workforce — collecting, analyzing, and reporting on government-wide employee engagement data.',
        'approach', 'Qualtrics powers the FEVS platform, providing survey design, real-time analytics, and agency-level reporting dashboards — enabling OPM and individual agencies to understand engagement trends and take targeted action.',
        'outcome',  'The FEVS on Qualtrics reaches over a million federal employees annually, with agencies receiving granular engagement data to inform workforce improvement plans.',
        'url',      'https://www.qualtrics.com/government/'
      ),
      jsonb_build_object(
        'title',    'Digital Services Measurement — OMB A-11 Compliance',
        'client',   'Multiple Federal Agencies',
        'problem',  'OMB Circular A-11 Section 280 requires federal agencies to measure and publicly report citizen satisfaction with high-impact service providers (HISPs) — but many agencies lacked the tools to collect and report this data.',
        'approach', 'Deployed Qualtrics CX measurement across HISP digital properties, providing standardized survey instruments, real-time dashboards, and automated OMB reporting for compliance.',
        'outcome',  'Agencies achieved A-11 compliance while gaining actionable insight into which digital services were meeting — and falling short of — resident expectations.',
        'url',      'https://www.qualtrics.com/government/'
      )
    )
  )
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  branch    = EXCLUDED.branch,
  website   = EXCLUDED.website,
  loc       = EXCLUDED.loc,
  profile   = EXCLUDED.profile;

-- Leadership contacts
INSERT INTO contacts (id, org_id, name, title, hierarchy_order, linkedin)
VALUES
  ('qualtrics-zig-serafin',    'qualtrics', 'Zig Serafin',      'Chief Executive Officer',              1, NULL),
  ('qualtrics-brad-anderson',  'qualtrics', 'Brad Anderson',    'President, Products & Engineering',    1, NULL),
  ('qualtrics-jay-choi',       'qualtrics', 'Jay Choi',         'Chief Product Officer',                2, NULL),
  ('qualtrics-kelly-wright',   'qualtrics', 'Kelly Wright',     'Chief Revenue Officer',                2, NULL),
  ('qualtrics-govt-vp',        'qualtrics', 'Garth Fort',       'VP & GM, Public Sector',               2, NULL)
ON CONFLICT (id) DO UPDATE SET
  org_id          = EXCLUDED.org_id,
  name            = EXCLUDED.name,
  title           = EXCLUDED.title,
  hierarchy_order = EXCLUDED.hierarchy_order,
  linkedin        = EXCLUDED.linkedin;
