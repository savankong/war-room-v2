'use client';

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
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return d; }
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

interface Props {
  signal: any;
  onClose: () => void;
}

function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="wr-pf-sam-cell">
      <div className="k">{label}</div>
      <div className="v" style={{ fontSize: 13 }}>{value || '—'}</div>
    </div>
  );
}

export default function SignalDetailPanel({ signal, onClose }: Props) {
  const typeColor = TYPE_COLOR[signal.signal_type] ?? '#4A5666';
  const src = SOURCE_LABEL[signal.source] ?? signal.source ?? '';

  const samUrl = signal.external_id
    ? `https://sam.gov/opp/${signal.external_id}/view`
    : null;

  const hasPoc = signal.poc || signal.poc_email || signal.poc_phone;

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
              {signal.notice_type || signal.signal_type || 'Signal'}
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

          {/* Classification */}
          <div className="wr-pf-sec">
            <div className="wr-pf-sh"><span className="t">Details</span><span className="ln" /></div>
            <div className="wr-pf-sam-stats" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              <StatCell label="Notice ID" value={signal.external_id} />
              <StatCell label="Solicitation #" value={signal.solicitation_number} />
              <StatCell label="Published" value={fmtDate(signal.published_date || signal.award_date)} />
              <StatCell label="Response Deadline" value={fmtDate(signal.deadline)} />
              <StatCell label="Award Date" value={fmtDate(signal.award_date)} />
              <StatCell label="Source" value={src || '—'} />
            </div>
          </div>

          {/* Classification codes */}
          <div className="wr-pf-sec">
            <div className="wr-pf-sh"><span className="t">Classification</span><span className="ln" /></div>
            <div className="wr-pf-sam-stats" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              <StatCell label="Set Aside" value={signal.set_aside || signal.status} />
              <StatCell label="NAICS Code" value={signal.naics || signal.naics_code} />
              <StatCell label="PSC Code" value={signal.psc_code} />
              <StatCell label="Place of Performance" value={signal.place_of_performance} />
            </div>
          </div>

          {/* Agency */}
          {(signal.org_name || signal.agency) && (
            <div className="wr-pf-sec">
              <div className="wr-pf-sh"><span className="t">Awarding agency</span><span className="ln" /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {signal.org_name && (
                  <div style={{ padding: '10px 12px', background: 'var(--field)', border: '1px solid var(--card-border)', borderRadius: 7, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                    {signal.org_name}
                  </div>
                )}
                {signal.sub_agency && signal.sub_agency !== signal.org_name && (
                  <div style={{ padding: '8px 12px', background: 'var(--field)', border: '1px solid var(--card-border)', borderRadius: 7, fontSize: 12, color: 'var(--ink-2)' }}>
                    {signal.sub_agency}
                  </div>
                )}
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
                {signal.poc && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Name</span>
                    <span className="wr-pf-sam-contact-val">{signal.poc}</span>
                  </div>
                )}
                {signal.poc_email && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Email</span>
                    <a href={`mailto:${signal.poc_email}`} className="wr-pf-sam-contact-val">{signal.poc_email}</a>
                  </div>
                )}
                {signal.poc_phone && (
                  <div className="wr-pf-sam-contact-row">
                    <span className="wr-pf-sam-contact-type">Phone</span>
                    <a href={`tel:${signal.poc_phone}`} className="wr-pf-sam-contact-val">{signal.poc_phone}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="wr-pf-sec">
            <div className="wr-pf-sh"><span className="t">Description</span><span className="ln" /></div>
            <div className="wr-pf-about" style={{ whiteSpace: 'pre-wrap' }}>
              {signal.description
                ? signal.description
                : `${signal.signal_type ?? 'Contract'} signal from ${src}. Full description not available — view on the source platform for complete details.`}
            </div>
          </div>

          {/* External link */}
          {samUrl && (
            <div className="wr-pf-sec" style={{ paddingBottom: 24 }}>
              <a
                href={samUrl}
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
