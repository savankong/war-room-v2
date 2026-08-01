-- Seed representative contract awards for Skylight Digital LLC
-- id is UUID in the live DB; deduplicate via title + canonical_org_id check

INSERT INTO contracts (
  title, signal_type, awardee, canonical_org_id,
  value, award_date, agency_or_lab, status, source
)
SELECT title, signal_type, awardee, canonical_org_id, value, award_date, agency_or_lab, status, source
FROM (VALUES
  (
    'USAF BESPIN Design Studio — UX & Design Services SBIR Phase III IDIQ',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    8500000::bigint, '2022-06-01'::timestamp, 'U.S. Air Force / BESPIN', 'Sole Source', 'usaspending'
  ),
  (
    'Advanced Battle Management System (ABMS) IDIQ — Digital Architecture & App Dev',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    15000000::bigint, '2022-09-01'::timestamp, 'U.S. Air Force', 'Sole Source', 'usaspending'
  ),
  (
    'HHS ACF Digital Platform VIBES IDIQ — Citizen-Facing Services Modernization',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    30000000::bigint, '2023-03-15'::timestamp, 'HHS / Administration for Children & Families', 'Competed', 'usaspending'
  ),
  (
    'NARA PERMA IDIQ — Digital Records Management Modernization',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    30000000::bigint, '2023-07-01'::timestamp, 'National Archives and Records Administration', 'Competed', 'usaspending'
  ),
  (
    'CDC PRIME / DMI Blanket Purchase Agreement — Public Health Data Modernization',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    12000000::bigint, '2021-08-01'::timestamp, 'Centers for Disease Control and Prevention', 'Competed', 'usaspending'
  ),
  (
    'USCIS E-Verify Modernization — Human-Centered Design & Agile Delivery',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    5200000::bigint, '2020-04-01'::timestamp, 'U.S. Citizenship and Immigration Services', 'Competed', 'usaspending'
  ),
  (
    'CMS MPSM — MACBIS Product Strategy & Agile Delivery (Subcontract)',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    8000000::bigint, '2019-10-01'::timestamp, 'Centers for Medicare & Medicaid Services', 'Sole Source', 'usaspending'
  ),
  (
    'VA Diffusion Marketplace — Knowledge Management Platform Design & Development',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    3800000::bigint, '2020-09-01'::timestamp, 'Department of Veterans Affairs', 'Competed', 'usaspending'
  ),
  (
    'TSA Cloud Adoption Acceleration — Cloud Migration & DevSecOps',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    4500000::bigint, '2021-05-01'::timestamp, 'Transportation Security Administration', 'Competed', 'usaspending'
  ),
  (
    'Connecticut Early Childhood Office — Multi-Year Digital Transformation',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    6200000::bigint, '2022-01-15'::timestamp, 'State of Connecticut', 'Competed', 'usaspending'
  ),
  (
    'GSA MAS Task Order — Agile Digital Services (Various Agencies)',
    'Award', 'Skylight Digital LLC', 'skylight-digital',
    2100000::bigint, '2023-10-01'::timestamp, 'General Services Administration', 'Competed', 'usaspending'
  )
) AS v(title, signal_type, awardee, canonical_org_id, value, award_date, agency_or_lab, status, source)
WHERE NOT EXISTS (
  SELECT 1 FROM contracts c
  WHERE c.canonical_org_id = v.canonical_org_id
    AND c.title = v.title
);
