'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { OrgProfile, NavOrg, ChildOrg, Contact, Contract } from './data';

/* ── helpers ─────────────────────────────────────────────────────────── */
const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(n: string) { return COLORS[Math.abs(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % COLORS.length]; }
function initials(n: string) { return n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function fmtMoney(v: number|null) {
  if (!v) return '—';
  if (v>=1e9) return `$${(v/1e9).toFixed(1)}B`;
  if (v>=1e6) return `$${(v/1e6).toFixed(1)}M`;
  if (v>=1e3) return `$${(v/1e3).toFixed(0)}K`;
  return `$${v}`;
}

const TIER_LABELS: Record<number, string> = {
  1: 'Principal Leadership',
  2: 'Deputy / Chief of Staff',
  3: 'Under Secretary / Director',
  4: 'Assistant Secretary',
  5: 'Deputy Assistant Secretary',
  6: 'Senior Advisors',
  7: 'Directors',
  8: 'Deputy Directors',
  9: 'Associate Directors',
  10: 'Program Managers',
  11: 'Contracting Officers',
};

function generateBio(c: Contact, orgName: string): string {
  const t = c.title ?? 'official';
  const o = c.org_full ?? orgName;
  const tier = c.hierarchy_order ?? 10;
  if (tier === 1) return `${c.name} serves as ${t}, overseeing all operations of the ${o}. As the principal leader, they are responsible for policy direction, resource allocation, and strategic planning.`;
  if (tier === 2) return `${c.name} serves as ${t} of the ${o}, supporting the principal in day-to-day operations and leading key initiatives across the organization.`;
  if (tier <= 4) return `${c.name} serves as ${t} within the ${o}, providing senior leadership across their portfolio and advising the principal staff on policy and operations.`;
  return `${c.name} serves as ${t} within the ${o}.`;
}

/* ── Person panel ─────────────────────────────────────────────────────── */
function PersonPanel({ contact, org, allContacts, onClose }: {
  contact: Contact; org: OrgProfile; allContacts: Contact[]; onClose: () => void;
}) {
  const bg = contact.avatar_color ?? colorFor(contact.name);
  const tier = contact.hierarchy_order ?? 10;
  const tierLabel = TIER_LABELS[tier] ?? `Tier ${tier}`;
  const above = allContacts.filter(c => (c.hierarchy_order ?? 99) === tier - 1).slice(0, 3);
  const below = allContacts.filter(c => (c.hierarchy_order ?? 99) === tier + 1).slice(0, 4);

  return (
    <>
      <div className="person-panel-overlay" onClick={onClose} />
      <div className="person-panel">
        <div className="pp-header">
          <div style={{
            width:52,height:52,borderRadius:'50%',background:bg,flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:17,fontWeight:700,color:'#fff',overflow:'hidden',
          }}>
            {contact.photo_url
              ? <img src={contact.photo_url} alt={contact.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              : initials(contact.name)}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="pp-hname">{contact.name}</div>
            <div className="pp-httl">{contact.title ?? '—'}</div>
          </div>
          <button className="pp-close" onClick={onClose}>✕</button>
        </div>

        {contact.email ? (
          <a href={`mailto:${contact.email}`} className="pp-cbtn" style={{textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            ✉ Contact
          </a>
        ) : (
          <div className="pp-cbtn" style={{cursor:'default',opacity:.45}}>✉ Contact</div>
        )}

        <p className="pp-bio">{generateBio(contact, org.name)}</p>
        <div className="pp-div" />

        <div style={{padding:'0 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <span className="pp-sec-t">Org chart</span>
            <Link href={`/org/${contact.org_id}`} className="pp-sec-m">View org →</Link>
          </div>
          <div className="pp-oc-org">
            <div className="pp-oc-orgmark" style={{background:colorFor(org.name)}}>{initials(org.name)}</div>
            <span className="pp-oc-orgname">{org.name}</span>
          </div>
          <div className="pp-oc-vline" />
          {above.length > 0 && (
            <>
              <div className="pp-oc-row">
                {above.map(c => (
                  <div key={c.id} className="pp-oc-card" style={{opacity:.65}}>
                    <div className="pp-oc-av" style={{background:c.avatar_color??colorFor(c.name)}}>{initials(c.name)}</div>
                    <div className="pp-oc-name">{c.name}</div>
                    <div className="pp-oc-role">{c.title}</div>
                  </div>
                ))}
              </div>
              <div className="pp-oc-vline" />
            </>
          )}
          <div className="pp-oc-row">
            <div className="pp-oc-card active">
              <div className="pp-oc-av" style={{background:bg}}>{initials(contact.name)}</div>
              <div className="pp-oc-name">{contact.name}</div>
              <div className="pp-oc-role">{contact.title}</div>
            </div>
          </div>
          {below.length > 0 && (
            <>
              <div className="pp-oc-vline" />
              <div className="pp-oc-row">
                {below.map(c => (
                  <div key={c.id} className="pp-oc-card" style={{opacity:.65}}>
                    <div className="pp-oc-av" style={{background:c.avatar_color??colorFor(c.name)}}>{initials(c.name)}</div>
                    <div className="pp-oc-name">{c.name}</div>
                    <div className="pp-oc-role">{c.title}</div>
                  </div>
                ))}
                {below.length === 4 && (
                  <div className="pp-oc-card" style={{opacity:.4,justifyContent:'center'}}>
                    <span style={{fontSize:11,fontFamily:'IBM Plex Mono',color:'var(--ink-3)'}}>+more</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="pp-div" />
        <div style={{padding:'0 20px 24px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <span className="pp-sec-t">Position</span>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span className="pp-tag">{tierLabel}</span>
            {contact.tags?.map((t,i) => <span key={i} className="pp-tag">{t}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tier-box org chart ──────────────────────────────────────────────── */
const CARDS_PER_TIER = 8;

function OrgChartBroad({ contacts, onSelect }: { contacts: Contact[]; onSelect: (c: Contact) => void }) {
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set());

  const levelMap = new Map<number, Contact[]>();
  for (const c of contacts) {
    const lvl = c.hierarchy_order ?? 10;
    if (lvl >= 11) continue;
    if (!levelMap.has(lvl)) levelMap.set(lvl, []);
    levelMap.get(lvl)!.push(c);
  }
  const levels = Array.from(levelMap.entries()).sort((a, b) => a[0] - b[0]);
  if (levels.length === 0) return <div className="oc-empty">No contacts found for this org</div>;

  const [topTier, topMembers] = levels[0];
  const remainingLevels = levels.slice(1);

  const toggleExpand = (tier: number) => {
    setExpandedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) next.delete(tier); else next.add(tier);
      return next;
    });
  };

  return (
    <div className="wr-broad">
      {/* Root card(s) — tier 1 */}
      <div className="wr-broad-root">
        {topMembers.map(c => {
          const bg = c.avatar_color ?? colorFor(c.name);
          return (
            <div key={c.id} className="wr-node-root" onClick={() => onSelect(c)}>
              <span className="rk">T{topTier}</span>
              <div className="ava" style={{background:bg}}>
                {c.photo_url
                  ? <img src={c.photo_url} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : initials(c.name)}
              </div>
              <div className="nm">{c.name}</div>
              {c.title && <div className="rl">{c.title}</div>}
            </div>
          );
        })}
      </div>

      {/* Remaining tiers as boxes */}
      {remainingLevels.map(([tier, members]) => {
        const isExpanded = expandedTiers.has(tier);
        const shown = isExpanded ? members : members.slice(0, CARDS_PER_TIER);
        const overflow = members.length - shown.length;
        const label = TIER_LABELS[tier] ?? `Tier ${tier}`;

        return (
          <div key={tier} style={{width:'100%'}}>
            <div className="wr-stem" />
            <div className="wr-tierbox">
              <div className="wr-tierhead">
                <span className="dot" />
                <span className="tl">{label}</span>
                <span className="tc">{members.length} {members.length === 1 ? 'person' : 'people'}</span>
                {members.length > CARDS_PER_TIER && (
                  <button className="more-link" onClick={() => toggleExpand(tier)}>
                    {isExpanded ? 'Show less ↑' : `View all →`}
                  </button>
                )}
              </div>
              <div className="wr-grid">
                {shown.map(c => {
                  const bg = c.avatar_color ?? colorFor(c.name);
                  return (
                    <div key={c.id} className="wr-cc" onClick={() => onSelect(c)}>
                      <span className="rk">T{tier}</span>
                      <div className="ava" style={{background:bg}}>
                        {c.photo_url
                          ? <img src={c.photo_url} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          : initials(c.name)}
                      </div>
                      <div className="nm">{c.name}</div>
                      {c.title && <div className="rl">{c.title}</div>}
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <div className="wr-more" onClick={() => toggleExpand(tier)}>
                    <b>+{overflow}</b>
                    <span>more</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
interface Props {
  org: OrgProfile;
  navOrgs: NavOrg[];
  childOrgs: ChildOrg[];
  contacts: Contact[];
  contracts: Contract[];
  tab: string;
}

export default function OrgDetail({ org, navOrgs, childOrgs, contacts, contracts, tab: initialTab }: Props) {
  const [tab, setTab] = useState(initialTab);
  const [panel, setPanel] = useState<Contact | null>(null);

  const color = colorFor(org.name);
  const ini = initials(org.name);

  const TABS = [
    { key: 'chart', label: 'Chart' },
    { key: 'contracts', label: 'Contracts', count: contracts.length },
  ];

  return (
    <>
      <div className="org-detail">
        {/* Breadcrumb */}
        <div className="orgd-sub">
          <Link href="/" className="orgd-back">←</Link>
          {(() => {
            const crumbs: { id: string; name: string }[] = [];
            let pid = org.parent_id;
            const navMap = new Map(navOrgs.map(o => [o.id, o]));
            while (pid && crumbs.length < 3) {
              const p = navMap.get(pid);
              if (!p) break;
              crumbs.unshift({ id: p.id, name: p.name });
              pid = p.parent_id;
            }
            return crumbs.map(c => (
              <span key={c.id} style={{display:'flex',alignItems:'center',gap:4}}>
                <span className="orgd-sname" style={{color:'var(--ink-3)'}}>›</span>
                <Link href={`/org/${c.id}`} className="orgd-sname" style={{textDecoration:'none',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {c.name}
                </Link>
              </span>
            ));
          })()}
          {org.abs_hierarchy_level != null && (
            <span className="orgd-level-badge">L{org.abs_hierarchy_level}</span>
          )}
        </div>

        <div className="org-detail-body">
          {/* Hero */}
          <div className="orgd-hero-top">
            <div
              className="orgd-orgmark"
              style={{background:color}}
            >{ini}</div>
            <div style={{flex:1,minWidth:0}}>
              {org.branch && <div className="orgd-type">{org.branch}</div>}
              <div className="orgd-title">{org.name}</div>
              {org.description && <p className="orgd-desc">{org.description}</p>}
            </div>
          </div>

          {/* Stats strip */}
          <div className="orgd-metas">
            <div className="orgd-meta">
              <div className="mlbl">HQ</div>
              <div className="mval sm">{org.hq_address ?? '—'}</div>
            </div>
            <div className="orgd-meta">
              <div className="mlbl">DoD Level</div>
              <div className="mval">{org.abs_hierarchy_level != null ? `L${org.abs_hierarchy_level}` : '—'}</div>
            </div>
            <div className="orgd-meta">
              <div className="mlbl">Contacts</div>
              <div className="mval">{org.contact_count}</div>
            </div>
            <div className="orgd-meta">
              <div className="mlbl">Sub-orgs</div>
              <div className="mval">{childOrgs.length}</div>
            </div>
            <div className="orgd-meta">
              <div className="mlbl">Contracts</div>
              <div className="mval">{contracts.length}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="orgd-tabs">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`orgd-tab${tab===t.key?' on':''}`}>
                {t.label}{t.count !== undefined && t.count > 0 ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>

          {/* Chart tab */}
          {tab === 'chart' && (
            <div className="oc-chart-wrap">
              <OrgChartBroad contacts={contacts} onSelect={setPanel} />

              {childOrgs.length > 0 && (
                <div className="child-orgs-section">
                  <div className="child-orgs-label">SUBORDINATE ORGANIZATIONS ({childOrgs.length})</div>
                  <div className="ohier-row">
                    {childOrgs.map(child => (
                      <Link key={child.id} href={`/org/${child.id}`} className="child-org-card">
                        <div className="child-org-card-name">{child.name}</div>
                        <div className="child-org-card-meta">
                          {child.contact_count > 0 && <span>{child.contact_count} contacts</span>}
                          {child.contact_count > 0 && child.contract_count > 0 && <span> · </span>}
                          {child.contract_count > 0 && <span>{child.contract_count} contracts</span>}
                          {child.contact_count === 0 && child.contract_count === 0 && <span>{child.organization_type ?? '—'}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contracts tab */}
          {tab === 'contracts' && (
            <div style={{paddingTop:16}}>
              {contracts.length === 0 ? (
                <div className="oc-empty">No contracts linked to this org</div>
              ) : (
                <div style={{display:'flex',flexDirection:'column'}}>
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
            </div>
          )}
        </div>
      </div>

      {panel && (
        <PersonPanel
          contact={panel}
          org={org}
          allContacts={contacts}
          onClose={() => setPanel(null)}
        />
      )}
    </>
  );
}
