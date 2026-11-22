/** Owner authorization for U42 — Scientific Companion live-evidence binding.
 *
 * Owner directed the next two soft-lands after U40 merge (22 November 2026,
 * Europe/London): deepen text Companion with live evidence, and U12 fill-apply.
 *
 * This envelope unlocks binding caller-supplied public literature metadata into
 * text-first companion turns. It does not authorize network retrieval inside
 * the companion turn, voice, avatar, networking, claim verification, scientific
 * approval, Gate C, PHI, production writes, restricted-preview GO, or GA.
 */

export const HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL_SCHEMA =
  "hsi-scientific-companion-live-evidence-owner-approval-1" as const;

export const HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL = {
  schemaVersion: HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_scientific_companion_live_evidence_binding" as const,
  liveEvidenceBindingAuthorized: true as const,
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

export type HsiScientificCompanionLiveEvidenceOwnerApproval =
  typeof HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL;

export function validateHsiScientificCompanionLiveEvidenceOwnerApproval(
  approval: HsiScientificCompanionLiveEvidenceOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid companion live-evidence owner approval schema");
  }
  if (approval.scope !== "engineering_scientific_companion_live_evidence_binding") {
    throw Error("Companion live-evidence approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL.approvedAt) {
    throw Error("Companion live-evidence approval date mismatch");
  }
  if (approval.liveEvidenceBindingAuthorized !== true) {
    throw Error("Companion live-evidence binding must be authorized");
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
      "Companion live-evidence approval must not claim retrieval, verification, voice, avatar, networking, preview GO, writes, Gate C, PHI, clinical plane, GA, scientific approval, or unfenced LLM",
    );
  }
}

export function assertHsiScientificCompanionLiveEvidenceOwnerAuthorized(
  approval: HsiScientificCompanionLiveEvidenceOwnerApproval,
): void {
  validateHsiScientificCompanionLiveEvidenceOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error("Companion live-evidence runtime requires the canonical owner approval envelope");
  }
}
