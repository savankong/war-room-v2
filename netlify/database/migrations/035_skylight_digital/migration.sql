-- Skylight Digital (Skylight Inc.) — full industry profile
-- Source: skylight.digital, contract data from USASpending.gov / SAM.gov

INSERT INTO orgs (
  id, full_name, branch, website, loc,
  profile
) VALUES (
  'skylight-digital',
  'Skylight Digital LLC',
  'Industry',
  'https://skylight.digital',
  'Sarasota, FL',
  jsonb_build_object(
    'logo_url',         'https://skylight.digital/img/logo.svg',
    'mission',          'Make government work in a digital world.',
    'full_description', 'Skylight Digital is a digital consultancy helping government agencies modernize their services, procurement, and technology practices. Founded in 2017 by alumni of 18F, USDS, and the Presidential Innovation Fellows program, Skylight brings Silicon Valley product discipline to the public sector. The firm serves federal and state clients across health, defense, labor, and citizen services — delivering user research, agile software development, cloud migration, and procurement transformation. Skylight operates as a fully distributed team of ~164 people across 34 states.',
    'phone',            NULL,
    'contract_vehicles', jsonb_build_array(
      jsonb_build_object(
        'name',        'GSA MAS Schedule 70',
        'number',      '47QTCA18D00D0',
        'description', 'General Services Administration Multiple Award Schedule for IT services. SIN 54151S covers IT professional services including agile software delivery, human-centered design, and cloud services.'
      ),
      jsonb_build_object(
        'name',        'CDC PRIME / DMI BPA',
        'number',      '47QFSA21K0123',
        'description', 'Blanket Purchase Agreement under the CDC PRIME vehicle supporting public health data modernization, including disease surveillance and interoperability work.'
      ),
      jsonb_build_object(
        'name',        'USAF BESPIN Design Studio SBIR Phase III IDIQ',
        'number',      'FA877122D0003',
        'description', 'Air Force BESPIN Design Studio contract providing shared design infrastructure, UX research, and embedded design capability across Air Force software programs.'
      ),
      jsonb_build_object(
        'name',        'USAF ABMS IDIQ',
        'number',      'FA861222DB028',
        'description', 'Advanced Battle Management System IDIQ covering Category 0 Digital Architecture and Category 5 Application Development for the Air Force.'
      ),
      jsonb_build_object(
        'name',        'CDC DMAC (Subcontractor)',
        'number',      '47QFCA23F0058',
        'description', 'CDC Data Modernization and Analytics Contract — Skylight serves as a subcontractor supporting public health data pipeline and interoperability work.'
      ),
      jsonb_build_object(
        'name',        'CMS MPSM (Subcontractor)',
        'number',      '75FCMC19A0006',
        'description', 'CMS Medicare and Medicaid Systems Modernization contract — Skylight supports product strategy and agile delivery as a subcontractor.'
      ),
      jsonb_build_object(
        'name',        'HHS ACF Digital Platform VIBES IDIQ',
        'number',      NULL,
        'description', 'Approximately $30M IDIQ for the Administration for Children and Families digital platform modernization, covering citizen-facing services and data infrastructure.'
      ),
      jsonb_build_object(
        'name',        'NARA PERMA IDIQ',
        'number',      NULL,
        'description', 'Approximately $30M IDIQ for the National Archives and Records Administration PERMA digital records management modernization program.'
      )
    ),
    'services', jsonb_build_array(
      jsonb_build_object(
        'name',        'Service Delivery',
        'tagline',     'Ship working software, fast.',
        'description', 'Skylight builds modern digital products and platforms for government agencies using agile methods, user-centered design, and open-source technology. The team runs full product cycles — discovery, design, development, and launch — with embedded practitioners who work alongside agency teams.',
        'sub_services', jsonb_build_array(
          'Agile Software Development',
          'Human-Centered Design & UX Research',
          'Cloud-Native Architecture',
          'API Development & Integration',
          'Accessibility (508 Compliance)',
          'DevSecOps & CI/CD'
        )
      ),
      jsonb_build_object(
        'name',        'Procurement Transformation',
        'tagline',     'Buy better. Get better results.',
        'description', 'Skylight advises agencies on modernizing how they acquire technology — moving from waterfall mega-contracts to modular, outcome-based procurement. Services include acquisition strategy, market research, solicitation writing, and vendor evaluation to reduce risk and accelerate delivery.',
        'sub_services', jsonb_build_array(
          'Acquisition Strategy & Planning',
          'Modular Contracting Design',
          'Solicitation Writing (PWS/SOO/RFP)',
          'Industry Day & Market Research',
          'Source Selection Support',
          'Agile Contract Vehicles'
        )
      ),
      jsonb_build_object(
        'name',        'Digital Transformation',
        'tagline',     'Build the capability to keep improving.',
        'description', 'Skylight helps agencies develop lasting internal digital capacity — not just delivering projects but embedding skills, processes, and culture that persist after the engagement ends. This includes standing up product teams, training acquisition professionals, and establishing engineering practices.',
        'sub_services', jsonb_build_array(
          'Product Management Coaching',
          'Digital Capability Building',
          'Technology Assessment & Strategy',
          'Legacy System Modernization Planning',
          'Innovation Lab Stand-up',
          'Operating Model Design'
        )
      ),
      jsonb_build_object(
        'name',        'Microconsulting',
        'tagline',     'Expert advice, fast.',
        'description', 'Short-format consulting engagements — typically one to two weeks — providing targeted expert analysis on technology decisions, acquisition questions, or product strategy. Designed for agencies that need a quick, high-quality answer without a long SOW.',
        'sub_services', jsonb_build_array(
          'Technology Decision Analysis',
          'Procurement Strategy Sprint',
          'UX Audit',
          'Architecture Review',
          'Rapid Discovery'
        )
      ),
      jsonb_build_object(
        'name',        'Training & Coaching',
        'tagline',     'Build skills that stick.',
        'description', 'Hands-on training programs for government employees covering agile product management, human-centered design, digital acquisition, and modern engineering practices. Courses are adapted to the federal context and taught by practitioners with government delivery experience.',
        'sub_services', jsonb_build_array(
          'Agile Product Management for Government',
          'Digital Acquisition Accelerator',
          'Human-Centered Design Bootcamp',
          'Modern Engineering Practices',
          'Design Thinking Workshops'
        )
      )
    ),
    'case_studies', jsonb_build_array(
      jsonb_build_object(
        'title',    'E-Verify Modernization — USCIS',
        'client',   'U.S. Citizenship and Immigration Services',
        'problem',  'The legacy E-Verify system was difficult to use and unreliable, frustrating 800,000+ employers and risking compliance failures.',
        'approach', 'Applied human-centered design and agile delivery to redesign the E-Verify experience from the ground up, replacing a complex legacy workflow with a streamlined digital product.',
        'outcome',  'Delivered a modernized E-Verify system that gave over 800,000 employers faster, more reliable employment eligibility verification.',
        'url',      'https://skylight.digital/work/experience/uscis-everify-modernization/'
      ),
      jsonb_build_object(
        'title',    'MACBIS Transformation — CMS',
        'client',   'Centers for Medicare & Medicaid Services',
        'problem',  'A $100M+ portfolio of Medicare and Medicaid systems was managed as siloed IT projects with no product ownership, leading to duplicated effort and slow delivery.',
        'approach', 'Shifted CMS from project-based system management to a product-driven delivery model, establishing product teams, roadmaps, and agile practices across the portfolio.',
        'outcome',  'Transformed how CMS manages its MACBIS portfolio, accelerating delivery and reducing per-system overhead across a $100M+ investment.',
        'url',      'https://skylight.digital/work/experience/cms-macbis-transformation/'
      ),
      jsonb_build_object(
        'title',    'VA Diffusion Marketplace',
        'client',   'U.S. Department of Veterans Affairs',
        'problem',  'Proven healthcare innovations developed inside VA were not being shared across facilities, leaving 150 medical centers unable to benefit from each other''s best practices.',
        'approach', 'Built a knowledge management platform — the Diffusion Marketplace — enabling VA innovators to document, search, and replicate successful practices across the enterprise.',
        'outcome',  'Platform helped VA identify and spread proven healthcare innovations across 150 medical centers and nearly 1,400 clinics nationwide.',
        'url',      'https://skylight.digital/work/experience/va-diffusion-marketplace/'
      ),
      jsonb_build_object(
        'title',    'USAF BESPIN Design Studio',
        'client',   'U.S. Air Force / BESPIN',
        'problem',  'Air Force software programs lacked consistent design capability and UX talent, slowing product quality and creating fragmented user experiences across programs.',
        'approach', 'Established and operated the BESPIN Design Studio — a shared design service providing embedded designers, design systems, and UX research capability to multiple Air Force programs simultaneously.',
        'outcome',  'Delivered standing design infrastructure and expertise across Air Force software programs, embedding human-centered design into the service''s software factory model.',
        'url',      'https://skylight.digital/work/experience/air-force-bespin-design-studio/'
      ),
      jsonb_build_object(
        'title',    'CDC SimpleReport — COVID-19 Testing',
        'client',   'Centers for Disease Control and Prevention',
        'problem',  'Non-traditional testing facilities — schools, pharmacies, urgent care clinics — had no simple way to report COVID-19 test results to public health authorities.',
        'approach', 'Rapidly designed and built SimpleReport, a free web-based tool that makes it easy for under-resourced facilities to record and report diagnostic test results in minutes.',
        'outcome',  'Deployed nationally, SimpleReport became a critical piece of COVID-19 public health infrastructure — enabling timely disease surveillance across thousands of facilities.',
        'url',      'https://skylight.digital/work/experience/cdc-simplereport/'
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
  ('skylight-eleanor-hyman',   'skylight-digital', 'Eleanor Hyman',   'Chief Executive Officer',   1, 'https://www.linkedin.com/in/eleanor-hyman/'),
  ('skylight-chris-cairns',    'skylight-digital', 'Chris Cairns',    'President & Co-Founder',    1, 'https://www.linkedin.com/in/chriscairns/'),
  ('skylight-nicole-campbell', 'skylight-digital', 'Nicole Campbell', 'Chief Operating Officer',   2, NULL),
  ('skylight-katie-gwinn',     'skylight-digital', 'Katie Gwinn',     'Chief Financial Officer',   2, NULL),
  ('skylight-josh-dorothy',    'skylight-digital', 'Josh Dorothy',    'Chief Information Officer', 2, NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed feed item for Skylight
INSERT INTO feed_items (type, title, body, source, source_url, entity_name, entity_logo, tags, published_at)
VALUES (
  'company_update',
  'Skylight Digital Wins USAF BESPIN Design Studio IDIQ to Embed Design Capability Across Air Force Software Programs',
  'Skylight Digital has been awarded the USAF BESPIN Design Studio IDIQ (FA877122D0003), establishing a standing design service embedded within the Air Force''s BESPIN software factory. The contract provides shared UX research, design systems, and embedded product designers across multiple Air Force software programs simultaneously — bringing Silicon Valley product discipline to military software delivery at scale.',
  'Skylight Digital',
  'https://skylight.digital',
  'Skylight Digital LLC',
  'https://skylight.digital/img/logo.svg',
  ARRAY['Air Force','BESPIN','Design','Digital Services','Award'],
  NOW() - INTERVAL '11 days'
);
