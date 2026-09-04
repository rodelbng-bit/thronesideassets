import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { deleteUserAccount } from "@/lib/membership";

// Permanently deletes a member account. Admin-only, and guarded against
// the two ways this goes badly wrong: deleting yourself, and deleting a
// fellow admin. An account with a live subscription is rejected inside
// deleteUserAccount — cancel the GoCardless mandate first.
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

  const { id: userId } = await params;

  if (userId === adminUser.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  const [target] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (isAdminEmail(target.email)) {
    return NextResponse.json(
      {
        error:
          "Admin accounts can't be deleted here — remove the email from ADMIN_EMAILS first.",
      },
      { status: 400 }
    );
  }

  let freedDealIds: string[];
  try {
    ({ freedDealIds } = await deleteUserAccount(userId));
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not delete account.",
      },
      { status: 400 }
    );
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/clients");
  if (freedDealIds.length > 0) {
    revalidatePath("/deals");
    revalidatePath("/members");
  }

  return NextResponse.json({ ok: true, freedDealIds });
}
