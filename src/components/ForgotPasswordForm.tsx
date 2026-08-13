"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent";

export default function ForgotPasswordForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const email = new FormData(e.currentTarget).get("email");

    await fetch("/api/account/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border rule bg-ink-soft px-6 py-8">
        <p className="font-display text-xl text-paper">Check your email.</p>
        <p className="mt-2 text-sm text-paper-dim">
          If an account exists for that email, we&apos;ve sent a link to
          reset your password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
