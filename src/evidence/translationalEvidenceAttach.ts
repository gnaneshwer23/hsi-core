/**
 * PR 7 / O-04 — Translational evidence attach for investigation outcomes.
 *
 * Extends ClinicalTrials.gov API v2 lookup + Open Targets association metadata.
 * Keeps registry facts separate from outcome evidence. Never infers eligibility,
 * clinical efficacy, or causal benefit from association or registration metadata.
 *
 * Honesty:
 *   - A registered trial is not evidence of efficacy.
 *   - A missing result is not evidence that a therapy failed.
 *   - Provider fail ≠ empty evidence; fixtures ≠ live evidence.
 */
import {createHash} from "node:crypto";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {
  assertValidNctId,
  CTGOV_PROVIDER,
  type CtgovLookupResult,
} from "./clinicalTrialsGovLookup";
import type {OpenTargetsDiseaseRecord} from "./openTargetsLookup";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const TRANSLATIONAL_EVIDENCE_SCHEMA = "hsi-translational-evidence-attach-1" as const;
export const TRANSLATIONAL_EVIDENCE_METHOD = "hsi.translational_evidence_attach.v1" as const;
export const TRANSLATIONAL_EVIDENCE_VERSION = "0.1.0" as const;

export type TranslationalAttachOrigin = "fixture_replay" | "live_provider_unverified" | "operator_supplied_unverified";

export type TrialRegistrationStatus = {
  nctId: string;
  briefTitle: string | null;
  overallStatus: string | null;
  studyType: string | null;
  phases: readonly string[];
  conditions: readonly string[];
  lastUpdateDate: string | null;
  registryUrl: string;
  /** Registry presence only — not efficacy. */
  registrationImpliesEfficacy: false;
};

export type InterventionTargetMapping = {
  nctId: string;
  interventions: readonly {
    type: string | null;
    name: string;
    description: string | null;
  }[];
  /** Open Targets disease→target rows whose symbol/name overlaps an intervention string. */
  mappedTargets: readonly {
    diseaseId: string;
    diseaseName: string;
    targetSymbol: string;
    targetEnsemblId: string;
    score: number;
    matchBasis: "intervention_name_token_overlap";
    /** Association metadata ≠ mechanism proof or efficacy. */
    associationImpliesEfficacy: false;
    graphPromotable: false;
  }[];
  unmappedInterventionNames: readonly string[];
};

export type RegistryReportedResults = {
  nctId: string;
  hasResultsSection: boolean;
  resultsFirstPostedDate: string | null;
  primaryOutcomeMeasures: readonly {
    title: string;
    description: string | null;
    timeFrame: string | null;
    reportingStatus: string | null;
  }[];
  /** Registry-reported numbers are not independently verified efficacy. */
  registryResultsAreNotEfficacyProof: true;
};

export type PublishedOutcomeRef = {
  nctId: string;
  pmid: string | null;
  citation: string | null;
  referenceType: string | null;
  /** Locator only — claim support not assessed. */
  claimSupport: "not_assessed";
  sourceIdentityDistinctFromClaimSupport: true;
};

export type MissingOutcomeEvidence = {
  nctId: string;
  kind:
    | "no_results_section"
    | "results_section_without_primary_measures"
    | "no_published_outcome_refs"
    | "provider_lookup_failed"
    | "partial_attach";
  detail: string;
  /** Explicit: absence of posted results ≠ therapy failure. */
  missingResultsImpliesFailure: false;
};

export type TranslationalTrialRecord = {
  nctId: string;
  registration: TrialRegistrationStatus;
  interventionTargetMapping: InterventionTargetMapping;
  registryReportedResults: RegistryReportedResults;
  publishedOutcomes: readonly PublishedOutcomeRef[];
  missingOutcomeEvidence: readonly MissingOutcomeEvidence[];
  responseIdentity: string | null;
  retrievedAt: string | null;
  lookupOk: boolean;
  lookupOutcome: string;
};

