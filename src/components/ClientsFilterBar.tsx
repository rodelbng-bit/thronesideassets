"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const STAGE_OPTIONS = [
  { value: "contact_details_completed", label: "Contact Details Completed" },
  { value: "screening_completed", label: "Screening Completed" },
  { value: "plan_selected", label: "Plan Selected" },
  { value: "payment_started", label: "Payment Started" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved / Live" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_OPTIONS = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "abandoned", label: "Abandoned" },
];

const PAYMENT_OPTIONS = [
  { value: "not_paid", label: "Not Yet Paid" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past Due" },
  { value: "canceled", label: "Canceled" },
  { value: "none", label: "None" },
];

const INTERVAL_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

const APPROVAL_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const FILTER_KEYS = ["stage", "status", "payment", "interval", "approval"];

function FilterSelect({
  label,
  paramKey,
  options,
  value,
  onChange,
}: {
  label: string;
  paramKey: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-paper-dim">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(paramKey, e.target.value)}
        className="w-full rounded-md border rule bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-brass"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ClientsFilterBar() {
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
  const sortValue = searchParams.get("sort") ?? "newest";

  return (
    <div className="rounded-lg border rule bg-ink-soft p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <FilterSelect
          label="Stage"
          paramKey="stage"
          options={STAGE_OPTIONS}
          value={searchParams.get("stage") ?? ""}
          onChange={setParam}
        />
        <FilterSelect
          label="Status"
          paramKey="status"
          options={STATUS_OPTIONS}
          value={searchParams.get("status") ?? ""}
          onChange={setParam}
        />
        <FilterSelect
          label="Payment status"
          paramKey="payment"
          options={PAYMENT_OPTIONS}
          value={searchParams.get("payment") ?? ""}
          onChange={setParam}
        />
        <FilterSelect
          label="Plan"
          paramKey="interval"
          options={INTERVAL_OPTIONS}
          value={searchParams.get("interval") ?? ""}
          onChange={setParam}
        />
        <FilterSelect
          label="Approval"
          paramKey="approval"
          options={APPROVAL_OPTIONS}
          value={searchParams.get("approval") ?? ""}
          onChange={setParam}
        />
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-paper-dim">
            Sort by date registered
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
