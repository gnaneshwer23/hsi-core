/**
 * Browser-safe R3 Connected Research Workbench journey contract.
 * Ask → retrieve → investigate → verify → review → export via real APIs.
 * No Node fs; site UI may import this module.
 */
import {
  RESEARCH_MECHANISM_STEPS,
  RESEARCH_MECHANISM_WORKFLOW_ID,
  RESEARCH_MECHANISM_WORKFLOW_SCHEMA,
  buildResearchMechanismWorkflow,
  type ResearchMechanismStepId,
} from "./researchMechanismWorkflow";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "./researchWorkspaceTestFixture";

export const R3_JOURNEY_STAGES = [
  "ask",
  "retrieve",
  "investigate",
  "verify",
  "review",
  "export",
] as const;

export type R3JourneyStageId = (typeof R3_JOURNEY_STAGES)[number];

export type R3JourneyStage = {
  id: R3JourneyStageId;
  title: string;
  order: number;
  uiPath: string;
  apiPath: string;
  method: "GET" | "POST";
  consumesBackend: true;
  hardCodedDemoContent: false;
  inspectablePassages: boolean;
  passageSourceHint: string;
  mechanismStepIds: ResearchMechanismStepId[];
  note: string;
};

export type R3ConnectedWorkbenchJourney = {
  schemaVersion: "hsi-r3-connected-research-workbench-journey-1";
  phase: "R3";
  roadmapPhase: "connected_research_workbench";
  recordedPilotDecisionUnchanged: true;
  scientificAcceptance: "BLOCKED";
  researcherJourneyCompleteClaimed: false;
  productionReadyClaimed: false;
  writesEnabledClaimed: false;
  gateCAutoApprove: false;
  legalBinding: false;
  inventPassagesPermitted: false;
  syntheticFixture: {
    investigationId: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId;
    honestyBanner: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner;
    label: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.label;
  };
  mechanismWorkflow: {
    schemaVersion: typeof RESEARCH_MECHANISM_WORKFLOW_SCHEMA;
    workflowId: typeof RESEARCH_MECHANISM_WORKFLOW_ID;
    stepCount: typeof RESEARCH_MECHANISM_STEPS.length;
  };
  stages: R3JourneyStage[];
};

