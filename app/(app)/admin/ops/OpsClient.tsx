'use client';

/**
 * Admin — engineering spec §7.5. Internal only.
 *
 * "Ingestion run log, unresolved org queue, brief generation cost, per-company
 *  match counts, job queue health. Expect to live in this screen for the first
 *  month."
 *
 * The token is typed in rather than stored: this is an internal screen used by
 * two people, and a shared secret in localStorage on a shared laptop is worse
 * than typing it.
 */
import { useState } from 'react';

interface OpsData {
  ingestionRuns: Array<{
    id: string;
    source: string;
    status: string;
    records_synced: number | null;
    inserted_count: number;
    updated_count: number;
    skipped_count: number;
    errored_count: number;
    unresolved_org_count: number;
    error_log: string | null;
    started_at: string;
    completed_at: string | null;
  }>;
  orgResolution: { total: number; resolved: number; rate: number; meetsTarget: boolean };
  unresolvedOrgQueue: {
    total: number;
    byDepartment: Array<{
      department_slug: string | null;
      count: number;
      last_seen: string;
      sample_offices: string[] | null;
    }>;
  };
  briefGeneration: Array<{
    briefs: number;
    template_fallbacks: number;
    input_tokens: string;
    output_tokens: string;
    model: string | null;
  }>;
  companies: Array<{
    id: string;
    name: string;
    plan: string;
    status: string;
    briefing_frequency: string;
    onboarding_completed_at: string | null;
    strong: number;
    fair: number;
    dismissed: number;
    briefs: number;
    briefings_sent: number;
    last_briefing_at: string | null;
  }>;
}

export default function OpsClient() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ops', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(res.status === 401 ? 'Bad token' : `Request failed (${res.status})`);
      setData((await res.json()) as OpsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="v3-page">
      <header className="v3-header">
        <div>
          <h1 className="v3-title">Ops</h1>
          <p className="v3-muted">Internal. Ingestion, org resolution, brief cost, per-company counts.</p>
        </div>
      </header>

      <div className="v3-field-row">
        <label className="v3-field">
          <span>Admin token</span>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <div className="v3-form-actions">
          <button className="v3-btn v3-btn-primary" disabled={!token || loading} onClick={load}>
            {loading ? 'Loading…' : 'Load'}
          </button>
        </div>
      </div>

      {error && <div className="v3-error" role="alert">{error}</div>}

      {data && (
        <>
          <section className="v3-section">
            <h2>Org resolution</h2>
            {/* Acceptance criterion 3. */}
            <p className={data.orgResolution.meetsTarget ? 'v3-ok' : 'v3-warn'}>
              {data.orgResolution.resolved} of {data.orgResolution.total} opportunities resolved to an org (
              {(data.orgResolution.rate * 100).toFixed(1)}%) —{' '}
              {data.orgResolution.meetsTarget ? 'meets the 85% target' : 'BELOW the 85% target'}
            </p>
          </section>

          <section className="v3-section">
            <h2>Unresolved org queue ({data.unresolvedOrgQueue.total})</h2>
            <div className="v3-tablewrap">
              <table className="v3-table">
                <thead>
                  <tr><th>Department</th><th>Count</th><th>Last seen</th><th>Sample offices</th></tr>
                </thead>
                <tbody>
                  {data.unresolvedOrgQueue.byDepartment.map((row, i) => (
                    <tr key={i}>
                      <td>{row.department_slug ?? '(none)'}</td>
                      <td>{row.count}</td>
                      <td>{new Date(row.last_seen).toLocaleDateString()}</td>
                      <td className="v3-muted">{(row.sample_offices ?? []).filter(Boolean).join(', ')}</td>
                    </tr>
                  ))}
                  {!data.unresolvedOrgQueue.byDepartment.length && (
                    <tr><td colSpan={4} className="v3-muted">Nothing unresolved.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="v3-section">
            <h2>Ingestion runs</h2>
            <div className="v3-tablewrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th>Source</th><th>Status</th><th>Ins</th><th>Upd</th><th>Skip</th>
                    <th>Err</th><th>No org</th><th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ingestionRuns.map((run) => (
                    <tr key={run.id} className={run.status === 'failed' ? 'v3-tr-bad' : ''}>
                      <td>{run.source}</td>
                      <td>{run.status}</td>
                      <td>{run.inserted_count}</td>
                      <td>{run.updated_count}</td>
                      <td>{run.skipped_count}</td>
                      <td>{run.errored_count}</td>
                      <td>{run.unresolved_org_count}</td>
                      <td className="v3-muted">{new Date(run.started_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="v3-section">
            <h2>Brief generation, last 30 days</h2>
            <div className="v3-tablewrap">
              <table className="v3-table">
                <thead>
                  <tr><th>Model</th><th>Briefs</th><th>Template fallbacks</th><th>Input tokens</th><th>Output tokens</th></tr>
                </thead>
                <tbody>
                  {data.briefGeneration.map((row, i) => (
                    <tr key={i}>
                      <td>{row.model ?? '(template only)'}</td>
                      <td>{row.briefs}</td>
                      {/* A rising fallback count means the prompt or the schema is drifting. */}
                      <td className={row.template_fallbacks > 0 ? 'v3-warn' : ''}>{row.template_fallbacks}</td>
                      <td>{Number(row.input_tokens).toLocaleString()}</td>
                      <td>{Number(row.output_tokens).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!data.briefGeneration.length && (
                    <tr><td colSpan={5} className="v3-muted">No briefs generated yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="v3-section">
            <h2>Companies</h2>
            <div className="v3-tablewrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Plan</th><th>Onboarded</th><th>Strong</th><th>Fair</th>
                    <th>Dismissed</th><th>Briefs</th><th>Briefings</th><th>Last sent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.companies.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.plan}</td>
                      <td>{c.onboarding_completed_at ? 'yes' : 'no'}</td>
                      <td>{c.strong}</td>
                      <td>{c.fair}</td>
                      <td>{c.dismissed}</td>
                      <td>{c.briefs}</td>
                      <td>{c.briefings_sent}</td>
                      <td className="v3-muted">
                        {c.last_briefing_at ? new Date(c.last_briefing_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
