import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dealReservations, viewingRequests } from "@/lib/schema";
import { getDeal } from "@/lib/deals";
import { getAdminEmails } from "@/lib/admin";
import { upsertGhlContact } from "@/lib/ghl";
import { sendViewingRequestNotificationEmail } from "@/lib/mailer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { dealId } = await params;
  const deal = await getDeal(dealId);
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const [reservation] = await db
    .select()
    .from(dealReservations)
    .where(
      and(
        eq(dealReservations.dealId, dealId),
        eq(dealReservations.userId, session.user.id)
      )
    )
    .limit(1);
  if (!reservation) {
    return NextResponse.json(
      { error: "Reserve this deal before requesting a viewing." },
      { status: 403 }
    );
  }

  const data = await req.json().catch(() => ({}));
  const preferredAt = new Date(data.preferredAt);
  if (Number.isNaN(preferredAt.getTime()) || preferredAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Choose a valid date and time in the future." },
      { status: 400 }
    );
  }

  const [request] = await db
    .insert(viewingRequests)
    .values({ dealId, userId: session.user.id, preferredAt })
    .returning();

  // Best-effort — a failed GHL push or email shouldn't undo the request.
  upsertGhlContact({
    email: session.user.email ?? undefined,
    source: "viewing-request",
    propertyId: deal.id,
    message: `Requested a viewing for ${deal.title} — preferred ${preferredAt.toLocaleString(
      "en-GB",
      { dateStyle: "full", timeStyle: "short" }
    )}`,
  }).catch((err) => console.error("Failed to push viewing request to GHL", err));

  sendViewingRequestNotificationEmail(
    getAdminEmails(),
    session.user.email ?? "a member",
    deal,
    preferredAt
  ).catch((err) => console.error("Failed to send viewing request notification", err));

  revalidatePath(`/members/deals/${dealId}`);
  revalidatePath("/admin/viewing-requests");

  return NextResponse.json({ ok: true, request });
}
