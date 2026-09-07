import { NextRequest, NextResponse } from "next/server";
import { upsertGhlContact } from "@/lib/ghl";

// Lead capture from the website chat widget. Pushes the visitor into GHL
// (the system of record for CRM) tagged "website-chat" so the existing
// contact-creation workflows pick it up — same pattern as the call
// screener. There's no local table: GHL is the source of truth here.

type Turn = { role: "user" | "assistant"; content: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function cleanTranscript(input: unknown): Turn[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (t): t is Turn =>
        !!t &&
        typeof t === "object" &&
        ((t as Turn).role === "user" || (t as Turn).role === "assistant") &&
        typeof (t as Turn).content === "string" &&
        (t as Turn).content.trim().length > 0
    )
    .slice(-10)
    .map((t) => ({ role: t.role, content: t.content.trim().slice(0, 1000) }));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const note =
    typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
  const transcript = cleanTranscript(body?.transcript);

  if (!name || name.length > 120 || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter your name and a valid email address." },
      { status: 400 }
    );
  }

  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.join(" ") || undefined;

  const message = [
    "Lead captured from the website chat widget.",
    note ? `\nTheir message: ${note}` : null,
    transcript.length
      ? `\nRecent conversation:\n${transcript
          .map(
            (t) =>
              `${t.role === "user" ? "Visitor" : "Assistant"}: ${t.content}`
          )
          .join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4000);

  try {
    await upsertGhlContact({
      firstName,
      lastName,
      email,
      source: "website-chat",
      tags: ["website-chat"],
      message,
    });
  } catch (err) {
    console.error("Chat lead: GHL upsert failed", err);
    return NextResponse.json(
      { error: "Could not send that right now — please try /contact." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
