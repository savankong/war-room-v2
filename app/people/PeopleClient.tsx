'use client';

import { useState, useMemo } from 'react';

export interface PersonRow {
  id: string;
  full_name: string;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  avatar_color: string | null;
  avatar_url: string | null;
  org_id: string | null;
  org_name: string | null;
  team_names: string[];
  location: string | null;
}

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function PersonPanel({ person, onClose }: { person: PersonRow; onClose: () => void }) {
  return (
    <>
      <div className="sdp-overlay" onClick={onClose} />
      <div className="sdp-panel">
        <div className="pp-header">
          <div
            className="pp-avatar"
            style={{ backgroundColor: person.avatar_color ?? 'var(--navy)' }}
          >
            {person.avatar_url
              ? <img src={person.avatar_url} alt={person.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials(person.full_name)
            }
          </div>
          <div style={{ flex: 1 }}>
            <div className="pp-name">{person.full_name}</div>
            {person.role_title && <div className="pp-role">{person.role_title}</div>}
            {person.org_name && <div className="pp-org">{person.org_name}</div>}
          </div>
          <button className="pp-close" onClick={onClose}>×</button>
        </div>
        <div className="pp-body">
          <div className="pp-section">
            <h4>Contact</h4>
            <div className="pp-row">
              <div className="pp-field"><label>Email</label><p>{person.email ?? '—'}</p></div>
              <div className="pp-field"><label>Phone</label><p>{person.phone ?? '—'}</p></div>
            </div>
            {person.location && (
              <div className="pp-row" style={{ marginTop: 10 }}>
                <div className="pp-field"><label>Location</label><p>{person.location}</p></div>
              </div>
            )}
          </div>

          {person.org_name && (
            <div className="pp-section">
              <h4>Organization</h4>
              <p style={{ fontSize: 14 }}>{person.org_name}</p>
            </div>
          )}

          {person.team_names.length > 0 && (
            <div className="pp-section">
              <h4>Teams</h4>
              <div>{person.team_names.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PeopleClient({ people }: { people: PersonRow[] }) {
  const [query, setQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('All');
  const [selected, setSelected] = useState<PersonRow | null>(null);

  const orgs = useMemo(() => {
    const names = Array.from(new Set(people.map((p) => p.org_name).filter(Boolean) as string[])).sort();
    return ['All', ...names];
  }, [people]);

  const visible = useMemo(() => {
    return people.filter((p) => {
      if (orgFilter !== 'All' && p.org_name !== orgFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.full_name.toLowerCase().includes(q) ||
          (p.role_title ?? '').toLowerCase().includes(q) ||
          (p.org_name ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [people, query, orgFilter]);

  return (
    <div className="people-layout">
      {/* Sidebar filters */}
      <div className="people-sidebar">
        <input
          className="search-box"
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filter-section">
          <h4>Organization</h4>
          {orgs.map((o) => (
            <label key={o} className="filter-check">
              <input
                type="radio"
                name="org"
                checked={orgFilter === o}
                onChange={() => setOrgFilter(o)}
              />
              {o}
            </label>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="people-main">
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, color: 'var(--muted)' }}>
          {visible.length} person{visible.length !== 1 ? 's' : ''}
        </div>
        {visible.length === 0 ? (
          <p className="empty">No people match your filters.</p>
        ) : (
          visible.map((p) => (
            <div
              key={p.id}
              className={`person-row${selected?.id === p.id ? ' selected' : ''}`}
              onClick={() => setSelected(p)}
            >
              <div className="person-avatar" style={{ backgroundColor: p.avatar_color ?? 'var(--navy)' }}>
                {p.avatar_url
                  ? <img src={p.avatar_url} alt={p.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : initials(p.full_name)
                }
              </div>
              <div className="person-info">
                <div className="person-name">{p.full_name}</div>
                {p.role_title && <div className="person-role">{p.role_title}</div>}
                {p.org_name && <div className="person-org">{p.org_name}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && <PersonPanel person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
