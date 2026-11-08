/**
 * Roadmap R1 — Biomedical evidence datasets (eng scaffold).
 *
 * Builds reviewable, versioned source-packet inventory slots from the existing
 * N1 rights inventory. Packets stay rights-pending / quarantine-honest until
 * human #2 N1 attestation clears licenceEvidenceUri. Never invents clearance,
 * passage import, SME gold (R2), Gate C, MoU, or CDS/PHI.
 */
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  parseN1PassageRightsInventory,
  type N1PassageRightsEntry,
  type N1PassageRightsInventory,
} from "./n1PassageRightsInventory";

export const R1_SOURCE_PACKET_INVENTORY_SCHEMA = "hsi-r1-biomedical-source-packets-1" as const;
export const R1_PACKET_VERSION = "1.0.0" as const;
export const R1_PROGRAMME = "gut_immune_t2d" as const;

export type R1CheckStatus = "CLEARED" | "BLOCKED" | "PENDING_HUMAN" | "NO_GO";

export type R1CheckId =
  | "n1_rights_inventory_bound"
  | "versioned_packet_slots_reserved"
  | "provenance_fields_present"
  | "ontology_context_slots_empty"
  | "quarantine_honesty_enforced"
  | "r1_checklist_published"
  | "lifecycle_scaffold_documented"
  | "human_n1_rights_attestation"
  | "licence_evidence_uri_attested"
  | "passage_import_after_rights"
  | "ontology_verification_human"
  | "context_metadata_sme_fill"
  | "sme_gold_binding_r2";

export type R1Check = {
  id: R1CheckId;
  title: string;
  plane: "engineering" | "human";
  status: R1CheckStatus;
  evidence: string;
};

/** Empty ontology / context slots — filled only after human/SME work (R2 for gold). */
export type R1OntologyContextSlots = {
  ontologyVerificationStatus: "pending";
  ontologyIds: [];
  species: null;
  tissue: null;
  cellType: null;
  assay: null;
  diseaseStage: null;
  studyDesign: null;
  cohort: null;
  dose: null;
  timepoint: null;
  opposingEvidenceRetained: true;
  nullObservationRetained: true;
  scientificLabelStatus: "awaiting_sme";
};

export type R1SourcePacket = {
  packetId: string;
  packetVersion: typeof R1_PACKET_VERSION;
  schemaVersion: "hsi-r1-source-packet-1";
  queueId: string;
  sourceId: string;
  doi: string;
  pmid: string | null;
  pmcid: string | null;
  title: string | null;
  identityOutcome: N1PassageRightsEntry["identityOutcome"];
  /** Eng-reviewable inventory row; not scientific clearance. */
  reviewable: true;
  rightsStatus: "rights_pending_quarantine";
  quarantineReason: "human_licence_attestation_required";
  passageTextImported: false;
  passageUsePermitted: false;
  licenceEvidenceUri: null;
  permittedUses: [];
  humanCleared: false;
  graphPromotable: false;
  claimEntailmentAssessed: false;
  providerSignals: N1PassageRightsEntry["providerSignals"];
  providerArticleUrl: string | null;
  n1RightsEntryBound: true;
  provenance: {
    n1QueueId: string;
    n1ReceiptHash: string;
    n1RightsInventoryHash: string;
    identityOutcome: N1PassageRightsEntry["identityOutcome"];
    bibliographicProvider: "europe_pmc";
  };
  ontologyContext: R1OntologyContextSlots;
  datasetLifecycleStage: "ingestion_rights_qc_scaffold";
  nextLifecycleStage: "context_and_evidence_span_annotation";
  goldEvalBinding: {
    suiteCapability: "versioned_licensed_packets";
    bound: false;
    packetHashForGold: null;
    note: "R2 binds rights-cleared packet hashes to gold cases; R1 only reserves slots.";
  };
  notes: string[];
};

