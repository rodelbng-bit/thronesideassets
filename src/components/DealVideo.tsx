"use client";

import { useRef, useState } from "react";

// A deal's walkthrough video. Sits in the card like a photo (first frame +
// play button); tapping it starts playback full screen. Once it has been
// started, the native controls take over, including after leaving full
// screen.
export default function DealVideo({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  // width / height, read from the file once its metadata loads. Starts
  // landscape; phone walkthroughs are usually portrait.
  const [ratio, setRatio] = useState(16 / 9);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    video.play().catch(() => {});
    // iPhone Safari has no element fullscreen API, only its own video one.
    const iosVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {});
    } else {
      iosVideo.webkitEnterFullscreen?.();
    }
  }

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-lg border rule bg-ink"
      // Portrait videos are capped at 75% of the screen height rather than
      // stretching to the card's full width.
      style={{ aspectRatio: ratio, width: `min(100%, calc(75vh * ${ratio}))` }}
    >
      <video
        ref={videoRef}
        onLoadedMetadata={(e) => {
          const { videoWidth, videoHeight } = e.currentTarget;
          if (videoWidth && videoHeight) setRatio(videoWidth / videoHeight);
        }}
        // #t=0.1 makes iOS render the first frame instead of a blank box.
        src={`${src}#t=0.1`}
        playsInline
        preload="metadata"
        controls={started}
        aria-label={`${title} — walkthrough video`}
        className="h-full w-full object-contain"
      />
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={`Play ${title} walkthrough video`}
          className="group absolute inset-0 flex items-center justify-center bg-ink/30 transition-colors hover:bg-ink/10"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brass text-ink shadow-[0_0_40px_rgba(212,175,55,0.45)] transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <span className="ledger-figure absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-paper backdrop-blur">
            Walkthrough video
          </span>
        </button>
      )}
    </div>
  );
}
