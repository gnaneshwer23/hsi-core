/**
 * P0.2-HSI — ISI consume contract.
 *
 * Machine-readable map of what ISI / immunecity must load from hsi-core
 * versioned outputs. Document only — does not edit immunecity; does not
 * flip partnerSigned; does not invent MoUs or CDS paths.
 *
 * See docs/OUTPUTS.md · docs/BUILD_STATUS_AND_NEXT.md.
 */

import {
  HSI_CURATION_REVIEWS,
  HSI_GRADE_INFO,
  HSI_GRADES,
  HSI_TEACHING_STATUSES,
} from "./grades";
import {
  getPartnerLock,
  isProductionPartnerSignedTrusted,
} from "./partnerLock";
import { getVerticalDecision } from "./verticalDecision";

export const ISI_CONSUME_CONTRACT_SCHEMA =
  "hsi-isi-consume-contract-1" as const;

export const ISI_CONSUME_CONTRACT_VERSION = "0.2.0" as const;

/** Mirror of publishOutputs OUTPUTS_MANIFEST_SCHEMA — avoid circular import. */
export const ISI_CONSUME_OUTPUTS_MANIFEST_SCHEMA =
  "hsi-outputs-manifest-1" as const;

export type IsiArtifactLoadPriority =
  | "required_core"
  | "required_pilot"
  | "recommended_secondary"
  | "optional_proposal"
  | "optional_aksh";

export type IsiArtifactConsumerSurface =
  | "ask_map_review"
  | "gate_c_queue"
  | "validate"
  | "translate_hitl"
  | "systems_secondary"
  | "proposal_shelf"
  | "partner_readiness"
  | "aksh_hitl"
  | "manifest";

export type IsiArtifactContractRow = {
  manifestKey: string;
  fileName: string;
  schemaHint: string;
  loadPriority: IsiArtifactLoadPriority;
  consumerSurfaces: IsiArtifactConsumerSurface[];
  autoApproveIntoKg: false;
  notes: string;
};

export type IsiDiscoveryJsonPath = {
  sitePath: string;
  regenerableFrom: "bun run outputs";
  role: string;
  notCds: true;
};

export type IsiGradeSemantics = {
  hsiGrades: typeof HSI_GRADES;
  gradeInfo: typeof HSI_GRADE_INFO;
  curationReviews: typeof HSI_CURATION_REVIEWS;
  teachingStatuses: typeof HSI_TEACHING_STATUSES;
  rules: string[];
};

export type IsiGateCRules = {
  checklistArtifact: "gate-c-checklist.json";
  statusOnPublish: "pending";
  autoApprove: false;
  mayFlipHsiGradeFromChecklist: false;
  approveTargetNeon: "ISI product Neon autumn-snow (OUT OF REPO)";
  hsiNeonRole: "red-wave pending placeholders only (bun run db:gate-c-local)";
  neverWriteFromHsiWorkspace: string[];
  modelProposals: string[];
  translationCandidates: string[];
  rules: string[];
};

export type IsiConsumeContractBundle = {
  schemaVersion: typeof ISI_CONSUME_CONTRACT_SCHEMA;
  contractVersion: typeof ISI_CONSUME_CONTRACT_VERSION;
  phase: "P0.2-HSI";
  notCds: true;
  autoApproveIntoKg: false;
  containsPhi: false;
  /**
   * May be true under hypothetical_test_only fixture for path testing.
   * Production ISI must ignore unless ALLOW_HYPOTHETICAL_PARTNER=true.
   */
  partnerSigned: boolean;
  /** True when scopeLocked && partnerSigned && legalBinding (Apolo named path). */
  lockedPilot: boolean;
  /** Trusted production signal — false for fixture; true for named legalBinding partner. */
  productionPartnerSigned: boolean;
  agreementKind: string;
  legalBinding: boolean;
  isHypothetical: boolean;
  notALegalAgreement: boolean;
  testPilotMode: boolean;
  testFixtureBanner: string | null;
  allowHypotheticalPartnerEnv: "ALLOW_HYPOTHETICAL_PARTNER";
  generatedAt: string;
  package: "hsi-core";
  outputsManifestSchema: typeof ISI_CONSUME_OUTPUTS_MANIFEST_SCHEMA;
  compatibility: {
    minHsiCoreVersion: string;
    immunecityEditFromThisWorkspace: false;
    sharedEvidenceNeon: false;
    notes: string[];
  };
  vertical: {
    verticalStrategy: "dual_track";
    activeScope: "ra-tnf";
    prdMvpTarget: "ssc-tfh-b-il21";
    askStaysRa: true;
  };
  grades: IsiGradeSemantics;
  gateC: IsiGateCRules;
  artifacts: IsiArtifactContractRow[];
  discoveryJsonPaths: IsiDiscoveryJsonPath[];
  loadOrderHint: string[];
  summary: {
    artifactCount: number;
    requiredCoreCount: number;
    requiredPilotCount: number;
    recommendedSecondaryCount: number;
    optionalProposalCount: number;
    discoveryPathCount: number;
  };
  honesty: string[];
};

