'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AegisMark } from './Aegis';

export default function MarketingNav() {
  const path = usePathname();
  const isAuth = path === '/login' || path === '/register' || path === '/forgot-password';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="mkt-nav">
      <Link href="/" className="mlogo" onClick={() => setMenuOpen(false)}>
        <AegisMark size={28} />
        <span className="mlogo-text">WAR ROOM</span>
      </Link>

      {!isAuth && (
        <>
          <nav className="mnav-links">
            <Link href="/features" className={`mnav-link${path === '/features' ? ' active' : ''}`}>Features</Link>
            <Link href="/pricing"  className={`mnav-link${path === '/pricing'  ? ' active' : ''}`}>Pricing</Link>
            <Link href="/about"    className={`mnav-link${path === '/about'    ? ' active' : ''}`}>About</Link>
            <Link href="/contact"  className={`mnav-link${path === '/contact'  ? ' active' : ''}`}>Contact</Link>
          </nav>
          <div className="mnav-right">
            <Link href="/login"    className="btn-mkt-ghost">Sign in</Link>
            <Link href="/register" className="btn-mkt-fill">Get access →</Link>
          </div>
          <button className="mnav-burger" aria-label="Toggle menu" onClick={() => setMenuOpen(o => !o)}>
            <span className={menuOpen ? 'open' : ''} /><span className={menuOpen ? 'open' : ''} /><span className={menuOpen ? 'open' : ''} />
          </button>
        </>
      )}

      {isAuth && (
        <div className="mnav-right">
          <Link href="/" className="mnav-link">← Home</Link>
        </div>
      )}

      {menuOpen && !isAuth && (
        <div className="mnav-drawer">
          <Link href="/features" className="mnav-drawer-link" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link href="/pricing"  className="mnav-drawer-link" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link href="/about"    className="mnav-drawer-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/contact"  className="mnav-drawer-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          <div className="mnav-drawer-btns">
            <Link href="/login"    className="btn-mkt-ghost" onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link href="/register" className="btn-mkt-fill"  onClick={() => setMenuOpen(false)}>Get access →</Link>
          </div>
        </div>
      )}
    </header>
  );
}
