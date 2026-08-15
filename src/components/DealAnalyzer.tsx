"use client";

import { useState } from "react";
import { computeOccupancyRows } from "@/lib/dealAnalysis";

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

function formatNights(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function CurrencyField({
  label,
  optional,
  value,
  onChange,
}: {
  label: string;
  optional?: boolean;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-paper-dim">
        {label}
        {optional && <span className="normal-case"> (optional)</span>}
      </label>
      <div className="mt-2 flex items-baseline gap-1.5 border-b rule pb-2">
        <span className="ledger-figure text-2xl text-paper-dim">£</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          placeholder="0"
          className="ledger-figure w-full bg-transparent text-2xl text-paper placeholder:text-paper-dim/50 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ReferenceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-paper-dim">
        {label} <span className="normal-case">(reference only)</span>
      </label>
      <div className="mt-2 border-b rule pb-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          placeholder="0"
          className="ledger-figure w-full bg-transparent text-2xl text-paper placeholder:text-paper-dim/50 focus:outline-none"
        />
      </div>
    </div>
  );
}

type Props = {
  nightlyRate: number;
  onNightlyRateChange: (n: number) => void;
  monthlyRent: number;
  onMonthlyRentChange: (n: number) => void;
  monthlyBills: number;
  onMonthlyBillsChange: (n: number) => void;
};

export default function DealAnalyzer({
  nightlyRate,
  onNightlyRateChange,
  monthlyRent,
  onMonthlyRentChange,
  monthlyBills,
  onMonthlyBillsChange,
}: Props) {
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [notes, setNotes] = useState("");

  const rows = computeOccupancyRows(nightlyRate, monthlyRent, monthlyBills);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="rounded-lg border rule bg-ink-soft p-6">
        <div className="flex items-center gap-3">
          <p className="ledger-figure shrink-0 text-sm text-brass-bright">
            DEAL INPUTS
          </p>
          <div className="h-0 flex-1 border-t rule" />
        </div>

        <div className="mt-6 space-y-6">
          <CurrencyField
            label="Airbnb nightly rate"
            value={nightlyRate}
            onChange={onNightlyRateChange}
          />
          <CurrencyField
            label="Monthly rent"
            value={monthlyRent}
            onChange={onMonthlyRentChange}
          />
          <CurrencyField
            label="Monthly bills"
            optional
            value={monthlyBills}
            onChange={onMonthlyBillsChange}
          />
          <ReferenceField
            label="Bedrooms"
            value={bedrooms}
            onChange={setBedrooms}
          />
          <ReferenceField
            label="Bathrooms"
            value={bathrooms}
            onChange={setBathrooms}
          />

          <div>
            <label className="text-xs uppercase tracking-wide text-paper-dim">
              Notes <span className="normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything worth flagging about this deal…"
              className="mt-2 w-full rounded-md border rule bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-dim/60 focus:border-brass focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-paper-dim">
          <span className="text-brass-bright">Methodology:</span> 30-day
          month · 50/75/100% occupancy · OTA fees deducted at 13% of gross
          revenue, then rent and bills (if entered) are deducted. The result
          is labelled Remaining — not profit — since cleaning, laundry,
          Wi-Fi, consumables, maintenance, insurance, software
          subscriptions, council tax, and TV licence are all excluded.
        </p>
      </div>

      <div className="rounded-lg border rule bg-ink-soft p-6">
        <div className="flex items-center gap-3">
          <p className="ledger-figure shrink-0 text-sm text-brass-bright">
            DEAL BREAKDOWN
          </p>
          <div className="h-0 flex-1 border-t rule" />
        </div>
        <p className="ledger-figure mt-2 text-sm text-paper-dim">
          Beds: {bedrooms || "—"}&emsp;Baths: {bathrooms || "—"}
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b rule text-left">
                {[
                  "Occupancy",
                  "Nights",
                  "Revenue",
                  "OTA fee (13%)",
                  "Rev. after OTA",
                  "Monthly rent",
                  "Monthly bills",
                  "Remaining",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-2 pb-3 text-xs font-normal uppercase tracking-wide text-paper-dim first:pl-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.occupancy} className="border-b rule">
                  <td className="py-4 pl-0 pr-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brass-bright" />
                      <span className="ledger-figure text-paper">
                        {Math.round(row.occupancy * 100)}%
                      </span>
                    </span>
                  </td>
                  <td className="ledger-figure px-2 py-4 text-paper">
                    {formatNights(row.nights)}
                  </td>
                  <td className="ledger-figure px-2 py-4 text-paper">
                    {formatGBP(row.revenue)}
                  </td>
                  <td className="ledger-figure px-2 py-4 text-paper-dim">
                    {formatGBP(-row.otaFee)}
                  </td>
                  <td className="ledger-figure px-2 py-4 text-paper">
                    {formatGBP(row.revAfterOta)}
                  </td>
                  <td className="ledger-figure px-2 py-4 text-paper-dim">
                    {monthlyRent > 0 ? formatGBP(-monthlyRent) : "–"}
                  </td>
                  <td className="ledger-figure px-2 py-4 text-paper-dim">
                    {monthlyBills > 0 ? formatGBP(-monthlyBills) : "–"}
                  </td>
                  <td
                    className={`ledger-figure px-2 py-4 font-medium ${
                      row.remaining < 0 ? "text-red-400" : "text-brass-bright"
                    }`}
                  >
                    {formatGBP(row.remaining)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3 border-t rule pt-6">
          {rows.map((row) => (
            <div
              key={row.occupancy}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-paper-dim">
                {Math.round(row.occupancy * 100)}% Occupancy
              </span>
              <span
                className={`ledger-figure text-lg ${
                  row.remaining < 0 ? "text-red-400" : "text-brass-bright"
                }`}
              >
                {formatGBP(row.remaining)} remaining after OTA fees and rent
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 border-t rule pt-6 text-xs leading-relaxed text-paper-dim">
          <span className="text-red-400">Not profit.</span> Cleaning,
          laundry, Wi-Fi, consumables, maintenance, insurance, software
          subscriptions, council tax, and TV licence are all excluded from
          this figure. Bills are only deducted if entered on the left.
        </p>
      </div>
    </div>
  );
}
