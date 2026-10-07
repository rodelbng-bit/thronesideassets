"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  buildFbc,
  getFbp,
  hasTrackingConsent,
  trackMetaEvent,
} from "@/lib/metaPixel";

const SEEN_KEY = "ts-welcome-popup-seen";
const DELAY_MS = 8000;

// Marketing pages only — never over the /start funnel, /join checkout,
// login, or the members/admin areas.
const MARKETING_PATHS = ["/", "/about", "/pricing", "/contact", "/faq", "/deals", "/news"];

type Status = "idle" | "submitting" | "done";

function hasSeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== null;
  } catch {
    // Storage blocked — treat as seen rather than nag on every page view.
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
  } catch {
    // Storage blocked — nothing to remember it in.
  }
}

// First-visit lead capture: opens once per browser, 8s after landing on a
// marketing page, and sends the details into GHL tagged "website-popup".
export default function WelcomePopup() {
  const pathname = usePathname();
  const { status: sessionStatus } = useSession();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const eligible =
    MARKETING_PATHS.includes(pathname) && sessionStatus === "unauthenticated";

  useEffect(() => {
    if (!eligible || hasSeen()) return;
    const timer = window.setTimeout(() => {
      // Re-check in case another tab already showed it.
      if (hasSeen()) return;
      markSeen();
      dialogRef.current?.showModal();
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eligible]);

  function close() {
    dialogRef.current?.close();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setStatus("submitting");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    // Shared by the browser Pixel event and the server's Conversions API
    // copy so Meta counts the lead once.
    const eventId = crypto.randomUUID();
    const consent = hasTrackingConsent();

    try {
      const res = await fetch("/api/welcome-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          meta: consent
            ? { consent: true, eventId, fbp: getFbp(), fbc: buildFbc(undefined) }
            : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong.");
      }

      trackMetaEvent("Lead", { content_name: "welcome-popup" }, eventId);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="welcome-popup-title"
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg border rule-strong bg-ink-soft p-0 text-paper [color-scheme:dark] backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-paper-dim transition-colors hover:text-paper"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {status === "done" ? (
          <div>
            <p className="ledger-figure text-sm text-brass-bright">THANK YOU</p>
            <h2
              id="welcome-popup-title"
              className="mt-2 font-display text-2xl tracking-tight text-paper sm:text-3xl"
            >
              We&apos;ve got your details.
            </h2>
            <p className="mt-3 text-sm text-paper-dim">
              Our UK team will be in touch shortly. Want to talk sooner?
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                onClick={close}
                className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
              >
                Book a call
              </Link>
              <button
                type="button"
                onClick={close}
                className="rounded-full border rule-strong px-6 py-3 text-sm text-paper-dim transition-colors hover:text-paper"
              >
                Keep browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="pr-8">
              <p className="ledger-figure text-sm text-brass-bright">WELCOME</p>
              <h2
                id="welcome-popup-title"
                className="mt-2 font-display text-2xl tracking-tight text-paper sm:text-3xl"
              >
                New to Throneside Assets?
              </h2>
              <p className="mt-3 text-sm text-paper-dim">
                Leave your details and our UK team will get in touch about
                property deals that fit what you&apos;re looking for.
              </p>
            </div>

            <Field label="First name" name="firstName" autoComplete="given-name" required />
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />

            {/* Honeypot — visually hidden and skipped by keyboard/screen readers. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Get in touch"}
            </button>

            <p className="text-xs text-paper-dim">
              By submitting, you agree to Throneside Assets contacting you by
              email, phone or SMS about our services. See our{" "}
              <Link
                href="/terms"
                onClick={close}
                className="underline decoration-paper-dim/40 underline-offset-4 hover:text-paper"
              >
                Terms
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={`welcome-${name}`} className="text-xs uppercase tracking-wide text-paper-dim">
        {label}
      </label>
      <input
        id={`welcome-${name}`}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-md border rule bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
      />
    </div>
  );
}
