'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { NavOrg } from './data';

const BRANCH_COLORS: Record<string, string> = {
  'Army': '#4a7c59', 'Air Force': '#1d6b8a', 'Navy': '#283a6b',
  'Marine Corps': '#c8502d', 'Space Force': '#7c4dbc',
  'Defense Agency': '#2f8676', 'SOCOM': '#8b6914',
  'OSW Principal Staff': '#5a3e28', 'Federal Agency': '#666',
};

const BRANCHES = [
  'Army','Air Force','Navy','Marine Corps','Space Force',
  'Defense Agency','SOCOM','OSW Principal Staff',
  'Geographic Combatant Command','Functional Combatant Command',
  'Federal Agency','Joint','Joint Staff','DoD Field Activity',
];

// Group label for each section based on abs_hierarchy_level
function sectionLabel(level: number | null): string {
  if (level == null || level >= 3) return 'Field / Sub-commands';
  if (level === 0) return 'DoD Leadership';
  if (level === 1) return 'Major Commands';
  if (level === 2) return 'Sub-commands';
  return 'Other';
}

export default function OrgNav({ orgs, currentId, currentBranch }: {
  orgs: NavOrg[]; currentId: string; currentBranch: string | null;
}) {
  const router = useRouter();
  const [branch, setBranch] = useState(currentBranch ?? 'Army');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = useMemo(() => {
    const inBranch = orgs.filter(o => o.branch === branch);
    if (!search.trim()) return inBranch;
    const q = search.toLowerCase();
    return inBranch.filter(o => o.name.toLowerCase().includes(q));
  }, [orgs, branch, search]);

  // Group into sections by abs_hierarchy_level
  const sections = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const aL = a.abs_hierarchy_level ?? a.hierarchy_level ?? 99;
      const bL = b.abs_hierarchy_level ?? b.hierarchy_level ?? 99;
      if (aL !== bL) return aL - bL;
      return a.name.localeCompare(b.name);
    });

    const map = new Map<string, NavOrg[]>();
    for (const o of sorted) {
      const label = sectionLabel(o.abs_hierarchy_level);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(o);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [filtered]);

  const availBranches = BRANCHES.filter(b => orgs.some(o => o.branch === b));

  const toggleSection = (label: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  return (
    <nav className="onav">
      <div className="onav-top">
        {/* Branch selector */}
        <div style={{position:'relative'}}>
          <button
            className="onav-switch"
            onClick={() => setDropdownOpen(v => !v)}
          >
            <div style={{flex:1,minWidth:0}}>
              <span className="sub">Branch</span>
              <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{branch}</div>
            </div>
            <span className="chev">
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
          </button>
          {dropdownOpen && (
            <div style={{
              position:'absolute',top:'calc(100% + 4px)',left:0,right:0,
              background:'var(--card)',border:'1px solid var(--card-border)',
              borderRadius:'var(--radius)',zIndex:50,overflow:'hidden',
              boxShadow:'0 4px 16px rgba(22,32,46,.12)',
            }}>
              {availBranches.map(b => (
                <button
                  key={b}
                  onClick={() => { setBranch(b); setDropdownOpen(false); }}
                  style={{
                    display:'block',width:'100%',padding:'9px 14px',textAlign:'left',
                    background: b === branch ? 'var(--row-on)' : 'none',
                    border:'none',fontSize:13,color: b === branch ? 'var(--ink)' : 'var(--ink-2)',
                    fontWeight: b === branch ? 600 : 400, cursor:'pointer',
                  }}
                >{b}</button>
              ))}
            </div>
          )}
        </div>

        {/* Filter input */}
        <div className="onav-filter">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          <input
            placeholder="Filter orgs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="onav-list">
        {sections.map(({ label, items }) => {
          const isCollapsed = collapsed.has(label);
          return (
            <div key={label} className="onav-sec">
              <button
                className={`onav-sec-h${isCollapsed ? ' closed' : ''}`}
                onClick={() => toggleSection(label)}
              >
                <span className="chev">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </span>
                <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</span>
                <span className="cnt">{items.length}</span>
              </button>

              {!isCollapsed && items.map(org => (
                <button
                  key={org.id}
                  className={`onav-item${org.id === currentId ? ' active' : ''}`}
                  data-level={org.abs_hierarchy_level ?? org.hierarchy_level ?? 2}
                  onClick={() => router.push(`/org/${org.id}`)}
                  title={org.name}
                >
                  <span className="nm">{org.name}</span>
                  {org.contract_count > 0 && (
                    <span className="rc">{org.contract_count}</span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
