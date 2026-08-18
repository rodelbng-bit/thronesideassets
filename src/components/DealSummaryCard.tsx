import Link from "next/link";
import Image from "next/image";
import type { Deal, ReserveState } from "@/lib/deals";
import { freshnessFromDate } from "@/lib/deals";
import ReserveButton from "./ReserveButton";
import DealThermometer from "./DealThermometer";

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
  reservationLimitReached = false,
}: {
  deal: Deal;
  reserveState: ReserveState;
  /** This member already holds an unconfirmed reservation elsewhere. */
  reservationLimitReached?: boolean;
}) {
  const badge = statusBadge[reserveState];
  const freshness = freshnessFromDate(deal.dateAdded);

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

        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="line-clamp-2 text-sm leading-relaxed text-paper-dim">
              {deal.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/members/deals/${deal.id}`}
                className="inline-flex w-fit items-center rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
              >
                Access Property
              </Link>
              {reserveState === "available" && (
                <ReserveButton
                  dealId={deal.id}
                  initialState={reserveState}
                  limitReached={reservationLimitReached}
                />
              )}
            </div>
          </div>

          <DealThermometer freshness={freshness} />
        </div>
      </div>
    </div>
  );
}
