/**
 * Milestone 4 / Phase 2 — Translational failure-mode taxonomy (investigation labels).
 *
 * Extends M4 PR1 translational evidence contracts and M2 contradiction /
 * structured-comparison investigation patterns. Categories are investigation
 * bins for human review — not predetermined clinical conclusions and not
 * fabricated causal failure explanations.
 *
 * Binding honesty:
 * - Recruitment / termination / withdrawal alone ≠ clinical failure cause
 * - Do not invent proprietary programme failure narratives
 * - Absence of published evidence ≠ absence of activity
 * - No patient treatment recommendations; review gates intact; no Gate C / MoU / PHI
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {
  ContradictionInvestigationAssessment,
  ContradictionInvestigationCategory,
  StructuredEvidenceComparisonPack,
} from "./structuredEvidenceComparison";
import type {
  TranslationalEvidenceContractPack,
} from "./translationalEvidenceContracts";
import {registryStatusFailureHonesty} from "./translationalEvidenceContracts";
import type {
  TranslationalLandscapeSnapshot,
  TranslationalTrialRecord,
} from "./translationalEvidenceAttach";

export const TRANSLATIONAL_FAILURE_TAXONOMY_SCHEMA =
  "hsi-translational-failure-taxonomy-1" as const;
export const TRANSLATIONAL_FAILURE_TAXONOMY_METHOD =
  "hsi.translational_failure_investigation.v1" as const;
export const TRANSLATIONAL_FAILURE_TAXONOMY_VERSION = "0.1.0" as const;

/**
 * Closed investigation-label set. These are candidate explanation bins —
 * never proven translational failure causes.
 */
export type TranslationalFailureInvestigationCategory =
  | "weak_human_target_validation"
  | "model_to_human_mismatch"
  | "insufficient_target_engagement"
  | "tissue_mismatch"
  | "patient_heterogeneity"
  | "dose_timing"
  | "endpoint_design"
  | "safety"
  | "compensatory_pathways"
  | "insufficient_evidence";

export const TRANSLATIONAL_FAILURE_INVESTIGATION_CATEGORIES = [
  "weak_human_target_validation",
  "model_to_human_mismatch",
  "insufficient_target_engagement",
  "tissue_mismatch",
  "patient_heterogeneity",
  "dose_timing",
  "endpoint_design",
  "safety",
  "compensatory_pathways",
  "insufficient_evidence",
] as const satisfies readonly TranslationalFailureInvestigationCategory[];

export type TranslationalFailureLabelSource =
  | "contract_unknowns"
  | "registry_evidence_gap"
  | "target_mapping_gap"
  | "structured_comparison"
  | "contradiction_investigation"
  | "curator_declared";

export type TranslationalFailureInvestigationItem = {
  id: string;
  category: TranslationalFailureInvestigationCategory;
  /** Why this investigation bin was opened — not a causal verdict. */
  rationale: string;
  source: TranslationalFailureLabelSource;
  linkedNctIds: readonly string[];
  linkedContractIds: readonly string[];
  linkedComparisonIds: readonly string[];
  registryOverallStatus: string | null;
  /** Explicit: category is an investigation label, not a verified failure cause. */
  predeterminedConclusion: false;
  causalFailureFabricated: false;
  recruitmentOrTerminationIsNotClinicalFailure: true;
  needsHumanReview: true;
  scientificallyVerified: false;
};

export type TranslationalFailureInvestigationAssessment = {
  schemaVersion: typeof TRANSLATIONAL_FAILURE_TAXONOMY_SCHEMA;
  method: typeof TRANSLATIONAL_FAILURE_TAXONOMY_METHOD;
  version: typeof TRANSLATIONAL_FAILURE_TAXONOMY_VERSION;
  generatedAt: string;
  assessmentId: string;
  contractPackMethod: string | null;
  comparisonPackId: string | null;
  contradictionAssessmentMethod: string | null;
  items: readonly TranslationalFailureInvestigationItem[];
  summary: {
    byCategory: Readonly<Record<TranslationalFailureInvestigationCategory, number>>;
    curatorDeclared: number;
    autoProposedFromEvidenceGaps: number;
    linkedFromStructuredComparison: number;
    statusAloneCauseRefusals: number;
  };
  persistenceLines: readonly string[];
  honesty: {
    categoriesAreInvestigationLabelsNotConclusions: true;
    recruitmentOrTerminationIsNotClinicalFailure: true;
    causalFailureExplanationsNotFabricated: true;
    absenceOfPublishedEvidenceIsNotAbsenceOfActivity: true;
    proprietaryProgrammesNotInvented: true;
    patientTreatmentRecommendation: false;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
    projectedFromTranslationalContracts: true;
  };
};

