'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <div className="nav-mark">WR</div>
      </Link>
      <Link href="/" className={`nav-link${path === '/' ? ' on' : ''}`}>DISCOVER</Link>
      <Link href="/people" className={`nav-link${path.startsWith('/people') ? ' on' : ''}`}>PEOPLE</Link>
      <Link href="/signals" className={`nav-link${path.startsWith('/signals') ? ' on' : ''}`}>SIGNALS</Link>
      <div className="nav-search">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/><line x1="7.8" y1="7.8" x2="11" y2="11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/></svg>
        <input placeholder="Search orgs, people, signals…" />
      </div>
      <button className="nav-gear">⚙</button>
    </nav>
  );
}
