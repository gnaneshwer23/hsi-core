import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextEBenchmarkHonesty,
  assessNextEMode,
  assertNextEDurableWorkerBenchmarkSoftLand,
  nextEDurableWorkerBenchmarkPacket,
  nextESurfaceById,
  type NextESuiteMode,
  type NextESurfaceId,
} from "../src/operations/nextEDurableWorkerBenchmarkSoftLand";

describe("NEXT-E durable worker / benchmark soft-land", () => {
  test("documents seven surfaces without accepting a locked benchmark", () => {
    const packet = nextEDurableWorkerBenchmarkPacket();
    const summary = assertNextEDurableWorkerBenchmarkSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.liveBenchmarkAccepted).toBe(false);
    expect(summary.equalBudgetLocked).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.backlogId).toBe("NEXT-E");
    expect(packet.priority).toBe("P1");
    expect(packet.dependsOn).toEqual(["NEXT-A", "NEXT-B", "NEXT-C", "NEXT-D"]);
    expect(packet.honesty.noAutoPromotion).toBe(true);
    expect(packet.inventedCaps).toBe(false);
  });

  test("each surface keeps benchmark lock and promotion false", () => {
    const surfaces: NextESurfaceId[] = [
      "durable_checkpoint_contract",
      "checkpoint_recovery_store",
      "immuno_worker_plan",
      "locked_equal_budget_acceptance",
      "dual_provider_harness",
      "failure_preserving_redacted_metrics",
      "locked_benchmark_execution",
    ];
    for (const surface of surfaces) {
      const row = nextESurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.liveBenchmarkAccepted).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.equalBudgetLocked).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows live benchmark or invented caps", () => {
    const modes: NextESuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextEMode(mode);
      expect(assessment.mayClaimLiveBenchmark).toBe(false);
      expect(assessment.mayInventCaps).toBe(false);
      expect(assessment.mayInventModelBindings).toBe(false);
      expect(assessment.mayAutoPromote).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.liveBenchmarkAccepted).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("benchmark honesty stays fail-closed", () => {
    const honesty = assessNextEBenchmarkHonesty();
    expect(honesty.mustResumeFromDurableCheckpoints).toBe(true);
    expect(honesty.mustReconcileUncertainProviderOps).toBe(true);
    expect(honesty.mustPreserveAllFailures).toBe(true);
    expect(honesty.mustPublishRedactedMetricsDenominatorsIntervals).toBe(true);
    expect(honesty.mustLockEqualBudgetBeforeExecution).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/next-e-durable-worker-benchmark.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      liveBenchmarkAccepted: boolean;
      equalBudgetLocked: boolean;
      references: {
        next_a_acceptance_ref: string;
        next_d_acceptance_ref: string;
        equal_budget_cap_ref: string;
        accepted_artifact_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.liveBenchmarkAccepted).toBe(false);
    expect(pending.equalBudgetLocked).toBe(false);
    expect(pending.references.next_a_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.next_d_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.equal_budget_cap_ref).toBe("UNASSIGNED");
    expect(pending.references.accepted_artifact_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_E_DURABLE_WORKER_BENCHMARK_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-E");
    expect(doc).toContain("liveBenchmarkAccepted");
    expect(doc).toContain("equal-budget");
  });
});
