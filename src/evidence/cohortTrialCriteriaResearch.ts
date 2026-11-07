/**
 * N5 cohort / trial criteria research.
 * Timestamped public-registry snapshots + criterion-level inspection over
 * synthetic validation cohorts. Never assesses live patient eligibility,
 * enrolment suitability, or CDS/PHI surfaces.
 */
import {createHash} from "node:crypto";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {
  assessCohortStudyOverlap,
  importPublicStudies,
  type PublicStudy,
} from "../knowledgeGraph/cohortTrials";
import type {ValidationProfile} from "../knowledgeGraph/domainGraph";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  CRITERION_STATES,
  FORBIDDEN_ELIGIBILITY_PHRASES,
  containsForbiddenEligibilityLanguage,
  type CriterionState,
} from "../trialsCriteriaMvp";

export const N5_CRITERIA_RESEARCH_SCHEMA = "hsi-n5-cohort-trial-criteria-1" as const;
export const N5_REGISTRY_SNAPSHOT_SCHEMA = "hsi-n5-registry-criteria-snapshot-1" as const;
export const N5_METHOD = "hsi-n5-public-registry-criterion-inspection-1" as const;

export type GateStatus = "CLEARED" | "BLOCKED";

export type DiseaseAliasFamily = "type_1_diabetes" | "type_2_diabetes" | "other" | "unresolved";

export type CriterionParseKind =
  | "structured_age_bound"
  | "structured_condition_alias"
  | "structured_boolean_attr"
  | "unstructured_requires_review"
  | "unparsed_remainder";

export type CriterionLogic = "and" | "or" | "not" | "unspecified";

export type CriterionSourceSpan = {
  start: number;
  end: number;
  excerpt: string;
};

export type ParsedCriterionRule = {
  criterionId: string;
  text: string;
  parseKind: CriterionParseKind;
  logic: CriterionLogic;
  /** Narrow structured fields only — never invents unstated protocol facts. */
  attributeKey: string | null;
  operator: "gte" | "lte" | "eq" | "present" | null;
  expected: string | number | boolean | null;
  unit: string | null;
  temporalConstraint: string | null;
  diseaseAliasFamily: DiseaseAliasFamily | null;
  sourceSpan: CriterionSourceSpan;
  structuredRuleSupported: boolean;
};

export type N5RegistryCriteriaSnapshot = {
  schemaVersion: typeof N5_REGISTRY_SNAPSHOT_SCHEMA;
  origin: "operator_supplied_unverified";
  scope: "public_registry_eligibility_research";
  containsPhi: false;
  retrievedAt: string;
  asOf: string;
  studies: PublicStudy[];
  criteriaByNct: Record<string, ParsedCriterionRule[]>;
  liveRegistryQueried: false;
  liveStatusVerified: false;
};

export type SyntheticCohortFact = {
  caseId: string;
  dataClass: "synthetic";
  containsPhi: false;
  condition: string;
  age: number;
  sex: string;
  diseaseStage: string | null;
  autoantibodiesRecorded: boolean | null;
  cPeptideRecorded: boolean | null;
  medicationTimingKnown: boolean;
  medications: string[];
  lastHba1c: number | null;
  attrs: Record<string, string | number | boolean | undefined>;
};

export type CriterionInspection = {
  criterionId: string;
  nctId: string;
  caseId: string;
  state: CriterionState;
  parseKind: CriterionParseKind;
  method: string;
  attributeKey: string | null;
  attributePresent: boolean;
  sourceSpan: CriterionSourceSpan;
  notes: string;
  confirmedEligible: false;
};

export type CohortTrialCriteriaReport = {
  schemaVersion: typeof N5_CRITERIA_RESEARCH_SCHEMA;
  method: typeof N5_METHOD;
  programme: "gut_immune_t2d";
  generatedAt: string;
  asOf: string;
  snapshotHash: string;
  nctId: string;
  studyTitle: string;
  cohortSize: number;
  inspections: CriterionInspection[];
  overlapSummary: ReturnType<typeof assessCohortStudyOverlap>;
  satisfiedCount: number;
  notSatisfiedCount: number;
  unknownCount: number;
  ambiguousCount: number;
  requiresInvestigatorReviewCount: number;
  overallLabel: "criterion_assessment_only";
  confirmedEligible: false;
  patientEligible: false;
  patientEligibilityAssessed: false;
  liveRegistryQueried: false;
  enrolmentEnabled: false;
  clinicalAdvice: false;
  containsPhi: false;
  scientificApproval: false;
  graphPromotable: false;
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
  honesty: string[];
  pins: {
    n2LedgerHash: string | null;
    n3KitHash: string | null;
  };
};

