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
    "DONE (P2.1): neuroimmune vagus / cholinergic anti-inflammatory reflex + hsi-neuroimmune-pack (uncertain/hypothesized; no clinical cure claim).",
    "DONE (P2.2): embedding sidecar slots (hash/ref; hsi-embedding-sidecars.json; doesNotSetHsiGrade).",
    "DONE (P2.3): offline eval harness stubs against public packs (hsi-model-eval-harness.*; no PHI / no training).",
    "DONE (P2.4): ClinVar/TCGA pointer metadata (hsi-external-genome-pointers.json; citation/ref; reviewRequired; no bulk dump / PHI).",
    "DONE (P2.5): P3 adapter RFC + license matrix (docs/P3_ADAPTER_RFC.md; hsi-p3-adapter-license-matrix.*; honest signOffStatus; no weight vendoring).",
    "DONE (P3.0): RDKit thin adapter spike (hsi-rdkit-adapter-proposals.*; runtime stub|rdkit; ModelProposalArtifacts → Gate C pending; license gate refuses blockedUntilSignOff).",
    "DONE (P3.1): OpenMM thin adapter spike (hsi-openmm-adapter-proposals.*; runtime stub|openmm; ModelProposalArtifacts → Gate C pending; cites HSI-E-NI-003 / HSI-E-GUT-003; MD ≠ Gate C evidence alone).",
    "DONE (P3.2): REINVENT4 thin adapter spike (hsi-reinvent4-adapter-proposals.*; runtime stub|reinvent; ModelProposalArtifacts → Gate C pending; never clinic path; no multi-GB weights; Boltz deferred).",
    "NEXT science: P3.3 FAIR ESM-2 thin embedding stub (proposal/sidecar only; no weight vendoring) — Boltz remains deferred (multi-GB weights). Prefer backlog pivot to partner P0.2 / ISI consumption if partner outreach is ready.",
    "Partner outreach / partnerSigned / rights table (unchanged P0.2) — parallel critical path (prefer after thin P3 spikes).",
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
