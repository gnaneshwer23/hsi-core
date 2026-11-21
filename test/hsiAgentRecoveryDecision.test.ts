import {test, expect} from "bun:test";
import {
  assertCompatibleRecoveryReason,
  buildHsiRecoveryDecision,
  validateHsiRecoveryDecision,
} from "../src/hsiAgentRecoveryDecision";
import {
  createMemoryCheckpointStore,
  createMemoryFencedArtifactStore,
  runBoundedAgentExecution,
} from "../src/evidence/boundedAgentExecution";
import {createMemoryDynamicEvidencePersistStore} from "../src/evidence/dynamicEvidencePersistence";
import {createMemoryRetrievalCache} from "../src/evidence/dynamicEvidenceRetrieval";

test("recovery decision refuses Gate C / scientific approval claims", () => {
  expect(() =>
    validateHsiRecoveryDecision({
      schemaVersion: "hsi-agent-recovery-decision-1",
      investigationId: "inv-1",
      stageId: "evidence-retrieval",
      approvedBy: "operator-1",
      reasonCode: "resume_orphan_running",
      recoveryReason: "resume interrupted stage",
      priorTerminationReason: null,
      scientificApproval: true as false,
      gateCAutoApprove: false,
      implementedAsLiveAdminE2E: false,
    }),
  ).toThrow("scientific approval");
});

test("prior wall-clock termination requires matching recovery reason", () => {
  expect(() =>
    assertCompatibleRecoveryReason({
      reasonCode: "resume_after_parent_signal",
      priorTerminationReason: "wall_clock_budget",
    }),
  ).toThrow("incompatible");
  expect(() =>
    assertCompatibleRecoveryReason({
      reasonCode: "resume_after_wall_clock_budget",
      priorTerminationReason: "wall_clock_budget",
    }),
  ).not.toThrow();
});

test("buildHsiRecoveryDecision validates orphan resume without prior termination", () => {
  const decision = buildHsiRecoveryDecision({
    investigationId: "inv-1",
    stageId: "mechanism-analysis",
    approvedBy: "operator-1",
    reasonCode: "resume_orphan_running",
    recoveryReason: "human resume of orphan RUNNING fence",
  });
  expect(decision.implementedAsLiveAdminE2E).toBe(false);
  expect(decision.priorTerminationReason).toBeNull();
});

test("bounded execution refuses incompatible recovery reasonCode before dispatch", async () => {
  await expect(
    runBoundedAgentExecution({
      investigationId: "inv-u31-bad-recover",
      question: "How do microbial metabolites influence neuroinflammation?",
      graphRelease: {id: "HSI-GR-SSC", version: "1.0.0", manifestHash: "a".repeat(64)},
      checkpointStore: createMemoryCheckpointStore(),
      artifactStore: createMemoryFencedArtifactStore({
        checkpointStore: createMemoryCheckpointStore(),
      }),
      persistStore: createMemoryDynamicEvidencePersistStore(),
      cache: createMemoryRetrievalCache(),
      recoverStage: {
        stageId: "investigation-plan",
        approvedBy: "operator-1",
        recoveryReason: "wrong pairing",
        reasonCode: "resume_after_wall_clock_budget",
        priorTerminationReason: null,
      },
    }),
  ).rejects.toThrow(/orphan|failed-attempt|prior termination/i);
});

test("bounded execution surfaces termination field on cancelled parent signal", async () => {
  const controller = new AbortController();
  controller.abort();
  const checkpointStore = createMemoryCheckpointStore();
  const result = await runBoundedAgentExecution({
    investigationId: "inv-u31-cancel",
    question: "How do microbial metabolites influence neuroinflammation?",
    graphRelease: {id: "HSI-GR-SSC", version: "1.0.0", manifestHash: "a".repeat(64)},
    checkpointStore,
    artifactStore: createMemoryFencedArtifactStore({checkpointStore}),
    persistStore: createMemoryDynamicEvidencePersistStore(),
    cache: createMemoryRetrievalCache(),
    signal: controller.signal,
  });
  expect(result.status).toBe("cancelled");
  expect(result.termination?.reason).toBe("parent_signal");
  expect(result.recoveryDecision).toBeNull();
  expect(result.orchestration.termination?.reason).toBe("parent_signal");
});
