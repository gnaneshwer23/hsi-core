/**
 * Discovery Centre vocabulary for Stage 1 exports + site product surface.
 *
 * Labels match the Discovery Loop and illustrative disease picker
 * (see docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md). Phase 6 ships a usable
 * research-intelligence surface at `site/` `/discovery` that consumes published
 * packs — not clinical CDS, not a partner-signed lock, not Akeno.
 */
import {
  getPartnerLock,
  partnerLockExportPointer,
  type HsiPartnerLock,
} from "./partnerLock";
import {
  getVerticalDecision,
  verticalDecisionExportPointer,
} from "./verticalDecision";

/** ASK → MAP → REVIEW → TEST → LEARN — research workflow framing. */
export const HSI_DISCOVERY_LOOP_STEPS = [
  {
    id: "ask",
    label: "ASK",
    order: 1,
    desc: "Scoped research question for one immune-mediated disease (RA/TNF working scope; partnerSigned still open). SSc is secondary PRD target only — does not replace this ASK.",
  },
  {
    id: "map",
    label: "MAP",
    order: 2,
    desc: "Traceable evidence map: claims, grades, provenance, entity slice.",
  },
  {
    id: "review",
    label: "REVIEW",
    order: 3,
    desc: "Human Gate C / expert challenge — never auto-approve into product KG.",
  },
  {
    id: "test",
    label: "TEST",
    order: 4,
    desc: "Expert shortlist of gaps / hypotheses worth testing next.",
  },
  {
    id: "learn",
    label: "LEARN",
    order: 5,
    desc: "Versioned outputs + honest rejections feed the next ASK.",
  },
] as const;

export type HsiDiscoveryLoopStepId = (typeof HSI_DISCOVERY_LOOP_STEPS)[number]["id"];

/**
 * Illustrative disease contexts from the Discovery Centre concept picker.
 * RA is the working Stage 1 scope (scopeLocked); none are partnerSigned.
 */
export const HSI_ILLUSTRATIVE_DISEASE_CONTEXTS = [
  {
    id: "ra",
    label: "Rheumatoid arthritis",
    shortLabel: "RA",
    status: "scope_locked_working_pilot" as const,
    lockedPilot: false as const,
    seedHint:
      "TNF / IL-6 / ADA / RF·ACPA / anti-TNF response-heterogeneity — Phase 3 depth on Phase 2 scope lock",
  },
  {
    id: "ssc",
    label: "Systemic sclerosis",
    shortLabel: "SSc",
    status: "prd_mvp_secondary_target" as const,
    lockedPilot: false as const,
    seedHint:
      "Dual-track PRD MVP: CD4/Tfh–B–IL-21 thin literature slice (hsi-ssc-pathway-pack); EBV hypothesized only — does not replace RA ASK",
  },
  {
    id: "sle",
    label: "Systemic lupus erythematosus",
    shortLabel: "SLE",
    status: "illustrative_only" as const,
    lockedPilot: false as const,
    seedHint: "Type I IFN / ANA / anti-dsDNA illustrative edges when present in seeds",
  },
  {
    id: "psoriasis",
    label: "Psoriasis / psoriatic disease",
    shortLabel: "PsO",
    status: "illustrative_only" as const,
    lockedPilot: false as const,
    seedHint: "IL-17 / IL-23 / Th17 illustrative edges when present in seeds",
  },
  {
    id: "ibd",
    label: "Inflammatory bowel disease",
    shortLabel: "IBD",
    status: "illustrative_only" as const,
    lockedPilot: false as const,
    seedHint:
      "IL-23 / mucosal barrier illustrative edges; systems secondary gut–immune pack (SCFA ↔ Treg/Th17) is separate — does not replace RA ASK",
  },
] as const;

/** Systems secondary axes surfaced beside RA ASK (never replace scope lock). */
export const HSI_SYSTEMS_SECONDARY_AXES = [
  {
    id: "gut-scfa-mucosal-treg-th17",
    label: "Gut–immune · SCFA ↔ mucosal Treg / Th17",
    status: "systems_secondary_axis" as const,
    deepSeedsPresent: true as const,
    packFile: "hsi-gut-immune-pack.json",
    seedHint:
      "P1.3 thin literature slice — uncertain/hypothesized grades; Th17 promote vs inhibit competing; not CDS",
  },
  {
    id: "ssc-tfh-b-il21",
    label: "SSc · Tfh–B–IL-21 (PRD MVP)",
    status: "prd_mvp_secondary_target" as const,
    deepSeedsPresent: true as const,
    packFile: "hsi-ssc-pathway-pack.json",
    seedHint:
      "Dual-track A PRD target — does not replace RA ASK; EBV hypothesized only",
  },
] as const;

