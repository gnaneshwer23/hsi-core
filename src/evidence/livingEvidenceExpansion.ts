/**
 * Execution step 03 — Living evidence and graph expansion (eng increment).
 *
 * Ingests permitted *metadata* from Europe PMC / Open Targets / ClinicalTrials.gov
 * with provenance, timestamps, licensing *signals*, entity resolution, and temporal
 * versioning. Passage import stays fail-closed until humanCleared (human queue #2).
 *
 * Not scientific acceptance · not Gate C · not MoU · not CDS/PHI · not O-04 trials attach.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  assertValidPmid,
  parseEuropePmcBibliographicPayload,
  type BibliographicLookupResult,
  type BibliographicRecord,
  lookupEuropePmcByPmid,
} from "./europePmcBibliographicLookup";
import {
  assertValidOpenTargetsDiseaseId,
  lookupOpenTargetsDiseaseAssociations,
  parseOpenTargetsDiseasePayload,
  type OpenTargetsDiseaseRecord,
  type OpenTargetsLookupResult,
} from "./openTargetsLookup";
import {
  assertValidNctId,
  lookupClinicalTrialsGovByNctId,
  parseClinicalTrialsGovStudyPayload,
  type CtgovLookupResult,
} from "./clinicalTrialsGovLookup";
import {
  HSI_ONTOLOGY_NAMESPACES,
  resolveHsiOntologyIdentity,
  validateHsiOntologyIdentifier,
  type HsiResolution,
} from "../hsiOntologyRegistry";
import type {HsiGraphNode} from "../livingHealthKnowledgeGraph";

export const LIVING_EVIDENCE_EXPANSION_SCHEMA = "hsi-living-evidence-expansion-1" as const;
export const LIVING_EVIDENCE_EXPANSION_METHOD = "hsi-living-evidence-metadata-expand-1" as const;
export const LIVING_EVIDENCE_PROGRAMME = "immune_disease_living_evidence" as const;

/** RA / SSc bibliographic pins — metadata refresh only. */
export const LIVING_EVIDENCE_PMID_PINS = ["18375541", "24586782", "30760472"] as const;
/** Open Targets disease pins (Platform underscore IDs). */
export const LIVING_EVIDENCE_DISEASE_PINS = ["MONDO_0008383", "MONDO_0005100"] as const;
/** Registry identity pin — entity resolution only; not investigation trials attach (step 05). */
export const LIVING_EVIDENCE_NCT_PINS = ["NCT01030861"] as const;

export type LivingEvidencePmid = (typeof LIVING_EVIDENCE_PMID_PINS)[number];
export type LivingEvidenceDiseaseId = (typeof LIVING_EVIDENCE_DISEASE_PINS)[number];
export type LivingEvidenceNctId = (typeof LIVING_EVIDENCE_NCT_PINS)[number];

export type LivingEvidenceProviderRow =
  | {provider: "europe_pmc"; pmid: LivingEvidencePmid; ok: boolean; outcome: string; retrievedAt: string | null; responseIdentity: string | null; httpStatus: number | null; detail: string | null}
  | {provider: "open_targets"; diseaseId: LivingEvidenceDiseaseId; ok: boolean; outcome: string; retrievedAt: string | null; responseIdentity: string | null; httpStatus: number | null; detail: string | null}
  | {provider: "clinicaltrials_gov"; nctId: LivingEvidenceNctId; ok: boolean; outcome: string; retrievedAt: string | null; responseIdentity: string | null; httpStatus: number | null; detail: string | null};

export type LivingEvidenceEntityResolution = {
  system: "PMID" | "NCT" | "MONDO";
  value: string;
  resolution: HsiResolution;
  sourceProvider: "europe_pmc" | "open_targets" | "clinicaltrials_gov";
  graphRelationshipCandidate: false;
  needsHumanReview: true;
};

export type LivingEvidenceGraphRelationshipCandidate = {
  id: string;
  kind: "disease_associated_target_metadata";
  subject: {system: "MONDO"; value: string; label: string};
  object: {system: "Ensembl"; value: string; label: string};
  score: number;
  sourceProvider: "open_targets";
  sourceDiseaseId: string;
  retrievedAt: string;
  responseIdentity: string;
  /** Metadata edge only — never auto-promoted. */
  graphPromotable: false;
  scientificApproval: false;
  claimSupport: false;
  needsHumanReview: true;
};

