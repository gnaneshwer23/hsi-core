/**
 * Vertical strategy decision — dual-track (option A).
 *
 * Product decision (2026-11-01): keep RA / anti-TNF as Stage 1 `scopeLocked`
 * active scope; add SSc CD4/Tfh–B-cell–IL-21 as Whole-Immune-Cell PRD MVP target
 * without wiping RA packs or flipping `partnerSigned`.
 *
 * See docs/ISI_WHOLE_IMMUNE_CELL_PRD_ALIGNMENT.md §Decision.
 */

export const VERTICAL_DECISION_SCHEMA = "hsi-vertical-decision-1" as const;

export type VerticalStrategy = "dual_track" | "ssc_pivot" | "ra_only_hold";

export type VerticalDecisionOption = "A" | "B" | "C";

export type HsiVerticalDecision = {
  schemaVersion: typeof VERTICAL_DECISION_SCHEMA;
  /** Written product choice — A dual-track / B SSc pivot / C RA-only hold. */
  option: VerticalDecisionOption;
  verticalStrategy: VerticalStrategy;
  /** Stage 1 working pilot scope id (partnerLock disease pathway). */
  activeScope: "ra-tnf";
  /** Whole-Immune-Cell PRD MVP deep vertical id. */
  prdMvpTarget: "ssc-tfh-b-il21";
  /** How existing RA packs are framed vs SSc per PRD Release 2. */
  raComparisonFraming: "release2";
  decidedAt: string;
  decidedBy: "product_owner";
  summary: string;
  constraints: string[];
  nextBacklogAfterDecision: string[];
};

/**
 * Option A — Dual-track (authorised).
 * RA remains Stage 1 locked pathway; SSc is PRD MVP deep vertical.
 */
export const HSI_VERTICAL_DECISION: HsiVerticalDecision = {
  schemaVersion: VERTICAL_DECISION_SCHEMA,
  option: "A",
  verticalStrategy: "dual_track",
  activeScope: "ra-tnf",
  prdMvpTarget: "ssc-tfh-b-il21",
  raComparisonFraming: "release2",
  decidedAt: "2026-11-01T17:00:00.000Z",
  decidedBy: "product_owner",
  summary:
    "Dual-track: keep RA / anti-TNF scopeLocked packs untouched; curate SSc Tfh–B–IL-21 as a parallel PRD MVP pathway pack. RA comparison = Release 2 framing. EBV only as hypothesized/uncertain branch. No partnerSigned flip. No clinical CDS. No RA wipe.",
  constraints: [
    "Do not delete or demote HSI-C-RA-* / HSI-E-RA-* claim or edge ids.",
    "partnerSigned / lockedPilot stay false until named partner flipRequirements are met.",
    "EBV edges must use teaching=hypothesized (or uncertain grades) — never overclaim causal merge with Tfh→B→IL-21.",
    "SSc deepSeedsPresent=true only when real literature-backed edges land.",
    "Discovery ASK question stays the RA / anti-TNF research question; SSc may surface as secondary PRD target only.",
    "Neon: red-wave only from this workspace; no fake Gate C approve.",
  ],
  nextBacklogAfterDecision: [
    "DONE (P1.1/P1.5): SSc cell-card / CL·MONDO hints + extra public PMIDs; model-proposal → Gate C pending.",
    "DONE (P1.3): gut–immune SCFA ↔ mucosal Treg/Th17 thin seeds + hsi-gut-immune-pack (uncertain/hypothesized grades).",
    "NEXT science: deepen one neuroimmune neighbourhood (P2.1) — or promote gut systems predicates onto HSI_EDGE_TYPES (P1.4).",
    "Partner outreach / partnerSigned / rights table (unchanged P0.2) — parallel critical path.",
  ],
};

export function getVerticalDecision(): HsiVerticalDecision {
  return HSI_VERTICAL_DECISION;
}

/** Compact pointer for MANIFEST / partner lock / systems vision. */
export function verticalDecisionExportPointer(
  decision: HsiVerticalDecision = getVerticalDecision(),
): {
  schemaVersion: typeof VERTICAL_DECISION_SCHEMA;
  option: VerticalDecisionOption;
  verticalStrategy: VerticalStrategy;
  activeScope: "ra-tnf";
  prdMvpTarget: "ssc-tfh-b-il21";
  raComparisonFraming: "release2";
  decidedAt: string;
} {
  return {
    schemaVersion: decision.schemaVersion,
    option: decision.option,
    verticalStrategy: decision.verticalStrategy,
    activeScope: decision.activeScope,
    prdMvpTarget: decision.prdMvpTarget,
    raComparisonFraming: decision.raComparisonFraming,
    decidedAt: decision.decidedAt,
  };
}
