/**
 * UX-01 soft-land — homepage worked conflict from sealed domain-graph candidates.
 * Uses real edge ids and citations. Never claims dual-reviewed data or confirmed contradiction.
 */
import {compareDomainEvidence,type DomainBundle} from "./domainGraph";

export const HOMEPAGE_WORKED_CONFLICT_SCHEMA = "hsi-homepage-worked-conflict-1" as const;

/** Default gut→T1D pair used across domain Brief v2 / graph explorer demos. */
export const HOMEPAGE_WORKED_CONFLICT_EDGE_IDS = ["DIAB-003", "DIAB-015"] as const;

export type HomepageWorkedConflict = {
  schemaVersion: typeof HOMEPAGE_WORKED_CONFLICT_SCHEMA;
  questionId: "gut-t1d";
  leftEdgeId: string;
  rightEdgeId: string;
  leftAssertion: string;
  rightAssertion: string;
  leftSource: {
    id: string;
    title: string;
    url: string;
    identityStatus: string;
  } | null;
  rightSource: {
    id: string;
    title: string;
    url: string;
    identityStatus: string;
  } | null;
  differences: ReadonlyArray<{dimension: string; left: string; right: string}>;
  sameEntityPair: boolean;
  classification: "context_comparison_required";
  confirmedContradiction: false;
  pooledEffectAllowed: false;
  scientificApproval: false;
  /** Dual-reviewer release has not happened; counts stay zero. */
  reviewedEdgeCount: 0;
  reviewStates: {left: "unreviewed"; right: "unreviewed"};
  graphVersion: string;
  honestyNote: string;
};

export function buildHomepageWorkedConflict(
  bundle: DomainBundle,
  edgeIds: readonly [string, string] = HOMEPAGE_WORKED_CONFLICT_EDGE_IDS,
): HomepageWorkedConflict | null {
  const comparison = compareDomainEvidence(bundle, edgeIds[0], edgeIds[1]);
  if (!comparison) return null;
  const leftSource = bundle.sources.find((s) => s.id === comparison.left.sourceId) ?? null;
  const rightSource = bundle.sources.find((s) => s.id === comparison.right.sourceId) ?? null;
  const src = (s: typeof leftSource) =>
    s
      ? {
          id: s.id,
          title: s.title,
          url: s.url,
          identityStatus: s.identityStatus,
        }
      : null;
  return {
    schemaVersion: HOMEPAGE_WORKED_CONFLICT_SCHEMA,
    questionId: "gut-t1d",
    leftEdgeId: comparison.left.id,
    rightEdgeId: comparison.right.id,
    leftAssertion: comparison.left.assertion,
    rightAssertion: comparison.right.assertion,
    leftSource: src(leftSource),
    rightSource: src(rightSource),
    differences: comparison.differences,
    sameEntityPair: comparison.sameEntityPair,
    classification: "context_comparison_required",
    confirmedContradiction: false,
    pooledEffectAllowed: false,
    scientificApproval: false,
    reviewedEdgeCount: 0,
    reviewStates: {left: "unreviewed", right: "unreviewed"},
    graphVersion: bundle.version,
    honestyNote:
      "Source-candidate comparison from the sealed domain graph. Edges remain unreviewed. Confirmed contradiction stays false until dual independent review (Track C3/C5).",
  };
}