export type LivingEvidenceExpansionSnapshot = {
  schemaVersion: typeof LIVING_EVIDENCE_EXPANSION_SCHEMA;
  method: typeof LIVING_EVIDENCE_EXPANSION_METHOD;
  programme: typeof LIVING_EVIDENCE_PROGRAMME;
  origin: "fixture_replay" | "live_provider_unverified";
  generatedAt: string;
  asOf: string;
  retrievedAt: string;
  pinnedPmids: readonly LivingEvidencePmid[];
  pinnedDiseaseIds: readonly LivingEvidenceDiseaseId[];
  pinnedNctIds: readonly LivingEvidenceNctId[];
  bibliographicRecords: BibliographicRecord[];
  openTargetsRecords: OpenTargetsDiseaseRecord[];
  registryEntityResolutions: {
    nctId: LivingEvidenceNctId;
    briefTitle: string | null;
    overallStatus: string | null;
    retrievedAt: string;
    responseIdentity: string;
    /** Step 05 attaches trials to investigation outcomes — this is identity only. */
    translationalAttachStatus: "not_attached_step_05";
    eligibilityAssessed: false;
    confirmedEligible: false;
  }[];
  entityResolutions: LivingEvidenceEntityResolution[];
  graphRelationshipCandidates: LivingEvidenceGraphRelationshipCandidate[];
  providerHits: LivingEvidenceProviderRow[];
  licensing: {
    providerSignalsObserved: boolean;
    humanCleared: false;
    passageImported: false;
    passageImportAuthorized: false;
    licenceEvidenceUri: null;
    note: string;
  };
  honesty: {
    metadataOnly: true;
    passageImportFailClosed: true;
    rightsClearanceNotClaimed: true;
    scientificAcceptance: "BLOCKED";
    graphPromotable: false;
    gateCAutoApprove: false;
    legalBinding: false;
    trialsAttachedToInvestigation: false;
    cdsPhi: false;
  };
  cache: {
    rateLimited: true;
    minIntervalMs: number;
    responseIdentities: string[];
  };
  snapshotHash?: string;
};

export type LivingEvidenceExpansionReceipt = {
  schemaVersion: "hsi-living-evidence-expansion-receipt-1";
  phase: "step_03";
  programme: typeof LIVING_EVIDENCE_PROGRAMME;
  generatedAt: string;
  engineeringHarness: "CLEARED";
  scientificAcceptance: "BLOCKED";
  rightsAcceptance: "BLOCKED";
  humanCleared: false;
  passageImported: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  legalBinding: false;
  mode: "offline_fixture_replay" | "live_provider_probe";
  bibliographicRetrieved: number;
  openTargetsRetrieved: number;
  registryEntitiesResolved: number;
  entityResolutions: number;
  graphRelationshipCandidates: number;
  providerHits: LivingEvidenceProviderRow[];
  snapshot: LivingEvidenceExpansionSnapshot;
  unavailableCapabilities: string[];
  nextMilestone: "step_04_agent_intelligence_gap_verification";
  receiptHash?: string;
};

const RATE_LIMIT_MS = 350;

export function assertLivingEvidencePins(): {
  pmids: readonly LivingEvidencePmid[];
  diseaseIds: readonly LivingEvidenceDiseaseId[];
  nctIds: readonly LivingEvidenceNctId[];
} {
  for (const pmid of LIVING_EVIDENCE_PMID_PINS) assertValidPmid(pmid);
  for (const id of LIVING_EVIDENCE_DISEASE_PINS) assertValidOpenTargetsDiseaseId(id);
  for (const nct of LIVING_EVIDENCE_NCT_PINS) assertValidNctId(nct);
  return {
    pmids: LIVING_EVIDENCE_PMID_PINS,
    diseaseIds: LIVING_EVIDENCE_DISEASE_PINS,
    nctIds: LIVING_EVIDENCE_NCT_PINS,
  };
}

function sealSnapshot(body: Omit<LivingEvidenceExpansionSnapshot, "snapshotHash">): LivingEvidenceExpansionSnapshot {
  const snapshotHash = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  return {...body, snapshotHash};
}

function sealReceipt(body: Omit<LivingEvidenceExpansionReceipt, "receiptHash">): LivingEvidenceExpansionReceipt {
  const receiptHash = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  return {...body, receiptHash};
}

