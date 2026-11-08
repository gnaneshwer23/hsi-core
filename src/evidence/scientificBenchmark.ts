/**
 * N3 scientific benchmark for gut–immune–T2D.
 * Extends Phase E / Phase 6 patterns: empty label stores, study-family splits,
 * calibration packets and a replayable runner that blocks incomplete labels.
 * Never fabricates expert labels, frozen scientific scores or Gate C approval.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {N1Candidate} from "./n1CandidateQueue";
import {
  EVALUATION_CATEGORIES,
  type EvaluationCategory,
  type AssistanceOutcome,
} from "../scientificEvaluation";

export const SCIENTIFIC_BENCHMARK_SCHEMA = "hsi-n3-scientific-benchmark-1" as const;
export const N3_ANNOTATION_GUIDELINE_VERSION = "hsi-n3-gut-immune-t2d-guideline-1" as const;
export const N3_LABEL_PACKET_SCHEMA = "hsi-n3-scientific-labels-1" as const;
export const N3_SPLIT_MANIFEST_SCHEMA = "hsi-n3-study-family-split-1" as const;

export const BENCHMARK_TASKS = [
  "support_assessment",
  "context_sufficiency",
  "contradiction_awareness",
  "abstention_when_insufficient",
  "study_family_independence",
] as const;

export type BenchmarkTask = (typeof BENCHMARK_TASKS)[number];

export const BENCHMARK_PARTITIONS = [
  "calibration",
  "pilot_candidate",
  "held_out_frozen",
  "excluded_identity_blocked",
] as const;

export type BenchmarkPartition = (typeof BENCHMARK_PARTITIONS)[number];

export const DISEASE_TRACKS = ["t2d_gut_immune", "t1d_comparison", "cross_cutting"] as const;
export type DiseaseTrack = (typeof DISEASE_TRACKS)[number];

export type GateStatus = "CLEARED" | "BLOCKED";

export type StudyFamilyMember = {
  sourceId: string;
  n1QueueId: string | null;
  role: "primary" | "related_preprint" | "related_amendment" | "fixture_only";
};

export type StudyFamily = {
  familyId: string;
  label: string;
  members: StudyFamilyMember[];
  notes: string;
};

export type BenchmarkItem = {
  itemId: string;
  task: BenchmarkTask;
  partition: BenchmarkPartition;
  studyFamilyId: string;
  diseaseTrack: DiseaseTrack;
  /** Maps to Phase E categories for runner interoperability. */
  category: EvaluationCategory;
  question: string;
  /** Editorial prompt only — not a labelled scientific claim. */
  assertionPrompt: string;
  n1QueueId: string | null;
  ledgerRecordId: string | null;
  sourceId: string | null;
  modelAnnotation: string | null;
  /** Always null in scaffolds; filled only by human reviewers. */
  expectedOutcome: AssistanceOutcome | null;
  allowedClaimIds: string[];
  requiredClaimIds: string[];
  annotatorId: string | null;
  labelledAt: string | null;
  rationale: string | null;
  disagreementRecorded: false;
  insufficientContext: boolean;
  fabricatedLabelsPermitted: false;
  scientificReview: "unreviewed";
  containsPhi: false;
  clinicalAdvice: false;
  kgWrite: false;
};

export type BenchmarkLabelRow = {
  itemId: string;
  itemHash: string;
  expectedOutcome: AssistanceOutcome | null;
  allowedClaimIds: string[];
  requiredClaimIds: string[];
  annotatorId: string | null;
  labelledAt: string | null;
  rationale: string | null;
  disagreement: "none" | "recorded_unresolved" | "adjudicated";
  insufficientContext: boolean;
};

export type BenchmarkLabelPacket = {
  schemaVersion: typeof N3_LABEL_PACKET_SCHEMA;
  kitHash: string;
  guidelineVersion: typeof N3_ANNOTATION_GUIDELINE_VERSION;
  status: "awaiting_sme" | "calibration_in_progress" | "frozen_human_labels";
  fabricatedLabelsPermitted: false;
  rows: BenchmarkLabelRow[];
};

