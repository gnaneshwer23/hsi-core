/**
 * Clinical / trials scaffolding (Phase 10) that refuses live CDS and PHI.
 * Extends existing synthetic timeline / trials stubs with an explicit refuse gate.
 */
import { HSI_CDS_PHI_INVARIANTS, assertHsiCdsPhiBoundary } from "./cdsPhiBoundary";

export const CLINICAL_RESEARCH_SCAFFOLD_VERSION = "hsi-clinical-research-scaffold-1" as const;

export type ClinicalResearchScaffoldRequest = {
  purpose: "synthetic_timeline_review" | "trials_criteria_stub" | "live_cds" | "phi_linked_research";
  containsPhi: boolean;
  syntheticOnly: boolean;
  liveEmis?: boolean;
  clinicalActive?: boolean;
};

export type ClinicalResearchScaffoldDecision =
  | {
      allow: true;
      reason: string;
      containsPhi: false;
      clinicalAdvice: false;
      notCds: true;
      mode: "synthetic_scaffold";
    }
  | {
      allow: false;
      reason:
        | "live_cds_refused"
        | "phi_refused"
        | "missing_synthetic_flag"
        | "ehr_live_refused"
        | "clinical_active_refused";
      containsPhi: false;
      clinicalAdvice: false;
      notCds: true;
    };

export function decideClinicalResearchScaffold(
  request: ClinicalResearchScaffoldRequest,
): ClinicalResearchScaffoldDecision {
  const base = {
    containsPhi: false as const,
    clinicalAdvice: false as const,
    notCds: HSI_CDS_PHI_INVARIANTS.notCds,
  };

  if (request.purpose === "live_cds" || request.clinicalActive === true) {
    return { allow: false, reason: request.purpose === "live_cds" ? "live_cds_refused" : "clinical_active_refused", ...base };
  }
  if (request.purpose === "phi_linked_research" || request.containsPhi === true) {
    return { allow: false, reason: "phi_refused", ...base };
  }
  if (request.liveEmis === true) {
    return { allow: false, reason: "ehr_live_refused", ...base };
  }
  if (!request.syntheticOnly) {
    return { allow: false, reason: "missing_synthetic_flag", ...base };
  }

  assertHsiCdsPhiBoundary({
    notCds: true,
    containsPhi: false,
    clinicalActive: false,
    liveEmis: false,
    ehrWriteBack: false,
    mhraApprovedCds: false,
    phiToLlm: false,
    autoSurfaceCds: false,
    autoApproveIntoKg: false,
  });

  return {
    allow: true,
    reason:
      request.purpose === "trials_criteria_stub"
        ? "Synthetic trials criteria scaffold only; confirmedEligible stays false until governed product review."
        : "Synthetic clinical timeline scaffold only; not live CDS or PHI.",
    ...base,
    mode: "synthetic_scaffold",
  };
}

export function clinicalResearchScaffoldManifest() {
  return {
    schemaVersion: CLINICAL_RESEARCH_SCAFFOLD_VERSION,
    status: "scaffolding_only",
    scientificReview: "unreviewed" as const,
    containsPhi: false as const,
    clinicalAdvice: false as const,
    kgWrite: false as const,
    notCds: true as const,
    refuses: ["live_cds", "phi_linked_research", "liveEmis", "clinicalActive"],
    allows: ["synthetic_timeline_review", "trials_criteria_stub"],
    note: "Future HSI Clinical / Trials experiences stay governed extensions; this module is a refuse gate, not eligibility or care.",
  };
}
