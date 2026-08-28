import type { ReactNode } from "react";

export default function ThemeItemCard({
  name,
  priceSlot,
}: {
  name: string;
  /** Rendered price row — streamed in its own Suspense boundary by the caller. */
  priceSlot: ReactNode;
}) {
  return (
    <div className="rounded-lg border rule bg-ink-soft">
      <div className="p-4">
        <p className="text-sm text-paper">{name}</p>
        <div className="mt-2">{priceSlot}</div>
      </div>
    </div>
  );
}
