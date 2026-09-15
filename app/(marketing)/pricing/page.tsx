import Link from 'next/link';
import { AegisMark } from '@/components/Aegis';

export const metadata = {
  title: 'Pricing — War Room',
  description: 'One price. Your AI capture analyst for DoD contracting. $149/month, 14 day trial.',
};

/**
 * Product spec §9: one tier at launch.
 *
 * "we don't yet know which features carry the value, so a ladder would be
 *  guesswork. One price, one promise, and the feedback tells us where the
 *  tiers actually belong."
 *
 * The Scout / Team / Enterprise ladder is sketched in §9 but explicitly out of
 * scope for v1 (§14), along with the free tier. It comes back after the first
 * ~20 paying customers, and §9 says to verify competitor pricing before
 * publishing any of it rather than anchoring on remembered numbers.
 */
const TIERS = [
  {
    name: 'Capture',
    price: '$149',
    period: 'per month',
    desc: 'Your AI capture analyst for DoD contracting. Every week, what changed, what is worth pursuing, and what to do next.',
    cta: 'Start 14-day trial',
    ctaHref: '/register',
    primary: true,
    features: [
      'Personalized matches scored against your capability profile',
      'Fit with the evidence behind it — never a made-up percentage',
      'Capture brief per opportunity: incumbent, prior contract, people, next action',
      'Recompete timing so you position before the RFP, not after',
      'Decision makers at the program and contracting office',
      'Briefing Monday, Wednesday and Friday — never more than three opportunities',
      'Cancel anytime',
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
          <h1 className="page-h1">One price.<br /><span className="mkt-h1-accent">Serious intelligence.</span></h1>
          <p className="page-sub">Everything included. 14 day trial, cancel anytime.</p>
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
                q: 'Why only one plan?',
                a: 'Because we do not yet know which part of this you will value most, and guessing at a ladder would just be guessing. One price, one promise. Tiers come later, shaped by what early customers actually use.',
              },
              {
                q: 'Is the data updated in real time?',
                a: 'DoD opportunities are ingested from SAM.gov every morning and awards from USASpending nightly. Org and stakeholder profiles are curated and updated regularly.',
              },
              {
                q: 'Why only three opportunities per briefing?',
                a: 'Because volume is the problem, not the solution. You already have access to every notice on SAM.gov. What you do not have is someone telling you which three deserve your week.',
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
                a: 'For deeper BD strategy work, visit light-lux.com for the full consulting offering.',
              },
              {
                q: 'How accurate is the data?',
                a: 'Org hierarchy and stakeholder profiles are curated by hand and enriched from public sources. Opportunities and awards come directly from SAM.gov and USASpending. Where we cannot identify something — an incumbent, a contracting officer — the brief says so rather than guessing. That rule matters more to us than looking complete.',
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