export type TranslationalLandscapeSnapshot = {
  schemaVersion: typeof TRANSLATIONAL_EVIDENCE_SCHEMA;
  method: typeof TRANSLATIONAL_EVIDENCE_METHOD;
  version: typeof TRANSLATIONAL_EVIDENCE_VERSION;
  origin: TranslationalAttachOrigin;
  generatedAt: string;
  asOf: string;
  provider: typeof CTGOV_PROVIDER;
  records: readonly TranslationalTrialRecord[];
  honesty: {
    o04Attached: true;
    registrationIsNotEfficacy: true;
    missingResultsIsNotFailure: true;
    eligibilityAssessed: false;
    confirmedEligible: false;
    clinicalAdvice: false;
    causalBenefitInferred: false;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
    providerFailureDistinctFromEmptyEvidence: true;
    sourceIdentityDistinctFromClaimSupport: true;
  };
  limitations: readonly string[];
  snapshotHash?: string;
};

export type TranslationalOutcomeSection = {
  status: "attached_registry_snapshot" | "partial_attach" | "provider_unavailable" | "not_queried";
  schemaVersion: typeof TRANSLATIONAL_EVIDENCE_SCHEMA | null;
  snapshotHash: string | null;
  asOf: string | null;
  relevanceScope: "preliminary_research_only";
  eligibilityAssessed: false;
  confirmedEligible: false;
  records: readonly {
    nctId: string;
    briefTitle: string | null;
    overallStatus: string | null;
    phases: readonly string[];
    interventions: readonly string[];
    mappedTargetSymbols: readonly string[];
    hasRegistryResults: boolean;
    publishedOutcomePmidCount: number;
    missingKinds: readonly MissingOutcomeEvidence["kind"][];
  }[];
  /** Separated presentation planes (O-04 honesty). */
  planes: {
    trialRegistrationAndStatus: readonly TrialRegistrationStatus[];
    interventionAndTargetMapping: readonly InterventionTargetMapping[];
    registryReportedResults: readonly RegistryReportedResults[];
    publishedOutcomes: readonly PublishedOutcomeRef[];
    missingOrUnresolvedOutcomeEvidence: readonly MissingOutcomeEvidence[];
  };
  honesty: TranslationalLandscapeSnapshot["honesty"] | null;
  limitations: readonly string[];
  note: string;
};

function fail(message: string): never {
  throw new Error(message);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function tokenSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3),
  );
}

function extractRegistration(study: Record<string, unknown>, nctId: string): TrialRegistrationStatus {
  const protocol = asRecord(study.protocolSection) ?? {};
  const identification = asRecord(protocol.identificationModule) ?? {};
  const status = asRecord(protocol.statusModule) ?? {};
  const design = asRecord(protocol.designModule) ?? {};
  const conditions = asRecord(protocol.conditionsModule) ?? {};
  const phasesRaw = design.phases;
  const phases = Array.isArray(phasesRaw)
    ? phasesRaw.filter((p): p is string => typeof p === "string").slice(0, 8)
    : [];
  const conditionList = Array.isArray(conditions.conditions)
    ? conditions.conditions.filter((c): c is string => typeof c === "string").slice(0, 25)
    : [];
  const updateStruct = asRecord(status.lastUpdatePostDateStruct);
  return {
    nctId,
    briefTitle: asString(identification.briefTitle),
    overallStatus: asString(status.overallStatus),
    studyType: asString(design.studyType),
    phases,
    conditions: conditionList,
    lastUpdateDate: asString(updateStruct?.date) ?? null,
    registryUrl: `https://clinicaltrials.gov/study/${nctId}`,
    registrationImpliesEfficacy: false,
  };
}

function extractInterventions(study: Record<string, unknown>): InterventionTargetMapping["interventions"][number][] {
  const protocol = asRecord(study.protocolSection) ?? {};
  const arms = asRecord(protocol.armsInterventionsModule) ?? {};
  const list = Array.isArray(arms.interventions) ? arms.interventions : [];
  const out: InterventionTargetMapping["interventions"][number][] = [];
  for (const row of list.slice(0, 40)) {
    const r = asRecord(row);
    if (!r) continue;
    const name = asString(r.name);
    if (!name) continue;
    out.push({
      type: asString(r.type),
      name,
      description: asString(r.description),
    });
  }
  return out;
}

