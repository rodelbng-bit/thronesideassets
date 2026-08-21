import gocardless, { Environments } from "gocardless-nodejs";
import type { GoCardlessClient } from "gocardless-nodejs";
import { getEnv } from "./env";

let cachedClient: GoCardlessClient | undefined;

// Lazy for the same reason as db.ts — must not run at module-evaluation
// time, or `next build` fails while collecting route config pre-env-setup.
function getGoCardlessClient(): GoCardlessClient {
  if (!cachedClient) {
    const environment =
      getEnv("GOCARDLESS_ENVIRONMENT") === "live"
        ? Environments.Live
        : Environments.Sandbox;
    cachedClient = gocardless(getEnv("GOCARDLESS_ACCESS_TOKEN"), environment);
  }
  return cachedClient;
}

export const gocardlessClient: GoCardlessClient = new Proxy(
  {} as GoCardlessClient,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getGoCardlessClient(), prop, receiver);
    },
  }
);

export type BillingInterval = "monthly" | "annual";

// GoCardless has no Price-ID concept — amounts are passed directly on the
// Subscription, so these replace STRIPE_PRICE_ESSENTIAL_*.
const ESSENTIAL_PENCE_BY_INTERVAL: Record<BillingInterval, number> = {
  monthly: 49700,
  annual: 497000,
};

const SUBSCRIPTION_INTERVAL_UNIT_BY_INTERVAL: Record<
  BillingInterval,
  "monthly" | "yearly"
> = {
  monthly: "monthly",
  annual: "yearly",
};

export async function createEssentialBillingRequestFlow(
  interval: BillingInterval,
  origin: string,
  termsAcceptedAt: string,
  registration: { id: string; email: string }
) {
  const billingRequest = await gocardlessClient.billingRequests.create({
    mandate_request: { currency: "GBP" },
    metadata: {
      registrationId: registration.id,
      interval,
      termsAcceptedAt,
    },
  });

  const flow = await gocardlessClient.billingRequestFlows.create({
    redirect_uri: `${origin}/join/success?billing_request_id=${billingRequest.id}`,
    exit_uri: `${origin}/join`,
    prefilled_customer: { email: registration.email },
    links: { billing_request: billingRequest.id },
  });

  if (!flow.authorisation_url) {
    throw new Error("GoCardless did not return an authorisation URL");
  }

  return {
    billingRequestId: billingRequest.id,
    authorisationUrl: flow.authorisation_url,
  };
}

// Called once the mandate behind a Billing Request goes active (from the
// webhook handler and, best-effort, from /join/success) — GoCardless has no
// equivalent of Stripe's "create the subscription as part of Checkout", so
// this is a required second step. Idempotency-keyed off the Billing Request
// id so a retried webhook can't create a duplicate Subscription.
export async function createEssentialSubscription(
  mandateId: string,
  interval: BillingInterval,
  registrationId: string,
  billingRequestId: string
) {
  return gocardlessClient.subscriptions.create(
    {
      amount: String(ESSENTIAL_PENCE_BY_INTERVAL[interval]),
      currency: "GBP",
      name: "Throneside Assets — Essential",
      interval_unit: SUBSCRIPTION_INTERVAL_UNIT_BY_INTERVAL[interval],
      metadata: { registrationId },
      links: { mandate: mandateId },
    },
    `essential-subscription-${billingRequestId}`
  );
}
