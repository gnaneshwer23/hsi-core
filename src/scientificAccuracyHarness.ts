/**
 * Structural checks for a research investigation.
 * Scientific scores stay "not_yet_scored" until a human records them.
 * This file does not invent reviewer names, approvals, or scores.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ScientificInvestigation } from "./scientificInvestigation";

export const EVALUATION_STATUS = "DRAFT - awaiting expert review" as const;
export const NOT_YET_SCORED = "not_yet_scored" as const;

export type ScientificScore = typeof NOT_YET_SCORED;

export type ReferenceQuestion = {
  id: string;
  question: string;
  role: string;
  criteria: string[];
};

export type ReferenceQuestionSet = {
  status: typeof EVALUATION_STATUS;
  reviewerName: null;
  approved: false;
  scoresRecorded: false;
  questions: ReferenceQuestion[];
};

export type EvaluationReport = {
  status: typeof EVALUATION_STATUS;
  reviewerName: null;
  approved: false;
  scores: {
    scientificAccuracy: ScientificScore;
    evidenceSupport: ScientificScore;
    contradictionDetection: ScientificScore;
    gapUsefulness: ScientificScore;
  };
  structuralChecks: Array<{ id: string; pass: boolean; note: string }>;
  questions: ReferenceQuestion[];
};

export function loadReferenceQuestions(cwd = process.cwd()): ReferenceQuestionSet {
  const path = resolve(cwd, "evaluation/scientific-investigation/reference-questions.json");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ReferenceQuestionSet;
  if (parsed.status !== EVALUATION_STATUS || parsed.approved !== false || parsed.reviewerName !== null || parsed.scoresRecorded !== false) {
    throw new Error("Reference questions must stay draft, unscored, and unapproved");
  }
  if (!parsed.questions.some((item) => item.id === "rq-ssc-tfh-il21")) {
    throw new Error("The systemic sclerosis reference question is missing");
  }
  return parsed;
}

export function evaluateInvestigation(record: ScientificInvestigation, questions = loadReferenceQuestions()): EvaluationReport {
  const structuralChecks = [
    {
      id: "four-tiers-present",
      pass: record.verifiedEvidenceNote.includes("Verified evidence") && record.tierCounts.uncertain_association > 0 && record.tierCounts.computational_inference > 0 && record.tierCounts.unvalidated_hypothesis > 0,
      note: "The four tier labels are present. Verified evidence is empty unless a human review says otherwise.",
    },
    {
      id: "no-self-verified-biology",
      pass: record.tierCounts.verified_evidence === 0 && record.evidence.every((claim) => claim.tier !== "verified_evidence"),
      note: "This composer did not mark its own claims as verified evidence.",
    },
    {
      id: "contradiction-visible",
      pass: record.contradictions.some((item) => item.resolution === "unresolved"),
      note: "At least one contradiction is recorded as unresolved.",
    },
    {
      id: "gaps-named",
      pass: record.gaps.length >= 3,
      note: "Gaps are listed. Usefulness is not scored.",
    },
    {
      id: "provenance-both-ways",
      pass: record.evidence.every((claim) => claim.sourceIds.every((id) => record.sources.some((source) => source.id === id && source.claimIds.includes(claim.id)))),
      note: "Each claim points at a source that points back.",
    },
  ];
  return {
    status: EVALUATION_STATUS,
    reviewerName: null,
    approved: false,
    scores: {
      scientificAccuracy: NOT_YET_SCORED,
      evidenceSupport: NOT_YET_SCORED,
      contradictionDetection: NOT_YET_SCORED,
      gapUsefulness: NOT_YET_SCORED,
    },
    structuralChecks,
    questions: questions.questions,
  };
}
