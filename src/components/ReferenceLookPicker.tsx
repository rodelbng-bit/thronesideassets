"use client";

import Image from "next/image";
import { useOptimistic, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// The 3 reference photos for the current style + room type — the member
// picks the one closest to what they want, and that choice steers the
// generation (see describeReferenceLook in lib/referenceLook.ts), not just
// the style category on average.
export default function ReferenceLookPicker({
  images,
  active,
  label,
}: {
  images: string[];
  active: number;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [shownIndex, setShownIndex] = useOptimistic(active);

  function select(index: number) {
    if (index === shownIndex) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("look", String(index));
    startTransition(() => {
      setShownIndex(index);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className={`mt-4 grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => select(i)}
          aria-pressed={shownIndex === i}
          className={`relative aspect-4/3 overflow-hidden rounded-lg border-2 text-left transition-colors ${
            shownIndex === i ? "border-brass" : "border-transparent"
          }`}
        >
          <Image
            src={src}
            alt={`${label} interior look ${i + 1}`}
            fill
            sizes="(min-width: 640px) 30vw, 50vw"
            className="object-cover"
          />
          {shownIndex === i && (
            <span className="ledger-figure absolute right-2 top-2 rounded-full bg-brass px-2 py-1 text-xs text-ink">
              Selected
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
