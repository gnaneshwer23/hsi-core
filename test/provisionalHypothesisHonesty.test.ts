import { describe, expect, test } from "bun:test";
import {
  PROVISIONAL_EXPERIMENT_LABEL,
  PROVISIONAL_HYPOTHESIS_HONESTY,
  PROVISIONAL_HYPOTHESIS_HONESTY_LINE,
  PROVISIONAL_HYPOTHESIS_TAGLINE,
  assertProvisionalHypothesisHonesty,
} from "../src/investigation/provisionalHypothesisHonesty";

describe("provisionalHypothesisHonesty", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertProvisionalHypothesisHonesty(PROVISIONAL_HYPOTHESIS_HONESTY);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.inventsFindings).toBe(false);
    expect(honesty.recommendsAction).toBe(false);
    expect(honesty.hypothesesAreProvisional).toBe(true);
    expect(honesty.experimentsAreProvisional).toBe(true);
  });

  test("labels stay provisional and never claim approval", () => {
    expect(PROVISIONAL_HYPOTHESIS_TAGLINE).toMatch(/provisional/i);
    expect(PROVISIONAL_EXPERIMENT_LABEL).toMatch(/provisional/i);
    expect(PROVISIONAL_HYPOTHESIS_HONESTY_LINE).toMatch(/provisional/i);
    expect(PROVISIONAL_HYPOTHESIS_HONESTY_LINE.toLowerCase()).not.toMatch(
      /scientifically approved|recommended action/,
    );
  });
});
