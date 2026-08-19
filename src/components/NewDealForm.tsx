"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upload } from "@vercel/blob/client";

type Status = "idle" | "uploading" | "submitting" | "error" | "done";

type Props = {
  initialRatePerNight?: number;
  initialUtilityCostPerMonth?: number;
};

export default function NewDealForm({
  initialRatePerNight,
  initialUtilityCostPerMonth,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const photosInput = form.elements.namedItem(
      "photos"
    ) as HTMLInputElement;
    const files = Array.from(photosInput.files ?? []);

    if (files.length === 0) {
      setStatus("error");
      setErrorMessage("Add at least one photo.");
      return;
    }

    try {
      setStatus("uploading");
      const photoUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${files.length}…`);
        const blob = await upload(files[i].name, files[i], {
          access: "public",
          handleUploadUrl: "/api/admin/deals/upload",
        });
        photoUrls.push(blob.url);
      }
      setUploadProgress("");

      setStatus("submitting");
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.get("title"),
          location: data.get("location"),
          description: data.get("description"),
          ratePerNight: Number(data.get("ratePerNight")),
          utilityCostPerMonth: Number(data.get("utilityCostPerMonth")),
          guarantorRequired: data.get("guarantorRequired") === "yes",
          photos: photoUrls,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not save this deal.");
      }

      setStatus("done");
      form.reset();
      router.push("/members");
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
          Title
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="2-Bed Conversion"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Location
        </label>
        <input
          type="text"
          name="location"
          required
          placeholder="Shoreditch, East London"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={4}
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-paper-dim">
            Rate per night (£)
          </label>
          <input
            type="number"
            name="ratePerNight"
            required
            min={1}
            step={1}
            defaultValue={initialRatePerNight || undefined}
            className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper focus:border-brass focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-paper-dim">
            Est. utilities/mo (£)
          </label>
          <input
            type="number"
            name="utilityCostPerMonth"
            required
            min={0}
            step={1}
            defaultValue={initialUtilityCostPerMonth || undefined}
            className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper focus:border-brass focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Guarantor required?
        </label>
        <select
          name="guarantorRequired"
          required
          defaultValue="no"
          className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper focus:border-brass focus:outline-none"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-paper-dim">
          Photos
        </label>
        <input
          type="file"
          name="photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
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
          ? uploadProgress || "Uploading…"
          : status === "submitting"
            ? "Saving…"
            : "Publish deal"}
      </button>
    </form>
  );
}
