import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrgProfile, getOrgPeople, getOrgTeams, getOrgOffices, getOrgContracts } from './data';
import type { Person } from './data';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(n: string) { return COLORS[n.charCodeAt(0) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

function fmtMoney(v: number|null) {
  if (!v) return '—';
  if (v>=1e9) return `$${(v/1e9).toFixed(1)}B`;
  if (v>=1e6) return `$${(v/1e6).toFixed(1)}M`;
  if (v>=1e3) return `$${(v/1e3).toFixed(0)}K`;
  return `$${v}`;
}

function buildTree(people: Person[]) {
  const map = new Map<string, Person & { children: any[] }>();
  people.forEach(p => map.set(p.id, { ...p, children: [] }));
  let root: (Person & { children: any[] }) | null = null;
  map.forEach(node => {
    if (node.manager_id && map.has(node.manager_id)) {
      map.get(node.manager_id)!.children.push(node);
    } else {
      root = node;
    }
  });
  return root;
}

function OcCard({ person }: { person: Person & { children: any[] } }) {
  const color = person.avatar_color ?? colorFor(person.full_name);
  const ini = initials(person.full_name);
  return (
    <div className="oc-col">
      <div className="oc-card">
        <div className="oc-av" style={{background:color}}>{ini}</div>
        <div className="oc-name">{person.full_name}</div>
        {person.role_title && <div className="oc-role">{person.role_title}</div>}
        {person.children.length > 0 && (
          <div className="oc-xbtn">+ {person.children.length} direct{person.children.length!==1?'s':''}</div>
        )}
      </div>
      {person.children.length > 0 && (
        <>
          <div className="oc-vline" />
          <div className="oc-row">
            {person.children.map((c: any) => (
              <OcCard key={c.id} person={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default async function OrgPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab = 'orgchart' } = await searchParams;

  const org = await getOrgProfile(slug);
  if (!org) notFound();

  const [people, teams, offices, contracts] = await Promise.all([
    getOrgPeople(org.id),
    getOrgTeams(org.id),
    getOrgOffices(org.id),
    getOrgContracts(org.id),
  ]);

  const tree = buildTree(people);
  const color = org.badge_color ?? colorFor(org.name);
  const ini = initials(org.name);

  const TABS = [
    { key: 'orgchart', label: 'Org Chart' },
    { key: 'teams', label: `Teams (${teams.length})` },
    { key: 'offices', label: `Offices (${offices.length})` },
    { key: 'contracts', label: `Contracts (${contracts.length})` },
  ];

  return (
    <div className="orgd">
      {/* Subnav */}
      <div className="orgd-sub">
        <Link href="/" className="orgd-back">←</Link>
        <span className="orgd-sname">{org.name}</span>
        <div className="orgd-acts">
          <button className="btn-follow">Follow · {org.follower_count}</button>
          <button className="btn-ic">⋯</button>
        </div>
      </div>

      <div className="orgd-body">
        {/* Hero */}
        <div className="orgd-hero-top">
          <div style={{width:56,height:56,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Roboto',fontWeight:800,fontSize:16,color:'#fff',flexShrink:0}}>
            {ini}
          </div>
          <div>
            <div className="orgd-title">{org.name}</div>
            <div className="orgd-flw">{org.follower_count.toLocaleString()} followers · {org.contact_count.toLocaleString()} contacts</div>
          </div>
        </div>

        {org.description && <p className="orgd-desc">{org.description}</p>}

        {/* Meta grid */}
        <div className="orgd-metas">
          <div className="orgd-meta">
            <div className="mlbl">Sector</div>
            <div className="mval">{org.sector ?? '—'}</div>
          </div>
          <div className="orgd-meta">
            <div className="mlbl">HQ</div>
            <div className="mval">{org.hq_address ?? '—'}</div>
          </div>
          <div className="orgd-meta">
            <div className="mlbl">Personnel</div>
            <div className="mval">{org.personnel_count?.toLocaleString() ?? '—'}</div>
          </div>
          <div className="orgd-meta">
            <div className="mlbl">Contracts</div>
            <div className="mval">{contracts.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="orgd-tabs">
          {TABS.map(t => (
            <a
              key={t.key}
              href={`?tab=${t.key}`}
              className={`orgd-tab${tab===t.key?' on':''}`}
            >
              {t.label}
            </a>
          ))}
        </div>

        <div className="tab-body">
          {/* Org Chart */}
          {tab === 'orgchart' && (
            <div className="oc-wrap">
              {tree ? (
                <div className="oc-tree">
                  <OcCard person={tree} />
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'32px',color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>
                  No org chart data yet
                </div>
              )}
            </div>
          )}

          {/* Teams */}
          {tab === 'teams' && (
            <>
              <div className="sec-hdr">
                <span className="sec-hdr-t">Teams</span>
                <button className="sec-more">View all</button>
              </div>
              {teams.length === 0 ? (
                <div style={{color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>No teams yet</div>
              ) : (
                <div className="teams-grid">
                  {teams.map(t => (
                    <div key={t.id} className="team-card">
                      <div className="team-name">{t.name}</div>
                      <div className="team-meta">{(t.members??[]).length} members</div>
                      <div className="team-avs">
                        {(t.members??[]).slice(0,4).map((m: any) => (
                          <div key={m.id} className="team-av" style={{background: m.avatar_color ?? colorFor(m.full_name)}}>
                            {initials(m.full_name)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Offices */}
          {tab === 'offices' && (
            <>
              <div className="sec-hdr">
                <span className="sec-hdr-t">Offices</span>
              </div>
              {offices.length === 0 ? (
                <div style={{color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>No offices yet</div>
              ) : (
                <div className="offices-grid">
                  {offices.map(o => (
                    <div key={o.id} className="office-card">
                      <div className="office-map">📍</div>
                      <div>
                        <div className="office-name">{o.name ?? 'Office'}</div>
                        <div className="office-meta">{o.location ?? '—'}</div>
                        {o.lat != null && (
                          <div className="office-meta" style={{marginTop:2}}>
                            {o.lat.toFixed(4)}, {o.lng?.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Contracts */}
          {tab === 'contracts' && (
            <>
              <div className="sec-hdr">
                <span className="sec-hdr-t">Contract Signals</span>
                <span className="sec-more">{contracts.length} total</span>
              </div>
              {contracts.length === 0 ? (
                <div style={{color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>No contracts yet</div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:0}}>
                  {contracts.map(c => {
                    const typeColor = c.signal_type==='Opportunity' ? 'var(--teal)' : c.signal_type==='Award' ? 'var(--navy)' : 'var(--amber)';
                    const badgeCls = c.signal_type==='Opportunity' ? 'sig-badge-opp' : c.signal_type==='Award' ? 'sig-badge-award' : 'sig-badge-budget';
                    return (
                      <div key={c.id} className="sv-sig-row">
                        <div className="sv-sig-dot" style={{background:typeColor}} />
                        <div className="sv-sig-body">
                          <div className="sv-sig-title">{c.title}</div>
                          <div className="sv-sig-meta-row">
                            <span className={`sig-badge ${badgeCls}`}>{c.signal_type ?? 'Signal'}</span>
                            <span className="sv-sig-val" style={{color:typeColor}}>{fmtMoney(c.value)}</span>
                            {c.award_date && (
                              <span className="sig-deadline">
                                {new Date(c.award_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                              </span>
                            )}
                            <span className="sig-set-aside">{c.source?.replace('_','.')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
