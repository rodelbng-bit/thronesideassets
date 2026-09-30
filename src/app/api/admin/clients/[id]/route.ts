import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrations, users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

// Permanently deletes a client's /join registration record. Admin-only.
// Their login account (if any) is left alone — that's deleted from
// /admin/users, which also handles subscriptions and reserved deals.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(adminUser?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const deleted = await db
    .delete(registrations)
    .where(eq(registrations.id, id))
    .returning({ id: registrations.id });

  if (deleted.length === 0) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin/users");

  return NextResponse.json({ ok: true });
}
