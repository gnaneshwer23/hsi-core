/**
 * Milestone 6 PR1 — investigation orchestration contracts honesty.
 */
import {describe, expect, test} from "bun:test";
import {BOUNDED_STAGE_IDS} from "../src/evidence/boundedAgentExecution";
import {
  INVESTIGATION_BOUNDED_STAGE_IDS,
  M6_PR1_CAPABILITY_REGISTRY_IDS,
  bindContractToBoundedAgentInvestigation,
  buildInvestigationOrchestrationPack,
  canTransitionInvestigationState,
  draftScientificInvestigation,
  projectInvestigationContractPersistenceLines,
  projectToInterrogativeState,
  projectToResearchWorkbenchStatus,
  transitionInvestigationState,
  validateScientificInvestigationContract,
} from "../src/evidence/investigationOrchestrationContracts";
import {integrateResearchBrief} from "../src/evidence/researchBriefIntegration";

const asOf = "2026-11-09T12:00:00.000Z";

describe("investigation orchestration contracts (M6 PR1)", () => {
  test("bounded stage ids stay aligned with executor list", () => {
    expect([...INVESTIGATION_BOUNDED_STAGE_IDS]).toEqual([...BOUNDED_STAGE_IDS]);
  });

  test("drafts a contract with resume pointers and honesty gates", () => {
    const contract = draftScientificInvestigation({
      investigationId: "hsi-inv-m6-pr1-demo",
      question: "How does IL-21 signalling relate to SSc Tfh biology in curated packs?",
      domain: "ssc_tfh_il21",
      createdAt: asOf,
      entities: [{kind: "gene", id: "IL21", label: "IL-21"}],
      objectives: [
        {
          id: "obj-1",
          text: "Assemble an investigation contract for orchestration (no planner yet).",
          hypothesisId: null,
        },
      ],
      sources: [{kind: "pmid", value: "19180481", claimSupport: "not_assessed"}],
    });

    expect(contract.status).toBe("draft");
    expect(contract.planVersion).toBe(0);
    expect(contract.resume.usesExistingDurableCheckpoints).toBe(true);
    expect(contract.resume.parallelCheckpointStoreInvented).toBe(false);
    expect(contract.resume.boundedStageIds).toEqual([...BOUNDED_STAGE_IDS]);
    expect(contract.honesty.plannerNotImplemented).toBe(true);
    expect(contract.honesty.routerNotImplemented).toBe(true);
    expect(contract.honesty.gateCAutoApprove).toBe(false);
    expect(contract.honesty.liveSscE2eSuccessClaimed).toBe(false);
    expect(contract.honesty.scientificApproval).toBe(false);
    expect(contract.projections.interrogativeState).toBe("draft");
    expect(contract.projections.boundedAgentBound).toBe(true);
    expect(contract.reviewCheckpoints.every((c) => c.required && !c.gateCAutoApprove)).toBe(true);
    validateScientificInvestigationContract(contract);
  });

  test("fail-closed transitions and researcher approval before running", () => {
    let contract = draftScientificInvestigation({
      investigationId: "hsi-inv-m6-transitions",
      question: "Orchestration state machine honesty check",
      createdAt: asOf,
    });

    expect(canTransitionInvestigationState("draft", "completed")).toBe(false);
    expect(canTransitionInvestigationState("draft", "planning")).toBe(true);

    contract = transitionInvestigationState(contract, "planning", {updatedAt: asOf});
    contract = transitionInvestigationState(contract, "awaiting_researcher_approval", {
      updatedAt: asOf,
    });

    expect(() =>
      transitionInvestigationState(contract, "running", {updatedAt: asOf}),
    ).toThrow(/Researcher approval/);

    contract = transitionInvestigationState(contract, "running", {
      updatedAt: asOf,
      satisfyReviewCheckpointId: "cp-researcher-approval",
      lastCompletedCheckpointTaskId: "investigation-plan",
    });
    expect(contract.status).toBe("running");
    expect(contract.resume.lastCompletedCheckpointTaskId).toBe("investigation-plan");
    expect(projectToInterrogativeState(contract.status)).toBe("draft");

    contract = transitionInvestigationState(contract, "awaiting_scientific_review", {
      updatedAt: asOf,
    });
    expect(projectToInterrogativeState(contract.status)).toBe("awaiting_scientific_review");

    expect(() =>
      transitionInvestigationState(contract, "completed", {updatedAt: asOf}),
    ).toThrow(/scientific_review/);

    contract = transitionInvestigationState(contract, "completed_with_limitations", {
      updatedAt: asOf,
      note: "Limitations retained; scientific review still pending — not live SSc E2E success.",
    });
    expect(contract.status).toBe("completed_with_limitations");
    expect(projectToInterrogativeState(contract.status)).toBe("reviewed");
    expect(projectToResearchWorkbenchStatus(contract.status, null)).toBe("insufficient_evidence");
    expect(canTransitionInvestigationState(contract.status, "running")).toBe(false);
  });

  test("completed path requires satisfied scientific review", () => {
    let contract = draftScientificInvestigation({
      investigationId: "hsi-inv-m6-complete",
      question: "Complete with review gate",
      createdAt: asOf,
    });
    contract = transitionInvestigationState(contract, "planning", {updatedAt: asOf});
    contract = transitionInvestigationState(contract, "awaiting_researcher_approval", {
      updatedAt: asOf,
    });
    contract = transitionInvestigationState(contract, "running", {
      updatedAt: asOf,
      satisfyReviewCheckpointId: "cp-researcher-approval",
    });
    contract = transitionInvestigationState(contract, "awaiting_scientific_review", {
      updatedAt: asOf,
    });
    contract = transitionInvestigationState(contract, "completed", {
      updatedAt: asOf,
      satisfyReviewCheckpointId: "cp-scientific-review",
    });
    expect(contract.status).toBe("completed");
    expect(contract.reviewCheckpoints.find((c) => c.kind === "scientific_review")?.status).toBe(
      "satisfied",
    );
  });

  test("bindContract refuses dual investigation identities", () => {
    const contract = draftScientificInvestigation({
      investigationId: "hsi-inv-m6-bind",
      question: "Bind to bounded agent id",
      createdAt: asOf,
    });
    expect(bindContractToBoundedAgentInvestigation(contract, "hsi-inv-m6-bind").investigationId).toBe(
      "hsi-inv-m6-bind",
    );
    expect(() => bindContractToBoundedAgentInvestigation(contract, "other-id")).toThrow(/equal/);
  });

  test("pack lists capability registry ids and persistence lines", () => {
    const contract = draftScientificInvestigation({
      investigationId: "hsi-inv-m6-pack",
      question: "Pack projection",
      createdAt: asOf,
    });
    const pack = buildInvestigationOrchestrationPack({contracts: [contract], generatedAt: asOf});
    expect(pack.capabilityRegistryIds).toEqual([...M6_PR1_CAPABILITY_REGISTRY_IDS]);
    expect(pack.honesty.plannerNotImplemented).toBe(true);
    const lines = projectInvestigationContractPersistenceLines(contract);
    expect(lines.some((l) => l.includes("status=draft"))).toBe(true);
    expect(lines.some((l) => l.includes("planner=not_implemented"))).toBe(true);
  });

  test("thin research-brief bind surfaces investigation summary without claiming planner", () => {
    const contract = draftScientificInvestigation({
      investigationId: "hsi-inv-m6-brief",
      question: "Brief bind for M6 contract",
      createdAt: asOf,
    });
    const brief = integrateResearchBrief({
      question: contract.question,
      investigationContract: contract,
    });
    expect(brief.investigationSummary?.investigationId).toBe("hsi-inv-m6-brief");
    expect(brief.investigationSummary?.plannerNotImplemented).toBe(true);
    expect(brief.investigationSummary?.routerNotImplemented).toBe(true);
    expect(brief.investigationSummary?.liveSscE2eSuccessClaimed).toBe(false);
    expect(brief.investigationSummary?.gateCAutoApprove).toBe(false);
    expect(brief.gateCAutoApprove).toBe(false);
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.limitations.some((l) => /M6 investigation contract/i.test(l))).toBe(true);
  });
});
