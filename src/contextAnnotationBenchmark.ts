/**
 * RA context-annotation benchmark kit (Phase 6).
 * Empty label stores and validation only — never fabricates SME labels or accuracy claims.
 */
import { createHash } from "node:crypto";
import { parseRaEvidenceRelease, type RaEvidenceRelease } from "./raEvidenceRelease";
import { parseRaResearchEvidenceRelease, type RaResearchEvidenceRelease } from "./raResearchEvidenceRelease";

export const CONTEXT_ANNOTATION_BENCHMARK_VERSION = "hsi-ra-context-annotation-benchmark-1" as const;
export const CONTEXT_ANNOTATION_GUIDELINE_VERSION = "hsi-ra-context-annotation-guideline-1" as const;
export const CONTEXT_ANNOTATION_WORKSHEET_VERSION = "hsi-ra-context-annotation-worksheet-1" as const;

export const REQUIRED_CONTEXT_TAGS = [
  "species",
  "tissue_or_sample",
  "setting_or_model",
  "intervention",
  "outcome",
  "timepoint",
] as const;

export type ContextTagName = (typeof REQUIRED_CONTEXT_TAGS)[number];

export type SpeciesTag = "human" | "mouse" | "other" | "missing" | "mixed";
export type SettingTag =
  | "clinical_observational"
  | "clinical_trial"
  | "meta_analysis"
  | "in_vitro"
  | "in_vivo"
  | "in_silico"
  | "missing"
  | "mixed"
  | "other";

export type BenchmarkPartition = "evaluation_frozen" | "training_candidate" | "practice_not_evaluation";

export type ContextTagSet = {
  species: SpeciesTag | null;
  tissue_or_sample: string | null;
  setting_or_model: SettingTag | null;
  intervention: string | null;
  outcome: string | null;
  timepoint: string | null;
};

export type AnnotationWorksheetRow = {
  rowId: string;
  partition: BenchmarkPartition;
  sourceId: string;
  passageId: string;
  passageSha256: string;
  passageLocator: string;
  sourceVersion: string;
  pmid: string | null;
  pmcid: string | null;
  doi: string | null;
  licenceIdentifier: string | null;
  authors: string[];
  articleTitle: string;
  /** Grounding quote must come from the passage; left empty until an annotator fills it. */
  groundingSpan: string | null;
  tags: ContextTagSet;
  annotatorId: string | null;
  labelledAt: string | null;
  scientificReview: "unreviewed";
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
};

export type IndependentLabelPacket = {
  schemaVersion: typeof CONTEXT_ANNOTATION_BENCHMARK_VERSION;
  packetId: string;
  annotatorSlot: "annotator_a" | "annotator_b";
  /** Blind: packets omit peer labels. */
  doubleBlind: true;
  guidelineVersion: typeof CONTEXT_ANNOTATION_GUIDELINE_VERSION;
  rows: AnnotationWorksheetRow[];
};

export type AdjudicationRecord = {
  rowId: string;
  annotatorATags: ContextTagSet;
  annotatorBTags: ContextTagSet;
  disagreeOn: ContextTagName[];
  finalTags: ContextTagSet | null;
  adjudicatorId: string | null;
  rationale: string | null;
  adjudicatedAt: string | null;
  fabricatedLabelsPermitted: false;
};

export type BenchmarkSplitPolicy = {
  schemaVersion: typeof CONTEXT_ANNOTATION_BENCHMARK_VERSION;
  evaluationShare: number;
  trainingShare: number;
  holdoutShare: number;
  /** Rights-verified release required before evaluation_frozen rows may be minted. */
  evaluationRequiresRightsVerifiedRelease: true;
  practiceRowsCannotEnterEvaluation: true;
  proposedAbstractTarget: 200;
  proposedAccuracyTargetNote: "Proposed milestone only — not a measured result.";
  proposedTimeSavingTargetNote: "Proposed milestone only — not a measured result.";
};

