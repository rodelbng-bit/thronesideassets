"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "error";

const STAGE_OPTIONS = [
  { value: "contact_details_completed", label: "Contact Details Completed" },
  { value: "screening_completed", label: "Screening Completed" },
  { value: "plan_selected", label: "Plan Selected" },
  { value: "payment_started", label: "Payment Started" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved / Live" },
  { value: "rejected", label: "Rejected" },
];

export default function RegistrationStageSelect({
  registrationId,
  initialStage,
}: {
  registrationId: string;
  initialStage: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState(initialStage);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleChange(next: string) {
    const previous = stage;
    setStage(next);
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/admin/clients/${registrationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not update stage.");
      }
      router.refresh();
      setStatus("idle");
    } catch (err) {
      setStage(previous);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div>
      <select
        value={stage}
        onChange={(e) => handleChange(e.target.value)}
        disabled={status === "submitting"}
        className="w-full rounded-md border rule bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-brass disabled:opacity-60"
      >
        {!STAGE_OPTIONS.some((opt) => opt.value === stage) && (
          <option value={stage}>{stage}</option>
        )}
        {STAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