export function buildR3JourneyStages(
  fixtureId: string = RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
): R3JourneyStage[] {
  const workbench = `/research/decision-workbench?investigation=${fixtureId}`;
  return [
    {
      id: "ask",
      title: "Ask",
      order: 1,
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      inspectablePassages: false,
      passageSourceHint: "Question + branch plan from authenticated investigation record.",
      mechanismStepIds: ["ask_mechanism_question"],
      note: "Loads the authorised investigation question from the research API.",
    },
    {
      id: "retrieve",
      title: "Retrieve",
      order: 2,
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/graph-context`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      inspectablePassages: true,
      passageSourceHint:
        "Passages under context.primary.bundle.passages (locator + sha256 + text when captured).",
      mechanismStepIds: ["authorised_source_linked_evidence", "context_and_limitations"],
      note: "Release-bound graph context carries inspectable source passages when captured.",
    },
    {
      id: "investigate",
      title: "Investigate",
      order: 3,
      uiPath: "/research/scientific-workbench",
      apiPath: "/api/research/graph/ssc",
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      inspectablePassages: false,
      passageSourceHint: "Mechanism graph edges + support/oppose polarity from authenticated reads.",
      mechanismStepIds: ["support_vs_oppose", "multi_hop_mechanism"],
      note: "Support vs oppose and multi-hop mechanism use authenticated SSc graph reads.",
    },
    {
      id: "verify",
      title: "Verify",
      order: 4,
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/outcome`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      inspectablePassages: true,
      passageSourceHint: "Outcome passages[] with text, locator, and sha256 when package is bound.",
      mechanismStepIds: ["uncertainty_and_review_status", "bounded_brief"],
      note: "Outcome/brief endpoints verify package hashes; missing evidence stays missing.",
    },
    {
      id: "review",
      title: "Review",
      order: 5,
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/submit-review`,
      method: "POST",
      consumesBackend: true,
      hardCodedDemoContent: false,
      inspectablePassages: false,
      passageSourceHint: "Independent reviewer path; no Gate C auto-approve.",
      mechanismStepIds: ["propose_claim_for_independent_review"],
      note: "Submission creates a fixed package for a separate reviewer; POST not auto-fired by probe.",
    },
    {
      id: "export",
      title: "Export",
      order: 6,
      uiPath: workbench,
      apiPath: `/api/research/interrogative/${fixtureId}/review-package`,
      method: "GET",
      consumesBackend: true,
      hardCodedDemoContent: false,
      inspectablePassages: true,
      passageSourceHint:
        "Review package context.primary.bundle.passages — verified before download bytes.",
      mechanismStepIds: ["export_reproducible_package"],
      note: "JSON/Markdown downloads verify packageHash before returning bytes.",
    },
  ];
}

export function buildR3ConnectedWorkbenchJourney(): R3ConnectedWorkbenchJourney {
  const workflow = buildResearchMechanismWorkflow();
  return {
    schemaVersion: "hsi-r3-connected-research-workbench-journey-1",
    phase: "R3",
    roadmapPhase: "connected_research_workbench",
    recordedPilotDecisionUnchanged: true,
    scientificAcceptance: "BLOCKED",
    researcherJourneyCompleteClaimed: false,
    productionReadyClaimed: false,
    writesEnabledClaimed: false,
    gateCAutoApprove: false,
    legalBinding: false,
    inventPassagesPermitted: false,
    syntheticFixture: {
      investigationId: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
      honestyBanner: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
      label: RESEARCH_WORKSPACE_TEST_FIXTURE.label,
    },
    mechanismWorkflow: {
      schemaVersion: workflow.schemaVersion,
      workflowId: workflow.workflowId,
      stepCount: RESEARCH_MECHANISM_STEPS.length,
    },
    stages: buildR3JourneyStages(),
  };
}

export function parseR3ConnectedWorkbenchJourney(value: unknown): R3ConnectedWorkbenchJourney {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid R3 connected workbench journey");
  }
  const j = value as R3ConnectedWorkbenchJourney;
  if (
    j.schemaVersion !== "hsi-r3-connected-research-workbench-journey-1" ||
    j.recordedPilotDecisionUnchanged !== true ||
    j.scientificAcceptance !== "BLOCKED" ||
    j.researcherJourneyCompleteClaimed !== false ||
    j.productionReadyClaimed !== false ||
    j.writesEnabledClaimed !== false ||
    j.gateCAutoApprove !== false ||
    j.legalBinding !== false ||
    j.inventPassagesPermitted !== false ||
    !Array.isArray(j.stages) ||
    j.stages.length !== R3_JOURNEY_STAGES.length ||
    j.stages.some((s) => s.consumesBackend !== true || s.hardCodedDemoContent !== false)
  ) {
    throw new Error("R3 connected workbench journey honesty gates violated");
  }
  return j;
}

/** Extract inspectable passage previews from authenticated API JSON (never invent). */
export function extractInspectablePassages(payload: unknown): Array<{
  id: string;
  locator: string | null;
  sha256: string | null;
  textPreview: string | null;
  source: string;
}> {
  const out: Array<{
    id: string;
    locator: string | null;
    sha256: string | null;
    textPreview: string | null;
    source: string;
  }> = [];
  const pushPassage = (p: unknown, source: string) => {
    if (!p || typeof p !== "object" || Array.isArray(p)) return;
    const row = p as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : null;
    if (!id) return;
    const text = typeof row.text === "string" ? row.text : null;
    out.push({
      id,
      locator: typeof row.locator === "string" ? row.locator : null,
      sha256: typeof row.sha256 === "string" ? row.sha256 : null,
      textPreview: text ? text.slice(0, 280) : null,
      source,
    });
  };
  if (!payload || typeof payload !== "object") return out;
  const root = payload as Record<string, unknown>;

  if (Array.isArray(root.passages)) {
    for (const p of root.passages) pushPassage(p, "outcome.passages");
  }

  const context = root.context as Record<string, unknown> | undefined;
  const primary = (context?.primary ?? root.primary) as Record<string, unknown> | undefined;
  const bundle = primary?.bundle as Record<string, unknown> | undefined;
  if (Array.isArray(bundle?.passages)) {
    for (const p of bundle.passages) pushPassage(p, "graph-context.primary.bundle.passages");
  }

  return out.slice(0, 12);
}
