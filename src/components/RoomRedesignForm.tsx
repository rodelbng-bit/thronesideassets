"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

type Status = "idle" | "uploading" | "generating" | "error" | "done";

type ResultItem = {
  name: string;
  imageUrl: string | null;
  price: { vendorName: string; priceMinor: number; url: string } | null;
};

const THEME_SUGGESTIONS = ["Natural", "Urban", "Classy", "Abstract"];

export default function RoomRedesignForm({
  dealId,
  propertyPhotos,
}: {
  dealId: string;
  propertyPhotos: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [theme, setTheme] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [items, setItems] = useState<ResultItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    propertyPhotos[0] ?? null
  );
  const [useOwnPhoto, setUseOwnPhoto] = useState(propertyPhotos.length === 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const photoInput = form.elements.namedItem("photo") as HTMLInputElement;
    const file = photoInput.files?.[0];

    if (!theme.trim()) {
      setStatus("error");
      setErrorMessage("Enter a style.");
      return;
    }

    try {
      let photoUrl: string;
      if (useOwnPhoto) {
        if (!file) {
          setStatus("error");
          setErrorMessage("Add a photo of the room.");
          return;
        }
        setStatus("uploading");
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/theme-room/upload",
        });
        photoUrl = blob.url;
      } else {
        if (!selectedPhoto) {
          setStatus("error");
          setErrorMessage("Pick a photo of the property.");
          return;
        }
        photoUrl = selectedPhoto;
      }

      setStatus("generating");
      const res = await fetch("/api/theme-room/redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, theme: theme.trim(), photoUrl }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not generate a redesign.");
      }

      setGeneratedImageUrl(result.redesign.generatedImageUrl);
      setItems(result.items);
      setStatus("done");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const isBusy = status === "uploading" || status === "generating";

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs uppercase tracking-wide text-paper-dim">
            Photo of the room
          </label>

          {propertyPhotos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUseOwnPhoto(false)}
                className={
                  !useOwnPhoto
                    ? "rounded-full bg-brass px-3 py-1 font-medium text-ink"
                    : "rounded-full border rule px-3 py-1 text-paper-dim transition-colors hover:text-paper"
                }
              >
                Use a property photo
              </button>
              <button
                type="button"
                onClick={() => setUseOwnPhoto(true)}
                className={
                  useOwnPhoto
                    ? "rounded-full bg-brass px-3 py-1 font-medium text-ink"
                    : "rounded-full border rule px-3 py-1 text-paper-dim transition-colors hover:text-paper"
                }
              >
                Upload my own photo
              </button>
            </div>
          )}

          {!useOwnPhoto && propertyPhotos.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {propertyPhotos.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className={
                    "relative aspect-square overflow-hidden rounded-md border-2 transition-colors " +
                    (selectedPhoto === url
                      ? "border-brass"
                      : "border-transparent hover:border-paper-dim")
                  }
                >
                  <Image
                    src={url}
                    alt="Property photo"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              required={useOwnPhoto}
              className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper file:mr-4 file:rounded-full file:border-0 file:bg-brass file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
            />
          )}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-paper-dim">
            Style
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
            placeholder="Natural, Urban, Classy, Abstract, or anything else"
            className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setTheme(suggestion)}
                className="rounded-full border rule px-3 py-1 text-xs text-paper-dim transition-colors hover:text-paper"
              >
                {suggestion}
              </button>
            ))}
          </div>
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
            : status === "generating"
              ? "Generating your redesign…"
              : "Generate redesign"}
        </button>
      </form>

      {status === "done" && generatedImageUrl && (
        <div className="mt-10">
          <p className="ledger-figure text-sm text-brass-bright">RESULT</p>
          <div className="relative mt-3 aspect-4/3 w-full max-w-2xl overflow-hidden rounded-lg border rule">
            <Image
              src={generatedImageUrl}
              alt="Redesigned room"
              fill
              className="object-cover"
            />
          </div>

          {items.length > 0 && (
            <>
              <h3 className="mt-8 font-display text-xl text-paper">
                Shop this look.
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border rule bg-ink-soft p-4"
                  >
                    <p className="text-sm text-paper">{item.name}</p>
                    {item.price ? (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="ledger-figure text-sm text-brass-bright">
                          £{(item.price.priceMinor / 100).toFixed(2)}
                        </span>
                        <a
                          href={item.price.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-paper-dim underline decoration-paper-dim/40 underline-offset-4 transition-colors hover:text-paper"
                        >
                          Buy
                        </a>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-paper-dim">
                        No live price found right now.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
