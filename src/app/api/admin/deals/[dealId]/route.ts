import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, deals } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { getDeal } from "@/lib/deals";
import { isVideoUrl, parseDealFields } from "@/lib/dealInput";

// Edits a published deal's details. Photos are left as they are; the
// video is only replaced when a new videoUrl is sent.
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
  if (!(await getDeal(dealId))) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const data = await req.json();
  const fields = parseDealFields(data);
  const { videoUrl } = data;

  if (!fields || (videoUrl != null && !isVideoUrl(videoUrl))) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 }
    );
  }

  await db
    .update(deals)
    .set({ ...fields, ...(videoUrl ? { videoUrl } : {}) })
    .where(eq(deals.id, dealId));

  revalidatePath("/deals");
  revalidatePath("/start");
  revalidatePath("/members");
  revalidatePath(`/members/deals/${dealId}`);

  return NextResponse.json({ ok: true });
}