const ARTIFACTS: IsiArtifactContractRow[] = [
  {
    manifestKey: "isiExport",
    fileName: "hsi-isi-export.json",
    schemaHint: "hsi-isi-export-1",
    loadPriority: "required_core",
    consumerSurfaces: ["ask_map_review"],
    autoApproveIntoKg: false,
    notes: "Primary graded edges + claims for Discovery / Ask / Radar.",
  },
  {
    manifestKey: "isiRelMap",
    fileName: "hsi-isi-rel-map.json",
    schemaHint: "hsi-isi-rel-map-1",
    loadPriority: "required_core",
    consumerSurfaces: ["ask_map_review", "gate_c_queue"],
    autoApproveIntoKg: false,
    notes: "REL-* curation pointers only — never auto-approve into KG.",
  },
  {
    manifestKey: "gateCChecklistJson",
    fileName: "gate-c-checklist.json",
    schemaHint: "hsi-gate-c-checklist-1",
    loadPriority: "required_core",
    consumerSurfaces: ["gate_c_queue"],
    autoApproveIntoKg: false,
    notes:
      "Pending human Gate C rows (+ translationCandidates + modelProposals). Approve only in ISI Neon.",
  },
  {
    manifestKey: "gateCChecklistMd",
    fileName: "gate-c-checklist.md",
    schemaHint: "markdown",
    loadPriority: "required_core",
    consumerSurfaces: ["gate_c_queue"],
    autoApproveIntoKg: false,
    notes: "Human-readable Gate C queue companion.",
  },
  {
    manifestKey: "partnerLockJson",
    fileName: "hsi-partner-lock.json",
    schemaHint: "hsi-partner-lock-1",
    loadPriority: "required_pilot",
    consumerSurfaces: ["ask_map_review", "partner_readiness"],
    autoApproveIntoKg: false,
    notes:
      "scopeLocked=true; named Apolo Pharma may set partnerSigned=true + legalBinding=true → lockedPilot=true; fixture path uses hypothetical_test_only. Do not invent MoU contacts.",
  },
  {
    manifestKey: "verticalDecisionJson",
    fileName: "hsi-vertical-decision.json",
    schemaHint: "hsi-vertical-decision-1",
    loadPriority: "required_pilot",
    consumerSurfaces: ["ask_map_review"],
    autoApproveIntoKg: false,
    notes: "Option A dual-track — ASK stays RA; SSc is PRD MVP secondary.",
  },
  {
    manifestKey: "pilotEvidencePackJson",
    fileName: "hsi-pilot-evidence-pack.json",
    schemaHint: "hsi-pilot-evidence-pack-2",
    loadPriority: "required_pilot",
    consumerSurfaces: ["ask_map_review"],
    autoApproveIntoKg: false,
    notes: "Four Stage 1 workflow outputs for the locked RA/anti-TNF question.",
  },
  {
    manifestKey: "pilotEvidencePackMd",
    fileName: "hsi-pilot-evidence-pack.md",
    schemaHint: "markdown",
    loadPriority: "required_pilot",
    consumerSurfaces: ["ask_map_review"],
    autoApproveIntoKg: false,
    notes: "Human brief / walkthrough shell for the four outputs.",
  },
  {
    manifestKey: "pilotReviewRubricJson",
    fileName: "hsi-pilot-review-rubric.json",
    schemaHint: "hsi-pilot-review-rubric-1",
    loadPriority: "required_pilot",
    consumerSurfaces: ["ask_map_review", "partner_readiness"],
    autoApproveIntoKg: false,
    notes:
      "Review checklist; Apolo Pharma Stage 1 numeric thresholds are partner_agreed (2026-11-01); fixture path may still be set_for_test.",
  },
  {
    manifestKey: "pilotAcceptanceJson",
    fileName: "hsi-pilot-acceptance.json",
    schemaHint: "hsi-pilot-acceptance-1",
    loadPriority: "required_pilot",
    consumerSurfaces: ["partner_readiness"],
    autoApproveIntoKg: false,
    notes:
      "Stage 1 acceptance pass/fail/pending — Apolo named path may show lockedPilot=true + licensing pass; fixture path keeps lockedPilot=false until legalBinding.",
  },
  {
    manifestKey: "pilotWalkthroughMd",
    fileName: "hsi-pilot-walkthrough.md",
    schemaHint: "markdown",
    loadPriority: "required_pilot",
    consumerSurfaces: ["partner_readiness", "ask_map_review"],
    autoApproveIntoKg: false,
    notes:
      "Partner session script for RA/anti-TNF scope (P0.6 Apolo hygiene: named lock + 48/48 clearance + lockedPilot).",
  },
  {
    manifestKey: "gapReportJson",
    fileName: "hsi-gap-report.json",
    schemaHint: "hsi-gap-report-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["ask_map_review", "validate"],
    autoApproveIntoKg: false,
    notes: "Schema / mapping gaps for curator backlog.",
  },
  {
    manifestKey: "r2ValidationJson",
    fileName: "hsi-r2-validation.json",
    schemaHint: "hsi-r2-validation-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["validate"],
    autoApproveIntoKg: false,
    notes: "Hypothesis cards + ranked gaps + literature tests (research only).",
  },
  {
    manifestKey: "sscPathwayPackJson",
    fileName: "hsi-ssc-pathway-pack.json",
    schemaHint: "hsi-ssc-pathway-pack-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["systems_secondary", "ask_map_review"],
    autoApproveIntoKg: false,
    notes: "SSc Tfh–B–IL-21 PRD MVP slice — does not replace RA ASK.",
  },
  {
    manifestKey: "gutImmunePackJson",
    fileName: "hsi-gut-immune-pack.json",
    schemaHint: "hsi-gut-immune-pack-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["systems_secondary"],
    autoApproveIntoKg: false,
    notes: "P1.3 SCFA ↔ mucosal Treg/Th17 secondary axis.",
  },
  {
    manifestKey: "neuroImmunePackJson",
    fileName: "hsi-neuroimmune-pack.json",
    schemaHint: "hsi-neuroimmune-pack-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["systems_secondary"],
    autoApproveIntoKg: false,
    notes: "P2.1 vagus / cholinergic secondary axis; VNS–RA hypothesized only.",
  },
  {
    manifestKey: "translationHandoffJson",
    fileName: "hsi-translation-handoff.json",
    schemaHint: "hsi-translation-handoff-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["translate_hitl"],
    autoApproveIntoKg: false,
    notes:
      "Stage 3 scaffolding; clinicalUse=not_for_clinical_use; not live CDS.",
  },
  {
    manifestKey: "systemsVisionJson",
    fileName: "hsi-systems-vision.json",
    schemaHint: "hsi-systems-vision-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["systems_secondary"],
    autoApproveIntoKg: false,
    notes: "Multi-axis target graph stubs + AI hard bans.",
  },
  {
    manifestKey: "partnerFlipReadinessJson",
    fileName: "hsi-partner-flip-readiness.json",
    schemaHint: "hsi-partner-flip-readiness-1",
    loadPriority: "required_pilot",
    consumerSurfaces: ["partner_readiness"],
    autoApproveIntoKg: false,
    notes:
      "P0.2-HSI flip checklist with pass/fail/pending/satisfied_by_fixture; fixture path-testing; readyToFlipPartnerSigned=false for real MoU.",
  },
  {
    manifestKey: "isiConsumeContractJson",
    fileName: "hsi-isi-consume-contract.json",
    schemaHint: ISI_CONSUME_CONTRACT_SCHEMA,
    loadPriority: "required_pilot",
    consumerSurfaces: ["manifest", "partner_readiness"],
    autoApproveIntoKg: false,
    notes: "This contract — machine-readable ISI load map.",
  },
  {
    manifestKey: "sourceLicensingStubJson",
    fileName: "hsi-source-licensing-stub.json",
    schemaHint: "hsi-source-licensing-stub-1",
    loadPriority: "recommended_secondary",
    consumerSurfaces: ["partner_readiness"],
    autoApproveIntoKg: false,
    notes:
      "P0.3 reviewed: PMIDs from RA/SSc/gut/neuro packs; licenseStatus ok_cite|ok_oa|restricted|unknown (2026-11-01 Europe PMC/Crossref).",
  },
  {
    manifestKey: "embeddingSidecarsJson",
    fileName: "hsi-embedding-sidecars.json",
    schemaHint: "hsi-embedding-sidecars-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf"],
    autoApproveIntoKg: false,
    notes: "Hash/ref only; doesNotSetHsiGrade; packs remain authority.",
  },
  {
    manifestKey: "modelEvalHarnessJson",
    fileName: "hsi-model-eval-harness.json",
    schemaHint: "hsi-model-eval-harness-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf"],
    autoApproveIntoKg: false,
    notes: "Offline eval vs frozen packs; no PHI / no training.",
  },
  {
    manifestKey: "externalGenomePointersJson",
    fileName: "hsi-external-genome-pointers.json",
    schemaHint: "hsi-external-genome-pointers-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf"],
    autoApproveIntoKg: false,
    notes: "ClinVar/TCGA citation pointers; reviewRequired; no bulk dump.",
  },
  {
    manifestKey: "p3AdapterLicenseMatrixJson",
    fileName: "hsi-p3-adapter-license-matrix.json",
    schemaHint: "hsi-p3-adapter-license-matrix-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf"],
    autoApproveIntoKg: false,
    notes: "Adapter license / sign-off shelf; no weight vendoring.",
  },
  {
    manifestKey: "rdkitAdapterProposalsJson",
    fileName: "hsi-rdkit-adapter-proposals.json",
    schemaHint: "hsi-rdkit-adapter-proposals-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf", "gate_c_queue"],
    autoApproveIntoKg: false,
    notes: "P3.0 proposal-only; Gate C pending; does not set hsiGrade.",
  },
  {
    manifestKey: "openmmAdapterProposalsJson",
    fileName: "hsi-openmm-adapter-proposals.json",
    schemaHint: "hsi-openmm-adapter-proposals-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf", "gate_c_queue"],
    autoApproveIntoKg: false,
    notes: "P3.1 proposal-only; MD ≠ Gate C evidence alone.",
  },
  {
    manifestKey: "reinvent4AdapterProposalsJson",
    fileName: "hsi-reinvent4-adapter-proposals.json",
    schemaHint: "hsi-reinvent4-adapter-proposals-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf", "gate_c_queue"],
    autoApproveIntoKg: false,
    notes: "P3.2 proposal-only; never clinic path.",
  },
  {
    manifestKey: "esmAdapterProposalsJson",
    fileName: "hsi-esm-adapter-proposals.json",
    schemaHint: "hsi-esm-adapter-proposals-1",
    loadPriority: "optional_proposal",
    consumerSurfaces: ["proposal_shelf", "gate_c_queue"],
    autoApproveIntoKg: false,
    notes: "P3.3 proposal + sidecar refs; no weight vendoring.",
  },
  {
    manifestKey: "akshNodeMap",
    fileName: "hsi-aksh-node-map.json",
    schemaHint: "hsi-aksh-node-map-2",
    loadPriority: "optional_aksh",
    consumerSurfaces: ["aksh_hitl"],
    autoApproveIntoKg: false,
    notes: "Aksh durable node map — not ISI Discovery core.",
  },
  {
    manifestKey: "akshHitlCards",
    fileName: "hsi-aksh-hitl-cards.json",
    schemaHint: "hsi-aksh-hitl-stub-1",
    loadPriority: "optional_aksh",
    consumerSurfaces: ["aksh_hitl"],
    autoApproveIntoKg: false,
    notes: "cdsSurfacable=false on seeds.",
  },
];

