'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm]   = useState({ name: '', email: '', organization: '', subject: 'General inquiry', message: '' });
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Send failed.'); setLoading(false); return; }
      setSent(true);
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  }

  return (
    <main className="mkt-main">
      <div className="contact-grid">

        {/* LEFT */}
        <div className="contact-left">
          <div className="mkt-slash-label">/ Get in touch</div>
          <h1 className="contact-h1">Let&apos;s talk</h1>
          <p className="contact-sub">Whether you&apos;re a defense contractor, BD team, or just want to learn more — reach out directly.</p>
          <div className="contact-methods">
            <div className="cm-row">
              <div className="cm-icon">✉</div>
              <div>
                <div className="cm-lbl">Email</div>
                <div className="cm-val"><a href="mailto:savankong@gmail.com">savankong@gmail.com</a></div>
              </div>
            </div>
            <div className="cm-row">
              <div className="cm-icon">💼</div>
              <div>
                <div className="cm-lbl">LinkedIn</div>
                <div className="cm-val"><a href="https://linkedin.com/in/savankong" target="_blank" rel="noreferrer">linkedin.com/in/savankong</a></div>
              </div>
            </div>
            <div className="cm-row">
              <div className="cm-icon">🎙</div>
              <div>
                <div className="cm-lbl">Podcast</div>
                <div className="cm-val"><a href="https://www.lifebetweentitles.com" target="_blank" rel="noreferrer">Life Between Titles ↗</a></div>
              </div>
            </div>
            <div className="cm-row">
              <div className="cm-icon">📖</div>
              <div>
                <div className="cm-lbl">Playbook &amp; Consulting</div>
                <div className="cm-val"><a href="https://www.light-lux.com" target="_blank" rel="noreferrer">light-lux.com ↗</a></div>
              </div>
            </div>
            <div className="cm-row">
              <div className="cm-icon">📍</div>
              <div>
                <div className="cm-lbl">Location</div>
                <div className="cm-val">Washington, D.C. metro area</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="contact-right">
          {sent ? (
            <div className="contact-sent">
              <div className="contact-sent-icon">✓</div>
              <h2>Message sent</h2>
              <p>Savan will get back to you within 1–2 business days.</p>
            </div>
          ) : (
            <>
              <div className="contact-form-title">Send a message</div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={submit}>
                <div className="auth-field"><label>Name</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required /></div>
                <div className="auth-field"><label>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" required /></div>
                <div className="auth-field"><label>Organization</label><input type="text" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Company or agency" /></div>
                <div className="auth-field">
                  <label>Subject</label>
                  <select className="auth-select" value={form.subject} onChange={e => set('subject', e.target.value)}>
                    <option>General inquiry</option>
                    <option>Request platform access</option>
                    <option>Partnership</option>
                    <option>Press / media</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="auth-field"><label>Message</label><textarea className="auth-textarea" value={form.message} onChange={e => set('message', e.target.value)} placeholder="What&apos;s on your mind?" rows={5} required /></div>
                <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Sending…' : 'Send message'}</button>
              </form>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
