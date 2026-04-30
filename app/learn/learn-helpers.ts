// Helpers for the learn pages — derive formal-layer content from
// existing PETAL records, define per-lane tactic budgets, build
// starter templates, and synthesize progressive hints.
//
// PETAL records do not directly expose every field the learn page
// wants to render (input/output types, starter code with sorry,
// allowed tactic list, hint progression). Rather than mutating
// the dataset schema (which is published to HuggingFace), all of
// this is computed at request time from the canonical fields.

import type { PetalRecord, ProofStep } from "./petal-types";

// ---------------------------------------------------------------------------
// Per-lane tactic budgets
//
// Each lane introduces a controlled tactic vocabulary. Beginners
// should not see ring/linarith on Lane 1 -- the proofs are all
// definitional. The vocabulary widens as lanes deepen.

export const LANE_TACTICS: Record<number, string[]> = {
  1: ["rfl", "simp", "unfold", "exact"],
  2: ["rfl", "simp", "unfold", "exact", "rw", "intro", "apply"],
  3: ["rfl", "simp", "unfold", "exact", "rw", "intro", "apply",
      "by_contra", "linarith", "omega", "exfalso"],
  4: ["rfl", "simp", "unfold", "exact", "rw", "intro", "apply",
      "by_contra", "linarith", "omega", "exfalso",
      "ring", "norm_num", "push_neg", "constructor"],
  5: ["rfl", "simp", "unfold", "exact", "rw", "intro", "apply",
      "by_contra", "linarith", "omega", "exfalso",
      "ring", "norm_num", "push_neg", "constructor",
      "obtain", "rcases", "refine", "use"],
  6: ["any tactic — research frontier"],
};

// ---------------------------------------------------------------------------
// Lean theorem-signature parser
//
// Splits a Lean 4 theorem source into header (theorem name), parameter
// list (`(c : ℂ) (x : ℝ) ...`), the conclusion (the proposition after
// the top-level colon), and the proof body (after `:=`).

export interface LeanSignature {
  name: string;
  params: string;
  conclusion: string;
  proof: string;
}

export function parseLeanTheorem(lean4: string): LeanSignature {
  // Match keyword + name (theorem | lemma | example).
  const headMatch = /^(?:theorem|lemma|example)\s+(\w+)?\s*([\s\S]*)$/.exec(
    lean4.trim(),
  );
  if (!headMatch) {
    return { name: "", params: "", conclusion: "", proof: "" };
  }
  const name = headMatch[1] ?? "";
  const rest = headMatch[2] ?? "";

  // Walk `rest`, tracking paren / bracket / brace depth, to find the
  // first top-level `:` (the params/conclusion split). Skip `:=`.
  let depth = 0;
  let firstColon = -1;
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (c === "(" || c === "{" || c === "[" || c === "⟨") depth++;
    else if (c === ")" || c === "}" || c === "]" || c === "⟩") depth--;
    else if (c === ":" && depth === 0 && rest[i + 1] !== "=") {
      firstColon = i;
      break;
    }
  }

  if (firstColon < 0) {
    return { name, params: rest.trim(), conclusion: "", proof: "" };
  }

  const params = rest.slice(0, firstColon).trim();
  const afterColon = rest.slice(firstColon + 1);
  const proofIdx = afterColon.indexOf(":=");
  if (proofIdx < 0) {
    return { name, params, conclusion: afterColon.trim(), proof: "" };
  }
  const conclusion = afterColon.slice(0, proofIdx).trim();
  const proof = afterColon.slice(proofIdx + 2).trim();
  return { name, params, conclusion, proof };
}

// ---------------------------------------------------------------------------
// Starter template — same signature, body replaced with `sorry`.

