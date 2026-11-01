/**
 * Edge embedding sidecar slots (P2.2).
 *
 * NNs may attach retrieval metadata to edges without becoming grades.
 * Prefer vectorRef / contentHash — never vendor multi-GB weights or PHI.
 * See docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md + EDGE_EMBEDDING_SLOT_SCHEMA.
 */
import { createHash } from "node:crypto";
import { EDGE_EMBEDDING_SLOT_SCHEMA } from "./systemsAxes";

export const EMBEDDING_SIDECAR_RUNTIME_SCHEMA =
  "hsi-embedding-sidecar-runtime-1" as const;

export const EMBEDDING_SIDECARS_EXPORT_SCHEMA =
  "hsi-embedding-sidecars-1" as const;

/**
 * Typed sidecar matching EDGE_EMBEDDING_SLOT_SCHEMA.
 * At least one of vectorRef | contentHash is required.
 * Full float arrays stay out of git except optional tiny demos (dim ≤ 16).
 */
export type EdgeEmbeddingSidecar = {
  /** Stable model / encoder id (no weights vendored in-repo). */
  modelId: string;
  /** Optional weights fingerprint when vectors come from a frozen encoder. */
  weightsHash: string | null;
  /** Embedding dimensionality. */
  dim: number;
  /**
   * External vector store / object key, or omit:// when only the hash is published.
   * Prefer this over inlining floats.
   */
  vectorRef: string | null;
  /**
   * Content-addressed fingerprint of the vector bytes (e.g. sha256:…).
   * Use when vectors live outside git.
   */
  contentHash: string | null;
  createdAt: string;
  /** Hard invariant — embeddings never write hsiGrade / curationReview. */
  doesNotSetHsiGrade: true;
  mayFlipEvidenceGrade: false;
  autoApprove: false;
  autoApproveIntoKg: false;
  /** Bump modelId / weightsHash → treat prior sidecars as stale. */
  invalidatesOnModelBump: true;
  /**
   * Optional tiny demo floats for unit/export smoke (dim ≤ 16).
   * Never a production vector store.
   */
  tinyDemoVector?: number[];
  notes?: string;
};

/** edgeId → sidecar metadata (not a parallel truth store). */
export type EmbeddingSidecarMapping = Record<string, EdgeEmbeddingSidecar>;

export type EmbeddingSidecarsBundle = {
  schemaVersion: typeof EMBEDDING_SIDECARS_EXPORT_SCHEMA;
  runtimeSchema: typeof EMBEDDING_SIDECAR_RUNTIME_SCHEMA;
  slotSchemaRef: typeof EDGE_EMBEDDING_SLOT_SCHEMA.schemaVersion;
  notCds: true;
  autoApproveIntoKg: false;
  autoApprove: false;
  doesNotSetHsiGrade: true;
  mayFlipEvidenceGrade: false;
  containsPhi: false;
  vendorsModelWeights: false;
  generatedAt: string;
  summary: {
    edgeCount: number;
    withVectorRef: number;
    withContentHash: number;
    withTinyDemo: number;
    maxTinyDemoDim: number;
  };
  /** edgeId → sidecar (hash/ref preferred). */
  byEdgeId: EmbeddingSidecarMapping;
  instructions: string[];
};

const FORBIDDEN_KEYS = [
  "hsiGrade",
  "curationReview",
  "teachingStatus",
] as const;

const MAX_TINY_DEMO_DIM = 16;

/** Deterministic sha256 fingerprint for tiny demo vectors / payload bytes. */
export function contentHashOfPayload(payload: string | number[]): string {
  const body =
    typeof payload === "string" ? payload : JSON.stringify(payload);
  return `sha256:${createHash("sha256").update(body).digest("hex")}`;
}

