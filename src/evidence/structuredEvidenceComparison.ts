/**
 * Milestone 2 / Phase 3 — Structured evidence comparison (pairwise).
 *
 * Extends contextual candidate relationships + opposing/gap honesty.
 * Does NOT create a parallel contradiction stack, invent scientific validity,
 * auto-promote to the approved graph, or treat association scores as causation.
 *
 * Outcomes (closed set):
 * - consistent
 * - potential_contradiction
 * - context_dependent
 * - methodological_difference
 * - insufficient_comparability
 * - insufficient_evidence
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import type {
  CandidateBiologicalContext,
  ContextualCandidateRelationship,
  FindingPolarity,
} from "./contextualCandidateRelationships";

export const STRUCTURED_EVIDENCE_COMPARISON_SCHEMA =
  "hsi-structured-evidence-comparison-1" as const;
export const STRUCTURED_EVIDENCE_COMPARISON_METHOD =
  "hsi.structured_evidence_comparison.v1" as const;
export const STRUCTURED_EVIDENCE_COMPARISON_VERSION = "0.1.0" as const;

export type StructuredComparisonOutcome =
  | "consistent"
  | "potential_contradiction"
  | "context_dependent"
  | "methodological_difference"
  | "insufficient_comparability"
  | "insufficient_evidence";

export type ComparableEvidenceUnit = {
  id: string;
  label: string;
  subject: {system: string; value: string; label: string | null};
  predicate: string;
  object: {system: string; value: string; label: string | null};
  findingPolarity: FindingPolarity;
  biologicalContext: CandidateBiologicalContext;
  evidenceSourceIds: readonly string[];
  sourceProvider: string;
  responseIdentity: string | null;
  /** Optional free-text method/assay note when not modelled in context axes. */
  methodologicalNote: string | null;
};

export type ContextAxisOverlap = {
  axis:
    | "diseasePhenotype"
    | "organTissueCellState"
    | "genesProteinsPathways"
    | "experimentalSystemsSpecies"
    | "interventionsTargets";
  sharedValues: readonly string[];
  onlyA: readonly string[];
  onlyB: readonly string[];
};

export type StructuredComparisonTrace = {
  leftId: string;
  rightId: string;
  sharedSubjectObject: boolean;
  polarityPair: `${FindingPolarity}:${FindingPolarity}`;
  contextAxes: readonly ContextAxisOverlap[];
  sharedContextAxisCount: number;
  divergentContextAxisCount: number;
  methodologicalSignals: readonly string[];
  evidenceSourceIds: readonly string[];
};

export type StructuredEvidenceComparison = {
  schemaVersion: typeof STRUCTURED_EVIDENCE_COMPARISON_SCHEMA;
  id: string;
  method: typeof STRUCTURED_EVIDENCE_COMPARISON_METHOD;
  version: typeof STRUCTURED_EVIDENCE_COMPARISON_VERSION;
  left: ComparableEvidenceUnit;
  right: ComparableEvidenceUnit;
  outcome: StructuredComparisonOutcome;
  rationale: string;
  trace: StructuredComparisonTrace;
  claimSupport: "not_assessed";
  scientificApproval: false;
  graphPromotable: false;
  needsHumanReview: true;
  honesty: {
    metadataOrDeclaredContextOnly: true;
    associationScoreIsNotCausation: true;
    fixturesAreNotLiveEvidence: true;
    incompleteSearchDistinctFromConsensus: true;
    potentialContradictionIsNotProvenContradiction: true;
    gateCAutoApprove: false;
    cdsPhi: false;
    autoPromotedToApprovedGraph: false;
  };
};