export type N5SuiteReceipt = {
  schemaVersion: "hsi-n5-suite-receipt-1";
  generatedAt: string;
  asOf: string;
  snapshotHash: string;
  reports: CohortTrialCriteriaReport[];
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
  confirmedEligible: false;
  patientEligibilityAssessed: false;
  liveRegistryQueried: false;
};

const CONDITION_ALIASES: Record<string, DiseaseAliasFamily> = {
  "diabetes mellitus, type 1": "type_1_diabetes",
  "type 1 diabetes mellitus": "type_1_diabetes",
  "type 1 diabetes": "type_1_diabetes",
  t1d: "type_1_diabetes",
  "diabetes mellitus, type 2": "type_2_diabetes",
  "type 2 diabetes mellitus": "type_2_diabetes",
  "type 2 diabetes": "type_2_diabetes",
  t2d: "type_2_diabetes",
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normCondition(s: string): string {
  return s.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ").replaceAll("’", "'");
}

export function classifyDiseaseAlias(condition: string): DiseaseAliasFamily {
  const key = normCondition(condition);
  if (CONDITION_ALIASES[key]) return CONDITION_ALIASES[key];
  // Generic "diabetes" / "diabetes mellitus" stay unresolved — never auto-map to T1D or T2D.
  if (key === "diabetes" || key === "diabetes mellitus") return "unresolved";
  return "other";
}

function spanFor(text: string, excerpt: string): CriterionSourceSpan {
  const start = text.indexOf(excerpt);
  if (start < 0) {
    throw new Error("Criterion excerpt must be an exact span of eligibility text");
  }
  return {start, end: start + excerpt.length, excerpt};
}

/**
 * Parse public eligibility text into inspectable criteria.
 * Only age bounds and explicit T1D/T2D condition lines become structured rules;
 * everything else stays unstructured / unparsed and forces investigator review.
 */
export function parseEligibilityCriteriaText(eligibilityText: string | null, nctId: string): ParsedCriterionRule[] {
  if (eligibilityText === null || !eligibilityText.trim()) {
    return [
      {
        criterionId: `${nctId}-missing-criteria`,
        text: "Eligibility criteria text missing from registry snapshot",
        parseKind: "unparsed_remainder",
        logic: "unspecified",
        attributeKey: null,
        operator: null,
        expected: null,
        unit: null,
        temporalConstraint: null,
        diseaseAliasFamily: null,
        sourceSpan: {start: 0, end: 0, excerpt: ""},
        structuredRuleSupported: false,
      },
    ];
  }
  if (containsForbiddenEligibilityLanguage(eligibilityText)) {
    throw new Error("Fail closed: registry eligibility text contains forbidden enrolment language");
  }
  if (!rejectPhiPayload({textBlobs: [eligibilityText]}).ok) {
    throw new Error("Fail closed: eligibility text rejected by PHI boundary");
  }

  const rules: ParsedCriterionRule[] = [];
  const lines = eligibilityText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let idx = 0;

  for (const line of lines) {
    idx += 1;
    const id = `${nctId}-c-${String(idx).padStart(2, "0")}`;
    const sourceSpan = spanFor(eligibilityText, line);

    const ageMin = /^age\s*≥\s*(\d+(?:\.\d+)?)\s*years?/i.exec(line)
      ?? /^minimum age[:\s]+(\d+(?:\.\d+)?)\s*years?/i.exec(line);
    const ageMax = /^age\s*≤\s*(\d+(?:\.\d+)?)\s*years?/i.exec(line)
      ?? /^maximum age[:\s]+(\d+(?:\.\d+)?)\s*years?/i.exec(line);
    const ageRange = /^age\s+(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*years?/i.exec(line);

    if (ageMin) {
      rules.push({
        criterionId: id,
        text: line,
        parseKind: "structured_age_bound",
        logic: "and",
        attributeKey: "age_years",
        operator: "gte",
        expected: Number(ageMin[1]),
        unit: "years",
        temporalConstraint: null,
        diseaseAliasFamily: null,
        sourceSpan,
        structuredRuleSupported: true,
      });
      continue;
    }
    if (ageMax) {
      rules.push({
        criterionId: id,
        text: line,
        parseKind: "structured_age_bound",
        logic: "and",
        attributeKey: "age_years",
        operator: "lte",
        expected: Number(ageMax[1]),
        unit: "years",
        temporalConstraint: null,
        diseaseAliasFamily: null,
        sourceSpan,
        structuredRuleSupported: true,
      });
      continue;
    }
    if (ageRange) {
      // Represent as two structured age bounds sharing the same source span text.
      rules.push({
        criterionId: `${id}-min`,
        text: line,
        parseKind: "structured_age_bound",
        logic: "and",
        attributeKey: "age_years",
        operator: "gte",
        expected: Number(ageRange[1]),
        unit: "years",
        temporalConstraint: null,
        diseaseAliasFamily: null,
        sourceSpan,
        structuredRuleSupported: true,
      });
      rules.push({
        criterionId: `${id}-max`,
        text: line,
        parseKind: "structured_age_bound",
        logic: "and",
        attributeKey: "age_years",
        operator: "lte",
        expected: Number(ageRange[2]),
        unit: "years",
        temporalConstraint: null,
        diseaseAliasFamily: null,
        sourceSpan,
        structuredRuleSupported: true,
      });
      continue;
    }

    const diagnosis = /^(?:diagnosis of|documented)\s+(.+)$/i.exec(line);
    if (diagnosis) {
      const family = classifyDiseaseAlias(diagnosis[1].replace(/\.$/, ""));
      if (family === "type_1_diabetes" || family === "type_2_diabetes") {
        rules.push({
          criterionId: id,
          text: line,
          parseKind: "structured_condition_alias",
          logic: "and",
          attributeKey: "condition_family",
          operator: "eq",
          expected: family,
          unit: null,
          temporalConstraint: null,
          diseaseAliasFamily: family,
          sourceSpan,
          structuredRuleSupported: true,
        });
        continue;
      }
      rules.push({
        criterionId: id,
        text: line,
        parseKind: "unstructured_requires_review",
        logic: family === "unresolved" ? "and" : "unspecified",
        attributeKey: "condition_family",
        operator: null,
        expected: null,
        unit: null,
        temporalConstraint: null,
        diseaseAliasFamily: family,
        sourceSpan,
        structuredRuleSupported: false,
      });
      continue;
    }

    // Autoantibody / C-peptide / medication timing / disease stage stay review-gated.
    const reviewHeavy =
      /autoantibody|c-peptide|c peptide|disease stage|washout|prior therapy|investigator|judgement|judgment|medication timing|current medication/i.test(
        line,
      );
    rules.push({
      criterionId: id,
      text: line,
      parseKind: reviewHeavy ? "unstructured_requires_review" : "unparsed_remainder",
      logic: /^(?:or|either)\b/i.test(line) ? "or" : /^(?:not|exclusion|no )\b/i.test(line) ? "not" : "and",
      attributeKey: null,
      operator: null,
      expected: null,
      unit: null,
      temporalConstraint: /within\s+\d+\s+(?:days|weeks|months)/i.exec(line)?.[0] ?? null,
      diseaseAliasFamily: null,
      sourceSpan,
      structuredRuleSupported: false,
    });
  }

  return rules;
}

export function buildN5RegistrySnapshot(input: {
  retrievedAt: string;
  asOf: string;
  clinicalTrialsGovJson: unknown;
}): N5RegistryCriteriaSnapshot {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(input.retrievedAt) || !/^\d{4}-\d{2}-\d{2}T/.test(input.asOf)) {
    throw new Error("retrievedAt and asOf must be ISO timestamps");
  }
  if (Date.parse(input.retrievedAt) > Date.parse(input.asOf)) {
    throw new Error("Future registry retrieval cannot be assessed");
  }
  const studies = importPublicStudies(input.clinicalTrialsGovJson);
  const criteriaByNct: Record<string, ParsedCriterionRule[]> = {};
  for (const s of studies) {
    criteriaByNct[s.nctId] = parseEligibilityCriteriaText(s.eligibilityText, s.nctId);
  }
  return {
    schemaVersion: N5_REGISTRY_SNAPSHOT_SCHEMA,
    origin: "operator_supplied_unverified",
    scope: "public_registry_eligibility_research",
    containsPhi: false,
    retrievedAt: input.retrievedAt,
    asOf: input.asOf,
    studies,
    criteriaByNct,
    liveRegistryQueried: false,
    liveStatusVerified: false,
  };
}

export function parseN5RegistrySnapshot(value: unknown): N5RegistryCriteriaSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid N5 registry snapshot");
  }
  const s = value as N5RegistryCriteriaSnapshot;
  if (
    s.schemaVersion !== N5_REGISTRY_SNAPSHOT_SCHEMA
    || s.origin !== "operator_supplied_unverified"
    || s.scope !== "public_registry_eligibility_research"
    || s.containsPhi !== false
    || s.liveRegistryQueried !== false
    || s.liveStatusVerified !== false
    || !Array.isArray(s.studies)
    || s.studies.length === 0
    || s.studies.length > 50
  ) {
    throw new Error("Invalid N5 registry snapshot envelope");
  }
  for (const study of s.studies) {
    const rules = s.criteriaByNct[study.nctId];
    if (!Array.isArray(rules) || !rules.length) {
      throw new Error(`Missing criteria for ${study.nctId}`);
    }
    for (const r of rules) {
      if (r.structuredRuleSupported && (r.attributeKey === null || r.operator === null)) {
        throw new Error(`Structured rule ${r.criterionId} missing attribute/operator`);
      }
      if (containsForbiddenEligibilityLanguage(r.text)) {
        throw new Error("Forbidden eligibility language in parsed criterion");
      }
    }
  }
  return s;
}

