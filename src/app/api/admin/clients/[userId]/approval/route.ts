import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registrations } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { approvalStatusToStage } from "@/lib/registrations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

  const { userId } = await params;
  const data = await req.json();
  const { status } = data;

  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db
    .update(users)
    .set({
      approvalStatus: status,
      // "Membership activation date" — only stamped on approval, left
      // untouched on reject/re-pending so a mistaken toggle doesn't erase
      // the original activation history.
      ...(status === "approved" ? { approvedAt: new Date() } : {}),
    })
    .where(eq(users.id, userId))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // A prospect can have more than one /join attempt over time — sync every
  // registration row linked to this account, not just the most recent one.
  await db
    .update(registrations)
    .set({ stage: approvalStatusToStage(status), updatedAt: new Date() })
    .where(eq(registrations.userId, userId));

  revalidatePath("/admin/clients");
  revalidatePath("/admin/clients/[id]", "page");

  return NextResponse.json({ ok: true });
}
