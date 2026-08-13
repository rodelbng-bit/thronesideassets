// One-off: create a test account directly, bypassing Stripe checkout.
// Usage: npx dotenv -e .env.local -- npx tsx scripts/create-test-account.ts <email> <password>
import { db } from "../src/lib/db";
import { users } from "../src/lib/schema";
import { hashPassword } from "../src/lib/password";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error(
      "Usage: npx tsx scripts/create-test-account.ts <email> <password>"
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      subscriptionStatus: "active",
      subscriptionPlan: "essential",
    })
    .returning();

  console.log(`Created test account: ${user.email} (id: ${user.id})`);
  process.exit(0);
}

main();
