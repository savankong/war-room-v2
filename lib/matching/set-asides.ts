/**
 * Set-aside normalization.
 *
 * §5 disqualifies an opportunity when "set-aside present and the company does
 * not hold it". That comparison only works if both sides speak the same
 * language, and they do not: SAM writes "Total Small Business Set-Aside" or
 * "8(a) Set-Aside", while a company profile stores whatever the onboarding
 * form offered.
 *
 * Getting this wrong is expensive in one direction specifically. A
 * false negative hides an opportunity the customer could have won, and they
 * never find out it existed — the silent failure product spec §11 warns about.
 * So unrecognised set-aside text resolves to null and does NOT disqualify;
 * it goes in front of the customer with the set-aside shown, and they judge.
 */

export type SetAsideCode =
  | 'SB'        // Total Small Business
  | '8A'        // 8(a) Business Development
  | 'HUBZONE'
  | 'SDVOSB'    // Service-Disabled Veteran-Owned
  | 'VOSB'      // Veteran-Owned
  | 'WOSB'      // Women-Owned Small Business
  | 'EDWOSB'    // Economically Disadvantaged WOSB
  | 'SDB'       // Small Disadvantaged Business
  | 'LOCAL';    // Local area set-aside (emergency/disaster)

/**
 * Patterns are checked most-specific-first: "economically disadvantaged
 * women-owned" must resolve to EDWOSB before the plain women-owned rule sees
 * it, and "service-disabled veteran" before "veteran".
 */
const PATTERNS: Array<[RegExp, SetAsideCode]> = [
  [/economically\s+disadvantaged\s+women|\bedwosb\b/i, 'EDWOSB'],
  [/service.?disabled.*veteran|\bsdvosb\b/i, 'SDVOSB'],
  [/women.?owned|\bwosb\b/i, 'WOSB'],
  [/\bhubzone\b/i, 'HUBZONE'],
  [/8\s*\(\s*a\s*\)|\b8a\b/i, '8A'],
  [/small\s+disadvantaged|\bsdb\b/i, 'SDB'],
  [/veteran.?owned|\bvosb\b/i, 'VOSB'],
  [/local\s+area\s+set.?aside/i, 'LOCAL'],
  // Least specific: any remaining small-business set-aside, including
  // "Total Small Business Set-Aside" and "Partial Small Business Set-Aside".
  [/small\s+business/i, 'SB'],
];

/**
 * Text that means "no set-aside" rather than an unrecognised one. SAM uses
 * these for full and open competition.
 */
const NONE_PATTERNS = [
  /^none$/i,
  /^n\/?a$/i,
  /full\s+and\s+open/i,
  /unrestricted/i,
];

/** null means "no set-aside"; undefined means "present but unrecognised". */
export function normalizeSetAside(raw: string | null | undefined): SetAsideCode | null | undefined {
  const text = (raw ?? '').trim();
  if (!text) return null;
  if (NONE_PATTERNS.some((p) => p.test(text))) return null;

  for (const [pattern, code] of PATTERNS) {
    if (pattern.test(text)) return code;
  }
  return undefined;
}

/** Normalize the codes a company says it holds. Unrecognised entries are dropped. */
export function normalizeHeldSetAsides(held: string[]): Set<SetAsideCode> {
  const out = new Set<SetAsideCode>();
  for (const entry of held) {
    const code = normalizeSetAside(entry);
    if (code) out.add(code);
  }
  return out;
}

/**
 * Every 8(a), HUBZone, SDVOSB, WOSB and SDB holder is by definition a small
 * business, so any of them satisfies a Total Small Business set-aside. The
 * reverse is not true: holding SB alone does not satisfy an 8(a) set-aside.
 */
const IMPLIES_SMALL_BUSINESS: SetAsideCode[] = ['8A', 'HUBZONE', 'SDVOSB', 'VOSB', 'WOSB', 'EDWOSB', 'SDB'];

/** EDWOSB is a strict subset of WOSB, so an EDWOSB holder satisfies a WOSB set-aside. */
const IMPLIED: Partial<Record<SetAsideCode, SetAsideCode[]>> = {
  SB: IMPLIES_SMALL_BUSINESS,
  WOSB: ['EDWOSB'],
  VOSB: ['SDVOSB'],
};

export function companyHoldsSetAside(required: SetAsideCode, held: Set<SetAsideCode>): boolean {
  if (held.has(required)) return true;
  const satisfiedBy = IMPLIED[required];
  return Boolean(satisfiedBy?.some((code) => held.has(code)));
}
