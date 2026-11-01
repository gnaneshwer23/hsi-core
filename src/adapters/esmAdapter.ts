/**
 * P3.3 thin FAIR ESM-2 embedding stub — ModelProposalArtifacts + embedding sidecar refs.
 *
 * MIT FAIR facebookresearch/esm / research_ok_documented; blockedUntilSignOff=false.
 * Scoped to archived FAIR ESM-2 (not EvolutionaryScale ESM-3/ESMC).
 * Hash/ref sidecars only — never vendor multi-GB weights; never PHI sequences.
 * Optional live `esm` import via Python subprocess; otherwise deterministic stub.
 * Never sets hsiGrade / autoApprove / partnerSigned; no PHI; no CDS.
 * Boltz weights path remains deferred.
 *
 * See docs/P3_ADAPTER_RFC.md · EDGE_EMBEDDING_SLOT_SCHEMA.
 */
import { spawnSync } from "node:child_process";
import {
  assertSafeEmbeddingSidecar,
  contentHashOfPayload,
  type EdgeEmbeddingSidecar,
  type EmbeddingSidecarMapping,
} from "../embeddingSidecar";
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";

export const ESM_ADAPTER_ID = "adapter-esm" as const;
export const ESM_ADAPTER_EXPORT_SCHEMA =
  "hsi-esm-adapter-proposals-1" as const;
export const ESM_ADAPTER_RUNTIME_SCHEMA =
  "hsi-esm-adapter-runtime-1" as const;

/** FAIR ESM-2 shelf label — no weights vendored in-repo. */
export const ESM2_MODEL_ID = "fair-esm2/stub-t33-650M-UR50D" as const;
/** Canonical ESM-2 t33 embedding dim (hash/ref only — floats not vendored). */
export const ESM2_EMBED_DIM = 1280 as const;

export type EsmRuntime = "stub" | "esm";

export type EsmSequenceFixture = {
  fixtureId: string;
  label: string;
  /**
   * Short public UniProt / research AA fragment only —
   * never clinic / identifiable / patient sequences.
   */
  sequenceAa: string;
  /** UniProt accession for citation (public catalog). */
  uniprotAccession: string;
  packHint: string;
  edgeHint: string;
  edgeId: string;
  proposedObject: string;
  contextFrame: string;
};

/**
 * Deterministic public research fixtures:
 * - TNF fragment → RA TNF pathway neighbourhood (HSI-E-RA-001)
 * - FOXP3 fragment → mucosal Treg / SCFA neighbourhood (HSI-E-GUT-003)
 *
 * Sequences are short public UniProt fragments (sandbox drafts only).
 */
export const ESM_PUBLIC_SEQUENCE_FIXTURES: readonly EsmSequenceFixture[] = [
  {
    fixtureId: "tnf",
    label: "TNF-α public fragment → RA pathway embedding",
    // Human TNF (P01375) mature N-terminal stretch — public UniProt, not PHI.
    sequenceAa: "VRSSSRTPSDKPVAHVVANPQAEGQLQWLNRRANALLANG",
    uniprotAccession: "P01375",
    packHint: "pack:hsi-pilot-evidence-pack",
    edgeHint: "edge:HSI-E-RA-001",
    edgeId: "HSI-E-RA-001",
    proposedObject:
      "research FAIR ESM-2 embedding sidecar slot for TNF pathway neighbourhood (hash/ref only; not a grade; not CDS)",
    contextFrame:
      "P3.3 FAIR ESM-2 spike — protein-language embedding draft from public TNF UniProt fragment tied to seeded RA TNF edge. Similarity ≠ mechanism; not partnerSigned; no weight vendoring.",
  },
  {
    fixtureId: "foxp3",
    label: "FOXP3 public fragment → mucosal Treg embedding",
    // Human FOXP3 (Q9BZS1) short public fragment — Treg framing only.
    sequenceAa: "MPNPRPGKPSAPSLALGPSPGASPSWRAAPKASDLLGARG",
    uniprotAccession: "Q9BZS1",
    packHint: "pack:hsi-gut-immune-pack",
    edgeHint: "edge:HSI-E-GUT-003",
    edgeId: "HSI-E-GUT-003",
    proposedObject:
      "research FAIR ESM-2 embedding sidecar slot for FOXP3/Treg neighbourhood near SCFA↔Treg framing (hypothesized only)",
    contextFrame:
      "P3.3 FAIR ESM-2 spike — protein-language embedding draft from public FOXP3 UniProt fragment tied to gut–immune pack. Not a therapeutic claim; hypothesized only; cosine ≠ mechanism.",
  },
] as const;

