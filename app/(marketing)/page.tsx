import Link from 'next/link';
import { AegisMark } from '@/components/Aegis';

export const metadata = {
  title: 'War Room — Defense Intelligence Platform',
  description: 'The intelligence layer for defense business development. Track program offices, contracting signals, and procurement activity across the federal market.',
};

export default function HomePage() {
  return (
    <main className="mkt-main">

      {/* ── HERO ── */}
      <section className="mkt-hero">
        <div className="mkt-hero-bg" aria-hidden="true">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-grid" />
        </div>

        <div className="mkt-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Defense BD Intelligence
          </div>

          <h1 className="mkt-h1">
            Know who controls<br />
            <span className="mkt-h1-accent">the money.</span>
          </h1>

          <p className="mkt-sub">
            War Room maps every program office, contracting officer, and
            active solicitation across the Department of Defense — so your
            BD team always knows where to look and who to call.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="btn-primary-lg">Start for free →</Link>
            <Link href="/features" className="btn-ghost-lg">See how it works</Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-n">575+</div>
              <div className="hero-stat-l">Program offices</div>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <div className="hero-stat-n">6,700+</div>
              <div className="hero-stat-l">Stakeholders mapped</div>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <div className="hero-stat-n">8,100+</div>
              <div className="hero-stat-l">Contract signals</div>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <div className="hero-stat-n">Daily</div>
              <div className="hero-stat-l">SAM.gov sync</div>
            </div>
          </div>
        </div>

        {/* SVG org-chart preview */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-mock">
            <div className="hcm-header">
              <div className="hcm-dot red" /><div className="hcm-dot amber" /><div className="hcm-dot green" />
              <span className="hcm-title">War Room / Discover</span>
            </div>
            <div className="hcm-body">
              <div className="hcm-row hcm-row-top">
                <div className="hcm-org-chip active">Dept of Defense</div>
              </div>
              <div className="hcm-row">
                <div className="hcm-org-chip">Army</div>
                <div className="hcm-org-chip selected">Air Force</div>
                <div className="hcm-org-chip">Navy</div>
              </div>
              <div className="hcm-row">
                <div className="hcm-org-chip sm">AFMC</div>
                <div className="hcm-org-chip sm selected">AFLCMC</div>
                <div className="hcm-org-chip sm">AFDW</div>
                <div className="hcm-org-chip sm">ACC</div>
              </div>
              <div className="hcm-signal-list">
                <div className="hcm-signal">
                  <span className="hcm-sig-badge award">Award</span>
                  <span className="hcm-sig-title">JADC2 Integration Services</span>
                  <span className="hcm-sig-val">$42M</span>
                </div>
                <div className="hcm-signal">
                  <span className="hcm-sig-badge solicit">Solicit</span>
                  <span className="hcm-sig-title">Battle Management C2</span>
                  <span className="hcm-sig-val">$18M</span>
                </div>
                <div className="hcm-signal">
                  <span className="hcm-sig-badge award">Award</span>
                  <span className="hcm-sig-title">F-35 Sustainment IDIQ</span>
                  <span className="hcm-sig-val">$120M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="mkt-2col">
            <div>
              <div className="mkt-eyebrow">The problem</div>
              <h2 className="mkt-h2">Defense BD runs on relationships you can&apos;t see.</h2>
              <p className="mkt-body">
                The DoD spends $400B+ annually across hundreds of program offices,
                thousands of contracting officers, and tens of thousands of active
                solicitations. Most BD teams are flying blind — tracking it all in
                spreadsheets or relying on who-you-know.
              </p>
              <p className="mkt-body">
                War Room is the map. Every org, every key person, every open
                opportunity — connected and searchable in one place.
              </p>
              <Link href="/features" className="btn-mkt-link">See the full platform →</Link>
            </div>
            <div className="mkt-problem-grid">
              {[
                { icon: '⊗', label: 'Scattered across SAM.gov tabs', bad: true },
                { icon: '⊗', label: 'No org-to-person connection',   bad: true },
                { icon: '⊗', label: 'Manual spreadsheet tracking',   bad: true },
                { icon: '✓', label: 'Org hierarchy you can navigate', bad: false },
                { icon: '✓', label: 'People linked to their offices', bad: false },
                { icon: '✓', label: 'Live signals, zero effort',      bad: false },
              ].map((r, i) => (
                <div key={i} className={`mkt-prob-row${r.bad ? ' bad' : ' good'}`}>
                  <span className="mkt-prob-icon">{r.icon}</span>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">The platform</div>
            <h2 className="mkt-h2">Three layers.<br />One system.</h2>
          </div>
          <div className="mkt-feat3">
            <div className="mkt-feat-card">
              <div className="mkt-feat-icon org-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="2" width="6" height="4" rx="1"/><rect x="2" y="10" width="6" height="4" rx="1"/><rect x="9" y="10" width="6" height="4" rx="1"/><rect x="16" y="10" width="6" height="4" rx="1"/><line x1="5" y1="10" x2="12" y2="6"/><line x1="12" y1="6" x2="19" y2="10"/><line x1="12" y1="10" x2="12" y2="6"/></svg>
              </div>
              <div className="mkt-feat-num">/01</div>
              <h3 className="mkt-feat-title">Organizations</h3>
              <p className="mkt-feat-desc">Every PEO, program office, and command with budget authority — structured from Dept of Defense all the way down to individual program offices. Filter by branch, drill into sub-orgs, and see full contract history.</p>
              <div className="mkt-feat-tags">
                <span>575 orgs</span><span>8 service branches</span><span>Full hierarchy</span>
              </div>
            </div>
            <div className="mkt-feat-card">
              <div className="mkt-feat-icon people-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="18" cy="8" r="2.5"/><path d="M15 20c0-2.8 1.8-5 4-5.5"/></svg>
              </div>
              <div className="mkt-feat-num">/02</div>
              <h3 className="mkt-feat-title">Stakeholders</h3>
              <p className="mkt-feat-desc">PEOs, program managers, contracting officers, and industry execs — each linked to their org. See award history, open opportunities, contact info, and LinkedIn in one panel.</p>
              <div className="mkt-feat-tags">
                <span>6,700+ people</span><span>Org-linked</span><span>Contact info</span>
              </div>
            </div>
            <div className="mkt-feat-card">
              <div className="mkt-feat-icon signals-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="mkt-feat-num">/03</div>
              <h3 className="mkt-feat-title">Signals</h3>
              <p className="mkt-feat-desc">Live solicitations, contract awards, and budget changes — pulled from SAM.gov and USASpending daily and automatically linked to the orgs and people already in the system.</p>
              <div className="mkt-feat-tags">
                <span>8,100+ signals</span><span>Daily refresh</span><span>Auto-linked</span>
              </div>
            </div>
          </div>
          <div className="mkt-feat-cta">
            <Link href="/features" className="btn-mkt-ghost">Full feature breakdown →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">How it works</div>
            <h2 className="mkt-h2">From search to pipeline<br />in minutes.</h2>
          </div>
          <div className="mkt-steps">
            {[
              { n: '01', title: 'Find the right office', body: 'Search or browse the org hierarchy. Filter by service branch to navigate from top-level commands down to the specific program office you need.' },
              { n: '02', title: 'Identify the people', body: 'Click into any org to see the PEO, contracting officers, and key stakeholders — with their titles, contact details, and LinkedIn profiles.' },
              { n: '03', title: 'Read the signals', body: 'See every recent award, active solicitation, and procurement signal tied to that office — with value, set-aside type, and NAICS codes.' },
              { n: '04', title: 'Build your pipeline', body: 'Export contact lists and signal data as CSV. Use War Room as the intelligence layer that feeds your CRM and BD strategy.' },
            ].map((s, i) => (
              <div key={i} className="mkt-step">
                <div className="mkt-step-n">{s.n}</div>
                <div>
                  <h3 className="mkt-step-title">{s.title}</h3>
                  <p className="mkt-step-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER STRIP ── */}
      <section className="mkt-founder-strip">
        <div className="mkt-container">
          <div className="mkt-founder-inner">
            <div className="mkt-founder-avatar">SK</div>
            <div className="mkt-founder-copy">
              <p className="mkt-founder-quote">
                &ldquo;I spent years inside the Pentagon. The information was always there —
                it was just locked in silos. War Room is the system I needed but couldn&apos;t find.&rdquo;
              </p>
              <div className="mkt-founder-attr">
                <strong>Savan Kong</strong>
                <span>Founder · DoD&apos;s first Customer Experience Officer</span>
              </div>
            </div>
            <Link href="/about" className="btn-ghost-lg mkt-founder-btn">Our story →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mkt-cta-section">
        <div className="mkt-container">
          <div className="mkt-cta-inner">
            <h2 className="mkt-cta-h">Start mapping the market today.</h2>
            <p className="mkt-cta-sub">Free to start. No credit card required.</p>
            <div className="hero-actions">
              <Link href="/register" className="btn-primary-lg">Create free account →</Link>
              <Link href="/pricing"  className="btn-ghost-lg">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mkt-footer">
        <div className="mkt-container">
          <div className="mkt-footer-top">
            <div className="mkt-footer-brand">
              <AegisMark size={24} />
              <span className="mkt-footer-brandname">WAR ROOM</span>
              <p className="mkt-footer-tagline">Defense intelligence for BD teams.</p>
            </div>
            <div className="mkt-footer-cols">
              <div className="mkt-footer-col">
                <div className="mkt-footer-col-hd">Platform</div>
                <Link href="/features" className="mkt-footer-link">Features</Link>
                <Link href="/pricing"  className="mkt-footer-link">Pricing</Link>
                <Link href="/register" className="mkt-footer-link">Get access</Link>
              </div>
              <div className="mkt-footer-col">
                <div className="mkt-footer-col-hd">Company</div>
                <Link href="/about"   className="mkt-footer-link">About</Link>
                <Link href="/contact" className="mkt-footer-link">Contact</Link>
                <a href="https://www.savankong.com" target="_blank" rel="noreferrer" className="mkt-footer-link">Founder ↗</a>
              </div>
              <div className="mkt-footer-col">
                <div className="mkt-footer-col-hd">Resources</div>
                <a href="https://www.light-lux.com" target="_blank" rel="noreferrer" className="mkt-footer-link">BD Consulting ↗</a>
                <Link href="/discover" className="mkt-footer-link">Enter app →</Link>
              </div>
            </div>
          </div>
          <div className="mkt-footer-bottom">
            <span>© 2026 War Room · Built by Savan Kong</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
