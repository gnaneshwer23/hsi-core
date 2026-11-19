/**
 * Journey step 9 — testable next questions derived from one live run.
 * Surfaces gap next-steps and demoted unvalidated hypotheses (prediction /
 * experiment / falsifier). Does not invent experiments, recommend actions,
 * or claim scientific approval. Browser-safe (no Node-only imports).
 */

export const TESTABLE_NEXT_QUESTIONS_SCHEMA = "hsi-testable-next-questions-1" as const;

export type TestableQuestionSource = "run_gap" | "unvalidated_hypothesis";

export type TestableNextQuestionHonesty = {
  unvalidatedOnly: true;
  inventsExperiments: false;
  scientificApproval: false;
  clinicalAdvice: false;
  recommendsAction: false;
  journeyCompleteClaimed: false;
};

export const TESTABLE_NEXT_QUESTIONS_HONESTY: TestableNextQuestionHonesty = {
  unvalidatedOnly: true,
  inventsExperiments: false,
  scientificApproval: false,
  clinicalAdvice: false,
  recommendsAction: false,
  journeyCompleteClaimed: false,
};

export type TestableNextQuestion = {
  id: string;
  source: TestableQuestionSource;
  title: string;
  why: string;
  prediction: string | null;
  experiment: string | null;
  falsifier: string | null;
  nextStep: string;
  scopeLabel: string;
  citedClaimIds: readonly string[];
  linkedGapId: string | null;
  demoted: true;
  scientificApproval: false;
};

export type RunGapLike = {
  id: string;
  scope: "scientific" | "retrieval" | "assessment";
  title: string;
  detail: string;
  nextStep: string;
  candidateIds: readonly string[];
};

export type HypothesisLike = {
  id: string;
  statement: string;
  rationale: string;
  prediction: string;
  experiment: string;
  falsifier: string;
  limits: string;
  citedClaimIds: readonly string[];
  state: string;
  challenge: { verdict: string; reason: string } | null;
};

export type TestableNextQuestionsPack = {
  schemaVersion: typeof TESTABLE_NEXT_QUESTIONS_SCHEMA;
  honesty: TestableNextQuestionHonesty;
  items: readonly TestableNextQuestion[];
  gapDerivedCount: number;
  hypothesisDerivedCount: number;
  note: string;
};

export function assertTestableNextQuestionsHonesty(
  honesty: TestableNextQuestionHonesty,
): TestableNextQuestionHonesty {
  if (honesty.unvalidatedOnly !== true) throw Error("unvalidatedOnly must be true");
  if (honesty.inventsExperiments !== false) throw Error("inventsExperiments must be false");
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.clinicalAdvice !== false) throw Error("clinicalAdvice must be false");
  if (honesty.recommendsAction !== false) throw Error("recommendsAction must be false");
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  return honesty;
}

const SCOPE_LABEL: Record<RunGapLike["scope"], string> = {
  scientific: "Scientific gap (from this run)",
  retrieval: "Retrieval limit (not a scientific finding)",
  assessment: "Assessment limit (check did not decide)",
};

/** Build demoted testable next questions from run gaps + unvalidated hypotheses. */
export function buildTestableNextQuestions(input: {
  gaps: readonly RunGapLike[];
  hypotheses: readonly HypothesisLike[];
  hypothesesStatus: string;
}): TestableNextQuestionsPack {
  const honesty = assertTestableNextQuestionsHonesty(TESTABLE_NEXT_QUESTIONS_HONESTY);
  const fromGaps: TestableNextQuestion[] = input.gaps.slice(0, 8).map((g) => ({
    id: `tq-gap:${g.id}`,
    source: "run_gap" as const,
    title: g.title,
    why: g.detail,
    prediction: null,
    experiment: null,
    falsifier: null,
    nextStep: g.nextStep,
    scopeLabel: SCOPE_LABEL[g.scope],
    citedClaimIds: g.candidateIds.slice(0, 12),
    linkedGapId: g.id,
    demoted: true as const,
    scientificApproval: false as const,
  }));

  const fromHyps: TestableNextQuestion[] = input.hypotheses
    .filter((h) => h.state === "unvalidated_hypothesis")
    .slice(0, 5)
    .map((h) => {
      const challenge =
        h.challenge != null
          ? `Second-model challenge: ${h.challenge.verdict}. ${h.challenge.reason}`
          : "Not challenged by a second model.";
      return {
        id: `tq-hyp:${h.id}`,
        source: "unvalidated_hypothesis" as const,
        title: h.statement,
        why: `${h.rationale} Limits: ${h.limits}. ${challenge}`,
        prediction: h.prediction,
        experiment: h.experiment,
        falsifier: h.falsifier,
        nextStep:
          "Keep demoted until a human records a falsifier outcome in the Hypothesis Ledger — not a recommendation.",
        scopeLabel: "Unvalidated AI hypothesis (demoted)",
        citedClaimIds: h.citedClaimIds.slice(0, 12),
        linkedGapId: null,
        demoted: true as const,
        scientificApproval: false as const,
      };
    });

  const items = [...fromGaps, ...fromHyps];
  const note =
    items.length === 0
      ? input.hypothesesStatus === "not_configured"
        ? "No testable next questions yet — gaps appear after a run; hypotheses need the two-model check."
        : "No gap-derived next steps or unvalidated hypotheses in this run."
      : "Derived only from this run's gaps and demoted hypotheses — not invented experiments, not recommendations.";

  return {
    schemaVersion: TESTABLE_NEXT_QUESTIONS_SCHEMA,
    honesty,
    items,
    gapDerivedCount: fromGaps.length,
    hypothesisDerivedCount: fromHyps.length,
    note,
  };
}