function ontologyNodesFromExpansion(input: {
  bibliographic: BibliographicRecord[];
  openTargets: OpenTargetsDiseaseRecord[];
  nctIds: readonly string[];
}): HsiGraphNode[] {
  const nodes: HsiGraphNode[] = [];
  const base = {
    schemaVersion: "hsi-lhkg-node-1" as const,
    layer: "biomedical_evidence" as const,
    aliases: [] as string[],
    version: "1.0.0",
    visibility: "governed_research" as const,
    reviewState: "draft" as const,
    sourceProvenance: ["living-evidence-expansion-metadata"] as string[],
  };
  for (const rec of input.bibliographic) {
    if (!rec.pmid) continue;
    nodes.push({
      ...base,
      id: `pub.pmid.${rec.pmid}`,
      kind: "publication",
      preferredLabel: rec.title.slice(0, 200),
      sourceIdentifiers: [{system: "PMID", value: rec.pmid, mapping: "exact"}],
    });
  }
  for (const rec of input.openTargets) {
    const mondo = rec.diseaseId.replace("_", ":");
    nodes.push({
      ...base,
      id: `disease.${rec.diseaseId}`,
      kind: "disease",
      preferredLabel: rec.diseaseName,
      sourceIdentifiers: [{system: "MONDO", value: mondo, mapping: "exact"}],
    });
    for (const assoc of rec.associations) {
      nodes.push({
        ...base,
        id: `target.${assoc.targetEnsemblId}`,
        kind: "gene_target",
        preferredLabel: assoc.approvedSymbol,
        sourceIdentifiers: [{system: "Ensembl", value: assoc.targetEnsemblId, mapping: "exact"}],
      });
    }
  }
  for (const nctId of input.nctIds) {
    nodes.push({
      ...base,
      id: `trial.${nctId}`,
      kind: "clinical_trial",
      preferredLabel: nctId,
      sourceIdentifiers: [{system: "NCT", value: nctId, mapping: "exact"}],
    });
  }
  return nodes;
}

function resolvePinnedEntities(input: {
  bibliographic: BibliographicRecord[];
  openTargets: OpenTargetsDiseaseRecord[];
  nctIds: readonly LivingEvidenceNctId[];
}): LivingEvidenceEntityResolution[] {
  const nodes = ontologyNodesFromExpansion({
    bibliographic: input.bibliographic,
    openTargets: input.openTargets,
    nctIds: input.nctIds,
  });
  const out: LivingEvidenceEntityResolution[] = [];
  for (const rec of input.bibliographic) {
    if (!rec.pmid) continue;
    validateHsiOntologyIdentifier("PMID", rec.pmid, HSI_ONTOLOGY_NAMESPACES);
    out.push({
      system: "PMID",
      value: rec.pmid,
      resolution: resolveHsiOntologyIdentity({system: "PMID", value: rec.pmid, nodes}),
      sourceProvider: "europe_pmc",
      graphRelationshipCandidate: false,
      needsHumanReview: true,
    });
  }
  for (const rec of input.openTargets) {
    const mondo = rec.diseaseId.replace("_", ":");
    validateHsiOntologyIdentifier("MONDO", mondo, HSI_ONTOLOGY_NAMESPACES);
    out.push({
      system: "MONDO",
      value: mondo,
      resolution: resolveHsiOntologyIdentity({system: "MONDO", value: mondo, nodes}),
      sourceProvider: "open_targets",
      graphRelationshipCandidate: false,
      needsHumanReview: true,
    });
  }
  for (const nctId of input.nctIds) {
    validateHsiOntologyIdentifier("NCT", nctId, HSI_ONTOLOGY_NAMESPACES);
    out.push({
      system: "NCT",
      value: nctId,
      resolution: resolveHsiOntologyIdentity({system: "NCT", value: nctId, nodes}),
      sourceProvider: "clinicaltrials_gov",
      graphRelationshipCandidate: false,
      needsHumanReview: true,
    });
  }
  return out;
}

function graphCandidatesFromOpenTargets(
  records: OpenTargetsDiseaseRecord[],
): LivingEvidenceGraphRelationshipCandidate[] {
  const out: LivingEvidenceGraphRelationshipCandidate[] = [];
  for (const rec of records) {
    const mondo = rec.diseaseId.replace("_", ":");
    for (const assoc of rec.associations) {
      out.push({
        id: `ot-rel:${rec.diseaseId}:${assoc.targetEnsemblId}`,
        kind: "disease_associated_target_metadata",
        subject: {system: "MONDO", value: mondo, label: rec.diseaseName},
        object: {system: "Ensembl", value: assoc.targetEnsemblId, label: assoc.approvedSymbol},
        score: assoc.score,
        sourceProvider: "open_targets",
        sourceDiseaseId: rec.diseaseId,
        retrievedAt: rec.retrievedAt,
        responseIdentity: rec.responseIdentity,
        graphPromotable: false,
        scientificApproval: false,
        claimSupport: false,
        needsHumanReview: true,
      });
    }
  }
  return out;
}

function studyBrief(study: Record<string, unknown>): {briefTitle: string | null; overallStatus: string | null} {
  const protocol = study.protocolSection;
  if (!protocol || typeof protocol !== "object" || Array.isArray(protocol)) {
    return {briefTitle: null, overallStatus: null};
  }
  const p = protocol as Record<string, unknown>;
  const idModule = p.identificationModule;
  const statusModule = p.statusModule;
  const briefTitle =
    idModule && typeof idModule === "object" && !Array.isArray(idModule)
      ? typeof (idModule as {briefTitle?: unknown}).briefTitle === "string"
        ? (idModule as {briefTitle: string}).briefTitle
        : null
      : null;
  const overallStatus =
    statusModule && typeof statusModule === "object" && !Array.isArray(statusModule)
      ? typeof (statusModule as {overallStatus?: unknown}).overallStatus === "string"
        ? (statusModule as {overallStatus: string}).overallStatus
        : null
      : null;
  return {briefTitle, overallStatus};
}

