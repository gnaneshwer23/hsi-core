import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  GOLD_EVAL_CAPABILITIES,
  buildGoldEvaluationSuiteV1,
  parseGoldEvaluationSuiteV1,
} from "../src/goldEvaluationSuite";
import {
  buildCursorSyntheticV3ContractMap,
  parseCursorSyntheticV3ContractMap,
} from "../src/adapters/cursorSyntheticV3ContractMap";
import {
  RESEARCH_MECHANISM_STEPS,
  buildResearchMechanismWorkflow,
  parseResearchMechanismWorkflow,
} from "../src/researchMechanismWorkflow";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../src/researchWorkspaceTestFixture";

const root = resolve(import.meta.dir, "..");
const bank = JSON.parse(
  readFileSync(resolve(root, "evaluation/research-readiness/questions.draft.json"), "utf8"),
);
const digest = async (s: string) => createHash("sha256").update(s).digest("hex");

describe("HSI Gold Evaluation Suite v1", () => {
  test("scaffolds ten capability slots without inventing SME gold", async () => {
    const suite = parseGoldEvaluationSuiteV1(await buildGoldEvaluationSuiteV1(bank, digest));
    expect(suite.capabilities).toHaveLength(GOLD_EVAL_CAPABILITIES.length);
    expect(suite.smeSlots.independentlyLabelledCases).toBe(0);
    expect(suite.scientificGroundTruthEstablished).toBe(false);
    expect(suite.modelActivationAllowed).toBe(false);
    expect(suite.metrics.every((m) => m.value === null)).toBe(true);
    expect(suite.baselines.methods.some((m) => m.kind === "deterministic_extractive")).toBe(true);
    expect(suite.baselines.methods.some((m) => m.kind === "lexical_retrieval")).toBe(true);
    expect(suite.baselines.candidateModel.status).toBe("not_configured");
    expect(suite.studyGroupedSplits.frozen).toBe(false);
  });

  test("rejects flipped scientific gold or activation claims", async () => {
    const suite = await buildGoldEvaluationSuiteV1(bank, digest);
    const bad = structuredClone(suite) as {scientificGroundTruthEstablished: boolean};
    bad.scientificGroundTruthEstablished = true;
    expect(() => parseGoldEvaluationSuiteV1(bad)).toThrow("honesty");
  });

  test("on-disk suite artifacts match builders when present", async () => {
    const suitePath = resolve(root, "evaluation/gold-evaluation-suite/v1/suite.v1.json");
    let disk: string;
    try {
      disk = readFileSync(suitePath, "utf8");
    } catch {
      return;
    }
    const expected = await buildGoldEvaluationSuiteV1(bank, digest);
    expect(JSON.parse(disk)).toEqual(expected);
  });
});

describe("Cursor plan contract map", () => {
  test("maps fixture capabilities without replacing HSI services", () => {
    const map = parseCursorSyntheticV3ContractMap(buildCursorSyntheticV3ContractMap());
    expect(map.replacesHsiServices).toBe(false);
    expect(map.autumnSnowForbidden).toBe(true);
    expect(map.gateCAutoApprove).toBe(false);
    expect(map.mappings.every((m) => m.liveCdsOrEhr === false)).toBe(true);
    expect(map.mappings.some((m) => m.status === "deferred_future")).toBe(true);
  });
});

describe("Research mechanism workflow", () => {
  test("binds the synthetic fixture and real API paths", () => {
    const workflow = parseResearchMechanismWorkflow(buildResearchMechanismWorkflow());
    expect(workflow.steps).toHaveLength(RESEARCH_MECHANISM_STEPS.length);
    expect(workflow.syntheticFixture.investigationId).toBe(
      RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
    );
    expect(workflow.recordedPilotDecisionUnchanged).toBe(true);
    expect(workflow.steps.every((s) => s.consumesBackend && !s.hardCodedDemoContent)).toBe(true);
    expect(workflow.steps.some((s) => s.apiPath?.includes("/api/research/"))).toBe(true);
  });
});
