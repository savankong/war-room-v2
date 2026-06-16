/**
 * Classifies an email address or domain as 'gov', 'industry', or 'unknown'.
 *
 * Government signals:
 *  - *.gov  (federal agencies, state agencies, courts, congressional)
 *  - *.mil  (US military)
 *  - *.state.XX.us  (state government portals)
 *  - *.nsn.us  (tribal nations / Native Sovereign Nations)
 *  - Known DoD .edu institutions (West Point, DoDEA, USUHS, etc.)
 *  - Known quasi-gov .org entities (USAC)
 */

const GOV_SUFFIXES = ['.gov', '.mil', '.nsn.us'];

const STATE_DOMAIN_RE = /\.state\.[a-z]{2}\.us$/i;

// DoD / federal .edu institutions
const GOV_EDU_DOMAINS = new Set([
  'westpoint.edu',       // US Military Academy
  'usma.edu',            // US Military Academy (alt)
  'dodea.edu',           // DoD Education Activity
  'usuhs.edu',           // Uniformed Services University of Health Sciences
  'ndu.edu',             // National Defense University
  'nps.edu',             // Naval Postgraduate School
  'usna.edu',            // US Naval Academy
  'usafa.edu',           // US Air Force Academy
  'uscga.edu',           // US Coast Guard Academy
  'usmma.edu',           // US Merchant Marine Academy
  'cgsc.edu',            // Command and General Staff College
  'armywarcollege.edu',  // Army War College
]);

// Quasi-government .org entities
const GOV_ORG_DOMAINS = new Set([
  'usac.org',            // Universal Service Administrative Co. (federal program)
]);

export function classifyEmail(email: string | null | undefined): 'gov' | 'industry' | 'unknown' {
  if (!email?.trim()) return 'unknown';
  const domain = email.trim().toLowerCase().split('@').pop() ?? '';
  return classifyDomain(domain);
}

export function classifyDomain(domain: string): 'gov' | 'industry' | 'unknown' {
  const d = domain.trim().toLowerCase();
  if (!d) return 'unknown';

  if (GOV_SUFFIXES.some(s => d === s.slice(1) || d.endsWith(s))) return 'gov';
  if (STATE_DOMAIN_RE.test(d)) return 'gov';
  if (GOV_EDU_DOMAINS.has(d) || [...GOV_EDU_DOMAINS].some(e => d.endsWith('.' + e))) return 'gov';
  if (GOV_ORG_DOMAINS.has(d)) return 'gov';

  if (/\.(com|net|org|io|co|biz|info|tech|ai|us)$/.test(d)) return 'industry';

  return 'unknown';
}

export function isGovEmail(email: string | null | undefined): boolean {
  return classifyEmail(email) === 'gov';
}

export function isIndustryEmail(email: string | null | undefined): boolean {
  return classifyEmail(email) === 'industry';
}
