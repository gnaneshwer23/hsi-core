/**
 * Milestone 10 PR4 — governed computational execution honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  authoriseComputationalExecution,
  buildGovernedComputationalPack,
  buildPublicFixtureExpressionMatrix,
  createMemoryGovernedComputationalStore,
  draftAnalysisSpecification,
  draftGovernedComputeJob,
  fingerprintAnalysisSpecification,
  projectGovernedComputationalPersistenceLines,
  refuseArbitraryModelGeneratedCode,
  runGovernedComputationalHarness,
  type AnalysisSpecification,
  type DatasetAccessVerification,
  type PipelineVersionPins,
  type ResourceLimits,
} from "../src/governedComputationalExecutionContracts";

const asOf = "2026-11-09T17:00:00.000Z";

function seedDataset(
  overrides?: Partial<DatasetAccessVerification>,
): DatasetAccessVerification {
  return {
    datasetId: "hsi-exp-cds-public-fixture-il6-001",
    datasetVersion: "1.0.0",
    accessStatus: "verified_authorised",
    licenceRef: "fixture-public-catalogue://il6-expression-matrix/1.0.0",
    verifiedAt: asOf,
    verifiedByPrincipalId: "principal-researcher-alice",
    containsPhi: false,
    publicOrAuthorised: true,
    ...overrides,
  };
}

function seedPins(
  overrides?: Partial<PipelineVersionPins>,
): PipelineVersionPins {
  return {
    analysisCodeVersion: "0.1.0",
    dependencyVersions: [
      {name: "hsi-governed-harness", version: "0.1.0"},
      {name: "bun", version: "1.2.0"},
    ],
    containerImage: null,
    containerDigest: null,
    computeEnvironment: "local-isolated-harness-deny-network",
    ...overrides,
  };
}

function seedLimits(
  overrides?: Partial<ResourceLimits>,
): ResourceLimits {
  return {
    timeoutMs: 5000,
    maxMemoryMb: 256,
    maxCpuMillis: 10_000,
    maxInputRows: 100,
    maxInputColumns: 100,
    networkPolicy: "deny_all",
    networkAllowlist: [],
    ...overrides,
  };
}

function seedSpec(
  overrides?: Partial<Parameters<typeof draftAnalysisSpecification>[0]>,
): AnalysisSpecification {
  return draftAnalysisSpecification({
    id: "hsi-exp-cas-ssc-il6-reanalysis-001",
    title: "Public fixture IL-6 reanalysis (governed compute)",
    objective:
      "Reanalyse authorised public fixture expression matrix under closed pipeline contracts without claiming scientific validation.",
    approvedProtocolDraftId: "hsi-exp-pint-ssc-il6-001",
    approvedProtocolVersion: 2,
    protocolLifecycle: "researcher_approved",
    protocolApprovedByPrincipalId: "principal-researcher-alice",
    draftedByPrincipalId: "agent-hsi-compute-1",
    draftedByActorKind: "ai_agent",
    createdAt: asOf,
    pipelineKind: "public_fixture_descriptive_summary_v1",
    dataset: seedDataset(),
    versionPins: seedPins(),
    resourceLimits: seedLimits(),
    qcAcceptanceCriteria: [
      "All values finite",
      "At least three samples",
      "GAPDH housekeeping feature present",
    ],
    hypothesisId: "hyp-ssc-il6-001",
    investigationId: "inv-ssc-mech-001",
    linkedPr1ExecutionId: "hsi-exp-exec-il6-planned",
    durableCheckpointTaskId: "task-compute-il6-reanalysis",
    ...overrides,
  });
}

function authorise(
  spec = seedSpec(),
): AnalysisSpecification {
  return authoriseComputationalExecution({
    spec,
    principalId: "principal-researcher-alice",
    actorKind: "human",
    authorisedAt: asOf,
    note: "Authorise isolated fixture reanalysis under resource budgets.",
  });
}

describe("governed computational execution contracts (M10 PR4)", () => {
  test("drafts analysis specification bound to approved protocol with honesty gates", () => {
    const spec = seedSpec();
    expect(spec.approvedProtocolDraftId).toBe("hsi-exp-pint-ssc-il6-001");
    expect(spec.dataset.accessStatus).toBe("verified_authorised");
    expect(spec.executionAuthorisation).toBeNull();
    expect(spec.honesty.dependsOnPr1LifecycleContracts).toBe(true);
    expect(spec.honesty.dependsOnPr2DesignPrioritisation).toBe(true);
    expect(spec.honesty.dependsOnPr3ProtocolIntelligence).toBe(true);
    expect(spec.honesty.completedJobIsNotScientificValidation).toBe(true);
    expect(spec.honesty.liveLabValidationClaimed).toBe(false);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.resourceLimits.networkPolicy).toBe("deny_all");
    expect(fingerprintAnalysisSpecification(spec)).toMatch(/^[a-f0-9]{64}$/);
  });

  test("requires verified dataset access and refuses credential leaks", () => {
    expect(() =>
      seedSpec({
        dataset: seedDataset({accessStatus: "unverified", licenceRef: null}),
      }),
    ).toThrow(/verified_authorised/i);

    expect(() =>
      seedSpec({
        objective: "Run with api_key=sk-abcdefghijklmnopqrstuvwxyz",
      }),
    ).toThrow(/must not embed credentials/i);

    expect(() =>
      seedSpec({
        versionPins: seedPins({
          containerImage: "ghcr.io/example/hsi-harness:0.1.0",
          containerDigest: null,
        }),
      }),
    ).toThrow(/containerImage requires containerDigest/i);
  });

  test("refuses AI self-authorisation and arbitrary model-generated code", () => {
    const spec = seedSpec();
    expect(() =>
      authoriseComputationalExecution({
        spec,
        principalId: "agent-hsi-compute-1",
        actorKind: "ai_agent",
        authorisedAt: asOf,
        note: "Self authorise",
      }),
    ).toThrow(/Only authorised humans may authorise/i);

    expect(() =>
      authoriseComputationalExecution({
        spec,
        principalId: "agent-hsi-compute-1",
        actorKind: "human",
        authorisedAt: asOf,
        note: "Spoofed human same principal as AI drafter",
      }),
    ).toThrow(/AI cannot self-authorise/i);

    const refusal = refuseArbitraryModelGeneratedCode({
      requestedPipelineKind: "model_generated_python_script",
      authorised: false,
    });
    expect(refusal.refused).toBe(true);
    expect(refusal.authorisedPipelineKinds).toContain(
      "public_fixture_descriptive_summary_v1",
    );
  });

  test("deterministic harness produces reproducible artifacts and awaits interpretation", () => {
    const spec = authorise();
    const job = draftGovernedComputeJob({
      id: "hsi-exp-cej-ssc-il6-001",
      spec,
      createdAt: asOf,
    });
    const run = runGovernedComputationalHarness({
      job,
      spec,
      asOf,
      artifactIdPrefix: "hsi-exp-car-ssc-il6-001",
    });
    expect(run.job.lifecycle).toBe("completed");
    expect(run.job.outcome).toBe("awaiting_scientific_interpretation");
    expect(run.job.scientificValidationClaimed).toBe(false);
    expect(run.job.awaitingScientificInterpretation).toBe(true);
    expect(run.artifacts.length).toBeGreaterThanOrEqual(3);
    expect(run.job.reproducibilityManifest?.scientificValidationClaimed).toBe(
      false,
    );
    expect(run.job.reproducibilityManifest?.inputFixtureSha256).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const again = runGovernedComputationalHarness({
      job: draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-001b",
        spec,
        createdAt: asOf,
      }),
      spec,
      asOf,
      artifactIdPrefix: "hsi-exp-car-ssc-il6-001b",
    });
    expect(again.job.reproducibilityManifest?.inputFixtureSha256).toBe(
      run.job.reproducibilityManifest?.inputFixtureSha256,
    );
    const resultA = run.artifacts.find((a) => a.kind === "result_table");
    const resultB = again.artifacts.find((a) => a.kind === "result_table");
    expect(resultA?.contentSha256).toBe(resultB?.contentSha256);
  });

  test("distinguishes failed, QC failure, incomplete, and null-result outcomes", () => {
    const spec = authorise();

    const failed = runGovernedComputationalHarness({
      job: draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-fail",
        spec,
        createdAt: asOf,
      }),
      spec,
      asOf,
      forceFailure: "simulated_runtime_error",
    });
    expect(failed.job.lifecycle).toBe("failed");
    expect(failed.job.outcome).toBe("failed");

    const qcFailed = runGovernedComputationalHarness({
      job: draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-qc",
        spec,
        createdAt: asOf,
      }),
      spec,
      asOf,
      forceQcFailure: true,
      artifactIdPrefix: "hsi-exp-car-ssc-il6-qc",
    });
    expect(qcFailed.job.lifecycle).toBe("completed");
    expect(qcFailed.job.outcome).toBe("qc_failed");

    const cancelled = runGovernedComputationalHarness({
      job: draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-cancel",
        spec,
        createdAt: asOf,
      }),
      spec,
      asOf,
      forceCancel: true,
    });
    expect(cancelled.job.lifecycle).toBe("cancelled");
    expect(cancelled.job.outcome).toBe("incomplete");

    const nullResults = runGovernedComputationalHarness({
      job: draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-null",
        spec,
        createdAt: asOf,
      }),
      spec,
      asOf,
      forceNullResults: true,
      artifactIdPrefix: "hsi-exp-car-ssc-il6-null",
    });
    expect(nullResults.job.outcome).toBe("succeeded_null_results");
    expect(
      nullResults.artifacts.some((a) => a.kind === "null_result_declaration"),
    ).toBe(true);
  });

  test("correlation pipeline and resource budget guards", () => {
    const spec = authorise(
      seedSpec({
        id: "hsi-exp-cas-ssc-il6-corr-001",
        pipelineKind: "public_fixture_correlation_v1",
      }),
    );
    const run = runGovernedComputationalHarness({
      job: draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-corr",
        spec,
        createdAt: asOf,
      }),
      spec,
      asOf,
      artifactIdPrefix: "hsi-exp-car-ssc-il6-corr",
    });
    expect(run.job.outcome).toBe("awaiting_scientific_interpretation");
    const result = run.artifacts.find((a) => a.kind === "result_table");
    expect(result?.content).toMatchObject({
      pipelineKind: "public_fixture_correlation_v1",
      pair: ["IL6", "STAT3"],
    });

    const tinyBudget = authorise(
      seedSpec({
        id: "hsi-exp-cas-ssc-il6-budget",
        resourceLimits: seedLimits({maxInputRows: 2}),
      }),
    );
    expect(() =>
      runGovernedComputationalHarness({
        job: draftGovernedComputeJob({
          id: "hsi-exp-cej-ssc-il6-budget",
          spec: tinyBudget,
          createdAt: asOf,
        }),
        spec: tinyBudget,
        asOf,
      }),
    ).toThrow(/resource budget/i);
  });

  test("memory store + pack + persistence projection", () => {
    const store = createMemoryGovernedComputationalStore();
    const spec = authorise();
    store.upsertAnalysisSpec(spec);
    const job = draftGovernedComputeJob({
      id: "hsi-exp-cej-ssc-il6-store",
      spec,
      createdAt: asOf,
    });
    const run = runGovernedComputationalHarness({
      job,
      spec,
      asOf,
      artifactIdPrefix: "hsi-exp-car-ssc-il6-store",
    });
    store.upsertJob(run.job);
    for (const artifact of run.artifacts) {
      store.upsertArtifact(artifact);
    }

    expect(store.listAnalysisSpecs("hsi-exp-pint-ssc-il6-001")).toHaveLength(1);
    expect(store.listJobs(spec.id)).toHaveLength(1);
    expect(store.listArtifacts(run.job.id).length).toBeGreaterThanOrEqual(3);

    const pack = buildGovernedComputationalPack({
      specs: [spec],
      jobs: [run.job],
      artifacts: run.artifacts,
      asOf,
    });
    expect(pack.analysisSpecCount).toBe(1);
    expect(pack.jobCount).toBe(1);
    expect(pack.dependency.requiresPr3ProtocolIntelligence).toBe(true);
    expect(pack.honesty.fabricatedBiologicalDiscoveries).toBe(false);
    expect(pack.honesty.labAdaptersWired).toBe(false);

    const lines = projectGovernedComputationalPersistenceLines({
      spec,
      job: run.job,
      artifacts: run.artifacts,
    });
    expect(lines).toContain("dependsOnPr1=true");
    expect(lines).toContain("dependsOnPr2=true");
    expect(lines).toContain("dependsOnPr3=true");
    expect(lines).toContain("scientificValidationClaimed=false");
    expect(lines).toContain("awaitingScientificInterpretation=true");

    const matrix = buildPublicFixtureExpressionMatrix();
    expect(matrix.honesty.fixtureDeclared).toBe(true);
    expect(matrix.honesty.containsPhi).toBe(false);
  });

  test("job draft requires prior execution authorisation", () => {
    expect(() =>
      draftGovernedComputeJob({
        id: "hsi-exp-cej-ssc-il6-unauth",
        spec: seedSpec(),
        createdAt: asOf,
      }),
    ).toThrow(/requires execution authorisation/i);
  });
});
