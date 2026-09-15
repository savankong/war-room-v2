import type { Metadata } from 'next';
import BriefClient from './BriefClient';

export const metadata: Metadata = {
  title: 'Capture brief · War Room',
};

/** Next 16: dynamic params arrive as a Promise and must be awaited. */
export default async function BriefPage({
  params,
}: {
  params: Promise<{ opportunityId: string }>;
}) {
  const { opportunityId } = await params;
  return <BriefClient opportunityId={opportunityId} />;
}
