'use client';

import { useEffect, useState } from 'react';

function fmtMoney(v: number | string | null) {
  const n = v == null ? null : Number(v);
  if (!n) return '—';
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
}
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const TYPE_COLOR: Record<string, string> = {
  Opportunity: '#2f8676',
  Award:       '#283a6b',
  Budget:      '#C98A2B',
};
const TYPE_BG: Record<string, string> = {
  Opportunity: 'rgba(47,134,118,.12)',
  Award:       'rgba(40,58,107,.12)',
  Budget:      'rgba(201,138,43,.14)',
};
const SOURCE_LABEL: Record<string, string> = {
  sam_gov:     'SAM.gov',
  usaspending: 'USASpending',
  manual:      'Manual',
};

const IcX    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcLink = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IcMail = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IcLI   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;

interface Contact {
  id: string;
  name: string;
  initials?: string;
  title?: string;
  email?: string;
  phone?: string;
  color?: string;
  photo_url?: string;
  linkedin?: string;
  hierarchy_order?: number;
  tags?: string[];
}

interface Props {
  signal: any;
  onClose: () => void;
}

function PersonCard({ c }: { c: Contact }) {
  const initials = c.initials ?? c.name.split(' ').map((p:string)=>p[0]).join('').slice(0,2).toUpperCase();
  const bg = c.color ?? '#283a6b';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--field)', border: '1px solid var(--card-border)', borderRadius: 8, marginBottom: 6 }}>
      {c.photo_url ? (
        <img src={c.photo_url} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Mono', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Archivo', fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
        {c.title && <div style={{ fontSize: 11, color: 'var(--ink-2)', marginBottom: 4 }}>{c.title}</div>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {c.email && (
            <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
              <IcMail />{c.email}
            </a>
          )}
          {c.linkedin && (
            <a href={c.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
              <IcLI />LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignalDetailPanel({ signal, onClose }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!signal?.org_id) return;
    fetch(`/api/signal-contacts?org_id=${encodeURIComponent(signal.org_id)}`)
      .then(r => r.json())
      .then(setContacts)
      .catch(() => {});
  }, [signal?.org_id]);

  const typeColor = TYPE_COLOR[signal.signal_type] ?? '#4A5666';
  const src = SOURCE_LABEL[signal.source] ?? signal.source ?? '';

  const hasPoc = signal.poc_name || signal.poc_email || signal.alt_poc_name || signal.alt_poc_email;

  return (
    <div className="wr-pf-back" onClick={onClose}>
      <div className="wr-pf" onClick={e => e.stopPropagation()}>

        {/* Dark navy header */}
        <div className="wr-pf-hd">
          <button className="wr-pf-x" onClick={onClose}><IcX /></button>
          <div style={{ marginBottom: 10 }}>
            <span
              className="wr-sc-type"
              style={{ background: 'rgba(255,255,255,.12)', color: '#EDF1F6', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 4, fontSize: 10, fontFamily: 'IBM Plex Mono', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: typeColor, flexShrink: 0, display: 'inline-block' }} />
              {signal.signal_type ?? 'Signal'}
            </span>
            {src && (
              <span style={{ marginLeft: 8, fontFamily: 'IBM Plex Mono', fontSize: 9, color: 'rgba(237,241,246,.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                via {src}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'Archivo', fontSize: 16, fontWeight: 700, color: 'var(--topbar-fg)', lineHeight: 1.35, marginBottom: 6 }}>
            {signal.title}
          </div>
          {(signal.external_id || signal.id) && (
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'rgba(237,241,246,.45)', marginBottom: 10 }}>
              {signal.external_id ?? signal.id}
            </div>
          )}
          {(signal.value || signal.award_amt) && (
            <div style={{ fontFamily: 'Archivo', fontSize: 22, fontWeight: 800, color: '#EDF1F6', letterSpacing: '-.01em' }}>
              {fmtMoney(signal.value ?? signal.award_amt)}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="wr-pf-body">

          {/* Key stats */}
          <div className="wr-pf-sec">
            <div className="wr-pf-sh"><span className="t">Details</span><span className="ln" /></div>
            <div className="wr-pf-sam-stats" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              <div className="wr-pf-sam-cell">
                <div className="k">Award Date</div>
                <div className="v" style={{ fontSize: 13 }}>{fmtDate(signal.award_date)}</div>
              </div>
              <div className="wr-pf-sam-cell">
                <div className="k">Deadline</div>
                <div className="v" style={{ fontSize: 13 }}>{fmtDate(signal.deadline)}</div>
              </div>
              <div className="wr-pf-sam-cell">
                <div className="k">Status</div>
                <div className="v" style={{ fontSize: 13 }}>{signal.status ?? signal.set_aside ?? '—'}</div>
              </div>
              <div className="wr-pf-sam-cell">
                <div className="k">Source</div>
                <div className="v" style={{ fontSize: 13 }}>{src || '—'}</div>
              </div>
            </div>
          </div>

          {/* Agency */}
          {signal.org_name && (
            <div className="wr-pf-sec">
              <div className="wr-pf-sh"><span className="t">Awarding agency</span><span className="ln" /></div>
              <div style={{ padding: '10px 12px', background: 'var(--field)', border: '1px solid var(--card-border)', borderRadius: 7, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                {signal.org_name}
              </div>
            </div>
          )}

          {/* Recipient */}
          {signal.recipient && (
            <div className="wr-pf-sec">
              <div className="wr-pf-sh"><span className="t">Recipient / Prime</span><span className="ln" /></div>
              <div style={{ padding: '10px 12px', background: 'var(--field)', border: '1px solid var(--card-border)', borderRadius: 7, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                {signal.recipient}
              </div>
            </div>
          )}

          {/* POC */}
          {hasPoc && (
            <div className="wr-pf-sec">
              <div className="wr-pf-sh"><span className="t">Point of contact</span><span className="ln" /></div>
              <div className="wr-pf-sam-contact">
                {signal.poc_name && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Primary</span>
                    <span className="wr-pf-sam-contact-val">{signal.poc_name}</span>
                  </div>
                )}
                {signal.poc_email && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Email</span>
                    <a href={`mailto:${signal.poc_email}`} className="wr-pf-sam-contact-val">{signal.poc_email}</a>
                  </div>
                )}
                {signal.alt_poc_name && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Alt POC</span>
                    <span className="wr-pf-sam-contact-val">{signal.alt_poc_name}</span>
                  </div>
                )}
                {signal.alt_poc_email && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Alt Email</span>
                    <a href={`mailto:${signal.alt_poc_email}`} className="wr-pf-sam-contact-val">{signal.alt_poc_email}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* People / Org chart */}
          {contacts.length > 0 && (
            <div className="wr-pf-sec">
              <div className="wr-pf-sh"><span className="t">People</span><span className="ln" /></div>
              {contacts.map(c => <PersonCard key={c.id} c={c} />)}
            </div>
          )}

          {/* Description */}
          <div className="wr-pf-sec">
            <div className="wr-pf-sh"><span className="t">Description</span><span className="ln" /></div>
            <div className="wr-pf-about">
              {signal.description ?? `${signal.signal_type ?? 'Contract'} signal from ${src}. Full description not available — view on the source platform for complete details.`}
            </div>
          </div>

          {/* External link */}
          {signal.external_id && (
            <div className="wr-pf-sec" style={{ paddingBottom: 24 }}>
              <a
                href={`https://sam.gov/opp/${signal.external_id}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="wr-pf-sam-link"
              >
                <IcLink /> View on SAM.gov →
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
