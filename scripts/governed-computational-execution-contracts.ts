/**
 * Milestone 10 / PR4 — governed computational execution pack check.
 * Offline contracts + deterministic fixture harness only — no lab adapters,
 * no fabricated biology, no scientific validation claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  authoriseComputationalExecution,
  buildGovernedComputationalPack,
  draftAnalysisSpecification,
  draftGovernedComputeJob,
  GOVERNED_COMPUTATIONAL_METHOD,
  GOVERNED_COMPUTATIONAL_SCHEMA,
  GOVERNED_COMPUTATIONAL_VERSION,
  projectGovernedComputationalPersistenceLines,
  refuseArbitraryModelGeneratedCode,
  runGovernedComputationalHarness,
} from "../src/governedComputationalExecutionContracts";

const asOf = "2026-11-09T17:00:00.000Z";
const outDir = "evaluation/governed-computational-execution";

function fixturePack() {
  const drafted = draftAnalysisSpecification({
    id: "hsi-exp-cas-fixture-demo",
    title: "Fixture governed computational reanalysis",
    objective:
      "Run authorised public fixture expression reanalysis under isolated pipeline contracts without claiming scientific validation.",
    approvedProtocolDraftId: "hsi-exp-pint-fixture-demo",
    approvedProtocolVersion: 2,
    protocolLifecycle: "researcher_approved",
    protocolApprovedByPrincipalId: "fixture-researcher",
    draftedByPrincipalId: "fixture-agent-compute",
    draftedByActorKind: "ai_agent",
    createdAt: asOf,
    pipelineKind: "public_fixture_descriptive_summary_v1",
    dataset: {
      datasetId: "hsi-exp-cds-public-fixture-il6-001",
      datasetVersion: "1.0.0",
      accessStatus: "verified_authorised",
      licenceRef: "fixture-public-catalogue://il6-expression-matrix/1.0.0",
      verifiedAt: asOf,
      verifiedByPrincipalId: "fixture-researcher",
      containsPhi: false,
      publicOrAuthorised: true,
    },
    versionPins: {
      analysisCodeVersion: "0.1.0",
      dependencyVersions: [
        {name: "hsi-governed-harness", version: "0.1.0"},
        {name: "bun", version: "1.2.0"},
      ],
      containerImage: null,
      containerDigest: null,
      computeEnvironment: "local-isolated-harness-deny-network",
    },
    resourceLimits: {
      timeoutMs: 5000,
      maxMemoryMb: 256,
      maxCpuMillis: 10_000,
      maxInputRows: 100,
      maxInputColumns: 100,
      networkPolicy: "deny_all",
      networkAllowlist: [],
    },
    qcAcceptanceCriteria: [
      "All values finite",
      "At least three samples",
      "GAPDH housekeeping feature present",
    ],
    hypothesisId: "hyp-fixture-001",
    investigationId: "inv-fixture-001",
    durableCheckpointTaskId: "task-fixture-compute-001",
  });

  const authorised = authoriseComputationalExecution({
    spec: drafted,
    principalId: "fixture-researcher",
    actorKind: "human",
    authorisedAt: asOf,
    note: "Authorise isolated fixture reanalysis under resource budgets.",
  });

  const job = draftGovernedComputeJob({
    id: "hsi-exp-cej-fixture-demo",
    spec: authorised,
    createdAt: asOf,
  });

  const run = runGovernedComputationalHarness({
    job,
    spec: authorised,
    asOf,
    artifactIdPrefix: "hsi-exp-car-fixture-demo",
  });

  const arbitraryRefusal = refuseArbitraryModelGeneratedCode({
    requestedPipelineKind: "model_generated_python_script",
    authorised: false,
  });

  return {spec: authorised, run, arbitraryRefusal};
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const {spec, run, arbitraryRefusal} = fixturePack();
  const pack = buildGovernedComputationalPack({
    specs: [spec],
    jobs: [run.job],
    artifacts: run.artifacts,
    asOf,
  });
  const status = {
    schema: GOVERNED_COMPUTATIONAL_SCHEMA,
    method: GOVERNED_COMPUTATIONAL_METHOD,
    version: GOVERNED_COMPUTATIONAL_VERSION,
    asOf,
    analysisSpecCount: pack.analysisSpecCount,
    jobCount: pack.jobCount,
    artifactCount: pack.artifactCount,
    jobLifecycle: run.job.lifecycle,
    jobOutcome: run.job.outcome,
    scientificValidationClaimed: run.job.scientificValidationClaimed,
    awaitingScientificInterpretation: run.job.awaitingScientificInterpretation,
    migration: "deferred",
    neon: "red-wave-only",
    dependsOnPr1: true,
    dependsOnPr2: true,
    dependsOnPr3: true,
    pr1PullRequest: 101,
    pr2PullRequest: 102,
    pr3PullRequest: 103,
    arbitraryCodeRefused: arbitraryRefusal.refused,
    honesty: pack.honesty,
    persistenceLines: projectGovernedComputationalPersistenceLines({
      spec,
      job: run.job,
      artifacts: run.artifacts,
    }),
  };

  if (!checkOnly) {
    mkdirSync(outDir, {recursive: true});
    writeFileSync(join(outDir, "STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);
    writeFileSync(
      join(outDir, "governed-computational-pack.v1.json"),
      `${JSON.stringify(pack, null, 2)}\n`,
    );
  }

  if (pack.honesty.fabricatedBiologicalDiscoveries) {
    throw Error("Fabricated biological discoveries must stay false");
  }
  if (pack.honesty.labAdaptersWired) {
    throw Error("Lab adapters must stay false");
  }
  if (pack.honesty.liveLabValidationClaimed) {
    throw Error("Live lab validation must stay false");
  }
  if (pack.honesty.mouInvented) {
    throw Error("MoU must stay non-invented");
  }
  if (pack.honesty.gateCAutoApprove) {
    throw Error("Gate C auto-approve must stay false");
  }
  if (run.job.scientificValidationClaimed) {
    throw Error("Scientific validation must not be claimed");
  }
  if (run.job.lifecycle !== "completed") {
    throw Error("Expected completed fixture job");
  }
  if (run.job.outcome !== "awaiting_scientific_interpretation") {
    throw Error("Expected awaiting_scientific_interpretation outcome");
  }
  if (!arbitraryRefusal.refused) {
    throw Error("Arbitrary model-generated code must be refused");
  }
  if (run.artifacts.length < 3) {
    throw Error("Expected execution log, QC, result, and/or manifest artifacts");
  }

  console.log(
    checkOnly
      ? `governed-computational-execution check ok (${pack.analysisSpecCount} specs, ${pack.jobCount} jobs, ${pack.artifactCount} artifacts)`
      : `wrote ${outDir} (${pack.analysisSpecCount} specs, ${pack.jobCount} jobs, ${pack.artifactCount} artifacts)`,
  );
}

main();
