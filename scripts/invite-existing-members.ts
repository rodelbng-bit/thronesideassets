// One-off migration: create accounts for members who already paid via the
// old GHL portal, and email each an invite to set a password on the new
// site login. Safe to re-run — anyone who already set a password is
// skipped (their active status is still re-confirmed).
//
// Usage: npm run invite-members -- path/to/emails.txt   (one email per line)

import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { users } from "../src/lib/schema";
import { createPasswordResetToken } from "../src/lib/tokens";
import { sendMemberInviteEmail } from "../src/lib/mailer";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      "Usage: npm run invite-members -- path/to/emails.txt (one email per line)"
    );
    process.exit(1);
  }

  const emails = readFileSync(filePath, "utf-8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`Inviting ${emails.length} existing member(s)...`);

  for (const raw of emails) {
    const email = raw.toLowerCase();
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing?.passwordHash) {
        if (existing.subscriptionStatus !== "active") {
          await db
            .update(users)
            .set({ subscriptionStatus: "active" })
            .where(eq(users.id, existing.id));
        }
        console.log(`  – ${email} already has a password, skipped invite`);
        continue;
      }

      let userId: string;
      if (existing) {
        userId = existing.id;
        await db
          .update(users)
          .set({
            subscriptionStatus: "active",
            subscriptionPlan: existing.subscriptionPlan ?? "essential",
          })
          .where(eq(users.id, existing.id));
      } else {
        const [created] = await db
          .insert(users)
          .values({
            email,
            subscriptionStatus: "active",
            subscriptionPlan: "essential",
          })
          .returning();
        userId = created.id;
      }

      const token = await createPasswordResetToken(userId);
      await sendMemberInviteEmail(email, token);
      console.log(`  ✓ invited ${email}`);
    } catch (err) {
      console.error(`  ✗ failed for ${email}:`, err);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main();
