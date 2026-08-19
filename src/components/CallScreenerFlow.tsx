"use client";

import { useEffect, useId, useState } from "react";

type Step = "screener" | "submitting" | "calendar" | "error";

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

// GHL booking widget — Calendars → your calendar → Embed/Share.
const CALENDAR_URL = "https://api.leadconnectorhq.com/widget/booking/u1093rNHSQ03sJCDKKFF";

type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function CallScreenerFlow() {
  const [step, setStep] = useState<Step>("screener");
  const [errorMessage, setErrorMessage] = useState("");
  const [contact, setContact] = useState<ContactDetails | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setStep("submitting");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/call-screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong.");
      }

      setContact({
        firstName: String(data.firstName ?? ""),
        lastName: String(data.lastName ?? ""),
        email: String(data.email ?? ""),
        phone: String(data.phone ?? ""),
      });
      setStep("calendar");
    } catch (err) {
      setStep("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  if (step === "calendar" && contact) {
    return <BookingCalendar contact={contact} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" required />
      </div>

      <Select
        label="Current budget"
        name="budget"
        options={BUDGET_OPTIONS}
        required
      />

      <TextArea
        label="Property / investment goals"
        name="goals"
        required
        placeholder="What are you looking to achieve — cashflow, portfolio growth, a first buy-to-let?"
      />

      <Field
        label="Preferred location(s)"
        name="preferredLocation"
        required
        placeholder="e.g. Manchester, North West England, open to anywhere"
      />

      <Select
        label="Experience level"
        name="experienceLevel"
        options={EXPERIENCE_OPTIONS}
        required
      />

      <TextArea
        label="Anything else we should know before the call?"
        name="additionalInfo"
        placeholder="Optional"
      />

      {step === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={step === "submitting"}
        className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {step === "submitting" ? "Submitting…" : "Continue to calendar"}
      </button>
    </form>
  );
}

function BookingCalendar({ contact }: { contact: ContactDetails }) {
  const iframeId = useId().replace(/:/g, "");

  useEffect(() => {
    if (document.querySelector('script[src*="form_embed.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const params = new URLSearchParams({
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
  });

  return (
    <div>
      <p className="text-sm text-paper-dim">
        Thanks, {contact.firstName}. Pick a time that works for you below.
      </p>
      <div className="mt-6 overflow-hidden rounded-lg border rule">
        <iframe
          src={`${CALENDAR_URL}?${params.toString()}`}
          id={iframeId}
          style={{ width: "100%", height: 780, border: "none" }}
          scrolling="no"
          title="Book a call"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-paper-dim">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-paper-dim">
        {label}
      </label>
      <textarea
        name={name}
        required={required}
        rows={3}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-paper-dim">
        {label}
      </label>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper focus:border-brass focus:outline-none"
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
