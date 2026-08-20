"use client";

import { useState } from "react";

type Interval = "monthly" | "annual";
type Step = "details" | "billing";
type Status = "idle" | "submitting" | "error";

const options: { value: Interval; label: string; note: string }[] = [
  {
    value: "monthly",
    label: "£497/month",
    note: "12-month contract, billed monthly",
  },
  {
    value: "annual",
    label: "£4,970 upfront",
    note: "Full 12-month term paid in one payment — save £994",
  },
];

export default function JoinForm() {
  const [step, setStep] = useState<Step>("details");
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [interval, setInterval] = useState<Interval>("monthly");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmitDetails() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "Could not save your details.");
      }
      setRegistrationId(data.id);
      setStep("billing");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  async function handleContinue() {
    if (!registrationId) return;
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, agreedToTerms, registrationId }),
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

  if (step === "details") {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-paper-dim">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border rule bg-ink-soft px-4 py-2.5 text-paper outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-paper-dim">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border rule bg-ink-soft px-4 py-2.5 text-paper outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-paper-dim">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-lg border rule bg-ink-soft px-4 py-2.5 text-paper outline-none focus:border-brass"
            />
          </div>
        </div>

        {status === "error" && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={handleSubmitDetails}
          disabled={
            status === "submitting" ||
            !name.trim() ||
            !email.trim() ||
            !phone.trim()
          }
          className="w-full rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
        >
          {status === "submitting" ? "Saving…" : "Continue"}
        </button>
      </div>
    );
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
