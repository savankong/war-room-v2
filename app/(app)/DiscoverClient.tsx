'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/app/components/Pagination';

const ORGS_PER_PAGE = 25;
const IND_PER_PAGE  = 50;

/* ── helpers ─────────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a','#2563B8','#3B7DB0'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
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
  return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

/* ── Value tiers for industry sidebar ───────────────────────────────── */
const VALUE_TIERS = [
  { label: '$10B+',       min: 10e9,  max: Infinity },
  { label: '$1B – $10B',  min: 1e9,   max: 10e9 },
  { label: '$100M – $1B', min: 100e6, max: 1e9 },
  { label: '$10M – $100M',min: 10e6,  max: 100e6 },
  { label: '< $10M',      min: 0,     max: 10e6 },
];

/* ── Company detail panel ────────────────────────────────────────────── */
const EXEC_COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function execColorFor(n: string) { return EXEC_COLORS[Math.abs(n.charCodeAt(0)+(n.charCodeAt(1)||0)) % EXEC_COLORS.length]; }
function execInitials(n: string) { return n.split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

function typeColor(t: string) {
  return t === 'Opportunity' ? '#2f8676' : t === 'Award' ? '#283a6b' : '#C98A2B';
}

/* ── Icons ───────────────────────────────────────────────────────────── */
const IcX2    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcPlus2 = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>;
const IcFlag2 = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V4m0 0 .8-.4a6 6 0 0 1 5.6.2 6 6 0 0 0 5.6.2L20 4v10l-1.5.7a6 6 0 0 1-5.6-.2 6 6 0 0 0-5.6-.2L4 15"/></svg>;
const IcTick2 = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M20 6 9 17l-5-5"/></svg>;
const IcPin2  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcOrg2  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/></svg>;
const IcLI    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;

const FOCUS_COLORS2: Record<string, string> = {
  Operations: '#2563B8', Cyber: '#2E8E8C', Intelligence: '#2E9E6B',
  Acquisition: '#C98A2B', 'AI/ML': '#5B5BD6', Space: '#7E58C4',
  Contracting: '#5A6B82', Strategy: '#41618F', Finance: '#B5566B',
};

function inferIndustryFocus(title: string | null): string[] {
  const t = (title ?? '').toLowerCase();
  const out: string[] = [];
  if (/\bceo\b|chairman|chief executive/.test(t)) out.push('Strategy');
  if (/\bcfo\b|financ|chief financial/.test(t)) out.push('Finance');
  if (/\bcio\b|information officer/.test(t)) out.push('AI/ML');
  if (/cyber|security/.test(t)) out.push('Cyber');
  if (/intel|surveillance|reconnaissance/.test(t)) out.push('Intelligence');
  if (/space|satellite/.test(t)) out.push('Space');
  if (/acqui|business dev|bd/.test(t)) out.push('Acquisition');
  if (out.length === 0) out.push('Operations');
  return out.slice(0, 2);
}

function generateIndustryBio(name: string, title: string | null, company: string): string {
  const t = title ?? 'executive';
  const tier = /ceo|chairman|chief executive/i.test(t) ? 1 : /president|chief|evp/i.test(t) ? 2 : 3;
  if (tier === 1) return `${name} serves as ${t} of ${company}, holding overall responsibility for strategy, operations, and the company's defense contracting portfolio.`;
  if (tier === 2) return `${name} serves as ${t} at ${company}, leading a major division or functional area within one of the nation's premier defense contractors.`;
  return `${name} serves as ${t} at ${company}, providing senior leadership across their area of responsibility.`;
}

function PfSec2({ title, children }: { title: string; children: React.ReactNode }) {
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

/* ── SBIR badge helpers ───────────────────────────────────────────────── */
const SBIR_AMBER = '#C98A2B';
const SBIR_AMBER_BG = 'rgba(201,138,43,.10)';
const SBIR_AMBER_BORDER = 'rgba(201,138,43,.30)';

function SbirPhaseBadge({ phase }: { phase: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 7px', borderRadius: 4,
      border: `1px solid ${SBIR_AMBER_BORDER}`,
      background: SBIR_AMBER_BG,
      fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 700,
      color: SBIR_AMBER, whiteSpace: 'nowrap',
    }}>
      SBIR {phase}
    </span>
  );
}

function SbirBadges({ company, compact = false }: { company: any; compact?: boolean }) {
  const phase = company.sbir_phase;
  const caps: string[]  = company.sbir_capabilities ?? [];
  const desig: string[] = company.sbir_designations ?? [];
  if (!phase && caps.length === 0 && desig.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: compact ? 4 : 8 }}>
      {phase && <SbirPhaseBadge phase={phase} />}
      {desig.map(d => (
        <span key={d} style={{
          padding: '2px 6px', borderRadius: 4, fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 600,
          background: 'rgba(47,134,118,.08)', border: '1px solid rgba(47,134,118,.25)', color: '#2f8676',
        }}>{d}</span>
      ))}
      {!compact && caps.slice(0, 5).map(c => (
        <span key={c} style={{
          padding: '2px 6px', borderRadius: 4, fontFamily: 'IBM Plex Mono', fontSize: 10,
          background: 'var(--field)', border: '1px solid var(--card-border)', color: 'var(--ink-2)',
        }}>{c}</span>
      ))}
    </div>
  );
}

const T2_INIT = 6;
const T3_INIT = 8;

