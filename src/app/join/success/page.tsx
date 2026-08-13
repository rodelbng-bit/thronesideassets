import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SetPasswordForm from "@/components/SetPasswordForm";
import { stripe } from "@/lib/stripe";
import { ensureUserForCheckoutSession } from "@/lib/membership";

const GENERIC_ERROR_MESSAGE =
  "We couldn't confirm your payment just now. If you've already paid, check your email for a link to finish setting up your account.";

async function resolveCheckout(sessionId: string | undefined) {
  if (!sessionId) {
    return {
      ok: false as const,
      message:
        "We couldn't find your checkout session. If you just paid, check your email for a link to finish setting up your account.",
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") {
      return {
        ok: false as const,
        message:
          "This checkout session hasn't completed yet. If you've already paid, check your email for a link to finish setting up your account.",
      };
    }
    const { email, resetToken } = await ensureUserForCheckoutSession(session);
    return { ok: true as const, email, resetToken };
  } catch (err) {
    console.error(err);
    return { ok: false as const, message: GENERIC_ERROR_MESSAGE };
  }
}

export default async function JoinSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const result = await resolveCheckout(sessionId);

  if (!result.ok) {
    return <ErrorShell message={result.message} />;
  }

  const { email, resetToken } = result;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          PAYMENT CONFIRMED
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          {resetToken ? "Set your password." : "You're all set."}
        </h1>
        <p className="mt-4 text-paper-dim">
          {resetToken
            ? `One last step for ${email} — choose a password to access your account.`
            : `Your membership is active. Log in with your existing account for ${email}.`}
        </p>

        <div className="mt-10">
          {resetToken ? (
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
