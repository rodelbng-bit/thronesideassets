import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registrations, registrationStageEnum } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";

// Free-form manual override of a registration's stage — no guardrails on
// which transitions are "valid", trusts admin judgment (e.g. correcting a
// stuck/out-of-sync record, or marking a phone-completed step as done).
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
  const { stage } = data;

  if (!registrationStageEnum.enumValues.includes(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const updated = await db
    .update(registrations)
    .set({ stage, updatedAt: new Date() })
    .where(eq(registrations.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin/clients/[id]", "page");

  return NextResponse.json({ ok: true });
}