function fail(message: string): never {
  throw new Error(message);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((v) => typeof v === "string" && v.trim()))];
}

function emptyCategoryCounts(): Record<TranslationalFailureInvestigationCategory, number> {
  return {
    weak_human_target_validation: 0,
    model_to_human_mismatch: 0,
    insufficient_target_engagement: 0,
    tissue_mismatch: 0,
    patient_heterogeneity: 0,
    dose_timing: 0,
    endpoint_design: 0,
    safety: 0,
    compensatory_pathways: 0,
    insufficient_evidence: 0,
  };
}

function itemId(parts: {
  category: TranslationalFailureInvestigationCategory;
  source: TranslationalFailureLabelSource;
  anchor: string;
}): string {
  return `tfi:${createHash("sha256")
    .update(
      canonicalEvidenceJson({
        category: parts.category,
        source: parts.source,
        anchor: parts.anchor,
        v: TRANSLATIONAL_FAILURE_TAXONOMY_VERSION,
      }),
    )
    .digest("hex")
    .slice(0, 24)}`;
}

function sealItem(item: TranslationalFailureInvestigationItem): TranslationalFailureInvestigationItem {
  if (item.predeterminedConclusion !== false) {
    fail("Failure investigation categories must not be predetermined conclusions");
  }
  if (item.causalFailureFabricated !== false) {
    fail("Causal failure explanations must not be fabricated");
  }
  if (item.recruitmentOrTerminationIsNotClinicalFailure !== true) {
    fail("Recruitment/termination must not imply clinical failure");
  }
  if (item.scientificallyVerified !== false) {
    fail("Investigation labels are not scientifically verified");
  }
  return item;
}

function isTerminalOrRecruitingStatus(status: string | null): boolean {
  const s = status?.trim().toLowerCase() ?? "";
  return /terminat|withdrawn|suspended|recruiting|not yet recruiting|enrolling/.test(s);
}

/**
 * Categories that require curator declaration or structured-comparison signal.
 * Auto-proposing these from registry status alone would fabricate causal failure.
 */
const CURATOR_OR_COMPARISON_ONLY = new Set<TranslationalFailureInvestigationCategory>([
  "dose_timing",
  "safety",
  "compensatory_pathways",
]);

function mapContradictionCategory(
  category: ContradictionInvestigationCategory,
): TranslationalFailureInvestigationCategory | null {
  switch (category) {
    case "context_mismatch":
      return "model_to_human_mismatch";
    case "population_or_phenotype_difference":
      return "patient_heterogeneity";
    case "assay_or_experimental_system_difference":
      return "model_to_human_mismatch";
    case "methodological_difference":
      return "endpoint_design";
    case "genuine_conflict_candidate":
      return "insufficient_evidence";
    case "insufficient_evidence_to_adjudicate":
      return "insufficient_evidence";
    case "insufficient_comparability":
      return "insufficient_evidence";
    default: {
      const _exhaustive: never = category;
      void _exhaustive;
      return null;
    }
  }
}

