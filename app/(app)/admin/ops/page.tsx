import type { Metadata } from 'next';
import OpsClient from './OpsClient';

export const metadata: Metadata = {
  title: 'Ops · War Room',
  robots: { index: false, follow: false },
};

export default function OpsPage() {
  return <OpsClient />;
}
