/**
 * Milestone 4 / PR1 — Translational evidence contracts & thin identity resolution.
 *
 * Extends existing O-04 translational attach + OT / Europe PMC / CT.gov / UniProt
 * lookups. Does NOT invent proprietary programmes, infer clinical failure from
 * recruitment/termination, auto-approve graph edges, or claim absence of published
 * evidence as absence of activity.
 *
 * ChEMBL / Reactome: identifier stub recognition only (no live fetch in this PR).
 */
import {createHash} from "node:crypto";
import {assertValidNctId, CTGOV_PROVIDER} from "./clinicalTrialsGovLookup";
import {OPEN_TARGETS_PROVIDER, type OpenTargetsDiseaseRecord} from "./openTargetsLookup";
import {UNIPROT_PROVIDER, assertValidUniprotAccession} from "./uniprotMetadataLookup";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {
  TranslationalLandscapeSnapshot,
  TranslationalTrialRecord,
} from "./translationalEvidenceAttach";

export const TRANSLATIONAL_EVIDENCE_CONTRACTS_SCHEMA =
  "hsi-translational-evidence-contracts-1" as const;
export const TRANSLATIONAL_EVIDENCE_CONTRACTS_METHOD =
  "hsi.translational_evidence_contracts.v1" as const;
export const TRANSLATIONAL_EVIDENCE_CONTRACTS_VERSION = "0.1.0" as const;

export type TranslationalEvidenceLayer =
  | "programme"
  | "preclinical"
  | "human_translational"
  | "clinical";

export type TranslationalUnknownField =
  | "programme_identity"
  | "sponsor"
  | "modality"
  | "primary_target"
  | "indication"
  | "preclinical_model"
  | "human_biomarker"
  | "clinical_phase"
  | "clinical_outcome"
  | "failure_mode"
  | "publication_record"
  | "proprietary_status";

/** Closed set — never invent proprietary programme names. */
export type ProgrammeIdentityKind =
  | "public_registry_anchored"
  | "public_literature_anchored"
  | "curator_declared_public"
  | "unknown_not_invented";

export type TranslationalIdentitySystem =
  | "nct"
  | "open_targets_disease"
  | "open_targets_target"
  | "pmid"
  | "doi"
  | "uniprot"
  | "reactome"
  | "chembl"
  | "hgnc"
  | "unknown";

export type TranslationalIdentityRef = {
  system: TranslationalIdentitySystem;
  value: string;
  label: string | null;
  /** Resolved against an existing adapter/prefix — not claim support. */
  resolution: "resolved_prefix" | "resolved_lookup_metadata" | "unresolved" | "stub_only";
  sourceProvider: string | null;
  claimSupport: "not_assessed";
};

export type TranslationalEvidenceContract = {
  schemaVersion: typeof TRANSLATIONAL_EVIDENCE_CONTRACTS_SCHEMA;
  id: string;
  layer: TranslationalEvidenceLayer;
  programmeIdentityKind: ProgrammeIdentityKind;
  /** Public display label only when anchored; otherwise null (unknown preserved). */
  programmeLabel: string | null;
  identities: readonly TranslationalIdentityRef[];
  unknowns: readonly TranslationalUnknownField[];
  linkedNctIds: readonly string[];
  linkedPmids: readonly string[];
  linkedUniprotAccessions: readonly string[];
  linkedOpenTargetsDiseaseIds: readonly string[];
  linkedOpenTargetsTargetSymbols: readonly string[];
  /** Registry overallStatus echoed when clinical layer — never mapped to failure. */
  registryOverallStatus: string | null;
  honesty: {
    unknownsPreserved: true;
    recruitmentOrTerminationIsNotClinicalFailure: true;
    absenceOfPublishedEvidenceIsNotAbsenceOfActivity: true;
    proprietaryProgrammesNotInvented: true;
    registrationIsNotEfficacy: true;
    missingResultsIsNotFailure: true;
    patientTreatmentRecommendation: false;
    eligibilityAssessed: false;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
  };
  note: string;
};

