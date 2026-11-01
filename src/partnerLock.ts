/**
 * Partner disease / question lock scaffold for the ISI Stage 1 pilot.
 *
 * Honesty rules:
 * - No fake signed partners or MoUs.
 * - `lockedPilot` stays false until a named partner confirms disease + question.
 * - `provisionalLock` may point at the strongest existing seed pathway so
 *   substrate + review rubric can advance before outreach closes.
 *
 * Flip path (requires a real partner — not code alone):
 * 1. Named partner confirms disease + research question in writing.
 * 2. Set status → scoping|active, lockedPilot → true, clear provisional flags.
 * 3. Replace partner.id/label with the real org (still no invented emails).
 * 4. Refresh partner-scoped seeds + source licensing; re-run bun run outputs.
 */

export const PARTNER_LOCK_SCHEMA = "hsi-partner-lock-1" as const;

export type PartnerLockStatus =
  | "unlocked"
  | "provisional"
  | "outreach"
  | "interested"
  | "scoping"
  | "active"
  | "archived";

export type HsiPartnerRef = {
  /** Stable id — outreach category or named partner when real. */
  id: string;
  label: string;
  /** Shortlist type from ISI_PILOT_PARTNER_SHORTLIST.md */
  type:
    | "immunology_researcher"
    | "translational_scientist"
    | "clinician_scientist"
    | "disease_foundation"
    | "outreach_category"
    | "named_partner";
  region: "UK" | "EU" | "US" | "other" | "unspecified";
  /** Never invent emails or MoUs. */
  contactChannel: "public_institute_channel" | "programme_introduction" | "named_contact" | "none";
  /** Tracking status from shortlist — candidates only until confirmed. */
  outreachStatus: "candidate" | "interested" | "scoping" | "confirmed" | "declined" | "none";
  notes: string;
};

/**
 * Durable lock fields consumed by pack, Discovery Centre meta, MANIFEST, rubric.
 * When provisional: disease/question are filled but must not be read as partner-signed.
 */
export type HsiPartnerLock = {
  schemaVersion: typeof PARTNER_LOCK_SCHEMA;
  /** True only after a named partner confirms — never set from substrate alone. */
  lockedPilot: boolean;
  /**
   * Explicit provisional scaffold from shortlist + strongest seed pathway.
   * Mutual honesty: provisionalLock=true implies lockedPilot=false.
   */
  provisionalLock: boolean;
  status: PartnerLockStatus;
  disease: {
    id: string;
    label: string;
    shortLabel: string;
  } | null;
  researchQuestion: string | null;
  /** Candidate example questions from the pilot brief (conversation starters). */
  candidateQuestions: string[];
  partner: HsiPartnerRef | null;
  /** Seed pathway this provisional lock is anchored to. */
  seedPathway: {
    id: string;
    label: string;
    rationale: string;
    primaryClaimIds: string[];
    primaryEdgeIds: string[];
    primaryPmids: string[];
  } | null;
  /** What a real partner must still supply to flip lockedPilot. */
  flipRequirements: string[];
  honesty: string[];
  updatedAt: string;
};

/**
 * Provisional RA / anti-TNF response lock.
 *
 * Why this pathway (not SLE/PsO/IBD): densest durable literature in seeds —
 * TNF→RA (PMID 11244034), anti-CCP LOINC marker, IL-6 / anti-TNF-refractory
 * (PMID 18625622), macrophage→TNF (PMID 2993897), plus Gate C handoff patterns
 * already used for PMID 16382236-style provenance.
 *
 * Partner remains an outreach *category* from the shortlist — not a signed MoU.
 */
