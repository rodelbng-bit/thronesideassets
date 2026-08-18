import Link from "next/link";
import Image from "next/image";
import type { Deal, ReserveState } from "@/lib/deals";

const statusBadge: Record<ReserveState, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "border rule text-brass-bright",
  },
  "reserved-by-me": {
    label: "Reserved by you",
    className: "border rule bg-ledger-green-soft text-paper",
  },
  "reserved-by-other": {
    label: "Reserved",
    className: "border rule text-paper-dim",
  },
  unavailable: {
    label: "Unavailable",
    className: "border rule text-paper-dim opacity-70",
  },
};

export default function DealSummaryCard({
  deal,
  reserveState,
}: {
  deal: Deal;
  reserveState: ReserveState;
}) {
  const badge = statusBadge[reserveState];

  return (
    <div className="grid grid-cols-1 gap-6 rounded-lg border rule bg-ink-soft p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border rule">
        <Image
          src={deal.photos[0]}
          alt={deal.title}
          fill
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-paper">{deal.title}</h3>
            <p className="ledger-figure mt-1 text-sm text-brass-bright">
              {deal.location}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-paper-dim">
          {deal.description}
        </p>

        <Link
          href={`/members/deals/${deal.id}`}
          className="mt-6 inline-flex w-fit items-center rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
        >
          Access Property
        </Link>
      </div>
    </div>
  );
}
