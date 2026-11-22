/** Owner authorization for HSI Scientific Companion (text-first, U41).
 *
 * Owner directed "Build Then Scientific Companion (text-first on KG/evidence)
 * — next vision milestone after engine hardening" on 21 November 2026
 * (Europe/London).
 *
 * This envelope unlocks the Phase-2 engineering companion that composes
 * existing Living Knowledge Graph / evidence / interrogative services into
 * text-first conversational turns.
 *
 * It does not authorize voice, avatar/Nuance, networking/matching, Gate C
 * auto-approve, PHI/clinical plane, production writes, held Neon migrations,
 * scientific approval, restricted-preview GO, or general availability.
 */

export const HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL_SCHEMA =
  "hsi-scientific-companion-owner-approval-1" as const;

export const HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL = {
  schemaVersion: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL_SCHEMA,
  /** Calendar date of the owner's explicit build directive. */
  approvedAt: "2026-11-21",
  scope: "engineering_scientific_companion_text_first" as const,
  scientificCompanionTextFirstAuthorized: true as const,
  scientificApproval: false as const,
  voiceEnabled: false as const,
  avatarEnabled: false as const,
  nuanceIntegrationApproved: false as const,
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

export type HsiScientificCompanionOwnerApproval =
  typeof HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL;

export function validateHsiScientificCompanionOwnerApproval(
  approval: HsiScientificCompanionOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid scientific companion owner approval schema");
  }
  if (approval.scope !== "engineering_scientific_companion_text_first") {
    throw Error("Scientific companion approval scope must be text-first engineering only");
  }
  if (approval.approvedAt !== HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL.approvedAt) {
    throw Error("Scientific companion approval date mismatch");
  }
  if (approval.scientificCompanionTextFirstAuthorized !== true) {
    throw Error("Scientific companion text-first engineering must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.voiceEnabled !== false ||
    approval.avatarEnabled !== false ||
    approval.nuanceIntegrationApproved !== false ||
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
      "Scientific companion approval must not claim voice, avatar, networking, preview GO, writes, Gate C, PHI, clinical plane, GA, scientific approval, or unfenced LLM free-text",
    );
  }
}

/** Fail closed unless the canonical owner approval envelope is presented. */
export function assertHsiScientificCompanionOwnerAuthorized(
  approval: HsiScientificCompanionOwnerApproval,
): void {
  validateHsiScientificCompanionOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error("Scientific companion runtime requires the canonical owner approval envelope");
  }
}