/** True when an object looks like a safe sidecar (no grade/auto flips). */
export function assertSafeEmbeddingSidecar(
  value: Record<string, unknown>,
): { ok: true } | { ok: false; reason: string } {
  for (const key of FORBIDDEN_KEYS) {
    if (key in value) {
      return {
        ok: false,
        reason: `Forbidden field "${key}" on embedding sidecar — may not set grades`,
      };
    }
  }
  if (value.doesNotSetHsiGrade !== true) {
    return { ok: false, reason: "doesNotSetHsiGrade must be true" };
  }
  if (value.mayFlipEvidenceGrade === true) {
    return { ok: false, reason: "mayFlipEvidenceGrade must not be true" };
  }
  if (value.autoApprove === true || value.autoApproveIntoKg === true) {
    return { ok: false, reason: "autoApprove / autoApproveIntoKg must be false" };
  }
  if (value.containsPhi === true) {
    return { ok: false, reason: "sidecars must not contain PHI" };
  }
  const dim = value.dim;
  if (typeof dim !== "number" || !Number.isFinite(dim) || dim <= 0) {
    return { ok: false, reason: "dim must be a positive number" };
  }
  const hasRef =
    typeof value.vectorRef === "string" && value.vectorRef.length > 0;
  const hasHash =
    typeof value.contentHash === "string" && value.contentHash.length > 0;
  if (!hasRef && !hasHash) {
    return {
      ok: false,
      reason: "at least one of vectorRef or contentHash is required",
    };
  }
  if (Array.isArray(value.tinyDemoVector)) {
    if (value.tinyDemoVector.length > MAX_TINY_DEMO_DIM) {
      return {
        ok: false,
        reason: `tinyDemoVector length must be ≤ ${MAX_TINY_DEMO_DIM}`,
      };
    }
    if (value.tinyDemoVector.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
      return { ok: false, reason: "tinyDemoVector must be finite numbers" };
    }
  }
  return { ok: true };
}

function sidecar(
  partial: Omit<
    EdgeEmbeddingSidecar,
    | "doesNotSetHsiGrade"
    | "mayFlipEvidenceGrade"
    | "autoApprove"
    | "autoApproveIntoKg"
    | "invalidatesOnModelBump"
  >,
): EdgeEmbeddingSidecar {
  const built: EdgeEmbeddingSidecar = {
    ...partial,
    doesNotSetHsiGrade: true,
    mayFlipEvidenceGrade: false,
    autoApprove: false,
    autoApproveIntoKg: false,
    invalidatesOnModelBump: true,
  };
  const safety = assertSafeEmbeddingSidecar(
    built as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `Refusing unsafe embedding sidecar (${partial.modelId}): ${safety.reason}`,
    );
  }
  return built;
}

/**
 * Illustrative edgeId → sidecar map for publish demos.
 * Sample spans RA / SSc / gut / neuro packs — hash/ref only (+ one tiny demo).
 * Not a trained model; not Gate C approval; not CDS.
 */
