/**
 * Milestone 17 / PR2 — Research Objective and Workstream Planning.
 *
 * Programme planning service contracts on top of M17 PR1 scientific programme
 * envelopes and existing research orchestrator / SPI composition refs.
 * Does NOT auto-approve generated plans, allow agents to self-approve, invent a
 * separate agent platform, ship workbench UI, fabricate discoveries, invent
 * Gate C auto-approve / MoU, wire PHI/CDS, or introduce Neon migrations.
 *
 * Workflow (contracts only; fixtures):
 * 1. Researcher defines scientific objective
 * 2. Identify research scope
 * 3. Retrieve existing programme knowledge
 * 4. Identify relevant biological questions
 * 5. Map dependencies between questions
 * 6. Identify required evidence
 * 7. Identify available investigation capabilities
 * 8. Propose workstreams
 * 9. Estimate computational and data requirements
 * 10. Request researcher approval
 * 11. Register approved programme plan
 *
 * Layer distinctions (must not collapse):
 * scientific objective · research question · hypothesis · evidence gap ·
 * investigation · experiment · research decision.
 *
 * Binding honesty:
 * - Auto-generated plans are never treated as approved.
 * - Scope / priorities may be revised; complete planning history is preserved.
 * - Agents investigate / propose; researchers approve; agents cannot self-approve.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR1 scientific programme contracts (#131) — stack or merge first.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";
import {
  AUTHORISATION_CLASSES,
  DATA_PERMISSION_CLASSES,
  RESOURCE_CLASSES,
  type AuthorisationClass,
  type DataPermissionClass,
  type ResourceClass,
  type ScientificProgrammeActor,
  type ScientificProgrammeActorKind,
  type ScientificProgrammeDataBasis,
} from "./scientificProgrammeIntelligenceContracts";

export const RESEARCH_OBJECTIVE_PLANNING_SCHEMA =
  "hsi-research-objective-workstream-planning-1" as const;
export const RESEARCH_OBJECTIVE_PLANNING_METHOD =
  "hsi.research_objective_workstream_planning.v1" as const;
export const RESEARCH_OBJECTIVE_PLANNING_VERSION = "0.1.0" as const;

/** Binding layer vocabulary — do not collapse these into one another. */
export const PLANNING_LAYER_KINDS = [
  "scientific_objective",
  "research_question",
  "hypothesis",
  "evidence_gap",
  "investigation",
  "experiment",
  "research_decision",
] as const;
export type PlanningLayerKind = (typeof PLANNING_LAYER_KINDS)[number];

export const SCIENTIFIC_OBJECTIVE_LIFECYCLES = [
  "draft",
  "registered",
  "superseded",
] as const;
export type ScientificObjectiveLifecycle =
  (typeof SCIENTIFIC_OBJECTIVE_LIFECYCLES)[number];

export const PROGRAMME_PLAN_LIFECYCLES = [
  "draft",
  "awaiting_researcher_approval",
  "approved",
  "rejected",
  "revising",
  "registered",
  "superseded",
] as const;
export type ProgrammePlanLifecycle = (typeof PROGRAMME_PLAN_LIFECYCLES)[number];

export const PLANNING_HISTORY_EVENT_KINDS = [
  "objective_defined",
  "scope_identified",
  "knowledge_retrieved",
  "questions_identified",
  "dependencies_mapped",
  "evidence_required",
  "capabilities_identified",
  "workstreams_proposed",
  "requirements_estimated",
  "approval_requested",
  "plan_approved",
  "plan_rejected",
  "scope_revised",
  "priorities_revised",
  "plan_registered",
  "superseded",
] as const;
export type PlanningHistoryEventKind =
  (typeof PLANNING_HISTORY_EVENT_KINDS)[number];

export const QUESTION_DEPENDENCY_KINDS = [
  "prerequisite",
  "informs",
  "blocks",
  "related",
] as const;
export type QuestionDependencyKind = (typeof QUESTION_DEPENDENCY_KINDS)[number];

export const PROGRAMME_KNOWLEDGE_REF_KINDS = [
  "investigation",
  "hypothesis",
  "programme",
  "workstream",
  "evidence",
  "ontology",
  "therapeutic_programme",
  "translational_programme",
  "other",
] as const;
export type ProgrammeKnowledgeRefKind =
  (typeof PROGRAMME_KNOWLEDGE_REF_KINDS)[number];

export const CAPABILITY_AVAILABILITY_CLASSES = [
  "available_fixture",
  "available_declared",
  "blocked",
  "not_assessed",
] as const;
export type CapabilityAvailabilityClass =
  (typeof CAPABILITY_AVAILABILITY_CLASSES)[number];

export const REQUIRED_EVIDENCE_KINDS = [
  "public_literature",
  "structured_comparison",
  "gap_assessment",
  "hypothesis_registry",
  "experiment_design",
  "protocol_review",
  "computational_execution_authorisation",
  "other_declared",
] as const;
export type RequiredEvidenceKind = (typeof REQUIRED_EVIDENCE_KINDS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type PlanningActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type PlanningDataBasis = (typeof DATA_BASES)[number];

const OBJECTIVE_ID_RE = /^hsi-sp-obj-[a-z0-9-]{3,80}$/;
const QUESTION_ID_RE = /^hsi-sp-rq-[a-z0-9-]{3,80}$/;
const EVIDENCE_GAP_ID_RE = /^hsi-sp-egap-[a-z0-9-]{3,80}$/;
const PLAN_ID_RE = /^hsi-sp-plan-[a-z0-9-]{3,80}$/;
const HISTORY_ID_RE = /^hsi-sp-hist-[a-z0-9-]{3,80}$/;
const PROPOSED_WS_ID_RE = /^hsi-sp-pw-[a-z0-9-]{3,80}$/;
const PROGRAMME_ID_RE = /^hsi-sp-prog-[a-z0-9-]{3,80}$/;
const WORKSTREAM_ID_RE = /^hsi-sp-ws-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ResearchObjectivePlanningHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true;
  autoGeneratedPlansNotApproved: true;
  agentsCannotSelfApprove: true;
  reviseScopePrioritiesAllowed: true;
  completePlanningHistoryPreserved: true;
  layerDistinctionsEnforced: true;
  notSeparateAgentPlatform: true;
  agentsInvestigateResearchersApprove: true;
  noAutoApprovalOfPlansOrClaims: true;
  noFabricatedDiscoveries: true;
  noWorkbenchUi: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  continuousEvidenceInvestigation: false;
};

export type PlanningActor = {
  principalId: string;
  actorKind: PlanningActorKind;
};

export type ProgrammeKnowledgeRef = {
  kind: ProgrammeKnowledgeRefKind;
  refId: string;
  label: string | null;
  /** Retrieved refs are composition only — not graph promotion. */
  graphPromotable: false;
};

