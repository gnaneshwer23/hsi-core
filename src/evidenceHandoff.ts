/**
 * Bridge evidence / Gate C handoff labels for ISI curation UI.
 *
 * Orthogonal axes:
 * - evidence link = durable locator on the HSI seed (PMID/DOI/label)
 * - Gate C handoff = HSI curationReview path toward human approve
 * - Neon Gate C pass = separate ISI approve+supports on the REL-* (not set here)
 *
 * Never collapses teachingStatus / hsiGrade / CDS into these labels.
 */
import type { HsiEdge } from "./schema";
import { hasEvidenceLocator } from "./seed/t2dImmunoMetabolic";
import { isCdsSurfacable } from "./validate";

/** Whether the HSI seed carries a literature locator. */
export type HsiEvidenceLinkStatus = "unlinked" | "evidence_linked";

/**
 * HSI-side Gate C handoff — not Neon `isGateCSupportingEvidence`.
 * `passed` here only means HSI curationReview=approved (still requires ISI Neon approve).
 */
export type HsiGateCHandoffStatus = "not_started" | "pending" | "hsi_passed";

export type HsiEvidenceHandoff = {
  evidenceLink: HsiEvidenceLinkStatus;
  gateC: HsiGateCHandoffStatus;
  /** Curator-facing compound label. */
  label: string;
  pmid: string | null;
  doi: string | null;
  /** Always false until HSI approved + established (CDS invariant). */
  cdsSurfacable: false | true;
};

export function hsiEvidenceHandoff(
  edge: Pick<HsiEdge, "provenance" | "curationReview" | "hsiGrade">,
): HsiEvidenceHandoff {
  const linked = hasEvidenceLocator(edge);
  const evidenceLink: HsiEvidenceLinkStatus = linked ? "evidence_linked" : "unlinked";

  let gateC: HsiGateCHandoffStatus;
  if (edge.curationReview === "approved") {
    gateC = "hsi_passed";
  } else if (linked) {
    gateC = "pending";
  } else {
    gateC = "not_started";
  }

  let label: string;
  if (evidenceLink === "unlinked") {
    label = "unlinked · Gate C not started";
  } else if (gateC === "hsi_passed") {
    label = "evidence-linked · HSI Gate C passed (Neon approve still separate)";
  } else {
    label = "evidence-linked · Gate C pending";
  }

  return {
    evidenceLink,
    gateC,
    label,
    pmid: edge.provenance?.pmid?.trim() || null,
    doi: edge.provenance?.doi?.trim() || null,
    cdsSurfacable: isCdsSurfacable(edge),
  };
}
