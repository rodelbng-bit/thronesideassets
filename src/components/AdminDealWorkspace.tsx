"use client";

import { useState } from "react";
import DealAnalyzer from "./DealAnalyzer";
import NewDealForm from "./NewDealForm";
import { computeOccupancyRows } from "@/lib/dealAnalysis";

export default function AdminDealWorkspace() {
  const [nightlyRate, setNightlyRate] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [monthlyBills, setMonthlyBills] = useState(0);

  const rows = computeOccupancyRows(nightlyRate, monthlyRent, monthlyBills);
  const worstCase = rows[0]; // 50% occupancy — the conservative gate
  const hasInputs = nightlyRate > 0 && monthlyRent > 0;
  const isProfitable = hasInputs && worstCase.remaining > 0;

  return (
    <div className="space-y-16">
      <DealAnalyzer
        nightlyRate={nightlyRate}
        onNightlyRateChange={setNightlyRate}
        monthlyRent={monthlyRent}
        onMonthlyRentChange={setMonthlyRent}
        monthlyBills={monthlyBills}
        onMonthlyBillsChange={setMonthlyBills}
      />

      {isProfitable ? (
        <div className="max-w-2xl">
          <p className="ledger-figure text-sm text-brass-bright">PUBLISH</p>
          <h2 className="mt-3 font-display text-2xl text-paper">
            Add the listing.
          </h2>
          <p className="mt-2 text-sm text-paper-dim">
            Rate and utilities are carried over from the analysis above —
            adjust them here if needed.
          </p>
          <div className="mt-6">
            <NewDealForm
              initialRatePerNight={nightlyRate}
              initialUtilityCostPerMonth={monthlyBills}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl rounded-lg border rule bg-ink-soft p-6 text-sm text-paper-dim">
          {hasInputs
            ? "This deal doesn't clear rent and bills at 50% occupancy. The publish form unlocks once it does."
            : "Enter the nightly rate and monthly rent above to check profitability before publishing."}
        </div>
      )}
    </div>
  );
}
