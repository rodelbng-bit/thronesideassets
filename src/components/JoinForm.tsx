"use client";

import { useState } from "react";

type Interval = "monthly" | "annual";
type Status = "idle" | "submitting" | "error";

const options: { value: Interval; label: string; note?: string }[] = [
  { value: "monthly", label: "£497/mo" },
  { value: "annual", label: "£4,970/yr", note: "save £994" },
];

export default function JoinForm() {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleContinue() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, agreedToTerms }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setInterval(opt.value)}
            className={`rounded-lg border rule px-5 py-4 text-left transition-colors ${
              interval === opt.value
                ? "border-brass bg-ink-soft"
                : "hover:border-paper-dim"
            }`}
          >
            <p className="ledger-figure text-lg text-brass-bright">
              {opt.label}
            </p>
            {opt.note && (
              <p className="mt-1 text-xs text-paper-dim">{opt.note}</p>
            )}
          </button>
        ))}
      </div>

      <label className="flex items-start gap-3 text-sm text-paper-dim">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border rule bg-ink-soft"
        />
        <span>
          I agree to a fixed 12-month membership term. Billing is{" "}
          {interval === "monthly" ? "monthly" : "annual"} for the full term,
          and the membership cannot be cancelled early.
        </span>
      </label>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={status === "submitting" || !agreedToTerms}
        className="w-full rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {status === "submitting" ? "Redirecting…" : "Continue to payment"}
      </button>
    </div>
  );
}
