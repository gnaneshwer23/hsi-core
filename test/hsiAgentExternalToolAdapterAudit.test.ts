import {test, expect} from "bun:test";
import {HSI_TOOL_IDS} from "../src/hsiAgentIntelligenceContracts";
import {
  buildHsiExternalToolAdapterAudit,
  buildHsiLateSideEffectAuditRecord,
  validateHsiExternalToolAdapterAudit,
} from "../src/hsiAgentExternalToolAdapterAudit";

test("adapter audit covers every registered tool with required controls", () => {
  const audit = buildHsiExternalToolAdapterAudit();
  expect(audit.schemaVersion).toBe("hsi-agent-external-tool-adapter-audit-1");
  expect(audit.adapters).toHaveLength(HSI_TOOL_IDS.length);
  expect(audit.fenceLateCommitLinked).toBe(true);
  expect(audit.orchestrationCancelLinked).toBe(true);
  expect(audit.scientificApproval).toBe(false);
  expect(audit.gateCAutoApprove).toBe(false);
  expect(audit.implementedAsLiveMultiProcessE2E).toBe(false);
  for (const row of audit.adapters) {
    expect(row.usesStableIdempotencyKey).toBe(true);
    expect(row.checksCancelBeforeDispatch).toBe(true);
    expect(row.checksCancelAfterReturn).toBe(true);
    expect(row.refusesLateCommit).toBe(true);
    expect(row.externalSideEffectsUndone).toBe(false);
    expect(row.liveMultiProcessE2E).toBe(false);
  }
  const phi = audit.adapters.find((row) => row.tool === "patient.context.get");
  expect(phi?.scientificPlaneDispatchAllowed).toBe(false);
  const literature = audit.adapters.find((row) => row.tool === "literature.search");
  expect(literature?.scientificPlaneDispatchAllowed).toBe(true);
});

test("adapter audit validation rejects incomplete catalogs and false honesty", () => {
  const audit = buildHsiExternalToolAdapterAudit();
  expect(() =>
    validateHsiExternalToolAdapterAudit({
      ...audit,
      adapters: audit.adapters.slice(1),
    }),
  ).toThrow("every registered");
  expect(() =>
    validateHsiExternalToolAdapterAudit({
      ...audit,
      implementedAsLiveMultiProcessE2E: true as false,
    }),
  ).toThrow("honesty");
  const mutated = {
    ...audit,
    adapters: audit.adapters.map((row) =>
      row.tool === "patient.context.get"
        ? {...row, scientificPlaneDispatchAllowed: true}
        : row,
    ),
  };
  expect(() => validateHsiExternalToolAdapterAudit(mutated)).toThrow("scientific plane");
});

test("late side-effect audit records refuse commits under known termination", () => {
  const record = buildHsiLateSideEffectAuditRecord({
    tool: "evidence.get",
    fenceOutcome: {
      status: "late_commit_refused",
      idempotencyKey: "evidence.get:attempt-1",
      reason: "Abort observed after tool returned; late success must not be committed",
    },
    terminationReason: "wall_clock_budget",
  });
  expect(record.schemaVersion).toBe("hsi-agent-late-side-effect-audit-1");
  expect(record.fenceStatus).toBe("late_commit_refused");
  expect(record.terminationReason).toBe("wall_clock_budget");
  expect(record.lateSideEffectCommitted).toBe(false);
  expect(record.externalSideEffectsUndone).toBe(false);
  expect(record.scientificApproval).toBe(false);
  expect(record.implementedAsLiveMultiProcessE2E).toBe(false);
});

test("late side-effect audit rejects successful fence outcomes", () => {
  expect(() =>
    buildHsiLateSideEffectAuditRecord({
      tool: "graph.query",
      fenceOutcome: {
        status: "success",
        idempotencyKey: "graph.query:attempt-1",
        resultRef: "ref-1",
      },
    }),
  ).toThrow("cancelled or late_commit_refused");
});