export type EsmEmbeddingSnapshot = {
  fixtureId: string;
  label: string;
  sequenceAa: string;
  uniprotAccession: string;
  edgeId: string;
  modelId: typeof ESM2_MODEL_ID;
  dim: typeof ESM2_EMBED_DIM;
  /** Mean-pool L2 norm placeholder 0–1 (stub or import-derived; not clinical). */
  meanPoolNorm: number;
  /** Sequence length (AA). */
  sequenceLength: number;
  /** Engine label when live import; stub otherwise. */
  engine: string;
  contentHash: string;
  vectorRef: string;
  runtime: EsmRuntime;
};

/**
 * Literature-stable stub embedding metrics (deterministic; no ESM required).
 * Approximate public research placeholders — not clinical claims.
 */
export const ESM_STUB_METRICS: Record<
  string,
  Omit<
    EsmEmbeddingSnapshot,
    | "runtime"
    | "fixtureId"
    | "label"
    | "sequenceAa"
    | "uniprotAccession"
    | "edgeId"
    | "modelId"
    | "dim"
    | "engine"
    | "contentHash"
    | "vectorRef"
    | "sequenceLength"
  >
> = {
  tnf: { meanPoolNorm: 0.714 },
  foxp3: { meanPoolNorm: 0.681 },
};

export type EsmAdapterBundle = {
  schemaVersion: typeof ESM_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof ESM_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof ESM_ADAPTER_ID;
  runtime: EsmRuntime;
  notCds: true;
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  emitsEmbeddingSidecarRefs: true;
  containsPhi: false;
  partnerSigned: false;
  neverClinicRecommendationPath: true;
  /** false once P3.5 Boltz stub is unblocked under WEIGHTS_POLICY_ACK (still no weight vendoring). */
  boltzDeferred: false;
  licenseGate: {
    adapterId: typeof ESM_ADAPTER_ID;
    signOffStatus: "research_ok_documented";
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  embeddings: EsmEmbeddingSnapshot[];
  /** edgeId → P2.2-compatible sidecar (hash/ref; doesNotSetHsiGrade). */
  sidecarsByEdgeId: EmbeddingSidecarMapping;
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function stubContentHash(fixtureId: string, sequenceAa: string): string {
  return contentHashOfPayload(
    `esm2-stub:${fixtureId}:${sequenceAa}:${ESM2_MODEL_ID}`,
  );
}

function stubVectorRef(edgeId: string): string {
  return `omit://fair-esm2/stub/${edgeId}`;
}

/**
 * Try optional FAIR `esm` package via python3; return null if unavailable.
 * Import-only path — never downloads multi-GB ESM-2 weights.
 * Metrics are deterministic from sequence length when esm is present.
 */
export function tryComputeEsmMetrics(
  sequenceAa: string,
): Omit<
  EsmEmbeddingSnapshot,
  | "fixtureId"
  | "label"
  | "sequenceAa"
  | "uniprotAccession"
  | "edgeId"
  | "modelId"
  | "dim"
  | "runtime"
  | "contentHash"
  | "vectorRef"
> | null {
  const py = `
import json, sys
try:
    import esm  # noqa: F401 — presence check only; no weight download
    engine = "esm-import"
except Exception:
    sys.exit(2)

seq = sys.argv[1]
# Deterministic sandbox scores from public AA string — no model load.
slen = max(1, len(seq))
# Pseudo mean-pool L2 in (0,1) from length + residue alphabet hash.
alphabet = "ACDEFGHIKLMNPQRSTVWY"
idx_sum = sum((alphabet.find(c.upper()) + 1) for c in seq if c.upper() in alphabet)
mean_pool_norm = min(0.95, 0.4 + (slen % 23) / 50.0 + (idx_sum % 97) / 400.0)
print(json.dumps({
    "meanPoolNorm": float(mean_pool_norm),
    "sequenceLength": int(slen),
    "engine": engine,
}))
`.trim();

  const result = spawnSync("python3", ["-c", py, sequenceAa], {
    encoding: "utf8",
    timeout: 20_000,
  });
  if (result.status !== 0 || !result.stdout?.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout.trim()) as {
      meanPoolNorm: number;
      sequenceLength: number;
      engine: string;
    };
    if (
      typeof parsed.meanPoolNorm !== "number" ||
      typeof parsed.sequenceLength !== "number" ||
      typeof parsed.engine !== "string"
    ) {
      return null;
    }
    return {
      meanPoolNorm: round3(parsed.meanPoolNorm),
      sequenceLength: parsed.sequenceLength,
      engine: parsed.engine,
    };
  } catch {
    return null;
  }
}

export function resolveEsmEmbedding(
  fixture: EsmSequenceFixture,
  opts?: { preferRuntime?: EsmRuntime; forceStub?: boolean },
): EsmEmbeddingSnapshot {
  const stubBase = ESM_STUB_METRICS[fixture.fixtureId];
  if (!stubBase) {
    throw new Error(`Missing stub metrics for fixture ${fixture.fixtureId}`);
  }

  const contentHash = stubContentHash(fixture.fixtureId, fixture.sequenceAa);
  const vectorRef = stubVectorRef(fixture.edgeId);
  const sequenceLength = fixture.sequenceAa.length;

  if (opts?.forceStub || opts?.preferRuntime === "stub") {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      sequenceAa: fixture.sequenceAa,
      uniprotAccession: fixture.uniprotAccession,
      edgeId: fixture.edgeId,
      modelId: ESM2_MODEL_ID,
      dim: ESM2_EMBED_DIM,
      ...stubBase,
      sequenceLength,
      engine: "stub",
      contentHash,
      vectorRef,
      runtime: "stub",
    };
  }

  const live = tryComputeEsmMetrics(fixture.sequenceAa);
  if (live) {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      sequenceAa: fixture.sequenceAa,
      uniprotAccession: fixture.uniprotAccession,
      edgeId: fixture.edgeId,
      modelId: ESM2_MODEL_ID,
      dim: ESM2_EMBED_DIM,
      ...live,
      contentHash,
      vectorRef,
      runtime: "esm",
    };
  }

  return {
    fixtureId: fixture.fixtureId,
    label: fixture.label,
    sequenceAa: fixture.sequenceAa,
    uniprotAccession: fixture.uniprotAccession,
    edgeId: fixture.edgeId,
    modelId: ESM2_MODEL_ID,
    dim: ESM2_EMBED_DIM,
    ...stubBase,
    sequenceLength,
    engine: "stub",
    contentHash,
    vectorRef,
    runtime: "stub",
  };
}

