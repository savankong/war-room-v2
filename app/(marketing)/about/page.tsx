import Link from 'next/link';
import Image from 'next/image';
import { AegisMark } from '@/components/Aegis';

export const metadata = {
  title: 'About — War Room',
  description: 'War Room was built by Savan Kong, the Department of Defense\'s first Customer Experience Officer.',
};

export default function AboutPage() {
  return (
    <main className="mkt-main">

      {/* ── PAGE HERO ── */}
      <section className="page-hero">
        <div className="mkt-container">
          <div className="mkt-eyebrow">About War Room</div>
          <h1 className="page-h1">Built from inside<br /><span className="mkt-h1-accent">the Pentagon.</span></h1>
          <p className="page-sub">
            War Room exists because the intelligence should have been there all along.
          </p>
        </div>
      </section>

      {/* ── FOUNDER PHOTO + STORY ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="about-story">
            <div className="about-photo-col">
              <div className="about-photo-wrap">
                <Image
                  src="/savan-kong.jpg"
                  alt="Savan Kong"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  priority
                />
              </div>
              <div className="about-photo-caption">
                <div className="about-name">Savan Kong</div>
                <div className="about-title-badge">DoD&apos;s first Customer Experience Officer</div>
                <div className="about-links">
                  <a href="https://www.savankong.com" target="_blank" rel="noreferrer" className="btn-mkt-ghost sm">savankong.com ↗</a>
                  <a href="https://www.light-lux.com" target="_blank" rel="noreferrer" className="btn-mkt-ghost sm">Consulting ↗</a>
                </div>
              </div>
            </div>
            <div className="about-story-copy">
              <h2 className="about-story-h">The map I wished existed.</h2>
              <p>
                I grew up in South Seattle, raised by Cambodian parents who fled the Khmer Rouge.
                Getting into Lakeside School felt like stepping into a world I&apos;d only seen on television.
                That experience — navigating unfamiliar systems, learning to find the right doors —
                became the lens through which I&apos;ve approached every career since.
              </p>
              <p>
                Before the Pentagon, I was an early employee at Redfin, where I helped co-author
                patented real estate search technology. I learned what it looks like when
                complex, fragmented information gets structured into something people can actually use.
              </p>
              <p>
                When I joined the Department of Defense — eventually becoming the DoD&apos;s first
                Customer Experience Officer — I saw the same problem at a different scale.
                Thousands of program offices. Billions in contracts. And BD teams on the outside
                trying to navigate it all with spreadsheets, LinkedIn, and word of mouth.
              </p>
              <p>
                War Room is the system I needed but couldn&apos;t find. It takes the org structure,
                the people, and the contract signals that are technically public — and makes
                them navigable. So your team can spend less time searching and more time building
                the relationships that actually win work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CREDENTIALS ── */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-section-hd">
            <div className="mkt-eyebrow">Background</div>
            <h2 className="mkt-h2">Career at the intersection<br />of technology and public service.</h2>
          </div>
          <div className="about-creds">
            {[
              {
                org: 'U.S. Department of Defense',
                role: 'First Customer Experience Officer',
                body: 'Led enterprise-wide customer experience transformation across the largest organization in the world. Focused on digital innovation, design infrastructure, and building user-centered practices inside complex government bureaucracies.',
                tag: 'Pentagon',
              },
              {
                org: 'Digital Service at Defense (DDS)',
                role: 'Technology & Design Leadership',
                body: 'Worked inside the DoD\'s Silicon Valley-style tech unit to bring modern software practices — agile, user research, rapid prototyping — to defense programs.',
                tag: 'DDS',
              },
              {
                org: 'Redfin',
                role: 'Early Employee · Patented Technology',
                body: 'Joined Redfin in its early days and co-authored patented real estate search technology. Developed a deep playbook for making complex, fragmented data navigable for everyday users.',
                tag: 'Startup',
              },
              {
                org: 'Life Between Titles',
                role: 'Podcast Host & Author',
                body: 'Hosts the podcast "Life Between Titles," exploring identity, purpose, and career transitions. Currently writing the memoir "Halfway Light" — the story of a kid from South Seattle who ended up at the Pentagon.',
                tag: 'Media',
              },
            ].map((c, i) => (
              <div key={i} className="about-cred-card">
                <div className="about-cred-tag">{c.tag}</div>
                <div className="about-cred-org">{c.org}</div>
                <div className="about-cred-role">{c.role}</div>
                <p className="about-cred-body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="mkt-section mkt-section-alt">
        <div className="mkt-container">
          <div className="about-mission">
            <div className="mkt-eyebrow">Our mission</div>
            <blockquote className="about-bq">
              Make the defense market as navigable as a consumer product —
              so that the best companies, not just the best-connected ones, can compete for the work.
            </blockquote>
            <p className="mkt-body" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
              Opportunity in defense has always been about who you know.
              War Room is changing that — by surfacing the intelligence that
              levels the field for every BD team willing to do the work.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mkt-cta-section">
        <div className="mkt-container">
          <div className="mkt-cta-inner">
            <h2 className="mkt-cta-h">Ready to map the market?</h2>
            <p className="mkt-cta-sub">Free to start. No credit card required.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
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
                <a href="https://www.savankong.com" target="_blank" rel="noreferrer" className="mkt-footer-link">Founder ↗</a>
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
