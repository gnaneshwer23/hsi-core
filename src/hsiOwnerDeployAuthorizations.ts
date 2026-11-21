/** Owner deploy / plane authorizations (U36).
 *
 * Records the owner's 21 November 2026 approvals for:
 * 1. Public L0 production deploy (site + Demo Universe)
 * 2. Clinical-plane *synthetic* engineering advance (lift-ready only)
 *
 * Real PHI / live CDS / ADR-0010 real-data enablement remain forbidden until
 * every ADR-0010 gate is independently closed. This module cannot flip
 * `mayUseLivePhi` or `clinicalActive`.
 */
import {HSI_CDS_PHI_INVARIANTS} from "./cdsPhiBoundary";

export const HSI_OWNER_DEPLOY_AUTHORIZATION_SCHEMA =
  "hsi-owner-deploy-authorization-1" as const;

/** Public L0: marketing site + synthetic Demo Universe on production host. */
export const HSI_PUBLIC_L0_DEPLOY_APPROVAL = {
  schemaVersion: HSI_OWNER_DEPLOY_AUTHORIZATION_SCHEMA,
  approvedAt: "2026-11-21",
  scope: "public_l0_production_deploy" as const,
  publicL0DeployAuthorized: true as const,
  publicLaunchGo: true as const,
  ownerVisualAcceptanceRecorded: true as const,
  scientificApproval: false as const,
  productionResearchWritesEnabled: false as const,
  heldMigrationsEnabled: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalActive: false as const,
};

/** Clinical plane: synthetic / lift-ready engineering only — not real patient data. */
export const HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL = {
  schemaVersion: HSI_OWNER_DEPLOY_AUTHORIZATION_SCHEMA,
  approvedAt: "2026-11-21",
  scope: "clinical_plane_synthetic_engineering" as const,
  clinicalPlaneSyntheticEngineeringAuthorized: true as const,
  realPatientDataEnabled: false as const,
  adr0010GatesClosed: false as const,
  privateClinicalRepoCreated: false as const,
  scientificApproval: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalActive: false as const,
  liveCds: false as const,
  ehrWriteBack: false as const,
};

export type HsiPublicL0DeployApproval = typeof HSI_PUBLIC_L0_DEPLOY_APPROVAL;
export type HsiClinicalPlaneSyntheticEngineeringApproval =
  typeof HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL;

export function validateHsiPublicL0DeployApproval(approval: HsiPublicL0DeployApproval): void {
  if (!approval || approval.schemaVersion !== HSI_OWNER_DEPLOY_AUTHORIZATION_SCHEMA) {
    throw Error("Invalid owner deploy authorization schema");
  }
  if (approval.scope !== "public_l0_production_deploy") {
    throw Error("Public L0 approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_PUBLIC_L0_DEPLOY_APPROVAL.approvedAt) {
    throw Error("Public L0 approval date mismatch");
  }
  if (
    approval.publicL0DeployAuthorized !== true ||
    approval.publicLaunchGo !== true ||
    approval.ownerVisualAcceptanceRecorded !== true
  ) {
    throw Error("Public L0 owner GO fields must be true under this approval");
  }
  if (
    approval.scientificApproval !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.heldMigrationsEnabled !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalActive !== false
  ) {
    throw Error(
      "Public L0 approval must not enable scientific approval, research writes, held migrations, Gate C, PHI, or clinical activity",
    );
  }
}

export function validateHsiClinicalPlaneSyntheticEngineeringApproval(
  approval: HsiClinicalPlaneSyntheticEngineeringApproval,
): void {
  if (!approval || approval.schemaVersion !== HSI_OWNER_DEPLOY_AUTHORIZATION_SCHEMA) {
    throw Error("Invalid owner deploy authorization schema");
  }
  if (approval.scope !== "clinical_plane_synthetic_engineering") {
    throw Error("Clinical-plane synthetic approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.approvedAt) {
    throw Error("Clinical-plane synthetic approval date mismatch");
  }
  if (approval.clinicalPlaneSyntheticEngineeringAuthorized !== true) {
    throw Error("Clinical-plane synthetic engineering must be authorized");
  }
  if (
    approval.realPatientDataEnabled !== false ||
    approval.adr0010GatesClosed !== false ||
    approval.privateClinicalRepoCreated !== false ||
    approval.scientificApproval !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalActive !== false ||
    approval.liveCds !== false ||
    approval.ehrWriteBack !== false
  ) {
    throw Error(
      "Clinical-plane synthetic approval must keep real PHI, ADR-0010 gates, private repo, Gate C, clinical activity, live CDS, and EHR write-back closed",
    );
  }
}

/**
 * Owner chat approval cannot flip scientific-plane CDS/PHI invariants.
 * Real PHI enablement requires every ADR-0010 gate closed in a separate decision.
 */
export function assertHsiPhiRemainClosedUnderOwnerDeployApprovals(): void {
  if (
    HSI_CDS_PHI_INVARIANTS.mayUseLivePhi !== false ||
    HSI_CDS_PHI_INVARIANTS.containsPhi !== false ||
    HSI_CDS_PHI_INVARIANTS.clinicalActive !== false ||
    HSI_CDS_PHI_INVARIANTS.notCds !== true ||
    HSI_CDS_PHI_INVARIANTS.phiToLlm !== false ||
    HSI_CDS_PHI_INVARIANTS.ehrWriteBack !== false
  ) {
    throw Error("CDS/PHI invariants must remain closed on the scientific plane");
  }
  validateHsiPublicL0DeployApproval(HSI_PUBLIC_L0_DEPLOY_APPROVAL);
  validateHsiClinicalPlaneSyntheticEngineeringApproval(
    HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL,
  );
  if (
    HSI_PUBLIC_L0_DEPLOY_APPROVAL.phiAllowed !== false ||
    HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.phiAllowed !== false ||
    HSI_CLINICAL_PLANE_SYNTHETIC_ENGINEERING_APPROVAL.realPatientDataEnabled !== false
  ) {
    throw Error("Owner deploy approvals must not enable PHI");
  }
}
