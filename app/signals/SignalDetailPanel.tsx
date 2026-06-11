'use client';

function fmtMoney(v: number | null) {
  if (!v) return '—';
  if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v/1e3).toFixed(0)}K`;
  return `$${v}`;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
}

interface Props {
  signal: any;
  onClose: () => void;
}

export default function SignalDetailPanel({ signal, onClose }: Props) {
  const isOpp = signal.signal_type === 'Opportunity';
  const isAward = signal.signal_type === 'Award';
  const badgeCls = isOpp ? 'sig-badge-opp' : isAward ? 'sig-badge-award' : 'sig-badge-budget';

  return (
    <div className="pp-overlay">
      <div className="pp-bg" onClick={onClose} />
      <div className="sdp">
        <div className="sdp-hdr">
          <button className="sdp-close" onClick={onClose}>✕</button>
          <div className="sdp-type-row">
            <span className={`sig-badge ${badgeCls}`}>{signal.signal_type ?? 'Signal'}</span>
            {signal.set_aside && <span className="sig-set-aside">{signal.set_aside}</span>}
          </div>
          <div className="sdp-title">{signal.title}</div>
          <div className="sdp-sub">{signal.external_id ?? signal.id} · {signal.source?.replace('_','.')}</div>
        </div>
        <div className="sdp-body">
          <div className="sdp-grid">
            <div className="sdp-cell">
              <div className="sdp-cell-lbl">Value</div>
              <div className="sdp-cell-val">{fmtMoney(signal.value)}</div>
            </div>
            <div className="sdp-cell">
              <div className="sdp-cell-lbl">Status</div>
              <div className="sdp-cell-val">{signal.status ?? '—'}</div>
            </div>
            <div className="sdp-cell">
              <div className="sdp-cell-lbl">Award Date</div>
              <div className="sdp-cell-val">{fmtDate(signal.award_date)}</div>
            </div>
            <div className="sdp-cell">
              <div className="sdp-cell-lbl">Deadline</div>
              <div className="sdp-cell-val">{fmtDate(signal.deadline)}</div>
            </div>
          </div>

          {signal.org_name && (
            <>
              <div className="sdp-sec">Agency</div>
              <div className="sdp-prime-box">
                <div className="sdp-prime-label">Awarding Agency</div>
                <div className="sdp-prime-name">{signal.org_name}</div>
              </div>
            </>
          )}

          <div className="sdp-sec">Description</div>
          <div className="sdp-desc">
            {signal.description ?? `${signal.signal_type ?? 'Contract'} signal from ${signal.source?.replace('_','.')}. Full description not available — view on SAM.gov for complete details.`}
          </div>

          {signal.external_id && (
            <a
              href={`https://sam.gov/opp/${signal.external_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="sdp-sam-btn"
            >
              ↗ View on SAM.gov
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
