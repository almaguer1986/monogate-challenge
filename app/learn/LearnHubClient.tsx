"use client";

import { useEffect, useState } from "react";

const ACCENT_GOLD = "#E8A020";    // EML / Forge family
const ACCENT_PURPLE = "#A78BFA";  // Lean / PETAL family
const ACCENT_CYAN = "#06B6D4";
const TEXT = "#d4d4d4";
const MUTED = "#6a6e85";

// Six lessons in the EML 30-min course. Order + titles must mirror
// /learn/eml/page.tsx so the lesson list on the card matches what the
// reader sees when they click through. Time estimates here are
// intentionally redundant with the badge but help set expectations
// inline.
const EML_LESSONS: { n: number; title: string; minutes: number }[] = [
  { n: 1, title: "Your First Equation", minutes: 5 },
  { n: 2, title: "Constants and Real Math", minutes: 5 },
  { n: 3, title: "PID Controller", minutes: 5 },
  { n: 4, title: "Formal Verification", minutes: 5 },
  { n: 5, title: "Hardware Target", minutes: 5 },
  { n: 6, title: "Your Own Project", minutes: 5 },
];

// Six lanes in the PETAL Lean curriculum. Lane titles mirror
// LANE_DESCRIPTIONS in petal-types.ts; the long-form descriptions
// match LANE_LONG_DESCRIPTION in LaneIndexClient. Keeping them
// summarised here so the hub card reads as a teaser, not a duplicate
// of /learn/lean.
const LEAN_LANES: { n: number; title: string; teaser: string }[] = [
  { n: 1, title: "Foundations", teaser: "rfl, depth, the smallest proofs" },
  { n: 2, title: "Lower Bounds", teaser: "simp + rewrites + hypotheses" },
  { n: 3, title: "Advanced Properties", teaser: "witness extraction, F-family" },
  { n: 4, title: "Expert Proofs", teaser: "SuperBEST multi-operator bounds" },
  { n: 5, title: "Open Problems", teaser: "universality, conjugacies, Mathlib" },
  { n: 6, title: "Cross-Domain", teaser: "the InfiniteZerosBarrier frontier" },
];

const EML_STORAGE_KEY = "monogate.learn.eml.completed";

type CardProps = {
  accent: string;
  title: string;
  subtitle: string;
  badge: string;
  href: string;
  buttonLabel: string;
  progressDone: number;
  progressTotal: number;
  hydrated: boolean;
  children: React.ReactNode;
};

function Card({
  accent,
  title,
  subtitle,
  badge,
  href,
  buttonLabel,
  progressDone,
  progressTotal,
  hydrated,
  children,
}: CardProps) {
  const [hover, setHover] = useState(false);
  const pct = progressTotal > 0
    ? Math.round((progressDone / progressTotal) * 100)
    : 0;

  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "1 1 360px",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        padding: "clamp(20px, 3.5vw, 28px)",
        borderRadius: 12,
        background: hover ? `${accent}10` : `${accent}05`,
        border: `1px solid ${hover ? `${accent}50` : `${accent}25`}`,
        boxShadow: hover ? `0 0 32px -12px ${accent}60` : "none",
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.18s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontFamily: "monospace",
          marginBottom: 12,
        }}
      >
        {badge}
      </div>
      <h2
        style={{
          fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 8,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#aaa",
          lineHeight: 1.55,
          marginBottom: 20,
        }}
      >
        {subtitle}
      </p>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {children}
      </div>

      {/* Progress bar — only render content post-hydration so SSR HTML
          matches the initial client render (avoids React hydration
          mismatch warnings when localStorage has prior progress). */}
      <div
        style={{
          height: 4,
          background: `${accent}15`,
          borderRadius: 2,
          marginBottom: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: hydrated ? `${pct}%` : "0%",
            height: "100%",
            background: accent,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: MUTED,
          fontFamily: "monospace",
          marginBottom: 16,
        }}
      >
        {hydrated
          ? `${progressDone} / ${progressTotal} done · ${pct}%`
          : `0 / ${progressTotal} done`}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: accent,
          fontFamily: "monospace",
          letterSpacing: 0.4,
        }}
      >
        {buttonLabel}
      </div>
    </a>
  );
}

