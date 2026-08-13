import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          MEMBER LOGIN
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Reset your password.
        </h1>
        <p className="mt-4 text-paper-dim">
          Enter the email on your account and we&apos;ll send you a link to
          set a new password.
        </p>

        <div className="mt-10">
          <ForgotPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
