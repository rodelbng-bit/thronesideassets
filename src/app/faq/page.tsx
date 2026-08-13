import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const faqs = [
  {
    q: "What do I actually get with membership?",
    a: "Membership gets you the weekly deal sheet plus the guidance around it — business consulting, management support, and education, tailored to your package. You're not just handed a list of listings; you get support acting on them.",
  },
  {
    q: "How often do I receive new deals?",
    a: "We deliver 12–20 new, vetted deals per week. Our team contacts 300+ landlords and agents daily, so the deal sheet stays full even as the market moves.",
  },
  {
    q: "How are deals sourced and vetted?",
    a: "We Source: our team builds relationships with landlords and agents directly, surfacing deals before they're widely listed. We Analyse: nothing reaches a client until it's been through a full financial breakdown — yield, expenses, and profit and loss — checked against real occupancy and demand data. If the numbers don't hold up, the deal doesn't go out.",
  },
  {
    q: "Which areas do you cover?",
    a: "We currently source across London, Manchester, Liverpool, Birmingham, Southampton, and other major UK cities, choosing areas based on occupancy data, demand drivers, and rental yield.",
  },
  {
    q: "Do you help with execution, or just the deal sheet?",
    a: "Both. Alongside each opportunity you get access to trusted operators and strategic guidance to act on it, so you're not left to work out financing, management, or execution on your own.",
  },
  {
    q: "Do you operate outside the UK?",
    a: "Not yet — we're UK-only today, with plans to expand internationally from 2027.",
  },
  {
    q: "What does membership cost?",
    a: "Pricing depends on the package. See our Pricing page for an overview, or book a call and we'll walk you through current tiers and what fits your goals.",
  },
  {
    q: "How do I get started?",
    a: "Book a call with our UK team, or register through the membership options on the Pricing page. We'll get you set up and onto the next deal sheet.",
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">FAQ</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Common questions.
        </h1>
        <p className="mt-4 text-paper-dim">
          Can&apos;t find what you&apos;re looking for?{" "}
          <a href="/contact" className="text-brass-bright hover:text-paper">
            Get in touch
          </a>{" "}
          and we&apos;ll answer directly.
        </p>

        <div className="mt-12 divide-y rule border-t border-b rule">
          {faqs.map((item) => (
            <details key={item.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl text-paper marker:content-none">
                {item.q}
                <span className="ledger-figure shrink-0 text-brass-bright transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper-dim">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-3 border-t rule pt-10">
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
      </main>
      <SiteFooter />
    </>
  );
}