export type TranslationalEvidenceContractPack = {
  schemaVersion: "hsi-translational-evidence-contract-pack-1";
  method: typeof TRANSLATIONAL_EVIDENCE_CONTRACTS_METHOD;
  version: typeof TRANSLATIONAL_EVIDENCE_CONTRACTS_VERSION;
  generatedAt: string;
  contracts: readonly TranslationalEvidenceContract[];
  identityResolution: {
    openTargets: "partial_metadata";
    europePmc: "partial_metadata";
    clinicalTrialsGov: "partial_metadata";
    uniprot: "partial_metadata";
    reactome: "stub_identifier_only";
    chembl: "stub_identifier_only";
  };
  summary: {
    programme: number;
    preclinical: number;
    humanTranslational: number;
    clinical: number;
    unknownFieldsRecorded: number;
  };
  honesty: TranslationalEvidenceContract["honesty"] & {
    projectedFromExistingTranslationalAttach: true;
    notAParallelTranslationalStack: true;
    notScientificValidity: true;
  };
};

const REACTOME_ID = /^R-[A-Z]{3}-[0-9]+$/;
const CHEMBL_ID = /^CHEMBL[0-9]+$/i;
const PMID_ID = /^[1-9][0-9]*$/;
const OT_DISEASE_ID = /^(MONDO_|EFO_|Orphanet_|OTAR_|HP_)[A-Za-z0-9]+$/;

function fail(message: string): never {
  throw new Error(message);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((v) => typeof v === "string" && v.trim()))];
}

/** Thin Reactome pathway id recognition — no live fetch. */
export function resolveReactomeIdentityStub(value: string): TranslationalIdentityRef {
  const trimmed = value.trim();
  if (!REACTOME_ID.test(trimmed)) {
    return {
      system: "reactome",
      value: trimmed,
      label: null,
      resolution: "unresolved",
      sourceProvider: null,
      claimSupport: "not_assessed",
    };
  }
  return {
    system: "reactome",
    value: trimmed,
    label: null,
    resolution: "stub_only",
    sourceProvider: "reactome_identifier_stub",
    claimSupport: "not_assessed",
  };
}

/** Thin ChEMBL compound/target id recognition — no live fetch. */
export function resolveChemblIdentityStub(value: string): TranslationalIdentityRef {
  const trimmed = value.trim().toUpperCase();
  if (!CHEMBL_ID.test(trimmed)) {
    return {
      system: "chembl",
      value: value.trim(),
      label: null,
      resolution: "unresolved",
      sourceProvider: null,
      claimSupport: "not_assessed",
    };
  }
  return {
    system: "chembl",
    value: trimmed,
    label: null,
    resolution: "stub_only",
    sourceProvider: "chembl_identifier_stub",
    claimSupport: "not_assessed",
  };
}

export function resolveUniprotIdentity(value: string): TranslationalIdentityRef {
  try {
    const accession = assertValidUniprotAccession(value);
    return {
      system: "uniprot",
      value: accession,
      label: null,
      resolution: "resolved_prefix",
      sourceProvider: UNIPROT_PROVIDER,
      claimSupport: "not_assessed",
    };
  } catch {
    return {
      system: "uniprot",
      value: value.trim(),
      label: null,
      resolution: "unresolved",
      sourceProvider: null,
      claimSupport: "not_assessed",
    };
  }
}

export function resolveNctIdentity(value: string): TranslationalIdentityRef {
  try {
    const nctId = assertValidNctId(value);
    return {
      system: "nct",
      value: nctId,
      label: null,
      resolution: "resolved_prefix",
      sourceProvider: CTGOV_PROVIDER,
      claimSupport: "not_assessed",
    };
  } catch {
    return {
      system: "nct",
      value: value.trim(),
      label: null,
      resolution: "unresolved",
      sourceProvider: null,
      claimSupport: "not_assessed",
    };
  }
}

export function resolvePmidIdentity(value: string): TranslationalIdentityRef {
  const trimmed = value.trim().replace(/^pmid:/i, "");
  if (!PMID_ID.test(trimmed)) {
    return {
      system: "pmid",
      value: trimmed,
      label: null,
      resolution: "unresolved",
      sourceProvider: null,
      claimSupport: "not_assessed",
    };
  }
  return {
    system: "pmid",
    value: trimmed,
    label: null,
    resolution: "resolved_prefix",
    sourceProvider: "europe_pmc_bibliographic",
    claimSupport: "not_assessed",
  };
}

