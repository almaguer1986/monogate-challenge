"use client";
import { useState } from "react";
import superbest from "../../data/superbest_v5_table.json";

const C = {
  bg: "#06060a", surface: "#0d0e1c", border: "#191b2e",
  text: "#cdd0e0", muted: "#4e5168", accent: "#4facfe",
  green: "#5ec47a", mono: "monospace",
};

type Op = (typeof superbest.table)[number];

export default function SuperBESTPage() {
  const [domain, setDomain] = useState<"positive" | "general">("positive");
  const ops: Op[] = superbest.table;
  const totals = superbest.totals;

  const headline = domain === "positive"
    ? totals.positive_headline
    : totals.general_headline;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: C.mono }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ fontSize: 11, color: C.muted, marginBottom: 24, display: "flex", gap: 16 }}>
          <span>SuperBEST v{superbest.version}</span>
          <span>{superbest.date}</span>
          <span>arXiv:2603.21852</span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
          SuperBEST Routing Table
        </h1>
        <p style={{ color: C.muted, marginBottom: 32, fontSize: 13 }}>
          Minimum F16-node constructions for every elementary arithmetic primitive.
        </p>

        {/* Domain toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["positive", "general"] as const).map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              style={{
                fontFamily: C.mono, fontSize: 11, padding: "6px 14px",
                border: `1px solid ${domain === d ? C.accent : C.border}`,
                borderRadius: 4, background: domain === d ? "rgba(79,172,254,0.08)" : C.surface,
                color: domain === d ? C.accent : C.muted, cursor: "pointer",
              }}
            >
              {d === "positive" ? "Positive domain (x > 0)" : "General domain (all ℝ)"}
            </button>
          ))}
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: C.accent, marginRight: 12 }}>
            {headline}
          </span>
          <span style={{ fontSize: 13, color: C.muted }}>
            vs naive {totals.savings_positive.naive_total}n baseline
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Operation", `Nodes (${domain === "positive" ? "x>0" : "all ℝ"})`, "Naive", "Construction", "Notes"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "8px 12px",
                    borderBottom: `1px solid ${C.border}`, color: C.muted,
                    fontWeight: 400, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ops.map((row) => {
                const cost = domain === "positive" ? row.cost_positive : row.cost_general;
                const constr = domain === "positive" ? row.construction_positive : row.construction_general;
                const isNum = typeof cost === "number";
                return (
                  <tr key={row.op}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                      <code style={{ color: C.text, fontSize: 13 }}>{row.op}</code>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: isNum ? C.accent : C.muted, fontSize: 15 }}>
                      {isNum ? cost : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                      {(row as any).v4_cost ?? "—"}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                      <code style={{ fontSize: 11, color: C.accent }}>{String(constr)}</code>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.muted, maxWidth: 200 }}>
                      {row.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 48, padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: C.text, marginBottom: 12 }}>Key results</h2>
          <ul style={{ paddingLeft: 20, color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
            <li><strong style={{ color: C.text }}>add(x,y) = 2n for ALL reals</strong> — ADD-T1: LEdiv(x, DEML(y,1)) = x+y</li>
            <li><strong style={{ color: C.text }}>pow(x,n) = 1n for x&gt;0</strong> — EPL/ELMl: exp(n·ln(x)) = xⁿ is a direct F16 primitive</li>
            <li><strong style={{ color: C.text }}>mul general = 6n</strong> — neg(mul(neg(x), y)) wraps signed x</li>
            <li>All 10 operations: positive domain ≤ 2 nodes each</li>
          </ul>
          <p style={{ marginTop: 16, fontSize: 12, color: C.muted }}>
            Research: <a href="https://monogate.org/superbest" style={{ color: C.accent }}>monogate.org/superbest ↗</a> ·
            Explorer: <a href="/explorer" style={{ color: C.accent }}>monogate.dev/explorer</a>
          </p>
        </div>

      </div>
    </div>
  );
}
