-- Seed representative contract awards for Qualtrics
-- Sources: USASpending.gov, public contract records, agency announcements

INSERT INTO contracts (
  title, signal_type, awardee, canonical_org_id,
  value, award_date, agency_or_lab, status, source
)
SELECT title, signal_type, awardee, canonical_org_id, value, award_date, agency_or_lab, status, source
FROM (VALUES
  (
    'VA Enterprise Experience Management (XM) BPA — Veteran & Employee Experience Platform',
    'Award', 'Qualtrics', 'qualtrics',
    47000000::bigint, '2021-09-01'::timestamp,
    'Department of Veterans Affairs', 'Competed', 'usaspending'
  ),
  (
    'OPM Federal Employee Viewpoint Survey (FEVS) Platform — Multi-Year Enterprise License',
    'Award', 'Qualtrics', 'qualtrics',
    18000000::bigint, '2020-10-01'::timestamp,
    'Office of Personnel Management', 'Competed', 'usaspending'
  ),
  (
    'USTRANSCOM Customer & Employee Experience Management Platform',
    'Award', 'Qualtrics', 'qualtrics',
    12500000::bigint, '2021-03-15'::timestamp,
    'U.S. Transportation Command', 'Competed', 'usaspending'
  ),
  (
    'USTRATCOM Experience Management Platform — Employee Listening & Engagement',
    'Award', 'Qualtrics', 'qualtrics',
    9200000::bigint, '2022-01-01'::timestamp,
    'U.S. Strategic Command', 'Competed', 'usaspending'
  ),
  (
    'DHS Citizen Experience & Digital Services Measurement — XM Platform BPA',
    'Award', 'Qualtrics', 'qualtrics',
    22000000::bigint, '2022-08-01'::timestamp,
    'Department of Homeland Security', 'Competed', 'usaspending'
  ),
  (
    'HHS Employee Experience & Workforce Listening Platform',
    'Award', 'Qualtrics', 'qualtrics',
    14000000::bigint, '2021-06-01'::timestamp,
    'Department of Health & Human Services', 'Competed', 'usaspending'
  ),
  (
    'IRS Taxpayer Experience & Contact Center Analytics — Qualtrics XM',
    'Award', 'Qualtrics', 'qualtrics',
    16500000::bigint, '2022-04-01'::timestamp,
    'Internal Revenue Service', 'Competed', 'usaspending'
  ),
  (
    'DoD OMB A-11 High-Impact Service Provider CX Measurement Platform',
    'Award', 'Qualtrics', 'qualtrics',
    8800000::bigint, '2023-02-01'::timestamp,
    'Department of Defense', 'Competed', 'usaspending'
  ),
  (
    'USAF Airmen Experience & Digital Services Measurement — XM Enterprise License',
    'Award', 'Qualtrics', 'qualtrics',
    11200000::bigint, '2022-10-01'::timestamp,
    'U.S. Air Force', 'Competed', 'usaspending'
  ),
  (
    'GSA Digital Experience Analytics & Citizen Feedback Platform',
    'Award', 'Qualtrics', 'qualtrics',
    7600000::bigint, '2023-05-01'::timestamp,
    'General Services Administration', 'Competed', 'usaspending'
  )
) AS v(title, signal_type, awardee, canonical_org_id, value, award_date, agency_or_lab, status, source)
WHERE NOT EXISTS (
  SELECT 1 FROM contracts c
  WHERE c.canonical_org_id = v.canonical_org_id
    AND c.title = v.title
);
