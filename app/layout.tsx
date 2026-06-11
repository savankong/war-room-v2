import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'War Room',
  description: 'Government contract intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-root">
          <Nav />
          <div className="main">{children}</div>
        </div>
      </body>
    </html>
  );
}
