"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";

type Status = "idle" | "submitting" | "error";

// NextAuth's middleware sets callbackUrl to a full absolute URL
// (request.nextUrl.href), not a relative path, so this must resolve it
// against the current origin rather than only accepting "/"-prefixed paths.
// With no callbackUrl (e.g. landing on /login directly), admins go to the
// upload form and everyone else goes to the members deal list.
function resolveDestination(
  callbackUrl: string | null,
  isAdmin: boolean
): string {
  const fallback = isAdmin ? "/admin/deals/new" : "/members";
  if (!callbackUrl) return fallback;
  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
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
      const session = await getSession();
      router.push(
        resolveDestination(
          searchParams.get("callbackUrl"),
          session?.user?.isAdmin ?? false
        )
      );
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
