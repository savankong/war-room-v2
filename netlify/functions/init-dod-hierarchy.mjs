import { getDatabase } from '@netlify/database';

/**
 * POST /api/init-dod-hierarchy
 *
 * Initializes the complete Department of War organizational hierarchy.
 * Creates all base organizations that can serve as Parent IDs.
 * Idempotent - safe to run multiple times.
 */

const BASE_ORGS = [
  // TIER 1: OSD Principal Staff (no parent)
  {
    id: 'osd',
    sub: 'DEPT OF WAR',
    branch: 'OSD Principal Staff',
    major: 'OSD',
    subtier: 'Office of the Secretary of Defense',
    description: 'Office of the Secretary of Defense',
    abbreviation: 'OSD',
    loc: 'Arlington, VA',
    organization_type: 'OSD Office',
    parent_id: null
  },
  {
    id: 'usda-s',
    sub: 'DEPT OF WAR',
    branch: 'OSD Principal Staff',
    major: 'OSD',
    subtier: 'USD(A&S)',
    description: 'Under Secretary of Defense for Acquisition & Sustainment',
    abbreviation: 'USD(A&S)',
    loc: 'Arlington, VA',
    organization_type: 'OSD Office',
    parent_id: 'osd'
  },
  {
    id: 'usdr-e',
    sub: 'DEPT OF WAR',
    branch: 'OSD Principal Staff',
    major: 'OSD',
    subtier: 'USD(R&E)',
    description: 'Under Secretary of Defense for Research & Engineering',
    abbreviation: 'USD(R&E)',
    loc: 'Arlington, VA',
    organization_type: 'OSD Office',
    parent_id: 'osd'
  },
  {
    id: 'dow-cio',
    sub: 'DEPT OF WAR',
    branch: 'OSD Principal Staff',
    major: 'OSD',
    subtier: 'DoW CIO',
    description: 'Chief Information Officer',
    abbreviation: 'DoW CIO',
    loc: 'Arlington, VA',
    organization_type: 'OSD Office',
    parent_id: 'osd'
  },
  {
    id: 'usdp',
    sub: 'DEPT OF WAR',
    branch: 'OSD Principal Staff',
    major: 'OSD',
    subtier: 'USD(P)',
    description: 'Under Secretary of Defense for Policy',
    abbreviation: 'USD(P)',
    loc: 'Arlington, VA',
    organization_type: 'OSD Office',
    parent_id: 'osd'
  },

  // TIER 2: Military Departments
  {
    id: 'dept-of-the-army',
    sub: 'DEPT OF WAR',
    branch: 'Army',
    major: 'Army',
    subtier: 'Department of the Army',
    description: 'Department of the Army',
    abbreviation: 'DA',
    loc: 'Arlington, VA',
    organization_type: 'Military Department',
    parent_id: null
  },
  {
    id: 'dept-of-the-navy',
    sub: 'DEPT OF WAR',
    branch: 'Navy',
    major: 'Navy',
    subtier: 'Department of the Navy',
    description: 'Department of the Navy',
    abbreviation: 'DON',
    loc: 'Arlington, VA',
    organization_type: 'Military Department',
    parent_id: null
  },
  {
    id: 'dept-of-the-air-force',
    sub: 'DEPT OF WAR',
    branch: 'Air Force',
    major: 'Air Force',
    subtier: 'Department of the Air Force',
    description: 'Department of the Air Force',
    abbreviation: 'DAF',
    loc: 'Arlington, VA',
    organization_type: 'Military Department',
    parent_id: null
  },
  {
    id: 'marine-corps',
    sub: 'DEPT OF WAR',
    branch: 'Marine Corps',
    major: 'Marine Corps',
    subtier: 'United States Marine Corps',
    description: 'United States Marine Corps',
    abbreviation: 'USMC',
    loc: 'Arlington, VA',
    organization_type: 'Military Department',
    parent_id: null
  },
  {
    id: 'space-force',
    sub: 'DEPT OF WAR',
    branch: 'Space Force',
    major: 'Space Force',
    subtier: 'United States Space Force',
    description: 'United States Space Force',
    abbreviation: 'USSF',
    loc: 'Arlington, VA',
    organization_type: 'Military Department',
    parent_id: null
  },
  {
    id: 'coast-guard',
    sub: 'DEPT OF WAR',
    branch: 'Coast Guard',
    major: 'Coast Guard',
    subtier: 'United States Coast Guard',
    description: 'United States Coast Guard',
    abbreviation: 'USCG',
    loc: 'Washington, DC',
    organization_type: 'Military Department',
    parent_id: null
  },

  // TIER 3: Geographic Combatant Commands
  {
    id: 'africom',
    sub: 'DEPT OF WAR',
    branch: 'Geographic Combatant Command',
    major: 'Geographic Combatant Command',
    subtier: 'AFRICOM',
    description: 'United States Africa Command',
    abbreviation: 'AFRICOM',
    loc: 'Stuttgart, Germany',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'centcom',
    sub: 'DEPT OF WAR',
    branch: 'Geographic Combatant Command',
    major: 'Geographic Combatant Command',
    subtier: 'CENTCOM',
    description: 'United States Central Command',
    abbreviation: 'CENTCOM',
    loc: 'Tampa, FL',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'eucom',
    sub: 'DEPT OF WAR',
    branch: 'Geographic Combatant Command',
    major: 'Geographic Combatant Command',
    subtier: 'EUCOM',
    description: 'United States European Command',
    abbreviation: 'EUCOM',
    loc: 'Stuttgart, Germany',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'indopacom',
    sub: 'DEPT OF WAR',
    branch: 'Geographic Combatant Command',
    major: 'Geographic Combatant Command',
    subtier: 'INDOPACOM',
    description: 'United States Indo-Pacific Command',
    abbreviation: 'INDOPACOM',
    loc: 'Honolulu, HI',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'northcom',
    sub: 'DEPT OF WAR',
    branch: 'Geographic Combatant Command',
    major: 'Geographic Combatant Command',
    subtier: 'NORTHCOM',
    description: 'United States Northern Command',
    abbreviation: 'NORTHCOM',
    loc: 'Colorado Springs, CO',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'southcom',
    sub: 'DEPT OF WAR',
    branch: 'Geographic Combatant Command',
    major: 'Geographic Combatant Command',
    subtier: 'SOUTHCOM',
    description: 'United States Southern Command',
    abbreviation: 'SOUTHCOM',
    loc: 'Miami, FL',
    organization_type: 'Combatant Command',
    parent_id: null
  },

  // TIER 3: Functional Combatant Commands
  {
    id: 'socom',
    sub: 'DEPT OF WAR',
    branch: 'Functional Combatant Command',
    major: 'Functional Combatant Command',
    subtier: 'SOCOM',
    description: 'United States Special Operations Command',
    abbreviation: 'SOCOM',
    loc: 'Tampa, FL',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'stratcom',
    sub: 'DEPT OF WAR',
    branch: 'Functional Combatant Command',
    major: 'Functional Combatant Command',
    subtier: 'STRATCOM',
    description: 'United States Strategic Command',
    abbreviation: 'STRATCOM',
    loc: 'Omaha, NE',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'transcom',
    sub: 'DEPT OF WAR',
    branch: 'Functional Combatant Command',
    major: 'Functional Combatant Command',
    subtier: 'TRANSCOM',
    description: 'United States Transportation Command',
    abbreviation: 'TRANSCOM',
    loc: 'Scott Air Force Base, IL',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'cybercom',
    sub: 'DEPT OF WAR',
    branch: 'Functional Combatant Command',
    major: 'Functional Combatant Command',
    subtier: 'CYBERCOM',
    description: 'United States Cyber Command',
    abbreviation: 'CYBERCOM',
    loc: 'Fort Meade, MD',
    organization_type: 'Combatant Command',
    parent_id: null
  },
  {
    id: 'spacecom',
    sub: 'DEPT OF WAR',
    branch: 'Functional Combatant Command',
    major: 'Functional Combatant Command',
    subtier: 'SPACECOM',
    description: 'United States Space Command',
    abbreviation: 'SPACECOM',
    loc: 'Colorado Springs, CO',
    organization_type: 'Combatant Command',
    parent_id: null
  },

  // TIER 4: Defense Agencies
  {
    id: 'darpa',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'DARPA',
    description: 'Defense Advanced Research Projects Agency',
    abbreviation: 'DARPA',
    loc: 'Arlington, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'disa',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'DISA',
    description: 'Defense Information Systems Agency',
    abbreviation: 'DISA',
    loc: 'Arlington, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'dia',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'DIA',
    description: 'Defense Intelligence Agency',
    abbreviation: 'DIA',
    loc: 'Arlington, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'dla',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'DLA',
    description: 'Defense Logistics Agency',
    abbreviation: 'DLA',
    loc: 'Fort Belvoir, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'nga',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'NGA',
    description: 'National Geospatial-Intelligence Agency',
    abbreviation: 'NGA',
    loc: 'Springfield, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'nro',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'NRO',
    description: 'National Reconnaissance Office',
    abbreviation: 'NRO',
    loc: 'Chantilly, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'nsa',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'NSA',
    description: 'National Security Agency',
    abbreviation: 'NSA',
    loc: 'Fort Meade, MD',
    organization_type: 'Defense Agency',
    parent_id: null
  },
  {
    id: 'dcaa',
    sub: 'DEPT OF WAR',
    branch: 'Defense Agency',
    major: 'Defense Agency',
    subtier: 'DCAA',
    description: 'Defense Contract Audit Agency',
    abbreviation: 'DCAA',
    loc: 'Arlington, VA',
    organization_type: 'Defense Agency',
    parent_id: null
  },

  // TIER 5: DoD Field Activities
  {
    id: 'dodea',
    sub: 'DEPT OF WAR',
    branch: 'Department of War Field Activity',
    major: 'Department of War Field Activity',
    subtier: 'DoDEA',
    description: 'Department of War Education Activity',
    abbreviation: 'DoDEA',
    loc: 'Arlington, VA',
    organization_type: 'Field Activity',
    parent_id: null
  }
];

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ status: 'error', message: 'POST required' }, { status: 405 });
  }

  const db = getDatabase();
  const results = {
    status: 'success',
    created: 0,
    skipped: 0,
    errors: [],
    organizations: []
  };

  try {
    console.log(`Initializing Department of War hierarchy with ${BASE_ORGS.length} organizations...`);

    for (const org of BASE_ORGS) {
      try {
        // Check if org already exists
        const existing = await db.sql`
          SELECT id FROM orgs WHERE id = ${org.id}
        `;

        if (existing.length > 0) {
          results.skipped++;
          console.log(`Skipped (already exists): ${org.id}`);
          continue;
        }

        // Create org
        await db.sql`
          INSERT INTO orgs (
            id, sub, branch, major, subtier, loc, full_name, description,
            abbreviation, organization_type, parent_id, budget, budget_detail,
            r_and_d, contract_vehicles
          ) VALUES (
            ${org.id}, ${org.sub}, ${org.branch}, ${org.major}, ${org.subtier},
            ${org.loc}, ${org.description}, ${org.description}, ${org.abbreviation},
            ${org.organization_type}, ${org.parent_id}, null, null, null, null
          )
        `;

        results.created++;
        results.organizations.push(org.id);
        console.log(`Created: ${org.id} (${org.abbreviation})`);
      } catch (error) {
        results.errors.push({
          id: org.id,
          error: error.message
        });
        console.error(`Error creating ${org.id}:`, error.message);
      }
    }

    results.message = `Hierarchy initialized: ${results.created} created, ${results.skipped} skipped`;
    return Response.json(results);
  } catch (error) {
    console.error('Hierarchy init error:', error);
    return Response.json(
      {
        status: 'error',
        message: error.message,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors
      },
      { status: 500 }
    );
  }
};

export const config = { path: '/api/init-dod-hierarchy' };
