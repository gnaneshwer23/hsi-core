/**
 * NEXT-E — durable worker / equal-budget benchmark soft-land (P1).
 *
 * Catalogues checkpoint, worker-plan, provider, and redacted-report adapters
 * for locked equal-budget execution. Never invents caps, model bindings,
 * accepted artifacts, or live benchmark acceptance. Blocked until NEXT-A–D.
 */

export const NEXT_E_DURABLE_WORKER_BENCHMARK_SCHEMA =
  "hsi-next-e-durable-worker-benchmark-soft-land-1" as const;

export type NextESuiteMode = "check" | "fixture";

export type NextESurfaceId =
  | "durable_checkpoint_contract"
  | "checkpoint_recovery_store"
  | "immuno_worker_plan"
  | "locked_equal_budget_acceptance"
  | "dual_provider_harness"
  | "failure_preserving_redacted_metrics"
  | "locked_benchmark_execution";

export type NextESurfaceDisposition =
  | "reuse_adapter"
  | "reuse_soft_land"
  | "owner_gated_composition"
  | "blocked_until_next_a_d";

export type NextESurfaceRow = {
  surface: NextESurfaceId;
  disposition: NextESurfaceDisposition;
  liveBenchmarkAccepted: false;
  scientificApproval: false;
  equalBudgetLocked: false;
  pathHints: readonly string[];
  notes: string;
};

export type NextEDurableWorkerBenchmarkPacket = {
  schemaVersion: typeof NEXT_E_DURABLE_WORKER_BENCHMARK_SCHEMA;
  purpose: "next_e_durable_worker_benchmark_soft_land";
  backlogId: "NEXT-E";
  priority: "P1";
  scientificApproval: false;
  liveBenchmarkAccepted: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  equalBudgetLocked: false;
  inventedCaps: false;
  inventedModelBindings: false;
  inventedAcceptedArtifact: false;
  autoPromotion: false;
  dependsOn: readonly ["NEXT-A", "NEXT-B", "NEXT-C", "NEXT-D"];
  ciSafeModes: readonly NextESuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextESurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-e-durable-worker-benchmark.pending.json";
  softLandDocPath: "docs/engineering/NEXT_E_DURABLE_WORKER_BENCHMARK_SOFT_LAND.md";
  honesty: {
    adaptersExistExecutionBlocked: true;
    noInventedCaps: true;
    noInventedModelBindings: true;
    noAutoPromotion: true;
    nextAThroughDRequired: true;
    fixtureIsNotLockedBenchmark: true;
    mustPreserveAllFailures: true;
  };
};

export type NextEAssessment = {
  schemaVersion: "hsi-next-e-assessment-1";
  suiteMode: NextESuiteMode;
  mayClaimLiveBenchmark: false;
  mayInventCaps: false;
  mayInventModelBindings: false;
  mayAutoPromote: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  liveBenchmarkAccepted: false;
};

export type NextEBenchmarkHonesty = {
  schemaVersion: "hsi-next-e-benchmark-honesty-1";
  mustResumeFromDurableCheckpoints: true;
  mustReconcileUncertainProviderOps: true;
  mustPreserveAllFailures: true;
  mustPublishRedactedMetricsDenominatorsIntervals: true;
  mustLockEqualBudgetBeforeExecution: true;
  reasons: string[];
};

