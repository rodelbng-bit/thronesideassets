import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { funnelApplications } from "@/lib/schema";
import { createGhlAppointment, upsertGhlContact } from "@/lib/ghl";
import {
  applicationSummary,
  applicationTags,
  getApplication,
  getOpenSlots,
  splitName,
} from "@/lib/applicationServer";

// Final step of /start/apply: books the chosen slot on the GHL call
// calendar and records it on the application.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await getApplication(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }
  if (application.status === "booked") {
    return NextResponse.json({ ok: true });
  }
  if (application.status !== "completed") {
    return NextResponse.json(
      { error: "Please complete the questionnaire before booking." },
      { status: 409 }
    );
  }

  const { slot } = await req.json().catch(() => ({}));
  if (typeof slot !== "string") {
    return NextResponse.json({ error: "Please pick a time." }, { status: 400 });
  }

  try {
    const { slots } = await getOpenSlots();
    if (!slots.includes(slot)) {
      return NextResponse.json(
        { error: "That time is no longer available — please pick another." },
        { status: 409 }
      );
    }

    const { contact } = await upsertGhlContact({
      ...splitName(application.fullName),
      email: application.email,
      phone: application.phone,
      tags: applicationTags(application),
      message: applicationSummary(application),
    });
    const appointment = await createGhlAppointment({
      contactId: contact.id,
      startTime: slot,
      title: `Deal access call — ${application.fullName}`,
    });

    const [updated] = await db
      .update(funnelApplications)
      .set({
        status: "booked",
        appointmentAt: new Date(slot),
        ghlAppointmentId: appointment.id,
        updatedAt: new Date(),
      })
      .where(eq(funnelApplications.id, id))
      .returning();

    // Add the booking to the contact's summary and tags. Best-effort.
    upsertGhlContact({
      ...splitName(updated.fullName),
      email: updated.email,
      phone: updated.phone,
      tags: applicationTags(updated),
      message: applicationSummary(updated),
    }).catch((err) => console.error("Failed to update GHL contact after booking", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to book application call", err);
    return NextResponse.json(
      { error: "We couldn't book that time just now." },
      { status: 502 }
    );
  }
}
