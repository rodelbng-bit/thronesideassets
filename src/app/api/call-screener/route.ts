import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callScreenerResponses } from "@/lib/schema";
import { upsertGhlContact } from "@/lib/ghl";
import { sanitizeAttribution } from "@/lib/attribution";
import { sendMetaEvent } from "@/lib/metaCapi";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const {
    firstName,
    lastName,
    email,
    phone,
    budget,
    goals,
    preferredLocation,
    experienceLevel,
    additionalInfo,
    meta,
  } = data;
  const attribution = sanitizeAttribution(data.attribution);

  if (
    typeof firstName !== "string" ||
    !firstName.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof phone !== "string" ||
    !phone.trim() ||
    typeof budget !== "string" ||
    !budget.trim() ||
    typeof goals !== "string" ||
    !goals.trim() ||
    typeof preferredLocation !== "string" ||
    !preferredLocation.trim() ||
    typeof experienceLevel !== "string" ||
    !experienceLevel.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  const [response] = await db
    .insert(callScreenerResponses)
    .values({
      firstName: firstName.trim(),
      lastName: typeof lastName === "string" ? lastName.trim() || null : null,
      email: email.trim(),
      phone: phone.trim(),
      budget: budget.trim(),
      goals: goals.trim(),
      preferredLocation: preferredLocation.trim(),
      experienceLevel: experienceLevel.trim(),
      additionalInfo:
        typeof additionalInfo === "string" ? additionalInfo.trim() || null : null,
      ...attribution,
    })
    .returning();

  // Best-effort — a failed GHL push shouldn't block the visitor from
  // reaching the calendar. The response row above is the source of truth
  // our team reviews from regardless.
  upsertGhlContact({
    firstName: response.firstName,
    lastName: response.lastName ?? undefined,
    email: response.email,
    phone: response.phone,
    source: "call-screener",
    tags: ["call-screener", ...(attribution.funnel ? [`funnel-${attribution.funnel}`] : [])],
    message: [
      `Budget: ${response.budget}`,
      `Goals: ${response.goals}`,
      `Preferred location: ${response.preferredLocation}`,
      `Experience level: ${response.experienceLevel}`,
      response.additionalInfo ? `Additional info: ${response.additionalInfo}` : null,
      attributionLine(attribution),
    ]
      .filter(Boolean)
      .join("\n"),
  }).catch((err) => console.error("Failed to push screener response to GHL", err));

  // Server copy of the browser's Lead event (same eventId, so Meta
  // de-duplicates). Only sent when the visitor accepted ad cookies.
  if (meta?.consent === true && typeof meta.eventId === "string") {
    sendMetaEvent({
      eventName: "Lead",
      eventId: meta.eventId.slice(0, 100),
      eventSourceUrl: req.headers.get("referer") ?? undefined,
      email: response.email,
      phone: response.phone,
      firstName: response.firstName,
      lastName: response.lastName ?? undefined,
      clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: req.headers.get("user-agent") ?? undefined,
      fbp: typeof meta.fbp === "string" ? meta.fbp : undefined,
      fbc: typeof meta.fbc === "string" ? meta.fbc : undefined,
    }).catch((err) => console.error("Failed to send Meta CAPI Lead", err));
  }

  return NextResponse.json({ ok: true, id: response.id });
}

function attributionLine(a: ReturnType<typeof sanitizeAttribution>) {
  const parts = [
    a.funnel && `funnel=${a.funnel}`,
    a.utmSource && `source=${a.utmSource}`,
    a.utmMedium && `medium=${a.utmMedium}`,
    a.utmCampaign && `campaign=${a.utmCampaign}`,
    a.utmContent && `content=${a.utmContent}`,
    a.utmTerm && `term=${a.utmTerm}`,
  ].filter(Boolean);
  return parts.length ? `Ad attribution: ${parts.join(", ")}` : null;
}