export function snapshotHash(snapshot: N5RegistryCriteriaSnapshot): string {
  return sha256(canonicalEvidenceJson(snapshot));
}

export function toValidationProfiles(facts: SyntheticCohortFact[]): ValidationProfile[] {
  return facts.map((f) => {
    if (f.dataClass !== "synthetic" || f.containsPhi !== false || !/^SYN-P-\d{6}$/.test(f.caseId)) {
      throw new Error("N5 accepts synthetic non-PHI validation facts only");
    }
    return {
      caseId: f.caseId,
      dataClass: "synthetic" as const,
      condition: f.condition,
      age: f.age,
      sex: f.sex,
      bmi: 24,
      lastHba1c: f.lastHba1c,
      medications: f.medications,
    };
  });
}

function evalStructuredRule(
  rule: ParsedCriterionRule,
  fact: SyntheticCohortFact,
): {state: CriterionState; method: string; attributePresent: boolean; notes: string} {
  if (!rule.structuredRuleSupported || !rule.attributeKey || !rule.operator) {
    return {
      state: "requires_investigator_review",
      method: "unstructured_force_review",
      attributePresent: false,
      notes: "Structured rule not supported for this criterion",
    };
  }

  if (rule.parseKind === "structured_condition_alias") {
    const family = classifyDiseaseAlias(fact.condition);
    if (family === "unresolved") {
      return {
        state: "ambiguous",
        method: "generic_diabetes_alias_unresolved",
        attributePresent: true,
        notes: "Generic diabetes label is not an exact T1D/T2D match",
      };
    }
    if (family === "other") {
      return {
        state: "not_satisfied",
        method: "condition_alias_mismatch",
        attributePresent: true,
        notes: `Recorded condition family ${family} vs required ${rule.expected}`,
      };
    }
    const ok = family === rule.expected;
    return {
      state: ok ? "satisfied" : "not_satisfied",
      method: "narrow_condition_alias",
      attributePresent: true,
      notes: ok
        ? "Exact controlled alias match — not confirmed eligibility"
        : "Condition alias does not match required disease family",
    };
  }

  if (rule.attributeKey === "age_years") {
    const age = fact.age;
    if (rule.operator === "gte" && typeof rule.expected === "number") {
      return {
        state: age >= rule.expected ? "satisfied" : "not_satisfied",
        method: "structured_age_gte",
        attributePresent: true,
        notes: "Age bound only — not a complete criterion assessment",
      };
    }
    if (rule.operator === "lte" && typeof rule.expected === "number") {
      return {
        state: age <= rule.expected ? "satisfied" : "not_satisfied",
        method: "structured_age_lte",
        attributePresent: true,
        notes: "Age bound only — not a complete criterion assessment",
      };
    }
  }

  const raw = fact.attrs[rule.attributeKey];
  const present = raw !== undefined && raw !== null && raw !== "";
  if (!present) {
    return {
      state: "unknown",
      method: "attribute_missing",
      attributePresent: false,
      notes: "Missing structured attribute remains unknown",
    };
  }
  if (rule.operator === "eq") {
    return {
      state: raw === rule.expected ? "satisfied" : "not_satisfied",
      method: "structured_eq",
      attributePresent: true,
      notes: "Structured equality only",
    };
  }
  return {
    state: "ambiguous",
    method: "unsupported_structured_operator",
    attributePresent: true,
    notes: "Operator not supported without clarification",
  };
}

