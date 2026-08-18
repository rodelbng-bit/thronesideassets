import { NextRequest, NextResponse } from "next/server";
import { createEssentialCheckoutSession, type BillingInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const interval = body.interval as BillingInterval | undefined;
  const agreedToTerms = body.agreedToTerms === true;

  if (interval !== "monthly" && interval !== "annual") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }
  if (!agreedToTerms) {
    return NextResponse.json(
      { error: "You must agree to the 12-month membership term" },
      { status: 400 }
    );
  }

  try {
    const session = await createEssentialCheckoutSession(
      interval,
      req.nextUrl.origin,
      new Date().toISOString()
    );
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
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