export type ContextAnnotationBenchmarkKit = {
  schemaVersion: typeof CONTEXT_ANNOTATION_BENCHMARK_VERSION;
  guidelineVersion: typeof CONTEXT_ANNOTATION_GUIDELINE_VERSION;
  worksheetSchemaVersion: typeof CONTEXT_ANNOTATION_WORKSHEET_VERSION;
  status: "ready_for_sme_kickoff" | "awaiting_rights_verified_passages";
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
  scientificReview: "unreviewed";
  fabricatedLabelsPermitted: false;
  splitPolicy: BenchmarkSplitPolicy;
  emptyLabelStore: {
    evaluation_frozen: AnnotationWorksheetRow[];
    training_candidate: AnnotationWorksheetRow[];
    practice_not_evaluation: AnnotationWorksheetRow[];
  };
  adjudicationLog: AdjudicationRecord[];
  notes: string[];
};

export class ContextAnnotationBenchmarkError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const emptyTags = (): ContextTagSet => ({
  species: null,
  tissue_or_sample: null,
  setting_or_model: null,
  intervention: null,
  outcome: null,
  timepoint: null,
});

const digest = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);

export function defaultBenchmarkSplitPolicy(): BenchmarkSplitPolicy {
  return {
    schemaVersion: CONTEXT_ANNOTATION_BENCHMARK_VERSION,
    evaluationShare: 0.4,
    trainingShare: 0.4,
    holdoutShare: 0.2,
    evaluationRequiresRightsVerifiedRelease: true,
    practiceRowsCannotEnterEvaluation: true,
    proposedAbstractTarget: 200,
    proposedAccuracyTargetNote: "Proposed milestone only — not a measured result.",
    proposedTimeSavingTargetNote: "Proposed milestone only — not a measured result.",
  };
}

export function emptyContextAnnotationBenchmarkKit(
  status: ContextAnnotationBenchmarkKit["status"] = "awaiting_rights_verified_passages",
): ContextAnnotationBenchmarkKit {
  return {
    schemaVersion: CONTEXT_ANNOTATION_BENCHMARK_VERSION,
    guidelineVersion: CONTEXT_ANNOTATION_GUIDELINE_VERSION,
    worksheetSchemaVersion: CONTEXT_ANNOTATION_WORKSHEET_VERSION,
    status,
    containsPhi: false,
    clinicalAdvice: false,
    kgWrite: false,
    scientificReview: "unreviewed",
    fabricatedLabelsPermitted: false,
    splitPolicy: defaultBenchmarkSplitPolicy(),
    emptyLabelStore: {
      evaluation_frozen: [],
      training_candidate: [],
      practice_not_evaluation: [],
    },
    adjudicationLog: [],
    notes: [
      "SME labels are absent until independent annotators fill worksheet rows.",
      "Do not invent passage text, licence URIs, inter-annotator scores, or accuracy claims.",
      "Frozen evaluation rows require a rights-verified RA evidence release.",
      "Practice rows from the research working set must stay in practice_not_evaluation.",
    ],
  };
}

function assertEmptyTags(tags: ContextTagSet, path: string) {
  for (const key of REQUIRED_CONTEXT_TAGS) {
    if (tags[key] !== null) throw new ContextAnnotationBenchmarkError(`${path}.${key}_must_be_null_until_sme`);
  }
}

export function assertAnnotationRowScaffold(row: AnnotationWorksheetRow): void {
  if (!row.rowId || !row.passageId || !row.sourceId) throw new ContextAnnotationBenchmarkError("row_identity");
  if (row.scientificReview !== "unreviewed") throw new ContextAnnotationBenchmarkError("scientificReview");
  if (row.containsPhi || row.clinicalAdvice || row.kgWrite) throw new ContextAnnotationBenchmarkError("boundary");
  assertEmptyTags(row.tags, row.rowId);
  if (row.annotatorId !== null || row.labelledAt !== null || row.groundingSpan !== null) {
    throw new ContextAnnotationBenchmarkError("scaffold_must_be_unlabelled");
  }
  if (row.partition === "evaluation_frozen" && (!row.pmid || !row.licenceIdentifier)) {
    throw new ContextAnnotationBenchmarkError("evaluation_requires_pmid_and_licence");
  }
  if (row.partition === "practice_not_evaluation" && row.pmid !== null) {
    throw new ContextAnnotationBenchmarkError("practice_must_not_claim_real_pmid");
  }
}

