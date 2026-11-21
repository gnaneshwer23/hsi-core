/** ARCH-009 explicit recovery decision contract (U31 soft-land).
 *
 * Human-authorised recovery must declare why a prior stop may continue.
 * Does not invent research_admin credentials, Gate C auto-approve, MoU,
 * scientific approval, or live multi-process E2E.
 */
import {
  HSI_ORCHESTRATION_CANCEL_REASONS,
  type HsiOrchestrationCancelReason,
} from "./hsiAgentOrchestrationCancel";

export const HSI_RECOVERY_DECISION_SCHEMA = "hsi-agent-recovery-decision-1" as const;

export const HSI_RECOVERY_REASON_CODES = [
  "resume_after_parent_signal",
  "resume_after_wall_clock_budget",
  "resume_after_task_timeout",
  "resume_after_policy_denied",
  "resume_orphan_running",
  "resume_after_failed_attempt",
] as const;

export type HsiRecoveryReasonCode = (typeof HSI_RECOVERY_REASON_CODES)[number];

export type HsiRecoveryDecision = {
  schemaVersion: typeof HSI_RECOVERY_DECISION_SCHEMA;
  investigationId: string;
  stageId: string;
  approvedBy: string;
  reasonCode: HsiRecoveryReasonCode;
  recoveryReason: string;
  priorTerminationReason: HsiOrchestrationCancelReason | null;
  scientificApproval: false;
  gateCAutoApprove: false;
  implementedAsLiveAdminE2E: false;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

const TERMINATION_TO_REASON: Partial<Record<HsiOrchestrationCancelReason, HsiRecoveryReasonCode>> = {
  parent_signal: "resume_after_parent_signal",
  wall_clock_budget: "resume_after_wall_clock_budget",
  task_timeout: "resume_after_task_timeout",
  policy_denied: "resume_after_policy_denied",
};

export function validateHsiRecoveryDecision(decision: HsiRecoveryDecision): void {
  if (!decision || decision.schemaVersion !== HSI_RECOVERY_DECISION_SCHEMA) {
    throw Error("Invalid recovery decision schema");
  }
  if (!ID.test(decision.investigationId) || !ID.test(decision.stageId)) {
    throw Error("Invalid recovery identity");
  }
  if (!decision.approvedBy.trim() || !decision.recoveryReason.trim()) {
    throw Error("Human recovery authorisation and reason required");
  }
  if (!(HSI_RECOVERY_REASON_CODES as readonly string[]).includes(decision.reasonCode)) {
    throw Error("Unknown recovery reason code");
  }
  if (
    decision.priorTerminationReason !== null &&
    !(HSI_ORCHESTRATION_CANCEL_REASONS as readonly string[]).includes(decision.priorTerminationReason)
  ) {
    throw Error("Unknown prior termination reason");
  }
  if (
    decision.scientificApproval !== false ||
    decision.gateCAutoApprove !== false ||
    decision.implementedAsLiveAdminE2E !== false
  ) {
    throw Error("Recovery decision must not claim scientific approval, Gate C, or live admin E2E");
  }
  assertCompatibleRecoveryReason({
    reasonCode: decision.reasonCode,
    priorTerminationReason: decision.priorTerminationReason,
  });
}

/** Prior termination, when known, must match the declared recovery reason code. */
export function assertCompatibleRecoveryReason(input: {
  reasonCode: HsiRecoveryReasonCode;
  priorTerminationReason: HsiOrchestrationCancelReason | null;
}): void {
  if (input.priorTerminationReason === null || input.priorTerminationReason === "unknown") {
    if (
      input.reasonCode !== "resume_orphan_running" &&
      input.reasonCode !== "resume_after_failed_attempt"
    ) {
      throw Error("Recovery without prior termination must use orphan or failed-attempt reason");
    }
    return;
  }
  const expected = TERMINATION_TO_REASON[input.priorTerminationReason];
  if (!expected) {
    throw Error("Prior termination cannot be recovered with an automatic reason mapping");
  }
  if (input.reasonCode !== expected && input.reasonCode !== "resume_after_failed_attempt") {
    throw Error(
      `Recovery reason ${input.reasonCode} incompatible with prior termination ${input.priorTerminationReason}`,
    );
  }
}

export function buildHsiRecoveryDecision(input: {
  investigationId: string;
  stageId: string;
  approvedBy: string;
  reasonCode: HsiRecoveryReasonCode;
  recoveryReason: string;
  priorTerminationReason?: HsiOrchestrationCancelReason | null;
}): HsiRecoveryDecision {
  const decision: HsiRecoveryDecision = {
    schemaVersion: HSI_RECOVERY_DECISION_SCHEMA,
    investigationId: input.investigationId,
    stageId: input.stageId,
    approvedBy: input.approvedBy,
    reasonCode: input.reasonCode,
    recoveryReason: input.recoveryReason,
    priorTerminationReason: input.priorTerminationReason ?? null,
    scientificApproval: false,
    gateCAutoApprove: false,
    implementedAsLiveAdminE2E: false,
  };
  validateHsiRecoveryDecision(decision);
  return decision;
}
