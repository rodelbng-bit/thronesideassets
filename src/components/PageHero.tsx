/**
 * Opening block shared by the inner pages: eyebrow, headline with an
 * optional orange italic accent phrase, and an intro paragraph. Mirrors the
 * home Hero's treatment at a smaller scale.
 */
export default function PageHero({
  eyebrow,
  title,
  accent,
  children,
  width = "max-w-3xl",
}: {
  eyebrow: string;
  title?: string;
  /** Rendered after `title` in the orange italic accent face. */
  accent?: string;
  /** Intro copy under the headline. */
  children?: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(255,117,24,0.14),transparent)]"
      />
      <div className={`relative ${width}`}>
        <p className="eyebrow enter">{eyebrow}</p>
        <h1 className="enter mt-5 font-display text-4xl leading-[1.05] text-paper [animation-delay:90ms] md:text-6xl">
          {title}
          {title && accent && " "}
          {accent && (
            <span className="font-accent text-brass">{accent}</span>
          )}
        </h1>
        {children && (
          <div className="enter mt-6 text-lg leading-relaxed text-paper-dim [animation-delay:180ms]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
