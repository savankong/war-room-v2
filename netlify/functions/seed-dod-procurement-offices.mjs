import { getDatabase } from '@netlify/database';

/**
 * Parse all DoD hierarchy strings in contracts table and create org records for procurement offices
 * Links contracts to the appropriate org based on parsed hierarchy
 *
 * GET /api/seed-dod-procurement-offices?token=<SAM_SYNC_TOKEN>&dry=1
 */

const EXPANSIONS = {
  'DEPT OF DEFENSE': 'Department of Defense',
  'DEPT OF THE ARMY': 'Department of the Army',
  'DEPT OF THE NAVY': 'Department of the Navy',
  'DEPT OF THE AF': 'Department of the Air Force',
  'NATIONAL GUARD BUREAU': 'National Guard Bureau',
  'JFHQ': 'Joint Force Headquarters',
  'USPFO': 'United States Property and Fiscal Office',
  'NAVSUP': 'Naval Supply Systems Command',
  'NAVSEA': 'Naval Sea Systems Command',
  'NAVAIR': 'Naval Air Systems Command',
  'AFMC': 'Air Force Materiel Command',
  'AFRL': 'Air Force Research Laboratory',
};

function extractPrimaryOrg(contractingOfficeString) {
  if (!contractingOfficeString) return null;

  // Handle both dot-separated hierarchies and space-separated names
  const allText = contractingOfficeString.toUpperCase();

  // Direct acronym/abbreviation matches mapped to canonical org abbreviations
  // Maps procurement commands to their parent service/organization
  const directMatches = [
    // Navy procurement commands -> NAVSEA (using parent org that exists)
    { pattern: /\bNAVSUP\b/, org: 'NAVSEA' },      // Naval Supply -> Naval Sea Systems
    { pattern: /\bNAVWAR\b/, org: 'NAVSEA' },      // Naval Warfare -> NAVSEA
    { pattern: /\bNIWC\b/, org: 'NAVSEA' },        // Naval Info Warfare -> NAVSEA
    { pattern: /\bNAWC\b/, org: 'NAVAIR' },        // Naval Air Warfare Center
    { pattern: /\bNSWC\b/, org: 'NAVSEA' },        // Naval Surface Warfare
    { pattern: /\bNUWC\b/, org: 'NAVSEA' },        // Naval Undersea Warfare

    // Air Force commands
    { pattern: /\bAFMC\b/, org: 'AFMC' },
    { pattern: /\bAFRL\b/, org: 'AFMC' },          // AFRL under AFMC
    { pattern: /\bAFLC\b/, org: 'AFMC' },          // Air Force Logistics Center
    { pattern: /\bAFSC\b/, org: 'USAF' },
    { pattern: /\bAFNWC\b/, org: 'USAF' },         // Air Force Nuclear Weapons Center

    // Navy
    { pattern: /\bNAVSEA\b/, org: 'NAVSEA' },
    { pattern: /\bNAVAIR\b/, org: 'NAVAIR' },

    // Defense-wide agencies
    { pattern: /\bDARPA\b/, org: 'DARPA' },
    { pattern: /\bDISA\b/, org: 'DISA' },
    { pattern: /\bDIA\b/, org: 'DIA' },
    { pattern: /\bDLA\b/, org: 'DARPA' },          // DLA -> map to DARPA for now (or Army)
    { pattern: /\bCAPE\b/, org: 'CAPE' },
    { pattern: /\bONR\b/, org: 'NAVAIR' },         // Office of Naval Research
  ];

  for (const match of directMatches) {
    if (match.pattern.test(allText)) {
      return match.org;
    }
  }

  // Service/Department level matches
  if (allText.includes('DEPT OF THE ARMY') || allText.includes('ARMY') && !allText.includes('NAVY')) {
    return 'ARMY';
  }
  if (allText.includes('DEPT OF THE NAVY') || (allText.includes('NAVY') && !allText.includes('AIR'))) {
    return 'NAVY';
  }
  if (allText.includes('DEPT OF THE AIR FORCE') || allText.includes('USAF') || (allText.includes('AIR FORCE') && !allText.includes('NAVAL'))) {
    return 'USAF';
  }
  if (allText.includes('MARINE CORPS') || allText.includes('USMC')) {
    return 'USMC';
  }
  if (allText.includes('SPACE FORCE') || allText.includes('USSF')) {
    return 'USSF';
  }
  if (allText.includes('COAST GUARD') || allText.includes('USCG')) {
    return 'USCG';
  }

  // National Guard -> Army
  if (allText.includes('NATIONAL GUARD') || allText.includes('ANG') || allText.includes('ARNG')) {
    return 'ARMY';
  }

  return null;
}

