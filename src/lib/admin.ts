import { getEnv } from "./env";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getEnv("ADMIN_EMAILS")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
