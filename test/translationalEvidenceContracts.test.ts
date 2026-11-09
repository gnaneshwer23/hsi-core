/**
 * Milestone 4 PR1 — translational evidence contracts honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  buildTranslationalEvidenceContractPack,
  projectTranslationalContractPersistenceLines,
  registryStatusFailureHonesty,
  resolveChemblIdentityStub,
  resolveReactomeIdentityStub,
  resolveUniprotIdentity,
  resolveNctIdentity,
} from "../src/evidence/translationalEvidenceContracts";
import {
  attachTranslationalTrialFromCtgovStudy,
  buildTranslationalLandscapeSnapshot,
} from "../src/evidence/translationalEvidenceAttach";
import {integrateResearchBrief} from "../src/evidence/researchBriefIntegration";
import {
  OPEN_TARGETS_SCORE_HONESTY,
  type OpenTargetsDiseaseRecord,
} from "../src/evidence/openTargetsLookup";
import {validateHsiOntologyIdentifier} from "../src/hsiOntologyRegistry";

const asOf = "2026-11-09T09:00:00.000Z";

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

function fixtureStudy(overrides?: {overallStatus?: string; hasResults?: boolean}): Record<string, unknown> {
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
        interventions: [{type: "DRUG", name: "anti-IL21 monoclonal", description: null}],
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

describe("translational evidence contracts (M4 PR1)", () => {
  test("registry termination is not clinical failure; unknowns preserved; no proprietary invention", () => {
    const honesty = registryStatusFailureHonesty("TERMINATED");
    expect(honesty.clinicalFailureInferred).toBe(false);
    expect(honesty.note.toLowerCase()).toMatch(/not clinical failure/);

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
    const pack = buildTranslationalEvidenceContractPack({
      landscape,
      generatedAt: asOf,
      extraIdentities: [
        resolveReactomeIdentityStub("R-HSA-12345"),
        resolveChemblIdentityStub("CHEMBL123"),
        resolveUniprotIdentity("Q9HBE4"),
      ],
    });

    expect(pack.honesty.recruitmentOrTerminationIsNotClinicalFailure).toBe(true);
    expect(pack.honesty.absenceOfPublishedEvidenceIsNotAbsenceOfActivity).toBe(true);
    expect(pack.honesty.proprietaryProgrammesNotInvented).toBe(true);
    expect(pack.honesty.scientificApproval).toBe(false);
    expect(pack.honesty.graphPromotable).toBe(false);
    expect(pack.identityResolution.reactome).toBe("stub_identifier_only");
    expect(pack.identityResolution.chembl).toBe("stub_identifier_only");
    expect(pack.summary.programme).toBe(1);
    expect(pack.summary.clinical).toBe(1);
    expect(pack.summary.unknownFieldsRecorded).toBeGreaterThan(0);

    const clinical = pack.contracts.find((c) => c.layer === "clinical")!;
    expect(clinical.registryOverallStatus).toBe("TERMINATED");
    expect(clinical.honesty.recruitmentOrTerminationIsNotClinicalFailure).toBe(true);
    expect(clinical.unknowns).toContain("failure_mode");
    expect(clinical.programmeIdentityKind).toBe("public_registry_anchored");

    const programme = pack.contracts.find((c) => c.layer === "programme")!;
    expect(programme.identities.some((i) => i.system === "reactome" && i.resolution === "stub_only")).toBe(
      true,
    );
    expect(programme.identities.some((i) => i.system === "chembl" && i.resolution === "stub_only")).toBe(
      true,
    );
    expect(programme.identities.some((i) => i.system === "uniprot" && i.resolution === "resolved_prefix")).toBe(
      true,
    );

    const lines = projectTranslationalContractPersistenceLines(pack);
    expect(lines.some((l) => /translational_contract:clinical/.test(l))).toBe(true);
  });

  test("ChEMBL ontology prefix stub validates; invalid stubs stay unresolved", () => {
    expect(() => validateHsiOntologyIdentifier("ChEMBL", "CHEMBL25")).not.toThrow();
    expect(() => validateHsiOntologyIdentifier("ChEMBL", "not-chembl")).toThrow();
    expect(resolveChemblIdentityStub("not-chembl").resolution).toBe("unresolved");
    expect(resolveReactomeIdentityStub("R-HSA-67890").resolution).toBe("stub_only");
    expect(resolveNctIdentity("NCT01234567").resolution).toBe("resolved_prefix");
  });

  test("research brief bind preserves failure honesty when contracts attached", () => {
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
      question: "What is known about IL-21 programmes in SSc?",
      translational: outcome,
      translationalContracts: pack,
    });
    expect(brief.translationalSummary?.recruitmentOrTerminationIsNotClinicalFailure).toBe(true);
    expect(brief.translationalSummary?.absenceOfPublishedEvidenceIsNotAbsenceOfActivity).toBe(true);
    expect(brief.translationalSummary?.proprietaryProgrammesNotInvented).toBe(true);
    expect(brief.translationalSummary?.contractLayersBound).toBe(4);
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.limitations.some((l) => /recruitment\/termination/i.test(l))).toBe(true);
  });
});
