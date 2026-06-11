'use client';

import { useState, useMemo } from 'react';
import SignalDetailPanel from './SignalDetailPanel';

export interface Signal {
  id: string;
  title: string;
  signal_type: string | null;
  value: number | null;
  status: string | null;
  award_date: string | null;
  source: string;
  org_id: string | null;
  org_name: string | null;
  naics_code: string | null;
  psc_code: string | null;
  description: string | null;
  awardee: string | null;
  solicitation_number: string | null;
}

interface OrgGroup { id: string | null; name: string; count: number; }

function fmt(v: number | null) {
  if (v == null) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
}
function fmtDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function badgeClass(t: string | null) {
  if (t === 'Award') return 'signal-badge badge-award';
  if (t === 'Opportunity') return 'signal-badge badge-opportunity';
  return 'signal-badge badge-budget';
}

export default function SignalsClient({ signals }: { signals: Signal[] }) {
  const [activeOrg, setActiveOrg] = useState<string | null | 'ALL'>('ALL');
  const [segment, setSegment] = useState<'DoW' | 'Industry'>('DoW');
  const [selected, setSelected] = useState<Signal | null>(null);

  const orgGroups: OrgGroup[] = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const s of signals) {
      const key = s.org_id ?? '__none__';
      const name = s.org_name ?? 'Unassigned';
      const prev = map.get(key) ?? { name, count: 0 };
      map.set(key, { name, count: prev.count + 1 });
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id: id === '__none__' ? null : id, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }, [signals]);

  const filtered = useMemo(() => {
    if (activeOrg === 'ALL') return signals;
    return signals.filter((s) => (s.org_id ?? null) === activeOrg);
  }, [signals, activeOrg]);

  const totalValue = filtered.reduce((s, c) => s + (c.value ?? 0), 0);
  const awards      = filtered.filter((s) => s.signal_type === 'Award').length;
  const opps        = filtered.filter((s) => s.signal_type === 'Opportunity').length;

  return (
    <div className="signals-layout">
      {/* Sidebar */}
      <div className="signals-sidebar">
        <div className="sidebar-header">Agencies</div>
        <button
          className={`sidebar-item${activeOrg === 'ALL' ? ' active' : ''}`}
          onClick={() => setActiveOrg('ALL')}
        >
          <span>All Agencies</span>
          <span className="sidebar-count">{signals.length}</span>
        </button>
        {orgGroups.map((g) => (
          <button
            key={g.id ?? '__none__'}
            className={`sidebar-item${activeOrg === g.id ? ' active' : ''}`}
            onClick={() => setActiveOrg(g.id)}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {g.name}
            </span>
            <span className="sidebar-count">{g.count}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="signals-main">
        {/* Stats bar */}
        <div className="signals-stats">
          <div className="stat-cell">
            <div className="stat-val">{filtered.length}</div>
            <div className="stat-lbl">Signals</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">{fmt(totalValue) || '—'}</div>
            <div className="stat-lbl">Total Value</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">{awards}</div>
            <div className="stat-lbl">Awards</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">{opps}</div>
            <div className="stat-lbl">Opportunities</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="signals-toolbar">
          <div className="seg-toggle">
            {(['DoW', 'Industry'] as const).map((s) => (
              <button key={s} className={`seg-btn${segment === s ? ' active' : ''}`} onClick={() => setSegment(s)}>
                {s}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {filtered.length} signal{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Signal rows */}
        {filtered.length === 0 ? (
          <p className="empty">No signals for this selection.</p>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className={`signal-row${selected?.id === s.id ? ' selected' : ''}`}
              onClick={() => setSelected(s)}
            >
              <span className={badgeClass(s.signal_type)}>{s.signal_type ?? '—'}</span>
              <div className="signal-body">
                <div className="signal-title">{s.title}</div>
                <div className="signal-meta">
                  {s.org_name && <>{s.org_name} · </>}
                  {s.source}
                </div>
              </div>
              <div className="signal-right">
                {s.value != null && <div className="signal-value">{fmt(s.value)}</div>}
                {s.award_date && <div className="signal-date">{fmtDate(s.award_date)}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && <SignalDetailPanel signal={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
