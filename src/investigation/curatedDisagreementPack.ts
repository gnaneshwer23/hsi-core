/**
 * Curated disagreement demonstration pack — audit PR #5.
 * References sealed domain-graph edge pairs only. Not scientific gold,
 * not SME adjudication, not a proven contradiction set.
 * Browser-safe (no Node-only imports).
 */

import {
  compareDomainEvidence,
  type DomainBundle,
  type DomainEdge,
  type DomainSource,
} from "../knowledgeGraph/domainGraph";

export const CURATED_DISAGREEMENT_PACK_SCHEMA = "hsi-curated-disagreement-pack-1" as const;

export type CuratedDisagreementCaseId =
  | "gut-t1d-metabolite-vs-longitudinal"
  | "ssc-tfh-fibrosis-same-entity"
  | "gut-treg-vs-scfa-th17"
  | "neuro-vagus-vs-splenic-route"
  | "ra-tnf-vs-il6-pathway";

export type CuratedDisagreementDemoClass =
  | "context_dependent_difference"
  | "same_entity_method_difference"
  | "insufficient_comparability";

export type CuratedDisagreementCaseRef = {
  id: CuratedDisagreementCaseId;
  questionId: string;
  title: string;
  leftEdgeId: string;
  rightEdgeId: string;
  whyCurated: string;
  expectedClass: CuratedDisagreementDemoClass;
};

/** Fixed catalog: edge ids must already exist in the sealed domain graph. */
export const CURATED_DISAGREEMENT_CASE_REFS: readonly CuratedDisagreementCaseRef[] = Object.freeze([
  {
    id: "gut-t1d-metabolite-vs-longitudinal",
    questionId: "gut-t1d",
    title: "Microbial metabolites (mouse) vs childhood microbiome (human) in type 1 diabetes",
    leftEdgeId: "DIAB-003",
    rightEdgeId: "DIAB-015",
    whyCurated:
      "Homepage worked-conflict pair: model and study design differ; same disease question.",
    expectedClass: "context_dependent_difference",
  },
  {
    id: "ssc-tfh-fibrosis-same-entity",
    questionId: "ssc-tfh",
    title: "T follicular helper cells and skin fibrosis — same entity, different study design",
    leftEdgeId: "HSI-C-SSC-005",
    rightEdgeId: "HSI-C-SSC-008",
    whyCurated: "Same subject–object pair with a study-design difference only.",
    expectedClass: "same_entity_method_difference",
  },
  {
    id: "gut-treg-vs-scfa-th17",
    questionId: "gut-immune",
    title: "Clostridia / Treg accumulation vs SCFA-driven Th17 differentiation",
    leftEdgeId: "HSI-C-GUT-001",
    rightEdgeId: "HSI-C-GUT-005",
    whyCurated: "Gut–immune candidates that diverge on outcome entity and predicate.",
    expectedClass: "context_dependent_difference",
  },
  {
    id: "neuro-vagus-vs-splenic-route",
    questionId: "brain-immune",
    title: "Vagus stimulation vs splenic-nerve requirement in anti-inflammatory signalling",
    leftEdgeId: "HSI-C-NI-001",
    rightEdgeId: "HSI-C-NI-008",
    whyCurated: "Neuroimmune pathway candidates with different anatomical emphases.",
    expectedClass: "context_dependent_difference",
  },
  {
    id: "ra-tnf-vs-il6-pathway",
    questionId: "ra-pathway",
    title: "TNF-driven synovial inflammation vs IL-6 pathway benefit after anti-TNF",
    leftEdgeId: "HSI-C-RA-001",
    rightEdgeId: "HSI-C-RA-005",
    whyCurated: "Rheumatoid arthritis pathway seeds that compete on mechanism emphasis.",
    expectedClass: "insufficient_comparability",
  },
]);

export type CuratedDisagreementPackHonesty = {
  scientificApproval: false;
  confirmedContradiction: false;
  isScientificGold: false;
  inventsDoisOrPassages: false;
  demonstrationOnly: true;
  smeAdjudication: false;
  usp: "A";
};

