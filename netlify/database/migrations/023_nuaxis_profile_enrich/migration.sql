UPDATE orgs SET profile = jsonb_set(
  jsonb_set(
    COALESCE(profile, '{}'::jsonb),
    '{contract_vehicles}',
    '[
      {"name": "GSA Multiple Award Schedule (MAS)", "number": "47QTCA24D008T", "description": "Long-term government-wide contract providing products and services at fair and reasonable prices to federal customers.", "sins": [{"code": "54151S", "name": "IT Professional Services", "description": "Widespread use of modern IT paradigms to ensure protection of data, increased administrative efficiencies, greater cost savings, and improved customer experience."}, {"code": "561422", "name": "Automated Contact Center Solutions (ACCS)", "description": "Provides federal agencies with easy access to contact center services for better interaction with citizens."}, {"code": "518210C", "name": "Cloud Computing and Cloud Related IT Professional Services", "description": "Provides federal agencies with easy access to comprehensive cloud computing solutions, including cloud migration, managed services, infrastructure modernization, and security."}]},
      {"name": "GSA OASIS+ UNR (Unrestricted)", "number": "47QRCA25DU445", "domains": "Technical & Engineering (T&E) and Management & Advisory (M&A)", "description": "One Acquisition Solution for Integrated Services Plus (OASIS+) is a suite of governmentwide, multi-award contracts designed to support federal agencies procurement requirements for services-based solutions."},
      {"name": "JVP – MakNuAx – GSA MAS", "number": "47QTCA22D002L", "description": "Joint Venture Partnership with MakNuAx under GSA Multiple Award Schedule.", "sins": [{"code": "54151S", "name": "IT Professional Services", "description": "Same scope as our prime GSA MAS — IT professional services across the federal enterprise."}]},
      {"name": "National Park Service (NPS) – IT Administration and Maintenance for Cultural Resources", "number": "", "description": "Provides systems development, software engineering, database administration, and helpdesk support across the CR program portfolio of applications."},
      {"name": "U.S. Fish & Wildlife Service (FWS) – IT Support Services BPA", "number": "140F0922A0005", "description": "Delivers IT services across the FWS to develop, maintain, and support current and future IT systems and operations."},
      {"name": "HHS Next-Generation IT Services (NGITS) Operations", "number": "HHSP233201800007B", "description": "End-to-end lifecycle support for HHS IT operational needs – across network, security, data center, contact center, and systems management."},
      {"name": "SeaPort Next Generation (NxG) – Naval Sea Systems Command", "number": "N0017825D7634", "description": "The Navy Virtual SYSCOM Commanders integrated approach to contracting for Professional Support Services (PSS) — covering NAVAIR, NAVFAC, NAVSEA, NAVSUP, NAVWAR, ONR, MSC, and USMC.", "url": "https://www.navysea.navy.mil/Business-Opportunities/Seaport-NxG/"}
    ]'::jsonb
  ),
  '{services}',
  '[
    {"name": "NuAI Accelerators", "description": "AI-powered accelerators that transform federal operations, citizen experience, and mission delivery — from contact center AI to intelligent DataOps.", "capabilities": ["NuAI for CX", "NuAI for Security", "NuAI for AI-Assisted Development", "NuAI for ITSM", "NuAI for DataOps"]},
    {"name": "Mission Systems + Applications", "description": "We build the systems and apps that power your mission. We know the tech and the tools you need to deliver efficiencies and experiences at scale.", "capabilities": ["DevSecCXOps", "Big Data", "AI/ML", "Applied CX"]},
    {"name": "Platforms", "description": "Our team can help you turn your IT investment into measurable impact. We are experts in platforms to make modernization a reality.", "capabilities": ["ServiceNow", "Medallia", "AWS", "Microsoft", "Salesforce", "Nexthink", "Qualtrics", "Unqork", "Appian", "Atlassian"]},
    {"name": "Operations", "description": "IT operations is where efficiencies begin. We build, optimize, and scale your infrastructure to ensure reliability, security, and cost-savings.", "capabilities": ["Cloud", "Enterprise IT Operations", "Consolidation", "Contact Center"]}
  ]'::jsonb
)
WHERE id = 'nuaxis-innovations';
