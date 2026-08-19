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
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">
          THE INVESTMENT FRAMEWORK
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="border-l-2 border-ledger-green pl-6">
              <span className="ledger-figure text-sm text-paper-dim">
                {step.n}
              </span>
              <h3 className="mt-2 font-display text-2xl text-paper">
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