export default function LearnHubClient({
  laneRecordCount,
  totalLeanExercises,
}: {
  laneRecordCount: Record<number, number>;
  totalLeanExercises: number;
}) {
  const [emlDone, setEmlDone] = useState(0);
  const [leanDone, setLeanDone] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // EML lesson completion: a single localStorage key holding an
    // array of completed lesson numbers (1..6).
    try {
      const raw = window.localStorage.getItem(EML_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const valid = arr.filter(
            (n) => typeof n === "number" && n >= 1 && n <= EML_LESSONS.length,
          );
          setEmlDone(new Set(valid).size);
        }
      }
    } catch {
      // localStorage unavailable -- progress stays at 0.
    }

    // Lean exercise completion: sum array lengths across the per-lane
    // localStorage keys that LaneIndexClient + per-lane pages write.
    try {
      let total = 0;
      for (let lane = 1; lane <= 6; lane++) {
        const raw = window.localStorage.getItem(
          `monogate.learn.lane${lane}.completed`,
        );
        if (!raw) continue;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          // Cap each lane's contribution at its actual record count so
          // a corrupt / oversized array can't push the bar above 100%.
          const cap = laneRecordCount[lane] ?? 0;
          total += Math.min(arr.length, cap);
        }
      }
      setLeanDone(total);
    } catch {
      // localStorage unavailable.
    }

    setHydrated(true);
  }, [laneRecordCount]);

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px) 120px",
      }}
    >
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: ACCENT_CYAN,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
            fontFamily: "monospace",
          }}
        >
          monogate.dev / learn
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
          Two tracks. Pick one.
        </h1>
        <p
          style={{
            fontSize: "clamp(0.95rem, 2.4vw, 1.05rem)",
            color: "#aaa",
            lineHeight: 1.6,
            maxWidth: 640,
          }}
        >
          Write math in EML and compile to 21 targets including FPGA hardware,
          or prove your math is correct in Lean&nbsp;4 with the PETAL
          curriculum. Progress saves locally — pick up where you left off.
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        <Card
          accent={ACCENT_GOLD}
          title="EML-lang in 30 Minutes"
          subtitle="Write math. Compile to 21 targets. No prerequisites beyond algebra."
          badge="6 lessons · 30 minutes · beginner"
          href="/learn/eml"
          buttonLabel="Start Learning →"
          progressDone={emlDone}
          progressTotal={EML_LESSONS.length}
          hydrated={hydrated}
        >
          {EML_LESSONS.map((l) => (
            <div
              key={l.n}
              style={{
                fontSize: 13,
                color: TEXT,
                fontFamily: "monospace",
                display: "flex",
                gap: 10,
                alignItems: "baseline",
              }}
            >
              <span style={{ color: MUTED, minWidth: 24 }}>{l.n}.</span>
              <span style={{ flex: 1 }}>{l.title}</span>
              <span style={{ color: MUTED, fontSize: 11 }}>
                {l.minutes} min
              </span>
            </div>
          ))}
        </Card>

        <Card
          accent={ACCENT_PURPLE}
          title="Lean 4 for EML"
          subtitle="Prove your math is correct. 6 lanes from beginner to expert."
          badge={`6 lanes · ${totalLeanExercises} exercises · progressive`}
          href="/learn/lean"
          buttonLabel="Start Proving →"
          progressDone={leanDone}
          progressTotal={totalLeanExercises}
          hydrated={hydrated}
        >
          {LEAN_LANES.map((l) => {
            const count = laneRecordCount[l.n] ?? 0;
            return (
              <div
                key={l.n}
                style={{
                  fontSize: 13,
                  color: TEXT,
                  fontFamily: "monospace",
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: MUTED, minWidth: 56 }}>
                  Lane {l.n}:
                </span>
                <span style={{ flex: 1 }}>{l.title}</span>
                <span style={{ color: MUTED, fontSize: 11 }}>
                  {count > 0 ? `${count} record${count === 1 ? "" : "s"}` : "—"}
                </span>
              </div>
            );
          })}
        </Card>
      </div>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid #1a1a1d",
          fontSize: 12,
          color: MUTED,
          lineHeight: 1.7,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          Tracks share nothing — start with EML if you want to ship code,
          start with Lean if you want to prove it. Or do both. ·{" "}
          <a
            href="https://github.com/agent-maestro"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: ACCENT_CYAN, textDecoration: "none" }}
          >
            Source ↗
          </a>
        </p>
      </footer>
    </main>
  );
}
