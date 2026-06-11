export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getOrgProfile, getOrgPeople, getOrgTeams, getOrgOffices, getOrgContracts } from './data';
import type { Person } from './data';
import styles from './org.module.css';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function buildTree(people: Person[]): Person & { children: ReturnType<typeof buildTree>[] } | null {
  const map = new Map<string, Person & { children: any[] }>();
  people.forEach((p) => map.set(p.id, { ...p, children: [] }));
  let root: (Person & { children: any[] }) | null = null;
  map.forEach((node) => {
    if (node.manager_id && map.has(node.manager_id)) {
      map.get(node.manager_id)!.children.push(node);
    } else {
      root = node;
    }
  });
  return root;
}

function Avatar({ name, color, url }: { name: string; color?: string | null; url?: string | null }) {
  if (url) return <img src={url} alt={name} className={styles.avatar} />;
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={styles.avatar} style={{ backgroundColor: color ?? '#4f46e5' }}>
      {initials}
    </div>
  );
}

function PersonCard({ person }: { person: Person & { children: any[] } }) {
  return (
    <div className={styles.treeNode}>
      <div className={styles.personCard}>
        <Avatar name={person.full_name} color={person.avatar_color} url={person.avatar_url} />
        <div>
          <div className={styles.personName}>{person.full_name}</div>
          {person.role_title && <div className={styles.personRole}>{person.role_title}</div>}
        </div>
      </div>
      {person.children.length > 0 && (
        <div className={styles.treeChildren}>
          {person.children.map((child: any) => (
            <PersonCard key={child.id} person={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function SignalBadge({ type }: { type: string | null }) {
  const color: Record<string, string> = {
    Award: '#16a34a',
    Opportunity: '#2563eb',
    Budget: '#9333ea',
  };
  return (
    <span className={styles.signalBadge} style={{ backgroundColor: color[type ?? ''] ?? '#6b7280' }}>
      {type ?? '—'}
    </span>
  );
}

function formatMoney(value: number | null) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
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

  const tabs = [
    { key: 'orgchart', label: 'Org Chart' },
    { key: 'teams', label: 'Teams' },
    { key: 'offices', label: 'Offices' },
    { key: 'contracts', label: 'Contracts' },
  ];

  return (
    <main className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.orgLogo}>
              {org.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className={styles.heroName}>
                {org.name}
                {org.badge_text && (
                  <span className={styles.badge} style={{ backgroundColor: org.badge_color ?? '#1e40af' }}>
                    {org.badge_text}
                  </span>
                )}
              </div>
              {org.description && <p className={styles.heroDesc}>{org.description}</p>}
            </div>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.btnFollow}>
              Follow · {org.follower_count.toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className={styles.statRow}>
        <div className={styles.container}>
          {org.sector && <span className={styles.stat}><b>Sector</b> {org.sector}</span>}
          {org.hq_address && <span className={styles.stat}><b>HQ</b> {org.hq_address}</span>}
          {org.personnel_count != null && (
            <span className={styles.stat}><b>Personnel</b> {org.personnel_count.toLocaleString()}</span>
          )}
          <span className={styles.stat}><b>Contacts</b> {org.contact_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <div className={styles.container}>
          {tabs.map((t) => (
            <a
              key={t.key}
              href={`?tab=${t.key}`}
              className={`${styles.tabLink} ${tab === t.key ? styles.tabActive : ''}`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className={styles.container}>
        {/* Org Chart */}
        {tab === 'orgchart' && (
          <div className={styles.tabContent}>
            {tree ? (
              <div className={styles.tree}>
                <PersonCard person={tree} />
              </div>
            ) : (
              <p className={styles.empty}>No org chart data yet.</p>
            )}
          </div>
        )}

        {/* Teams */}
        {tab === 'teams' && (
          <div className={styles.tabContent}>
            {teams.length === 0 ? (
              <p className={styles.empty}>No teams yet.</p>
            ) : (
              <div className={styles.teamGrid}>
                {teams.map((team) => (
                  <div key={team.id} className={styles.teamCard}>
                    <h3 className={styles.teamName}>{team.name}</h3>
                    {team.description && <p className={styles.teamDesc}>{team.description}</p>}
                    <div className={styles.memberList}>
                      {(team.members ?? []).map((m) => (
                        <div key={m.id} className={styles.memberRow}>
                          <Avatar name={m.full_name} color={m.avatar_color} />
                          <div>
                            <div className={styles.memberName}>{m.full_name}</div>
                            {m.role_title && <div className={styles.memberRole}>{m.role_title}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offices */}
        {tab === 'offices' && (
          <div className={styles.tabContent}>
            {offices.length === 0 ? (
              <p className={styles.empty}>No offices yet.</p>
            ) : (
              <div className={styles.officeGrid}>
                {offices.map((office) => (
                  <div key={office.id} className={styles.officeCard}>
                    <h3 className={styles.officeName}>{office.name ?? 'Unnamed Office'}</h3>
                    {office.location && <p className={styles.officeLocation}>{office.location}</p>}
                    {office.lat != null && office.lng != null && (
                      <div className={styles.mapPlaceholder}>
                        📍 {office.lat.toFixed(4)}, {office.lng.toFixed(4)}
                      </div>
                    )}
                    <div className={styles.memberList}>
                      {(office.members ?? []).map((m) => (
                        <div key={m.id} className={styles.memberRow}>
                          <Avatar name={m.full_name} />
                          <div>
                            <div className={styles.memberName}>{m.full_name}</div>
                            {m.role_title && <div className={styles.memberRole}>{m.role_title}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contracts */}
        {tab === 'contracts' && (
          <div className={styles.tabContent}>
            <div className={styles.contractsHeader}>
              <span className={styles.contractCount}>{contracts.length} contract signal{contracts.length !== 1 ? 's' : ''}</span>
            </div>
            {contracts.length === 0 ? (
              <p className={styles.empty}>No contract signals yet.</p>
            ) : (
              <div className={styles.contractList}>
                {contracts.map((c) => (
                  <div key={c.id} className={styles.contractRow}>
                    <div className={styles.contractMain}>
                      <SignalBadge type={c.signal_type} />
                      <span className={styles.contractTitle}>{c.title}</span>
                    </div>
                    <div className={styles.contractMeta}>
                      <span className={styles.contractValue}>{formatMoney(c.value)}</span>
                      {c.award_date && (
                        <span className={styles.contractDate}>
                          {new Date(c.award_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span className={styles.contractSource}>{c.source.replace('_', '.')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