export const CURATED_DISAGREEMENT_PACK_HONESTY: CuratedDisagreementPackHonesty = {
  scientificApproval: false,
  confirmedContradiction: false,
  isScientificGold: false,
  inventsDoisOrPassages: false,
  demonstrationOnly: true,
  smeAdjudication: false,
  usp: "A",
};

export type CuratedDisagreementCaseView = {
  id: CuratedDisagreementCaseId;
  questionId: string;
  title: string;
  whyCurated: string;
  demoClass: CuratedDisagreementDemoClass;
  left: DomainEdge;
  right: DomainEdge;
  leftSource: DomainSource | null;
  rightSource: DomainSource | null;
  differences: ReadonlyArray<{ dimension: string; left: string; right: string }>;
  missingContext: readonly string[];
  sameEntityPair: boolean;
  confirmedContradiction: false;
  scientificApproval: false;
};

export type CuratedDisagreementPack = {
  schemaVersion: typeof CURATED_DISAGREEMENT_PACK_SCHEMA;
  honesty: CuratedDisagreementPackHonesty;
  graphVersion: string;
  cases: readonly CuratedDisagreementCaseView[];
  unresolvedCaseIds: readonly CuratedDisagreementCaseId[];
};

export function assertCuratedDisagreementPackHonesty(
  honesty: CuratedDisagreementPackHonesty,
): CuratedDisagreementPackHonesty {
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.confirmedContradiction !== false) {
    throw Error("confirmedContradiction must be false");
  }
  if (honesty.isScientificGold !== false) throw Error("isScientificGold must be false");
  if (honesty.inventsDoisOrPassages !== false) {
    throw Error("inventsDoisOrPassages must be false");
  }
  if (honesty.demonstrationOnly !== true) throw Error("demonstrationOnly must be true");
  if (honesty.smeAdjudication !== false) throw Error("smeAdjudication must be false");
  if (honesty.usp !== "A") throw Error("usp must be A");
  return honesty;
}

function sourceFor(bundle: DomainBundle, edge: DomainEdge): DomainSource | null {
  return bundle.sources.find((s) => s.id === edge.sourceId) ?? null;
}

function classifyDemo(
  ref: CuratedDisagreementCaseRef,
  comparison: NonNullable<ReturnType<typeof compareDomainEvidence>>,
): CuratedDisagreementDemoClass {
  // Same-entity pairs always surface as method difference; otherwise keep the curated label.
  if (comparison.sameEntityPair) return "same_entity_method_difference";
  return ref.expectedClass;
}

/** Resolve catalog edge pairs against a sealed domain-graph bundle. */
export function buildCuratedDisagreementPack(bundle: DomainBundle): CuratedDisagreementPack {
  const honesty = assertCuratedDisagreementPackHonesty(CURATED_DISAGREEMENT_PACK_HONESTY);
  const cases: CuratedDisagreementCaseView[] = [];
  const unresolved: CuratedDisagreementCaseId[] = [];

  for (const ref of CURATED_DISAGREEMENT_CASE_REFS) {
    const comparison = compareDomainEvidence(bundle, ref.leftEdgeId, ref.rightEdgeId);
    if (!comparison) {
      unresolved.push(ref.id);
      continue;
    }
    cases.push({
      id: ref.id,
      questionId: ref.questionId,
      title: ref.title,
      whyCurated: ref.whyCurated,
      demoClass: classifyDemo(ref, comparison),
      left: comparison.left,
      right: comparison.right,
      leftSource: sourceFor(bundle, comparison.left),
      rightSource: sourceFor(bundle, comparison.right),
      differences: comparison.differences,
      missingContext: comparison.missingContext,
      sameEntityPair: comparison.sameEntityPair,
      confirmedContradiction: false,
      scientificApproval: false,
    });
  }

  return {
    schemaVersion: CURATED_DISAGREEMENT_PACK_SCHEMA,
    honesty,
    graphVersion: bundle.version,
    cases,
    unresolvedCaseIds: unresolved,
  };
}

export const CURATED_DEMO_CLASS_LABEL: Record<CuratedDisagreementDemoClass, string> = {
  context_dependent_difference: "Context-dependent difference",
  same_entity_method_difference: "Same entity · method difference",
  insufficient_comparability: "Insufficient comparability (demo)",
};
