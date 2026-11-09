/**
 * Milestone 13 PR1 — translational development contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  BIOMARKER_CONTEXTS_OF_USE,
  BIOMARKER_VALIDATION_STATUSES,
  DEVELOPMENT_STAGES,
  buildTranslationalDevelopmentPack,
  createMemoryTranslationalDevelopmentStore,
  draftBiomarkerDevelopmentRecord,
  draftClinicalTrialConcept,
  draftDevelopmentProgramme,
  draftTranslationalEvidenceAssessment,
  fingerprintDevelopmentProgramme,
  projectTranslationalDevelopmentPersistenceLines,
  transitionBiomarkerDevelopmentRecord,
  transitionClinicalTrialConcept,
  transitionDevelopmentProgramme,
  transitionTranslationalEvidenceAssessment,
  type DevelopmentProgramme,
} from "../src/translationalDevelopmentContracts";

const asOf = "2026-11-09T18:00:00.000Z";

function seedProgramme(
  overrides?: Partial<Parameters<typeof draftDevelopmentProgramme>[0]>,
): DevelopmentProgramme {
  return draftDevelopmentProgramme({
    id: "hsi-td-prog-ssc-tfh-fixture",
    name: "SSc Tfh–IL-21 translational development scoping (fixture)",
    therapeuticHypothesis:
      "Further development research on the Tfh–IL-21–B-cell axis in systemic sclerosis may be warranted after gaps are addressed — not a treatment claim.",
    diseaseContext: "Systemic sclerosis (research fixture context)",
    phenotypeContext: "Diffuse cutaneous research phenotype (fixture)",
    intendedResearchIndication:
      "Research indication scoping only — not regulatory indication.",
    authoredByPrincipalId: "agent-hsi-td-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    developmentStage: "translational_evidence_review",
    investigationId: "inv-ssc-mech-001",
    hypothesisIds: ["hyp-ssc-tfh-il21-001"],
    orgId: "org-hsi-fixture-1",
    translationalProgrammeContractId: "tec-ssc-tfh-001",
    therapeuticProgrammeId: "hsi-tx-prog-ssc-il6-fixture",
    therapeuticTargetIds: ["hsi-tx-tgt-il6r-fixture"],
    therapeuticInterventionIds: ["hsi-tx-int-exp-assess"],
    therapeuticAssessmentIds: ["hsi-tx-assess-il6-fixture"],
    identities: [
      {
        system: "open_targets_disease",
        value: "EFO_0000699",
        label: "systemic sclerosis",
        resolution: "resolved_prefix",
        claimSupport: "not_assessed",
      },
    ],
    ...overrides,
  });
}

describe("translational development contracts (M13 PR1)", () => {
  test("drafts development programme with M3/M4/M6/M9/M12 links and honesty", () => {
    const programme = seedProgramme();
    expect(programme.lifecycle).toBe("draft");
    expect(programme.developmentStage).toBe("translational_evidence_review");
    expect(programme.workflowStagesAreNotRegulatoryCategories).toBe(true);
    expect(programme.investigationId).toBe("inv-ssc-mech-001");
    expect(programme.hypothesisIds).toEqual(["hyp-ssc-tfh-il21-001"]);
    expect(programme.orgId).toBe("org-hsi-fixture-1");
    expect(programme.translationalProgrammeContractId).toBe("tec-ssc-tfh-001");
    expect(programme.therapeuticProgrammeId).toBe(
      "hsi-tx-prog-ssc-il6-fixture",
    );
    expect(programme.therapeuticTargetIds).toEqual(["hsi-tx-tgt-il6r-fixture"]);
    expect(programme.honesty.researchDecisionSupportOnly).toBe(true);
    expect(programme.honesty.notAutonomousTrialAuthorisation).toBe(true);
    expect(programme.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(programme.honesty.m12TherapeuticDiscoveryDependency).toBe(
      "id-pattern-compatible-107-merged",
    );
    expect(fingerprintDevelopmentProgramme(programme)).toMatch(/^[a-f0-9]{64}$/);
    expect(DEVELOPMENT_STAGES).toContain("clinical_concept_drafting");
  });

  test("rejects invalid M12 therapeutic id patterns and forbidden claim language", () => {
    expect(() =>
      seedProgramme({therapeuticProgrammeId: "not-an-m12-id"}),
    ).toThrow(/hsi-tx-prog/);

    expect(() =>
      seedProgramme({
        therapeuticHypothesis:
          "This is an approved protocol with sample size = 120 and patient is eligible.",
      }),
    ).toThrow(/must not invent/);
  });

  test("translational evidence assessment preserves gaps and refuses readiness claims", () => {
    const programme = seedProgramme();
    const assessment = draftTranslationalEvidenceAssessment({
      id: "hsi-td-assess-ssc-fixture",
      programme,
      summary:
        "Associative and mechanistic neighbourhood only — translational gaps remain; not clinical readiness.",
      targetValidity: "associative_only",
      humanBiologicalRelevance: "mechanistic_hypothesis",
      preclinicalEvidence: "insufficient",
      pharmacologyEvidence: "not_assessed",
      targetEngagement: "not_assessed",
      safetyEvidence: "insufficient",
      modelRelevance: "conflicting",
      keyUncertainties: [
        "Model-to-human relevance unresolved.",
        "Target engagement evidence missing.",
      ],
      missingStudies: [
        "Authorised pharmacology characterisation.",
        "Independent replication of key preclinical signals.",
      ],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });
    expect(assessment.regulatoryReadinessClaimed).toBe(false);
    expect(assessment.clinicalReadinessClaimed).toBe(false);
    expect(assessment.efficacyClaimed).toBe(false);
    expect(assessment.keyUncertainties.length).toBeGreaterThan(0);

    const underReview = transitionTranslationalEvidenceAssessment({
      assessment,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionTranslationalEvidenceAssessment({
        assessment: underReview,
        to: "accepted_with_gaps",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);

    const accepted = transitionTranslationalEvidenceAssessment({
      assessment: underReview,
      to: "accepted_with_gaps",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_gaps");
    expect(accepted.reviewedBy?.actorKind).toBe("human");
  });

  test("trial concept is never an approved protocol and refuses invented sample sizes", () => {
    const programme = seedProgramme();
    const concept = draftClinicalTrialConcept({
      id: "hsi-td-trial-ssc-concept-fixture",
      programme,
      researchQuestion:
        "Could an exploratory biomarker-enriched research concept help evaluate Tfh–IL-21 axis hypotheses in SSc?",
      investigationalIntervention:
        "Research intervention concept only (fixture) — not a prescription.",
      intendedPopulation:
        "Adults with diffuse cutaneous SSc research phenotype (fixture considerations).",
      comparatorConcept: "Standard-of-care research comparator concept (fixture).",
      primaryObjective:
        "Assess whether a governed exploratory concept can be reviewed — not to demonstrate efficacy.",
      exploratoryObjectives: [
        "Explore biomarker collection feasibility questions.",
      ],
      candidateEndpoints: [
        "Candidate composite skin score change (concept only).",
        "Candidate pharmacodynamic biomarker change (concept only).",
      ],
      biomarkerStrategy:
        "Exploratory pharmacodynamic biomarker collection — not a validated selection test.",
      eligibilityConsiderations: [
        "Population-level phenotype considerations only — not individual eligibility.",
      ],
      statisticalAssumptions: [
        "Effect-size assumptions not yet defensible — statistical review required before any calculation.",
      ],
      feasibilityAssumptions: [
        "Recruitment rates unknown — do not invent site commitments.",
      ],
      ethicalAndRegulatoryConsiderations: [
        "Qualified clinical, statistical, ethics and regulatory review required before operational use.",
      ],
      linkedNctIds: ["NCT00000001"],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });
    expect(concept.isNotApprovedProtocol).toBe(true);
    expect(concept.inventedSampleSize).toBeNull();
    expect(concept.inventedPowerCalculation).toBeNull();
    expect(concept.linkedNctIds).toEqual(["NCT00000001"]);

    expect(() =>
      draftClinicalTrialConcept({
        id: "hsi-td-trial-bad-n",
        programme,
        researchQuestion: "Bad concept",
        investigationalIntervention: "x",
        intendedPopulation: "y",
        comparatorConcept: "z",
        primaryObjective: "obj",
        exploratoryObjectives: [],
        candidateEndpoints: ["endpoint"],
        biomarkerStrategy: "none",
        eligibilityConsiderations: [],
        statisticalAssumptions: ["sample size = 240 with power = 0.9"],
        feasibilityAssumptions: [],
        ethicalAndRegulatoryConsiderations: ["ethics review required"],
        authoredByPrincipalId: "agent-hsi-td-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not invent/);

    const sci = transitionClinicalTrialConcept({
      concept,
      to: "under_scientific_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
    });
    const stat = transitionClinicalTrialConcept({
      concept: sci,
      to: "under_statistical_review",
      updatedAt: asOf,
      actor: {principalId: "principal-statistician", actorKind: "human"},
    });
    const ethics = transitionClinicalTrialConcept({
      concept: stat,
      to: "under_ethics_regulatory_review",
      updatedAt: asOf,
      actor: {principalId: "principal-ethicist", actorKind: "human"},
    });
    expect(() =>
      transitionClinicalTrialConcept({
        concept: ethics,
        to: "accepted_as_concept_only",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human reviewers/);
  });

  test("biomarker records refuse equating exploratory with qualified/clinically validated", () => {
    const programme = seedProgramme();
    const biomarker = draftBiomarkerDevelopmentRecord({
      id: "hsi-td-bm-il21-fixture",
      programme,
      name: "Circulating IL-21 (exploratory fixture)",
      biologicalIdentity: "IL21 gene product / circulating IL-21 protein (fixture)",
      specimenAndAssay: "Serum immunoassay (assay availability not verified)",
      contextOfUse: "pharmacodynamic",
      validationStatus: "exploratory",
      analyticalValidity: "insufficient",
      clinicalValidity: "not_assessed",
      clinicalUtilityEvidence: "not_assessed",
      replicationStatus: "insufficient",
      confounders: ["Disease activity confounding possible.", "Assay lot variability unknown."],
      limitations: [
        "Exploratory only — not a qualified or clinically validated biomarker.",
        "Performance metrics not assessed.",
      ],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });
    expect(biomarker.exploratoryIsNotQualifiedOrClinicallyValidated).toBe(true);
    expect(biomarker.inventedPerformanceMetrics).toBeNull();
    expect(biomarker.validationStatus).toBe("exploratory");

    expect(() =>
      draftBiomarkerDevelopmentRecord({
        id: "hsi-td-bm-qualified-bad",
        programme,
        name: "Bad qualified draft",
        biologicalIdentity: "x",
        specimenAndAssay: "y",
        contextOfUse: "diagnostic",
        validationStatus: "clinically_validated_declared",
        confounders: ["c"],
        limitations: ["l"],
        authoredByPrincipalId: "agent-hsi-td-1",
        createdAt: asOf,
      }),
    ).toThrow(/refuses drafting qualified/);

    expect(() =>
      draftBiomarkerDevelopmentRecord({
        id: "hsi-td-bm-predictive-bad",
        programme,
        name: "Predictive without interaction note",
        biologicalIdentity: "x",
        specimenAndAssay: "y",
        contextOfUse: "predictive",
        confounders: ["c"],
        limitations: ["No mention of required evidence type."],
        authoredByPrincipalId: "agent-hsi-td-1",
        createdAt: asOf,
      }),
    ).toThrow(/interaction\/comparator/);

    const predictive = draftBiomarkerDevelopmentRecord({
      id: "hsi-td-bm-predictive-ok",
      programme,
      name: "Candidate predictive biomarker (fixture)",
      biologicalIdentity: "Candidate marker (fixture)",
      specimenAndAssay: "Blood assay (unverified)",
      contextOfUse: "predictive",
      confounders: ["Selection bias risk."],
      limitations: [
        "Predictive claim requires interaction analysis with appropriate comparator — not severity correlation alone.",
      ],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });
    expect(predictive.predictiveClaimRequiresInteractionEvidence).toBe(true);
    expect(BIOMARKER_CONTEXTS_OF_USE).toContain("predictive");
    expect(BIOMARKER_VALIDATION_STATUSES).toContain("exploratory");

    const reviewed = transitionBiomarkerDevelopmentRecord({
      record: biomarker,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionBiomarkerDevelopmentRecord({
        record: reviewed,
        to: "accepted_as_exploratory",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const programme = seedProgramme();
    const assessment = draftTranslationalEvidenceAssessment({
      id: "hsi-td-assess-store",
      programme,
      summary: "Store fixture assessment with explicit gaps.",
      keyUncertainties: ["Uncertainty A"],
      missingStudies: ["Missing study A"],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });
    const concept = draftClinicalTrialConcept({
      id: "hsi-td-trial-store",
      programme,
      researchQuestion: "Store fixture research question?",
      investigationalIntervention: "Fixture intervention concept",
      intendedPopulation: "Fixture population considerations",
      comparatorConcept: "Fixture comparator",
      primaryObjective: "Fixture primary objective",
      exploratoryObjectives: [],
      candidateEndpoints: ["Fixture endpoint"],
      biomarkerStrategy: "Exploratory only",
      eligibilityConsiderations: ["Not individual eligibility"],
      statisticalAssumptions: ["Assumptions undeclared — review required"],
      feasibilityAssumptions: ["Feasibility unknown"],
      ethicalAndRegulatoryConsiderations: ["Ethics review required"],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });
    const biomarker = draftBiomarkerDevelopmentRecord({
      id: "hsi-td-bm-store",
      programme,
      name: "Store biomarker",
      biologicalIdentity: "Fixture identity",
      specimenAndAssay: "Fixture assay",
      contextOfUse: "monitoring",
      confounders: ["Confounder"],
      limitations: ["Exploratory only — not qualified."],
      authoredByPrincipalId: "agent-hsi-td-1",
      createdAt: asOf,
    });

    const store = createMemoryTranslationalDevelopmentStore();
    store.upsertProgramme(programme);
    store.upsertAssessment(assessment);
    store.upsertTrialConcept(concept);
    store.upsertBiomarker(biomarker);
    expect(store.listProgrammes()).toHaveLength(1);
    expect(store.listAssessments(programme.id)).toHaveLength(1);
    expect(store.listTrialConcepts(programme.id)).toHaveLength(1);
    expect(store.listBiomarkers(programme.id)).toHaveLength(1);

    const lines = projectTranslationalDevelopmentPersistenceLines({
      programme,
      assessments: [assessment],
      trialConcepts: [concept],
      biomarkers: [biomarker],
    });
    expect(lines).toContain("trialConceptIsNotApprovedProtocol=true");
    expect(lines).toContain("exploratoryBiomarkerIsNotQualified=true");
    expect(lines).toContain("inventedSampleSizes=false");
    expect(lines).toContain("m12Dependency=id-pattern-compatible-107-merged");

    const pack = buildTranslationalDevelopmentPack({
      programmes: [programme],
      assessments: [assessment],
      trialConcepts: [concept],
      biomarkers: [biomarker],
      asOf,
    });
    expect(pack.programmeCount).toBe(1);
    expect(pack.honesty.noFabricatedTrialOutcomes).toBe(true);
  });

  test("programme accept/reject requires human researcher", () => {
    const programme = seedProgramme();
    const underReview = transitionDevelopmentProgramme({
      programme,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionDevelopmentProgramme({
        programme: underReview,
        to: "accepted_for_further_research",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-td-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers/);
    const accepted = transitionDevelopmentProgramme({
      programme: underReview,
      to: "accepted_for_further_research",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_for_further_research");
  });
});
