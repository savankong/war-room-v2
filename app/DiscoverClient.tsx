'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COLORS = ['#283a6b','#c8502d','#2f8676','#e0a32e','#7c4dbc','#1d6b8a'];
function colorFor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length]; }
function initials(name: string) { return name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase(); }

interface Org {
  id: string; name: string; slug: string;
  badge_text: string | null; badge_color: string | null;
  description: string | null; sector: string | null;
  hq_address: string | null;
  contact_count: number; follower_count: number;
}

const SECTORS_GOV = ['All','Space Force','Air Force','Army','Navy','Marines','DHS','IC'];
const SECTORS_IND = ['All','Defense','Aerospace','Cyber','Tech','Logistics','Intel'];

export default function DiscoverClient({ orgs }: { orgs: Org[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'gov'|'ind'>('gov');
  const [sector, setSector] = useState('All');
  const [search, setSearch] = useState('');

  const sectors = tab === 'gov' ? SECTORS_GOV : SECTORS_IND;

  const filtered = orgs.filter(o => {
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const avatarColors = ['#283a6b','#c8502d','#2f8676','#e0a32e'];

  return (
    <div className="disc">
      <div className="disc-tabs">
        <button className={`disc-tab${tab==='gov'?' on':''}`} onClick={()=>setTab('gov')}>
          GOV ORGANIZATIONS
        </button>
        <button className={`disc-tab${tab==='ind'?' on':''}`} onClick={()=>setTab('ind')}>
          INDUSTRY ORGANIZATIONS
        </button>
      </div>
      <div className="disc-filters">
        <select className="disc-sel" value={sector} onChange={e=>setSector(e.target.value)}>
          {sectors.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="disc-sel">
          <option>All Locations</option>
          <option>DC Metro</option>
          <option>Colorado</option>
          <option>San Diego</option>
        </select>
        <select className="disc-sel">
          <option>Sort: Followers</option>
          <option>Sort: Name</option>
          <option>Sort: Signals</option>
        </select>
        <input
          className="disc-sinput"
          placeholder="Search organizations…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>
      <div className="disc-grid">
        {filtered.length === 0 && (
          <div style={{gridColumn:'1/-1',padding:'40px',textAlign:'center',color:'var(--tx4)',fontFamily:'IBM Plex Mono'}}>
            No organizations yet — run the ingest pipeline to populate data.
          </div>
        )}
        {filtered.map(org => {
          const color = org.badge_color ?? colorFor(org.name);
          const ini = initials(org.name);
          const fakeAvatars = avatarColors.slice(0, Math.min(3, org.contact_count || 0));
          return (
            <div key={org.id} className="ocard" onClick={()=>router.push(`/org/${org.slug}`)}>
              <div className="ocard-top">
                <div className="ocard-icon" style={{width:44,height:44,background:color,fontSize:13}}>
                  {ini}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="ocard-name">{org.name}</div>
                  <div className="ocard-subs">
                    {org.badge_text ?? org.sector ?? 'Government'} · {org.hq_address ?? 'USA'}
                  </div>
                </div>
              </div>
              <div className="ocard-desc">
                {org.description ?? 'No description available.'}
              </div>
              <div className="ocard-foot">
                <div className="ocard-avs">
                  {fakeAvatars.map((c,i)=>(
                    <div key={i} className="ocard-av" style={{background:c}}>
                      {String.fromCharCode(65+i)}
                    </div>
                  ))}
                </div>
                <span className="ocard-cnt">
                  {org.contact_count} contact{org.contact_count!==1?'s':''} · {org.follower_count} following
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
