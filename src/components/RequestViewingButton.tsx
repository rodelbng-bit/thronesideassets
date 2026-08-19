"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "confirmed" | "declined";
type Step = "idle" | "form" | "submitting" | "error";

const activeStatusLabel: Record<"pending" | "confirmed", string> = {
  pending: "Pending confirmation — our team will be in touch to confirm.",
  confirmed: "Confirmed — see you then!",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });
}

export default function RequestViewingButton({
  dealId,
  existingRequest,
}: {
  dealId: string;
  existingRequest?: { preferredAt: Date; status: Status };
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState<{
    preferredAt: Date;
    status: "pending";
  } | null>(null);

  // A pending/confirmed request already exists — show it, no form.
  const active: { preferredAt: Date; status: "pending" | "confirmed" } | null =
    submitted ??
    (existingRequest && existingRequest.status !== "declined"
      ? { preferredAt: existingRequest.preferredAt, status: existingRequest.status }
      : null);

  if (active) {
    return (
      <div className="rounded-lg border rule bg-ink-soft p-4 text-center">
        <p className="text-sm text-paper">
          Viewing requested for{" "}
          <span className="text-brass-bright">
            {formatDateTime(active.preferredAt)}
          </span>
        </p>
        <p className="mt-1 text-xs text-paper-dim">
          {activeStatusLabel[active.status]}
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const date = data.get("date") as string;
    const time = data.get("time") as string;
    if (!date || !time) {
      setErrorMessage("Choose a date and time.");
      return;
    }

    const preferredAt = new Date(`${date}T${time}`);
    if (Number.isNaN(preferredAt.getTime()) || preferredAt.getTime() < Date.now()) {
      setErrorMessage("Choose a date and time in the future.");
      return;
    }

    setStep("submitting");

    try {
      const res = await fetch(`/api/deals/${dealId}/viewing-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredAt: preferredAt.toISOString() }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not submit your request.");
      }

      setSubmitted({ preferredAt, status: "pending" });
      setStep("idle");
      router.refresh();
    } catch (err) {
      setStep("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const wasDeclined = existingRequest?.status === "declined";
  const showForm = step === "form" || step === "submitting" || step === "error";

  return (
    <div className="flex flex-col items-center gap-2">
      {wasDeclined && existingRequest && (
        <p className="text-xs text-paper-dim">
          Your requested time ({formatDateTime(existingRequest.preferredAt)})
          didn&apos;t work — choose another below.
        </p>
      )}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg border rule bg-ink-soft p-4"
        >
          <p className="text-xs uppercase tracking-wide text-paper-dim">
            Preferred viewing date &amp; time
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="date"
              name="date"
              required
              min={todayIso()}
              className="rounded-md border rule bg-ink px-3 py-2 text-sm text-paper focus:border-brass focus:outline-none"
            />
            <input
              type="time"
              name="time"
              required
              className="rounded-md border rule bg-ink px-3 py-2 text-sm text-paper focus:border-brass focus:outline-none"
            />
          </div>

          {errorMessage && (
            <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
          )}

          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("idle");
                setErrorMessage("");
              }}
              className="rounded-full border rule px-4 py-2 text-xs text-paper-dim transition-colors hover:text-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={step === "submitting"}
              className="rounded-full bg-brass px-5 py-2 text-xs font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
            >
              {step === "submitting" ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setStep("form")}
          className="rounded-full bg-brass px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
        >
          Request Viewing
        </button>
      )}
    </div>
  );
}
