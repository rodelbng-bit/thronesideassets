import { Resend } from "resend";
import { getEnv } from "./env";

function siteUrl() {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

async function send(to: string, subject: string, html: string) {
  const resend = new Resend(getEnv("RESEND_API_KEY"));
  const from = getEnv("RESEND_FROM_EMAIL");
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

export async function sendAccountSetupEmail(email: string, token: string) {
  const link = `${siteUrl()}/reset-password?token=${token}`;
  await send(
    email,
    "Set up your Throneside Assets account",
    `<p>Thanks for joining Throneside Assets.</p>
     <p><a href="${link}">Set your password</a> to finish setting up your account and access your deal sheet.</p>
     <p>This link expires in 24 hours.</p>`
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${siteUrl()}/reset-password?token=${token}`;
  await send(
    email,
    "Reset your Throneside Assets password",
    `<p>We received a request to reset your Throneside Assets password.</p>
     <p><a href="${link}">Reset your password</a>. If you didn't request this, you can ignore this email.</p>
     <p>This link expires in 24 hours.</p>`
  );
}

export async function sendMemberInviteEmail(email: string, token: string) {
  const link = `${siteUrl()}/reset-password?token=${token}`;
  await send(
    email,
    "Set up your new Throneside Assets login",
    `<p>Your Throneside Assets membership now has its own login, separate from the old member portal.</p>
     <p><a href="${link}">Set your password</a> to access your account.</p>
     <p>This link expires in 24 hours.</p>`
  );
}
