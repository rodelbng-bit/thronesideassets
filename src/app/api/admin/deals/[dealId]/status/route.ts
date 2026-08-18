import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, deals, dealReservations } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { getDeal } from "@/lib/deals";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dealId } = await params;
  const data = await req.json();
  const { status } = data;

  if (status !== "available" && status !== "unavailable") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!(await getDeal(dealId))) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  await db.update(deals).set({ status }).where(eq(deals.id, dealId));

  // Re-opening a deal gives it a clean slate — any reservation made
  // before/during it being unavailable no longer holds.
  if (status === "available") {
    await db
      .delete(dealReservations)
      .where(eq(dealReservations.dealId, dealId));
  }

  revalidatePath("/deals");
  revalidatePath("/members");
  revalidatePath(`/members/deals/${dealId}`);

  return NextResponse.json({ ok: true });
}
