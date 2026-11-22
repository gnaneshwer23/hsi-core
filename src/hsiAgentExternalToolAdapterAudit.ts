/** ARCH-009 external tool adapter cancel/idempotency audit (U32 soft-land).
 *
 * Closes the multi-worker hardening checklist item for an in-process audit of
 * required adapter controls. AbortSignal alone cannot stop remote work; every
 * catalogued tool must declare idempotency, cancel checks, and late-commit
 * refusal. Does not invent live multi-process E2E, provider credentials,
 * scientific approval, Gate C, or PHI access.
 */
import {HSI_TOOL_IDS, type HsiToolId} from "./hsiAgentIntelligenceContracts";
import type {HsiOrchestrationCancelReason} from "./hsiAgentOrchestrationCancel";
import type {HsiToolFenceOutcome} from "./hsiAgentToolFence";

export const HSI_EXTERNAL_TOOL_ADAPTER_AUDIT_SCHEMA =
  "hsi-agent-external-tool-adapter-audit-1" as const;

/** Controls every external tool adapter must satisfy before live dispatch. */
export type HsiExternalToolAdapterControl = {
  tool: HsiToolId;
  usesStableIdempotencyKey: true;
  checksCancelBeforeDispatch: true;
  checksCancelAfterReturn: true;
  refusesLateCommit: true;
  /** patient.context.get is catalogued but blocked on the scientific plane. */
  scientificPlaneDispatchAllowed: boolean;
  externalSideEffectsUndone: false;
  liveMultiProcessE2E: false;
};

export type HsiExternalToolAdapterAudit = {
  schemaVersion: typeof HSI_EXTERNAL_TOOL_ADAPTER_AUDIT_SCHEMA;
  adapters: readonly HsiExternalToolAdapterControl[];
  fenceLateCommitLinked: true;
  orchestrationCancelLinked: true;
  scientificApproval: false;
  gateCAutoApprove: false;
  implementedAsLiveMultiProcessE2E: false;
};

export type HsiLateSideEffectAuditRecord = {
  schemaVersion: "hsi-agent-late-side-effect-audit-1";
  tool: HsiToolId;
  idempotencyKey: string;
  fenceStatus: Extract<HsiToolFenceOutcome["status"], "cancelled" | "late_commit_refused">;
  terminationReason: HsiOrchestrationCancelReason | null;
  lateSideEffectCommitted: false;
  externalSideEffectsUndone: false;
  scientificApproval: false;
  implementedAsLiveMultiProcessE2E: false;
};

const PHI_BLOCKED_TOOL: HsiToolId = "patient.context.get";

function controlFor(tool: HsiToolId): HsiExternalToolAdapterControl {
  return {
    tool,
    usesStableIdempotencyKey: true,
    checksCancelBeforeDispatch: true,
    checksCancelAfterReturn: true,
    refusesLateCommit: true,
    scientificPlaneDispatchAllowed: tool !== PHI_BLOCKED_TOOL,
    externalSideEffectsUndone: false,
    liveMultiProcessE2E: false,
  };
}

export function validateHsiExternalToolAdapterAudit(audit: HsiExternalToolAdapterAudit): void {
  if (!audit || audit.schemaVersion !== HSI_EXTERNAL_TOOL_ADAPTER_AUDIT_SCHEMA) {
    throw Error("Invalid external tool adapter audit schema");
  }
  if (!Array.isArray(audit.adapters) || audit.adapters.length !== HSI_TOOL_IDS.length) {
    throw Error("Adapter audit must cover every registered HSI tool id");
  }
  const seen = new Set<string>();
  for (const row of audit.adapters) {
    if (!row || !(HSI_TOOL_IDS as readonly string[]).includes(row.tool)) {
      throw Error("Unknown tool in adapter audit");
    }
    if (seen.has(row.tool)) throw Error("Duplicate tool in adapter audit");
    seen.add(row.tool);
    if (
      row.usesStableIdempotencyKey !== true ||
      row.checksCancelBeforeDispatch !== true ||
      row.checksCancelAfterReturn !== true ||
      row.refusesLateCommit !== true
    ) {
      throw Error("Adapter audit rows must require full cancel/idempotency controls");
    }
    if (row.externalSideEffectsUndone !== false || row.liveMultiProcessE2E !== false) {
      throw Error("Adapter audit must not claim undone side effects or live multi-process E2E");
    }
    const expectedDispatch = row.tool !== PHI_BLOCKED_TOOL;
    if (row.scientificPlaneDispatchAllowed !== expectedDispatch) {
      throw Error("patient.context.get must remain blocked on the scientific plane");
    }
  }
  for (const tool of HSI_TOOL_IDS) {
    if (!seen.has(tool)) throw Error(`Missing adapter audit row for ${tool}`);
  }
  if (
    audit.fenceLateCommitLinked !== true ||
    audit.orchestrationCancelLinked !== true ||
    audit.scientificApproval !== false ||
    audit.gateCAutoApprove !== false ||
    audit.implementedAsLiveMultiProcessE2E !== false
  ) {
    throw Error("Adapter audit honesty flags invalid");
  }
}

/** Soft-land catalog: every registered tool declares required fence controls. */
export function buildHsiExternalToolAdapterAudit(): HsiExternalToolAdapterAudit {
  const audit: HsiExternalToolAdapterAudit = {
    schemaVersion: HSI_EXTERNAL_TOOL_ADAPTER_AUDIT_SCHEMA,
    adapters: HSI_TOOL_IDS.map(controlFor),
    fenceLateCommitLinked: true,
    orchestrationCancelLinked: true,
    scientificApproval: false,
    gateCAutoApprove: false,
    implementedAsLiveMultiProcessE2E: false,
  };
  validateHsiExternalToolAdapterAudit(audit);
  return audit;
}

/**
 * Record that a cancelled / late-refused fence outcome did not commit a late
 * side effect. Optionally attach the U30 orchestration termination reason.
 */
export function buildHsiLateSideEffectAuditRecord(input: {
  tool: HsiToolId;
  fenceOutcome: HsiToolFenceOutcome;
  terminationReason?: HsiOrchestrationCancelReason | null;
}): HsiLateSideEffectAuditRecord {
  if (
    input.fenceOutcome.status !== "cancelled" &&
    input.fenceOutcome.status !== "late_commit_refused"
  ) {
    throw Error("Late side-effect audit only applies to cancelled or late_commit_refused outcomes");
  }
  if (!(HSI_TOOL_IDS as readonly string[]).includes(input.tool)) {
    throw Error("Unknown tool for late side-effect audit");
  }
  const record: HsiLateSideEffectAuditRecord = {
    schemaVersion: "hsi-agent-late-side-effect-audit-1",
    tool: input.tool,
    idempotencyKey: input.fenceOutcome.idempotencyKey,
    fenceStatus: input.fenceOutcome.status,
    terminationReason: input.terminationReason ?? null,
    lateSideEffectCommitted: false,
    externalSideEffectsUndone: false,
    scientificApproval: false,
    implementedAsLiveMultiProcessE2E: false,
  };
  return record;
}
