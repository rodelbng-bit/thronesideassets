"use client";

import Image from "next/image";
import { useState } from "react";

type Price = { vendorName: string; priceMinor: number; url: string } | null;

export type HotspotItem = {
  name: string;
  price: Price;
  point?: { x: number; y: number } | null;
};

export default function ThemeRedesignHotspots({
  imageUrl,
  items,
}: {
  imageUrl: string;
  items: HotspotItem[];
}) {
  // Keep the marker box matched to the render's real aspect ratio so the
  // fractional coordinates line up regardless of what shape the model returns.
  const [ratio, setRatio] = useState(4 / 3);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const located = items.filter(
    (item): item is HotspotItem & { point: { x: number; y: number } } =>
      !!item.point
  );

  return (
    <div
      className="relative mt-3 w-full max-w-2xl"
      style={{ aspectRatio: String(ratio) }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg border rule">
        <Image
          src={imageUrl}
          alt="Redesigned room"
          fill
          sizes="(min-width: 768px) 42rem, 100vw"
          className="object-cover"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
      </div>

      {located.map((item, i) => {
        const open = openIndex === i;
        const below = item.point.y < 0.5;
        return (
          <div
            key={`${item.name}-${i}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${item.point.x * 100}%`,
              top: `${item.point.y * 100}%`,
            }}
            onMouseEnter={() => setOpenIndex(i)}
            onMouseLeave={() =>
              setOpenIndex((cur) => (cur === i ? null : cur))
            }
          >
            <button
              type="button"
              aria-label={`Where to buy: ${item.name}`}
              onClick={() => setOpenIndex(open ? null : i)}
              className="relative flex h-5 w-5 items-center justify-center rounded-full bg-brass ring-2 ring-ink transition-transform hover:scale-110"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-ink" />
            </button>

            {open && (
              <div
                className={`absolute left-1/2 w-44 -translate-x-1/2 rounded-lg border rule bg-ink p-3 text-left shadow-lg ${
                  below ? "top-full mt-2" : "bottom-full mb-2"
                }`}
              >
                <p className="text-xs text-paper">{item.name}</p>
                {item.price ? (
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="ledger-figure text-xs text-brass-bright">
                      £{(item.price.priceMinor / 100).toFixed(2)}
                    </span>
                    <a
                      href={item.price.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border rule px-2 py-0.5 text-[11px] text-paper-dim transition-colors hover:text-paper"
                    >
                      Buy
                    </a>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[11px] text-paper-dim">
                    No live price found.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
