import type { Metadata } from "next";
import data from "./petal_eml.json";
import { type PetalDataset, LANE_DESCRIPTIONS } from "./petal-types";

const dataset = data as unknown as PetalDataset;

export const metadata: Metadata = {
  title: "Learn — monogate.dev",
  description:
    "Learn Lean by Proving EML. A 6-lane interactive walk through the Lean 4 formalization of the EML operator, powered by the PETAL dataset.",
};

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

export default function LearnIndexPage() {
  // Group records by lane for the count badges.
  const byLane: Record<number, number> = {};
  for (const r of dataset.records) {
    byLane[r.lane] = (byLane[r.lane] ?? 0) + 1;
  }

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px 120px" }}>
      <header style={{ marginBottom: 48 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: ACCENT_PURPLE,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          PETAL · Proof · Explanation · Tactic · Aligned · Lean
        </div>
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Learn Lean by Proving EML
        </h1>
        <p style={{ fontSize: "1.05rem", color: "#aaa", lineHeight: 1.6 }}>
          {dataset.records.length} hand-audited Lean&nbsp;4 theorems from the Monogate
          formalization, structured as a 6-lane interactive curriculum. Every
          proof step has a natural-language explanation, the rationale for the
          tactic chosen, and common mistakes a beginner typically makes.
        </p>
        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: 16, fontFamily: "monospace" }}>
          Dataset {dataset.dataset_version} · schema {dataset.schema_version} ·{" "}
          <a
            href="https://github.com/agent-maestro/monogate-lean"
            style={{ color: ACCENT_CYAN }}
          >
            monogate-lean source ↗
          </a>{" "}
          · CC BY 4.0
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          The 6 lanes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((lane) => {
            const accent = LANE_ACCENT[lane];
            const lc = LANE_DESCRIPTIONS[lane];
            const count = byLane[lane] ?? 0;
            const isLane1 = lane === 1;

            return (
              <a
                key={lane}
                href={isLane1 ? "/learn/lane-1" : "#"}
                style={{
                  display: "block",
                  padding: "20px 24px",
                  border: `1px solid ${accent}30`,
                  borderRadius: 10,
                  background: `${accent}08`,
                  textDecoration: "none",
                  color: "inherit",
                  cursor: isLane1 ? "pointer" : "default",
                  opacity: isLane1 ? 1 : 0.7,
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 16,
                    marginBottom: 8,
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
                    Lane {lane}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
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
                <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.5 }}>
                  {lc.subtitle}
                </div>
                {!isLane1 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 10,
                      fontFamily: "monospace",
                    }}
                  >
                    [walk-through coming soon — view records in the dataset on{" "}
                    <a
                      href="https://github.com/agent-maestro/monogate-lean"
                      style={{ color: accent }}
                    >
                      GitHub
                    </a>
                    ]
                  </div>
                )}
                {isLane1 && (
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
              </a>
            );
          })}
        </div>
      </section>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: "1px solid #222",
          fontSize: 12,
          color: "#666",
          lineHeight: 1.7,
        }}
      >
        <p>
          Powered by{" "}
          <strong style={{ color: "#aaa" }}>PETAL</strong>{" "}
          (Proof–Explanation–Tactic Aligned Lean). All 35 records grounded in
          the actual Lean source — no fabricated tactics. 13 of 14 files
          zero-sorry; the 14th carries 2 documented sorries on the
          InfiniteZerosBarrier Part D.
        </p>
        <p style={{ marginTop: 12 }}>
          Verified by <code style={{ color: "#aaa" }}>lake build</code>, not
          peer-reviewed. Goal-state strings (<code>goal_before</code> /
          <code> goal_after</code>) are deliberately omitted in this seed
          rather than fabricated; a future release with extracted goal states
          is planned.
        </p>
      </footer>
    </main>
  );
}
