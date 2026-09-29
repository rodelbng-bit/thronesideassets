import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { funnelApplications } from "@/lib/schema";
import { upsertGhlContact } from "@/lib/ghl";
import {
  CAPITAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  INELIGIBLE_CAPITAL,
  MAX_DEALS_WANTED,
} from "@/lib/application";
import {
  applicationSummary,
  applicationTags,
  getApplication,
  splitName,
} from "@/lib/applicationServer";

// Steps 2–5 of /start/apply. Each step PATCHes just its own answer, so
// whatever was answered before someone drops off is kept. A disqualified
// application can still be changed — the not-eligible screen lets people
// go back and correct their capital answer.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await getApplication(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }
  if (application.status === "booked") {
    return NextResponse.json(
      { error: "This application can no longer be changed." },
      { status: 409 }
    );
  }

  const data = await req.json().catch(() => ({}));
  const changes: Partial<typeof funnelApplications.$inferInsert> = {};

  if ("experience" in data) {
    if (!(EXPERIENCE_OPTIONS as readonly unknown[]).includes(data.experience)) {
      return invalid();
    }
    changes.experience = data.experience;
  }
  if ("dealsWanted" in data) {
    const n = data.dealsWanted;
    if (!Number.isInteger(n) || n < 1 || n > MAX_DEALS_WANTED) return invalid();
    changes.dealsWanted = n;
  }
  if ("location" in data) {
    if (typeof data.location !== "string" || !data.location.trim()) return invalid();
    changes.location = data.location.trim().slice(0, 500);
  }
  if ("capital" in data) {
    if (!(CAPITAL_OPTIONS as readonly unknown[]).includes(data.capital)) {
      return invalid();
    }
    changes.capital = data.capital;
  }
  if (Object.keys(changes).length === 0) return invalid();

  const merged = { ...application, ...changes };
  const answeredAll =
    merged.experience && merged.dealsWanted && merged.location && merged.capital;
  const status =
    merged.capital === INELIGIBLE_CAPITAL
      ? "disqualified"
      : answeredAll
        ? "completed"
        : "started";

  const [updated] = await db
    .update(funnelApplications)
    .set({
      ...changes,
      status,
      ...(status === "disqualified" && !application.disqualifiedAt
        ? { disqualifiedAt: new Date() }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(funnelApplications.id, id))
    .returning();

  // Once the questionnaire is finished, copy the answers onto the GHL
  // contact. Best-effort, like step 1.
  if (status !== "started" && status !== application.status) {
    upsertGhlContact({
      ...splitName(updated.fullName),
      email: updated.email,
      phone: updated.phone,
      tags: applicationTags(updated),
      message: applicationSummary(updated),
    }).catch((err) => console.error("Failed to push application answers to GHL", err));
  }

  return NextResponse.json({ status: updated.status });
}

function invalid() {
  return NextResponse.json({ error: "Please answer the question to continue." }, { status: 400 });
}
