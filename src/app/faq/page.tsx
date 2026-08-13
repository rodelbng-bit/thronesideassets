import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const faqs = [
  {
    q: "What are your fees?",
    a: "Our membership starts at £497/month (Essential). See the plans above for full details. Annual options save up to £994.",
  },
  {
    q: "How does the 3-month partner programme work?",
    a: "For a limited number of investors, we waive our sourcing fees for the first 3 months. You get full access to vetted deals while we build a working relationship. After 3 months, you continue on your chosen plan.",
  },
  {
    q: "What kind of deals do you source?",
    a: "We source across multiple strategies: Rent-to-Rent (R2R), Serviced Accommodation (SA), HMO, Buy-to-Let, and BRRR — matched to your investment criteria.",
  },
  {
    q: "How quickly will I see deals?",
    a: "Once onboarded, our team begins sourcing immediately. Typical timeline: 1-4 weeks for your first vetted deal, depending on your criteria and market availability. We send weekly updates regardless.",
  },
  {
    q: "Do I have to take a deal?",
    a: "No. We present you with opportunities and the numbers — you decide. There's never an obligation to proceed on any deal we show you.",
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
