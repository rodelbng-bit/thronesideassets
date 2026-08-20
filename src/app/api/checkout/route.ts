import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createEssentialCheckoutSession, type BillingInterval } from "@/lib/stripe";
import { db } from "@/lib/db";
import { registrations } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const interval = body.interval as BillingInterval | undefined;
  const agreedToTerms = body.agreedToTerms === true;
  const registrationId = body.registrationId as string | undefined;

  if (interval !== "monthly" && interval !== "annual") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }
  if (!agreedToTerms) {
    return NextResponse.json(
      { error: "You must agree to the 12-month membership term" },
      { status: 400 }
    );
  }
  if (!registrationId) {
    return NextResponse.json(
      { error: "Missing registration" },
      { status: 400 }
    );
  }

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  // Recorded before the Stripe call — a prospect who picks a plan and
  // agrees to terms is captured even if the Stripe request itself fails.
  try {
    await db
      .update(registrations)
      .set({
        stage: "plan_selected",
        interval,
        planSelectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, registration.id));
  } catch (err) {
    console.error("Failed to mark registration plan_selected", err);
  }

  try {
    const session = await createEssentialCheckoutSession(
      interval,
      req.nextUrl.origin,
      new Date().toISOString(),
      { id: registration.id, email: registration.email }
    );
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    try {
      await db
        .update(registrations)
        .set({
          stage: "payment_started",
          stripeCheckoutSessionId: session.id,
          checkoutStartedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(registrations.id, registration.id));
    } catch (err) {
      // Best-effort — never block a redirect that already has a live
      // Stripe session behind it over a funnel-tracking write failing.
      console.error("Failed to mark registration payment_started", err);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 502 }
    );
  }
}