export function resolveOpenTargetsDiseaseIdentity(value: string): TranslationalIdentityRef {
  const trimmed = value.trim();
  if (!OT_DISEASE_ID.test(trimmed) && !/^MONDO:\d{7}$/.test(trimmed)) {
    return {
      system: "open_targets_disease",
      value: trimmed,
      label: null,
      resolution: "unresolved",
      sourceProvider: null,
      claimSupport: "not_assessed",
    };
  }
  return {
    system: "open_targets_disease",
    value: trimmed.replace(":", "_"),
    label: null,
    resolution: "resolved_prefix",
    sourceProvider: OPEN_TARGETS_PROVIDER,
    claimSupport: "not_assessed",
  };
}

/**
 * Classify registry overallStatus honestly.
 * Termination / recruiting / withdrawn never become clinical_failure here.
 */
export function registryStatusFailureHonesty(overallStatus: string | null): {
  clinicalFailureInferred: false;
  note: string;
} {
  const status = overallStatus?.trim().toLowerCase() ?? "";
  if (!status) {
    return {
      clinicalFailureInferred: false,
      note: "Registry overallStatus unknown — unknowns preserved; no clinical failure inferred.",
    };
  }
  if (/terminat|withdrawn|suspended|recruiting|not yet recruiting|enrolling/.test(status)) {
    return {
      clinicalFailureInferred: false,
      note: `Registry status “${overallStatus}” is not clinical failure evidence. Recruitment or termination alone must not be mapped to translational failure.`,
    };
  }
  return {
    clinicalFailureInferred: false,
    note: `Registry status “${overallStatus}” recorded as status metadata only — not efficacy or failure adjudication.`,
  };
}

function contractId(layer: TranslationalEvidenceLayer, anchor: string): string {
  return `tec:${createHash("sha256")
    .update(canonicalEvidenceJson({layer, anchor, v: TRANSLATIONAL_EVIDENCE_CONTRACTS_VERSION}))
    .digest("hex")
    .slice(0, 24)}`;
}

function baseHonesty(): TranslationalEvidenceContract["honesty"] {
  return {
    unknownsPreserved: true,
    recruitmentOrTerminationIsNotClinicalFailure: true,
    absenceOfPublishedEvidenceIsNotAbsenceOfActivity: true,
    proprietaryProgrammesNotInvented: true,
    registrationIsNotEfficacy: true,
    missingResultsIsNotFailure: true,
    patientTreatmentRecommendation: false,
    eligibilityAssessed: false,
    scientificApproval: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    cdsPhi: false,
    fixturesAreNotLiveEvidence: true,
  };
}

function sealContract(contract: TranslationalEvidenceContract): TranslationalEvidenceContract {
  if (contract.honesty.scientificApproval !== false || contract.honesty.graphPromotable !== false) {
    fail("Translational contract must stay unapproved / non-promotable");
  }
  if (contract.honesty.patientTreatmentRecommendation !== false) {
    fail("Patient treatment recommendations are forbidden");
  }
  if (contract.honesty.recruitmentOrTerminationIsNotClinicalFailure !== true) {
    fail("Recruitment/termination must not imply clinical failure");
  }
  if (contract.programmeIdentityKind === "unknown_not_invented" && contract.programmeLabel != null) {
    fail("Unknown programmes must not invent labels");
  }
  return contract;
}

/**
 * Project one CT.gov trial record into layered translational contracts.
 * Unknowns are explicit; proprietary programmes are never invented.
 */