export type StructuredEvidenceComparisonPack = {
  schemaVersion: "hsi-structured-evidence-comparison-pack-1";
  method: typeof STRUCTURED_EVIDENCE_COMPARISON_METHOD;
  version: typeof STRUCTURED_EVIDENCE_COMPARISON_VERSION;
  generatedAt: string;
  comparisons: readonly StructuredEvidenceComparison[];
  summary: {
    consistent: number;
    potentialContradiction: number;
    contextDependent: number;
    methodologicalDifference: number;
    insufficientComparability: number;
    insufficientEvidence: number;
  };
  honesty: StructuredEvidenceComparison["honesty"] & {
    pairwiseOnly: true;
    notScientificValidity: true;
  };
};

const CONTEXT_AXES = [
  "diseasePhenotype",
  "organTissueCellState",
  "genesProteinsPathways",
  "experimentalSystemsSpecies",
  "interventionsTargets",
] as const;

function fail(message: string): never {
  throw new Error(message);
}

function entityKey(entity: {system: string; value: string}): string {
  return `${entity.system.trim().toLowerCase()}::${entity.value.trim().toLowerCase()}`;
}

function contextValueKeys(
  rows: readonly {system: string; value: string; label: string | null}[],
): string[] {
  return [
    ...new Set(
      rows
        .map((r) => `${r.system.trim().toLowerCase()}::${r.value.trim().toLowerCase()}`)
        .filter((k) => k !== "::"),
    ),
  ];
}

function overlapForAxis(
  axis: (typeof CONTEXT_AXES)[number],
  left: CandidateBiologicalContext,
  right: CandidateBiologicalContext,
): ContextAxisOverlap {
  const a = new Set(contextValueKeys(left[axis]));
  const b = new Set(contextValueKeys(right[axis]));
  const sharedValues = [...a].filter((k) => b.has(k)).sort();
  const onlyA = [...a].filter((k) => !b.has(k)).sort();
  const onlyB = [...b].filter((k) => !a.has(k)).sort();
  return {axis, sharedValues, onlyA, onlyB};
}

function hasAnyContext(ctx: CandidateBiologicalContext): boolean {
  return CONTEXT_AXES.some((axis) => ctx[axis].length > 0);
}

function assertUnit(unit: ComparableEvidenceUnit, side: "left" | "right"): void {
  if (!unit.id.trim()) fail(`Comparable unit ${side} requires id`);
  if (!unit.subject.system.trim() || !unit.subject.value.trim()) {
    fail(`Comparable unit ${side} requires subject`);
  }
  if (!unit.object.system.trim() || !unit.object.value.trim()) {
    fail(`Comparable unit ${side} requires object`);
  }
  if (!["supporting", "opposing", "uncertain"].includes(unit.findingPolarity)) {
    fail(`Comparable unit ${side} has invalid findingPolarity`);
  }
}

/**
 * Project a contextual candidate relationship into a comparable unit.
 * Preserves draft honesty — does not invent polarity or context.
 */
export function comparableUnitFromContextualCandidate(
  rel: ContextualCandidateRelationship,
): ComparableEvidenceUnit {
  if (rel.claimSupport !== false || rel.scientificApproval !== false || rel.graphPromotable !== false) {
    fail("Contextual candidate must stay unapproved / non-promotable / claimSupport=false");
  }
  return {
    id: rel.id,
    label: `${rel.subject.label ?? rel.subject.value} ${rel.predicate} ${rel.object.label ?? rel.object.value}`,
    subject: rel.subject,
    predicate: rel.predicate,
    object: rel.object,
    findingPolarity: rel.findingPolarity,
    biologicalContext: rel.biologicalContext,
    evidenceSourceIds: rel.evidenceSourceIds,
    sourceProvider: rel.sourceProvider,
    responseIdentity: rel.responseIdentity,
    methodologicalNote: null,
  };
}

function comparisonId(leftId: string, rightId: string, outcome: StructuredComparisonOutcome): string {
  const [a, b] = [leftId, rightId].sort();
  return `cmp:${createHash("sha256")
    .update(canonicalEvidenceJson({a, b, outcome, v: STRUCTURED_EVIDENCE_COMPARISON_VERSION}))
    .digest("hex")
    .slice(0, 32)}`;
}

