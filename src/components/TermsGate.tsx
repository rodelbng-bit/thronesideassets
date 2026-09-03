"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { termsIntro, termsSections } from "@/lib/siteFacts";

type Status = "idle" | "submitting" | "error";

export default function TermsGate({
  needsAcceptance,
}: {
  needsAcceptance: boolean;
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  if (!needsAcceptance) return null;

  async function handleAgree() {
    setStatus("submitting");
    try {
      const res = await fetch("/api/account/accept-terms", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-4 py-10 backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-2xl flex-col rounded-lg border rule bg-ink-soft">
        <div className="shrink-0 border-b rule px-6 py-5 sm:px-8">
          <p className="ledger-figure text-xs text-brass-bright">
            ACTION REQUIRED
          </p>
          <h2 className="mt-2 font-display text-2xl text-paper">
            Our Terms & Conditions have been updated.
          </h2>
          <p className="mt-2 text-sm text-paper-dim">
            Please review and agree before continuing to use your
            membership account.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <p className="text-sm leading-relaxed text-paper-dim">
            {termsIntro}
          </p>
          <div className="mt-8 space-y-8">
            {termsSections.map((section) => (
              <section key={section.heading}>
                <h3 className="font-display text-lg text-paper">
                  {section.heading}
                </h3>
                {section.paragraphs.map((p) => (
                  <p key={p} className="mt-3 text-sm leading-relaxed text-paper-dim">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-paper-dim">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.trailingParagraphs?.map((p) => (
                  <p key={p} className="mt-3 text-sm leading-relaxed text-paper-dim">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 space-y-4 border-t rule px-6 py-6 sm:px-8">
          <label className="flex items-start gap-3 text-sm text-paper-dim">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border rule bg-ink"
            />
            <span>
              I have read and agree to the Terms & Conditions above (also
              available at{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brass-bright underline hover:text-paper"
              >
                /terms
              </a>
              ).
            </span>
          </label>

          {status === "error" && (
            <p className="text-sm text-red-400">
              Something went wrong saving your agreement — please try again.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
            >
              Log out instead
            </button>
            <button
              type="button"
              onClick={handleAgree}
              disabled={!agreed || status === "submitting"}
              className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
            >
              {status === "submitting" ? "Saving…" : "Agree & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