export function buildExampleEmbeddingSidecars(opts?: {
  createdAt?: string;
}): EmbeddingSidecarMapping {
  const createdAt = opts?.createdAt ?? new Date().toISOString();
  const demoModel = "hsi-stub-edge-encoder/v0-demo";
  const weightsHash = "sha256:demo-weights-not-vendored";

  // Tiny deterministic demo (dim=8) — sole inlined floats allowed for smoke tests.
  const tinyDemoVector = [0.12, -0.05, 0.33, 0.01, -0.22, 0.18, 0.07, -0.09];
  const tinyHash = contentHashOfPayload(tinyDemoVector);

  return {
    "HSI-E-RA-001": sidecar({
      modelId: demoModel,
      weightsHash,
      dim: 8,
      vectorRef: "omit://demo/HSI-E-RA-001",
      contentHash: tinyHash,
      createdAt,
      tinyDemoVector,
      notes:
        "P2.2 demo sidecar — tinyDemoVector for smoke only; does not set hsiGrade. RA evidence remains pack authority.",
    }),
    "HSI-E-RA-006": sidecar({
      modelId: demoModel,
      weightsHash,
      dim: 384,
      vectorRef: null,
      contentHash: contentHashOfPayload(
        "demo-payload:HSI-E-RA-006:macrophage-tnf-identity",
      ),
      createdAt,
      notes:
        "Hash-only slot (dim=384 placeholder) — no floats in git; cosine ≠ mechanism.",
    }),
    "HSI-E-SSC-001": sidecar({
      modelId: demoModel,
      weightsHash,
      dim: 384,
      vectorRef: "ref://hsi-demo-vectors/ssc/HSI-E-SSC-001",
      contentHash: contentHashOfPayload("demo-payload:HSI-E-SSC-001:tfh-ssc"),
      createdAt,
      notes:
        "Ref + hash for SSc dual-track edge; pack + PMIDs remain evidence authority.",
    }),
    "HSI-E-GUT-003": sidecar({
      modelId: demoModel,
      weightsHash,
      dim: 384,
      vectorRef: "ref://hsi-demo-vectors/gut/HSI-E-GUT-003",
      contentHash: contentHashOfPayload(
        "demo-payload:HSI-E-GUT-003:butyrate-treg",
      ),
      createdAt,
      notes:
        "Gut–immune SCFA→Treg neighbourhood — sidecar is retrieval only; grades stay uncertain/hypothesized.",
    }),
    "HSI-E-NI-001": sidecar({
      modelId: demoModel,
      weightsHash,
      dim: 384,
      vectorRef: null,
      contentHash: contentHashOfPayload(
        "demo-payload:HSI-E-NI-001:vagus-cholinergic",
      ),
      createdAt,
      notes:
        "Neuroimmune vagus reflex — hash only; never overclaim clinical VNS cure from similarity.",
    }),
  };
}

export function buildEmbeddingSidecarsBundle(opts?: {
  generatedAt?: string;
}): EmbeddingSidecarsBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const byEdgeId = buildExampleEmbeddingSidecars({ createdAt: generatedAt });
  const entries = Object.values(byEdgeId);

  return {
    schemaVersion: EMBEDDING_SIDECARS_EXPORT_SCHEMA,
    runtimeSchema: EMBEDDING_SIDECAR_RUNTIME_SCHEMA,
    slotSchemaRef: EDGE_EMBEDDING_SLOT_SCHEMA.schemaVersion,
    notCds: true,
    autoApproveIntoKg: false,
    autoApprove: false,
    doesNotSetHsiGrade: true,
    mayFlipEvidenceGrade: false,
    containsPhi: false,
    vendorsModelWeights: false,
    generatedAt,
    summary: {
      edgeCount: entries.length,
      withVectorRef: entries.filter((s) => Boolean(s.vectorRef)).length,
      withContentHash: entries.filter((s) => Boolean(s.contentHash)).length,
      withTinyDemo: entries.filter((s) => Boolean(s.tinyDemoVector)).length,
      maxTinyDemoDim: MAX_TINY_DEMO_DIM,
    },
    byEdgeId,
    instructions: [
      "Embeddings are sidecar retrieval slots — never substitute for typed predicates or hsiGrade.",
      "Prefer vectorRef + contentHash; do not commit multi-GB weights or large float arrays.",
      "doesNotSetHsiGrade=true · autoApprove=false · autoApproveIntoKg=false · containsPhi=false.",
      "RA/SSc/gut/neuro packs remain evidence authority; similarity ≠ mechanism.",
      "Model bumps invalidate prior sidecars (invalidatesOnModelBump).",
      "Gate C compatibility: sidecars never auto-approve into KG; humans still decide grades.",
      "See docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md · EDGE_EMBEDDING_SLOT_SCHEMA.",
    ],
  };
}

export function serializeEmbeddingSidecars(
  bundle: EmbeddingSidecarsBundle = buildEmbeddingSidecarsBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
