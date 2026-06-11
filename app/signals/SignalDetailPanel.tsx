'use client';

interface Signal {
  id: string;
  title: string;
  signal_type: string | null;
  value: number | null;
  status: string | null;
  award_date: string | null;
  source: string;
  org_name: string | null;
  naics_code: string | null;
  psc_code: string | null;
  description: string | null;
  awardee: string | null;
  solicitation_number: string | null;
}

function fmt(v: number | null) {
  if (v == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
}
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function badgeClass(type: string | null) {
  if (type === 'Award') return 'signal-badge badge-award';
  if (type === 'Opportunity') return 'signal-badge badge-opportunity';
  return 'signal-badge badge-budget';
}

export default function SignalDetailPanel({ signal, onClose }: { signal: Signal; onClose: () => void }) {
  return (
    <>
      <div className="sdp-overlay" onClick={onClose} />
      <div className="sdp-panel">
        <div className="sdp-header">
          <div>
            <span className={badgeClass(signal.signal_type)}>{signal.signal_type ?? 'Signal'}</span>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 8, lineHeight: 1.4 }}>{signal.title}</div>
          </div>
          <button className="sdp-close" onClick={onClose}>×</button>
        </div>
        <div className="sdp-body">
          <div className="sdp-section">
            <h4>Overview</h4>
            <div className="sdp-row">
              <div className="sdp-field"><label>Value</label><p>{fmt(signal.value)}</p></div>
              <div className="sdp-field"><label>Status</label><p>{signal.status ?? '—'}</p></div>
            </div>
            <div className="sdp-row" style={{ marginTop: 10 }}>
              <div className="sdp-field"><label>Award Date</label><p>{fmtDate(signal.award_date)}</p></div>
              <div className="sdp-field"><label>Source</label><p>{signal.source}</p></div>
            </div>
          </div>

          {signal.org_name && (
            <div className="sdp-section">
              <h4>Agency</h4>
              <p style={{ fontSize: 14 }}>{signal.org_name}</p>
            </div>
          )}

          {signal.awardee && (
            <div className="sdp-section">
              <h4>Awardee</h4>
              <p style={{ fontSize: 14 }}>{signal.awardee}</p>
            </div>
          )}

          {(signal.naics_code || signal.psc_code || signal.solicitation_number) && (
            <div className="sdp-section">
              <h4>Classification</h4>
              <div className="sdp-row">
                {signal.naics_code && <div className="sdp-field"><label>NAICS</label><p>{signal.naics_code}</p></div>}
                {signal.psc_code && <div className="sdp-field"><label>PSC</label><p>{signal.psc_code}</p></div>}
                {signal.solicitation_number && <div className="sdp-field"><label>Solicitation #</label><p>{signal.solicitation_number}</p></div>}
              </div>
            </div>
          )}

          {signal.description && (
            <div className="sdp-section">
              <h4>Description</h4>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{signal.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
