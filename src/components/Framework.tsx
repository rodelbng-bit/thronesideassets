const steps = [
  {
    n: "01",
    title: "We Source",
    body: "We're in network with hundreds to thousands of landlords and agents across the UK, building relationships that surface deals before they're widely listed. That reach is what keeps the weekly deal sheet full.",
  },
  {
    n: "02",
    title: "We Analyse",
    body: "Nothing reaches a client until it's been through a full financial breakdown — yield, expenses, and profit and loss, checked against real occupancy and demand data for that area. If the numbers don't hold up, the deal doesn't go out.",
  },
  {
    n: "03",
    title: "You Execute",
    body: "You get a vetted opportunity, the numbers behind it, and access to trusted operators and strategic guidance to act on it — without spending your own hours searching, calling, or re-checking figures.",
  },
];

export default function Framework() {
  return (
    <section className="border-b rule">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="reveal">
          <p className="eyebrow">The investment framework</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold text-paper md:text-5xl">
            Three steps,{" "}
            <span className="font-accent font-normal text-brass">
              one clear process.
            </span>
          </h2>
        </div>

        {/* Steps sit on a single orange-to-teal line, like a route. */}
        <ol className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden
            className="absolute left-0 right-0 top-[1.4rem] hidden h-px bg-linear-to-r from-brass via-brass/40 to-ledger-green md:block"
          />
          {steps.map((step) => (
            <li key={step.n} className="reveal relative">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-brass bg-ink font-display text-sm font-semibold text-brass-bright">
                {step.n}
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-paper">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
