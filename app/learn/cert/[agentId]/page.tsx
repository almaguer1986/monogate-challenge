"use client";

import { useEffect, useState, use } from "react";

const ACCENT_PURPLE = "#A78BFA";
const ACCENT_CYAN = "#06B6D4";
const ACCENT_GOLD = "#E8A020";

const TIER_COLORS: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#c8a832",
  platinum: "#e5e4e2",
};

const TIER_BADGES: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "🏆",
};

type LaneStatus = {
  lane: number;
  name: string;
  lane_size: number;
  min_solved: number;
  problems_solved: number;
  problems_partial: number;
  problems_attempted: number;
  complete: boolean;
  unlocked: boolean;
  skills_earned: string[];
};

type Certification = {
  agent_id: string;
  certification: {
    tier: string | null;
    tier_name: string | null;
    badge_color: string | null;
    lanes_completed: number[];
    lanes_remaining: number[];
    problems_solved: number;
    problems_partial: number;
    problems_attempted: number;
    total_proof_attempts: number;
    average_attempts_per_proof: number | null;
  };
  skills: string[];
  privileges: string[];
  honest_note: string;
};

const PETAL_API =
  process.env.NEXT_PUBLIC_PETAL_API_URL ?? "http://localhost:8000";

export default function AgentCertPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const [cert, setCert] = useState<Certification | null>(null);
  const [lanes, setLanes] = useState<LaneStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${PETAL_API}/api/petal/certification/${encodeURIComponent(agentId)}`),
      fetch(`${PETAL_API}/api/petal/lane-status/${encodeURIComponent(agentId)}`),
    ])
      .then(async ([cr, lr]) => {
        if (!cr.ok) throw new Error(`certification HTTP ${cr.status}`);
        if (!lr.ok) throw new Error(`lane-status HTTP ${lr.status}`);
        const c = (await cr.json()) as Certification;
        const l = (await lr.json()) as { lanes: LaneStatus[] };
        if (!cancelled) {
          setCert(c);
          setLanes(l.lanes);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px 120px" }}>
      <header style={{ marginBottom: 32 }}>
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
          PETAL · CapCard
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 8,
            lineHeight: 1.2,
            fontFamily: "monospace",
          }}
        >
          {agentId}
        </h1>
        <p style={{ fontSize: 14, color: "#888" }}>
          <a href="/learn" style={{ color: ACCENT_CYAN }}>
            ← /learn
          </a>{" "}
          ·{" "}
          <a href="/learn/leaderboard" style={{ color: ACCENT_CYAN }}>
            leaderboard ↗
          </a>
        </p>
      </header>

      {error && <ApiOffline error={error} />}
      {!error && cert === null && (
        <div style={{ color: "#666", fontFamily: "monospace", fontSize: 12 }}>
          Loading CapCard…
        </div>
      )}

      {cert && (
        <>
          <TierBanner cert={cert} />
          {lanes && <LaneGrid lanes={lanes} />}
          <SkillsAndPrivileges cert={cert} />
          <HonestNote cert={cert} />
          <RawJson cert={cert} />
        </>
      )}
    </main>
  );
}

function TierBanner({ cert }: { cert: Certification }) {
  const tier = cert.certification.tier;
  const color = (tier && TIER_COLORS[tier]) ?? "#444";
  const badge = (tier && TIER_BADGES[tier]) ?? "○";
  const c = cert.certification;

  return (
    <section
      style={{
        border: `1px solid ${color}40`,
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        borderRadius: 12,
        padding: "32px 28px",
        marginBottom: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 36 }}>{badge}</span>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontFamily: "monospace",
              marginBottom: 4,
            }}
          >
            {tier ?? "Unranked"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>
            {c.tier_name ?? "No certification tier earned yet"}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <Stat label="Solved" value={c.problems_solved} />
        <Stat label="Partial" value={c.problems_partial} />
        <Stat label="Attempted" value={c.problems_attempted} />
        <Stat label="Total tries" value={c.total_proof_attempts} />
        <Stat
          label="Avg / proof"
          value={c.average_attempts_per_proof?.toFixed(1) ?? "—"}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontFamily: "monospace",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LaneGrid({ lanes }: { lanes: LaneStatus[] }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#fff",
          marginBottom: 16,
        }}
      >
        Lane progress
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lanes.map((l) => (
          <LaneRow key={l.lane} lane={l} />
        ))}
      </div>
    </section>
  );
}

function LaneRow({ lane }: { lane: LaneStatus }) {
  const pct = lane.lane_size > 0
    ? Math.round((lane.problems_solved / lane.lane_size) * 100) : 0;
  const ringColor = lane.complete
    ? "#5fb57a"
    : lane.unlocked
    ? ACCENT_PURPLE
    : "#333";
  return (
    <div
      style={{
        border: `1px solid ${ringColor}40`,
        background: `${ringColor}05`,
        borderRadius: 8,
        padding: "12px 16px",
        opacity: lane.unlocked ? 1 : 0.55,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "#888",
              fontWeight: 700,
            }}
          >
            LANE {lane.lane}
          </span>
          <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>
            {lane.name}
          </span>
          {lane.complete && (
            <span style={{ fontSize: 11, color: "#5fb57a", fontFamily: "monospace" }}>
              ✓ COMPLETE
            </span>
          )}
          {!lane.unlocked && (
            <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>
              🔒 LOCKED
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#888",
            fontFamily: "monospace",
          }}
        >
          {lane.problems_solved}/{lane.lane_size} solved
          {lane.problems_partial > 0 && ` (${lane.problems_partial} partial)`}
        </div>
      </div>
      <div
        style={{
          height: 4,
          background: "#1a1a1a",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: ringColor,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function SkillsAndPrivileges({ cert }: { cert: Certification }) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <Panel title="Skills earned" items={cert.skills} accent={ACCENT_CYAN} />
      <Panel
        title="Privileges"
        items={cert.privileges}
        accent={ACCENT_GOLD}
      />
    </section>
  );
}

function Panel({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${accent}30`,
        borderRadius: 8,
        padding: "14px 16px",
        background: `${accent}08`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontFamily: "monospace",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: "#666" }}>(none)</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {items.map((item) => (
            <span
              key={item}
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "#ddd",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function HonestNote({ cert }: { cert: Certification }) {
  return (
    <section
      style={{
        border: "1px solid #2a2a2a",
        borderLeft: `3px solid ${ACCENT_PURPLE}`,
        borderRadius: 6,
        padding: "16px 20px",
        background: "#0a0a0a",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: ACCENT_PURPLE,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontFamily: "monospace",
          marginBottom: 8,
        }}
      >
        Honest note
      </div>
      <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>
        {cert.honest_note}
      </div>
    </section>
  );
}

function RawJson({ cert }: { cert: Certification }) {
  return (
    <details style={{ color: "#666", fontSize: 12 }}>
      <summary style={{ cursor: "pointer", fontFamily: "monospace" }}>
        Raw CapCard JSON
      </summary>
      <pre
        style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 6,
          padding: 14,
          fontSize: 11,
          overflowX: "auto",
          marginTop: 8,
          color: "#aaa",
        }}
      >
        {JSON.stringify(cert, null, 2)}
      </pre>
    </details>
  );
}

function ApiOffline({ error }: { error: string }) {
  return (
    <div
      style={{
        border: "1px solid #4a3030",
        background: "#1a0a0a",
        borderRadius: 8,
        padding: 24,
        color: "#fdb",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        PETAL API not reachable.
      </div>
      <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>
        Tried <code style={{ color: ACCENT_CYAN }}>{PETAL_API}</code>.{" "}
        Error: <code>{error}</code>.
      </div>
    </div>
  );
}