export function inspectCriterionAgainstFact(input: {
  nctId: string;
  rule: ParsedCriterionRule;
  fact: SyntheticCohortFact;
}): CriterionInspection {
  if (input.fact.containsPhi || input.fact.dataClass !== "synthetic") {
    throw new Error("Fail closed: N5 inspects synthetic non-PHI cohort facts only");
  }

  let state: CriterionState;
  let method: string;
  let attributePresent: boolean;
  let notes: string;

  if (
    input.rule.parseKind === "unstructured_requires_review"
    || input.rule.parseKind === "unparsed_remainder"
  ) {
    // Missing disease-stage / autoantibody / C-peptide / medication timing stay unresolved.
    if (
      /autoantibody/i.test(input.rule.text)
      && input.fact.autoantibodiesRecorded === null
    ) {
      state = "unknown";
      method = "autoantibody_context_missing";
      attributePresent = false;
      notes = "Autoantibody context not recorded on synthetic profile";
    } else if (/c-peptide|c peptide/i.test(input.rule.text) && input.fact.cPeptideRecorded === null) {
      state = "unknown";
      method = "c_peptide_context_missing";
      attributePresent = false;
      notes = "C-peptide context not recorded on synthetic profile";
    } else if (/disease stage/i.test(input.rule.text) && input.fact.diseaseStage === null) {
      state = "unknown";
      method = "disease_stage_missing";
      attributePresent = false;
      notes = "Disease stage not recorded";
    } else if (
      /medication|washout|prior therapy/i.test(input.rule.text)
      && !input.fact.medicationTimingKnown
    ) {
      state = "ambiguous";
      method = "medication_timing_unknown";
      attributePresent = input.fact.medications.length > 0;
      notes = "Medication exposure without timing is not contemporaneous treatment";
    } else {
      state = "requires_investigator_review";
      method = "unstructured_or_unparsed_force_review";
      attributePresent = false;
      notes = "Unstructured registry criterion — never auto-resolved";
    }
  } else {
    const evaluated = evalStructuredRule(input.rule, input.fact);
    state = evaluated.state;
    method = evaluated.method;
    attributePresent = evaluated.attributePresent;
    notes = evaluated.notes;
  }

  if (!(CRITERION_STATES as readonly string[]).includes(state)) {
    throw new Error(`Unknown criterion state: ${state}`);
  }

  return {
    criterionId: input.rule.criterionId,
    nctId: input.nctId,
    caseId: input.fact.caseId,
    state,
    parseKind: input.rule.parseKind,
    method,
    attributeKey: input.rule.attributeKey,
    attributePresent,
    sourceSpan: input.rule.sourceSpan,
    notes,
    confirmedEligible: false,
  };
}

