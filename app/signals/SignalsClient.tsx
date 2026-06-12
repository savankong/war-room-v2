'use client';
import { useState, useMemo, useEffect } from 'react';
import Pagination from '@/app/components/Pagination';

const SIGNALS_PER_PAGE = 50;
import SignalDetailPanel from './SignalDetailPanel';

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

/* ── SVG icons ──────────────────────────────────────────────────── */
const IcSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
const IcSort    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h12M3 12h9M3 18h6M17 5v14m0 0 3-3m-3 3-3-3"/></svg>;
const IcTick    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M20 6 9 17l-5-5"/></svg>;
const IcChevD   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6"/></svg>;
const IcGlobe   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcDoc     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

/* ── Signal card ────────────────────────────────────────────────── */
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

/* ── Main ───────────────────────────────────────────────────────── */
interface Props {
  contracts: any[];
  orgs: any[];
  stats: { total: number; opps: number; awards: number; total_value: number };
}

const SORTS = ['Newest', 'Highest Value', 'Title A–Z'];

function fmtBig(n: number) {
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function SignalsClient({ contracts, orgs, stats }: Props) {
  const [seg, setSeg] = useState<'dow'|'ind'>('dow');
  const [search, setSearch] = useState('');
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [orgFilter, setOrgFilter] = useState<string|null>(null);
  const [sourceFilter, setSourceFilter] = useState<string|null>(null);
  const [sort, setSort] = useState('Newest');
  const [openSignal, setOpenSignal] = useState<any>(null);
  const [typeSectionOpen, setTypeSectionOpen] = useState(true);
  const [orgSectionOpen, setOrgSectionOpen] = useState(true);
  const [sourceSectionOpen, setSourceSectionOpen] = useState(true);

  /* counts */
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

  /* orgs that have signals */
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

  /* filtered list */
  const filtered = useMemo(() => {
    let list = contracts;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.title??'').toLowerCase().includes(q) ||
        (c.org_name??'').toLowerCase().includes(q)
      );
    }
    if (typeFilters.length > 0) {
      list = list.filter(c => typeFilters.includes(c.signal_type));
    }
    if (orgFilter) {
      list = list.filter(c => c.org_id === orgFilter);
    }
    if (sourceFilter) {
      list = list.filter(c => (SOURCE_LABEL[c.source] ?? c.source) === sourceFilter);
    }

    if (sort === 'Highest Value') {
      list = [...list].sort((a,b) => (Number(b.value)||0)-(Number(a.value)||0));
    } else if (sort === 'Title A–Z') {
      list = [...list].sort((a,b) => (a.title??'').localeCompare(b.title??''));
    }
    // 'Newest' is already ordered from the server

    return list;
  }, [contracts, search, typeFilters, orgFilter, sourceFilter, sort]);

  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search, typeFilters, orgFilter, sourceFilter, sort]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * SIGNALS_PER_PAGE, page * SIGNALS_PER_PAGE),
    [filtered, page]
  );

  const toggleType = (t: string) =>
    setTypeFilters(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t]);
  const cycleSort = () => setSort(s => SORTS[(SORTS.indexOf(s)+1)%SORTS.length]);

  return (
    <div className="sv" style={{ background:'var(--canvas)' }}>

      {/* ── Header ── */}
      <div className="wr-shead">
        <div>
          <h1>Signals</h1>
          <div className="meta">{filtered.length.toLocaleString()} of {contracts.length.toLocaleString()} signals · DoD contracts</div>
        </div>

        {/* Stats pills */}
        <div className="wr-s-stats">
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
        </div>

        {/* Segment */}
        <div className="wr-pseg" style={{ marginLeft: 'auto' }}>
          <button className={'wr-pseg-btn'+(seg==='dow'?' on':'')} onClick={()=>setSeg('dow')}>
            <IcDoc /> DOW / AGENCY
          </button>
          <button className={'wr-pseg-btn'+(seg==='ind'?' on':'')} onClick={()=>setSeg('ind')}>
            INDUSTRY
          </button>
        </div>

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
              placeholder="Filter signals…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
          </div>

          {/* Signal type */}
          <div className="wr-fg">
            <div className="wr-fg-h">
              <button style={{ display:'flex',alignItems:'center',gap:7,background:'none',border:'none',cursor:'pointer',padding:0,flex:1 }} onClick={()=>setTypeSectionOpen(v=>!v)}>
                <span style={{ color:'var(--ink-2)',fontSize:10,fontFamily:'IBM Plex Mono',letterSpacing:'1.4px',textTransform:'uppercase',fontWeight:700 }}>Signal type</span>
                <span style={{ marginLeft:4,color:'var(--ink-3)',transition:'transform .15s',transform:typeSectionOpen?'none':'rotate(-90deg)',display:'flex' }}><IcChevD /></span>
              </button>
              {typeFilters.length>0 && <span className="clr" onClick={()=>setTypeFilters([])}>Clear</span>}
            </div>
            {typeSectionOpen && Object.entries(TYPE_COLOR).map(([t,c]) => {
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
          </div>

          {/* Organization */}
          <div className="wr-fg">
            <div className="wr-fg-h">
              <button style={{ display:'flex',alignItems:'center',gap:7,background:'none',border:'none',cursor:'pointer',padding:0,flex:1 }} onClick={()=>setOrgSectionOpen(v=>!v)}>
                <span style={{ color:'var(--ink-2)',fontSize:10,fontFamily:'IBM Plex Mono',letterSpacing:'1.4px',textTransform:'uppercase',fontWeight:700 }}>Organization</span>
                <span style={{ marginLeft:4,color:'var(--ink-3)',transition:'transform .15s',transform:orgSectionOpen?'none':'rotate(-90deg)',display:'flex' }}><IcChevD /></span>
              </button>
              {orgFilter && <span className="clr" onClick={()=>setOrgFilter(null)}>Clear</span>}
            </div>
            {orgSectionOpen && topOrgsForFilter.map(o => (
              <div key={o.id} className={'wr-chk'+(orgFilter===o.id?' on':'')} onClick={()=>setOrgFilter(orgFilter===o.id?null:o.id)}>
                <span className="box">{orgFilter===o.id?<IcTick />:null}</span>
                <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12.5 }}>{o.name}</span>
                <span className="c">{orgCounts[o.id]??0}</span>
              </div>
            ))}
          </div>

          {/* Source */}
          <div className="wr-fg">
            <div className="wr-fg-h">
              <button style={{ display:'flex',alignItems:'center',gap:7,background:'none',border:'none',cursor:'pointer',padding:0,flex:1 }} onClick={()=>setSourceSectionOpen(v=>!v)}>
                <span style={{ color:'var(--ink-2)',fontSize:10,fontFamily:'IBM Plex Mono',letterSpacing:'1.4px',textTransform:'uppercase',fontWeight:700 }}>Source</span>
                <span style={{ marginLeft:4,color:'var(--ink-3)',transition:'transform .15s',transform:sourceSectionOpen?'none':'rotate(-90deg)',display:'flex' }}><IcChevD /></span>
              </button>
              {sourceFilter && <span className="clr" onClick={()=>setSourceFilter(null)}>Clear</span>}
            </div>
            {sourceSectionOpen && Object.entries(sourceCounts).map(([s,cnt]) => (
              <div key={s} className={'wr-chk'+(sourceFilter===s?' on':'')} onClick={()=>setSourceFilter(sourceFilter===s?null:s)}>
                <span className="box">{sourceFilter===s?<IcTick />:null}</span>
                <span style={{ flex:1,fontSize:12.5,display:'flex',alignItems:'center',gap:5 }}><IcGlobe />{s}</span>
                <span className="c">{cnt}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="wr-pmain">

          {/* Toolbar */}
          <div className="wr-ptool">
            <span className="cnt">{filtered.length} {filtered.length===1?'signal':'signals'}</span>
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
          </div>

          <div className="wr-pscroll">
            {seg === 'ind' ? (
              <div className="wr-pempty">Industry breakdown coming soon.</div>
            ) : filtered.length === 0 ? (
              <div className="wr-pempty">No signals match these filters.</div>
            ) : (
              <>
                <div className="wr-sgrid">
                  {paged.map(sig => (
                    <SignalCard key={sig.id} sig={sig} onOpen={()=>setOpenSignal(sig)} />
                  ))}
                </div>
                <Pagination
                  total={filtered.length}
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