function methodologicalSignals(left: ComparableEvidenceUnit, right: ComparableEvidenceUnit): string[] {
  const out: string[] = [];
  const leftNote = left.methodologicalNote?.trim().toLowerCase() ?? "";
  const rightNote = right.methodologicalNote?.trim().toLowerCase() ?? "";
  if (leftNote && rightNote && leftNote !== rightNote) {
    out.push(`method_note_diff:${left.methodologicalNote}||${right.methodologicalNote}`);
  }
  const leftExp = contextValueKeys(left.biologicalContext.experimentalSystemsSpecies);
  const rightExp = contextValueKeys(right.biologicalContext.experimentalSystemsSpecies);
  if (leftExp.length > 0 && rightExp.length > 0) {
    const shared = leftExp.filter((k) => rightExp.includes(k));
    if (shared.length === 0) out.push("experimental_system_disjoint");
  }
  if (left.predicate.trim().toLowerCase() !== right.predicate.trim().toLowerCase()) {
    out.push(`predicate_diff:${left.predicate}||${right.predicate}`);
  }
  return out;
}

function decideOutcome(input: {
  sharedSubjectObject: boolean;
  polarityA: FindingPolarity;
  polarityB: FindingPolarity;
  sharedContextAxisCount: number;
  divergentContextAxisCount: number;
  leftHasContext: boolean;
  rightHasContext: boolean;
  methodologicalSignals: readonly string[];
}): {outcome: StructuredComparisonOutcome; rationale: string} {
  const {polarityA, polarityB} = input;
  const bothUncertain = polarityA === "uncertain" && polarityB === "uncertain";
  const opposingPair =
    (polarityA === "supporting" && polarityB === "opposing") ||
    (polarityA === "opposing" && polarityB === "supporting");
  const samePolarity =
    polarityA === polarityB && (polarityA === "supporting" || polarityA === "opposing");

  if (!input.leftHasContext && !input.rightHasContext && bothUncertain) {
    return {
      outcome: "insufficient_evidence",
      rationale:
        "Both sides lack biological context and declared polarity is uncertain — comparison abstains rather than inventing agreement or contradiction.",
    };
  }

  if (!input.sharedSubjectObject && input.sharedContextAxisCount === 0) {
    return {
      outcome: "insufficient_comparability",
      rationale:
        "Subject/object pairs differ and no shared biological-context axis values were recorded — records are not comparable without curator-declared alignment.",
    };
  }

  if (!input.leftHasContext || !input.rightHasContext) {
    return {
      outcome: "insufficient_evidence",
      rationale:
        "At least one side lacks biological context axes needed for governed comparison. Incomplete context ≠ proven consistency or contradiction.",
    };
  }

  if (opposingPair && input.sharedContextAxisCount > 0 && input.divergentContextAxisCount === 0) {
    return {
      outcome: "potential_contradiction",
      rationale:
        "Opposite finding polarities under shared biological context axes. This is a potential contradiction candidate for human review — not a proven scientific contradiction.",
    };
  }

  if (opposingPair && input.divergentContextAxisCount > 0) {
    if (input.methodologicalSignals.includes("experimental_system_disjoint") || input.methodologicalSignals.some((s) => s.startsWith("method_note_diff"))) {
      return {
        outcome: "methodological_difference",
        rationale:
          "Opposite polarities coincide with disjoint experimental systems or method notes. Treat as methodological difference until expert adjudication — not automatic contradiction.",
      };
    }
    return {
      outcome: "context_dependent",
      rationale:
        "Opposite or tensioned polarities appear under divergent biological context (disease/tissue/species/etc.). Context difference may explain disagreement; do not collapse into contradiction.",
    };
  }

  if (samePolarity && input.sharedContextAxisCount > 0 && input.divergentContextAxisCount === 0) {
    return {
      outcome: "consistent",
      rationale:
        "Matching finding polarities under shared biological context axes. Consistency here is metadata/declared-context alignment only — not scientific validation or claim support.",
    };
  }

  if (samePolarity && input.divergentContextAxisCount > 0) {
    return {
      outcome: "context_dependent",
      rationale:
        "Matching polarities but divergent context axes. Findings may be context-specific rather than globally consistent.",
    };
  }

  if (input.methodologicalSignals.length > 0 && !samePolarity) {
    return {
      outcome: "methodological_difference",
      rationale:
        "Predicate or experimental-system signals differ while polarity is not jointly supporting. Record as methodological difference pending human review.",
    };
  }

  if (bothUncertain) {
    return {
      outcome: "insufficient_evidence",
      rationale:
        "Both polarities are uncertain. Abstain from consistency or contradiction labels until curator-declared polarity or deeper evidence clearance.",
    };
  }

  return {
    outcome: "insufficient_comparability",
    rationale:
      "Comparable fields were insufficient to justify consistency, contradiction, or context-dependence under honesty constraints.",
  };
}