export type ScientificObjective = {
  schema: typeof RESEARCH_OBJECTIVE_PLANNING_SCHEMA;
  method: typeof RESEARCH_OBJECTIVE_PLANNING_METHOD;
  version: typeof RESEARCH_OBJECTIVE_PLANNING_VERSION;
  id: string;
  programmeId: string;
  layerKind: "scientific_objective";
  statement: string;
  successCriteria: string;
  constraints: string;
  lifecycle: ScientificObjectiveLifecycle;
  definedBy: PlanningActor;
  authoredBy: PlanningActor;
  dataBasis: PlanningDataBasis;
  fixtureHonesty: boolean;
  honesty: ResearchObjectivePlanningHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiologicalResearchQuestion = {
  id: string;
  layerKind: "research_question";
  /** Explicit: questions are not hypotheses. */
  notHypothesis: true;
  question: string;
  priorityOrdinal: number;
  /** Optional composition to M3 hypothesis ids — never collapses layers. */
  linkedHypothesisIds: readonly string[];
  note: string;
};

export type QuestionDependency = {
  fromQuestionId: string;
  toQuestionId: string;
  dependencyKind: QuestionDependencyKind;
  note: string;
};

export type EvidenceGapRecord = {
  id: string;
  layerKind: "evidence_gap";
  /** Explicit: gaps are not experiments or decisions. */
  notExperiment: true;
  notResearchDecision: true;
  summary: string;
  requiredEvidenceKinds: readonly RequiredEvidenceKind[];
  addressesQuestionIds: readonly string[];
  note: string;
};

export type InvestigationCapabilityAvailability = {
  capabilityId: string;
  availability: CapabilityAvailabilityClass;
  /** Declared availability ≠ authorised autonomous execution. */
  notAuthorisedAutonomousExecution: true;
  note: string;
};

export type ProposedWorkstream = {
  id: string;
  name: string;
  objectiveSummary: string;
  addressesQuestionIds: readonly string[];
  addressesEvidenceGapIds: readonly string[];
  capabilityIds: readonly string[];
  proposedAuthorisationClass: AuthorisationClass;
  proposedResourceClass: ResourceClass;
  proposedDataPermissionClass: DataPermissionClass;
  /** Null until a PR1 workstream is registered after human approval. */
  linkedWorkstreamId: string | null;
  /** Generation never constitutes approval. */
  autoGeneratedNotApproved: true;
  priorityOrdinal: number;
  note: string;
};

export type ComputationalDataRequirementEstimate = {
  computeClass: ResourceClass;
  dataClass: DataPermissionClass;
  estimateNotes: string;
  /** Estimates are declarations — not quota guarantees or live runners. */
  notAQuotaGuarantee: true;
  notLiveExecutionAuthorisation: true;
};

export type ProgrammePlan = {
  schema: typeof RESEARCH_OBJECTIVE_PLANNING_SCHEMA;
  method: typeof RESEARCH_OBJECTIVE_PLANNING_METHOD;
  version: typeof RESEARCH_OBJECTIVE_PLANNING_VERSION;
  id: string;
  programmeId: string;
  objectiveId: string;
  scopeSummary: string;
  inclusionNotes: string;
  exclusionNotes: string;
  knowledgeRefs: readonly ProgrammeKnowledgeRef[];
  researchQuestions: readonly BiologicalResearchQuestion[];
  questionDependencies: readonly QuestionDependency[];
  evidenceGaps: readonly EvidenceGapRecord[];
  availableCapabilities: readonly InvestigationCapabilityAvailability[];
  proposedWorkstreams: readonly ProposedWorkstream[];
  requirementEstimate: ComputationalDataRequirementEstimate;
  lifecycle: ProgrammePlanLifecycle;
  planningRevision: number;
  /** Auto-generated or agent-drafted plans remain unapproved until human accept. */
  autoGeneratedNotApproved: true;
  proposingAgentPrincipalId: string | null;
  authoredBy: PlanningActor;
  reviewedBy: PlanningActor | null;
  dataBasis: PlanningDataBasis;
  fixtureHonesty: boolean;
  honesty: ResearchObjectivePlanningHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PlanningHistoryEntry = {
  schema: typeof RESEARCH_OBJECTIVE_PLANNING_SCHEMA;
  method: typeof RESEARCH_OBJECTIVE_PLANNING_METHOD;
  version: typeof RESEARCH_OBJECTIVE_PLANNING_VERSION;
  id: string;
  planId: string;
  programmeId: string;
  planningRevision: number;
  eventKind: PlanningHistoryEventKind;
  summary: string;
  actor: PlanningActor;
  at: string;
  note: string;
};

export type ResearchObjectivePlanningStore = {
  upsertObjective(objective: ScientificObjective): ScientificObjective;
  getObjective(id: string): ScientificObjective | null;
  listObjectives(programmeId?: string): readonly ScientificObjective[];
  upsertPlan(plan: ProgrammePlan): ProgrammePlan;
  getPlan(id: string): ProgrammePlan | null;
  listPlans(programmeId?: string): readonly ProgrammePlan[];
  appendHistory(entry: PlanningHistoryEntry): PlanningHistoryEntry;
  listHistory(planId: string): readonly PlanningHistoryEntry[];
};

const DEFAULT_HONESTY: ResearchObjectivePlanningHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true,
  autoGeneratedPlansNotApproved: true,
  agentsCannotSelfApprove: true,
  reviseScopePrioritiesAllowed: true,
  completePlanningHistoryPreserved: true,
  layerDistinctionsEnforced: true,
  notSeparateAgentPlatform: true,
  agentsInvestigateResearchersApprove: true,
  noAutoApprovalOfPlansOrClaims: true,
  noFabricatedDiscoveries: true,
  noWorkbenchUi: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  continuousEvidenceInvestigation: false,
};

const PLAN_TRANSITIONS: Record<
  ProgrammePlanLifecycle,
  readonly ProgrammePlanLifecycle[]
> = {
  draft: ["awaiting_researcher_approval", "revising", "superseded"],
  awaiting_researcher_approval: [
    "approved",
    "rejected",
    "revising",
    "superseded",
  ],
  revising: ["draft", "awaiting_researcher_approval", "superseded"],
  approved: ["registered", "revising", "superseded"],
  rejected: ["revising", "superseded"],
  registered: ["superseded"],
  superseded: [],
};

function isIsoTimestamp(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 40 &&
    !Number.isNaN(Date.parse(value))
  );
}

function assertClosed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw Error(`Invalid ${label}`);
  }
}

function textOk(value: string, max: number): boolean {
  const t = value.trim();
  return t.length > 0 && t.length <= max;
}

function assertRefList(ids: readonly string[], label: string): readonly string[] {
  if (ids.length > 50) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  for (const id of ids) {
    if (!REF_ID_RE.test(id)) throw Error(`Invalid ${label} id`);
    if (seen.has(id)) throw Error(`Duplicate ${label} id`);
    seen.add(id);
  }
  return [...ids];
}

