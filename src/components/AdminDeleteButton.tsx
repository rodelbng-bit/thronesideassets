"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "confirming" | "deleting" | "error";

// Two-step Delete → Confirm delete button for admin lists. Sends DELETE to
// `endpoint`, then refreshes the page (or goes to `redirectTo`, for a
// detail page whose record no longer exists).
export default function AdminDeleteButton({
  endpoint,
  confirmMessage,
  redirectTo,
}: {
  endpoint: string;
  confirmMessage: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setStatus("deleting");
    setErrorMessage("");

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete.");
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  if (status === "confirming") {
    return (
      <div className="flex flex-col items-end gap-1">
        <p className="text-right text-xs text-paper-dim">{confirmMessage}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-red-500/60 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
          >
            Confirm delete
          </button>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setStatus("confirming")}
        disabled={status === "deleting"}
        className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-red-400 disabled:opacity-60"
      >
        {status === "deleting" ? "Deleting…" : "Delete"}
      </button>
      {status === "error" && errorMessage && (
        <p className="max-w-[14rem] text-right text-xs text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
