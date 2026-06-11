'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Org {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
  badge_text: string | null;
  badge_color: string | null;
  description: string | null;
  hq_address: string | null;
  personnel_count: number | null;
  contract_count: number;
}

const SECTORS = ['All', 'Defense', 'Civilian', 'Intelligence', 'Health', 'R&D'];

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function DiscoverClient({ orgs }: { orgs: Org[] }) {
  const [sector, setSector] = useState('All');
  const [query, setQuery] = useState('');

  const visible = orgs.filter((o) => {
    if (sector !== 'All' && o.sector !== sector) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!o.name.toLowerCase().includes(q) && !(o.description ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <div className="discover-header">
        <div className="container">
          <h1 className="discover-title">Discover</h1>
          <p className="discover-sub">{orgs.length} organizations tracked</p>
          <div className="discover-filters">
            <input
              className="search-box"
              style={{ width: 220, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.3)', color: '#fff' }}
              placeholder="Search organizations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {SECTORS.map((s) => (
              <button
                key={s}
                className={`filter-btn${sector === s ? ' active' : ''}`}
                onClick={() => setSector(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty">No organizations match your filters.</p>
      ) : (
        <div className="discover-grid">
          {visible.map((org) => (
            <Link key={org.id} href={`/org/${org.slug}`} className="org-card">
              <div className="org-card-header">
                <div className="org-logo">{initials(org.name)}</div>
                <div>
                  <div className="org-name">{org.name}</div>
                  {org.badge_text && (
                    <span className="org-badge" style={{ backgroundColor: org.badge_color ?? '#283a6b' }}>
                      {org.badge_text}
                    </span>
                  )}
                </div>
              </div>
              {org.description && <p className="org-desc">{org.description}</p>}
              <div className="org-meta">
                {org.sector && <span><b>{org.sector}</b></span>}
                {org.hq_address && <span>{org.hq_address}</span>}
                {org.contract_count > 0 && <span><b>{fmtCount(org.contract_count)}</b> signals</span>}
                {org.personnel_count != null && <span><b>{fmtCount(org.personnel_count)}</b> personnel</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
