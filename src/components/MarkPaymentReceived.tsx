"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "error";

export default function MarkPaymentReceived({
  registrationId,
}: {
  registrationId: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/admin/clients/${registrationId}/mark-paid`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not mark payment as received.");
      }
      router.refresh();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "submitting"}
        className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
      >
        {status === "submitting"
          ? "Marking as paid…"
          : "Mark payment as received"}
      </button>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
