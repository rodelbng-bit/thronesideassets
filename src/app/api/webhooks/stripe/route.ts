import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getEnv } from "@/lib/env";
import {
  ensureUserForCheckoutSession,
  syncSubscriptionStatusByCustomerId,
  type SyncableStatus,
} from "@/lib/membership";
import { sendAccountSetupEmail } from "@/lib/mailer";

function mapStripeStatus(
  eventType: string,
  stripeStatus: Stripe.Subscription.Status
): SyncableStatus {
  if (eventType === "customer.subscription.deleted") return "canceled";
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "past_due" || stripeStatus === "unpaid") return "past_due";
  return "canceled";
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { email, resetToken } = await ensureUserForCheckoutSession(
          session
        );
        if (resetToken) {
          await sendAccountSetupEmail(email, resetToken);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        await syncSubscriptionStatusByCustomerId(
          customerId,
          mapStripeStatus(event.type, subscription.status)
        );
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handling failed", err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
