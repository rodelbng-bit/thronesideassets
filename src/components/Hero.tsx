const stats = [
  { label: "Landlord network, UK-wide", value: "Up to 500" },
  { label: "New deals", value: "Weekly" },
  { label: "Cities covered", value: "Manchester & Leeds" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b rule">
      {/* Warm/cool light behind the headline — the hero's only decoration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.22),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-60 -left-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(31,181,173,0.16),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-24 md:pt-28">
        <p className="eyebrow enter">Weekly deal sheet</p>

        <h1 className="enter mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] text-paper [animation-delay:90ms] md:text-7xl">
          Vetted property deals,{" "}
          <span className="font-accent font-normal text-brass">
            delivered every week.
          </span>
        </h1>

        <p className="enter mt-6 max-w-xl text-lg leading-relaxed text-paper-dim [animation-delay:180ms]">
          We source, analyse, and deliver off-market investment opportunities
          across the UK. You review the numbers and decide — no searching
          required.
        </p>

        <div className="enter mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:270ms]">
          <a
            href="/pricing"
            className="cta-glow group inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink hover:bg-brass-bright"
          >
            See Our Plans
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
          <a
            href="/contact"
            className="text-sm font-medium text-paper underline decoration-brass/60 decoration-2 underline-offset-[6px] transition-colors hover:text-brass-bright hover:decoration-brass"
          >
            Book a call with our UK team
          </a>
        </div>

        <dl className="enter mt-16 grid grid-cols-1 gap-4 [animation-delay:360ms] sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card-lift rounded-2xl border rule bg-ink-soft/80 px-6 py-5 backdrop-blur"
            >
              <dt className="text-xs uppercase tracking-[0.12em] text-paper-dim">
                {stat.label}
              </dt>
              <dd className="ledger-figure mt-2 text-3xl tracking-tight text-brass-bright">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
