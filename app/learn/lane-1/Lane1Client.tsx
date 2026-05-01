"use client";

import { useEffect, useMemo, useState } from "react";
import type { PetalRecord } from "../petal-types";
import { ghLink } from "../petal-types";
import {
  LANE_TACTICS,
  checkTactic,
  getProfileChips,
  getProgressiveHints,
  makeForgeExport,
  makeStarterTemplate,
  parseLeanTheorem,
} from "../learn-helpers";

const ACCENT = "#06B6D4";
const ACCENT_DIM = "#06B6D440";
const ACCENT_GREEN = "#10b981";
const TEXT = "#e5e5e5";
const TEXT_DIM = "#aaa";
const TEXT_DIMMER = "#888";
const BG_PANEL = "#0d0d10";
const BG_DEEPER = "#08080a";
const BORDER = "#1a1a1d";

type RenderedRecord = PetalRecord & { statementHtml: string };

interface LaneClientProps {
  records: RenderedRecord[];
  lane?: number;
  laneTitle?: string;
  completionMessage?: string;
}

export default function Lane1Client({
  records,
  lane = 1,
  laneTitle,
  completionMessage,
}: LaneClientProps) {
  const STORAGE_KEY = `monogate.learn.lane${lane}.completed`;
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  // Hydrate from localStorage once on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setCompleted(new Set(arr));
      }
    } catch {
      // localStorage may be unavailable; carry on with empty state.
    }
    setHydrated(true);
  }, []);

  function persist(next: Set<string>) {
    setCompleted(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  }

  function toggleComplete(id: string) {
    const next = new Set(completed);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      setRecentlyCompleted(id);
      window.setTimeout(() => {
        setRecentlyCompleted((cur) => (cur === id ? null : cur));
      }, 1400);
    }
    persist(next);
  }

  function reset() {
    persist(new Set());
  }

  const total = records.length;
  // After hydration, use real count; before hydration, render 0/4 as a deterministic SSR-safe baseline.
  const doneCount = hydrated ? completed.size : 0;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const allDone = hydrated && doneCount === total && total > 0;

  return (
    <>
      <ProgressBar
        lane={lane}
        doneCount={doneCount}
        total={total}
        pct={pct}
        hydrated={hydrated}
        onReset={reset}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {records.map((rec, idx) => (
          <RecordCard
            key={rec.theorem_id}
            record={rec}
            index={idx}
            total={total}
            isDone={completed.has(rec.theorem_id)}
            justCompleted={recentlyCompleted === rec.theorem_id}
            onToggle={() => toggleComplete(rec.theorem_id)}
          />
        ))}
      </div>

      {allDone && (
        <CompletionPanel
          lane={lane}
          laneTitle={laneTitle}
          message={completionMessage}
          onReset={reset}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

function ProgressBar({
  lane,
  doneCount,
  total,
  pct,
  hydrated,
  onReset,
}: {
  lane: number;
  doneCount: number;
  total: number;
  pct: number;
  hydrated: boolean;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(8, 8, 10, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 700,
          color: ACCENT,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          minWidth: 180,
        }}
      >
        Lane {lane}: {doneCount}/{total} complete
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 180,
          height: 8,
          background: "#15151a",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background:
              doneCount === total && total > 0
                ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT_GREEN})`
                : ACCENT,
            transition: "width 320ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      {hydrated && doneCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          style={{
            background: "transparent",
            border: `1px solid #2a2a30`,
            color: TEXT_DIMMER,
            fontFamily: "monospace",
            fontSize: 11,
            padding: "5px 10px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          reset
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function RecordCard({
  record,
  index,
  total,
  isDone,
  justCompleted,
  onToggle,
}: {
  record: RenderedRecord;
  index: number;
  total: number;
  isDone: boolean;
  justCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      style={{
        position: "relative",
        padding: "clamp(20px, 4vw, 32px)",
        borderRadius: 12,
        border: `1px solid ${isDone ? `${ACCENT_GREEN}55` : ACCENT_DIM}`,
        background: BG_PANEL,
        transition: "border-color 320ms ease",
      }}
    >
      {justCompleted && <CelebrationOverlay />}

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: TEXT_DIMMER,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontFamily: "monospace",
          }}
        >
          Theorem {index + 1} of {total} · difficulty {record.difficulty} · {record.domain}
        </div>
        {isDone && (
          <div
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: ACCENT_GREEN,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            ✓ complete
          </div>
        )}
      </div>

      <h2
        style={{
          fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 12,
          marginTop: 4,
          fontFamily: "monospace",
          wordBreak: "break-word",
        }}
      >
        {record.theorem_id}
      </h2>

      <ProveBanner record={record} />

      <SideBySidePanel record={record} />

      <StarterCodeBlock record={record} />

      <ProofAssistant record={record} />

      <AllowedTacticsPanel lane={record.lane} />

      <details>
        <summary
          style={{
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            color: ACCENT,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            padding: "8px 0",
            userSelect: "none",
          }}
        >
          ▸ Proof walkthrough ({record.proof.lean4_step_by_step.length} step
          {record.proof.lean4_step_by_step.length === 1 ? "" : "s"})
        </summary>
        <div style={{ paddingTop: 16 }}>
          <CodeBlock>{record.proof.lean4_full}</CodeBlock>
          <div style={{ height: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {record.proof.lean4_step_by_step.map((step) => (
              <div
                key={step.step}
                style={{
                  padding: "14px 16px",
                  borderLeft: `2px solid ${ACCENT}`,
                  background: BG_DEEPER,
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: ACCENT,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                    fontFamily: "monospace",
                  }}
                >
                  Step {step.step}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#fff",
                    background: "#101015",
                    padding: "8px 12px",
                    borderRadius: 4,
                    marginBottom: 10,
                    overflowX: "auto",
                  }}
                >
                  {step.tactic}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: TEXT,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.explanation}
                </p>
                {step.tactic_rationale && (
                  <p
                    style={{
                      fontSize: 13,
                      color: TEXT_DIM,
                      lineHeight: 1.6,
                      marginTop: 8,
                      marginBottom: 0,
                      fontStyle: "italic",
                    }}
                  >
                    Why this tactic: {step.tactic_rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </details>

      {record.proof.lean4_step_by_step.some((s) => s.common_mistakes.length > 0) && (
        <details style={{ marginTop: 8 }}>
          <summary
            style={{
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              color: "#d97777",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              padding: "8px 0",
              userSelect: "none",
            }}
          >
            ▸ Common mistakes
          </summary>
          <ul
            style={{
              marginTop: 10,
              paddingLeft: 22,
              fontSize: 14,
              color: TEXT_DIM,
              lineHeight: 1.65,
            }}
          >
            {record.proof.lean4_step_by_step.flatMap((step) =>
              step.common_mistakes.map((m, i) => (
                <li key={`${step.step}-${i}`} style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      color: TEXT_DIMMER,
                      fontFamily: "monospace",
                      fontSize: 11,
                      marginRight: 6,
                    }}
                  >
                    [step {step.step}]
                  </span>
                  {m}
                </li>
              )),
            )}
          </ul>
        </details>
      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: 24,
          paddingTop: 18,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          style={{
            background: isDone ? `${ACCENT_GREEN}18` : ACCENT,
            border: `1px solid ${isDone ? ACCENT_GREEN : ACCENT}`,
            color: isDone ? ACCENT_GREEN : "#03171a",
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            padding: "9px 18px",
            borderRadius: 6,
            cursor: "pointer",
            letterSpacing: 0.5,
            transition: "all 180ms ease",
          }}
        >
          {isDone ? "✓ Completed (click to undo)" : "Mark complete"}
        </button>
        <ExportButton kind="lean" record={record} />
        <ExportButton kind="forge" record={record} />
        <a
          href={ghLink(record.source.file, record.source.line)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "8px 14px",
            border: `1px solid #2a2a30`,
            borderRadius: 5,
            color: TEXT_DIM,
            textDecoration: "none",
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          source ↗
        </a>
        {record.dependencies.length > 0 && (
          <span
            style={{
              fontSize: 11,
              color: TEXT_DIMMER,
              fontFamily: "monospace",
              marginLeft: "auto",
            }}
          >
            depends on: {record.dependencies.join(", ")}
          </span>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// New formal-layer components (B-001 + B-002 + B-004)

function ProveBanner({ record }: { record: PetalRecord }) {
  const chips = getProfileChips(record);
  return (
    <div
      style={{
        marginBottom: 16,
        padding: "14px 16px",
        background: `${ACCENT}0c`,
        border: `1px solid ${ACCENT}33`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          color: ACCENT,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Prove
      </div>
      <p
        style={{
          fontSize: 15,
          color: TEXT,
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {record.statement.natural_language}
      </p>
      {chips.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {chips.map((c) => (
            <span
              key={c.label}
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                padding: "3px 8px",
                background: BG_DEEPER,
                border: `1px solid ${BORDER}`,
                borderRadius: 4,
                color: TEXT_DIM,
              }}
            >
              <span style={{ color: TEXT_DIMMER }}>{c.label}:</span> {c.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SideBySidePanel({
  record,
}: {
  record: PetalRecord & { statementHtml: string };
}) {
  const sig = parseLeanTheorem(record.statement.lean4);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          background: BG_DEEPER,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          minWidth: 0,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            color: TEXT_DIMMER,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Informal
        </div>
        <div
          className="learn-katex"
          dangerouslySetInnerHTML={{ __html: record.statementHtml }}
        />
      </div>
      <div
        style={{
          padding: "16px 18px",
          background: BG_DEEPER,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          minWidth: 0,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            color: TEXT_DIMMER,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Formal — Lean 4
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 12.5,
            color: "#fff",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {sig.params && (
            <>
              <span style={{ color: ACCENT }}>theorem</span>{" "}
              <span style={{ color: "#e2c275" }}>{sig.name}</span>
              {"\n"}
              <span style={{ color: TEXT_DIM }}>  {sig.params}</span>
              {"\n  "}
              <span style={{ color: ACCENT }}>:</span> {sig.conclusion}
            </>
          )}
          {!sig.params && (
            <>
              <span style={{ color: ACCENT }}>theorem</span>{" "}
              <span style={{ color: "#e2c275" }}>{sig.name}</span>{" "}
              <span style={{ color: ACCENT }}>:</span> {sig.conclusion}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StarterCodeBlock({ record }: { record: PetalRecord }) {
  const starter = useMemo(
    () => makeStarterTemplate(record.statement.lean4),
    [record.statement.lean4],
  );
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: 700,
          color: TEXT_DIMMER,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Starter
      </div>
      <pre
        style={{
          fontFamily: "monospace",
          fontSize: 12.5,
          color: "#fff",
          background: BG_DEEPER,
          border: `1px dashed ${ACCENT_DIM}`,
          padding: "14px 18px",
          borderRadius: 6,
          overflowX: "auto",
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        <code>{starter}</code>
      </pre>
    </div>
  );
}

function AllowedTacticsPanel({ lane }: { lane: number }) {
  const tactics = LANE_TACTICS[lane] ?? [];
  if (tactics.length === 0) return null;
  return (
    <div style={{ marginTop: 18, marginBottom: 6 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: 700,
          color: TEXT_DIMMER,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Lane {lane} tactics
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tactics.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              padding: "4px 10px",
              background: BG_DEEPER,
              border: `1px solid ${BORDER}`,
              borderRadius: 4,
              color: ACCENT,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExportButton({
  kind,
  record,
}: {
  kind: "lean" | "forge";
  record: PetalRecord;
}) {
  const [hovered, setHovered] = useState(false);
  function buildHref(): string {
    if (kind === "lean") {
      const body = makeStarterTemplate(record.statement.lean4);
      const blob = new Blob([body + "\n"], { type: "text/plain" });
      return URL.createObjectURL(blob);
    }
    const body = makeForgeExport(record);
    const blob = new Blob([body], { type: "text/plain" });
    return URL.createObjectURL(blob);
  }
  // Render as an <a> with download attribute. The href is constructed
  // lazily on click so we don't leak object URLs when nobody downloads.
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const href = buildHref();
    const a = document.createElement("a");
    a.href = href;
    a.download = kind === "lean"
      ? `${record.theorem_id}.lean`
      : `${record.theorem_id}.eml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 0);
  }
  const label = kind === "lean" ? "Export to Lean" : "Export to Forge";
  return (
    <a
      href="#"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 14px",
        border: `1px solid ${hovered ? ACCENT : "#2a2a30"}`,
        borderRadius: 5,
        color: hovered ? ACCENT : TEXT_DIM,
        textDecoration: "none",
        fontSize: 12,
        fontFamily: "monospace",
        cursor: "pointer",
        transition: "all 150ms ease",
      }}
    >
      {label} ↓
    </a>
  );
}

// ProofAssistant placeholder — full implementation in B-005 round.
function ProofAssistant({ record }: { record: PetalRecord }) {
  return <ProofAssistantBody record={record} />;
}

// ---------------------------------------------------------------------------

function CelebrationOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: 12,
        boxShadow: `inset 0 0 0 2px ${ACCENT_GREEN}, 0 0 32px ${ACCENT_GREEN}40`,
        animation: "lane1Glow 1.2s ease-out forwards",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 64,
          color: ACCENT_GREEN,
          animation: "lane1Check 900ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        ✓
      </div>
    </div>
  );
}

function CompletionPanel({
  lane,
  laneTitle,
  message,
  onReset,
}: {
  lane: number;
  laneTitle?: string;
  message?: string;
  onReset: () => void;
}) {
  // When laneTitle is provided, use it; otherwise fall back to "Lane N".
  const heading = laneTitle ? `${laneTitle} complete.` : `Lane ${lane} complete.`;
  return (
    <section
      style={{
        marginTop: 36,
        padding: "clamp(28px, 5vw, 48px)",
        borderRadius: 14,
        border: `1px solid ${ACCENT_GREEN}66`,
        background: `linear-gradient(135deg, ${ACCENT}10, ${ACCENT_GREEN}18)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: ACCENT_GREEN,
          marginBottom: 8,
        }}
      >
        🏆
      </div>
      <h2
        style={{
          fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
          color: "#fff",
          fontWeight: 700,
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        {heading}
      </h2>
      <p
        style={{
          fontSize: "1.05rem",
          color: TEXT,
          marginTop: 0,
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        {message ?? "You understand EML fundamentals — depth, expTree, rfl, and the complex-exp identity."}
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href="https://capcard.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            background: ACCENT_GREEN,
            color: "#04150e",
            border: "none",
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          Earn a CapCard → capcard.ai
          <span
            style={{
              fontSize: 9,
              padding: "2px 6px",
              borderRadius: 4,
              background: "#04150e",
              color: ACCENT_GREEN,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            soon
          </span>
        </a>
        <a
          href="/learn/lean"
          style={{
            padding: "12px 22px",
            background: "transparent",
            color: TEXT,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: "monospace",
            fontSize: 14,
          }}
        >
          ← Lanes overview
        </a>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: "12px 22px",
            background: "transparent",
            color: TEXT_DIMMER,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 14,
          }}
        >
          Start over
        </button>
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        color: "#fff",
        background: BG_DEEPER,
        border: `1px solid ${BORDER}`,
        padding: "16px 20px",
        borderRadius: 6,
        overflowX: "auto",
        lineHeight: 1.55,
        margin: 0,
      }}
    >
      <code>{children}</code>
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Mini proof assistant (B-003 + B-005)
//
// Per-step PETAL-driven tactic validator. The user types a tactic;
// the component compares it against the expected next step's canonical
// tactic. On match, the goal advances; on miss, common-mistake guidance
// shows. The "Lean API" path is intentionally not wired -- this is the
// pre-Blackwell offline checker that the roadmap calls out.

const ACCENT_RED = "#d97777";
const ACCENT_AMBER = "#e2a14a";

function ProofAssistantBody({ record }: { record: PetalRecord }) {
  const steps = record.proof.lean4_step_by_step;
  const totalSteps = steps.length;
  const sig = useMemo(
    () => parseLeanTheorem(record.statement.lean4),
    [record.statement.lean4],
  );
  const hints = useMemo(() => getProgressiveHints(record), [record]);

  // Per-step state. completed[i] = true once step i has been
  // matched. attempts[i] = number of failed tries on step i (drives
  // hint reveal). lastFeedback carries the most recent miss to render.
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<
    | { kind: "match"; step: number; explanation: string; rationale: string }
    | { kind: "miss"; step: number; expected: string; mistakes: string[] }
    | { kind: "complete" }
    | null
  >(null);
  const [hintLevel, setHintLevel] = useState(0);

  const goalLine = useMemo(() => {
    if (stepIndex === 0) {
      return sig.conclusion || record.statement.natural_language;
    }
    // After step N, show the explanation of step N (the resulting
    // goal description from PETAL). Steps without an explanation
    // fall back to a generic "intermediate goal" label.
    const prev = steps[stepIndex - 1];
    return prev?.explanation
      ? `(after ${prev.tactic}) ${prev.explanation}`
      : "intermediate goal";
  }, [stepIndex, sig.conclusion, record.statement.natural_language, steps]);

  const allDone = stepIndex >= totalSteps;

  function submit() {
    if (allDone) return;
    const tac = input.trim();
    if (!tac) return;
    const m = checkTactic(record, tac, stepIndex);
    if (!m) {
      setFeedback({
        kind: "miss",
        step: stepIndex,
        expected: "?",
        mistakes: ["No more steps to check."],
      });
      return;
    }
    if (m.matched) {
      const newCompleted = [...completed, tac];
      const nextIdx = stepIndex + 1;
      setCompleted(newCompleted);
      setStepIndex(nextIdx);
      setInput("");
      setAttempts(0);
      setHintLevel(0);
      if (nextIdx >= totalSteps) {
        setFeedback({ kind: "complete" });
      } else {
        setFeedback({
          kind: "match",
          step: m.stepIndex,
          explanation: m.explanation,
          rationale: m.rationale,
        });
      }
    } else {
      setAttempts((a) => a + 1);
      setFeedback({
        kind: "miss",
        step: stepIndex,
        expected: m.expected,
        mistakes: m.commonMistakes,
      });
    }
  }

  function reveal() {
    setHintLevel((l) => Math.min(l + 1, hints.length));
  }

  function reset() {
    setStepIndex(0);
    setCompleted([]);
    setInput("");
    setAttempts(0);
    setFeedback(null);
    setHintLevel(0);
  }

  function fillTactic(t: string) {
    setInput(t);
  }

  return (
    <div
      style={{
        marginBottom: 20,
        padding: "18px 20px",
        background: BG_DEEPER,
        border: `1px solid ${ACCENT}26`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          Mini proof assistant
        </div>
        <div
          style={{
            fontSize: 11,
            color: TEXT_DIMMER,
            fontFamily: "monospace",
          }}
        >
          step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
          {allDone && " · complete"}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={reveal}
            disabled={hintLevel >= hints.length}
            style={{
              background: "transparent",
              border: `1px solid ${ACCENT_AMBER}55`,
              color: hintLevel >= hints.length ? TEXT_DIMMER : ACCENT_AMBER,
              fontFamily: "monospace",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 4,
              cursor: hintLevel >= hints.length ? "default" : "pointer",
            }}
          >
            Hint ({hintLevel}/{hints.length})
          </button>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "transparent",
              border: `1px solid #2a2a30`,
              color: TEXT_DIMMER,
              fontFamily: "monospace",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Goal state */}
      <div
        style={{
          padding: "10px 14px",
          background: "#0a0a0d",
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          marginBottom: 14,
          fontFamily: "monospace",
          fontSize: 12.5,
          color: "#fff",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: TEXT_DIMMER,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Goal
        </div>
        {allDone ? (
          <span style={{ color: ACCENT_GREEN }}>(no goals — proof complete)</span>
        ) : (
          <>
            {sig.params && (
              <span style={{ color: TEXT_DIM }}>{sig.params}{"\n"}</span>
            )}
            <span style={{ color: ACCENT }}>⊢</span> {goalLine}
          </>
        )}
      </div>

      {/* Completed steps */}
      {completed.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {completed.map((tac, i) => (
            <div
              key={i}
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: ACCENT_GREEN,
                padding: "4px 10px",
                background: `${ACCENT_GREEN}0a`,
                borderLeft: `2px solid ${ACCENT_GREEN}`,
                marginBottom: 4,
              }}
            >
              <span style={{ color: TEXT_DIMMER, marginRight: 8 }}>
                {i + 1}.
              </span>
              {tac} <span style={{ color: TEXT_DIMMER }}>✓</span>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {!allDone && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Type a tactic and press Enter…"
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 200,
              fontFamily: "monospace",
              fontSize: 13,
              background: "#101015",
              border: `1px solid ${BORDER}`,
              borderRadius: 4,
              color: "#fff",
              padding: "8px 12px",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={submit}
            style={{
              background: ACCENT,
              border: `1px solid ${ACCENT}`,
              color: "#03171a",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            Check
          </button>
        </div>
      )}

      {/* Quick-fill tactic chips for the lane */}
      {!allDone && (
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
          }}
        >
          {(LANE_TACTICS[record.lane] ?? []).slice(0, 6).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => fillTactic(t)}
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                padding: "2px 8px",
                background: "transparent",
                border: `1px solid ${BORDER}`,
                borderRadius: 4,
                color: TEXT_DIM,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {feedback?.kind === "match" && (
        <FeedbackBox tone="ok">
          <strong>OK</strong> — {feedback.explanation}
          {feedback.rationale && (
            <div
              style={{
                fontStyle: "italic",
                marginTop: 6,
                color: TEXT_DIM,
              }}
            >
              {feedback.rationale}
            </div>
          )}
        </FeedbackBox>
      )}
      {feedback?.kind === "miss" && (
        <FeedbackBox tone="miss">
          <strong>Not the expected step</strong>.
          {attempts >= 2 && (
            <span style={{ marginLeft: 8 }}>
              Expected:{" "}
              <code style={{ color: "#fff", background: "#0a0a0d", padding: "1px 6px", borderRadius: 3 }}>
                {feedback.expected}
              </code>
            </span>
          )}
          {feedback.mistakes.length > 0 && (
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
              {feedback.mistakes.map((m, i) => (
                <li key={i} style={{ color: TEXT_DIM, marginBottom: 4 }}>
                  {m}
                </li>
              ))}
            </ul>
          )}
        </FeedbackBox>
      )}
      {feedback?.kind === "complete" && (
        <FeedbackBox tone="complete">
          <strong>Proof complete!</strong> Closed in {totalSteps} step
          {totalSteps === 1 ? "" : "s"}.
        </FeedbackBox>
      )}

      {/* Progressive hint reveal */}
      {hintLevel > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: `${ACCENT_AMBER}0c`,
            border: `1px solid ${ACCENT_AMBER}33`,
            borderRadius: 6,
            fontSize: 13,
            color: TEXT,
            lineHeight: 1.55,
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: 700,
              color: ACCENT_AMBER,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Hint level {hintLevel}
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontFamily: hintLevel >= 4 ? "monospace" : undefined }}>
            {hints[hintLevel - 1]?.body}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackBox({
  tone,
  children,
}: {
  tone: "ok" | "miss" | "complete";
  children: React.ReactNode;
}) {
  const color =
    tone === "ok"
      ? ACCENT_GREEN
      : tone === "miss"
        ? ACCENT_RED
        : ACCENT_GREEN;
  return (
    <div
      style={{
        padding: "10px 14px",
        background: `${color}0c`,
        border: `1px solid ${color}40`,
        borderRadius: 6,
        fontSize: 13,
        color: TEXT,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}
