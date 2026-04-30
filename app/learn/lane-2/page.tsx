import type { Metadata } from "next";
import katex from "katex";
import "katex/dist/katex.min.css";
import data from "../petal_eml.json";
import { type PetalDataset, type PetalRecord, LANE_DESCRIPTIONS } from "../petal-types";
import LaneClient from "../lane-1/Lane1Client";

const dataset = data as unknown as PetalDataset;
const lane2Records = (dataset.records as PetalRecord[]).filter((r) => r.lane === 2);

const ACCENT = "#06B6D4";
const TEXT_DIM = "#aaa";

export const metadata: Metadata = {
  title: "Lane 2 — Building Blocks — Learn — monogate.dev",
  description:
    "Building Blocks: composition, simp, hypothesis-driven rewrites. The first lower-bound results. Powered by PETAL.",
};

export default function Lane2Page() {
  const renderedRecords = lane2Records.map((rec) => ({
    ...rec,
    statementHtml: renderLatex(rec.statement.latex),
  }));

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px) 120px",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 8,
            fontFamily: "monospace",
          }}
        >
          <a href="/learn" style={{ color: ACCENT, textDecoration: "none" }}>
            ← Back to lanes
          </a>
          {"  ·  "}Lane 2 of 6
        </div>
        <h1
          style={{
            fontSize: "clamp(1.7rem, 6vw, 2.2rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          {LANE_DESCRIPTIONS[2].title}
        </h1>
        <p
          style={{
            fontSize: "clamp(0.95rem, 2.4vw, 1.05rem)",
            color: TEXT_DIM,
            lineHeight: 1.6,
          }}
        >
          {LANE_DESCRIPTIONS[2].subtitle} {lane2Records.length} theorems on
          witness-eval, non-equivalence, and the first SuperBEST lower-bound
          results. Mark each one complete as you work through it — your
          progress saves to your browser.
        </p>
      </header>

      <LaneClient
        records={renderedRecords}
        lane={2}
        laneTitle="Building Blocks"
        completionMessage={
          "You understand witness extraction, non-equivalence proofs, the " +
          "positivity argument for exp-type operators, and the SuperBEST " +
          "lower bound for addition. The Lane-3 contradiction proofs build " +
          "directly on this footing."
        }
      />

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
            style={{ color: ACCENT, textDecoration: "none" }}
          >
            huggingface.co/datasets/Monogate/petal-eml
          </a>
        </p>
      </footer>

      <style>{`
        @keyframes lane1Check {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          60%  { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes lane1Glow {
          0%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .learn-katex .katex {
          font-size: 1.15em;
          color: #fff;
        }
        .learn-katex .katex-display {
          margin: 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
      `}</style>
    </main>
  );
}

function renderLatex(src: string): string {
  try {
    return katex.renderToString(src, {
      displayMode: true,
      throwOnError: false,
      output: "html",
      strict: "ignore",
    });
  } catch {
    return `<code>${escapeHtml(src)}</code>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
