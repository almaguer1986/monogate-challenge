import type { Metadata } from "next";
import data from "./petal_eml.json";
import { type PetalDataset } from "./petal-types";
import LearnHubClient from "./LearnHubClient";

export const metadata: Metadata = {
  title: "Learn — monogate.dev",
  description:
    "Two learning tracks: EML-lang (write math, compile to 21 targets, no prerequisites beyond algebra) and Lean (formal verification across 6 lanes, powered by the PETAL dataset).",
};

export default function LearnHubPage() {
  const dataset = data as unknown as PetalDataset;
  // byLane drives the locked/unlocked logic on the Lean card so the hub
  // can show "X of N exercises done" using the same record IDs that
  // /learn/lean's LaneIndexClient writes to localStorage.
  const byLane: Record<number, number> = {};
  for (const r of dataset.records) {
    byLane[r.lane] = (byLane[r.lane] ?? 0) + 1;
  }
  return (
    <LearnHubClient
      laneRecordCount={byLane}
      totalLeanExercises={dataset.records.length}
    />
  );
}