export type R1BiomedicalSourcePacketInventory = {
  schemaVersion: typeof R1_SOURCE_PACKET_INVENTORY_SCHEMA;
  phase: "R1";
  programme: typeof R1_PROGRAMME;
  roadmapPhase: "biomedical_evidence_datasets";
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  scientificAcceptance: "BLOCKED";
  rightsAcceptance: "BLOCKED";
  passageImportAllowed: false;
  gateCAutoApprove: false;
  legalBinding: false;
  containsPhi: false;
  n1RightsInventoryHash: string;
  n1ReceiptHash: string;
  honesty: {
    providerSignalsAreNotClearance: true;
    openAccessIsNotCorpusReusePermission: true;
    rightsPendingIsQuarantine: true;
    emptyOntologySlotsAreNotVerified: true;
    emptyContextSlotsAreNotSmeGold: true;
    noInventedLicenceEvidenceUri: true;
    noPassageImportWithoutHumanRights: true;
    noGateCAutoApprove: true;
    noInventedMoU: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
    r2GoldNotFilledHere: true;
  };
  datasetLifecycleScaffold: {
    section: "roadmap_section_2";
    stagesDocumented: [
      "licensed_sources",
      "ingestion_rights_qc",
      "context_and_evidence_span_annotation",
      "two_independent_smes",
      "adjudicated_gold",
      "train_dev_validation_held_out",
      "offline_evaluation",
      "safety_scientific_gate",
      "controlled_research_pilot",
    ];
    currentStage: "ingestion_rights_qc";
    smeGoldFilled: false;
    heldOutFrozen: false;
  };
  packets: R1SourcePacket[];
  checks: R1Check[];
  humanMustSupply: string[];
  codeCanAutomate: string[];
  summary: {
    packetSlotsReserved: 12;
    packetSlotsRightsCleared: 0;
    humanCleared: 0;
    passageImported: 0;
    ontologySlotsFilled: 0;
    contextSlotsFilled: 0;
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    humanChecksPending: number;
    humanChecksTotal: number;
    scientificAcceptance: "BLOCKED";
    rightsAcceptance: "BLOCKED";
  };
  residualHumanSteps: string[];
  parkedHumanResiduals: ["#2 N1 rights", "#3 cite HITL", "#4 SMEs", "#5 staging", "#8 MoU"];
  stopNote: string;
  inventoryHash: string;
};

export class R1BiomedicalSourcePacketsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "R1BiomedicalSourcePacketsError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(
  body: Omit<R1BiomedicalSourcePacketInventory, "inventoryHash">,
): R1BiomedicalSourcePacketInventory {
  return {...body, inventoryHash: digest(body)};
}

function emptyOntologyContext(): R1OntologyContextSlots {
  return {
    ontologyVerificationStatus: "pending",
    ontologyIds: [],
    species: null,
    tissue: null,
    cellType: null,
    assay: null,
    diseaseStage: null,
    studyDesign: null,
    cohort: null,
    dose: null,
    timepoint: null,
    opposingEvidenceRetained: true,
    nullObservationRetained: true,
    scientificLabelStatus: "awaiting_sme",
  };
}

