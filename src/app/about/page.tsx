import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/PageHero";
import ClosingCta from "@/components/ClosingCta";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Throneside Assets sources property deals for investors who value time — contacting landlords, analysing the numbers, and filtering out everything that doesn't hold up.",
  path: "/about",
});

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
  { label: "Landlord network, UK-wide", value: "Up to 500" },
  { label: "New deals delivered", value: "Weekly" },
  { label: "Cities covered", value: "Manchester & Leeds" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
          <PageHero
            eyebrow="About us"
            title="Built for investors who"
            accent="value time."
          >
            <p>
              Throneside Assets exists for one reason: sourcing good property
              deals takes hours most investors don&apos;t have. We do that
              work for you — contacting landlords, analysing the numbers, and
              filtering out everything that doesn&apos;t hold up — so what
              reaches you is already vetted and ready to act on.
            </p>
            <p className="mt-4">
              We provide property investment opportunities, strategic business
              guidance, and growth solutions that help clients build and scale
              their property portfolios. We currently operate across the UK,
              with plans to expand internationally from 2027.
            </p>
          </PageHero>

          <dl className="enter mt-14 grid grid-cols-1 gap-4 [animation-delay:270ms] sm:grid-cols-3">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="card-lift rounded-2xl border rule bg-ink-soft/80 px-6 py-5"
              >
                <dt className="text-xs uppercase tracking-[0.12em] text-paper-dim">
                  {fact.label}
                </dt>
                <dd className="ledger-figure mt-2 text-3xl tracking-tight text-brass-bright">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t rule">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
            <div className="reveal">
              <p className="eyebrow">How we work</p>
              <h2 className="mt-4 font-display text-4xl text-paper md:text-5xl">
                Source, analyse,{" "}
                <span className="font-accent text-brass">execute.</span>
              </h2>
            </div>

            {/* Same orange-to-teal route as the home page framework. */}
            <ol className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              <span
                aria-hidden
                className="absolute left-0 right-0 top-[1.4rem] hidden h-px bg-linear-to-r from-brass via-brass/40 to-ledger-green md:block"
              />
              {process.map((step) => (
                <li key={step.n} className="reveal relative">
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-brass bg-ink font-display text-sm text-brass-bright">
                    {step.n}
                  </span>
                  <h3 className="mt-6 font-display text-2xl text-paper">
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

        <section className="border-t rule bg-ink-soft">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 py-20 md:grid-cols-2 md:py-24">
            <div className="card-lift reveal rounded-2xl border rule bg-ink p-8 md:p-10">
              <p className="eyebrow">One membership</p>
              <h2 className="mt-4 font-display text-3xl text-paper md:text-4xl">
                Full access,{" "}
                <span className="font-accent text-brass">
                  not just listings.
                </span>
              </h2>
              <p className="mt-5 leading-relaxed text-paper-dim">
                Clients join through a fixed 12-month membership agreement
                rather than paying per deal or per lead. That gets you the
                weekly deal sheet plus the guidance around it — business
                consulting, management support, and education — tailored to
                your package, so you&apos;re not left to work out execution
                on your own.
              </p>
            </div>

            <div className="card-lift reveal rounded-2xl border rule bg-ink p-8 md:p-10">
              <p className="eyebrow">Where we operate</p>
              <h2 className="mt-4 font-display text-3xl text-paper md:text-4xl">
                UK-wide today,{" "}
                <span className="font-accent text-brass">
                  international from 2027.
                </span>
              </h2>
              <p className="mt-5 leading-relaxed text-paper-dim">
                We source across London, Manchester, Liverpool, Birmingham,
                Southampton, Bromley, and other major UK cities, choosing
                areas based on occupancy data, demand drivers, and rental
                yield rather than guesswork. We&apos;re UK-only for now, with
                plans to expand internationally starting in 2027.
              </p>
            </div>
          </div>
        </section>

        <ClosingCta
          title="Want to see"
          accent="this week's deal sheet?"
          body="Book a call with our UK team, or see what membership includes."
          secondary={{ href: "/pricing", label: "See Our Plans" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
