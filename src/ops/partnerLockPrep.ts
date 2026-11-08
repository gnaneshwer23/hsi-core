/**
 * Partner lock prep (production-readiness audit Phase #8).
 * Engineering checklist scaffolding only — founder decision remains BLOCKED.
 * Never invents MoU text, named orgs, legalBinding=true, or lockedPilot=true.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {
  HYPOTHETICAL_PARTNER_FIXTURE,
  REAL_PARTNER_REPLACEMENT,
  USE_HYPOTHETICAL_PARTNER_FIXTURE,
} from "../hypotheticalPartnerFixture";
import {getPartnerLock, PARTNER_LOCK_SCHEMA} from "../partnerLock";

export const PARTNER_LOCK_PREP_SCHEMA = "hsi-partner-lock-prep-1" as const;

export type PartnerLockPrepCheckStatus =
  | "CLEARED"
  | "BLOCKED"
  | "PENDING_FOUNDER"
  | "NO_GO";

export type PartnerLockPrepCheckId =
  | "scope_lock_engineering_present"
  | "hypothetical_fixture_active_documented"
  | "locked_pilot_forced_false"
  | "legal_binding_forced_false"
  | "empty_mou_slots_reserved"
  | "real_partner_replacement_template_present"
  | "partner_lock_checklist_published"
  | "shortlist_tracking_rows_empty_of_mou"
  | "named_org_written_confirm"
  | "mou_or_written_confirm_artifact"
  | "disease_question_partner_confirmed"
  | "shortlist_row_filled_with_real_org"
  | "licensing_and_rubric_agreed"
  | "fixture_swapped_legal_binding_true"
  | "outputs_rebundled_after_real_lock";

export type PartnerLockPrepCheck = {
  id: PartnerLockPrepCheckId;
  title: string;
  plane: "engineering" | "founder";
  status: PartnerLockPrepCheckStatus;
  evidence: string;
};

/**
 * Empty MoU / named-partner slots — fill only after real written confirm.
 * All identity / document fields stay null; attestations stay false.
 */
export type PartnerMouSlot = {
  slotId: string;
  role:
    | "named_partner_org"
    | "written_confirm_artifact"
    | "legal_mou_artifact"
    | "disease_question_confirm"
    | "licensing_rubric_confirm"
    | "founder_legal_binding_attestor";
  roleLabel: string;
  organisationName: null;
  organisationSlug: null;
  contactChannel: null;
  writtenConfirmUri: null;
  mouDocumentUri: null;
  mouSignedAt: null;
  agreementKind: null;
  legalBindingAttested: false;
  notes: string;
};

export type PartnerLockPrep = {
  schemaVersion: typeof PARTNER_LOCK_PREP_SCHEMA;
  phase: "partner_lock";
  remediationPhase: "production_readiness_audit_phase_8";
  generatedAt: string;
  partnerLockSchema: typeof PARTNER_LOCK_SCHEMA;
  engineeringScaffold: "CLEARED";
  founderAcceptance: "BLOCKED";
  lockedPilot: false;
  legalBinding: false;
  partnerSignedPathTestingOnly: true;
  agreementKind: "hypothetical_test_only";
  useHypotheticalFixture: true;
  inventedMouPermitted: false;
  inventedNamedOrgPermitted: false;
  honesty: {
    fixturePartnerSignedIsNotMou: true;
    emptyMouSlotsAreNotAgreements: true;
    legalBindingRequiresFounderWrittenConfirm: true;
    lockedPilotRequiresLegalBinding: true;
    noInventedMouText: true;
    noGateCAutoApprove: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
    priorApoloPathRevoked: true;
  };
  activeFixture: {
    partnerId: typeof HYPOTHETICAL_PARTNER_FIXTURE.partner.id;
    partnerLabel: typeof HYPOTHETICAL_PARTNER_FIXTURE.partner.label;
    agreementKind: "hypothetical_test_only";
    legalBinding: false;
    lockedPilot: false;
    replaceWithRealPartner: true;
    banner: typeof HYPOTHETICAL_PARTNER_FIXTURE.banner;
  };
  realPartnerTemplatePresent: true;
  mouSlots: PartnerMouSlot[];
  founderMustDecide: string[];
  codeCanAutomate: string[];
  checks: PartnerLockPrepCheck[];
  summary: {
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    founderChecksPending: number;
    founderChecksTotal: number;
    mouSlotsReserved: number;
    mouSlotsFilled: 0;
    lockedPilot: false;
    legalBinding: false;
  };
  residualFounderSteps: string[];
  prepHash: string;
};

