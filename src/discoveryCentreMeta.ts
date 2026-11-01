/**
 * Discovery Centre–aligned vocabulary for Stage 1 exports.
 *
 * Labels match the concept-site Discovery Loop and illustrative disease picker
 * (see docs/ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md). These are **metadata only** —
 * not an interactive map UI, not a partner-signed lock, not clinical claims.
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
    desc: "Scoped research question for one immune-mediated disease (provisional scaffold until partner-signed lock).",
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
 * Conversation starters — only RA carries a provisionalLock scaffold; none are partner-signed.
 */
export const HSI_ILLUSTRATIVE_DISEASE_CONTEXTS = [
  {
    id: "ra",
    label: "Rheumatoid arthritis",
    shortLabel: "RA",
    status: "provisional_scaffold" as const,
    lockedPilot: false as const,
    seedHint: "TNF / IL-6 / anti-CCP / anti-TNF response-heterogeneity provisional pathway",
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
  /** Concept-site framing only — Stage 1 delivers packs, not the interactive Discovery Centre. */
  surfaceRole: "metadata_labels_only";
  notInteractiveUi: true;
  notLockedPilotIndications: true;
  notCds: true;
  discoveryLoop: {
    framing: "ASK → MAP → REVIEW → TEST → LEARN";
    steps: typeof HSI_DISCOVERY_LOOP_STEPS;
  };
  illustrativeDiseaseContexts: typeof HSI_ILLUSTRATIVE_DISEASE_CONTEXTS;
  /** Compact lock pointer — provisional until named partner flips lockedPilot. */
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
    surfaceRole: "metadata_labels_only",
    notInteractiveUi: true,
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
      "RA carries a provisionalLock scaffold (lockedPilot=false) — not a partner-signed indication.",
      "Do not treat SLE/PsO/IBD as selected pilot indications — illustrative conversation contexts only.",
      "Do not build the interactive Discovery Loop / disease switcher in hsi-core for Stage 1.",
      "Ship four pilot outputs via bun run outputs; product UI consumes published artifacts.",
    ],
  };
}
