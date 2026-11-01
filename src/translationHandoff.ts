/**
 * Phase 8 — R3–R5 / Akeno translation substrate (Stage 3 scaffolding).
 *
 * Maps research edges → clinic-facing handoff candidates for the in-repo
 * Akeno HITL consumer (`/akeno`, `src/akenoConsumer.ts`). Honest scaffolding:
 * - HITL required on every candidate; autoApprove=false
 * - teachingStatus, hsiGrade, and CDS stay orthogonal (never collapsed)
 * - claim → marker → LOINC when present
 * - status=deferred_until_hitl; clinicalUse=not_for_clinical_use
 *
 * Does NOT ship live CDS, diagnosis, treatment recommendations, PHI,
 * patient-identifying workflows, or Akeno Neon writes.
 */
import { listAkshHitlReadOnlyCards, type AkshHitlCardViewModel } from "./akshHitl";
import { hsiEvidenceHandoff } from "./evidenceHandoff";
import type { HsiCurationReview, HsiGrade, HsiTeachingStatus } from "./grades";
import { getPartnerLock, type HsiPartnerLock } from "./partnerLock";
import type { HsiDomain } from "./schema";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "./seed/t2dImmunoMetabolic";

export const TRANSLATION_HANDOFF_SCHEMA = "hsi-translation-handoff-1" as const;

/** Candidate lifecycle — Stage 3 scaffolding stays deferred. */
export type TranslationHandoffStatus = "deferred_until_hitl";

/** Hard clinical-use banner on every candidate + pack. */
export type TranslationClinicalUse = "not_for_clinical_use";

export type TranslationHandoffCandidate = {
  id: string;
  claimId: string;
  edgeId: string;
  assertion: string;
  spoNote: string;
  domain: HsiDomain;
  /** Orthogonal axis — do not treat as CDS. */
  teachingStatus: HsiTeachingStatus;
  /** Orthogonal axis — do not treat as CDS. */
  hsiGrade: HsiGrade;
  curationReview: HsiCurationReview;
  /**
   * Always false on Phase 8 scaffolding until Gate C + established.
   * Map / akshNodeId presence never flips this.
   */
  cdsSurfacable: false;
  /** Durable aksh: clinic concept when mapped. */
  akshNodeId: string | null;
  clinicKind: string | null;
  clinicLabel: string | null;
  /** claim → marker → LOINC chain when present. */
  markerId: string | null;
  markerName: string | null;
  loinc: string | null;
  pmid: string | null;
  doi: string | null;
  hitlRequired: true;
  autoApprove: false;
  status: TranslationHandoffStatus;
  clinicalUse: TranslationClinicalUse;
  intendedConsumer: "akeno_hsi_core";
  displayMode: "map_pointer_only";
  requiredClinicianAction: {
    label: string;
    rationale: string;
    requiresHitl: true;
    autoApplyToEhr: false;
  };
  axesNote: "teachingStatus ≠ hsiGrade ≠ CDS — never collapse";
};

export type TranslationHandoffPack = {
  schemaVersion: typeof TRANSLATION_HANDOFF_SCHEMA;
  phase: "8";
  targetReleases: ["R3", "R4", "R5"];
  stage: "3_scaffolding";
  notCds: true;
  noPatientLevelActions: true;
  noDiagnosisOrTreatment: true;
  autoApprove: false;
  autoSurfaceCds: false;
  autoApplyToEhr: false;
  clinicalUse: TranslationClinicalUse;
  clinicalActive: false;
  intendedConsumer: "akeno_hsi_core";
  /** In-repo HITL consumer at /akeno — still not live CDS. */
  akenoProductIntegration: "in_repo_hitl_consumer";
  akenoConsumerPath: "/akeno";
  generatedAt: string;
  disease: string;
  researchQuestion: string;
  scopeLocked: boolean;
  partnerSigned: boolean;
  lockedPilot: boolean;
  framing: "ASK → MAP → REVIEW → VALIDATE → TRANSLATE";
  candidates: TranslationHandoffCandidate[];
  summary: {
    candidates: number;
    withAkshNodeId: number;
    withLoinc: number;
    withPmid: number;
    hitlRequired: number;
    cdsSurfacableCount: 0;
    deferredUntilHitl: number;
    notForClinicalUse: number;
  };
  linkedArtifacts: {
    akshNodeMapJson: string;
    akshHitlCardsJson: string;
    gateCChecklistJson: string;
    partnerLockJson: string;
    r2ValidationJson: string;
  };
  boundary: string[];
  nextActions: string[];
  whatRemainsOutsideHsiCore: string[];
};

