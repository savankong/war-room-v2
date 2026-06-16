'use client';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Pagination from '@/app/components/Pagination';
import SignalDetailPanel from './SignalDetailPanel';

const GOV_PER_PAGE = 50;
const IND_PER_PAGE = 50;

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
  const company = sig.org_name ?? sig.recipient ?? '';
  const companyColor = colorFor(company);
  const money = fmtMoney(sig.award_amt);
  const date  = fmtDate(sig.award_date);
  const agency = sig.sub_agency ?? sig.agency ?? null;

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
  indStats: { total: number; companies: number; total_value: number };
  indFilterOptions: {
    companies: [string, number][];
    agencies:  [string, number][];
  };
}

const GOV_SORTS = ['Newest', 'Highest Value', 'Title A–Z'];
const IND_SORTS = ['Highest Value', 'Newest', 'Title A–Z'];

export default function SignalsClient({ contracts, orgs, stats, indStats, indFilterOptions }: Props) {
  const [seg, setSeg] = useState<'dow'|'ind'>('dow');

  /* Gov filters */
  const [search,       setSearch]       = useState('');
  const [typeFilters,  setTypeFilters]  = useState<string[]>([]);
  const [orgFilter,    setOrgFilter]    = useState<string|null>(null);
  const [sourceFilter, setSourceFilter] = useState<string|null>(null);
  const [govSort,      setGovSort]      = useState('Newest');
  const [govPage,      setGovPage]      = useState(1);

  /* Industry filters */
  const [indSearch,    setIndSearch]    = useState('');
  const [compFilter,   setCompFilter]   = useState<string|null>(null);
  const [valueTier,    setValueTier]    = useState<string|null>(null);
  const [agencyFilter, setAgencyFilter] = useState<string|null>(null);
  const [indSort,      setIndSort]      = useState('Highest Value');

  /* Industry server-paginated data */
  const [indContracts, setIndContracts] = useState<any[]>([]);
  const [indTotal,     setIndTotal]     = useState(0);
  const [indPage,      setIndPage]      = useState(1);
  const [indLoading,   setIndLoading]   = useState(false);
  const indLoaded = useRef(false);

  /* Section open state */
  const [typeSectionOpen,   setTypeSectionOpen]   = useState(true);
  const [orgSectionOpen,    setOrgSectionOpen]     = useState(true);
  const [sourceSectionOpen, setSourceSectionOpen] = useState(true);
  const [compSectionOpen,   setCompSectionOpen]   = useState(true);
  const [valueSectionOpen,  setValueSectionOpen]  = useState(true);
  const [agencySectionOpen, setAgencySectionOpen] = useState(true);

  const [openSignal, setOpenSignal] = useState<any>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Industry API fetch ──────────────────────────────────────── */
  const fetchIndustry = useCallback(async (page: number) => {
    setIndLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), per: String(IND_PER_PAGE) });
      if (indSearch.trim()) p.set('search', indSearch.trim());
      if (compFilter)       p.set('company', compFilter);
      if (agencyFilter)     p.set('agency', agencyFilter);
      if (valueTier)        p.set('tier', valueTier);
      if (indSort === 'Newest')    p.set('sort', 'date');
      if (indSort === 'Title A–Z') p.set('sort', 'title');
      const res  = await fetch(`/api/signals/industry?${p}`);
      const data = await res.json();
      setIndContracts(data.contracts ?? []);
      setIndTotal(data.total ?? 0);
      setIndPage(page);
    } finally {
      setIndLoading(false);
    }
  }, [indSearch, compFilter, agencyFilter, valueTier, indSort]);

  /* Load industry on first tab switch */
  useEffect(() => {
    if (seg === 'ind' && !indLoaded.current) {
      indLoaded.current = true;
      fetchIndustry(1);
    }
  }, [seg, fetchIndustry]);

  /* Reload when filters/sort change (debounce search) */
  useEffect(() => {
    if (seg !== 'ind' || !indLoaded.current) return;
    fetchIndustry(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compFilter, agencyFilter, valueTier, indSort]);

  useEffect(() => {
    if (seg !== 'ind' || !indLoaded.current) return;
    const t = setTimeout(() => fetchIndustry(1), 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indSearch]);

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

  /* ── Page resets ─────────────────────────────────────────────── */
  useEffect(() => setGovPage(1), [search, typeFilters, orgFilter, sourceFilter, govSort]);
  useEffect(() => setGovPage(1), [seg]);

  const govPaged = useMemo(
    () => govFiltered.slice((govPage-1)*GOV_PER_PAGE, govPage*GOV_PER_PAGE),
    [govFiltered, govPage]
  );

  const toggleType = (t: string) =>
    setTypeFilters(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t]);

  const cycleSort = () => {
    if (seg === 'ind') setIndSort(s => IND_SORTS[(IND_SORTS.indexOf(s)+1) % IND_SORTS.length]);
    else               setGovSort(s => GOV_SORTS[(GOV_SORTS.indexOf(s)+1) % GOV_SORTS.length]);
  };

  const currentSort = seg === 'ind' ? indSort : govSort;

  /* ── Render ──────────────────────────────────────────────────── */
  const activeFilterCount = typeFilters.length + (orgFilter ? 1 : 0) + (sourceFilter ? 1 : 0)
    + (compFilter ? 1 : 0) + (valueTier ? 1 : 0) + (agencyFilter ? 1 : 0);

  return (
    <div className="wr-page-root">

      {/* ── Header ── */}
      <div className="wr-shead">
        <div>
          <h1>Signals</h1>
          <div className="meta">
            {seg === 'ind'
              ? `${indTotal.toLocaleString()} awards · Defense industry`
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
              <span className="v" style={{ color: TYPE_COLOR.Budget }}>{Number(indStats.companies).toLocaleString()}</span>
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

        <button
          className={`wr-filter-toggle${mobileFiltersOpen ? ' active' : ''}`}
          onClick={() => setMobileFiltersOpen(o => !o)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="1" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="5" y1="10.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
        <button className="wr-psort" onClick={cycleSort}>
          <IcSort /> Sort: <b>{currentSort}</b>
        </button>
      </div>

      <div className="wr-pbody">

        {/* ── Filter rail ── */}
        <aside className={`wr-pfilters${mobileFiltersOpen ? ' mobile-open' : ''}`}>
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
                    {o.sub && <span style={{ fontFamily:'IBM Plex Mono',fontSize:9,color:'var(--ink-3)',background:'var(--row-bg)',border:'1px solid var(--card-border)',borderRadius:3,padding:'1px 4px',whiteSpace:'nowrap',flexShrink:0,maxWidth:90,overflow:'hidden',textOverflow:'ellipsis' }}>{o.sub}</span>}
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
                <input placeholder="Search awards…" value={indSearch} onChange={e=>setIndSearch(e.target.value)} />
              </div>

              <FilterSection label="Company" isOpen={compSectionOpen} onToggle={()=>setCompSectionOpen(v=>!v)} onClear={()=>setCompFilter(null)} showClear={!!compFilter}>
                {indFilterOptions.companies.map(([name, cnt]) => (
                  <div key={name} className={'wr-chk'+(compFilter===name?' on':'')} onClick={()=>setCompFilter(compFilter===name?null:name)}>
                    <span className="box">{compFilter===name?<IcTick />:null}</span>
                    <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5 }}>{name}</span>
                    <span className="c">{cnt}</span>
                  </div>
                ))}
              </FilterSection>

              <FilterSection label="Value" isOpen={valueSectionOpen} onToggle={()=>setValueSectionOpen(v=>!v)} onClear={()=>setValueTier(null)} showClear={!!valueTier}>
                {VALUE_TIERS.map(t => (
                  <div key={t.label} className={'wr-chk'+(valueTier===t.label?' on':'')} onClick={()=>setValueTier(valueTier===t.label?null:t.label)}>
                    <span className="box">{valueTier===t.label?<IcTick />:null}</span>
                    <span style={{ flex:1,fontSize:12.5 }}>{t.label}</span>
                  </div>
                ))}
              </FilterSection>

              <FilterSection label="Branch" isOpen={agencySectionOpen} onToggle={()=>setAgencySectionOpen(v=>!v)} onClear={()=>setAgencyFilter(null)} showClear={!!agencyFilter}>
                {indFilterOptions.agencies.map(([name, cnt]) => (
                  <div key={name} className={'wr-chk'+(agencyFilter===name?' on':'')} onClick={()=>setAgencyFilter(agencyFilter===name?null:name)}>
                    <span className="box">{agencyFilter===name?<IcTick />:null}</span>
                    <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5 }}>{name}</span>
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
            {seg === 'dow' ? (
              <>
                <span className="cnt">{govFiltered.length} {govFiltered.length===1?'signal':'signals'}</span>
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
              </>
            ) : (
              <>
                <span className="cnt">
                  {indLoading ? 'Loading…' : `${indTotal.toLocaleString()} awards`}
                </span>
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
              </>
            )}
          </div>

          <div className="wr-pscroll">
            {seg === 'dow' ? (
              govFiltered.length === 0 ? (
                <div className="wr-pempty">No signals match these filters.</div>
              ) : (
                <>
                  <div className="wr-sgrid">
                    {govPaged.map(sig => <SignalCard key={sig.id} sig={sig} onOpen={()=>setOpenSignal(sig)} />)}
                  </div>
                  <Pagination total={govFiltered.length} page={govPage} perPage={GOV_PER_PAGE} onChange={setGovPage} />
                </>
              )
            ) : (
              indLoading ? (
                <div className="wr-pempty" style={{ opacity:.6 }}>Loading awards…</div>
              ) : indContracts.length === 0 ? (
                <div className="wr-pempty">No awards match these filters.</div>
              ) : (
                <>
                  <div className="wr-sgrid">
                    {indContracts.map(sig => <IndCard key={sig.id} sig={sig} onOpen={()=>setOpenSignal(sig)} />)}
                  </div>
                  <Pagination
                    total={indTotal}
                    page={indPage}
                    perPage={IND_PER_PAGE}
                    onChange={p => fetchIndustry(p)}
                  />
                </>
              )
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
