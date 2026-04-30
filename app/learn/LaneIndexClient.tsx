"use client";

import { useEffect, useState } from "react";
import { LANE_DESCRIPTIONS } from "./petal-types";

const ACCENT_PURPLE = "#A78BFA";
const ACCENT_CYAN = "#06B6D4";
const ACCENT_PINK = "#EC4899";
const ACCENT_GOLD = "#E8A020";

const LANE_ACCENT: Record<number, string> = {
  1: ACCENT_CYAN,
  2: ACCENT_CYAN,
  3: ACCENT_PURPLE,
  4: ACCENT_PURPLE,
  5: ACCENT_PINK,
  6: ACCENT_GOLD,
};

const LANE_LONG_DESCRIPTION: Record<number, string> = {
  1: "Inductive types, depth, rfl, and the complex-exp identity. The smallest possible Lean proofs.",
  2: "How simp, rewrites, and hypothesis-driven tactics chain definitions into composite results.",
  3: "Witness extraction, F-family lower bounds, and proof-by-contradiction over EML trees.",
  4: "The SuperBEST framework: multi-operator lower bounds and the synthesis lemmas they unlock.",
  5: "Universality, EML-elementary, self-map conjugacies, and how Mathlib wrappers connect to the master result.",
  6: "The research frontier — the InfiniteZerosBarrier and the open lemmas that gate sin/cos/π/i.",
};

export default function LaneIndexClient({
  byLane,
  laneRecordCount,
}: {
  byLane: Record<number, number>;
  laneRecordCount: Record<number, number>;
}) {
  // Track which lanes have been completed via localStorage. Lane 2
  // unlocks when every Lane 1 record has been marked done.
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([1]));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next = new Set<number>([1]); // Lane 1 always unlocked.
    try {
      // Lane N unlocks when Lane N-1's localStorage set covers every
      // record in Lane N-1.
      for (let lane = 1; lane <= 5; lane++) {
        const key = `monogate.learn.lane${lane}.completed`;
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) continue;
        const required = laneRecordCount[lane] ?? 0;
        if (required > 0 && arr.length >= required) {
          next.add(lane + 1);
        }
      }
    } catch {
      // localStorage unavailable -- only Lane 1 stays unlocked.
    }
    setUnlocked(next);
    setHydrated(true);
  }, [laneRecordCount]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3, 4, 5, 6].map((lane) => {
        const accent = LANE_ACCENT[lane];
        const lc = LANE_DESCRIPTIONS[lane];
        const longDesc = LANE_LONG_DESCRIPTION[lane];
        const count = byLane[lane] ?? 0;
        // Pre-hydration: render lane 1 as unlocked + everything else
        // locked, matching the server-rendered HTML so React doesn't
        // mark a hydration mismatch.
        const isUnlocked = hydrated ? unlocked.has(lane) : lane === 1;
        const href = `/learn/lane-${lane}`;
        const hasPage = lane <= 2; // We've shipped lane-1 and lane-2 routes.
        const lockedHint =
          lane === 2 && !isUnlocked
            ? "Complete Lane 1 to unlock Building Blocks"
            : null;

        const Wrapper = isUnlocked && hasPage
          ? ({ children }: { children: React.ReactNode }) => (
              <a
                href={href}
                style={{
                  display: "block",
                  padding:
                    "clamp(16px, 3vw, 22px) clamp(18px, 3.5vw, 26px)",
                  border: `1px solid ${accent}30`,
                  borderRadius: 10,
                  background: `${accent}08`,
                  textDecoration: "none",
                  color: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {children}
              </a>
            )
          : ({ children }: { children: React.ReactNode }) => (
              <div
                aria-disabled
                style={{
                  position: "relative",
                  padding:
                    "clamp(16px, 3vw, 22px) clamp(18px, 3.5vw, 26px)",
                  border: `1px dashed ${accent}30`,
                  borderRadius: 10,
                  background: `${accent}05`,
                  color: "inherit",
                  opacity: 0.85,
                }}
              >
                {children}
              </div>
            );

        return (
          <Wrapper key={lane}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: accent,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontFamily: "monospace",
                }}
              >
                {isUnlocked ? `Lane ${lane}` : `🔒 Lane ${lane}`}
              </span>
              <span
                style={{
                  fontSize: "clamp(15px, 3.5vw, 18px)",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {lc.title}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#888",
                  fontFamily: "monospace",
                  marginLeft: "auto",
                }}
              >
                {count} {count === 1 ? "record" : "records"}
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#888",
                fontFamily: "monospace",
                marginBottom: 8,
              }}
            >
              {lc.subtitle}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#aaa",
                lineHeight: 1.55,
              }}
            >
              {longDesc}
            </div>
            {!isUnlocked && lockedHint && (
              <div
                style={{
                  fontSize: 11,
                  color: "#777",
                  marginTop: 12,
                  fontFamily: "monospace",
                  letterSpacing: 0.4,
                }}
              >
                {lockedHint}
              </div>
            )}
            {!isUnlocked && !lockedHint && (
              <div
                style={{
                  fontSize: 11,
                  color: "#777",
                  marginTop: 12,
                  fontFamily: "monospace",
                  letterSpacing: 0.4,
                }}
              >
                Walk-through coming soon — view records on{" "}
                <a
                  href="https://github.com/agent-maestro/monogate-lean"
                  style={{ color: accent }}
                >
                  GitHub ↗
                </a>
              </div>
            )}
            {isUnlocked && hasPage && (
              <div
                style={{
                  fontSize: 12,
                  color: accent,
                  marginTop: 12,
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                Start →
              </div>
            )}
            {isUnlocked && !hasPage && (
              <div
                style={{
                  fontSize: 11,
                  color: "#777",
                  marginTop: 12,
                  fontFamily: "monospace",
                  letterSpacing: 0.4,
                }}
              >
                Records visible on{" "}
                <a
                  href="https://github.com/agent-maestro/monogate-lean"
                  style={{ color: accent }}
                >
                  GitHub ↗
                </a>
                {" — "}interactive walk-through coming soon.
              </div>
            )}
          </Wrapper>
        );
      })}
    </div>
  );
}
