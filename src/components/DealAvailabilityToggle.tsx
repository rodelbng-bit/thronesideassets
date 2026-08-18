"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DealStatus = "available" | "unavailable";
type Status = "idle" | "submitting" | "error";

export default function DealAvailabilityToggle({
  dealId,
  initialStatus,
}: {
  dealId: string;
  initialStatus: DealStatus;
}) {
  const router = useRouter();
  const [dealStatus, setDealStatus] = useState<DealStatus>(initialStatus);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function toggle() {
    const next: DealStatus =
      dealStatus === "available" ? "unavailable" : "available";
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/admin/deals/${dealId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not update status.");
      }
      setDealStatus(next);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="rounded-lg border rule bg-ink-soft p-4">
      <p className="text-xs uppercase tracking-wide text-paper-dim">
        Admin
      </p>
      <div className="mt-2 flex items-center gap-3">
        <p className="text-sm text-paper">
          Currently{" "}
          <span
            className={
              dealStatus === "available" ? "text-brass-bright" : "text-paper-dim"
            }
          >
            {dealStatus === "available" ? "Available" : "Unavailable"}
          </span>
        </p>
        <button
          type="button"
          onClick={toggle}
          disabled={status === "submitting"}
          className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
        >
          {status === "submitting"
            ? "Updating…"
            : dealStatus === "available"
              ? "Mark Unavailable"
              : "Mark Available"}
        </button>
      </div>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
