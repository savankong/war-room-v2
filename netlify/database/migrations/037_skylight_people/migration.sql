-- Update Skylight Digital org profile with accurate data from skylight.digital/company/about/
UPDATE orgs
SET profile = profile || jsonb_build_object(
  'employees',     '164',
  'founded',       '2017',
  'company_type',  'Digital Consultancy',
  'full_description', 'Skylight Digital is a digital consultancy helping government agencies modernize their services, procurement, and technology practices. Founded in June 2017 by alumni of 18F, the U.S. Digital Service, and the Presidential Innovation Fellows program, Skylight brings Silicon Valley product discipline to the public sector. The firm is organized into two business units — Federal Health & Civilian and Defense & Security — and operates as a fully distributed team of 164 people across 34 states. Skylight serves federal and state clients across health, defense, labor, and citizen services, delivering user research, agile software development, cloud migration, and procurement transformation.'
)
WHERE id = 'skylight-digital';

-- Add VP-level and director-level contacts
INSERT INTO contacts (id, org_id, name, title, hierarchy_order, linkedin)
VALUES
  ('skylight-leslie-franklin', 'skylight-digital', 'Leslie Garner Franklin', 'VP, Federal Health & Civilian', 2, NULL),
  ('skylight-taylor-graue',    'skylight-digital', 'Taylor Graue',           'VP, Defense & Security',        2, NULL),
  ('skylight-jennifer-wilhelm','skylight-digital', 'Jennifer Wilhelm',        'Operations Director',           3, NULL),
  ('skylight-jenny-payne',     'skylight-digital', 'Jenny Payne',             'Head of People Operations',     3, NULL),
  ('skylight-jeff-auser',      'skylight-digital', 'Jeff Auser',              'Head of Contracts',             3, NULL)
ON CONFLICT (id) DO UPDATE SET
  org_id          = EXCLUDED.org_id,
  name            = EXCLUDED.name,
  title           = EXCLUDED.title,
  hierarchy_order = EXCLUDED.hierarchy_order,
  linkedin        = EXCLUDED.linkedin;

-- Also ensure C-suite is correct
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
