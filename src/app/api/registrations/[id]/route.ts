import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { registrations } from "@/lib/schema";

// Step 2 of /join — the screening questions, submitted after contact
// details and before plan selection. Same question set as the separate
// pre-call screener (src/lib/callScreener.ts / /api/call-screener), asked
// here instead so it's part of the same funnel-tracking row.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json().catch(() => ({}));
  const {
    budget,
    goals,
    preferredLocation,
    experienceLevel,
    additionalInfo,
    companyName,
    hasGuarantor,
  } = data;

  if (
    typeof budget !== "string" ||
    !budget.trim() ||
    typeof goals !== "string" ||
    !goals.trim() ||
    typeof preferredLocation !== "string" ||
    !preferredLocation.trim() ||
    typeof experienceLevel !== "string" ||
    !experienceLevel.trim() ||
    typeof hasGuarantor !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  const updated = await db
    .update(registrations)
    .set({
      budget: budget.trim(),
      goals: goals.trim(),
      preferredLocation: preferredLocation.trim(),
      experienceLevel: experienceLevel.trim(),
      additionalInfo:
        typeof additionalInfo === "string"
          ? additionalInfo.trim() || null
          : null,
      companyName:
        typeof companyName === "string" ? companyName.trim() || null : null,
      hasGuarantor,
      stage: "screening_completed",
      screeningCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
