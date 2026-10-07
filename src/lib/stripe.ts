import Stripe from "stripe";
import { getEnv } from "./env";

let cachedStripe: Stripe | undefined;

// Lazy for the same reason as db.ts — must not run at module-evaluation
// time, or `next build` fails while collecting route config pre-env-setup.
function getStripeClient(): Stripe {
  if (!cachedStripe) {
    cachedStripe = new Stripe(getEnv("STRIPE_SECRET_KEY"));
  }
  return cachedStripe;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient();
    return Reflect.get(client, prop, client);
  },
});

// Stripe errors carry `requestId` (req_…), which is what Stripe support
// asks for — a bare `console.error(err)` buries it, so normalise into one
// loggable object.
export function describeStripeError(err: unknown): Record<string, unknown> {
  if (err instanceof Stripe.errors.StripeError) {
    return {
      name: err.name,
      message: err.message,
      type: err.type,
      code: err.code,
      requestId: err.requestId,
      statusCode: err.statusCode,
    };
  }
  if (err instanceof Error) {
    return { name: err.name, message: err.message };
  }
  return { message: String(err) };
}

export type BillingInterval = "monthly" | "annual";

// Prices are passed inline (price_data) rather than as dashboard Price IDs,
// so there's nothing to create in Stripe for pricing — same as the
// hardcoded amounts under GoCardless.
const ESSENTIAL_PENCE_BY_INTERVAL: Record<BillingInterval, number> = {
  monthly: 49700,
  annual: 497000,
};

const STRIPE_INTERVAL_BY_INTERVAL: Record<BillingInterval, "month" | "year"> =
  {
    monthly: "month",
    annual: "year",
  };

export function createEssentialCheckoutSession(
  interval: BillingInterval,
  origin: string,
  termsAcceptedAt: string,
  registration: { id: string; email: string }
) {
  const metadata = {
    registrationId: registration.id,
    interval,
    termsAcceptedAt,
  };
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: ESSENTIAL_PENCE_BY_INTERVAL[interval],
          recurring: { interval: STRIPE_INTERVAL_BY_INTERVAL[interval] },
          product_data: { name: "Throneside Assets — Essential" },
        },
      },
    ],
    success_url: `${origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/join`,
    customer_email: registration.email,
    client_reference_id: registration.id,
    metadata,
    subscription_data: { metadata },
  });
}