export function assessCohortTrialCriteria(input: {
  snapshot: N5RegistryCriteriaSnapshot;
  nctId: string;
  facts: SyntheticCohortFact[];
  generatedAt: string;
  n2LedgerHash?: string | null;
  n3KitHash?: string | null;
}): CohortTrialCriteriaReport {
  const snapshot = parseN5RegistrySnapshot(input.snapshot);
  if (snapshot.liveRegistryQueried !== false || snapshot.liveStatusVerified !== false) {
    throw new Error("Fail closed: live registry query flags must remain false");
  }
  const study = snapshot.studies.find((s) => s.nctId === input.nctId);
  if (!study) throw new Error(`Unknown NCT in snapshot: ${input.nctId}`);
  const rules = snapshot.criteriaByNct[input.nctId];
  if (!rules?.length) throw new Error(`No parsed criteria for ${input.nctId}`);

  const profiles = toValidationProfiles(input.facts);
  const overlapSummary = assessCohortStudyOverlap(profiles, study);
  if (overlapSummary.confirmedEligible !== false || overlapSummary.patientEligibilityAssessed !== false) {
    throw new Error("Fail closed: overlap helper must not claim eligibility");
  }

  const inspections: CriterionInspection[] = [];
  for (const fact of input.facts) {
    for (const rule of rules) {
      inspections.push(inspectCriterionAgainstFact({nctId: input.nctId, rule, fact}));
    }
  }

  const count = (state: CriterionState) => inspections.filter((i) => i.state === state).length;
  const report: CohortTrialCriteriaReport = {
    schemaVersion: N5_CRITERIA_RESEARCH_SCHEMA,
    method: N5_METHOD,
    programme: "gut_immune_t2d",
    generatedAt: input.generatedAt,
    asOf: snapshot.asOf,
    snapshotHash: snapshotHash(snapshot),
    nctId: study.nctId,
    studyTitle: study.title,
    cohortSize: input.facts.length,
    inspections,
    overlapSummary,
    satisfiedCount: count("satisfied"),
    notSatisfiedCount: count("not_satisfied"),
    unknownCount: count("unknown"),
    ambiguousCount: count("ambiguous"),
    requiresInvestigatorReviewCount: count("requires_investigator_review"),
    overallLabel: "criterion_assessment_only",
    confirmedEligible: false,
    patientEligible: false,
    patientEligibilityAssessed: false,
    liveRegistryQueried: false,
    enrolmentEnabled: false,
    clinicalAdvice: false,
    containsPhi: false,
    scientificApproval: false,
    graphPromotable: false,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    honesty: [
      "N5 is public-registry criterion research over synthetic validation cohorts only.",
      "A recorded age match is not a complete criterion assessment.",
      "A list of satisfied criteria is not confirmed eligibility.",
      "T1D and T2D aliases stay narrow; generic diabetes remains unresolved.",
      "Missing/ambiguous autoantibody, C-peptide, disease-stage and medication-timing facts stay unresolved.",
      "confirmedEligible=false · patientEligible=false · enrolmentEnabled=false always.",
      "No live CDS/PHI, Gate C auto-approve, or invented trial enrolment.",
      ...FORBIDDEN_ELIGIBILITY_PHRASES.map((p) => `Forbidden phrase retained as ban token only: ${p}`),
    ],
    pins: {
      n2LedgerHash: input.n2LedgerHash ?? null,
      n3KitHash: input.n3KitHash ?? null,
    },
  };

  const publicBlob = JSON.stringify({
    overallLabel: report.overallLabel,
    inspections: report.inspections.map((i) => ({state: i.state, method: i.method, notes: i.notes})),
  });
  // Honesty may discuss banned phrases; public assessment fields must not affirm enrolment.
  if (
    /\bconfirmed eligible\b|\bpatient eligible\b|\bfully eligible\b|\beligible for enrol?ment\b/i.test(
      publicBlob,
    )
  ) {
    throw new Error("Fail closed: forbidden eligibility language leaked into N5 report");
  }
  return report;
}

