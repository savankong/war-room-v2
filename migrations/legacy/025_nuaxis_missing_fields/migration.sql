-- NuAxis: add mission, full_description, phone, and case_studies to profile
-- (migration 023 was skipped in production because profile was NULL at the time)
UPDATE orgs
SET profile = COALESCE(profile, '{}'::jsonb)
  || jsonb_build_object(
    'mission',          'Making a difference through the passionate application of technology.',
    'full_description', 'NuAxis Innovations is a solution-driven IT infrastructure support contractor for the federal government. As a leading IT partner with proven success in large agencies including the Department of the Interior (DOI) and the Department of Labor (DOL) NuAxis delivers value and expertise. The company was founded in 2002 by a team of passionate technologists and now has more than 400 employees across 22 states.',
    'phone',            '703-481-7400',
    'case_studies',     '[{"title":"CCaaS System Migration with HCD","client":"Federal Agency","problem":"Legacy telephony infrastructure blocking modernization of citizen-facing contact center operations","approach":"Applied Human-Centered Design principles to migrate to cloud-based CCaaS platform, ensuring continuity and improving CX","outcome":"Seamless system cutover with zero service disruption and measurably improved citizen experience scores","url":"https://nuaxis.com/facilitating-a-ccaas-system-migration-with-hcd/"}]'::jsonb
  )
WHERE id = 'nuaxis-innovations';
