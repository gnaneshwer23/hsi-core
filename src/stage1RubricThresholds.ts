/**
 * Stage 1 numeric rubric success thresholds.
 *
 * Active path (2026-11-01): **Apolo Pharma** (`partner:apolo-pharma`) —
 * operator-agreed KPIs (`thresholdSource=partner_agreed`).
 *
 * Hypothetical fixture path remains recoverable when
 * `USE_HYPOTHETICAL_PARTNER_FIXTURE=true` (`set_for_test` only).
 *
 * Never set legalBinding / invent a MoU from these cut-offs alone.
 * Still not CDS; Gate C never auto-approves.
 */

import {
  HYPOTHETICAL_PARTNER_FIXTURE,
  REAL_PARTNER_REPLACEMENT,
  USE_HYPOTHETICAL_PARTNER_FIXTURE,
} from "./hypotheticalPartnerFixture";
import type { PilotEvidencePack } from "./pilotEvidencePack";

export const STAGE1_RUBRIC_THRESHOLDS_SCHEMA =
  "hsi-stage1-rubric-thresholds-1" as const;

export type ThresholdSource =
  | "hypothetical_test_fixture"
  | "partner_agreed"
  | "unset";

export type ThresholdSetStatus = "set_for_test" | "partner_agreed" | "pending";

/** Numeric Stage 1 pack cut-offs used by rubric / acceptance. */
export type Stage1NumericThresholds = {
  /** Min evidence-map rows scoped to the locked RA/anti-TNF pathway. */
  minPartnerScopedEdges: number;
  /** Min competing explanation frames kept visible. */
  minCompetingExplanations: number;
  /** Min claims with a LOINC marker wired. */
  minLoincLinkedClaims: number;
  /** Gate C pending rows are allowed (expected) — not a fail. */
  gateCPendingAllowed: true;
  /** Overall acceptance may stay green_with_pending while licensing remains open. */
  acceptanceOverallAllowed: "green_with_pending";
};

/** Qualitative pilot metrics — operational placeholders (not MoU revenue KPIs). */
export type Stage1QualitativeThresholdPlaceholders = {
  timeSavedHoursVsBaselineMin: number;
  usefulEvidenceItemsKeptMin: number;
  clearerNextDecisionRequired: true;
  expertRejectionsRecordedMin: number;
};

export type Stage1RubricThresholdsBundle = {
  schemaVersion: typeof STAGE1_RUBRIC_THRESHOLDS_SCHEMA;
  notCds: true;
  thresholdSource: ThresholdSource;
  thresholdStatus: ThresholdSetStatus;
  replaceWithPartnerAgreedThresholds: boolean;
  partnerId: string | null;
  agreementKind: "hypothetical_test_only" | "written_confirm" | "legal_mou" | null;
  numeric: Stage1NumericThresholds;
  qualitativeFixturePlaceholders: Stage1QualitativeThresholdPlaceholders;
  honesty: string[];
};

/**
 * Apolo Pharma operator-agreed Stage 1 numeric cut-offs (2026-11-01).
 *
 * Kept at the prior fixture baseline (12 / 4 / 6) with honest safety margin
 * vs current pack (scoped≈14, competing≈5, LOINC≈8). Gate C pending allowed;
 * acceptance may remain green_with_pending while partnerClearedCount licensing
 * stays open.
 */
export const APOLO_PARTNER_AGREED_STAGE1_NUMERIC_THRESHOLDS: Stage1NumericThresholds =
  {
    minPartnerScopedEdges: 12,
    minCompetingExplanations: 4,
    minLoincLinkedClaims: 6,
    gateCPendingAllowed: true,
    acceptanceOverallAllowed: "green_with_pending",
  };

/** @deprecated Alias — same numbers as Apolo partner-agreed baseline. */
export const HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS =
  APOLO_PARTNER_AGREED_STAGE1_NUMERIC_THRESHOLDS;

export const HYPOTHETICAL_STAGE1_QUALITATIVE_PLACEHOLDERS: Stage1QualitativeThresholdPlaceholders =
  {
    timeSavedHoursVsBaselineMin: 2,
    usefulEvidenceItemsKeptMin: 5,
    clearerNextDecisionRequired: true,
    expertRejectionsRecordedMin: 1,
  };

