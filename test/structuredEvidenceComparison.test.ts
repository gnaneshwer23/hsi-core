/**
 * Milestone 2 Phase 3 — structured evidence comparison honesty tests.
 */
import {describe, expect, test} from "bun:test";
import type {
  CandidateBiologicalContext,
  ContextualCandidateRelationship,
} from "../src/evidence/contextualCandidateRelationships";
import {
  comparableUnitFromContextualCandidate,
  compareContextualCandidatePairs,
  compareEvidenceUnits,
  projectPotentialContradictionTraces,
  type ComparableEvidenceUnit,
} from "../src/evidence/structuredEvidenceComparison";

const emptyContext: CandidateBiologicalContext = {
  diseasePhenotype: [],
  organTissueCellState: [],
  genesProteinsPathways: [],
  experimentalSystemsSpecies: [],
  interventionsTargets: [],
};

function ctx(partial: Partial<CandidateBiologicalContext>): CandidateBiologicalContext {
  return {...emptyContext, ...partial};
}

function unit(overrides: Partial<ComparableEvidenceUnit> & Pick<ComparableEvidenceUnit, "id" | "findingPolarity">): ComparableEvidenceUnit {
  return {
    id: overrides.id,
    label: overrides.label ?? overrides.id,
    subject: overrides.subject ?? {system: "CL", value: "CL:0000844", label: "Tfh"},
    predicate: overrides.predicate ?? "associated_with",
    object: overrides.object ?? {system: "UniProt", value: "Q9HBE4", label: "IL21"},
    findingPolarity: overrides.findingPolarity,
    biologicalContext: overrides.biologicalContext ?? emptyContext,
    evidenceSourceIds: overrides.evidenceSourceIds ?? [`pmid:${overrides.id}`],
    sourceProvider: overrides.sourceProvider ?? "fixture",
    responseIdentity: overrides.responseIdentity ?? null,
    methodologicalNote: overrides.methodologicalNote ?? null,
  };
}

function draftRel(
  overrides: Partial<ContextualCandidateRelationship> &
    Pick<ContextualCandidateRelationship, "id" | "findingPolarity">,
): ContextualCandidateRelationship {
  return {
    schemaVersion: "hsi-contextual-candidate-relationship-1",
    id: overrides.id,
    kind: "declared_contextual_association",
    subject: overrides.subject ?? {system: "CL", value: "CL:0000844", label: "Tfh"},
    predicate: overrides.predicate ?? "associated_with",
    object: overrides.object ?? {system: "UniProt", value: "Q9HBE4", label: "IL21"},
    findingPolarity: overrides.findingPolarity,
    biologicalContext:
      overrides.biologicalContext ??
      ctx({
        diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "systemic sclerosis"}],
        genesProteinsPathways: [{system: "UniProt", value: "Q9HBE4", label: "IL21"}],
      }),
    evidenceSourceIds: overrides.evidenceSourceIds ?? ["pmid:1"],
    sourceProvider: overrides.sourceProvider ?? "fixture",
    responseIdentity: overrides.responseIdentity ?? null,
    version: "0.1.0",
    reviewState: "draft",
    surfaceLabel: "fixture",
    axes: {curationReview: "draft", hsiGrade: "unexplored", teachingStatus: "unknown"},
    claimSupport: false,
    scientificApproval: false,
    graphPromotable: false,
    needsHumanReview: true,
    limitations: ["metadata_only", "claim_support_not_assessed", "human_review_required"],
    associationScore: null,
    note: "fixture",
  };
}

const sscContext = ctx({
  diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "systemic sclerosis"}],
  organTissueCellState: [{system: "UBERON", value: "UBERON:0002048", label: "lung"}],
  genesProteinsPathways: [{system: "UniProt", value: "Q9HBE4", label: "IL21"}],
  experimentalSystemsSpecies: [{system: "NCBITaxon", value: "9606", label: "Homo sapiens"}],
});

const mouseContext = ctx({
  diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "systemic sclerosis"}],
  organTissueCellState: [{system: "UBERON", value: "UBERON:0002048", label: "lung"}],
  genesProteinsPathways: [{system: "UniProt", value: "Q9HBE4", label: "IL21"}],
  experimentalSystemsSpecies: [{system: "NCBITaxon", value: "10090", label: "Mus musculus"}],
});

