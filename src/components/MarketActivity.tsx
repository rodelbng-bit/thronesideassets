const cities = [
  "London",
  "Manchester",
  "Liverpool",
  "Birmingham",
  "Southampton",
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
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="reveal">
          <p className="eyebrow">Where we source</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold text-paper md:text-5xl">
            Chosen on the numbers,{" "}
            <span className="font-accent font-normal text-brass">
              not guesswork.
            </span>
          </h2>
        </div>

        <div className="reveal mt-10 flex flex-wrap gap-3">
          {cities.map((city) => (
            <span
              key={city}
              className="rounded-full border rule-strong bg-ink/40 px-4 py-2 text-sm text-paper transition-colors hover:border-brass hover:text-brass-bright"
            >
              {city}
            </span>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {criteria.map((item) => (
            <div
              key={item.label}
              className="card-lift reveal relative overflow-hidden rounded-2xl border rule bg-ink px-6 py-6"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-brass via-brass/40 to-ledger-green"
              />
              <p className="font-display text-lg font-semibold text-brass-bright">
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