export function assertBenchmarkKitHonesty(kit: ContextAnnotationBenchmarkKit): void {
  if (kit.fabricatedLabelsPermitted) throw new ContextAnnotationBenchmarkError("fabricated_forbidden");
  if (kit.containsPhi || kit.clinicalAdvice || kit.kgWrite) throw new ContextAnnotationBenchmarkError("boundary");
  if (kit.scientificReview !== "unreviewed") throw new ContextAnnotationBenchmarkError("scientificReview");
  for (const partition of ["evaluation_frozen", "training_candidate", "practice_not_evaluation"] as const) {
    for (const row of kit.emptyLabelStore[partition]) {
      if (row.partition !== partition) throw new ContextAnnotationBenchmarkError("partition_mismatch");
      assertAnnotationRowScaffold(row);
    }
  }
  for (const record of kit.adjudicationLog) {
    if (record.fabricatedLabelsPermitted) throw new ContextAnnotationBenchmarkError("adjudication_fabricated");
    if (record.finalTags !== null) throw new ContextAnnotationBenchmarkError("adjudication_must_start_empty");
  }
}

/** Mint unlabelled rows from a rights-verified release for future SME evaluation/training assignment. */
export function scaffoldRowsFromVerifiedRelease(
  releaseInput: unknown,
  partition: "evaluation_frozen" | "training_candidate",
): AnnotationWorksheetRow[] {
  const release: RaEvidenceRelease = parseRaEvidenceRelease(releaseInput);
  const rows: AnnotationWorksheetRow[] = [];
  for (const passage of release.passages) {
    const source = release.sources.find((s) => s.id === passage.sourceId);
    const receipt = release.receipts.find((r) => r.sourceId === passage.sourceId);
    if (!source || !receipt) throw new ContextAnnotationBenchmarkError("source_or_receipt_missing");
    if (!source.licence.identifier) throw new ContextAnnotationBenchmarkError("licence_required");
    const row: AnnotationWorksheetRow = {
      rowId: `ROW-${digest(`${partition}:${passage.id}:${passage.sha256}`)}`,
      partition,
      sourceId: source.id,
      passageId: passage.id,
      passageSha256: passage.sha256 ?? createHash("sha256").update(passage.text).digest("hex"),
      passageLocator: passage.locator,
      sourceVersion: passage.sourceVersion,
      pmid: source.pmid,
      pmcid: receipt.pmcid,
      doi: source.doi,
      licenceIdentifier: source.licence.identifier,
      authors: [...receipt.authors],
      articleTitle: receipt.articleTitle,
      groundingSpan: null,
      tags: emptyTags(),
      annotatorId: null,
      labelledAt: null,
      scientificReview: "unreviewed",
      containsPhi: false,
      clinicalAdvice: false,
      kgWrite: false,
    };
    assertAnnotationRowScaffold(row);
    rows.push(row);
  }
  return rows;
}

