UPDATE orgs
SET profile = profile || jsonb_build_object('logo_url', '/logos/qualtrics.svg')
WHERE id = 'qualtrics';
