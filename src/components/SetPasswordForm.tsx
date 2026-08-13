"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Status = "idle" | "submitting" | "error";

export default function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const password = new FormData(e.currentTarget).get("password") as string;

    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        throw new Error(
          "Password set, but automatic sign-in failed — try logging in."
        );
      }

      router.push("/members");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          New password
        </label>
        <input
          type="password"
          name="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
          placeholder="At least 8 characters"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {status === "submitting" ? "Setting password…" : "Set password & continue"}
      </button>
    </form>
  );
}
