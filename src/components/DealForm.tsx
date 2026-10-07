"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import type { Deal } from "@/lib/deals";
import { estimateAnnualAt75, estimateMonthlyEarnings } from "@/lib/dealMath";

// Publishes a new deal, or edits a published one (pass `deal`). Submitting
// first shows a review of the figures exactly as the deal card will show
// them, with warnings for numbers that look like typos; nothing is uploaded
// or saved until that's confirmed.

export type DealFormNumbers = {
  ratePerNight: number;
  utilityCostPerMonth: number;
  monthlyRent: number;
};

type Status = "idle" | "reviewing" | "uploading" | "submitting" | "error";

type Review = {
  title: string;
  location: string;
  description: string;
  deposit: number | null;
  guarantorRequired: boolean;
  photoFiles: File[];
  videoFile: File | undefined;
};

// Below these, the figure is almost certainly a typo (e.g. "1.150" for
// £1,150 rent).
const LOW_RENT = 100;
const LOW_RATE = 20;

export default function DealForm({
  deal,
  numbers,
  onNumbersChange,
  blockedReason,
}: {
  /** Edit this published deal. Omit to create a new one. */
  deal?: Deal;
  /**
   * Rate/rent/costs owned by the caller — the new-deal page shares them
   * with the analyser so the two can't drift apart. Omit to keep them here.
   */
  numbers?: DealFormNumbers;
  onNumbersChange?: (numbers: DealFormNumbers) => void;
  /** Set to stop the deal being reviewed/published, with the reason shown. */
  blockedReason?: string;
}) {
  const router = useRouter();
  const [ownNumbers, setOwnNumbers] = useState<DealFormNumbers>({
    ratePerNight: deal?.ratePerNight ?? 0,
    utilityCostPerMonth: deal?.utilityCostPerMonth ?? 0,
    monthlyRent: deal?.monthlyRent ?? 0,
  });
  const nums = numbers ?? ownNumbers;
  const setNums = onNumbersChange ?? setOwnNumbers;

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [review, setReview] = useState<Review | null>(null);

  function setNumber(key: keyof DealFormNumbers, value: string) {
    setNums({ ...nums, [key]: value === "" ? 0 : Number(value) });
  }

  // Step 1: check the form and show the review. Nothing is saved yet.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    if (blockedReason) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const photosInput = form.elements.namedItem("photos") as HTMLInputElement | null;
    const photoFiles = Array.from(photosInput?.files ?? []);
    const videoInput = form.elements.namedItem("video") as HTMLInputElement;
    const videoFile = videoInput.files?.[0];

    if (!deal && photoFiles.length === 0 && !videoFile) {
      setStatus("error");
      setErrorMessage("Add a walkthrough video, at least one photo, or both.");
      return;
    }
    if (nums.ratePerNight <= 0 || nums.monthlyRent <= 0) {
      setStatus("error");
      setErrorMessage("Enter the nightly rate and monthly rent.");
      return;
    }

    setReview({
      title: String(data.get("title")),
      location: String(data.get("location")),
      description: String(data.get("description")),
      // Blank or 0 means no deposit.
      deposit: Number(data.get("deposit")) || null,
      guarantorRequired: data.get("guarantorRequired") === "yes",
      photoFiles,
      videoFile,
    });
    setStatus("reviewing");
  }

  // Step 2: confirmed — upload any files, then save.
  async function publish() {
    if (!review) return;
    setErrorMessage("");

    try {
      setStatus("uploading");
      const photoUrls: string[] = [];
      for (let i = 0; i < review.photoFiles.length; i++) {
        const file = review.photoFiles[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${review.photoFiles.length}…`);
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/deals/upload",
        });
        photoUrls.push(blob.url);
      }

      let videoUrl: string | null = null;
      if (review.videoFile) {
        setUploadProgress("Uploading video… 0%");
        const blob = await upload(review.videoFile.name, review.videoFile, {
          access: "public",
          handleUploadUrl: "/api/admin/deals/upload",
          clientPayload: "video",
          multipart: true,
          onUploadProgress: ({ percentage }) =>
            setUploadProgress(`Uploading video… ${Math.round(percentage)}%`),
        });
        videoUrl = blob.url;
      }
      setUploadProgress("");

      setStatus("submitting");
      const fields = {
        title: review.title,
        location: review.location,
        description: review.description,
        ratePerNight: nums.ratePerNight,
        utilityCostPerMonth: nums.utilityCostPerMonth,
        monthlyRent: nums.monthlyRent,
        deposit: review.deposit,
        guarantorRequired: review.guarantorRequired,
        videoUrl,
      };
      const res = await fetch(deal ? `/api/admin/deals/${deal.id}` : "/api/admin/deals", {
        method: deal ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deal ? fields : { ...fields, photos: photoUrls }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error ?? "Could not save this deal.");
      }

      router.push(deal ? `/members/deals/${deal.id}` : "/members");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const isBusy = status === "uploading" || status === "submitting";
  const inputClass =
    "mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none";
  const fileClass =
    "mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper file:mr-4 file:rounded-full file:border-0 file:bg-brass file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink";

  return (
    <form
      onSubmit={handleSubmit}
      // Any change after reviewing sends it back for another review.
      onChange={() => {
        if (status === "reviewing") setStatus("idle");
      }}
      className="space-y-5"
    >
      <Field label="Title">
        <input type="text" name="title" required defaultValue={deal?.title} placeholder="2-Bedroom Flat" className={inputClass} />
      </Field>

      <Field label="Location">
        <input type="text" name="location" required defaultValue={deal?.location} placeholder="Manchester" className={inputClass} />
      </Field>

      <Field label="Description">
        <textarea name="description" required rows={4} defaultValue={deal?.description} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Rate per night (£)">
          <input
            type="number"
            name="ratePerNight"
            required
            min={1}
            step={1}
            value={nums.ratePerNight || ""}
            onChange={(e) => setNumber("ratePerNight", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Est. running costs/mo (£)">
          <input
            type="number"
            name="utilityCostPerMonth"
            required
            min={0}
            step={1}
            value={nums.utilityCostPerMonth || ""}
            onChange={(e) => setNumber("utilityCostPerMonth", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Monthly rent (£)">
          <input
            type="number"
            name="monthlyRent"
            required
            min={1}
            step={1}
            value={nums.monthlyRent || ""}
            onChange={(e) => setNumber("monthlyRent", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Deposit (£, if applicable)">
          <input
            type="number"
            name="deposit"
            min={0}
            step={1}
            defaultValue={deal?.deposit ?? undefined}
            placeholder="Leave blank if none"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Guarantor required?">
        <select
          name="guarantorRequired"
          required
          defaultValue={deal?.guarantorRequired ? "yes" : "no"}
          className={inputClass}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </Field>

      <Field label={deal?.videoUrl ? "Replace walkthrough video (optional)" : "Walkthrough video"}>
        <input type="file" name="video" accept="video/mp4,video/quicktime,video/webm" className={fileClass} />
        <p className="mt-2 text-xs text-paper-dim">
          {deal?.videoUrl
            ? "Leave empty to keep the current video. "
            : ""}
          MP4, up to 500 MB. Deals with a video are featured on the /start
          landing page (newest 3).
        </p>
      </Field>

      {/* Photos can't be changed from the edit form yet. */}
      {!deal && (
        <Field label="Photos (optional if there's a video)">
          <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple className={fileClass} />
        </Field>
      )}

      {status === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}

      {blockedReason && !isBusy ? (
        <p className="rounded-lg border rule bg-ink-soft p-4 text-sm text-paper-dim">
          {blockedReason}
        </p>
      ) : (status === "reviewing" || isBusy) && review ? (
        <ReviewPanel
          nums={nums}
          review={review}
          keepingVideo={!!deal?.videoUrl && !review.videoFile}
          isEdit={!!deal}
          isBusy={isBusy}
          progress={status === "uploading" ? uploadProgress || "Uploading…" : status === "submitting" ? "Saving…" : ""}
          onConfirm={publish}
          onBack={() => setStatus("idle")}
        />
      ) : (
        <button
          type="submit"
          className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
        >
          Review {deal ? "changes" : "deal"}
        </button>
      )}
    </form>
  );
}

function ReviewPanel({
  nums,
  review,
  keepingVideo,
  isEdit,
  isBusy,
  progress,
  onConfirm,
  onBack,
}: {
  nums: DealFormNumbers;
  review: Review;
  keepingVideo: boolean;
  isEdit: boolean;
  isBusy: boolean;
  progress: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const earnings = estimateMonthlyEarnings(nums);
  const annual = estimateAnnualAt75(nums);

  const warnings: string[] = [];
  if (nums.monthlyRent < LOW_RENT) {
    warnings.push(
      `Monthly rent is only £${nums.monthlyRent}. If it should be more (e.g. £1,150), fix it before publishing.`
    );
  }
  if (nums.ratePerNight < LOW_RATE) {
    warnings.push(`Nightly rate is only £${nums.ratePerNight}. Check it before publishing.`);
  }
  if (earnings[0].net < 0) {
    warnings.push("This deal loses money at 50% occupancy.");
  }

  return (
    <div className="rounded-lg border border-brass/50 bg-ink-soft p-6">
      <p className="eyebrow">CHECK BEFORE {isEdit ? "SAVING" : "PUBLISHING"}</p>
      <p className="mt-2 text-sm text-paper-dim">
        This is what the deal card will show. Compare it with your deal sheet.
      </p>

      {warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {warnings.map((w) => (
            <li key={w} className="rounded-md border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Summary label="Rate" value={`£${nums.ratePerNight.toLocaleString("en-GB")}/night`} />
        <Summary label="Monthly rent" value={`£${nums.monthlyRent.toLocaleString("en-GB")}/mo`} />
        <Summary label="Running costs" value={`£${nums.utilityCostPerMonth.toLocaleString("en-GB")}/mo`} />
        <Summary label="Deposit" value={review.deposit ? `£${review.deposit.toLocaleString("en-GB")}` : "None"} />
        <Summary label="Guarantor" value={review.guarantorRequired ? "Required" : "Not required"} />
        <Summary
          label="Media"
          value={[
            review.videoFile ? `New video: ${review.videoFile.name}` : keepingVideo ? "Current video" : null,
            review.photoFiles.length > 0 ? `${review.photoFiles.length} photo(s)` : null,
          ]
            .filter(Boolean)
            .join(", ") || "Current photos"}
        />
      </dl>

      <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border rule">
        {earnings.map(({ occupancy, net }) => (
          <div key={occupancy} className="bg-ink px-3 py-3">
            <p className="text-xs text-paper-dim">{Math.round(occupancy * 100)}% occ.</p>
            <p className="ledger-figure mt-1 text-brass-bright">£{net.toLocaleString("en-GB")}/mo</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-paper-dim">
        At 75% occupancy:{" "}
        <span className="ledger-figure text-paper">£{annual.profit.toLocaleString("en-GB")}</span>{" "}
        estimated profit a year (<span className="ledger-figure">£{annual.gross.toLocaleString("en-GB")}</span> gross)
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isBusy}
          className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
        >
          {progress || (isEdit ? "Looks right — save changes" : "Looks right — publish")}
        </button>
        {!isBusy && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border rule px-6 py-3 text-sm text-paper-dim transition-colors hover:text-paper"
          >
            Go back and edit
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-paper-dim">{label}</label>
      {children}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-paper-dim">{label}</dt>
      <dd className="ledger-figure mt-1 text-paper">{value}</dd>
    </div>
  );
}
