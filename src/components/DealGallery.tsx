"use client";

import { useState } from "react";
import Image from "next/image";

export default function DealGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  function next() {
    setIndex((i) => (i + 1) % photos.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  return (
    <div>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border rule">
        <Image
          src={photos[index]}
          alt={`${alt} — photo ${index + 1} of ${photos.length}`}
          fill
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover"
        />

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
    </div>
  );
}
