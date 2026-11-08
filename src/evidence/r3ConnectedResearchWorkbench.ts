/**
 * Roadmap R3 — Connected Research Workbench (eng deepen).
 *
 * Ask → retrieve → investigate → verify → review → export via existing
 * authenticated research APIs + synthetic fixture. UI must consume real
 * backend responses (no hard-coded scientific output). Does not invent
 * SME gold, MoU, Gate C auto-approve, CDS/PHI, or autumn-snow writes.
 */
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  RESEARCH_MECHANISM_STEPS,
  RESEARCH_MECHANISM_WORKFLOW_ID,
  RESEARCH_MECHANISM_WORKFLOW_SCHEMA,
  buildResearchMechanismWorkflow,
  parseResearchMechanismWorkflow,
  type ResearchMechanismWorkflow,
} from "../researchMechanismWorkflow";
import {
  R3_JOURNEY_STAGES,
  buildR3JourneyStages,
  extractInspectablePassages,
  type R3JourneyStage,
  type R3JourneyStageId,
} from "../researchConnectedWorkbench";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../researchWorkspaceTestFixture";

export {
  R3_JOURNEY_STAGES,
  extractInspectablePassages,
  type R3JourneyStage,
  type R3JourneyStageId,
};

export const R3_WORKBENCH_JOURNEY_SCHEMA = "hsi-r3-connected-research-workbench-1" as const;
export const R3_WORKBENCH_VERSION = "1.0.0" as const;
export const R3_PROGRAMME = "connected_research_workbench" as const;

export type R3CheckStatus = "CLEARED" | "BLOCKED" | "PENDING_HUMAN" | "NO_GO";

export type R3CheckId =
  | "mechanism_workflow_bound"
  | "six_stage_journey_mapped"
  | "real_api_paths_bound"
  | "synthetic_fixture_honesty_preserved"
  | "inspectable_passage_contract"
  | "ui_consumes_backend_only"
  | "r3_checklist_published"
  | "recorded_pilot_decision_unchanged"
  | "authenticated_session_required"
  | "production_writes_not_claimed"
  | "scientific_acceptance_human"
  | "partner_pilot_usefulness";

export type R3Check = {
  id: R3CheckId;
  title: string;
  plane: "engineering" | "human";
  status: R3CheckStatus;
  evidence: string;
};

export type R3ConnectedResearchWorkbench = {
  schemaVersion: typeof R3_WORKBENCH_JOURNEY_SCHEMA;
  phase: "R3";
  programme: typeof R3_PROGRAMME;
  roadmapPhase: "connected_research_workbench";
  workbenchVersion: typeof R3_WORKBENCH_VERSION;
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  scientificAcceptance: "BLOCKED";
  rightsAcceptance: "BLOCKED";
  researcherJourneyCompleteClaimed: false;
  productionReadyClaimed: false;
  writesEnabledClaimed: false;
  modelActivationAllowed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  legalBinding: false;
  inventPassagesPermitted: false;
  containsPhi: false;
  recordedPilotDecisionUnchanged: true;
  indicationScope: ["rheumatoid_arthritis", "systemic_sclerosis"];
  syntheticFixture: {
    investigationId: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId;
    honestyBanner: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner;
    label: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.label;
    releaseId: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId;
  };
  mechanismWorkflow: {
    schemaVersion: typeof RESEARCH_MECHANISM_WORKFLOW_SCHEMA;
    workflowId: typeof RESEARCH_MECHANISM_WORKFLOW_ID;
    stepCount: typeof RESEARCH_MECHANISM_STEPS.length;
    workflowHash: string;
  };
  honesty: {
    noHardCodedScientificOutput: true;
    uiMustConsumeBackendResponses: true;
    syntheticFixtureIsNotScientificGold: true;
    inspectablePassagesFromBackendOnly: true;
    scientificAcceptanceBlocked: true;
    noGateCAutoApprove: true;
    noInventedMoU: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
    humanQueueParked: true;
    productionWritesNotClaimed: true;
  };
  exitShapeScaffold: {
    section: "roadmap_r3";
    targetExit: "researcher_completes_journey_on_authenticated_apis";
    stagesDocumented: typeof R3_JOURNEY_STAGES;
    currentStage: "ask";
    researcherJourneyCompleteClaimed: false;
    scientificAcceptance: "BLOCKED";
  };
  stages: R3JourneyStage[];
  checks: R3Check[];
  humanMustSupply: string[];
  codeCanAutomate: string[];
  summary: {
    stageCount: 6;
    apiBoundStages: 6;
    inspectablePassageStages: number;
    mechanismStepsBound: typeof RESEARCH_MECHANISM_STEPS.length;
    hardCodedDemoContent: 0;
    researcherJourneyCompleteClaimed: false;
    scientificAcceptance: "BLOCKED";
    rightsAcceptance: "BLOCKED";
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    humanChecksPending: number;
    humanChecksTotal: number;
  };
  residualHumanSteps: string[];
  parkedHumanResiduals: ["#2 N1 rights", "#3 cite HITL", "#4 SMEs", "#5 staging", "#8 MoU"];
  stopNote: string;
  inventoryHash: string;
};

export class R3ConnectedResearchWorkbenchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "R3ConnectedResearchWorkbenchError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(
  body: Omit<R3ConnectedResearchWorkbench, "inventoryHash">,
): R3ConnectedResearchWorkbench {
  return {...body, inventoryHash: digest(body)};
}

function checklistPresent(repoRoot: string): boolean {
  return existsSync(
    resolve(repoRoot, "docs/engineering/R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md"),
  );
}

function buildChecks(input: {
  workflow: ResearchMechanismWorkflow;
  stages: R3JourneyStage[];
  checklistPublished: boolean;
}): R3Check[] {
  const allStepsBound = RESEARCH_MECHANISM_STEPS.every((id) =>
    input.stages.some((s) => s.mechanismStepIds.includes(id)),
  );
  const apiBound = input.stages.every(
    (s) =>
      s.consumesBackend === true &&
      s.hardCodedDemoContent === false &&
      s.apiPath.startsWith("/api/research/") &&
      (s.method === "GET" || s.method === "POST"),
  );
  const passageStages = input.stages.filter((s) => s.inspectablePassages).length;
  return [
    {
      id: "mechanism_workflow_bound",
      title: "PR #62 mechanism workflow bound without changing pilot decision",
      plane: "engineering",
      status:
        input.workflow.recordedPilotDecisionUnchanged === true &&
        input.workflow.workflowId === RESEARCH_MECHANISM_WORKFLOW_ID
          ? "CLEARED"
          : "BLOCKED",
      evidence: `workflowId=${input.workflow.workflowId}; recordedPilotDecisionUnchanged=${String(input.workflow.recordedPilotDecisionUnchanged)}`,
    },
    {
      id: "six_stage_journey_mapped",
      title: "Ask→retrieve→investigate→verify→review→export mapped",
      plane: "engineering",
      status:
        input.stages.length === 6 &&
        input.stages.every((s, i) => s.id === R3_JOURNEY_STAGES[i] && s.order === i + 1) &&
        allStepsBound
          ? "CLEARED"
          : "BLOCKED",
      evidence: `stages=${input.stages.map((s) => s.id).join("→")}; mechanismStepsBound=${String(allStepsBound)}`,
    },
    {
      id: "real_api_paths_bound",
      title: "Every stage binds a real /api/research/* path",
      plane: "engineering",
      status: apiBound ? "CLEARED" : "BLOCKED",
      evidence: input.stages.map((s) => `${s.method} ${s.apiPath}`).join(" · "),
    },
    {
      id: "synthetic_fixture_honesty_preserved",
      title: "Synthetic fixture honesty banner preserved",
      plane: "engineering",
      status:
        input.workflow.syntheticFixture.honestyBanner ===
          RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner &&
        input.workflow.syntheticFixture.investigationId ===
          RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId
          ? "CLEARED"
          : "BLOCKED",
      evidence: input.workflow.syntheticFixture.honestyBanner,
    },
    {
      id: "inspectable_passage_contract",
      title: "Inspectable passage stages documented (backend-sourced only)",
      plane: "engineering",
      status: passageStages >= 3 ? "CLEARED" : "BLOCKED",
      evidence: `${passageStages} stages mark inspectablePassages=true; inventPassagesPermitted=false`,
    },
    {
      id: "ui_consumes_backend_only",
      title: "UI contract forbids hard-coded demo content",
      plane: "engineering",
      status: input.stages.every((s) => s.hardCodedDemoContent === false) ? "CLEARED" : "BLOCKED",
      evidence: "All stages hardCodedDemoContent=false; probes must fetch /api/research/*",
    },
    {
      id: "r3_checklist_published",
      title: "Operator checklist published",
      plane: "engineering",
      status: input.checklistPublished ? "CLEARED" : "BLOCKED",
      evidence: "docs/engineering/R3_CONNECTED_RESEARCH_WORKBENCH_CHECKLIST.md",
    },
    {
      id: "recorded_pilot_decision_unchanged",
      title: "Recorded RA/SSc pilot decision unchanged",
      plane: "engineering",
      status: input.workflow.recordedPilotDecisionUnchanged === true ? "CLEARED" : "BLOCKED",
      evidence: "recordedPilotDecisionUnchanged=true; packages remain RA/SSc scoped",
    },
    {
      id: "authenticated_session_required",
      title: "Authenticated researcher session required for live journey",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Endpoints return 401/403 without verified research session (#5 staging residual).",
    },
    {
      id: "production_writes_not_claimed",
      title: "Production writesEnabled remains unclaimed",
      plane: "human",
      status: "NO_GO",
      evidence: "writesEnabledClaimed=false; production writes stay disabled until #5 clears.",
    },
    {
      id: "scientific_acceptance_human",
      title: "Scientific acceptance of journey outputs",
      plane: "human",
      status: "BLOCKED",
      evidence: "scientificAcceptance=BLOCKED until SME review / partner usefulness (#4/#8).",
    },
    {
      id: "partner_pilot_usefulness",
      title: "External researcher completes journey usefulness",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Exit gate needs authenticated researcher completion — not inventable by eng.",
    },
  ];
}

export async function buildR3ConnectedResearchWorkbench(input: {
  generatedAt: string;
  repoRoot: string;
}): Promise<R3ConnectedResearchWorkbench> {
  const root = input.repoRoot;
  const workflow = parseResearchMechanismWorkflow(buildResearchMechanismWorkflow());
  const stages = buildR3JourneyStages(RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId);
  const checks = buildChecks({
    workflow,
    stages,
    checklistPublished: checklistPresent(root),
  });
  const eng = checks.filter((c) => c.plane === "engineering");
  const human = checks.filter((c) => c.plane === "human");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const humanPending = human.filter(
    (c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED",
  ).length;

  if (engCleared !== eng.length) {
    throw new R3ConnectedResearchWorkbenchError(
      "Engineering R3 checks must all CLEARED before writing artifact",
    );
  }
  if (humanPending !== human.length) {
    throw new R3ConnectedResearchWorkbenchError(
      "Human R3 checks must remain PENDING_HUMAN/NO_GO/BLOCKED",
    );
  }

  const inspectablePassageStages = stages.filter((s) => s.inspectablePassages).length;
  const workflowHash = digest(workflow);

  return seal({
    schemaVersion: R3_WORKBENCH_JOURNEY_SCHEMA,
    phase: "R3",
    programme: R3_PROGRAMME,
    roadmapPhase: "connected_research_workbench",
    workbenchVersion: R3_WORKBENCH_VERSION,
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    researcherJourneyCompleteClaimed: false,
    productionReadyClaimed: false,
    writesEnabledClaimed: false,
    modelActivationAllowed: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    legalBinding: false,
    inventPassagesPermitted: false,
    containsPhi: false,
    recordedPilotDecisionUnchanged: true,
    indicationScope: ["rheumatoid_arthritis", "systemic_sclerosis"],
    syntheticFixture: {
      investigationId: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
      honestyBanner: RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner,
      label: RESEARCH_WORKSPACE_TEST_FIXTURE.label,
      releaseId: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId,
    },
    mechanismWorkflow: {
      schemaVersion: RESEARCH_MECHANISM_WORKFLOW_SCHEMA,
      workflowId: RESEARCH_MECHANISM_WORKFLOW_ID,
      stepCount: RESEARCH_MECHANISM_STEPS.length,
      workflowHash,
    },
    honesty: {
      noHardCodedScientificOutput: true,
      uiMustConsumeBackendResponses: true,
      syntheticFixtureIsNotScientificGold: true,
      inspectablePassagesFromBackendOnly: true,
      scientificAcceptanceBlocked: true,
      noGateCAutoApprove: true,
      noInventedMoU: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
      humanQueueParked: true,
      productionWritesNotClaimed: true,
    },
    exitShapeScaffold: {
      section: "roadmap_r3",
      targetExit: "researcher_completes_journey_on_authenticated_apis",
      stagesDocumented: R3_JOURNEY_STAGES,
      currentStage: "ask",
      researcherJourneyCompleteClaimed: false,
      scientificAcceptance: "BLOCKED",
    },
    stages,
    checks,
    humanMustSupply: [
      "Verified researcher session to walk Ask→export on live authenticated APIs (#5).",
      "Do not claim production writesEnabled=true from this eng deepen.",
      "Scientific acceptance of mechanism answers remains human (#4 SME / partner review).",
      "Partner usefulness / external pilot findings remain human (#8 MoU — never invent).",
      "Rights-cleared passage corpus expansion remains parked (#2).",
    ],
    codeCanAutomate: [
      "Bind PR #62 mechanism workflow + synthetic fixture into versioned R3 journey.",
      "Map six stages onto existing /api/research/* interrogative + graph endpoints.",
      "Document inspectable passage source hints (graph-context / outcome / review-package).",
      "Deepen /research/mechanism-workflow UI to probe APIs and surface backend passages.",
      "Keep scientificAcceptance=BLOCKED and refuse hard-coded demo content.",
      "Seal inventoryHash + offline prepare/check harness.",
      "Operator checklist + Audit R3 receipt (ENG CLEARED / SCIENCE BLOCKED).",
    ],
    summary: {
      stageCount: 6,
      apiBoundStages: 6,
      inspectablePassageStages,
      mechanismStepsBound: RESEARCH_MECHANISM_STEPS.length,
      hardCodedDemoContent: 0,
      researcherJourneyCompleteClaimed: false,
      scientificAcceptance: "BLOCKED",
      rightsAcceptance: "BLOCKED",
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      humanChecksPending: humanPending,
      humanChecksTotal: human.length,
    },
    residualHumanSteps: [
      "Parked: do not fix human queue #2 rights, #3 cite HITL, #4 SMEs, #5 staging, #8 MoU in this eng phase.",
      "Keep researcherJourneyCompleteClaimed=false / scientificAcceptance=BLOCKED.",
      "Do not invent passage text, SME gold, MoU, or Gate C auto-approve.",
      "Do not claim production-ready or production writesEnabled from this scaffold.",
      "When #5 clears, a verified researcher can complete the authenticated journey — not before.",
    ],
    parkedHumanResiduals: ["#2 N1 rights", "#3 cite HITL", "#4 SMEs", "#5 staging", "#8 MoU"],
    stopNote:
      "R3 eng deepen complete. Scientific acceptance remains BLOCKED. Journey is API-mapped with synthetic fixture honesty; inspectable passages come only from backend responses. researcherJourneyCompleteClaimed=false; production writes not claimed. Human #2/#3/#4/#5/#8 explicitly parked.",
  });
}

export function parseR3ConnectedResearchWorkbench(value: unknown): R3ConnectedResearchWorkbench {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new R3ConnectedResearchWorkbenchError("Invalid R3 connected research workbench");
  }
  const manifest = value as R3ConnectedResearchWorkbench;
  if (
    manifest.schemaVersion !== R3_WORKBENCH_JOURNEY_SCHEMA ||
    manifest.phase !== "R3" ||
    manifest.roadmapPhase !== "connected_research_workbench" ||
    manifest.programme !== R3_PROGRAMME ||
    manifest.workbenchVersion !== R3_WORKBENCH_VERSION
  ) {
    throw new R3ConnectedResearchWorkbenchError("Unsupported R3 connected research workbench schema");
  }
  if (
    manifest.engineeringScaffold !== "CLEARED" ||
    manifest.scientificAcceptance !== "BLOCKED" ||
    manifest.rightsAcceptance !== "BLOCKED" ||
    manifest.researcherJourneyCompleteClaimed !== false ||
    manifest.productionReadyClaimed !== false ||
    manifest.writesEnabledClaimed !== false ||
    manifest.modelActivationAllowed !== false ||
    manifest.graphPromotable !== false ||
    manifest.gateCAutoApprove !== false ||
    manifest.legalBinding !== false ||
    manifest.inventPassagesPermitted !== false ||
    manifest.containsPhi !== false ||
    manifest.recordedPilotDecisionUnchanged !== true ||
    manifest.summary.hardCodedDemoContent !== 0 ||
    manifest.summary.researcherJourneyCompleteClaimed !== false ||
    manifest.summary.scientificAcceptance !== "BLOCKED" ||
    manifest.exitShapeScaffold.researcherJourneyCompleteClaimed !== false ||
    manifest.exitShapeScaffold.scientificAcceptance !== "BLOCKED" ||
    !Array.isArray(manifest.stages) ||
    manifest.stages.length !== 6
  ) {
    throw new R3ConnectedResearchWorkbenchError(
      "R3 manifest cannot claim journey complete, production ready, or scientific acceptance",
    );
  }
  if (
    manifest.stages.some(
      (s) =>
        s.consumesBackend !== true ||
        s.hardCodedDemoContent !== false ||
        !s.apiPath.startsWith("/api/research/"),
    )
  ) {
    throw new R3ConnectedResearchWorkbenchError("R3 stages must consume real research APIs only");
  }
  if (
    manifest.syntheticFixture.investigationId !== RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId ||
    manifest.syntheticFixture.honestyBanner !== RESEARCH_WORKSPACE_TEST_FIXTURE.honestyBanner
  ) {
    throw new R3ConnectedResearchWorkbenchError("R3 synthetic fixture honesty drift");
  }
  for (const check of manifest.checks) {
    if (check.plane === "human" && check.status === "CLEARED") {
      throw new R3ConnectedResearchWorkbenchError("Human R3 checks cannot be CLEARED by eng");
    }
    if (check.plane === "engineering" && check.status !== "CLEARED") {
      throw new R3ConnectedResearchWorkbenchError("Engineering R3 checks must be CLEARED");
    }
  }
  const {inventoryHash: claimed, ...body} = manifest;
  const expected = digest(body);
  if (claimed !== expected) {
    throw new R3ConnectedResearchWorkbenchError(
      `R3 inventoryHash mismatch: claimed=${claimed} expected=${expected}`,
    );
  }
  return manifest;
}

export function readOnDiskR3Workbench(repoRoot: string): R3ConnectedResearchWorkbench {
  const path = resolve(repoRoot, "research/connected-workbench/r3/workbench-journey.v1.json");
  return parseR3ConnectedResearchWorkbench(JSON.parse(readFileSync(path, "utf8")));
}
