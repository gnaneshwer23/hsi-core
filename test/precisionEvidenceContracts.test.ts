/**
 * Milestone 5 PR1 — precision evidence contracts honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  buildPrecisionEvidenceContractPack,
  classifyDatasetLifecycle,
  omicsSourceConnections,
  projectPrecisionContractPersistenceLines,
  refuseInventedBiomarkerPerformance,
  refuseInventedPatientMeasurements,
} from "../src/evidence/precisionEvidenceContracts";
import {
  buildTranslationalEvidenceContractPack,
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

const asOf = "2026-11-09T10:00:00.000Z";

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

function fixtureStudy(): Record<string, unknown> {
  return {
    protocolSection: {
      identificationModule: {
        nctId: "NCT01234567",
        briefTitle: "Public IL-21 pathway study in systemic sclerosis",
      },
      statusModule: {
        overallStatus: "RECRUITING",
        lastUpdatePostDateStruct: {date: "2024-01-01"},
      },
      designModule: {studyType: "INTERVENTIONAL", phases: ["PHASE2"]},
      conditionsModule: {conditions: ["Systemic Sclerosis"]},
      armsInterventionsModule: {
        interventions: [{type: "DRUG", name: "anti-IL21 monoclonal", description: null}],
      },
    },
  };
}

describe("precision evidence contracts (M5 PR1)", () => {
  test("builds phenotype / molecular / subgroup / biomarker layers with unknowns preserved", () => {
    const pack = buildPrecisionEvidenceContractPack({
      openTargets: sscTargets,
      pmids: ["19180481"],
      nctIds: ["NCT01234567"],
      uniprotAccessions: ["Q9HBE5"],
      candidateSubgroupLabel: "candidate IL21-high skin involvement (investigation only)",
      biomarkerLabel: "IL21",
      generatedAt: asOf,
    });

    expect(pack.summary.diseasePhenotype).toBe(1);
    expect(pack.summary.molecularCellularProfile).toBe(1);
    expect(pack.summary.candidateSubgroup).toBe(1);
    expect(pack.summary.biomarkerEvidence).toBe(1);
    expect(pack.honesty.scientificApproval).toBe(false);
    expect(pack.honesty.patientTreatmentRecommendation).toBe(false);
    expect(pack.honesty.individualisedMedicalAdvice).toBe(false);
    expect(pack.honesty.biomarkerPerformanceNotInvented).toBe(true);
    expect(pack.honesty.patientMeasurementsNotInvented).toBe(true);
    expect(pack.honesty.metadataRetrievalIsNotAnalysis).toBe(true);
    expect(pack.honesty.candidateSubgroupIsNotClinicalStrataProof).toBe(true);

    for (const c of pack.contracts) {
      expect(c.biomarkerPerformance).toBeNull();
      expect(c.patientMeasurements).toBeNull();
      expect(c.honesty.graphPromotable).toBe(false);
      expect(c.honesty.gateCAutoApprove).toBe(false);
      expect(c.honesty.cdsPhi).toBe(false);
      expect(c.unknowns.length).toBeGreaterThan(0);
    }

    const biomarker = pack.contracts.find((c) => c.layer === "biomarker_evidence");
    expect(biomarker?.unknowns).toContain("biomarker_performance");
    expect(biomarker?.unknowns).toContain("patient_measurements");

    const subgroup = pack.contracts.find((c) => c.layer === "candidate_subgroup");
    expect(subgroup?.label).toMatch(/investigation only/i);
    expect(subgroup?.unknowns).toContain("subgroup_definition");
  });

  test("refuses invented biomarker performance and patient measurements", () => {
    const perf = refuseInventedBiomarkerPerformance({auc: 0.91, sensitivity: 0.8});
    expect(perf.accepted).toBe(false);
    expect(perf.biomarkerPerformance).toBeNull();
    expect(perf.reason.toLowerCase()).toMatch(/refused|never fabricated/);

    const meas = refuseInventedPatientMeasurements({il21PgMl: 12.4});
    expect(meas.accepted).toBe(false);
    expect(meas.patientMeasurements).toBeNull();

    const pack = buildPrecisionEvidenceContractPack({
      openTargets: sscTargets,
      attemptedBiomarkerPerformance: {auc: 0.99},
      attemptedPatientMeasurements: {crp: 5},
      generatedAt: asOf,
    });
    expect(pack.contracts.every((c) => c.biomarkerPerformance === null)).toBe(true);
    expect(pack.contracts.every((c) => c.patientMeasurements === null)).toBe(true);
  });

  test("dataset discovery is not analysis; HCA/CELLxGENE not connected; GEO stub optional", () => {
    const refused = classifyDatasetLifecycle({
      connected: true,
      metadataRetrieved: true,
      analysedClaim: true,
    });
    expect(refused.lifecycle).toBe("analysis_not_performed");
    expect(refused.analysed).toBe(false);

    const retrieved = classifyDatasetLifecycle({
      connected: true,
      metadataRetrieved: true,
    });
    expect(retrieved.lifecycle).toBe("metadata_retrieved");
    expect(retrieved.analysed).toBe(false);

    const bare = omicsSourceConnections();
    expect(bare.find((o) => o.source === "hca")?.connection).toBe("not_connected");
    expect(bare.find((o) => o.source === "cellxgene")?.connection).toBe("not_connected");
    expect(bare.find((o) => o.source === "geo")?.connection).toBe("not_connected");

    const withGeo = omicsSourceConnections({geoAccession: "GSE12345"});
    const geo = withGeo.find((o) => o.source === "geo");
    expect(geo?.connection).toBe("stub_identifier_only");
    expect(geo?.analysed).toBe(false);
    expect(geo?.lifecycle).toBe("metadata_discovered");

    const pack = buildPrecisionEvidenceContractPack({
      openTargets: sscTargets,
      geoAccession: "GSE12345",
      generatedAt: asOf,
    });
    expect(pack.sourceIntegration.hca).toBe("not_connected");
    expect(pack.sourceIntegration.cellxgene).toBe("not_connected");
    expect(pack.sourceIntegration.geo).toBe("stub_identifier_only");
    expect(pack.summary.omicsNotConnected).toBeGreaterThanOrEqual(2);
  });

  test("projects from translational contracts + thin research-brief bind", () => {
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01234567",
      study: fixtureStudy(),
      lookupOk: true,
      lookupOutcome: "ok",
      retrievedAt: asOf,
      openTargets: sscTargets,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: asOf,
      asOf,
      records: [record],
    });
    const tec = buildTranslationalEvidenceContractPack({
      landscape,
      openTargets: sscTargets,
      generatedAt: asOf,
    });

    const pack = buildPrecisionEvidenceContractPack({
      openTargets: sscTargets,
      translationalContracts: tec,
      generatedAt: asOf,
    });
    expect(pack.contracts[0]!.linkedNctIds).toContain("NCT01234567");
    expect(pack.sourceIntegration.translationalContracts).toBe("projected_when_supplied");

    const lines = projectPrecisionContractPersistenceLines(pack);
    expect(lines.some((l) => l.startsWith("precision_contract:disease_phenotype:"))).toBe(true);
    expect(lines.some((l) => l.startsWith("omics:hca:connection=not_connected"))).toBe(true);

    const brief = integrateResearchBrief({
      question: "What candidate molecular subgroups exist for SSc IL-21 research?",
      translationalContracts: tec,
      precisionContracts: pack,
    });
    expect(brief.precisionSummary?.layersBound).toBe(4);
    expect(brief.precisionSummary?.biomarkerPerformanceInvented).toBe(false);
    expect(brief.precisionSummary?.patientMeasurementsInvented).toBe(false);
    expect(brief.precisionSummary?.omicsNotConnected).toBeGreaterThanOrEqual(2);
    expect(brief.limitations.some((l) => /M5 precision/i.test(l))).toBe(true);
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.gateCAutoApprove).toBe(false);
    expect(brief.cdsPhi).toBe(false);
  });
});
