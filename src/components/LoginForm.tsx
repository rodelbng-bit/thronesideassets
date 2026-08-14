"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

type Status = "idle" | "submitting" | "error";

// NextAuth's middleware sets callbackUrl to a full absolute URL
// (request.nextUrl.href), not a relative path, so this must resolve it
// against the current origin rather than only accepting "/"-prefixed paths.
function resolveDestination(callbackUrl: string | null): string {
  if (!callbackUrl) return "/members";
  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) return "/members";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/members";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const data = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: data.get("email"),
        password: data.get("password"),
        redirect: false,
      });
      if (result?.error) {
        throw new Error("Incorrect email or password.");
      }
      router.push(resolveDestination(searchParams.get("callbackUrl")));
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
      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
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
        {status === "submitting" ? "Logging in…" : "Log in"}
      </button>

      <p className="text-sm text-paper-dim">
        <Link href="/forgot-password" className="text-brass-bright hover:text-paper">
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}