function assertHonesty(honesty: ResearchObjectivePlanningHonesty): void {
  if (honesty.dependsOnPr1ScientificProgrammeContracts !== true) {
    throw Error("Must depend on PR1 scientific programme contracts");
  }
  if (honesty.autoGeneratedPlansNotApproved !== true) {
    throw Error("Auto-generated plans must not be treated as approved");
  }
  if (honesty.agentsCannotSelfApprove !== true) {
    throw Error("Agents cannot self-approve");
  }
  if (honesty.reviseScopePrioritiesAllowed !== true) {
    throw Error("Scope/priority revision must remain allowed");
  }
  if (honesty.completePlanningHistoryPreserved !== true) {
    throw Error("Complete planning history must be preserved");
  }
  if (honesty.layerDistinctionsEnforced !== true) {
    throw Error("Layer distinctions must be enforced");
  }
  if (honesty.notSeparateAgentPlatform !== true) {
    throw Error("Must not invent a separate agent platform");
  }
  if (honesty.agentsInvestigateResearchersApprove !== true) {
    throw Error("Agents investigate; researchers approve");
  }
  if (honesty.noAutoApprovalOfPlansOrClaims !== true) {
    throw Error("Auto-approval of plans or claims forbidden");
  }
  if (honesty.noFabricatedDiscoveries !== true) {
    throw Error("Fabricated discoveries forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR2");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve forbidden");
  }
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false in PR2");
  }
  if (honesty.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  if (honesty.neonProjectPolicy !== "red-wave-only") {
    throw Error("Neon red-wave only");
  }
  if (honesty.migration !== "deferred") {
    throw Error("Migration must stay deferred");
  }
  if (honesty.continuousEvidenceInvestigation !== false) {
    throw Error("Continuous evidence investigation is PR3 — not claimed here");
  }
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    (/\bfabricated\s+discover(?:y|ies)\b/.test(lower) &&
      !/\bno\s+fabricated\s+discover/.test(lower)) ||
    /\bdiscovered\s+that\b/.test(lower) ||
    /\bwe\s+have\s+proven\b/.test(lower) ||
    (/\bauto[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\bno\s+auto[- ]?approv/.test(lower) &&
      !/\bnot\s+(an\s+)?auto[- ]?approv/.test(lower) &&
      !/\bstill\s+not\s+(an\s+)?auto[- ]?approv/.test(lower)) ||
    /\bgate\s*c\s+auto/.test(lower) ||
    /\bagents?\s+may\s+approve\b/.test(lower) ||
    (/\bself[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\b(no|not|cannot|must\s+not)\s+self[- ]?approv/.test(lower) &&
      !/\bcannot\s+self[- ]?approv/.test(lower)) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bdiagnos(e|is|ing)\s+the\s+patient\b/.test(lower) ||
    /\blive\s+multiscale\s+engine\b/.test(lower) ||
    /\bauto[- ]?generated\s+plan\s+is\s+approved\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent discoveries, auto-approval, self-approval, PHI/CDS directives, live multiscale claims, or approved auto-generated plans`,
    );
  }
}

function assertActor(actor: PlanningActor, label: string): PlanningActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function toPlanningActor(
  actor: ScientificProgrammeActor | PlanningActor,
): PlanningActor {
  return assertActor(
    {principalId: actor.principalId, actorKind: actor.actorKind},
    "actor",
  );
}

function validateKnowledgeRefs(
  refs: readonly ProgrammeKnowledgeRef[],
): readonly ProgrammeKnowledgeRef[] {
  if (refs.length > 40) throw Error("Too many knowledge refs");
  return refs.map((ref) => {
    assertClosed(ref.kind, PROGRAMME_KNOWLEDGE_REF_KINDS, "knowledge ref kind");
    if (!REF_ID_RE.test(ref.refId)) throw Error("Invalid knowledge ref id");
    if (ref.label !== null && !textOk(ref.label, 200)) {
      throw Error("Invalid knowledge ref label");
    }
    if (ref.graphPromotable !== false) {
      throw Error("Knowledge refs must not be graph-promotable");
    }
    return {
      kind: ref.kind,
      refId: ref.refId,
      label: ref.label === null ? null : ref.label.trim(),
      graphPromotable: false as const,
    };
  });
}

function validateResearchQuestions(
  questions: readonly BiologicalResearchQuestion[],
): readonly BiologicalResearchQuestion[] {
  if (questions.length > 40) throw Error("Too many research questions");
  const seen = new Set<string>();
  return questions.map((q) => {
    if (!QUESTION_ID_RE.test(q.id)) throw Error("Invalid research question id");
    if (seen.has(q.id)) throw Error("Duplicate research question id");
    seen.add(q.id);
    if (q.layerKind !== "research_question") {
      throw Error("Research question layerKind must be research_question");
    }
    if (q.notHypothesis !== true) {
      throw Error("Research questions must declare notHypothesis");
    }
    if (!textOk(q.question, 2000)) throw Error("Invalid research question text");
    assertNoForbiddenClaimLanguage(q.question, "research question");
    if (
      !Number.isInteger(q.priorityOrdinal) ||
      q.priorityOrdinal < 1 ||
      q.priorityOrdinal > 100
    ) {
      throw Error("Invalid research question priorityOrdinal");
    }
    return {
      id: q.id,
      layerKind: "research_question" as const,
      notHypothesis: true as const,
      question: q.question.trim(),
      priorityOrdinal: q.priorityOrdinal,
      linkedHypothesisIds: assertRefList(
        q.linkedHypothesisIds,
        "linked hypothesis",
      ),
      note: (q.note ?? "").trim(),
    };
  });
}

function validateQuestionDependencies(
  deps: readonly QuestionDependency[],
  questionIds: ReadonlySet<string>,
): readonly QuestionDependency[] {
  if (deps.length > 80) throw Error("Too many question dependencies");
  const seen = new Set<string>();
  return deps.map((dep) => {
    assertClosed(
      dep.dependencyKind,
      QUESTION_DEPENDENCY_KINDS,
      "dependency kind",
    );
    if (!questionIds.has(dep.fromQuestionId)) {
      throw Error("Dependency fromQuestionId unknown");
    }
    if (!questionIds.has(dep.toQuestionId)) {
      throw Error("Dependency toQuestionId unknown");
    }
    if (dep.fromQuestionId === dep.toQuestionId) {
      throw Error("Dependency cannot be self-referential");
    }
    const key = `${dep.fromQuestionId}->${dep.toQuestionId}:${dep.dependencyKind}`;
    if (seen.has(key)) throw Error("Duplicate question dependency");
    seen.add(key);
    return {
      fromQuestionId: dep.fromQuestionId,
      toQuestionId: dep.toQuestionId,
      dependencyKind: dep.dependencyKind,
      note: (dep.note ?? "").trim(),
    };
  });
}

function validateEvidenceGaps(
  gaps: readonly EvidenceGapRecord[],
  questionIds: ReadonlySet<string>,
): readonly EvidenceGapRecord[] {
  if (gaps.length > 40) throw Error("Too many evidence gaps");
  const seen = new Set<string>();
  return gaps.map((gap) => {
    if (!EVIDENCE_GAP_ID_RE.test(gap.id)) throw Error("Invalid evidence gap id");
    if (seen.has(gap.id)) throw Error("Duplicate evidence gap id");
    seen.add(gap.id);
    if (gap.layerKind !== "evidence_gap") {
      throw Error("Evidence gap layerKind must be evidence_gap");
    }
    if (gap.notExperiment !== true) {
      throw Error("Evidence gaps must declare notExperiment");
    }
    if (gap.notResearchDecision !== true) {
      throw Error("Evidence gaps must declare notResearchDecision");
    }
    if (!textOk(gap.summary, 2000)) throw Error("Invalid evidence gap summary");
    assertNoForbiddenClaimLanguage(gap.summary, "evidence gap summary");
    if (
      gap.requiredEvidenceKinds.length < 1 ||
      gap.requiredEvidenceKinds.length > 12
    ) {
      throw Error("Invalid requiredEvidenceKinds length");
    }
    for (const kind of gap.requiredEvidenceKinds) {
      assertClosed(kind, REQUIRED_EVIDENCE_KINDS, "required evidence kind");
    }
    for (const qid of gap.addressesQuestionIds) {
      if (!questionIds.has(qid)) {
        throw Error("Evidence gap addresses unknown question");
      }
    }
    return {
      id: gap.id,
      layerKind: "evidence_gap" as const,
      notExperiment: true as const,
      notResearchDecision: true as const,
      summary: gap.summary.trim(),
      requiredEvidenceKinds: [...gap.requiredEvidenceKinds],
      addressesQuestionIds: assertRefList(
        gap.addressesQuestionIds,
        "gap question",
      ),
      note: (gap.note ?? "").trim(),
    };
  });
}

function validateCapabilities(
  caps: readonly InvestigationCapabilityAvailability[],
): readonly InvestigationCapabilityAvailability[] {
  if (caps.length > 40) throw Error("Too many capabilities");
  const seen = new Set<string>();
  return caps.map((cap) => {
    if (!REF_ID_RE.test(cap.capabilityId)) {
      throw Error("Invalid capability id");
    }
    if (seen.has(cap.capabilityId)) throw Error("Duplicate capability id");
    seen.add(cap.capabilityId);
    assertClosed(
      cap.availability,
      CAPABILITY_AVAILABILITY_CLASSES,
      "capability availability",
    );
    if (cap.notAuthorisedAutonomousExecution !== true) {
      throw Error("Capabilities must deny authorised autonomous execution");
    }
    return {
      capabilityId: cap.capabilityId,
      availability: cap.availability,
      notAuthorisedAutonomousExecution: true as const,
      note: (cap.note ?? "").trim(),
    };
  });
}

function validateProposedWorkstreams(
  workstreams: readonly ProposedWorkstream[],
  questionIds: ReadonlySet<string>,
  gapIds: ReadonlySet<string>,
  capabilityIds: ReadonlySet<string>,
): readonly ProposedWorkstream[] {
  if (workstreams.length > 20) throw Error("Too many proposed workstreams");
  const seen = new Set<string>();
  return workstreams.map((ws) => {
    if (!PROPOSED_WS_ID_RE.test(ws.id)) {
      throw Error("Invalid proposed workstream id");
    }
    if (seen.has(ws.id)) throw Error("Duplicate proposed workstream id");
    seen.add(ws.id);
    if (!textOk(ws.name, 200)) throw Error("Invalid proposed workstream name");
    if (!textOk(ws.objectiveSummary, 2000)) {
      throw Error("Invalid proposed workstream objectiveSummary");
    }
    assertNoForbiddenClaimLanguage(ws.objectiveSummary, "proposed workstream");
    if (
      !Number.isInteger(ws.priorityOrdinal) ||
      ws.priorityOrdinal < 1 ||
      ws.priorityOrdinal > 100
    ) {
      throw Error("Invalid proposed workstream priorityOrdinal");
    }
    assertClosed(
      ws.proposedAuthorisationClass,
      AUTHORISATION_CLASSES,
      "proposed authorisation class",
    );
    assertClosed(
      ws.proposedResourceClass,
      RESOURCE_CLASSES,
      "proposed resource class",
    );
    assertClosed(
      ws.proposedDataPermissionClass,
      DATA_PERMISSION_CLASSES,
      "proposed data permission class",
    );
    if (ws.autoGeneratedNotApproved !== true) {
      throw Error("Proposed workstreams must declare autoGeneratedNotApproved");
    }
    if (
      ws.linkedWorkstreamId !== null &&
      !WORKSTREAM_ID_RE.test(ws.linkedWorkstreamId)
    ) {
      throw Error("Invalid linkedWorkstreamId");
    }
    for (const qid of ws.addressesQuestionIds) {
      if (!questionIds.has(qid)) {
        throw Error("Proposed workstream addresses unknown question");
      }
    }
    for (const gid of ws.addressesEvidenceGapIds) {
      if (!gapIds.has(gid)) {
        throw Error("Proposed workstream addresses unknown evidence gap");
      }
    }
    for (const cid of ws.capabilityIds) {
      if (!capabilityIds.has(cid)) {
        throw Error("Proposed workstream references unknown capability");
      }
    }
    return {
      id: ws.id,
      name: ws.name.trim(),
      objectiveSummary: ws.objectiveSummary.trim(),
      addressesQuestionIds: assertRefList(
        ws.addressesQuestionIds,
        "proposed workstream question",
      ),
      addressesEvidenceGapIds: assertRefList(
        ws.addressesEvidenceGapIds,
        "proposed workstream gap",
      ),
      capabilityIds: assertRefList(
        ws.capabilityIds,
        "proposed workstream capability",
      ),
      proposedAuthorisationClass: ws.proposedAuthorisationClass,
      proposedResourceClass: ws.proposedResourceClass,
      proposedDataPermissionClass: ws.proposedDataPermissionClass,
      linkedWorkstreamId: ws.linkedWorkstreamId,
      autoGeneratedNotApproved: true as const,
      priorityOrdinal: ws.priorityOrdinal,
      note: (ws.note ?? "").trim(),
    };
  });
}

function validateRequirementEstimate(
  estimate: ComputationalDataRequirementEstimate,
): ComputationalDataRequirementEstimate {
  assertClosed(estimate.computeClass, RESOURCE_CLASSES, "compute class");
  assertClosed(estimate.dataClass, DATA_PERMISSION_CLASSES, "data class");
  if (!textOk(estimate.estimateNotes, 2000)) {
    throw Error("Invalid requirement estimate notes");
  }
  assertNoForbiddenClaimLanguage(estimate.estimateNotes, "requirement estimate");
  if (estimate.notAQuotaGuarantee !== true) {
    throw Error("Requirement estimate must declare notAQuotaGuarantee");
  }
  if (estimate.notLiveExecutionAuthorisation !== true) {
    throw Error(
      "Requirement estimate must declare notLiveExecutionAuthorisation",
    );
  }
  return {
    computeClass: estimate.computeClass,
    dataClass: estimate.dataClass,
    estimateNotes: estimate.estimateNotes.trim(),
    notAQuotaGuarantee: true,
    notLiveExecutionAuthorisation: true,
  };
}

export function draftScientificObjective(input: {
  id: string;
  programmeId: string;
  statement: string;
  successCriteria: string;
  constraints: string;
  definedByPrincipalId: string;
  definedByActorKind?: PlanningActorKind;
  authoredByPrincipalId?: string;
  authoredByActorKind?: PlanningActorKind | ScientificProgrammeActorKind;
  createdAt: string;
  dataBasis?: PlanningDataBasis | ScientificProgrammeDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ScientificObjective {
  if (!OBJECTIVE_ID_RE.test(input.id)) throw Error("Invalid objective id");
  if (!PROGRAMME_ID_RE.test(input.programmeId)) {
    throw Error("Invalid programme id");
  }
  if (!textOk(input.statement, 2000)) throw Error("Invalid objective statement");
  if (!textOk(input.successCriteria, 2000)) {
    throw Error("Invalid success criteria");
  }
  if (!textOk(input.constraints, 2000)) throw Error("Invalid constraints");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.statement, "objective statement");
  assertNoForbiddenClaimLanguage(input.successCriteria, "success criteria");
  assertNoForbiddenClaimLanguage(input.constraints, "constraints");

  const definedByKind = input.definedByActorKind ?? "human";
  const definedBy = assertActor(
    {principalId: input.definedByPrincipalId, actorKind: definedByKind},
    "definedBy",
  );
  if (definedBy.actorKind !== "human") {
    throw Error("Only human researchers may define scientific objectives");
  }

  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId ?? input.definedByPrincipalId,
      actorKind: input.authoredByActorKind ?? definedByKind,
    },
    "author",
  );

  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const objective: ScientificObjective = {
    schema: RESEARCH_OBJECTIVE_PLANNING_SCHEMA,
    method: RESEARCH_OBJECTIVE_PLANNING_METHOD,
    version: RESEARCH_OBJECTIVE_PLANNING_VERSION,
    id: input.id,
    programmeId: input.programmeId,
    layerKind: "scientific_objective",
    statement: input.statement.trim(),
    successCriteria: input.successCriteria.trim(),
    constraints: input.constraints.trim(),
    lifecycle: "draft",
    definedBy,
    authoredBy,
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateScientificObjective(objective);
}

export function validateScientificObjective(
  objective: ScientificObjective,
): ScientificObjective {
  if (objective.schema !== RESEARCH_OBJECTIVE_PLANNING_SCHEMA) {
    throw Error("Invalid objective schema");
  }
  if (objective.method !== RESEARCH_OBJECTIVE_PLANNING_METHOD) {
    throw Error("Invalid objective method");
  }
  if (objective.version !== RESEARCH_OBJECTIVE_PLANNING_VERSION) {
    throw Error("Invalid objective version");
  }
  if (!OBJECTIVE_ID_RE.test(objective.id)) throw Error("Invalid objective id");
  if (!PROGRAMME_ID_RE.test(objective.programmeId)) {
    throw Error("Invalid objective programmeId");
  }
  if (objective.layerKind !== "scientific_objective") {
    throw Error("Objective layerKind must be scientific_objective");
  }
  assertClosed(
    objective.lifecycle,
    SCIENTIFIC_OBJECTIVE_LIFECYCLES,
    "objective lifecycle",
  );
  assertClosed(objective.dataBasis, DATA_BASES, "data basis");
  assertHonesty(objective.honesty);
  assertActor(objective.definedBy, "definedBy");
  if (objective.definedBy.actorKind !== "human") {
    throw Error("Objective definedBy must be human");
  }
  assertActor(objective.authoredBy, "author");
  if (
    !isIsoTimestamp(objective.createdAt) ||
    !isIsoTimestamp(objective.updatedAt)
  ) {
    throw Error("Invalid objective timestamps");
  }
  return objective;
}

export function draftProgrammePlan(input: {
  id: string;
  programmeId: string;
  objective: ScientificObjective;
  scopeSummary: string;
  inclusionNotes: string;
  exclusionNotes: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: PlanningActorKind;
  createdAt: string;
  knowledgeRefs?: readonly ProgrammeKnowledgeRef[];
  researchQuestions?: readonly BiologicalResearchQuestion[];
  questionDependencies?: readonly QuestionDependency[];
  evidenceGaps?: readonly EvidenceGapRecord[];
  availableCapabilities?: readonly InvestigationCapabilityAvailability[];
  proposedWorkstreams?: readonly ProposedWorkstream[];
  requirementEstimate?: ComputationalDataRequirementEstimate;
  proposingAgentPrincipalId?: string | null;
  dataBasis?: PlanningDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ProgrammePlan {
  const objective = validateScientificObjective(input.objective);
  if (objective.programmeId !== input.programmeId) {
    throw Error("Objective programme mismatch");
  }
  if (!PLAN_ID_RE.test(input.id)) throw Error("Invalid plan id");
  if (!PROGRAMME_ID_RE.test(input.programmeId)) {
    throw Error("Invalid programme id");
  }
  if (!textOk(input.scopeSummary, 2000)) throw Error("Invalid scope summary");
  if (!textOk(input.inclusionNotes, 2000)) throw Error("Invalid inclusion notes");
  if (!textOk(input.exclusionNotes, 2000)) throw Error("Invalid exclusion notes");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.scopeSummary, "scope summary");
  assertNoForbiddenClaimLanguage(input.inclusionNotes, "inclusion notes");
  assertNoForbiddenClaimLanguage(input.exclusionNotes, "exclusion notes");

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const authoredBy = assertActor(
    {principalId: input.authoredByPrincipalId, actorKind},
    "author",
  );

  const proposingAgentPrincipalId =
    input.proposingAgentPrincipalId === undefined
      ? actorKind === "ai_agent"
        ? input.authoredByPrincipalId
        : null
      : input.proposingAgentPrincipalId;
  if (
    proposingAgentPrincipalId !== null &&
    !PRINCIPAL_RE.test(proposingAgentPrincipalId)
  ) {
    throw Error("Invalid proposingAgentPrincipalId");
  }

  const dataBasis = input.dataBasis ?? objective.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const researchQuestions = validateResearchQuestions(
    input.researchQuestions ?? [],
  );
  const questionIds = new Set(researchQuestions.map((q) => q.id));
  const questionDependencies = validateQuestionDependencies(
    input.questionDependencies ?? [],
    questionIds,
  );
  const evidenceGaps = validateEvidenceGaps(
    input.evidenceGaps ?? [],
    questionIds,
  );
  const gapIds = new Set(evidenceGaps.map((g) => g.id));
  const availableCapabilities = validateCapabilities(
    input.availableCapabilities ?? [],
  );
  const capabilityIds = new Set(
    availableCapabilities.map((c) => c.capabilityId),
  );
  const proposedWorkstreams = validateProposedWorkstreams(
    input.proposedWorkstreams ?? [],
    questionIds,
    gapIds,
    capabilityIds,
  );
  const requirementEstimate = validateRequirementEstimate(
    input.requirementEstimate ?? {
      computeClass: "fixture_unbounded_not_claimed",
      dataClass: "fixture_engineering",
      estimateNotes:
        "Fixture estimate only — not a quota guarantee and not live execution authorisation.",
      notAQuotaGuarantee: true,
      notLiveExecutionAuthorisation: true,
    },
  );

  const plan: ProgrammePlan = {
    schema: RESEARCH_OBJECTIVE_PLANNING_SCHEMA,
    method: RESEARCH_OBJECTIVE_PLANNING_METHOD,
    version: RESEARCH_OBJECTIVE_PLANNING_VERSION,
    id: input.id,
    programmeId: input.programmeId,
    objectiveId: objective.id,
    scopeSummary: input.scopeSummary.trim(),
    inclusionNotes: input.inclusionNotes.trim(),
    exclusionNotes: input.exclusionNotes.trim(),
    knowledgeRefs: validateKnowledgeRefs(input.knowledgeRefs ?? []),
    researchQuestions,
    questionDependencies,
    evidenceGaps,
    availableCapabilities,
    proposedWorkstreams,
    requirementEstimate,
    lifecycle: "draft",
    planningRevision: 1,
    autoGeneratedNotApproved: true,
    proposingAgentPrincipalId,
    authoredBy,
    reviewedBy: null,
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateProgrammePlan(plan);
}

export function validateProgrammePlan(plan: ProgrammePlan): ProgrammePlan {
  if (plan.schema !== RESEARCH_OBJECTIVE_PLANNING_SCHEMA) {
    throw Error("Invalid plan schema");
  }
  if (plan.method !== RESEARCH_OBJECTIVE_PLANNING_METHOD) {
    throw Error("Invalid plan method");
  }
  if (plan.version !== RESEARCH_OBJECTIVE_PLANNING_VERSION) {
    throw Error("Invalid plan version");
  }
  if (!PLAN_ID_RE.test(plan.id)) throw Error("Invalid plan id");
  if (!PROGRAMME_ID_RE.test(plan.programmeId)) {
    throw Error("Invalid plan programmeId");
  }
  if (!OBJECTIVE_ID_RE.test(plan.objectiveId)) {
    throw Error("Invalid plan objectiveId");
  }
  assertClosed(plan.lifecycle, PROGRAMME_PLAN_LIFECYCLES, "plan lifecycle");
  assertClosed(plan.dataBasis, DATA_BASES, "data basis");
  assertHonesty(plan.honesty);
  if (plan.autoGeneratedNotApproved !== true) {
    throw Error("Plans must declare autoGeneratedNotApproved");
  }
  if (
    !Number.isInteger(plan.planningRevision) ||
    plan.planningRevision < 1 ||
    plan.planningRevision > 10_000
  ) {
    throw Error("Invalid planningRevision");
  }
  if (
    plan.lifecycle === "approved" ||
    plan.lifecycle === "registered"
  ) {
    // Lifecycle may be approved/registered, but the honesty flag stays true:
    // generation never equals approval; human acceptance is recorded separately.
    if (plan.reviewedBy === null || plan.reviewedBy.actorKind !== "human") {
      throw Error("Approved or registered plans require human reviewedBy");
    }
  }
  assertActor(plan.authoredBy, "author");
  if (plan.reviewedBy !== null) {
    const reviewer = assertActor(plan.reviewedBy, "reviewer");
    if (reviewer.actorKind !== "human") {
      throw Error("Only human researchers may review plans");
    }
  }
  if (
    plan.proposingAgentPrincipalId !== null &&
    !PRINCIPAL_RE.test(plan.proposingAgentPrincipalId)
  ) {
    throw Error("Invalid proposingAgentPrincipalId");
  }
  const researchQuestions = validateResearchQuestions(plan.researchQuestions);
  const questionIds = new Set(researchQuestions.map((q) => q.id));
  validateQuestionDependencies(plan.questionDependencies, questionIds);
  const evidenceGaps = validateEvidenceGaps(plan.evidenceGaps, questionIds);
  const gapIds = new Set(evidenceGaps.map((g) => g.id));
  const availableCapabilities = validateCapabilities(plan.availableCapabilities);
  const capabilityIds = new Set(
    availableCapabilities.map((c) => c.capabilityId),
  );
  validateProposedWorkstreams(
    plan.proposedWorkstreams,
    questionIds,
    gapIds,
    capabilityIds,
  );
  validateRequirementEstimate(plan.requirementEstimate);
  validateKnowledgeRefs(plan.knowledgeRefs);
  if (!isIsoTimestamp(plan.createdAt) || !isIsoTimestamp(plan.updatedAt)) {
    throw Error("Invalid plan timestamps");
  }
  return plan;
}

export function validatePlanningHistoryEntry(
  entry: PlanningHistoryEntry,
): PlanningHistoryEntry {
  if (entry.schema !== RESEARCH_OBJECTIVE_PLANNING_SCHEMA) {
    throw Error("Invalid history schema");
  }
  if (!HISTORY_ID_RE.test(entry.id)) throw Error("Invalid history id");
  if (!PLAN_ID_RE.test(entry.planId)) throw Error("Invalid history planId");
  if (!PROGRAMME_ID_RE.test(entry.programmeId)) {
    throw Error("Invalid history programmeId");
  }
  assertClosed(entry.eventKind, PLANNING_HISTORY_EVENT_KINDS, "history event");
  if (!textOk(entry.summary, 2000)) throw Error("Invalid history summary");
  assertNoForbiddenClaimLanguage(entry.summary, "history summary");
  if (
    !Number.isInteger(entry.planningRevision) ||
    entry.planningRevision < 1
  ) {
    throw Error("Invalid history planningRevision");
  }
  assertActor(entry.actor, "history actor");
  if (!isIsoTimestamp(entry.at)) throw Error("Invalid history at");
  return entry;
}

export function recordPlanningHistory(input: {
  id: string;
  plan: ProgrammePlan;
  eventKind: PlanningHistoryEventKind;
  summary: string;
  actor: PlanningActor | ScientificProgrammeActor;
  at: string;
  note?: string;
  planningRevision?: number;
}): PlanningHistoryEntry {
  const plan = validateProgrammePlan(input.plan);
  assertClosed(input.eventKind, PLANNING_HISTORY_EVENT_KINDS, "history event");
  if (!HISTORY_ID_RE.test(input.id)) throw Error("Invalid history id");
  if (!isIsoTimestamp(input.at)) throw Error("Invalid history at");
  if (!textOk(input.summary, 2000)) throw Error("Invalid history summary");
  assertNoForbiddenClaimLanguage(input.summary, "history summary");

  const entry: PlanningHistoryEntry = {
    schema: RESEARCH_OBJECTIVE_PLANNING_SCHEMA,
    method: RESEARCH_OBJECTIVE_PLANNING_METHOD,
    version: RESEARCH_OBJECTIVE_PLANNING_VERSION,
    id: input.id,
    planId: plan.id,
    programmeId: plan.programmeId,
    planningRevision: input.planningRevision ?? plan.planningRevision,
    eventKind: input.eventKind,
    summary: input.summary.trim(),
    actor: toPlanningActor(input.actor),
    at: input.at,
    note: (input.note ?? "").trim(),
  };
  return validatePlanningHistoryEntry(entry);
}

/**
 * Apply a planning workflow enrichment step while the plan remains draft/revising.
 * Does not approve. Appends a history event kind matching the step.
 */
export function enrichProgrammePlan(input: {
  plan: ProgrammePlan;
  updatedAt: string;
  actor: PlanningActor;
  eventKind: Exclude<
    PlanningHistoryEventKind,
    | "approval_requested"
    | "plan_approved"
    | "plan_rejected"
    | "plan_registered"
    | "superseded"
    | "objective_defined"
  >;
  historyId: string;
  historySummary: string;
  scopeSummary?: string;
  inclusionNotes?: string;
  exclusionNotes?: string;
  knowledgeRefs?: readonly ProgrammeKnowledgeRef[];
  researchQuestions?: readonly BiologicalResearchQuestion[];
  questionDependencies?: readonly QuestionDependency[];
  evidenceGaps?: readonly EvidenceGapRecord[];
  availableCapabilities?: readonly InvestigationCapabilityAvailability[];
  proposedWorkstreams?: readonly ProposedWorkstream[];
  requirementEstimate?: ComputationalDataRequirementEstimate;
  note?: string;
}): {plan: ProgrammePlan; history: PlanningHistoryEntry} {
  const current = validateProgrammePlan(input.plan);
  if (current.lifecycle !== "draft" && current.lifecycle !== "revising") {
    throw Error("Only draft or revising plans may be enriched");
  }
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  assertActor(input.actor, "enrichment actor");

  if (input.scopeSummary !== undefined) {
    if (!textOk(input.scopeSummary, 2000)) throw Error("Invalid scope summary");
    assertNoForbiddenClaimLanguage(input.scopeSummary, "scope summary");
  }
  if (input.inclusionNotes !== undefined) {
    if (!textOk(input.inclusionNotes, 2000)) {
      throw Error("Invalid inclusion notes");
    }
    assertNoForbiddenClaimLanguage(input.inclusionNotes, "inclusion notes");
  }
  if (input.exclusionNotes !== undefined) {
    if (!textOk(input.exclusionNotes, 2000)) {
      throw Error("Invalid exclusion notes");
    }
    assertNoForbiddenClaimLanguage(input.exclusionNotes, "exclusion notes");
  }

  const nextDraft: ProgrammePlan = {
    ...current,
    scopeSummary: input.scopeSummary?.trim() ?? current.scopeSummary,
    inclusionNotes: input.inclusionNotes?.trim() ?? current.inclusionNotes,
    exclusionNotes: input.exclusionNotes?.trim() ?? current.exclusionNotes,
    knowledgeRefs: input.knowledgeRefs
      ? validateKnowledgeRefs(input.knowledgeRefs)
      : current.knowledgeRefs,
    researchQuestions: input.researchQuestions
      ? validateResearchQuestions(input.researchQuestions)
      : current.researchQuestions,
    questionDependencies: current.questionDependencies,
    evidenceGaps: current.evidenceGaps,
    availableCapabilities: current.availableCapabilities,
    proposedWorkstreams: current.proposedWorkstreams,
    requirementEstimate: current.requirementEstimate,
    updatedAt: input.updatedAt,
    note: input.note !== undefined ? input.note.trim() : current.note,
    autoGeneratedNotApproved: true,
  };

  const questionIds = new Set(nextDraft.researchQuestions.map((q) => q.id));
  nextDraft.questionDependencies = input.questionDependencies
    ? validateQuestionDependencies(input.questionDependencies, questionIds)
    : validateQuestionDependencies(current.questionDependencies, questionIds);

  nextDraft.evidenceGaps = input.evidenceGaps
    ? validateEvidenceGaps(input.evidenceGaps, questionIds)
    : validateEvidenceGaps(current.evidenceGaps, questionIds);
  const gapIds = new Set(nextDraft.evidenceGaps.map((g) => g.id));

  nextDraft.availableCapabilities = input.availableCapabilities
    ? validateCapabilities(input.availableCapabilities)
    : current.availableCapabilities;
  const capabilityIds = new Set(
    nextDraft.availableCapabilities.map((c) => c.capabilityId),
  );

  nextDraft.proposedWorkstreams = input.proposedWorkstreams
    ? validateProposedWorkstreams(
        input.proposedWorkstreams,
        questionIds,
        gapIds,
        capabilityIds,
      )
    : validateProposedWorkstreams(
        current.proposedWorkstreams,
        questionIds,
        gapIds,
        capabilityIds,
      );

  nextDraft.requirementEstimate = input.requirementEstimate
    ? validateRequirementEstimate(input.requirementEstimate)
    : current.requirementEstimate;

  const plan = validateProgrammePlan(nextDraft);
  const history = recordPlanningHistory({
    id: input.historyId,
    plan,
    eventKind: input.eventKind,
    summary: input.historySummary,
    actor: input.actor,
    at: input.updatedAt,
  });
  return {plan, history};
}

export function requestProgrammePlanApproval(input: {
  plan: ProgrammePlan;
  updatedAt: string;
  actor: PlanningActor;
  historyId: string;
  historySummary?: string;
}): {plan: ProgrammePlan; history: PlanningHistoryEntry} {
  const current = validateProgrammePlan(input.plan);
  if (
    current.lifecycle !== "draft" &&
    current.lifecycle !== "revising"
  ) {
    throw Error(
      "Only draft or revising plans may request researcher approval",
    );
  }
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  assertActor(input.actor, "request actor");

  if (current.proposedWorkstreams.length < 1) {
    throw Error("Cannot request approval without proposed workstreams");
  }
  if (current.researchQuestions.length < 1) {
    throw Error("Cannot request approval without research questions");
  }

  const plan = validateProgrammePlan({
    ...current,
    lifecycle: "awaiting_researcher_approval",
    updatedAt: input.updatedAt,
    autoGeneratedNotApproved: true,
  });
  const history = recordPlanningHistory({
    id: input.historyId,
    plan,
    eventKind: "approval_requested",
    summary:
      input.historySummary ??
      "Researcher approval requested — auto-generated plan remains unapproved.",
    actor: input.actor,
    at: input.updatedAt,
  });
  return {plan, history};
}

export function transitionProgrammePlan(input: {
  plan: ProgrammePlan;
  to: ProgrammePlanLifecycle;
  updatedAt: string;
  actor: PlanningActor;
  historyId: string;
  historySummary?: string;
}): {plan: ProgrammePlan; history: PlanningHistoryEntry} {
  const current = validateProgrammePlan(input.plan);
  assertClosed(input.to, PROGRAMME_PLAN_LIFECYCLES, "plan lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = PLAN_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal plan transition ${current.lifecycle} → ${input.to}`);
  }

  if (
    input.to === "approved" ||
    input.to === "rejected" ||
    input.to === "registered"
  ) {
    if (actor.actorKind !== "human") {
      throw Error("Only human researchers may approve, reject, or register plans");
    }
    if (
      current.proposingAgentPrincipalId !== null &&
      actor.principalId === current.proposingAgentPrincipalId
    ) {
      throw Error("Agents cannot self-approve programme plans");
    }
    if (actor.principalId === current.authoredBy.principalId) {
      throw Error("Plan author must not self-approve");
    }
  }

  if (input.to === "registered" && current.lifecycle !== "approved") {
    throw Error("Only approved plans may be registered");
  }

  let eventKind: PlanningHistoryEventKind = "superseded";
  if (input.to === "approved") eventKind = "plan_approved";
  else if (input.to === "rejected") eventKind = "plan_rejected";
  else if (input.to === "registered") eventKind = "plan_registered";
  else if (input.to === "revising") eventKind = "scope_revised";
  else if (input.to === "awaiting_researcher_approval") {
    eventKind = "approval_requested";
  } else if (input.to === "draft") eventKind = "scope_revised";
  else eventKind = "superseded";

  const plan = validateProgrammePlan({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "approved" ||
      input.to === "rejected" ||
      input.to === "registered"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
    autoGeneratedNotApproved: true,
  });

  const history = recordPlanningHistory({
    id: input.historyId,
    plan,
    eventKind,
    summary:
      input.historySummary ??
      `Plan transitioned to ${input.to} — generation still not treated as approval.`,
    actor,
    at: input.updatedAt,
  });
  return {plan, history};
}

