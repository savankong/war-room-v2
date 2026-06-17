UPDATE orgs
SET profile = profile || '{
  "phone": "703-481-7400",
  "case_studies": [{
    "title": "CCaaS System Migration with HCD",
    "client": "Federal Agency",
    "problem": "Legacy telephony infrastructure blocking modernization of citizen-facing contact center operations",
    "approach": "Applied Human-Centered Design principles to migrate to cloud-based CCaaS platform, ensuring continuity and improving CX",
    "outcome": "Seamless system cutover with zero service disruption and measurably improved citizen experience scores",
    "url": "https://nuaxis.com/facilitating-a-ccaas-system-migration-with-hcd/"
  }]
}'::jsonb
WHERE id = 'nuaxis-innovations'
  AND profile IS NOT NULL;