export class PartnerLockPrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PartnerLockPrepError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(body: Omit<PartnerLockPrep, "prepHash">): PartnerLockPrep {
  return {...body, prepHash: digest(body)};
}

function defaultMouSlots(): PartnerMouSlot[] {
  return [
    {
      slotId: "PARTNER-MOU-ORG",
      role: "named_partner_org",
      roleLabel: "Named partner organisation",
      organisationName: null,
      organisationSlug: null,
      contactChannel: null,
      writtenConfirmUri: null,
      mouDocumentUri: null,
      mouSignedAt: null,
      agreementKind: null,
      legalBindingAttested: false,
      notes:
        "Fill only after a real org confirms in writing. Never invent org names, emails, or MoU text from chat.",
    },
    {
      slotId: "PARTNER-MOU-WRITTEN",
      role: "written_confirm_artifact",
      roleLabel: "Written confirm artifact",
      organisationName: null,
      organisationSlug: null,
      contactChannel: null,
      writtenConfirmUri: null,
      mouDocumentUri: null,
      mouSignedAt: null,
      agreementKind: null,
      legalBindingAttested: false,
      notes:
        "URI / private receipt of written confirm (disease + research question). Keep out of git if sensitive; stamp hash only.",
    },
    {
      slotId: "PARTNER-MOU-LEGAL",
      role: "legal_mou_artifact",
      roleLabel: "Legal MoU / MoA artifact (optional vs written_confirm)",
      organisationName: null,
      organisationSlug: null,
      contactChannel: null,
      writtenConfirmUri: null,
      mouDocumentUri: null,
      mouSignedAt: null,
      agreementKind: null,
      legalBindingAttested: false,
      notes:
        "Empty until a real legal_mou exists. Do not paste MoU body into git. agreementKind may be written_confirm without a full MoU.",
    },
    {
      slotId: "PARTNER-MOU-SCOPE",
      role: "disease_question_confirm",
      roleLabel: "Disease + research-question confirm",
      organisationName: null,
      organisationSlug: null,
      contactChannel: null,
      writtenConfirmUri: null,
      mouDocumentUri: null,
      mouSignedAt: null,
      agreementKind: null,
      legalBindingAttested: false,
      notes:
        "Partner confirms RA/anti-TNF working scope or explicitly rewrites disease + question (then re-lock scope).",
    },
    {
      slotId: "PARTNER-MOU-RUBRIC",
      role: "licensing_rubric_confirm",
      roleLabel: "Licensing + rubric thresholds confirm",
      organisationName: null,
      organisationSlug: null,
      contactChannel: null,
      writtenConfirmUri: null,
      mouDocumentUri: null,
      mouSignedAt: null,
      agreementKind: null,
      legalBindingAttested: false,
      notes:
        "Agree source licensing / attribution and Stage 1 rubric thresholds with the named partner.",
    },
    {
      slotId: "PARTNER-MOU-FOUNDER",
      role: "founder_legal_binding_attestor",
      roleLabel: "Founder legalBinding attestor",
      organisationName: null,
      organisationSlug: null,
      contactChannel: null,
      writtenConfirmUri: null,
      mouDocumentUri: null,
      mouSignedAt: null,
      agreementKind: null,
      legalBindingAttested: false,
      notes:
        "Only the founder may attest legalBinding=true after written confirm. Chat / eng cannot invent this.",
    },
  ];
}

