'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { OrgProfile, NavOrg, ChildOrg, Contact, Contract } from './data';

/* ── helpers ─────────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(n: string | null | undefined) { const s = n || '?'; return COLORS[Math.abs(s.charCodeAt(0) + (s.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string | null | undefined) { return (n || '?').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function fmtMoney(v: number|null) {
  if (!v) return '—';
  if (v>=1e9) return `$${(v/1e9).toFixed(1)}B`;
  if (v>=1e6) return `$${(v/1e6).toFixed(1)}M`;
  if (v>=1e3) return `$${(v/1e3).toFixed(0)}K`;
  return `$${v}`;
}

const TIER_LABELS: Record<number, string> = {
  1: 'Principal Leadership',
  2: 'Deputy / Chief of Staff',
  3: 'Under Secretary / Director',
  4: 'Assistant Secretary',
  5: 'Deputy Assistant Secretary',
  6: 'Senior Advisors',
  7: 'Directors',
  8: 'Deputy Directors',
  9: 'Associate Directors',
  10: 'Program Managers',
  11: 'Contracting Officers',
};

function generateBio(c: Contact, orgName: string): string {
  const t = c.title ?? 'official';
  const o = c.org_full ?? orgName;
  const tier = c.hierarchy_order ?? 10;
  if (tier === 1) return `${c.name} serves as ${t}, overseeing all operations of the ${o}. As the principal leader, they are responsible for policy direction, resource allocation, and strategic planning.`;
  if (tier === 2) return `${c.name} serves as ${t} of the ${o}, supporting the principal in day-to-day operations and leading key initiatives across the organization.`;
  if (tier <= 4) return `${c.name} serves as ${t} within the ${o}, providing senior leadership across their portfolio and advising the principal staff on policy and operations.`;
  return `${c.name} serves as ${t} within the ${o}.`;
}

/* ── Icons ────────────────────────────────────────────────────────────── */
const IcX     = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcPlus  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>;
const IcFlag  = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V4m0 0 .8-.4a6 6 0 0 1 5.6.2 6 6 0 0 0 5.6.2L20 4v10l-1.5.7a6 6 0 0 1-5.6-.2 6 6 0 0 0-5.6-.2L4 15"/></svg>;
const IcTick  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M20 6 9 17l-5-5"/></svg>;
const IcPin   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcOrg   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/></svg>;
const IcChat  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.9-4.5A8.4 8.4 0 1 1 21 11.5Z"/></svg>;
const IcVf    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M20 6 9 17l-5-5"/></svg>;
const IcLI2   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;

const FOCUS_COLORS3: Record<string, string> = {
  Operations: '#2563B8', Cyber: '#2E8E8C', Intelligence: '#2E9E6B',
  Acquisition: '#C98A2B', 'AI/ML': '#5B5BD6', Space: '#7E58C4',
  Contracting: '#5A6B82', Strategy: '#41618F', Policy: '#B5566B',
};

function inferFocusOrg(title: string | null, branch: string | null): string[] {
  const t = ((title ?? '') + ' ' + (branch ?? '')).toLowerCase();
  const out: string[] = [];
  if (/cyber|info(rmation)? war/.test(t)) out.push('Cyber');
  if (/intel|reconnaissance|surveillance/.test(t)) out.push('Intelligence');
  if (/acqui|peo |program exec|materiel|lifecycle/.test(t)) out.push('Acquisition');
  if (/contract|sourc|procure|dcaa/.test(t)) out.push('Contracting');
  if (/space|satellite|orbital|ussf|space force/.test(t)) out.push('Space');
  if (/research|lab |science|innovation|darpa|arpa/.test(t)) out.push('AI/ML');
  if (/strateg|plans|j5|j8/.test(t)) out.push('Strategy');
  if (/polic|legislat|comptroll|financ|budget/.test(t)) out.push('Policy');
  if (out.length === 0) out.push('Operations');
  return out.slice(0, 2);
}

