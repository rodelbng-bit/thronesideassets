"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "editing" | "submitting" | "error";

export default function EditNameForm({
  initialName,
}: {
  initialName: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function save() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/account/name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save name.");
      }
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setStatus("editing");
    }
  }

  if (status === "idle" && initialName) {
    return (
      <div className="flex items-center gap-3">
        <p className="font-display text-2xl text-paper">{initialName}</p>
        <button
          type="button"
          onClick={() => setStatus("editing")}
          className="text-xs text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
        >
          Edit
        </button>
      </div>
    );
  }

  if (status === "idle" && !initialName) {
    return (
      <button
        type="button"
        onClick={() => setStatus("editing")}
        className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper"
      >
        Add your name
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className="rounded-md border rule bg-ink px-3 py-1.5 text-sm text-paper focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={status === "submitting"}
          className="rounded-full bg-brass px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
        >
          {status === "submitting" ? "Saving…" : "Save"}
        </button>
      </div>
      {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
    </div>
  );
}