function buildChecks(lock: ReturnType<typeof getPartnerLock>): PartnerLockPrepCheck[] {
  const fixtureActive =
    USE_HYPOTHETICAL_PARTNER_FIXTURE === true &&
    lock.agreementKind === "hypothetical_test_only" &&
    lock.isHypothetical === true;
  const lockedPilotFalse = lock.lockedPilot === false;
  const legalBindingFalse = lock.legalBinding === false;
  const templatePresent =
    REAL_PARTNER_REPLACEMENT.partner.id.includes("REPLACE") &&
    REAL_PARTNER_REPLACEMENT.partner.label.includes("REPLACE");

  return [
    {
      id: "scope_lock_engineering_present",
      title: "Stage 1 scope lock engineering present (scopeLocked=true)",
      plane: "engineering",
      status: lock.scopeLocked === true && lock.provisionalLock === false ? "CLEARED" : "BLOCKED",
      evidence: `disease=${lock.disease?.id ?? "null"}; schema=${PARTNER_LOCK_SCHEMA}.`,
    },
    {
      id: "hypothetical_fixture_active_documented",
      title: "Hypothetical test fixture remains the active partner path",
      plane: "engineering",
      status: fixtureActive ? "CLEARED" : "BLOCKED",
      evidence: `USE_HYPOTHETICAL_PARTNER_FIXTURE=${String(USE_HYPOTHETICAL_PARTNER_FIXTURE)}; partnerId=${lock.partner?.id}.`,
    },
    {
      id: "locked_pilot_forced_false",
      title: "lockedPilot forced false under fixture",
      plane: "engineering",
      status: lockedPilotFalse ? "CLEARED" : "BLOCKED",
      evidence: "lockedPilot = scopeLocked && partnerSigned && legalBinding; legalBinding=false → lockedPilot=false.",
    },
    {
      id: "legal_binding_forced_false",
      title: "legalBinding forced false (no invented MoU)",
      plane: "engineering",
      status: legalBindingFalse ? "CLEARED" : "BLOCKED",
      evidence: "Fixture and prep refuse legalBinding=true until founder written confirm.",
    },
    {
      id: "empty_mou_slots_reserved",
      title: "Empty MoU / named-partner slots reserved",
      plane: "engineering",
      status: "CLEARED",
      evidence: "Six slots with organisationName/mouDocumentUri null; legalBindingAttested=false.",
    },
    {
      id: "real_partner_replacement_template_present",
      title: "REAL_PARTNER_REPLACEMENT template present (unfilled placeholders)",
      plane: "engineering",
      status: templatePresent ? "CLEARED" : "BLOCKED",
      evidence: "src/hypotheticalPartnerFixture.ts REAL_PARTNER_REPLACEMENT still REPLACE_* placeholders.",
    },
    {
      id: "partner_lock_checklist_published",
      title: "Partner-lock founder checklist published",
      plane: "engineering",
      status: "CLEARED",
      evidence: "docs/engineering/PARTNER_LOCK_CHECKLIST.md — ENG CLEARED / FOUNDER BLOCKED.",
    },
    {
      id: "shortlist_tracking_rows_empty_of_mou",
      title: "Shortlist documents fixture + outreach categories without signed MoU",
      plane: "engineering",
      status: "CLEARED",
      evidence: "docs/ISI_PILOT_PARTNER_SHORTLIST.md — real named partner TBD; Apolo path revoked.",
    },
    {
      id: "named_org_written_confirm",
      title: "Named organisation written confirm",
      plane: "founder",
      status: "PENDING_FOUNDER",
      evidence: "mouSlotsFilled=0. Founder outreach only — never invent org from chat.",
    },
    {
      id: "mou_or_written_confirm_artifact",
      title: "MoU or written_confirm artifact exists (private)",
      plane: "founder",
      status: "PENDING_FOUNDER",
      evidence: "Empty mouDocumentUri / writtenConfirmUri slots. Do not paste MoU body into git.",
    },
    {
      id: "disease_question_partner_confirmed",
      title: "Partner confirms disease + research question (or rewrites)",
      plane: "founder",
      status: "PENDING_FOUNDER",
      evidence: "Working RA/anti-TNF scope stays provisional until partner words match.",
    },
    {
      id: "shortlist_row_filled_with_real_org",
      title: "Shortlist row filled with real org (no invented emails)",
      plane: "founder",
      status: "PENDING_FOUNDER",
      evidence: "ISI_PILOT_PARTNER_SHORTLIST.md awaiting_named_partner until real confirm.",
    },
    {
      id: "licensing_and_rubric_agreed",
      title: "Source licensing + rubric thresholds agreed with partner",
      plane: "founder",
      status: "PENDING_FOUNDER",
      evidence: "Cannot invent thresholds or licence grants.",
    },
    {
      id: "fixture_swapped_legal_binding_true",
      title: "Fixture swapped + legalBinding=true after founder attest",
      plane: "founder",
      status: "NO_GO",
      evidence:
        "USE_HYPOTHETICAL_PARTNER_FIXTURE must stay true until founder fills REAL_PARTNER_REPLACEMENT; legalBinding stays false.",
    },
    {
      id: "outputs_rebundled_after_real_lock",
      title: "Re-run outputs after real lock (lockedPilot may become true)",
      plane: "founder",
      status: "NO_GO",
      evidence: "bun run outputs only after real swap; lockedPilot stays false under fixture.",
    },
  ];
}

