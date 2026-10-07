import { NextRequest, NextResponse } from "next/server";
import { upsertGhlContact } from "@/lib/ghl";
import { sendMetaEvent } from "@/lib/metaCapi";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// First-visit popup on the marketing pages. GHL is the only store for these
// leads (no DB row), so unlike the call screener this waits for the upsert
// and reports a failure back to the visitor instead of dropping the lead.
export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — hidden from people, filled in by form-spamming bots. Pretend
  // it worked so the bot moves on.
  if (typeof data.company === "string" && data.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const firstName = clean(data.firstName, 100);
  const email = clean(data.email, 254);
  const phone = clean(data.phone, 40);

  if (!firstName || !email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Please enter your name and a valid email address." },
      { status: 400 }
    );
  }

  try {
    await upsertGhlContact({
      firstName,
      email,
      phone: phone || undefined,
      tags: ["website-popup"],
    });
  } catch (err) {
    console.error("Failed to push welcome popup lead to GHL", err);
    return NextResponse.json(
      { error: "Something went wrong — please try again in a moment." },
      { status: 502 }
    );
  }

  // Server copy of the browser's Lead event (same eventId, so Meta
  // de-duplicates). Only sent when the visitor accepted ad cookies.
  const meta = data.meta;
  if (meta?.consent === true && typeof meta.eventId === "string") {
    sendMetaEvent({
      eventName: "Lead",
      eventId: meta.eventId.slice(0, 100),
      eventSourceUrl: req.headers.get("referer") ?? undefined,
      email,
      phone: phone || undefined,
      firstName,
      clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: req.headers.get("user-agent") ?? undefined,
      fbp: typeof meta.fbp === "string" ? meta.fbp : undefined,
      fbc: typeof meta.fbc === "string" ? meta.fbc : undefined,
    }).catch((err) => console.error("Failed to send Meta CAPI Lead", err));
  }

  return NextResponse.json({ ok: true });
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