export function parseCohortTrialCriteriaReport(value: unknown): CohortTrialCriteriaReport {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid N5 report");
  }
  const r = value as CohortTrialCriteriaReport;
  if (
    r.schemaVersion !== N5_CRITERIA_RESEARCH_SCHEMA
    || r.method !== N5_METHOD
    || r.confirmedEligible !== false
    || r.patientEligible !== false
    || r.patientEligibilityAssessed !== false
    || r.liveRegistryQueried !== false
    || r.enrolmentEnabled !== false
    || r.clinicalAdvice !== false
    || r.containsPhi !== false
    || r.scientificApproval !== false
    || r.graphPromotable !== false
    || r.overallLabel !== "criterion_assessment_only"
    || r.scientificAcceptance !== "BLOCKED"
  ) {
    throw new Error("N5 report honesty gates failed");
  }
  for (const i of r.inspections) {
    if (i.confirmedEligible !== false) throw new Error("Inspection cannot claim eligibility");
    if (!(CRITERION_STATES as readonly string[]).includes(i.state)) {
      throw new Error(`Invalid criterion state ${i.state}`);
    }
  }
  return r;
}

/** Engineering fixture — not a verified live recruitment assertion. */
export const N5_ENGINEERING_CTGOV_FIXTURE = {
  studies: [
    {
      protocolSection: {
        identificationModule: {
          nctId: "NCT99990061",
          briefTitle:
            "Engineering fixture — T1D public-registry criteria research (not a live recruitment claim)",
        },
        conditionsModule: {
          conditions: ["Diabetes Mellitus, Type 1"],
        },
        statusModule: {
          overallStatus: "COMPLETED",
          lastUpdatePostDateStruct: {date: "2020-01-15"},
        },
        eligibilityModule: {
          minimumAge: "8 Years",
          maximumAge: "45 Years",
          eligibilityCriteria: [
            "Age 8-45 years",
            "Diagnosis of Type 1 diabetes",
            "Documented disease stage at screening",
            "Autoantibody status recorded per protocol",
            "C-peptide measurement within 30 days of screening",
            "Prior therapy washout timing known to investigator",
            "Investigator judgment on concurrent infection risk",
          ].join("\n"),
        },
      },
    },
    {
      protocolSection: {
        identificationModule: {
          nctId: "NCT99990062",
          briefTitle:
            "Engineering fixture — T2D public-registry criteria research (not a live recruitment claim)",
        },
        conditionsModule: {
          conditions: ["Diabetes Mellitus, Type 2"],
        },
        statusModule: {
          overallStatus: "COMPLETED",
          lastUpdatePostDateStruct: {date: "2021-06-01"},
        },
        eligibilityModule: {
          minimumAge: "18 Years",
          maximumAge: "75 Years",
          eligibilityCriteria: [
            "Age ≥ 18 years",
            "Age ≤ 75 years",
            "Diagnosis of Type 2 diabetes",
            "Current medication timing documented",
          ].join("\n"),
        },
      },
    },
  ],
} as const;

