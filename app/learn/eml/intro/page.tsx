import type { Metadata } from "next";
import LessonComplete from "./LessonComplete";

export const metadata: Metadata = {
  title: "EML in 30 Minutes (Level 1) — monogate.dev/learn/eml/intro",
  description:
    "Level 1 of the EML curriculum. Six lessons, five minutes each. By "
    + "the end you'll have written your own equation, compiled it to 22 "
    + "targets including FPGA hardware, added formal verification, and "
    + "read the chain-order profile.",
};

const ACCENT_GOLD = "#E8A020";
const ACCENT_GREEN = "#4ADE80";
const ACCENT_BLUE = "#6AB0F5";
const ACCENT_PURPLE = "#A78BFA";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#12151f";
const BORDER = "#1c1f2e";
const TEXT = "#d4d4d4";
const MUTED = "#6a6e85";

// ── Reusable bits ──────────────────────────────────────────

function Code({
  lang,
  children,
}: {
  lang?: string;
  children: string;
}) {
  return (
    <pre
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "16px 18px",
        margin: "12px 0",
        fontSize: 12.5,
        lineHeight: 1.55,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: TEXT,
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {lang ? (
        <span style={{ color: MUTED, fontSize: 10, display: "block", marginBottom: 6 }}>
          {lang}
        </span>
      ) : null}
      <code style={{ color: "inherit", background: "transparent" }}>{children}</code>
    </pre>
  );
}

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.92em",
        color: ACCENT_GOLD,
        background: "rgba(232, 160, 32, 0.08)",
        padding: "1px 6px",
        borderRadius: 3,
      }}
    >
      {children}
    </code>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: ACCENT_GOLD,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Lesson({
  num,
  title,
  minutes,
  anchor,
  accent,
  children,
}: {
  num: number;
  title: string;
  minutes: number;
  anchor: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={anchor}
      style={{
        marginTop: 56,
        paddingTop: 32,
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            color: accent,
            letterSpacing: 1.5,
          }}
        >
          LESSON {num.toString().padStart(2, "0")}
        </span>
        <span style={{ fontSize: 11, color: MUTED }}>· {minutes} min</span>
      </div>
      <h2
        style={{
          fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 18,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {children}
      <LessonComplete num={num} />
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "1.05rem",
        fontWeight: 600,
        color: "#eaeaea",
        marginTop: 28,
        marginBottom: 10,
      }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: TEXT,
        fontSize: "0.96rem",
        lineHeight: 1.7,
        margin: "10px 0",
      }}
    >
      {children}
    </p>
  );
}

function Exercise({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "14px 18px",
        background: "rgba(74, 222, 128, 0.06)",
        border: `1px solid rgba(74, 222, 128, 0.20)`,
        borderRadius: 4,
        fontSize: "0.92rem",
        color: TEXT,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: ACCENT_GREEN,
          marginBottom: 8,
        }}
      >
        EXERCISE
      </div>
      {children}
    </div>
  );
}

