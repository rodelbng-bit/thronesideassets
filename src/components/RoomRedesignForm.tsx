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

type CatalogItem = {
  id: string;
  name: string;
  imageUrl: string;
};

const THEME_SUGGESTIONS = ["Natural", "Urban", "Classy", "Abstract"];

export default function RoomRedesignForm({
  dealId,
  propertyPhotos,
  catalogItems,
}: {
  dealId: string;
  propertyPhotos: string[];
  catalogItems: CatalogItem[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [theme, setTheme] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [items, setItems] = useState<ResultItem[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [useOwnPhoto, setUseOwnPhoto] = useState(propertyPhotos.length === 0);

  function prevPhoto() {
    setPhotoIndex((i) => (i - 1 + propertyPhotos.length) % propertyPhotos.length);
  }
  function nextPhoto() {
    setPhotoIndex((i) => (i + 1) % propertyPhotos.length);
  }
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  function toggleItem(id: string) {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const photoInput = form.elements.namedItem("photo") as HTMLInputElement | null;
    const file = photoInput?.files?.[0];

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
        const photo = propertyPhotos[photoIndex];
        if (!photo) {
          setStatus("error");
          setErrorMessage("Pick a photo of the property.");
          return;
        }
        photoUrl = photo;
      }

      setStatus("generating");
      const res = await fetch("/api/theme-room/redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          theme: theme.trim(),
          photoUrl,
          itemIds: selectedItemIds,
        }),
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
            <div className="mt-3">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md border-2 border-brass">
                <Image
                  src={propertyPhotos[photoIndex]}
                  alt={`Property photo ${photoIndex + 1} of ${propertyPhotos.length}`}
                  fill
                  sizes="(min-width: 640px) 600px, 100vw"
                  className="object-cover"
                />

                {propertyPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevPhoto}
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-paper backdrop-blur transition-colors hover:bg-ink"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextPhoto}
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-paper backdrop-blur transition-colors hover:bg-ink"
                    >
                      ›
                    </button>
                    <span className="ledger-figure absolute right-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-xs text-paper backdrop-blur">
                      {photoIndex + 1} / {propertyPhotos.length}
                    </span>
                  </>
                )}
              </div>

              {propertyPhotos.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                  {propertyPhotos.map((photo, i) => (
                    <button
                      key={photo}
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      aria-label={`Go to photo ${i + 1}`}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        i === photoIndex ? "bg-brass-bright" : "bg-paper-dim/40"
                      }`}
                    />
                  ))}
                </div>
              )}
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

        {catalogItems.length > 0 && (
          <div>
            <label className="text-xs uppercase tracking-wide text-paper-dim">
              Include specific items (optional)
            </label>
            <p className="mt-2 text-xs text-paper-dim">
              We&apos;ll steer the redesign toward these pieces&apos; style,
              color, and material — the AI can&apos;t drop in the exact
              product photos, but this gets it much closer than a style name
              alone.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {catalogItems.map((item) => {
                const selected = selectedItemIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={
                      "relative aspect-square overflow-hidden rounded-md border-2 transition-colors " +
                      (selected
                        ? "border-brass"
                        : "border-transparent hover:border-paper-dim")
                    }
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {selected && (
                      <span className="absolute inset-0 flex items-end bg-ink/50 p-1.5">
                        <span className="text-[10px] font-medium text-paper">
                          {item.name}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