const SURFACES: readonly NextESurfaceRow[] = [
  {
    surface: "durable_checkpoint_contract",
    disposition: "reuse_adapter",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: [
      "src/hsiAgentDurableCheckpoint.ts",
      "src/hsiCheckpointedExecutor.ts",
    ],
    notes: "Durable checkpoint CAS contract outside Vercel request budget; no automatic replay.",
  },
  {
    surface: "checkpoint_recovery_store",
    disposition: "reuse_adapter",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: [
      "src/db/hsiCheckpointRecoveryService.ts",
      "src/db/hsiNeonCheckpointStore.ts",
    ],
    notes: "Recovery/store adapters; staging Neon only under owner pins — not live acceptance.",
  },
  {
    surface: "immuno_worker_plan",
    disposition: "reuse_adapter",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: ["src/operations/immunoWorkerPlan.ts"],
    notes: "Persistent worker plan scaffold; requires locked run + authorized caps/models.",
  },
  {
    surface: "locked_equal_budget_acceptance",
    disposition: "reuse_adapter",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: ["src/evidence/immunoBenchmarkAcceptance.ts"],
    notes: "Equal-budget lock gates; soft-land never invents freeze hashes or budget policy.",
  },
  {
    surface: "dual_provider_harness",
    disposition: "reuse_soft_land",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: [
      "src/operations/e2e06DualProviderVerification.ts",
      "src/operations/nextACompositionSoftLand.ts",
    ],
    notes: "E2E-06 / NEXT-A provider composition; credentials and deployments stay owner-gated.",
  },
  {
    surface: "failure_preserving_redacted_metrics",
    disposition: "owner_gated_composition",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: [
      "src/operations/immunoWorkerPlan.ts",
      "src/evidence/immunoBenchmarkScoring.ts",
    ],
    notes: "Redacted metrics/denominators/intervals for the exact accepted artifact only.",
  },
  {
    surface: "locked_benchmark_execution",
    disposition: "blocked_until_next_a_d",
    liveBenchmarkAccepted: false,
    scientificApproval: false,
    equalBudgetLocked: false,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "Locked equal-budget execution waits on NEXT-A/B/C/D acceptance + exact artifact.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Accept NEXT-A, NEXT-B, NEXT-C, and NEXT-D for the named staging/artifact scope first.",
  "Authorize independent verifier model bindings and per-investigation equal-budget caps without inventing them.",
  "Resume from durable checkpoints; reconcile every uncertain provider operation.",
  "Preserve all failures and publish redacted metrics, denominators, and intervals for the exact accepted artifact.",
  "Never auto-promote benchmark outcomes into the curated graph or release packet.",
];

const REUSE_MODULES: readonly string[] = [
  "src/hsiAgentDurableCheckpoint.ts",
  "src/hsiCheckpointedExecutor.ts",
  "src/db/hsiCheckpointRecoveryService.ts",
  "src/operations/immunoWorkerPlan.ts",
  "src/evidence/immunoBenchmarkAcceptance.ts",
  "src/operations/e2e06DualProviderVerification.ts",
  "src/operations/nextACompositionSoftLand.ts",
];

export function nextEDurableWorkerBenchmarkPacket(): NextEDurableWorkerBenchmarkPacket {
  return {
    schemaVersion: NEXT_E_DURABLE_WORKER_BENCHMARK_SCHEMA,
    purpose: "next_e_durable_worker_benchmark_soft_land",
    backlogId: "NEXT-E",
    priority: "P1",
    scientificApproval: false,
    liveBenchmarkAccepted: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    equalBudgetLocked: false,
    inventedCaps: false,
    inventedModelBindings: false,
    inventedAcceptedArtifact: false,
    autoPromotion: false,
    dependsOn: ["NEXT-A", "NEXT-B", "NEXT-C", "NEXT-D"],
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-e-durable-worker-benchmark.pending.json",
    softLandDocPath: "docs/engineering/NEXT_E_DURABLE_WORKER_BENCHMARK_SOFT_LAND.md",
    honesty: {
      adaptersExistExecutionBlocked: true,
      noInventedCaps: true,
      noInventedModelBindings: true,
      noAutoPromotion: true,
      nextAThroughDRequired: true,
      fixtureIsNotLockedBenchmark: true,
      mustPreserveAllFailures: true,
    },
  };
}

export function nextESurfaceById(surface: NextESurfaceId): NextESurfaceRow {
  switch (surface) {
    case "durable_checkpoint_contract":
    case "checkpoint_recovery_store":
    case "immuno_worker_plan":
    case "locked_equal_budget_acceptance":
    case "dual_provider_harness":
    case "failure_preserving_redacted_metrics":
    case "locked_benchmark_execution": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-E surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-E surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextEMode(mode: NextESuiteMode): NextEAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-e-assessment-1",
        suiteMode: mode,
        mayClaimLiveBenchmark: false,
        mayInventCaps: false,
        mayInventModelBindings: false,
        mayAutoPromote: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "locked equal-budget execution stays blocked until NEXT-A through NEXT-D acceptance",
        ],
        scientificApproval: false,
        liveBenchmarkAccepted: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-e-assessment-1",
        suiteMode: mode,
        mayClaimLiveBenchmark: false,
        mayInventCaps: false,
        mayInventModelBindings: false,
        mayAutoPromote: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture checkpoint/worker tests use synthetic stores only",
          "fixture green is not a locked equal-budget benchmark acceptance",
        ],
        scientificApproval: false,
        liveBenchmarkAccepted: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-E suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Benchmark honesty for NEXT-E soft-land. */
export function assessNextEBenchmarkHonesty(): NextEBenchmarkHonesty {
  return {
    schemaVersion: "hsi-next-e-benchmark-honesty-1",
    mustResumeFromDurableCheckpoints: true,
    mustReconcileUncertainProviderOps: true,
    mustPreserveAllFailures: true,
    mustPublishRedactedMetricsDenominatorsIntervals: true,
    mustLockEqualBudgetBeforeExecution: true,
    reasons: [
      "Execution must resume from durable checkpoints outside the Vercel request budget",
      "Every uncertain provider operation must be reconciled before acceptance",
      "All failures must be preserved in the accepted artifact trail",
      "Redacted metrics, denominators, and intervals must bind the exact accepted artifact",
      "Equal-budget lock and approved model bindings are required before execution",
    ],
  };
}

export function assertNextEDurableWorkerBenchmarkSoftLand(
  packet: NextEDurableWorkerBenchmarkPacket,
): {
  surfaceCount: number;
  liveBenchmarkAccepted: false;
  equalBudgetLocked: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== NEXT_E_DURABLE_WORKER_BENCHMARK_SCHEMA) {
    throw new Error("unexpected NEXT-E durable-worker-benchmark schema");
  }
  if (packet.backlogId !== "NEXT-E" || packet.priority !== "P1") {
    throw new Error("soft-land must bind NEXT-E at P1");
  }
  if (packet.liveBenchmarkAccepted !== false || packet.equalBudgetLocked !== false) {
    throw new Error("soft-land must keep liveBenchmarkAccepted and equalBudgetLocked false");
  }
  if (packet.scientificApproval !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must not claim scientific approval or acceptance");
  }
  if (packet.signedPacketClaimed !== false || packet.autoPromotion !== false) {
    throw new Error("soft-land must not claim signed packet or auto-promotion");
  }
  if (
    packet.inventedCaps !== false ||
    packet.inventedModelBindings !== false ||
    packet.inventedAcceptedArtifact !== false
  ) {
    throw new Error("soft-land must not invent caps, model bindings, or accepted artifacts");
  }
  if (
    packet.dependsOn.length !== 4 ||
    packet.dependsOn[0] !== "NEXT-A" ||
    packet.dependsOn[1] !== "NEXT-B" ||
    packet.dependsOn[2] !== "NEXT-C" ||
    packet.dependsOn[3] !== "NEXT-D"
  ) {
    throw new Error("soft-land must depend on NEXT-A through NEXT-D");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-E surfaces");
  for (const surface of packet.surfaces) {
    if (surface.liveBenchmarkAccepted !== false || surface.equalBudgetLocked !== false) {
      throw new Error(`surface ${surface.surface} must keep benchmark/lock false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    liveBenchmarkAccepted: false,
    equalBudgetLocked: false,
    acceptedForScope: false,
  };
}
