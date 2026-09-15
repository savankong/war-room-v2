'use client';

/**
 * Capture Brief — engineering spec §7.3.
 *
 * "One page per company and opportunity: Opportunity, Why it matters, Fit with
 *  evidence, Prior contract, Recompete, People, Recommended action. Feedback
 *  buttons at the bottom writing to feedback."
 *
 * Product spec §8 rules are visible in the markup: every confidence label
 * renders its evidence underneath it, and where something was not found the
 * page says so rather than leaving a blank.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError, formatUsd, formatDate, daysUntil } from '@/lib/client-api';

interface BriefResponse {
  opportunity: {
    id: string;
    title: string;
    description: string | null;
    notice_type: string | null;
    solicitation_number: string | null;
    naics_code: string | null;
    psc_code: string | null;
    set_aside: string | null;
    estimated_value: number | null;
    posted_date: string | null;
    response_deadline: string | null;
    ui_url: string | null;
    place_of_performance: string | null;
    org_label: string | null;
    office_name: string | null;
  } | null;
  fit: { bucket: 'strong' | 'fair' | 'weak'; evidence: string[] };
  brief: {
    recommendation: string;
    summary: string | null;
    whyItMatters: string[];
    recommendationRationale: string[];
    nextAction: string | null;
    people: Array<{ person_id: string; why: string; suggested_action: string; name?: string; title?: string | null }>;
    generator: 'llm' | 'template';
    generatedAt: string;
  };
  incumbent: {
    id: string;
    title: string;
    recipient: string | null;
    award_date: string | null;
    start_date: string | null;
    end_date: string | null;
    total_obligation: number | null;
    vehicle: string | null;
    modification_count: number | null;
  } | null;
  incumbentEvidence: string[];
  recompete: { confidence: 'high' | 'medium' | 'low' | null; evidence: string[] };
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  pursue: 'Pursue',
  position_now: 'Position now',
  monitor: 'Monitor',
  partner: 'Partner',
  pass: 'Pass',
};

const VERDICTS: Array<[string, string]> = [
  ['relevant', 'Relevant'],
  ['pursuing', 'Pursuing'],
  ['not_relevant', 'Not relevant'],
  ['already_knew', 'Already knew'],
  ['too_early', 'Too early'],
  ['wrong_capability', 'Wrong capability'],
  ['passed', 'Passed'],
];

export default function BriefClient({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [data, setData] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [savingVerdict, setSavingVerdict] = useState(false);

  // Generating a brief is an LLM call, so this request can run for several
  // seconds — long enough that navigating away mid-flight is likely, and the
  // cancelled guard is doing real work.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { company } = await apiFetch<{ company: { id: string } | null }>('/api/companies');
        if (cancelled) return;

        if (!company) {
          router.push('/onboarding');
          return;
        }
        setCompanyId(company.id);

        const brief = await apiFetch<BriefResponse>(
          `/api/briefs/${encodeURIComponent(company.id)}/${encodeURIComponent(opportunityId)}`,
        );
        if (cancelled) return;
        setData(brief);
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
  }, [opportunityId, router]);

  async function submitVerdict(value: string) {
    if (!companyId) return;
    setSavingVerdict(true);
    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ companyId, opportunityId, verdict: value }),
      });
      setVerdict(value);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingVerdict(false);
    }
  }

  if (loading) {
    return (
      <div className="v3-page">
        <p className="v3-muted">Building the brief… this can take a few seconds the first time.</p>
      </div>
    );
  }

  if (error || !data?.opportunity) {
    return (
      <div className="v3-page">
        <div className="v3-error" role="alert">{error ?? 'That brief could not be loaded.'}</div>
        <Link href="/today" className="v3-btn v3-btn-ghost">Back to Today</Link>
      </div>
    );
  }

  const { opportunity, fit, brief, incumbent, incumbentEvidence, recompete } = data;
  const due = daysUntil(opportunity.response_deadline);

  return (
    <article className="v3-page v3-brief">
      <Link href="/today" className="v3-back">← Today</Link>

      <header className="v3-brief-head">
        <div className="v3-row-head">
          <span className={`v3-fit v3-fit-${fit.bucket}`}>
            {fit.bucket === 'strong' ? 'Strong fit' : fit.bucket === 'fair' ? 'Fair fit' : 'Weak fit'}
          </span>
          <span className={`v3-rec v3-rec-${brief.recommendation}`}>
            {RECOMMENDATION_LABELS[brief.recommendation] ?? brief.recommendation}
          </span>
        </div>
        <h1 className="v3-title">{opportunity.title}</h1>
        <p className="v3-muted">
          {[
            opportunity.org_label,
            opportunity.office_name,
            opportunity.notice_type,
            opportunity.solicitation_number,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {brief.summary && <p className="v3-lede">{brief.summary}</p>}

      <section className="v3-section">
        <h2>Opportunity</h2>
        <dl className="v3-facts">
          <div><dt>Estimated value</dt><dd>{formatUsd(opportunity.estimated_value) ?? 'Not published'}</dd></div>
          <div>
            <dt>Responses due</dt>
            <dd>
              {opportunity.response_deadline
                ? `${formatDate(opportunity.response_deadline)}${due ? ` (${due})` : ''}`
                : 'No deadline published'}
            </dd>
          </div>
          <div><dt>Posted</dt><dd>{formatDate(opportunity.posted_date) ?? 'Unknown'}</dd></div>
          <div><dt>Set-aside</dt><dd>{opportunity.set_aside ?? 'Full and open'}</dd></div>
          <div><dt>NAICS</dt><dd>{opportunity.naics_code ?? 'Not specified'}</dd></div>
          <div><dt>PSC</dt><dd>{opportunity.psc_code ?? 'Not specified'}</dd></div>
          <div><dt>Place of performance</dt><dd>{opportunity.place_of_performance ?? 'Not specified'}</dd></div>
        </dl>
        {opportunity.ui_url && (
          <p><a href={opportunity.ui_url} target="_blank" rel="noopener noreferrer">View the full notice on SAM.gov →</a></p>
        )}
      </section>

      {brief.whyItMatters.length > 0 && (
        <section className="v3-section">
          <h2>Why it matters</h2>
          <ul className="v3-bullets">
            {brief.whyItMatters.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </section>
      )}

      <section className="v3-section">
        <h2>Fit</h2>
        {/* §8 rule 3: the label always carries its evidence. */}
        <ul className="v3-bullets">
          {fit.evidence.length ? (
            fit.evidence.map((line, i) => <li key={i}>{line}</li>)
          ) : (
            <li className="v3-muted">No specific alignment was recorded for this match.</li>
          )}
        </ul>
      </section>

      <section className="v3-section">
        <h2>Prior contract</h2>
        {incumbent ? (
          <>
            <dl className="v3-facts">
              <div><dt>Incumbent</dt><dd>{incumbent.recipient ?? 'Not recorded'}</dd></div>
              <div><dt>Contract</dt><dd>{incumbent.title}</dd></div>
              <div><dt>Awarded</dt><dd>{formatDate(incumbent.award_date) ?? 'Unknown'}</dd></div>
              <div><dt>Expires</dt><dd>{formatDate(incumbent.end_date) ?? 'Unknown'}</dd></div>
              <div><dt>Total obligated</dt><dd>{formatUsd(incumbent.total_obligation) ?? 'Not recorded'}</dd></div>
              <div><dt>Vehicle</dt><dd>{incumbent.vehicle ?? 'Not recorded'}</dd></div>
              <div>
                <dt>Modifications</dt>
                <dd>{incumbent.modification_count ?? 'Not recorded'}</dd>
              </div>
            </dl>
            {incumbentEvidence.length > 0 && (
              <ul className="v3-bullets v3-bullets-quiet">
                {incumbentEvidence.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            )}
          </>
        ) : (
          // §8 rule 1: if we can't find the incumbent, the brief says we couldn't.
          <p className="v3-muted">
            {incumbentEvidence[0] ?? 'No prior contract was identified for this requirement in our award data.'}
          </p>
        )}
      </section>

      <section className="v3-section">
        <h2>Recompete</h2>
        {recompete.confidence ? (
          <>
            <p>
              <span className={`v3-conf v3-conf-${recompete.confidence}`}>
                {recompete.confidence} confidence
              </span>
            </p>
            <ul className="v3-bullets">
              {recompete.evidence.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </>
        ) : (
          <p className="v3-muted">No recompete read was possible for this requirement.</p>
        )}
      </section>

      <section className="v3-section">
        <h2>People who matter</h2>
        {brief.people.length ? (
          <ul className="v3-people">
            {brief.people.map((person) => (
              <li key={person.person_id}>
                <p className="v3-person-name">
                  {person.name ?? 'Unnamed contact'}
                  {person.title ? <span className="v3-muted"> · {person.title}</span> : null}
                </p>
                <p>{person.why}</p>
                <p className="v3-row-action"><strong>Suggested:</strong> {person.suggested_action}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="v3-muted">
            We could not identify specific people for this office. Rather than guess at names, we have left this blank.
          </p>
        )}
      </section>

      <section className="v3-section v3-section-action">
        <h2>Recommended action</h2>
        <p className="v3-next-action">{brief.nextAction ?? 'No action recommended.'}</p>
        {brief.recommendationRationale.length > 0 && (
          <ul className="v3-bullets">
            {brief.recommendationRationale.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}
      </section>

      <section className="v3-section v3-feedback">
        <h2>Was this useful?</h2>
        <p className="v3-muted">One tap. This is what tunes your ranking.</p>
        <div className="v3-verdicts">
          {VERDICTS.map(([value, label]) => (
            <button
              key={value}
              className={`v3-btn v3-btn-ghost${verdict === value ? ' on' : ''}`}
              disabled={savingVerdict || verdict !== null}
              onClick={() => submitVerdict(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {verdict && <p className="v3-muted">Thanks — recorded.</p>}
      </section>

      {brief.generator === 'template' && (
        <p className="v3-muted v3-footnote">
          This brief was assembled from our own data rather than written up, so it is shorter than usual.
        </p>
      )}
    </article>
  );
}