function PfSecOrg({ title, children }: { title: string; children: React.ReactNode }) {
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

/* ── Person panel ─────────────────────────────────────────────────────── */
function PersonPanel({ contact, org, allContacts, onClose }: {
  contact: Contact; org: OrgProfile; allContacts: Contact[]; onClose: () => void;
}) {
  const bg = contact.avatar_color ?? colorFor(contact.name);
  const tier = contact.hierarchy_order ?? 10;
  const tierLabel = TIER_LABELS[tier] ?? `Tier ${tier}`;
  const above = allContacts.filter(c => (c.hierarchy_order ?? 99) === tier - 1).slice(0, 3);
  const below = allContacts.filter(c => (c.hierarchy_order ?? 99) === tier + 1).slice(0, 4);
  const claimed = !!contact.email;
  const focus = inferFocusOrg(contact.title ?? null, org.branch ?? null);
  const orgColor = colorFor(org.name);

  return (
    <div className="wr-pf-back" onClick={onClose}>
      <div className="wr-pf" onClick={e => e.stopPropagation()}>

        {/* Dark header */}
        <div className="wr-pf-hd">
          <button className="wr-pf-x" onClick={onClose}><IcX /></button>
          <div className="wr-pf-top">
            <div className="wr-pf-av" style={{background: bg}}>
              {contact.photo_url
                ? <img src={contact.photo_url} alt={contact.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                : initials(contact.name)}
            </div>
            <div>
              <div className="wr-pf-nm">
                <span className="n">{contact.name}</span>
                {claimed
                  ? <span className="wr-pf-vf" title="Profile active"><IcVf /></span>
                  : <span className="wr-pf-unc">Unclaimed</span>}
              </div>
              <div className="wr-pf-ti">{contact.title ?? '—'}</div>
              <div className="wr-pf-sub">
                <span style={{display:'flex'}}><IcPin /></span>
                {org.name}{org.hq_address ? ` · ${org.hq_address}` : ''}
              </div>
              <div className="wr-pf-act">
                <button className="wr-pf-btn pri"><IcPlus /> Follow</button>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="wr-pf-btn gho" style={{textDecoration:'none'}}>
                    <IcChat /> Message
                  </a>
                )}
                {contact.linkedin && (
                  <a href={`https://linkedin.com/in/${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="wr-pf-btn gho" style={{textDecoration:'none'}}>
                    <IcLI2 /> LinkedIn
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
          <PfSecOrg title="About">
            <div className="wr-pf-about">{contact.bio ?? generateBio(contact, org.name)}</div>
          </PfSecOrg>

          {/* Focus areas */}
          <PfSecOrg title="Focus areas">
            <div className="wr-pf-foc">
              {focus.map(f => (
                <span className="wr-fchip" key={f}>
                  <span className="dot" style={{background: FOCUS_COLORS3[f]}} />{f}
                </span>
              ))}
            </div>
          </PfSecOrg>

          {/* Organization with mini org chart */}
          <PfSecOrg title="Organization">
            <div className="wr-pf-rep">
              <div className="wr-pf-sup">
                <div className="av" style={{background: orgColor}}>{initials(org.name)}</div>
                <div className="tx">
                  <div className="rl">Member of</div>
                  <div className="nn">{org.name}</div>
                  {org.hq_address && <div className="tt">{org.hq_address}</div>}
                </div>
              </div>
              <div className="wr-pf-repbar">
                <span className="m">
                  {tier === 1 ? 'Principal leader' : `Tier ${tier} position`}
                  {org.abs_hierarchy_level != null ? ` · DoD Level L${org.abs_hierarchy_level}` : ''}
                </span>
                <Link href={`/org/${contact.org_id}`} prefetch={false} className="lk">
                  <IcOrg /> Open org chart →
                </Link>
              </div>
            </div>
            {/* Mini org chart */}
            <div style={{marginTop:12}}>
              <div className="pp-oc-vline" />
              {above.length > 0 && (
                <>
                  <div className="pp-oc-row">
                    {above.map(c => (
                      <div key={c.id} className="pp-oc-card" style={{opacity:.65}}>
                        <div className="pp-oc-av" style={{background:c.avatar_color??colorFor(c.name)}}>
                          {c.photo_url ? <img src={c.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : initials(c.name)}
                        </div>
                        <div className="pp-oc-name">{c.name}</div>
                        <div className="pp-oc-role">{c.title}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pp-oc-vline" />
                </>
              )}
              <div className="pp-oc-row">
                <div className="pp-oc-card active">
                  <div className="pp-oc-av" style={{background:bg}}>
                    {contact.photo_url ? <img src={contact.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : initials(contact.name)}
                  </div>
                  <div className="pp-oc-name">{contact.name}</div>
                  <div className="pp-oc-role">{contact.title}</div>
                </div>
              </div>
              {below.length > 0 && (
                <>
                  <div className="pp-oc-vline" />
                  <div className="pp-oc-row">
                    {below.map(c => (
                      <div key={c.id} className="pp-oc-card" style={{opacity:.65}}>
                        <div className="pp-oc-av" style={{background:c.avatar_color??colorFor(c.name)}}>
                          {c.photo_url ? <img src={c.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : initials(c.name)}
                        </div>
                        <div className="pp-oc-name">{c.name}</div>
                        <div className="pp-oc-role">{c.title}</div>
                      </div>
                    ))}
                    {below.length === 4 && (
                      <div className="pp-oc-card" style={{opacity:.4,justifyContent:'center'}}>
                        <span style={{fontSize:11,fontFamily:'IBM Plex Mono',color:'var(--ink-3)'}}>+more</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </PfSecOrg>

          {/* Position */}
          <PfSecOrg title="Position">
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <span className="pp-tag">{tierLabel}</span>
              {contact.tags?.map((t,i) => <span key={i} className="pp-tag">{t}</span>)}
            </div>
          </PfSecOrg>

          {/* LinkedIn section if available */}
          {contact.linkedin && (
            <PfSecOrg title="LinkedIn">
              <a href={`https://linkedin.com/in/${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="wr-pf-btn gho" style={{textDecoration:'none',display:'inline-flex',marginTop:2}}>
                <IcLI2 /> linkedin.com/in/{contact.linkedin}
              </a>
            </PfSecOrg>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── Tier-box org chart ──────────────────────────────────────────────── */
const CARDS_PER_TIER = 8;

/* ── Tier accent colours ──────────────────────────────────────────── */
const TIER_COLORS: Record<number, string> = {
  1: '#2563B8', 2: '#7c4dbc', 3: '#e0a32e', 4: '#2f8676',
  5: '#c8502d', 6: '#1d6b8a', 7: '#5a6b82', 8: '#283a6b',
};
function tierColor(t: number) { return TIER_COLORS[t] ?? TIER_COLORS[8]; }

function OcCard({ c, tier, onSelect, canDrill, isDrill, onDrill }: {
  c: Contact; tier: number; onSelect: (c: Contact) => void;
  canDrill?: boolean; isDrill?: boolean; onDrill?(): void;
}) {
  const bg = c.avatar_color ?? colorFor(c.name);
  const tc = tierColor(tier);
  return (
    <div className={`oct-card${isDrill ? ' oct-card-active' : ''}`} onClick={() => onSelect(c)}>
      <div className="oct-bar" style={{ background: tc }} />
      <div className="oct-head">{c.title ?? '—'}</div>
      <div className="oct-person">
        <div className="oct-av" style={{ background: bg }}>
          {c.photo_url
            ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initials(c.name)}
        </div>
        <div className="oct-info">
          <div className="oct-name">{c.name}</div>
          {c.email && <div className="oct-sub">{c.email}</div>}
          {canDrill && (
            <button className="oct-drill" onClick={e => { e.stopPropagation(); onDrill?.(); }}>
              ↓ expand
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OrgChartBroad({ contacts, onSelect }: { contacts: Contact[]; onSelect: (c: Contact) => void }) {
  const [visibleDepth, setVisibleDepth] = useState(99);

  const levelMap = new Map<number, Contact[]>();
  for (const c of contacts) {
    const lvl = c.hierarchy_order ?? 10;
    if (lvl >= 11) continue;
    if (!levelMap.has(lvl)) levelMap.set(lvl, []);
    levelMap.get(lvl)!.push(c);
  }
  const levels = Array.from(levelMap.entries()).sort((a, b) => a[0] - b[0]);
  if (levels.length === 0) return <div className="oc-empty">No contacts found for this org</div>;

  const visLevels = levels.slice(0, visibleDepth);

  return (
    <div className="oct-wrap">
      {visLevels.map(([tier, members], idx) => {
        const shown = idx === 0 ? members.slice(0, 1) : members;
        const multi = shown.length > 1;
        const isLastVisible = idx === visLevels.length - 1;
        const hasNextLevel = idx < levels.length - 1;
        const parentName = idx > 0 ? levels[idx - 1][1][0]?.name ?? '' : '';

        return (
          <div key={tier} className="oct-level">
            {idx > 0 && <div className="oct-vline" />}
            {idx > 0 && (
              <div className="oct-section-hd">
                <span className="oct-section-who">{parentName}</span>
                <button className="oct-collapse-hd" onClick={() => setVisibleDepth(idx)}>Collapse ↑</button>
              </div>
            )}
            <div className={multi ? 'oct-row multi' : 'oct-row'}>
              {shown.map(c => (
                <div key={c.id} className="oct-col">
                  <OcCard c={c} tier={tier} onSelect={onSelect}
                    canDrill={isLastVisible && hasNextLevel}
                    onDrill={isLastVisible && hasNextLevel ? () => setVisibleDepth(idx + 2) : undefined} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Fact row for sidebar ─────────────────────────────────────────────── */
function FactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: React.ReactNode; href?: string }) {
  return (
    <div className="orgd-fact-row">
      <span className="orgd-fact-icon">{icon}</span>
      <div className="orgd-fact-body">
        <div className="orgd-fact-val">{href
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="orgd-fact-link">{value}</a>
          : value}
        </div>
        <div className="orgd-fact-lbl">{label}</div>
      </div>
    </div>
  );
}

/* ── Contract vehicle accordion item ─────────────────────────────────── */
function VehicleRow({ v }: { v: NonNullable<NonNullable<OrgProfile['profile']>['contract_vehicles']>[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`orgd-cv-row${open ? ' open' : ''}`}>
      <button className="orgd-cv-hd" onClick={() => setOpen(o => !o)}>
        <div className="orgd-cv-hd-left">
          <span className="orgd-cv-name">{v.name}</span>
          <span className="orgd-cv-num">{v.number}</span>
        </div>
        <svg className="orgd-cv-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="orgd-cv-body">
          <p className="orgd-cv-desc">{v.description}</p>
          {v.domains && <p className="orgd-cv-domains"><strong>Domains:</strong> {v.domains}</p>}
          {v.sins && v.sins.length > 0 && (
            <div className="orgd-cv-sins">
              {v.sins.map(sin => (
                <div key={sin.code} className="orgd-cv-sin">
                  <div className="orgd-cv-sin-hd">
                    <span className="orgd-cv-sin-code">SIN {sin.code}</span>
                    <span className="orgd-cv-sin-name">{sin.name}</span>
                  </div>
                  <p className="orgd-cv-sin-desc">{sin.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Icons for sidebar ────────────────────────────────────────────────── */
const IcBuilding  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M9 21V7l6-4v18M9 12h6M9 16h6M9 8h.01"/></svg>;
const IcBriefcase = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcAward2    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcGlobe     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcDollar    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IcUsers     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcCompany   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const IcMapPin    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcCalendar  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

/* ── Main component ──────────────────────────────────────────────────── */
interface Props {
  org: OrgProfile;
  navOrgs: NavOrg[];
  childOrgs: ChildOrg[];
  contacts: Contact[];
  contracts: Contract[];
  tab: string;
}

export default function OrgDetail({ org, navOrgs, childOrgs, contacts, contracts, tab: initialTab }: Props) {
  const [tab, setTab] = useState(initialTab);
  const [panel, setPanel] = useState<Contact | null>(null);

  const color = colorFor(org.name);
  const ini = initials(org.name);
  const p = org.profile;
  const vehicles = p?.contract_vehicles ?? [];

  const TABS = [
    { key: 'chart', label: `People (${contacts.length})` },
    { key: 'contracts', label: `Contracts (${contracts.length})` },
  ];

  /* Breadcrumb builder */
  const crumbs: { id: string; name: string }[] = [];
  let pid = org.parent_id;
  const navMap = new Map(navOrgs.map(o => [o.id, o]));
  while (pid && crumbs.length < 3) {
    const par = navMap.get(pid);
    if (!par) break;
    crumbs.unshift({ id: par.id, name: par.name });
    pid = par.parent_id;
  }

  return (
    <>
      <div className="org-detail">
        {/* Breadcrumb */}
        <div className="orgd-sub">
          <Link href="/" className="orgd-back">←</Link>
          {crumbs.map(c => (
            <span key={c.id} style={{display:'flex',alignItems:'center',gap:4}}>
              <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
              <Link href={`/org/${c.id}`} prefetch={false} className="orgd-sname" style={{textDecoration:'none',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {c.name}
              </Link>
            </span>
          ))}
          <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
          <span className="orgd-sname" style={{color:'var(--ink)',fontWeight:600}}>{org.name}</span>
        </div>

        <div className="orgd-layout">

          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="orgd-main">

            {/* Logo + Name header */}
            <div className="orgd-identity">
              {p?.logo_url
                ? <img src={p.logo_url} alt={org.name} className="orgd-logo" />
                : <div className="orgd-orgmark" style={{background:color,width:64,height:64,fontSize:22,borderRadius:14}}>{ini}</div>
              }
              <div>
                {org.branch && <div className="orgd-type">{org.branch}</div>}
                <h1 className="orgd-title">{org.name}</h1>
                {p?.mission && <p className="orgd-mission">"{p.mission}"</p>}
              </div>
            </div>

            {/* Description */}
            {(p?.full_description || org.description) && (
              <div className="orgd-section">
                <div className="orgd-section-label">Description</div>
                <p className="orgd-body-text">{p?.full_description ?? org.description}</p>
              </div>
            )}

            {/* Contract Vehicles */}
            {vehicles.length > 0 && (
              <div className="orgd-section">
                <div className="orgd-section-label">Contract Vehicles</div>
                <div className="orgd-cv-list">
                  {vehicles.map((v, i) => <VehicleRow key={i} v={v} />)}
                </div>
              </div>
            )}

            {/* Tabs + org chart / contracts */}
            <div className="orgd-section" style={{marginTop:8}}>
              <div className="orgd-tabs">
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)} className={`orgd-tab${tab===t.key?' on':''}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'chart' && (
                <div className="oc-chart-wrap">
                  <OrgChartBroad contacts={contacts} onSelect={setPanel} />
                  {childOrgs.length > 0 && (
                    <div className="child-orgs-section">
                      <div className="child-orgs-label">SUBORDINATE ORGANIZATIONS ({childOrgs.length})</div>
                      <div className="ohier-row">
                        {childOrgs.map(child => (
                          <Link key={child.id} href={`/org/${child.id}`} prefetch={false} className="child-org-card">
                            <div className="child-org-card-name">{child.name}</div>
                            <div className="child-org-card-meta">
                              {child.contact_count > 0 && <span>{child.contact_count} contacts</span>}
                              {child.contact_count > 0 && child.contract_count > 0 && <span> · </span>}
                              {child.contract_count > 0 && <span>{child.contract_count} contracts</span>}
                              {child.contact_count === 0 && child.contract_count === 0 && <span>{child.organization_type ?? '—'}</span>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'contracts' && (
                <div style={{paddingTop:12}}>
                  {contracts.length === 0
                    ? <div className="oc-empty">No contracts linked to this org</div>
                    : contracts.map(c => {
                        const typeColor = c.signal_type==='Opportunity' ? 'var(--teal)' : c.signal_type==='Award' ? 'var(--navy)' : 'var(--amber)';
                        const badgeCls  = c.signal_type==='Opportunity' ? 'sig-badge-opp' : c.signal_type==='Award' ? 'sig-badge-award' : 'sig-badge-budget';
                        return (
                          <div key={c.id} className="sv-sig-row">
                            <div className="sv-sig-dot" style={{background:typeColor}} />
                            <div className="sv-sig-body">
                              <div className="sv-sig-title">{c.title}</div>
                              <div className="sv-sig-meta-row">
                                <span className={`sig-badge ${badgeCls}`}>{c.signal_type ?? 'Signal'}</span>
                                <span className="sv-sig-val" style={{color:typeColor}}>{fmtMoney(c.value)}</span>
                                {c.award_date && <span className="sig-deadline">{new Date(c.award_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>}
                                <span className="sig-set-aside">{c.source?.replace('_','.')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ────────────────────────────────────────── */}
          <aside className="orgd-sidebar">
            <div className="orgd-sidebar-card">
              {p?.offices != null && (
                <FactRow icon={<IcBuilding />} label="Offices" value={`${p.offices} Offices`} />
              )}
              {(p?.industry || org.branch) && (
                <FactRow icon={<IcBriefcase />} label={p?.industry ? 'Industry' : 'Branch'} value={p?.industry ?? org.branch ?? ''} />
              )}
              {p?.awards && (
                <FactRow icon={<IcAward2 />} label="Awards" value={p.awards} />
              )}
              {org.website && (
                <FactRow icon={<IcGlobe />} label="Website" value="View site" href={org.website} />
              )}
              {p?.revenue && (
                <FactRow icon={<IcDollar />} label="Revenue" value={p.revenue} />
              )}
              {p?.employees && (
                <FactRow icon={<IcUsers />} label="Employees" value={`${p.employees} Employees`} />
              )}
              {p?.company_type && (
                <FactRow icon={<IcCompany />} label="Company" value={p.company_type} />
              )}
              {org.hq_address && (
                <FactRow icon={<IcMapPin />} label="Address" value={org.hq_address} />
              )}
              {p?.founded && (
                <FactRow icon={<IcCalendar />} label="Founded" value={p.founded} />
              )}
              {org.abs_hierarchy_level != null && (
                <FactRow icon={<IcBuilding />} label="DoD Level" value={`L${org.abs_hierarchy_level}`} />
              )}
              <FactRow icon={<IcUsers />} label="Contacts" value={`${org.contact_count}`} />
            </div>
          </aside>
        </div>
      </div>

      {panel && (
        <PersonPanel contact={panel} org={org} allContacts={contacts} onClose={() => setPanel(null)} />
      )}
    </>
  );
}
