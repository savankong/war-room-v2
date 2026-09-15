/**
 * Stripe billing — engineering spec §8, product spec §9.
 *
 * "One tier. $149/month, 14 day trial." No ladder at launch: "we don't yet
 *  know which features carry the value, so a ladder would be guesswork."
 *
 * Acceptance criterion 9: Stripe checkout creates an active subscription and
 * the webhook flips `plan` to `capture`.
 */
import Stripe from 'stripe';
import type postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

/** Product spec §9. The price itself lives in Stripe; this is the trial length. */
export const TRIAL_DAYS = 14;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://warroomusa.com').replace(/\/$/, '');
}

export interface CheckoutInput {
  userCompanyId: string;
  email: string;
  stripe?: Stripe;
}

export async function createCheckoutSession(sql: Sql, input: CheckoutInput): Promise<{ url: string }> {
  const priceId = process.env.STRIPE_PRICE_ID_CAPTURE;
  if (!priceId) throw new Error('STRIPE_PRICE_ID_CAPTURE not set');

  const stripe = input.stripe ?? getStripe();

  const [company] = await sql<{ id: string; name: string; stripe_customer_id: string | null }[]>`
    SELECT id, name, stripe_customer_id FROM user_companies WHERE id = ${input.userCompanyId}
  `;
  if (!company) throw new Error(`No user_companies row ${input.userCompanyId}`);

  // Reuse the customer so a second checkout does not orphan the first.
  let customerId = company.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: input.email,
      name: company.name,
      metadata: { user_company_id: company.id },
    });
    customerId = customer.id;
    await sql`UPDATE user_companies SET stripe_customer_id = ${customerId}, updated_at = now() WHERE id = ${company.id}`;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { user_company_id: company.id },
    },
    // The webhook is the source of truth for plan state; these only decide
    // where the browser lands.
    success_url: `${appUrl()}/today?checkout=success`,
    cancel_url: `${appUrl()}/settings?checkout=cancelled`,
    // Carried so the webhook can find the company even if the subscription
    // metadata is missing.
    metadata: { user_company_id: company.id },
  });

  if (!session.url) throw new Error('Stripe returned a checkout session with no URL');
  return { url: session.url };
}

export async function createPortalSession(
  sql: Sql,
  userCompanyId: string,
  stripeClient?: Stripe,
): Promise<{ url: string }> {
  const stripe = stripeClient ?? getStripe();
  const [company] = await sql<{ stripe_customer_id: string | null }[]>`
    SELECT stripe_customer_id FROM user_companies WHERE id = ${userCompanyId}
  `;
  if (!company?.stripe_customer_id) throw new Error('This company has no Stripe customer yet');

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripe_customer_id,
    return_url: `${appUrl()}/settings`,
  });
  return { url: session.url };
}

/**
 * Stripe subscription status -> our `plan`.
 *
 * `trialing` stays on 'trial' rather than jumping to 'capture': the customer
 * has not paid yet, and the distinction is what makes trial-to-paid
 * conversion (product spec §11) measurable.
 */
function planFor(status: Stripe.Subscription.Status): 'trial' | 'capture' | 'cancelled' {
  switch (status) {
    case 'active':
    case 'past_due': // still has access while Stripe retries
      return 'capture';
    case 'trialing':
      return 'trial';
    default:
      // canceled, incomplete, incomplete_expired, unpaid, paused
      return 'cancelled';
  }
}

async function applySubscription(sql: Sql, subscription: Stripe.Subscription): Promise<void> {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const companyId = subscription.metadata?.user_company_id ?? null;
  const plan = planFor(subscription.status);

  // Match on the company id from metadata when present, else on the customer.
  const rows = await sql<{ id: string }[]>`
    UPDATE user_companies SET
      plan                   = ${plan},
      stripe_subscription_id = ${subscription.id},
      stripe_customer_id     = COALESCE(stripe_customer_id, ${customerId}),
      updated_at             = now()
    WHERE id = ${companyId} OR stripe_customer_id = ${customerId}
    RETURNING id
  `;

  if (!rows.length) {
    console.warn(`Stripe subscription ${subscription.id} matched no user_companies row (customer ${customerId})`);
  }
}

export interface WebhookResult {
  handled: boolean;
  type: string;
}

/**
 * Verifies the signature and applies the event.
 *
 * The raw body must be the exact bytes Stripe sent — any JSON round-trip
 * invalidates the signature, which is why the route handler passes
 * `await req.text()` rather than a parsed object.
 */
export async function handleStripeWebhook(
  sql: Sql,
  rawBody: string,
  signature: string,
  stripeClient?: Stripe,
): Promise<WebhookResult> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not set');

  const stripe = stripeClient ?? getStripe();
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const companyId = session.metadata?.user_company_id;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (companyId && customerId) {
        await sql`
          UPDATE user_companies
          SET stripe_customer_id = ${customerId}, updated_at = now()
          WHERE id = ${companyId}
        `;
      }

      // The subscription object carries the authoritative status.
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await applySubscription(sql, subscription);
      }
      return { handled: true, type: event.type };
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await applySubscription(sql, event.data.object as Stripe.Subscription);
      return { handled: true, type: event.type };
    }

    default:
      return { handled: false, type: event.type };
  }
}

export { planFor as __planForTesting };
