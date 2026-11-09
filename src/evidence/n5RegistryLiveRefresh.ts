/**
 * N5 live public-registry snapshot refresh (production-readiness audit Phase #9).
 * Fetches bounded ClinicalTrials.gov API v2 studies for research snapshot refresh.
 * Always keeps confirmedEligible=false · patientEligible=false · enrolmentEnabled=false.
 * Scientific acceptance stays BLOCKED. Never invents eligibility or enrolment claims.
 */
import type { FetchLike } from "../fetchLike";
import {createHash} from "node:crypto";
import {importPublicStudies, assessCohortStudyOverlap} from "../knowledgeGraph/cohortTrials";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  CTGOV_PROVIDER,
  assertValidNctId,
  lookupClinicalTrialsGovByNctId,
  parseClinicalTrialsGovStudyPayload,
  type CtgovLookupOk,
  type CtgovLookupResult,
} from "./clinicalTrialsGovLookup";
import {
  N5_CRITERIA_RESEARCH_SCHEMA,
  N5_METHOD,
  N5_REGISTRY_SNAPSHOT_SCHEMA,
  N5_SYNTHETIC_COHORT_FACTS,
  inspectCriterionAgainstFact,
  parseEligibilityCriteriaText,
  snapshotHash,
  toValidationProfiles,
  type CriterionInspection,
  type GateStatus,
  type N5RegistryCriteriaSnapshot,
  type ParsedCriterionRule,
  type SyntheticCohortFact,
} from "./cohortTrialCriteriaResearch";
import {
  CRITERION_STATES,
  FORBIDDEN_ELIGIBILITY_PHRASES,
  containsForbiddenEligibilityLanguage,
  type CriterionState,
} from "../trialsCriteriaMvp";

export const N5_LIVE_REFRESH_SCHEMA = "hsi-n5-registry-live-refresh-1" as const;
export const N5_LIVE_SNAPSHOT_SCHEMA = "hsi-n5-registry-criteria-live-snapshot-1" as const;
export const N5_LIVE_METHOD = "hsi-n5-live-public-registry-snapshot-refresh-1" as const;

/**
 * Curated public NCT pins for gut–immune–T2D programme research.
 * Public registry records only — not recruitment claims or eligibility clearance.
 */
export const N5_LIVE_REFRESH_NCT_IDS = ["NCT01030861", "NCT02401880"] as const;

export type N5LiveRefreshNctId = (typeof N5_LIVE_REFRESH_NCT_IDS)[number];

export type N5LiveRegistryCriteriaSnapshot = {
  schemaVersion: typeof N5_LIVE_SNAPSHOT_SCHEMA;
  offlineSchemaCompat: typeof N5_REGISTRY_SNAPSHOT_SCHEMA;
  origin: "live_provider_unverified";
  scope: "public_registry_eligibility_research";
  containsPhi: false;
  retrievedAt: string;
  asOf: string;
  studies: ReturnType<typeof importPublicStudies>;
  criteriaByNct: Record<string, ParsedCriterionRule[]>;
  liveRegistryQueried: true;
  liveStatusVerified: false;
  confirmedEligible: false;
  patientEligibilityAssessed: false;
  enrolmentEnabled: false;
  provider: typeof CTGOV_PROVIDER;
  pinnedNctIds: readonly N5LiveRefreshNctId[];
};

export type N5LiveRefreshLookupRow = {
  nctId: N5LiveRefreshNctId;
  ok: boolean;
  retrievedAt: string | null;
  httpStatus: number | null;
  responseIdentity: string | null;
  outcome: string;
  detail: string | null;
};

/** Live-path criterion report — queried=true, eligibility always false. */
export type N5LiveCriterionReport = {
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
  liveRegistryQueried: true;
  liveStatusVerified: false;
  enrolmentEnabled: false;
  clinicalAdvice: false;
  containsPhi: false;
  scientificApproval: false;
  graphPromotable: false;
  engineeringHarness: GateStatus;
  scientificAcceptance: "BLOCKED";
  honesty: string[];
};

