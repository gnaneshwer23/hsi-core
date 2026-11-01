import { describe, expect, test } from "bun:test";
import {
  HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS,
  buildPilotAcceptancePack,
  buildPilotEvidencePack,
  buildPilotReviewRubric,
  evalPackAgainstStage1NumericThresholds,
  getStage1RubricThresholds,
} from "../src/index";

describe("Stage 1 rubric thresholds (Apolo Pharma named partner)", () => {
  test("exposes engineering defaults pending partner re-agree", () => {
    const th = getStage1RubricThresholds();
    expect(th.thresholdSource).toBe("unset");
    expect(th.thresholdStatus).toBe("pending");
    expect(th.replaceWithPartnerAgreedThresholds).toBe(true);
    expect(th.partnerId).toBe("partner:apolo-pharma");
    expect(th.agreementKind).toBe("legal_mou");
    expect(th.numeric).toEqual(HYPOTHETICAL_STAGE1_NUMERIC_THRESHOLDS);
    expect(th.numeric.minPartnerScopedEdges).toBe(12);
    expect(th.numeric.minCompetingExplanations).toBe(4);
    expect(th.numeric.minLoincLinkedClaims).toBe(6);
    expect(th.numeric.gateCPendingAllowed).toBe(true);
    expect(th.numeric.acceptanceOverallAllowed).toBe("green_with_pending");
  });

  test("current RA/TNF pack meets engineering numeric cut-offs", () => {
    const pack = buildPilotEvidencePack({
      generatedAt: "2026-11-01T21:00:00.000Z",
    });
    const ev = evalPackAgainstStage1NumericThresholds(pack);
    expect(ev.pass).toBe(true);
    expect(ev.partnerScopedEdges).toBeGreaterThanOrEqual(12);
    expect(ev.competingExplanations).toBeGreaterThanOrEqual(4);
    expect(ev.loincLinkedClaims).toBeGreaterThanOrEqual(6);
    expect(ev.gateCPending).toBeGreaterThan(0);
  });

  test("rubric + acceptance surface pending thresholds (licensing still open)", () => {
    const rubric = buildPilotReviewRubric({
      generatedAt: "2026-11-01T21:00:00.000Z",
    });
    expect(rubric.summary.thresholdStatus).toBe("pending");
    expect(rubric.checklist.find((c) => c.id === "x-3")?.status).toBe(
      "blocked_on_partner",
    );

    const acceptance = buildPilotAcceptancePack({
      generatedAt: "2026-11-01T21:00:00.000Z",
      rubric,
    });
    expect(acceptance.criteria.find((c) => c.id === "ac-thresholds")?.status).toBe(
      "pending",
    );
    expect(acceptance.criteria.find((c) => c.id === "ac-partner-signed")?.status).toBe(
      "pass",
    );
    expect(acceptance.summary.overallStage1Acceptance).toBe("green_with_pending");
  });
});
