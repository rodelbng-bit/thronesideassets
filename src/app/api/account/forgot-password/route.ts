import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";

// Always responds the same way whether or not the email exists, so this
// endpoint can't be used to enumerate accounts.
const GENERIC_RESPONSE = {
  ok: true,
  message: "If an account exists for that email, we've sent a reset link.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, token);
    }
  } catch (err) {
    console.error(err);
    // Still return the generic response — don't leak failure details.
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
