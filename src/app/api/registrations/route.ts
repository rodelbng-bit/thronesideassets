import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/schema";

// Fires the moment someone submits step 1 of /join (name/email/phone),
// before they've chosen a plan or reached GoCardless — this is what makes a
// true pre-payment drop-off visible in /admin/clients instead of leaving
// zero trace of the visit.
export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => ({}));
  const { name, email, phone, source } = data;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof phone !== "string" ||
    !phone.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(registrations)
    .values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      source: typeof source === "string" ? source.trim() || null : null,
    })
    .returning();

  return NextResponse.json({ ok: true, id: row.id });
}
