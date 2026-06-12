'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <div className="nav-mark">WR</div>
        <span className="nav-wordmark">War Room</span>
      </Link>
      <div className="nav-links">
        <Link href="/" className={`nav-link${path === '/' ? ' on' : ''}`}>Discover</Link>
        <Link href="/people" className={`nav-link${path.startsWith('/people') ? ' on' : ''}`}>People</Link>
        <Link href="/signals" className={`nav-link${path.startsWith('/signals') ? ' on' : ''}`}>Signals</Link>
      </div>
      <div className="nav-right">
        <div className="nav-search">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
            <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
          </svg>
          <input placeholder="Search orgs, people, signals…" />
        </div>
        <Link href="/admin" className="nav-icon-btn" title="Admin" style={{opacity:.7}}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1 1M11.1 11.1l1 1M11.1 2.9l-1 1M3.9 11.1l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </Link>
      </div>
    </nav>
  );
}
