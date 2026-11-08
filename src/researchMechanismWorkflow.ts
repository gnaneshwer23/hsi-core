/**
 * One complete RA/SSc research mechanism workflow contract.
 *
 * Orchestrates existing APIs; does not invent evidence, change pilot decisions,
 * auto-promote graph claims, or call generative models.
 */
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "./researchWorkspaceTestFixture";

export const RESEARCH_MECHANISM_WORKFLOW_SCHEMA = "hsi-research-mechanism-workflow-1" as const;
export const RESEARCH_MECHANISM_WORKFLOW_ID = "ra-ssc-mechanism-research-path-1" as const;

export const RESEARCH_MECHANISM_STEPS = [
  "ask_mechanism_question",
  "authorised_source_linked_evidence",
  "context_and_limitations",
  "support_vs_oppose",
  "multi_hop_mechanism",
  "uncertainty_and_review_status",
  "bounded_brief",
  "propose_claim_for_independent_review",
  "export_reproducible_package",
] as const;

export type ResearchMechanismStepId = (typeof RESEARCH_MECHANISM_STEPS)[number];

export type ResearchMechanismStep = {
  id: ResearchMechanismStepId;
  title: string;
  uiPath: string;
  apiPath: string | null;
  method: "GET" | "POST" | null;
  consumesBackend: true;
  hardCodedDemoContent: false;
  note: string;
};

export type ResearchMechanismWorkflow = {
  schemaVersion: typeof RESEARCH_MECHANISM_WORKFLOW_SCHEMA;
  workflowId: typeof RESEARCH_MECHANISM_WORKFLOW_ID;
  indicationScope: ["rheumatoid_arthritis", "systemic_sclerosis"];
  recordedPilotDecisionUnchanged: true;
  syntheticFixture: {
    investigationId: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId;
    honestyBanner: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner;
    label: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.label;
  };
  scientificAcceptance: "BLOCKED";
  groundedClaimAccepted: false;
  modelActivationAllowed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  legalBinding: false;
  steps: ResearchMechanismStep[];
};

export function buildResearchMechanismWorkflow(): ResearchMechanismWorkflow {
  const fixtureId = RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId;
  const workbench = `/research/decision-workbench?investigation=${fixtureId}`;
  const steps: ResearchMechanismStep[] = [
    {
      id: "ask_mechanism_question",
      title: "Ask a mechanism question",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Loads the authorised investigation question from the research API.",
    },
    {
      id: "authorised_source_linked_evidence",
      title: "Inspect authorised source-linked evidence",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Evidence traces stay bound to the persisted investigation release.",
    },
    {
      id: "context_and_limitations",
      title: "Surface context and limitations",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/graph-context`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Graph context capture remains release-aware; missing context stays missing.",
    },
    {
      id: "support_vs_oppose",
      title: "Separate support vs oppose",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Branch supporting/opposing traces remain distinct polarities.",
    },
    {
      id: "multi_hop_mechanism",
      title: "Follow multi-hop mechanism paths",
      uiPath: "/research/scientific-workbench",
      apiPath: "/api/research/graph/ssc",
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Mechanism traces use the authenticated SSc graph read path.",
    },
    {
      id: "uncertainty_and_review_status",
      title: "Record uncertainty and review status",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/outcome`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Outcome/uncertainty endpoints do not invent scientific approval.",
    },
    {
      id: "bounded_brief",
      title: "Assemble a bounded evidence brief",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/brief`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Brief delivery verifies package hashes before export/submit affordances.",
    },
    {
      id: "propose_claim_for_independent_review",
      title: "Propose claim for independent review",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/submit-review`,
      method: "POST",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "Submission creates a fixed package for a separate reviewer; no Gate C auto-approve.",
    },
    {
      id: "export_reproducible_package",
      title: "Export a reproducible package",
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/review-package`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      note: "JSON/Markdown downloads verify packageHash before returning bytes.",
    },
  ];

  return {
    schemaVersion: RESEARCH_MECHANISM_WORKFLOW_SCHEMA,
    workflowId: RESEARCH_MECHANISM_WORKFLOW_ID,
    indicationScope: ["rheumatoid_arthritis", "systemic_sclerosis"],
    recordedPilotDecisionUnchanged: true,
    syntheticFixture: {
      investigationId: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
      honestyBanner: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
      label: RESEARCH_WORKSPACE_TEST_FIXTURE.label,
    },
    scientificAcceptance: "BLOCKED",
    groundedClaimAccepted: false,
    modelActivationAllowed: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    legalBinding: false,
    steps,
  };
}

export function parseResearchMechanismWorkflow(value: unknown): ResearchMechanismWorkflow {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid research mechanism workflow");
  }
  const w = value as ResearchMechanismWorkflow;
  if (
    w.schemaVersion !== RESEARCH_MECHANISM_WORKFLOW_SCHEMA ||
    w.recordedPilotDecisionUnchanged !== true ||
    w.scientificAcceptance !== "BLOCKED" ||
    w.groundedClaimAccepted !== false ||
    w.modelActivationAllowed !== false ||
    w.graphPromotable !== false ||
    w.gateCAutoApprove !== false ||
    w.legalBinding !== false ||
    !Array.isArray(w.steps) ||
    w.steps.length !== RESEARCH_MECHANISM_STEPS.length ||
    w.steps.some((s) => s.consumesBackend !== true || s.hardCodedDemoContent !== false)
  ) {
    throw new Error("Research mechanism workflow honesty gates violated");
  }
  return w;
}
