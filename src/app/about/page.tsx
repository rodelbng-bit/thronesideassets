import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const process = [
  {
    n: "01",
    title: "We Source",
    body: "Our team contacts hundreds of landlords and agents every day, building relationships that surface deals before they're widely listed. That volume of daily groundwork is what keeps the weekly deal sheet full.",
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

const facts = [
  { label: "Landlords contacted / day", value: "300+" },
  { label: "New deals delivered / week", value: "12–20" },
  { label: "UK cities covered", value: "06" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-20 md:pt-28">
          <p className="ledger-figure text-sm text-brass-bright">ABOUT US</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
            Built for investors who value time.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-paper-dim">
            Throneside Assets exists for one reason: sourcing good property
            deals takes hours most investors don&apos;t have. We do that work
            for you — contacting landlords, analysing the numbers, and
            filtering out everything that doesn&apos;t hold up — so what
            reaches you is already vetted and ready to act on.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-paper-dim">
            We provide property investment opportunities, strategic business
            guidance, and growth solutions that help clients build and scale
            their property portfolios. We currently operate across the UK,
            with plans to expand internationally from 2027.
          </p>
        </div>

        {/* Ledger stat strip, matching the homepage signature element */}
        <div className="mx-auto max-w-3xl px-6">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border rule sm:grid-cols-3">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={`bg-ink-soft px-6 py-5 ${
                  i > 0 ? "sm:border-l rule" : ""
                }`}
              >
                <dt className="text-xs uppercase tracking-wide text-paper-dim">
                  {fact.label}
                </dt>
                <dd className="ledger-figure mt-2 text-3xl text-brass-bright">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <section className="mt-20 border-t rule">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              HOW WE WORK
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-paper md:text-4xl">
              Source, analyse, execute.
            </h2>
            <ol className="mt-10 space-y-8">
              {process.map((step) => (
                <li key={step.n} className="border-l-2 border-ledger-green pl-6">
                  <span className="ledger-figure text-sm text-paper-dim">
                    {step.n}
                  </span>
                  <h3 className="mt-2 font-display text-2xl text-paper">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper-dim">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t rule bg-ink-soft">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              ONE MEMBERSHIP
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-paper md:text-4xl">
              Full access, not just listings.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">
              Clients join through a monthly membership rather than paying
              per deal or per lead. That gets you the weekly deal sheet plus
              the guidance around it — business consulting, management
              support, and education — tailored to your package, so you&apos;re
              not left to work out execution on your own.
            </p>
          </div>
        </section>

        <section className="border-t rule">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="ledger-figure text-sm text-brass-bright">
              WHERE WE OPERATE
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-paper md:text-4xl">
              UK-wide today, international from 2027.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">
              We source across London, Manchester, Liverpool, Birmingham,
              Southampton, and other major UK cities, choosing areas based on
              occupancy data, demand drivers, and rental yield rather than
              guesswork. We&apos;re UK-only for now, with plans to expand
              internationally starting in 2027.
            </p>
          </div>
        </section>

        <section className="border-t rule bg-ledger-green-soft">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-3xl tracking-tight text-paper">
                Want to see this week&apos;s deal sheet?
              </h2>
              <p className="mt-2 max-w-md text-sm text-paper-dim">
                Book a call with our UK team, or see what membership includes.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href="/contact"
                className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
              >
                Book a Call
              </a>
              <a
                href="/pricing"
                className="rounded-full border rule px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-paper-dim"
              >
                See Our Plans
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
