-- Remove url field from all prime contract vehicles — direct USASpending award URLs
-- require exact agency sub-codes and cannot be reliably constructed from PIID alone.
-- Contract numbers remain displayed as badges; users can search SAM.gov or USASpending directly.

UPDATE industry_companies
SET profile = jsonb_set(
  profile,
  '{contract_vehicles}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN jsonb_typeof(v) = 'object' THEN v - 'url'
        ELSE v
      END
    )
    FROM jsonb_array_elements(profile->'contract_vehicles') AS v
  )
)
WHERE profile ? 'contract_vehicles'
  AND jsonb_typeof(profile->'contract_vehicles') = 'array';
