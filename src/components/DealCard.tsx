import Link from "next/link";
import type { Deal } from "@/lib/deals";
import { estimateMonthlyEarnings, freshnessFromDate } from "@/lib/deals";
import DealGallery from "./DealGallery";
import DealThermometer from "./DealThermometer";
import ReserveButton from "./ReserveButton";

type ReserveState = "available" | "reserved-by-me" | "reserved-by-other";

export default function DealCard({
  deal,
  reserveState,
  blurred = false,
}: {
  deal: Deal;
  /** Omit to render without a Reserve control — used on the public preview page. */
  reserveState?: ReserveState;
  /** Obscures rate/utilities/earnings/thermometer behind a "Join to unlock" prompt — used on the public preview page. */
  blurred?: boolean;
}) {
  const freshness = freshnessFromDate(deal.dateAdded);
  const earnings = estimateMonthlyEarnings(deal);

  return (
    <div className="grid grid-cols-1 gap-6 rounded-lg border rule bg-ink-soft p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <DealGallery photos={deal.photos} alt={deal.title} />

      <div>
        <h3 className="font-display text-2xl text-paper">{deal.title}</h3>
        <p className="ledger-figure mt-1 text-sm text-brass-bright">
          {deal.location}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-paper-dim">
          {deal.description}
        </p>

        <div className="relative mt-5">
          <div
            className={
              blurred ? "select-none blur-sm pointer-events-none" : ""
            }
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-paper-dim">
                      Rate
                    </dt>
                    <dd className="ledger-figure mt-1 text-paper">
                      £{deal.ratePerNight}/night
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-paper-dim">
                      Est. utilities
                    </dt>
                    <dd className="ledger-figure mt-1 text-paper">
                      £{deal.utilityCostPerMonth}/mo
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-paper-dim">
                    Potential earnings (net of utilities)
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-md border rule">
                    {earnings.map(({ occupancy, net }) => (
                      <div key={occupancy} className="bg-ink px-3 py-3">
                        <p className="text-xs text-paper-dim">
                          {Math.round(occupancy * 100)}% occ.
                        </p>
                        <p className="ledger-figure mt-1 text-brass-bright">
                          £{net.toLocaleString()}/mo
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-6 border-t rule pt-6 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <DealThermometer freshness={freshness} />
                {reserveState && (
                  <ReserveButton dealId={deal.id} initialState={reserveState} />
                )}
              </div>
            </div>
          </div>

          {blurred && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Link
                href="/join"
                className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink shadow-lg transition-colors hover:bg-brass-bright"
              >
                Join to unlock
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
