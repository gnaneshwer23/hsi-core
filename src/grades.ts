/**
 * HSI Phase 0 — shared evidence grades.
 *
 * Two orthogonal axes (same split as ISI evidenceDimensions):
 * 1. curationReview — human Gate C / review lifecycle (ISI ReviewStatus)
 * 2. hsiGrade — coarse cross-product band for Aksh + ISI (established / uncertain / unexplored)
 *
 * Teaching evidence_status (ESTABLISHED / …) stays a separate KG label; never merge axes into one score.
 */

/** ISI review lifecycle — labels match STATUS_INFO in immune/evidenceStatus. */
export const HSI_CURATION_REVIEWS = [
  "draft",
  "unreviewed",
  "source-verified",
  "claim-assessed",
  "approved",
  "rejected",
  "conflicting",
  "superseded",
] as const;

export type HsiCurationReview = (typeof HSI_CURATION_REVIEWS)[number];

export const HSI_CURATION_LABELS: Record<
  HsiCurationReview,
  { label: string; desc: string }
> = {
  draft: {
    label: "Draft",
    desc: "Added to close a coverage gap; not yet reviewed by an expert.",
  },
  unreviewed: {
    label: "Unreviewed",
    desc: "No source has been mapped to this claim yet.",
  },
  "source-verified": {
    label: "Source linked",
    desc: "Carries a PubMed ID or DOI, but nobody has yet checked the source supports this exact claim.",
  },
  "claim-assessed": {
    label: "Partially supported",
    desc: "A reviewed source supports part of this claim.",
  },
  approved: {
    label: "Supported",
    desc: "An approved source was checked and supports this directional claim.",
  },
  rejected: {
    label: "Rejected",
    desc: "Reviewed sources do not address this claim.",
  },
  conflicting: {
    label: "Conflicting",
    desc: "Reviewed sources disagree about this claim.",
  },
  superseded: {
    label: "Superseded",
    desc: "Replaced by a newer claim.",
  },
};

/**
 * Roadmap coarse band shared by Aksh HITL CDS + ISI discovery.
 * Not a Gate C decision and not a confidence score.
 */
export const HSI_GRADES = ["established", "uncertain", "unexplored"] as const;
export type HsiGrade = (typeof HSI_GRADES)[number];

export const HSI_GRADE_INFO: Record<HsiGrade, { label: string; desc: string }> = {
  established: {
    label: "Established",
    desc: "Human-supported claim with durable provenance; safe to surface under HITL / discovery constraints.",
  },
  uncertain: {
    label: "Uncertain",
    desc: "Partial support, conflict, or source-linked but not claim-assessed — label honesty required.",
  },
  unexplored: {
    label: "Unexplored",
    desc: "Draft, unreviewed, or no mapped source — discovery only; never CDS-actionable.",
  },
};

/**
 * Optional teaching / KG evidence_status vocabulary (orthogonal to curation + hsiGrade).
 * Aligns with ISI honestEvidenceStatus style labels.
 */
export const HSI_TEACHING_STATUSES = [
  "established",
  "associative",
  "hypothesized",
  "unknown",
] as const;
export type HsiTeachingStatus = (typeof HSI_TEACHING_STATUSES)[number];

/** Map ISI curation review → HSI coarse grade (never invents support). */
export function hsiGradeFromCuration(review: HsiCurationReview): HsiGrade {
  switch (review) {
    case "approved":
      return "established";
    case "claim-assessed":
    case "source-verified":
    case "conflicting":
      return "uncertain";
    case "draft":
    case "unreviewed":
    case "rejected":
    case "superseded":
      return "unexplored";
    default: {
      const _exhaustive: never = review;
      return _exhaustive;
    }
  }
}

/** Map teaching evidence_status → coarse HSI grade when curation is absent. */
export function hsiGradeFromTeaching(status: HsiTeachingStatus): HsiGrade {
  switch (status) {
    case "established":
      return "established";
    case "associative":
    case "hypothesized":
      return "uncertain";
    case "unknown":
      return "unexplored";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function isHsiCurationReview(v: unknown): v is HsiCurationReview {
  return typeof v === "string" && (HSI_CURATION_REVIEWS as readonly string[]).includes(v);
}

export function isHsiGrade(v: unknown): v is HsiGrade {
  return typeof v === "string" && (HSI_GRADES as readonly string[]).includes(v);
}

export function isHsiTeachingStatus(v: unknown): v is HsiTeachingStatus {
  return typeof v === "string" && (HSI_TEACHING_STATUSES as readonly string[]).includes(v);
}