function proposeFromTrial(input: {
  record: TranslationalTrialRecord;
  contractIds: readonly string[];
}): TranslationalFailureInvestigationItem[] {
  const record = input.record;
  const statusHonesty = registryStatusFailureHonesty(record.registration.overallStatus);
  const items: TranslationalFailureInvestigationItem[] = [];
  const nctIds = [record.nctId];

  const missingResults = !record.registryReportedResults.hasResultsSection;
  const missingPublications = record.publishedOutcomes.every((p) => !p.pmid);
  const unmapped = record.interventionTargetMapping.unmappedInterventionNames.length > 0;
  const noTargets = record.interventionTargetMapping.mappedTargets.length === 0;
  const hasMissingKinds = record.missingOutcomeEvidence.length > 0;

  // Evidence-gap investigation bins — never causal verdicts from status alone.
  if (missingResults || missingPublications || hasMissingKinds) {
    items.push(
      sealItem({
        id: itemId({
          category: "insufficient_evidence",
          source: "registry_evidence_gap",
          anchor: record.nctId,
        }),
        category: "insufficient_evidence",
        rationale:
          `Registry/publication evidence gaps open an insufficient_evidence investigation bin for ${record.nctId}. ` +
          `${statusHonesty.note} Absence of posted results or PMIDs is not clinical failure adjudication.`,
        source: "registry_evidence_gap",
        linkedNctIds: nctIds,
        linkedContractIds: [...input.contractIds],
        linkedComparisonIds: [],
        registryOverallStatus: record.registration.overallStatus,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }

  if (unmapped || noTargets) {
    items.push(
      sealItem({
        id: itemId({
          category: "weak_human_target_validation",
          source: "target_mapping_gap",
          anchor: record.nctId,
        }),
        category: "weak_human_target_validation",
        rationale:
          `Intervention↔target mapping is incomplete for ${record.nctId}. ` +
          `Open weak_human_target_validation as an investigation label — not a verified failure of target validity.`,
        source: "target_mapping_gap",
        linkedNctIds: nctIds,
        linkedContractIds: [...input.contractIds],
        linkedComparisonIds: [],
        registryOverallStatus: record.registration.overallStatus,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }

  // Human biomarker / engagement depth is unknown on registry attach — investigation only.
  if (missingResults && !noTargets) {
    items.push(
      sealItem({
        id: itemId({
          category: "insufficient_target_engagement",
          source: "contract_unknowns",
          anchor: record.nctId,
        }),
        category: "insufficient_target_engagement",
        rationale:
          `Mapped targets exist for ${record.nctId} but registry results/biomarker planes are incomplete. ` +
          `Open insufficient_target_engagement as an investigation label — not proof of failed engagement.`,
        source: "contract_unknowns",
        linkedNctIds: nctIds,
        linkedContractIds: [...input.contractIds],
        linkedComparisonIds: [],
        registryOverallStatus: record.registration.overallStatus,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }

  // Explicit refusal when terminal/recruiting status might tempt causal inference.
  if (isTerminalOrRecruitingStatus(record.registration.overallStatus)) {
    items.push(
      sealItem({
        id: itemId({
          category: "insufficient_evidence",
          source: "registry_evidence_gap",
          anchor: `${record.nctId}:status_alone_refusal`,
        }),
        category: "insufficient_evidence",
        rationale:
          `Registry status “${record.registration.overallStatus}” alone does not select safety, dose/timing, ` +
          `endpoint/design, or other causal failure categories. ${statusHonesty.note}`,
        source: "registry_evidence_gap",
        linkedNctIds: nctIds,
        linkedContractIds: [...input.contractIds],
        linkedComparisonIds: [],
        registryOverallStatus: record.registration.overallStatus,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }

  return items;
}

function proposeFromContradiction(
  assessment: ContradictionInvestigationAssessment,
): TranslationalFailureInvestigationItem[] {
  const items: TranslationalFailureInvestigationItem[] = [];
  for (const row of assessment.items) {
    const mapped = mapContradictionCategory(row.category);
    if (!mapped) continue;
    // Tissue mismatch: only when context_mismatch rationale mentions tissue, else model/human.
    let category = mapped;
    if (
      row.category === "context_mismatch" &&
      /tissue/i.test(row.rationale)
    ) {
      category = "tissue_mismatch";
    }
    items.push(
      sealItem({
        id: itemId({
          category,
          source: "contradiction_investigation",
          anchor: row.comparisonId,
        }),
        category,
        rationale:
          `Mapped from M2 contradiction investigation category “${row.category}” ` +
          `(comparison ${row.comparisonId}). Investigation label only — not a fabricated clinical failure cause.`,
        source: "contradiction_investigation",
        linkedNctIds: [],
        linkedContractIds: [],
        linkedComparisonIds: [row.comparisonId],
        registryOverallStatus: null,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }
  return items;
}

function proposeFromComparisonPack(
  pack: StructuredEvidenceComparisonPack,
): TranslationalFailureInvestigationItem[] {
  const items: TranslationalFailureInvestigationItem[] = [];
  for (const comparison of pack.comparisons) {
    let category: TranslationalFailureInvestigationCategory | null = null;
    if (comparison.outcome === "context_dependent") {
      const tissueAxis = comparison.trace.contextAxes.some(
        (a) =>
          a.axis === "organTissueCellState" && (a.onlyA.length > 0 || a.onlyB.length > 0),
      );
      const speciesAxis = comparison.trace.contextAxes.some(
        (a) =>
          a.axis === "experimentalSystemsSpecies" &&
          (a.onlyA.length > 0 || a.onlyB.length > 0),
      );
      if (tissueAxis) category = "tissue_mismatch";
      else if (speciesAxis) category = "model_to_human_mismatch";
      else category = "model_to_human_mismatch";
    } else if (comparison.outcome === "methodological_difference") {
      category = "endpoint_design";
    } else if (
      comparison.outcome === "insufficient_evidence" ||
      comparison.outcome === "insufficient_comparability"
    ) {
      category = "insufficient_evidence";
    }
    if (!category) continue;
    items.push(
      sealItem({
        id: itemId({
          category,
          source: "structured_comparison",
          anchor: comparison.id,
        }),
        category,
        rationale:
          `Structured comparison ${comparison.id} outcome “${comparison.outcome}” opens ` +
          `${category} as an investigation label. Not a predetermined translational failure conclusion.`,
        source: "structured_comparison",
        linkedNctIds: [],
        linkedContractIds: [],
        linkedComparisonIds: [comparison.id],
        registryOverallStatus: null,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }
  return items;
}

function proposeCuratorDeclared(input: {
  categories: readonly TranslationalFailureInvestigationCategory[];
  nctIds?: readonly string[];
  note?: string;
}): TranslationalFailureInvestigationItem[] {
  return input.categories.map((category) =>
    sealItem({
      id: itemId({
        category,
        source: "curator_declared",
        anchor: `${category}:${(input.nctIds ?? []).join(",") || "none"}`,
      }),
      category,
      rationale:
        input.note?.trim() ||
        `Curator-declared investigation category “${category}”. Remains a review label — not auto-verified clinical failure.`,
      source: "curator_declared",
      linkedNctIds: unique(input.nctIds ?? []),
      linkedContractIds: [],
      linkedComparisonIds: [],
      registryOverallStatus: null,
      predeterminedConclusion: false,
      causalFailureFabricated: false,
      recruitmentOrTerminationIsNotClinicalFailure: true,
      needsHumanReview: true,
      scientificallyVerified: false,
    }),
  );
}

/**
 * Build a translational failure-mode investigation assessment.
 * Labels are investigation bins; registry status alone never selects causal causes.
 */
export function assessTranslationalFailureInvestigation(input: {
  contractPack: TranslationalEvidenceContractPack;
  landscape?: TranslationalLandscapeSnapshot | null;
  contradictionInvestigation?: ContradictionInvestigationAssessment | null;
  comparisonPack?: StructuredEvidenceComparisonPack | null;
  curatorDeclaredCategories?: readonly TranslationalFailureInvestigationCategory[];
  curatorNote?: string;
  generatedAt?: string;
}): TranslationalFailureInvestigationAssessment {
  const generatedAt = input.generatedAt ?? input.contractPack.generatedAt;
  const landscape = input.landscape ?? null;
  const items: TranslationalFailureInvestigationItem[] = [];

  // Contract unknowns always surface insufficient_evidence when failure_mode is unknown.
  const failureModeUnknown = input.contractPack.contracts.some((c) =>
    c.unknowns.includes("failure_mode"),
  );
  if (failureModeUnknown) {
    const contractIds = input.contractPack.contracts.map((c) => c.id);
    const nctIds = unique(input.contractPack.contracts.flatMap((c) => c.linkedNctIds));
    items.push(
      sealItem({
        id: itemId({
          category: "insufficient_evidence",
          source: "contract_unknowns",
          anchor: "failure_mode_unknown",
        }),
        category: "insufficient_evidence",
        rationale:
          "Translational contracts record failure_mode as unknown. " +
          "Open insufficient_evidence investigation — do not invent a causal failure explanation.",
        source: "contract_unknowns",
        linkedNctIds: nctIds,
        linkedContractIds: contractIds,
        linkedComparisonIds: [],
        registryOverallStatus: null,
        predeterminedConclusion: false,
        causalFailureFabricated: false,
        recruitmentOrTerminationIsNotClinicalFailure: true,
        needsHumanReview: true,
        scientificallyVerified: false,
      }),
    );
  }

  if (landscape) {
    for (const record of landscape.records) {
      const contractIds = input.contractPack.contracts
        .filter((c) => c.linkedNctIds.includes(record.nctId))
        .map((c) => c.id);
      items.push(...proposeFromTrial({record, contractIds}));
    }
  }

  if (input.contradictionInvestigation) {
    items.push(...proposeFromContradiction(input.contradictionInvestigation));
  }
  if (input.comparisonPack) {
    items.push(...proposeFromComparisonPack(input.comparisonPack));
  }
  if (input.curatorDeclaredCategories?.length) {
    for (const category of input.curatorDeclaredCategories) {
      if (
        !(TRANSLATIONAL_FAILURE_INVESTIGATION_CATEGORIES as readonly string[]).includes(
          category,
        )
      ) {
        fail(`Unknown translational failure investigation category: ${category}`);
      }
    }
    items.push(
      ...proposeCuratorDeclared({
        categories: input.curatorDeclaredCategories,
        nctIds: unique(input.contractPack.contracts.flatMap((c) => c.linkedNctIds)),
        note: input.curatorNote,
      }),
    );
  }

  // Guard: never auto-propose curator-or-comparison-only causes without those sources.
  for (const item of items) {
    if (
      CURATOR_OR_COMPARISON_ONLY.has(item.category) &&
      item.source !== "curator_declared" &&
      item.source !== "structured_comparison" &&
      item.source !== "contradiction_investigation"
    ) {
      fail(
        `Category ${item.category} must not be auto-proposed from registry status or contract unknowns alone`,
      );
    }
  }

  // Dedupe by id (stable hash) while preserving first rationale.
  const seen = new Set<string>();
  const deduped: TranslationalFailureInvestigationItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  const byCategory = emptyCategoryCounts();
  for (const item of deduped) {
    byCategory[item.category] += 1;
  }

  const statusAloneCauseRefusals = deduped.filter(
    (i) =>
      i.category === "insufficient_evidence" &&
      /status “|status alone/i.test(i.rationale),
  ).length;

  const persistenceLines = deduped.map(
    (i) =>
      `translational_failure_investigation:${i.category}:id=${i.id}:source=${i.source}:nct=${i.linkedNctIds.join("|") || "none"}:predetermined=false`,
  );

  const assessment: TranslationalFailureInvestigationAssessment = {
    schemaVersion: TRANSLATIONAL_FAILURE_TAXONOMY_SCHEMA,
    method: TRANSLATIONAL_FAILURE_TAXONOMY_METHOD,
    version: TRANSLATIONAL_FAILURE_TAXONOMY_VERSION,
    generatedAt,
    assessmentId: `tfi-pack:${createHash("sha256")
      .update(
        canonicalEvidenceJson({
          generatedAt,
          ids: deduped.map((i) => i.id).sort(),
        }),
      )
      .digest("hex")
      .slice(0, 24)}`,
    contractPackMethod: input.contractPack.method,
    comparisonPackId: input.comparisonPack
      ? `cmp-pack:${input.comparisonPack.comparisons.length}`
      : null,
    contradictionAssessmentMethod: input.contradictionInvestigation?.method ?? null,
    items: deduped,
    summary: {
      byCategory,
      curatorDeclared: deduped.filter((i) => i.source === "curator_declared").length,
      autoProposedFromEvidenceGaps: deduped.filter(
        (i) =>
          i.source === "registry_evidence_gap" ||
          i.source === "target_mapping_gap" ||
          i.source === "contract_unknowns",
      ).length,
      linkedFromStructuredComparison: deduped.filter(
        (i) =>
          i.source === "structured_comparison" || i.source === "contradiction_investigation",
      ).length,
      statusAloneCauseRefusals,
    },
    persistenceLines,
    honesty: {
      categoriesAreInvestigationLabelsNotConclusions: true,
      recruitmentOrTerminationIsNotClinicalFailure: true,
      causalFailureExplanationsNotFabricated: true,
      absenceOfPublishedEvidenceIsNotAbsenceOfActivity: true,
      proprietaryProgrammesNotInvented: true,
      patientTreatmentRecommendation: false,
      scientificApproval: false,
      graphPromotable: false,
      gateCAutoApprove: false,
      cdsPhi: false,
      fixturesAreNotLiveEvidence: true,
      projectedFromTranslationalContracts: true,
    },
  };

  if (
    assessment.honesty.scientificApproval !== false ||
    assessment.honesty.graphPromotable !== false ||
    assessment.honesty.patientTreatmentRecommendation !== false
  ) {
    fail("Failure taxonomy assessment must stay unapproved / non-clinical");
  }
  return assessment;
}

/**
 * Thin projector for research-brief / gap persistence.
 */
export function projectTranslationalFailurePersistenceLines(
  assessment: TranslationalFailureInvestigationAssessment,
): readonly string[] {
  return assessment.persistenceLines;
}
