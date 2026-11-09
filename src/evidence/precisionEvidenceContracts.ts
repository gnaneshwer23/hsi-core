/**
 * Milestone 5 / PR1 — Precision evidence contracts & thin source integration.
 *
 * Extends existing translational / OT / Europe PMC / UniProt / CT.gov contracts.
 * Does NOT invent patient measurements, biomarker performance, clinical strata,
 * patient-facing treatment recommendations, or claim metadata retrieval as analysis.
 *
 * HCA / CELLxGENE / GEO: honest not_connected (optional identifier stub only).
 */
import {createHash} from "node:crypto";
import {assertValidNctId, CTGOV_PROVIDER} from "./clinicalTrialsGovLookup";
import {OPEN_TARGETS_PROVIDER, type OpenTargetsDiseaseRecord} from "./openTargetsLookup";
import {UNIPROT_PROVIDER, assertValidUniprotAccession} from "./uniprotMetadataLookup";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {TranslationalEvidenceContractPack} from "./translationalEvidenceContracts";

export const PRECISION_EVIDENCE_CONTRACTS_SCHEMA =
  "hsi-precision-evidence-contracts-1" as const;
export const PRECISION_EVIDENCE_CONTRACTS_METHOD =
  "hsi.precision_evidence_contracts.v1" as const;
export const PRECISION_EVIDENCE_CONTRACTS_VERSION = "0.1.0" as const;

export type PrecisionEvidenceLayer =
  | "disease_phenotype"
  | "molecular_cellular_profile"
  | "candidate_subgroup"
  | "biomarker_evidence";

export type PrecisionUnknownField =
  | "phenotype_definition"
  | "molecular_profile"
  | "cellular_context"
  | "subgroup_definition"
  | "biomarker_identity"
  | "biomarker_performance"
  | "patient_measurements"
  | "dataset_analysis"
  | "tissue_context"
  | "population_context";

/** Dataset lifecycle — discovery/retrieval must never be labelled analysed. */
export type DatasetLifecycleState =
  | "not_connected"
  | "metadata_discovered"
  | "metadata_retrieved"
  | "analysis_not_performed";

export type OmicsSourceKind = "hca" | "cellxgene" | "geo";

export type OmicsSourceConnection = {
  source: OmicsSourceKind;
  connection: "not_connected" | "stub_identifier_only";
  identifier: string | null;
  lifecycle: DatasetLifecycleState;
  analysed: false;
  note: string;
};

export type PrecisionIdentitySystem =
  | "open_targets_disease"
  | "open_targets_target"
  | "uniprot"
  | "pmid"
  | "nct"
  | "hgnc"
  | "geo"
  | "hca"
  | "cellxgene"
  | "unknown";

export type PrecisionIdentityRef = {
  system: PrecisionIdentitySystem;
  value: string;
  label: string | null;
  resolution: "resolved_prefix" | "resolved_lookup_metadata" | "unresolved" | "stub_only" | "not_connected";
  sourceProvider: string | null;
  claimSupport: "not_assessed";
};

export type PrecisionEvidenceContract = {
  schemaVersion: typeof PRECISION_EVIDENCE_CONTRACTS_SCHEMA;
  id: string;
  layer: PrecisionEvidenceLayer;
  /** Public research label only when anchored; otherwise null. */
  label: string | null;
  identities: readonly PrecisionIdentityRef[];
  unknowns: readonly PrecisionUnknownField[];
  linkedNctIds: readonly string[];
  linkedPmids: readonly string[];
  linkedUniprotAccessions: readonly string[];
  linkedOpenTargetsDiseaseIds: readonly string[];
  linkedOpenTargetsTargetSymbols: readonly string[];
  /** Biomarker performance is never invented — always null until curator-supplied later. */
  biomarkerPerformance: null;
  /** Patient measurements are never invented. */
  patientMeasurements: null;
  datasetLifecycle: DatasetLifecycleState;
  honesty: {
    unknownsPreserved: true;
    patientMeasurementsNotInvented: true;
    biomarkerPerformanceNotInvented: true;
    metadataRetrievalIsNotAnalysis: true;
    patientTreatmentRecommendation: false;
    individualisedMedicalAdvice: false;
    eligibilityAssessed: false;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    cdsPhi: false;
    fixturesAreNotLiveEvidence: true;
    candidateSubgroupIsNotClinicalStrataProof: true;
  };
  note: string;
};

