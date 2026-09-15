/**
 * DoD scope filter — engineering spec §4, "DoD scope filter".
 *
 * "Restrict ingestion to DoD toptier agencies: Department of Defense, Army,
 *  Navy, Air Force, and the Fourth Estate. Confirm the current agency code
 *  list against the live SAM and USASpending APIs at build time rather than
 *  hardcoding from memory."
 *
 * The codes below are a starting list, NOT a verified one. Run
 * `npm run verify-dod-agencies` (scripts/verify-dod-agencies.ts) against the
 * live APIs before trusting them in production — it reports codes that no
 * longer resolve and toptier DoD agencies present upstream but missing here.
 * VERIFIED_AT stays null until someone runs that script and records the date.
 *
 * Why an explicit list rather than a name match: SAM's department names drift
 * ("DEPT OF DEFENSE", "DEPARTMENT OF DEFENSE", "DOD"), and a substring match on
 * "DEFENSE" also catches civilian agencies with defense in an office name.
 */

/** Set once `npm run verify-dod-agencies` has been run and the list corrected. */
export const VERIFIED_AT: string | null = null;

/**
 * FPDS/SAM department codes for the military departments and OSD.
 * `fullParentPathCode` on a SAM notice starts with one of these.
 */
export const DOD_DEPARTMENT_CODES = [
  '097', // Department of Defense (OSD, Joint Staff, defense agencies / Fourth Estate)
  '021', // Department of the Army
  '017', // Department of the Navy (includes Marine Corps)
  '057', // Department of the Air Force (includes Space Force)
] as const;

/**
 * Department names as they appear in `fullParentPathName`, lowercased. Used as
 * the fallback when a notice carries no parent path code.
 */
export const DOD_DEPARTMENT_NAMES = [
  'dept of defense',
  'department of defense',
  'dept of the army',
  'department of the army',
  'dept of the navy',
  'department of the navy',
  'dept of the air force',
  'department of the air force',
  'defense logistics agency',
  'defense information systems agency',
  'defense health agency',
  'defense threat reduction agency',
  'defense advanced research projects agency',
  'missile defense agency',
  'defense counterintelligence and security agency',
  'defense finance and accounting service',
  'national geospatial-intelligence agency',
  'national security agency',
  'national reconnaissance office',
  'defense intelligence agency',
  'washington headquarters services',
  'uniformed services university of the health sciences',
  'defense commissary agency',
  'defense contract management agency',
] as const;

/**
 * SAM `ptype` codes for the notice types §4 puts in scope: Sources Sought,
 * Presolicitation, Solicitation, Combined Synopsis, Special Notice.
 *
 * Award notices ('a'), justifications ('u') and surplus sales ('g') are
 * deliberately absent — awarded work belongs in `contracts`, not
 * `opportunities`.
 *
 * On RFI: §4 lists it as in scope, but SAM has no distinct RFI ptype. In
 * practice contracting offices post RFIs under Sources Sought or Special
 * Notice, so both are included and isRfi() below tags them from the title.
 * Confirm the code list with verify-dod-agencies before relying on it.
 */
export const IN_SCOPE_PTYPES = ['r', 'p', 'o', 'k', 's'] as const;

/**
 * Notice types that count as pre-RFP for scoring (§5, 10 points). This is the
 * thesis of the product: a Sources Sought should beat an open solicitation of
 * equal technical fit.
 */
const PRE_RFP_PATTERNS = [
  'sources sought',
  'presolicitation',
  'pre-solicitation',
  'special notice',
  'request for information',
  'rfi',
];

const SOLICITATION_PATTERNS = [
  'solicitation',
  'combined synopsis',
];

function norm(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().trim();
}

/** True when a SAM notice's parent path places it inside DoD. */
export function isDodNotice(
  fullParentPathCode: string | null | undefined,
  fullParentPathName: string | null | undefined,
): boolean {
  const code = norm(fullParentPathCode);
  if (code) {
    const toptier = code.split('.')[0]?.trim();
    if (toptier && (DOD_DEPARTMENT_CODES as readonly string[]).includes(toptier)) return true;
  }

  const name = norm(fullParentPathName);
  if (!name) return false;
  return DOD_DEPARTMENT_NAMES.some((dept) => name.includes(dept));
}

/** §5: pre-RFP notice types score 10, solicitations score 5. */
export function isPreRfp(noticeType: string | null | undefined): boolean {
  const t = norm(noticeType);
  if (!t) return false;
  // "Combined Synopsis/Solicitation" contains "solicitation" but is an active
  // solicitation, so check it before the pre-RFP patterns.
  if (t.includes('combined synopsis')) return false;
  return PRE_RFP_PATTERNS.some((p) => t.includes(p));
}

export function isSolicitation(noticeType: string | null | undefined): boolean {
  const t = norm(noticeType);
  if (!t) return false;
  if (isPreRfp(t)) return false;
  return SOLICITATION_PATTERNS.some((p) => t.includes(p));
}

/** SAM has no RFI ptype; offices post them as Sources Sought or Special Notice. */
export function isRfi(noticeType: string | null | undefined, title: string | null | undefined): boolean {
  const haystack = `${norm(noticeType)} ${norm(title)}`;
  return haystack.includes('request for information') || /\brfi\b/.test(haystack);
}