function StrongLine({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "20px 0",
        fontSize: "1.02rem",
        fontWeight: 600,
        color: ACCENT_GOLD,
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function ForgeTutorialPage() {
  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px) 120px",
        color: TEXT,
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#666",
            marginBottom: 14,
          }}
        >
          <a href="/learn/eml" style={{ color: "#888", textDecoration: "none" }}>
            ← /learn/eml
          </a>
        </div>
        <Eyebrow>Monogate Forge · Level 1 · 30-minute crash course</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(1.9rem, 6vw, 2.6rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.12,
          }}
        >
          EML-lang in 30 Minutes
        </h1>
        <p
          style={{
            fontSize: "clamp(0.98rem, 2.4vw, 1.08rem)",
            color: "#bbb",
            lineHeight: 1.65,
            maxWidth: 640,
          }}
        >
          Six lessons, five minutes each. By the end you&apos;ll have written
          your own equation, compiled it to 22 targets including FPGA
          hardware, added formal verification, and read the chain-order
          profile that predicts numerical behaviour.
        </p>
        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            marginTop: 22,
            fontSize: 13,
            color: MUTED,
          }}
        >
          <span>
            <strong style={{ color: TEXT }}>Audience.</strong> Anyone who
            can write an equation.
          </span>
          <span>
            <strong style={{ color: TEXT }}>Prerequisite.</strong>
            Algebra. That&apos;s it.
          </span>
        </div>
      </header>

      {/* ── What you'll build (TOC) ────────────────────── */}
      <section
        style={{
          marginBottom: 40,
          padding: "20px 22px",
          background: SURFACE_2,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
        }}
      >
        <Eyebrow>What you&apos;ll build</Eyebrow>
        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            color: TEXT,
            fontSize: "0.95rem",
            lineHeight: 1.85,
          }}
        >
          <li>
            <a href="#l1" style={{ color: ACCENT_GOLD }}>
              Write your first equation in EML-lang
            </a>
          </li>
          <li>
            <a href="#l1" style={{ color: ACCENT_GOLD }}>
              Compile it to 22 targets (C, Rust, Verilog, Lean, …)
            </a>
          </li>
          <li>
            <a href="#l2" style={{ color: ACCENT_GOLD }}>
              Read a chain-order profile
            </a>
          </li>
          <li>
            <a href="#l3" style={{ color: ACCENT_GOLD }}>
              Build a PID controller
            </a>
          </li>
          <li>
            <a href="#l4" style={{ color: ACCENT_GOLD }}>
              Add formal verification
            </a>
          </li>
          <li>
            <a href="#l5" style={{ color: ACCENT_GOLD }}>
              Target an FPGA
            </a>
          </li>
          <li>
            <a href="#l6" style={{ color: ACCENT_GOLD }}>
              Compile your own equation to silicon
            </a>
          </li>
        </ol>
        <P>
          No programming experience required. EML-lang is math with curly
          braces.
        </P>
      </section>

      {/* ── Lesson 1 ───────────────────────────────────── */}
      <Lesson
        num={1}
        title="Your first equation"
        minutes={5}
        anchor="l1"
        accent={ACCENT_BLUE}
      >
        <Heading>The simplest possible program</Heading>
        <P>
          Create a file called <Inline>hello.eml</Inline>:
        </P>
        <Code lang="hello.eml">{`fn add(a: Real, b: Real) -> Real {
    a + b
}`}</Code>
        <P>That&apos;s it. You just wrote EML-lang.</P>
        <P>Let&apos;s break it down:</P>
        <Code>{`fn              → "I'm defining a function"
add             → the name (you pick this)
(a: Real,       → first input, it's a real number
 b: Real)       → second input, also a real number
-> Real         → this function returns a real number
{               → start of the math
    a + b       → the equation (just addition)
}               → end`}</Code>

        <Heading>Compile it</Heading>
        <Code lang="bash">{`python tools/cli/main.py hello.eml --target all -o ./my_first`}</Code>

        <Heading>What you get</Heading>
        <Code>{`my_first/
  hello.c           ← your equation in C
  hello.cpp         ← your equation in C++
  hello.rs          ← your equation in Rust
  hello.py          ← your equation in Python
  hello.ll          ← your equation in LLVM IR
  hello.wasm.ll     ← your equation in WebAssembly
  hello.lean        ← your equation as a Lean theorem
  hello.v           ← your equation in Verilog (hardware!)
  hello.sv          ← your equation in SystemVerilog
  hello.vhd         ← your equation in VHDL
  Hello.scala       ← your equation in Chisel
  hello.ads         ← your equation in Ada/SPARK (spec)
  hello.adb         ← your equation in Ada/SPARK (body)
  hello.m           ← your equation in MATLAB
  hello.go          ← your equation in Go
  hello.kt          ← your equation in Kotlin
  Hello.java        ← your equation in Java
  hello.aadl        ← your equation as an AADL component
  hello.arxml       ← your equation as an AUTOSAR SWC
  hello_pkg/        ← your equation as a ROS2 package`}</Code>

        <P>
          Open <Inline>hello.c</Inline> and look:
        </P>
        <Code lang="hello.c">{`// Generated by Monogate Forge
// Source: hello.eml
// Chain order: 0 | Cost class: p0-d2-w0-c0

double add(double a, double b) {
    return a + b;
}`}</Code>

        <P>Your equation. In C. Ready to compile and run.</P>

        <P>
          Open <Inline>hello.v</Inline> and look:
        </P>
        <Code lang="hello.v">{`// Generated by Monogate Forge
// Source: hello.eml
// Chain order: 0 | FPGA: 1 MAC unit

module add (
    input  wire signed [63:0] a,
    input  wire signed [63:0] b,
    output wire signed [63:0] result
);
    assign result = a + b;
endmodule`}</Code>

        <P>Your equation. In hardware. Ready for an FPGA.</P>

        <StrongLine>
          You just compiled math to silicon. In one command.
        </StrongLine>

        <Exercise>
          Change <Inline>a + b</Inline> to <Inline>a * b</Inline>. Recompile.
          Open the C and Verilog files. See how they changed.
        </Exercise>
      </Lesson>

      {/* ── Lesson 2 ───────────────────────────────────── */}
      <Lesson
        num={2}
        title="Constants and real math"
        minutes={5}
        anchor="l2"
        accent={ACCENT_BLUE}
      >
        <Heading>Adding constants</Heading>
        <Code lang="gravity.eml">{`const g: Real = 9.81
const half: Real = 0.5

fn fall_distance(t: Real) -> Real {
    half * g * t * t
}

fn fall_velocity(t: Real) -> Real {
    g * t
}`}</Code>
        <P>
          <Inline>const</Inline> gives a name to a number. Same as any
          language.
        </P>

        <Heading>Using transcendental functions</Heading>
        <P>These are the functions that make EML-lang special:</P>
        <Code lang="transcendental.eml">{`fn exponential_decay(t: Real, k: Real) -> Real {
    exp(-k * t)
}

fn oscillation(t: Real, freq: Real) -> Real {
    sin(freq * t)
}

fn damped_wave(t: Real, decay: Real, freq: Real) -> Real {
    exp(-decay * t) * cos(freq * t)
}`}</Code>

        <P>The available math functions:</P>
        <Code>{`FUNCTION       WHAT IT DOES                 CHAIN ORDER
─────────────────────────────────────────────────────────
+ - * /        arithmetic                   0
exp(x)         e to the x                   adds 1
ln(x)          natural log of x             adds 1
sin(x)         sine                         adds 2
cos(x)         cosine                       adds 2
tan(x)         tangent                      adds 2
sqrt(x)        square root                  0
tanh(x)        hyperbolic tangent           adds 2
arcsin(x)      inverse sine                 adds 2
arccos(x)      inverse cosine               adds 2
atan2(y, x)    angle from coordinates       adds 2
abs(x)         absolute value               0
clamp(x, l, h) clip to range                0
min(a, b)      smaller of two               0
max(a, b)      larger of two                0
pow(x, y)      x to the y                   0 to 1
eml(x, y)      exp(x) - ln(y)               adds 1`}</Code>

        <Heading>Compile and read the profile</Heading>
        <Code lang="bash">{`python tools/cli/main.py transcendental.eml --explain`}</Code>
        <P>The compiler tells you about each function:</P>
        <Code>{`exponential_decay:
  chain_order: 1            ← one transcendental layer (exp)
  cost_class:  p1-d3-w1-c0
  drift_risk:  LOW          ← safe at float32

damped_wave:
  chain_order: 3            ← three layers (exp + cos)
  cost_class:  p3-d5-w2-c1
  drift_risk:  MEDIUM       ← use float64 for precision`}</Code>

        <Heading>What chain order means (plain English)</Heading>
        <Code>{`Chain 0:   Just arithmetic. x + y, x * y, x^2.
           Simple. Fast. Always precise.
           Safe at any precision (even float16).

Chain 1:   One exp or ln involved.
           Like exponential decay, compound interest.
           Still safe. Slight precision consideration.

Chain 2:   Trig involved. sin, cos, tanh.
           Like oscillations, waves, rotations.
           Needs float32 minimum.

Chain 3+:  Multiple layers nested.
           Like exp(sin(x)) or damped oscillators.
           Needs float64. FPGA needs more hardware units.
           The compiler warns you automatically.`}</Code>

        <Exercise>
          Write a function for compound interest:{" "}
          <Inline>A = P * exp(r * t)</Inline>. Compile it. What chain order
          does the compiler report?
          <span style={{ color: MUTED }}> (Answer: chain 1 — one exp layer.)</span>
        </Exercise>
      </Lesson>

      {/* ── Lesson 3 ───────────────────────────────────── */}
      <Lesson
        num={3}
        title="PID controller"
        minutes={5}
        anchor="l3"
        accent={ACCENT_GOLD}
      >
        <Heading>The most common equation in all of engineering</Heading>
        <P>Every robot, drone, car, thermostat, and factory uses PID:</P>
        <Code lang="pid_controller.eml">{`const Kp: Real = 2.5      // proportional gain
const Ki: Real = 0.1      // integral gain
const Kd: Real = 0.05     // derivative gain

fn pid(error: Real, integral: Real, derivative: Real) -> Real {
    Kp * error + Ki * integral + Kd * derivative
}`}</Code>
        <P>That&apos;s a complete PID controller.</P>

        <Heading>Compile it</Heading>
        <Code lang="bash">{`python tools/cli/main.py pid_controller.eml --target all -o ./pid_out`}</Code>

        <Heading>What the compiler tells you</Heading>
        <Code>{`pid:
  chain_order: 0              ← purely polynomial (no exp/sin)
  nodes:       6              ← 6 arithmetic operations
  cost_class:  p0-d6-w0-c0
  drift_risk:  NONE           ← safe at ANY precision
  fpga_estimate:
    exp_units: 0              ← no transcendental hardware
    luts:      ~50            ← tiny FPGA footprint
    latency:   3 cycles       ← 30 ns at 100 MHz`}</Code>

        <P>
          Chain order 0 means this PID is just arithmetic. No{" "}
          <Inline>exp</Inline>. No <Inline>sin</Inline>. Pure math. Runs on
          the smallest FPGA chip you can buy. 30 nanoseconds per cycle.
        </P>

        <Heading>Now make it nonlinear</Heading>
        <Code lang="nonlinear_pid.eml">{`const Kp: Real = 2.5
const decay: Real = 0.1
const freq: Real = 10.0

fn adaptive_pid(error: Real, t: Real) -> Real {
    let gain = exp(-decay * t) * cos(freq * t);
    gain * Kp * error
}`}</Code>
        <P>Compile it again. Now the compiler says:</P>
        <Code>{`adaptive_pid:
  chain_order: 3              ← jumped from 0 to 3!
  drift_risk:  MEDIUM         ← float64 recommended
  fpga_estimate:
    exp_units:  1             ← needs exp hardware
    trig_units: 1             ← needs cos hardware
    luts:       ~300          ← 6× more FPGA resources`}</Code>

        <StrongLine>
          The compiler told you the complexity jumped. Before you ran
          anything. Before you built any hardware. Before you spent any
          money. The chain order predicts the cost.
        </StrongLine>

        <Exercise>
          Add a <Inline>tanh</Inline> to the PID output (to clamp it
          smoothly). What does the chain order become?
          <span style={{ color: MUTED }}>
            {" "}
            (Answer: chain 2 — tanh adds 2 to chain 0.)
          </span>
        </Exercise>
      </Lesson>

      {/* ── Lesson 4 ───────────────────────────────────── */}
      <Lesson
        num={4}
        title="Formal verification"
        minutes={5}
        anchor="l4"
        accent={ACCENT_PURPLE}
      >
        <Heading>Making the compiler PROVE your math is correct</Heading>
        <P>
          Add <Inline>@verify</Inline> to any function:
        </P>
        <Code lang="safe_pid.eml">{`const Kp: Real = 2.5
const Ki: Real = 0.1
const max_output: Real = 100.0

@verify(lean, theorem = "pid_is_bounded")
fn safe_pid(error: Real, integral: Real) -> Real
    requires (abs(error) < 50.0)
    requires (abs(integral) < 500.0)
    ensures  (abs(result) < max_output)
{
    Kp * error + Ki * integral
}`}</Code>

        <P>What the new keywords mean:</P>
        <Code>{`@verify(lean, theorem = "pid_is_bounded")
  → "Generate a Lean proof for this function"
  → The theorem will be named "pid_is_bounded"

requires (abs(error) < 50.0)
  → "This function only works when error is between -50 and 50"
  → If someone passes error = 999, that's THEIR bug, not yours

ensures (abs(result) < max_output)
  → "I PROMISE the output is always between -100 and 100"
  → The compiler generates a PROOF of this promise`}</Code>

        <Heading>Compile with verification</Heading>
        <Code lang="bash">{`python tools/cli/main.py safe_pid.eml --target lean -o ./verified.lean`}</Code>
        <P>
          Open <Inline>verified.lean</Inline>:
        </P>
        <Code lang="lean">{`import MachLib.EML
import MachLib.Trig

open MachLib
open MachLib.Real

def safe_pid (error integral : Real) : Real :=
  2.5 * error + 0.1 * integral

theorem pid_is_bounded
    (error integral : Real)
    (h1 : abs error < 50.0)
    (h2 : abs integral < 500.0) :
    abs (safe_pid error integral) < 100.0 := by
  unfold safe_pid
  sorry  -- TODO: prove against MachLib foundations`}</Code>

        <P>
          The compiler generated the <strong>theorem statement</strong>. The{" "}
          <Inline>sorry</Inline> means the proof isn&apos;t filled in yet.
          That&apos;s where MachLib&apos;s proof corpus (or an agent) closes
          it.
        </P>

        <Heading>Why this matters</Heading>
        <Code>{`WITHOUT @verify:
  "I think my PID output stays under 100."
  "It worked in testing."
  "Ship it and hope."

WITH @verify:
  "The Lean theorem prover proved my PID output stays
   under 100 for all valid inputs."
  "Here's the proof certificate."
  "The math is guaranteed, not hoped."`}</Code>

        <Heading>One annotation, many provers</Heading>
        <P>
          The same <Inline>@verify(lean, ...)</Inline> block also drives
          Coq, Isabelle/HOL, Ada SPARK Pre/Post aspects, SystemVerilog SVA
          assertions, MATLAB asserts, Java/Kotlin/Go runtime guards, and
          Doxygen contract comments. One source. Twelve target ecosystems
          hit by one annotation.
        </P>
        <Code lang="bash">{`python tools/cli/main.py safe_pid.eml --target coq      -o ./safe.v
python tools/cli/main.py safe_pid.eml --target isabelle -o ./Safe.thy
python tools/cli/main.py safe_pid.eml --target ada      -o ./safe.adb`}</Code>

        <Exercise>
          Write a function for temperature conversion:{" "}
          <Inline>fn celsius_to_fahrenheit(c: Real) -&gt; Real</Inline>{" "}
          returning <Inline>1.8 * c + 32.0</Inline>. Add{" "}
          <Inline>@verify</Inline> with{" "}
          <Inline>requires (c &gt; -273.15)</Inline> (can&apos;t go below
          absolute zero) and{" "}
          <Inline>ensures (result &gt; -459.67)</Inline> (same constraint
          in Fahrenheit). Compile to Lean. Look at the generated theorem.
        </Exercise>
      </Lesson>

      {/* ── Lesson 5 ───────────────────────────────────── */}
      <Lesson
        num={5}
        title="Hardware target"
        minutes={5}
        anchor="l5"
        accent={ACCENT_GOLD}
      >
        <Heading>Putting your math on a chip</Heading>
        <P>
          Add <Inline>@target(fpga)</Inline> to any function:
        </P>
        <Code lang="fpga_pid.eml">{`const Kp: Real = 2.5
const Ki: Real = 0.1

@target(fpga, clock_mhz = 100)
fn hardware_pid(error: Real, integral: Real) -> Real {
    Kp * error + Ki * integral
}`}</Code>

        <Heading>Compile to Verilog (or SystemVerilog)</Heading>
        <Code lang="bash">{`python tools/cli/main.py fpga_pid.eml --target verilog -o ./hw/pid.v
python tools/cli/main.py fpga_pid.eml --target systemverilog -o ./hw/pid.sv`}</Code>
        <P>The compiler tells you:</P>
        <Code>{`hardware_pid:
  FPGA allocation:
    target:    Xilinx Artix-7
    LUTs:      48
    DSP blocks: 2
    exp units: 0 (not needed — chain 0)
    clock:     100 MHz
    latency:   2 cycles (20 ns)
    utilization: 0.07% of Artix-7 budget`}</Code>

        <P>
          Open <Inline>hw/pid.v</Inline>:
        </P>
        <Code lang="verilog">{`// Generated by EML-lang Verilog backend
// Chain order: 0 | 48 LUTs | 2 DSPs | 20 ns latency

module hardware_pid_pipeline #(
    parameter WIDTH = 32
) (
    input  wire             clk,
    input  wire             rst,
    input  wire             valid_in,
    input  wire signed [WIDTH-1:0] error,
    input  wire signed [WIDTH-1:0] integral,
    output reg              valid_out,
    output reg signed [WIDTH-1:0] result
);
    wire signed [WIDTH-1:0] _w1, _w2, _w3;
    assign _w1 = Kp * error;
    assign _w2 = Ki * integral;
    assign _w3 = _w1 + _w2;

    always @(posedge clk) begin
        if (rst) begin
            valid_out <= 1'b0;
            result    <= '0;
        end else begin
            valid_out <= valid_in;
            result    <= _w3;
        end
    end
endmodule`}</Code>

        <P>
          That&apos;s your equation. As a hardware module. Ready to load
          onto a $50 FPGA board.
        </P>

        <Heading>What the numbers mean</Heading>
        <Code>{`LUTs:      Logic blocks on the FPGA. 48 out of 63,400 available.
           Your PID uses 0.07% of the chip. Basically free.

DSPs:      Dedicated multiplier blocks. 2 out of 240 available.
           One for each multiplication (Kp*error, Ki*integral).

Latency:   How many clock cycles to compute one result.
           2 cycles at 100 MHz = 20 nanoseconds.
           That's 50,000,000 PID computations per second.

For comparison:
  PLC:     1 PID computation per millisecond (1,000/sec)
  FPGA:    50,000,000 PID computations per second

  50,000× faster. On a chip that costs $50 instead of $5,000.`}</Code>

        <Exercise>
          Take the <Inline>damped_wave</Inline> from Lesson 2. Add{" "}
          <Inline>@target(fpga)</Inline>. Compile. Compare the FPGA
          allocation to the simple PID.
          <span style={{ color: MUTED }}>
            {" "}
            (The damped wave needs exp + cos hardware units. More
            resources.)
          </span>
        </Exercise>
      </Lesson>

      {/* ── Lesson 6 ───────────────────────────────────── */}
      <Lesson
        num={6}
        title="Your own project"
        minutes={5}
        anchor="l6"
        accent={ACCENT_GREEN}
      >
        <Heading>Pick any equation you know</Heading>
        <P>Here are ideas based on what you do:</P>
        <Code>{`IF YOU'RE A MECHANICAL ENGINEER:
  Spring-mass-damper: F = -k*x - c*v
  Heat transfer:      Q = h*A*(T_surface - T_fluid)
  Stress:             sigma = F / A

IF YOU'RE AN ELECTRICAL ENGINEER:
  RC decay:       V = V0 * exp(-t / (R*C))
  RLC oscillator: V = V0 * exp(-R*t/(2*L)) * cos(omega*t)
  Ohm's law:      V = I * R

IF YOU'RE A CHEMICAL ENGINEER:
  Arrhenius:       k = A * exp(-Ea / (R*T))
  First-order:     C = C0 * exp(-k*t)
  pH:              pH = -ln(H_concentration) / ln(10)

IF YOU'RE A GAME DEVELOPER:
  Projectile:      y = v0*t - 0.5*g*t*t
  Bounce decay:    y = A * exp(-d*t) * abs(sin(omega*t))
  Camera smoothing: pos = lerp(curr, target, 1 - exp(-speed*dt))

IF YOU DON'T KNOW WHAT EQUATION TO USE:
  Just do this:

  fn my_function(x: Real) -> Real {
      exp(x) * sin(x)
  }

  Compile it. See what happens.`}</Code>

        <Heading>Write it</Heading>
        <Code lang="my_project.eml">{`const k: Real = 100.0     // spring constant
const c: Real = 5.0       // damping coefficient
const m: Real = 1.0       // mass

fn spring_force(x: Real, v: Real) -> Real {
    (-k * x - c * v) / m
}

@verify(lean, theorem = "force_proportional")
fn verified_spring(x: Real, v: Real) -> Real
    requires (abs(x) < 10.0)
    requires (abs(v) < 100.0)
    ensures  (abs(result) < 1500.0)
{
    spring_force(x, v)
}

@target(fpga, clock_mhz = 200)
fn realtime_spring(x: Real, v: Real) -> Real {
    spring_force(x, v)
}`}</Code>

        <Heading>Compile everything</Heading>
        <Code lang="bash">{`python tools/cli/main.py my_project.eml --target all -o ./my_build`}</Code>

        <Heading>What you just did</Heading>
        <Code>{`In 30 minutes you:

  1. Learned EML-lang syntax (fn, const, Real)
  2. Used transcendental functions (exp, sin, cos)
  3. Read chain-order profiles
  4. Built a PID controller
  5. Added formal verification (@verify)
  6. Targeted FPGA hardware (@target)
  7. Compiled YOUR OWN equation to 22 targets

You can now:
  - Write any equation in EML-lang
  - Compile it to C, C++, Rust, Verilog, SystemVerilog,
    Lean, Coq, Isabelle, Ada/SPARK, MATLAB, ROS2,
    Java, Kotlin, Go, AUTOSAR, AADL, Solidity, and 5 more
  - Read the structural profile (chain order, drift risk)
  - Add formal proofs to safety-critical functions
  - Deploy to FPGA hardware`}</Code>

        <StrongLine>
          One equation. Twenty-two targets. Verified. Write math. Get
          silicon — and smart contracts.
        </StrongLine>
      </Lesson>

      {/* ── Quick Reference ────────────────────────────── */}
      <section
        id="reference"
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <Eyebrow>Quick reference card</Eyebrow>
        <h2
          style={{
            fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 18,
          }}
        >
          Print this and pin it to your wall.
        </h2>
        <Code>{`SYNTAX
  const NAME: Real = VALUE
  fn NAME(x: Real, y: Real) -> Real { equation }
  let temp = sub_expression;
  if condition { a } else { b }

MATH
  +  -  *  /                  arithmetic
  exp(x)  ln(x)               exponential / log
  sin(x)  cos(x)  tanh(x)     trigonometric
  sqrt(x)  abs(x)             utilities
  min(a, b)  max(a, b)        comparison
  clamp(x, lo, hi)            saturating clip
  arcsin(x)  arccos(x)        inverse trig
  atan2(y, x)                 angle from (x, y)
  pow(x, y)                   x to the y
  eml(x, y) = exp(x) - ln(y)  fundamental EML operator

ANNOTATIONS
  @verify(lean, theorem = "name")  generate a formal proof
  @target(fpga, clock_mhz = N)     compile to FPGA
  requires CONDITION               input precondition
  ensures  CONDITION               output postcondition

COMPILE
  python tools/cli/main.py file.eml --target all -o ./out
  python tools/cli/main.py file.eml --target c -o out.c
  python tools/cli/main.py file.eml --target verilog -o out.v
  python tools/cli/main.py file.eml --target lean -o out.lean

PROFILE READING
  chain_order: 0   polynomial (simple, always safe)
  chain_order: 1   exponential (one layer, safe)
  chain_order: 2   trigonometric (needs float32+)
  chain_order: 3+  nested (needs float64, more FPGA)
  drift_risk: LOW / MEDIUM / HIGH  precision warning`}</Code>
      </section>

      {/* ── Next Steps ─────────────────────────────────── */}
      <section
        style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <Eyebrow>Next steps</Eyebrow>
        <h2
          style={{
            fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 18,
          }}
        >
          You finished. Now what?
        </h2>
        <ol
          style={{
            color: TEXT,
            fontSize: "0.96rem",
            lineHeight: 1.85,
            paddingLeft: 22,
          }}
        >
          <li>
            <strong style={{ color: "#fff" }}>Explore the examples.</strong>{" "}
            <Inline>examples/</Inline> ships 12 short, public teaching{" "}
            <Inline>.eml</Inline> files. Upgrade to{" "}
            <a
              href="https://monogateforge.com/get-started"
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Forge Pro
            </a>{" "}
            for access to 280+ verified industry kernels across
            23 verticals.
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Read the language guide.</strong>{" "}
            <Inline>monogate-forge/docs/language_guide.md</Inline>.
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Try the interactive demos.</strong>{" "}
            <a href="https://1op.io/playground" style={{ color: ACCENT_GOLD }}>
              1op.io/playground
            </a>
            .
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Join the ecosystem.</strong>
            <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18 }}>
              <li>
                <a
                  href="https://monogateforge.com"
                  style={{ color: ACCENT_GOLD }}
                >
                  monogateforge.com
                </a>{" "}
                → the compiler
              </li>
              <li>
                <a href="https://machlib.org" style={{ color: ACCENT_GOLD }}>
                  machlib.org
                </a>{" "}
                → machine-native math library
              </li>
              <li>
                <a href="https://capcard.ai" style={{ color: ACCENT_GOLD }}>
                  capcard.ai
                </a>{" "}
                → agent certification
              </li>
              <li>
                <a href="https://monogate.org" style={{ color: ACCENT_GOLD }}>
                  monogate.org
                </a>{" "}
                → the research behind it all
              </li>
            </ul>
          </li>
        </ol>
      </section>
    </main>
  );
}
