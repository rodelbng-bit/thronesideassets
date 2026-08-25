"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upload } from "@vercel/blob/client";

type Status = "idle" | "uploading" | "submitting" | "error";

const THEMES = ["natural", "urban", "classy", "abstract"] as const;

export default function EditThemeItemForm({
  itemId,
  initialTheme,
  initialName,
  initialCategory,
  initialSearchKeywords,
  onDone,
}: {
  itemId: string;
  initialTheme: (typeof THEMES)[number];
  initialName: string;
  initialCategory: string;
  initialSearchKeywords: string;
  onDone: () => void;
}) {
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

    try {
      let imageUrl: string | undefined;
      if (file) {
        setStatus("uploading");
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/theme-items/upload",
        });
        imageUrl = blob.url;
      }

      setStatus("submitting");
      const res = await fetch(`/api/admin/theme-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: data.get("theme"),
          name: data.get("name"),
          category: data.get("category"),
          searchKeywords: data.get("searchKeywords"),
          ...(imageUrl ? { imageUrl } : {}),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not save this item.");
      }

      router.refresh();
      onDone();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const isBusy = status === "uploading" || status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-3 rounded-md border rule bg-ink p-3"
    >
      <div>
        <label className="text-[10px] uppercase tracking-wide text-paper-dim">
          Theme
        </label>
        <select
          name="theme"
          required
          defaultValue={initialTheme}
          className="mt-1 w-full rounded-md border rule bg-ink-soft px-2 py-2 text-xs text-paper focus:border-brass focus:outline-none"
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme[0].toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-paper-dim">
          Item name
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialName}
          className="mt-1 w-full rounded-md border rule bg-ink-soft px-2 py-2 text-xs text-paper focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-paper-dim">
          Category
        </label>
        <input
          type="text"
          name="category"
          required
          defaultValue={initialCategory}
          className="mt-1 w-full rounded-md border rule bg-ink-soft px-2 py-2 text-xs text-paper focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-paper-dim">
          Search keywords
        </label>
        <input
          type="text"
          name="searchKeywords"
          required
          defaultValue={initialSearchKeywords}
          className="mt-1 w-full rounded-md border rule bg-ink-soft px-2 py-2 text-xs text-paper focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-paper-dim">
          Replace photo (optional)
        </label>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 w-full text-xs text-paper-dim file:mr-3 file:rounded-full file:border-0 file:bg-brass file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-red-400">{errorMessage}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-full bg-brass px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
        >
          {status === "uploading"
            ? "Uploading…"
            : status === "submitting"
              ? "Saving…"
              : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={isBusy}
          className="rounded-full border rule px-4 py-1.5 text-xs text-paper-dim transition-colors hover:text-paper disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
