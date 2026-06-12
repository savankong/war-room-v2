import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrgNav from './OrgNav';
import OrgDetail from './OrgDetail';
import { getOrgProfile, getNavOrgs, getChildOrgs, getOrgContacts, getOrgContracts } from './data';

export const revalidate = 3600;

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
    getOrgContacts(slug),
    getOrgContracts(slug),
  ]);

  if (!org) notFound();

  return (
    <div className="org-layout">
      <OrgNav orgs={navOrgs} currentId={slug} currentBranch={org.branch} />
      <OrgDetail
        org={org}
        navOrgs={navOrgs}
        childOrgs={childOrgs}
        contacts={contacts}
        contracts={contracts}
        tab={tab}
      />
    </div>
  );
}
