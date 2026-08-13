import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SetPasswordForm from "@/components/SetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          MEMBER LOGIN
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Set a new password.
        </h1>

        <div className="mt-10">
          {token ? (
            <SetPasswordForm token={token} />
          ) : (
            <div>
              <p className="text-paper-dim">
                This link is missing its token. Request a new one below.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
              >
                Request a reset link
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
