import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn EML — monogate.dev/learn/eml",
  description:
    "The EML curriculum: a four-level ladder from 30-minute intro to "
    + "production engineering, six domain tracks (aerospace, gaming, "
    + "robotics, audio DSP, medical devices, DeFi), and the Forge "
    + "compiler internals. Self-paced, written for engineers.",
};

const ACCENT_GOLD = "#E8A020";
const ACCENT_GREEN = "#4ADE80";
const ACCENT_BLUE = "#6AB0F5";
const ACCENT_PURPLE = "#A78BFA";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#0a0b12";
const BORDER = "#1c1f2e";
const TEXT = "#d4d4d4";
const MUTED = "#6a6e85";

type Level = {
  number: string;
  title: string;
  href: string;
  status: "live" | "draft";
  time: string;
  prereq: string | null;
  blurb: string;
  accent: string;
};

const LEVELS: Level[] = [
  {
    number: "01",
    title: "EML in 30 Minutes",
    href: "/learn/eml/intro",
    status: "live",
    time: "30 min · 6 lessons",
    prereq: null,
    blurb:
      "Write your first equation, compile it to 22 targets (Python, Rust, "
      + "C, Lean, Verilog, …), add a verification contract, and read the "
      + "chain-order profile. No prerequisites beyond high-school algebra.",
    accent: ACCENT_GOLD,
  },
  {
    number: "02",
    title: "Engineering with EML",
    href: "/learn/eml/engineering",
    status: "live",
    time: "60 min · 6 lessons",
    prereq: "Level 1",
    blurb:
      "Multi-module systems, the chain-order cost model, compositional "
      + "verification contracts, hardware budgets, multi-target CI workflows, "
      + "and the standard library. The lessons that turn a Level 1 user into "
      + "an EML engineer.",
    accent: ACCENT_GOLD,
  },
];

type Track = {
  slug: string;
  label: string;
  blurb: string;
  status: "live" | "draft";
};

const TRACKS: Track[] = [
  {
    slug: "aerospace",
    label: "Aerospace",
    blurb: "Flight controllers, autopilots, IMUs, INS alignment.",
    status: "draft",
  },
  {
    slug: "gaming",
    label: "Gaming",
    blurb: "Physics, animation, shaders (HLSL/GLSL/WGSL/Metal), audio.",
    status: "draft",
  },
  {
    slug: "robotics",
    label: "Robotics",
    blurb: "Kinematics, motion planning, control, sensor fusion.",
    status: "draft",
  },
  {
    slug: "audio",
    label: "Audio DSP",
    blurb: "Synthesizers, filters, reverbs, real-time effects.",
    status: "draft",
  },
  {
    slug: "medical",
    label: "Medical Devices",
    blurb: "Defibrillator energy, infusion pumps, patient monitors.",
    status: "draft",
  },
  {
    slug: "defi",
    label: "DeFi",
    blurb: "AMMs, oracles, risk models. Solidity-first.",
    status: "draft",
  },
];

const FORGE: Level = {
  number: "04",
  title: "Forge Internals",
  href: "/learn/eml/forge",
  status: "draft",
  time: "deep dive",
  prereq: "Level 2 + one Level 3 track",
  blurb:
    "How Forge actually works: the parser, the Pfaffian profiler, the "
    + "optimizer pipeline (inline / CSE / SuperBEST / shake-imports), the "
    + "32 backends, the FPGA allocator, and the Lean theorem-shape generator.",
  accent: ACCENT_PURPLE,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: ACCENT_GOLD,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: "live" | "draft" }) {
  const live = status === "live";
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 3,
        color: live ? ACCENT_GREEN : MUTED,
        background: live ? "rgba(74, 222, 128, 0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${live ? "rgba(74, 222, 128, 0.25)" : BORDER}`,
      }}
    >
      {live ? "live" : "draft"}
    </span>
  );
}