export type N5LiveRefreshReceipt = {
  schemaVersion: typeof N5_LIVE_REFRESH_SCHEMA;
  method: typeof N5_LIVE_METHOD;
  phase: "N5";
  remediationPhase: "production_readiness_audit_phase_9";
  programme: "gut_immune_t2d";
  mode: "live_provider" | "offline_live_fixture_replay";
  generatedAt: string;
  asOf: string;
  retrievedAt: string;
  pinnedNctIds: readonly N5LiveRefreshNctId[];
  provider: typeof CTGOV_PROVIDER;
  providerCapability: {
    provider: typeof CTGOV_PROVIDER;
    probed: boolean;
    reachable: boolean | null;
    detail: string;
  };
  lookups: N5LiveRefreshLookupRow[];
  snapshot: N5LiveRegistryCriteriaSnapshot;
  snapshotHash: string;
  reports: N5LiveCriterionReport[];
  engineeringHarness: "CLEARED";
  scientificAcceptance: "BLOCKED";
  confirmedEligible: false;
  patientEligible: false;
  patientEligibilityAssessed: false;
  liveRegistryQueried: true;
  liveStatusVerified: false;
  enrolmentEnabled: false;
  clinicalAdvice: false;
  containsPhi: false;
  scientificApproval: false;
  graphPromotable: false;
  inventedEligibilityPermitted: false;
  honesty: string[];
  receiptHash: string;
};

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function wrapCtgovStudiesAsImportJson(studies: Record<string, unknown>[]): {
  studies: Record<string, unknown>[];
} {
  if (!studies.length || studies.length > 50) {
    throw new Error("Live refresh accepts 1–50 public registry studies");
  }
  return {studies};
}

export function buildN5LiveRegistrySnapshot(input: {
  retrievedAt: string;
  asOf: string;
  clinicalTrialsGovJson: unknown;
  pinnedNctIds?: readonly N5LiveRefreshNctId[];
}): N5LiveRegistryCriteriaSnapshot {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(input.retrievedAt) || !/^\d{4}-\d{2}-\d{2}T/.test(input.asOf)) {
    throw new Error("retrievedAt and asOf must be ISO timestamps");
  }
  if (Date.parse(input.retrievedAt) > Date.parse(input.asOf)) {
    throw new Error("Future registry retrieval cannot be assessed");
  }
  const pinned = input.pinnedNctIds ?? N5_LIVE_REFRESH_NCT_IDS;
  const studies = importPublicStudies(input.clinicalTrialsGovJson);
  const studyIds = studies.map((s) => s.nctId);
  for (const id of pinned) {
    if (!studyIds.includes(id)) {
      throw new Error(`Live snapshot missing pinned NCT ${id}`);
    }
  }
  if (studyIds.length !== pinned.length || new Set(studyIds).size !== studyIds.length) {
    throw new Error("Live snapshot must contain exactly the pinned NCT set");
  }
  const criteriaByNct: Record<string, ParsedCriterionRule[]> = {};
  for (const s of studies) {
    const rules = parseEligibilityCriteriaText(s.eligibilityText, s.nctId);
    for (const r of rules) {
      if (containsForbiddenEligibilityLanguage(r.text)) {
        throw new Error(`Forbidden eligibility language in live criterion ${r.criterionId}`);
      }
    }
    criteriaByNct[s.nctId] = rules;
  }
  return {
    schemaVersion: N5_LIVE_SNAPSHOT_SCHEMA,
    offlineSchemaCompat: N5_REGISTRY_SNAPSHOT_SCHEMA,
    origin: "live_provider_unverified",
    scope: "public_registry_eligibility_research",
    containsPhi: false,
    retrievedAt: input.retrievedAt,
    asOf: input.asOf,
    studies,
    criteriaByNct,
    liveRegistryQueried: true,
    liveStatusVerified: false,
    confirmedEligible: false,
    patientEligibilityAssessed: false,
    enrolmentEnabled: false,
    provider: CTGOV_PROVIDER,
    pinnedNctIds: pinned,
  };
}

export function parseN5LiveRegistrySnapshot(value: unknown): N5LiveRegistryCriteriaSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid N5 live registry snapshot");
  }
  const s = value as N5LiveRegistryCriteriaSnapshot;
  if (
    s.schemaVersion !== N5_LIVE_SNAPSHOT_SCHEMA
    || s.origin !== "live_provider_unverified"
    || s.scope !== "public_registry_eligibility_research"
    || s.containsPhi !== false
    || s.liveRegistryQueried !== true
    || s.liveStatusVerified !== false
    || s.confirmedEligible !== false
    || s.patientEligibilityAssessed !== false
    || s.enrolmentEnabled !== false
    || s.provider !== CTGOV_PROVIDER
    || !Array.isArray(s.studies)
    || s.studies.length === 0
  ) {
    throw new Error("Invalid N5 live registry snapshot honesty envelope");
  }
  return s;
}

function liveSnapshotHash(snapshot: N5LiveRegistryCriteriaSnapshot): string {
  return sha256(canonicalEvidenceJson(snapshot));
}

