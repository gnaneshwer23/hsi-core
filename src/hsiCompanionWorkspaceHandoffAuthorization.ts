/** Owner authorization for U45 — Companion ↔ workspace evidence handoff.
 *
 * Owner directed “Build next step” after U44 merge (22 November 2026,
 * Europe/London). Deepens Phase-2 Companion by mapping workspace / live-run
 * public literature metadata into companion turns without companion-side
 * network retrieval.
 *
 * Does not authorize companion network retrieval, claim verification, voice,
 * avatar, networking, scientific approval, Gate C, PHI, production writes,
 * restricted-preview GO, or GA.
 */

export const HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL_SCHEMA =
  "hsi-companion-workspace-handoff-owner-approval-1" as const;

export const HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL = {
  schemaVersion: HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_companion_workspace_evidence_handoff" as const,
  workspaceHandoffAuthorized: true as const,
  companionPerformsNetworkRetrieval: false as const,
  claimVerificationAuthorized: false as const,
  scientificApproval: false as const,
  voiceEnabled: false as const,
  avatarEnabled: false as const,
  networkingMatchingEnabled: false as const,
  restrictedPreviewClaimed: false as const,
  productionResearchWritesEnabled: false as const,
  heldMigrationsEnabled: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
  llmUnfencedFreeText: false as const,
};

export type HsiCompanionWorkspaceHandoffOwnerApproval =
  typeof HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL;

export function validateHsiCompanionWorkspaceHandoffOwnerApproval(
  approval: HsiCompanionWorkspaceHandoffOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid companion workspace-handoff owner approval schema");
  }
  if (approval.scope !== "engineering_companion_workspace_evidence_handoff") {
    throw Error("Companion workspace-handoff approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL.approvedAt) {
    throw Error("Companion workspace-handoff approval date mismatch");
  }
  if (approval.workspaceHandoffAuthorized !== true) {
    throw Error("Companion workspace handoff must be authorized");
  }
  if (
    approval.companionPerformsNetworkRetrieval !== false ||
    approval.claimVerificationAuthorized !== false ||
    approval.scientificApproval !== false ||
    approval.voiceEnabled !== false ||
    approval.avatarEnabled !== false ||
    approval.networkingMatchingEnabled !== false ||
    approval.restrictedPreviewClaimed !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.heldMigrationsEnabled !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false ||
    approval.llmUnfencedFreeText !== false
  ) {
    throw Error(
      "Companion workspace-handoff approval must not claim retrieval, verification, voice, avatar, networking, preview GO, writes, Gate C, PHI, clinical plane, GA, scientific approval, or unfenced LLM",
    );
  }
}

export function assertHsiCompanionWorkspaceHandoffOwnerAuthorized(
  approval: HsiCompanionWorkspaceHandoffOwnerApproval,
): void {
  validateHsiCompanionWorkspaceHandoffOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error("Companion workspace handoff requires the canonical owner approval envelope");
  }
}
