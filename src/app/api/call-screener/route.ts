import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callScreenerResponses } from "@/lib/schema";
import { upsertGhlContact } from "@/lib/ghl";

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
  } = data;

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
    message: [
      `Budget: ${response.budget}`,
      `Goals: ${response.goals}`,
      `Preferred location: ${response.preferredLocation}`,
      `Experience level: ${response.experienceLevel}`,
      response.additionalInfo ? `Additional info: ${response.additionalInfo}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  }).catch((err) => console.error("Failed to push screener response to GHL", err));

  return NextResponse.json({ ok: true, id: response.id });
}