/** Criterion reports over a live snapshot — eligibility flags stay forced false. */
export function assessCohortTrialCriteriaLive(input: {
  snapshot: N5LiveRegistryCriteriaSnapshot;
  nctId: string;
  facts: SyntheticCohortFact[];
  generatedAt: string;
}): N5LiveCriterionReport {
  const snapshot = parseN5LiveRegistrySnapshot(input.snapshot);
  if (snapshot.liveRegistryQueried !== true || snapshot.liveStatusVerified !== false) {
    throw new Error("Live assess requires liveRegistryQueried=true and liveStatusVerified=false");
  }
  const study = snapshot.studies.find((s) => s.nctId === input.nctId);
  if (!study) throw new Error(`Unknown NCT in live snapshot: ${input.nctId}`);
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

  const report: N5LiveCriterionReport = {
    schemaVersion: N5_CRITERIA_RESEARCH_SCHEMA,
    method: N5_METHOD,
    programme: "gut_immune_t2d",
    generatedAt: input.generatedAt,
    asOf: snapshot.asOf,
    snapshotHash: liveSnapshotHash(snapshot),
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
    liveRegistryQueried: true,
    liveStatusVerified: false,
    enrolmentEnabled: false,
    clinicalAdvice: false,
    containsPhi: false,
    scientificApproval: false,
    graphPromotable: false,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    honesty: [
      "N5 live refresh queried ClinicalTrials.gov for public registry metadata only.",
      "liveRegistryQueried=true does not mean liveStatusVerified or confirmedEligible.",
      "A recorded age match is not a complete criterion assessment.",
      "A list of satisfied criteria is not confirmed eligibility.",
      "Synthetic validation cohorts only — no patient records, no enrolment.",
      ...FORBIDDEN_ELIGIBILITY_PHRASES.map((p) => `Forbidden phrase retained as ban token only: ${p}`),
    ],
  };

  for (const i of report.inspections) {
    if (i.confirmedEligible !== false) throw new Error("Inspection cannot claim eligibility");
    if (!(CRITERION_STATES as readonly string[]).includes(i.state)) {
      throw new Error(`Invalid criterion state ${i.state}`);
    }
  }
  if (report.confirmedEligible !== false || report.patientEligible !== false) {
    throw new Error("Live report must keep eligibility false");
  }
  const publicBlob = JSON.stringify({
    overallLabel: report.overallLabel,
    inspections: report.inspections.map((i) => ({state: i.state, method: i.method, notes: i.notes})),
  });
  if (
    /\bconfirmed eligible\b|\bpatient eligible\b|\bfully eligible\b|\beligible for enrol?ment\b/i.test(
      publicBlob,
    )
  ) {
    throw new Error("Fail closed: forbidden eligibility language leaked into live N5 report");
  }
  return report;
}

export function parseN5LiveRefreshReceipt(value: unknown): N5LiveRefreshReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid N5 live refresh receipt");
  }
  const r = value as N5LiveRefreshReceipt;
  if (
    r.schemaVersion !== N5_LIVE_REFRESH_SCHEMA
    || r.method !== N5_LIVE_METHOD
    || r.engineeringHarness !== "CLEARED"
    || r.scientificAcceptance !== "BLOCKED"
    || r.confirmedEligible !== false
    || r.patientEligible !== false
    || r.patientEligibilityAssessed !== false
    || r.liveRegistryQueried !== true
    || r.liveStatusVerified !== false
    || r.enrolmentEnabled !== false
    || r.clinicalAdvice !== false
    || r.containsPhi !== false
    || r.scientificApproval !== false
    || r.graphPromotable !== false
    || r.inventedEligibilityPermitted !== false
    || r.provider !== CTGOV_PROVIDER
  ) {
    throw new Error("N5 live refresh receipt honesty gates failed");
  }
  parseN5LiveRegistrySnapshot(r.snapshot);
  for (const report of r.reports) {
    if (
      report.confirmedEligible !== false
      || report.patientEligible !== false
      || report.liveRegistryQueried !== true
      || report.liveStatusVerified !== false
      || report.scientificAcceptance !== "BLOCKED"
    ) {
      throw new Error("Live report honesty gates failed");
    }
  }
  const expectedHash = sha256(
    canonicalEvidenceJson({
      ...r,
      receiptHash: "",
    }),
  );
  if (r.receiptHash !== expectedHash) {
    throw new Error("N5 live refresh receiptHash mismatch");
  }
  return r;
}

