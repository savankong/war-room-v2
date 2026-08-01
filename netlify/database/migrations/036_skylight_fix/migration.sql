-- Fix 1: Convert sub_services from string arrays to {name, description} objects
-- The Discover UI renders sub.name and sub.description — plain strings show as empty bullets

UPDATE orgs
SET profile = profile || jsonb_build_object(
  'services', jsonb_build_array(
    jsonb_build_object(
      'name',        'Service Delivery',
      'tagline',     'Ship working software, fast.',
      'description', 'Skylight builds modern digital products and platforms for government agencies using agile methods, user-centered design, and open-source technology. The team runs full product cycles — discovery, design, development, and launch — with embedded practitioners who work alongside agency teams.',
      'sub_services', jsonb_build_array(
        jsonb_build_object('name', 'Agile Software Development',       'description', 'Iterative delivery using scrum, kanban, and XP practices tailored for the federal environment.'),
        jsonb_build_object('name', 'Human-Centered Design & UX Research', 'description', 'User interviews, usability testing, journey mapping, and design sprints to ground products in real user needs.'),
        jsonb_build_object('name', 'Cloud-Native Architecture',        'description', 'Containerized, scalable systems on AWS, Azure, and GCP that meet FedRAMP and DoD IL requirements.'),
        jsonb_build_object('name', 'API Development & Integration',    'description', 'RESTful and event-driven APIs that connect legacy systems and enable data sharing across agencies.'),
        jsonb_build_object('name', 'Accessibility (508 Compliance)',   'description', 'WCAG 2.1 AA–compliant interfaces tested with assistive technology users throughout the product lifecycle.'),
        jsonb_build_object('name', 'DevSecOps & CI/CD',                'description', 'Automated pipelines with security scanning, compliance as code, and continuous deployment to government environments.')
      )
    ),
    jsonb_build_object(
      'name',        'Procurement Transformation',
      'tagline',     'Buy better. Get better results.',
      'description', 'Skylight advises agencies on modernizing how they acquire technology — moving from waterfall mega-contracts to modular, outcome-based procurement. Services include acquisition strategy, market research, solicitation writing, and vendor evaluation to reduce risk and accelerate delivery.',
      'sub_services', jsonb_build_array(
        jsonb_build_object('name', 'Acquisition Strategy & Planning',   'description', 'Right-sizing contracts, identifying appropriate vehicles, and structuring buys for competitive and agile delivery.'),
        jsonb_build_object('name', 'Modular Contracting Design',        'description', 'Breaking monolithic programs into smaller, lower-risk contracts that preserve competition and speed delivery.'),
        jsonb_build_object('name', 'Solicitation Writing (PWS/SOO/RFP)', 'description', 'Plain-language performance work statements and solicitations that attract capable modern vendors.'),
        jsonb_build_object('name', 'Industry Day & Market Research',    'description', 'RFIs, industry days, and one-on-one sessions to understand the market before committing to an approach.'),
        jsonb_build_object('name', 'Source Selection Support',          'description', 'Evaluation criteria design and technical evaluation support to select the best value vendor.'),
        jsonb_build_object('name', 'Agile Contract Vehicles',           'description', 'Standing up and leveraging GWAC and agency IDIQ vehicles optimized for iterative digital delivery.')
      )
    ),
    jsonb_build_object(
      'name',        'Digital Transformation',
      'tagline',     'Build the capability to keep improving.',
      'description', 'Skylight helps agencies develop lasting internal digital capacity — not just delivering projects but embedding skills, processes, and culture that persist after the engagement ends.',
      'sub_services', jsonb_build_array(
        jsonb_build_object('name', 'Product Management Coaching',       'description', 'Embedding product managers and coaching agency staff to own roadmaps, prioritize backlogs, and lead delivery.'),
        jsonb_build_object('name', 'Digital Capability Building',       'description', 'Standing up internal product teams, design practices, and engineering guilds that outlast the contract.'),
        jsonb_build_object('name', 'Technology Assessment & Strategy',  'description', 'Evaluating existing systems and recommending modernization paths that balance risk, cost, and mission need.'),
        jsonb_build_object('name', 'Legacy System Modernization',       'description', 'Incremental strangler-fig strategies to replace aging systems without big-bang risk.'),
        jsonb_build_object('name', 'Operating Model Design',            'description', 'Redesigning how agencies organize teams, fund products, and govern technology investment decisions.')
      )
    ),
    jsonb_build_object(
      'name',        'Microconsulting',
      'tagline',     'Expert advice, fast.',
      'description', 'Short-format consulting engagements — typically one to two weeks — providing targeted expert analysis on technology decisions, acquisition questions, or product strategy.',
      'sub_services', jsonb_build_array(
        jsonb_build_object('name', 'Technology Decision Analysis',  'description', 'Rapid evaluation of build-vs-buy, platform selection, or architecture options with a clear recommendation.'),
        jsonb_build_object('name', 'Procurement Strategy Sprint',   'description', 'One-week sprint to define the right acquisition approach for a specific program or initiative.'),
        jsonb_build_object('name', 'UX Audit',                      'description', 'Heuristic review and user testing of an existing digital product with prioritized remediation findings.'),
        jsonb_build_object('name', 'Architecture Review',           'description', 'Independent assessment of a proposed or existing architecture against cloud, security, and scalability standards.'),
        jsonb_build_object('name', 'Rapid Discovery',               'description', 'Compressed user research and problem framing to establish a clear problem definition before procurement or build.')
      )
    ),
    jsonb_build_object(
      'name',        'Training & Coaching',
      'tagline',     'Build skills that stick.',
      'description', 'Hands-on training programs for government employees covering agile product management, human-centered design, digital acquisition, and modern engineering practices.',
      'sub_services', jsonb_build_array(
        jsonb_build_object('name', 'Agile Product Management for Government', 'description', 'Multi-day course teaching federal product managers to own backlogs, run sprints, and measure outcome-based success.'),
        jsonb_build_object('name', 'Digital Acquisition Accelerator',         'description', 'Cohort-based program building agency acquisition teams'' ability to buy and manage agile digital contracts.'),
        jsonb_build_object('name', 'Human-Centered Design Bootcamp',          'description', 'Intensive workshop teaching government teams to conduct user research, map journeys, and prototype solutions.'),
        jsonb_build_object('name', 'Modern Engineering Practices',            'description', 'Hands-on coaching in CI/CD, test-driven development, containerization, and DevSecOps for government developers.'),
        jsonb_build_object('name', 'Design Thinking Workshops',               'description', 'Half-day to multi-day workshops helping leadership teams apply design thinking to mission and organizational challenges.')
      )
    )
  )
)
WHERE id = 'skylight-digital';

-- Fix 2: Re-insert contacts (in case migration 035 contacts failed)
INSERT INTO contacts (id, org_id, name, title, hierarchy_order, linkedin)
VALUES
  ('skylight-eleanor-hyman',   'skylight-digital', 'Eleanor Hyman',   'Chief Executive Officer',   1, 'https://www.linkedin.com/in/eleanor-hyman/'),
  ('skylight-chris-cairns',    'skylight-digital', 'Chris Cairns',    'President & Co-Founder',    1, 'https://www.linkedin.com/in/chriscairns/'),
  ('skylight-nicole-campbell', 'skylight-digital', 'Nicole Campbell', 'Chief Operating Officer',   2, NULL),
  ('skylight-katie-gwinn',     'skylight-digital', 'Katie Gwinn',     'Chief Financial Officer',   2, NULL),
  ('skylight-josh-dorothy',    'skylight-digital', 'Josh Dorothy',    'Chief Information Officer', 2, NULL)
ON CONFLICT (id) DO UPDATE SET
  org_id          = EXCLUDED.org_id,
  name            = EXCLUDED.name,
  title           = EXCLUDED.title,
  hierarchy_order = EXCLUDED.hierarchy_order,
  linkedin        = EXCLUDED.linkedin;