export function contractsFromTranslationalTrial(input: {
  record: TranslationalTrialRecord;
  openTargets?: readonly OpenTargetsDiseaseRecord[];
}): TranslationalEvidenceContract[] {
  const record = input.record;
  const nct = resolveNctIdentity(record.nctId);
  const statusHonesty = registryStatusFailureHonesty(record.registration.overallStatus);
  const pmids = unique(record.publishedOutcomes.map((p) => p.pmid).filter((p): p is string => Boolean(p)));
  const targetSymbols = unique(
    record.interventionTargetMapping.mappedTargets.map((t) => t.targetSymbol),
  );
  const diseaseIds = unique(
    record.interventionTargetMapping.mappedTargets.map((t) => t.diseaseId),
  );
  const otDiseaseRefs = diseaseIds.map(resolveOpenTargetsDiseaseIdentity);
  const otFromRecords = (input.openTargets ?? []).map((d) =>
    resolveOpenTargetsDiseaseIdentity(d.diseaseId),
  );
  const pmidRefs = pmids.map(resolvePmidIdentity);
  const targetRefs: TranslationalIdentityRef[] = targetSymbols.map((symbol) => ({
    system: "open_targets_target",
    value: symbol,
    label: symbol,
    resolution: "resolved_lookup_metadata",
    sourceProvider: OPEN_TARGETS_PROVIDER,
    claimSupport: "not_assessed",
  }));

  const hasPublicAnchor = nct.resolution !== "unresolved";
  const programmeLabel = hasPublicAnchor
    ? record.registration.briefTitle?.trim() || `Registry-anchored programme ${record.nctId}`
    : null;

  const unknowns: TranslationalUnknownField[] = ["failure_mode", "proprietary_status"];
  if (!record.registration.briefTitle) unknowns.push("programme_identity");
  if (!targetSymbols.length) unknowns.push("primary_target");
  if (!record.registration.phases.length) unknowns.push("clinical_phase");
  if (!record.registryReportedResults.hasResultsSection) unknowns.push("clinical_outcome");
  if (!pmids.length) unknowns.push("publication_record");
  if (!diseaseIds.length && !(input.openTargets ?? []).length) unknowns.push("indication");
  unknowns.push("preclinical_model", "human_biomarker", "sponsor", "modality");

  const identities = uniqueRefs([
    nct,
    ...otDiseaseRefs,
    ...otFromRecords,
    ...targetRefs,
    ...pmidRefs,
  ]);

  const programme = sealContract({
    schemaVersion: TRANSLATIONAL_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("programme", record.nctId),
    layer: "programme",
    programmeIdentityKind: hasPublicAnchor ? "public_registry_anchored" : "unknown_not_invented",
    programmeLabel,
    identities,
    unknowns: unique(unknowns) as TranslationalUnknownField[],
    linkedNctIds: [record.nctId],
    linkedPmids: pmids,
    linkedUniprotAccessions: [],
    linkedOpenTargetsDiseaseIds: unique([
      ...diseaseIds,
      ...(input.openTargets ?? []).map((d) => d.diseaseId),
    ]),
    linkedOpenTargetsTargetSymbols: targetSymbols,
    registryOverallStatus: record.registration.overallStatus,
    honesty: baseHonesty(),
    note: `${statusHonesty.note} Proprietary programmes are not invented from registry gaps.`,
  });

  const preclinical = sealContract({
    schemaVersion: TRANSLATIONAL_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("preclinical", record.nctId),
    layer: "preclinical",
    programmeIdentityKind: programme.programmeIdentityKind,
    programmeLabel,
    identities: identities.filter((i) => i.system === "open_targets_target" || i.system === "uniprot"),
    unknowns: [
      "preclinical_model",
      "primary_target",
      "modality",
      "publication_record",
      "failure_mode",
    ],
    linkedNctIds: [record.nctId],
    linkedPmids: [],
    linkedUniprotAccessions: [],
    linkedOpenTargetsDiseaseIds: programme.linkedOpenTargetsDiseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    registryOverallStatus: null,
    honesty: baseHonesty(),
    note:
      "Preclinical layer unknowns preserved. CT.gov registration does not supply validated preclinical models; absence of published preclinical evidence ≠ absence of activity.",
  });

  const humanTranslational = sealContract({
    schemaVersion: TRANSLATIONAL_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("human_translational", record.nctId),
    layer: "human_translational",
    programmeIdentityKind: programme.programmeIdentityKind,
    programmeLabel,
    identities: identities.filter(
      (i) => i.system === "pmid" || i.system === "open_targets_disease" || i.system === "nct",
    ),
    unknowns: ["human_biomarker", "publication_record", "clinical_outcome", "failure_mode"],
    linkedNctIds: [record.nctId],
    linkedPmids: pmids,
    linkedUniprotAccessions: [],
    linkedOpenTargetsDiseaseIds: programme.linkedOpenTargetsDiseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    registryOverallStatus: record.registration.overallStatus,
    honesty: baseHonesty(),
    note:
      "Human translational layer is locator/metadata only. Missing published outcome refs ≠ absence of translational activity or clinical failure.",
  });

  const clinical = sealContract({
    schemaVersion: TRANSLATIONAL_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("clinical", record.nctId),
    layer: "clinical",
    programmeIdentityKind: programme.programmeIdentityKind,
    programmeLabel,
    identities: identities.filter((i) => i.system === "nct" || i.system === "pmid"),
    unknowns: unique([
      ...(!record.registration.phases.length ? (["clinical_phase"] as const) : []),
      ...(!record.registryReportedResults.hasResultsSection
        ? (["clinical_outcome"] as const)
        : []),
      "failure_mode",
      "publication_record",
    ]) as TranslationalUnknownField[],
    linkedNctIds: [record.nctId],
    linkedPmids: pmids,
    linkedUniprotAccessions: [],
    linkedOpenTargetsDiseaseIds: programme.linkedOpenTargetsDiseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    registryOverallStatus: record.registration.overallStatus,
    honesty: baseHonesty(),
    note: `${statusHonesty.note} Registry results are not efficacy proof; missing results are not therapy failure.`,
  });

  return [programme, preclinical, humanTranslational, clinical];
}

