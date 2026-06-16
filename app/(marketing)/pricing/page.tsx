import Link from 'next/link';
import { AegisMark } from '@/components/Aegis';

export const metadata = {
  title: 'Pricing — War Room',
  description: 'Simple, transparent pricing for defense BD teams. Start free and upgrade when you need more.',
};

const TIERS = [
  {
    name: 'Scout',
    price: 'Free',
    period: 'forever',
    desc: 'Explore the platform and get a feel for the data.',
    cta: 'Get started free',
    ctaHref: '/register',
    primary: false,
    features: [
      'Access to org hierarchy',
      'Browse 575+ organizations',
      'View up to 50 stakeholder profiles',
      'View up to 100 contract signals',
      'Basic search and filter',
    ],
    limits: [
      'No CSV export',
      'No admin data editing',
      'No team seats',
    ],
  },
  {
    name: 'Operator',
    price: '$149',
    period: 'per user / month',
    desc: 'Full access for active BD professionals who need the complete picture.',
    cta: 'Start 14-day trial',
    ctaHref: '/register?plan=operator',
    primary: true,
    features: [
      'Unlimited org browsing',
      'All 6,700+ stakeholder profiles',
      'Full contract signal feed',
      'CSV export (orgs, contacts, contracts)',
      'Advanced search and filters',
      'Admin data editing',
      '3 team seats included',
      'Priority support',
    ],
    limits: [],
  },
  {
    name: 'Team',
    price: '$399',
    period: 'per month',
    desc: 'For BD teams that need collaborative intelligence and expanded seats.',
    cta: 'Contact us',
    ctaHref: '/contact',
    primary: false,
    features: [
      'Everything in Operator',
      'Up to 10 team seats',
      'Role-based access control',
      'Admin user management',
      'Custom data fields',
      'Dedicated onboarding call',
      'Monthly strategy call with Savan',
    ],
    limits: [],
  },
];

export default function PricingPage() {
  return (
    <main className="mkt-main">

      {/* ── PAGE HERO ── */}
      <section className="page-hero">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Pricing</div>
          <h1 className="page-h1">Simple pricing.<br /><span className="mkt-h1-accent">Serious intelligence.</span></h1>
          <p className="page-sub">Start free and upgrade when your pipeline demands it.</p>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="pricing-grid">
            {TIERS.map((t) => (
              <div key={t.name} className={`pricing-card${t.primary ? ' pricing-card-primary' : ''}`}>
                {t.primary && <div className="pricing-popular">Most popular</div>}
                <div className="pricing-tier-name">{t.name}</div>
                <div className="pricing-price">
                  <span className="pricing-price-n">{t.price}</span>
                  {t.price !== 'Free' && <span className="pricing-price-p">{t.period}</span>}
                </div>
                <p className="pricing-desc">{t.desc}</p>
                <Link
                  href={t.ctaHref}
                  className={t.primary ? 'btn-primary-lg pricing-cta' : 'btn-ghost-lg pricing-cta'}
                >
                  {t.cta}
                </Link>
                <div className="pricing-feats">
                  {t.features.map((f, i) => (
                    <div key={i} className="pricing-feat">
                      <span className="pricing-check">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  {t.limits.map((l, i) => (
                    <div key={i} className="pricing-feat pricing-limit">
                      <span className="pricing-x">–</span>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">FAQ</div>
            <h2 className="mkt-h2">Common questions.</h2>
          </div>
          <div className="faq-grid">
            {[
              {
                q: 'What counts as a "team seat"?',
                a: 'Each person who logs in to War Room counts as one seat. Scout is single-user only. Operator includes 3 seats. Team includes up to 10.',
              },
              {
                q: 'Is the data updated in real time?',
                a: 'Contract signals are synced daily from SAM.gov and USASpending. Org and stakeholder profiles are curated and updated regularly.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Monthly plans can be cancelled anytime with no penalty. You keep access until the end of your billing period.',
              },
              {
                q: 'Do you offer government or small business discounts?',
                a: 'We do. Reach out to Savan directly via the Contact page to discuss SBIR companies, 8(a) firms, and government-adjacent use cases.',
              },
              {
                q: 'What is the consulting add-on?',
                a: 'The Team plan includes a monthly strategy call with Savan Kong. For deeper BD strategy work, visit light-lux.com for the full consulting offering.',
              },
              {
                q: 'How accurate is the data?',
                a: 'Org hierarchy and stakeholder profiles are curated by hand and enriched from public sources. Signals come directly from SAM.gov and USASpending via daily sync.',
              },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <h3 className="faq-q">{faq.q}</h3>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONSULTING UPSELL ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="consulting-strip">
            <div>
              <div className="mkt-eyebrow">Need more?</div>
              <h2 className="mkt-h2" style={{ marginBottom: 12 }}>Full BD strategy & consulting.</h2>
              <p className="mkt-body">
                War Room is the map. For the full playbook — capture strategy, relationship mapping,
                BD coaching, and proposal support — Savan works directly with defense companies
                through Light Lux.
              </p>
            </div>
            <a href="https://www.light-lux.com" target="_blank" rel="noreferrer" className="btn-primary-lg">
              light-lux.com ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mkt-cta-section">
        <div className="mkt-container">
          <div className="mkt-cta-inner">
            <h2 className="mkt-cta-h">Start for free today.</h2>
            <p className="mkt-cta-sub">No credit card required. Upgrade anytime.</p>
            <div className="hero-actions">
              <Link href="/register" className="btn-primary-lg">Create free account →</Link>
              <Link href="/contact"  className="btn-ghost-lg">Talk to Savan</Link>
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
            <span>© 2026 War Room · Built by Savan Kong</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
