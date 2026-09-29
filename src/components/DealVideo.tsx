"use client";

import { useEffect, useRef, useState } from "react";

// A deal's walkthrough video. Sits in the card like a photo (first frame +
// play button); tapping it starts playback full screen. Once it has been
// started, the native controls take over, including after leaving full
// screen.
export default function DealVideo({
  src,
  title,
  fill = false,
}: {
  src: string;
  title: string;
  /**
   * Fill a fixed 4:5 frame (cropping to fit) instead of sizing to the
   * video's own shape — keeps side-by-side cards identical.
   */
  fill?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  // width / height, read from the file once its metadata loads. Starts
  // landscape; phone walkthroughs are usually portrait.
  const [ratio, setRatio] = useState(16 / 9);

  // The metadata can finish loading before React attaches onLoadedMetadata
  // (a cached video), which would leave the frame stuck at 16:9.
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 1 && video.videoWidth && video.videoHeight) {
      setRatio(video.videoWidth / video.videoHeight);
    }
  }, []);

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
      className={`relative overflow-hidden rounded-lg border rule bg-ink ${
        fill ? "aspect-[4/5] w-full" : "mx-auto"
      }`}
      // Otherwise height is capped (55% of the screen, 480px at most) so
      // portrait videos stay a preview-sized frame; tapping plays full screen.
      style={
        fill
          ? undefined
          : { aspectRatio: ratio, width: `min(100%, calc(min(55vh, 480px) * ${ratio}))` }
      }
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
        className={`h-full w-full ${fill && !started ? "object-cover" : "object-contain"}`}
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
