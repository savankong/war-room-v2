import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrgNav from './OrgNav';
import { getOrgProfile, getNavOrgs, getChildOrgs, getOrgPeople, getOrgContracts } from './data';

export const dynamic = 'force-dynamic';

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

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function OrgPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab = 'chart' } = await searchParams;

  const [org, navOrgs, childOrgs, contacts, contracts] = await Promise.all([
    getOrgProfile(slug),
    getNavOrgs(),
    getChildOrgs(slug),
    getOrgPeople(slug),
    getOrgContracts(slug),
  ]);

  if (!org) notFound();

  const color = colorFor(org.name);
  const ini = initials(org.name);

  const TABS = [
    { key: 'chart', label: 'Chart' },
    { key: 'contracts', label: `Contracts (${contracts.length})` },
  ];

  return (
    <div className="org-layout">
      {/* Left nav */}
      <OrgNav orgs={navOrgs} currentId={slug} currentBranch={org.branch} />

      {/* Right detail */}
      <div className="org-detail">
        {/* Breadcrumb */}
        <div className="orgd-sub">
          <Link href="/" className="orgd-back">←</Link>
          <span className="orgd-sname">{org.branch ?? 'Organizations'}</span>
          {org.parent_id && (
            <>
              <span className="orgd-sname" style={{color:'var(--tx4)'}}>›</span>
              <Link href={`/org/${org.parent_id}`} className="orgd-sname" style={{textDecoration:'none'}}>
                {navOrgs.find(o => o.id === org.parent_id)?.name ?? org.parent_id}
              </Link>
            </>
          )}
        </div>

        <div className="org-detail-body">
          {/* Hero */}
          <div className="orgd-hero-top">
            <div style={{width:52,height:52,background:color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Roboto',fontWeight:800,fontSize:15,color:'#fff',flexShrink:0}}>
              {ini}
            </div>
            <div>
              <div className="orgd-title">{org.name}</div>
              <div className="orgd-flw">
                {org.branch && <span style={{marginRight:8}}>{org.branch}</span>}
                {org.badge_text && <span style={{color:'var(--tx4)'}}>{org.badge_text}</span>}
              </div>
            </div>
          </div>

          {org.description && <p className="orgd-desc">{org.description}</p>}

          {/* Meta */}
          <div className="orgd-metas">
            <div className="orgd-meta"><div className="mlbl">HQ</div><div className="mval">{org.hq_address ?? '—'}</div></div>
            <div className="orgd-meta"><div className="mlbl">Contacts</div><div className="mval">{org.contact_count}</div></div>
            <div className="orgd-meta"><div className="mlbl">Child Orgs</div><div className="mval">{childOrgs.length}</div></div>
            <div className="orgd-meta"><div className="mlbl">Contracts</div><div className="mval">{contracts.length}</div></div>
          </div>

          {/* Tabs */}
          <div className="orgd-tabs">
            {TABS.map(t => (
              <a key={t.key} href={`?tab=${t.key}`} className={`orgd-tab${tab===t.key?' on':''}`}>{t.label}</a>
            ))}
          </div>

          {/* Chart tab — top-down hierarchy */}
          {tab === 'chart' && (
            <div className="ohier" style={{paddingTop:24}}>

              {/* Current org contacts */}
              {contacts.length > 0 && (
                <>
                  <div style={{fontSize:10,fontFamily:'IBM Plex Mono',color:'var(--tx4)',letterSpacing:'.08em',marginBottom:8}}>
                    CONTACTS IN THIS ORG ({contacts.length})
                  </div>
                  <div className="oc-contact-row" style={{marginBottom:28}}>
                    {contacts.map(p => {
                      const c = p.avatar_color ?? colorFor(p.full_name);
                      return (
                        <div key={p.id} className="oc-contact-card">
                          <div className="oc-contact-av" style={{background:c}}>{initials(p.full_name)}</div>
                          <div>
                            <div className="oc-contact-name">{p.full_name}</div>
                            {p.role_title && <div className="oc-contact-role">{p.role_title}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Child orgs + their contacts */}
              {childOrgs.length > 0 && (
                <>
                  <div style={{fontSize:10,fontFamily:'IBM Plex Mono',color:'var(--tx4)',letterSpacing:'.08em',marginBottom:12}}>
                    SUBORDINATE ORGANIZATIONS ({childOrgs.length})
                  </div>
                  <div className="ohier-connector"><div className="ohier-vline" /></div>
                  <div className="ohier-row">
                    {childOrgs.map(child => (
                      <Link key={child.id} href={`/org/${child.id}`} className="child-org-card">
                        <div className="child-org-card-name">{child.name}</div>
                        <div className="child-org-card-meta">
                          {child.contact_count > 0 && <span>{child.contact_count} contacts · </span>}
                          {child.contract_count > 0 && <span>{child.contract_count} contracts</span>}
                          {child.contact_count === 0 && child.contract_count === 0 && <span>{child.organization_type ?? '—'}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {contacts.length === 0 && childOrgs.length === 0 && (
                <div style={{color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11,paddingTop:16}}>
                  No chart data yet for this org
                </div>
              )}
            </div>
          )}

          {/* Contracts tab */}
          {tab === 'contracts' && (
            <div style={{paddingTop:16}}>
              {contracts.length === 0 ? (
                <div style={{color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>No contracts linked to this org</div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
