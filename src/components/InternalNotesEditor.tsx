"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "error";

export default function InternalNotesEditor({
  registrationId,
  initialNotes,
}: {
  registrationId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setStatus("submitting");
    setErrorMessage("");
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/clients/${registrationId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save notes.");
      }
      setStatus("idle");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={5}
        placeholder="Internal notes about this applicant — not visible to the client."
        className="w-full rounded-lg border rule bg-ink px-4 py-2.5 text-sm text-paper outline-none focus:border-brass"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "submitting"}
          className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
        >
          {status === "submitting" ? "Saving…" : "Save notes"}
        </button>
        {saved && (
          <span className="text-xs text-brass-bright">Saved.</span>
        )}
      </div>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
