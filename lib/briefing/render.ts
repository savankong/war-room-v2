/**
 * Briefing rendering — engineering spec §9.
 *
 * "Resend. Plain, near-text HTML. No hero images, no card grids. It should
 *  read like a note from an analyst."
 *
 * The text version is the real one and the HTML is a thin wrapper around it,
 * rather than the other way round. That ordering is deliberate: it keeps the
 * design honest — anything that does not survive as plain text was decoration.
 * The §12 manual-briefing template is the shape being matched.
 */
import { formatUsd } from '../capture/incumbent';
import type { BriefingPayload } from './build';

export function renderSubject(payload: BriefingPayload): string {
  const n = payload.opportunities.length;
  const week = new Date(payload.periodEnd).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  if (n === 0) return `Nothing urgent this week, week of ${week}`;
  return `${n} ${n === 1 ? 'thing' : 'things'} worth your attention, week of ${week}`;
}

function opportunityBlock(
  opportunity: BriefingPayload['opportunities'][number],
  index: number,
): string {
  const lines: string[] = [];
  lines.push(`${index + 1}. ${opportunity.title}`);

  const meta = [
    opportunity.org,
    opportunity.noticeType,
    opportunity.estimatedValue !== null ? formatUsd(opportunity.estimatedValue) : null,
    opportunity.responseDeadline ? `responses due ${opportunity.responseDeadline}` : null,
  ].filter(Boolean);
  lines.push(`   ${meta.join(' · ')}`);
  lines.push('');

  lines.push(`   Fit: ${opportunity.fit === 'strong' ? 'STRONG' : 'FAIR'}`);
  if (opportunity.evidence.length) {
    lines.push(`   Why: ${opportunity.evidence[0]}`);
    for (const line of opportunity.evidence.slice(1)) {
      lines.push(`        ${line}`);
    }
  }

  if (opportunity.incumbent) {
    lines.push(`   Incumbent: ${opportunity.incumbent}`);
  }

  if (opportunity.nextAction) {
    lines.push('');
    lines.push(`   What I'd do: ${opportunity.nextAction}`);
  }

  lines.push('');
  lines.push(`   Full brief: ${opportunity.briefUrl}`);
  return lines.join('\n');
}

export function renderText(payload: BriefingPayload): string {
  const out: string[] = [];

  const n = payload.opportunities.length;
  if (n === 0) {
    out.push(
      'Nothing crossed the bar this week. That is a real answer, not an empty inbox — we would rather send you nothing than pad it out.',
    );
  } else {
    out.push(
      `${n} ${n === 1 ? 'opportunity is' : 'opportunities are'} worth your attention this week.`,
    );
  }
  out.push('');

  if (n > 0) {
    out.push('OPPORTUNITIES');
    out.push('');
    payload.opportunities.forEach((opportunity, i) => {
      out.push(opportunityBlock(opportunity, i));
      out.push('');
    });

    // §9: "If there are nine Strong matches, send three and say so."
    const held = payload.totalAvailable - n;
    if (held > 0) {
      out.push(
        `${held} more ${held === 1 ? 'match' : 'matches'} cleared the bar but did not make the top three. They are in the app.`,
      );
      out.push('');
    }
  }

  if (payload.recompete) {
    const r = payload.recompete;
    out.push('RECOMPETE TO START POSITIONING FOR');
    out.push('');
    const holder = r.incumbent ? `held by ${r.incumbent}` : 'incumbent not identified';
    const worth = r.totalObligation !== null ? `, ${formatUsd(r.totalObligation)} obligated` : '';
    out.push(`${r.contractTitle} at ${r.org ?? 'an unnamed office'}, ${holder}${worth}.`);
    out.push(r.why);
    out.push('');
  }

  if (payload.people.length) {
    out.push('PEOPLE YOU SHOULD KNOW');
    out.push('');
    for (const person of payload.people) {
      const title = [person.title, person.org].filter(Boolean).join(', ');
      out.push(`${person.name}${title ? ` — ${title}` : ''}`);
      out.push(`   ${person.why}`);
    }
    out.push('');
  }

  if (payload.signals.length) {
    out.push('SIGNALS');
    out.push('');
    for (const signal of payload.signals) {
      out.push(`- ${signal.line}`);
    }
    out.push('');
  }

  out.push('Anything in here off base? Reply and tell me — it tunes what you get next time.');
  out.push('');
  out.push('War Room');

  return out.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Near-text HTML: one monospace-ish column, real links, nothing else. Built
 * from the text version so the two can never drift.
 */
export function renderHtml(payload: BriefingPayload): string {
  const text = renderText(payload);

  const withLinks = escapeHtml(text).replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color:#2563B8">$1</a>',
  );

  const bolded = withLinks.replace(
    /^(OPPORTUNITIES|RECOMPETE TO START POSITIONING FOR|PEOPLE YOU SHOULD KNOW|SIGNALS)$/gm,
    '<strong>$1</strong>',
  );

  return [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>',
    '<body style="margin:0;padding:24px;background:#ffffff">',
    '<div style="max-width:640px;margin:0 auto;font:14px/1.6 -apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#16202E;white-space:pre-wrap">',
    bolded,
    '</div>',
    '</body></html>',
  ].join('\n');
}
