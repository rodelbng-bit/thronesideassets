"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "error";

export default function ThemeItemActiveToggle({
  itemId,
  initialActive,
}: {
  itemId: string;
  initialActive: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [status, setStatus] = useState<Status>("idle");

  async function toggle() {
    const next = !active;
    setStatus("submitting");

    try {
      const res = await fetch(`/api/admin/theme-items/${itemId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) throw new Error();
      setActive(next);
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={status === "submitting"}
      className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
    >
      {status === "submitting" ? "Updating…" : active ? "Deactivate" : "Activate"}
    </button>
  );
}