/**
 * Revise scope and/or proposed workstream priorities. Preserves history and
 * increments planningRevision. Never auto-approves.
 */
export function reviseProgrammePlanScopeOrPriorities(input: {
  plan: ProgrammePlan;
  updatedAt: string;
  actor: PlanningActor;
  historyId: string;
  revisionKind: "scope_revised" | "priorities_revised";
  historySummary: string;
  scopeSummary?: string;
  inclusionNotes?: string;
  exclusionNotes?: string;
  proposedWorkstreams?: readonly ProposedWorkstream[];
  note?: string;
}): {plan: ProgrammePlan; history: PlanningHistoryEntry} {
  const current = validateProgrammePlan(input.plan);
  if (
    current.lifecycle !== "awaiting_researcher_approval" &&
    current.lifecycle !== "approved" &&
    current.lifecycle !== "rejected" &&
    current.lifecycle !== "draft" &&
    current.lifecycle !== "revising"
  ) {
    throw Error("Plan cannot be revised from current lifecycle");
  }
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "revise actor");
  if (actor.actorKind !== "human") {
    throw Error("Only human researchers may revise scope or priorities");
  }

  if (input.scopeSummary !== undefined) {
    if (!textOk(input.scopeSummary, 2000)) throw Error("Invalid scope summary");
    assertNoForbiddenClaimLanguage(input.scopeSummary, "scope summary");
  }
  if (input.inclusionNotes !== undefined) {
    if (!textOk(input.inclusionNotes, 2000)) {
      throw Error("Invalid inclusion notes");
    }
  }
  if (input.exclusionNotes !== undefined) {
    if (!textOk(input.exclusionNotes, 2000)) {
      throw Error("Invalid exclusion notes");
    }
  }

  const questionIds = new Set(current.researchQuestions.map((q) => q.id));
  const gapIds = new Set(current.evidenceGaps.map((g) => g.id));
  const capabilityIds = new Set(
    current.availableCapabilities.map((c) => c.capabilityId),
  );

  const proposedWorkstreams = input.proposedWorkstreams
    ? validateProposedWorkstreams(
        input.proposedWorkstreams,
        questionIds,
        gapIds,
        capabilityIds,
      )
    : current.proposedWorkstreams;

  const plan = validateProgrammePlan({
    ...current,
    lifecycle: "revising",
    planningRevision: current.planningRevision + 1,
    scopeSummary: input.scopeSummary?.trim() ?? current.scopeSummary,
    inclusionNotes: input.inclusionNotes?.trim() ?? current.inclusionNotes,
    exclusionNotes: input.exclusionNotes?.trim() ?? current.exclusionNotes,
    proposedWorkstreams,
    reviewedBy: actor,
    updatedAt: input.updatedAt,
    note: input.note !== undefined ? input.note.trim() : current.note,
    autoGeneratedNotApproved: true,
  });

  const history = recordPlanningHistory({
    id: input.historyId,
    plan,
    eventKind: input.revisionKind,
    summary: input.historySummary,
    actor,
    at: input.updatedAt,
  });
  return {plan, history};
}