export function getStage1RubricThresholds(): Stage1RubricThresholdsBundle {
  if (USE_HYPOTHETICAL_PARTNER_FIXTURE) {
    return {
      schemaVersion: STAGE1_RUBRIC_THRESHOLDS_SCHEMA,
      notCds: true,
      thresholdSource: "hypothetical_test_fixture",
      thresholdStatus: "set_for_test",
      replaceWithPartnerAgreedThresholds: true,
      partnerId: HYPOTHETICAL_PARTNER_FIXTURE.partner.id,
      agreementKind: "hypothetical_test_only",
      numeric: { ...APOLO_PARTNER_AGREED_STAGE1_NUMERIC_THRESHOLDS },
      qualitativeFixturePlaceholders: {
        ...HYPOTHETICAL_STAGE1_QUALITATIVE_PLACEHOLDERS,
      },
      honesty: [
        "thresholdSource=hypothetical_test_fixture — path-testing only.",
        "replaceWithPartnerAgreedThresholds=true — real partner must re-agree numbers.",
        "Does not set legalBinding or invent a MoU.",
        "Gate C pending rows are allowed under this fixture.",
        "acceptanceOverallAllowed=green_with_pending is intentional while licensing / real partner remain open.",
      ],
    };
  }

  return {
    schemaVersion: STAGE1_RUBRIC_THRESHOLDS_SCHEMA,
    notCds: true,
    thresholdSource: "partner_agreed",
    thresholdStatus: "partner_agreed",
    replaceWithPartnerAgreedThresholds: false,
    partnerId: REAL_PARTNER_REPLACEMENT.partner.id,
    agreementKind: REAL_PARTNER_REPLACEMENT.agreementKind,
    numeric: { ...APOLO_PARTNER_AGREED_STAGE1_NUMERIC_THRESHOLDS },
    qualitativeFixturePlaceholders: {
      ...HYPOTHETICAL_STAGE1_QUALITATIVE_PLACEHOLDERS,
    },
    honesty: [
      "thresholdSource=partner_agreed — Apolo Pharma operator-agreed Stage 1 KPIs (2026-11-01).",
      "partnerId=partner:apolo-pharma; replaceWithPartnerAgreedThresholds=false (already agreed).",
      "Numeric baseline kept honest: minPartnerScopedEdges=12, minCompetingExplanations=4, minLoincLinkedClaims=6 (pack ≈14/5/8).",
      "gateCPendingAllowed=true; acceptanceOverallAllowed=green_with_pending while partnerClearedCount licensing remains open.",
      "Does not invent CDS or auto Gate C from these cut-offs.",
    ],
  };
}

export type Stage1NumericThresholdEval = {
  pass: boolean;
  partnerScopedEdges: number;
  competingExplanations: number;
  loincLinkedClaims: number;
  gateCPending: number;
  against: Stage1NumericThresholds;
};

/** Evaluate a pilot evidence pack against the active Stage 1 numeric thresholds. */
export function evalPackAgainstStage1NumericThresholds(
  pack: PilotEvidencePack,
  thresholds: Stage1NumericThresholds = getStage1RubricThresholds().numeric,
): Stage1NumericThresholdEval {
  const partnerScopedEdges = pack.summary.partnerScopedEvidenceRows;
  const competingExplanations = pack.competingExplanations.length;
  const loincLinkedClaims = pack.summary.claimsWithLoinc;
  const gateCPending = pack.summary.gateCPending;

  const pass =
    partnerScopedEdges >= thresholds.minPartnerScopedEdges &&
    competingExplanations >= thresholds.minCompetingExplanations &&
    loincLinkedClaims >= thresholds.minLoincLinkedClaims &&
    (thresholds.gateCPendingAllowed || gateCPending === 0);

  return {
    pass,
    partnerScopedEdges,
    competingExplanations,
    loincLinkedClaims,
    gateCPending,
    against: thresholds,
  };
}
