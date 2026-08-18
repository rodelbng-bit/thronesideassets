import twilio from "twilio";
import { getEnv } from "./env";

let cachedClient: ReturnType<typeof twilio> | undefined;

// Lazy for the same reason as db.ts/stripe.ts — must not run at
// module-evaluation time, or `next build` fails while collecting route
// config pre-env-setup.
function getTwilioClient() {
  if (!cachedClient) {
    cachedClient = twilio(getEnv("TWILIO_ACCOUNT_SID"), getEnv("TWILIO_AUTH_TOKEN"));
  }
  return cachedClient;
}

export async function sendReservationSmsNotification(
  adminPhoneNumbers: string[],
  memberEmail: string,
  deal: { title: string; location: string }
) {
  if (adminPhoneNumbers.length === 0) return;

  const client = getTwilioClient();
  const from = getEnv("TWILIO_FROM_NUMBER");
  const body = `Throneside Assets: ${memberEmail} reserved "${deal.title}" (${deal.location}). Confirm it in the admin panel.`;

  await Promise.all(
    adminPhoneNumbers.map((to) => client.messages.create({ from, to, body }))
  );
}
