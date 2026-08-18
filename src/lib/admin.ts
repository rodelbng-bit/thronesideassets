import { getEnv } from "./env";

export function getAdminEmails(): string[] {
  return getEnv("ADMIN_EMAILS")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

// Optional — SMS notifications are skipped (not an error) if unset, unlike
// ADMIN_EMAILS which every deployment is expected to configure.
export function getAdminPhoneNumbers(): string[] {
  return (process.env.ADMIN_PHONE_NUMBERS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}
