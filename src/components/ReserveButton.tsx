"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReserveState } from "@/lib/deals";

type Status = "idle" | "submitting" | "error";

export default function ReserveButton({
  dealId,
  initialState,
  limitReached = false,
}: {
  dealId: string;
  initialState: ReserveState;
  /** This member already holds an unconfirmed reservation elsewhere. */
  limitReached?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<ReserveState>(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // initialState only reflects the latest server data on re-renders (e.g.
  // after router.refresh() from an admin availability toggle), not on
  // mount — this keeps the displayed state in sync with it.
  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  async function handleReserve() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/deals/${dealId}/reserve`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 409 && data.reason === "already-reserved") {
        setState("reserved-by-other");
        return;
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setState("reserved-by-me");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setStatus("idle");
    }
  }

  if (state === "unavailable") {
    return (
      <span className="rounded-full border rule px-5 py-2.5 text-sm text-paper-dim">
        Unavailable
      </span>
    );
  }

  if (state === "reserved-by-me") {
    return (
      <span className="rounded-full border rule bg-ledger-green-soft px-5 py-2.5 text-sm font-medium text-paper">
        Reserved by you
      </span>
    );
  }

  if (state === "reserved-by-other") {
    return (
      <span className="rounded-full border rule px-5 py-2.5 text-sm text-paper-dim">
        Reserved
      </span>
    );
  }

  if (limitReached) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="rounded-full border rule px-5 py-2.5 text-sm text-paper-dim opacity-70">
          Reserve
        </span>
        <p className="max-w-[12rem] text-center text-xs text-paper-dim">
          Confirm your current reservation first
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleReserve}
        disabled={status === "submitting"}
        className="rounded-full bg-brass px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {status === "submitting" ? "Reserving…" : "Reserve"}
      </button>
      {status === "error" && (
        <p className="max-w-[10rem] text-center text-xs text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