describe("structured evidence comparison outcomes", () => {
  test("matching polarities + shared context → consistent (not scientific approval)", () => {
    const result = compareEvidenceUnits({
      left: unit({id: "a", findingPolarity: "supporting", biologicalContext: sscContext}),
      right: unit({id: "b", findingPolarity: "supporting", biologicalContext: sscContext}),
    });
    expect(result.outcome).toBe("consistent");
    expect(result.claimSupport).toBe("not_assessed");
    expect(result.scientificApproval).toBe(false);
    expect(result.graphPromotable).toBe(false);
    expect(result.needsHumanReview).toBe(true);
    expect(result.honesty.potentialContradictionIsNotProvenContradiction).toBe(true);
    expect(result.trace.sharedSubjectObject).toBe(true);
    expect(result.rationale.toLowerCase()).toContain("not scientific");
  });

  test("opposite polarities + shared context → potential_contradiction (not proven)", () => {
    const result = compareEvidenceUnits({
      left: unit({id: "a", findingPolarity: "supporting", biologicalContext: sscContext}),
      right: unit({id: "b", findingPolarity: "opposing", biologicalContext: sscContext}),
    });
    expect(result.outcome).toBe("potential_contradiction");
    expect(result.rationale.toLowerCase()).toMatch(/potential contradiction/);
    expect(result.rationale.toLowerCase()).toContain("not a proven scientific contradiction");
    expect(result.honesty.autoPromotedToApprovedGraph).toBe(false);
  });

  test("opposite polarities + divergent species → methodological_difference or context_dependent", () => {
    const result = compareEvidenceUnits({
      left: unit({id: "human", findingPolarity: "supporting", biologicalContext: sscContext}),
      right: unit({id: "mouse", findingPolarity: "opposing", biologicalContext: mouseContext}),
    });
    expect(["methodological_difference", "context_dependent"]).toContain(result.outcome);
    expect(result.trace.divergentContextAxisCount).toBeGreaterThan(0);
    expect(result.trace.methodologicalSignals).toContain("experimental_system_disjoint");
  });

  test("missing context / uncertain polarity → insufficient_evidence", () => {
    const result = compareEvidenceUnits({
      left: unit({id: "a", findingPolarity: "uncertain", biologicalContext: emptyContext}),
      right: unit({id: "b", findingPolarity: "uncertain", biologicalContext: emptyContext}),
    });
    expect(result.outcome).toBe("insufficient_evidence");
  });

  test("disjoint entities without shared context → insufficient_comparability", () => {
    const result = compareEvidenceUnits({
      left: unit({
        id: "a",
        findingPolarity: "supporting",
        subject: {system: "CL", value: "CL:0000844", label: "Tfh"},
        object: {system: "UniProt", value: "Q9HBE4", label: "IL21"},
        biologicalContext: emptyContext,
      }),
      right: unit({
        id: "b",
        findingPolarity: "opposing",
        subject: {system: "CL", value: "CL:0000236", label: "B cell"},
        object: {system: "UniProt", value: "P01375", label: "TNF"},
        biologicalContext: emptyContext,
      }),
    });
    expect(result.outcome).toBe("insufficient_comparability");
  });
});

describe("contextual candidate pack + projection", () => {
  test("compareContextualCandidatePairs summarises outcomes and refuses promotion", () => {
    const pack = compareContextualCandidatePairs({
      generatedAt: "2026-11-09T07:00:00.000Z",
      relationships: [
        draftRel({id: "rel-support", findingPolarity: "supporting"}),
        draftRel({id: "rel-oppose", findingPolarity: "opposing"}),
        draftRel({
          id: "rel-other",
          findingPolarity: "uncertain",
          biologicalContext: emptyContext,
        }),
      ],
    });
    expect(pack.comparisons.length).toBe(3);
    expect(pack.summary.potentialContradiction).toBeGreaterThanOrEqual(1);
    expect(pack.honesty.notScientificValidity).toBe(true);
    expect(pack.honesty.autoPromotedToApprovedGraph).toBe(false);

    const traces = projectPotentialContradictionTraces(pack);
    expect(traces.honesty.potentialContradictionIsNotProvenContradiction).toBe(true);
    expect(traces.traces.every((t) => t.scientificallyVerified === false)).toBe(true);
    expect(traces.traces.every((t) => t.needsHumanReview === true)).toBe(true);
  });

  test("comparableUnitFromContextualCandidate preserves draft honesty gates", () => {
    const rel = draftRel({id: "rel-1", findingPolarity: "supporting"});
    const u = comparableUnitFromContextualCandidate(rel);
    expect(u.id).toBe("rel-1");
    expect(u.findingPolarity).toBe("supporting");
    expect(u.biologicalContext.diseasePhenotype[0]?.value).toBe("MONDO:0005100");
  });
});
