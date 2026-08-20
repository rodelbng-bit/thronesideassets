import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, registrations } from "@/lib/schema";
import { isAdminEmail } from "@/lib/admin";
import { ensureUserForRegistration } from "@/lib/membership";
import { sendAccountSetupEmail } from "@/lib/mailer";

// For clients who paid outside Stripe (bank transfer, in person, etc.) —
// mirrors what the Stripe webhook normally does: creates the login
// account if one doesn't exist yet and sends the same account-setup
// email, so they can then be reviewed/approved like anyone else.
export async function POST(
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
  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, id))
    .limit(1);

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  if (registration.userId) {
    return NextResponse.json(
      { error: "Already linked to an account — use Approve/Reject instead" },
      { status: 400 }
    );
  }

  const { email, resetToken } = await ensureUserForRegistration({
    email: registration.email,
    registrationId: registration.id,
    // Best available record of agreement for a payment that didn't go
    // through the checkbox-gated Stripe flow — drives the contract
    // start/end date fields on the profile page, not a legal record.
    termsAcceptedAt: new Date(),
  });

  if (resetToken) {
    await sendAccountSetupEmail(email, resetToken);
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin/clients/[id]", "page");

  return NextResponse.json({ ok: true });
}