function toCandidate(card: AkshHitlCardViewModel): TranslationHandoffCandidate {
  const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === card.edgeId);
  const handoff = edge ? hsiEvidenceHandoff(edge) : null;
  const spoNote = edge
    ? `${edge.subjectLabel} — ${edge.edgeType} — ${edge.objectLabel}`
    : `${card.claimId} · ${card.edgeId}`;

  return {
    id: `xlat-${card.claimId}`,
    claimId: card.claimId,
    edgeId: card.edgeId,
    assertion: card.claimAssertion,
    spoNote,
    domain: card.domain,
    teachingStatus: card.teachingStatus,
    hsiGrade: card.hsiGrade,
    curationReview: card.curationReview,
    // Fail-closed: scaffolding never reports cdsSurfacable=true.
    cdsSurfacable: false,
    akshNodeId: card.akshNodeId,
    clinicKind: card.clinicKind,
    clinicLabel: card.clinicLabel,
    markerId: card.markerId,
    markerName: card.markerName,
    loinc: card.loinc,
    pmid: handoff?.pmid ?? null,
    doi: handoff?.doi ?? null,
    hitlRequired: true,
    autoApprove: false,
    status: "deferred_until_hitl",
    clinicalUse: "not_for_clinical_use",
    intendedConsumer: "akeno_hsi_core",
    displayMode: "map_pointer_only",
    requiredClinicianAction: {
      label: card.requiredClinicianAction.label,
      rationale: card.requiredClinicianAction.rationale,
      requiresHitl: true,
      autoApplyToEhr: false,
    },
    axesNote: "teachingStatus ≠ hsiGrade ≠ CDS — never collapse",
  };
}

/**
 * Build Phase 8 translation handoff pack from Aksh HITL map pointers.
 * Prefer mapped cards (akshNodeId present); always fail-closed on CDS.
 */
export function buildTranslationHandoffPack(opts?: {
  generatedAt?: string;
  lock?: HsiPartnerLock;
  /** Default true — only cards with an akshNodeId. */
  mappedOnly?: boolean;
}): TranslationHandoffPack {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = opts?.lock ?? getPartnerLock();
  const mappedOnly = opts?.mappedOnly !== false;

  const candidates = listAkshHitlReadOnlyCards({ mappedOnly }).map(toCandidate);

  return {
    schemaVersion: TRANSLATION_HANDOFF_SCHEMA,
    phase: "8",
    targetReleases: ["R3", "R4", "R5"],
    stage: "3_scaffolding",
    notCds: true,
    noPatientLevelActions: true,
    noDiagnosisOrTreatment: true,
    autoApprove: false,
    autoSurfaceCds: false,
    autoApplyToEhr: false,
    clinicalUse: "not_for_clinical_use",
    clinicalActive: false,
    intendedConsumer: "akeno_hsi_core",
    akenoProductIntegration: "in_repo_hitl_consumer",
    akenoConsumerPath: "/akeno",
    generatedAt,
    disease: lock.disease?.label ?? "Rheumatoid arthritis",
    researchQuestion:
      lock.researchQuestion ??
      "Why do some patients with rheumatoid arthritis respond differently to anti-TNF therapy?",
    scopeLocked: lock.scopeLocked,
    partnerSigned: lock.partnerSigned,
    lockedPilot: lock.lockedPilot,
    framing: "ASK → MAP → REVIEW → VALIDATE → TRANSLATE",
    candidates,
    summary: {
      candidates: candidates.length,
      withAkshNodeId: candidates.filter((c) => Boolean(c.akshNodeId)).length,
      withLoinc: candidates.filter((c) => Boolean(c.loinc)).length,
      withPmid: candidates.filter((c) => Boolean(c.pmid)).length,
      hitlRequired: candidates.filter((c) => c.hitlRequired).length,
      cdsSurfacableCount: 0,
      deferredUntilHitl: candidates.filter((c) => c.status === "deferred_until_hitl").length,
      notForClinicalUse: candidates.filter((c) => c.clinicalUse === "not_for_clinical_use")
        .length,
    },
    linkedArtifacts: {
      akshNodeMapJson: "hsi-aksh-node-map.json",
      akshHitlCardsJson: "hsi-aksh-hitl-cards.json",
      gateCChecklistJson: "gate-c-checklist.json",
      partnerLockJson: "hsi-partner-lock.json",
      r2ValidationJson: "hsi-r2-validation.json",
    },
    boundary: [
      "Phase 8 = HSI-side Stage 3 translation substrate — not live clinical CDS",
      "clinicalUse=not_for_clinical_use · clinicalActive=false on every candidate",
      "status=deferred_until_hitl · hitlRequired=true · autoApprove=false",
      "teachingStatus ≠ hsiGrade ≠ CDS — axes stay orthogonal; map presence never opens CDS",
      "No diagnosis, treatment recommendations, PHI, or patient-identifying workflows",
      "Akeno in-repo consumer = /akeno HITL review over this handoff (not Neon-backed product)",
      "Do not write ISI / Akeno / DeliverX Neon from this workspace — HSI red-wave only",
    ],
    nextActions: [
      "Review translation candidates on site `/discovery` TRANSLATE tab (human-only).",
      "Open the in-repo Akeno consumer at `/akeno` for HITL acknowledge / escalate / defer.",
      "Keep cdsSurfacable=false until curationReview=approved AND hsiGrade=established AND Stage 3 gates.",
      "Partner cohorts + HCP eval + regulatory remain outside — never from packs alone.",
    ],
    whatRemainsOutsideHsiCore: [
      "Partner-governed cohort datasets + independent evaluation (R3)",
      "Intended-use determination, site access, HCP evaluation, regulatory/privacy (R4)",
      "Prospective CDS validation + regulatory determination (R5) — not committed",
      "Full akenohealth Neon dashboard / ingestion services (PHI-class) — stay in source repos",
      "EHR write-back, patient outreach, eligibility automation — forever gated / out of scope here",
      "Live writes to Akeno / ISI autumn-snow / DeliverX Neon — never from hsi-core",
    ],
  };
}

