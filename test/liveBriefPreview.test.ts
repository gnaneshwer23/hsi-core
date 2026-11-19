import { describe, expect, test } from "bun:test";
import {
  assertLiveBriefPreviewHonesty,
  buildLiveBriefPreview,
  LIVE_BRIEF_PREVIEW_HONESTY,
} from "../src/investigation/liveBriefPreview";
import type { LiveInvestigation } from "../src/investigation/liveRun";

const emptyComparison = {
  schemaVersion: "hsi-live-structured-comparison-1" as const,
  method: "hsi.structured_evidence_comparison.v1" as const,
  version: "0.3.0",
  pairCount: 0,
  summary: {
    consistent: 0,
    potentialContradiction: 0,
    contextDependent: 0,
    methodologicalDifference: 0,
    insufficientComparability: 0,
    insufficientEvidence: 0,
  },
  items: [],
  honesty: {
    metadataOrDeclaredContextOnly: true,
    associationScoreIsNotCausation: true,
    potentialContradictionIsNotProvenContradiction: true,
    verificationBoundBeforeContradictionLanguage: true,
    scientificApproval: false,
    graphPromotable: false,
    claimSupport: "not_assessed" as const,
    gateCAutoApprove: false,
    cdsPhi: false,
    neonContradictionLedger: false,
  },
};

const sampleRun = {
  schemaVersion: "hsi-live-investigation-1",
  mode: "live",
  scenarioId: "il21-autoimmune",
  question: "Why might IL-21 signalling differ?",
  version: 1,
  briefHash: "a".repeat(64),
  entities: ["IL-21"],
  searches: [],
  records: [],
  targets: [],
  byContext: {},
  verification: {
    status: "not_configured",
    reason: "disabled",
    checked: 0,
    independence: null,
  },
  hypotheses: {
    status: "not_configured",
    reason: "disabled",
    items: [],
    dropped: 0,
    basis: { findings: 0 },
  },
  structuredComparison: emptyComparison,
  gaps: ["Search failed: openalex for ssc (HTTP 500)."],
  budget: null,
  flags: {
    scientificApproval: false,
    graphPromotable: false,
    consensusEstablished: false,
    humanReview: "required",
    clinicalAdvice: false,
    containsPhi: false,
  },
  events: [],
  candidates: [
    {
      id: "c1",
      relationId: "il21-tfh",
      subject: "IL-21",
      object: "Tfh",
      contexts: ["ssc"],
      species: "human",
      sourceId: "s1",
      sourceUrl: "https://example.test/1",
      sentence: "IL-21 was increased.",
      state: "extracted_candidate",
      lexicalPolarity: "supporting",
      polarityBasis: "not_assessed",
      direction: "not_assessed",
      polarity: "uncertain",
      priority: { score: 1, reasons: [] },
      verification: "not_run",
      verdicts: [],
      retraction: "not_flagged_by_provider",
    },
  ],
} as unknown as LiveInvestigation;

describe("live brief preview", () => {
  test("keeps briefAccepted false and surfaces limitations", () => {
    const honesty = assertLiveBriefPreviewHonesty(LIVE_BRIEF_PREVIEW_HONESTY);
    expect(honesty.briefAccepted).toBe(false);
    expect(honesty.limitationsAlwaysVisible).toBe(true);
    expect(honesty.passportColumnsAlwaysVisible).toBe(true);

    const preview = buildLiveBriefPreview(sampleRun, 1);
    expect(preview.schemaVersion).toBe("hsi-live-brief-preview-1");
    expect(preview.honesty.briefAccepted).toBe(false);
    expect(preview.limitations.length).toBeGreaterThan(0);
    expect(preview.limitations.some((l) => /Candidate-only/i.test(l))).toBe(true);
    expect(preview.limitations).toContain(sampleRun.gaps[0]);
    expect(preview.passportRowCount).toBe(1);
    expect(preview.reviewedEdgeCount).toBe(0);
    expect(preview.brief.scientificApproval).toBe(false);
  });
});
