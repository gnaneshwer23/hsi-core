/**
 * Milestone 17 / PR1 — scientific programme intelligence pack check.
 * Offline contracts only — no agent platform, auto-approval, or fabricated discoveries.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildScientificProgrammePack,
  draftProgrammeMilestone,
  draftResearchDecision,
  draftResearchProgramme,
  draftResearchWorkstream,
  projectScientificProgrammePersistenceLines,
  SCIENTIFIC_PROGRAMME_METHOD,
  SCIENTIFIC_PROGRAMME_SCHEMA,
  SCIENTIFIC_PROGRAMME_VERSION,
  transitionProgrammeMilestone,
  transitionResearchDecision,
  transitionResearchProgramme,
  transitionResearchWorkstream,
} from "../src/scientificProgrammeIntelligenceContracts";

const asOf = "2026-11-09T15:00:00.000Z";
const outDir = "evaluation/scientific-programme-intelligence";

function fixturePack() {
  const draft = draftResearchProgramme({
    id: "hsi-sp-prog-fixture-demo",
    name: "Fixture scientific programme",
    purpose:
      "Exercise programme / workstream / milestone / decision contracts without claiming discovery.",
    scopeSummary:
      "Engineering fixture only — not a separate agent platform and not autonomous closed-loop science.",
    authoredByPrincipalId: "fixture-agent-sp",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    investigationIds: ["inv-fixture-001"],
    hypothesisIds: ["hyp-fixture-001"],
    orgId: "org-fixture-1",
    therapeuticProgrammeId: "hsi-tx-prog-fixture-demo",
    translationalProgrammeId: "hsi-td-prog-ssc-tfh-fixture",
  });
  const underReview = transitionResearchProgramme({
    programme: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-sp", actorKind: "ai_agent"},
  });
  const programme = transitionResearchProgramme({
    programme: underReview,
    to: "active",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const workstreamDraft = draftResearchWorkstream({
    id: "hsi-sp-ws-fixture-demo",
    programme,
    name: "Fixture evidence workstream",
    objectiveSummary:
      "Propose public-evidence neighbourhoods for human review — not autonomous execution.",
    authoredByPrincipalId: "fixture-agent-sp",
    createdAt: asOf,
    investigationId: "inv-fixture-001",
  });
  const workstreamReviewed = transitionResearchWorkstream({
    workstream: workstreamDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-sp", actorKind: "ai_agent"},
  });
  const workstream = transitionResearchWorkstream({
    workstream: workstreamReviewed,
    to: "active",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const milestoneDraft = draftProgrammeMilestone({
    id: "hsi-sp-ms-fixture-demo",
    programme,
    workstream,
    name: "Fixture review milestone",
    exitCriteria:
      "Human review confirms uncertainties remain recorded — no fabricated discovery.",
    authoredByPrincipalId: "fixture-agent-sp",
    createdAt: asOf,
  });
  const milestoneInProgress = transitionProgrammeMilestone({
    milestone: milestoneDraft,
    to: "in_progress",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-sp", actorKind: "ai_agent"},
  });
  const milestoneAwaiting = transitionProgrammeMilestone({
    milestone: milestoneInProgress,
    to: "awaiting_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-sp", actorKind: "ai_agent"},
  });
  const milestone = transitionProgrammeMilestone({
    milestone: milestoneAwaiting,
    to: "accepted",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const decisionDraft = draftResearchDecision({
    id: "hsi-sp-dec-fixture-demo",
    programme,
    workstream,
    milestone,
    decisionKind: "milestone_acceptance",
    summary: "Accept fixture milestone after human review — engineering only.",
    rationale:
      "Contract exercise confirming proposing agents are barred from acceptance and independent review differs.",
    authoredByPrincipalId: "fixture-agent-sp",
    createdAt: asOf,
    subjectRefs: ["inv-fixture-001"],
  });
  const decisionReviewed = transitionResearchDecision({
    decision: decisionDraft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-sp", actorKind: "ai_agent"},
  });
  const decision = transitionResearchDecision({
    decision: decisionReviewed,
    to: "accepted",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
    independentReviewer: {
      principalId: "fixture-reviewer",
      actorKind: "human",
    },
  });

  const pack = buildScientificProgrammePack({
    programmes: [programme],
    workstreams: [workstream],
    milestones: [milestone],
    decisions: [decision],
    asOf,
  });
  const persistenceLines = projectScientificProgrammePersistenceLines({
    programme,
    workstreams: [workstream],
    milestones: [milestone],
    decisions: [decision],
  });

  return {pack, persistenceLines};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines} = fixturePack();
  writeFileSync(
    join(outDir, "scientific-programme-intelligence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: SCIENTIFIC_PROGRAMME_SCHEMA,
        method: SCIENTIFIC_PROGRAMME_METHOD,
        version: SCIENTIFIC_PROGRAMME_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        notSeparateAgentPlatform: true,
        noAutoApprovalOfPlansOrClaims: true,
        noFabricatedDiscoveries: true,
        agentsMustNotApproveOwnFindings: true,
        workbenchUi: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        persistenceLineCount: persistenceLines.length,
        persistenceLines,
      },
      null,
      2,
    )}\n`,
  );
}

const checkOnly = process.argv.includes("--check");
if (checkOnly) {
  const {pack} = fixturePack();
  if (
    pack.programmeCount !== 1 ||
    pack.workstreamCount !== 1 ||
    pack.milestoneCount !== 1 ||
    pack.decisionCount !== 1
  ) {
    throw new Error("Scientific programme pack check failed");
  }
  if (pack.honesty.notSeparateAgentPlatform !== true) {
    throw new Error("Honesty gate failed");
  }
  if (pack.honesty.noFabricatedDiscoveries !== true) {
    throw new Error("Fabricated discovery gate failed");
  }
  console.log("scientific-programme-intelligence contracts check ok");
} else {
  writeOutputs();
  console.log(`wrote ${outDir}`);
}