function packetFromRightsEntry(
  entry: N1PassageRightsEntry,
  hashes: {n1ReceiptHash: string; n1RightsInventoryHash: string},
): R1SourcePacket {
  const packetId = `R1-PKT-${entry.queueId}`;
  return {
    packetId,
    packetVersion: R1_PACKET_VERSION,
    schemaVersion: "hsi-r1-source-packet-1",
    queueId: entry.queueId,
    sourceId: entry.sourceId,
    doi: entry.doi,
    pmid: entry.pmid,
    pmcid: entry.pmcid,
    title: entry.title,
    identityOutcome: entry.identityOutcome,
    reviewable: true,
    rightsStatus: "rights_pending_quarantine",
    quarantineReason: "human_licence_attestation_required",
    passageTextImported: false,
    passageUsePermitted: false,
    licenceEvidenceUri: null,
    permittedUses: [],
    humanCleared: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    providerSignals: entry.providerSignals,
    providerArticleUrl: entry.providerArticleUrl,
    n1RightsEntryBound: true,
    provenance: {
      n1QueueId: entry.queueId,
      n1ReceiptHash: hashes.n1ReceiptHash,
      n1RightsInventoryHash: hashes.n1RightsInventoryHash,
      identityOutcome: entry.identityOutcome,
      bibliographicProvider: "europe_pmc",
    },
    ontologyContext: emptyOntologyContext(),
    datasetLifecycleStage: "ingestion_rights_qc_scaffold",
    nextLifecycleStage: "context_and_evidence_span_annotation",
    goldEvalBinding: {
      suiteCapability: "versioned_licensed_packets",
      bound: false,
      packetHashForGold: null,
      note: "R2 binds rights-cleared packet hashes to gold cases; R1 only reserves slots.",
    },
    notes: [
      "R1 eng source-packet slot — reviewable inventory only.",
      "Rights remain quarantine-pending until human #2 records licenceEvidenceUri.",
      "Provider OA/CC signals are observations only; not corpus reuse permission.",
      "Ontology + species/tissue/context slots stay empty until human/SME fill (gold = R2).",
      "No passage text imported; passageImported stays 0.",
      ...entry.notes.slice(0, 2),
    ],
  };
}

function checklistPresent(repoRoot: string): boolean {
  return existsSync(
    resolve(repoRoot, "docs/engineering/R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md"),
  );
}

function buildChecks(input: {
  inventory: N1PassageRightsInventory;
  checklistPublished: boolean;
}): R1Check[] {
  const rightsBound =
    input.inventory.summary.humanCleared === 0 &&
    input.inventory.summary.passageImported === 0 &&
    input.inventory.anyPassageImported === false &&
    input.inventory.anyPassageUsePermitted === false &&
    input.inventory.entries.length === 12;

  return [
    {
      id: "n1_rights_inventory_bound",
      title: "N1 rights inventory bound (hash + 12 entries)",
      plane: "engineering",
      status: rightsBound ? "CLEARED" : "BLOCKED",
      evidence:
        "research/domain-graph/n1/rights-inventory.v1.json · parseN1PassageRightsInventory · humanCleared=0.",
    },
    {
      id: "versioned_packet_slots_reserved",
      title: "Twelve versioned source-packet slots reserved",
      plane: "engineering",
      status: "CLEARED",
      evidence: "One R1-PKT-N1-C-* slot per N1 candidate; packetVersion=1.0.0; reviewable=true.",
    },
    {
      id: "provenance_fields_present",
      title: "Provenance pins N1 receipt + rights inventory hashes",
      plane: "engineering",
      status: "CLEARED",
      evidence: "Each packet.provenance carries n1ReceiptHash + n1RightsInventoryHash + DOI identity.",
    },
    {
      id: "ontology_context_slots_empty",
      title: "Ontology / context metadata slots empty (R2 SME gold)",
      plane: "engineering",
      status: "CLEARED",
      evidence: "ontologyIds=[]; species/tissue/…=null; scientificLabelStatus=awaiting_sme.",
    },
    {
      id: "quarantine_honesty_enforced",
      title: "Rights-pending quarantine honesty enforced",
      plane: "engineering",
      status: "CLEARED",
      evidence:
        "rightsStatus=rights_pending_quarantine · licenceEvidenceUri=null · passageTextImported=false.",
    },
    {
      id: "r1_checklist_published",
      title: "R1 biomedical source-packets checklist published",
      plane: "engineering",
      status: input.checklistPublished ? "CLEARED" : "BLOCKED",
      evidence: "docs/engineering/R1_BIOMEDICAL_SOURCE_PACKETS_CHECKLIST.md",
    },
    {
      id: "lifecycle_scaffold_documented",
      title: "Roadmap §2 dataset lifecycle scaffold documented (no SME gold fill)",
      plane: "engineering",
      status: "CLEARED",
      evidence: "datasetLifecycleScaffold.currentStage=ingestion_rights_qc; smeGoldFilled=false.",
    },
    {
      id: "human_n1_rights_attestation",
      title: "Human #2 N1 passage rights attestation",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence:
        "Parked: humanCleared=0. See N1_PASSAGE_RIGHTS_ATTESTATION_CHECKLIST.md — do not invent.",
    },
    {
      id: "licence_evidence_uri_attested",
      title: "Per-source licenceEvidenceUri + permitted uses",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "All packet.licenceEvidenceUri=null until accountable human attestation.",
    },
    {
      id: "passage_import_after_rights",
      title: "Passage import only after attested rights",
      plane: "human",
      status: "BLOCKED",
      evidence: "passageImported=0; import step blocked while rightsAcceptance=BLOCKED.",
    },
    {
      id: "ontology_verification_human",
      title: "Ontology verification for packet entities",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "ontologyVerificationStatus=pending; ontologyIds empty.",
    },
    {
      id: "context_metadata_sme_fill",
      title: "Species / tissue / study context metadata",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Context slots null — SME fill is R2 / #4 track, not invented here.",
    },
    {
      id: "sme_gold_binding_r2",
      title: "SME gold binding to packets (Roadmap R2)",
      plane: "human",
      status: "NO_GO",
      evidence: "goldEvalBinding.bound=false; R2 owns adjudicated gold — R1 must not fill SME gold.",
    },
  ];
}