function providerHitFromBibliographic(
  pmid: LivingEvidencePmid,
  result: BibliographicLookupResult,
): LivingEvidenceProviderRow {
  if (result.ok) {
    return {
      provider: "europe_pmc",
      pmid,
      ok: true,
      outcome: "metadata_retrieved",
      retrievedAt: result.retrievedAt,
      responseIdentity: result.responseIdentity,
      httpStatus: result.httpStatus,
      detail: null,
    };
  }
  return {
    provider: "europe_pmc",
    pmid,
    ok: false,
    outcome: result.outcome,
    retrievedAt: result.retrievedAt,
    responseIdentity: null,
    httpStatus: result.httpStatus,
    detail: result.detail,
  };
}

function providerHitFromOpenTargets(
  diseaseId: LivingEvidenceDiseaseId,
  result: OpenTargetsLookupResult,
): LivingEvidenceProviderRow {
  if (result.ok) {
    return {
      provider: "open_targets",
      diseaseId,
      ok: true,
      outcome: "metadata_retrieved",
      retrievedAt: result.retrievedAt,
      responseIdentity: result.responseIdentity,
      httpStatus: result.httpStatus,
      detail: null,
    };
  }
  return {
    provider: "open_targets",
    diseaseId,
    ok: false,
    outcome: result.outcome,
    retrievedAt: result.retrievedAt,
    responseIdentity: null,
    httpStatus: result.httpStatus,
    detail: result.detail,
  };
}

function providerHitFromCtgov(
  nctId: LivingEvidenceNctId,
  result: CtgovLookupResult,
): LivingEvidenceProviderRow {
  if (result.ok) {
    return {
      provider: "clinicaltrials_gov",
      nctId,
      ok: true,
      outcome: "metadata_retrieved",
      retrievedAt: result.retrievedAt,
      responseIdentity: result.responseIdentity,
      httpStatus: result.httpStatus,
      detail: null,
    };
  }
  return {
    provider: "clinicaltrials_gov",
    nctId,
    ok: false,
    outcome: result.outcome,
    retrievedAt: result.retrievedAt,
    responseIdentity: null,
    httpStatus: result.httpStatus,
    detail: result.detail,
  };
}