export function makeStarterTemplate(lean4: string): string {
  const sig = parseLeanTheorem(lean4);
  if (!sig.name && !sig.conclusion) return lean4;
  const paramsBlock = sig.params ? ` ${sig.params}` : "";
  return [
    `theorem ${sig.name}${paramsBlock} : ${sig.conclusion} := by`,
    `  sorry  -- YOUR PROOF HERE`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Forge-friendly EML version of a Lean theorem.
//
// Best-effort: a small set of theorems have natural EML-lang
// counterparts (eml_is_exp, exp_is_eml). For others, emit a generic
// scaffold and a TODO. The export is meant as a starting point, not
// a guaranteed-compilable file.

export function makeForgeExport(record: PetalRecord): string {
  const id = record.theorem_id;
  // Hand-curated mappings for theorems that have a natural EML
  // function form. Everything else falls through to the generic
  // template.
  switch (id) {
    case "eml_is_exp":
    case "exp_is_eml":
      return [
        `// Auto-generated from Monogate Learn (${id})`,
        `// theorem: eml(x, 1) = exp(x)`,
        `module learn_${id};`,
        ``,
        `fn ${id}_check(x: f64) -> f64`,
        `    where chain_order <= 1`,
        `{`,
        `    eml(x, 1.0)        // = exp(x) - ln(1) = exp(x)`,
        `}`,
        ``,
      ].join("\n");
    case "depth_of_const":
      return [
        `// Auto-generated from Monogate Learn (${id})`,
        `// theorem: depth of any constant = 0`,
        `module learn_${id};`,
        ``,
        `const C: f64 = 1.0;`,
        ``,
        `fn ${id}_witness() -> f64`,
        `    where chain_order <= 0`,
        `{`,
        `    C    // a bare constant has chain_order 0`,
        `}`,
        ``,
      ].join("\n");
    case "depth_of_var":
      return [
        `// Auto-generated from Monogate Learn (${id})`,
        `// theorem: depth of x.var = 0`,
        `module learn_${id};`,
        ``,
        `fn ${id}_witness(x: f64) -> f64`,
        `    where chain_order <= 0`,
        `{`,
        `    x    // a variable alone has chain_order 0`,
        `}`,
        ``,
      ].join("\n");
    case "expTree_depth":
      return [
        `// Auto-generated from Monogate Learn (${id})`,
        `// theorem: expTree (= exp(x)) has depth 1`,
        `module learn_${id};`,
        ``,
        `fn ${id}_witness(x: f64) -> f64`,
        `    where chain_order <= 1`,
        `{`,
        `    exp(x)`,
        `}`,
        ``,
      ].join("\n");
  }
  return [
    `// Auto-generated from Monogate Learn (${id})`,
    `// ${record.statement.natural_language}`,
    `// TODO: provide an EML-lang witness for this theorem.`,
    `module learn_${id};`,
    ``,
    `fn ${id}_todo(x: f64) -> f64`,
    `{`,
    `    x    // placeholder`,
    `}`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Progressive hints
//
// Synthesizes a 4-level hint progression from the existing PETAL
// fields. Level 1 names the family, Level 2 names a candidate
// tactic, Level 3 reveals the rationale, Level 4 reveals the full
// solution. Pre-Lean-API the same data drives the inline tactic
// validator.

export interface Hint {
  level: number;
  body: string;
}

export function getProgressiveHints(record: PetalRecord): Hint[] {
  const steps = record.proof.lean4_step_by_step;
  if (steps.length === 0) {
    return [
      { level: 1, body: "Look at the statement and try the simplest tactic." },
      { level: 2, body: "Recall the tactics this lane introduces." },
      { level: 3, body: "Inspect the source link and read the actual proof." },
      { level: 4, body: record.proof.lean4_full },
    ];
  }
  const firstStep = steps[0];
  const lane = record.lane;
  const tacticsHere = LANE_TACTICS[lane] ?? [];
  return [
    {
      level: 1,
      body: `This proof uses ${steps.length} step${steps.length === 1 ? "" : "s"}.` +
        ` Start with one of Lane ${lane}'s tactics: ${tacticsHere.slice(0, 4).join(", ")}.`,
    },
    {
      level: 2,
      body: `Try \`${firstStep.tactic}\` first.`,
    },
    {
      level: 3,
      body: firstStep.tactic_rationale ||
        `${firstStep.tactic} works because: ${firstStep.explanation}`,
    },
    {
      level: 4,
      body: record.proof.lean4_full,
    },
  ];
}

// ---------------------------------------------------------------------------
// Tactic step lookup — used by the inline validator. Given a tactic
// the user typed and the record, return whether it matches the
// expected next step, the goal-state hint, and any common-mistake
// guidance.

export interface TacticMatch {
  matched: boolean;
  stepIndex: number;
  expected: string;
  explanation: string;
  rationale: string;
  commonMistakes: string[];
  isFinalStep: boolean;
}

export function checkTactic(
  record: PetalRecord,
  userTactic: string,
  stepIndex: number,
): TacticMatch | null {
  const steps = record.proof.lean4_step_by_step;
  const step = steps[stepIndex];
  if (!step) return null;
  const norm = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ");
  const matched = norm(step.tactic) === norm(userTactic);
  return {
    matched,
    stepIndex,
    expected: step.tactic,
    explanation: step.explanation,
    rationale: step.tactic_rationale,
    commonMistakes: step.common_mistakes ?? [],
    isFinalStep: stepIndex === steps.length - 1,
  };
}

// ---------------------------------------------------------------------------
// Forge profile chips — chain order + cost class. PETAL records keep
// these on `metadata` when known. Many Lane 1 records have null cost
// classes (the proof is structural, not numerical); show the chip
// only when the value is meaningful.

export interface ProfileChip {
  label: string;
  value: string;
  emphasis?: "low" | "high";
}

export function getProfileChips(record: PetalRecord): ProfileChip[] {
  const out: ProfileChip[] = [];
  const m = record.metadata as Record<string, unknown>;
  const costClass = m.cost_class as string | null | undefined;
  if (costClass) out.push({ label: "cost class", value: costClass });
  const chainOrder = m.chain_order as number | string | null | undefined;
  if (chainOrder !== null && chainOrder !== undefined) {
    out.push({ label: "chain order", value: String(chainOrder) });
  }
  const tacticsIntro = m.tactics_introduced as string[] | undefined;
  if (Array.isArray(tacticsIntro) && tacticsIntro.length > 0) {
    out.push({
      label: "introduces",
      value: tacticsIntro.join(" · "),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Lean-line normalizer — pretty-prints a multi-line Lean snippet
// with consistent indentation for monospace display.

export function normalizeLean(src: string): string {
  return src
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((ln) => ln.replace(/\s+$/, ""))
    .join("\n")
    .trim();
}
