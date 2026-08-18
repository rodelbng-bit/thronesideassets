import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dealReservations } from "@/lib/schema";
import { getDeal, getActiveReservationForUser } from "@/lib/deals";
import { getAdminEmails, getAdminPhoneNumbers } from "@/lib/admin";
import { sendReservationNotificationEmail } from "@/lib/mailer";
import { sendReservationSmsNotification } from "@/lib/sms";

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

  try {
    await db.insert(dealReservations).values({
      dealId,
      userId: session.user.id,
    });

    // Best-effort — a failed notification shouldn't undo the reservation.
    const memberEmail = session.user.email ?? "a member";
    sendReservationNotificationEmail(getAdminEmails(), memberEmail, deal).catch((err) =>
      console.error("Failed to send reservation notification email", err)
    );
    sendReservationSmsNotification(getAdminPhoneNumbers(), memberEmail, deal).catch((err) =>
      console.error("Failed to send reservation notification SMS", err)
    );

    return NextResponse.json({ ok: true });
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
