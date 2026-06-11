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

export default function OrgNav({ orgs, currentId, currentBranch }: {
  orgs: NavOrg[]; currentId: string; currentBranch: string | null;
}) {
  const router = useRouter();
  const [branch, setBranch] = useState(currentBranch ?? 'Army');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const inBranch = orgs.filter(o => o.branch === branch);
    if (!search.trim()) return inBranch;
    const q = search.toLowerCase();
    return inBranch.filter(o => o.name.toLowerCase().includes(q));
  }, [orgs, branch, search]);

  // Sort: parents first, then children indented
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aLevel = a.hierarchy_level ?? 2;
      const bLevel = b.hierarchy_level ?? 2;
      if (aLevel !== bLevel) return aLevel - bLevel;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const branchColor = BRANCH_COLORS[branch] ?? '#666';
  const branchCount = orgs.filter(o => o.branch === branch).length;

  return (
    <nav className="onav">
      <div className="onav-hdr">
        <select className="onav-sel" value={branch} onChange={e => setBranch(e.target.value)}>
          {BRANCHES.map(b => {
            const cnt = orgs.filter(o => o.branch === b).length;
            return cnt > 0 ? <option key={b} value={b}>{b}</option> : null;
          })}
        </select>
        <input
          className="onav-search"
          placeholder="Filter orgs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="onav-list">
        <div className="onav-branch-hdr">
          <span>{branch.toUpperCase()}</span>
          <span>{branchCount}</span>
        </div>
        {sorted.map(org => (
          <button
            key={org.id}
            className={`onav-item${org.id === currentId ? ' active' : ''}`}
            data-level={org.hierarchy_level ?? 2}
            onClick={() => router.push(`/org/${org.id}`)}
            title={org.name}
          >
            <div className="onav-dot" style={{ background: org.id === currentId ? branchColor : 'var(--bg4)' }} />
            <span className="onav-name">{org.name}</span>
            {org.contract_count > 0 && (
              <span className="onav-cnt">{org.contract_count}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