/**
 * Pairwise structured comparison of two evidence units.
 * Never emits scientificApproval / graphPromotable / claim support.
 */
export function compareEvidenceUnits(input: {
  left: ComparableEvidenceUnit;
  right: ComparableEvidenceUnit;
}): StructuredEvidenceComparison {
  assertUnit(input.left, "left");
  assertUnit(input.right, "right");

  const sharedSubjectObject =
    entityKey(input.left.subject) === entityKey(input.right.subject) &&
    entityKey(input.left.object) === entityKey(input.right.object);

  const contextAxes = CONTEXT_AXES.map((axis) =>
    overlapForAxis(axis, input.left.biologicalContext, input.right.biologicalContext),
  );
  const sharedContextAxisCount = contextAxes.filter((a) => a.sharedValues.length > 0).length;
  const divergentContextAxisCount = contextAxes.filter(
    (a) => a.onlyA.length > 0 || a.onlyB.length > 0,
  ).length;
  const methodSignals = methodologicalSignals(input.left, input.right);
  const leftHasContext = hasAnyContext(input.left.biologicalContext);
  const rightHasContext = hasAnyContext(input.right.biologicalContext);

  const decided = decideOutcome({
    sharedSubjectObject,
    polarityA: input.left.findingPolarity,
    polarityB: input.right.findingPolarity,
    sharedContextAxisCount,
    divergentContextAxisCount,
    leftHasContext,
    rightHasContext,
    methodologicalSignals: methodSignals,
  });

  const evidenceSourceIds = [
    ...new Set([...input.left.evidenceSourceIds, ...input.right.evidenceSourceIds]),
  ].slice(0, 64);

  const comparison: StructuredEvidenceComparison = {
    schemaVersion: STRUCTURED_EVIDENCE_COMPARISON_SCHEMA,
    id: comparisonId(input.left.id, input.right.id, decided.outcome),
    method: STRUCTURED_EVIDENCE_COMPARISON_METHOD,
    version: STRUCTURED_EVIDENCE_COMPARISON_VERSION,
    left: input.left,
    right: input.right,
    outcome: decided.outcome,
    rationale: decided.rationale,
    trace: {
      leftId: input.left.id,
      rightId: input.right.id,
      sharedSubjectObject,
      polarityPair: `${input.left.findingPolarity}:${input.right.findingPolarity}`,
      contextAxes,
      sharedContextAxisCount,
      divergentContextAxisCount,
      methodologicalSignals: methodSignals,
      evidenceSourceIds,
    },
    claimSupport: "not_assessed",
    scientificApproval: false,
    graphPromotable: false,
    needsHumanReview: true,
    honesty: {
      metadataOrDeclaredContextOnly: true,
      associationScoreIsNotCausation: true,
      fixturesAreNotLiveEvidence: true,
      incompleteSearchDistinctFromConsensus: true,
      potentialContradictionIsNotProvenContradiction: true,
      gateCAutoApprove: false,
      cdsPhi: false,
      autoPromotedToApprovedGraph: false,
    },
  };

  if (comparison.scientificApproval !== false || comparison.graphPromotable !== false) {
    fail("Structured comparison must stay unapproved / non-promotable");
  }
  if (comparison.claimSupport !== "not_assessed") fail("Claim support fabrication refused");
  return comparison;
}

