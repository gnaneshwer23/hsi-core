/**
 * Partner disease / question lock for the ISI Stage 1 pilot.
 *
 * Honesty model (Phase 2 + test fixture):
 * - `scopeLocked=true` — disease + researchQuestion are the **working Stage 1
 *   pilot scope** (engineering lock). Phase 2 complete = this flag.
 * - `partnerSigned` may be `true` under a **hypothetical test fixture**
 *   (`agreementKind=hypothetical_test_only`, `legalBinding=false`) for path
 *   testing only. That is **not** a MoU. Production ISI must ignore unless
 *   `ALLOW_HYPOTHETICAL_PARTNER=true`.
 * - `lockedPilot` = `scopeLocked && partnerSigned && legalBinding`. Stays
 *   false for the fixture (legalBinding=false). Real partner sets legalBinding.
 * - `provisionalLock` is cleared once scope is promoted out of scaffold.
 *
 * Vertical strategy (option A dual-track, 2026-11-01):
 * - `verticalStrategy=dual_track` — RA remains `activeScope`; SSc is `prdMvpTarget`.
 * - Does **not** wipe RA packs. See `verticalDecision.ts`.
 *
 * Flip path for a **real** partner (requires outreach — not inventable):
 * 1. Named partner confirms disease + research question in writing (or rewrites).
 * 2. Edit `src/hypotheticalPartnerFixture.ts`: set USE_HYPOTHETICAL_PARTNER_FIXTURE=false,
 *    fill REAL_PARTNER_REPLACEMENT; legalBinding=true; type=named_partner.
 * 3. Record shortlist row; agree licensing + rubric thresholds.
 * 4. Re-run bun run outputs.
 */

import {
  HYPOTHETICAL_PARTNER_FIXTURE,
  REAL_PARTNER_REPLACEMENT,
  USE_HYPOTHETICAL_PARTNER_FIXTURE,
  type PartnerAgreementKind,
} from "./hypotheticalPartnerFixture";
import {
  getVerticalDecision,
  verticalDecisionExportPointer,
  type VerticalStrategy,
} from "./verticalDecision";

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
  /** Stable id — outreach category, test fixture, or named partner when real. */
  id: string;
  label: string;
  /** Shortlist type from ISI_PILOT_PARTNER_SHORTLIST.md (+ test fixture). */
  type:
    | "immunology_researcher"
    | "translational_scientist"
    | "clinician_scientist"
    | "disease_foundation"
    | "outreach_category"
    | "named_partner"
    | "hypothetical_test_fixture";
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
    | "none"
    | "test_fixture";
  notes: string;
};

/**
 * Durable lock fields consumed by pack, Discovery Centre meta, MANIFEST, rubric.
 *
 * Phase 2 (scope lock): disease/question canonical.
 * Fixture (path testing): partnerSigned may be true under hypothetical_test_only.
 * Real partner: legalBinding=true → lockedPilot can become true.
 */
export type HsiPartnerLock = {
  schemaVersion: typeof PARTNER_LOCK_SCHEMA;
  /**
   * Engineering lock: disease + researchQuestion are the working Stage 1 scope.
   * Phase 2 deliverable. Does **not** imply a signed commercial partner.
   */
  scopeLocked: boolean;
  /**
   * True after named partner confirm — OR under hypothetical test fixture for
   * path testing (`agreementKind=hypothetical_test_only`). Not a MoU when
   * `legalBinding=false` / `isHypothetical=true`.
   */
  partnerSigned: boolean;
  /**
   * Full pilot lock: `scopeLocked && partnerSigned && legalBinding`.
   * Fixture keeps this false (legalBinding=false).
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
  /** Agreement / honesty flags for fixture vs real partner. */
  agreementKind: PartnerAgreementKind;
  replaceWithRealPartner: boolean;
  legalBinding: boolean;
  isHypothetical: boolean;
  notALegalAgreement: boolean;
  testPilotMode: boolean;
  /** Loud banner when fixture is active. */
  testFixtureBanner: string | null;
  /** What a real partner must still supply to replace the fixture / flip lockedPilot. */
  flipRequirements: string[];
  honesty: string[];
  /**
   * Dual-track vertical strategy (option A). RA stays Stage 1 activeScope;
   * SSc is PRD MVP target. See `verticalDecision.ts` / `hsi-vertical-decision.json`.
   */
  verticalStrategy: VerticalStrategy;
  activeScope: "ra-tnf";
  prdMvpTarget: "ssc-tfh-b-il21";
  /** Compact pointer to the written A/B/C decision record. */
  verticalDecision: ReturnType<typeof verticalDecisionExportPointer>;
  updatedAt: string;
};

