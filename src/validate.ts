/**
 * HSI Phase 0 — minimal validation helpers (no network, no PHI).
 */
import {
  hsiGradeFromCuration,
  isHsiCurationReview,
  isHsiGrade,
  isHsiTeachingStatus,
  type HsiCurationReview,
  type HsiGrade,
} from "./grades";
import {
  isHsiDomain,
  isHsiEdgeType,
  type HsiEdge,
  type HsiTranslationCard,
} from "./schema";

export type HsiValidationIssue = {
  path: string;
  message: string;
};

export type HsiValidationResult = {
  ok: boolean;
  issues: HsiValidationIssue[];
};

function issue(path: string, message: string): HsiValidationIssue {
  return { path, message };
}

/** CDS must stay HITL and never treat unexplored/uncertain as established support. */
export function isCdsSurfacable(edge: Pick<HsiEdge, "curationReview" | "hsiGrade">): boolean {
  return edge.curationReview === "approved" && edge.hsiGrade === "established";
}

/** Discovery surfaces may show any grade but must keep honesty labels. */
export function isDiscoverySurfacable(edge: Pick<HsiEdge, "curationReview">): boolean {
  return edge.curationReview !== "rejected" && edge.curationReview !== "superseded";
}

export function validateProvenancePmid(pmid: string | null): HsiValidationIssue | null {
  if (pmid == null || pmid === "") return null;
  if (!/^\d{6,9}$/.test(pmid.trim())) {
    return issue("provenance.pmid", "PMID must be 6–9 digits or null (never invent).");
  }
  return null;
}

export function validateHsiEdge(edge: HsiEdge): HsiValidationResult {
  const issues: HsiValidationIssue[] = [];

  if (!edge.id?.trim()) issues.push(issue("id", "Edge id is required."));
  if (!isHsiEdgeType(edge.edgeType)) issues.push(issue("edgeType", `Unknown edge type: ${String(edge.edgeType)}`));
  if (!edge.subjectId?.trim() || !edge.objectId?.trim()) {
    issues.push(issue("endpoints", "subjectId and objectId are required."));
  }
  if (!edge.claimId?.trim()) issues.push(issue("claimId", "claimId is required."));
  if (!isHsiCurationReview(edge.curationReview)) {
    issues.push(issue("curationReview", `Invalid curation review: ${String(edge.curationReview)}`));
  }
  if (!isHsiGrade(edge.hsiGrade)) {
    issues.push(issue("hsiGrade", `Invalid HSI grade: ${String(edge.hsiGrade)}`));
  }
  if (!isHsiTeachingStatus(edge.teachingStatus)) {
    issues.push(issue("teachingStatus", `Invalid teaching status: ${String(edge.teachingStatus)}`));
  }
  if (!isHsiDomain(edge.domain)) {
    issues.push(issue("domain", `Invalid domain: ${String(edge.domain)}`));
  }

  if (isHsiCurationReview(edge.curationReview) && isHsiGrade(edge.hsiGrade)) {
    const expected = hsiGradeFromCuration(edge.curationReview);
    // Soft consistency: established requires approved; approved should not be unexplored.
    if (edge.hsiGrade === "established" && edge.curationReview !== "approved") {
      issues.push(
        issue(
          "hsiGrade",
          "hsiGrade=established requires curationReview=approved (no silent promotion).",
        ),
      );
    }
    if (edge.curationReview === "approved" && edge.hsiGrade === "unexplored") {
      issues.push(
        issue(
          "hsiGrade",
          `approved edges map to ${expected}, not unexplored.`,
        ),
      );
    }
  }

  const pmidIssue = validateProvenancePmid(edge.provenance?.pmid ?? null);
  if (pmidIssue) issues.push(pmidIssue);

  if (edge.curationReview === "source-verified" || edge.curationReview === "approved") {
    const hasLocator =
      Boolean(edge.provenance?.pmid?.trim()) ||
      Boolean(edge.provenance?.doi?.trim()) ||
      Boolean(edge.provenance?.citationLabel?.trim());
    if (!hasLocator) {
      issues.push(
        issue(
          "provenance",
          "source-verified/approved edges need pmid, doi, or citationLabel.",
        ),
      );
    }
  }

  return { ok: issues.length === 0, issues };
}

export function validateTranslationCard(card: HsiTranslationCard): HsiValidationResult {
  const issues: HsiValidationIssue[] = [];
  const edgeResult = validateHsiEdge(card.edge);
  for (const i of edgeResult.issues) {
    issues.push(issue(`edge.${i.path}`, i.message));
  }

  if (card.claim.id !== card.edge.claimId) {
    issues.push(issue("claim.id", "claim.id must match edge.claimId."));
  }
  if (card.observation.markerId !== card.marker.id) {
    issues.push(issue("observation.markerId", "observation.markerId must match marker.id."));
  }
  if (card.observation.dataClass === undefined) {
    issues.push(issue("observation.dataClass", "dataClass is required (fixture | deid_aggregate | unknown)."));
  }
  if (card.action.requiresHitl !== true) {
    issues.push(issue("action.requiresHitl", "Actions must require HITL (no auto write-back)."));
  }
  if (card.action.cdsEligibleHint && !isCdsSurfacable(card.edge)) {
    issues.push(
      issue(
        "action.cdsEligibleHint",
        "cdsEligibleHint=true only when curation=approved and hsiGrade=established.",
      ),
    );
  }

  return { ok: issues.length === 0, issues };
}

export function summarizeGradeCounts(
  edges: readonly Pick<HsiEdge, "hsiGrade">[],
): Record<HsiGrade, number> {
  const out: Record<HsiGrade, number> = {
    established: 0,
    uncertain: 0,
    unexplored: 0,
  };
  for (const e of edges) {
    if (isHsiGrade(e.hsiGrade)) out[e.hsiGrade] += 1;
  }
  return out;
}

/** Helper for seeding: coerce grade from curation so axes stay consistent. */
export function gradeForSeed(review: HsiCurationReview): HsiGrade {
  return hsiGradeFromCuration(review);
}