function buildSnapshotFromResults(input: {
  origin: "fixture_replay" | "live_provider_unverified";
  generatedAt: string;
  asOf: string;
  retrievedAt: string;
  bibliographicResults: {pmid: LivingEvidencePmid; result: BibliographicLookupResult}[];
  openTargetsResults: {diseaseId: LivingEvidenceDiseaseId; result: OpenTargetsLookupResult}[];
  ctgovResults: {nctId: LivingEvidenceNctId; result: CtgovLookupResult}[];
}): LivingEvidenceExpansionSnapshot {
  assertLivingEvidencePins();
  const bibliographicRecords: BibliographicRecord[] = [];
  const providerHits: LivingEvidenceProviderRow[] = [];
  let providerSignalsObserved = false;

  for (const row of input.bibliographicResults) {
    providerHits.push(providerHitFromBibliographic(row.pmid, row.result));
    if (!row.result.ok) continue;
    const match = row.result.records.find((r) => r.pmid === row.pmid) ?? row.result.records[0];
    if (!match) continue;
    bibliographicRecords.push(match);
    if (
      match.rightsSignals.isOpenAccess !== null ||
      match.rightsSignals.providerLicenseLabel !== null ||
      match.rightsSignals.inEPMC !== null
    ) {
      providerSignalsObserved = true;
    }
  }

  const openTargetsRecords: OpenTargetsDiseaseRecord[] = [];
  for (const row of input.openTargetsResults) {
    providerHits.push(providerHitFromOpenTargets(row.diseaseId, row.result));
    if (row.result.ok) openTargetsRecords.push(row.result.record);
  }

  const registryEntityResolutions: LivingEvidenceExpansionSnapshot["registryEntityResolutions"] = [];
  for (const row of input.ctgovResults) {
    providerHits.push(providerHitFromCtgov(row.nctId, row.result));
    if (!row.result.ok) continue;
    const brief = studyBrief(row.result.study);
    registryEntityResolutions.push({
      nctId: row.nctId,
      briefTitle: brief.briefTitle,
      overallStatus: brief.overallStatus,
      retrievedAt: row.result.retrievedAt,
      responseIdentity: row.result.responseIdentity,
      translationalAttachStatus: "not_attached_step_05",
      eligibilityAssessed: false,
      confirmedEligible: false,
    });
  }

  const entityResolutions = resolvePinnedEntities({
    bibliographic: bibliographicRecords,
    openTargets: openTargetsRecords,
    nctIds: LIVING_EVIDENCE_NCT_PINS,
  });
  const graphRelationshipCandidates = graphCandidatesFromOpenTargets(openTargetsRecords);
  const responseIdentities = [
    ...bibliographicRecords.map((r) => r.responseIdentity),
    ...openTargetsRecords.map((r) => r.responseIdentity),
    ...registryEntityResolutions.map((r) => r.responseIdentity),
  ].sort();

  return sealSnapshot({
    schemaVersion: LIVING_EVIDENCE_EXPANSION_SCHEMA,
    method: LIVING_EVIDENCE_EXPANSION_METHOD,
    programme: LIVING_EVIDENCE_PROGRAMME,
    origin: input.origin,
    generatedAt: input.generatedAt,
    asOf: input.asOf,
    retrievedAt: input.retrievedAt,
    pinnedPmids: LIVING_EVIDENCE_PMID_PINS,
    pinnedDiseaseIds: LIVING_EVIDENCE_DISEASE_PINS,
    pinnedNctIds: LIVING_EVIDENCE_NCT_PINS,
    bibliographicRecords,
    openTargetsRecords,
    registryEntityResolutions,
    entityResolutions,
    graphRelationshipCandidates,
    providerHits,
    licensing: {
      providerSignalsObserved,
      humanCleared: false,
      passageImported: false,
      passageImportAuthorized: false,
      licenceEvidenceUri: null,
      note: "Europe PMC OA/licence fields and Open Targets public indexes are provider observations only. Human queue #2 attestation is required before any passage import.",
    },
    honesty: {
      metadataOnly: true,
      passageImportFailClosed: true,
      rightsClearanceNotClaimed: true,
      scientificAcceptance: "BLOCKED",
      graphPromotable: false,
      gateCAutoApprove: false,
      legalBinding: false,
      trialsAttachedToInvestigation: false,
      cdsPhi: false,
    },
    cache: {
      rateLimited: true,
      minIntervalMs: RATE_LIMIT_MS,
      responseIdentities,
    },
  });
}

function unavailableCapabilities(snapshot: LivingEvidenceExpansionSnapshot): string[] {
  const out = [
    "Passage import (humanCleared=false; human queue #2 PARKED)",
    "Scientific acceptance / SME gold (human queue #4 PARKED)",
    "Gate C auto-approve / MoU legalBinding (forbidden)",
    "Investigation trials attach / O-04 translational (reserved for step 05)",
    "Verified scientific gap ranking (reserved for step 04)",
  ];
  if (snapshot.bibliographicRecords.length < LIVING_EVIDENCE_PMID_PINS.length) {
    out.push("Complete Europe PMC retrieval for all pinned PMIDs");
  }
  if (snapshot.openTargetsRecords.length < LIVING_EVIDENCE_DISEASE_PINS.length) {
    out.push("Complete Open Targets retrieval for all pinned diseases");
  }
  if (snapshot.registryEntityResolutions.length < LIVING_EVIDENCE_NCT_PINS.length) {
    out.push("Complete ClinicalTrials.gov identity resolution for pinned NCTs");
  }
  return out;
}

function buildReceipt(input: {
  snapshot: LivingEvidenceExpansionSnapshot;
  generatedAt: string;
  mode: "offline_fixture_replay" | "live_provider_probe";
}): LivingEvidenceExpansionReceipt {
  const snapshot = parseLivingEvidenceExpansionSnapshot(input.snapshot);
  return sealReceipt({
    schemaVersion: "hsi-living-evidence-expansion-receipt-1",
    phase: "step_03",
    programme: LIVING_EVIDENCE_PROGRAMME,
    generatedAt: input.generatedAt,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    humanCleared: false,
    passageImported: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    legalBinding: false,
    mode: input.mode,
    bibliographicRetrieved: snapshot.bibliographicRecords.length,
    openTargetsRetrieved: snapshot.openTargetsRecords.length,
    registryEntitiesResolved: snapshot.registryEntityResolutions.length,
    entityResolutions: snapshot.entityResolutions.length,
    graphRelationshipCandidates: snapshot.graphRelationshipCandidates.length,
    providerHits: snapshot.providerHits,
    snapshot,
    unavailableCapabilities: unavailableCapabilities(snapshot),
    nextMilestone: "step_04_agent_intelligence_gap_verification",
  });
}