function buildReceiptBody(input: {
  mode: "live_provider" | "offline_live_fixture_replay";
  generatedAt: string;
  asOf: string;
  retrievedAt: string;
  lookups: N5LiveRefreshLookupRow[];
  snapshot: N5LiveRegistryCriteriaSnapshot;
  reports: N5LiveCriterionReport[];
  providerCapability: N5LiveRefreshReceipt["providerCapability"];
}): N5LiveRefreshReceipt {
  const base = {
    schemaVersion: N5_LIVE_REFRESH_SCHEMA,
    method: N5_LIVE_METHOD,
    phase: "N5" as const,
    remediationPhase: "production_readiness_audit_phase_9" as const,
    programme: "gut_immune_t2d" as const,
    mode: input.mode,
    generatedAt: input.generatedAt,
    asOf: input.asOf,
    retrievedAt: input.retrievedAt,
    pinnedNctIds: N5_LIVE_REFRESH_NCT_IDS,
    provider: CTGOV_PROVIDER,
    providerCapability: input.providerCapability,
    lookups: input.lookups,
    snapshot: input.snapshot,
    snapshotHash: liveSnapshotHash(input.snapshot),
    reports: input.reports,
    engineeringHarness: "CLEARED" as const,
    scientificAcceptance: "BLOCKED" as const,
    confirmedEligible: false as const,
    patientEligible: false as const,
    patientEligibilityAssessed: false as const,
    liveRegistryQueried: true as const,
    liveStatusVerified: false as const,
    enrolmentEnabled: false as const,
    clinicalAdvice: false as const,
    containsPhi: false as const,
    scientificApproval: false as const,
    graphPromotable: false as const,
    inventedEligibilityPermitted: false as const,
    honesty: [
      "Audit #9 optional N5 live public-registry snapshot refresh.",
      "Provider reachability ≠ scientific acceptance ≠ confirmed eligibility.",
      "confirmedEligible=false · patientEligible=false · enrolmentEnabled=false always.",
      "No Gate C auto-approve · no MoU · no CDS/PHI · red-wave Neon only for HSI.",
    ],
    receiptHash: "",
  };
  const receiptHash = sha256(canonicalEvidenceJson(base));
  return {...base, receiptHash};
}

export function runN5LiveRefreshFromImportJson(input: {
  clinicalTrialsGovJson: unknown;
  retrievedAt: string;
  asOf: string;
  generatedAt: string;
  mode: "live_provider" | "offline_live_fixture_replay";
  lookups: N5LiveRefreshLookupRow[];
  providerCapability: N5LiveRefreshReceipt["providerCapability"];
  facts?: readonly SyntheticCohortFact[];
}): N5LiveRefreshReceipt {
  const snapshot = buildN5LiveRegistrySnapshot({
    retrievedAt: input.retrievedAt,
    asOf: input.asOf,
    clinicalTrialsGovJson: input.clinicalTrialsGovJson,
  });
  const facts = [...(input.facts ?? N5_SYNTHETIC_COHORT_FACTS)];
  const reports = snapshot.studies.map((study) =>
    assessCohortTrialCriteriaLive({
      snapshot,
      nctId: study.nctId,
      facts,
      generatedAt: input.generatedAt,
    }),
  );
  const receipt = buildReceiptBody({
    mode: input.mode,
    generatedAt: input.generatedAt,
    asOf: input.asOf,
    retrievedAt: input.retrievedAt,
    lookups: input.lookups,
    snapshot,
    reports,
    providerCapability: input.providerCapability,
  });
  return parseN5LiveRefreshReceipt(receipt);
}

function lookupRowFromResult(nctId: N5LiveRefreshNctId, result: CtgovLookupResult): N5LiveRefreshLookupRow {
  if (result.ok) {
    return {
      nctId,
      ok: true,
      retrievedAt: result.retrievedAt,
      httpStatus: result.httpStatus,
      responseIdentity: result.responseIdentity,
      outcome: "metadata_retrieved_unverified",
      detail: null,
    };
  }
  return {
    nctId,
    ok: false,
    retrievedAt: result.retrievedAt,
    httpStatus: result.httpStatus,
    responseIdentity: null,
    outcome: result.outcome,
    detail: result.detail,
  };
}