export function serializeTranslationHandoff(
  pack: TranslationHandoffPack = buildTranslationHandoffPack(),
): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

export function serializeTranslationHandoffMarkdown(
  pack: TranslationHandoffPack = buildTranslationHandoffPack(),
): string {
  const lines: string[] = [
    "# HSI translation handoff (Phase 8 · Stage 3 scaffolding)",
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    "> **Not for clinical use.** clinicalActive=false. No diagnosis / treatment / PHI. Akeno in-repo consumer = `/akeno` HITL only. hitlRequired=true · autoApprove=false · cdsSurfacable=0.",
    "",
    "## Scope",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| phase | ${pack.phase} (R3–R5 scaffolding) |`,
    `| disease | ${pack.disease} |`,
    `| researchQuestion | ${pack.researchQuestion} |`,
    `| scopeLocked | \`${pack.scopeLocked}\` |`,
    `| partnerSigned | \`${pack.partnerSigned}\` |`,
    `| lockedPilot | \`${pack.lockedPilot}\` |`,
    `| clinicalUse | \`${pack.clinicalUse}\` |`,
    `| intendedConsumer | \`${pack.intendedConsumer}\` |`,
    `| akenoProductIntegration | \`${pack.akenoProductIntegration}\` |`,
    "",
    "## Summary",
    "",
    `- Candidates: ${pack.summary.candidates}`,
    `- With akshNodeId: ${pack.summary.withAkshNodeId}`,
    `- With LOINC: ${pack.summary.withLoinc}`,
    `- With PMID: ${pack.summary.withPmid}`,
    `- HITL required: ${pack.summary.hitlRequired}`,
    `- cdsSurfacableCount: ${pack.summary.cdsSurfacableCount}`,
    `- deferred_until_hitl: ${pack.summary.deferredUntilHitl}`,
    `- not_for_clinical_use: ${pack.summary.notForClinicalUse}`,
    "",
    "## Candidates",
    "",
    "| Claim | Clinic | LOINC | Grade | Teaching | Status | HITL |",
    "|-------|--------|-------|-------|----------|--------|------|",
  ];

  for (const c of pack.candidates) {
    lines.push(
      `| \`${c.claimId}\` | ${c.clinicLabel ?? "—"} (\`${c.akshNodeId ?? "unmapped"}\`) | ${c.loinc ?? "—"} | ${c.hsiGrade} | ${c.teachingStatus} | **${c.status}** | required |`,
    );
  }

  lines.push("", "## Boundary", "");
  for (const b of pack.boundary) {
    lines.push(`- ${b}`);
  }
  lines.push("", "## What remains outside hsi-core (Akeno product)", "");
  for (const w of pack.whatRemainsOutsideHsiCore) {
    lines.push(`- ${w}`);
  }
  lines.push("", "## Next actions", "");
  for (const a of pack.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}