const SCOPE_BASE = {
  schemaVersion: PARTNER_LOCK_SCHEMA,
  scopeLocked: true,
  provisionalLock: false,
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
  seedPathway: {
    id: "ra-tnf-response-heterogeneity",
    label: "RA · TNF / ACPA / ADA · anti-TNF response heterogeneity",
    rationale:
      "Phase 3 deepened partner-scoped slice: TNF→RA + anti-CCP/RF (LOINC) + IL-6 / anti-TNF-refractory + ADA/immunogenicity + serology competing frames + MTX+anti-TNF combo background. Matches pilot-brief questions on therapy response and subgroup biomarkers. Working Stage 1 scope (scopeLocked); fixture partnerSigned is path-testing only.",
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
  verticalStrategy: "dual_track" as const,
  activeScope: "ra-tnf" as const,
  prdMvpTarget: "ssc-tfh-b-il21" as const,
  verticalDecision: verticalDecisionExportPointer(getVerticalDecision()),
  updatedAt: "2026-11-01T20:00:00.000Z",
};

function computeLockedPilot(opts: {
  scopeLocked: boolean;
  partnerSigned: boolean;
  legalBinding: boolean;
}): boolean {
  return opts.scopeLocked && opts.partnerSigned && opts.legalBinding;
}

function buildFixturePartnerLock(): HsiPartnerLock {
  const fx = HYPOTHETICAL_PARTNER_FIXTURE;
  const partnerSigned = fx.partnerSigned;
  const legalBinding = fx.legalBinding;
  return {
    ...SCOPE_BASE,
    partnerSigned,
    lockedPilot: computeLockedPilot({
      scopeLocked: true,
      partnerSigned,
      legalBinding,
    }),
    status: "scope_locked",
    partner: fx.partner,
    agreementKind: fx.agreementKind,
    replaceWithRealPartner: fx.replaceWithRealPartner,
    legalBinding,
    isHypothetical: fx.isHypothetical,
    notALegalAgreement: fx.notALegalAgreement,
    testPilotMode: fx.testPilotMode,
    testFixtureBanner: fx.banner,
    flipRequirements: [
      "REPLACE FIXTURE: set USE_HYPOTHETICAL_PARTNER_FIXTURE=false in src/hypotheticalPartnerFixture.ts and fill REAL_PARTNER_REPLACEMENT with a real named org (never invent).",
      "Named partner confirms disease = rheumatoid arthritis (or explicitly chooses a different disease — then re-lock scope).",
      "Named partner confirms or rewrites the research question in their words.",
      "Record real outreach row in ISI_PILOT_PARTNER_SHORTLIST.md (org, type, region, status) — still no invented emails.",
      "Agree source licensing / attribution for the partner source set.",
      "Agree scientific review rubric thresholds (time saved, usefulness, rejections) with the partner.",
      "Set legalBinding=true, agreementKind=written_confirm|legal_mou, partner.type=named_partner, outreachStatus=confirmed, replaceWithRealPartner=false, isHypothetical=false → lockedPilot becomes true.",
      "Re-run bun run outputs and refresh the pilot evidence pack + review rubric against the signed question.",
    ],
    honesty: [
      "TEST FIXTURE — replace before real pilot. Banner must stay visible in packs / MANIFEST / walkthrough.",
      "partnerSigned=true under agreementKind=hypothetical_test_only is PATH-TESTING ONLY — not a MoU.",
      "legalBinding=false → lockedPilot=false even when partnerSigned=true.",
      "Production ISI must ignore fixture partnerSigned unless ALLOW_HYPOTHETICAL_PARTNER=true.",
      "Phase 2 done = scopeLocked=true (disease + researchQuestion are working Stage 1 scope).",
      "Phase 3 done = partner-scoped evidence depth for this locked RA/anti-TNF question (ADA, serology tension, RF LOINC, MTX combo).",
      "Phase 5 done = pilot acceptance pack (checklist + walkthrough; real named partner still pending).",
      "scopeLocked does NOT mean a commercial partner signed or locked a MoU.",
      "Hypothetical fixture partners are not MoUs; do not invent personal contacts.",
      "Exports must surface isHypothetical=true + notALegalAgreement=true + testFixtureBanner.",
    ],
  };
}

function buildRealPartnerLock(): HsiPartnerLock {
  const real = REAL_PARTNER_REPLACEMENT;
  const partnerSigned = real.partnerSigned;
  const legalBinding = real.legalBinding;
  return {
    ...SCOPE_BASE,
    partnerSigned,
    lockedPilot: computeLockedPilot({
      scopeLocked: true,
      partnerSigned,
      legalBinding,
    }),
    status: legalBinding && partnerSigned ? "scoping" : "scope_locked",
    partner: real.partner,
    agreementKind: real.agreementKind,
    replaceWithRealPartner: real.replaceWithRealPartner,
    legalBinding,
    isHypothetical: real.isHypothetical,
    notALegalAgreement: real.notALegalAgreement,
    testPilotMode: real.testPilotMode,
    testFixtureBanner: real.banner,
    flipRequirements: [
      "Named partner confirms disease = rheumatoid arthritis (or explicitly chooses a different disease — then re-lock scope).",
      "Named partner confirms or rewrites the research question in their words.",
      "Record real outreach row in ISI_PILOT_PARTNER_SHORTLIST.md (org, type, region, status) — still no invented emails.",
      "Agree source licensing / attribution for the partner source set.",
      "Agree scientific review rubric thresholds (time saved, usefulness, rejections) with the partner.",
      "Keep partnerSigned=true, lockedPilot=true (scopeLocked + legalBinding), status=scoping|active, partner.type=named_partner, partner.outreachStatus=confirmed.",
      "Re-run bun run outputs and refresh the pilot evidence pack + review rubric against the signed question.",
    ],
    honesty: [
      "Named partner Apolo Pharma (partner:apolo-pharma) — type=named_partner; partnerSigned=true; legalBinding=true → lockedPilot=true when scopeLocked.",
      "MoU / written-confirm paperwork is operator-asserted by HSI workspace instruction (2026-11-01) — never invent emails, phones, or named PI contacts in code.",
      "Still not CDS; Gate C never auto-approves; no PHI; HSI Neon remains red-wave only.",
      "Phase 2 done = scopeLocked=true (disease + researchQuestion are working Stage 1 scope). RA activeScope unchanged; dual-track SSc/gut/neuro continues.",
      "Apolo Pharma Stage 1 corpus licensing clearance applied (oa_reuse + cite_metadata_pilot; unknown uncleared/needs_confirm). Stage 1 numeric KPIs are partner_agreed.",
    ],
  };
}

/**
 * Working Stage 1 scope lock: RA / anti-TNF response heterogeneity.
 *
 * Default: hypothetical test fixture partner for path testing
 * (`src/hypotheticalPartnerFixture.ts`). Flip USE_HYPOTHETICAL_PARTNER_FIXTURE
 * and fill REAL_PARTNER_REPLACEMENT when a real org signs.
 */
export const HSI_SCOPE_LOCKED_PARTNER_LOCK: HsiPartnerLock =
  USE_HYPOTHETICAL_PARTNER_FIXTURE
    ? buildFixturePartnerLock()
    : buildRealPartnerLock();

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
  partnerType: string | null;
  partnerLabel: string | null;
  seedPathwayId: string | null;
  agreementKind: PartnerAgreementKind;
  replaceWithRealPartner: boolean;
  legalBinding: boolean;
  isHypothetical: boolean;
  notALegalAgreement: boolean;
  testPilotMode: boolean;
  testFixtureBanner: string | null;
  verticalStrategy: VerticalStrategy;
  activeScope: "ra-tnf";
  prdMvpTarget: "ssc-tfh-b-il21";
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
    partnerType: lock.partner?.type ?? null,
    partnerLabel: lock.partner?.label ?? null,
    seedPathwayId: lock.seedPathway?.id ?? null,
    agreementKind: lock.agreementKind,
    replaceWithRealPartner: lock.replaceWithRealPartner,
    legalBinding: lock.legalBinding,
    isHypothetical: lock.isHypothetical,
    notALegalAgreement: lock.notALegalAgreement,
    testPilotMode: lock.testPilotMode,
    testFixtureBanner: lock.testFixtureBanner,
    verticalStrategy: lock.verticalStrategy,
    activeScope: lock.activeScope,
    prdMvpTarget: lock.prdMvpTarget,
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
 * (scope-locked or still-provisional scaffold) without claiming a legal MoU.
 */
export function hasWorkingPilotScope(lock: HsiPartnerLock = getPartnerLock()): boolean {
  return lock.scopeLocked === true || lock.provisionalLock === true;
}

/** True when current partner is the hypothetical path-testing fixture. */
export function isHypotheticalTestFixturePartner(
  lock: HsiPartnerLock = getPartnerLock(),
): boolean {
  return (
    lock.isHypothetical === true &&
    lock.partner?.type === "hypothetical_test_fixture"
  );
}

/**
 * Whether production ISI may treat partnerSigned as a real pilot signal.
 * Fixture requires ALLOW_HYPOTHETICAL_PARTNER=true; real legalBinding partners pass.
 */
export function isProductionPartnerSignedTrusted(
  lock: HsiPartnerLock = getPartnerLock(),
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!lock.partnerSigned) return false;
  if (lock.legalBinding && !lock.isHypothetical) return true;
  if (lock.isHypothetical) {
    const raw = env.ALLOW_HYPOTHETICAL_PARTNER;
    if (!raw) return false;
    const v = raw.trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes";
  }
  return false;
}