function mapTargetsToInterventions(input: {
  nctId: string;
  interventions: InterventionTargetMapping["interventions"];
  openTargets: readonly OpenTargetsDiseaseRecord[];
}): InterventionTargetMapping {
  const interventionNames = input.interventions.map((i) => i.name);
  const interventionTokens = new Set(interventionNames.flatMap((n) => [...tokenSet(n)]));
  const mapped: InterventionTargetMapping["mappedTargets"][number][] = [];
  const matchedIntervention = new Set<string>();

  for (const disease of input.openTargets) {
    for (const assoc of disease.associations.slice(0, 50)) {
      const symbol = assoc.approvedSymbol.trim();
      if (!symbol) continue;
      const symbolTokens = tokenSet(symbol);
      const overlap = [...symbolTokens].some((t) => interventionTokens.has(t));
      // Also allow case-insensitive substring of full intervention name containing symbol.
      const nameHit = interventionNames.some((name) => {
        const hit = name.toLowerCase().includes(symbol.toLowerCase());
        if (hit) matchedIntervention.add(name);
        return hit;
      });
      if (!overlap && !nameHit) continue;
      for (const name of interventionNames) {
        if ([...tokenSet(name)].some((t) => symbolTokens.has(t)) || name.toLowerCase().includes(symbol.toLowerCase())) {
          matchedIntervention.add(name);
        }
      }
      mapped.push({
        diseaseId: disease.diseaseId,
        diseaseName: disease.diseaseName,
        targetSymbol: symbol,
        targetEnsemblId: assoc.targetEnsemblId,
        score: assoc.score,
        matchBasis: "intervention_name_token_overlap",
        associationImpliesEfficacy: false,
        graphPromotable: false,
      });
    }
  }

  return {
    nctId: input.nctId,
    interventions: input.interventions,
    mappedTargets: mapped.slice(0, 40),
    unmappedInterventionNames: interventionNames.filter((n) => !matchedIntervention.has(n)),
  };
}

function extractRegistryResults(study: Record<string, unknown>, nctId: string): RegistryReportedResults {
  const protocol = asRecord(study.protocolSection) ?? {};
  const status = asRecord(protocol.statusModule) ?? {};
  const resultsFirst = asRecord(status.resultsFirstPostDateStruct);
  const resultsSection = asRecord(study.resultsSection);
  const outcomeModule = asRecord(resultsSection?.outcomeMeasuresModule);
  const measuresRaw = Array.isArray(outcomeModule?.outcomeMeasures) ? outcomeModule!.outcomeMeasures : [];
  const primaryOutcomeMeasures: RegistryReportedResults["primaryOutcomeMeasures"][number][] = [];
  for (const row of measuresRaw.slice(0, 20)) {
    const r = asRecord(row);
    if (!r) continue;
    if (asString(r.type) !== "PRIMARY" && primaryOutcomeMeasures.length > 0) {
      // Prefer primary; still accept when type missing only if empty so far.
    }
    if (asString(r.type) && asString(r.type) !== "PRIMARY") continue;
    const title = asString(r.title);
    if (!title) continue;
    primaryOutcomeMeasures.push({
      title,
      description: asString(r.description),
      timeFrame: asString(r.timeFrame),
      reportingStatus: asString(r.reportingStatus),
    });
  }
  // Fallback: protocol-declared primary outcomes when results section absent/empty.
  if (!primaryOutcomeMeasures.length) {
    const outcomes = asRecord(protocol.outcomesModule);
    const primaries = Array.isArray(outcomes?.primaryOutcomes) ? outcomes!.primaryOutcomes : [];
    for (const row of primaries.slice(0, 10)) {
      const r = asRecord(row);
      const measure = asString(r?.measure);
      if (!measure) continue;
      primaryOutcomeMeasures.push({
        title: measure,
        description: asString(r?.description),
        timeFrame: asString(r?.timeFrame),
        reportingStatus: resultsSection ? "protocol_declared_only" : null,
      });
    }
  }

  return {
    nctId,
    hasResultsSection: Boolean(resultsSection) || study.hasResults === true,
    resultsFirstPostedDate: asString(resultsFirst?.date),
    primaryOutcomeMeasures,
    registryResultsAreNotEfficacyProof: true,
  };
}

