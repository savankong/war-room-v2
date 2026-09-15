/**
 * Deterministic template brief — engineering spec §6.
 *
 * "Reject and retry once on schema violation, then fall back to a
 *  deterministic template brief."
 *
 * This is what the customer sees when the model fails twice, so it has to be
 * genuinely useful rather than an apology. Everything here is assembled from
 * the same context object the model would have received, which means it
 * cannot invent anything — the honesty rules in product spec §8 hold by
 * construction.
 */
import { formatUsd } from './incumbent';
import type { BriefContext } from './context';
import type { BriefOutput } from './schema';
import { MAX_PEOPLE } from './schema';

function recommendFor(context: BriefContext): BriefOutput['recommendation'] {
  const { fit, recompete, opportunity } = context;

  // A pre-RFP notice with a strong fit is the case the whole product exists
  // for: the requirement is still being shaped.
  if (fit.bucket === 'strong' && opportunity.isPreRfp) return 'position_now';
  if (fit.bucket === 'strong') return 'pursue';

  if (fit.bucket === 'fair') {
    // A recompete that is actually moving is worth positioning for even on a
    // fair fit; one with no timing signal is not yet actionable.
    if (recompete.confidence === 'high') return 'position_now';
    return 'monitor';
  }

  return 'pass';
}

function deadlineClause(context: BriefContext): string {
  const deadline = context.opportunity.responseDeadline;
  return deadline ? ` before responses close on ${deadline}` : '';
}

export function buildFallbackBrief(context: BriefContext): BriefOutput {
  const { company, opportunity, fit, incumbent, recompete } = context;
  const org = opportunity.org ?? opportunity.officeName ?? 'an unresolved DoD organization';

  const summaryParts = [
    `${org} posted ${opportunity.title}${opportunity.noticeType ? ` as a ${opportunity.noticeType}` : ''}.`,
  ];
  if (opportunity.estimatedValue !== null) {
    summaryParts.push(`Estimated value ${formatUsd(opportunity.estimatedValue)}.`);
  }
  if (opportunity.responseDeadline) {
    summaryParts.push(`Responses are due ${opportunity.responseDeadline}.`);
  }
  summaryParts.push(
    `We scored this a ${fit.bucket} fit for ${company.name}. This brief was assembled from our own data rather than written up, so it is shorter than usual.`,
  );

  const whyItMatters = fit.evidence.length
    ? [...fit.evidence]
    : ['No specific alignment was found between this notice and your capability profile.'];

  if (incumbent.found) {
    const held = incumbent.recipient ? `Currently held by ${incumbent.recipient}` : 'A prior contract was identified';
    const ends = incumbent.endDate ? `, ending ${incumbent.endDate}` : '';
    const worth = incumbent.totalObligation !== null ? ` (${formatUsd(incumbent.totalObligation)} obligated)` : '';
    whyItMatters.push(`${held}${ends}${worth}.`);
  } else {
    whyItMatters.push('No prior contract was identified for this requirement, so there is no incumbent read.');
  }

  const recommendation = recommendFor(context);

  const rationale: string[] = [`Fit is ${fit.bucket}.`];
  if (opportunity.isPreRfp) {
    rationale.push('This is a pre-RFP notice, so the requirement is still being shaped — the point at which positioning still changes the outcome.');
  }
  if (recompete.confidence) {
    rationale.push(`Recompete confidence is ${recompete.confidence}.`);
    rationale.push(...recompete.evidence);
  }

  // §6 caps people at five. Take the highest-ranked candidates, which
  // findCandidatePeople has already ordered by role.
  const people = context.candidatePeople.slice(0, MAX_PEOPLE).map((person) => ({
    person_id: person.person_id,
    why: person.role
      ? `${person.role} at ${person.org ?? org}.`
      : `Listed at ${person.org ?? org}.`,
    suggested_action: 'Confirm the role is current before reaching out.',
  }));

  let nextAction: string;
  switch (recommendation) {
    case 'position_now':
      nextAction = `Respond to this notice${deadlineClause(context)} and introduce ${company.name} to the office before the solicitation is written.`;
      break;
    case 'pursue':
      nextAction = `Review the full notice on SAM.gov and decide on a bid${deadlineClause(context)}.`;
      break;
    case 'monitor':
      nextAction = 'Watch this office for a follow-on notice; there is nothing to act on yet.';
      break;
    case 'partner':
      nextAction = 'Identify a prime already working this office before committing time.';
      break;
    default:
      nextAction = 'No action recommended. The fit is too thin to justify the time.';
  }

  return {
    summary: summaryParts.join(' '),
    why_it_matters: whyItMatters,
    recommendation,
    recommendation_rationale: rationale,
    people,
    next_action: nextAction,
  };
}
