import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'War Room — Defense Intelligence',
  description: 'The intelligence layer for War and Defense business development.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