export const HSI_PROVISIONAL_PARTNER_LOCK: HsiPartnerLock = {
  schemaVersion: PARTNER_LOCK_SCHEMA,
  lockedPilot: false,
  provisionalLock: true,
  status: "provisional",
  disease: {
    id: "ra",
    label: "Rheumatoid arthritis",
    shortLabel: "RA",
  },
  researchQuestion:
    "Why do some patients with rheumatoid arthritis respond differently to anti-TNF therapy, and which biomarkers or immune mechanisms are best supported for defining those subgroups?",
  candidateQuestions: [
    "Why do some patients respond differently to a particular therapy?",
    "Which biomarkers or immune mechanisms are supported by evidence for a defined subgroup?",
    "What evidence gaps should inform the next experiment or study?",
  ],
  partner: {
    id: "outreach:uk-versus-arthritis-ndorms-category",
    label:
      "UK disease-focused / academic rheum outreach category (Versus Arthritis network · Oxford NDORMS / Kennedy Institute — illustrative targets only)",
    type: "outreach_category",
    region: "UK",
    contactChannel: "public_institute_channel",
    outreachStatus: "candidate",
    notes:
      "From ISI_PILOT_PARTNER_SHORTLIST.md — not a confirmed partner, MoU, or named PI commitment. Contact via public programme / institute channels only.",
  },
  seedPathway: {
    id: "ra-tnf-response-heterogeneity",
    label: "RA · TNF / ACPA · anti-TNF response heterogeneity",
    rationale:
      "Strongest existing immune-disease seed slice: TNF→RA + anti-CCP (LOINC) + IL-6 / anti-TNF-refractory literature already wired for Gate C handoff. Matches pilot-brief example questions on therapy response and subgroup biomarkers.",
    primaryClaimIds: [
      "HSI-C-RA-001",
      "HSI-C-RA-002",
      "HSI-C-RA-003",
      "HSI-C-RA-004",
      "HSI-C-RA-005",
      "HSI-C-RA-006",
      "HSI-C-IM-002",
      "HSI-C-IM-003",
    ],
    primaryEdgeIds: [
      "HSI-E-RA-001",
      "HSI-E-RA-002",
      "HSI-E-RA-003",
      "HSI-E-RA-004",
      "HSI-E-RA-005",
      "HSI-E-RA-006",
      "HSI-E-IM-002",
      "HSI-E-IM-003",
    ],
    primaryPmids: ["11244034", "10662881", "11087881", "18625622", "2993897"],
  },
  flipRequirements: [
    "Named partner confirms disease = rheumatoid arthritis (or explicitly chooses a different disease).",
    "Named partner confirms or rewrites the research question in their words.",
    "Record real outreach row in ISI_PILOT_PARTNER_SHORTLIST.md (org, type, region, status) — still no invented emails.",
    "Agree source licensing / attribution for the partner source set.",
    "Agree scientific review rubric thresholds (time saved, usefulness, rejections) with the partner.",
    "Set lockedPilot=true, provisionalLock=false, status=scoping|active, partner.type=named_partner.",
    "Re-run bun run outputs and refresh the pilot evidence pack + review rubric against the signed question.",
  ],
  honesty: [
    "provisionalLock=true does NOT mean a partner signed or locked the pilot.",
    "lockedPilot remains false until flipRequirements are met.",
    "Outreach category partners are not MoUs; do not invent personal contacts.",
    "Exports must surface status=provisional so consumers cannot mistake this for a live pilot contract.",
  ],
  updatedAt: "2026-11-01T12:00:00.000Z",
};

/** Active lock used by pack / export builders (provisional until a real flip). */
export function getPartnerLock(): HsiPartnerLock {
  return HSI_PROVISIONAL_PARTNER_LOCK;
}

/** Compact pointer for MANIFEST / discoveryCentre (never claims lockedPilot from provisional). */
export function partnerLockExportPointer(
  lock: HsiPartnerLock = getPartnerLock(),
): {
  schemaVersion: typeof PARTNER_LOCK_SCHEMA;
  lockedPilot: boolean;
  provisionalLock: boolean;
  status: PartnerLockStatus;
  disease: string;
  researchQuestion: string;
  partner: string;
  seedPathwayId: string | null;
} {
  return {
    schemaVersion: PARTNER_LOCK_SCHEMA,
    lockedPilot: lock.lockedPilot,
    provisionalLock: lock.provisionalLock,
    status: lock.status,
    disease: lock.disease?.label ?? "TBD",
    researchQuestion: lock.researchQuestion ?? "TBD — lock with partner",
    partner: lock.partner?.id ?? "TBD",
    seedPathwayId: lock.seedPathway?.id ?? null,
  };
}

/** True when pack disease/question may show provisional values (still not partner-signed). */
export function isProvisionalPartnerLock(lock: HsiPartnerLock = getPartnerLock()): boolean {
  return lock.provisionalLock === true && lock.lockedPilot === false;
}