export function parseLivingEvidenceExpansionSnapshot(value: unknown): LivingEvidenceExpansionSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid living evidence expansion snapshot");
  }
  const snapshot = value as LivingEvidenceExpansionSnapshot;
  if (
    snapshot.schemaVersion !== LIVING_EVIDENCE_EXPANSION_SCHEMA ||
    snapshot.method !== LIVING_EVIDENCE_EXPANSION_METHOD ||
    snapshot.programme !== LIVING_EVIDENCE_PROGRAMME
  ) {
    throw new Error("Unsupported living evidence expansion snapshot");
  }
  if (
    snapshot.licensing.humanCleared !== false ||
    snapshot.licensing.passageImported !== false ||
    snapshot.licensing.passageImportAuthorized !== false ||
    snapshot.licensing.licenceEvidenceUri !== null
  ) {
    throw new Error("Living evidence expansion cannot invent rights clearance or passage import");
  }
  if (
    snapshot.honesty.scientificAcceptance !== "BLOCKED" ||
    snapshot.honesty.graphPromotable !== false ||
    snapshot.honesty.gateCAutoApprove !== false ||
    snapshot.honesty.legalBinding !== false ||
    snapshot.honesty.trialsAttachedToInvestigation !== false ||
    snapshot.honesty.passageImportFailClosed !== true
  ) {
    throw new Error("Living evidence expansion honesty flags violated");
  }
  if (snapshot.graphRelationshipCandidates.some((c) => c.graphPromotable || c.scientificApproval || c.claimSupport)) {
    throw new Error("Graph relationship candidates cannot claim promotion or support");
  }
  if (
    !Array.isArray(snapshot.pinnedPmids) ||
    snapshot.pinnedPmids.join(",") !== LIVING_EVIDENCE_PMID_PINS.join(",") ||
    snapshot.pinnedDiseaseIds.join(",") !== LIVING_EVIDENCE_DISEASE_PINS.join(",") ||
    snapshot.pinnedNctIds.join(",") !== LIVING_EVIDENCE_NCT_PINS.join(",")
  ) {
    throw new Error("Living evidence expansion pin set drift");
  }
  const {snapshotHash, ...body} = snapshot;
  const expected = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  if (snapshotHash !== expected) throw new Error("Living evidence expansion snapshot hash mismatch");
  return snapshot;
}

export function parseLivingEvidenceExpansionReceipt(value: unknown): LivingEvidenceExpansionReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid living evidence expansion receipt");
  }
  const receipt = value as LivingEvidenceExpansionReceipt;
  if (
    receipt.schemaVersion !== "hsi-living-evidence-expansion-receipt-1" ||
    receipt.phase !== "step_03" ||
    receipt.engineeringHarness !== "CLEARED" ||
    receipt.scientificAcceptance !== "BLOCKED" ||
    receipt.rightsAcceptance !== "BLOCKED" ||
    receipt.humanCleared !== false ||
    receipt.passageImported !== false ||
    receipt.graphPromotable !== false ||
    receipt.gateCAutoApprove !== false ||
    receipt.legalBinding !== false
  ) {
    throw new Error("Living evidence expansion receipt honesty violated");
  }
  parseLivingEvidenceExpansionSnapshot(receipt.snapshot);
  const {receiptHash, ...body} = receipt;
  const expected = createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
  if (receiptHash !== expected) throw new Error("Living evidence expansion receipt hash mismatch");
  return receipt;
}

