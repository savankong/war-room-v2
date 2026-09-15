import type { Metadata } from 'next';
import TodayClient from './TodayClient';

export const metadata: Metadata = {
  title: 'Today · War Room',
  description: 'Ranked DoD opportunities worth your attention.',
};

export default function TodayPage() {
  return <TodayClient />;
}
