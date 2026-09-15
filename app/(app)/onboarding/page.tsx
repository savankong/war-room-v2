import type { Metadata } from 'next';
import OnboardingClient from './OnboardingClient';

export const metadata: Metadata = {
  title: 'Set up · War Room',
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