export function runLivingEvidenceExpansionFromFixtures(input: {
  europePmcBodiesByPmid: Record<string, {httpStatus: number; bodyText: string}>;
  openTargetsBodiesByDiseaseId: Record<string, {httpStatus: number; bodyText: string}>;
  ctgovBodiesByNct: Record<string, {httpStatus: number; bodyText: string}>;
  retrievedAt: string;
  asOf: string;
  generatedAt: string;
}): {snapshot: LivingEvidenceExpansionSnapshot; receipt: LivingEvidenceExpansionReceipt} {
  assertLivingEvidencePins();
  const bibliographicResults = LIVING_EVIDENCE_PMID_PINS.map((pmid) => {
    const body = input.europePmcBodiesByPmid[pmid];
    if (!body) throw new Error(`Missing Europe PMC fixture for PMID ${pmid}`);
    return {
      pmid,
      result: parseEuropePmcBibliographicPayload({
        query: `EXT_ID:${pmid} AND SRC:MED`,
        bodyText: body.bodyText,
        httpStatus: body.httpStatus,
        retrievedAt: input.retrievedAt,
      }),
    };
  });
  const openTargetsResults = LIVING_EVIDENCE_DISEASE_PINS.map((diseaseId) => {
    const body = input.openTargetsBodiesByDiseaseId[diseaseId];
    if (!body) throw new Error(`Missing Open Targets fixture for ${diseaseId}`);
    return {
      diseaseId,
      result: parseOpenTargetsDiseasePayload({
        diseaseId,
        bodyText: body.bodyText,
        httpStatus: body.httpStatus,
        retrievedAt: input.retrievedAt,
      }),
    };
  });
  const ctgovResults = LIVING_EVIDENCE_NCT_PINS.map((nctId) => {
    const body = input.ctgovBodiesByNct[nctId];
    if (!body) throw new Error(`Missing CT.gov fixture for ${nctId}`);
    return {
      nctId,
      result: parseClinicalTrialsGovStudyPayload({
        nctId,
        bodyText: body.bodyText,
        httpStatus: body.httpStatus,
        retrievedAt: input.retrievedAt,
      }),
    };
  });

  const snapshot = buildSnapshotFromResults({
    origin: "fixture_replay",
    generatedAt: input.generatedAt,
    asOf: input.asOf,
    retrievedAt: input.retrievedAt,
    bibliographicResults,
    openTargetsResults,
    ctgovResults,
  });
  const receipt = buildReceipt({
    snapshot,
    generatedAt: input.generatedAt,
    mode: "offline_fixture_replay",
  });
  return {snapshot, receipt};
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runLivingEvidenceExpansionFromProviders(input?: {
  fetcher?: typeof fetch;
  now?: () => Date;
  minIntervalMs?: number;
}): Promise<{snapshot: LivingEvidenceExpansionSnapshot; receipt: LivingEvidenceExpansionReceipt}> {
  assertLivingEvidencePins();
  const now = input?.now ?? (() => new Date());
  const interval = input?.minIntervalMs ?? RATE_LIMIT_MS;
  const retrievedAt = now().toISOString();
  const bibliographicResults: {pmid: LivingEvidencePmid; result: BibliographicLookupResult}[] = [];
  for (const pmid of LIVING_EVIDENCE_PMID_PINS) {
    bibliographicResults.push({
      pmid,
      result: await lookupEuropePmcByPmid({pmid, fetcher: input?.fetcher, now}),
    });
    await sleep(interval);
  }
  const openTargetsResults: {diseaseId: LivingEvidenceDiseaseId; result: OpenTargetsLookupResult}[] = [];
  for (const diseaseId of LIVING_EVIDENCE_DISEASE_PINS) {
    openTargetsResults.push({
      diseaseId,
      result: await lookupOpenTargetsDiseaseAssociations({diseaseId, fetcher: input?.fetcher, now}),
    });
    await sleep(interval);
  }
  const ctgovResults: {nctId: LivingEvidenceNctId; result: CtgovLookupResult}[] = [];
  for (const nctId of LIVING_EVIDENCE_NCT_PINS) {
    ctgovResults.push({
      nctId,
      result: await lookupClinicalTrialsGovByNctId({nctId, fetcher: input?.fetcher, now}),
    });
    await sleep(interval);
  }
  const generatedAt = now().toISOString();
  const snapshot = buildSnapshotFromResults({
    origin: "live_provider_unverified",
    generatedAt,
    asOf: generatedAt,
    retrievedAt,
    bibliographicResults,
    openTargetsResults,
    ctgovResults,
  });
  const receipt = buildReceipt({
    snapshot,
    generatedAt,
    mode: "live_provider_probe",
  });
  return {snapshot, receipt};
}

/** Outcome-facing projection: bind retrieved metadata when investigation sources overlap pins. */
export type LivingEvidenceOutcomeSection = {
  status: "bound_metadata_refresh" | "not_attached";
  schemaVersion: typeof LIVING_EVIDENCE_EXPANSION_SCHEMA | null;
  snapshotHash: string | null;
  asOf: string | null;
  matchedPmids: string[];
  bibliographic: {
    pmid: string | null;
    doi: string | null;
    title: string;
    journal: string | null;
    publicationYear: number | null;
    isRetracted: boolean | null;
    url: string;
    provider: "europe_pmc";
    retrievedAt: string;
    rightsSignals: BibliographicRecord["rightsSignals"];
    verificationState: "metadata_retrieved_not_claim_verified";
  }[];
  openTargetsAssociations: {
    diseaseId: string;
    diseaseName: string;
    targetSymbol: string;
    targetEnsemblId: string;
    score: number;
    graphPromotable: false;
  }[];
  registryIdentityOnly: {
    nctId: string;
    briefTitle: string | null;
    overallStatus: string | null;
    translationalAttachStatus: "not_attached_step_05";
  }[];
  entityResolutions: LivingEvidenceEntityResolution[];
  graphRelationshipCandidates: number;
  licensing: LivingEvidenceExpansionSnapshot["licensing"] | null;
  unavailableCapabilities: string[];
  note: string;
};

export function projectLivingEvidenceForOutcome(input: {
  sourcePmids: readonly (string | null | undefined)[];
  snapshot: LivingEvidenceExpansionSnapshot | null;
}): LivingEvidenceOutcomeSection {
  const sourcePmids = [
    ...new Set(
      input.sourcePmids
        .filter((p): p is string => typeof p === "string" && /^[1-9]\d{0,8}$/.test(p))
        .map((p) => p),
    ),
  ];
  if (!input.snapshot) {
    return {
      status: "not_attached",
      schemaVersion: null,
      snapshotHash: null,
      asOf: null,
      matchedPmids: [],
      bibliographic: [],
      openTargetsAssociations: [],
      registryIdentityOnly: [],
      entityResolutions: [],
      graphRelationshipCandidates: 0,
      licensing: null,
      unavailableCapabilities: [
        "Living evidence expansion snapshot not bound to this investigation",
        "Passage import (humanCleared=false)",
        "O-04 translational trials attach (step 05)",
      ],
      note: "No living-evidence metadata refresh is attached. Saved release sources remain the only bound evidence.",
    };
  }
  const snapshot = parseLivingEvidenceExpansionSnapshot(input.snapshot);
  const matchedPmids = sourcePmids.filter((pmid) =>
    snapshot.bibliographicRecords.some((r) => r.pmid === pmid),
  );
  if (matchedPmids.length === 0 && sourcePmids.length > 0) {
    return {
      status: "not_attached",
      schemaVersion: snapshot.schemaVersion,
      snapshotHash: snapshot.snapshotHash ?? null,
      asOf: snapshot.asOf,
      matchedPmids: [],
      bibliographic: [],
      openTargetsAssociations: [],
      registryIdentityOnly: [],
      entityResolutions: [],
      graphRelationshipCandidates: 0,
      licensing: snapshot.licensing,
      unavailableCapabilities: unavailableCapabilities(snapshot),
      note: "Investigation source PMIDs do not overlap the living-evidence pin set; expansion remains unbound for this package.",
    };
  }
  // Bind programme expansion when sources are empty (synthetic fixture) only as not_attached.
  if (matchedPmids.length === 0) {
    return {
      status: "not_attached",
      schemaVersion: snapshot.schemaVersion,
      snapshotHash: snapshot.snapshotHash ?? null,
      asOf: snapshot.asOf,
      matchedPmids: [],
      bibliographic: [],
      openTargetsAssociations: [],
      registryIdentityOnly: [],
      entityResolutions: [],
      graphRelationshipCandidates: 0,
      licensing: snapshot.licensing,
      unavailableCapabilities: unavailableCapabilities(snapshot),
      note: "Synthetic or non-overlapping investigation sources; living evidence expansion is available as a programme snapshot but not bound into this outcome.",
    };
  }

  const bibliographic = snapshot.bibliographicRecords
    .filter((r) => r.pmid && matchedPmids.includes(r.pmid))
    .map((r) => ({
      pmid: r.pmid,
      doi: r.doi,
      title: r.title,
      journal: r.journal,
      publicationYear: r.publicationYear,
      isRetracted: r.isRetracted,
      url: r.url,
      provider: "europe_pmc" as const,
      retrievedAt: r.retrievedAt,
      rightsSignals: r.rightsSignals,
      verificationState: "metadata_retrieved_not_claim_verified" as const,
    }));

  return {
    status: "bound_metadata_refresh",
    schemaVersion: snapshot.schemaVersion,
    snapshotHash: snapshot.snapshotHash ?? null,
    asOf: snapshot.asOf,
    matchedPmids,
    bibliographic,
    openTargetsAssociations: snapshot.openTargetsRecords.flatMap((rec) =>
      rec.associations.map((a) => ({
        diseaseId: rec.diseaseId,
        diseaseName: rec.diseaseName,
        targetSymbol: a.approvedSymbol,
        targetEnsemblId: a.targetEnsemblId,
        score: a.score,
        graphPromotable: false as const,
      })),
    ),
    registryIdentityOnly: snapshot.registryEntityResolutions.map((r) => ({
      nctId: r.nctId,
      briefTitle: r.briefTitle,
      overallStatus: r.overallStatus,
      translationalAttachStatus: "not_attached_step_05" as const,
    })),
    entityResolutions: snapshot.entityResolutions,
    graphRelationshipCandidates: snapshot.graphRelationshipCandidates.length,
    licensing: snapshot.licensing,
    unavailableCapabilities: unavailableCapabilities(snapshot),
    note: "Living evidence metadata refresh bound for overlapping PMIDs. Provider OA/licence signals are not passage clearance. Graph relationship candidates require human review before promotion.",
  };
}
