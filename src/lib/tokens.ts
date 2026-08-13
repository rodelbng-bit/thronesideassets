import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { passwordResetTokens } from "./schema";

// Only the SHA-256 hash of a token is ever stored, so a token can't be
// "looked up" later — each call to createPasswordResetToken mints a fresh
// one. That's fine: an old unused token just sits until it expires, since
// nobody retains its raw value to redeem it.
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24h — generous for an emailed link

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(
  userId: string,
  ttlMs = DEFAULT_TTL_MS
) {
  const raw = crypto.randomBytes(32).toString("hex");
  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return raw;
}

/** Verifies a raw token, marks it used, and returns the associated userId — or null if invalid/expired/already used. */
export async function consumePasswordResetToken(
  rawToken: string
): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return null;
  }

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id));

  return row.userId;
}