/**
 * Register an approved programme plan. Does not activate PR1 workstreams by
 * itself — optional linkedWorkstreamIds may be bound on proposed workstreams.
 */
export function registerApprovedProgrammePlan(input: {
  plan: ProgrammePlan;
  updatedAt: string;
  actor: PlanningActor;
  historyId: string;
  linkedWorkstreamBindings?: ReadonlyArray<{
    proposedWorkstreamId: string;
    workstreamId: string;
  }>;
  historySummary?: string;
}): {plan: ProgrammePlan; history: PlanningHistoryEntry} {
  const current = validateProgrammePlan(input.plan);
  if (current.lifecycle !== "approved") {
    throw Error("Only approved plans may be registered");
  }
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "register actor");
  if (actor.actorKind !== "human") {
    throw Error("Only human researchers may register approved plans");
  }
  if (
    current.proposingAgentPrincipalId !== null &&
    actor.principalId === current.proposingAgentPrincipalId
  ) {
    throw Error("Agents cannot self-approve or self-register programme plans");
  }

  const bindings = new Map<string, string>();
  for (const binding of input.linkedWorkstreamBindings ?? []) {
    if (!PROPOSED_WS_ID_RE.test(binding.proposedWorkstreamId)) {
      throw Error("Invalid proposedWorkstreamId in binding");
    }
    if (!WORKSTREAM_ID_RE.test(binding.workstreamId)) {
      throw Error("Invalid workstreamId in binding");
    }
    bindings.set(binding.proposedWorkstreamId, binding.workstreamId);
  }

  const proposedWorkstreams = current.proposedWorkstreams.map((ws) => {
    const linked = bindings.get(ws.id);
    if (linked === undefined) return ws;
    return {...ws, linkedWorkstreamId: linked, autoGeneratedNotApproved: true as const};
  });

  const questionIds = new Set(current.researchQuestions.map((q) => q.id));
  const gapIds = new Set(current.evidenceGaps.map((g) => g.id));
  const capabilityIds = new Set(
    current.availableCapabilities.map((c) => c.capabilityId),
  );

  const plan = validateProgrammePlan({
    ...current,
    lifecycle: "registered",
    proposedWorkstreams: validateProposedWorkstreams(
      proposedWorkstreams,
      questionIds,
      gapIds,
      capabilityIds,
    ),
    reviewedBy: actor,
    updatedAt: input.updatedAt,
    autoGeneratedNotApproved: true,
  });

  const history = recordPlanningHistory({
    id: input.historyId,
    plan,
    eventKind: "plan_registered",
    summary:
      input.historySummary ??
      "Human-registered programme plan after approval — generation remains unapproved by itself.",
    actor,
    at: input.updatedAt,
  });
  return {plan, history};
}