const DISCOVERY_PATHS: IsiDiscoveryJsonPath[] = [
  {
    sitePath: "site/public/discovery/catalogue.json",
    regenerableFrom: "bun run outputs",
    role: "Discovery Centre public catalogue (framing + file list); also mirrored at site/public/discovery.json — /discovery is the product UI",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-partner-lock.json",
    regenerableFrom: "bun run outputs",
    role: "ASK scope lock + partnerSigned honesty",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-pilot-evidence-pack.json",
    regenerableFrom: "bun run outputs",
    role: "ASK → MAP → REVIEW four outputs",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/gate-c-checklist.json",
    regenerableFrom: "bun run outputs",
    role: "Gate C pending queue snapshot for demo / handoff",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-r2-validation.json",
    regenerableFrom: "bun run outputs",
    role: "VALIDATE tab",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-translation-handoff.json",
    regenerableFrom: "bun run outputs",
    role: "TRANSLATE tab (not live CDS)",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-ssc-pathway-pack.json",
    regenerableFrom: "bun run outputs",
    role: "Dual-track SSc secondary pack",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-gut-immune-pack.json",
    regenerableFrom: "bun run outputs",
    role: "Systems secondary gut–immune",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-neuroimmune-pack.json",
    regenerableFrom: "bun run outputs",
    role: "Systems secondary neuroimmune",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-isi-consume-contract.json",
    regenerableFrom: "bun run outputs",
    role: "This ISI consume contract (static copy)",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-partner-flip-readiness.json",
    regenerableFrom: "bun run outputs",
    role: "Partner flip-readiness pack (static copy)",
    notCds: true,
  },
  {
    sitePath: "site/public/discovery/hsi-source-licensing-stub.json",
    regenerableFrom: "bun run outputs",
    role: "Source licensing stub (static copy)",
    notCds: true,
  },
];

