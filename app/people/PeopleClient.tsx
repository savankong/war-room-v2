'use client';
import { useState } from 'react';

const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length]; }
function initials(name: string) { return name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase(); }

interface Person {
  id: string; full_name: string; role_title: string | null;
  avatar_color: string | null; avatar_url: string | null;
  org_id: string | null; org_name: string | null; org_slug: string | null;
  org_badge_color: string | null; org_sector: string | null; org_hq: string | null;
}
interface Org {
  id: string; name: string; slug: string; badge_color: string | null;
  badge_text: string | null; sector: string | null; hq_address: string | null;
}

interface Props { people: Person[]; orgs: Org[]; }

export default function PeopleClient({ people, orgs }: Props) {
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState<string|null>(null);
  const [selected, setSelected] = useState<Person|null>(null);
  const [openSecs, setOpenSecs] = useState({ org: true, sector: true, hq: false });

  const sectors = [...new Set(orgs.map(o=>o.sector).filter(Boolean))];
  const hqs = [...new Set(orgs.map(o=>o.hq_address).filter(Boolean))];

  const filtered = people.filter(p => {
    const matchSearch = !search || p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.role_title?.toLowerCase().includes(search.toLowerCase()));
    const matchOrg = !orgFilter || p.org_id === orgFilter;
    return matchSearch && matchOrg;
  });

  const toggleSec = (k: keyof typeof openSecs) =>
    setOpenSecs(s => ({ ...s, [k]: !s[k] }));

  return (
    <div className="pv">
      {/* Sidebar */}
      <div className="pv-sb">
        <div className="sb-search">
          <input
            placeholder="Search people…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
        </div>

        <div className="sb-sec">
          <button className="sb-hdr" onClick={()=>toggleSec('org')}>
            ORGANIZATION
            <span className={`sb-arr${openSecs.org?' open':''}`}>▼</span>
          </button>
          {openSecs.org && (
            <div className="sb-items">
              <button
                className={`sb-item${!orgFilter?' on':''}`}
                onClick={()=>setOrgFilter(null)}
              >
                All <span className="sb-cnt">{people.length}</span>
              </button>
              {orgs.map(o => {
                const cnt = people.filter(p=>p.org_id===o.id).length;
                if (!cnt) return null;
                return (
                  <button
                    key={o.id}
                    className={`sb-item${orgFilter===o.id?' on':''}`}
                    onClick={()=>setOrgFilter(orgFilter===o.id?null:o.id)}
                  >
                    {o.name} <span className="sb-cnt">{cnt}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="sb-sec">
          <button className="sb-hdr" onClick={()=>toggleSec('sector')}>
            SECTOR
            <span className={`sb-arr${openSecs.sector?' open':''}`}>▼</span>
          </button>
          {openSecs.sector && (
            <div className="sb-items">
              {sectors.map(s => (
                <button key={s as string} className="sb-item">
                  {s as string} <span className="sb-cnt">{people.filter(p=>p.org_sector===s).length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="pv-main">
        <div className="pv-bar">
          <span className="pv-cnt"><strong>{filtered.length}</strong> of {people.length} people</span>
          {orgFilter && (
            <span className="pv-chip">
              {orgs.find(o=>o.id===orgFilter)?.name}
              <button className="pv-chip-x" onClick={()=>setOrgFilter(null)}>×</button>
            </span>
          )}
          {search && (
            <span className="pv-chip">
              &ldquo;{search}&rdquo;
              <button className="pv-chip-x" onClick={()=>setSearch('')}>×</button>
            </span>
          )}
        </div>

        <div className="pv-listhdr">
          <div className="lhc">NAME</div>
          <div className="lhc">TITLE</div>
          <div className="lhc">ORGANIZATION</div>
          <div className="lhc"></div>
        </div>

        <div className="pv-scroll">
          {filtered.length === 0 && (
            <div style={{padding:'40px',textAlign:'center',color:'var(--tx4)',fontFamily:'IBM Plex Mono',fontSize:11}}>
              No people found
            </div>
          )}
          {filtered.map(p => {
            const color = p.avatar_color ?? colorFor(p.full_name);
            const orgColor = p.org_badge_color ?? (p.org_name ? colorFor(p.org_name) : '#888');
            return (
              <div
                key={p.id}
                className={`prow${selected?.id===p.id?' on':''}`}
                onClick={()=>setSelected(selected?.id===p.id?null:p)}
              >
                <div className="p-cell">
                  <div className="p-av" style={{width:34,height:34,background:color,fontSize:11}}>
                    {p.avatar_url
                      ? <img src={p.avatar_url} alt={p.full_name} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
                      : initials(p.full_name)
                    }
                  </div>
                  <div>
                    <div className="p-name">{p.full_name}</div>
                    <div className="p-email" style={{color:'var(--tx4)'}}>
                      {p.full_name.toLowerCase().replace(/\s+/,'.')}@dod.gov
                    </div>
                  </div>
                </div>
                <div className="p-title">{p.role_title ?? '—'}</div>
                <div className="p-org">
                  {p.org_name && (
                    <>
                      <div className="p-obadge" style={{width:18,height:18,background:orgColor}}>
                        {initials(p.org_name)}
                      </div>
                      <span className="p-oname">{p.org_name}</span>
                    </>
                  )}
                </div>
                <div>
                  <button className="btn-contact">✉ Contact</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Person side panel */}
      {selected && (
        <div className="pp-overlay">
          <div className="pp-bg" onClick={()=>setSelected(null)} />
          <div className="pp">
            <div className="pp-hdr">
              <div className="pp-hav" style={{
                width:48,height:48,
                background: selected.avatar_color ?? colorFor(selected.full_name),
                fontSize:14
              }}>
                {initials(selected.full_name)}
              </div>
              <div>
                <div className="pp-hname">{selected.full_name}</div>
                <div className="pp-httl">{selected.role_title ?? 'No title'}</div>
              </div>
              <button className="pp-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="pp-body">
              <button className="pp-cbtn">✉ Send Message</button>
              <div className="pp-bio">
                {selected.full_name} serves as {selected.role_title ?? 'a member'} at{' '}
                {selected.org_name ?? 'their organization'}.
                {selected.org_hq ? ` Based in ${selected.org_hq}.` : ''}
              </div>
              <div className="pp-div" />
              <div className="pp-sec">
                <span className="pp-sec-t">Organization</span>
              </div>
              {selected.org_name && (
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:'1px solid var(--bg4)',background:'var(--bg3)'}}>
                  <div style={{
                    width:32,height:32,borderRadius:'50%',
                    background: selected.org_badge_color ?? colorFor(selected.org_name),
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontFamily:'Roboto',fontSize:9,fontWeight:800,color:'#fff'
                  }}>
                    {initials(selected.org_name)}
                  </div>
                  <div>
                    <div style={{fontFamily:'Roboto',fontSize:13,fontWeight:700}}>{selected.org_name}</div>
                    <div style={{fontFamily:'IBM Plex Mono',fontSize:10,color:'var(--tx4)'}}>
                      {selected.org_sector ?? 'Government'}{selected.org_hq ? ` · ${selected.org_hq}` : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
