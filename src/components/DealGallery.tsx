"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function DealGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function next() {
    setIndex((i) => (i + 1) % photos.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  return (
    <div>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border rule">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View full-screen"
          className="absolute inset-0 cursor-zoom-in"
        >
          <Image
            src={photos[index]}
            alt={`${alt} — photo ${index + 1} of ${photos.length}`}
            fill
            sizes="(min-width: 1024px) 25vw, 100vw"
            className="object-cover"
          />
        </button>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-paper backdrop-blur transition-colors hover:bg-ink"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-paper backdrop-blur transition-colors hover:bg-ink"
            >
              ›
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-brass-bright" : "bg-paper-dim/40"
              }`}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          alt={alt}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  photos,
  alt,
  index,
  onIndexChange,
  onClose,
}: {
  photos: string[];
  alt: string;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  function next() {
    onIndexChange((index + 1) % photos.length);
  }
  function prev() {
    onIndexChange((index - 1 + photos.length) % photos.length);
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const touchStartX = useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-lg text-paper backdrop-blur transition-colors hover:bg-ink"
      >
        ✕
      </button>

      {photos.length > 1 && (
        <p className="ledger-figure absolute left-4 top-5 text-sm text-paper-dim">
          {index + 1} / {photos.length}
        </p>
      )}

      <div
        className="relative h-[70vh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[index]}
          alt={`${alt} — photo ${index + 1} of ${photos.length}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-2xl text-paper backdrop-blur transition-colors hover:bg-ink sm:left-4"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-2xl text-paper backdrop-blur transition-colors hover:bg-ink sm:right-4"
          >
            ›
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {photos.map((photo, i) => (
              <button
                key={photo}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndexChange(i);
                }}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-brass-bright" : "bg-paper-dim/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
