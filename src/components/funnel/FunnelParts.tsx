import Image from "next/image";
import Link from "next/link";
import type { FunnelVideo as FunnelVideoContent } from "@/lib/funnelContent";

// Stripped-down header/footer for ad landing pages: no nav, so paid
// traffic has one place to go (the qualifier), not the whole site.
export function FunnelHeader() {
  return (
    <header className="border-b rule">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
        <span className="flex items-center gap-2.5 font-display text-lg tracking-tight text-paper">
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
      </div>
    </header>
  );
}

export function FunnelFooter() {
  return (
    <footer className="mt-auto border-t rule">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-paper-dim">
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
      className={`rounded-lg border-2 border-dashed border-brass/60 bg-ink-soft/60 p-6 text-sm text-paper-dim ${className}`}
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
  if (!video.url) {
    return (
      <PlaceholderSlot
        label="VIDEO"
        className="flex aspect-video flex-col justify-center"
      >
        <p>{video.brief}</p>
        <p className="mt-2 text-xs">
          Set the URL in <span className="ledger-figure">src/lib/funnelContent.ts</span>.
        </p>
      </PlaceholderSlot>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border rule bg-ink-soft">
      {video.url.endsWith(".mp4") ? (
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
        />
      ) : (
        <iframe
          src={video.url}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="aspect-video w-full"
        />
      )}
    </div>
  );
}
