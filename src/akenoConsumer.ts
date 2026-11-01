/**
 * Akeno clinical consumer of HSI translation handoff (Phase 8 → in-repo HITL).
 *
 * Provenance (shapes adapted, not a blind dump):
 * - gnaneshwer23/akenohealth @ 620a0f0734120a6461a72eecbe007ce07ab2672f
 *   services/l3-l4-ai-safety/app/clinician_governance.py (review actions)
 *   services/l3-l4-ai-safety/app/guardrails.py (route_to_clinician / human review)
 * - gnaneshwer23/akeno-health-ai @ 898dddfb64bb93b41d267a588693c9728f6ce32e
 *   Lovable marketing/dashboard prototype — UI patterns referenced only; not vendored.
 *
 * Hard gates: not CDS · clinicalActive=false · no PHI · no EHR · no Akeno Neon.
 */
import {
  buildTranslationHandoffPack,
  type TranslationHandoffCandidate,
  type TranslationHandoffPack,
} from "./translationHandoff";

export const AKENO_CONSUMER_SCHEMA = "hsi-akeno-consumer-1" as const;

/** Adapted from akenohealth clinician_governance.record_review actions. */
export type AkenoHitlAction = "acknowledge" | "escalate" | "defer";

export type AkenoHitlReviewDecision = {
  candidateId: string;
  claimId: string;
  akshNodeId: string | null;
  action: AkenoHitlAction;
  reason: string;
  reviewedAt: string;
  auditEventType: "AKENO_HITL_REVIEW_DECISION";
  /** Always true — decisions never auto-apply. */
  requiresHitl: true;
  autoApplyToEhr: false;
  cdsSurfacable: false;
  clinicalUse: "not_for_clinical_use";
};

export type AkenoSafetyEvaluation = {
  blocked: true;
  flags: { drift: false; fairness: false; clinicalGate: true };
  policyVersion: "hsi_akeno_not_cds_v1";
  nextAction: "route_to_clinician_hitl";
  notCds: true;
  autoSurfaceCds: false;
  autoApplyToEhr: false;
};

export type AkenoConsumerBundle = {
  schemaVersion: typeof AKENO_CONSUMER_SCHEMA;
  notCds: true;
  clinicalActive: false;
  clinicalUse: "not_for_clinical_use";
  noPatientLevelActions: true;
  noDiagnosisOrTreatment: true;
  autoApprove: false;
  autoSurfaceCds: false;
  autoApplyToEhr: false;
  /** In-repo HITL consumer — still Stage 3 scaffolding, not live CDS. */
  akenoProductIntegration: "in_repo_hitl_consumer";
  consumerPath: "/akeno";
  handoffSchema: string;
  generatedAt: string;
  provenance: {
    akenohealth: {
      repo: "https://github.com/gnaneshwer23/akenohealth";
      commit: "620a0f0734120a6461a72eecbe007ce07ab2672f";
      note: "Governance + guardrail action shapes adapted; Neon dashboard not copied.";
    };
    akenoHealthAi: {
      repo: "https://github.com/gnaneshwer23/akeno-health-ai";
      commit: "898dddfb64bb93b41d267a588693c9728f6ce32e";
      note: "Lovable-origin marketing/dashboard — not vendored; reference only.";
      lovableUrl: "https://lovable.dev/projects/559c6206-fc9a-4123-8721-fccf2194fb7a";
    };
  };
  neonIsolation: {
    hsiSubstrateOnly: "red-wave-06625195";
    neverWire: ["akeno health / silent-violet", "ISI autumn-snow", "DeliverX"];
    akenoDbEnvPrefix: "AKENO_";
    akenoDbUsage: "optional_non_hsi_never_gate_c";
  };
  candidates: TranslationHandoffCandidate[];
  summary: TranslationHandoffPack["summary"];
  boundary: string[];
};

/**
 * Fail-closed safety eval adapted from akenohealth guardrails.evaluate_safety.
 * Clinical consumer always routes to human HITL — never opens CDS.
 */