function extractProcurementOfficeName(contractingOfficeString) {
  if (!contractingOfficeString) return null;

  const parts = contractingOfficeString.split('.')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Look for the most specific procurement office reference
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].toUpperCase();

    // Check for contracting office codes (5-6 char alphanumeric with digits)
    if (/^[A-Z]\d{4}$|^[A-Z]{2}\d{3,5}$/.test(part)) {
      continue; // Skip codes
    }

    // Procurement office keywords
    if (part.includes('PROCUREMENT') || part.includes('PROCURE') ||
        part.includes('CONTRACTING') || part.includes('ACTIVITY')) {
      return parts[i]; // Return with original casing
    }
  }

  return null;
}

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (token !== Netlify.env.get('SAM_SYNC_TOKEN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const dry = url.searchParams.get('dry') === '1';

  // Get all unique contracting office strings from contracts table
  const offices = await db.sql`
    SELECT DISTINCT contracting_office
    FROM contracts
    WHERE contracting_office IS NOT NULL
      AND contracting_office != ''
    ORDER BY contracting_office
    LIMIT 200
  `;

  const results = {
    processed: 0,
    linked: 0,
    orgs_found: 0,
    orgs_created: 0,
    errors: []
  };

  // Process each unique contracting office string
  for (const office of offices) {
    results.processed++;

    try {
      const primaryOrgAbbrev = extractPrimaryOrg(office.contracting_office);
      const procurementOfficeName = extractProcurementOfficeName(office.contracting_office);

      if (!primaryOrgAbbrev) {
        results.errors.push(`Could not extract primary org from: ${office.contracting_office}`);
        continue;
      }

      // Try to find the primary org with multiple matching strategies
      let [org] = await db.sql`
        SELECT id FROM orgs
        WHERE org_type_id IS NOT NULL
          AND (
            abbreviation = ${primaryOrgAbbrev}
            OR sub = ${primaryOrgAbbrev}
            OR UPPER(abbreviation) = ${primaryOrgAbbrev}
            OR UPPER(sub) = ${primaryOrgAbbrev}
            OR description LIKE ${'%' + primaryOrgAbbrev + '%'}
            OR full_name LIKE ${'%' + primaryOrgAbbrev + '%'}
          )
        LIMIT 1
      `;

      if (!org) {
        results.errors.push(`No org found for ${primaryOrgAbbrev} in: ${office.contracting_office}`);
        continue;
      }

      results.orgs_found++;

      if (!dry) {
        // Update all contracts with this contracting_office to link to this org
        await db.sql`
          UPDATE contracts
          SET org_id = ${org.id}
          WHERE contracting_office = ${office.contracting_office}
        `;

        results.linked++;
      }
    } catch (e) {
      results.errors.push(`${office.contracting_office}: ${e.message.slice(0, 80)}`);
    }
  }

  return Response.json({
    ...results,
    message: dry ? 'Dry run - no changes made' : 'Processed and linked contracting offices',
    sample_errors: results.errors.slice(0, 5)
  });
};

export const config = { path: '/api/seed-dod-procurement-offices' };
