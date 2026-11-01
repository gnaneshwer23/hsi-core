/**
 * P3.2 thin REINVENT4 adapter spike — ModelProposalArtifacts only.
 *
 * Apache-2.0 / research_ok_documented; blockedUntilSignOff=false.
 * Generative design sandbox only — never clinic recommendation path;
 * never auto-promote designs into graded KG; no multi-GB weight vendoring.
 * Optional live reinvent import via Python subprocess; otherwise deterministic stub.
 * Never sets hsiGrade / autoApprove / partnerSigned; no PHI; no CDS.
 *
 * See docs/P3_ADAPTER_RFC.md.
 */
import { spawnSync } from "node:child_process";
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";

export const REINVENT4_ADAPTER_ID = "adapter-reinvent4" as const;
export const REINVENT4_ADAPTER_EXPORT_SCHEMA =
  "hsi-reinvent4-adapter-proposals-1" as const;
export const REINVENT4_ADAPTER_RUNTIME_SCHEMA =
  "hsi-reinvent4-adapter-runtime-1" as const;

export type Reinvent4Runtime = "stub" | "reinvent";

export type Reinvent4SeedFixture = {
  fixtureId: string;
  label: string;
  /** Public research seed SMILES only — never clinic / identifiable sequences. */
  seedSmiles: string;
  /** Deterministic sandbox candidate SMILES (not a dosing / CDS claim). */
  candidateSmiles: string;
  /** Pack / edge citation context for proposal evidenceHints. */
  packHint: string;
  edgeHint: string;
  proposedObject: string;
  contextFrame: string;
};

/**
 * Deterministic public research fixtures:
 * - MTX seed → RA ATTRACT/MTX combo neighbourhood (HSI-E-RA-012)
 * - butyrate seed → mucosal SCFA neighbourhood (HSI-E-GUT-003)
 *
 * Candidate SMILES are fixed sandbox drafts (not live generative model output).
 */
export const REINVENT4_PUBLIC_SEED_FIXTURES: readonly Reinvent4SeedFixture[] = [
  {
    fixtureId: "mtx",
    label: "Methotrexate seed → sandbox analogue",
    seedSmiles:
      "CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)N[C@@H](CCC(=O)O)C(=O)O)cc1",
    // Public research-shaped pteridine fragment (sandbox draft only).
    candidateSmiles: "Nc1nc(N)c2nc(CNc3ccc(C(=O)O)cc3)cnc2n1",
    packHint: "pack:hsi-pilot-evidence-pack",
    edgeHint: "edge:HSI-E-RA-012",
    proposedObject:
      "research generative design sandbox candidate near ATTRACT/MTX chemotype neighbourhood (not dosing, not CDS)",
    contextFrame:
      "P3.2 REINVENT4 spike — generative sandbox draft from public MTX seed SMILES tied to seeded ATTRACT/MTX combo edge. Never clinic recommendation path; generative designs never auto-promote into graded KG; not partnerSigned.",
  },
  {
    fixtureId: "butyrate",
    label: "Butyrate seed → SCFA neighbour sandbox",
    seedSmiles: "CCCC(=O)O",
    // Public SCFA neighbour (valeric / pentanoic acid) — hypothesized framing only.
    candidateSmiles: "CCCCC(=O)O",
    packHint: "pack:hsi-gut-immune-pack",
    edgeHint: "edge:HSI-E-GUT-003",
    proposedObject:
      "research generative sandbox SCFA neighbour chemotype for mucosal SCFA↔Treg framing (hypothesized only)",
    contextFrame:
      "P3.2 REINVENT4 spike — generative sandbox draft from public butyrate seed SMILES tied to gut–immune pack. Not a therapeutic claim; hypothesized only; never clinic path.",
  },
] as const;

export type Reinvent4DesignSnapshot = {
  fixtureId: string;
  label: string;
  seedSmiles: string;
  candidateSmiles: string;
  /** Sandbox desirability score 0–1 (stub or import-derived; not clinical efficacy). */
  desirability: number;
  /** Sandbox novelty score 0–1. */
  novelty: number;
  /** Approximate seed↔candidate similarity 0–1. */
  seedSimilarity: number;
  /** Engine label when live import; stub otherwise. */
  engine: string;
  runtime: Reinvent4Runtime;
};

/**
 * Literature-stable stub generative sandbox metrics (deterministic; no REINVENT required).
 * Approximate public research placeholders — not clinical claims / not dosing.
 */
export const REINVENT4_STUB_METRICS: Record<
  string,
  Omit<
    Reinvent4DesignSnapshot,
    | "runtime"
    | "fixtureId"
    | "label"
    | "seedSmiles"
    | "candidateSmiles"
    | "engine"
  >
