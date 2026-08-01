-- Fix Qualtrics logo URL — use official CDN asset instead of Wikipedia
UPDATE orgs
SET profile = profile || jsonb_build_object(
  'logo_url', 'https://www.qualtrics.com/m/assets/wp-content/uploads/2021/03/qualtrics-logo.svg'
)
WHERE id = 'qualtrics';
