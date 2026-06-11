'use client';
import { useState } from 'react';
import SignalDetailPanel from './SignalDetailPanel';

const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length]; }
function initials(name: string) { return name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase(); }

function fmtMoney(v: number | null) {
  if (!v) return null;
  if (v >= 1e9) return `$${(v/1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v/1e3).toFixed(0)}K`;
  return `$${v}`;
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

interface Props {
  contracts: any[];
  orgs: any[];
  stats: { total: number; opps: number; awards: number; total_value: number };
}

export default function SignalsClient({ contracts, orgs, stats }: Props) {
  const [view, setView] = useState<'dow'|'ind'>('dow');
  const [selectedOrg, setSelectedOrg] = useState<string|null>(orgs[0]?.id ?? null);
  const [typeFilter, setTypeFilter] = useState<string|null>(null);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);

  const orgMap = new Map(orgs.map(o => [o.id, o]));

  const selectedOrgData = orgs.find(o => o.id === selectedOrg);

  const orgSignals = contracts.filter(c =>
    (!selectedOrg || c.org_id === selectedOrg) &&
    (!typeFilter || c.signal_type === typeFilter)
  );

  const orgContractCounts = new Map<string, number>();
  contracts.forEach(c => {
    if (c.org_id) orgContractCounts.set(c.org_id, (orgContractCounts.get(c.org_id) ?? 0) + 1);
  });

  const sortedOrgs = [...orgs].sort((a,b) => (orgContractCounts.get(b.id)??0) - (orgContractCounts.get(a.id)??0));

  const fmtBig = (n: number) => {
    if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="sv">
      {/* Stats bar */}
      <div className="sv-stats">
        <div className="sv-stat">
          <div className="sv-stat-val" style={{color:'var(--navy)'}}>{stats.total.toLocaleString()}</div>
          <div className="sv-stat-lbl">Total Signals</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-val" style={{color:'var(--teal)'}}>{stats.opps.toLocaleString()}</div>
          <div className="sv-stat-lbl">Open Opportunities</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-val" style={{color:'var(--navy)'}}>{stats.awards.toLocaleString()}</div>
          <div className="sv-stat-lbl">Recent Awards</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-val" style={{color:'var(--amber)'}}>{fmtBig(stats.total_value)}</div>
          <div className="sv-stat-lbl">Total Award Value</div>
        </div>
      </div>

      {/* Segment toggle */}
      <div className="sv-tabs">
        <button
          className={`sv-seg sv-seg-dow${view==='dow'?' on':''}`}
          onClick={()=>setView('dow')}
        >
          <div className="sv-seg-kicker">BREAKDOWN BY</div>
          <div className="sv-seg-main">
            <span className="sv-seg-label">DEPARTMENT / AGENCY</span>
            <span className="sv-seg-count">{orgs.length}</span>
          </div>
        </button>
        <button
          className={`sv-seg sv-seg-ind${view==='ind'?' on':''}`}
          onClick={()=>setView('ind')}
        >
          <div className="sv-seg-kicker">BREAKDOWN BY</div>
          <div className="sv-seg-main">
            <span className="sv-seg-label">PRIME / INDUSTRY</span>
            <span className="sv-seg-count">{contracts.length}</span>
          </div>
        </button>
      </div>

      {/* Master-detail */}
      <div className="sv-body">
        <div className="sv-md">
          {/* Left nav — org list */}
          <div className="sv-nav">
            <div className="sv-nav-hdr">
              <input placeholder="Filter agencies…" />
            </div>
            <div className="sv-nav-sec-lbl">AGENCIES</div>
            {sortedOrgs.map(org => {
              const color = org.badge_color ?? colorFor(org.name);
              const cnt = orgContractCounts.get(org.id) ?? 0;
              return (
                <button
                  key={org.id}
                  className={`sv-nav-item${selectedOrg===org.id?' on':''}`}
                  onClick={()=>{ setSelectedOrg(org.id); setSelectedSignal(null); }}
                >
                  <div className="sv-nav-badge" style={{background:color}}>
                    {initials(org.name)}
                  </div>
                  <span className="sv-nav-name">{org.name}</span>
                  <span className="sv-nav-cnt">{cnt}</span>
                </button>
              );
            })}
            {sortedOrgs.length === 0 && (
              <button className="sv-nav-item" onClick={()=>setSelectedOrg(null)}>
                <span className="sv-nav-name" style={{color:'var(--tx4)'}}>All signals</span>
                <span className="sv-nav-cnt">{contracts.length}</span>
              </button>
            )}
          </div>

          {/* Right panel — signal list */}
          <div className="sv-rp">
            <div className="sv-rp-hdr">
              {selectedOrgData ? (
                <>
                  <div className="sv-rp-hdr-badge" style={{background: selectedOrgData.badge_color ?? colorFor(selectedOrgData.name)}}>
                    {initials(selectedOrgData.name)}
                  </div>
                  <div>
                    <div className="sv-rp-hdr-name">{selectedOrgData.name}</div>
                    <div className="sv-rp-hdr-meta">
                      {orgContractCounts.get(selectedOrgData.id) ?? 0} signals · {selectedOrgData.badge_text ?? 'Government'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="sv-rp-hdr-name">All Signals</div>
              )}
            </div>

            {/* Filters */}
            <div className="sv-rp-filter">
              {(['Opportunity','Award','Budget'] as const).map(t => (
                <button
                  key={t}
                  className={`sv-pill p-${t.toLowerCase()}${typeFilter===t?' on':''}`}
                  onClick={()=>setTypeFilter(typeFilter===t?null:t)}
                >{t}</button>
              ))}
              <span className="sv-rp-cnt">{orgSignals.length} signals</span>
            </div>

            {/* Signal rows */}
            <div className="sv-rp-list">
              {orgSignals.length === 0 && (
                <div style={{padding:'32px 16px',textAlign:'center',color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>
                  No signals for this agency
                </div>
              )}
              {orgSignals.map(sig => {
                const typeColor = sig.signal_type==='Opportunity' ? 'var(--teal)' : sig.signal_type==='Award' ? 'var(--navy)' : 'var(--amber)';
                const badgeCls = sig.signal_type==='Opportunity' ? 'sig-badge-opp' : sig.signal_type==='Award' ? 'sig-badge-award' : 'sig-badge-budget';
                const money = fmtMoney(sig.value);
                const date = fmtDate(sig.award_date);
                return (
                  <div
                    key={sig.id}
                    className={`sv-sig-row${selectedSignal?.id===sig.id?' on':''}`}
                    onClick={()=>setSelectedSignal(sig)}
                  >
                    <div className="sv-sig-dot" style={{background:typeColor}}></div>
                    <div className="sv-sig-body">
                      <div className="sv-sig-title">{sig.title}</div>
                      <div className="sv-sig-meta-row">
                        <span className={`sig-badge ${badgeCls}`}>{sig.signal_type ?? 'Signal'}</span>
                        {money && <span className="sv-sig-val" style={{color:typeColor}}>{money}</span>}
                        {date && <span className="sig-deadline">{date}</span>}
                        {sig.source && <span className="sig-set-aside">{sig.source.replace('_','.')}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Signal detail panel */}
      {selectedSignal && (
        <SignalDetailPanel signal={selectedSignal} onClose={()=>setSelectedSignal(null)} />
      )}
    </div>
  );
}