/** Practice scaffolds from the research working set — never evaluation_frozen. */
export function scaffoldPracticeRowsFromResearchRelease(releaseInput: unknown): AnnotationWorksheetRow[] {
  const release: RaResearchEvidenceRelease = parseRaResearchEvidenceRelease(releaseInput);
  const rows: AnnotationWorksheetRow[] = [];
  for (const passage of release.passages) {
    const source = release.sources.find((s) => s.id === passage.sourceId);
    if (!source) throw new ContextAnnotationBenchmarkError("research_source_missing");
    const row: AnnotationWorksheetRow = {
      rowId: `PRACTICE-${digest(`${passage.id}:${passage.sha256}`)}`,
      partition: "practice_not_evaluation",
      sourceId: source.id,
      passageId: passage.id,
      passageSha256: passage.sha256 ?? createHash("sha256").update(passage.text).digest("hex"),
      passageLocator: passage.locator,
      sourceVersion: passage.sourceVersion,
      pmid: null,
      pmcid: null,
      doi: null,
      licenceIdentifier: source.licence.identifier,
      authors: [],
      articleTitle: source.title,
      groundingSpan: null,
      tags: emptyTags(),
      annotatorId: null,
      labelledAt: null,
      scientificReview: "unreviewed",
      containsPhi: false,
      clinicalAdvice: false,
      kgWrite: false,
    };
    assertAnnotationRowScaffold(row);
    rows.push(row);
  }
  return rows;
}

/** Double-blind packets: identical unlabelled rows, separate annotator slots, no peer visibility. */
export function buildDoubleBlindLabelPackets(rows: AnnotationWorksheetRow[]): [IndependentLabelPacket, IndependentLabelPacket] {
  for (const row of rows) assertAnnotationRowScaffold(row);
  const base = rows.map((row) => structuredClone(row));
  const packetId = `PKT-${digest(base.map((r) => r.rowId).join("|"))}`;
  const a: IndependentLabelPacket = {
    schemaVersion: CONTEXT_ANNOTATION_BENCHMARK_VERSION,
    packetId: `${packetId}-A`,
    annotatorSlot: "annotator_a",
    doubleBlind: true,
    guidelineVersion: CONTEXT_ANNOTATION_GUIDELINE_VERSION,
    rows: structuredClone(base),
  };
  const b: IndependentLabelPacket = {
    schemaVersion: CONTEXT_ANNOTATION_BENCHMARK_VERSION,
    packetId: `${packetId}-B`,
    annotatorSlot: "annotator_b",
    doubleBlind: true,
    guidelineVersion: CONTEXT_ANNOTATION_GUIDELINE_VERSION,
    rows: structuredClone(base),
  };
  return [a, b];
}

export function openAdjudicationRecord(rowId: string, a: ContextTagSet, b: ContextTagSet): AdjudicationRecord {
  const disagreeOn = REQUIRED_CONTEXT_TAGS.filter((tag) => a[tag] !== b[tag]);
  return {
    rowId,
    annotatorATags: structuredClone(a),
    annotatorBTags: structuredClone(b),
    disagreeOn: [...disagreeOn],
    finalTags: null,
    adjudicatorId: null,
    rationale: null,
    adjudicatedAt: null,
    fabricatedLabelsPermitted: false,
  };
}

/** Assign scaffold rows to partitions by stable hash — does not invent labels. */
export function assignPartitionsByPolicy(
  rows: AnnotationWorksheetRow[],
  policy: BenchmarkSplitPolicy = defaultBenchmarkSplitPolicy(),
): Record<"evaluation_frozen" | "training_candidate" | "holdout_candidate", AnnotationWorksheetRow[]> {
  if (!policy.evaluationRequiresRightsVerifiedRelease) {
    throw new ContextAnnotationBenchmarkError("policy_must_require_rights");
  }
  const evaluation_frozen: AnnotationWorksheetRow[] = [];
  const training_candidate: AnnotationWorksheetRow[] = [];
  const holdout_candidate: AnnotationWorksheetRow[] = [];
  for (const row of rows) {
    if (row.partition === "practice_not_evaluation") {
      throw new ContextAnnotationBenchmarkError("practice_cannot_enter_split");
    }
    const bucket = Number.parseInt(digest(row.rowId).slice(0, 2), 16) / 256;
    if (bucket < policy.evaluationShare) evaluation_frozen.push({ ...row, partition: "evaluation_frozen" });
    else if (bucket < policy.evaluationShare + policy.trainingShare) {
      training_candidate.push({ ...row, partition: "training_candidate" });
    } else holdout_candidate.push({ ...row, partition: "training_candidate" });
  }
  return { evaluation_frozen, training_candidate, holdout_candidate };
}