function extractPublishedOutcomes(study: Record<string, unknown>, nctId: string): PublishedOutcomeRef[] {
  const protocol = asRecord(study.protocolSection) ?? {};
  const references = asRecord(protocol.referencesModule);
  const list = Array.isArray(references?.references) ? references!.references : [];
  const out: PublishedOutcomeRef[] = [];
  for (const row of list.slice(0, 40)) {
    const r = asRecord(row);
    if (!r) continue;
    const type = asString(r.type);
    // Prefer RESULT / DERIVED; still record others as unresolved locators.
    const pmid = asString(r.pmid);
    const citation = asString(r.citation);
    if (!pmid && !citation) continue;
    out.push({
      nctId,
      pmid,
      citation,
      referenceType: type,
      claimSupport: "not_assessed",
      sourceIdentityDistinctFromClaimSupport: true,
    });
  }
  return out;
}

function missingFor(record: {
  nctId: string;
  lookupOk: boolean;
  lookupOutcome: string;
  registryReportedResults: RegistryReportedResults;
  publishedOutcomes: readonly PublishedOutcomeRef[];
}): MissingOutcomeEvidence[] {
  const missing: MissingOutcomeEvidence[] = [];
  if (!record.lookupOk) {
    missing.push({
      nctId: record.nctId,
      kind: "provider_lookup_failed",
      detail: `ClinicalTrials.gov lookup did not succeed (${record.lookupOutcome}). Provider failure is not empty evidence.`,
      missingResultsImpliesFailure: false,
    });
    return missing;
  }
  if (!record.registryReportedResults.hasResultsSection) {
    missing.push({
      nctId: record.nctId,
      kind: "no_results_section",
      detail:
        "No results section observed on the registry record. Missing posted results are not evidence that the therapy failed.",
      missingResultsImpliesFailure: false,
    });
  } else if (record.registryReportedResults.primaryOutcomeMeasures.length === 0) {
    missing.push({
      nctId: record.nctId,
      kind: "results_section_without_primary_measures",
      detail: "Results section present but primary outcome measures were not extracted.",
      missingResultsImpliesFailure: false,
    });
  }
  if (record.publishedOutcomes.length === 0) {
    missing.push({
      nctId: record.nctId,
      kind: "no_published_outcome_refs",
      detail:
        "No published outcome reference locators were attached from the registry references module. Absence is not failure evidence.",
      missingResultsImpliesFailure: false,
    });
  }
  return missing;
}

export function attachTranslationalTrialFromCtgovStudy(input: {
  nctId: string;
  study: Record<string, unknown>;
  responseIdentity?: string | null;
  retrievedAt?: string | null;
  lookupOk?: boolean;
  lookupOutcome?: string;
  openTargets?: readonly OpenTargetsDiseaseRecord[];
}): TranslationalTrialRecord {
  const nctId = assertValidNctId(input.nctId);
  const blob = JSON.stringify(input.study);
  if (blob.length > 1_500_000) fail("Translational study payload exceeds budget");
  if (!rejectPhiPayload({textBlobs: [blob]}).ok) {
    fail("PHI-shaped translational payload rejected");
  }
  const interventions = extractInterventions(input.study);
  const registration = extractRegistration(input.study, nctId);
  const interventionTargetMapping = mapTargetsToInterventions({
    nctId,
    interventions,
    openTargets: input.openTargets ?? [],
  });
  const registryReportedResults = extractRegistryResults(input.study, nctId);
  const publishedOutcomes = extractPublishedOutcomes(input.study, nctId);
  const lookupOk = input.lookupOk !== false;
  const lookupOutcome = input.lookupOutcome ?? (lookupOk ? "ok" : "unknown_failure");
  const missingOutcomeEvidence = missingFor({
    nctId,
    lookupOk,
    lookupOutcome,
    registryReportedResults,
    publishedOutcomes,
  });
  if (registration.registrationImpliesEfficacy !== false) {
    fail("Registration must never imply efficacy");
  }
  return {
    nctId,
    registration,
    interventionTargetMapping,
    registryReportedResults,
    publishedOutcomes,
    missingOutcomeEvidence,
    responseIdentity: input.responseIdentity ?? null,
    retrievedAt: input.retrievedAt ?? null,
    lookupOk,
    lookupOutcome,
  };
}