> = {
  mtx: { desirability: 0.62, novelty: 0.41, seedSimilarity: 0.58 },
  butyrate: { desirability: 0.55, novelty: 0.33, seedSimilarity: 0.72 },
};

export type Reinvent4AdapterBundle = {
  schemaVersion: typeof REINVENT4_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof REINVENT4_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof REINVENT4_ADAPTER_ID;
  runtime: Reinvent4Runtime;
  notCds: true;
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  containsPhi: false;
  partnerSigned: false;
  neverClinicRecommendationPath: true;
  licenseGate: {
    adapterId: typeof REINVENT4_ADAPTER_ID;
    signOffStatus: "research_ok_documented";
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  designs: Reinvent4DesignSnapshot[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Try optional REINVENT4 package via python3; return null if unavailable.
 * Import-only path — never downloads multi-GB generative weights.
 * Scores are deterministic from SMILES lengths when invent is present.
 */
export function tryComputeReinvent4Metrics(
  seedSmiles: string,
  candidateSmiles: string,
): Omit<
  Reinvent4DesignSnapshot,
  "fixtureId" | "label" | "seedSmiles" | "candidateSmiles" | "runtime"
> | null {
  const py = `
import json, sys
try:
    import reinvent  # noqa: F401 — presence check only; no weight download
    engine = "reinvent-import"
except Exception:
    try:
        import reinvent4  # noqa: F401
        engine = "reinvent4-import"
    except Exception:
        sys.exit(2)

seed = sys.argv[1]
cand = sys.argv[2]
# Deterministic sandbox scores from public SMILES strings — no model load.
slen = max(1, len(seed))
clen = max(1, len(cand))
shared = sum(1 for a, b in zip(seed, cand) if a == b)
seed_sim = shared / max(slen, clen)
desirability = min(0.95, 0.35 + (clen % 17) / 40.0 + seed_sim * 0.2)
novelty = min(0.95, 0.2 + abs(clen - slen) / 50.0 + (1.0 - seed_sim) * 0.3)
print(json.dumps({
    "desirability": float(desirability),
    "novelty": float(novelty),
    "seedSimilarity": float(seed_sim),
    "engine": engine,
}))
`.trim();

  const result = spawnSync(
    "python3",
    ["-c", py, seedSmiles, candidateSmiles],
    {
      encoding: "utf8",
      timeout: 20_000,
    },
  );
  if (result.status !== 0 || !result.stdout?.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout.trim()) as {
      desirability: number;
      novelty: number;
      seedSimilarity: number;
      engine: string;
    };
    if (
      typeof parsed.desirability !== "number" ||
      typeof parsed.novelty !== "number" ||
      typeof parsed.seedSimilarity !== "number" ||
      typeof parsed.engine !== "string"
    ) {
      return null;
    }
    return {
      desirability: round3(parsed.desirability),
      novelty: round3(parsed.novelty),
      seedSimilarity: round3(parsed.seedSimilarity),
      engine: parsed.engine,
    };
  } catch {
    return null;
  }
}

export function resolveReinvent4Design(
  fixture: Reinvent4SeedFixture,
  opts?: { preferRuntime?: Reinvent4Runtime; forceStub?: boolean },
): Reinvent4DesignSnapshot {
  const stubBase = REINVENT4_STUB_METRICS[fixture.fixtureId];
  if (!stubBase) {
    throw new Error(`Missing stub metrics for fixture ${fixture.fixtureId}`);
  }

  if (opts?.forceStub || opts?.preferRuntime === "stub") {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      seedSmiles: fixture.seedSmiles,
      candidateSmiles: fixture.candidateSmiles,
      ...stubBase,
      engine: "stub",
      runtime: "stub",
    };
  }

  const live = tryComputeReinvent4Metrics(
    fixture.seedSmiles,
    fixture.candidateSmiles,
  );
  if (live) {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      seedSmiles: fixture.seedSmiles,
      candidateSmiles: fixture.candidateSmiles,
      ...live,
      runtime: "reinvent",
    };
  }

  return {
    fixtureId: fixture.fixtureId,
    label: fixture.label,
    seedSmiles: fixture.seedSmiles,
    candidateSmiles: fixture.candidateSmiles,
    ...stubBase,
    engine: "stub",
    runtime: "stub",
  };
}