function uniqueRefs(refs: readonly TranslationalIdentityRef[]): TranslationalIdentityRef[] {
  const seen = new Set<string>();
  const out: TranslationalIdentityRef[] = [];
  for (const ref of refs) {
    const key = `${ref.system}::${ref.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

/**
 * Build a contract pack from an existing O-04 landscape snapshot.
 * Extends attach — does not fork a parallel translational stack.
 */
export function buildTranslationalEvidenceContractPack(input: {
  landscape: TranslationalLandscapeSnapshot;
  openTargets?: readonly OpenTargetsDiseaseRecord[];
  extraIdentities?: readonly TranslationalIdentityRef[];
  generatedAt?: string;
}): TranslationalEvidenceContractPack {
  const contracts = input.landscape.records.flatMap((record) => {
    const rows = contractsFromTranslationalTrial({record, openTargets: input.openTargets});
    if (!input.extraIdentities?.length) return rows;
    return rows.map((contract) =>
      contract.layer !== "programme"
        ? contract
        : sealContract({
            ...contract,
            identities: uniqueRefs([...contract.identities, ...input.extraIdentities!]),
          }),
    );
  });

  const unknownFieldsRecorded = contracts.reduce((n, c) => n + c.unknowns.length, 0);
  const pack: TranslationalEvidenceContractPack = {
    schemaVersion: "hsi-translational-evidence-contract-pack-1",
    method: TRANSLATIONAL_EVIDENCE_CONTRACTS_METHOD,
    version: TRANSLATIONAL_EVIDENCE_CONTRACTS_VERSION,
    generatedAt: input.generatedAt ?? input.landscape.generatedAt,
    contracts,
    identityResolution: {
      openTargets: "partial_metadata",
      europePmc: "partial_metadata",
      clinicalTrialsGov: "partial_metadata",
      uniprot: "partial_metadata",
      reactome: "stub_identifier_only",
      chembl: "stub_identifier_only",
    },
    summary: {
      programme: contracts.filter((c) => c.layer === "programme").length,
      preclinical: contracts.filter((c) => c.layer === "preclinical").length,
      humanTranslational: contracts.filter((c) => c.layer === "human_translational").length,
      clinical: contracts.filter((c) => c.layer === "clinical").length,
      unknownFieldsRecorded,
    },
    honesty: {
      ...baseHonesty(),
      projectedFromExistingTranslationalAttach: true,
      notAParallelTranslationalStack: true,
      notScientificValidity: true,
    },
  };

  if (pack.honesty.scientificApproval !== false || pack.honesty.graphPromotable !== false) {
    fail("Contract pack must stay unapproved / non-promotable");
  }
  return pack;
}

/**
 * Thin projector lines for research-brief / gap persistence without schema fork.
 */
export function projectTranslationalContractPersistenceLines(
  pack: TranslationalEvidenceContractPack,
): readonly string[] {
  return pack.contracts.map(
    (c) =>
      `translational_contract:${c.layer}:id=${c.id}:programme=${c.programmeIdentityKind}:unknowns=${c.unknowns.join("|") || "none"}:status=${c.registryOverallStatus ?? "unknown"}`,
  );
}
