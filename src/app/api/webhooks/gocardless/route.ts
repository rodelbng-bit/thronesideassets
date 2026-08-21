import { NextRequest, NextResponse } from "next/server";
import { parse, type Event } from "gocardless-nodejs";
import {
  gocardlessClient,
  createEssentialSubscription,
  type BillingInterval,
} from "@/lib/gocardless";
import { getEnv } from "@/lib/env";
import {
  ensureUserForBillingRequest,
  syncSubscriptionStatusByMandateId,
  type SyncableStatus,
} from "@/lib/membership";
import { sendAccountSetupEmail } from "@/lib/mailer";

const CANCELED_MANDATE_ACTIONS = new Set(["failed", "cancelled", "expired"]);
const PAST_DUE_PAYMENT_ACTIONS = new Set(["failed", "charged_back"]);
const CANCELED_SUBSCRIPTION_ACTIONS = new Set(["cancelled", "finished"]);

async function handleEvent(event: Event) {
  switch (event.resource_type) {
    case "billing_requests": {
      if (event.action !== "fulfilled") return;
      const billingRequestId = event.links?.billing_request;
      if (!billingRequestId) return;

      const billingRequest = await gocardlessClient.billingRequests.find(
        billingRequestId
      );
      const { email, resetToken } = await ensureUserForBillingRequest(
        billingRequest
      );
      if (resetToken) {
        await sendAccountSetupEmail(email, resetToken);
      }

      const mandateId = billingRequest.links?.mandate_request_mandate;
      const registrationId = billingRequest.metadata?.registrationId;
      const interval = billingRequest.metadata?.interval as
        | BillingInterval
        | undefined;
      if (mandateId && registrationId && interval) {
        await createEssentialSubscription(
          mandateId,
          interval,
          registrationId,
          billingRequestId
        );
      }
      break;
    }
    case "mandates": {
      const mandateId = event.links?.mandate;
      if (mandateId && CANCELED_MANDATE_ACTIONS.has(event.action ?? "")) {
        await syncSubscriptionStatusByMandateId(mandateId, "canceled");
      }
      break;
    }
    case "payments": {
      const mandateId = event.links?.mandate;
      if (!mandateId) return;
      const status: SyncableStatus | undefined =
        event.action === "confirmed"
          ? "active"
          : PAST_DUE_PAYMENT_ACTIONS.has(event.action ?? "")
          ? "past_due"
          : undefined;
      if (status) {
        await syncSubscriptionStatusByMandateId(mandateId, status);
      }
      break;
    }
    case "subscriptions": {
      const mandateId = event.links?.mandate;
      if (
        mandateId &&
        CANCELED_SUBSCRIPTION_ACTIONS.has(event.action ?? "")
      ) {
        await syncSubscriptionStatusByMandateId(mandateId, "canceled");
      }
      break;
    }
    default:
      break;
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("webhook-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();

  let events: Event[];
  try {
    events = parse(body, getEnv("GOCARDLESS_WEBHOOK_SECRET"), signature);
  } catch (err) {
    if (err instanceof Error && err.name === "InvalidSignatureError") {
      console.error("GoCardless webhook signature verification failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 498 });
    }
    throw err;
  }

  try {
    for (const event of events) {
      await handleEvent(event);
    }
  } catch (err) {
    console.error("GoCardless webhook handling failed", err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
