export default function ClosingCta() {
  return (
    <section className="border-b rule bg-ledger-green-soft">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-paper md:text-4xl">
            Ready to see real deals?
          </h2>
          <p className="mt-2 max-w-md text-sm text-paper-dim">
            Book a call with our UK team and find out how we can source your
            next investment.
          </p>
        </div>
        <a
          href="/contact"
          className="shrink-0 rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
        >
          Book a Call
        </a>
      </div>
    </section>
  );
}
