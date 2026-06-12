'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/app/components/Pagination';

const ORGS_PER_PAGE = 25;

/* ── helpers ─────────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a','#2563B8','#3B7DB0'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function relTime(n: number): string {
  if (n < 2) return '1h ago';
  if (n < 5) return `${n}h ago`;
  if (n < 10) return 'Yesterday';
  return `${n % 7 + 1}d ago`;
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

/* Map abs_hierarchy_level → section group label */
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

/* Chevron SVGs */
const ChevDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const ChevRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m9 6 6 6-6 6"/>
  </svg>
);
const SearchIc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const SortIc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h12M3 12h9M3 18h6M17 5v14m0 0 3-3m-3 3-3-3"/>
  </svg>
);
const GovIc = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M5 21V10m14 11V10M3 10l9-6 9 6M9 21v-6h6v6"/>
  </svg>
);
const IndIc = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M5 21V8l5 3V8l5 3V5l4 2v14"/>
  </svg>
);
const GridIc = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

/* ── Directory table ─────────────────────────────────────────────────── */
function Directory({
  groups, onNav, activeSection,
}: {
  groups: { label: string; rows: Org[] }[];
  onNav: (id: string) => void;
  activeSection: string | null;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const router = useRouter();

  const toggle = (label: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const getPage = (label: string) => pageMap[label] ?? 1;
  const setGroupPage = (label: string, p: number) =>
    setPageMap(prev => ({ ...prev, [label]: p }));

  const visible = activeSection
    ? groups.filter(g => g.label === activeSection)
    : groups;

  return (
    <div className="wr-hmain">
      {/* Column headers */}
      <div className="wr-dhead">
        <div>Organization</div>
        <div>Type</div>
        <div>Top leader</div>
        <div className="r">Contacts</div>
        <div className="r">Contracts</div>
        <div className="r">Level</div>
        <div />
      </div>

      <div className="wr-dscroll">
        {visible.length === 0 && (
          <div style={{padding:'40px 26px',color:'var(--ink-3)',fontFamily:'IBM Plex Mono',fontSize:11}}>
            No organizations found.
          </div>
        )}
        {visible.map(g => {
          const isOpen = !collapsed.has(g.label);
          const gPage = getPage(g.label);
          const pagedRows = g.rows.slice((gPage - 1) * ORGS_PER_PAGE, gPage * ORGS_PER_PAGE);
          return (
            <div key={g.label}>
              <div
                className={'wr-dgroup' + (isOpen ? '' : ' closed')}
                onClick={() => toggle(g.label)}
              >
                <span className="chev"><ChevDown /></span>
                <span className="gl">{g.label}</span>
                <span className="gc">{g.rows.length}</span>
                <span className="gline" />
              </div>

              {isOpen && pagedRows.map(org => {
                const color = colorFor(org.name);
                const ini = initials(org.name);
                const leaderColor = org.top_leader_name ? colorFor(org.top_leader_name) : '#8995A4';
                const leaderIni = org.top_leader_name ? initials(org.top_leader_name) : '—';
                const fakeTime = relTime(org.name.charCodeAt(0) % 12);

                return (
                  <div
                    key={org.id}
                    className="wr-drow"
                    onClick={() => router.push(`/org/${org.id}`)}
                  >
                    {/* Org name + location */}
                    <div className="wr-org">
                      <div className="mk" style={{ background: color }}>{ini}</div>
                      <div className="tx">
                        <div className="on" title={org.name}>{org.name}</div>
                        <div className="os">{org.hq_address ?? org.branch ?? '—'}</div>
                      </div>
                    </div>

                    {/* Type chip */}
                    <div>
                      <span className="wr-chip">
                        {org.organization_type ?? org.branch ?? 'Org'}
                      </span>
                    </div>

                    {/* Top leader */}
                    <div className="wr-lead">
                      {org.top_leader_name ? (
                        <>
                          <div className="av" style={{ background: leaderColor }}>{leaderIni}</div>
                          <div className="ln" title={org.top_leader_name}>{org.top_leader_name}</div>
                        </>
                      ) : (
                        <div className="ln" style={{ color: 'var(--ink-3)' }}>—</div>
                      )}
                    </div>

                    {/* Contacts */}
                    <div className={'wr-num' + (org.contact_count ? '' : ' z')}>
                      {org.contact_count || '—'}
                    </div>

                    {/* Contracts */}
                    <div className={'wr-num' + (org.contract_count ? '' : ' z')}>
                      {org.contract_count || '—'}
                    </div>

                    {/* Level */}
                    <div className="wr-upd">
                      {org.abs_hierarchy_level != null ? `L${org.abs_hierarchy_level}` : '—'}
                    </div>

                    {/* Arrow */}
                    <div className="wr-go"><ChevRight /></div>
                  </div>
                );
              })}
              {isOpen && (
                <Pagination
                  total={g.rows.length}
                  page={gPage}
                  perPage={ORGS_PER_PAGE}
                  onChange={p => setGroupPage(g.label, p)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function DiscoverClient({ orgs }: { orgs: Org[] }) {
  const [seg, setSeg] = useState<'gov' | 'ind'>('gov');
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  /* For now, show all DoD orgs under "gov"; industry = placeholder */
  const govOrgs = orgs;

  const filtered = useMemo(() => {
    if (!search.trim()) return govOrgs;
    const q = search.toLowerCase();
    return govOrgs.filter(o =>
      o.name.toLowerCase().includes(q) ||
      (o.branch ?? '').toLowerCase().includes(q)
    );
  }, [govOrgs, search]);

  /* Group by abs_hierarchy_level bucket */
  const groups = useMemo(() => {
    const map = new Map<string, Org[]>();
    for (const o of filtered) {
      const sec = sectionFor(o.abs_hierarchy_level);
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(o);
    }
    return SECTION_ORDER
      .filter(s => map.has(s))
      .map(s => ({ label: s, rows: map.get(s)! }));
  }, [filtered]);

  /* Left index items */
  const indexItems = useMemo(() => [
    { label: 'All organizations', count: filtered.length, all: true },
    ...groups.map(g => ({ label: g.label, count: g.rows.length, all: false })),
  ], [filtered, groups]);

  /* Right rail: top 5 orgs by contact_count for activity */
  const topOrgs = useMemo(() =>
    [...govOrgs].sort((a, b) => b.contact_count - a.contact_count).slice(0, 5),
    [govOrgs]
  );
  const trending = topOrgs.slice(0, 3);
  const maxContacts = trending[0]?.contact_count ?? 1;

  const totalOrgs = govOrgs.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0 }}>

      {/* ── Page header ── */}
      <div className="wr-hhead">
        <div>
          <h1>Organizations</h1>
          <div className="wr-hmeta">
            {totalOrgs} organizations · DoD &amp; Defense
          </div>
        </div>

        {/* Segment control */}
        <div className="wr-seg">
          <button className={'wr-seg-btn' + (seg === 'gov' ? ' on' : '')} onClick={() => setSeg('gov')}>
            <span className="ic"><GovIc /></span>GOV ORG
          </button>
          <button className={'wr-seg-btn' + (seg === 'ind' ? ' on' : '')} onClick={() => setSeg('ind')}>
            <span className="ic"><IndIc /></span>INDUSTRY
          </button>
        </div>

        <div style={{ marginLeft: 'auto' }} />

        {/* Filter search */}
        <div className="wr-hsearch">
          <SearchIc />
          <input
            placeholder="Filter organizations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <button className="wr-sort">
          <SortIc /> Most active
        </button>
      </div>

      {/* ── 3-column body ── */}
      <div className="wr-hbody">

        {/* Left index */}
        <aside className="wr-hindex">
          <div className="wr-hidx-lab">Departments</div>
          {indexItems.map((item, i) => (
            <>
              <div
                key={item.label}
                className={'wr-idx' + (
                  (item.all && activeSection === null) ||
                  (!item.all && activeSection === item.label)
                    ? ' on' : ''
                )}
                onClick={() => setActiveSection(item.all ? null : item.label)}
              >
                <span className="ico">
                  {item.all
                    ? <GridIc />
                    : <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--ink-3)', display: 'block' }} />
                  }
                </span>
                <span>{item.label}</span>
                <span className="c">{item.count}</span>
              </div>
              {i === 0 && <div className="wr-idx-div" />}
            </>
          ))}
        </aside>

        {/* Directory — show placeholder for industry tab */}
        {seg === 'ind' ? (
          <div className="wr-hmain" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏭</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>Coming Soon</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>Industry organization profiles are being added.</div>
            </div>
          </div>
        ) : (
          <Directory
            groups={groups}
            onNav={id => {}}
            activeSection={activeSection}
          />
        )}

        {/* Right activity rail */}
        <aside className="wr-hact">
          <div className="wr-act-h">
            <span className="t">Recent activity</span>
            <span className="live">
              <span className="d" />
              Live
            </span>
          </div>
          <div className="wr-act-sub">ORG-CHART UPDATES · DOD</div>

          <div className="wr-act-scroll">
            <div className="wr-act-track">
              {[...topOrgs, ...topOrgs].map((org, i) => {
                const color = colorFor(org.name);
                const ini = initials(org.name);
                const leaderName = org.top_leader_name;
                const fakeTime = relTime(org.name.charCodeAt(2 % org.name.length) % 12);
                return (
                  <div className="wr-aitem" key={`${org.id}-${i}`}>
                    <div className="mk" style={{ background: color }}>{ini}</div>
                    <div className="body">
                      <div className="org">{org.name}</div>
                      <div className="txt">
                        {leaderName
                          ? <span><b>{leaderName}</b> listed as principal leader</span>
                          : <span>{org.contact_count} contacts indexed</span>
                        }
                      </div>
                      <div className="tm">{fakeTime}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
