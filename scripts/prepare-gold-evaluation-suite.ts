/** Gold Evaluation Suite v1 prepare/check — no SME labels, no model activation. */
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {createHash} from "node:crypto";
import {buildGoldEvaluationSuiteV1, parseGoldEvaluationSuiteV1} from "../src/goldEvaluationSuite";
import {buildCursorSyntheticV3ContractMap, parseCursorSyntheticV3ContractMap} from "../src/adapters/cursorSyntheticV3ContractMap";
import {buildResearchMechanismWorkflow, parseResearchMechanismWorkflow} from "../src/researchMechanismWorkflow";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "evaluation/gold-evaluation-suite/v1");
const check = process.argv.includes("--check");
const digest = async (s: string) => createHash("sha256").update(s).digest("hex");

const bank = JSON.parse(
  await readFile(resolve(root, "evaluation/research-readiness/questions.draft.json"), "utf8"),
);
const suite = parseGoldEvaluationSuiteV1(await buildGoldEvaluationSuiteV1(bank, digest));
const cursorMap = parseCursorSyntheticV3ContractMap(buildCursorSyntheticV3ContractMap());
const workflow = parseResearchMechanismWorkflow(buildResearchMechanismWorkflow());

const artifacts = [
  ["suite.v1.json", suite],
  ["cursor-plan-contract-map.v1.json", cursorMap],
  ["research-mechanism-workflow.v1.json", workflow],
] as const;

await mkdir(outDir, {recursive: true});
for (const [file, data] of artifacts) {
  const content = JSON.stringify(data, null, 2) + "\n";
  const path = resolve(outDir, file);
  if (check) {
    if ((await readFile(path, "utf8")) !== content) {
      throw new Error("Stale gold-evaluation artifact: " + file);
    }
  } else {
    await writeFile(path, content);
  }
}

console.log(
  JSON.stringify(
    {
      mode: check ? "checked" : "prepared",
      suiteId: suite.id,
      version: suite.version,
      capabilities: suite.capabilities.length,
      labelledCases: suite.smeSlots.independentlyLabelledCases,
      scientificGroundTruthEstablished: false,
      modelActivationAllowed: false,
      workflowSteps: workflow.steps.length,
      cursorMappings: cursorMap.mappings.length,
    },
    null,
    2,
  ),
);