/** Live fetch pinned NCTs and build honesty-gated refresh receipt. */
export async function runN5LiveRefreshFromProvider(input?: {
  fetcher?: FetchLike;
  now?: () => Date;
  facts?: readonly SyntheticCohortFact[];
}): Promise<{
  receipt: N5LiveRefreshReceipt;
  fixtureJson: {studies: Record<string, unknown>[]};
  lookupResults: CtgovLookupResult[];
}> {
  const now = input?.now ?? (() => new Date());
  const results: CtgovLookupResult[] = [];
  for (const nctId of N5_LIVE_REFRESH_NCT_IDS) {
    results.push(
      await lookupClinicalTrialsGovByNctId({
        nctId,
        fetcher: input?.fetcher,
        now,
      }),
    );
  }
  const okResults = results.filter((r): r is CtgovLookupOk => r.ok);
  const lookups = N5_LIVE_REFRESH_NCT_IDS.map((nctId, i) =>
    lookupRowFromResult(nctId, results[i]!),
  );
  const reachable = okResults.length === N5_LIVE_REFRESH_NCT_IDS.length;
  if (!reachable) {
    const failed = lookups.filter((l) => !l.ok);
    throw new Error(
      `N5 live refresh incomplete: ${failed.map((f) => `${f.nctId}:${f.outcome}`).join(", ")}`,
    );
  }
  const retrievedAt = okResults.map((r) => r.retrievedAt).sort().at(-1)!;
  // Stamp asOf/generatedAt at or after the latest retrieval so the snapshot is not "future".
  const generatedAt = now().toISOString();
  const asOf =
    Date.parse(generatedAt) >= Date.parse(retrievedAt) ? generatedAt : retrievedAt;
  const fixtureJson = wrapCtgovStudiesAsImportJson(okResults.map((r) => r.study));
  const receipt = runN5LiveRefreshFromImportJson({
    clinicalTrialsGovJson: fixtureJson,
    retrievedAt,
    asOf,
    generatedAt: asOf,
    mode: "live_provider",
    lookups,
    providerCapability: {
      provider: CTGOV_PROVIDER,
      probed: true,
      reachable: true,
      detail:
        "Live ClinicalTrials.gov API v2 study fetch succeeded for pinned NCTs. Metadata/criteria only — not eligibility or scientific acceptance.",
    },
    facts: input?.facts,
  });
  return {receipt, fixtureJson, lookupResults: results};
}

/** Offline replay of previously captured live fixtures (CI-safe). */
export function runN5LiveRefreshFromFixtures(input: {
  fixtureBodiesByNct: Record<string, {httpStatus: number; bodyText: string}>;
  retrievedAt: string;
  asOf: string;
  generatedAt: string;
  facts?: readonly SyntheticCohortFact[];
}): {receipt: N5LiveRefreshReceipt; fixtureJson: {studies: Record<string, unknown>[]}} {
  const results: CtgovLookupResult[] = [];
  for (const nctId of N5_LIVE_REFRESH_NCT_IDS) {
    const fixture = input.fixtureBodiesByNct[nctId];
    if (!fixture) throw new Error(`Missing live fixture for ${nctId}`);
    results.push(
      parseClinicalTrialsGovStudyPayload({
        nctId,
        bodyText: fixture.bodyText,
        httpStatus: fixture.httpStatus,
        retrievedAt: input.retrievedAt,
      }),
    );
  }
  const okResults = results.filter((r): r is CtgovLookupOk => r.ok);
  if (okResults.length !== N5_LIVE_REFRESH_NCT_IDS.length) {
    throw new Error("Live fixture replay failed honesty/parse gates");
  }
  const lookups = N5_LIVE_REFRESH_NCT_IDS.map((nctId, i) =>
    lookupRowFromResult(nctId, results[i]!),
  );
  const fixtureJson = wrapCtgovStudiesAsImportJson(okResults.map((r) => r.study));
  const receipt = runN5LiveRefreshFromImportJson({
    clinicalTrialsGovJson: fixtureJson,
    retrievedAt: input.retrievedAt,
    asOf: input.asOf,
    generatedAt: input.generatedAt,
    mode: "offline_live_fixture_replay",
    lookups,
    providerCapability: {
      provider: CTGOV_PROVIDER,
      probed: false,
      reachable: null,
      detail:
        "Offline replay of captured ClinicalTrials.gov JSON fixtures from a prior live refresh. Live reachability is recorded separately when --live is used.",
    },
    facts: input?.facts,
  });
  return {receipt, fixtureJson};
}

/** Re-export GateStatus for STATUS writers. */
export type N5LiveRefreshGateStatus = GateStatus;

/** Compatibility helper: offline engineering snapshot hash stays independent. */
export function offlineEngineeringSnapshotHash(snapshot: N5RegistryCriteriaSnapshot): string {
  return snapshotHash(snapshot);
}

export function assertLiveRefreshNctPins(): readonly N5LiveRefreshNctId[] {
  for (const id of N5_LIVE_REFRESH_NCT_IDS) assertValidNctId(id);
  return N5_LIVE_REFRESH_NCT_IDS;
}