export function attachTranslationalTrialFromLookup(input: {
  result: CtgovLookupResult;
  openTargets?: readonly OpenTargetsDiseaseRecord[];
}): TranslationalTrialRecord {
  if (input.result.ok) {
    return attachTranslationalTrialFromCtgovStudy({
      nctId: input.result.nctId,
      study: input.result.study,
      responseIdentity: input.result.responseIdentity,
      retrievedAt: input.result.retrievedAt,
      lookupOk: true,
      lookupOutcome: "ok",
      openTargets: input.openTargets,
    });
  }
  const nctId = assertValidNctId(input.result.nctId);
  const emptyResults: RegistryReportedResults = {
    nctId,
    hasResultsSection: false,
    resultsFirstPostedDate: null,
    primaryOutcomeMeasures: [],
    registryResultsAreNotEfficacyProof: true,
  };
  return {
    nctId,
    registration: {
      nctId,
      briefTitle: null,
      overallStatus: null,
      studyType: null,
      phases: [],
      conditions: [],
      lastUpdateDate: null,
      registryUrl: `https://clinicaltrials.gov/study/${nctId}`,
      registrationImpliesEfficacy: false,
    },
    interventionTargetMapping: {
      nctId,
      interventions: [],
      mappedTargets: [],
      unmappedInterventionNames: [],
    },
    registryReportedResults: emptyResults,
    publishedOutcomes: [],
    missingOutcomeEvidence: missingFor({
      nctId,
      lookupOk: false,
      lookupOutcome: input.result.outcome,
      registryReportedResults: emptyResults,
      publishedOutcomes: [],
    }),
    responseIdentity: null,
    retrievedAt: input.result.retrievedAt,
    lookupOk: false,
    lookupOutcome: input.result.outcome,
  };
}

function sealSnapshot(snapshot: Omit<TranslationalLandscapeSnapshot, "snapshotHash">): TranslationalLandscapeSnapshot {
  const snapshotHash = createHash("sha256").update(canonicalEvidenceJson(snapshot)).digest("hex");
  return {...snapshot, snapshotHash};
}

export function buildTranslationalLandscapeSnapshot(input: {
  origin: TranslationalAttachOrigin;
  generatedAt: string;
  asOf: string;
  records: readonly TranslationalTrialRecord[];
  extraLimitations?: readonly string[];
}): TranslationalLandscapeSnapshot {
  if (!input.records.length) fail("Translational landscape requires at least one trial record attempt");
  if (input.records.some((r) => r.registration.registrationImpliesEfficacy !== false)) {
    fail("Efficacy inference from registration is forbidden");
  }
  if (
    input.records.some((r) =>
      r.missingOutcomeEvidence.some((m) => m.missingResultsImpliesFailure !== false),
    )
  ) {
    fail("Missing results must never imply therapy failure");
  }
  const anyProviderFail = input.records.some((r) => !r.lookupOk);
  const anyOk = input.records.some((r) => r.lookupOk);
  const limitations = [
    "O-04 translational attach is registry and association metadata only — not clinical decision support",
    "A registered trial is not evidence of efficacy",
    "Missing or unresolved registry results are not evidence that a therapy failed",
    "Intervention↔target mapping uses name-token overlap with Open Targets associations when supplied; association ≠ causal benefit",
    "Patient eligibility is never assessed or confirmed by this attach",
    "Published outcome locators are not claim-support verification",
    ...(anyProviderFail
      ? ["One or more ClinicalTrials.gov lookups failed; provider failure is distinct from empty evidence"]
      : []),
    ...(input.extraLimitations ?? []),
  ];
  if (!anyOk && anyProviderFail) {
    // Still allow snapshot so callers can present provider_unavailable distinctly.
  }
  return sealSnapshot({
    schemaVersion: TRANSLATIONAL_EVIDENCE_SCHEMA,
    method: TRANSLATIONAL_EVIDENCE_METHOD,
    version: TRANSLATIONAL_EVIDENCE_VERSION,
    origin: input.origin,
    generatedAt: input.generatedAt,
    asOf: input.asOf,
    provider: CTGOV_PROVIDER,
    records: input.records,
    honesty: {
      o04Attached: true,
      registrationIsNotEfficacy: true,
      missingResultsIsNotFailure: true,
      eligibilityAssessed: false,
      confirmedEligible: false,
      clinicalAdvice: false,
      causalBenefitInferred: false,
      scientificApproval: false,
      graphPromotable: false,
      gateCAutoApprove: false,
      cdsPhi: false,
      fixturesAreNotLiveEvidence: true,
      providerFailureDistinctFromEmptyEvidence: true,
      sourceIdentityDistinctFromClaimSupport: true,
    },
    limitations,
  });
}