function LevelCard({ level }: { level: Level }) {
  const live = level.status === "live";
  const Tag = live ? "a" : "div";
  const content = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 13,
              color: level.accent,
              letterSpacing: "0.08em",
            }}
          >
            {level.number}
          </span>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {level.title}
          </h2>
        </div>
        <StatusPill status={level.status} />
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: MUTED,
          marginBottom: 12,
        }}
      >
        {level.time}
        {level.prereq ? <> &nbsp;·&nbsp; prereq: {level.prereq}</> : null}
      </div>
      <p
        style={{
          fontSize: 14.5,
          lineHeight: 1.65,
          color: TEXT,
          margin: 0,
        }}
      >
        {level.blurb}
      </p>
    </>
  );

  if (live) {
    return (
      <a
        href={level.href}
        style={{
          display: "block",
          background: SURFACE_2,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: "24px 26px",
          textDecoration: "none",
          color: "inherit",
          transition: "border-color 0.15s ease, transform 0.15s ease",
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <div
      style={{
        background: SURFACE_2,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "24px 26px",
        opacity: 0.78,
      }}
    >
      {content}
    </div>
  );
}

function TrackTile({ track }: { track: Track }) {
  const live = track.status === "live";
  const Tag: "a" | "div" = live ? "a" : "div";
  const inner = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {track.label}
          {live ? " →" : ""}
        </div>
        <StatusPill status={track.status} />
      </div>
      <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
        {track.blurb}
      </div>
    </>
  );
  if (live) {
    return (
      <a
        href={`/learn/eml/${track.slug}`}
        style={{
          display: "block",
          padding: "16px 18px",
          background: SURFACE_2,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      style={{
        padding: "16px 18px",
        background: SURFACE_2,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        opacity: 0.7,
      }}
    >
      {inner}
    </div>
  );
}

export default function LearnEMLHub() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08090e",
        color: TEXT,
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            fontSize: 11,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#666",
            marginBottom: 14,
          }}
        >
          <a href="/learn" style={{ color: "#888", textDecoration: "none" }}>
            ← /learn
          </a>
        </div>

        <Eyebrow>The EML curriculum</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.8rem)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 14px",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Learn EML
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: "#bbb",
            margin: "0 0 12px",
            maxWidth: 660,
          }}
        >
          A four-level ladder. Start at Level 1 with no prerequisites; finish
          Level 2 and you can run multi-module verified systems on real
          hardware. Pick a Level 3 track for your domain. Open the Forge
          internals when you want to extend the compiler itself.
        </p>
        <p
          style={{
            fontSize: 13.5,
            color: MUTED,
            margin: "0 0 40px",
          }}
        >
          Self-paced. Written for engineers. Every code sample is a real{" "}
          <code
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: ACCENT_GOLD,
            }}
          >
            .eml
          </code>{" "}
          file you can copy out and compile.
        </p>

        {/* Levels 1 & 2 */}
        <section
          style={{
            display: "grid",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {LEVELS.map((l) => (
            <LevelCard key={l.number} level={l} />
          ))}
        </section>

        {/* Level 3: Tracks */}
        <section style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 13,
                  color: ACCENT_BLUE,
                  letterSpacing: "0.08em",
                }}
              >
                03
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Domain Tracks
              </h2>
            </div>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                color: MUTED,
              }}
            >
              prereq: Level 2 &nbsp;·&nbsp; pick any
            </span>
          </div>
          <p
            style={{
              fontSize: 14.5,
              color: TEXT,
              lineHeight: 1.65,
              marginBottom: 20,
            }}
          >
            Six tracks, one per industry vertical. Each track walks through
            the kinds of equations the vertical lives on — what the math is,
            why chain order matters there, what proofs ship, and which
            targets the kernel lands on. The pre-verified kernels themselves
            are the proprietary product; tracks describe the surface without
            shipping the source. Upgrade to{" "}
            <a
              href="https://monogateforge.com/get-started"
              style={{ color: ACCENT_GOLD, textDecoration: "underline" }}
            >
              Forge Pro
            </a>{" "}
            for access.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {TRACKS.map((t) => (
              <TrackTile key={t.slug} track={t} />
            ))}
          </div>
        </section>

        {/* Level 4: Forge */}
        <section style={{ marginBottom: 56 }}>
          <LevelCard level={FORGE} />
        </section>

        {/* What this is for */}
        <section
          style={{
            paddingTop: 32,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Eyebrow>How to use this</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
              fontWeight: 700,
              color: "#fff",
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            Where to start
          </h2>
          <ul
            style={{
              color: TEXT,
              fontSize: 14.5,
              lineHeight: 1.85,
              paddingLeft: 22,
              margin: 0,
            }}
          >
            <li>
              <strong style={{ color: "#fff" }}>Never seen EML before?</strong>{" "}
              Start at{" "}
              <a href="/learn/eml/intro" style={{ color: ACCENT_GOLD }}>
                Level 1
              </a>
              .
            </li>
            <li>
              <strong style={{ color: "#fff" }}>Already know the basics?</strong>{" "}
              Jump to{" "}
              <a href="/learn/eml/engineering" style={{ color: ACCENT_GOLD }}>
                Level 2
              </a>{" "}
              for module composition, contracts, and CI.
            </li>
            <li>
              <strong style={{ color: "#fff" }}>
                Looking for your domain?
              </strong>{" "}
              The Level 3 tracks pair the engineering foundations with the
              kernels you'd actually ship.
            </li>
            <li>
              <strong style={{ color: "#fff" }}>
                Want to extend the compiler?
              </strong>{" "}
              Level 4 is the Forge internals — parser, profiler, optimizer,
              backends.
            </li>
          </ul>
        </section>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: `1px solid ${BORDER}`,
            fontSize: 12,
            color: MUTED,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          Monogate Research &nbsp;·&nbsp;{" "}
          <a href="https://monogate.org" style={{ color: MUTED }}>
            monogate.org
          </a>{" "}
          &nbsp;·&nbsp;{" "}
          <a href="https://1op.io" style={{ color: MUTED }}>
            1op.io
          </a>{" "}
          &nbsp;·&nbsp;{" "}
          <a
            href="https://github.com/agent-maestro/forge"
            style={{ color: MUTED }}
          >
            github
          </a>
        </div>
      </div>
    </main>
  );
}
