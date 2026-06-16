-- Migration 019: Backfill canonical_org_id on contracts
-- Maps service_branch (dot-separated hierarchy paths from SAM.gov/USASpending)
-- and agency_or_lab to text org slugs in the orgs table.
-- Only sets rows where canonical_org_id IS NULL (idempotent).

UPDATE contracts
SET canonical_org_id = CASE
  -- ── Military Departments (SAM.gov dotted paths, most specific first) ──────
  WHEN service_branch ILIKE '%MARINE%'                              THEN 'hqmc'
  WHEN service_branch ILIKE '%SPACE FORCE%'                         THEN 'sf-hq'
  WHEN service_branch ILIKE '%DEPT OF THE AIR FORCE%'
    OR service_branch ILIKE '%DEPARTMENT OF THE AIR FORCE%'         THEN 'af'
  WHEN service_branch ILIKE '%DEPT OF THE NAVY%'
    OR service_branch ILIKE '%DEPARTMENT OF THE NAVY%'              THEN 'navy'
  WHEN service_branch ILIKE '%DEPT OF THE ARMY%'
    OR service_branch ILIKE '%DEPARTMENT OF THE ARMY%'              THEN 'army'

  -- ── Defense Agencies ─────────────────────────────────────────────────────
  WHEN service_branch ILIKE '%DEFENSE ADVANCED RESEARCH%'
    OR service_branch ILIKE '%DARPA%'
    OR agency_or_lab  ILIKE 'DARPA'                                 THEN 'darpa'
  WHEN service_branch ILIKE '%MISSILE DEFENSE%'
    OR service_branch ILIKE '%MDA%'
    OR agency_or_lab  = 'MDA'                                       THEN 'mda'
  WHEN service_branch ILIKE '%DEFENSE INFORMATION SYSTEMS%'
    OR service_branch ILIKE '%DISA%'
    OR agency_or_lab  = 'DISA'                                      THEN 'disa'
  WHEN service_branch ILIKE '%DEFENSE INTELLIGENCE%'
    OR agency_or_lab  = 'DIA'                                       THEN 'dia'
  WHEN service_branch ILIKE '%DEFENSE LOGISTICS%'
    OR service_branch ILIKE '%DLA %'
    OR agency_or_lab  = 'DLA'                                       THEN 'dla'
  WHEN service_branch ILIKE '%DEFENSE HEALTH%'
    OR service_branch ILIKE '%DHA%'
    OR agency_or_lab  = 'DHA'                                       THEN 'dha'
  WHEN service_branch ILIKE '%NATIONAL GEOSPATIAL%'
    OR service_branch ILIKE '%NGA%'
    OR agency_or_lab  = 'NGA'                                       THEN 'nga'
  WHEN service_branch ILIKE '%NATIONAL RECONNAISSANCE%'
    OR service_branch ILIKE '%NRO%'
    OR agency_or_lab  = 'NRO'                                       THEN 'nro'
  WHEN service_branch ILIKE '%DEFENSE SECURITY COOPERATION%'
    OR service_branch ILIKE '%DSCA%'
    OR agency_or_lab  = 'DSCA'                                      THEN 'dsca'
  WHEN service_branch ILIKE '%DEFENSE THREAT REDUCTION%'
    OR service_branch ILIKE '%DTRA%'
    OR agency_or_lab  = 'DTRA'                                      THEN 'dtra'
  WHEN service_branch ILIKE '%DEFENSE CONTRACT AUDIT%'
    OR service_branch ILIKE '%DCAA%'                                THEN 'osd'
  WHEN service_branch ILIKE '%DEFENSE SECURITY SERVICE%'
    OR service_branch ILIKE '%DCSA%'
    OR agency_or_lab  = 'DCSA'                                      THEN 'dcsa'
  WHEN service_branch ILIKE '%DEFENSE FINANCE%'
    OR service_branch ILIKE '%DFAS%'
    OR agency_or_lab  = 'DFAS'                                      THEN 'dfas'
  WHEN service_branch ILIKE '%WASHINGTON HEADQUARTERS%'
    OR service_branch ILIKE '%WHS%'
    OR agency_or_lab  = 'OSD'
    OR service_branch ILIKE '%OFFICE OF THE SECRETARY OF DEFENSE%'  THEN 'osd'

  -- ── Combatant Commands ────────────────────────────────────────────────────
  WHEN service_branch ILIKE '%SPECIAL OPERATIONS COMMAND%'
    OR service_branch ILIKE '%SOCOM%'
    OR agency_or_lab  = 'SOCOM'                                     THEN 'ussocom'
  WHEN service_branch ILIKE '%INDO%PACIFIC%'
    OR service_branch ILIKE '%INDOPACOM%'                           THEN 'usindopacom'
  WHEN service_branch ILIKE '%EUROPEAN COMMAND%'
    OR service_branch ILIKE '%EUCOM%'                               THEN 'useucom'
  WHEN service_branch ILIKE '%CENTRAL COMMAND%'
    OR service_branch ILIKE '%CENTCOM%'                             THEN 'uscentcom'
  WHEN service_branch ILIKE '%NORTHERN COMMAND%'
    OR service_branch ILIKE '%NORTHCOM%'                            THEN 'usnorthcom'
  WHEN service_branch ILIKE '%SOUTHERN COMMAND%'
    OR service_branch ILIKE '%SOUTHCOM%'                            THEN 'ussouthcom'
  WHEN service_branch ILIKE '%AFRICA COMMAND%'
    OR service_branch ILIKE '%AFRICOM%'                             THEN 'usafricom'
  WHEN service_branch ILIKE '%CYBER COMMAND%'
    OR service_branch ILIKE '%CYBERCOM%'                            THEN 'uscybercom'
  WHEN service_branch ILIKE '%STRATEGIC COMMAND%'
    OR service_branch ILIKE '%STRATCOM%'                            THEN 'usstratcom'
  WHEN service_branch ILIKE '%TRANSPORTATION COMMAND%'
    OR service_branch ILIKE '%TRANSCOM%'                            THEN 'ustranscom'
  WHEN service_branch ILIKE '%SPACE COMMAND%'                       THEN 'usspacecom'

  -- ── Simple values from USASpending sync ──────────────────────────────────
  WHEN service_branch = 'Army'        THEN 'army'
  WHEN service_branch = 'Navy'        THEN 'navy'
  WHEN service_branch = 'Air Force'   THEN 'af'
  WHEN service_branch = 'Space Force' THEN 'sf-hq'
  WHEN service_branch = 'Marines'     THEN 'hqmc'

  -- ── Catch-all DoD ─────────────────────────────────────────────────────────
  WHEN service_branch ILIKE '%DEPT OF DEFENSE%'
    OR service_branch ILIKE '%DEPARTMENT OF DEFENSE%'               THEN 'dod'

  ELSE NULL
END
WHERE canonical_org_id IS NULL
  AND (service_branch IS NOT NULL OR agency_or_lab IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_contracts_canonical_org_id
  ON contracts(canonical_org_id);