function OrgTree({ tier1, tier2, tier3, onPerson }: {
  tier1: any[]; tier2: any[]; tier3: any[];
  onPerson(p: any): void;
}) {
  const [showAllT2, setShowAllT2] = useState(false);
  const [showAllT3, setShowAllT3] = useState(false);
  const [drillNode, setDrillNode] = useState<any|null>(null);

  const visT2 = showAllT2 ? tier2 : tier2.slice(0, T2_INIT);
  const visT3 = showAllT3 ? tier3 : tier3.slice(0, T3_INIT);

  const OrgNode = ({ p, root = false }: { p: any; root?: boolean }) => {
    const color = execColorFor(p.name);
    const ini   = execInitials(p.name);
    const isDrill = drillNode?.id === p.id;
    return (
      <div
        className={'wr-ot-node' + (isDrill ? ' active' : '')}
        style={root ? { width: 164, borderWidth: 2, borderColor: 'var(--accent)', boxShadow: '0 2px 14px rgba(37,99,184,.14)' } : {}}
        onClick={() => onPerson(p)}
      >
        {root && <span className="rk">CEO</span>}
        <div className="wr-ot-av" style={{ background: color }}>{ini}</div>
        <div className="wr-ot-nm">{p.name}</div>
        {p.title && <div className="wr-ot-rl">{p.title}</div>}
        {!root && tier3.length > 0 && (
          <button
            onClick={e => { e.stopPropagation(); setDrillNode(isDrill ? null : p); setShowAllT3(false); }}
            style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'IBM Plex Mono', fontSize: 9.5, color: isDrill ? 'var(--accent)' : 'var(--ink-3)', padding: 0 }}
          >
            {isDrill ? '↑ collapse' : '↓ expand'}
          </button>
        )}
      </div>
    );
  };

  /* Drill-down: show CEO → selected tier2 → all tier3 */
  if (drillNode) {
    return (
      <div className="wr-orgtree">
        <button className="wr-ot-back" onClick={() => setDrillNode(null)}>← All people</button>
        {/* CEO (dimmed) */}
        {tier1.map(p => (
          <div key={p.id} style={{ opacity: 0.45 }} onClick={() => onPerson(p)}>
            <OrgNode p={p} root />
          </div>
        ))}
        <div className="wr-ot-vline" />
        {/* Drill target */}
        <div className="wr-ot-row">
          <div className="wr-ot-col">
            <OrgNode p={drillNode} />
          </div>
        </div>
        {/* Tier 3 under drill target */}
        {tier3.length > 0 && (
          <>
            <div className="wr-ot-vline" />
            <div className="wr-ot-label"><span className="dot" />Senior Leadership <span style={{ color:'var(--ink-3)', marginLeft:4 }}>{tier3.length} people</span></div>
            <div className="wr-ot-row" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 0, maxWidth: 780 }}>
              {(showAllT3 ? tier3 : tier3.slice(0, T3_INIT)).map(p => (
                <div key={p.id} className="wr-ot-col" style={{ marginBottom: 8 }}>
                  <OrgNode p={p} />
                </div>
              ))}
              {!showAllT3 && tier3.length > T3_INIT && (
                <div className="wr-ot-col">
                  <button className="wr-ot-more" onClick={() => setShowAllT3(true)}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>+{tier3.length - T3_INIT}</span>
                    more
                  </button>
                </div>
              )}
              {showAllT3 && tier3.length > T3_INIT && (
                <div className="wr-ot-col">
                  <button className="wr-ot-more" onClick={() => setShowAllT3(false)}>↑ less</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  /* Full tree view */
  return (
    <div className="wr-orgtree">
      {/* CEO */}
      {tier1.map(p => <OrgNode key={p.id} p={p} root />)}

      {/* Tier 2 */}
      {tier2.length > 0 && (
        <>
          <div className="wr-ot-vline" />
          <div className="wr-ot-label"><span className="dot" />Division Presidents <span style={{ color:'var(--ink-3)', marginLeft:4 }}>{tier2.length} people</span></div>
          <div className="wr-ot-row" style={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
            {visT2.map(p => (
              <div key={p.id} className="wr-ot-col" style={{ marginBottom: 8 }}>
                <OrgNode p={p} />
              </div>
            ))}
            {!showAllT2 && tier2.length > T2_INIT && (
              <div className="wr-ot-col">
                <button className="wr-ot-more" onClick={() => setShowAllT2(true)}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>+{tier2.length - T2_INIT}</span>
                  more
                </button>
              </div>
            )}
            {showAllT2 && tier2.length > T2_INIT && (
              <div className="wr-ot-col">
                <button className="wr-ot-more" onClick={() => setShowAllT2(false)}>↑ less</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tier 3 */}
      {tier3.length > 0 && (
        <>
          <div className="wr-ot-vline" />
          <div className="wr-ot-label"><span className="dot" />Senior Leadership <span style={{ color:'var(--ink-3)', marginLeft:4 }}>{tier3.length} people</span></div>
          <div className="wr-ot-row" style={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
            {visT3.map(p => (
              <div key={p.id} className="wr-ot-col" style={{ marginBottom: 8 }}>
                <OrgNode p={p} />
              </div>
            ))}
            {!showAllT3 && tier3.length > T3_INIT && (
              <div className="wr-ot-col">
                <button className="wr-ot-more" onClick={() => setShowAllT3(true)}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>+{tier3.length - T3_INIT}</span>
                  more
                </button>
              </div>
            )}
            {showAllT3 && tier3.length > T3_INIT && (
              <div className="wr-ot-col">
                <button className="wr-ot-more" onClick={() => setShowAllT3(false)}>↑ less</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CompanyDetail({ company, onBack }: { company: any; onBack(): void }) {
  const [tab, setTab]           = useState<'people'|'contracts'|'subs'>('people');
  const [contracts, setContracts] = useState<any[]>([]);
  const [people, setPeople]     = useState<any[]>([]);
  const [subs, setSubs]         = useState<any[]>([]);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingS, setLoadingS] = useState(false);
  const [panelPerson, setPanelPerson] = useState<any|null>(null);

  useEffect(() => {
    setLoadingP(true);
    fetch(`/api/industry/people?company=${encodeURIComponent(company.name)}`)
      .then(r => r.json())
      .then(d => { setPeople(Array.isArray(d) ? d : []); setLoadingP(false); });
  }, [company.name]);

  const isSbirOnly = (company.sources ?? []).includes('SBIR') && !(company.sources ?? []).some((s: string) => s !== 'SBIR');

  useEffect(() => {
    if (tab !== 'contracts' || contracts.length > 0) return;
    setLoadingC(true);
    const url = isSbirOnly
      ? `/api/industry/sbir-awards?org_id=${encodeURIComponent(company.name)}`
      : `/api/industry/contracts?recipient=${encodeURIComponent(company.name)}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setContracts(Array.isArray(d) ? d : []); setLoadingC(false); });
  }, [tab, company.name, contracts.length, isSbirOnly]);

  useEffect(() => {
    if (tab !== 'subs' || subs.length > 0 || !company.legal_name) return;
    setLoadingS(true);
    fetch(`/api/industry/subawards?prime=${encodeURIComponent(company.legal_name)}`)
      .then(r => r.json())
      .then(d => { setSubs(Array.isArray(d) ? d : []); setLoadingS(false); });
  }, [tab, company.legal_name, subs.length]);

  const color = colorFor(company.name);
  const ini   = initials(company.name);

  /* Title-case the company name for display */
  const displayName = company.name
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
    .replace(/\bLlc\b/g, 'LLC').replace(/\bInc\b/g, 'Inc.').replace(/\bCorp\b/g, 'Corp.');

  const TABS = [
    { key: 'people',    label: 'People',         count: people.length },
    { key: 'contracts', label: 'Contracts',       count: Number(company.contract_count) },
    { key: 'subs',      label: 'Subcontractors',  count: subs.length },
  ];

  /* Group execs by seniority tier */
  const tier1 = people.filter(p => p.hierarchy_order === 1);
  const tier2 = people.filter(p => p.hierarchy_order === 2);
  const tier3 = people.filter(p => (p.hierarchy_order ?? 99) >= 3);

  return (
    <>
      <div className="org-detail">
        {/* Breadcrumb */}
        <div className="orgd-sub">
          <button onClick={onBack} className="orgd-back" style={{background:'none',border:'none',cursor:'pointer',padding:0}}>←</button>
          <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
          <button onClick={onBack} className="orgd-sname" style={{background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'none',color:'var(--ink-2)'}}>All companies</button>
          <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
          <span className="orgd-sname" style={{color:'var(--ink)',fontWeight:600,maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{displayName}</span>
        </div>

        <div className="org-detail-body">
          {/* Hero */}
          <div className="orgd-hero-top">
            {company.logo_url
              ? <img src={company.logo_url} alt="" style={{ width:56, height:56, borderRadius:8, objectFit:'contain', background:'#fff', border:'1px solid var(--card-border)', flexShrink:0 }} />
              : <div className="orgd-orgmark" style={{background:color}}>{ini}</div>
            }
            <div style={{flex:1,minWidth:0}}>
              <div className="orgd-type">
                PRIME · {(company.sources??[]).join(' · ').replace('usaspending','USASpending').replace('sam_gov','SAM.gov')}
              </div>
              <div className="orgd-title">{company.display_name ?? displayName}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
                <span style={{padding:'2px 8px',borderRadius:4,border:'1px solid #283a6b',background:'rgba(40,58,107,.07)',fontFamily:'IBM Plex Mono',fontSize:10,color:'#283a6b',fontWeight:600}}>PRIME</span>
                {company.ticker && <span style={{padding:'2px 8px',borderRadius:4,border:'1px solid var(--card-border)',background:'var(--field)',fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-2)',fontWeight:600}}>{company.ticker}</span>}
                {company.headquarters && <span style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)'}}>📍 {company.headquarters}</span>}
                {company.website && <a href={company.website} target="_blank" rel="noreferrer" style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--accent)',textDecoration:'none'}}>↗ Website</a>}
              </div>
            </div>
          </div>

          {/* Company description */}
          {company.description && (
            <div style={{ padding:'14px 28px', borderBottom:'1px solid var(--card-border)', fontSize:13, color:'var(--ink-2)', lineHeight:1.65 }}>
              {company.description}
            </div>
          )}

          {/* Focus areas */}
          {(company.focus_areas ?? []).length > 0 && (
            <div style={{ padding:'10px 28px', borderBottom:'1px solid var(--card-border)', display:'flex', gap:6, flexWrap:'wrap' }}>
              {(company.focus_areas as string[]).map((f: string) => (
                <span key={f} style={{padding:'3px 10px',borderRadius:20,fontFamily:'IBM Plex Mono',fontSize:10,fontWeight:600,background:'rgba(40,58,107,.07)',border:'1px solid rgba(40,58,107,.2)',color:'#283a6b'}}>{f}</span>
              ))}
            </div>
          )}

          {/* Stats strip */}
          <div className="orgd-metas">
            <div className="orgd-meta">
              <div className="mlbl">Total Awarded</div>
              <div className="mval" style={{color:'var(--teal)'}}>{fmtMoney(company.total_value) ?? '—'}</div>
            </div>
            <div className="orgd-meta">
              <div className="mlbl">Contracts</div>
              <div className="mval">{Number(company.contract_count).toLocaleString()}</div>
            </div>
            <div className="orgd-meta">
              <div className="mlbl">Executives</div>
              <div className="mval">{loadingP ? '…' : people.length}</div>
            </div>
            {company.employees && (
              <div className="orgd-meta">
                <div className="mlbl">Employees</div>
                <div className="mval">{Number(company.employees).toLocaleString()}</div>
              </div>
            )}
            {company.revenue_b && (
              <div className="orgd-meta">
                <div className="mlbl">Annual Revenue</div>
                <div className="mval">${Number(company.revenue_b).toFixed(1)}B</div>
              </div>
            )}
            <div className="orgd-meta">
              <div className="mlbl">Top Agencies</div>
              <div className="mval sm">{(company.agencies??[]).slice(0,2).join(', ') || '—'}</div>
            </div>
          </div>

          {/* SBIR section */}
          {company.sbir_phase && (
            <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--card-border)', background: SBIR_AMBER_BG }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: SBIR_AMBER }}>SBIR / STTR</span>
                <SbirPhaseBadge phase={company.sbir_phase} />
                {company.sbir_award_count > 0 && (
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--ink-3)' }}>{company.sbir_award_count} awards</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(company.sbir_designations ?? []).map((d: string) => (
                  <span key={d} style={{ padding: '2px 7px', borderRadius: 4, fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 600, background: 'rgba(47,134,118,.1)', border: '1px solid rgba(47,134,118,.3)', color: '#2f8676' }}>{d}</span>
                ))}
                {(company.sbir_capabilities ?? []).map((c: string) => (
                  <span key={c} style={{ padding: '2px 7px', borderRadius: 4, fontFamily: 'IBM Plex Mono', fontSize: 10, background: 'var(--field)', border: '1px solid var(--card-border)', color: 'var(--ink-2)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="orgd-tabs">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as 'people'|'contracts'|'subs')} className={`orgd-tab${tab===t.key?' on':''}`}>
                {t.label}{t.count > 0 ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>

          {/* People tab */}
          {tab === 'people' && (
            <div className="oc-chart-wrap">
              {loadingP ? (
                <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>Loading…</div>
              ) : people.length === 0 ? (
                <div className="oc-empty">No profiles found for this company.</div>
              ) : isSbirOnly ? (
                /* SBIR contact list — simple card layout */
                <div style={{padding:'20px 28px',display:'flex',flexDirection:'column',gap:12}}>
                  {people.map((p: any) => (
                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:16,padding:'16px 20px',background:'var(--card)',border:'1px solid var(--card-border)',borderRadius:8}}>
                      <div style={{width:44,height:44,borderRadius:'50%',background:p.color??execColorFor(p.name),display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:15,flexShrink:0}}>
                        {execInitials(p.name)}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:14,color:'var(--ink)'}}>{p.name}</div>
                        <div style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)',marginTop:2}}>{p.title}</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:6}}>
                          {p.email && <a href={`mailto:${p.email}`} style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--teal)',textDecoration:'none'}}>{p.email}</a>}
                          {p.phone && <span style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)'}}>{p.phone}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <OrgTree
                  tier1={tier1}
                  tier2={tier2}
                  tier3={tier3}
                  onPerson={setPanelPerson}
                />
              )}
            </div>
          )}

          {tab === 'contracts' && (
            <div style={{flex:1,overflow:'auto'}}>
              {loadingC && <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>Loading…</div>}
              {!loadingC && contracts.length === 0 && <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>No contracts found.</div>}

              {/* SBIR awards view */}
              {!loadingC && isSbirOnly && contracts.map((c: any) => (
                <div key={c.id} style={{padding:'20px 28px',borderBottom:'1px solid var(--card-border)'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,marginBottom:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,color:'var(--ink)',marginBottom:4,lineHeight:1.3}}>{c.title}</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
                        <span style={{padding:'2px 8px',borderRadius:4,background:'rgba(201,138,43,.12)',border:'1px solid rgba(201,138,43,.3)',fontFamily:'IBM Plex Mono',fontSize:10,fontWeight:700,color:'#C98A2B'}}>{c.program} Phase {c.phase}</span>
                        {c.agency && <span style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)'}}>{c.agency}{c.branch ? ` · ${c.branch}` : ''}</span>}
                      </div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:'IBM Plex Mono',fontSize:16,fontWeight:700,color:'var(--teal)'}}>{fmtMoney(c.award_amount) ?? '—'}</div>
                      <div style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)',marginTop:2}}>{c.award_year}</div>
                    </div>
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'8px 24px',marginBottom:c.abstract?12:0}}>
                    {c.contract_number && <div><span style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'1px'}}>Contract #</span><div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink)',marginTop:2}}>{c.contract_number}</div></div>}
                    {c.solicitation_number && <div><span style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'1px'}}>Solicitation</span><div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink)',marginTop:2}}>{c.solicitation_number}{c.solicitation_topic_code ? ` · ${c.solicitation_topic_code}` : ''}</div></div>}
                    {c.award_start_date && <div><span style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'1px'}}>Period</span><div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink)',marginTop:2}}>{c.award_start_date?.slice(0,10)} → {c.award_end_date?.slice(0,10) ?? '—'}</div></div>}
                    {c.pi_name && <div><span style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'1px'}}>Principal Investigator</span><div style={{fontSize:12,color:'var(--ink)',marginTop:2}}>{c.pi_name}{c.pi_email ? <> · <a href={`mailto:${c.pi_email}`} style={{color:'var(--teal)',textDecoration:'none',fontFamily:'IBM Plex Mono',fontSize:11}}>{c.pi_email}</a></> : ''}</div></div>}
                    {c.agency_tracking_number && <div><span style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'1px'}}>Agency Tracking #</span><div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink)',marginTop:2}}>{c.agency_tracking_number}</div></div>}
                  </div>

                  {c.abstract && (
                    <div style={{marginTop:10,padding:'10px 14px',background:'var(--field)',borderRadius:6,fontSize:12,color:'var(--ink-2)',lineHeight:1.6,maxHeight:120,overflow:'hidden',position:'relative'}}>
                      {c.abstract}
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:32,background:'linear-gradient(transparent,var(--field))'}}/>
                    </div>
                  )}
                </div>
              ))}

              {/* Standard DoD contracts view */}
              {!loadingC && !isSbirOnly && contracts.length > 0 && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 90px 110px 160px 80px',padding:'8px 20px',background:'var(--card)',borderBottom:'1px solid var(--card-border)',position:'sticky',top:0,zIndex:1}}>
                  {['Contract','Type','Value','Awarding Org','Date'].map(h => (
                    <div key={h} style={{fontFamily:'IBM Plex Mono',fontSize:10,textTransform:'uppercase',letterSpacing:'1px',color:'var(--ink-3)'}}>{h}</div>
                  ))}
                </div>
                {contracts.map((c: any) => (
                  <div key={c.id} style={{display:'grid',gridTemplateColumns:'1fr 90px 110px 160px 80px',padding:'11px 20px',borderBottom:'1px solid rgba(0,0,0,.04)',alignItems:'center'}}>
                    <div style={{overflow:'hidden'}}>
                      <div style={{fontSize:13,fontWeight:500,color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</div>
                      {c.set_aside && <div style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)'}}>{c.set_aside}</div>}
                    </div>
                    <div>{c.signal_type && <span style={{padding:'2px 7px',borderRadius:4,border:`1px solid ${typeColor(c.signal_type)}`,background:`${typeColor(c.signal_type)}15`,fontFamily:'IBM Plex Mono',fontSize:10,color:typeColor(c.signal_type)}}>{c.signal_type}</span>}</div>
                    <div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--teal)',fontWeight:600}}>{fmtMoney(c.award_amt??c.value)??'—'}</div>
                    <div style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.org_name??c.org_id??'—'}</div>
                    <div style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)'}}>{fmtDate(c.award_date)??'—'}</div>
                  </div>
                ))}
              </>}
            </div>
          )}

          {/* Subcontractors tab */}
          {tab === 'subs' && (
            <div style={{flex:1,overflow:'auto'}}>
              {!company.legal_name && (
                <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>
                  No subcontractor data available — company not linked to a prime record.
                </div>
              )}
              {company.legal_name && (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 130px 70px',padding:'8px 20px',background:'var(--card)',borderBottom:'1px solid var(--card-border)',position:'sticky',top:0,zIndex:1}}>
                    {['Subcontractor','Total Value','Awards'].map(h => (
                      <div key={h} style={{fontFamily:'IBM Plex Mono',fontSize:10,textTransform:'uppercase',letterSpacing:'1px',color:'var(--ink-3)'}}>{h}</div>
                    ))}
                  </div>
                  {loadingS && <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>Loading subcontractors…</div>}
                  {!loadingS && subs.length === 0 && (
                    <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>No subcontractor data found.</div>
                  )}
                  {!loadingS && subs.map((s: any, i: number) => (
                    <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 130px 70px',padding:'10px 20px',borderBottom:'1px solid rgba(0,0,0,.04)',alignItems:'center'}}>
                      <div style={{fontSize:13,fontWeight:500,color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {s.sub_name.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </div>
                      <div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--teal)',fontWeight:600}}>
                        {s.total_amount ? fmtMoney(s.total_amount) : '—'}
                      </div>
                      <div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>{s.award_count ?? '—'}</div>
                    </div>
                  ))}
                  {!loadingS && subs.length > 0 && (
                    <div style={{padding:'10px 20px',fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--ink-3)'}}>
                      Source: USASpending.gov FSRS subaward data · Amounts are approximate
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Person slide-over — full wr-pf-* layout */}
      {panelPerson && (() => {
        const pColor  = execColorFor(panelPerson.name);
        const pFocus  = inferIndustryFocus(panelPerson.title);
        const pBio    = generateIndustryBio(panelPerson.name, panelPerson.title, displayName);
        const orgColor = colorFor(company.name);
        return (
          <div className="wr-pf-back" onClick={() => setPanelPerson(null)}>
            <div className="wr-pf" onClick={e => e.stopPropagation()}>
              {/* Dark header */}
              <div className="wr-pf-hd">
                <button className="wr-pf-x" onClick={() => setPanelPerson(null)}><IcX2 /></button>
                <div className="wr-pf-top">
                  <div className="wr-pf-av" style={{background: pColor}}>
                    {panelPerson.photo_url
                      ? <img src={panelPerson.photo_url} alt={panelPerson.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                      : execInitials(panelPerson.name)}
                  </div>
                  <div>
                    <div className="wr-pf-nm">
                      <span className="n">{panelPerson.name}</span>
                      <span className="wr-pf-unc">Unclaimed</span>
                    </div>
                    <div className="wr-pf-ti">{panelPerson.title ?? '—'}</div>
                    <div className="wr-pf-sub">
                      <span style={{display:'flex'}}><IcPin2 /></span>
                      {displayName}
                    </div>
                    <div className="wr-pf-act">
                      <button className="wr-pf-btn pri"><IcPlus2 /> Follow</button>
                      {panelPerson.linkedin && (
                        <a href={`https://linkedin.com/in/${panelPerson.linkedin}`} target="_blank" rel="noopener noreferrer" className="wr-pf-btn gho" style={{textDecoration:'none'}}>
                          <IcLI /> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim strip */}
              <div className="wr-pf-claim">
                <span className="i"><IcFlag2 /></span>
                <span className="t">This profile is unclaimed.</span>
                <span className="b"><IcTick2 /> Claim this profile</span>
              </div>

              <div className="wr-pf-body">
                <PfSec2 title="About">
                  <div className="wr-pf-about">{pBio}</div>
                </PfSec2>

                <PfSec2 title="Focus areas">
                  <div className="wr-pf-foc">
                    {pFocus.map(f => (
                      <span className="wr-fchip" key={f}>
                        <span className="dot" style={{background: FOCUS_COLORS2[f]}} />{f}
                      </span>
                    ))}
                    <span className="wr-fchip" style={{background:'rgba(47,134,118,.12)',color:'#2f8676'}}>Industry</span>
                  </div>
                </PfSec2>

                <PfSec2 title="Organization">
                  <div className="wr-pf-rep">
                    <div className="wr-pf-sup">
                      <div className="av" style={{background: orgColor}}>{ini}</div>
                      <div className="tx">
                        <div className="rl">Member of</div>
                        <div className="nn">{displayName}</div>
                        <div className="tt">Defense Prime Contractor</div>
                      </div>
                    </div>
                    <div className="wr-pf-repbar">
                      <span className="m">
                        {panelPerson.hierarchy_order === 1 ? 'C-Suite Leadership' : panelPerson.hierarchy_order === 2 ? 'Division President' : 'Senior Executive'}
                      </span>
                      <button onClick={() => { setPanelPerson(null); setTab('contracts'); }} className="lk" style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--accent)',fontFamily:'IBM Plex Mono'}}>
                        <IcOrg2 /> View contracts →
                      </button>
                    </div>
                  </div>
                  {/* Mini org chart using loaded exec list */}
                  {people.length > 0 && (() => {
                    const tier = panelPerson.hierarchy_order ?? 3;
                    const above = people.filter((x: any) => (x.hierarchy_order ?? 99) === tier - 1 && x.id !== panelPerson.id).slice(0, 3);
                    const below = people.filter((x: any) => (x.hierarchy_order ?? 99) === tier + 1 && x.id !== panelPerson.id).slice(0, 4);
                    return (
                      <div style={{marginTop:12}}>
                        <div className="pp-oc-vline" />
                        {above.length > 0 && (
                          <>
                            <div className="pp-oc-row">
                              {above.map((c: any) => (
                                <div key={c.id} className="pp-oc-card" style={{opacity:.65}}>
                                  <div className="pp-oc-av" style={{background:execColorFor(c.name)}}>{execInitials(c.name)}</div>
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
                            <div className="pp-oc-av" style={{background:pColor}}>{execInitials(panelPerson.name)}</div>
                            <div className="pp-oc-name">{panelPerson.name}</div>
                            <div className="pp-oc-role">{panelPerson.title}</div>
                          </div>
                        </div>
                        {below.length > 0 && (
                          <>
                            <div className="pp-oc-vline" />
                            <div className="pp-oc-row">
                              {below.map((c: any) => (
                                <div key={c.id} className="pp-oc-card" style={{opacity:.65}}>
                                  <div className="pp-oc-av" style={{background:execColorFor(c.name)}}>{execInitials(c.name)}</div>
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
                    );
                  })()}
                </PfSec2>

                <PfSec2 title="Contracts &amp; Opportunities">
                  <div className="wr-pf-sam-stats">
                    <div className="wr-pf-sam-cell">
                      <div className="k">Total Contracts</div>
                      <div className="v">{Number(company.contract_count).toLocaleString()}</div>
                    </div>
                    <div className="wr-pf-sam-cell">
                      <div className="k">Total Awarded</div>
                      <div className="v">{fmtMoney(company.total_value) ?? '—'}</div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:'var(--ink-3)',padding:'6px 0',fontFamily:'IBM Plex Mono'}}>
                    Contract data reflects company-level awards. View Contracts tab for full details.
                  </div>
                </PfSec2>

                {panelPerson.linkedin && (
                  <PfSec2 title="LinkedIn">
                    <a href={`https://linkedin.com/in/${panelPerson.linkedin}`} target="_blank" rel="noopener noreferrer" className="wr-pf-btn gho" style={{textDecoration:'none',display:'inline-flex',marginTop:2}}>
                      <IcLI /> linkedin.com/in/{panelPerson.linkedin}
                    </a>
                  </PfSec2>
                )}

                <PfSec2 title="Position">
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <span className="pp-tag">
                      {panelPerson.hierarchy_order === 1 ? 'C-Suite / Principal' : panelPerson.hierarchy_order === 2 ? 'Division President' : 'Senior Executive'}
                    </span>
                    <span className="pp-tag">INDUSTRY</span>
                  </div>
                </PfSec2>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

interface Org {
  id: string; name: string;
  organization_type: string | null;
  hq_address: string | null;
  branch: string | null;
  sub: string | null;
  abs_hierarchy_level: number | null;
  hierarchy_level: number | null;
  parent_id: string | null;
  contact_count: number;
  contract_count: number;
  top_leader_name: string | null;
  top_leader_title: string | null;
}

const SUB_DISPLAY: Record<string, string> = {
  'Office of the Secretary of Defense': 'Office of the Secretary of Defense',
  'Military Departments': 'Military Departments',
  'Combatant Commands': 'Combatant Commands',
  'Defense Agencies & DoD Field Activities': 'Defense Agencies & Field Activities',
};

function sectionFor(org: Org): string {
  if (org.sub && SUB_DISPLAY[org.sub]) return SUB_DISPLAY[org.sub];
  const lvl = org.abs_hierarchy_level;
  if (lvl == null || lvl >= 4) return 'Field Activities';
  if (lvl === 0) return 'DoD Leadership';
  if (lvl === 1) return 'Major Commands & Senior Offices';
  if (lvl === 2) return 'Sub-commands & Directorates';
  return 'Units & Squadrons';
}

const SECTION_ORDER = [
  'DoD Leadership',
  'Office of the Secretary of Defense',
  'Military Departments',
  'Combatant Commands',
  'Defense Agencies & Field Activities',
  'Major Commands & Senior Offices',
  'Sub-commands & Directorates',
  'Units & Squadrons',
  'Field Activities',
];

/* ── Icons ───────────────────────────────────────────────────────────── */
const ChevDown  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>;
const ChevRight = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m9 6 6 6-6 6"/></svg>;
const SearchIc  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
const SortIc    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h12M3 12h9M3 18h6M17 5v14m0 0 3-3m-3 3-3-3"/></svg>;
const GovIc     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V10m14 11V10M3 10l9-6 9 6M9 21v-6h6v6"/></svg>;
const IndIc     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V8l5 3V8l5 3V5l4 2v14"/></svg>;
const GridIc    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;

/* ── Directory ───────────────────────────────────────────────────────── */
function Directory({ groups, activeSection }: { groups: { label: string; rows: Org[] }[]; activeSection: string | null }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [pageMap,   setPageMap]   = useState<Record<string, number>>({});
  const router = useRouter();

  const toggle = (label: string) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(label) ? n.delete(label) : n.add(label); return n; });

  const getPage      = (l: string) => pageMap[l] ?? 1;
  const setGroupPage = (l: string, p: number) => setPageMap(prev => ({ ...prev, [l]: p }));

  const visible = activeSection ? groups.filter(g => g.label === activeSection) : groups;

  return (
    <div className="wr-hmain">
      <div className="wr-dhead">
        <div>Organization</div><div>Type</div><div>Top leader</div>
        <div className="r">Contacts</div><div className="r">Contracts</div>
        <div className="r">Level</div><div />
      </div>
      <div className="wr-dscroll">
        {visible.length === 0 && (
          <div style={{ padding:'40px 26px', color:'var(--ink-3)', fontFamily:'IBM Plex Mono', fontSize:11 }}>No organizations found.</div>
        )}
        {visible.map(g => {
          const isOpen    = !collapsed.has(g.label);
          const gPage     = getPage(g.label);
          const pagedRows = g.rows.slice((gPage-1)*ORGS_PER_PAGE, gPage*ORGS_PER_PAGE);
          // Build major sub-groups for sections that have them
          const majorGroups: { major: string | null; rows: Org[] }[] = [];
          for (const org of pagedRows) {
            const maj = (org as any).major ?? null;
            const last = majorGroups[majorGroups.length - 1];
            if (!last || last.major !== maj) majorGroups.push({ major: maj, rows: [org] });
            else last.rows.push(org);
          }
          const hasMajors = majorGroups.some(mg => mg.major != null);
          const renderOrgRow = (org: Org) => {
            const color       = colorFor(org.name);
            const ini         = initials(org.name);
            const leaderColor = org.top_leader_name ? colorFor(org.top_leader_name) : '#8995A4';
            const leaderIni   = org.top_leader_name ? initials(org.top_leader_name) : '—';
            return (
              <div key={org.id} className="wr-drow" onClick={() => router.push(`/org/${org.id}`)}>
                <div className="wr-org">
                  <div className="mk" style={{ background: color }}>{ini}</div>
                  <div className="tx">
                    <div className="on" title={org.name}>{org.name}</div>
                    <div className="os">{org.hq_address ?? org.branch ?? '—'}</div>
                  </div>
                </div>
                <div><span className="wr-chip">{org.organization_type ?? org.branch ?? 'Org'}</span></div>
                <div className="wr-lead">
                  {org.top_leader_name
                    ? <><div className="av" style={{ background: leaderColor }}>{leaderIni}</div><div className="ln" title={org.top_leader_name}>{org.top_leader_name}</div></>
                    : <div className="ln" style={{ color:'var(--ink-3)' }}>—</div>}
                </div>
                <div className={'wr-num'+(org.contact_count?'':' z')}>{org.contact_count||'—'}</div>
                <div className={'wr-num'+(org.contract_count?'':' z')}>{org.contract_count||'—'}</div>
                <div className="wr-upd">{org.abs_hierarchy_level!=null?`L${org.abs_hierarchy_level}`:'—'}</div>
                <div className="wr-go"><ChevRight /></div>
              </div>
            );
          };
          return (
            <div key={g.label}>
              <div className={'wr-dgroup'+(isOpen?'':' closed')} onClick={() => toggle(g.label)}>
                <span className="chev"><ChevDown /></span>
                <span className="gl">{g.label}</span>
                <span className="gc">{g.rows.length}</span>
                <span className="gline" />
              </div>
              {isOpen && (hasMajors ? majorGroups.map(mg => (
                <div key={mg.major ?? '__none__'}>
                  {mg.major && <div style={{ padding:'4px 26px 2px', fontFamily:'IBM Plex Mono', fontSize:10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid var(--card-border)' }}>{mg.major}</div>}
                  {mg.rows.map(renderOrgRow)}
                </div>
              )) : pagedRows.map(renderOrgRow))}
              {isOpen && (
                <Pagination total={g.rows.length} page={gPage} perPage={ORGS_PER_PAGE} onChange={p => setGroupPage(g.label, p)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Industry list (table view) ──────────────────────────────────────── */
function IndustryList({
  companies, search, valueTier, agency, sbirOnly, sbirPhase, desig, page, onPageChange, onSelectCompany,
}: {
  companies: any[]; search: string; valueTier: string | null;
  agency: string | null; sbirOnly: boolean; sbirPhase: string | null; desig: string | null;
  page: number; onPageChange(p: number): void; onSelectCompany(c: any): void;
}) {
  const [sortCol, setSortCol] = useState<'name'|'contracts'|'value'>('value');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const sortBy = (col: 'name'|'contracts'|'value') => {
    if (sortCol === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortCol(col); setSortDir(col === 'name' ? 'asc' : 'desc'); }
    onPageChange(1);
  };

  const SortArrow = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span style={{ opacity:0.25, fontSize:9 }}>↕</span>;
    return <span style={{ fontSize:9 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const filtered = useMemo(() => {
    let list = companies;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name?.toLowerCase().includes(q));
    }
    if (valueTier) {
      const tier = VALUE_TIERS.find(t => t.label === valueTier);
      if (tier) list = list.filter(c => Number(c.total_value) >= tier.min && Number(c.total_value) < tier.max);
    }
    if (agency) {
      list = list.filter(c => (c.agencies ?? []).some((a: string) => a === agency));
    }
    if (sbirOnly) {
      list = list.filter(c => c.sbir_phase != null);
    }
    if (sbirPhase) {
      list = list.filter(c => c.sbir_phase === sbirPhase);
    }
    if (desig) {
      list = list.filter(c => (c.sbir_designations ?? []).includes(desig));
    }
    return list;
  }, [companies, search, valueTier, agency, sbirOnly, sbirPhase, desig]);

  const sorted = useMemo(() => {
    const s = [...filtered];
    s.sort((a, b) => {
      let av: any, bv: any;
      if (sortCol === 'name') { av = (a.display_name ?? a.name ?? '').toLowerCase(); bv = (b.display_name ?? b.name ?? '').toLowerCase(); }
      else if (sortCol === 'contracts') { av = Number(a.contract_count) || 0; bv = Number(b.contract_count) || 0; }
      else { av = Number(a.total_value) || 0; bv = Number(b.total_value) || 0; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return s;
  }, [filtered, sortCol, sortDir]);

  const paged = sorted.slice((page-1)*IND_PER_PAGE, page*IND_PER_PAGE);

  return (
    <div className="wr-hmain" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Sub-header */}
      <div style={{ padding:'10px 20px', borderBottom:'1px solid var(--card-border)', background:'var(--card)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ fontFamily:'IBM Plex Mono', fontSize:11, color:'var(--ink-3)' }}>
          {filtered.length.toLocaleString()} companies · DoD prime contractors
        </div>

        <div style={{ marginLeft:'auto', fontFamily:'IBM Plex Mono', fontSize:10, color:'var(--ink-3)', letterSpacing:'1px' }}>
          SOURCE: USASPENDING.GOV · SAM.GOV
        </div>
      </div>

      {/* Column headers */}
      <div className="wr-dhead" style={{ gridTemplateColumns:'1fr 80px 80px 130px 260px' }}>
        <div onClick={() => sortBy('name')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>Company <SortArrow col="name" /></div>
        <div>Role</div>
        <div className="r" onClick={() => sortBy('contracts')} style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}><SortArrow col="contracts" /> Contracts</div>
        <div className="r" onClick={() => sortBy('value')} style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}><SortArrow col="value" /> Total Awarded</div>
        <div>Awarding Agencies</div>
      </div>

      {/* Rows */}
      <div className="wr-dscroll">
        {paged.length === 0 && (
          <div style={{ padding:'40px 26px', color:'var(--ink-3)', fontFamily:'IBM Plex Mono', fontSize:11 }}>No companies match.</div>
        )}
        {paged.map((c: any) => (
          <div
            key={c.name}
            className="wr-drow"
            style={{ gridTemplateColumns:'1fr 80px 80px 130px 260px' }}
            onClick={() => onSelectCompany(c)}
          >
            <div className="wr-org">
              {c.logo_url
                ? <img src={c.logo_url} alt="" style={{ width:32, height:32, borderRadius:4, objectFit:'contain', background:'#fff', border:'1px solid var(--card-border)', flexShrink:0 }} />
                : <div className="mk" style={{ background: colorFor(c.name) }}>{initials(c.name)}</div>
              }
              <div className="tx">
                <div className="on" style={{ cursor:'pointer', color:'var(--ink)' }} title={c.name}>{c.display_name ?? c.name}</div>
                <div className="os" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                  {c.headquarters && <span>{c.headquarters}</span>}
                  {c.ticker && <span style={{fontWeight:600,color:'var(--ink-2)'}}>{c.ticker}</span>}
                  {c.employees && <span>{Number(c.employees).toLocaleString()} employees</span>}
                </div>
                <SbirBadges company={c} compact />
              </div>
            </div>
            <div>
              <span style={{ padding:'2px 7px', borderRadius:4, border:'1px solid #283a6b', background:'rgba(40,58,107,.07)', fontFamily:'IBM Plex Mono', fontSize:10, color:'#283a6b', fontWeight:600 }}>
                PRIME
              </span>
            </div>
            <div className="wr-num">{Number(c.contract_count).toLocaleString()}</div>
            <div className="wr-num" style={{ color:'var(--teal)', fontWeight:600 }}>
              {fmtMoney(c.total_value) ?? '—'}
            </div>
            <div style={{ fontFamily:'IBM Plex Mono', fontSize:11, color:'var(--ink-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', alignSelf:'center' }}>
              {(c.agencies?.slice(0,3)??[]).filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
        ))}
        <Pagination total={sorted.length} page={page} perPage={IND_PER_PAGE} onChange={onPageChange} />
      </div>
    </div>
  );
}

/* ── SubList ─────────────────────────────────────────────────────────── */
const SUB_PER_PAGE = 50;

function SubList({ subs, search, page, onPageChange, onSelectSub, loaded }: {
  subs: any[]; search: string; page: number; loaded: boolean;
  onPageChange(p: number): void; onSelectSub(s: any): void;
}) {
  const [sortCol, setSortCol] = useState<'name'|'value'|'awards'>('value');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const sortBy = (col: 'name'|'value'|'awards') => {
    if (sortCol === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortCol(col); setSortDir(col === 'name' ? 'asc' : 'desc'); }
    onPageChange(1);
  };

  const SortArrow = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span style={{ opacity:0.25, fontSize:9 }}>↕</span>;
    return <span style={{ fontSize:9 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return subs;
    const q = search.toLowerCase();
    return subs.filter(s => s.name?.toLowerCase().includes(q) || (s.display_name ?? '').toLowerCase().includes(q));
  }, [subs, search]);

  const sorted = useMemo(() => {
    const s = [...filtered];
    s.sort((a, b) => {
      let av: any, bv: any;
      if (sortCol === 'name') { av = (a.display_name ?? a.name ?? '').toLowerCase(); bv = (b.display_name ?? b.name ?? '').toLowerCase(); }
      else if (sortCol === 'awards') { av = Number(a.award_count) || 0; bv = Number(b.award_count) || 0; }
      else { av = Number(a.total_value) || 0; bv = Number(b.total_value) || 0; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return s;
  }, [filtered, sortCol, sortDir]);

  const paged = sorted.slice((page-1)*SUB_PER_PAGE, page*SUB_PER_PAGE);

  return (
    <div className="wr-hmain" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'10px 20px', borderBottom:'1px solid var(--card-border)', background:'var(--card)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ fontFamily:'IBM Plex Mono', fontSize:11, color:'var(--ink-3)' }}>
          {!loaded ? 'Loading…' : `${filtered.length.toLocaleString()} subcontractors · from USASpending FSRS data`}
        </div>
        <div style={{ marginLeft:'auto', fontFamily:'IBM Plex Mono', fontSize:10, color:'var(--ink-3)', letterSpacing:'1px' }}>
          SOURCE: USASPENDING.GOV
        </div>
      </div>
      <div className="wr-dhead" style={{ gridTemplateColumns:'1fr 70px 130px 80px' }}>
        <div onClick={() => sortBy('name')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>Subcontractor <SortArrow col="name" /></div>
        <div>Primes</div>
        <div className="r" onClick={() => sortBy('value')} style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}><SortArrow col="value" /> Total Value</div>
        <div className="r" onClick={() => sortBy('awards')} style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}><SortArrow col="awards" /> Awards</div>
      </div>
      <div className="wr-dscroll">
        {!loaded && <div style={{ padding:'40px 26px', color:'var(--ink-3)', fontFamily:'IBM Plex Mono', fontSize:11 }}>Loading subcontractors…</div>}
        {loaded && paged.length === 0 && <div style={{ padding:'40px 26px', color:'var(--ink-3)', fontFamily:'IBM Plex Mono', fontSize:11 }}>No subcontractors match.</div>}
        {paged.map((s: any) => {
          const displayName = (s.display_name ?? s.name)
            .toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
            .replace(/\bLlc\b/g,'LLC').replace(/\bInc\b/g,'Inc.').replace(/\bCorp\b/g,'Corp.');
          const color = colorFor(s.name);
          const ini   = initials(displayName);
          return (
            <div key={s.name} className="wr-drow" onClick={() => onSelectSub(s)} style={{ gridTemplateColumns:'1fr 70px 130px 80px' }}>
              <div className="wr-org">
                {s.logo_url
                  ? <img src={s.logo_url} alt="" style={{ width:32, height:32, borderRadius:4, objectFit:'contain', background:'#fff', border:'1px solid var(--card-border)', flexShrink:0 }} />
                  : <div className="mk" style={{ background: color }}>{ini}</div>
                }
                <div className="tx">
                  <div className="on">{displayName}</div>
                  {s.headquarters && <div className="os">{s.headquarters}</div>}
                </div>
              </div>
              <div style={{ fontFamily:'IBM Plex Mono', fontSize:12, color:'var(--ink-3)' }}>{s.prime_count ?? '—'}</div>
              <div style={{ fontFamily:'IBM Plex Mono', fontSize:12, color:'var(--teal)', fontWeight:600, textAlign:'right' }}>{fmtMoney(s.total_value) ?? '—'}</div>
              <div style={{ fontFamily:'IBM Plex Mono', fontSize:12, color:'var(--ink-3)', textAlign:'right' }}>{s.award_count?.toLocaleString() ?? '—'}</div>
            </div>
          );
        })}
      </div>
      <Pagination total={sorted.length} page={page} perPage={SUB_PER_PAGE} onChange={onPageChange} />
    </div>
  );
}

/* ── SubDetail ───────────────────────────────────────────────────────── */
function SubDetail({ sub, onBack }: { sub: any; onBack(): void }) {
  const [primeRels, setPrimeRels] = useState<any[]>([]);
  const [loadingP, setLoadingP]   = useState(false);

  const displayName = (sub.display_name ?? sub.name)
    .toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
    .replace(/\bLlc\b/g,'LLC').replace(/\bInc\b/g,'Inc.').replace(/\bCorp\b/g,'Corp.');
  const color = colorFor(sub.name);
  const ini   = initials(displayName);

  useEffect(() => {
    setLoadingP(true);
    fetch(`/api/industry/subawards?sub=${encodeURIComponent(sub.name)}`)
      .then(r => r.json())
      .then(d => { setPrimeRels(Array.isArray(d) ? d : []); setLoadingP(false); });
  }, [sub.name]);

  return (
    <div className="org-detail">
      <div className="orgd-sub">
        <button onClick={onBack} className="orgd-back" style={{background:'none',border:'none',cursor:'pointer',padding:0}}>←</button>
        <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
        <button onClick={onBack} className="orgd-sname" style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--ink-2)'}}>Subcontractors</button>
        <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
        <span className="orgd-sname" style={{color:'var(--ink)',fontWeight:600}}>{displayName}</span>
      </div>
      <div className="org-detail-body">
        {/* Hero */}
        <div className="orgd-hero-top">
          {sub.logo_url
            ? <img src={sub.logo_url} alt="" style={{ width:56, height:56, borderRadius:8, objectFit:'contain', background:'#fff', border:'1px solid var(--card-border)', flexShrink:0 }} />
            : <div className="orgd-orgmark" style={{background:color}}>{ini}</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div className="orgd-type">SUBCONTRACTOR</div>
            <div className="orgd-title">{displayName}</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
              <span style={{padding:'2px 8px',borderRadius:4,border:'1px solid #1d6b8a',background:'rgba(29,107,138,.07)',fontFamily:'IBM Plex Mono',fontSize:10,color:'#1d6b8a',fontWeight:600}}>SUB</span>
              {sub.headquarters && <span style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)'}}>{sub.headquarters}</span>}
              {sub.website && <a href={sub.website} target="_blank" rel="noreferrer" style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--accent)'}}>↗ Website</a>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="orgd-metas">
          <div className="orgd-meta">
            <div className="mlbl">Total Subawards</div>
            <div className="mval" style={{color:'var(--teal)'}}>{fmtMoney(sub.total_value) ?? '—'}</div>
          </div>
          <div className="orgd-meta">
            <div className="mlbl">Prime Contractors</div>
            <div className="mval">{sub.prime_count ?? '—'}</div>
          </div>
          <div className="orgd-meta">
            <div className="mlbl">Award Count</div>
            <div className="mval">{sub.award_count?.toLocaleString() ?? '—'}</div>
          </div>
        </div>

        {sub.description && (
          <div style={{padding:'12px 24px',borderBottom:'1px solid var(--card-border)',fontSize:13,color:'var(--ink-2)',lineHeight:1.6}}>
            {sub.description}
          </div>
        )}

        {/* Prime relationships */}
        <div style={{padding:'12px 24px 4px',fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'1px'}}>
          Prime Contractor Relationships
        </div>
        {loadingP ? (
          <div style={{padding:'20px 24px',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>Loading…</div>
        ) : primeRels.length === 0 ? (
          <div style={{padding:'20px 24px',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>No relationship data found.</div>
        ) : (
          <div style={{flex:1,overflow:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 130px 70px',padding:'8px 24px',background:'var(--card)',borderBottom:'1px solid var(--card-border)'}}>
              {['Prime Contractor','Sub Value','Awards'].map(h => (
                <div key={h} style={{fontFamily:'IBM Plex Mono',fontSize:10,textTransform:'uppercase',letterSpacing:'1px',color:'var(--ink-3)'}}>{h}</div>
              ))}
            </div>
            {primeRels.map((r: any, i: number) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 130px 70px',padding:'10px 24px',borderBottom:'1px solid rgba(0,0,0,.04)',alignItems:'center'}}>
                <div style={{fontSize:13,fontWeight:500,color:'var(--ink)'}}>
                  {r.prime_legal_name.toLowerCase().replace(/\b\w/g,(c:string)=>c.toUpperCase()).replace(/\bLlc\b/g,'LLC').replace(/\bInc\b/g,'Inc.').replace(/\bCorp\b/g,'Corp.')}
                </div>
                <div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--teal)',fontWeight:600}}>{r.total_amount ? fmtMoney(r.total_amount) : '—'}</div>
                <div style={{fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>{r.award_count ?? '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function DiscoverClient({ orgs }: { orgs: Org[] }) {
  const [seg, setSeg]                 = useState<'gov'|'ind'>('gov');
  const [search, setSearch]           = useState('');
  const [activeSection, setActiveSection] = useState<string|null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* Industry state */
  const [companies,     setCompanies]     = useState<any[]>([]);
  const [indLoaded,     setIndLoaded]     = useState(false);
  const [indSearch,     setIndSearch]     = useState('');
  const [indValueTier,  setIndValueTier]  = useState<string|null>(null);
  const [indPage,       setIndPage]       = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<any|null>(null);
  const [indAgency,     setIndAgency]     = useState<string|null>(null);
  const [indSbirOnly,   setIndSbirOnly]   = useState(false);
  const [indSbirPhase,  setIndSbirPhase]  = useState<string|null>(null);
  const [indDesig,      setIndDesig]      = useState<string|null>(null);
  const [openSections,  setOpenSections]  = useState<Set<string>>(new Set(['value','agency']));
  const toggleSection = (s: string) => setOpenSections(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const [showAllAgencies, setShowAllAgencies] = useState(false);

  /* Subcontractor state */
  const [indRole,        setIndRole]        = useState<'primes'|'subs'>('primes');
  const [subs,           setSubs]           = useState<any[]>([]);
  const [subsLoaded,     setSubsLoaded]     = useState(false);
  const [selectedSub,    setSelectedSub]    = useState<any|null>(null);

  /* Load companies lazily when INDUSTRY tab is first clicked */
  useEffect(() => {
    if (seg === 'ind' && !indLoaded) {
      fetch('/api/industry').then(r => r.json()).then(data => {
        setCompanies(Array.isArray(data) ? data : []);
        setIndLoaded(true);
      });
    }
  }, [seg, indLoaded]);

  /* Load subs lazily when subs role is first selected */
  useEffect(() => {
    if (indRole === 'subs' && !subsLoaded) {
      fetch('/api/industry/subs').then(r => r.json()).then(data => {
        setSubs(Array.isArray(data) ? data : []);
        setSubsLoaded(true);
      });
    }
  }, [indRole, subsLoaded]);

  /* Reset page when industry filters change */
  useEffect(() => { setIndPage(1); setSelectedCompany(null); setSelectedSub(null); }, [indSearch, indValueTier, indRole, indAgency, indSbirOnly, indSbirPhase, indDesig]);

  /* Gov org data */
  const filtered = useMemo(() => {
    if (!search.trim()) return orgs;
    const q = search.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(q) || (o.branch??'').toLowerCase().includes(q));
  }, [orgs, search]);

  const groups = useMemo(() => {
    const map = new Map<string, Org[]>();
    for (const o of filtered) {
      const sec = sectionFor(o);
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(o);
    }
    return SECTION_ORDER.filter(s => map.has(s)).map(s => ({ label: s, rows: map.get(s)! }));
  }, [filtered]);

  const indexItems = useMemo(() => [
    { label: 'All organizations', count: filtered.length, all: true },
    ...groups.map(g => ({ label: g.label, count: g.rows.length, all: false })),
  ], [filtered, groups]);

  /* Industry sidebar counts */
  const tierCounts = useMemo(() =>
    VALUE_TIERS.map(t => ({
      ...t,
      count: companies.filter(c => Number(c.total_value) >= t.min && Number(c.total_value) < t.max).length,
    })),
    [companies]
  );

  const TOP_AGENCIES = ['Department of the Army','Department of the Navy','Department of the Air Force','Defense Contract Management Agency','Defense Logistics Agency','Missile Defense Agency','Defense Health Agency','Defense Advanced Research Projects Agency','U.S. Special Operations Command'];
  const agencyCounts = useMemo(() =>
    TOP_AGENCIES.map(ag => ({
      label: ag,
      short: ag.replace('Department of the ','').replace('Defense ',''),
      count: companies.filter(c => (c.agencies ?? []).includes(ag)).length,
    })).filter(a => a.count > 0),
    [companies]
  );

  const sbirCount      = useMemo(() => companies.filter(c => c.sbir_phase != null).length, [companies]);
  const sbirPhaseCounts = useMemo(() => [
    { label: 'Phase I',   key: 'I',   count: companies.filter(c => c.sbir_phase === 'I').length },
    { label: 'Phase II',  key: 'II',  count: companies.filter(c => c.sbir_phase === 'II').length },
    { label: 'Phase III', key: 'III', count: companies.filter(c => c.sbir_phase === 'III').length },
  ].filter(p => p.count > 0), [companies]);

  const desigCounts = useMemo(() => [
    { label: 'WOSB',    key: 'WOSB',    count: companies.filter(c => (c.sbir_designations ?? []).includes('WOSB')).length },
    { label: 'SDB',     key: 'SDB',     count: companies.filter(c => (c.sbir_designations ?? []).includes('SDB')).length },
    { label: 'HUBZone', key: 'HUBZone', count: companies.filter(c => (c.sbir_designations ?? []).includes('HUBZone')).length },
  ].filter(d => d.count > 0), [companies]);

  function switchSeg(s: 'gov'|'ind') {
    setSeg(s);
    setSearch('');
    setActiveSection(null);
    setIndSearch('');
    setIndValueTier(null);
    setSelectedCompany(null);
  }

  return (
    <div className="wr-page-root">

      {/* ── Page header ── */}
      <div className="wr-hhead">
        <div>
          <h1>Organizations</h1>
          <div className="wr-hmeta">
            {seg === 'gov'
              ? `${orgs.length} organizations · Government`
              : `${companies.length} companies · Industry`}
          </div>
        </div>

        <div style={{ marginLeft:'auto' }} />

        <button
          className={`wr-filter-toggle${mobileSidebarOpen ? ' active' : ''}`}
          onClick={() => setMobileSidebarOpen(o => !o)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="1" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="5" y1="10.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Browse
        </button>

        <div className="wr-seg">
          <button className={'wr-seg-btn'+(seg==='gov'?' on':'')} onClick={() => switchSeg('gov')}>
            <span className="ic"><GovIc /></span>GOVERNMENT
          </button>
          <button className={'wr-seg-btn'+(seg==='ind'?' on':'')} onClick={() => switchSeg('ind')}>
            <span className="ic"><IndIc /></span>INDUSTRY
          </button>
        </div>

        <div className="wr-hsearch">
          <SearchIc />
          <input
            placeholder={seg==='gov' ? 'Filter organizations…' : 'Filter companies…'}
            value={seg==='gov' ? search : indSearch}
            onChange={e => seg==='gov' ? setSearch(e.target.value) : setIndSearch(e.target.value)}
          />
        </div>

      </div>

      {/* ── 2-column body (no right rail) ── */}
      <div className="wr-hbody">

        {/* ── Left index ── */}
        <aside className={`wr-hindex${mobileSidebarOpen ? ' mobile-open' : ''}`}>

          {/* GOV sidebar */}
          {seg === 'gov' && <>
            <div className="wr-hidx-lab">Departments</div>
            {indexItems.map((item, i) => (
              <div key={item.label}>
                <div
                  className={'wr-idx'+((item.all && activeSection===null)||(!item.all && activeSection===item.label)?' on':'')}
                  onClick={() => setActiveSection(item.all ? null : item.label)}
                >
                  <span className="ico">
                    {item.all
                      ? <GridIc />
                      : <span style={{ width:8, height:8, borderRadius:2, background:'var(--ink-3)', display:'block' }} />}
                  </span>
                  <span>{item.label}</span>
                  <span className="c">{item.count}</span>
                </div>
                {i === 0 && <div className="wr-idx-div" />}
              </div>
            ))}
          </>}

          {/* INDUSTRY sidebar */}
          {seg === 'ind' && <>
            {/* Primes / Subs toggle */}
            <div style={{ display:'flex', gap:4, margin:'0 0 12px 0' }}>
              <button
                onClick={() => { setIndRole('primes'); setSelectedSub(null); }}
                style={{ flex:1, padding:'5px 0', fontFamily:'IBM Plex Mono', fontSize:11, fontWeight:600, letterSpacing:'0.5px', border:'1px solid var(--card-border)', borderRadius:6, cursor:'pointer', background: indRole==='primes' ? 'var(--navy)' : 'transparent', color: indRole==='primes' ? '#fff' : 'var(--ink-3)' }}
              >Primes</button>
              <button
                onClick={() => { setIndRole('subs'); setSelectedCompany(null); }}
                style={{ flex:1, padding:'5px 0', fontFamily:'IBM Plex Mono', fontSize:11, fontWeight:600, letterSpacing:'0.5px', border:'1px solid var(--card-border)', borderRadius:6, cursor:'pointer', background: indRole==='subs' ? 'var(--navy)' : 'transparent', color: indRole==='subs' ? '#fff' : 'var(--ink-3)' }}
              >Subs</button>
            </div>

            {indRole === 'primes' && <>
              <div
                className={'wr-idx'+(indValueTier===null && !indAgency && !indSbirOnly && !indDesig ?' on':'')}
                onClick={() => { setIndValueTier(null); setIndAgency(null); setIndSbirOnly(false); setIndSbirPhase(null); setIndDesig(null); setSelectedCompany(null); }}
              >
                <span className="ico"><GridIc /></span>
                <span>All primes</span>
                <span className="c">{companies.length}</span>
              </div>
              <div className="wr-idx-div" style={{ margin:'8px 10px' }} />

              {/* Contract Value */}
              <button className="wr-filter-sec" onClick={() => toggleSection('value')}>
                <span>By Contract Value</span>
                <span style={{ transform: openSections.has('value') ? 'rotate(180deg)' : 'none', transition:'transform .2s', display:'inline-block', fontSize:9 }}>▼</span>
              </button>
              {openSections.has('value') && tierCounts.map(t => (
                <div
                  key={t.label}
                  className={'wr-idx'+(indValueTier===t.label?' on':'')}
                  onClick={() => { setIndValueTier(indValueTier===t.label ? null : t.label); setSelectedCompany(null); }}
                >
                  <span className="ico"><span style={{ width:8, height:8, borderRadius:2, background:'var(--teal)', display:'block', opacity: t.count > 0 ? 1 : 0.3 }} /></span>
                  <span>{t.label}</span>
                  <span className="c">{t.count}</span>
                </div>
              ))}

              {/* Agency */}
              <div className="wr-idx-div" style={{ margin:'8px 10px' }} />
              <button className="wr-filter-sec" onClick={() => toggleSection('agency')}>
                <span>By Agency{indAgency ? ' ·' : ''}</span>
                <span style={{ transform: openSections.has('agency') ? 'rotate(180deg)' : 'none', transition:'transform .2s', display:'inline-block', fontSize:9 }}>▼</span>
              </button>
              {openSections.has('agency') && <>
                <div
                  className={'wr-idx'+(indAgency===null?' on':'')}
                  onClick={() => { setIndAgency(null); setSelectedCompany(null); }}
                >
                  <span className="ico"><span style={{ width:8, height:8, borderRadius:'50%', background:'var(--navy)', display:'block' }} /></span>
                  <span>All agencies</span>
                  <span className="c">{companies.length}</span>
                </div>
                {(showAllAgencies ? agencyCounts : agencyCounts.slice(0, 5)).map(a => (
                  <div
                    key={a.label}
                    className={'wr-idx'+(indAgency===a.label?' on':'')}
                    onClick={() => { setIndAgency(indAgency===a.label ? null : a.label); setSelectedCompany(null); }}
                    title={a.label}
                  >
                    <span className="ico"><span style={{ width:8, height:8, borderRadius:'50%', background:'var(--navy)', display:'block', opacity:0.5 }} /></span>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.short}</span>
                    <span className="c">{a.count}</span>
                  </div>
                ))}
                {agencyCounts.length > 5 && (
                  <button onClick={() => setShowAllAgencies(v=>!v)} style={{ background:'none',border:'none',cursor:'pointer',padding:'4px 0 2px 28px',fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--accent)',textAlign:'left',width:'100%' }}>
                    {showAllAgencies ? '↑ Less' : `+ ${agencyCounts.length - 5} more`}
                  </button>
                )}
              </>}

              {/* SBIR */}
              {sbirCount > 0 && <>
                <div className="wr-idx-div" style={{ margin:'8px 10px' }} />
                <button className="wr-filter-sec" onClick={() => toggleSection('sbir')}>
                  <span>SBIR / STTR</span>
                  <span style={{ transform: openSections.has('sbir') ? 'rotate(180deg)' : 'none', transition:'transform .2s', display:'inline-block', fontSize:9 }}>▼</span>
                </button>
                {openSections.has('sbir') && <>
                  <div
                    className={'wr-idx'+(indSbirOnly && !indSbirPhase?' on':'')}
                    onClick={() => { setIndSbirOnly(!indSbirOnly); setIndSbirPhase(null); setSelectedCompany(null); }}
                  >
                    <span className="ico"><span style={{ width:8, height:8, borderRadius:2, background:'#C98A2B', display:'block' }} /></span>
                    <span>All SBIR</span>
                    <span className="c">{sbirCount}</span>
                  </div>
                  {sbirPhaseCounts.map(p => (
                    <div
                      key={p.key}
                      className={'wr-idx'+(indSbirPhase===p.key?' on':'')}
                      onClick={() => { setIndSbirPhase(indSbirPhase===p.key ? null : p.key); setIndSbirOnly(true); setSelectedCompany(null); }}
                    >
                      <span className="ico"><span style={{ width:8, height:8, borderRadius:2, background:'#C98A2B', display:'block', opacity:0.5 }} /></span>
                      <span>{p.label}</span>
                      <span className="c">{p.count}</span>
                    </div>
                  ))}
                </>}
              </>}

              {/* Designation */}
              {desigCounts.length > 0 && <>
                <div className="wr-idx-div" style={{ margin:'8px 10px' }} />
                <button className="wr-filter-sec" onClick={() => toggleSection('desig')}>
                  <span>Designation</span>
                  <span style={{ transform: openSections.has('desig') ? 'rotate(180deg)' : 'none', transition:'transform .2s', display:'inline-block', fontSize:9 }}>▼</span>
                </button>
                {openSections.has('desig') && desigCounts.map(d => (
                  <div
                    key={d.key}
                    className={'wr-idx'+(indDesig===d.key?' on':'')}
                    onClick={() => { setIndDesig(indDesig===d.key ? null : d.key); setSelectedCompany(null); }}
                  >
                    <span className="ico"><span style={{ width:8, height:8, borderRadius:2, background:'var(--teal)', display:'block', opacity:0.6 }} /></span>
                    <span>{d.label}</span>
                    <span className="c">{d.count}</span>
                  </div>
                ))}
              </>}
            </>}

            {indRole === 'subs' && <>
              <div className="wr-hidx-lab">Subcontractors</div>
              <div className={'wr-idx on'}>
                <span className="ico"><GridIc /></span>
                <span>All subs</span>
                <span className="c">{subs.length}</span>
              </div>
            </>}
          </>}
        </aside>

        {/* ── Main content ── */}
        {seg === 'gov' ? (
          <Directory groups={groups} activeSection={activeSection} />
        ) : selectedCompany ? (
          <CompanyDetail company={selectedCompany} onBack={() => { setSelectedCompany(null); }} />
        ) : selectedSub ? (
          <SubDetail sub={selectedSub} onBack={() => setSelectedSub(null)} />
        ) : indRole === 'subs' ? (
          <SubList
            subs={subs}
            search={indSearch}
            page={indPage}
            onPageChange={setIndPage}
            onSelectSub={setSelectedSub}
            loaded={subsLoaded}
          />
        ) : (
          <IndustryList
            companies={companies}
            search={indSearch}
            valueTier={indValueTier}
            agency={indAgency}
            sbirOnly={indSbirOnly}
            sbirPhase={indSbirPhase}
            desig={indDesig}
            page={indPage}
            onPageChange={setIndPage}
            onSelectCompany={setSelectedCompany}
          />
        )}
      </div>
    </div>
  );
}