export function buildIsiConsumeContractBundle(opts?: {
  generatedAt?: string;
}): IsiConsumeContractBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = getPartnerLock();
  const vertical = getVerticalDecision();

  const requiredCoreCount = ARTIFACTS.filter(
    (a) => a.loadPriority === "required_core",
  ).length;
  const requiredPilotCount = ARTIFACTS.filter(
    (a) => a.loadPriority === "required_pilot",
  ).length;
  const recommendedSecondaryCount = ARTIFACTS.filter(
    (a) => a.loadPriority === "recommended_secondary",
  ).length;
  const optionalProposalCount = ARTIFACTS.filter(
    (a) => a.loadPriority === "optional_proposal",
  ).length;

  return {
    schemaVersion: ISI_CONSUME_CONTRACT_SCHEMA,
    contractVersion: ISI_CONSUME_CONTRACT_VERSION,
    phase: "P0.2-HSI",
    notCds: true,
    autoApproveIntoKg: false,
    containsPhi: false,
    partnerSigned: lock.partnerSigned,
    lockedPilot: lock.lockedPilot,
    productionPartnerSigned: isProductionPartnerSignedTrusted(lock),
    agreementKind: lock.agreementKind,
    legalBinding: lock.legalBinding,
    isHypothetical: lock.isHypothetical,
    notALegalAgreement: lock.notALegalAgreement,
    testPilotMode: lock.testPilotMode,
    testFixtureBanner: lock.testFixtureBanner,
    allowHypotheticalPartnerEnv: "ALLOW_HYPOTHETICAL_PARTNER",
    generatedAt,
    package: "hsi-core",
    outputsManifestSchema: ISI_CONSUME_OUTPUTS_MANIFEST_SCHEMA,
    compatibility: {
      minHsiCoreVersion: "0.1.0",
      immunecityEditFromThisWorkspace: false,
      sharedEvidenceNeon: false,
      notes: [
        "ISI product loads versioned dist/outputs/<bundleId>/ (or site/public/discovery static copies for the HSI demo site).",
        "Do not edit immunecity from the hsi-core workspace — consume published exports only.",
        "HSI Neon is red-wave only; Gate C approve+supports stays in ISI Neon autumn-snow (out of repo).",
        "Manifest invariants: notCds=true, autoApproveIntoKg=false, autoSurfaceCds=false.",
        `Partner lock at publish: scopeLocked=${lock.scopeLocked}, partnerSigned=${lock.partnerSigned}, lockedPilot=${lock.lockedPilot}, agreementKind=${lock.agreementKind}, legalBinding=${lock.legalBinding}, isHypothetical=${lock.isHypothetical}.`,
        lock.testFixtureBanner
          ? `${lock.testFixtureBanner} Production ISI must ignore partnerSigned unless ALLOW_HYPOTHETICAL_PARTNER=true. Swap via src/hypotheticalPartnerFixture.ts.`
          : "No hypothetical fixture active.",
        `Vertical: ${vertical.verticalStrategy} · activeScope=${vertical.activeScope} · prdMvpTarget=${vertical.prdMvpTarget}.`,
        "Technical adapter spikes (RDKit/OpenMM/REINVENT4/ESM) are optional_proposal — do not block ISI Discovery core load.",
        "P0.6 walkthrough/export hygiene landed for Apolo named lock; next substrate depth is P1.4 systems/ISI predicates (not more adapter spikes).",
      ],
    },
    vertical: {
      verticalStrategy: "dual_track",
      activeScope: "ra-tnf",
      prdMvpTarget: "ssc-tfh-b-il21",
      askStaysRa: true,
    },
    grades: {
      hsiGrades: HSI_GRADES,
      gradeInfo: HSI_GRADE_INFO,
      curationReviews: HSI_CURATION_REVIEWS,
      teachingStatuses: HSI_TEACHING_STATUSES,
      rules: [
        "hsiGrade is a coarse band (established / uncertain / unexplored) — not a Gate C decision and not a confidence score.",
        "curationReview is the human Gate C / review lifecycle — orthogonal to hsiGrade.",
        "teachingStatus (established / associative / hypothesized / unknown) is a separate KG label — never merge axes into one score.",
        "Model proposals, embeddings, MD, and generative drafts must never flip hsiGrade.",
        "Packs (pilot / SSc / gut / neuro) remain evidence authority over proposal shelves.",
      ],
    },
    gateC: {
      checklistArtifact: "gate-c-checklist.json",
      statusOnPublish: "pending",
      autoApprove: false,
      mayFlipHsiGradeFromChecklist: false,
      approveTargetNeon: "ISI product Neon autumn-snow (OUT OF REPO)",
      hsiNeonRole: "red-wave pending placeholders only (bun run db:gate-c-local)",
      neverWriteFromHsiWorkspace: [
        "ISI Neon autumn-snow / ep-blue-salad",
        "Akeno Neon",
        "DeliverX Neon",
      ],
      modelProposals: [
        "Typed ModelProposalArtifact drafts appear as gate-c modelProposals.",
        "autoApprove=false; human must re-check S-P-O + PMID before any ISI Neon approve.",
        "RDKit / OpenMM / REINVENT4 / ESM spikes feed this queue only — never clinic path.",
      ],
      translationCandidates: [
        "Phase 8 translationCandidates are HITL-only.",
        "clinicalUse=not_for_clinical_use; clinicalActive=false.",
      ],
      rules: [
        "Publish leaves every evidence-backed Gate C row as pending.",
        "Approve+supports is human-only in ISI product Neon — never automated from hsi-core.",
        "HSI db:gate-c-local may upsert pending placeholders into red-wave only.",
        "Same PMID on multiple axes (e.g. 16382236) requires curator S-P-O re-check before approve.",
      ],
    },
    artifacts: ARTIFACTS,
    discoveryJsonPaths: DISCOVERY_PATHS,
    loadOrderHint: [
      "1. MANIFEST.json — verify notCds / autoApproveIntoKg=false; if partnerSigned=true under hypothetical_test_only require ALLOW_HYPOTHETICAL_PARTNER; named legalBinding partners may set lockedPilot=true (still not CDS / no auto Gate C).",
      "2. required_core: hsi-isi-export.json + hsi-isi-rel-map.json + gate-c-checklist.*",
      "3. required_pilot: partner lock + vertical decision + pilot pack/rubric/acceptance/walkthrough + flip-readiness + this contract",
      "4. recommended_secondary: gap / R2 / SSc / gut / neuro / translation / systems vision / licensing stub",
      "5. optional_proposal: embedding / eval / genome pointers / P3 matrix / adapter proposals (Gate C drafts only)",
      "6. optional_aksh: node map + HITL cards (Aksh consumer — not ISI Discovery core)",
    ],
    summary: {
      artifactCount: ARTIFACTS.length,
      requiredCoreCount,
      requiredPilotCount,
      recommendedSecondaryCount,
      optionalProposalCount,
      discoveryPathCount: DISCOVERY_PATHS.length,
    },
    honesty: [
      "P0.2-HSI documents ISI consume + partner flip-readiness — MoU paperwork for named partners is operator-asserted; never invent emails/phones.",
      lock.isHypothetical
        ? "Hypothetical fixture may set partnerSigned=true under agreementKind=hypothetical_test_only; productionPartnerSigned=false; lockedPilot=false while legalBinding=false."
        : `Named partner ${lock.partner?.id ?? "unknown"}: partnerSigned=${lock.partnerSigned}; legalBinding=${lock.legalBinding}; lockedPilot=${lock.lockedPilot}; productionPartnerSigned=${isProductionPartnerSignedTrusted(lock)}. Still not CDS; Gate C never auto-approves.`,
      "Production ISI must ignore fixture partnerSigned unless ALLOW_HYPOTHETICAL_PARTNER=true.",
      "Swap / inspect partner via src/hypotheticalPartnerFixture.ts.",
      "No CDS / PHI / shared Neon (HSI = red-wave only).",
      "immunecity may vendor Discovery JSON under freeze-lift HSI-consume scope only — Gate C stays human.",
    ],
  };
}

