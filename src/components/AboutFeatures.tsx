const cards = [
  {
    tag: "About Us",
    title: "Strategic guidance, not just listings",
    body: "We provide property investment opportunities, strategic business guidance, and growth solutions that help clients build and scale their property portfolios.",
  },
  {
    tag: "Features",
    title: "One membership, full access",
    body: "Clients join through a fixed 12-month membership agreement, gaining access to exclusive property deals, business consulting, management support, education, and investment opportunities tailored to their package.",
  },
  {
    tag: "Growing",
    title: "UK-wide, expanding from 2027",
    body: "We currently operate across the UK, with plans to expand internationally from 2027.",
  },
];

export default function AboutFeatures() {
  return (
    <section className="border-b rule">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 py-16 sm:grid-cols-3 md:py-20">
        {cards.map((card, i) => (
          <div
            key={card.tag}
            className="card-lift reveal rounded-2xl border rule bg-ink-soft/60 px-6 py-8 sm:px-7"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-accent text-3xl text-brass">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-bright">
                {card.tag}
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-paper">
              {card.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper-dim">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
