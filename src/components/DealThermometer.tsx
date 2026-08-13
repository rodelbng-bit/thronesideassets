import type { Freshness } from "@/lib/deals";

const STATUS_STYLES: Record<
  Freshness["label"],
  { bar: string; text: string; fill: number }
> = {
  Hot: { bar: "bg-red-500", text: "text-red-400", fill: 90 },
  Warm: { bar: "bg-orange-500", text: "text-orange-400", fill: 55 },
  Cold: { bar: "bg-blue-500", text: "text-blue-400", fill: 20 },
};

export default function DealThermometer({
  freshness,
}: {
  freshness: Freshness;
}) {
  const style = STATUS_STYLES[freshness.label];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-28 w-3 overflow-hidden rounded-full border rule bg-ink">
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-full ${style.bar}`}
          style={{ height: `${style.fill}%` }}
        />
      </div>
      <div className={`-mt-1 h-3.5 w-3.5 rounded-full ${style.bar}`} />
      <div className="text-center">
        <p className={`ledger-figure text-sm font-medium ${style.text}`}>
          {freshness.label}
        </p>
        <p className="text-xs text-paper-dim">
          added {freshness.days}d ago
        </p>
      </div>
    </div>
  );
}
