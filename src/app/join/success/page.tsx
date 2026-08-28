import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SetPasswordForm from "@/components/SetPasswordForm";
import { gocardlessClient, describeGoCardlessError } from "@/lib/gocardless";
import { ensureUserForBillingRequest } from "@/lib/membership";
import type { ApprovalStatus } from "@/lib/schema";

const GENERIC_ERROR_MESSAGE =
  "We couldn't confirm your payment just now. If you've already paid, check your email for a link to finish setting up your account.";

async function resolveCheckout(billingRequestId: string | undefined) {
  if (!billingRequestId) {
    return {
      ok: false as const,
      message:
        "We couldn't find your checkout session. If you just paid, check your email for a link to finish setting up your account.",
    };
  }

  try {
    const billingRequest = await gocardlessClient.billingRequests.find(
      billingRequestId
    );
    if (billingRequest.status !== "fulfilled") {
      return {
        ok: false as const,
        message:
          "This checkout session hasn't completed yet. If you've already paid, check your email for a link to finish setting up your account.",
      };
    }
    const { email, resetToken, approvalStatus } =
      await ensureUserForBillingRequest(billingRequest);
    return { ok: true as const, email, resetToken, approvalStatus };
  } catch (err) {
    console.error("Join success: could not resolve checkout", {
      billingRequestId,
      ...describeGoCardlessError(err),
    });
    return { ok: false as const, message: GENERIC_ERROR_MESSAGE };
  }
}

const copyByApprovalStatus: Record<
  ApprovalStatus,
  { eyebrow: string; heading: string; body: string }
> = {
  pending: {
    eyebrow: "APPLICATION SUBMITTED",
    heading: "Application submitted.",
    body: "Thanks for applying to Throneside Assets — your payment has gone through and your application has been received. A member of our team will review your account and confirm whether your membership is live within 12 hours.",
  },
  approved: {
    eyebrow: "PAYMENT CONFIRMED",
    heading: "You're all set.",
    body: "Your membership is active.",
  },
  rejected: {
    eyebrow: "PAYMENT RECEIVED",
    heading: "Thanks for your payment.",
    body: "Please get in touch with our team regarding your account status.",
  },
};

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ billing_request_id?: string }>;
}) {
  const { billing_request_id: billingRequestId } = await searchParams;
  const result = await resolveCheckout(billingRequestId);

  if (!result.ok) {
    return <ErrorShell message={result.message} />;
  }

  const { email, resetToken, approvalStatus } = result;
  const copy = copyByApprovalStatus[approvalStatus];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          {resetToken && approvalStatus !== "rejected"
            ? "Set your password."
            : copy.heading}
        </h1>
        <p className="mt-4 text-paper-dim">
          {approvalStatus === "rejected"
            ? copy.body
            : `${copy.body} ${
                resetToken
                  ? "First, choose a password to access your account."
                  : `Log in with your existing account for ${email}.`
              }`}
        </p>

        <div className="mt-10">
          {approvalStatus === "rejected" ? (
            <Link
              href="/contact"
              className="inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
            >
              Contact us
            </Link>
          ) : resetToken ? (
            <SetPasswordForm token={resetToken} />
          ) : (
            <Link
              href="/login"
              className="inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
            >
              Log in
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          PAYMENT CONFIRMED
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Almost there.
        </h1>
        <p className="mt-4 text-paper-dim">{message}</p>
        <Link
          href="/contact"
          className="mt-8 inline-block rounded-full border rule px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-paper-dim"
        >
          Contact us
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
