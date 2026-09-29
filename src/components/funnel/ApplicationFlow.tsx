"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Attribution } from "@/lib/attribution";
import {
  CAPITAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  INELIGIBLE_CAPITAL,
  MAX_DEALS_WANTED,
} from "@/lib/application";
import {
  buildFbc,
  getFbp,
  hasTrackingConsent,
  trackMetaEvent,
} from "@/lib/metaPixel";
import { BookingCalendar } from "@/components/CallScreenerFlow";

// One question per screen. Contact details are saved on the first "Next"
// (POST /api/apply) and each later answer as it's given (PATCH), so a
// half-finished application still leaves us the lead.

type Answers = {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  dealsWanted: string;
  location: string;
  capital: string;
};

type Step = "contact" | "experience" | "dealsWanted" | "location" | "capital" | "booking" | "ineligible";

const QUESTION_STEPS: Step[] = ["contact", "experience", "dealsWanted", "location", "capital", "booking"];

const EMPTY: Answers = {
  fullName: "",
  email: "",
  phone: "",
  experience: "",
  dealsWanted: "",
  location: "",
  capital: "",
};

// Survives a refresh mid-application so it resumes rather than starting a
// second lead row.
const STORAGE_KEY = "ts-apply";

type Saved = { id: string; step: Step; answers: Answers };

function loadSaved(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(value: Saved | null) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked — the flow still works, it just won't resume.
  }
}

