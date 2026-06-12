'use client';
import { useState, useMemo, useEffect } from 'react';
import Pagination from '@/app/components/Pagination';

const PEOPLE_PER_PAGE = 50;
import Link from 'next/link';

/* ── contract helpers ────────────────────────────────────────────── */
function fmtMoney(v: number | string | null) {
  const n = v == null ? null : Number(v);
  if (!n) return null;
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}
function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const CONTRACT_TYPE_COLOR: Record<string, string> = {
  Opportunity: '#2f8676',
  Award:       '#283a6b',
  Budget:      '#C98A2B',
};
const CONTRACT_TYPE_BG: Record<string, string> = {
  Opportunity: 'rgba(47,134,118,.1)',
  Award:       'rgba(40,58,107,.1)',
  Budget:      'rgba(201,138,43,.12)',
};
const SOURCE_LABEL: Record<string, string> = {
  sam_gov:     'SAM.gov',
  usaspending: 'USASpending',
  manual:      'Manual',
};

/* ── helpers ─────────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a','#2563B8','#3B7DB0'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0,2).join('').toUpperCase(); }

const FOCUS_COLORS: Record<string, string> = {
  Operations: '#2563B8', Cyber: '#2E8E8C', Intelligence: '#2E9E6B',
  Acquisition: '#C98A2B', 'AI/ML': '#5B5BD6', Space: '#7E58C4',
  Contracting: '#5A6B82', Strategy: '#41618F', Policy: '#B5566B',
};

/* Inbox-only detection — name patterns that indicate a shared mailbox / non-person entry */
const INBOX_NAME_RE = /\b(mailbox|inbox|shared\s+mailbox|please\s+email|contracting\s+office)\b/i;
const INBOX_EMAIL_RE = /\.mbx\.|\.inbox\.|^(info|contracts|admin|acquisitions|support)@/i;

function isInboxOnly(name: string, email: string | null): boolean {
  if (INBOX_NAME_RE.test(name)) return true;
  if (email && INBOX_EMAIL_RE.test(email)) return true;
  /* Names that start with org-unit words rather than a person's given name */
  if (/^(TRANSCOM|DCSO|DLA|MICC|USAF|AAFES)\b/.test(name) && /\b(mailbox|inbox|office|division)\b/i.test(name)) return true;
  return false;
}

function inferFocus(title: string | null, branch: string | null): string[] {
  const t = ((title ?? '') + ' ' + (branch ?? '')).toLowerCase();
  const out: string[] = [];
  if (/cyber|info(rmation)? war/.test(t)) out.push('Cyber');
  if (/intel|reconnaissance|surveillance/.test(t)) out.push('Intelligence');
  if (/acqui|peo |program exec|materiel|lifecycle|life.cycle/.test(t)) out.push('Acquisition');
  if (/contract|sourc|procure|dcaa/.test(t)) out.push('Contracting');
  if (/space|satellite|orbital|ussf|space force/.test(t)) out.push('Space');
  if (/research|lab |science|innovation|darpa|arpa/.test(t)) out.push('AI/ML');
  if (/strateg|plans|j5|j8/.test(t)) out.push('Strategy');
  if (/polic|legislat|comptroll|financ|budget/.test(t)) out.push('Policy');
  if (out.length === 0) out.push('Operations');
  return out.slice(0, 2);
}

function generateBio(p: Person): string {
  const t = p.role_title ?? 'senior official';
  const o = p.org_name ?? 'the Department of Defense';
  const tier = p.hierarchy_order ?? 10;
  if (tier === 1) return `${p.full_name} serves as ${t} of ${o}. As the principal leader, they hold responsibility for all major policy, strategic planning, and resource decisions across the organization.`;
  if (tier <= 3) return `${p.full_name} serves as ${t} within ${o}, providing senior executive leadership and advising the principal on key matters of policy, operations, and resource management.`;
  if (tier <= 6) return `${p.full_name} serves as ${t} at ${o}, leading a functional portfolio and providing expert advisory support to senior leadership.`;
  return `${p.full_name} serves as ${t} within ${o}.`;
}

