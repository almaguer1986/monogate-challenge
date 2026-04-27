// Type definitions for the PETAL JSON. Mirrors the schema documented
// in monogate-research/petal/seed_v1/PETAL_DATASET_CARD.md.

export interface ProofStep {
  step: number;
  tactic: string;
  explanation: string;
  tactic_rationale: string;
  common_mistakes: string[];
}

export interface RecordStatement {
  natural_language: string;
  latex: string;
  lean4: string;
}

export interface RecordProof {
  lean4_full: string;
  lean4_step_by_step: ProofStep[];
}

export interface RecordSource {
  file: string;
  line: number;
}

export interface PetalRecord {
  theorem_id: string;
  lane: number;
  lane_title: string;
  difficulty: number;
  domain: string;
  statement: RecordStatement;
  proof: RecordProof;
  dependencies: string[];
  unlocks: string[];
  source: RecordSource;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface PetalDataset {
  dataset_version: string;
  schema_version: string;
  generated_at: string;
  source_repo: string;
  records: PetalRecord[];
}

export const LANE_DESCRIPTIONS: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "First Contact",
    subtitle: "Your first Lean proofs. Definitions. rfl.",
  },
  2: {
    title: "Building Blocks",
    subtitle: "Composition, simp, hypothesis-driven rewrites.",
  },
  3: {
    title: "Arithmetic from Nothing",
    subtitle: "Witness extraction. F-family lower bounds. Proof-by-contradiction.",
  },
  4: {
    title: "The Other Operators",
    subtitle: "SuperBEST framework. Multi-operator lower bounds. Synthesis lemmas.",
  },
  5: {
    title: "Into the Complex Plane",
    subtitle: "Universality. EML-elementary. Self-map conjugacies. Mathlib wrappers.",
  },
  6: {
    title: "The Barrier",
    subtitle: "The research frontier. Open problems. Contribute here.",
  },
};

export function ghLink(file: string, line: number): string {
  // Source repo + branch from monogate-lean. Branch is master per the
  // seed v1 dataset card.
  return `https://github.com/agent-maestro/monogate-lean/blob/master/${file}#L${line}`;
}