export function loadN1RightsInventory(repoRoot?: string): N1PassageRightsInventory {
  const root = repoRoot ?? resolve(import.meta.dir, "../..");
  const path = resolve(root, "research/domain-graph/n1/rights-inventory.v1.json");
  return parseN1PassageRightsInventory(JSON.parse(readFileSync(path, "utf8")));
}

/** Build fail-closed R1 source-packet inventory from N1 rights inventory. */
export function buildR1BiomedicalSourcePackets(input: {
  generatedAt: string;
  rightsInventory?: N1PassageRightsInventory;
  repoRoot?: string;
}): R1BiomedicalSourcePacketInventory {
  const root = input.repoRoot ?? resolve(import.meta.dir, "../..");
  const rights = input.rightsInventory ?? loadN1RightsInventory(root);

  if (rights.summary.humanCleared !== 0 || rights.summary.passageImported !== 0) {
    throw new R1BiomedicalSourcePacketsError(
      "R1 refuses inventories that claim humanCleared or passageImported under eng scaffold",
    );
  }
  if (rights.anyPassageImported || rights.anyPassageUsePermitted || rights.scientificApproval) {
    throw new R1BiomedicalSourcePacketsError(
      "R1 refuses rights inventories that claim passage use or scientific approval",
    );
  }
  if (rights.entries.length !== 12) {
    throw new R1BiomedicalSourcePacketsError("R1 expects exactly 12 N1 rights entries");
  }
  for (const entry of rights.entries) {
    if (entry.humanAttestation.licenceEvidenceUri !== null || entry.passageUsePermitted) {
      throw new R1BiomedicalSourcePacketsError(
        "R1 cannot invent licenceEvidenceUri clearances from N1 entries",
      );
    }
  }

  const hashes = {
    n1ReceiptHash: rights.n1ReceiptHash,
    n1RightsInventoryHash: rights.inventoryHash,
  };
  const packets = rights.entries.map((entry) => packetFromRightsEntry(entry, hashes));
  const checks = buildChecks({
    inventory: rights,
    checklistPublished: checklistPresent(root),
  });
  const eng = checks.filter((c) => c.plane === "engineering");
  const human = checks.filter((c) => c.plane === "human");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const humanPending = human.filter(
    (c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED",
  ).length;

  if (engCleared !== eng.length) {
    throw new R1BiomedicalSourcePacketsError(
      "Engineering R1 checks must all CLEARED before writing artifact",
    );
  }
  if (humanPending !== human.length) {
    throw new R1BiomedicalSourcePacketsError(
      "Human R1 checks must remain PENDING_HUMAN/NO_GO/BLOCKED while rights are uncleared",
    );
  }

  return seal({
    schemaVersion: R1_SOURCE_PACKET_INVENTORY_SCHEMA,
    phase: "R1",
    programme: R1_PROGRAMME,
    roadmapPhase: "biomedical_evidence_datasets",
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    passageImportAllowed: false,
    gateCAutoApprove: false,
    legalBinding: false,
    containsPhi: false,
    n1RightsInventoryHash: rights.inventoryHash,
    n1ReceiptHash: rights.n1ReceiptHash,
    honesty: {
      providerSignalsAreNotClearance: true,
      openAccessIsNotCorpusReusePermission: true,
      rightsPendingIsQuarantine: true,
      emptyOntologySlotsAreNotVerified: true,
      emptyContextSlotsAreNotSmeGold: true,
      noInventedLicenceEvidenceUri: true,
      noPassageImportWithoutHumanRights: true,
      noGateCAutoApprove: true,
      noInventedMoU: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
      r2GoldNotFilledHere: true,
    },
    datasetLifecycleScaffold: {
      section: "roadmap_section_2",
      stagesDocumented: [
        "licensed_sources",
        "ingestion_rights_qc",
        "context_and_evidence_span_annotation",
        "two_independent_smes",
        "adjudicated_gold",
        "train_dev_validation_held_out",
        "offline_evaluation",
        "safety_scientific_gate",
        "controlled_research_pilot",
      ],
      currentStage: "ingestion_rights_qc",
      smeGoldFilled: false,
      heldOutFrozen: false,
    },
    packets,
    checks,
    humanMustSupply: [
      "Human #2: per-source licenceEvidenceUri + permitted uses on N1 attestation worksheet (do not invent).",
      "Separate passage-import step only after attested rights — keep passageImported=0 until then.",
      "Ontology verification IDs for packet entities (human curator / ontology steward).",
      "Species / tissue / study context metadata via SME path (feeds R2; do not invent labels).",
      "R2: adjudicated gold binding of rights-cleared packet hashes — out of R1 scope.",
    ],
    codeCanAutomate: [
      "Bind 12 versioned packet slots to N1 rights inventory entries + hashes.",
      "Enforce rights_pending_quarantine / licenceEvidenceUri=null / passageTextImported=false.",
      "Reserve empty ontology + context slots without inventing SME gold.",
      "Document roadmap §2 lifecycle stages with smeGoldFilled=false.",
      "Seal inventoryHash + offline prepare/check harness.",
      "Operator checklist + Audit R1 receipt (ENG CLEARED / SCIENCE BLOCKED).",
    ],
    summary: {
      packetSlotsReserved: 12,
      packetSlotsRightsCleared: 0,
      humanCleared: 0,
      passageImported: 0,
      ontologySlotsFilled: 0,
      contextSlotsFilled: 0,
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      humanChecksPending: humanPending,
      humanChecksTotal: human.length,
      scientificAcceptance: "BLOCKED",
      rightsAcceptance: "BLOCKED",
    },
    residualHumanSteps: [
      "Parked: do not fix human queue #2 N1 rights in this eng phase.",
      "Keep humanCleared=0 / passageImported=0 / licenceEvidenceUri=null.",
      "Do not fill SME gold or freeze held-out splits (Roadmap R2).",
      "Do not invent MoU, Gate C auto-approve, CDS-PHI, or autumn-snow Neon writes.",
      "When #2 clears rights, re-run R1 prepare to promote packets off quarantine — not before.",
    ],
    parkedHumanResiduals: ["#2 N1 rights", "#3 cite HITL", "#4 SMEs", "#5 staging", "#8 MoU"],
    stopNote:
      "R1 eng scaffold complete. Scientific + rights acceptance remain BLOCKED. Human #2 N1 rights attestation is explicitly parked — do not invent licenceEvidenceUri or passage imports. SME gold is R2.",
  });
}

export function parseR1BiomedicalSourcePackets(
  value: unknown,
): R1BiomedicalSourcePacketInventory {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new R1BiomedicalSourcePacketsError("Invalid R1 source-packet inventory");
  }
  const inventory = value as R1BiomedicalSourcePacketInventory;
  if (
    inventory.schemaVersion !== R1_SOURCE_PACKET_INVENTORY_SCHEMA ||
    inventory.phase !== "R1" ||
    inventory.roadmapPhase !== "biomedical_evidence_datasets" ||
    inventory.programme !== R1_PROGRAMME
  ) {
    throw new R1BiomedicalSourcePacketsError("Unsupported R1 source-packet schema");
  }
  if (
    inventory.engineeringScaffold !== "CLEARED" ||
    inventory.scientificAcceptance !== "BLOCKED" ||
    inventory.rightsAcceptance !== "BLOCKED" ||
    inventory.passageImportAllowed !== false ||
    inventory.gateCAutoApprove !== false ||
    inventory.legalBinding !== false ||
    inventory.containsPhi !== false ||
    inventory.summary.humanCleared !== 0 ||
    inventory.summary.passageImported !== 0 ||
    inventory.summary.packetSlotsRightsCleared !== 0 ||
    inventory.summary.ontologySlotsFilled !== 0 ||
    inventory.summary.contextSlotsFilled !== 0 ||
    inventory.summary.scientificAcceptance !== "BLOCKED" ||
    inventory.summary.rightsAcceptance !== "BLOCKED" ||
    inventory.datasetLifecycleScaffold.smeGoldFilled !== false ||
    inventory.datasetLifecycleScaffold.heldOutFrozen !== false
  ) {
    throw new R1BiomedicalSourcePacketsError(
      "R1 inventory cannot claim rights clearance, passage import, SME gold, or scientific acceptance",
    );
  }
  if (!Array.isArray(inventory.packets) || inventory.packets.length !== 12) {
    throw new R1BiomedicalSourcePacketsError("R1 inventory must reserve exactly 12 packet slots");
  }
  for (const packet of inventory.packets) {
    if (
      packet.rightsStatus !== "rights_pending_quarantine" ||
      packet.licenceEvidenceUri !== null ||
      packet.passageTextImported !== false ||
      packet.passageUsePermitted !== false ||
      packet.humanCleared !== false ||
      packet.graphPromotable !== false ||
      packet.goldEvalBinding.bound !== false ||
      packet.goldEvalBinding.packetHashForGold !== null ||
      packet.ontologyContext.ontologyIds.length !== 0 ||
      packet.ontologyContext.species !== null ||
      packet.ontologyContext.scientificLabelStatus !== "awaiting_sme"
    ) {
      throw new R1BiomedicalSourcePacketsError(
        "R1 packets must stay rights-pending quarantine with empty ontology/context/gold bindings",
      );
    }
  }
  if (!Array.isArray(inventory.checks) || inventory.checks.length === 0) {
    throw new R1BiomedicalSourcePacketsError("R1 checks missing");
  }
  for (const check of inventory.checks) {
    if (check.plane === "human" && check.status === "CLEARED") {
      throw new R1BiomedicalSourcePacketsError(
        `Human check ${check.id} cannot be CLEARED while R1 rights are pending`,
      );
    }
  }
  if (typeof inventory.stopNote !== "string" || inventory.stopNote.length < 20) {
    throw new R1BiomedicalSourcePacketsError("R1 inventory must include an explicit STOP note");
  }
  const {inventoryHash, ...body} = inventory;
  const expected = digest(body);
  if (inventoryHash !== expected) {
    throw new R1BiomedicalSourcePacketsError("R1 source-packet inventory hash mismatch");
  }
  return inventory;
}
