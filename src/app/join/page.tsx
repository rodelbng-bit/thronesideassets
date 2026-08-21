import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JoinForm from "@/components/JoinForm";

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">ESSENTIAL</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Join in a couple of minutes.
        </h1>
        <p className="mt-4 text-paper-dim">
          Choose how you&apos;d like to be billed, then set up a secure
          Direct Debit with GoCardless. You&apos;ll set your password right
          after.
        </p>

        <div className="mt-10">
          <JoinForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