function embeddingToSidecar(
  fixture: EsmSequenceFixture,
  embedding: EsmEmbeddingSnapshot,
  createdAt: string,
): EdgeEmbeddingSidecar {
  const built: EdgeEmbeddingSidecar = {
    modelId: embedding.modelId,
    weightsHash: "sha256:fair-esm2-weights-not-vendored",
    dim: embedding.dim,
    vectorRef: embedding.vectorRef,
    contentHash: embedding.contentHash,
    createdAt,
    doesNotSetHsiGrade: true,
    mayFlipEvidenceGrade: false,
    autoApprove: false,
    autoApproveIntoKg: false,
    invalidatesOnModelBump: true,
    notes: [
      `P3.3 FAIR ESM-2 sidecar for ${fixture.edgeId}`,
      `runtime=${embedding.runtime}`,
      `uniprot=${fixture.uniprotAccession}`,
      `meanPoolNorm=${embedding.meanPoolNorm}`,
      "hash/ref only — does not set hsiGrade; packs remain authority.",
    ].join("; "),
  };
  const safety = assertSafeEmbeddingSidecar(
    built as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `ESM adapter produced unsafe sidecar for ${fixture.edgeId}: ${safety.reason}`,
    );
  }
  return built;
}

export function embeddingToModelProposal(
  fixture: EsmSequenceFixture,
  embedding: EsmEmbeddingSnapshot,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-ESM2-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: ESM_ADAPTER_ID,
    proposedSubject: `${fixture.label} (public UniProt fragment)`,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      `runtime=${embedding.runtime}`,
      `embedding: meanPoolNorm=${embedding.meanPoolNorm}; dim=${embedding.dim}; engine=${embedding.engine}; seqLen=${embedding.sequenceLength}; contentHash=${embedding.contentHash}`,
      "ModelProposalArtifact + embedding sidecar ref only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `uniprot:${fixture.uniprotAccession}`,
      `sequenceLen:${fixture.sequenceAa.length}`,
      `vectorRef:${embedding.vectorRef}`,
      `contentHash:${embedding.contentHash}`,
      `runtime:${embedding.runtime}`,
      "adapter:adapter-esm",
      "axis:protein-language-embedding",
      "vendorsModelWeights:false",
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
      `ESM adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

/**
 * Run the thin FAIR ESM-2 adapter (license-gated).
 * Defaults to stub when esm Python package is absent.
 */
export function runEsmAdapter(opts?: {
  generatedAt?: string;
  forceStub?: boolean;
  preferRuntime?: EsmRuntime;
}): EsmAdapterBundle {
  const licenseRow = assertP3AdapterRunnable(ESM_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();

  const embeddings = ESM_PUBLIC_SEQUENCE_FIXTURES.map((f) =>
    resolveEsmEmbedding(f, {
      forceStub: opts?.forceStub,
      preferRuntime: opts?.preferRuntime,
    }),
  );

  const runtime: EsmRuntime = embeddings.every((e) => e.runtime === "esm")
    ? "esm"
    : "stub";

  const sidecarsByEdgeId: EmbeddingSidecarMapping = {};
  for (let i = 0; i < ESM_PUBLIC_SEQUENCE_FIXTURES.length; i++) {
    const fixture = ESM_PUBLIC_SEQUENCE_FIXTURES[i]!;
    const embedding = embeddings[i]!;
    sidecarsByEdgeId[fixture.edgeId] = embeddingToSidecar(
      fixture,
      embedding,
      generatedAt,
    );
  }

  const proposals = ESM_PUBLIC_SEQUENCE_FIXTURES.map((f, i) =>
    embeddingToModelProposal(f, embeddings[i]!, generatedAt),
  );

  return {
    schemaVersion: ESM_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: ESM_ADAPTER_RUNTIME_SCHEMA,
    adapterId: ESM_ADAPTER_ID,
    runtime,
    notCds: true,
    autoApprove: false,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    emitsEmbeddingSidecarRefs: true,
    containsPhi: false,
    partnerSigned: false,
    neverClinicRecommendationPath: true,
    boltzDeferred: false,
    licenseGate: {
      adapterId: ESM_ADAPTER_ID,
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    embeddings,
    sidecarsByEdgeId,
    proposals,
    instructions: [
      "P3.3 FAIR ESM-2 thin embedding stub — ModelProposalArtifacts + embedding sidecar refs → Gate C pending.",
      "Scoped to archived FAIR ESM (MIT); EvolutionaryScale ESM-3/ESMC = separate review — not this adapter.",
      "License gate: refuse adapters with blockedUntilSignOff=true (this row is research_ok_documented / MIT FAIR).",
      "runtime=stub when esm Python is absent; runtime=esm when python3+esm import succeeds (import-only; no multi-GB weights).",
      "Emit hash/ref sidecars only (P2.2 schema); never vendor weights; never PHI / clinic sequences.",
      "Boltz unblocked under WEIGHTS_POLICY_ACK (docs/P3_WEIGHTS_AND_LICENSE_POLICY.md); still no multi-GB weight vendoring.",
      "Never set hsiGrade / curationReview / autoApprove / partnerSigned=true.",
      "No PHI · no CDS · similarity ≠ mechanism · packs remain evidence authority.",
      "See docs/P3_ADAPTER_RFC.md · src/adapters/esmAdapter.ts.",
    ],
  };
}

export function buildEsmAdapterProposals(opts?: {
  createdAt?: string;
  forceStub?: boolean;
}): ModelProposalArtifact[] {
  return runEsmAdapter({
    generatedAt: opts?.createdAt,
    forceStub: opts?.forceStub ?? true,
  }).proposals;
}

export function buildEsmAdapterSidecars(opts?: {
  createdAt?: string;
  forceStub?: boolean;
}): EmbeddingSidecarMapping {
  return runEsmAdapter({
    generatedAt: opts?.createdAt,
    forceStub: opts?.forceStub ?? true,
  }).sidecarsByEdgeId;
}

export function serializeEsmAdapterBundle(
  bundle: EsmAdapterBundle = runEsmAdapter({ forceStub: true }),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeEsmAdapterMarkdown(
  bundle: EsmAdapterBundle = runEsmAdapter({ forceStub: true }),
): string {
  const lines: string[] = [
    "# HSI FAIR ESM-2 adapter proposals (P3.3 spike)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    "> ModelProposalArtifacts + embedding sidecar refs. Gate C pending. autoApprove=false. does not set hsiGrade. notCds. partnerSigned=false. No weight vendoring. Boltz unblocked under WEIGHTS_POLICY_ACK. Similarity ≠ mechanism.",
    "",
    "## License gate",
    "",
    `- adapterId: \`${bundle.licenseGate.adapterId}\``,
    `- signOffStatus: ${bundle.licenseGate.signOffStatus}`,
    `- blockedUntilSignOff: ${bundle.licenseGate.blockedUntilSignOff}`,
    `- docs: ${bundle.licenseGate.docsUrl}`,
    "",
    "## Embeddings (hash/ref)",
    "",
    "| Fixture | edgeId | meanPoolNorm | dim | engine | runtime |",
    "|---------|--------|--------------|-----|--------|---------|",
    ...bundle.embeddings.map(
      (e) =>
        `| ${e.label} (\`${e.fixtureId}\`) | \`${e.edgeId}\` | ${e.meanPoolNorm} | ${e.dim} | ${e.engine} | ${e.runtime} |`,
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