/** Build fail-closed Phase #8 partner-lock prep (offline; never invents MoU). */
export function buildPartnerLockPrep(input: {generatedAt: string}): PartnerLockPrep {
  if (USE_HYPOTHETICAL_PARTNER_FIXTURE !== true) {
    throw new PartnerLockPrepError(
      "Partner-lock prep scaffold requires USE_HYPOTHETICAL_PARTNER_FIXTURE=true (founder swap is out of band)",
    );
  }
  const lock = getPartnerLock();
  if (lock.legalBinding !== false || lock.lockedPilot !== false) {
    throw new PartnerLockPrepError(
      "Partner-lock prep refuses legalBinding=true or lockedPilot=true under fixture scaffold",
    );
  }
  if (lock.agreementKind !== "hypothetical_test_only" || lock.isHypothetical !== true) {
    throw new PartnerLockPrepError(
      "Partner-lock prep scaffold requires active hypothetical_test_only fixture",
    );
  }

  const mouSlots = defaultMouSlots();
  const checks = buildChecks(lock);
  const eng = checks.filter((c) => c.plane === "engineering");
  const founder = checks.filter((c) => c.plane === "founder");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const founderPending = founder.filter(
    (c) => c.status === "PENDING_FOUNDER" || c.status === "NO_GO" || c.status === "BLOCKED",
  ).length;
  if (engCleared !== eng.length) {
    throw new PartnerLockPrepError(
      "Engineering partner-lock checks must all CLEARED before writing artifact",
    );
  }
  if (founderPending !== founder.length) {
    throw new PartnerLockPrepError(
      "Founder partner-lock checks must remain PENDING_FOUNDER/NO_GO while MoU slots are empty",
    );
  }

  return seal({
    schemaVersion: PARTNER_LOCK_PREP_SCHEMA,
    phase: "partner_lock",
    remediationPhase: "production_readiness_audit_phase_8",
    generatedAt: input.generatedAt,
    partnerLockSchema: PARTNER_LOCK_SCHEMA,
    engineeringScaffold: "CLEARED",
    founderAcceptance: "BLOCKED",
    lockedPilot: false,
    legalBinding: false,
    partnerSignedPathTestingOnly: true,
    agreementKind: "hypothetical_test_only",
    useHypotheticalFixture: true,
    inventedMouPermitted: false,
    inventedNamedOrgPermitted: false,
    honesty: {
      fixturePartnerSignedIsNotMou: true,
      emptyMouSlotsAreNotAgreements: true,
      legalBindingRequiresFounderWrittenConfirm: true,
      lockedPilotRequiresLegalBinding: true,
      noInventedMouText: true,
      noGateCAutoApprove: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
      priorApoloPathRevoked: true,
    },
    activeFixture: {
      partnerId: HYPOTHETICAL_PARTNER_FIXTURE.partner.id,
      partnerLabel: HYPOTHETICAL_PARTNER_FIXTURE.partner.label,
      agreementKind: "hypothetical_test_only",
      legalBinding: false,
      lockedPilot: false,
      replaceWithRealPartner: true,
      banner: HYPOTHETICAL_PARTNER_FIXTURE.banner,
    },
    realPartnerTemplatePresent: true,
    mouSlots,
    founderMustDecide: [
      "Outreach to a real immunology / translational / clinician-scientist partner (categories in ISI_PILOT_PARTNER_SHORTLIST.md) — never invent named PIs or emails.",
      "Obtain written confirm of disease + research question (or partner rewrite → re-lock scope).",
      "Record a real shortlist row (org, type, region, status) without fabricating contacts.",
      "Agree source licensing / attribution and Stage 1 rubric thresholds with that partner.",
      "Only then set USE_HYPOTHETICAL_PARTNER_FIXTURE=false and fill REAL_PARTNER_REPLACEMENT; set legalBinding=true with agreementKind=written_confirm|legal_mou.",
      "Keep MoU / confirm artifacts private; do not paste MoU body or invent legalBinding from chat.",
      "Re-run bun run outputs; lockedPilot becomes true only when scopeLocked && partnerSigned && legalBinding.",
      "Prior Apolo Pharma lockedPilot path stays revoked (2026-11-02) — do not re-lock without written confirm.",
    ],
    codeCanAutomate: [
      "Assert active fixture keeps legalBinding=false and lockedPilot=false.",
      "Reserve empty MoU / named-partner slots (all null / false).",
      "Refuse prep packets that invent org names, MoU URIs, or legalBindingAttested=true.",
      "Seal prepHash + offline check harness (partner:lock-prep / partner:lock-prep:check).",
      "Operator checklist + Audit #8 receipt stamps (ENG CLEARED / FOUNDER BLOCKED).",
      "Surface fixture honesty banners already wired in partnerLock / Discovery packs.",
    ],
    checks,
    summary: {
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      founderChecksPending: founderPending,
      founderChecksTotal: founder.length,
      mouSlotsReserved: mouSlots.length,
      mouSlotsFilled: 0,
      lockedPilot: false,
      legalBinding: false,
    },
    residualFounderSteps: [
      "Keep hypothetical fixture + loud banners until a real org writes confirm.",
      "Fill empty MoU slots only with real org / artifact pointers after founder decision.",
      "Never set legalBinding=true or lockedPilot=true from engineering chat.",
      "Do not claim production partner lock, Gate C clearance, or CDS readiness from this scaffold.",
      "Re-run bun run partner:lock-prep:check; founderAcceptance stays BLOCKED until a human founder receipt replaces empty slots.",
    ],
  });
}

