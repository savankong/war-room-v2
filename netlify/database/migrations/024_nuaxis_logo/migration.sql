-- Update NuAxis logo to new square PNG
UPDATE orgs
SET profile = jsonb_set(
  COALESCE(profile, '{}'::jsonb),
  '{logo_url}',
  '"/logos/nuaxis.png"'::jsonb
)
WHERE id = 'nuaxis-innovations';

-- Also set logo_url column if it exists on the orgs table
UPDATE orgs
SET logo_url = '/logos/nuaxis.png'
WHERE id = 'nuaxis-innovations';