export function createMemoryResearchObjectivePlanningStore(): ResearchObjectivePlanningStore & {
  objectives: Map<string, ScientificObjective>;
  plans: Map<string, ProgrammePlan>;
  history: Map<string, PlanningHistoryEntry[]>;
} {
  const objectives = new Map<string, ScientificObjective>();
  const plans = new Map<string, ProgrammePlan>();
  const history = new Map<string, PlanningHistoryEntry[]>();

  return {
    objectives,
    plans,
    history,
    upsertObjective(objective) {
      const validated = validateScientificObjective(objective);
      objectives.set(validated.id, validated);
      return validated;
    },
    getObjective(id) {
      return objectives.get(id) ?? null;
    },
    listObjectives(programmeId) {
      const all = [...objectives.values()];
      return programmeId
        ? all.filter((o) => o.programmeId === programmeId)
        : all;
    },
    upsertPlan(plan) {
      const validated = validateProgrammePlan(plan);
      plans.set(validated.id, validated);
      return validated;
    },
    getPlan(id) {
      return plans.get(id) ?? null;
    },
    listPlans(programmeId) {
      const all = [...plans.values()];
      return programmeId
        ? all.filter((p) => p.programmeId === programmeId)
        : all;
    },
    appendHistory(entry) {
      const validated = validatePlanningHistoryEntry(entry);
      const existing = history.get(validated.planId) ?? [];
      history.set(validated.planId, [...existing, validated]);
      return validated;
    },
    listHistory(planId) {
      return [...(history.get(planId) ?? [])];
    },
  };
}

