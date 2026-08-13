import { NextRequest, NextResponse } from "next/server";
import { upsertGhlContact } from "@/lib/ghl";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, email, phone, message, propertyId } = body;

  if (!email && !phone) {
    return NextResponse.json(
      { error: "An email or phone number is required." },
      { status: 400 }
    );
  }

  try {
    await upsertGhlContact({
      firstName,
      lastName,
      email,
      phone,
      message,
      propertyId,
      source: "website-contact-form",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not submit your details right now. Please try again." },
      { status: 502 }
    );
  }
}
