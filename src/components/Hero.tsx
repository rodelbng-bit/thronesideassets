const stats = [
  { label: "Landlord network, UK-wide", value: "100s–1,000s" },
  { label: "New deals", value: "Weekly" },
  { label: "Cities covered", value: "UK-wide" },
];

export default function Hero() {
  return (
    <section className="border-b rule">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
        <p className="ledger-figure text-sm text-brass-bright">
          No. 001 — WEEKLY DEAL SHEET
        </p>

        <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-paper md:text-7xl">
          Vetted property deals, delivered every week.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-paper-dim">
          We source, analyse, and deliver off-market investment opportunities
          across the UK. You review the numbers and decide — no searching
          required.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="/pricing"
            className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
          >
            See Our Plans
          </a>
          <a
            href="/contact"
            className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
          >
            Book a call with our UK team →
          </a>
        </div>

        {/* Signature element: ledger stat strip, set like a spreadsheet row */}
        <dl className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border rule sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`bg-ink-soft px-6 py-5 ${
                i > 0 ? "sm:border-l rule" : ""
              }`}
            >
              <dt className="text-xs uppercase tracking-wide text-paper-dim">
                {stat.label}
              </dt>
              <dd className="ledger-figure mt-2 text-3xl text-brass-bright">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