const SENIORITY_GROUPS = [
  { label: 'Principal Leadership', min: 1, max: 1 },
  { label: 'Deputy / Senior Staff', min: 2, max: 3 },
  { label: 'Directors / Asst. Sec.', min: 4, max: 6 },
  { label: 'Staff', min: 7, max: 99 },
];

/* ── interfaces ─────────────────────────────────────────────────────── */
interface Person {
  id: string; full_name: string; role_title: string | null;
  avatar_color: string | null; photo_url: string | null;
  email: string | null; phone: string | null;
  opps: number | null; awards: string | null;
  hierarchy_order: number | null; tags: string[] | null;
  org_id: string | null; org_name: string | null; org_slug: string | null;
  org_level: number | null; org_hq: string | null; org_branch: string | null;
  org_contracts: number; org_awards_3yr: number; org_open_opps: number;
}
interface TopOrg { id: string; name: string; abs_hierarchy_level: number | null; }
interface Props { people: Person[]; topOrgs: TopOrg[]; }

/* ── SVG icons ──────────────────────────────────────────────────────── */
const IcSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
const IcGov = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10m14 11V10M3 10l9-6 9 6M9 21v-6h6v6"/></svg>;
const IcSort = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h12M3 12h9M3 18h6M17 5v14m0 0 3-3m-3 3-3-3"/></svg>;
const IcTick = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M20 6 9 17l-5-5"/></svg>;
const IcFlag = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V4m0 0 .8-.4a6 6 0 0 1 5.6.2 6 6 0 0 0 5.6.2L20 4v10l-1.5.7a6 6 0 0 1-5.6-.2 6 6 0 0 0-5.6-.2L4 15"/></svg>;
const IcX = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcChevD = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>;
const IcPin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>;
const IcChat = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.9-4.5A8.4 8.4 0 1 1 21 11.5Z"/></svg>;
const IcOrg = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/></svg>;
const IcVf = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M20 6 9 17l-5-5"/></svg>;
const IcInbox = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>;
const IcContract = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