export type HsiIllustrativeDiseaseId =
  (typeof HSI_ILLUSTRATIVE_DISEASE_CONTEXTS)[number]["id"];

export type HsiDiscoveryCentreMeta = {
  schemaVersion: "hsi-discovery-centre-meta-1";
  /** Phase 6: site `/discovery` loads regenerable packs (research intelligence only). */
  surfaceRole: "site_product_surface";
  /** False once Phase 6 shipped — surface is usable but still not clinical / not Akeno. */
  notInteractiveUi: false;
  /** Path on the hsi-core vision site. */
  productSurfacePath: "/discovery";
  notLockedPilotIndications: true;
  notCds: true;
  discoveryLoop: {
    framing: "ASK → MAP → REVIEW → TEST → LEARN";
    steps: typeof HSI_DISCOVERY_LOOP_STEPS;
  };
  illustrativeDiseaseContexts: typeof HSI_ILLUSTRATIVE_DISEASE_CONTEXTS;
  /** Systems secondary axes (gut / SSc) — never replace RA ASK. */
  systemsSecondaryAxes: typeof HSI_SYSTEMS_SECONDARY_AXES;
  /** Compact lock pointer — scopeLocked until named partner flips partnerSigned. */
  partnerLock: ReturnType<typeof partnerLockExportPointer>;
  /** Full durable lock record for consumers that want flipRequirements / honesty. */
  partnerLockDetail: HsiPartnerLock;
  /** Dual-track vertical decision — SSc secondary; ASK stays RA. */
  verticalDecision: ReturnType<typeof verticalDecisionExportPointer>;
  gradeVocabulary: ["established", "uncertain", "unexplored"];
  notes: string[];
};

/** Bundle Discovery Centre vocabulary for ISI export / pilot pack consumers. */
export function buildDiscoveryCentreMeta(
  lock: HsiPartnerLock = getPartnerLock(),
): HsiDiscoveryCentreMeta {
  return {
    schemaVersion: "hsi-discovery-centre-meta-1",
    surfaceRole: "site_product_surface",
    notInteractiveUi: false,
    productSurfacePath: "/discovery",
    notLockedPilotIndications: true,
    notCds: true,
    discoveryLoop: {
      framing: "ASK → MAP → REVIEW → TEST → LEARN",
      steps: HSI_DISCOVERY_LOOP_STEPS,
    },
    illustrativeDiseaseContexts: HSI_ILLUSTRATIVE_DISEASE_CONTEXTS,
    systemsSecondaryAxes: HSI_SYSTEMS_SECONDARY_AXES,
    partnerLock: partnerLockExportPointer(lock),
    partnerLockDetail: lock,
    verticalDecision: verticalDecisionExportPointer(getVerticalDecision()),
    gradeVocabulary: ["established", "uncertain", "unexplored"],
    notes: [
      "Phase 6 done: Target R1 Discovery Centre product surface at site `/discovery` (consumes bun run outputs).",
      "Phase 7 done: R2 VALIDATE tab loads hsi-r2-validation.json (hypothesis cards / ranked gaps; research only).",
      "Phase 8 done (HSI substrate): TRANSLATE tab + /akeno HITL consumer load hsi-translation-handoff.json — Stage 3 scaffolding; clinicalActive=false; not live CDS.",
      "RA is the Phase 2 working Stage 1 scope (scopeLocked=true; partnerSigned=false; lockedPilot=false).",
      "Dual-track A: SSc surfaces as prd_mvp_secondary_target only — ASK research question stays RA / anti-TNF.",
      "P1.3: gut–immune SCFA ↔ mucosal Treg/Th17 is a systems secondary axis (hsi-gut-immune-pack) — does not replace ASK.",
      "Do not treat SLE/PsO/IBD as selected pilot indications — illustrative conversation contexts only.",
      "Not diagnostic / not for clinical use. teachingStatus ≠ hsiGrade ≠ CDS.",
    ],
  };
}