export function parseTranslationalLandscapeSnapshot(value: unknown): TranslationalLandscapeSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("Invalid translational landscape snapshot");
  }
  const s = value as TranslationalLandscapeSnapshot;
  if (
    s.schemaVersion !== TRANSLATIONAL_EVIDENCE_SCHEMA
    || s.method !== TRANSLATIONAL_EVIDENCE_METHOD
    || s.honesty?.o04Attached !== true
    || s.honesty.registrationIsNotEfficacy !== true
    || s.honesty.missingResultsIsNotFailure !== true
    || s.honesty.eligibilityAssessed !== false
    || s.honesty.confirmedEligible !== false
    || s.honesty.gateCAutoApprove !== false
    || s.honesty.cdsPhi !== false
    || !Array.isArray(s.records)
  ) {
    fail("Invalid translational landscape honesty envelope");
  }
  return s;
}

export function projectTranslationalForOutcome(
  snapshot: TranslationalLandscapeSnapshot | null | undefined,
): TranslationalOutcomeSection {
  if (!snapshot) {
    return {
      status: "not_queried",
      schemaVersion: null,
      snapshotHash: null,
      asOf: null,
      relevanceScope: "preliminary_research_only",
      eligibilityAssessed: false,
      confirmedEligible: false,
      records: [],
      planes: {
        trialRegistrationAndStatus: [],
        interventionAndTargetMapping: [],
        registryReportedResults: [],
        publishedOutcomes: [],
        missingOrUnresolvedOutcomeEvidence: [],
      },
      honesty: null,
      limitations: [],
      note:
        "No registry search is attached to this investigation. An empty list is not evidence of worldwide trial absence. Living-evidence NCT identity resolution (when bound) is not O-04 translational attach.",
    };
  }
  const parsed = parseTranslationalLandscapeSnapshot(snapshot);
  const okCount = parsed.records.filter((r) => r.lookupOk).length;
  const failCount = parsed.records.length - okCount;
  const status: TranslationalOutcomeSection["status"] =
    okCount === 0 && failCount > 0
      ? "provider_unavailable"
      : failCount > 0
        ? "partial_attach"
        : "attached_registry_snapshot";

  return {
    status,
    schemaVersion: parsed.schemaVersion,
    snapshotHash: parsed.snapshotHash ?? null,
    asOf: parsed.asOf,
    relevanceScope: "preliminary_research_only",
    eligibilityAssessed: false,
    confirmedEligible: false,
    records: parsed.records.map((r) => ({
      nctId: r.nctId,
      briefTitle: r.registration.briefTitle,
      overallStatus: r.registration.overallStatus,
      phases: r.registration.phases,
      interventions: r.interventionTargetMapping.interventions.map((i) => i.name),
      mappedTargetSymbols: r.interventionTargetMapping.mappedTargets.map((t) => t.targetSymbol),
      hasRegistryResults: r.registryReportedResults.hasResultsSection,
      publishedOutcomePmidCount: r.publishedOutcomes.filter((p) => p.pmid).length,
      missingKinds: r.missingOutcomeEvidence.map((m) => m.kind),
    })),
    planes: {
      trialRegistrationAndStatus: parsed.records.map((r) => r.registration),
      interventionAndTargetMapping: parsed.records.map((r) => r.interventionTargetMapping),
      registryReportedResults: parsed.records.map((r) => r.registryReportedResults),
      publishedOutcomes: parsed.records.flatMap((r) => r.publishedOutcomes),
      missingOrUnresolvedOutcomeEvidence: parsed.records.flatMap((r) => r.missingOutcomeEvidence),
    },
    honesty: parsed.honesty,
    limitations: [...parsed.limitations],
    note:
      status === "provider_unavailable"
        ? "O-04 translational attach attempted but ClinicalTrials.gov lookups failed. Provider failure is not empty evidence or therapy failure."
        : status === "partial_attach"
          ? "O-04 translational attach partially bound. Registry facts remain separate from outcome evidence; registration is not efficacy."
          : "O-04 translational landscape attached. Registry registration/status, intervention↔target mapping, registry-reported results, and published outcome locators are presented as separate planes. Registration is not efficacy; missing results are not failure.",
  };
}