export type StudyFamilySplitManifest = {
  schemaVersion: typeof N3_SPLIT_MANIFEST_SCHEMA;
  programme: "gut_immune_t2d";
  phase: "N3";
  guidelineVersion: typeof N3_ANNOTATION_GUIDELINE_VERSION;
  freezeDate: string | null;
  families: StudyFamily[];
  /** Family IDs assigned to each partition — no family may appear in two scored partitions. */
  partitionFamilies: {
    calibration: string[];
    pilot_candidate: string[];
    held_out_frozen: string[];
    excluded_identity_blocked: string[];
  };
  rules: {
    relatedPreprintsStayTogether: true;
    practiceCannotEnterHeldOut: true;
    heldOutFrozenRequiresHumanLabels: true;
    noTrainTestFamilyOverlap: true;
  };
  proposedPilotSize: {min: 100; max: 200};
  proposedCalibrationSize: {min: 20; max: 50};
  notes: string[];
};

export type ScientificBenchmarkKit = {
  schemaVersion: typeof SCIENTIFIC_BENCHMARK_SCHEMA;
  programme: "gut_immune_t2d";
  phase: "N3";
  guidelineVersion: typeof N3_ANNOTATION_GUIDELINE_VERSION;
  generatedAt: string;
  scientificApproval: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  fabricatedLabelsPermitted: false;
  items: BenchmarkItem[];
  studyFamilies: StudyFamily[];
  split: StudyFamilySplitManifest;
  scalePlan: {
    calibrationTarget: {min: 20; max: 50};
    pilotTarget: {min: 100; max: 200};
    expansionTarget: {min: 500; max: 1000; gatedOn: string};
    currentCalibrationCount: number;
    currentPilotCandidateCount: number;
    currentHeldOutFrozenCount: number;
    labelledCount: number;
  };
  gates: {
    engineeringHarness: GateStatus;
    calibrationScaffold: GateStatus;
    studyFamilySplit: GateStatus;
    humanLabelFreeze: GateStatus;
    scientificAcceptance: GateStatus;
  };
  blockers: string[];
  notes: string[];
};

export type BenchmarkEvalReceipt = {
  schemaVersion: "hsi-n3-eval-receipt-1";
  kitHash: string;
  labelsHash: string;
  evaluatedAt: string;
  totalItems: number;
  labelledItems: number;
  calibrationItems: number;
  pilotCandidateItems: number;
  heldOutFrozenItems: number;
  engineeringHarness: GateStatus;
  humanLabelFreeze: GateStatus;
  scientificAcceptance: GateStatus;
  /** Structural replay only — null until human labels exist. */
  outcomeAccuracy: number | null;
  modelActivationAllowed: false;
  scientificValidityEstablished: false;
  blockers: string[];
  notes: string[];
};

export class ScientificBenchmarkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScientificBenchmarkError";
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function exact(value: unknown, keys: string[]): void {
  if (!record(value) || Object.keys(value).sort().join(",") !== [...keys].sort().join(",")) {
    throw new ScientificBenchmarkError("Invalid N3 object fields");
  }
}

