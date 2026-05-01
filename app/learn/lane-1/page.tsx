import type { Metadata } from "next";
import katex from "katex";
import "katex/dist/katex.min.css";
import data from "../petal_eml.json";
import { type PetalDataset, type PetalRecord, LANE_DESCRIPTIONS } from "../petal-types";
import Lane1Client from "./Lane1Client";

const dataset = data as unknown as PetalDataset;
const lane1Records = (dataset.records as PetalRecord[]).filter((r) => r.lane === 1);

const ACCENT = "#06B6D4";
const TEXT_DIM = "#aaa";

export const metadata: Metadata = {
  title: "Lane 1 — First Contact — Learn — monogate.dev",
  description:
    "First Contact: your first Lean 4 proofs. Definitions, rfl, term-mode proofs. Powered by PETAL.",
};

export default function Lane1Page() {
  // Pre-render LaTeX to HTML on the server so the client component
  // ships zero KaTeX runtime — only the stylesheet.
  const renderedRecords = lane1Records.map((rec) => ({
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
          <a href="/learn/lean" style={{ color: ACCENT, textDecoration: "none" }}>
            ← Back to lanes
          </a>
          {"  ·  "}Lane 1 of 6
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
          {LANE_DESCRIPTIONS[1].title}
        </h1>
        <p
          style={{
            fontSize: "clamp(0.95rem, 2.4vw, 1.05rem)",
            color: TEXT_DIM,
            lineHeight: 1.6,
          }}
        >
          {LANE_DESCRIPTIONS[1].subtitle} {lane1Records.length} theorems. Mark
          each one complete as you work through it — your progress saves to
          your browser.
        </p>
      </header>

      <Lane1Client records={renderedRecords} />

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
