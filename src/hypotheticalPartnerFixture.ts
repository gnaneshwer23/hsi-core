/**
 * TEST FIXTURE PARTNER — single swap point for a real org.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  TEST FIXTURE — replace before real pilot                   │
 * │  Not a MoU / MoA / named legal partner.                     │
 * │  Production ISI must ignore unless ALLOW_HYPOTHETICAL_PARTNER │
 * └─────────────────────────────────────────────────────────────┘
 *
 * ## How to replace with a real partner
 *
 * 1. Set `USE_HYPOTHETICAL_PARTNER_FIXTURE = false`.
 * 2. Fill `REAL_PARTNER_REPLACEMENT` (id, label, type=`named_partner`, …).
 * 3. Set `agreementKind` to a real confirm kind, `legalBinding=true`,
 *    `replaceWithRealPartner=false`, `isHypothetical=false`.
 * 4. Record the org in `docs/ISI_PILOT_PARTNER_SHORTLIST.md` (no invented emails).
 * 5. Re-agree licensing + rubric thresholds (fixture numbers are
 *    `set_for_test` only — see `src/stage1RubricThresholds.ts`); then
 *    `bun run outputs`.
 *
 * `partnerSigned=true` here is **path-testing only** under
 * `agreementKind: hypothetical_test_only`. `lockedPilot` stays false until
 * `legalBinding=true` (see `partnerLock.ts`).
 */

export const USE_HYPOTHETICAL_PARTNER_FIXTURE = true as boolean;

/** Env flag production ISI / Discovery consumers should require before trusting fixture partnerSigned. */
export const ALLOW_HYPOTHETICAL_PARTNER_ENV = "ALLOW_HYPOTHETICAL_PARTNER";

export type PartnerAgreementKind =
  | "hypothetical_test_only"
  | "written_confirm"
  | "legal_mou";

export type HypotheticalPartnerFixtureFields = {
  partner: {
    id: string;
    label: string;
    type: "hypothetical_test_fixture";
    region: "UK" | "EU" | "US" | "other" | "unspecified";
    contactChannel: "public_institute_channel" | "programme_introduction" | "named_contact" | "none";
    outreachStatus: "test_fixture";
    notes: string;
  };
  agreementKind: "hypothetical_test_only";
  replaceWithRealPartner: true;
  legalBinding: false;
  isHypothetical: true;
  notALegalAgreement: true;
  testPilotMode: true;
  /** Path-testing flag only — not a legal MoU. */
  partnerSigned: true;
  banner: string;
};

/**
 * Active hypothetical fixture. Edit THIS object (or flip
 * USE_HYPOTHETICAL_PARTNER_FIXTURE) when swapping to a real partner.
 */
export const HYPOTHETICAL_PARTNER_FIXTURE: HypotheticalPartnerFixtureFields = {
  partner: {
    id: "test:hypothetical-isi-pilot-partner",
    label: "Hypothetical ISI Pilot Partner (replace with real org)",
    type: "hypothetical_test_fixture",
    region: "unspecified",
    contactChannel: "none",
    outreachStatus: "test_fixture",
    notes:
      "TEST FIXTURE — replace before real pilot. Not a legal MoU/MoA or named org. agreementKind=hypothetical_test_only; legalBinding=false; replaceWithRealPartner=true. Production ISI must ignore partnerSigned unless ALLOW_HYPOTHETICAL_PARTNER=true. Swap via src/hypotheticalPartnerFixture.ts.",
  },
  agreementKind: "hypothetical_test_only",
  replaceWithRealPartner: true,
  legalBinding: false,
  isHypothetical: true,
  notALegalAgreement: true,
  testPilotMode: true,
  partnerSigned: true,
  banner: "TEST FIXTURE — replace before real pilot",
};

/**
 * Template for the real partner swap. Fill when USE_HYPOTHETICAL_PARTNER_FIXTURE=false.
 * Do not invent org names, emails, or MoUs.
 */
export const REAL_PARTNER_REPLACEMENT = {
  partner: {
    id: "named:REPLACE_WITH_REAL_ORG_SLUG",
    label: "REPLACE WITH REAL ORG NAME",
    type: "named_partner" as const,
    region: "UK" as const,
    contactChannel: "programme_introduction" as const,
    outreachStatus: "confirmed" as const,
    notes:
      "Replace after written confirmation of disease + research question. Record shortlist row. Still no invented emails.",
  },
  agreementKind: "written_confirm" as PartnerAgreementKind,
  replaceWithRealPartner: false,
  legalBinding: true,
  isHypothetical: false,
  notALegalAgreement: false,
  testPilotMode: false,
  partnerSigned: true,
  banner: null as string | null,
};

export function isAllowHypotheticalPartnerEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = env[ALLOW_HYPOTHETICAL_PARTNER_ENV];
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