export function evaluateAkenoConsumerSafety(): AkenoSafetyEvaluation {
  return {
    blocked: true,
    flags: { drift: false, fairness: false, clinicalGate: true },
    policyVersion: "hsi_akeno_not_cds_v1",
    nextAction: "route_to_clinician_hitl",
    notCds: true,
    autoSurfaceCds: false,
    autoApplyToEhr: false,
  };
}

/**
 * Record a local HITL review decision (session/audit stub).
 * Never writes Neon, EHR, or flips cdsSurfacable.
 */
export function recordAkenoHitlReview(input: {
  candidate: TranslationHandoffCandidate;
  action: AkenoHitlAction;
  reason: string;
  reviewedAt?: string;
}): AkenoHitlReviewDecision {
  const { candidate, action, reason } = input;
  if (!reason.trim()) {
    throw new Error("HITL review requires a non-empty reason");
  }
  if (candidate.cdsSurfacable !== false) {
    throw new Error("Refuse review of cdsSurfacable candidate — scaffolding must stay closed");
  }
  return {
    candidateId: candidate.id,
    claimId: candidate.claimId,
    akshNodeId: candidate.akshNodeId,
    action,
    reason: reason.trim(),
    reviewedAt: input.reviewedAt ?? new Date().toISOString(),
    auditEventType: "AKENO_HITL_REVIEW_DECISION",
    requiresHitl: true,
    autoApplyToEhr: false,
    cdsSurfacable: false,
    clinicalUse: "not_for_clinical_use",
  };
}

/** Build the in-repo Akeno consumer view over the Phase 8 handoff pack. */
export function buildAkenoConsumerBundle(opts?: {
  generatedAt?: string;
  pack?: TranslationHandoffPack;
}): AkenoConsumerBundle {
  const pack = opts?.pack ?? buildTranslationHandoffPack({ generatedAt: opts?.generatedAt });
  const generatedAt = opts?.generatedAt ?? pack.generatedAt;

  return {
    schemaVersion: AKENO_CONSUMER_SCHEMA,
    notCds: true,
    clinicalActive: false,
    clinicalUse: "not_for_clinical_use",
    noPatientLevelActions: true,
    noDiagnosisOrTreatment: true,
    autoApprove: false,
    autoSurfaceCds: false,
    autoApplyToEhr: false,
    akenoProductIntegration: "in_repo_hitl_consumer",
    consumerPath: "/akeno",
    handoffSchema: pack.schemaVersion,
    generatedAt,
    provenance: {
      akenohealth: {
        repo: "https://github.com/gnaneshwer23/akenohealth",
        commit: "620a0f0734120a6461a72eecbe007ce07ab2672f",
        note: "Governance + guardrail action shapes adapted; Neon dashboard not copied.",
      },
      akenoHealthAi: {
        repo: "https://github.com/gnaneshwer23/akeno-health-ai",
        commit: "898dddfb64bb93b41d267a588693c9728f6ce32e",
        note: "Lovable-origin marketing/dashboard — not vendored; reference only.",
        lovableUrl: "https://lovable.dev/projects/559c6206-fc9a-4123-8721-fccf2194fb7a",
      },
    },
    neonIsolation: {
      hsiSubstrateOnly: "red-wave-06625195",
      neverWire: ["akeno health / silent-violet", "ISI autumn-snow", "DeliverX"],
      akenoDbEnvPrefix: "AKENO_",
      akenoDbUsage: "optional_non_hsi_never_gate_c",
    },
    candidates: pack.candidates,
    summary: pack.summary,
    boundary: [
      "In-repo Akeno consumer = HITL review UI over hsi-translation-handoff — not live CDS",
      "clinicalUse=not_for_clinical_use · clinicalActive=false on every candidate",
      "status=deferred_until_hitl · hitlRequired=true · autoApprove=false · cdsSurfacable=0",
      "teachingStatus ≠ hsiGrade ≠ CDS — map / akshNodeId presence never opens CDS",
      "No diagnosis, treatment, PHI, patient outreach, or EHR write-back",
      "HSI Neon = red-wave only; never Gate C / migrations against Akeno Neon",
      "Optional AKENO_* env is non-HSI documentation only — unused by this consumer",
    ],
  };
}

export function serializeAkenoConsumer(
  bundle: AkenoConsumerBundle = buildAkenoConsumerBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