export type PrecisionEvidenceContractPack = {
  schemaVersion: "hsi-precision-evidence-contract-pack-1";
  method: typeof PRECISION_EVIDENCE_CONTRACTS_METHOD;
  version: typeof PRECISION_EVIDENCE_CONTRACTS_VERSION;
  generatedAt: string;
  contracts: readonly PrecisionEvidenceContract[];
  omicsConnections: readonly OmicsSourceConnection[];
  sourceIntegration: {
    openTargets: "partial_metadata";
    europePmc: "partial_metadata";
    clinicalTrialsGov: "partial_metadata";
    uniprot: "partial_metadata";
    translationalContracts: "projected_when_supplied";
    hca: "not_connected";
    cellxgene: "not_connected";
    geo: "not_connected" | "stub_identifier_only";
  };
  summary: {
    diseasePhenotype: number;
    molecularCellularProfile: number;
    candidateSubgroup: number;
    biomarkerEvidence: number;
    unknownFieldsRecorded: number;
    omicsNotConnected: number;
  };
  honesty: PrecisionEvidenceContract["honesty"] & {
    projectedFromExistingLookups: true;
    notAParallelPrecisionStack: true;
    notScientificValidity: true;
  };
};

const PMID_ID = /^[1-9][0-9]*$/;
const OT_DISEASE_ID = /^(MONDO_|EFO_|Orphanet_|OTAR_|HP_)[A-Za-z0-9]+$/;
const GEO_ACCESSION = /^(GSE|GDS|GPL|GSM)[0-9]+$/i;
const FORBIDDEN_PERFORMANCE_KEYS = [
  "auc",
  "sensitivity",
  "specificity",
  "ppv",
  "npv",
  "accuracy",
  "f1",
  "roc",
] as const;

function fail(message: string): never {
  throw new Error(message);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((v) => typeof v === "string" && v.trim()))];
}

function contractId(layer: PrecisionEvidenceLayer, anchor: string): string {
  return `pec:${createHash("sha256")
    .update(canonicalEvidenceJson({layer, anchor, v: PRECISION_EVIDENCE_CONTRACTS_VERSION}))
    .digest("hex")
    .slice(0, 24)}`;
}

function baseHonesty(): PrecisionEvidenceContract["honesty"] {
  return {
    unknownsPreserved: true,
    patientMeasurementsNotInvented: true,
    biomarkerPerformanceNotInvented: true,
    metadataRetrievalIsNotAnalysis: true,
    patientTreatmentRecommendation: false,
    individualisedMedicalAdvice: false,
    eligibilityAssessed: false,
    scientificApproval: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    cdsPhi: false,
    fixturesAreNotLiveEvidence: true,
    candidateSubgroupIsNotClinicalStrataProof: true,
  };
}

function sealContract(contract: PrecisionEvidenceContract): PrecisionEvidenceContract {
  if (contract.honesty.scientificApproval !== false || contract.honesty.graphPromotable !== false) {
    fail("Precision contract must stay unapproved / non-promotable");
  }
  if (contract.honesty.patientTreatmentRecommendation !== false) {
    fail("Patient treatment recommendations are forbidden");
  }
  if (contract.honesty.individualisedMedicalAdvice !== false) {
    fail("Individualised medical advice is forbidden");
  }
  if (contract.biomarkerPerformance !== null) {
    fail("Biomarker performance must not be invented");
  }
  if (contract.patientMeasurements !== null) {
    fail("Patient measurements must not be invented");
  }
  return contract;
}

