import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { handleStripeWebhook } from '@/lib/billing/stripe';

/**
 * POST /api/stripe/webhook
 *
 * Acceptance criterion 9: "Stripe checkout creates an active subscription and
 * the webhook flips plan to capture."
 *
 * The raw body is read with req.text() and passed through untouched. Stripe
 * signs the exact bytes it sent, so any JSON round-trip invalidates the
 * signature and every event would be rejected.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await req.text();

  try {
    const result = await handleStripeWebhook(getDb(), rawBody, signature);
    // 200 on an unhandled type as well: a non-2xx tells Stripe to retry, and
    // it would retry an event we will never handle forever.
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    const message = (err as Error).message;

    // A signature failure is not retryable — 400 so Stripe stops.
    if (/signature/i.test(message)) {
      console.error(`Stripe webhook signature verification failed: ${message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Anything else might be transient (database down mid-event), so 500 and
    // let Stripe retry.
    console.error(`Stripe webhook handling failed: ${message}`);
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}
