import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { CURRENT_TERMS_VERSION } from "@/lib/siteFacts";

// Records consent to the current /terms content — separate from
// users.termsAcceptedAt, which is the fixed contract-start date and must
// never be overwritten here. See TermsGate for the pop-up that calls this.
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await db
    .update(users)
    .set({
      termsVersionAccepted: CURRENT_TERMS_VERSION,
      termsVersionAcceptedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