export function designToModelProposal(
  fixture: Reinvent4SeedFixture,
  design: Reinvent4DesignSnapshot,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-REINVENT4-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: REINVENT4_ADAPTER_ID,
    proposedSubject: `${fixture.label} (public seed SMILES)`,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      `runtime=${design.runtime}`,
      `design: desirability=${design.desirability}; novelty=${design.novelty}; seedSimilarity=${design.seedSimilarity}; engine=${design.engine}; candidate=${design.candidateSmiles}`,
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `seedSmiles:${fixture.seedSmiles}`,
      `candidateSmiles:${fixture.candidateSmiles}`,
      `runtime:${design.runtime}`,
      "adapter:adapter-reinvent4",
      "axis:generative-design-sandbox",
      "neverClinicRecommendationPath:true",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `REINVENT4 adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

/**
 * Run the thin REINVENT4 adapter (license-gated).
 * Defaults to stub when reinvent Python package is absent.
 */
export function runReinvent4Adapter(opts?: {
  generatedAt?: string;
  forceStub?: boolean;
  preferRuntime?: Reinvent4Runtime;
}): Reinvent4AdapterBundle {
  const licenseRow = assertP3AdapterRunnable(REINVENT4_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();

  const designs = REINVENT4_PUBLIC_SEED_FIXTURES.map((f) =>
    resolveReinvent4Design(f, {
      forceStub: opts?.forceStub,
      preferRuntime: opts?.preferRuntime,
    }),
  );

  // Bundle runtime = reinvent only when every design came from live invent import.
  const runtime: Reinvent4Runtime = designs.every((d) => d.runtime === "reinvent")
    ? "reinvent"
    : "stub";

  const proposals = REINVENT4_PUBLIC_SEED_FIXTURES.map((f, i) =>
    designToModelProposal(f, designs[i]!, generatedAt),
  );

  return {
    schemaVersion: REINVENT4_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: REINVENT4_ADAPTER_RUNTIME_SCHEMA,
    adapterId: REINVENT4_ADAPTER_ID,
    runtime,
    notCds: true,
    autoApprove: false,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    containsPhi: false,
    partnerSigned: false,
    neverClinicRecommendationPath: true,
    licenseGate: {
      adapterId: REINVENT4_ADAPTER_ID,
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    designs,
    proposals,
    instructions: [
      "P3.2 REINVENT4 thin adapter spike — ModelProposalArtifacts only → Gate C pending.",
      "Generative design sandbox only — never clinic recommendation path; never auto-promote into graded KG.",
      "License gate: refuse adapters with blockedUntilSignOff=true (this row is research_ok_documented / Apache-2.0).",
      "runtime=stub when reinvent Python is absent; runtime=reinvent when python3+reinvent import succeeds (import-only; no multi-GB weights).",
      "Boltz weights path deferred (avoid multi-GB download).",
      "Never set hsiGrade / curationReview / autoApprove / partnerSigned=true.",
      "No PHI · no CDS · no multi-GB weight vendoring.",
      "See docs/P3_ADAPTER_RFC.md · src/adapters/reinvent4Adapter.ts.",
    ],
  };
}

export function buildReinvent4AdapterProposals(opts?: {
  createdAt?: string;
  forceStub?: boolean;
}): ModelProposalArtifact[] {
  return runReinvent4Adapter({
    generatedAt: opts?.createdAt,
    forceStub: opts?.forceStub ?? true,
  }).proposals;
}

export function serializeReinvent4AdapterBundle(
  bundle: Reinvent4AdapterBundle = runReinvent4Adapter({ forceStub: true }),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeReinvent4AdapterMarkdown(
  bundle: Reinvent4AdapterBundle = runReinvent4Adapter({ forceStub: true }),
): string {
  const lines: string[] = [
    "# HSI REINVENT4 adapter proposals (P3.2 spike)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    "> ModelProposalArtifacts only. Gate C pending. autoApprove=false. does not set hsiGrade. notCds. partnerSigned=false. Never clinic recommendation path. Generative designs never auto-promote into graded KG.",
    "",
    "## License gate",
    "",
    `- adapterId: \`${bundle.licenseGate.adapterId}\``,
    `- signOffStatus: ${bundle.licenseGate.signOffStatus}`,
    `- blockedUntilSignOff: ${bundle.licenseGate.blockedUntilSignOff}`,
    `- docs: ${bundle.licenseGate.docsUrl}`,
    "",
    "## Designs",
    "",
    "| Fixture | desirability | novelty | seedSimilarity | engine | runtime |",
    "|---------|--------------|---------|----------------|--------|---------|",
    ...bundle.designs.map(
      (d) =>
        `| ${d.label} (\`${d.fixtureId}\`) | ${d.desirability} | ${d.novelty} | ${d.seedSimilarity} | ${d.engine} | ${d.runtime} |`,
    ),
    "",
    "## Proposals",
    "",
    "| Proposal | S — P — O | Teaching | Evidence |",
    "|----------|-----------|----------|----------|",
    ...bundle.proposals.map((p) => {
      const hints = p.evidenceHints.slice(0, 3).join("; ");
      return `| \`${p.proposalId}\` | ${p.proposedSubject} — ${p.proposedPredicate} — ${p.proposedObject} | ${p.suggestedTeachingStatus} | ${hints} |`;
    }),
    "",
    "## Instructions",
    "",
    ...bundle.instructions.map((i) => `- ${i}`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}