export function parsePartnerLockPrep(value: unknown): PartnerLockPrep {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PartnerLockPrepError("Invalid partner-lock prep packet");
  }
  const prep = value as PartnerLockPrep;
  if (
    prep.schemaVersion !== PARTNER_LOCK_PREP_SCHEMA ||
    prep.phase !== "partner_lock" ||
    prep.remediationPhase !== "production_readiness_audit_phase_8"
  ) {
    throw new PartnerLockPrepError("Unsupported partner-lock prep schema");
  }
  if (
    prep.founderAcceptance !== "BLOCKED" ||
    prep.lockedPilot !== false ||
    prep.legalBinding !== false ||
    prep.agreementKind !== "hypothetical_test_only" ||
    prep.useHypotheticalFixture !== true ||
    prep.inventedMouPermitted !== false ||
    prep.inventedNamedOrgPermitted !== false ||
    prep.summary.mouSlotsFilled !== 0 ||
    prep.summary.lockedPilot !== false ||
    prep.summary.legalBinding !== false
  ) {
    throw new PartnerLockPrepError(
      "Partner-lock prep cannot claim founder acceptance, legalBinding, lockedPilot, or filled MoU slots",
    );
  }
  if (!Array.isArray(prep.mouSlots) || prep.mouSlots.length < 4) {
    throw new PartnerLockPrepError("Partner-lock prep must reserve empty MoU slots");
  }
  for (const slot of prep.mouSlots) {
    if (
      slot.organisationName !== null ||
      slot.organisationSlug !== null ||
      slot.contactChannel !== null ||
      slot.writtenConfirmUri !== null ||
      slot.mouDocumentUri !== null ||
      slot.mouSignedAt !== null ||
      slot.agreementKind !== null ||
      slot.legalBindingAttested !== false
    ) {
      throw new PartnerLockPrepError(
        "Partner-lock prep cannot invent MoU text, named orgs, or legalBinding attestations",
      );
    }
  }
  if (!Array.isArray(prep.checks) || prep.checks.length === 0) {
    throw new PartnerLockPrepError("Partner-lock prep checks missing");
  }
  for (const check of prep.checks) {
    if (check.plane === "founder" && check.status === "CLEARED") {
      throw new PartnerLockPrepError(`Founder check ${check.id} cannot be CLEARED in empty MoU prep`);
    }
  }
  if (
    prep.activeFixture.legalBinding !== false ||
    prep.activeFixture.lockedPilot !== false ||
    prep.activeFixture.agreementKind !== "hypothetical_test_only"
  ) {
    throw new PartnerLockPrepError("Active fixture honesty must keep legalBinding/lockedPilot false");
  }
  const {prepHash, ...body} = prep;
  const expected = digest(body);
  if (prepHash !== expected) {
    throw new PartnerLockPrepError("Partner-lock prep hash mismatch");
  }
  return prep;
}
