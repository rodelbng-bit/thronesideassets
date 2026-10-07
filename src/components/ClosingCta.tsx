type CtaLink = { href: string; label: string };

/** Teal closing panel with a warm glow — home page copy by default. */
export default function ClosingCta({
  title = "Ready to see",
  accent = "real deals?",
  body = "Book a call with our UK team and find out how we can source your next investment.",
  primary = { href: "/contact", label: "Book a Call" },
  secondary,
}: {
  title?: string;
  /** Rendered after `title` in the orange italic accent face. */
  accent?: string;
  body?: string;
  primary?: CtaLink;
  secondary?: CtaLink;
}) {
  return (
    <section className="border-b rule">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="reveal relative overflow-hidden rounded-3xl border rule bg-ledger-green-soft px-8 py-12 md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.35),transparent)]"
          />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-3xl text-paper md:text-5xl">
                {title}{" "}
                <span className="font-accent text-brass">{accent}</span>
              </h2>
              <p className="mt-3 max-w-md text-paper-dim">{body}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href={primary.href}
                className="cta-glow group inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink hover:bg-brass-bright"
              >
                {primary.label}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              {secondary && (
                <a
                  href={secondary.href}
                  className="rounded-full border rule-strong px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-brass hover:text-brass-bright"
                >
                  {secondary.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
