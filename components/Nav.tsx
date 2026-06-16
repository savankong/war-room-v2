'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AegisMark } from './Aegis';

export default function Nav() {
  const path   = usePathname();
  const router = useRouter();
  const [acctOpen, setAcctOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setAcctOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  /* close mobile menu on nav */
  useEffect(() => { setMobileOpen(false); }, [path]);

  function signOut() {
    localStorage.removeItem('wr_token');
    router.push('/login');
  }

  const isActive = (href: string) =>
    href === '/discover' ? path === '/discover' || path.startsWith('/org') : path.startsWith(href);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          <AegisMark size={28} />
          <span className="nav-wordmark">WAR ROOM</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link href="/discover" className={`nav-link${isActive('/discover') ? ' on' : ''}`}>Discover</Link>
          <Link href="/people"   className={`nav-link${isActive('/people')   ? ' on' : ''}`}>People</Link>
          <Link href="/signals"  className={`nav-link${isActive('/signals')  ? ' on' : ''}`}>Signals</Link>
        </div>

        <div className="nav-right">
          {/* Search — hidden on mobile */}
          <div className="nav-search nav-search-desktop">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
              <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
            </svg>
            <input placeholder="Search orgs, people, signals…" />
          </div>

          {/* Account dropdown */}
          <div className="nav-acct-wrap" ref={dropRef}>
            <button
              className={`nav-icon-btn${acctOpen ? ' active' : ''}`}
              title="Account"
              onClick={() => setAcctOpen(o => !o)}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            {acctOpen && (
              <div className="nav-acct-drop">
                <Link href="/account" className="nav-drop-item" onClick={() => setAcctOpen(false)}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1.5 11.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  My account
                </Link>
                <div className="nav-drop-div" />
                <button className="nav-drop-item nav-drop-signout" onClick={signOut}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11H5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    <path d="M8.5 9L11.5 6.5 8.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="4.5" y1="6.5" x2="11.5" y2="6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>

          <Link href="/admin" className="nav-icon-btn nav-admin-btn" title="Admin" style={{ opacity: .6 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1 1M11.1 11.1l1 1M11.1 2.9l-1 1M3.9 11.1l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            className={`nav-burger${mobileOpen ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-mobile-drawer">
          <div className="nav-mobile-search">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
              <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" opacity=".5"/>
            </svg>
            <input placeholder="Search…" />
          </div>
          <Link href="/discover" className={`nav-mobile-link${isActive('/discover') ? ' on' : ''}`}>Discover</Link>
          <Link href="/people"   className={`nav-mobile-link${isActive('/people')   ? ' on' : ''}`}>People</Link>
          <Link href="/signals"  className={`nav-mobile-link${isActive('/signals')  ? ' on' : ''}`}>Signals</Link>
          <div className="nav-mobile-div" />
          <Link href="/account"  className="nav-mobile-link">My account</Link>
          <Link href="/admin"    className="nav-mobile-link">Admin</Link>
          <button className="nav-mobile-link nav-mobile-signout" onClick={signOut}>Sign out</button>
        </div>
      )}
    </>
  );
}
