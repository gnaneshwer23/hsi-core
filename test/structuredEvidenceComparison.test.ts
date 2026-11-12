/**
 * Milestone 2 Phase 3 — structured evidence comparison honesty tests.
 */
import {describe, expect, test} from "bun:test";
import type {
  CandidateBiologicalContext,
  ContextualCandidateRelationship,
} from "../src/evidence/contextualCandidateRelationships";
import {
  assessContradictionInvestigation,
  comparableUnitFromContextualCandidate,
  comparableUnitFromOpposingFinding,
  compareCandidatesAgainstOpposingFindings,
  compareContextualCandidatePairs,
  compareEvidenceUnits,
  projectPotentialContradictionTraces,
  type ComparableEvidenceUnit,
} from "../src/evidence/structuredEvidenceComparison";
import {attachStructuredComparisonToOpposingSearch} from "../src/evidence/opposingEvidenceSearch";
import {verifyRecordedGaps} from "../src/evidence/gapVerification";
import {projectLivingEvidenceForOutcome} from "../src/evidence/livingEvidenceExpansion";

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
  test("declared polarity without a source locator cannot establish conflict",()=>{
    const result=compareEvidenceUnits({left:unit({id:"a",findingPolarity:"supporting",biologicalContext:sscContext}),right:unit({id:"b",findingPolarity:"opposing",biologicalContext:sscContext,evidenceSourceIds:[]})});
    expect(result.outcome).toBe("insufficient_evidence");
  });
  test("rejects invalid budgets and duplicate candidates before pair work",()=>{
    for(const maxPairs of [NaN,Infinity,-1,0,1.5,101])expect(()=>compareContextualCandidatePairs({relationships:[],maxPairs})).toThrow("budget");
    const r=draftRel({id:"duplicate",findingPolarity:"supporting"});expect(()=>compareContextualCandidatePairs({relationships:[r,r]})).toThrow("duplicate");
  });
  test("method differences take precedence over matching coarse context",()=>{
    for(const polarity of ["supporting","opposing"] as const){
      const result=compareEvidenceUnits({left:unit({id:"a",findingPolarity:"supporting",biologicalContext:sscContext,methodologicalNote:"flow cytometry"}),right:unit({id:"b",findingPolarity:polarity,biologicalContext:sscContext,methodologicalNote:"bulk RNA sequencing"})});
      expect(result.outcome).toBe("methodological_difference");expect(result.graphPromotable).toBe(false);
    }
  });
  test("one-sided missing context is unknown rather than a biological difference",()=>{
    const partial=structuredClone(sscContext);partial.experimentalSystemsSpecies=[];
    const result=compareEvidenceUnits({left:unit({id:"a",findingPolarity:"supporting",biologicalContext:sscContext}),right:unit({id:"b",findingPolarity:"opposing",biologicalContext:partial})});
    expect(result.outcome).toBe("insufficient_comparability");expect(result.trace.missingContextAxes).toContain("experimentalSystemsSpecies");
  });
  test("identifiers preserve case and comparison IDs bind content and survive pair order",()=>{
    const a=unit({id:"a",findingPolarity:"supporting",biologicalContext:sscContext}),b=unit({id:"b",findingPolarity:"opposing",biologicalContext:sscContext});
    const first=compareEvidenceUnits({left:a,right:b});expect(compareEvidenceUnits({left:b,right:a}).id).toBe(first.id);
    b.responseIdentity="different-source-version";expect(compareEvidenceUnits({left:a,right:b}).id).not.toBe(first.id);
    b.object.value=b.object.value.toLowerCase();expect(compareEvidenceUnits({left:a,right:b}).outcome).toBe("insufficient_comparability");
    a.label="caller mutated";expect(first.left.label).not.toBe(a.label);
  });
  test("shared disease does not align different biological claims", () => {
    for(const findingPolarity of ["supporting","opposing"] as const){
      const result=compareEvidenceUnits({
        left:unit({id:"a",findingPolarity:"supporting",biologicalContext:sscContext}),
        right:unit({id:"b",findingPolarity,biologicalContext:sscContext,subject:{system:"CL",value:"CL:0000236",label:"B cell"}}),
      });
      expect(result.trace.sharedSubjectObject).toBe(false);
      expect(result.outcome).toBe("insufficient_comparability");
      expect(result.scientificApproval).toBe(false);
    }
  });
  test("shared entities/context do not make different predicates equivalent", () => {
    const result=compareEvidenceUnits({
      left:unit({id:"a",findingPolarity:"supporting",biologicalContext:sscContext,predicate:"associated_with"}),
      right:unit({id:"b",findingPolarity:"supporting",biologicalContext:sscContext,predicate:"causes"}),
    });
    expect(result.outcome).toBe("insufficient_comparability");
    expect(result.version).toBe("0.3.0");
  });
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

