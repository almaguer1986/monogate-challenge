import type { Metadata } from "next";
import data from "../petal_eml.json";
import { type PetalDataset } from "../petal-types";
import LaneIndexClient from "../LaneIndexClient";

const dataset = data as unknown as PetalDataset;

export const metadata: Metadata = {
  title: "Lean 4 for EML — monogate.dev/learn/lean",
  description:
    "Learn Lean by Proving EML. A 6-lane interactive walk through the Lean 4 formalization of the EML operator, powered by the PETAL dataset. 35 exercises, progressive difficulty.",
};

const ACCENT_PURPLE = "#A78BFA";
const ACCENT_CYAN = "#06B6D4";
const ACCENT_GOLD = "#E8A020";

export default function LearnIndexPage() {
  // Group records by lane for the count badges.
  const byLane: Record<number, number> = {};
  for (const r of dataset.records) {
    byLane[r.lane] = (byLane[r.lane] ?? 0) + 1;
  }

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px) 120px",
      }}
    >
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: "#666",
            marginBottom: 14,
          }}
        >
          <a href="/learn" style={{ color: "#888", textDecoration: "none" }}>
            ← /learn
          </a>
        </div>
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
            fontSize: "clamp(1.8rem, 6vw, 2.4rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Learn Lean by Proving EML
        </h1>
        <p
          style={{
            fontSize: "clamp(0.95rem, 2.4vw, 1.05rem)",
            color: "#aaa",
            lineHeight: 1.6,
          }}
        >
          {dataset.records.length} hand-audited Lean&nbsp;4 theorems from the Monogate
          formalization, structured as a 6-lane interactive curriculum. Every
          proof step has a natural-language explanation, the rationale for the
          tactic chosen, and common mistakes a beginner typically makes.
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            marginTop: 16,
            fontFamily: "monospace",
          }}
        >
          Dataset {dataset.dataset_version} · schema {dataset.schema_version} ·{" "}
          <a
            href="https://github.com/agent-maestro/monogate-lean"
            style={{ color: ACCENT_CYAN }}
          >
            monogate-lean source ↗
          </a>{" "}
          · CC BY 4.0
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          <a
            href="/learn/leaderboard"
            style={{
              color: ACCENT_GOLD,
              textDecoration: "none",
              border: `1px solid ${ACCENT_GOLD}40`,
              padding: "6px 14px",
              borderRadius: 6,
              background: `${ACCENT_GOLD}08`,
            }}
          >
            🏆 Leaderboard
          </a>
        </div>
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
        <LaneIndexClient byLane={byLane} laneRecordCount={byLane} />
      </section>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid #1a1a1d",
          fontSize: 12,
          color: "#666",
          lineHeight: 1.7,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          Powered by <strong style={{ color: "#aaa" }}>PETAL</strong> ·{" "}
          {dataset.records.length} theorems · CC BY 4.0 ·{" "}
          <a
            href="https://huggingface.co/datasets/Monogate/petal-eml"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: ACCENT_CYAN, textDecoration: "none" }}
          >
            huggingface.co/datasets/Monogate/petal-eml
          </a>
        </p>
      </footer>
    </main>
  );
}
