"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "approved" | "rejected";
type SubmitStatus = "idle" | "submitting" | "error";

const badgeClass: Record<Status, string> = {
  pending: "border rule text-brass-bright",
  approved: "border rule bg-ledger-green-soft text-paper",
  rejected: "border rule text-paper-dim opacity-70",
};

const label: Record<Status, string> = {
  pending: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ClientApprovalStatus({
  userId,
  initialStatus,
}: {
  userId: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Status>(initialStatus);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function setStatusTo(next: Status) {
    if (next === current) return;
    setSubmitStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/admin/clients/${userId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not update status.");
      }
      setCurrent(next);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitStatus("idle");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass[current]}`}
      >
        {label[current]}
      </span>
      <div className="flex gap-2">
        {current !== "approved" && (
          <button
            type="button"
            onClick={() => setStatusTo("approved")}
            disabled={submitStatus === "submitting"}
            className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {current !== "rejected" && (
          <button
            type="button"
            onClick={() => setStatusTo("rejected")}
            disabled={submitStatus === "submitting"}
            className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
          >
            Reject
          </button>
        )}
      </div>
      {errorMessage && (
        <p className="max-w-[10rem] text-right text-xs text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
