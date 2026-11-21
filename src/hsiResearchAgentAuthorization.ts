/** Owner authorization for HSI research-agent engineering runtime (U35).
 *
 * Owner approved building research agents on 21 November 2026 (Europe/London).
 * This envelope unlocks the engineering runtime only. It does not authorize
 * Gate C auto-approve, MoU invention, PHI/clinical plane, held Neon migrations,
 * or unrestricted general-production deploy.
 */

export const HSI_RESEARCH_AGENT_OWNER_APPROVAL_SCHEMA =
  "hsi-research-agent-owner-approval-1" as const;

export const HSI_RESEARCH_AGENT_OWNER_APPROVAL = {
  schemaVersion: HSI_RESEARCH_AGENT_OWNER_APPROVAL_SCHEMA,
  /** Calendar date of the owner's explicit approval message. */
  approvedAt: "2026-11-21",
  scope: "engineering_research_agent_runtime" as const,
  scientificApproval: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalProductionDeploy: false as const,
  liveMultiProcessE2EVerified: false as const,
  heldMigrationsEnabled: false as const,
};

export type HsiResearchAgentOwnerApproval = typeof HSI_RESEARCH_AGENT_OWNER_APPROVAL;

export function validateHsiResearchAgentOwnerApproval(
  approval: HsiResearchAgentOwnerApproval,
): void {
  if (!approval || approval.schemaVersion !== HSI_RESEARCH_AGENT_OWNER_APPROVAL_SCHEMA) {
    throw Error("Invalid research-agent owner approval schema");
  }
  if (approval.scope !== "engineering_research_agent_runtime") {
    throw Error("Research-agent approval scope must be engineering runtime only");
  }
  if (approval.approvedAt !== HSI_RESEARCH_AGENT_OWNER_APPROVAL.approvedAt) {
    throw Error("Research-agent approval date mismatch");
  }
  if (
    approval.scientificApproval !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalProductionDeploy !== false ||
    approval.liveMultiProcessE2EVerified !== false ||
    approval.heldMigrationsEnabled !== false
  ) {
    throw Error(
      "Research-agent approval must not claim scientific approval, Gate C, PHI, clinical plane, production deploy, live multi-process E2E, or held migrations",
    );
  }
}

/** Fail closed unless the canonical owner approval envelope is presented. */
export function assertHsiResearchAgentOwnerAuthorized(
  approval: HsiResearchAgentOwnerApproval,
): void {
  validateHsiResearchAgentOwnerApproval(approval);
  if (approval !== HSI_RESEARCH_AGENT_OWNER_APPROVAL) {
    // Structural equality is required for frozen constants passed by reference
    // or deep-cloned; re-validate field-by-field already done above.
    const canonical = JSON.stringify(HSI_RESEARCH_AGENT_OWNER_APPROVAL);
    const provided = JSON.stringify(approval);
    if (canonical !== provided) {
      throw Error("Research-agent runtime requires the canonical owner approval envelope");
    }
  }
}
