'use client';
import { useState, useMemo, useEffect } from 'react';
import Pagination from '@/app/components/Pagination';
import SignalDetailPanel from './SignalDetailPanel';

const SIGNALS_PER_PAGE = 50;

/* ── helpers ─────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a','#2563B8','#3B7DB0'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0)+(n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

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
function fmtBig(n: number) {
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

/* Normalize raw recipient names to canonical company display names */
function normalizeCompany(r: string): string {
  if (!r) return r;
  const u = r.toUpperCase();
  if (u.includes('LOCKHEED MARTIN'))    return 'Lockheed Martin';
  if (u.includes('BOEING'))            return 'Boeing';
  if (u.includes('RAYTHEON') || u.startsWith('RTX ')) return 'RTX / Raytheon';
  if (u.includes('NORTHROP GRUMMAN'))  return 'Northrop Grumman';
  if (u.includes('HUNTINGTON INGALLS'))return 'Huntington Ingalls';
  if (u.includes('GENERAL DYNAMICS'))  return 'General Dynamics';
  if (u.includes('LEIDOS'))            return 'Leidos';
  if (u.includes('SCIENCE APPLICATIONS')) return 'SAIC';
  if (u.includes('BAE SYSTEMS'))       return 'BAE Systems';
  if (u.includes('KBR'))               return 'KBR';
  if (u.includes('AMENTUM'))           return 'Amentum';
  if (u.includes('ELECTRIC BOAT'))     return 'Electric Boat';
  if (u.includes('BATH IRON WORKS'))   return 'Bath Iron Works';
  if (u.includes('SIKORSKY'))          return 'Sikorsky';
  if (u.includes('GENERAL ATOMICS'))   return 'General Atomics';
  return r.replace(/ CORPORATION$| INCORPORATED$| INC\.$| LLC$| CORP$/i, '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const TYPE_COLOR: Record<string, string> = {
  Opportunity: '#2f8676',
  Award:       '#283a6b',
  Budget:      '#C98A2B',
};
const TYPE_BG: Record<string, string> = {
  Opportunity: 'rgba(47,134,118,.1)',
  Award:       'rgba(40,58,107,.1)',
  Budget:      'rgba(201,138,43,.12)',
};
const SOURCE_LABEL: Record<string, string> = {
  sam_gov:     'SAM.gov',
  usaspending: 'USASpending',
  manual:      'Manual',
};

const VALUE_TIERS = [
  { label: '$1B+',          min: 1e9,   max: Infinity },
  { label: '$100M – $1B',   min: 100e6, max: 1e9 },
  { label: '$10M – $100M',  min: 10e6,  max: 100e6 },
  { label: '$1M – $10M',    min: 1e6,   max: 10e6 },
  { label: '< $1M',         min: 0,     max: 1e6 },
];

/* ── SVG icons ──────────────────────────────────────────────────── */
const IcSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
const IcSort    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h12M3 12h9M3 18h6M17 5v14m0 0 3-3m-3 3-3-3"/></svg>;
const IcTick    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M20 6 9 17l-5-5"/></svg>;
const IcChevD   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>;
const IcGlobe   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcDoc     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcFactory = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V8l5 3V8l5 3V5l4 2v14"/></svg>;

/* ── Gov Signal card ────────────────────────────────────────────── */
function SignalCard({ sig, onOpen }: { sig: any; onOpen: () => void }) {
  const typeColor = TYPE_COLOR[sig.signal_type] ?? '#4A5666';
  const typeBg    = TYPE_BG[sig.signal_type]    ?? 'rgba(74,86,102,.1)';
  const money  = fmtMoney(sig.value);
  const date   = fmtDate(sig.award_date);
  const orgColor = sig.org_name ? colorFor(sig.org_name) : '#8995A4';
  const src = SOURCE_LABEL[sig.source] ?? sig.source ?? '';

  return (
    <div className="wr-scard">
      <div className="wr-sc-top">
        <div className="wr-sc-type" style={{ background: typeBg, color: typeColor }}>
          <span className="dot" style={{ background: typeColor }} />
          {sig.signal_type ?? 'Signal'}
        </div>
        {money && <span className="wr-sc-val" style={{ color: typeColor }}>{money}</span>}
      </div>
      <div className="wr-sc-title">{sig.title}</div>
      <div className="wr-sc-meta">
        {sig.org_name && (
          <span className="wr-sc-org">
            <span className="mk" style={{ background: orgColor }}>{initials(sig.org_name)}</span>
            <span className="ot">{sig.org_name}</span>
          </span>
        )}
        {date && <span className="wr-sc-date">{date}</span>}
      </div>
      <div className="wr-sc-ft">
        <div className="wr-sc-tags">
          {src && <span className="wr-sc-src">{src}</span>}
          {sig.set_aside && <span className="wr-sc-aside">{sig.set_aside}</span>}
        </div>
        <div className="wr-pbtn view" onClick={onOpen}>View</div>
      </div>
    </div>
  );
}

/* ── Industry Award card ─────────────────────────────────────────── */
function IndCard({ sig, onOpen }: { sig: any; onOpen: () => void }) {
  const company = normalizeCompany(sig.recipient ?? '');
  const companyColor = colorFor(company);
  const money = fmtMoney(sig.award_amt);
  const date  = fmtDate(sig.award_date);
  const agency = sig.sub_agency ?? sig.org_name ?? null;

  return (
    <div className="wr-scard">
      <div className="wr-sc-top">
        <div className="wr-sc-type" style={{ background: TYPE_BG.Award, color: TYPE_COLOR.Award }}>
          <span className="dot" style={{ background: TYPE_COLOR.Award }} />
          Award
        </div>
        {money && <span className="wr-sc-val" style={{ color: TYPE_COLOR.Award }}>{money}</span>}
      </div>
      <div className="wr-sc-title">{sig.title}</div>
      <div className="wr-sc-meta">
        <span className="wr-sc-org">
          <span className="mk" style={{ background: companyColor }}>{initials(company)}</span>
          <span className="ot">{company}</span>
        </span>
        {date && <span className="wr-sc-date">{date}</span>}
      </div>
      {agency && (
        <div className="wr-sc-meta" style={{ marginTop: 2 }}>
          <span className="wr-sc-org" style={{ opacity: .7 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono' }}>via {agency}</span>
          </span>
        </div>
      )}
      <div className="wr-sc-ft">
        <div className="wr-sc-tags">
          {sig.set_aside && <span className="wr-sc-aside">{sig.set_aside}</span>}
          {sig.naics && <span className="wr-sc-src">NAICS {sig.naics}</span>}
        </div>
        <div className="wr-pbtn view" onClick={onOpen}>View</div>
      </div>
    </div>
  );
}

/* ── Filter section wrapper ─────────────────────────────────────── */
function FilterSection({ label, isOpen, onToggle, onClear, showClear, children }: {
  label: string; isOpen: boolean; onToggle: () => void;
  onClear?: () => void; showClear: boolean; children: React.ReactNode;
}) {
  return (
    <div className="wr-fg">
      <div className="wr-fg-h">
        <button style={{ display:'flex',alignItems:'center',gap:7,background:'none',border:'none',cursor:'pointer',padding:0,flex:1 }} onClick={onToggle}>
          <span style={{ color:'var(--ink-2)',fontSize:10,fontFamily:'IBM Plex Mono',letterSpacing:'1.4px',textTransform:'uppercase',fontWeight:700 }}>{label}</span>
          <span style={{ marginLeft:4,color:'var(--ink-3)',transition:'transform .15s',transform:isOpen?'none':'rotate(-90deg)',display:'flex' }}><IcChevD /></span>
        </button>
        {showClear && <span className="clr" onClick={onClear}>Clear</span>}
      </div>
      {isOpen && children}
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────── */
interface Props {
  contracts: any[];
  orgs: any[];
  stats: { total: number; opps: number; awards: number; total_value: number };
  industryContracts: any[];
  indStats: { total: number; companies: number; total_value: number };
}

const GOV_SORTS = ['Newest', 'Highest Value', 'Title A–Z'];
const IND_SORTS = ['Highest Value', 'Newest', 'Title A–Z'];

export default function SignalsClient({ contracts, orgs, stats, industryContracts, indStats }: Props) {
  const [seg, setSeg] = useState<'dow'|'ind'>('dow');

  /* Gov filters */
  const [search,       setSearch]       = useState('');
  const [typeFilters,  setTypeFilters]  = useState<string[]>([]);
  const [orgFilter,    setOrgFilter]    = useState<string|null>(null);
  const [sourceFilter, setSourceFilter] = useState<string|null>(null);
  const [govSort,      setGovSort]      = useState('Newest');

  /* Industry filters */
  const [indSearch,    setIndSearch]    = useState('');
  const [compFilter,   setCompFilter]   = useState<string|null>(null);
  const [valueTier,    setValueTier]    = useState<string|null>(null);
  const [agencyFilter, setAgencyFilter] = useState<string|null>(null);
  const [indSort,      setIndSort]      = useState('Highest Value');

  /* Section open state */
  const [typeSectionOpen,   setTypeSectionOpen]   = useState(true);
  const [orgSectionOpen,    setOrgSectionOpen]     = useState(true);
  const [sourceSectionOpen, setSourceSectionOpen] = useState(true);
  const [compSectionOpen,   setCompSectionOpen]   = useState(true);
  const [valueSectionOpen,  setValueSectionOpen]  = useState(true);
  const [agencySectionOpen, setAgencySectionOpen] = useState(true);

  const [openSignal, setOpenSignal] = useState<any>(null);

  /* Reset to page 1 on filter change */
  const [page, setPage] = useState(1);

  /* ── Gov segment data ─────────────────────────────────────────── */
  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    contracts.forEach(c => { if (c.signal_type) m[c.signal_type] = (m[c.signal_type]??0)+1; });
    return m;
  }, [contracts]);

  const sourceCounts = useMemo(() => {
    const m: Record<string, number> = {};
    contracts.forEach(c => {
      const s = SOURCE_LABEL[c.source] ?? c.source ?? 'Other';
      m[s] = (m[s]??0)+1;
    });
    return m;
  }, [contracts]);

  const activeOrgs = useMemo(() => {
    const ids = new Set(contracts.map(c => c.org_id).filter(Boolean));
    return orgs.filter(o => ids.has(o.id));
  }, [contracts, orgs]);

  const orgCounts = useMemo(() => {
    const m: Record<string, number> = {};
    contracts.forEach(c => { if (c.org_id) m[c.org_id] = (m[c.org_id]??0)+1; });
    return m;
  }, [contracts]);

  const topOrgsForFilter = useMemo(() =>
    [...activeOrgs].sort((a,b) => (orgCounts[b.id]??0)-(orgCounts[a.id]??0)).slice(0, 20),
    [activeOrgs, orgCounts]
  );

  const govFiltered = useMemo(() => {
    let list = contracts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => (c.title??'').toLowerCase().includes(q) || (c.org_name??'').toLowerCase().includes(q));
    }
    if (typeFilters.length > 0) list = list.filter(c => typeFilters.includes(c.signal_type));
    if (orgFilter)    list = list.filter(c => c.org_id === orgFilter);
    if (sourceFilter) list = list.filter(c => (SOURCE_LABEL[c.source] ?? c.source) === sourceFilter);
    if (govSort === 'Highest Value') list = [...list].sort((a,b) => (Number(b.value)||0)-(Number(a.value)||0));
    if (govSort === 'Title A–Z')     list = [...list].sort((a,b) => (a.title??'').localeCompare(b.title??''));
    return list;
  }, [contracts, search, typeFilters, orgFilter, sourceFilter, govSort]);

  /* ── Industry segment data ───────────────────────────────────── */

  /* Attach normalized company name to each industry contract */
  const indWithCompany = useMemo(() =>
    industryContracts.map(c => ({ ...c, company: normalizeCompany(c.recipient ?? '') })),
    [industryContracts]
  );

  const companyCounts = useMemo(() => {
    const m: Record<string, number> = {};
    indWithCompany.forEach(c => { m[c.company] = (m[c.company]??0)+1; });
    return m;
  }, [indWithCompany]);

  const topCompanies = useMemo(() =>
    Object.entries(companyCounts).sort((a,b) => b[1]-a[1]),
    [companyCounts]
  );

  const agencyCounts = useMemo(() => {
    const m: Record<string, number> = {};
    indWithCompany.forEach(c => {
      const a = c.sub_agency ?? c.org_name;
      if (a) m[a] = (m[a]??0)+1;
    });
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0, 12);
  }, [indWithCompany]);

  const indFiltered = useMemo(() => {
    let list = indWithCompany;
    if (indSearch.trim()) {
      const q = indSearch.toLowerCase();
      list = list.filter(c =>
        (c.title??'').toLowerCase().includes(q) ||
        (c.company??'').toLowerCase().includes(q) ||
        (c.sub_agency??'').toLowerCase().includes(q)
      );
    }
    if (compFilter)   list = list.filter(c => c.company === compFilter);
    if (agencyFilter) list = list.filter(c => (c.sub_agency ?? c.org_name) === agencyFilter);
    if (valueTier) {
      const tier = VALUE_TIERS.find(t => t.label === valueTier);
      if (tier) list = list.filter(c => {
        const v = Number(c.award_amt ?? 0);
        return v >= tier.min && v < tier.max;
      });
    }
    if (indSort === 'Newest')      list = [...list].sort((a,b) => (b.award_date??'').localeCompare(a.award_date??''));
    if (indSort === 'Title A–Z')   list = [...list].sort((a,b) => (a.title??'').localeCompare(b.title??''));
    // 'Highest Value' is already ordered from server
    return list;
  }, [indWithCompany, indSearch, compFilter, agencyFilter, valueTier, indSort]);

  const valueTierCounts = useMemo(() => {
    const m: Record<string, number> = {};
    indWithCompany.forEach(c => {
      const v = Number(c.award_amt ?? 0);
      const tier = VALUE_TIERS.find(t => v >= t.min && v < t.max);
      if (tier) m[tier.label] = (m[tier.label]??0)+1;
    });
    return m;
  }, [indWithCompany]);

  /* ── Page resets ─────────────────────────────────────────────── */
  useEffect(() => setPage(1), [search, typeFilters, orgFilter, sourceFilter, govSort]);
  useEffect(() => setPage(1), [indSearch, compFilter, agencyFilter, valueTier, indSort]);
  useEffect(() => { setPage(1); }, [seg]);

  const activeList = seg === 'ind' ? indFiltered : govFiltered;
  const paged = useMemo(
    () => activeList.slice((page-1)*SIGNALS_PER_PAGE, page*SIGNALS_PER_PAGE),
    [activeList, page]
  );

  const toggleType = (t: string) =>
    setTypeFilters(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t]);

  const cycleSort = () => {
    if (seg === 'ind') setIndSort(s => IND_SORTS[(IND_SORTS.indexOf(s)+1) % IND_SORTS.length]);
    else               setGovSort(s => GOV_SORTS[(GOV_SORTS.indexOf(s)+1) % GOV_SORTS.length]);
  };

  const currentSort = seg === 'ind' ? indSort : govSort;

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="sv" style={{ background:'var(--canvas)' }}>

      {/* ── Header ── */}
      <div className="wr-shead">
        <div>
          <h1>Signals</h1>
          <div className="meta">
            {seg === 'ind'
              ? `${indFiltered.length.toLocaleString()} of ${indWithCompany.length.toLocaleString()} awards · Defense prime contractors`
              : `${govFiltered.length.toLocaleString()} of ${contracts.length.toLocaleString()} signals · Gov contracts`}
          </div>
        </div>

        {/* Stats pills */}
        <div className="wr-s-stats">
          {seg === 'ind' ? <>
            <div className="wr-s-stat">
              <span className="v" style={{ color: TYPE_COLOR.Award }}>{Number(indStats.total).toLocaleString()}</span>
              <span className="l">Awards</span>
            </div>
            <div className="wr-s-stat">
              <span className="v" style={{ color: TYPE_COLOR.Budget }}>{Number(indStats.companies)}</span>
              <span className="l">Companies</span>
            </div>
            <div className="wr-s-stat">
              <span className="v" style={{ color: TYPE_COLOR.Budget }}>{fmtBig(Number(indStats.total_value))}</span>
              <span className="l">Total Awarded</span>
            </div>
          </> : <>
            <div className="wr-s-stat">
              <span className="v" style={{ color: TYPE_COLOR.Award }}>{stats.awards.toLocaleString()}</span>
              <span className="l">Awards</span>
            </div>
            <div className="wr-s-stat">
              <span className="v" style={{ color: TYPE_COLOR.Opportunity }}>{stats.opps.toLocaleString()}</span>
              <span className="l">Open Opps</span>
            </div>
            <div className="wr-s-stat">
              <span className="v" style={{ color: TYPE_COLOR.Budget }}>{fmtBig(stats.total_value)}</span>
              <span className="l">Total Value</span>
            </div>
          </>}
        </div>

        {/* Segment toggle */}
        <div className="wr-pseg" style={{ marginLeft: 'auto' }}>
          <button className={'wr-pseg-btn'+(seg==='dow'?' on':'')} onClick={()=>setSeg('dow')}>
            <IcDoc /> GOVERNMENT
          </button>
          <button className={'wr-pseg-btn'+(seg==='ind'?' on':'')} onClick={()=>setSeg('ind')}>
            <IcFactory /> INDUSTRY
          </button>
        </div>

        <button className="wr-psort" onClick={cycleSort}>
          <IcSort /> Sort: <b>{currentSort}</b>
        </button>
      </div>

      <div className="wr-pbody">

        {/* ── Filter rail ── */}
        <aside className="wr-pfilters">
          {seg === 'dow' ? (
            <>
              <div className="wr-fsearch">
                <IcSearch />
                <input placeholder="Filter signals…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>

              <FilterSection label="Signal type" isOpen={typeSectionOpen} onToggle={()=>setTypeSectionOpen(v=>!v)} onClear={()=>setTypeFilters([])} showClear={typeFilters.length>0}>
                {Object.entries(TYPE_COLOR).map(([t,c]) => {
                  const cnt = typeCounts[t] ?? 0;
                  if (!cnt) return null;
                  return (
                    <div key={t} className={'wr-foc'+(typeFilters.includes(t)?' on':'')} onClick={()=>toggleType(t)}>
                      <span className="dot" style={{ background: c }} />
                      <span>{t}</span>
                      <span className="c">{cnt}</span>
                      <span className="tick"><IcTick /></span>
                    </div>
                  );
                })}
              </FilterSection>

              <FilterSection label="Organization" isOpen={orgSectionOpen} onToggle={()=>setOrgSectionOpen(v=>!v)} onClear={()=>setOrgFilter(null)} showClear={!!orgFilter}>
                {topOrgsForFilter.map(o => (
                  <div key={o.id} className={'wr-chk'+(orgFilter===o.id?' on':'')} onClick={()=>setOrgFilter(orgFilter===o.id?null:o.id)}>
                    <span className="box">{orgFilter===o.id?<IcTick />:null}</span>
                    <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5 }}>{o.name}</span>
                    <span className="c">{orgCounts[o.id]??0}</span>
                  </div>
                ))}
              </FilterSection>

              <FilterSection label="Source" isOpen={sourceSectionOpen} onToggle={()=>setSourceSectionOpen(v=>!v)} onClear={()=>setSourceFilter(null)} showClear={!!sourceFilter}>
                {Object.entries(sourceCounts).map(([s,cnt]) => (
                  <div key={s} className={'wr-chk'+(sourceFilter===s?' on':'')} onClick={()=>setSourceFilter(sourceFilter===s?null:s)}>
                    <span className="box">{sourceFilter===s?<IcTick />:null}</span>
                    <span style={{ flex:1,fontSize:12.5,display:'flex',alignItems:'center',gap:5 }}><IcGlobe />{s}</span>
                    <span className="c">{cnt}</span>
                  </div>
                ))}
              </FilterSection>
            </>
          ) : (
            <>
              <div className="wr-fsearch">
                <IcSearch />
                <input placeholder="Filter awards…" value={indSearch} onChange={e=>setIndSearch(e.target.value)} />
              </div>

              <FilterSection label="Company" isOpen={compSectionOpen} onToggle={()=>setCompSectionOpen(v=>!v)} onClear={()=>setCompFilter(null)} showClear={!!compFilter}>
                {topCompanies.map(([company, cnt]) => (
                  <div key={company} className={'wr-chk'+(compFilter===company?' on':'')} onClick={()=>setCompFilter(compFilter===company?null:company)}>
                    <span className="box">{compFilter===company?<IcTick />:null}</span>
                    <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5 }}>{company}</span>
                    <span className="c">{cnt}</span>
                  </div>
                ))}
              </FilterSection>

              <FilterSection label="Value" isOpen={valueSectionOpen} onToggle={()=>setValueSectionOpen(v=>!v)} onClear={()=>setValueTier(null)} showClear={!!valueTier}>
                {VALUE_TIERS.map(t => {
                  const cnt = valueTierCounts[t.label] ?? 0;
                  if (!cnt) return null;
                  return (
                    <div key={t.label} className={'wr-chk'+(valueTier===t.label?' on':'')} onClick={()=>setValueTier(valueTier===t.label?null:t.label)}>
                      <span className="box">{valueTier===t.label?<IcTick />:null}</span>
                      <span style={{ flex:1,fontSize:12.5 }}>{t.label}</span>
                      <span className="c">{cnt}</span>
                    </div>
                  );
                })}
              </FilterSection>

              <FilterSection label="Agency" isOpen={agencySectionOpen} onToggle={()=>setAgencySectionOpen(v=>!v)} onClear={()=>setAgencyFilter(null)} showClear={!!agencyFilter}>
                {agencyCounts.map(([agency, cnt]) => (
                  <div key={agency} className={'wr-chk'+(agencyFilter===agency?' on':'')} onClick={()=>setAgencyFilter(agencyFilter===agency?null:agency)}>
                    <span className="box">{agencyFilter===agency?<IcTick />:null}</span>
                    <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5 }}>{agency}</span>
                    <span className="c">{cnt}</span>
                  </div>
                ))}
              </FilterSection>
            </>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="wr-pmain">

          {/* Toolbar */}
          <div className="wr-ptool">
            <span className="cnt">{activeList.length} {activeList.length===1?'signal':'signals'}</span>
            {seg === 'dow' && <>
              {typeFilters.map(t => (
                <span className="wr-achip" key={t}>
                  <span className="dot" style={{ background: TYPE_COLOR[t] }} />{t}
                  <span className="x" onClick={()=>toggleType(t)}>✕</span>
                </span>
              ))}
              {orgFilter && (
                <span className="wr-achip">
                  <span className="dot" style={{ background:'var(--accent)' }} />
                  {orgs.find(o=>o.id===orgFilter)?.name}
                  <span className="x" onClick={()=>setOrgFilter(null)}>✕</span>
                </span>
              )}
              {sourceFilter && (
                <span className="wr-achip">
                  <span className="dot" style={{ background:'var(--ink-3)' }} />
                  {sourceFilter}
                  <span className="x" onClick={()=>setSourceFilter(null)}>✕</span>
                </span>
              )}
            </>}
            {seg === 'ind' && <>
              {compFilter && (
                <span className="wr-achip">
                  <span className="dot" style={{ background: colorFor(compFilter) }} />
                  {compFilter}
                  <span className="x" onClick={()=>setCompFilter(null)}>✕</span>
                </span>
              )}
              {valueTier && (
                <span className="wr-achip">
                  <span className="dot" style={{ background: TYPE_COLOR.Award }} />
                  {valueTier}
                  <span className="x" onClick={()=>setValueTier(null)}>✕</span>
                </span>
              )}
              {agencyFilter && (
                <span className="wr-achip">
                  <span className="dot" style={{ background:'var(--accent)' }} />
                  {agencyFilter}
                  <span className="x" onClick={()=>setAgencyFilter(null)}>✕</span>
                </span>
              )}
            </>}
          </div>

          <div className="wr-pscroll">
            {activeList.length === 0 ? (
              <div className="wr-pempty">No signals match these filters.</div>
            ) : (
              <>
                <div className="wr-sgrid">
                  {paged.map(sig =>
                    seg === 'ind'
                      ? <IndCard key={sig.id} sig={sig} onOpen={()=>setOpenSignal(sig)} />
                      : <SignalCard key={sig.id} sig={sig} onOpen={()=>setOpenSignal(sig)} />
                  )}
                </div>
                <Pagination
                  total={activeList.length}
                  page={page}
                  perPage={SIGNALS_PER_PAGE}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {openSignal && (
        <SignalDetailPanel signal={openSignal} onClose={()=>setOpenSignal(null)} />
      )}
    </div>
  );
}