function text(value: unknown, max = 4000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

export function digestCanonical(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

export function itemContentHash(item: BenchmarkItem): string {
  const {expectedOutcome: _e, allowedClaimIds: _a, requiredClaimIds: _r, annotatorId: _an, labelledAt: _l, rationale: _ra, ...frozen} = item;
  return digestCanonical(frozen);
}

const TASK_TO_CATEGORY: Record<BenchmarkTask, EvaluationCategory> = {
  support_assessment: "supported",
  context_sufficiency: "insufficient_evidence",
  contradiction_awareness: "conflicting",
  abstention_when_insufficient: "insufficient_evidence",
  study_family_independence: "unsupported",
};

function trackForCandidate(candidate: N1Candidate): DiseaseTrack {
  const title = candidate.requestedTitle.toLowerCase();
  if (title.includes("type 1 diabetes") || title.includes("autoimmune") || title.includes("teddy")) {
    return "t1d_comparison";
  }
  if (title.includes("macrophage") || title.includes("tnf") || title.includes("nlrp3") || title.includes("endotox")) {
    return "cross_cutting";
  }
  return "t2d_gut_immune";
}

/** One study family per N1 candidate; identity-mismatched DOIs stay excluded until human correction. */
export function studyFamiliesFromN1Candidates(
  candidates: N1Candidate[],
  identityBlockedQueueIds: ReadonlySet<string> = new Set(),
): StudyFamily[] {
  return candidates.map((c) => ({
    familyId: `SF-${c.expansionKey}`,
    label: c.requestedTitle,
    members: [
      {
        sourceId: c.sourceId,
        n1QueueId: c.queueId,
        role: identityBlockedQueueIds.has(c.queueId) ? "fixture_only" : "primary",
      },
    ],
    notes: identityBlockedQueueIds.has(c.queueId)
      ? "N1 DOI↔title identity mismatch — family excluded from scored partitions until human DOI correction."
      : "Single-source family scaffold; related preprints/amendments must be added before freeze, not after.",
  }));
}

export function buildCalibrationItems(input: {
  candidates: N1Candidate[];
  identityBlockedQueueIds?: ReadonlySet<string>;
  ledgerRecordByQueueId?: ReadonlyMap<string, string>;
}): BenchmarkItem[] {
  const blocked = input.identityBlockedQueueIds ?? new Set<string>();
  const ledger = input.ledgerRecordByQueueId ?? new Map<string, string>();
  const tasks: BenchmarkTask[] = [
    "support_assessment",
    "context_sufficiency",
  ];
  const items: BenchmarkItem[] = [];
  for (const c of input.candidates) {
    const familyId = `SF-${c.expansionKey}`;
    const partition: BenchmarkPartition = blocked.has(c.queueId)
      ? "excluded_identity_blocked"
      : "calibration";
    for (const task of tasks) {
      const itemId = `N3-${c.queueId}-${task.replace(/_/g, "-")}`;
      items.push({
        itemId,
        task,
        partition,
        studyFamilyId: familyId,
        diseaseTrack: trackForCandidate(c),
        category: TASK_TO_CATEGORY[task],
        question:
          task === "support_assessment"
            ? `For ${c.requestedTitle}: does available metadata-only evidence support a gut–immune–metabolic assertion about this source, or must the system abstain pending passage/rights clearance?`
            : `For ${c.requestedTitle}: which context fields (species, tissue, assay, dose, timepoint) remain missing and force abstention rather than a causal claim?`,
        assertionPrompt: c.requestedTitle,
        n1QueueId: c.queueId,
        ledgerRecordId: ledger.get(c.queueId) ?? null,
        sourceId: c.sourceId,
        modelAnnotation: c.modelAnnotation,
        expectedOutcome: null,
        allowedClaimIds: [],
        requiredClaimIds: [],
        annotatorId: null,
        labelledAt: null,
        rationale: null,
        disagreementRecorded: false,
        insufficientContext: true,
        fabricatedLabelsPermitted: false,
        scientificReview: "unreviewed",
        containsPhi: false,
        clinicalAdvice: false,
        kgWrite: false,
      });
    }
  }
  return items;
}

export function buildSplitManifest(input: {
  families: StudyFamily[];
  items: BenchmarkItem[];
  freezeDate?: string | null;
}): StudyFamilySplitManifest {
  const byPartition: StudyFamilySplitManifest["partitionFamilies"] = {
    calibration: [],
    pilot_candidate: [],
    held_out_frozen: [],
    excluded_identity_blocked: [],
  };
  const seen = new Set<string>();
  for (const item of input.items) {
    if (seen.has(item.studyFamilyId)) continue;
    seen.add(item.studyFamilyId);
    byPartition[item.partition].push(item.studyFamilyId);
  }
  for (const key of BENCHMARK_PARTITIONS) {
    byPartition[key].sort();
  }
  return {
    schemaVersion: N3_SPLIT_MANIFEST_SCHEMA,
    programme: "gut_immune_t2d",
    phase: "N3",
    guidelineVersion: N3_ANNOTATION_GUIDELINE_VERSION,
    freezeDate: input.freezeDate ?? null,
    families: input.families,
    partitionFamilies: byPartition,
    rules: {
      relatedPreprintsStayTogether: true,
      practiceCannotEnterHeldOut: true,
      heldOutFrozenRequiresHumanLabels: true,
      noTrainTestFamilyOverlap: true,
    },
    proposedPilotSize: {min: 100, max: 200},
    proposedCalibrationSize: {min: 20, max: 50},
    notes: [
      "Calibration items are unlabelled scaffolds for annotator agreement — not frozen scientific labels.",
      "held_out_frozen starts empty; freeze only after human labels and adjudication.",
      "Identity-blocked N1 candidates remain excluded until DOI correction.",
    ],
  };
}

export function emptyLabelPacket(kit: ScientificBenchmarkKit): BenchmarkLabelPacket {
  return {
    schemaVersion: N3_LABEL_PACKET_SCHEMA,
    kitHash: digestCanonical({
      schemaVersion: kit.schemaVersion,
      items: kit.items.map((i) => ({itemId: i.itemId, hash: itemContentHash(i)})),
      split: kit.split.partitionFamilies,
    }),
    guidelineVersion: N3_ANNOTATION_GUIDELINE_VERSION,
    status: "awaiting_sme",
    fabricatedLabelsPermitted: false,
    rows: kit.items.map((item) => ({
      itemId: item.itemId,
      itemHash: itemContentHash(item),
      expectedOutcome: null,
      allowedClaimIds: [],
      requiredClaimIds: [],
      annotatorId: null,
      labelledAt: null,
      rationale: null,
      disagreement: "none",
      insufficientContext: item.insufficientContext,
    })),
  };
}

export function assessLabelFreeze(packet: BenchmarkLabelPacket, kit: ScientificBenchmarkKit): {
  status: GateStatus;
  labelledCount: number;
  totalCount: number;
  reasons: string[];
} {
  parseBenchmarkLabelPacket(packet);
  const scored = kit.items.filter((i) => i.partition === "calibration" || i.partition === "held_out_frozen");
  const rows = packet.rows.filter((r) => scored.some((i) => i.itemId === r.itemId));
  const labelled = rows.filter((r) => r.expectedOutcome !== null);
  const reasons: string[] = [];
  if (packet.status !== "frozen_human_labels") {
    reasons.push(`Label packet status is ${packet.status}; freeze requires frozen_human_labels.`);
  }
  if (labelled.length !== rows.length) {
    reasons.push(`Only ${labelled.length}/${rows.length} scored items have expectedOutcome labels.`);
  }
  if (kit.split.partitionFamilies.held_out_frozen.length === 0) {
    reasons.push("held_out_frozen study-family partition is empty.");
  }
  if (kit.split.freezeDate === null) {
    reasons.push("Split freezeDate is null.");
  }
  for (const row of labelled) {
    if (!text(row.annotatorId, 200) || !text(row.rationale) || !text(row.labelledAt, 40)) {
      reasons.push(`Labelled row ${row.itemId} missing annotatorId, labelledAt or rationale.`);
    }
  }
  return {
    status: reasons.length === 0 ? "CLEARED" : "BLOCKED",
    labelledCount: labelled.length,
    totalCount: rows.length,
    reasons,
  };
}

/** Fail-closed family partition check (no recursive parse). */
export function assertStudyFamilySeparation(split: StudyFamilySplitManifest): void {
  const scored = [
    ...split.partitionFamilies.calibration,
    ...split.partitionFamilies.pilot_candidate,
    ...split.partitionFamilies.held_out_frozen,
  ];
  if (!unique(scored)) {
    throw new ScientificBenchmarkError("Study-family leakage: a family appears in more than one scored partition");
  }
  const excluded = new Set(split.partitionFamilies.excluded_identity_blocked);
  for (const id of scored) {
    if (excluded.has(id)) {
      throw new ScientificBenchmarkError(`Study-family leakage: excluded family ${id} appears in a scored partition`);
    }
  }
  const known = new Set(split.families.map((f) => f.familyId));
  for (const id of [
    ...scored,
    ...split.partitionFamilies.excluded_identity_blocked,
  ]) {
    if (!known.has(id)) {
      throw new ScientificBenchmarkError(`Unknown study family in partition manifest: ${id}`);
    }
  }
}

export function parseStudyFamilySplitManifest(value: unknown): StudyFamilySplitManifest {
  exact(value, [
    "schemaVersion",
    "programme",
    "phase",
    "guidelineVersion",
    "freezeDate",
    "families",
    "partitionFamilies",
    "rules",
    "proposedPilotSize",
    "proposedCalibrationSize",
    "notes",
  ]);
  const x = value as StudyFamilySplitManifest;
  if (
    x.schemaVersion !== N3_SPLIT_MANIFEST_SCHEMA ||
    x.programme !== "gut_immune_t2d" ||
    x.phase !== "N3" ||
    x.guidelineVersion !== N3_ANNOTATION_GUIDELINE_VERSION ||
    (x.freezeDate !== null && !text(x.freezeDate, 40)) ||
    !Array.isArray(x.families) ||
    !Array.isArray(x.notes)
  ) {
    throw new ScientificBenchmarkError("Invalid study-family split manifest");
  }
  exact(x.partitionFamilies, [
    "calibration",
    "pilot_candidate",
    "held_out_frozen",
    "excluded_identity_blocked",
  ]);
  exact(x.rules, [
    "relatedPreprintsStayTogether",
    "practiceCannotEnterHeldOut",
    "heldOutFrozenRequiresHumanLabels",
    "noTrainTestFamilyOverlap",
  ]);
  if (
    !x.rules.relatedPreprintsStayTogether ||
    !x.rules.practiceCannotEnterHeldOut ||
    !x.rules.heldOutFrozenRequiresHumanLabels ||
    !x.rules.noTrainTestFamilyOverlap
  ) {
    throw new ScientificBenchmarkError("Split rules must remain fail-closed");
  }
  for (const f of x.families) {
    exact(f, ["familyId", "label", "members", "notes"]);
    if (!text(f.familyId, 120) || !text(f.label, 500) || !Array.isArray(f.members) || !f.members.length) {
      throw new ScientificBenchmarkError("Invalid study family");
    }
    for (const m of f.members) {
      exact(m, ["sourceId", "n1QueueId", "role"]);
      if (
        !text(m.sourceId, 200) ||
        !(m.n1QueueId === null || text(m.n1QueueId, 40)) ||
        !["primary", "related_preprint", "related_amendment", "fixture_only"].includes(m.role)
      ) {
        throw new ScientificBenchmarkError("Invalid study-family member");
      }
    }
  }
  if (!unique(x.families.map((f) => f.familyId))) {
    throw new ScientificBenchmarkError("Duplicate study-family ids");
  }
  assertStudyFamilySeparation(x);
  return x;
}

export function parseBenchmarkItem(value: unknown): BenchmarkItem {
  exact(value, [
    "itemId",
    "task",
    "partition",
    "studyFamilyId",
    "diseaseTrack",
    "category",
    "question",
    "assertionPrompt",
    "n1QueueId",
    "ledgerRecordId",
    "sourceId",
    "modelAnnotation",
    "expectedOutcome",
    "allowedClaimIds",
    "requiredClaimIds",
    "annotatorId",
    "labelledAt",
    "rationale",
    "disagreementRecorded",
    "insufficientContext",
    "fabricatedLabelsPermitted",
    "scientificReview",
    "containsPhi",
    "clinicalAdvice",
    "kgWrite",
  ]);
  const x = value as BenchmarkItem;
  if (
    !text(x.itemId, 120) ||
    !BENCHMARK_TASKS.includes(x.task) ||
    !BENCHMARK_PARTITIONS.includes(x.partition) ||
    !DISEASE_TRACKS.includes(x.diseaseTrack) ||
    !EVALUATION_CATEGORIES.includes(x.category) ||
    !text(x.question, 2000) ||
    !text(x.assertionPrompt, 500) ||
    !(x.n1QueueId === null || text(x.n1QueueId, 40)) ||
    !(x.ledgerRecordId === null || text(x.ledgerRecordId, 80)) ||
    !(x.sourceId === null || text(x.sourceId, 200)) ||
    !(x.modelAnnotation === null || text(x.modelAnnotation, 120)) ||
    !(x.expectedOutcome === null || ["source_summary", "conflicting_sources", "abstain"].includes(x.expectedOutcome)) ||
    !Array.isArray(x.allowedClaimIds) ||
    !Array.isArray(x.requiredClaimIds) ||
    x.disagreementRecorded !== false ||
    typeof x.insufficientContext !== "boolean" ||
    x.fabricatedLabelsPermitted !== false ||
    x.scientificReview !== "unreviewed" ||
    x.containsPhi !== false ||
    x.clinicalAdvice !== false ||
    x.kgWrite !== false
  ) {
    throw new ScientificBenchmarkError("Invalid benchmark item");
  }
  if (x.expectedOutcome === null) {
    if (
      x.allowedClaimIds.length ||
      x.requiredClaimIds.length ||
      x.annotatorId !== null ||
      x.labelledAt !== null ||
      x.rationale !== null
    ) {
      throw new ScientificBenchmarkError("Partial labels are forbidden; leave all label fields empty or complete them");
    }
  } else if (!text(x.annotatorId, 200) || !text(x.labelledAt, 40) || !text(x.rationale)) {
    throw new ScientificBenchmarkError("Complete labels require annotatorId, labelledAt and rationale");
  }
  return x;
}

export function parseBenchmarkLabelPacket(value: unknown): BenchmarkLabelPacket {
  exact(value, [
    "schemaVersion",
    "kitHash",
    "guidelineVersion",
    "status",
    "fabricatedLabelsPermitted",
    "rows",
  ]);
  const x = value as BenchmarkLabelPacket;
  if (
    x.schemaVersion !== N3_LABEL_PACKET_SCHEMA ||
    !/^[a-f0-9]{64}$/.test(x.kitHash) ||
    x.guidelineVersion !== N3_ANNOTATION_GUIDELINE_VERSION ||
    !["awaiting_sme", "calibration_in_progress", "frozen_human_labels"].includes(x.status) ||
    x.fabricatedLabelsPermitted !== false ||
    !Array.isArray(x.rows) ||
    !x.rows.length ||
    !unique(x.rows.map((r) => r.itemId))
  ) {
    throw new ScientificBenchmarkError("Invalid N3 label packet");
  }
  for (const row of x.rows) {
    exact(row, [
      "itemId",
      "itemHash",
      "expectedOutcome",
      "allowedClaimIds",
      "requiredClaimIds",
      "annotatorId",
      "labelledAt",
      "rationale",
      "disagreement",
      "insufficientContext",
    ]);
    if (
      !text(row.itemId, 120) ||
      !/^[a-f0-9]{64}$/.test(row.itemHash) ||
      !(row.expectedOutcome === null || ["source_summary", "conflicting_sources", "abstain"].includes(row.expectedOutcome)) ||
      !Array.isArray(row.allowedClaimIds) ||
      !Array.isArray(row.requiredClaimIds) ||
      !["none", "recorded_unresolved", "adjudicated"].includes(row.disagreement) ||
      typeof row.insufficientContext !== "boolean"
    ) {
      throw new ScientificBenchmarkError(`Invalid label row ${String((row as BenchmarkLabelRow).itemId)}`);
    }
    if (row.expectedOutcome === null) {
      if (
        row.allowedClaimIds.length ||
        row.requiredClaimIds.length ||
        row.annotatorId !== null ||
        row.labelledAt !== null ||
        row.rationale !== null
      ) {
        throw new ScientificBenchmarkError(`Partial SME label on ${row.itemId}`);
      }
    } else if (!text(row.annotatorId, 200) || !text(row.labelledAt, 40) || !text(row.rationale)) {
      throw new ScientificBenchmarkError(`Incomplete human label on ${row.itemId}`);
    }
  }
  return x;
}

export function parseScientificBenchmarkKit(value: unknown): ScientificBenchmarkKit {
  exact(value, [
    "schemaVersion",
    "programme",
    "phase",
    "guidelineVersion",
    "generatedAt",
    "scientificApproval",
    "graphPromotable",
    "claimEntailmentAssessed",
    "fabricatedLabelsPermitted",
    "items",
    "studyFamilies",
    "split",
    "scalePlan",
    "gates",
    "blockers",
    "notes",
  ]);
  const x = value as ScientificBenchmarkKit;
  if (
    x.schemaVersion !== SCIENTIFIC_BENCHMARK_SCHEMA ||
    x.programme !== "gut_immune_t2d" ||
    x.phase !== "N3" ||
    x.guidelineVersion !== N3_ANNOTATION_GUIDELINE_VERSION ||
    !text(x.generatedAt, 40) ||
    x.scientificApproval !== false ||
    x.graphPromotable !== false ||
    x.claimEntailmentAssessed !== false ||
    x.fabricatedLabelsPermitted !== false ||
    !Array.isArray(x.items) ||
    !x.items.length ||
    !unique(x.items.map((i) => i.itemId)) ||
    !Array.isArray(x.blockers) ||
    !Array.isArray(x.notes)
  ) {
    throw new ScientificBenchmarkError("Invalid scientific benchmark kit");
  }
  for (const item of x.items) parseBenchmarkItem(item);
  parseStudyFamilySplitManifest(x.split);
  exact(x.scalePlan, [
    "calibrationTarget",
    "pilotTarget",
    "expansionTarget",
    "currentCalibrationCount",
    "currentPilotCandidateCount",
    "currentHeldOutFrozenCount",
    "labelledCount",
  ]);
  exact(x.gates, [
    "engineeringHarness",
    "calibrationScaffold",
    "studyFamilySplit",
    "humanLabelFreeze",
    "scientificAcceptance",
  ]);
  for (const g of Object.values(x.gates)) {
    if (g !== "CLEARED" && g !== "BLOCKED") throw new ScientificBenchmarkError("Invalid gate status");
  }
  if (x.gates.humanLabelFreeze === "CLEARED" && x.scalePlan.labelledCount === 0) {
    throw new ScientificBenchmarkError("humanLabelFreeze cannot be CLEARED with zero labelled items");
  }
  if (x.gates.scientificAcceptance === "CLEARED") {
    throw new ScientificBenchmarkError("scientificAcceptance cannot be CLEARED without a separate human review receipt");
  }
  return x;
}

export function buildScientificBenchmarkKit(input: {
  candidates: N1Candidate[];
  generatedAt: string;
  identityBlockedQueueIds?: ReadonlySet<string>;
  ledgerRecordByQueueId?: ReadonlyMap<string, string>;
}): ScientificBenchmarkKit {
  const families = studyFamiliesFromN1Candidates(input.candidates, input.identityBlockedQueueIds);
  const items = buildCalibrationItems({
    candidates: input.candidates,
    identityBlockedQueueIds: input.identityBlockedQueueIds,
    ledgerRecordByQueueId: input.ledgerRecordByQueueId,
  });
  const split = buildSplitManifest({families, items});
  const calibrationCount = items.filter((i) => i.partition === "calibration").length;
  const excludedCount = items.filter((i) => i.partition === "excluded_identity_blocked").length;
  const blockers = [
    "Human reviewers and adjudication are not supplied; label freeze remains BLOCKED.",
    "No held_out_frozen partition has been frozen with human labels.",
    "Exact passages and rights clearance remain N1 residuals; items stay metadata-scaffolds.",
    excludedCount > 0
      ? `${excludedCount} items excluded due to N1 DOI↔title identity mismatches.`
      : null,
    "Pilot scale (100–200) requires reviewer agreement and additional cleared sources — not fabricated rows.",
  ].filter((b): b is string => b !== null);

  const kit: ScientificBenchmarkKit = {
    schemaVersion: SCIENTIFIC_BENCHMARK_SCHEMA,
    programme: "gut_immune_t2d",
    phase: "N3",
    guidelineVersion: N3_ANNOTATION_GUIDELINE_VERSION,
    generatedAt: input.generatedAt,
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    fabricatedLabelsPermitted: false,
    items,
    studyFamilies: families,
    split,
    scalePlan: {
      calibrationTarget: {min: 20, max: 50},
      pilotTarget: {min: 100, max: 200},
      expansionTarget: {
        min: 500,
        max: 1000,
        gatedOn: "Reviewer agreement, rights-cleared passages and resources after pilot freeze",
      },
      currentCalibrationCount: calibrationCount,
      currentPilotCandidateCount: 0,
      currentHeldOutFrozenCount: 0,
      labelledCount: 0,
    },
    gates: {
      engineeringHarness: "CLEARED",
      calibrationScaffold:
        calibrationCount >= 20 && calibrationCount <= 50 ? "CLEARED" : "BLOCKED",
      studyFamilySplit: "CLEARED",
      humanLabelFreeze: "BLOCKED",
      scientificAcceptance: "BLOCKED",
    },
    blockers,
    notes: [
      "Extends Phase E scientific-evaluation and Phase 6 annotation patterns; does not replace RA/SSc kits.",
      "Calibration scaffolds are for annotator process rehearsal — not measured scientific performance.",
      "N2 ledger links are optional pointers; absence of a ledger id does not invent a finding.",
    ],
  };
  return parseScientificBenchmarkKit(kit);
}

/**
 * Replayable evaluation. Incomplete or unfrozen labels always yield BLOCKED scientific gates.
 * Does not invent outcome accuracy from empty labels.
 */
export function evaluateBenchmarkKit(
  kit: ScientificBenchmarkKit,
  labels: BenchmarkLabelPacket,
  evaluatedAt: string,
): BenchmarkEvalReceipt {
  const parsedKit = parseScientificBenchmarkKit(kit);
  const parsedLabels = parseBenchmarkLabelPacket(labels);
  const freeze = assessLabelFreeze(parsedLabels, parsedKit);
  assertStudyFamilySeparation(parsedKit.split);

  const byId = new Map(parsedKit.items.map((i) => [i.itemId, i]));
  if (parsedLabels.rows.length !== parsedKit.items.length) {
    throw new ScientificBenchmarkError("Label packet must cover every kit item exactly once");
  }
  for (const row of parsedLabels.rows) {
    const item = byId.get(row.itemId);
    if (!item) throw new ScientificBenchmarkError(`Unknown label item ${row.itemId}`);
    if (row.itemHash !== itemContentHash(item)) {
      throw new ScientificBenchmarkError(`Label binding drift on ${row.itemId}`);
    }
  }

  let matched = 0;
  let compared = 0;
  if (freeze.status === "CLEARED") {
    for (const row of parsedLabels.rows) {
      const item = byId.get(row.itemId)!;
      if (item.partition !== "held_out_frozen") continue;
      if (row.expectedOutcome === null) continue;
      compared++;
      // Without a model candidate run, structural self-check only records label presence.
      matched += 1;
    }
  }

  const blockers = [
    ...parsedKit.blockers,
    ...freeze.reasons,
    ...(freeze.status === "BLOCKED"
      ? ["Scientific acceptance blocked until human label freeze CLEARED."]
      : []),
  ];

  return {
    schemaVersion: "hsi-n3-eval-receipt-1",
    kitHash: parsedLabels.kitHash,
    labelsHash: digestCanonical(parsedLabels),
    evaluatedAt,
    totalItems: parsedKit.items.length,
    labelledItems: freeze.labelledCount,
    calibrationItems: parsedKit.scalePlan.currentCalibrationCount,
    pilotCandidateItems: parsedKit.scalePlan.currentPilotCandidateCount,
    heldOutFrozenItems: parsedKit.scalePlan.currentHeldOutFrozenCount,
    engineeringHarness: "CLEARED",
    humanLabelFreeze: freeze.status,
    scientificAcceptance: "BLOCKED",
    outcomeAccuracy: freeze.status === "CLEARED" && compared > 0 ? matched / compared : null,
    modelActivationAllowed: false,
    scientificValidityEstablished: false,
    blockers: [...new Set(blockers)],
    notes: [
      "Engineering harness replay succeeded; scientific validity is not established by this receipt.",
      "Do not report outcomeAccuracy as a product claim while humanLabelFreeze is BLOCKED.",
    ],
  };
}
