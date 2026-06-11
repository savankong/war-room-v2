'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',         label: 'DISCOVER' },
  { href: '/people',   label: 'PEOPLE'   },
  { href: '/signals',  label: 'SIGNALS'  },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">WR<span> · War Room</span></Link>
      <div className="nav-links">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${path === href ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
