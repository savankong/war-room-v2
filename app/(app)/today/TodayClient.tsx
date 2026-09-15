'use client';

/**
 * Today — engineering spec §7.2.
 *
 * "Ranked Strong and Fair matches for the period. Each row: title, org, notice
 *  type, deadline, fit badge, top two evidence lines, next action. Save and
 *  Dismiss inline."
 *
 * No score anywhere: §5 says store the number, show the bucket and the
 * evidence. The API does not return it either.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError, formatUsd, formatDate, daysUntil } from '@/lib/client-api';

interface Opportunity {
  opportunityId: string;
  title: string;
  org: string | null;
  noticeType: string | null;
  setAside: string | null;
  estimatedValue: number | null;
  responseDeadline: string | null;
  samUrl: string | null;
  fit: 'strong' | 'fair';
  evidence: string[];
  recommendation: string | null;
  nextAction: string | null;
  recompeteConfidence: string | null;
  incumbent: string | null;
  saved: boolean;
  dismissed: boolean;
}

interface Company {
  id: string;
  name: string;
  plan: string;
  onboardingComplete: boolean;
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  pursue: 'Pursue',
  position_now: 'Position now',
  monitor: 'Monitor',
  partner: 'Partner',
  pass: 'Pass',
};

export default function TodayClient() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<'all' | 'strong' | 'fair' | 'saved'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // The `cancelled` guard is not ceremony: without it a customer who opens
  // Today and navigates away before the two requests finish gets setState on
  // an unmounted component.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { company: found } = await apiFetch<{ company: Company | null }>('/api/companies');
        if (cancelled) return;

        if (!found || !found.onboardingComplete) {
          router.push('/onboarding');
          return;
        }
        setCompany(found);

        const { opportunities: rows } = await apiFetch<{ opportunities: Opportunity[] }>(
          `/api/opportunities?companyId=${encodeURIComponent(found.id)}`,
        );
        if (cancelled) return;
        setOpportunities(rows);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push('/login');
          return;
        }
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function act(opportunityId: string, action: 'save' | 'unsave' | 'dismiss') {
    if (!company) return;
    setBusy(opportunityId);

    // Optimistic: the row updates immediately and reverts if the write fails.
    const previous = opportunities;
    setOpportunities((rows) =>
      action === 'dismiss'
        ? rows.filter((r) => r.opportunityId !== opportunityId)
        : rows.map((r) => (r.opportunityId === opportunityId ? { ...r, saved: action === 'save' } : r)),
    );

    try {
      await apiFetch('/api/opportunities', {
        method: 'PATCH',
        body: JSON.stringify({ companyId: company.id, opportunityId, action }),
      });
    } catch (err) {
      setOpportunities(previous);
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const visible = opportunities.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'saved') return o.saved;
    return o.fit === filter;
  });

  const strongCount = opportunities.filter((o) => o.fit === 'strong').length;
  const fairCount = opportunities.filter((o) => o.fit === 'fair').length;
  const savedCount = opportunities.filter((o) => o.saved).length;

  if (loading) {
    return <div className="v3-page"><p className="v3-muted">Loading your matches…</p></div>;
  }

  return (
    <div className="v3-page">
      <header className="v3-header">
        <div>
          <h1 className="v3-title">Today</h1>
          <p className="v3-muted">
            {company?.name}
            {company?.plan === 'trial' ? ' · trial' : ''}
          </p>
        </div>
        <Link href="/settings" className="v3-btn v3-btn-ghost">Settings</Link>
      </header>

      {error && <div className="v3-error" role="alert">{error}</div>}

      <div className="v3-filters" role="tablist" aria-label="Filter matches">
        {([
          ['all', `All ${opportunities.length}`],
          ['strong', `Strong ${strongCount}`],
          ['fair', `Fair ${fairCount}`],
          ['saved', `Saved ${savedCount}`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            className={`v3-filter${filter === key ? ' on' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {!visible.length && (
        <div className="v3-empty">
          <h2>Nothing here yet</h2>
          <p>
            {opportunities.length === 0
              ? 'We have not found anything worth your time yet. That is a real answer — we would rather show you nothing than pad the list. New DoD notices are ingested every morning.'
              : 'Nothing matches this filter.'}
          </p>
        </div>
      )}

      <ul className="v3-list">
        {visible.map((o) => {
          const due = daysUntil(o.responseDeadline);
          const meta = [
            o.org,
            o.noticeType,
            formatUsd(o.estimatedValue),
            o.responseDeadline ? `due ${formatDate(o.responseDeadline)}${due ? ` (${due})` : ''}` : null,
          ].filter(Boolean);

          return (
            <li key={o.opportunityId} className="v3-row">
              <div className="v3-row-main">
                <div className="v3-row-head">
                  <span className={`v3-fit v3-fit-${o.fit}`}>{o.fit === 'strong' ? 'Strong fit' : 'Fair fit'}</span>
                  {o.recommendation && (
                    <span className={`v3-rec v3-rec-${o.recommendation}`}>
                      {RECOMMENDATION_LABELS[o.recommendation] ?? o.recommendation}
                    </span>
                  )}
                  {o.recompeteConfidence && (
                    <span className="v3-tag">Recompete: {o.recompeteConfidence}</span>
                  )}
                </div>

                <h2 className="v3-row-title">
                  <Link href={`/brief/${o.opportunityId}`}>{o.title}</Link>
                </h2>

                <p className="v3-row-meta">{meta.join(' · ')}</p>

                {/* §5: the reasons, never the number. */}
                {o.evidence.length > 0 && (
                  <ul className="v3-evidence">
                    {o.evidence.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}

                {o.incumbent && <p className="v3-row-incumbent">Incumbent: {o.incumbent}</p>}

                {o.nextAction && (
                  <p className="v3-row-action"><strong>Next:</strong> {o.nextAction}</p>
                )}
              </div>

              <div className="v3-row-actions">
                <Link href={`/brief/${o.opportunityId}`} className="v3-btn v3-btn-primary">
                  Open brief
                </Link>
                <button
                  className="v3-btn v3-btn-ghost"
                  disabled={busy === o.opportunityId}
                  onClick={() => act(o.opportunityId, o.saved ? 'unsave' : 'save')}
                >
                  {o.saved ? 'Saved' : 'Save'}
                </button>
                <button
                  className="v3-btn v3-btn-ghost"
                  disabled={busy === o.opportunityId}
                  onClick={() => act(o.opportunityId, 'dismiss')}
                >
                  Dismiss
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
