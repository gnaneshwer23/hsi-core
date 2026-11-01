/**
 * Partner disease / question lock for the ISI Stage 1 pilot.
 *
 * Honesty model (Phase 2):
 * - `scopeLocked=true` — disease + researchQuestion are the **working Stage 1
 *   pilot scope** (engineering lock). Phase 2 complete = this flag.
 * - `partnerSigned=false` until a **named** partner confirms in writing.
 * - `lockedPilot` is the AND of both (`scopeLocked && partnerSigned`). It stays
 *   false without inventing a commercial / MoU partner. Named partner flips
 *   `partnerSigned` (then `lockedPilot` follows).
 * - `provisionalLock` is cleared once scope is promoted out of scaffold.
 *
 * Flip path for partnerSigned (requires a real partner — not code alone):
 * 1. Named partner confirms disease + research question in writing (or rewrites).
 * 2. Set partnerSigned → true, lockedPilot → true, status → scoping|active.
 * 3. Replace partner.id/label with the real org (still no invented emails).
 * 4. Agree licensing + rubric thresholds; refresh seeds; re-run bun run outputs.
 */

export const PARTNER_LOCK_SCHEMA = "hsi-partner-lock-1" as const;

export type PartnerLockStatus =
  | "unlocked"
  | "provisional"
  | "scope_locked"
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
  outreachStatus:
    | "candidate"
    | "awaiting_named_partner"
    | "interested"
    | "scoping"
    | "confirmed"
    | "declined"
    | "none";
  notes: string;
};

/**
 * Durable lock fields consumed by pack, Discovery Centre meta, MANIFEST, rubric.
 *
 * Phase 2 (scope lock): disease/question canonical; partner still outreach category.
 * Partner-true (partnerSigned): requires named confirmation — not inventable in code.
 */
export type HsiPartnerLock = {
  schemaVersion: typeof PARTNER_LOCK_SCHEMA;
  /**
   * Engineering lock: disease + researchQuestion are the working Stage 1 scope.
   * Phase 2 deliverable. Does **not** imply a signed commercial partner.
   */
  scopeLocked: boolean;
  /**
   * True only after a named partner confirms disease + question in writing.
   * User / outreach flips this — never invent an org or MoU in code.
   */
  partnerSigned: boolean;
  /**
   * Compat / full pilot lock: `scopeLocked && partnerSigned`.
   * Stays false until partnerSigned; do not set true from substrate alone.
   */
  lockedPilot: boolean;
  /**
   * Legacy scaffold flag. Mutual honesty: provisionalLock=true implies
   * scopeLocked=false and lockedPilot=false. Cleared when scope is promoted.
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
  /** Seed pathway this scope lock is anchored to. */
  seedPathway: {
    id: string;
    label: string;
    rationale: string;
    primaryClaimIds: string[];
    primaryEdgeIds: string[];
    primaryPmids: string[];
  } | null;
  /** What a real partner must still supply to flip partnerSigned / lockedPilot. */
  flipRequirements: string[];
  honesty: string[];
  updatedAt: string;
};

/**
 * Working Stage 1 scope lock: RA / anti-TNF response heterogeneity.
 *
 * Phase 2: disease + researchQuestion are canonical engineering scope
 * (`scopeLocked=true`). Partner remains an outreach *category* from the
 * shortlist — Versus Arthritis / NDORMS–Kennedy — not a signed MoU.
 *
 * Why this pathway (not SLE/PsO/IBD): densest durable literature in seeds —
 * TNF→RA (PMID 11244034), anti-CCP + RF LOINC markers, IL-6 / anti-TNF-refractory
 * (PMID 18625622), ADA/immunogenicity (PMID 16508927 / 17133559), serology
 * tension (PMID 18375541 vs 24586782), macrophage→TNF (PMID 2993897), plus Gate C
 * handoff patterns already used for PMID 16382236-style provenance.
 */
