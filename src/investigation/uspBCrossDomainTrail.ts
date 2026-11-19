/**
 * USP B — Cross-domain scientific investigation: pure trail helpers for the
 * live workspace. Reuses the published domain graph + department projections.
 * Does not invent edges, causal mechanisms, or scientific approval.
 * Browser-safe (no Node-only imports).
 */

import type { DomainBundle, DomainEdge, DomainNode } from "../knowledgeGraph/domainGraph";
import {
  DEPARTMENT_SLUGS,
  crossDepartmentPaths,
  departmentCoverage,
  departmentsOfNode,
  type CrossDepartmentPath,
  type CrossDepartmentResult,
  type DepartmentSlug,
} from "../knowledgeGraph/departments";

export const USP_B_TRAIL_SCHEMA = "hsi-usp-b-cross-domain-trail-1" as const;

export type UspBTrailStepId =
  | "ask"
  | "domains"
  | "pathways"
  | "gaps"
  | "brief";

export type UspBTrailStepState = "pending" | "ready" | "active" | "complete";

export type UspBTrailStep = {
  id: UspBTrailStepId;
  label: string;
  state: UspBTrailStepState;
  detail: string;
};

export type UspBTrailHonesty = {
  causalConclusionAllowed: false;
  scientificApproval: false;
  inventsEdges: false;
  associationIsNotCausation: true;
  candidatePathsAreNotValidatedMechanisms: true;
  aiHypothesesRemainUnvalidated: true;
  usp: "B";
};

export const USP_B_TRAIL_HONESTY: UspBTrailHonesty = {
  causalConclusionAllowed: false,
  scientificApproval: false,
  inventsEdges: false,
  associationIsNotCausation: true,
  candidatePathsAreNotValidatedMechanisms: true,
  aiHypothesesRemainUnvalidated: true,
  usp: "B",
};

export type UspBEvidenceStatus =
  | "candidate"
  | "research_gap"
  | "ai_hypothesis"
  | "unknown";

export const USP_B_EVIDENCE_STATUS_LABEL: Record<UspBEvidenceStatus, string> = {
  candidate: "Candidate (unreviewed)",
  research_gap: "Research gap",
  ai_hypothesis: "AI hypothesis (unvalidated)",
  unknown: "Unknown / not stated",
};

export type UspBNodeMatch = {
  label: string;
  nodeId: string;
  nodeName: string;
  departments: readonly DepartmentSlug[];
  score: "exact" | "alias" | "contains";
};

export type UspBPathHopView = {
  edgeId: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  predicate: string;
  evidenceStatus: UspBEvidenceStatus;
  evidenceStops: boolean;
  model: string;
  tissue: string | null;
};

export type UspBPathView = {
  index: number;
  hopCount: number;
  departmentsTraversed: readonly DepartmentSlug[];
  evidenceChain: CrossDepartmentPath["evidenceChain"];
  boundaries: readonly number[];
  warnings: readonly string[];
  causalConclusionAllowed: false;
  hops: readonly UspBPathHopView[];
  reconstruct: CrossDepartmentPath["reconstruct"];
};

export type UspBTrailInput = {
  hasRun: boolean;
  graphLoaded: boolean;
  matchedNodeCount: number;
  selectedStartId: string | null;
  selectedTargetDepartment: DepartmentSlug | null;
  pathCount: number;
  selectedPathIndex: number | null;
  gapCount: number;
  hypothesisCount: number;
  briefOpen: boolean;
};

