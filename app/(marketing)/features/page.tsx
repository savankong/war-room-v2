import Link from 'next/link';
import { AegisMark } from '@/components/Aegis';

export const metadata = {
  title: 'Features — War Room',
  description: 'Explore War Room\'s defense intelligence platform: org hierarchy, stakeholders, budget flow, and industry intelligence on primes and subs.',
};

export default function FeaturesPage() {
  return (
    <main className="mkt-main">

      {/* ── PAGE HERO ── */}
      <section className="page-hero">
        <div className="mkt-container">
          <div className="mkt-eyebrow">The platform</div>
          <h1 className="page-h1">Intelligence that follows<br /><span className="mkt-h1-accent">the money.</span></h1>
          <p className="page-sub">From the President&apos;s Budget all the way to who&apos;s cashing the check — War Room maps the entire defense spending chain.</p>
        </div>
      </section>

      {/* ── BUDGET FLOW ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">Budget intelligence</div>
            <h2 className="mkt-h2">Follow the money from<br />P-1 to purchase order.</h2>
            <p className="page-sub" style={{ marginTop: 16 }}>
              The DoD&apos;s $850B+ budget starts as a line item in Congress and flows down through layers of commands, program offices, and contracting vehicles. War Room makes every layer visible.
            </p>
          </div>

          <div className="budget-flow">
            {[
              {
                level: 'L1',
                label: 'President\'s Budget (P-1)',
                desc: 'Congressional appropriations by Title: RDT&E, Procurement, O&M, MILCON. The top-line authorization that defines what each service branch can spend.',
                color: '#c8502d',
                icon: '🏛',
              },
              {
                level: 'L2',
                label: 'Service Branch Allocation',
                desc: 'Army, Navy, Air Force, Marines, Space Force, Coast Guard, SOCOM, and DARPA each receive their slice. War Room tracks all 8 branches.',
                color: '#283a6b',
                icon: '⭐',
              },
              {
                level: 'L3',
                label: 'Major Commands (MAJCOMs)',
                desc: 'Commands like AFMC, FORSCOM, NAVSEA receive funding authorizations. Each major command controls billions in program spending.',
                color: '#2f6b5a',
                icon: '🎯',
              },
              {
                level: 'L4',
                label: 'Program Executive Offices (PEOs)',
                desc: 'PEOs own the acquisition programs. The PEO signs the contracts, controls the budget, and sets requirements. Knowing the PEO is the first step in every BD strategy.',
                color: '#6b4a28',
                icon: '👤',
              },
              {
                level: 'L5',
                label: 'Program Offices & Contracting',
                desc: 'Individual program managers and contracting officers execute the spend. This is where solicitations are issued, awards are made, and relationships are built.',
                color: '#2f3d6b',
                icon: '📋',
              },
              {
                level: 'L6',
                label: 'Prime Contractors → Subs',
                desc: 'Primes receive contract awards and flow funding to subcontractors. War Room tracks who\'s winning, how much, and who they\'re teaming with.',
                color: '#4a2f6b',
                icon: '🏢',
              },
            ].map((step, i) => (
              <div key={i} className="budget-step">
                <div className="budget-step-connector" style={{ background: step.color }} />
                <div className="budget-step-body">
                  <div className="budget-step-level" style={{ color: step.color }}>{step.level}</div>
                  <div className="budget-step-icon">{step.icon}</div>
                  <div className="budget-step-label">{step.label}</div>
                  <p className="budget-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="budget-callout">
            <div className="budget-callout-inner">
              <div className="budget-callout-stat">$850B+</div>
              <div className="budget-callout-label">DoD annual budget tracked</div>
              <div className="budget-callout-stat">6 levels</div>
              <div className="budget-callout-label">from appropriation to award</div>
              <div className="budget-callout-stat">Daily</div>
              <div className="budget-callout-label">SAM.gov & USASpending sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT ORGS ── */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div className="feat-detail">
            <div className="feat-detail-copy">
              <div className="feat-tag org-tag">/01 Government Organizations</div>
              <h2 className="mkt-h2">Every office with<br />budget authority.</h2>
              <p className="mkt-body">
                575+ government organizations structured from the top of the
                Department of Defense down to individual program offices and
                innovation units. See how much each org controls and what they&apos;re actively buying.
              </p>
              <ul className="feat-list">
                <li>Drill from DoD → Service Branch → MAJCOM → PEO → Program Office</li>
                <li>Filter by service branch across all 8 branches</li>
                <li>Full contract award history and open solicitations per org</li>
                <li>View all stakeholders assigned to each office</li>
                <li>Organization type badges: PEO, MAJCOM, Innovation Unit, FFRDC, and more</li>
                <li>Spend-down tracking — how much has been awarded vs. what&apos;s remaining</li>
              </ul>
            </div>
            <div className="feat-detail-visual">
              <div className="feat-mock-card">
                <div className="fmc-hd">
                  <div className="fmc-badge">Air Force</div>
                  <div className="fmc-name">Air Force Life Cycle Management Center</div>
                  <div className="fmc-sub">AFLCMC · Wright-Patterson AFB, OH</div>
                </div>
                <div className="fmc-stats">
                  <div className="fmc-stat"><span>12</span>Sub-orgs</div>
                  <div className="fmc-stat"><span>847</span>Contracts</div>
                  <div className="fmc-stat"><span>134</span>People</div>
                </div>
                <div className="fmc-budget-bar-wrap">
                  <div className="fmc-budget-bar-label">
                    <span>FY26 Obligated</span>
                    <span style={{ color: '#2f8676' }}>$2.4B of $3.1B</span>
                  </div>
                  <div className="fmc-budget-bar-bg">
                    <div className="fmc-budget-bar-fill" style={{ width: '77%' }} />
                  </div>
                  <div className="fmc-budget-bar-label" style={{ marginTop: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>Remaining</span>
                    <span style={{ color: '#e0a32e', fontWeight: 700 }}>$700M to spend down</span>
                  </div>
                </div>
                <div className="fmc-children">
                  {['PEO Digital', 'PEO Fighters', 'PEO Tankers', 'AFWERX'].map(c => (
                    <div key={c} className="fmc-child-chip">{c}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PEOPLE ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="feat-detail feat-detail-rev">
            <div className="feat-detail-copy">
              <div className="feat-tag people-tag">/02 Government Stakeholders</div>
              <h2 className="mkt-h2">Know the people<br />behind the programs.</h2>
              <p className="mkt-body">
                6,700+ government stakeholders — each linked to their organization,
                their awards, and their open opportunities. Know who controls the program,
                who signs the contracts, and who needs to know your company exists.
              </p>
              <ul className="feat-list">
                <li>PEOs, program managers, contracting officers, and technical directors</li>
                <li>Contact info: email, phone, and LinkedIn profiles</li>
                <li>Award history per person — what they&apos;ve signed and for how much</li>
                <li>Open opportunities linked to each decision-maker</li>
                <li>Hierarchy order within their org (who reports to who)</li>
              </ul>
            </div>
            <div className="feat-detail-visual">
              <div className="feat-mock-card">
                <div className="fmc-person">
                  <div className="fmc-avatar" style={{ background: '#c8502d' }}>JD</div>
                  <div>
                    <div className="fmc-person-name">Col. Jane D.</div>
                    <div className="fmc-person-title">Program Executive Officer, Digital</div>
                    <div className="fmc-person-org">AFLCMC · Air Force</div>
                  </div>
                </div>
                <div className="fmc-contact-row">
                  <span className="fmc-contact-item">✉ j.doe@us.af.mil</span>
                  <span className="fmc-contact-item">📞 (937) 255-xxxx</span>
                </div>
                <div className="fmc-stats" style={{ marginTop: 16 }}>
                  <div className="fmc-stat"><span>$340M</span>Awarded</div>
                  <div className="fmc-stat"><span>3</span>Open RFPs</div>
                  <div className="fmc-stat"><span>14</span>Contracts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRY INTELLIGENCE ── */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">Industry intelligence</div>
            <h2 className="mkt-h2">See who&apos;s winning —<br />and who they&apos;re bringing.</h2>
            <p className="page-sub" style={{ marginTop: 16 }}>
              War Room doesn&apos;t just show government buyers. It maps the full industry side —
              prime contractors, their subcontractors, and the executives driving those relationships.
            </p>
          </div>

          <div className="industry-grid">
            <div className="industry-card prime-card">
              <div className="industry-card-tag">Prime Contractors</div>
              <h3 className="industry-card-h">The companies<br />cashing the biggest checks.</h3>
              <p className="industry-card-body">
                See which primes dominate each program office — by total obligated dollars,
                number of awards, and contract vehicles held. Know who the incumbent is
                before you walk into any BD meeting.
              </p>
              <div className="industry-prime-list">
                {[
                  { name: 'Lockheed Martin', val: '$18.2B', awards: 847 },
                  { name: 'Raytheon Technologies', val: '$12.4B', awards: 623 },
                  { name: 'Northrop Grumman', val: '$9.8B', awards: 441 },
                  { name: 'L3 Harris Technologies', val: '$6.1B', awards: 312 },
                ].map((p, i) => (
                  <div key={i} className="industry-prime-row">
                    <div className="industry-prime-rank">#{i + 1}</div>
                    <div className="industry-prime-name">{p.name}</div>
                    <div className="industry-prime-val">{p.val}</div>
                    <div className="industry-prime-awards">{p.awards} awards</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="industry-card sub-card">
              <div className="industry-card-tag">Subcontractors</div>
              <h3 className="industry-card-h">Follow the money<br />past the prime.</h3>
              <p className="industry-card-body">
                Federal law requires primes to report subcontract awards over $30K.
                War Room surfaces that data — so you can see who&apos;s teaming with whom,
                what the sub-tier market looks like, and where partnership opportunities exist.
              </p>
              <div className="industry-sub-list">
                {[
                  { prime: 'Lockheed Martin', sub: 'DXC Technology', val: '$42M', naics: '541512' },
                  { prime: 'Raytheon', sub: 'Parsons Corp', val: '$28M', naics: '541330' },
                  { prime: 'Booz Allen', sub: 'Peraton', val: '$19M', naics: '541519' },
                ].map((s, i) => (
                  <div key={i} className="industry-sub-row">
                    <div className="industry-sub-prime">{s.prime} →</div>
                    <div className="industry-sub-name">{s.sub}</div>
                    <div className="industry-sub-val">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="industry-card exec-card">
              <div className="industry-card-tag">Industry Executives</div>
              <h3 className="industry-card-h">The BD leads &amp; capture<br />managers who matter.</h3>
              <p className="industry-card-body">
                Beyond government contacts, War Room tracks industry-side executives —
                business development leads, capture managers, and VPs who are working
                the same program offices you are.
              </p>
              <div className="fmc-person" style={{ marginTop: 20 }}>
                <div className="fmc-avatar" style={{ background: '#283a6b', width: 40, height: 40, minWidth: 40, fontSize: 13 }}>MR</div>
                <div>
                  <div className="fmc-person-name" style={{ fontSize: 14 }}>Michael R.</div>
                  <div className="fmc-person-title" style={{ fontSize: 12 }}>VP Business Development</div>
                  <div className="fmc-person-org" style={{ fontSize: 12 }}>Lockheed Martin · Space</div>
                </div>
              </div>
              <div className="fmc-person" style={{ marginTop: 12 }}>
                <div className="fmc-avatar" style={{ background: '#2f6b5a', width: 40, height: 40, minWidth: 40, fontSize: 13 }}>SK</div>
                <div>
                  <div className="fmc-person-name" style={{ fontSize: 14 }}>Sandra K.</div>
                  <div className="fmc-person-title" style={{ fontSize: 12 }}>Capture Manager, C2 Programs</div>
                  <div className="fmc-person-org" style={{ fontSize: 12 }}>Raytheon Intelligence & Space</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGNALS ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="feat-detail">
            <div className="feat-detail-copy">
              <div className="feat-tag signals-tag">/03 Contract Signals</div>
              <h2 className="mkt-h2">Live procurement<br />intelligence, daily.</h2>
              <p className="mkt-body">
                8,100+ contract signals from SAM.gov and USASpending — automatically
                linked to the orgs and people in the system. Every award tells you
                who&apos;s spending, on what, and how much is left in the pot.
              </p>
              <ul className="feat-list">
                <li>Awards: who won, how much, what set-aside, what NAICS</li>
                <li>Pre-solicitations and Sources Sought — catch opportunities early</li>
                <li>RFIs and RFPs — active opportunities ready for your response</li>
                <li>Each signal linked to the issuing org and contracting officer</li>
                <li>IDIQ ceiling vs. obligated — see how much runway is left on existing vehicles</li>
                <li>Filter by value, type, set-aside, branch, and NAICS code</li>
              </ul>
            </div>
            <div className="feat-detail-visual">
              <div className="feat-mock-card">
                {[
                  { type: 'Award', title: 'JADC2 Integration Services', val: '$42M', naics: '541512', who: 'Leidos' },
                  { type: 'Solicit', title: 'Battle Management C2 IDIQ', val: '$180M', naics: '541330', who: 'Open' },
                  { type: 'RFI', title: 'F-35 Sustainment Support', val: '$120M', naics: '336411', who: 'Open' },
                  { type: 'Award', title: 'Cyber Operations Platform', val: '$28M', naics: '541519', who: 'SAIC' },
                ].map((s, i) => (
                  <div key={i} className="fmc-signal-row">
                    <span className={`hcm-sig-badge ${s.type === 'Award' ? 'award' : s.type === 'RFI' ? 'rfi' : 'solicit'}`}>{s.type}</span>
                    <div className="fmc-sig-info">
                      <div className="fmc-sig-title">{s.title}</div>
                      <div className="fmc-sig-meta">NAICS {s.naics} · {s.who}</div>
                    </div>
                    <div className="fmc-sig-val">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALSO INCLUDED ── */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">Also included</div>
            <h2 className="mkt-h2">Built for teams<br />who move fast.</h2>
          </div>
          <div className="feat-also-grid">
            {[
              { title: 'CSV Export', body: 'Export orgs, contacts, and contracts as CSV for your CRM, Salesforce, or BD pipeline tracker.' },
              { title: 'Admin curation', body: 'Your team can add, edit, and tag data directly inside War Room. Keep the intel sharp.' },
              { title: 'Search & filter', body: 'Full-text search across orgs and people. Filter by branch, type, tag, and more.' },
              { title: 'Team access', body: 'Invite your BD team with role-based access — admin, member, or read-only viewer.' },
            ].map((f, i) => (
              <div key={i} className="feat-also-card">
                <h3 className="feat-also-title">{f.title}</h3>
                <p className="feat-also-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mkt-cta-section">
        <div className="mkt-container">
          <div className="mkt-cta-inner">
            <h2 className="mkt-cta-h">See it for yourself.</h2>
            <p className="mkt-cta-sub">Free account. No credit card. Full access to explore.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="/register" className="btn-primary-lg">Start free →</Link>
              <Link href="/pricing"  className="btn-ghost-lg">See pricing</Link>
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
              </div>
            </div>
          </div>
          <div className="mkt-footer-bottom">
            <span>© 2026 WAR ROOM · Built by Savan Kong</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