describe("contradiction investigation deepen (M2 phases 4–6)", () => {
  const emptyLiving = projectLivingEvidenceForOutcome({sourcePmids: [], snapshot: null});

  test("assessContradictionInvestigation records categories not predetermined conclusions", () => {
    const pack = compareContextualCandidatePairs({
      generatedAt: "2026-11-09T08:00:00.000Z",
      relationships: [
        draftRel({id: "rel-support", findingPolarity: "supporting", biologicalContext: sscContext}),
        draftRel({id: "rel-oppose", findingPolarity: "opposing", biologicalContext: sscContext}),
      ],
    });
    const assessment = assessContradictionInvestigation({
      pack,
      searchRecordId: "search:fixture",
      searchRecordHash: "a".repeat(64),
    });
    expect(assessment.honesty.categoriesAreNotPredeterminedConclusions).toBe(true);
    expect(assessment.honesty.explanationsNotVerifiedByLlmRationaleAlone).toBe(true);
    expect(assessment.honesty.scientificApproval).toBe(false);
    expect(assessment.honesty.graphPromotable).toBe(false);
    expect(assessment.items.every((i) => i.predeterminedConclusion === false)).toBe(true);
    expect(assessment.items.every((i) => i.scientificallyVerified === false)).toBe(true);
    expect(assessment.summary.genuineConflictCandidates).toBeGreaterThanOrEqual(1);
    expect(assessment.persistenceLines.some((l) => /genuine_conflict_candidate/.test(l))).toBe(true);
  });

  test("candidate×oppose compare + gap persists investigation categories; LLM-alone refused", () => {
    const candidates = [
      draftRel({id: "rel-support", findingPolarity: "supporting", biologicalContext: sscContext}),
    ];
    const pack = compareCandidatesAgainstOpposingFindings({
      candidates,
      opposingFindings: [
        {
          pmid: "99999999",
          doi: null,
          title: "Null finding: IL-21 not associated with fibrosis",
          polarityHint: "opposing_title_signal",
        },
      ],
      generatedAt: "2026-11-09T08:05:00.000Z",
    });
    expect(pack.comparisons.length).toBe(1);
    expect(pack.summary.potentialContradiction).toBe(1);

    const unit = comparableUnitFromOpposingFinding({
      finding: {
        pmid: "1",
        doi: null,
        title: "opposing title",
        polarityHint: "opposing_title_signal",
      },
      subject: {system: "CL", value: "CL:0000844", label: "Tfh"},
      object: {system: "UniProt", value: "Q9HBE4", label: "IL21"},
    });
    expect(unit.findingPolarity).toBe("opposing");
    expect(unit.id).toBe("oppose-pmid:1");

    const baseReport = {
      schemaVersion: "hsi-opposing-evidence-search-1" as const,
      method: "hsi.opposing_evidence_search.v1" as const,
      version: "0.1.0" as const,
      searchPerformed: true,
      status: "completed_bounded" as const,
      searchScope: {
        providers: ["europe_pmc", "open_targets"] as const,
        contentLevel: "metadata" as const,
        dateOfSearch: "2026-11-09T08:05:00.000Z",
        corpusNote: "fixture",
        queryVariants: ["q"],
        bounded: true as const,
      },
      findings: [
        {
          pmid: "99999999",
          doi: null,
          title: "Null finding: IL-21 not associated with fibrosis",
          polarityHint: "opposing_title_signal" as const,
          note: "fixture",
          sourceIdentityDistinctFromClaimSupport: true as const,
          claimSupport: "not_assessed" as const,
        },
      ],
      recordedOpposingCandidateIds: [] as string[],
      coverage: {
        literatureAttempts: 1,
        literatureHits: 1,
        openTargetsAttempts: 0,
        openTargetsHits: 0,
        providerUnavailable: false,
        successfulEmpty: false,
        overallOutcome: "successful_hits" as const,
      },
      searchRecordId: "search:fixture",
      searchRecordHash: "b".repeat(64),
      limitations: ["fixture"],
      structuredComparison: null,
      contradictionInvestigation: null,
      consensusEstablished: false as const,
      providerUnavailableDistinctFromNoEvidence: true as const,
      scientificApproval: false as const,
      graphPromotable: false as const,
    };

    const enriched = attachStructuredComparisonToOpposingSearch({
      report: baseReport,
      candidates,
      generatedAt: "2026-11-09T08:05:00.000Z",
    });
    expect(enriched.contradictionInvestigation).not.toBeNull();
    expect(enriched.contradictionInvestigation!.honesty.categoriesAreNotPredeterminedConclusions).toBe(
      true,
    );

    const gaps = verifyRecordedGaps({
      asOf: "2026-11-09T08:05:00.000Z",
      branches: [
        {
          id: "b-1",
          assessment: "insufficient_evidence",
          supportingClaimIds: ["rel-support"],
          opposingClaimIds: [],
          missingEvidence: [
            "Independent contradictory or null findings — structured comparison recorded potential contradiction investigation categories",
          ],
          uncertainty: [],
        },
      ],
      claimContexts: [],
      localSourcePmids: [],
      contradictions: {
        recordedOpposingClaimIds: ["oppose-pmid:99999999"],
        searchStatus: "completed_bounded",
      },
      livingEvidence: emptyLiving,
      opposingSearch: enriched,
      contradictionInvestigation: enriched.contradictionInvestigation,
      semanticSupports: [
        {
          matchText:
            "Independent contradictory or null findings — structured comparison recorded potential contradiction investigation categories",
          reasoningRecord: "LLM-only rationale without supporting passage",
        },
      ],
    });
    const item = gaps.items[0]!;
    expect(item.kind).toBe("contradictory_findings");
    expect(item.trace.contradictionInvestigationCategories).toContain("genuine_conflict_candidate");
    expect(item.semanticSupport.acceptedForSemanticAnalysis).toBe(false);
    expect(item.scientificallyValidated).toBe(false);
  });
});
