"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "hot", label: "Hottest first" },
  { value: "old", label: "Oldest first" },
];

const FILTER_KEYS = ["location", "minBudget", "maxBudget"];

export default function DealsFilterBar({
  locations,
}: {
  locations: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.get(key));
  const sortValue = searchParams.get("sort") ?? "hot";
  const locationValue = searchParams.get("location") ?? "";
  const minBudget = searchParams.get("minBudget") ?? "";
  const maxBudget = searchParams.get("maxBudget") ?? "";

  return (
    <div className="rounded-lg border rule bg-ink-soft p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-paper-dim">
            Sort by
          </label>
          <select
            value={sortValue}
            onChange={(e) => setParam("sort", e.target.value)}
            className="w-full rounded-md border rule bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-brass"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-paper-dim">
            Location
          </label>
          <select
            value={locationValue}
            onChange={(e) => setParam("location", e.target.value)}
            className="w-full rounded-md border rule bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-brass"
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-paper-dim">
            Min £/night
          </label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minBudget}
            onChange={(e) => setParam("minBudget", e.target.value)}
            placeholder="No min"
            className="w-full rounded-md border rule bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-brass"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-paper-dim">
            Max £/night
          </label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxBudget}
            onChange={(e) => setParam("maxBudget", e.target.value)}
            placeholder="No max"
            className="w-full rounded-md border rule bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-brass"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="mt-4 text-xs text-paper-dim underline-offset-2 hover:text-paper hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
