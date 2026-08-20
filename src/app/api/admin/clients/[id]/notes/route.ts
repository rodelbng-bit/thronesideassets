import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registrations } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

// Free-text, admin-only note per client — never rendered on any
// client-facing page.
export async function PATCH(
  req: NextRequest,
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
  const data = await req.json();
  const { notes } = data;

  if (typeof notes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }

  const updated = await db
    .update(registrations)
    .set({ internalNotes: notes.trim() || null, updatedAt: new Date() })
    .where(eq(registrations.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  revalidatePath("/admin/clients/[id]", "page");

  return NextResponse.json({ ok: true });
}
