const cities = [
  "London",
  "Manchester",
  "Liverpool",
  "Birmingham",
  "Southampton",
  "Bromley",
  "and other major UK cities",
];

const criteria = [
  {
    label: "Occupancy data",
    body: "We track how areas actually perform, not how they're marketed.",
  },
  {
    label: "Demand drivers",
    body: "Jobs, transport links, and population growth behind the numbers.",
  },
  {
    label: "Rental yield",
    body: "Every area is weighed against realistic, achievable returns.",
  },
];

export default function MarketActivity() {
  return (
    <section id="deals" className="border-b rule bg-ink-soft">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          WHERE WE SOURCE
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl tracking-tight text-paper md:text-5xl">
          Chosen on the numbers, not guesswork.
        </h2>

        <div className="mt-10 flex flex-wrap gap-3">
          {cities.map((city) => (
            <span
              key={city}
              className="rounded-full border rule px-4 py-2 text-sm text-paper-dim"
            >
              {city}
            </span>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border rule sm:grid-cols-3">
          {criteria.map((item, i) => (
            <div
              key={item.label}
              className={`bg-ink px-6 py-6 ${i > 0 ? "sm:border-l rule" : ""}`}
            >
              <p className="ledger-figure text-sm text-brass-bright">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
