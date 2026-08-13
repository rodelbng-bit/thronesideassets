import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const plans = [
  {
    name: "Essential",
    price: "£497/mo",
    priceNote: "£4,970/yr upfront (save £994)",
    features: [
      "Unlimited deal alerts (FCFS)",
      "Full deal packs with P&L",
      "R2SA news & hot area feeds",
      "Referral to vetted management & cleaners",
      "Member community access",
      "No 1:1 support",
    ],
    // Fixed pricing, so this is the only plan with self-serve checkout.
    joinHref: "/join",
  },
  {
    name: "Investor",
    price: "Pricing on request",
    features: [
      "Everything in Essential",
      "1:1 consulting calls",
      "Priority deal access",
    ],
    joinHref: undefined,
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="ledger-figure text-sm text-brass-bright">MEMBERSHIP</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-paper md:text-5xl">
          Choose your plan.
        </h1>
        <p className="mt-4 max-w-xl text-paper-dim">
          Every plan is a monthly membership, not a per-deal fee — you get
          the weekly deal sheet plus the guidance around it, tailored to
          your package. Book a call and we&apos;ll walk you through current
          pricing and which tier fits.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-lg border rule bg-ink-soft p-8"
            >
              <h2 className="font-display text-2xl text-paper">
                {plan.name}
              </h2>
              <p className="ledger-figure mt-2 text-lg text-brass-bright">
                {plan.price}
              </p>
              {plan.priceNote && (
                <p className="ledger-figure mt-1 text-sm text-paper-dim">
                  {plan.priceNote}
                </p>
              )}
              <ul className="mt-6 space-y-2 text-sm text-paper-dim">
                {plan.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {plan.joinHref && (
                  <Link
                    href={plan.joinHref}
                    className="inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
                  >
                    Join Now
                  </Link>
                )}
                <a
                  href="https://api.leadconnectorhq.com/widget/booking/u1093rNHSQ03sJCDKKFF"
                  className={
                    plan.joinHref
                      ? "inline-block rounded-full border rule px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-paper-dim"
                      : "inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
                  }
                >
                  Register
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-paper-dim">
          Have questions first? See the{" "}
          <a href="/faq" className="text-brass-bright hover:text-paper">
            FAQ
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