export default function ApplicationFlow({ attribution }: { attribution: Attribution }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("contact");
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = loadSaved();
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring from sessionStorage after hydration
    setId(saved.id);
    setStep(saved.step);
    setAnswers(saved.answers);
  }, []);

  useEffect(() => {
    if (id) save({ id, step, answers });
  }, [id, step, answers]);

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setError("");
  }

  async function submitContact() {
    const eventId = crypto.randomUUID();
    const consent = hasTrackingConsent();
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: answers.fullName,
        email: answers.email,
        phone: answers.phone,
        attribution,
        meta: consent
          ? { consent: true, eventId, fbp: getFbp(), fbc: buildFbc(attribution.fbclid) }
          : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
    trackMetaEvent("Lead", { content_name: attribution.funnel ?? "apply" }, eventId);
    setId(body.id);
  }

  async function submitAnswer(payload: Record<string, unknown>) {
    const res = await fetch(`/api/apply/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
  }

  async function next(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      switch (step) {
        case "contact":
          if (!id) await submitContact();
          setStep("experience");
          break;
        case "experience":
          await submitAnswer({ experience: answers.experience });
          setStep("dealsWanted");
          break;
        case "dealsWanted":
          await submitAnswer({ dealsWanted: Number(answers.dealsWanted) });
          setStep("location");
          break;
        case "location":
          await submitAnswer({ location: answers.location });
          setStep("capital");
          break;
        case "capital":
          await submitAnswer({ capital: answers.capital });
          setStep(answers.capital === INELIGIBLE_CAPITAL ? "ineligible" : "booking");
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function back() {
    const i = QUESTION_STEPS.indexOf(step);
    // Contact details are already saved once past step 1, so back stops
    // at step 2.
    if (i > 1) setStep(QUESTION_STEPS[i - 1]);
    setError("");
  }

  if (step === "ineligible") {
    return (
      <Card>
        <p className="ledger-figure text-xs uppercase tracking-[0.18em] text-brass-bright">
          Application update
        </p>
        <h2 className="font-funnel mt-4 text-3xl font-bold tracking-tight text-paper">
          Thanks, {firstName(answers.fullName)} — you&apos;re not eligible just yet.
        </h2>
        <p className="mt-4 leading-relaxed text-paper-dim">
          Our deal access requires at least £1,000 of available capital to
          get started, so we&apos;re not able to take your application to the
          next stage right now. When your circumstances change, you&apos;re
          very welcome to apply again.
        </p>
        <button
          type="button"
          onClick={() => setStep("capital")}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border rule-strong px-8 py-4 text-base font-medium text-paper transition-colors hover:bg-white/5"
        >
          <span aria-hidden>←</span> Go back and change my answer
        </button>
      </Card>
    );
  }

  const stepNumber = QUESTION_STEPS.indexOf(step) + 1;

  return (
    <Card>
      <div className="flex items-center justify-between text-xs text-paper-dim">
        <span className="ledger-figure uppercase tracking-[0.18em]">
          Step {stepNumber} of {QUESTION_STEPS.length}
        </span>
        {stepNumber > 2 && step !== "booking" && (
          <button type="button" onClick={back} className="hover:text-paper">
            ← Back
          </button>
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="bg-gold h-full rounded-full transition-all duration-500"
          style={{ width: `${(stepNumber / QUESTION_STEPS.length) * 100}%` }}
        />
      </div>

      {step === "booking" && id ? (
        <BookingStep
          applicationId={id}
          answers={answers}
          onBooked={() => {
            save(null);
            router.push(`/start/booked?id=${id}`);
          }}
        />
      ) : (
        <form key={step} onSubmit={next} className="funnel-rise mt-8">
          {step === "contact" && (
            <>
              <Question>First, where can we reach you?</Question>
              <div className="mt-6 space-y-4">
                <Input label="Full name" autoComplete="name" value={answers.fullName} onChange={(v) => set("fullName", v)} autoFocus disabled={!!id} />
                <Input label="Email address" type="email" autoComplete="email" value={answers.email} onChange={(v) => set("email", v)} disabled={!!id} />
                <Input label="Phone number" type="tel" autoComplete="tel" value={answers.phone} onChange={(v) => set("phone", v)} disabled={!!id} />
              </div>
            </>
          )}

          {step === "experience" && (
            <>
              <Question>What&apos;s your experience with property?</Question>
              <Options options={EXPERIENCE_OPTIONS} value={answers.experience} onChange={(v) => set("experience", v)} />
            </>
          )}

          {step === "dealsWanted" && (
            <>
              <Question>How many property deals are you looking for?</Question>
              <div className="mt-6">
                <Input
                  label="Number of deals"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_DEALS_WANTED}
                  step={1}
                  value={answers.dealsWanted}
                  onChange={(v) => set("dealsWanted", v)}
                  autoFocus
                />
              </div>
            </>
          )}

          {step === "location" && (
            <>
              <Question>Where are you looking to invest?</Question>
              <div className="mt-6">
                <Input
                  label="Preferred location(s)"
                  placeholder="e.g. Manchester, Liverpool, anywhere in the North West"
                  value={answers.location}
                  onChange={(v) => set("location", v)}
                  autoFocus
                />
              </div>
            </>
          )}

          {step === "capital" && (
            <>
              <Question>
                How much capital do you currently have available to invest
                into your Airbnb journey?
              </Question>
              <Options options={CAPITAL_OPTIONS} value={answers.capital} onChange={(v) => set("capital", v)} />
            </>
          )}

          {error && <p className="mt-5 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy || !canContinue(step, answers)}
            className="bg-gold mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-ink transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Next"}
            {!busy && <span aria-hidden>→</span>}
          </button>
        </form>
      )}
    </Card>
  );
}

function canContinue(step: Step, a: Answers) {
  switch (step) {
    case "contact":
      return (
        a.fullName.trim() !== "" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim()) &&
        a.phone.replace(/\D/g, "").length >= 7
      );
    case "experience":
      return a.experience !== "";
    case "dealsWanted": {
      const n = Number(a.dealsWanted);
      return Number.isInteger(n) && n >= 1 && n <= MAX_DEALS_WANTED;
    }
    case "location":
      return a.location.trim() !== "";
    case "capital":
      return a.capital !== "";
    default:
      return false;
  }
}

type SlotData = { days: { date: string; slots: string[] }[] };

// GHL returns slots in UK local time with an offset, e.g.
// "2026-09-29T08:00:00+01:00" — read the clock time straight off it.
function slotTime(slot: string) {
  return slot.slice(11, 16);
}

function dayLabel(date: string, part: "weekday" | "day" | "month") {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    [part]: part === "day" ? "numeric" : "short",
    timeZone: "UTC",
  });
}

function BookingStep({
  applicationId,
  answers,
  onBooked,
}: {
  applicationId: string;
  answers: Answers;
  onBooked: () => void;
}) {
  const [data, setData] = useState<SlotData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [useWidget, setUseWidget] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/apply/slots", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: SlotData) => {
        if (cancelled) return;
        setData(d);
        setLoadFailed(false);
        setDay((current) =>
          current && d.days.some((x) => x.date === current && x.slots.length > 0)
            ? current
            : d.days.find((x) => x.slots.length > 0)?.date ?? null
        );
      })
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function book() {
    if (!slot) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/apply/${applicationId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setSlot(null);
        setReload((n) => n + 1);
      }
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      onBooked();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const { firstName: first, lastName } = splitName(answers.fullName);

  if (useWidget) {
    return (
      <div className="mt-8">
        <BookingCalendar contact={{ firstName: first, lastName, email: answers.email, phone: answers.phone }} />
      </div>
    );
  }

  const fallback = (
    <p className="mt-4 text-sm text-paper-dim">
      Having trouble?{" "}
      <button type="button" onClick={() => setUseWidget(true)} className="text-brass-bright underline underline-offset-4">
        Use our full booking calendar instead
      </button>
      .
    </p>
  );

  const daySlots = data?.days.find((x) => x.date === day)?.slots ?? [];
  const hasAnySlots = !!data?.days.some((x) => x.slots.length > 0);

  return (
    <div className="funnel-rise mt-8">
      <Question>Great, {first}. Pick a time for your call.</Question>
      <p className="mt-2 text-sm text-paper-dim">
        A short call with our UK team to talk through your goals. All times are UK time.
      </p>

      {loadFailed ? (
        <div className="mt-6">
          <p className="text-sm text-red-400">We couldn&apos;t load available times.</p>
          <button type="button" onClick={() => setReload((n) => n + 1)} className="mt-3 text-sm text-paper underline underline-offset-4">
            Try again
          </button>
          {fallback}
        </div>
      ) : !data ? (
        <p className="mt-6 text-sm text-paper-dim">Loading available times…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-5 gap-2">
            {data.days.map(({ date, slots }) => {
              const available = slots.length > 0;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setDay(date);
                    setSlot(null);
                  }}
                  aria-pressed={day === date}
                  className={`touch-manipulation rounded-xl border px-1 py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    day === date ? "bg-gold border-transparent text-ink" : "rule text-paper-dim hover:border-brass/50"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-wide">{dayLabel(date, "weekday")}</span>
                  <span className={`font-funnel mt-1 block text-xl font-semibold ${day === date ? "text-ink" : "text-paper"}`}>
                    {dayLabel(date, "day")}
                  </span>
                  <span className="block text-[11px]">{dayLabel(date, "month")}</span>
                </button>
              );
            })}
          </div>

          {!hasAnySlots ? (
            <p className="mt-6 text-sm text-paper-dim">
              There are no times left in the next few days. Please check back
              tomorrow — new times open up every day.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {daySlots.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={slot === s}
                  onClick={() => {
                    setSlot(s);
                    setError("");
                  }}
                  className={`ledger-figure touch-manipulation rounded-lg border py-3 text-sm transition-colors ${
                    slot === s
                      ? "bg-gold border-transparent font-semibold text-ink"
                      : "rule text-paper-dim hover:border-brass/50 hover:text-paper"
                  }`}
                >
                  {slotTime(s)}
                </button>
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-paper-dim" aria-live="polite">
            {slot && day ? (
              <>
                Selected:{" "}
                <span className="font-semibold text-paper">
                  {dayLabel(day, "weekday")} {dayLabel(day, "day")} {dayLabel(day, "month")}, {slotTime(slot)}
                </span>
              </>
            ) : (
              "Tap a time to select it."
            )}
          </p>

          {error && <p className="mt-5 text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={book}
            disabled={!slot || busy}
            className="bg-gold mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-ink transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          >
            {busy ? "Booking…" : "Confirm booking"}
            {!busy && <span aria-hidden>→</span>}
          </button>
          {error && fallback}
        </>
      )}
    </div>
  );
}

function splitName(fullName: string) {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

function firstName(fullName: string) {
  return splitName(fullName).firstName;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="gold-ring rounded-2xl p-6 shadow-2xl shadow-black sm:p-10">{children}</div>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-funnel text-2xl font-bold leading-snug tracking-tight text-paper sm:text-3xl">
      {children}
    </h2>
  );
}

function Options({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" className="mt-6 space-y-2.5">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={`flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left transition-colors ${
              selected ? "border-brass bg-brass/10 text-paper" : "rule text-paper-dim hover:border-brass/50 hover:text-paper"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-brass-bright" : "rule-strong"
              }`}
            >
              {selected && <span className="bg-gold h-2.5 w-2.5 rounded-full" />}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-paper-dim">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border rule bg-ink px-4 py-3.5 text-base text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}
