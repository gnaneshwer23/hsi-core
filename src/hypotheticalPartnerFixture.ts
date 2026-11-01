/**
 * Partner fixture swap point — single place to flip hypothetical → named org.
 *
 * Active path (2026-11-01): **Apolo Pharma** (`partner:apolo-pharma`).
 * MoU / written-confirm paperwork is **operator-asserted** by workspace
 * instruction — never invent emails, phone numbers, or named PI contacts.
 *
 * Honesty: still **not CDS**; Gate C never auto-approves; RA Stage 1
 * `activeScope` unchanged; dual-track SSc / gut / neuro continues.
 *
 * ## How this file works
 *
 * 1. `USE_HYPOTHETICAL_PARTNER_FIXTURE = false` → `REAL_PARTNER_REPLACEMENT`
 *    feeds `partnerLock.ts` (`legalBinding` → `lockedPilot`).
 * 2. Keep `HYPOTHETICAL_PARTNER_FIXTURE` as a recoverable test template only.
 * 3. Record the org in `docs/ISI_PILOT_PARTNER_SHORTLIST.md` (no invented emails).
 * 4. Rubric thresholds for Apolo Pharma are `partner_agreed`
 *    (`src/stage1RubricThresholds.ts`; operator-agreed 2026-11-01).
 * 5. Re-run `bun run outputs` after edits.
 */

export const USE_HYPOTHETICAL_PARTNER_FIXTURE = false as boolean;

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
 * Recoverable hypothetical fixture template (inactive while
 * USE_HYPOTHETICAL_PARTNER_FIXTURE=false).
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
 * Active named partner (Apolo Pharma). MoU paperwork is operator-asserted
 * by user instruction — do not invent emails / phones / PI names.
 */
export const REAL_PARTNER_REPLACEMENT = {
  partner: {
    id: "partner:apolo-pharma",
    label: "Apolo Pharma",
    type: "named_partner" as const,
    region: "unspecified" as const,
    contactChannel: "programme_introduction" as const,
    outreachStatus: "confirmed" as const,
    notes:
      "Named pilot partner Apolo Pharma (id partner:apolo-pharma). MoU / written-confirm paperwork is operator-asserted by HSI workspace instruction (2026-11-01) — no invented emails, phones, or named PI contacts in code. Still not CDS; Gate C never auto-approves. RA Stage 1 activeScope unchanged; dual-track SSc/gut/neuro continues. Stage 1 numeric KPIs partner_agreed (2026-11-01); partnerClearedCount licensing remains open.",
  },
  agreementKind: "legal_mou" as PartnerAgreementKind,
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
