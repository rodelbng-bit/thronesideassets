import Image from "next/image";
import Link from "next/link";
import type { FunnelVideo as FunnelVideoContent } from "@/lib/funnelContent";

/** Page frame for an ad funnel page (the main site theme applies). */
export function FunnelShell({ children }: { children: React.ReactNode }) {
  return <div className="funnel-theme">{children}</div>;
}

// Stripped-down header/footer for ad landing pages: no nav, so paid
// traffic has one place to go (booking a call), not the whole site.
export function FunnelHeader({ cta }: { cta?: { href: string; label: string } }) {
  return (
    <header className="sticky top-0 z-30 border-b rule bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="font-funnel flex items-center gap-2.5 text-lg font-semibold tracking-tight text-paper">
          <Image
            src="/logo-mark.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          Throneside Assets
        </span>
        {cta && (
          <a
            href={cta.href}
            className="hidden rounded-full border border-brass/50 px-5 py-2 text-sm font-medium text-paper transition-colors hover:border-brass-bright hover:bg-brass/10 sm:inline-block"
          >
            {cta.label}
          </a>
        )}
      </div>
    </header>
  );
}

export function FunnelFooter() {
  return (
    <footer className="mt-auto border-t rule">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-paper-dim">
        <p>© {new Date().getFullYear()} Throneside Assets</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-paper">
            Terms &amp; Conditions
          </Link>
          <Link href="/" className="hover:text-paper">
            Main site
          </Link>
        </div>
      </div>
    </footer>
  );
}

/** The site's section label (orange rule + uppercase label). */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

/** Obvious "not filled in yet" slot — never styled like real content. */
export function PlaceholderSlot({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-brass/50 bg-ink-soft/80 p-6 text-sm text-paper-dim ${className}`}
    >
      <p className="ledger-figure text-xs text-brass-bright">
        PLACEHOLDER — {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function FunnelVideo({
  video,
  title,
}: {
  video: FunnelVideoContent;
  title: string;
}) {
  return (
    <div className="relative">
      {/* Soft gold glow behind the frame. */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(255,117,24,0.22),transparent)] blur-2xl"
      />
      <div className="gold-ring overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-black">
        {!video.url ? (
          <PlaceholderSlot
            label="VIDEO"
            className="flex aspect-video flex-col items-center justify-center rounded-xl border-brass/40 text-center"
          >
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink shadow-[0_0_40px_rgba(255,117,24,0.45)]">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </span>
            <p className="mx-auto max-w-md">{video.brief}</p>
            <p className="mt-2 text-xs">
              Set the URL in <span className="ledger-figure">src/lib/funnelContent.ts</span>.
            </p>
          </PlaceholderSlot>
        ) : video.url.endsWith(".mp4") ? (
          <video
            src={video.url}
            poster={video.poster}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full rounded-xl"
          />
        ) : (
          <iframe
            src={video.url}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="aspect-video w-full rounded-xl"
          />
        )}
      </div>
    </div>
  );
}
