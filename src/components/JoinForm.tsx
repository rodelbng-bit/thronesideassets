"use client";

import { useState } from "react";

type Interval = "monthly" | "annual";
type Step = "details" | "screening" | "billing";
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

const BUDGET_OPTIONS = [
  "Under £50k",
  "£50k–£100k",
  "£100k–£250k",
  "£250k–£500k",
  "£500k+",
  "Not sure yet",
];

const EXPERIENCE_OPTIONS = [
  "First-time investor",
  "1–3 properties",
  "4–10 properties",
  "10+ properties",
];

export default function JoinForm() {
  const [step, setStep] = useState<Step>("details");
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [hasGuarantor, setHasGuarantor] = useState<boolean | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");

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
      setStep("screening");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  async function handleSubmitScreening() {
    if (!registrationId || hasGuarantor === null) return;
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          budget,
          goals,
          preferredLocation,
          experienceLevel,
          hasGuarantor,
          additionalInfo,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save your answers.");
      }
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
          <TextField label="Full name" value={name} onChange={setName} />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <TextField
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
          />
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

  if (step === "screening") {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <TextField
            label="Company name"
            value={companyName}
            onChange={setCompanyName}
            placeholder="Optional — if you invest through a company"
            required={false}
          />
          <SelectField
            label="Current budget"
            value={budget}
            onChange={setBudget}
            options={BUDGET_OPTIONS}
          />
          <TextAreaField
            label="Property / investment goals"
            value={goals}
            onChange={setGoals}
            placeholder="What are you looking to achieve — cashflow, portfolio growth, a first buy-to-let?"
          />
          <TextField
            label="Preferred location(s)"
            value={preferredLocation}
            onChange={setPreferredLocation}
            placeholder="e.g. Manchester, North West England, open to anywhere"
          />
          <SelectField
            label="Experience level"
            value={experienceLevel}
            onChange={setExperienceLevel}
            options={EXPERIENCE_OPTIONS}
          />
          <div>
            <label className="mb-1.5 block text-sm text-paper-dim">
              Do you have a guarantor?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setHasGuarantor(opt.value)}
                  className={`rounded-lg border rule px-4 py-2.5 text-sm transition-colors ${
                    hasGuarantor === opt.value
                      ? "border-brass bg-ink-soft text-paper"
                      : "text-paper-dim hover:border-paper-dim"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <TextAreaField
            label="Anything else we should know?"
            value={additionalInfo}
            onChange={setAdditionalInfo}
            placeholder="Optional"
            required={false}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={handleSubmitScreening}
          disabled={
            status === "submitting" ||
            !budget.trim() ||
            !goals.trim() ||
            !preferredLocation.trim() ||
            !experienceLevel.trim() ||
            hasGuarantor === null
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

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-paper-dim">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border rule bg-ink-soft px-4 py-2.5 text-paper outline-none focus:border-brass"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-paper-dim">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full rounded-lg border rule bg-ink-soft px-4 py-2.5 text-paper outline-none focus:border-brass"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-paper-dim">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-lg border rule bg-ink-soft px-4 py-2.5 text-paper outline-none focus:border-brass"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
