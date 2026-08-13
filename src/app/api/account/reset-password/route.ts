import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { consumePasswordResetToken } from "@/lib/tokens";
import { hashPassword } from "@/lib/password";

// Shared by the post-checkout "set your password" step, the forgot-password
// flow, and the legacy-member invite flow — all three just deliver a token,
// this endpoint doesn't need to know which one it came from.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const userId = await consumePasswordResetToken(token);
  if (!userId) {
    return NextResponse.json(
      { error: "This link is invalid or has expired." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId))
    .returning();

  return NextResponse.json({ ok: true, email: user.email });
}
