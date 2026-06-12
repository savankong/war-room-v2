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

  useEffect(() => {
    if (tab !== 'contracts' || contracts.length > 0) return;
    setLoadingC(true);
    fetch(`/api/industry/contracts?recipient=${encodeURIComponent(company.name)}`)
      .then(r => r.json())
      .then(d => { setContracts(Array.isArray(d) ? d : []); setLoadingC(false); });
  }, [tab, company.name, contracts.length]);

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
              <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                <span style={{padding:'2px 8px',borderRadius:4,border:'1px solid #283a6b',background:'rgba(40,58,107,.07)',fontFamily:'IBM Plex Mono',fontSize:10,color:'#283a6b',fontWeight:600}}>PRIME</span>
                <span style={{fontFamily:'IBM Plex Mono',fontSize:11,color:'var(--ink-3)'}}>Direct DoD prime contractor</span>
              </div>
            </div>
          </div>

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
            <div className="orgd-meta">
              <div className="mlbl">Top Agencies</div>
              <div className="mval sm">{(company.agencies??[]).slice(0,2).join(', ') || '—'}</div>
            </div>
          </div>

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
                <div className="oc-empty">No executive profiles found for this company.</div>
              ) : (
                <div className="wr-broad">
                  {/* Tier 1 — CEO/Chairman */}
                  {tier1.length > 0 && (
                    <div className="wr-broad-root">
                      {tier1.map(p => (
                        <div key={p.id} className="wr-node-root" onClick={() => setPanelPerson(p)} style={{cursor:'pointer'}}>
                          <span className="rk">CEO</span>
                          <div className="ava" style={{background:execColorFor(p.name)}}>{execInitials(p.name)}</div>
                          <div className="nm">{p.name}</div>
                          {p.title && <div className="rl">{p.title}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {tier2.length > 0 && (
                    <>
                      <div className="wr-stem" />
                      <div className="wr-tierbox">
                        <div className="wr-tierhead">
                          <span className="dot"/><span className="tl">Division Presidents</span>
                          <span className="tc">{tier2.length} people</span>
                        </div>
                        <div className="wr-grid">
                          {tier2.map(p => (
                            <div key={p.id} className="wr-cc" onClick={() => setPanelPerson(p)}>
                              <div className="ava" style={{background:execColorFor(p.name)}}>{execInitials(p.name)}</div>
                              <div className="nm">{p.name}</div>
                              {p.title && <div className="rl">{p.title}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {tier3.length > 0 && (
                    <>
                      <div className="wr-stem" />
                      <div className="wr-tierbox">
                        <div className="wr-tierhead">
                          <span className="dot"/><span className="tl">Senior Leadership</span>
                          <span className="tc">{tier3.length} people</span>
                        </div>
                        <div className="wr-grid">
                          {tier3.map(p => (
                            <div key={p.id} className="wr-cc" onClick={() => setPanelPerson(p)}>
                              <div className="ava" style={{background:execColorFor(p.name)}}>{execInitials(p.name)}</div>
                              <div className="nm">{p.name}</div>
                              {p.title && <div className="rl">{p.title}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contracts tab */}
          {tab === 'contracts' && (
            <div style={{flex:1,overflow:'auto'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 90px 110px 160px 80px',padding:'8px 20px',background:'var(--card)',borderBottom:'1px solid var(--card-border)',position:'sticky',top:0,zIndex:1}}>
                {['Contract','Type','Value','Awarding Org','Date'].map(h => (
                  <div key={h} style={{fontFamily:'IBM Plex Mono',fontSize:10,textTransform:'uppercase',letterSpacing:'1px',color:'var(--ink-3)'}}>{h}</div>
                ))}
              </div>
              {loadingC && <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>Loading contracts…</div>}
              {!loadingC && contracts.length === 0 && <div style={{padding:40,textAlign:'center',fontFamily:'IBM Plex Mono',fontSize:12,color:'var(--ink-3)'}}>No contracts found.</div>}
              {!loadingC && contracts.map((c:any) => (
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
  abs_hierarchy_level: number | null;
  hierarchy_level: number | null;
  parent_id: string | null;
  contact_count: number;
  contract_count: number;
  top_leader_name: string | null;
  top_leader_title: string | null;
}

function sectionFor(lvl: number | null): string {
  if (lvl == null || lvl >= 4) return 'Field Activities';
  if (lvl === 0) return 'DoD Leadership';
  if (lvl === 1) return 'Major Commands & Senior Offices';
  if (lvl === 2) return 'Sub-commands & Directorates';
  return 'Units & Squadrons';
}

const SECTION_ORDER = [
  'DoD Leadership',
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
          return (
            <div key={g.label}>
              <div className={'wr-dgroup'+(isOpen?'':' closed')} onClick={() => toggle(g.label)}>
                <span className="chev"><ChevDown /></span>
                <span className="gl">{g.label}</span>
                <span className="gc">{g.rows.length}</span>
                <span className="gline" />
              </div>
              {isOpen && pagedRows.map(org => {
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
              })}
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
  companies, search, valueTier, page, onPageChange, onSelectCompany,
}: {
  companies: any[]; search: string; valueTier: string | null; page: number;
  onPageChange(p: number): void; onSelectCompany(c: any): void;
}) {
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
    return list;
  }, [companies, search, valueTier]);

  const paged = filtered.slice((page-1)*IND_PER_PAGE, page*IND_PER_PAGE);

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
        <div>Company</div><div>Role</div>
        <div className="r">Contracts</div><div className="r">Total Awarded</div>
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
                <div className="os">
                  {c.sources?.join(' · ').replace('usaspending','USASpending').replace('sam_gov','SAM.gov')}
                </div>
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
        <Pagination total={filtered.length} page={page} perPage={IND_PER_PAGE} onChange={onPageChange} />
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
  const filtered = useMemo(() => {
    if (!search.trim()) return subs;
    const q = search.toLowerCase();
    return subs.filter(s => s.name?.toLowerCase().includes(q) || (s.display_name ?? '').toLowerCase().includes(q));
  }, [subs, search]);

  const paged = filtered.slice((page-1)*SUB_PER_PAGE, page*SUB_PER_PAGE);

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
        <div>Subcontractor</div>
        <div>Primes</div>
        <div className="r">Total Value</div>
        <div className="r">Awards</div>
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
      <Pagination total={filtered.length} page={page} perPage={SUB_PER_PAGE} onChange={onPageChange} />
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

  /* Industry state */
  const [companies,     setCompanies]     = useState<any[]>([]);
  const [indLoaded,     setIndLoaded]     = useState(false);
  const [indSearch,     setIndSearch]     = useState('');
  const [indValueTier,  setIndValueTier]  = useState<string|null>(null);
  const [indPage,       setIndPage]       = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<any|null>(null);

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
  useEffect(() => { setIndPage(1); setSelectedCompany(null); setSelectedSub(null); }, [indSearch, indValueTier, indRole]);

  /* Gov org data */
  const filtered = useMemo(() => {
    if (!search.trim()) return orgs;
    const q = search.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(q) || (o.branch??'').toLowerCase().includes(q));
  }, [orgs, search]);

  const groups = useMemo(() => {
    const map = new Map<string, Org[]>();
    for (const o of filtered) {
      const sec = sectionFor(o.abs_hierarchy_level);
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

  function switchSeg(s: 'gov'|'ind') {
    setSeg(s);
    setSearch('');
    setActiveSection(null);
    setIndSearch('');
    setIndValueTier(null);
    setSelectedCompany(null);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', minHeight:0 }}>

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

        <button className="wr-sort"><SortIc /> Most active</button>
      </div>

      {/* ── 2-column body (no right rail) ── */}
      <div className="wr-hbody" style={{ gridTemplateColumns:'220px 1fr' }}>

        {/* ── Left index ── */}
        <aside className="wr-hindex">

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
              <div className="wr-hidx-lab">Companies</div>
              <div
                className={'wr-idx'+(indValueTier===null?' on':'')}
                onClick={() => { setIndValueTier(null); setSelectedCompany(null); }}
              >
                <span className="ico"><GridIc /></span>
                <span>All primes</span>
                <span className="c">{companies.length}</span>
              </div>
              <div className="wr-idx-div" />
              <div className="wr-hidx-lab" style={{ paddingTop:8 }}>By Contract Value</div>
              {tierCounts.map(t => (
                <div
                  key={t.label}
                  className={'wr-idx'+(indValueTier===t.label?' on':'')}
                  onClick={() => { setIndValueTier(t.label); setSelectedCompany(null); }}
                >
                  <span className="ico">
                    <span style={{ width:8, height:8, borderRadius:2, background:'var(--teal)', display:'block', opacity: t.count > 0 ? 1 : 0.3 }} />
                  </span>
                  <span>{t.label}</span>
                  <span className="c">{t.count}</span>
                </div>
              ))}
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
            page={indPage}
            onPageChange={setIndPage}
            onSelectCompany={setSelectedCompany}
          />
        )}
      </div>
    </div>
  );
}
