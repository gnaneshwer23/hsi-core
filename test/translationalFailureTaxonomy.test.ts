/**
 * Milestone 4 Phase 2 — translational failure-mode investigation taxonomy honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  assessTranslationalFailureInvestigation,
  projectTranslationalFailurePersistenceLines,
  TRANSLATIONAL_FAILURE_INVESTIGATION_CATEGORIES,
} from "../src/evidence/translationalFailureTaxonomy";
import {buildTranslationalEvidenceContractPack} from "../src/evidence/translationalEvidenceContracts";
import {
  attachTranslationalTrialFromCtgovStudy,
  buildTranslationalLandscapeSnapshot,
} from "../src/evidence/translationalEvidenceAttach";
import {integrateResearchBrief} from "../src/evidence/researchBriefIntegration";
import {
  assessContradictionInvestigation,
  compareEvidenceUnits,
  type ComparableEvidenceUnit,
  type StructuredEvidenceComparisonPack,
} from "../src/evidence/structuredEvidenceComparison";
import type {CandidateBiologicalContext} from "../src/evidence/contextualCandidateRelationships";
import {
  OPEN_TARGETS_SCORE_HONESTY,
  type OpenTargetsDiseaseRecord,
} from "../src/evidence/openTargetsLookup";

const asOf = "2026-11-09T10:00:00.000Z";

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

const sscTargets: OpenTargetsDiseaseRecord[] = [
  {
    provider: "open_targets_platform_graphql_v4",
    diseaseId: "MONDO_0005100",
    diseaseName: "systemic sclerosis",
    associationCount: 1,
    associations: [
      {
        targetEnsemblId: "ENSG00000138685",
        approvedSymbol: "IL21",
        score: 0.42,
        datatypeScores: [],
        datasourceScores: [],
      },
    ],
    associationScope: "direct",
    enableIndirect: false,
    scoreHonesty: OPEN_TARGETS_SCORE_HONESTY,
    retrievedAt: asOf,
    responseIdentity: "fixture-ot",
    verificationState: "metadata_retrieved_not_claim_verified",
    reviewState: "unreviewed",
    scientificApproval: false,
    graphPromotable: false,
    passageImportAuthorized: false,
  },
];

function fixtureStudy(overrides?: {
  overallStatus?: string;
  hasResults?: boolean;
  interventionName?: string;
}): Record<string, unknown> {
  return {
    protocolSection: {
      identificationModule: {
        nctId: "NCT01234567",
        briefTitle: "Public IL-21 pathway study in systemic sclerosis",
      },
      statusModule: {
        overallStatus: overrides?.overallStatus ?? "TERMINATED",
        lastUpdatePostDateStruct: {date: "2024-01-01"},
        resultsFirstPostDateStruct: overrides?.hasResults ? {date: "2024-06-01"} : undefined,
      },
      designModule: {studyType: "INTERVENTIONAL", phases: ["PHASE2"]},
      conditionsModule: {conditions: ["Systemic Sclerosis"]},
      armsInterventionsModule: {
        interventions: [
          {
            type: "DRUG",
            name: overrides?.interventionName ?? "anti-IL21 monoclonal",
            description: null,
          },
        ],
      },
    },
    resultsSection: overrides?.hasResults
      ? {
          outcomeMeasuresModule: {
            outcomeMeasures: [
              {
                title: "Primary endpoint",
                description: "Change in mRSS",
                timeFrame: "24 weeks",
                reportingStatus: "POSTED",
              },
            ],
          },
        }
      : undefined,
  };
}

function unit(
  overrides: Partial<ComparableEvidenceUnit> &
    Pick<ComparableEvidenceUnit, "id" | "findingPolarity">,
): ComparableEvidenceUnit {
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

describe("translational failure taxonomy (M4 Phase 2)", () => {
  test("closed category set covers required investigation labels", () => {
    expect(TRANSLATIONAL_FAILURE_INVESTIGATION_CATEGORIES).toEqual([
      "weak_human_target_validation",
      "model_to_human_mismatch",
      "insufficient_target_engagement",
      "tissue_mismatch",
      "patient_heterogeneity",
      "dose_timing",
      "endpoint_design",
      "safety",
      "compensatory_pathways",
      "insufficient_evidence",
    ]);
  });

  test("termination alone does not fabricate causal failure; opens investigation labels only", () => {
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01234567",
      study: fixtureStudy({overallStatus: "TERMINATED", hasResults: false}),
      lookupOk: true,
      lookupOutcome: "ok",
      openTargets: sscTargets,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: asOf,
      asOf,
      records: [record],
    });
    const pack = buildTranslationalEvidenceContractPack({landscape, generatedAt: asOf});
    const assessment = assessTranslationalFailureInvestigation({
      contractPack: pack,
      landscape,
      generatedAt: asOf,
    });

    expect(assessment.honesty.categoriesAreInvestigationLabelsNotConclusions).toBe(true);
    expect(assessment.honesty.recruitmentOrTerminationIsNotClinicalFailure).toBe(true);
    expect(assessment.honesty.causalFailureExplanationsNotFabricated).toBe(true);
    expect(assessment.honesty.patientTreatmentRecommendation).toBe(false);
    expect(assessment.honesty.scientificApproval).toBe(false);
    expect(assessment.honesty.graphPromotable).toBe(false);
    expect(assessment.summary.statusAloneCauseRefusals).toBeGreaterThan(0);
    expect(assessment.items.every((i) => i.predeterminedConclusion === false)).toBe(true);
    expect(assessment.items.every((i) => i.causalFailureFabricated === false)).toBe(true);
    expect(assessment.items.some((i) => i.category === "insufficient_evidence")).toBe(true);
    // Must not invent safety/dose/compensatory from TERMINATED alone.
    expect(assessment.items.some((i) => i.category === "safety")).toBe(false);
    expect(assessment.items.some((i) => i.category === "dose_timing")).toBe(false);
    expect(assessment.items.some((i) => i.category === "compensatory_pathways")).toBe(false);

    const lines = projectTranslationalFailurePersistenceLines(assessment);
    expect(lines.some((l) => /translational_failure_investigation:insufficient_evidence/.test(l))).toBe(
      true,
    );
  });

  test("unmapped intervention opens weak_human_target_validation investigation label", () => {
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01234567",
      study: fixtureStudy({
        overallStatus: "COMPLETED",
        hasResults: false,
        interventionName: "unrelated-compound-xyz",
      }),
      lookupOk: true,
      lookupOutcome: "ok",
      openTargets: sscTargets,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: asOf,
      asOf,
      records: [record],
    });
    const pack = buildTranslationalEvidenceContractPack({landscape, generatedAt: asOf});
    const assessment = assessTranslationalFailureInvestigation({
      contractPack: pack,
      landscape,
      generatedAt: asOf,
    });
    expect(assessment.items.some((i) => i.category === "weak_human_target_validation")).toBe(true);
    expect(
      assessment.items
        .filter((i) => i.category === "weak_human_target_validation")
        .every((i) => /investigation label/i.test(i.rationale)),
    ).toBe(true);
  });

  test("structured comparison hooks map tissue/species mismatch without concluding failure", () => {
    const skinMouse = ctx({
      diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "systemic sclerosis"}],
      organTissueCellState: [{system: "UBERON", value: "UBERON:0002097", label: "skin"}],
      genesProteinsPathways: [{system: "UniProt", value: "Q9HBE4", label: "IL21"}],
      experimentalSystemsSpecies: [{system: "NCBITaxon", value: "10090", label: "Mus musculus"}],
      interventionsTargets: [{system: "HGNC", value: "IL21", label: "IL21"}],
    });
    const lungHuman = ctx({
      diseasePhenotype: [{system: "MONDO", value: "MONDO:0005100", label: "systemic sclerosis"}],
      organTissueCellState: [{system: "UBERON", value: "UBERON:0002048", label: "lung"}],
      genesProteinsPathways: [{system: "UniProt", value: "Q9HBE4", label: "IL21"}],
      experimentalSystemsSpecies: [{system: "NCBITaxon", value: "9606", label: "Homo sapiens"}],
      interventionsTargets: [{system: "HGNC", value: "IL21", label: "IL21"}],
    });
    const comparison = compareEvidenceUnits({
      left: unit({id: "a", findingPolarity: "supporting", biologicalContext: skinMouse}),
      right: unit({id: "b", findingPolarity: "opposing", biologicalContext: lungHuman}),
    });
    const comparisonPack: StructuredEvidenceComparisonPack = {
      schemaVersion: "hsi-structured-evidence-comparison-pack-1",
      method: "hsi.structured_evidence_comparison.v1",
      version: comparison.version,
      generatedAt: asOf,
      comparisons: [comparison],
      summary: {
        consistent: 0,
        potentialContradiction: comparison.outcome === "potential_contradiction" ? 1 : 0,
        contextDependent: comparison.outcome === "context_dependent" ? 1 : 0,
        methodologicalDifference: comparison.outcome === "methodological_difference" ? 1 : 0,
        insufficientComparability: 0,
        insufficientEvidence: 0,
      },
      honesty: {
        ...comparison.honesty,
        pairwiseOnly: true,
        notScientificValidity: true,
      },
    };
    const contradiction = assessContradictionInvestigation({
      pack: comparisonPack,
      generatedAt: asOf,
    });

    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01234567",
      study: fixtureStudy({overallStatus: "COMPLETED", hasResults: true}),
      lookupOk: true,
      openTargets: sscTargets,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: asOf,
      asOf,
      records: [record],
    });
    const pack = buildTranslationalEvidenceContractPack({landscape, generatedAt: asOf});
    const assessment = assessTranslationalFailureInvestigation({
      contractPack: pack,
      landscape,
      comparisonPack,
      contradictionInvestigation: contradiction,
      generatedAt: asOf,
    });

    expect(assessment.summary.linkedFromStructuredComparison).toBeGreaterThan(0);
    expect(
      assessment.items.some(
        (i) =>
          i.category === "tissue_mismatch" ||
          i.category === "model_to_human_mismatch" ||
          i.category === "patient_heterogeneity" ||
          i.category === "endpoint_design" ||
          i.category === "insufficient_evidence",
      ),
    ).toBe(true);
    expect(assessment.items.every((i) => i.scientificallyVerified === false)).toBe(true);
  });

  test("curator may declare safety/dose/compensatory as investigation labels only", () => {
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01234567",
      study: fixtureStudy({overallStatus: "COMPLETED", hasResults: true}),
      lookupOk: true,
      openTargets: sscTargets,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: asOf,
      asOf,
      records: [record],
    });
    const pack = buildTranslationalEvidenceContractPack({landscape, generatedAt: asOf});
    const assessment = assessTranslationalFailureInvestigation({
      contractPack: pack,
      landscape,
      curatorDeclaredCategories: ["safety", "dose_timing", "compensatory_pathways"],
      curatorNote: "Curator-opened investigation bins from SME review notes.",
      generatedAt: asOf,
    });
    expect(assessment.summary.curatorDeclared).toBe(3);
    expect(assessment.items.filter((i) => i.source === "curator_declared").length).toBe(3);
    expect(
      assessment.items
        .filter((i) => i.source === "curator_declared")
        .every((i) => i.predeterminedConclusion === false && i.needsHumanReview === true),
    ).toBe(true);
  });

  test("research brief bind preserves failure-investigation honesty", () => {
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01234567",
      study: fixtureStudy({overallStatus: "RECRUITING"}),
      lookupOk: true,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: asOf,
      asOf,
      records: [record],
    });
    const pack = buildTranslationalEvidenceContractPack({landscape, generatedAt: asOf});
    const failure = assessTranslationalFailureInvestigation({
      contractPack: pack,
      landscape,
      generatedAt: asOf,
    });
    const outcome = {
      status: "attached_registry_snapshot" as const,
      schemaVersion: landscape.schemaVersion,
      snapshotHash: landscape.snapshotHash ?? null,
      asOf: landscape.asOf,
      relevanceScope: "preliminary_research_only" as const,
      eligibilityAssessed: false as const,
      confirmedEligible: false as const,
      records: landscape.records.map((r) => ({
        nctId: r.nctId,
        briefTitle: r.registration.briefTitle,
        overallStatus: r.registration.overallStatus,
        phases: r.registration.phases,
        interventions: r.interventionTargetMapping.interventions.map((i) => i.name),
        mappedTargetSymbols: r.interventionTargetMapping.mappedTargets.map((t) => t.targetSymbol),
        hasRegistryResults: r.registryReportedResults.hasResultsSection,
        publishedOutcomePmidCount: r.publishedOutcomes.filter((p) => p.pmid).length,
        missingKinds: r.missingOutcomeEvidence.map((m) => m.kind),
      })),
      planes: {
        trialRegistrationAndStatus: landscape.records.map((r) => r.registration),
        interventionAndTargetMapping: landscape.records.map((r) => r.interventionTargetMapping),
        registryReportedResults: landscape.records.map((r) => r.registryReportedResults),
        publishedOutcomes: landscape.records.flatMap((r) => r.publishedOutcomes),
        missingOrUnresolvedOutcomeEvidence: landscape.records.flatMap((r) => r.missingOutcomeEvidence),
      },
      honesty: landscape.honesty,
      limitations: landscape.limitations,
      note: "fixture",
    };

    const brief = integrateResearchBrief({
      question: "Why might IL-21 programmes fail to translate in SSc?",
      translational: outcome,
      translationalContracts: pack,
      translationalFailureInvestigation: failure,
    });
    expect(brief.translationalSummary?.failureInvestigationLabelsBound).toBeGreaterThan(0);
    expect(brief.translationalSummary?.recruitmentOrTerminationIsNotClinicalFailure).toBe(true);
    expect(brief.translationalSummary?.causalFailureExplanationsNotFabricated).toBe(true);
    expect(brief.limitations.some((l) => /investigation labels only/i.test(l))).toBe(true);
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.gateCAutoApprove).toBe(false);
  });
});