export const HSI_SCOPE_LOCKED_PARTNER_LOCK: HsiPartnerLock = {
  schemaVersion: PARTNER_LOCK_SCHEMA,
  scopeLocked: true,
  partnerSigned: false,
  lockedPilot: false,
  provisionalLock: false,
  status: "scope_locked",
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
    outreachStatus: "awaiting_named_partner",
    notes:
      "From ISI_PILOT_PARTNER_SHORTLIST.md — outreach target category only. Not a confirmed partner, MoU, or named PI. Contact via public programme / institute channels. Phase 2 locked disease+question scope; Phase 3 deepened evidence; partnerSigned still false.",
  },
  seedPathway: {
    id: "ra-tnf-response-heterogeneity",
    label: "RA · TNF / ACPA / ADA · anti-TNF response heterogeneity",
    rationale:
      "Phase 3 deepened partner-scoped slice: TNF→RA + anti-CCP/RF (LOINC) + IL-6 / anti-TNF-refractory + ADA/immunogenicity + serology competing frames + MTX+anti-TNF combo background. Matches pilot-brief questions on therapy response and subgroup biomarkers. Working Stage 1 scope (scopeLocked); not partnerSigned.",
    primaryClaimIds: [
      "HSI-C-RA-001",
      "HSI-C-RA-002",
      "HSI-C-RA-003",
      "HSI-C-RA-004",
      "HSI-C-RA-005",
      "HSI-C-RA-006",
      "HSI-C-RA-007",
      "HSI-C-RA-008",
      "HSI-C-RA-009",
      "HSI-C-RA-010",
      "HSI-C-RA-011",
      "HSI-C-RA-012",
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
      "HSI-E-RA-007",
      "HSI-E-RA-008",
      "HSI-E-RA-009",
      "HSI-E-RA-010",
      "HSI-E-RA-011",
      "HSI-E-RA-012",
      "HSI-E-IM-002",
      "HSI-E-IM-003",
    ],
    primaryPmids: [
      "11244034",
      "10662881",
      "11087881",
      "18625622",
      "2993897",
      "16508927",
      "17133559",
      "18375541",
      "24586782",
      "20699241",
      "10622295",
    ],
  },
  flipRequirements: [
    "Named partner confirms disease = rheumatoid arthritis (or explicitly chooses a different disease — then re-lock scope).",
    "Named partner confirms or rewrites the research question in their words.",
    "Record real outreach row in ISI_PILOT_PARTNER_SHORTLIST.md (org, type, region, status) — still no invented emails.",
    "Agree source licensing / attribution for the partner source set.",
    "Agree scientific review rubric thresholds (time saved, usefulness, rejections) with the partner.",
    "Set partnerSigned=true, lockedPilot=true (scopeLocked already true), status=scoping|active, partner.type=named_partner, partner.outreachStatus=confirmed.",
    "Re-run bun run outputs and refresh the pilot evidence pack + review rubric against the signed question.",
  ],
  honesty: [
    "Phase 2 done = scopeLocked=true (disease + researchQuestion are working Stage 1 scope).",
    "Phase 3 done = partner-scoped evidence depth for this locked RA/anti-TNF question (ADA, serology tension, RF LOINC, MTX combo).",
    "Phase 4 done = HSI Neon red-wave readiness (schema stub + guarded migrate; Gate C local pending only).",
    "Phase 5 done = pilot acceptance pack (checklist + walkthrough; partnerSigned still pending).",
    "scopeLocked does NOT mean a commercial partner signed or locked a MoU.",
    "partnerSigned / lockedPilot stay false until flipRequirements are met with a named partner.",
    "Outreach category partners are not MoUs; do not invent personal contacts.",
    "Exports must surface status=scope_locked + partnerSigned=false so consumers cannot mistake this for a live pilot contract.",
  ],
  updatedAt: "2026-11-01T14:45:00.000Z",
};

/** @deprecated Use HSI_SCOPE_LOCKED_PARTNER_LOCK — alias kept for import stability. */
export const HSI_PROVISIONAL_PARTNER_LOCK = HSI_SCOPE_LOCKED_PARTNER_LOCK;

/** Active lock used by pack / export builders. */
export function getPartnerLock(): HsiPartnerLock {
  return HSI_SCOPE_LOCKED_PARTNER_LOCK;
}

/** Compact pointer for MANIFEST / discoveryCentre. */
export function partnerLockExportPointer(
  lock: HsiPartnerLock = getPartnerLock(),
): {
  schemaVersion: typeof PARTNER_LOCK_SCHEMA;
  scopeLocked: boolean;
  partnerSigned: boolean;
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
    scopeLocked: lock.scopeLocked,
    partnerSigned: lock.partnerSigned,
    lockedPilot: lock.lockedPilot,
    provisionalLock: lock.provisionalLock,
    status: lock.status,
    disease: lock.disease?.label ?? "TBD",
    researchQuestion: lock.researchQuestion ?? "TBD — lock with partner",
    partner: lock.partner?.id ?? "TBD",
    seedPathwayId: lock.seedPathway?.id ?? null,
  };
}

/** True when pack may show scaffold-only values (legacy Phase 1b). */
export function isProvisionalPartnerLock(lock: HsiPartnerLock = getPartnerLock()): boolean {
  return lock.provisionalLock === true && lock.lockedPilot === false;
}

/** True when disease + question are the working Stage 1 scope (Phase 2+). */
export function isScopeLockedPartnerLock(lock: HsiPartnerLock = getPartnerLock()): boolean {
  return lock.scopeLocked === true;
}

/**
 * True when pack/rubric should surface the RA pathway as the active pilot question
 * (scope-locked or still-provisional scaffold) without claiming partnerSigned.
 */
export function hasWorkingPilotScope(lock: HsiPartnerLock = getPartnerLock()): boolean {
  return lock.scopeLocked === true || lock.provisionalLock === true;
}