export function serializeIsiConsumeContract(
  bundle: IsiConsumeContractBundle,
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeIsiConsumeContractMarkdown(
  bundle: IsiConsumeContractBundle,
): string {
  const lines = [
    "# HSI → ISI consume contract (P0.2-HSI)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · contract \`${bundle.contractVersion}\` · generated ${bundle.generatedAt}`,
    "",
    `**notCds** · **autoApproveIntoKg=false** · **partnerSigned=${bundle.partnerSigned}** · **productionPartnerSigned=false** · **lockedPilot=${bundle.lockedPilot}** · **containsPhi=false**`,
    "",
    bundle.testFixtureBanner
      ? `> **${bundle.testFixtureBanner}** agreementKind=\`${bundle.agreementKind}\` · legalBinding=\`${bundle.legalBinding}\` · isHypothetical=\`${bundle.isHypothetical}\``
      : "",
    bundle.testFixtureBanner ? "" : "",
    "## Compatibility",
    "",
  ];
  for (const n of bundle.compatibility.notes) {
    lines.push(`- ${n}`);
  }
  lines.push(
    "",
    "## Vertical",
    "",
    `- Strategy: \`${bundle.vertical.verticalStrategy}\``,
    `- ASK / activeScope: \`${bundle.vertical.activeScope}\``,
    `- PRD MVP target: \`${bundle.vertical.prdMvpTarget}\``,
    "",
    "## Grades semantics",
    "",
  );
  for (const r of bundle.grades.rules) {
    lines.push(`- ${r}`);
  }
  lines.push("", "## Gate C rules", "");
  for (const r of bundle.gateC.rules) {
    lines.push(`- ${r}`);
  }
  lines.push(
    "",
    `- Checklist: \`${bundle.gateC.checklistArtifact}\` (status on publish: **${bundle.gateC.statusOnPublish}**)`,
    `- Approve target: ${bundle.gateC.approveTargetNeon}`,
    `- HSI Neon: ${bundle.gateC.hsiNeonRole}`,
    "",
    "## Load order",
    "",
  );
  for (const h of bundle.loadOrderHint) {
    lines.push(`- ${h}`);
  }
  lines.push(
    "",
    "## Artifacts",
    "",
    "| Priority | MANIFEST key | File | Surfaces |",
    "|----------|--------------|------|----------|",
  );
  for (const a of bundle.artifacts) {
    lines.push(
      `| ${a.loadPriority} | \`${a.manifestKey}\` | \`${a.fileName}\` | ${a.consumerSurfaces.join(", ")} |`,
    );
  }
  lines.push("", "## Discovery JSON paths (HSI site)", "");
  for (const p of bundle.discoveryJsonPaths) {
    lines.push(`- \`${p.sitePath}\` — ${p.role}`);
  }
  lines.push("", "## Honesty", "");
  for (const h of bundle.honesty) {
    lines.push(`- ${h}`);
  }
  lines.push("");
  return lines.join("\n");
}
