/**
 * Stage 1 numeric rubric success thresholds.
 *
 * Active path: **hypothetical test fixture**
 * (`thresholdSource=hypothetical_test_fixture`, `set_for_test`).
 * Real `partner_agreed` numbers require a written partner confirm —
 * never invent from chat. Prior Apolo “partner_agreed” path revoked 2026-11-02.
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
 * Fixture Stage 1 numeric cut-offs (path-testing only).
 *
 * Baseline 12 / 4 / 6 with honest safety margin vs current pack
 * (scoped≈14, competing≈5, LOINC≈8). Gate C pending allowed;
 * acceptance may remain green_with_pending while real partner / licensing
 * stay open. Replace with partner-agreed numbers only after written confirm.
 */
export const HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS: Stage1NumericThresholds = {
  minPartnerScopedEdges: 12,
  minCompetingExplanations: 4,
  minLoincLinkedClaims: 6,
  gateCPendingAllowed: true,
  acceptanceOverallAllowed: "green_with_pending",
};

/** @deprecated Alias — use HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS. */
export const APOLO_PARTNER_AGREED_STAGE1_NUMERIC_THRESHOLDS =
  HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS;

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
      numeric: { ...HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS },
      qualitativeFixturePlaceholders: {
        ...HYPOTHETICAL_STAGE1_QUALITATIVE_PLACEHOLDERS,
      },
      honesty: [
        "thresholdSource=hypothetical_test_fixture — path-testing only.",
        "replaceWithPartnerAgreedThresholds=true — real partner must re-agree numbers.",
        "Does not set legalBinding or invent a MoU.",
        "Gate C pending rows are allowed under this fixture.",
        "acceptanceOverallAllowed=green_with_pending is intentional while licensing / real partner remain open.",
        "Prior Apolo partner_agreed path revoked 2026-11-02 — not a MoU.",
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
    numeric: { ...HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS },
    qualitativeFixturePlaceholders: {
      ...HYPOTHETICAL_STAGE1_QUALITATIVE_PLACEHOLDERS,
    },
    honesty: [
      "thresholdSource=partner_agreed — only after a real written partner confirm (template path).",
      "replaceWithPartnerAgreedThresholds=false once numbers are truly partner-agreed.",
      "Numeric baseline default: minPartnerScopedEdges=12, minCompetingExplanations=4, minLoincLinkedClaims=6.",
      "gateCPendingAllowed=true; acceptanceOverallAllowed=green_with_pending.",
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
