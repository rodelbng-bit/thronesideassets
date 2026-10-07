"use client";

import { useState } from "react";
import DealAnalyzer from "./DealAnalyzer";
import DealForm from "./DealForm";
import { computeOccupancyRows } from "@/lib/dealAnalysis";

export default function AdminDealWorkspace() {
  const [nightlyRate, setNightlyRate] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [monthlyBills, setMonthlyBills] = useState(0);

  const rows = computeOccupancyRows(nightlyRate, monthlyRent, monthlyBills);
  const worstCase = rows[0]; // 50% occupancy — the conservative gate
  const hasInputs = nightlyRate > 0 && monthlyRent > 0;
  const isProfitable = hasInputs && worstCase.remaining > 0;

  // Once the form has appeared it stays mounted, so clearing a number to
  // retype it doesn't wipe what's been typed into the rest of the form.
  // Publishing is still blocked while the deal doesn't clear the gate.
  const [unlocked, setUnlocked] = useState(false);
  if (isProfitable && !unlocked) setUnlocked(true);
  const blockedReason = isProfitable
    ? undefined
    : hasInputs
      ? "This deal doesn't clear rent and bills at 50% occupancy, so it can't be published."
      : "Enter the nightly rate and monthly rent to continue.";

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

      {unlocked ? (
        <div className="max-w-2xl">
          <p className="eyebrow">PUBLISH</p>
          <h2 className="mt-3 font-display text-2xl text-paper">
            Add the listing.
          </h2>
          <p className="mt-2 text-sm text-paper-dim">
            Rate, rent and running costs are linked to the analysis above —
            changing them in either place updates both.
          </p>
          <div className="mt-6">
            <DealForm
              numbers={{
                ratePerNight: nightlyRate,
                utilityCostPerMonth: monthlyBills,
                monthlyRent,
              }}
              onNumbersChange={(n) => {
                setNightlyRate(n.ratePerNight);
                setMonthlyBills(n.utilityCostPerMonth);
                setMonthlyRent(n.monthlyRent);
              }}
              blockedReason={blockedReason}
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