function norm(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

/** Map a published edge into an honest USP B evidence status (never invent reviewed). */
export function edgeEvidenceStatus(edge: Pick<DomainEdge, "kind" | "reviewStatus">): UspBEvidenceStatus {
  switch (edge.kind) {
    case "research_gap":
      return "research_gap";
    case "source_candidate":
      // Domain graph edges are unreviewed by schema; keep candidate until review exists.
      return edge.reviewStatus === "unreviewed" ? "candidate" : "unknown";
    default: {
      const _exhaustive: never = edge.kind;
      return _exhaustive;
    }
  }
}

/** Match live-run entity labels to published graph nodes without inventing entities. */
export function matchRunLabelsToGraphNodes(
  bundle: Pick<DomainBundle, "nodes">,
  labels: readonly string[],
  limit = 8,
): UspBNodeMatch[] {
  const cleaned = [...new Set(labels.map((l) => l.trim()).filter((l) => l.length >= 2))];
  const out: UspBNodeMatch[] = [];
  const seen = new Set<string>();

  const tryPush = (
    label: string,
    node: DomainNode,
    score: UspBNodeMatch["score"],
  ) => {
    if (seen.has(node.id) || out.length >= limit) return;
    seen.add(node.id);
    out.push({
      label,
      nodeId: node.id,
      nodeName: node.name,
      departments: departmentsOfNode(node),
      score,
    });
  };

  for (const label of cleaned) {
    const nLabel = norm(label);
    if (!nLabel) continue;
    for (const node of bundle.nodes) {
      if (norm(node.name) === nLabel) tryPush(label, node, "exact");
    }
    for (const node of bundle.nodes) {
      if (node.aliases.some((a) => norm(a) === nLabel)) tryPush(label, node, "alias");
    }
  }

  for (const label of cleaned) {
    const nLabel = norm(label);
    if (nLabel.length < 3) continue;
    for (const node of bundle.nodes) {
      const nName = norm(node.name);
      if (nName.includes(nLabel) || nLabel.includes(nName)) tryPush(label, node, "contains");
    }
  }

  return out;
}

/** Prefer multi-department matches; otherwise keep single-department starts honest. */
export function suggestCrossDomainStarts(
  matches: readonly UspBNodeMatch[],
  limit = 6,
): readonly UspBNodeMatch[] {
  const multi = matches.filter((m) => m.departments.length > 1);
  const single = matches.filter((m) => m.departments.length <= 1);
  return [...multi, ...single].slice(0, limit);
}

export function defaultTargetDepartment(
  start: UspBNodeMatch | null,
): DepartmentSlug {
  if (!start) return "neuroscience";
  const owned = new Set(start.departments);
  for (const slug of DEPARTMENT_SLUGS) {
    if (!owned.has(slug) && slug !== "genomics-multi-omics" && slug !== "human-physiology") {
      return slug;
    }
  }
  return "neuroscience";
}

export function buildUspBPathViews(
  bundle: DomainBundle,
  fromId: string,
  toDepartment: DepartmentSlug,
  options: { maxHops?: number; maxPaths?: number } = {},
): { result: CrossDepartmentResult; paths: readonly UspBPathView[] } {
  const result = crossDepartmentPaths(bundle, fromId, toDepartment, {
    maxHops: options.maxHops ?? 4,
    maxPaths: options.maxPaths ?? 6,
  });
  const nameOf = (id: string) => bundle.nodes.find((n) => n.id === id)?.name ?? id;
  const edgeOf = (id: string) => bundle.edges.find((e) => e.id === id);

  const paths: UspBPathView[] = result.paths.map((path, index) => ({
    index,
    hopCount: path.hops.length,
    departmentsTraversed: path.departmentsTraversed,
    evidenceChain: path.evidenceChain,
    boundaries: path.boundaries,
    warnings: path.warnings,
    causalConclusionAllowed: false as const,
    reconstruct: path.reconstruct,
    hops: path.hops.map((h) => {
      const edge = edgeOf(h.edgeId);
      return {
        edgeId: h.edgeId,
        fromId: h.fromId,
        toId: h.toId,
        fromName: nameOf(h.fromId),
        toName: nameOf(h.toId),
        predicate: h.predicate,
        evidenceStatus: edge
          ? edgeEvidenceStatus(edge)
          : h.evidence === "research_gap"
            ? "research_gap"
            : "unknown",
        evidenceStops: h.evidenceStops,
        model: h.model,
        tissue: h.tissue,
      };
    }),
  }));

  return { result, paths };
}

export function summarizeDepartments(bundle: DomainBundle) {
  return departmentCoverage(bundle);
}

/** Build the five-step USP B product trail for the live workspace UI. */
export function buildUspBCrossDomainTrail(input: UspBTrailInput): {
  schemaVersion: typeof USP_B_TRAIL_SCHEMA;
  honesty: UspBTrailHonesty;
  steps: readonly UspBTrailStep[];
  activeStep: UspBTrailStepId;
} {
  const hasStart = Boolean(input.selectedStartId);
  const hasPathFocus = input.selectedPathIndex !== null && input.pathCount > 0;
  const hasGaps = input.gapCount > 0 || input.hypothesisCount > 0;

  let active: UspBTrailStepId = "ask";
  if (input.briefOpen && input.hasRun) active = "brief";
  else if (hasPathFocus && hasGaps) active = "gaps";
  else if (hasPathFocus || (hasStart && input.selectedTargetDepartment)) active = "pathways";
  else if (input.graphLoaded) active = "domains";
  else active = "ask";

  const step = (
    id: UspBTrailStepId,
    label: string,
    complete: boolean,
    ready: boolean,
    detail: string,
  ): UspBTrailStep => ({
    id,
    label,
    state:
      active === id
        ? "active"
        : complete
          ? "complete"
          : ready
            ? "ready"
            : "pending",
    detail,
  });

  const steps: UspBTrailStep[] = [
    step(
      "ask",
      "Ask",
      input.hasRun,
      true,
      input.hasRun
        ? "Question recorded for this run"
        : "Enter or reopen a research question",
    ),
    step(
      "domains",
      "Domains",
      hasStart,
      input.graphLoaded,
      input.graphLoaded
        ? input.matchedNodeCount > 0
          ? `${input.matchedNodeCount} graph match(es) from run labels — candidates only`
          : "Graph loaded; no label match yet — pick a published start concept"
        : "Load the published cross-domain graph",
    ),
    step(
      "pathways",
      "Pathways",
      hasPathFocus,
      hasStart && Boolean(input.selectedTargetDepartment),
      input.pathCount > 0
        ? `${input.pathCount} candidate path(s) — not validated mechanisms`
        : hasStart
          ? "No path within bound, or target has no coverage — gap, not proof of absence"
          : "Choose a start concept and target department",
    ),
    step(
      "gaps",
      "Gaps & hypotheses",
      hasGaps && hasPathFocus,
      input.hasRun || input.pathCount > 0,
      hasGaps
        ? `${input.gapCount} gap(s), ${input.hypothesisCount} unvalidated AI hypothesis(es)`
        : "Gaps appear from the run and path boundaries; AI proposals stay demoted",
    ),
    step(
      "brief",
      "Decision brief",
      input.briefOpen && input.hasRun,
      input.hasRun,
      input.hasRun
        ? "Evidence-linked brief with limitations (not scientific gold)"
        : "Available after a run",
    ),
  ];

  return {
    schemaVersion: USP_B_TRAIL_SCHEMA,
    honesty: USP_B_TRAIL_HONESTY,
    steps,
    activeStep: active,
  };
}

export function assertUspBTrailHonesty(honesty: UspBTrailHonesty): UspBTrailHonesty {
  if (honesty.usp !== "B") throw new Error("trail must be labelled USP B");
  if (
    honesty.scientificApproval !== false ||
    honesty.inventsEdges !== false ||
    honesty.causalConclusionAllowed !== false ||
    honesty.associationIsNotCausation !== true ||
    honesty.candidatePathsAreNotValidatedMechanisms !== true ||
    honesty.aiHypothesesRemainUnvalidated !== true
  ) {
    throw new Error("USP B trail must keep fail-closed honesty flags");
  }
  return honesty;
}