export const N5_SYNTHETIC_COHORT_FACTS: readonly SyntheticCohortFact[] = [
  {
    caseId: "SYN-P-000101",
    dataClass: "synthetic",
    containsPhi: false,
    condition: "Type 1 diabetes",
    age: 16,
    sex: "F",
    diseaseStage: null,
    autoantibodiesRecorded: null,
    cPeptideRecorded: null,
    medicationTimingKnown: false,
    medications: ["insulin"],
    lastHba1c: 7.2,
    attrs: {},
  },
  {
    caseId: "SYN-P-000102",
    dataClass: "synthetic",
    containsPhi: false,
    condition: "Type 2 diabetes",
    age: 54,
    sex: "M",
    diseaseStage: null,
    autoantibodiesRecorded: null,
    cPeptideRecorded: null,
    medicationTimingKnown: false,
    medications: ["metformin"],
    lastHba1c: 8.1,
    attrs: {},
  },
  {
    caseId: "SYN-P-000103",
    dataClass: "synthetic",
    containsPhi: false,
    condition: "Diabetes",
    age: 30,
    sex: "F",
    diseaseStage: null,
    autoantibodiesRecorded: null,
    cPeptideRecorded: null,
    medicationTimingKnown: false,
    medications: [],
    lastHba1c: null,
    attrs: {},
  },
] as const;

export function runN5Suite(input: {
  snapshot: N5RegistryCriteriaSnapshot;
  facts: SyntheticCohortFact[];
  generatedAt: string;
  n2LedgerHash?: string | null;
  n3KitHash?: string | null;
}): N5SuiteReceipt {
  const reports = input.snapshot.studies.map((study) =>
    assessCohortTrialCriteria({
      snapshot: input.snapshot,
      nctId: study.nctId,
      facts: [...input.facts],
      generatedAt: input.generatedAt,
      n2LedgerHash: input.n2LedgerHash,
      n3KitHash: input.n3KitHash,
    }),
  );
  for (const r of reports) parseCohortTrialCriteriaReport(r);
  return {
    schemaVersion: "hsi-n5-suite-receipt-1",
    generatedAt: input.generatedAt,
    asOf: input.snapshot.asOf,
    snapshotHash: snapshotHash(input.snapshot),
    reports,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    confirmedEligible: false,
    patientEligibilityAssessed: false,
    liveRegistryQueried: false,
  };
}
