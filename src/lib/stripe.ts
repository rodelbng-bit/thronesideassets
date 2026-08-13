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
  get(_target, prop, receiver) {
    return Reflect.get(getStripeClient(), prop, receiver);
  },
});

export type BillingInterval = "monthly" | "annual";

const PRICE_ENV_BY_INTERVAL: Record<BillingInterval, string> = {
  monthly: "STRIPE_PRICE_ESSENTIAL_MONTHLY",
  annual: "STRIPE_PRICE_ESSENTIAL_ANNUAL",
};

export function essentialPriceId(interval: BillingInterval) {
  return getEnv(PRICE_ENV_BY_INTERVAL[interval]);
}

export function createEssentialCheckoutSession(
  interval: BillingInterval,
  origin: string
) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: essentialPriceId(interval), quantity: 1 }],
    success_url: `${origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/join`,
  });
}