/* ── Person card ─────────────────────────────────────────────────────── */
function PersonCard({ p, onOpen }: { p: Person; onOpen: () => void }) {
  const color = p.avatar_color ?? colorFor(p.full_name);
  const orgColor = p.org_name ? colorFor(p.org_name) : '#8995A4';
  const focus = inferFocus(p.role_title, p.org_branch);
  const claimed = !!p.email;
  const inbox = isInboxOnly(p.full_name, p.email);
  const hasContracts = p.org_contracts > 0 || p.org_awards_3yr > 0 || p.org_open_opps > 0;

  return (
    <div className="wr-pcard">
      <div className="wr-pc-top">
        <div className="wr-pc-av" style={{ background: inbox ? '#8995A4' : color }}>
          {p.photo_url
            ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : inbox ? <IcInbox /> : initials(p.full_name)}
        </div>
        <div className="wr-pc-id">
          <div className="wr-pc-nm">
            <span className="n" title={p.full_name}>{p.full_name}</span>
            {inbox
              ? <span className="wr-inbox" title="Shared inbox — not a real person"><IcInbox /> Inbox only</span>
              : claimed
                ? <span className="wr-vf" title="Profile active"><IcVf /></span>
                : <span className="wr-unc">Unclaimed</span>}
          </div>
          <div className="wr-pc-ti">{p.role_title ?? '—'}</div>
          {p.org_name && (
            <div className="wr-pc-org">
              <span className="mk" style={{ background: orgColor }}>{initials(p.org_name)}</span>
              <span className="ot">{p.org_name}{p.org_hq ? ` · ${p.org_hq}` : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="wr-pc-foc">
        {focus.map(f => (
          <span className="wr-fchip" key={f}>
            <span className="dot" style={{ background: FOCUS_COLORS[f] }} />
            {f}
          </span>
        ))}
        {hasContracts && (
          <span className="wr-fchip wr-fchip-contract" title="Has SAM.gov / USASpending contract data">
            <IcContract /> SAM.gov
          </span>
        )}
      </div>

      <div className="wr-pc-ft">
        <span className="wr-pc-meta">
          {inbox ? 'Shared inbox' : p.hierarchy_order === 1 ? 'Principal Leader' : p.hierarchy_order === 2 ? 'Deputy / Senior Staff' : `Tier ${p.hierarchy_order ?? '—'}`}
          {hasContracts && ` · ${p.org_contracts} contracts`}
        </span>
        <div className="wr-pc-act">
          <div className="wr-pbtn view" onClick={onOpen}>View profile</div>
        </div>
      </div>
    </div>
  );
}

/* ── Profile panel (slide-over) ────────────────────────────────────────*/
function ProfilePanel({ p, onClose }: { p: Person; onClose: () => void }) {
  const color = p.avatar_color ?? colorFor(p.full_name);
  const orgColor = p.org_name ? colorFor(p.org_name) : '#8995A4';
  const focus = inferFocus(p.role_title, p.org_branch);
  const claimed = !!p.email;
  const inbox = isInboxOnly(p.full_name, p.email);
  const hasSam = p.org_contracts > 0 || p.org_awards_3yr > 0 || p.org_open_opps > 0;

  /* Fetch contracts for this person's org */
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  useEffect(() => {
    if (!p.org_id || !hasSam) return;
    setContractsLoading(true);
    fetch(`/api/org-contracts?orgId=${encodeURIComponent(p.org_id)}`)
      .then(r => r.json())
      .then(data => { setContracts(Array.isArray(data) ? data : []); })
      .catch(() => setContracts([]))
      .finally(() => setContractsLoading(false));
  }, [p.org_id, hasSam]);

  return (
    <div className="wr-pf-back" onClick={onClose}>
      <div className="wr-pf" onClick={e => e.stopPropagation()}>

        {/* Dark header */}
        <div className="wr-pf-hd">
          <button className="wr-pf-x" onClick={onClose}><IcX /></button>
          <div className="wr-pf-top">
            <div className="wr-pf-av" style={{ background: inbox ? '#8995A4' : color }}>
              {p.photo_url
                ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : inbox ? <IcInbox /> : initials(p.full_name)}
            </div>
            <div>
              <div className="wr-pf-nm">
                <span className="n">{p.full_name}</span>
                {inbox
                  ? <span className="wr-pf-inbox"><IcInbox /> Inbox only</span>
                  : claimed
                    ? <span className="wr-pf-vf" title="Profile active"><IcVf /></span>
                    : <span className="wr-pf-unc">Unclaimed</span>}
              </div>
              <div className="wr-pf-ti">{p.role_title ?? '—'}</div>
              {p.org_name && (
                <div className="wr-pf-sub">
                  <span style={{ display: 'flex' }}><IcPin /></span>
                  {p.org_name}{p.org_hq ? ` · ${p.org_hq}` : ''}
                </div>
              )}
              <div className="wr-pf-act">
                <button className="wr-pf-btn pri"><IcPlus /> Follow</button>
                {(p.email) && (
                  <a href={`mailto:${p.email}`} className="wr-pf-btn gho" style={{ textDecoration: 'none' }}>
                    <IcChat /> Message
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Claim strip */}
        {!claimed && (
          <div className="wr-pf-claim">
            <span className="i"><IcFlag /></span>
            <span className="t">This profile is unclaimed.</span>
            <span className="b"><IcTick /> Claim this profile</span>
          </div>
        )}

        <div className="wr-pf-body">

          {/* About */}
          <PfSec title="About">
            <div className="wr-pf-about">{generateBio(p)}</div>
          </PfSec>

          {/* Focus areas */}
          <PfSec title="Focus areas">
            <div className="wr-pf-foc">
              {focus.map(f => (
                <span className="wr-fchip" key={f}>
                  <span className="dot" style={{ background: FOCUS_COLORS[f] }} />{f}
                </span>
              ))}
            </div>
          </PfSec>

          {/* Org / reporting line */}
          {p.org_name && (
            <PfSec title="Organization">
              <div className="wr-pf-rep">
                <div className="wr-pf-sup">
                  <div className="av" style={{ background: orgColor }}>{initials(p.org_name)}</div>
                  <div className="tx">
                    <div className="rl">Member of</div>
                    <div className="nn">{p.org_name}</div>
                    {p.org_hq && <div className="tt">{p.org_hq}</div>}
                  </div>
                </div>
                <div className="wr-pf-repbar">
                  <span className="m">
                    {p.hierarchy_order === 1 ? 'Principal leader' : `Tier ${p.hierarchy_order ?? '—'} position`}
                    {p.org_level != null ? ` · DoD Level L${p.org_level}` : ''}
                  </span>
                  <Link href={`/org/${p.org_slug}`} className="lk">
                    <IcOrg /> Open org chart →
                  </Link>
                </div>
              </div>
            </PfSec>
          )}

          {/* Contracts inline */}
          {hasSam && (
            <PfSec title="Contracts &amp; Opportunities">
              {/* Summary stats */}
              <div className="wr-pf-sam-stats">
                <div className="wr-pf-sam-cell">
                  <div className="k">Awards (3yr)</div>
                  <div className="v">{p.org_awards_3yr || '—'}</div>
                </div>
                <div className="wr-pf-sam-cell">
                  <div className="k">Open Opps</div>
                  <div className="v">{p.org_open_opps || '—'}</div>
                </div>
              </div>

              {/* Contact row if inbox */}
              {(p.email || p.phone) && (
                <div className="wr-pf-sam-contact" style={{ marginBottom: 12 }}>
                  <div className="wr-pf-sam-contact-label">POC Contact</div>
                  {p.email && (
                    <div className="wr-pf-sam-contact-row">
                      <span className="wr-pf-sam-contact-type">Email</span>
                      <a href={`mailto:${p.email}`} className="wr-pf-sam-contact-val">{p.email}</a>
                    </div>
                  )}
                  {p.phone && (
                    <div className="wr-pf-sam-contact-row">
                      <span className="wr-pf-sam-contact-type">Phone</span>
                      <span className="wr-pf-sam-contact-val">{p.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Inline contract rows */}
              {contractsLoading && (
                <div className="wr-pf-cl-loading">Loading contracts…</div>
              )}
              {!contractsLoading && contracts.length > 0 && (
                <div className="wr-pf-clist">
                  {contracts.map(c => {
                    const tc = CONTRACT_TYPE_COLOR[c.signal_type] ?? '#4A5666';
                    const tb = CONTRACT_TYPE_BG[c.signal_type]    ?? 'rgba(74,86,102,.08)';
                    const money = fmtMoney(c.value ?? c.award_amt);
                    const date  = fmtDate(c.award_date);
                    const src   = SOURCE_LABEL[c.source] ?? c.source ?? '';
                    return (
                      <div key={c.id} className="wr-pf-crow">
                        <div className="wr-pf-crow-top">
                          <span className="wr-pf-crow-type" style={{ background: tb, color: tc }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: tc, display: 'inline-block', flexShrink: 0 }} />
                            {c.signal_type ?? 'Signal'}
                          </span>
                          {money && <span className="wr-pf-crow-val" style={{ color: tc }}>{money}</span>}
                        </div>
                        <div className="wr-pf-crow-title">{c.title}</div>
                        <div className="wr-pf-crow-meta">
                          {date && <span>{date}</span>}
                          {src && <span className="wr-pf-crow-src">{src}</span>}
                          {c.set_aside && <span className="wr-pf-crow-aside">{c.set_aside}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!contractsLoading && contracts.length === 0 && p.org_contracts > 0 && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: '8px 0' }}>Contract details not available.</div>
              )}
            </PfSec>
          )}

        </div>
      </div>
    </div>
  );
}

function PfSec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wr-pf-sec">
      <div className="wr-pf-sh">
        <span className="t" dangerouslySetInnerHTML={{ __html: title }} />
        <span className="ln" />
      </div>
      {children}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
const SORTS = ['Relevance', 'Name A–Z', 'Seniority'];

export default function PeopleClient({ people, topOrgs }: Props) {
  const [seg, setSeg] = useState<'gov' | 'ind'>('gov');
  const [search, setSearch] = useState('');
  const [focusFilters, setFocusFilters] = useState<string[]>([]);
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  const [seniorityFilter, setSeniorityFilter] = useState<string | null>(null);
  const [contractFilter, setContractFilter] = useState(false);
  const [sort, setSort] = useState('Relevance');
  const [openProfile, setOpenProfile] = useState<Person | null>(null);
  const [orgSectionOpen, setOrgSectionOpen] = useState(true);
  const [focusSectionOpen, setFocusSectionOpen] = useState(true);
  const [seniorSectionOpen, setSeniorSectionOpen] = useState(true);

  const contractCount = useMemo(() =>
    people.filter(p => p.org_contracts > 0 || p.org_awards_3yr > 0 || p.org_open_opps > 0).length,
    [people]
  );

  /* Focus area counts across all people */
  const focusCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of people) {
      for (const f of inferFocus(p.role_title, p.org_branch)) {
        m[f] = (m[f] ?? 0) + 1;
      }
    }
    return m;
  }, [people]);

  /* Orgs in the filter list (top-2-level) that actually have people */
  const filterOrgs = useMemo(() =>
    topOrgs.filter(o => people.some(p => p.org_id === o.id)),
    [topOrgs, people]
  );

  /* Seniority counts */
  const seniorityCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of people) {
      const tier = p.hierarchy_order ?? 99;
      const grp = SENIORITY_GROUPS.find(g => tier >= g.min && tier <= g.max);
      if (grp) m[grp.label] = (m[grp.label] ?? 0) + 1;
    }
    return m;
  }, [people]);

  /* Filtered people */
  const filtered = useMemo(() => {
    let list = people;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.full_name.toLowerCase().includes(q) ||
        (p.role_title ?? '').toLowerCase().includes(q)
      );
    }

    if (focusFilters.length > 0) {
      list = list.filter(p => {
        const foc = inferFocus(p.role_title, p.org_branch);
        return foc.some(f => focusFilters.includes(f));
      });
    }

    if (orgFilter) {
      list = list.filter(p => p.org_id === orgFilter);
    }

    if (seniorityFilter) {
      const grp = SENIORITY_GROUPS.find(g => g.label === seniorityFilter);
      if (grp) list = list.filter(p => {
        const t = p.hierarchy_order ?? 99;
        return t >= grp.min && t <= grp.max;
      });
    }

    if (contractFilter) {
      list = list.filter(p => p.org_contracts > 0 || p.org_awards_3yr > 0 || p.org_open_opps > 0);
    }

    if (sort === 'Name A–Z') list = [...list].sort((a, b) => a.full_name.localeCompare(b.full_name));
    if (sort === 'Seniority') list = [...list].sort((a, b) => (a.hierarchy_order ?? 99) - (b.hierarchy_order ?? 99));

    return list;
  }, [people, search, focusFilters, orgFilter, seniorityFilter, contractFilter, sort]);

  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search, focusFilters, orgFilter, seniorityFilter, contractFilter, sort]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * PEOPLE_PER_PAGE, page * PEOPLE_PER_PAGE),
    [filtered, page]
  );

  const toggleFocus = (f: string) =>
    setFocusFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const cycleSort = () => setSort(s => SORTS[(SORTS.indexOf(s) + 1) % SORTS.length]);

  const activeFilterCount = focusFilters.length + (orgFilter ? 1 : 0) + (seniorityFilter ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Page header */}
      <div className="wr-phead">
        <div>
          <h1>People</h1>
          <div className="meta">{filtered.length.toLocaleString()} of {people.length.toLocaleString()} profiles · DoD directory</div>
        </div>
        <div className="wr-pseg">
          <button className={'wr-pseg-btn' + (seg === 'gov' ? ' on' : '')} onClick={() => setSeg('gov')}>
            <IcGov /> GOVERNMENT
          </button>
          <button className={'wr-pseg-btn' + (seg === 'ind' ? ' on' : '')} onClick={() => setSeg('ind')}>
            INDUSTRY
          </button>
        </div>
        <div style={{ marginLeft: 'auto' }} />
        <button className="wr-psort" onClick={cycleSort}>
          <IcSort /> Sort: <b>{sort}</b>
        </button>
      </div>

      <div className="wr-pbody">

        {/* ── Filter rail ── */}
        <aside className="wr-pfilters">
          <div className="wr-fsearch">
            <IcSearch />
            <input
              placeholder="Filter people by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Focus area */}
          <div className="wr-fg">
            <div className="wr-fg-h">
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
                onClick={() => setFocusSectionOpen(v => !v)}
              >
                <span style={{ color: 'var(--ink-2)', fontSize: 10, fontFamily: 'IBM Plex Mono', letterSpacing: '1.4px', textTransform: 'uppercase', fontWeight: 700 }}>Focus area</span>
                <span style={{ marginLeft: 4, color: 'var(--ink-3)', transition: 'transform .15s', transform: focusSectionOpen ? 'none' : 'rotate(-90deg)', display: 'flex' }}><IcChevD /></span>
              </button>
              {focusFilters.length > 0 && (
                <span className="clr" onClick={() => setFocusFilters([])}>Clear</span>
              )}
            </div>
            {focusSectionOpen && Object.entries(focusCounts).filter(([, c]) => c > 0).map(([f, c]) => (
              <div key={f} className={'wr-foc' + (focusFilters.includes(f) ? ' on' : '')} onClick={() => toggleFocus(f)}>
                <span className="dot" style={{ background: FOCUS_COLORS[f] }} />
                <span>{f}</span>
                <span className="c">{c}</span>
                <span className="tick"><IcTick /></span>
              </div>
            ))}
          </div>

          {/* Organization — top 2 levels */}
          <div className="wr-fg">
            <div className="wr-fg-h">
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
                onClick={() => setOrgSectionOpen(v => !v)}
              >
                <span style={{ color: 'var(--ink-2)', fontSize: 10, fontFamily: 'IBM Plex Mono', letterSpacing: '1.4px', textTransform: 'uppercase', fontWeight: 700 }}>Organization</span>
                <span style={{ marginLeft: 4, color: 'var(--ink-3)', transition: 'transform .15s', transform: orgSectionOpen ? 'none' : 'rotate(-90deg)', display: 'flex' }}><IcChevD /></span>
              </button>
              {orgFilter && <span className="clr" onClick={() => setOrgFilter(null)}>Clear</span>}
            </div>
            {orgSectionOpen && filterOrgs.map(o => {
              const cnt = people.filter(p => p.org_id === o.id).length;
              return (
                <div key={o.id} className={'wr-chk' + (orgFilter === o.id ? ' on' : '')} onClick={() => setOrgFilter(orgFilter === o.id ? null : o.id)}>
                  <span className="box">{orgFilter === o.id ? <IcTick /> : null}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{o.name}</span>
                  <span className="c">{cnt}</span>
                </div>
              );
            })}
          </div>

          {/* Title / Seniority */}
          <div className="wr-fg">
            <div className="wr-fg-h">
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
                onClick={() => setSeniorSectionOpen(v => !v)}
              >
                <span style={{ color: 'var(--ink-2)', fontSize: 10, fontFamily: 'IBM Plex Mono', letterSpacing: '1.4px', textTransform: 'uppercase', fontWeight: 700 }}>Seniority</span>
                <span style={{ marginLeft: 4, color: 'var(--ink-3)', transition: 'transform .15s', transform: seniorSectionOpen ? 'none' : 'rotate(-90deg)', display: 'flex' }}><IcChevD /></span>
              </button>
              {seniorityFilter && <span className="clr" onClick={() => setSeniorityFilter(null)}>Clear</span>}
            </div>
            {seniorSectionOpen && SENIORITY_GROUPS.map(g => {
              const cnt = seniorityCounts[g.label] ?? 0;
              if (!cnt) return null;
              return (
                <div key={g.label} className={'wr-chk' + (seniorityFilter === g.label ? ' on' : '')} onClick={() => setSeniorityFilter(seniorityFilter === g.label ? null : g.label)}>
                  <span className="box">{seniorityFilter === g.label ? <IcTick /> : null}</span>
                  <span style={{ flex: 1, fontSize: 12.5 }}>{g.label}</span>
                  <span className="c">{cnt}</span>
                </div>
              );
            })}
          </div>

          {/* Contract data filter */}
          <div className="wr-fg">
            <div className="wr-fg-h" style={{ marginBottom: 8 }}>
              <span style={{ color: 'var(--ink-2)', fontSize: 10, fontFamily: 'IBM Plex Mono', letterSpacing: '1.4px', textTransform: 'uppercase', fontWeight: 700 }}>Contracts</span>
            </div>
            <div
              className={'wr-chk' + (contractFilter ? ' on' : '')}
              onClick={() => setContractFilter(v => !v)}
            >
              <span className="box">{contractFilter ? <IcTick /> : null}</span>
              <span style={{ flex: 1, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IcContract /> Has SAM.gov / USASpending data
              </span>
              <span className="c">{contractCount}</span>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="wr-pmain">

          {/* Claim banner */}
          <div className="wr-claim">
            <div className="ci"><IcFlag /></div>
            <div className="ctx">
              <div className="ct">Is one of these profiles you?</div>
              <div className="cs">Claim your profile to manage your title, focus areas, and reporting lines — verified profiles get a badge.</div>
            </div>
            <div className="cbtn"><IcTick /> Claim your profile</div>
          </div>

          {/* Active filter chips */}
          <div className="wr-ptool">
            <span className="cnt">{filtered.length} {filtered.length === 1 ? 'person' : 'people'}</span>
            {focusFilters.map(f => (
              <span className="wr-achip" key={f}>
                <span className="dot" style={{ background: FOCUS_COLORS[f] }} />{f}
                <span className="x" onClick={() => toggleFocus(f)}>✕</span>
              </span>
            ))}
            {orgFilter && (
              <span className="wr-achip">
                <span className="dot" style={{ background: 'var(--accent)' }} />
                {topOrgs.find(o => o.id === orgFilter)?.name}
                <span className="x" onClick={() => setOrgFilter(null)}>✕</span>
              </span>
            )}
            {seniorityFilter && (
              <span className="wr-achip">
                <span className="dot" style={{ background: 'var(--ink-3)' }} />
                {seniorityFilter}
                <span className="x" onClick={() => setSeniorityFilter(null)}>✕</span>
              </span>
            )}
            {contractFilter && (
              <span className="wr-achip">
                <span style={{ display: 'flex', color: '#2f8676' }}><IcContract /></span>
                SAM.gov / USASpending
                <span className="x" onClick={() => setContractFilter(false)}>✕</span>
              </span>
            )}
          </div>

          {/* People grid */}
          <div className="wr-pscroll">
            {seg === 'ind' ? (
              <div className="wr-pempty">Industry profiles coming soon.</div>
            ) : filtered.length === 0 ? (
              <div className="wr-pempty">No people match these filters.</div>
            ) : (
              <>
                <div className="wr-pgrid">
                  {paged.map(p => (
                    <PersonCard key={p.id} p={p} onOpen={() => setOpenProfile(p)} />
                  ))}
                </div>
                <Pagination
                  total={filtered.length}
                  page={page}
                  perPage={PEOPLE_PER_PAGE}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Profile slide-over */}
      {openProfile && (
        <ProfilePanel p={openProfile} onClose={() => setOpenProfile(null)} />
      )}
    </div>
  );
}
