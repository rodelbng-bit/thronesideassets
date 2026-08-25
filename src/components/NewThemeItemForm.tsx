"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upload } from "@vercel/blob/client";

type Status = "idle" | "uploading" | "submitting" | "error" | "done";

const THEMES = ["natural", "urban", "classy", "abstract"] as const;

export default function NewThemeItemForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const imageInput = form.elements.namedItem("image") as HTMLInputElement;
    const file = imageInput.files?.[0];

    if (!file) {
      setStatus("error");
      setErrorMessage("Add a reference photo.");
      return;
    }

    try {
      setStatus("uploading");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/theme-items/upload",
      });

      setStatus("submitting");
      const res = await fetch("/api/admin/theme-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: data.get("theme"),
          name: data.get("name"),
          category: data.get("category"),
          searchKeywords: data.get("searchKeywords"),
          imageUrl: blob.url,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not save this item.");
      }

      setStatus("done");
      form.reset();
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const isBusy = status === "uploading" || status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Theme
        </label>
        <select
          name="theme"
          required
          defaultValue="natural"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper focus:border-brass focus:outline-none"
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme[0].toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Item name
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="Boucle armchair"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Category
        </label>
        <input
          type="text"
          name="category"
          required
          placeholder="Seating"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Search keywords
        </label>
        <input
          type="text"
          name="searchKeywords"
          required
          placeholder="boucle armchair cream"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
        <p className="mt-2 text-xs text-paper-dim">
          Sent to the price-comparison API to find the cheapest live
          listing — tune this if results look off, separately from the
          display name above.
        </p>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Reference photo
        </label>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper file:mr-4 file:rounded-full file:border-0 file:bg-brass file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isBusy}
        className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {status === "uploading"
          ? "Uploading…"
          : status === "submitting"
            ? "Saving…"
            : "Add item"}
      </button>
    </form>
  );
}
