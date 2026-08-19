import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dealReservations } from "@/lib/schema";
import {
  getDeal,
  getActiveReservationForUser,
  releaseExpiredReservations,
  RESERVATION_HOLD_DAYS,
} from "@/lib/deals";
import { getAdminEmails } from "@/lib/admin";
import { sendReservationNotificationEmail } from "@/lib/mailer";

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
  if (deal.status === "unavailable") {
    return NextResponse.json(
      { error: "This deal is no longer available.", reason: "unavailable" },
      { status: 409 }
    );
  }

  // Free up any reservation that's past its hold window before checking
  // availability — otherwise a stale row would still occupy the unique
  // dealId slot and block a fresh reservation attempt.
  await releaseExpiredReservations();

  const active = await getActiveReservationForUser(session.user.id);
  if (active && active.deal.id !== dealId) {
    return NextResponse.json(
      {
        error:
          "You already have an active reservation. It needs to be confirmed (marked Unavailable) before you can reserve another property.",
        reason: "limit-reached",
      },
      { status: 409 }
    );
  }

  const expiresAt = new Date(
    Date.now() + RESERVATION_HOLD_DAYS * 24 * 60 * 60 * 1000
  );

  try {
    await db.insert(dealReservations).values({
      dealId,
      userId: session.user.id,
      expiresAt,
    });

    // Best-effort — a failed notification shouldn't undo the reservation.
    sendReservationNotificationEmail(
      getAdminEmails(),
      session.user.email ?? "a member",
      deal
    ).catch((err) => console.error("Failed to send reservation notification", err));

    revalidatePath("/deals");
    revalidatePath("/members");
    revalidatePath(`/members/deals/${dealId}`);

    return NextResponse.json({ ok: true, expiresAt });
  } catch (err) {
    // Unique constraint on dealId — someone else got there first.
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json(
        {
          error: "This deal has already been reserved.",
          reason: "already-reserved",
        },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Could not reserve this deal." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { dealId } = await params;

  const deleted = await db
    .delete(dealReservations)
    .where(
      and(
        eq(dealReservations.dealId, dealId),
        eq(dealReservations.userId, session.user.id)
      )
    )
    .returning();

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "You don't have a reservation on this deal." },
      { status: 404 }
    );
  }

  revalidatePath("/deals");
  revalidatePath("/members");
  revalidatePath(`/members/deals/${dealId}`);

  return NextResponse.json({ ok: true });
}
