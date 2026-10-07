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

      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-12 sm:pt-20 md:pb-24 md:pt-28">
        <p className="eyebrow enter">Weekly deal sheet</p>

        {/* The accent phrase always sits on its own line, so it never
            splits mid-phrase on narrow screens. */}
        <h1 className="enter mt-5 max-w-4xl font-display text-[2.6rem] font-semibold leading-[1.04] text-paper [animation-delay:90ms] sm:mt-6 sm:text-5xl md:text-7xl">
          Vetted property deals,
          <span className="font-accent block font-normal text-brass">
            delivered every week.
          </span>
        </h1>

        <p className="enter mt-5 max-w-xl text-base leading-relaxed text-paper-dim [animation-delay:180ms] sm:mt-6 sm:text-lg">
          We source, analyse, and deliver off-market investment opportunities
          across the UK. You review the numbers and decide — no searching
          required.
        </p>

        {/* Phones: two full-width buttons for easy tapping. Larger
            screens: button + underlined text link. */}
        <div className="enter mt-8 flex flex-col gap-3 [animation-delay:270ms] sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-4">
          <a
            href="/pricing"
            className="cta-glow group inline-flex items-center justify-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink hover:bg-brass-bright"
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
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-brass hover:text-brass-bright sm:rounded-none sm:border-0 sm:px-0 sm:py-0 sm:font-medium sm:underline sm:decoration-brass/60 sm:decoration-2 sm:underline-offset-[6px] sm:hover:decoration-brass"
          >
            Book a call with our UK team
          </a>
        </div>

        {/* Phones: a compact 2-up grid (third stat spans the row) instead
            of three tall stacked cards. */}
        <dl className="enter mt-10 grid grid-cols-2 gap-3 [animation-delay:360ms] sm:mt-16 sm:grid-cols-3 sm:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`card-lift rounded-2xl border rule bg-ink-soft/80 px-4 py-4 backdrop-blur sm:px-6 sm:py-5 ${
                i === stats.length - 1 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <dt className="text-[0.65rem] uppercase leading-snug tracking-[0.12em] text-paper-dim sm:text-xs">
                {stat.label}
              </dt>
              <dd className="ledger-figure mt-1.5 text-2xl tracking-tight text-brass-bright sm:mt-2 sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