export function projectResearchObjectivePlanningPersistenceLines(input: {
  objective: ScientificObjective;
  plan: ProgrammePlan;
  history?: readonly PlanningHistoryEntry[];
}): string[] {
  const objective = validateScientificObjective(input.objective);
  const plan = validateProgrammePlan(input.plan);
  const historyEntries = (input.history ?? []).map(validatePlanningHistoryEntry);
  return [
    `schema=${plan.schema}`,
    `method=${plan.method}`,
    `version=${plan.version}`,
    `programmeId=${plan.programmeId}`,
    `objectiveId=${objective.id}`,
    `planId=${plan.id}`,
    `planLifecycle=${plan.lifecycle}`,
    `planningRevision=${plan.planningRevision}`,
    `questionCount=${plan.researchQuestions.length}`,
    `dependencyCount=${plan.questionDependencies.length}`,
    `evidenceGapCount=${plan.evidenceGaps.length}`,
    `capabilityCount=${plan.availableCapabilities.length}`,
    `proposedWorkstreamCount=${plan.proposedWorkstreams.length}`,
    `historyCount=${historyEntries.length}`,
    `autoGeneratedNotApproved=true`,
    `agentsCannotSelfApprove=true`,
    `layerDistinctionsEnforced=true`,
    `noAutoApproval=true`,
    `noFabricatedDiscoveries=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `continuousEvidenceInvestigation=false`,
  ];
}

export function fingerprintProgrammePlan(plan: ProgrammePlan): string {
  const validated = validateProgrammePlan(plan);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildResearchObjectivePlanningPack(input: {
  objectives: readonly ScientificObjective[];
  plans: readonly ProgrammePlan[];
  history: readonly PlanningHistoryEntry[];
  asOf: string;
}): {
  schema: typeof RESEARCH_OBJECTIVE_PLANNING_SCHEMA;
  method: typeof RESEARCH_OBJECTIVE_PLANNING_METHOD;
  version: typeof RESEARCH_OBJECTIVE_PLANNING_VERSION;
  asOf: string;
  objectiveCount: number;
  planCount: number;
  historyCount: number;
  honesty: ResearchObjectivePlanningHonesty;
  objectives: readonly ScientificObjective[];
  plans: readonly ProgrammePlan[];
  history: readonly PlanningHistoryEntry[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const objectives = input.objectives.map(validateScientificObjective);
  const plans = input.plans.map(validateProgrammePlan);
  const history = input.history.map(validatePlanningHistoryEntry);
  return {
    schema: RESEARCH_OBJECTIVE_PLANNING_SCHEMA,
    method: RESEARCH_OBJECTIVE_PLANNING_METHOD,
    version: RESEARCH_OBJECTIVE_PLANNING_VERSION,
    asOf: input.asOf,
    objectiveCount: objectives.length,
    planCount: plans.length,
    historyCount: history.length,
    honesty: {...DEFAULT_HONESTY},
    objectives,
    plans,
    history,
  };
}
