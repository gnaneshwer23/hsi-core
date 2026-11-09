/**
 * Milestone 10 / PR1 — experimental lifecycle pack check.
 * Offline contracts only — does not invent lab runs, observations, or closed-loop claims.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  bindProposalToProtocol,
  buildExperimentalLifecyclePack,
  draftExperimentExecution,
  draftExperimentProposal,
  draftExperimentProtocolVersion,
  draftExperimentalResult,
  EXPERIMENTAL_LIFECYCLE_METHOD,
  EXPERIMENTAL_LIFECYCLE_SCHEMA,
  EXPERIMENTAL_LIFECYCLE_VERSION,
  projectExperimentalLifecyclePersistenceLines,
  transitionExperimentProposal,
} from "../src/experimentalLifecycleContracts";

const asOf = "2026-11-09T14:00:00.000Z";
const outDir = "evaluation/experimental-lifecycle";

function fixturePack() {
  const draft = draftExperimentProposal({
    id: "hsi-exp-prop-fixture-demo",
    title: "Fixture experimental lifecycle demo",
    rationale:
      "Engineering fixture demonstrating proposal → protocol → execution → result layers.",
    falsifier:
      "If no authorised observation is attached, experimental validation remains not established.",
    proposedByPrincipalId: "fixture-agent-designer",
    proposedByActorKind: "ai_agent",
    createdAt: asOf,
    hypothesisIds: ["hyp-fixture-001"],
    investigationId: "inv-fixture-001",
    n7ExperimentRecordIds: ["EXP-N7-001"],
  });

  const submitted = transitionExperimentProposal({
    proposal: draft,
    to: "submitted_for_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-designer", actorKind: "ai_agent"},
  });
  const approved = transitionExperimentProposal({
    proposal: submitted,
    to: "researcher_approved",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const protocol = draftExperimentProtocolVersion({
    protocolId: "hsi-exp-prot-fixture-demo",
    protocolVersion: 1,
    title: "Fixture protocol v1",
    objective: "Declare procedure steps without wet-lab claims.",
    procedureSteps: [
      "Freeze prediction before outcome (N7).",
      "Record fixture-only artifacts.",
    ],
    controls: ["fixture_control"],
    lifecycle: "active",
    createdAt: asOf,
    createdByPrincipalId: "fixture-researcher",
  });

  const proposal = bindProposalToProtocol({
    proposal: approved,
    protocol,
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const execution = draftExperimentExecution({
    id: "hsi-exp-exec-fixture-demo",
    proposal,
    protocol,
    createdAt: asOf,
    lifecycle: "completed_fixture",
  });

  const raw = draftExperimentalResult({
    id: "hsi-exp-res-fixture-raw",
    execution,
    layer: "raw_observation",
    summary: "Fixture raw observation pointer — not live lab data.",
    artifactPointers: ["fixture://experimental-lifecycle/raw-1"],
    createdAt: asOf,
    createdByPrincipalId: "fixture-researcher",
  });
  const derived = draftExperimentalResult({
    id: "hsi-exp-res-fixture-derived",
    execution,
    layer: "derived_result",
    summary: "Fixture derived result from declared raw pointer.",
    dependsOnResultIds: [raw.id],
    createdAt: asOf,
    createdByPrincipalId: "fixture-researcher",
  });
  const interpretation = draftExperimentalResult({
    id: "hsi-exp-res-fixture-interp",
    execution,
    layer: "interpretation",
    summary: "Fixture interpretation — not graph-promotable.",
    dependsOnResultIds: [derived.id],
    createdAt: asOf,
    createdByPrincipalId: "fixture-researcher",
  });

  return {proposal, protocol, execution, results: [raw, derived, interpretation]};
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const {proposal, protocol, execution, results} = fixturePack();
  const pack = buildExperimentalLifecyclePack({
    proposals: [proposal],
    protocols: [protocol],
    executions: [execution],
    results,
    asOf,
  });
  const status = {
    schema: EXPERIMENTAL_LIFECYCLE_SCHEMA,
    method: EXPERIMENTAL_LIFECYCLE_METHOD,
    version: EXPERIMENTAL_LIFECYCLE_VERSION,
    asOf,
    proposalCount: pack.proposalCount,
    protocolCount: pack.protocolCount,
    executionCount: pack.executionCount,
    resultCount: pack.resultCount,
    migration: "deferred",
    neon: "red-wave-only",
    honesty: pack.honesty,
    persistenceLines: projectExperimentalLifecyclePersistenceLines({
      proposal,
      protocol,
      execution,
      results,
    }),
  };

  if (!checkOnly) {
    mkdirSync(outDir, {recursive: true});
    writeFileSync(join(outDir, "STATUS.json"), `${JSON.stringify(status, null, 2)}\n`);
    writeFileSync(
      join(outDir, "lifecycle-pack.v1.json"),
      `${JSON.stringify(pack, null, 2)}\n`,
    );
  }

  if (pack.honesty.closedLoopDiscoveryComplete) {
    throw Error("Closed-loop claim must stay false");
  }
  if (pack.honesty.fabricatedObservations) {
    throw Error("Fabricated observations must stay false");
  }
  if (pack.honesty.labInstrumentControl) {
    throw Error("Lab instrument control must stay false");
  }
  if (pack.honesty.aiCannotSelfApproveExperiments !== true) {
    throw Error("AI self-approve honesty required");
  }
  console.log(
    checkOnly
      ? `experimental-lifecycle-contracts check ok (${pack.proposalCount} proposals, ${pack.resultCount} results)`
      : `wrote ${outDir} (${pack.proposalCount} proposals, ${pack.resultCount} results)`,
  );
}

main();
