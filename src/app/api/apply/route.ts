import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { funnelApplications } from "@/lib/schema";
import { upsertGhlContact } from "@/lib/ghl";
import { sanitizeAttribution } from "@/lib/attribution";
import { sendMetaEvent } from "@/lib/metaCapi";
import { applicationTags, splitName } from "@/lib/applicationServer";

// Step 1 of the /start/apply questionnaire. Saves the contact details
// straight away so the lead is kept even if the rest is abandoned; later
// answers are added via PATCH /api/apply/[id].
export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => ({}));
  const { fullName, email, phone, meta } = data;
  const attribution = sanitizeAttribution(data.attribution);

  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof phone !== "string" ||
    phone.replace(/\D/g, "").length < 7
  ) {
    return NextResponse.json(
      { error: "Please enter your name, a valid email and phone number." },
      { status: 400 }
    );
  }

  const [application] = await db
    .insert(funnelApplications)
    .values({
      fullName: fullName.trim().slice(0, 200),
      email: email.trim().slice(0, 320),
      phone: phone.trim().slice(0, 50),
      ...attribution,
    })
    .returning();

  // Best-effort — GHL being down shouldn't stop the questionnaire. The
  // row above is the source of truth.
  upsertGhlContact({
    ...splitName(application.fullName),
    email: application.email,
    phone: application.phone,
    tags: applicationTags(application),
  }).catch((err) => console.error("Failed to push application lead to GHL", err));

  // Server copy of the browser's Lead event (same eventId, so Meta
  // de-duplicates). Only sent when the visitor accepted ad cookies.
  if (meta?.consent === true && typeof meta.eventId === "string") {
    const { firstName, lastName } = splitName(application.fullName);
    sendMetaEvent({
      eventName: "Lead",
      eventId: meta.eventId.slice(0, 100),
      eventSourceUrl: req.headers.get("referer") ?? undefined,
      email: application.email,
      phone: application.phone,
      firstName,
      lastName,
      clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: req.headers.get("user-agent") ?? undefined,
      fbp: typeof meta.fbp === "string" ? meta.fbp : undefined,
      fbc: typeof meta.fbc === "string" ? meta.fbc : undefined,
    }).catch((err) => console.error("Failed to send Meta CAPI Lead", err));
  }

  return NextResponse.json({ id: application.id });
}