/**
 * Compare all unique pairs among contextual candidates (bounded).
 * Default maxPairs=25 to keep packs inspectable.
 */
export function compareContextualCandidatePairs(input: {
  relationships: readonly ContextualCandidateRelationship[];
  generatedAt?: string;
  maxPairs?: number;
}): StructuredEvidenceComparisonPack {
  const maxPairs = Math.min(100, Math.max(1, input.maxPairs ?? 25));
  const units = input.relationships.map(comparableUnitFromContextualCandidate);
  const comparisons: StructuredEvidenceComparison[] = [];
  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      if (comparisons.length >= maxPairs) break;
      comparisons.push(compareEvidenceUnits({left: units[i]!, right: units[j]!}));
    }
    if (comparisons.length >= maxPairs) break;
  }

  const summary = {
    consistent: comparisons.filter((c) => c.outcome === "consistent").length,
    potentialContradiction: comparisons.filter((c) => c.outcome === "potential_contradiction").length,
    contextDependent: comparisons.filter((c) => c.outcome === "context_dependent").length,
    methodologicalDifference: comparisons.filter((c) => c.outcome === "methodological_difference")
      .length,
    insufficientComparability: comparisons.filter((c) => c.outcome === "insufficient_comparability")
      .length,
    insufficientEvidence: comparisons.filter((c) => c.outcome === "insufficient_evidence").length,
  };

  return {
    schemaVersion: "hsi-structured-evidence-comparison-pack-1",
    method: STRUCTURED_EVIDENCE_COMPARISON_METHOD,
    version: STRUCTURED_EVIDENCE_COMPARISON_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    comparisons,
    summary,
    honesty: {
      metadataOrDeclaredContextOnly: true,
      associationScoreIsNotCausation: true,
      fixturesAreNotLiveEvidence: true,
      incompleteSearchDistinctFromConsensus: true,
      potentialContradictionIsNotProvenContradiction: true,
      gateCAutoApprove: false,
      cdsPhi: false,
      autoPromotedToApprovedGraph: false,
      pairwiseOnly: true,
      notScientificValidity: true,
    },
  };
}

/**
 * Thin projector for gap/workbench consumers — contradiction candidates only.
 * Does not invent scientifically_verified labels.
 */
export function projectPotentialContradictionTraces(
  pack: StructuredEvidenceComparisonPack,
): {
  schemaVersion: "hsi-potential-contradiction-traces-1";
  traces: readonly {
    comparisonId: string;
    outcome: StructuredComparisonOutcome;
    rationale: string;
    leftId: string;
    rightId: string;
    evidenceSourceIds: readonly string[];
    needsHumanReview: true;
    scientificallyVerified: false;
  }[];
  honesty: {
    potentialContradictionIsNotProvenContradiction: true;
    projectedFromStructuredComparison: true;
    notAParallelGapSystem: true;
  };
} {
  const interesting = pack.comparisons.filter(
    (c) =>
      c.outcome === "potential_contradiction" ||
      c.outcome === "context_dependent" ||
      c.outcome === "methodological_difference",
  );
  return {
    schemaVersion: "hsi-potential-contradiction-traces-1",
    traces: interesting.map((c) => ({
      comparisonId: c.id,
      outcome: c.outcome,
      rationale: c.rationale,
      leftId: c.left.id,
      rightId: c.right.id,
      evidenceSourceIds: c.trace.evidenceSourceIds,
      needsHumanReview: true as const,
      scientificallyVerified: false as const,
    })),
    honesty: {
      potentialContradictionIsNotProvenContradiction: true,
      projectedFromStructuredComparison: true,
      notAParallelGapSystem: true,
    },
  };
}
