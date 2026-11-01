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

/** ASK → MAP → REVIEW → TEST → LEARN — research workflow framing. */
export const HSI_DISCOVERY_LOOP_STEPS = [
  {
    id: "ask",
    label: "ASK",
    order: 1,
    desc: "Scoped research question for one immune-mediated disease (RA/TNF working scope; partnerSigned still open).",
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
    seedHint: "IL-23 / mucosal barrier illustrative edges when present in seeds",
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
  /** Compact lock pointer — scopeLocked until named partner flips partnerSigned. */
  partnerLock: ReturnType<typeof partnerLockExportPointer>;
  /** Full durable lock record for consumers that want flipRequirements / honesty. */
  partnerLockDetail: HsiPartnerLock;
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
    partnerLock: partnerLockExportPointer(lock),
    partnerLockDetail: lock,
    gradeVocabulary: ["established", "uncertain", "unexplored"],
    notes: [
      "Phase 6 done: Target R1 Discovery Centre product surface at site `/discovery` (consumes bun run outputs).",
      "Phase 7 done: R2 VALIDATE tab loads hsi-r2-validation.json (hypothesis cards / ranked gaps; research only).",
      "RA is the Phase 2 working Stage 1 scope (scopeLocked=true; partnerSigned=false; lockedPilot=false).",
      "Do not treat SLE/PsO/IBD as selected pilot indications — illustrative conversation contexts only.",
      "Not diagnostic / not for clinical use. Akeno clinical intelligence remains gated later.",
      "Phase 8 = R3–R5 / Akeno translation — explicit ask + Stage 3 gates only.",
    ],
  };
}