function uniqueRefs(refs: readonly PrecisionIdentityRef[]): PrecisionIdentityRef[] {
  const seen = new Set<string>();
  const out: PrecisionIdentityRef[] = [];
  for (const ref of refs) {
    const key = `${ref.system}::${ref.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

/** Refuse invented biomarker performance payloads. */
export function refuseInventedBiomarkerPerformance(input: unknown): {
  accepted: false;
  biomarkerPerformance: null;
  reason: string;
} {
  if (input == null) {
    return {
      accepted: false,
      biomarkerPerformance: null,
      reason: "No biomarker performance supplied — unknowns preserved.",
    };
  }
  if (typeof input === "object") {
    const keys = Object.keys(input as Record<string, unknown>).map((k) => k.toLowerCase());
    const hit = FORBIDDEN_PERFORMANCE_KEYS.find((k) => keys.includes(k));
    if (hit) {
      return {
        accepted: false,
        biomarkerPerformance: null,
        reason: `Refused invented/unverified biomarker performance field “${hit}”. Performance metrics are never fabricated in M5 PR1.`,
      };
    }
  }
  return {
    accepted: false,
    biomarkerPerformance: null,
    reason:
      "Biomarker performance is not assessed in M5 PR1. Curator-supplied reviewed metrics are out of this increment.",
  };
}

/** Refuse invented patient measurement payloads. */
export function refuseInventedPatientMeasurements(input: unknown): {
  accepted: false;
  patientMeasurements: null;
  reason: string;
} {
  if (input == null) {
    return {
      accepted: false,
      patientMeasurements: null,
      reason: "No patient measurements supplied — unknowns preserved.",
    };
  }
  return {
    accepted: false,
    patientMeasurements: null,
    reason:
      "Patient measurements must never be invented. Individual-level / PHI surfaces are out of scope (CDS/PHI boundary).",
  };
}

/**
 * Distinguish dataset discovery vs analysis.
 * Metadata retrieval never upgrades to analysed.
 */
export function classifyDatasetLifecycle(input: {
  connected: boolean;
  metadataRetrieved?: boolean;
  metadataDiscovered?: boolean;
  analysedClaim?: boolean;
}): {lifecycle: DatasetLifecycleState; analysed: false; note: string} {
  if (input.analysedClaim) {
    return {
      lifecycle: "analysis_not_performed",
      analysed: false,
      note: "Analysis claim refused — metadata discovery/retrieval is not dataset analysis.",
    };
  }
  if (!input.connected) {
    return {
      lifecycle: "not_connected",
      analysed: false,
      note: "Source not connected — no dataset discovery or analysis performed.",
    };
  }
  if (input.metadataRetrieved) {
    return {
      lifecycle: "metadata_retrieved",
      analysed: false,
      note: "Metadata retrieved only — not analysed.",
    };
  }
  if (input.metadataDiscovered) {
    return {
      lifecycle: "metadata_discovered",
      analysed: false,
      note: "Dataset metadata discovered only — not analysed.",
    };
  }
  return {
    lifecycle: "analysis_not_performed",
    analysed: false,
    note: "No analysis performed.",
  };
}

/** Honest HCA / CELLxGENE / GEO connection stubs. */
export function omicsSourceConnections(input?: {
  geoAccession?: string | null;
}): OmicsSourceConnection[] {
  const geoRaw = input?.geoAccession?.trim() ?? null;
  const geoOk = geoRaw && GEO_ACCESSION.test(geoRaw);
  const geoLifecycle = classifyDatasetLifecycle({
    connected: Boolean(geoOk),
    metadataDiscovered: Boolean(geoOk),
  });

  return [
    {
      source: "hca",
      connection: "not_connected",
      identifier: null,
      lifecycle: "not_connected",
      analysed: false,
      note: "Human Cell Atlas adapter not connected in HSI substrate (Data-to-Discovery deferred).",
    },
    {
      source: "cellxgene",
      connection: "not_connected",
      identifier: null,
      lifecycle: "not_connected",
      analysed: false,
      note: "CELLxGENE adapter not connected in HSI substrate (Data-to-Discovery deferred).",
    },
    geoOk
      ? {
          source: "geo",
          connection: "stub_identifier_only",
          identifier: geoRaw!.toUpperCase(),
          lifecycle: geoLifecycle.lifecycle,
          analysed: false,
          note: `${geoLifecycle.note} GEO identifier recognised as stub only — no NCBI fetch.`,
        }
      : {
          source: "geo",
          connection: "not_connected",
          identifier: geoRaw,
          lifecycle: "not_connected",
          analysed: false,
          note:
            geoRaw == null
              ? "GEO adapter not connected — no accession supplied."
              : `GEO accession “${geoRaw}” unresolved; adapter remains not connected (no NCBI fetch).`,
        },
  ];
}

export function resolvePmidIdentity(value: string): PrecisionIdentityRef {
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

export function resolveNctIdentity(value: string): PrecisionIdentityRef {
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

export function resolveUniprotIdentity(value: string): PrecisionIdentityRef {
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

export function resolveOpenTargetsDiseaseIdentity(value: string): PrecisionIdentityRef {
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
 * Project layered precision contracts from Open Targets disease metadata + optional
 * translational pack / literature / protein / registry anchors.
 */
export function buildPrecisionEvidenceContractPack(input: {
  openTargets?: readonly OpenTargetsDiseaseRecord[];
  translationalContracts?: TranslationalEvidenceContractPack | null;
  pmids?: readonly string[];
  nctIds?: readonly string[];
  uniprotAccessions?: readonly string[];
  geoAccession?: string | null;
  /** Optional curator-declared candidate subgroup label — never clinical strata proof. */
  candidateSubgroupLabel?: string | null;
  /** Optional biomarker identity label — performance stays null. */
  biomarkerLabel?: string | null;
  generatedAt?: string;
  /** Rejected if caller attempts to inject performance/measurements. */
  attemptedBiomarkerPerformance?: unknown;
  attemptedPatientMeasurements?: unknown;
}): PrecisionEvidenceContractPack {
  refuseInventedBiomarkerPerformance(input.attemptedBiomarkerPerformance ?? null);
  refuseInventedPatientMeasurements(input.attemptedPatientMeasurements ?? null);

  const ot = input.openTargets ?? [];
  const diseaseIds = unique([
    ...ot.map((d) => d.diseaseId),
    ...(input.translationalContracts?.contracts.flatMap((c) => c.linkedOpenTargetsDiseaseIds) ??
      []),
  ]);
  const targetSymbols = unique([
    ...ot.flatMap((d) => d.associations.map((a) => a.approvedSymbol).filter(Boolean)),
    ...(input.translationalContracts?.contracts.flatMap((c) => c.linkedOpenTargetsTargetSymbols) ??
      []),
  ]);
  const pmids = unique([
    ...(input.pmids ?? []),
    ...(input.translationalContracts?.contracts.flatMap((c) => c.linkedPmids) ?? []),
  ]);
  const nctIds = unique([
    ...(input.nctIds ?? []),
    ...(input.translationalContracts?.contracts.flatMap((c) => c.linkedNctIds) ?? []),
  ]);
  const uniprots = unique([
    ...(input.uniprotAccessions ?? []),
    ...(input.translationalContracts?.contracts.flatMap((c) => c.linkedUniprotAccessions) ?? []),
  ]);

  const diseaseName = ot[0]?.diseaseName?.trim() || null;
  const anchor =
    diseaseIds[0] ?? nctIds[0] ?? pmids[0] ?? uniprots[0] ?? input.candidateSubgroupLabel ?? "unknown";

  const diseaseRefs = diseaseIds.map(resolveOpenTargetsDiseaseIdentity);
  const targetRefs: PrecisionIdentityRef[] = targetSymbols.map((symbol) => ({
    system: "open_targets_target",
    value: symbol,
    label: symbol,
    resolution: "resolved_lookup_metadata",
    sourceProvider: OPEN_TARGETS_PROVIDER,
    claimSupport: "not_assessed",
  }));
  const pmidRefs = pmids.map(resolvePmidIdentity);
  const nctRefs = nctIds.map(resolveNctIdentity);
  const uniprotRefs = uniprots.map(resolveUniprotIdentity);

  const phenotypeUnknowns: PrecisionUnknownField[] = ["phenotype_definition", "population_context"];
  if (!diseaseIds.length) phenotypeUnknowns.push("molecular_profile");

  const phenotype = sealContract({
    schemaVersion: PRECISION_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("disease_phenotype", anchor),
    layer: "disease_phenotype",
    label: diseaseName,
    identities: uniqueRefs([...diseaseRefs, ...pmidRefs, ...nctRefs]),
    unknowns: unique(phenotypeUnknowns) as PrecisionUnknownField[],
    linkedNctIds: nctIds,
    linkedPmids: pmids,
    linkedUniprotAccessions: [],
    linkedOpenTargetsDiseaseIds: diseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    biomarkerPerformance: null,
    patientMeasurements: null,
    datasetLifecycle: "analysis_not_performed",
    honesty: baseHonesty(),
    note:
      "Disease phenotype layer is identity/metadata only. Open Targets / registry / literature anchors are not clinical phenotype adjudication; unknowns preserved.",
  });

  const molecularUnknowns: PrecisionUnknownField[] = [
    "molecular_profile",
    "cellular_context",
    "tissue_context",
    "dataset_analysis",
  ];
  if (!targetSymbols.length && !uniprots.length) molecularUnknowns.push("biomarker_identity");

  const molecular = sealContract({
    schemaVersion: PRECISION_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("molecular_cellular_profile", anchor),
    layer: "molecular_cellular_profile",
    label: targetSymbols.length
      ? `Molecular/cellular profile anchors: ${targetSymbols.slice(0, 8).join(", ")}`
      : null,
    identities: uniqueRefs([...targetRefs, ...uniprotRefs, ...diseaseRefs]),
    unknowns: unique(molecularUnknowns) as PrecisionUnknownField[],
    linkedNctIds: nctIds,
    linkedPmids: pmids,
    linkedUniprotAccessions: uniprots,
    linkedOpenTargetsDiseaseIds: diseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    biomarkerPerformance: null,
    patientMeasurements: null,
    datasetLifecycle: "analysis_not_performed",
    honesty: baseHonesty(),
    note:
      "Molecular-cellular profile uses OT target / UniProt identity metadata only. HCA/CELLxGENE/GEO not connected; metadata retrieval ≠ single-cell or omics analysis.",
  });

  const subgroupLabel = input.candidateSubgroupLabel?.trim() || null;
  const subgroup = sealContract({
    schemaVersion: PRECISION_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("candidate_subgroup", anchor),
    layer: "candidate_subgroup",
    label: subgroupLabel,
    identities: uniqueRefs([...diseaseRefs, ...pmidRefs, ...nctRefs]),
    unknowns: unique([
      "subgroup_definition",
      "population_context",
      "biomarker_performance",
      "patient_measurements",
      ...(subgroupLabel ? [] : (["phenotype_definition"] as const)),
    ]) as PrecisionUnknownField[],
    linkedNctIds: nctIds,
    linkedPmids: pmids,
    linkedUniprotAccessions: [],
    linkedOpenTargetsDiseaseIds: diseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    biomarkerPerformance: null,
    patientMeasurements: null,
    datasetLifecycle: "analysis_not_performed",
    honesty: baseHonesty(),
    note:
      "Candidate subgroup is an investigation label only — not clinical strata proof, eligibility, or individualised advice. Patient measurements never invented.",
  });

  const biomarkerLabel = input.biomarkerLabel?.trim() || targetSymbols[0] || null;
  const biomarker = sealContract({
    schemaVersion: PRECISION_EVIDENCE_CONTRACTS_SCHEMA,
    id: contractId("biomarker_evidence", anchor),
    layer: "biomarker_evidence",
    label: biomarkerLabel,
    identities: uniqueRefs([
      ...targetRefs.slice(0, 8),
      ...uniprotRefs,
      ...pmidRefs,
      ...diseaseRefs,
    ]),
    unknowns: unique([
      "biomarker_performance",
      "patient_measurements",
      "dataset_analysis",
      ...(biomarkerLabel ? [] : (["biomarker_identity"] as const)),
    ]) as PrecisionUnknownField[],
    linkedNctIds: nctIds,
    linkedPmids: pmids,
    linkedUniprotAccessions: uniprots,
    linkedOpenTargetsDiseaseIds: diseaseIds,
    linkedOpenTargetsTargetSymbols: targetSymbols,
    biomarkerPerformance: null,
    patientMeasurements: null,
    datasetLifecycle: "analysis_not_performed",
    honesty: baseHonesty(),
    note:
      "Biomarker evidence is identity/locator only. Sensitivity/specificity/AUC and patient measurements are never invented; literature PMID is locator ≠ performance claim.",
  });

  const contracts = [phenotype, molecular, subgroup, biomarker];
  const omicsConnections = omicsSourceConnections({geoAccession: input.geoAccession});
  const unknownFieldsRecorded = contracts.reduce((n, c) => n + c.unknowns.length, 0);

  const pack: PrecisionEvidenceContractPack = {
    schemaVersion: "hsi-precision-evidence-contract-pack-1",
    method: PRECISION_EVIDENCE_CONTRACTS_METHOD,
    version: PRECISION_EVIDENCE_CONTRACTS_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    contracts,
    omicsConnections,
    sourceIntegration: {
      openTargets: "partial_metadata",
      europePmc: "partial_metadata",
      clinicalTrialsGov: "partial_metadata",
      uniprot: "partial_metadata",
      translationalContracts: "projected_when_supplied",
      hca: "not_connected",
      cellxgene: "not_connected",
      geo: omicsConnections.find((o) => o.source === "geo")?.connection === "stub_identifier_only"
        ? "stub_identifier_only"
        : "not_connected",
    },
    summary: {
      diseasePhenotype: contracts.filter((c) => c.layer === "disease_phenotype").length,
      molecularCellularProfile: contracts.filter((c) => c.layer === "molecular_cellular_profile")
        .length,
      candidateSubgroup: contracts.filter((c) => c.layer === "candidate_subgroup").length,
      biomarkerEvidence: contracts.filter((c) => c.layer === "biomarker_evidence").length,
      unknownFieldsRecorded,
      omicsNotConnected: omicsConnections.filter((o) => o.connection === "not_connected").length,
    },
    honesty: {
      ...baseHonesty(),
      projectedFromExistingLookups: true,
      notAParallelPrecisionStack: true,
      notScientificValidity: true,
    },
  };

  if (pack.honesty.scientificApproval !== false || pack.honesty.graphPromotable !== false) {
    fail("Precision contract pack must stay unapproved / non-promotable");
  }
  if (pack.honesty.patientTreatmentRecommendation !== false) {
    fail("Patient treatment recommendations are forbidden");
  }
  return pack;
}

/** Thin projector lines for research-brief / persistence without schema fork. */
export function projectPrecisionContractPersistenceLines(
  pack: PrecisionEvidenceContractPack,
): readonly string[] {
  const contractLines = pack.contracts.map(
    (c) =>
      `precision_contract:${c.layer}:id=${c.id}:label=${c.label ?? "unknown"}:unknowns=${c.unknowns.join("|") || "none"}:lifecycle=${c.datasetLifecycle}`,
  );
  const omicsLines = pack.omicsConnections.map(
    (o) =>
      `omics:${o.source}:connection=${o.connection}:lifecycle=${o.lifecycle}:analysed=false:id=${o.identifier ?? "none"}`,
  );
  return [...contractLines, ...omicsLines];
}
