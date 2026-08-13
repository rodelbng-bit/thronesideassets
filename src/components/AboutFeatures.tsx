const cards = [
  {
    tag: "About Us",
    title: "Strategic guidance, not just listings",
    body: "We provide property investment opportunities, strategic business guidance, and growth solutions that help clients build and scale their property portfolios.",
  },
  {
    tag: "Features",
    title: "One membership, full access",
    body: "Clients join through a monthly membership, gaining access to exclusive property deals, business consulting, management support, education, and investment opportunities tailored to their package.",
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
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px overflow-hidden border-x rule sm:grid-cols-3">
        {cards.map((card, i) => (
          <div
            key={card.tag}
            className={`bg-ink px-6 py-10 sm:px-8 ${
              i > 0 ? "sm:border-l rule" : ""
            }`}
          >
            <p className="ledger-figure text-xs text-brass-bright">
              {String(i + 1).padStart(2, "0")} / {card.tag}
            </p>
            <h3 className="mt-4 font-display text-2xl text-paper">
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
