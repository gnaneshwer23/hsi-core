/**
 * Milestone 15 PR6 — patient-contextualised research models honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  PCRM_CAPABILITY_KINDS,
  buildPatientContextualisedResearchModelsPack,
  createMemoryPatientContextualisedResearchModelsStore,
  draftAuditHistoryRecord,
  draftAuthorisedLongitudinalInput,
  draftDiseaseStateEstimation,
  draftMissingInformationAssessment,
  draftModelApplicabilityCheck,
  draftPatientContextualisedResearchBundle,
  draftPatientContextualisedResearchSpec,
  draftResearchOnlyInterpretation,
  draftUncertaintyEstimation,
  draftVersionedObservationSet,
  fingerprintPatientContextualisedResearchBundle,
  isOutOfScopeApplicability,
  projectPatientContextualisedResearchModelsPersistenceLines,
  transitionPatientContextualisedResearchBundle,
  transitionPatientContextualisedResearchSpec,
  type PatientContextualisedResearchSpec,
} from "../src/patientContextualisedResearchModelsContracts";

const asOf = "2026-11-09T15:00:00.000Z";

function seedFixtureSpec(
  overrides?: Partial<
    Parameters<typeof draftPatientContextualisedResearchSpec>[0]
  >,
): PatientContextualisedResearchSpec {
  return draftPatientContextualisedResearchSpec({
    id: "hsi-pcrm-spec-ssc-fixture",
    displayName: "Fixture SSc patient-contextualised research model spec",
    scientificQuestion:
      "How can a bounded individual-context research representation declare authorised longitudinal input, versioned observations, disease-state estimation, applicability, missing information, uncertainty, research-only interpretation, and audit history while keeping research envelopes distinct from replica or care claims?",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    digitalPatientModelId: "hsi-hdi-dpm-ssc-fixture",
    populationModellingSpecId: "hsi-pcdm-spec-ssc-fixture",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-fixture",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-fixture",
    crossScaleOntologySpecId: "hsi-csol-spec-ssc-fixture",
    cohortDefinitionId: "hsi-rcb-coh-ssc-fixture",
    rweStudyId: "hsi-rwe-study-ssc-fixture",
    longitudinalClinicalEvidenceSpecId: "hsi-lce-spec-ssc-fixture",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-pcrm-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

describe("patient-contextualised research models contracts (M15 PR6)", () => {
  test("covers all capability kinds with HDI/PCDM/M14 links", () => {
    expect(PCRM_CAPABILITY_KINDS).toHaveLength(8);
    expect(PCRM_CAPABILITY_KINDS).toContain("authorised_longitudinal_input");
    expect(PCRM_CAPABILITY_KINDS).toContain("versioned_observation_set");
    expect(PCRM_CAPABILITY_KINDS).toContain("disease_state_estimation");
    expect(PCRM_CAPABILITY_KINDS).toContain("model_applicability_check");
    expect(PCRM_CAPABILITY_KINDS).toContain("missing_information_assessment");
    expect(PCRM_CAPABILITY_KINDS).toContain("uncertainty_estimation");
    expect(PCRM_CAPABILITY_KINDS).toContain("research_only_interpretation");
    expect(PCRM_CAPABILITY_KINDS).toContain("audit_history");

    const spec = seedFixtureSpec();
    expect(spec.honesty.notCompleteBiologicalReplica).toBe(true);
    expect(spec.honesty.notDigitalTwinProduct).toBe(true);
    expect(spec.honesty.notTreatmentRecommendation).toBe(true);
    expect(spec.honesty.notClinicalCareWithoutSeparateValidation).toBe(true);
    expect(spec.honesty.outOfScopeOutsideValidatedDomain).toBe(true);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.diseaseContextId).toBe("hsi-hdi-ctx-ssc-fixture");
    expect(spec.digitalPatientModelId).toBe("hsi-hdi-dpm-ssc-fixture");
    expect(spec.populationModellingSpecId).toBe("hsi-pcdm-spec-ssc-fixture");
    expect(spec.cohortDefinitionId).toBe("hsi-rcb-coh-ssc-fixture");
    expect(spec.completeBiologicalReplicaClaimed).toBe(false);
    expect(spec.notTreatmentRecommendation).toBe(true);
    expect(spec.capabilityKinds).toHaveLength(8);
  });

  test("authorised longitudinal input and versioned observation set stay fixture-honest", () => {
    const spec = seedFixtureSpec();
    const ali = draftAuthorisedLongitudinalInput({
      id: "hsi-pcrm-ali-ssc-fixture",
      researchSpec: spec,
      authorisationStatus: "fixture_declared",
      longitudinalSourceSummary:
        "Fixture authorised longitudinal input envelope for research representation only.",
      linkedObservationRefIds: [
        "hsi-hdi-obs-ssc-baseline",
        "hsi-hdi-obs-ssc-followup",
      ],
      limitations: [
        "Fixture longitudinal input is not an authorised clinical feed.",
        "Not a complete biological replica.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(ali.authorisationStatus).toBe("fixture_declared");
    expect(ali.containsIdentifiablePhi).toBe(false);

    expect(() =>
      draftAuthorisedLongitudinalInput({
        id: "hsi-pcrm-ali-bad-auth",
        researchSpec: spec,
        authorisationStatus: "authorised_declared",
        longitudinalSourceSummary:
          "Must refuse authorised_declared under fixture_only dataset.",
        limitations: ["Authorisation status must match dataset honesty."],
        authoredByPrincipalId: "agent-hsi-pcrm-1",
        createdAt: asOf,
      }),
    ).toThrow(/Fixture dataset cannot claim authorised_declared/);

    const vos = draftVersionedObservationSet({
      id: "hsi-pcrm-vos-ssc-fixture",
      researchSpec: spec,
      authorisedLongitudinalInput: ali,
      observationSetVersion: "0.1.0",
      observationRefIds: [
        "hsi-hdi-obs-ssc-baseline",
        "hsi-hdi-obs-ssc-followup",
      ],
      versionNote: "Fixture versioned observation set v0.1.0.",
      limitations: [
        "Versioned observation set is research framing only.",
        "Observed facts stay distinct from inferred estimates.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(vos.observationCountDeclared).toBe(2);
    expect(vos.observationSetVersion).toBe("0.1.0");
  });

  test("disease state estimation stays inferred and refuses treatment recommendations", () => {
    const spec = seedFixtureSpec();
    const ali = draftAuthorisedLongitudinalInput({
      id: "hsi-pcrm-ali-est-1",
      researchSpec: spec,
      authorisationStatus: "fixture_declared",
      longitudinalSourceSummary: "Fixture longitudinal input for estimation.",
      linkedObservationRefIds: ["hsi-hdi-obs-ssc-baseline"],
      limitations: [
        "Fixture input only.",
        "Not a treatment recommendation.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const vos = draftVersionedObservationSet({
      id: "hsi-pcrm-vos-est-1",
      researchSpec: spec,
      authorisedLongitudinalInput: ali,
      observationSetVersion: "0.1.0",
      observationRefIds: ["hsi-hdi-obs-ssc-baseline"],
      versionNote: "Fixture observation set for estimation.",
      limitations: [
        "Observed is not inferred.",
        "Fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });

    const estimation = draftDiseaseStateEstimation({
      id: "hsi-pcrm-est-ssc-fixture",
      researchSpec: spec,
      versionedObservationSet: vos,
      estimateMethodOrdinal: "population_model_conditioned_declared",
      estimateSummary:
        "Fixture inferred disease-state estimate conditioned on population model envelopes — research only.",
      limitations: [
        "Population association is not individual truth.",
        "Inferred estimate is not an observed fact.",
        "Not a treatment recommendation.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(estimation.epistemicStatus).toBe("inferred");
    expect(estimation.isDiagnosisDirective).toBe(false);
    expect(estimation.treatmentRecommendationClaimed).toBe(false);
    expect(estimation.populationAssociationIsNotIndividualTruth).toBe(true);

    expect(() =>
      draftDiseaseStateEstimation({
        id: "hsi-pcrm-est-bad-language",
        researchSpec: spec,
        versionedObservationSet: vos,
        estimateMethodOrdinal: "exploratory_declared",
        estimateSummary:
          "This estimate provides a treatment recommendation for the patient.",
        limitations: ["Must refuse treatment recommendation language."],
        authoredByPrincipalId: "agent-hsi-pcrm-1",
        createdAt: asOf,
      }),
    ).toThrow(/must not diagnose\/prescribe|treatment recommendation/);
  });

  test("model applicability marks out-of-scope outside validated population or input domain", () => {
    const spec = seedFixtureSpec();
    expect(
      isOutOfScopeApplicability("out_of_scope_outside_validated_population"),
    ).toBe(true);
    expect(isOutOfScopeApplicability("applicable_within_validated_domain")).toBe(
      false,
    );

    const outOfScope = draftModelApplicabilityCheck({
      id: "hsi-pcrm-app-ssc-oos-pop",
      researchSpec: spec,
      applicabilityOutcome: "out_of_scope_outside_validated_population",
      applicabilitySummary:
        "Fixture subject context sits outside the validated population domain for the linked population model.",
      limitations: [
        "Out-of-scope outside validated population — research representation only.",
        "Not clinical care.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(outOfScope.outOfScope).toBe(true);
    expect(outOfScope.outsideValidatedPopulation).toBe(true);
    expect(outOfScope.outsideInputDomain).toBe(false);

    const inputDomain = draftModelApplicabilityCheck({
      id: "hsi-pcrm-app-ssc-oos-input",
      researchSpec: spec,
      applicabilityOutcome: "out_of_scope_outside_input_domain",
      applicabilitySummary:
        "Fixture inputs fall outside the declared input domain for the research model.",
      limitations: [
        "Out-of-scope outside input domain.",
        "Not a complete biological replica.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(inputDomain.outsideInputDomain).toBe(true);

    const applicable = draftModelApplicabilityCheck({
      id: "hsi-pcrm-app-ssc-ok",
      researchSpec: spec,
      applicabilityOutcome: "partial_with_limitations",
      applicabilitySummary:
        "Fixture partial applicability declared with research limitations.",
      limitations: [
        "Partial applicability is not clinical authorisation.",
        "Research-only framing.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(applicable.outOfScope).toBe(false);

    expect(() =>
      draftResearchOnlyInterpretation({
        id: "hsi-pcrm-int-refused-oos",
        researchSpec: spec,
        modelApplicabilityCheck: outOfScope,
        interpretationSummary:
          "Must refuse interpretation while out of scope.",
        limitations: [
          "Interpretation refused while out of scope.",
          "Research-only gate.",
        ],
        authoredByPrincipalId: "agent-hsi-pcrm-1",
        createdAt: asOf,
      }),
    ).toThrow(/out of scope/);
  });

  test("missing information, uncertainty, interpretation, and audit history compose", () => {
    const spec = seedFixtureSpec();
    const ali = draftAuthorisedLongitudinalInput({
      id: "hsi-pcrm-ali-compose-1",
      researchSpec: spec,
      authorisationStatus: "fixture_declared",
      longitudinalSourceSummary: "Fixture longitudinal input for composition.",
      linkedObservationRefIds: ["hsi-hdi-obs-ssc-baseline"],
      limitations: ["Fixture only.", "Not clinical care."],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const vos = draftVersionedObservationSet({
      id: "hsi-pcrm-vos-compose-1",
      researchSpec: spec,
      authorisedLongitudinalInput: ali,
      observationSetVersion: "0.1.0",
      observationRefIds: ["hsi-hdi-obs-ssc-baseline"],
      versionNote: "Fixture observation set for composition.",
      limitations: ["Observed is not inferred.", "Fixture research only."],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const estimation = draftDiseaseStateEstimation({
      id: "hsi-pcrm-est-compose-1",
      researchSpec: spec,
      versionedObservationSet: vos,
      estimateMethodOrdinal: "exploratory_declared",
      estimateSummary: "Fixture exploratory disease-state estimate.",
      limitations: [
        "Inferred estimate is not observed fact.",
        "Not a treatment recommendation.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const applicability = draftModelApplicabilityCheck({
      id: "hsi-pcrm-app-compose-1",
      researchSpec: spec,
      applicabilityOutcome: "partial_with_limitations",
      applicabilitySummary: "Fixture partial applicability for composition.",
      limitations: [
        "Partial applicability is not clinical care.",
        "Research-only framing.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const missing = draftMissingInformationAssessment({
      id: "hsi-pcrm-mis-compose-1",
      researchSpec: spec,
      versionedObservationSet: vos,
      missingInfoStatus: "partial_declared",
      missingDomainsDeclared: ["organ imaging follow-up", "biomarker panel"],
      assessmentSummary:
        "Fixture missing-information assessment without inventing values.",
      limitations: [
        "Missing information must not be invented.",
        "Fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(missing.inventedValues).toBeNull();
    expect(missing.missingDomainsDeclared).toHaveLength(2);

    const uncertainty = draftUncertaintyEstimation({
      id: "hsi-pcrm-unc-compose-1",
      researchSpec: spec,
      diseaseStateEstimation: estimation,
      uncertaintyOrdinal: "high_declared",
      uncertaintySummary:
        "Fixture high uncertainty declared from sparse observations and exploratory method.",
      sourcesOfUncertainty: [
        "sparse observation coverage",
        "exploratory estimate method",
      ],
      limitations: [
        "Uncertainty estimation is research framing only.",
        "Not clinical care.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(uncertainty.uncertaintyOrdinal).toBe("high_declared");

    const interpretation = draftResearchOnlyInterpretation({
      id: "hsi-pcrm-int-compose-1",
      researchSpec: spec,
      diseaseStateEstimation: estimation,
      modelApplicabilityCheck: applicability,
      missingInformationAssessment: missing,
      uncertaintyEstimation: uncertainty,
      interpretationSummary:
        "Fixture research-only interpretation under partial applicability and high uncertainty.",
      limitations: [
        "Research-only interpretation.",
        "Not a treatment recommendation.",
        "Not clinical care without separate validation.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(interpretation.researchOnly).toBe(true);
    expect(interpretation.clinicalCareAuthorised).toBe(false);
    expect(interpretation.completeBiologicalReplicaClaimed).toBe(false);

    const audit = draftAuditHistoryRecord({
      id: "hsi-pcrm-aud-compose-1",
      researchSpec: spec,
      subjectRecordId: interpretation.id,
      subjectRecordKind: "research_only_interpretation",
      action: "created",
      actionSummary: "Created fixture research-only interpretation record.",
      performedByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(audit.action).toBe("created");
    expect(audit.subjectRecordId).toBe(interpretation.id);
  });

  test("lifecycle transitions and blocked dataset stay fail-closed", () => {
    const blocked = seedFixtureSpec({
      id: "hsi-pcrm-spec-blocked-demo",
      displayName:
        "Blocked patient-contextualised research until authorised dataset",
      scientificQuestion:
        "Blocked scientific path for patient-contextualised research models until an authorised clinical dataset is supplied.",
      diseaseContextId: "hsi-hdi-ctx-blocked-demo",
      digitalPatientModelId: "hsi-hdi-dpm-blocked-demo",
      populationModellingSpecId: null,
      integratedDiseaseContextId: null,
      longitudinalModellingSpecId: null,
      crossScaleOntologySpecId: null,
      cohortDefinitionId: null,
      rweStudyId: null,
      longitudinalClinicalEvidenceSpecId: null,
      datasetAvailability: "blocked_no_authorised_clinical_dataset",
    });
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");

    expect(() =>
      transitionPatientContextualisedResearchSpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "researcher-1", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition|Cannot accept/);

    const fixture = seedFixtureSpec();
    const underReview = transitionPatientContextualisedResearchSpec({
      spec: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-pcrm-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionPatientContextualisedResearchSpec({
        spec: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-pcrm-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionPatientContextualisedResearchSpec({
      spec: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");

    const oos = transitionPatientContextualisedResearchSpec({
      spec: accepted,
      to: "out_of_scope_outside_validated_domain",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(oos.lifecycle).toBe("out_of_scope_outside_validated_domain");

    expect(() =>
      seedFixtureSpec({
        scientificQuestion:
          "This claims a complete biological replica of the patient for care.",
      }),
    ).toThrow(/must not diagnose\/prescribe|complete biological replica/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec();
    const ali = draftAuthorisedLongitudinalInput({
      id: "hsi-pcrm-ali-store-1",
      researchSpec: spec,
      authorisationStatus: "fixture_declared",
      longitudinalSourceSummary: "Store fixture longitudinal input.",
      linkedObservationRefIds: ["hsi-hdi-obs-ssc-baseline"],
      limitations: ["Fixture only.", "Not a twin product."],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const vos = draftVersionedObservationSet({
      id: "hsi-pcrm-vos-store-1",
      researchSpec: spec,
      authorisedLongitudinalInput: ali,
      observationSetVersion: "0.1.0",
      observationRefIds: ["hsi-hdi-obs-ssc-baseline"],
      versionNote: "Store fixture observation set.",
      limitations: ["Observed is not inferred.", "Store fixture research only."],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const estimation = draftDiseaseStateEstimation({
      id: "hsi-pcrm-est-store-1",
      researchSpec: spec,
      versionedObservationSet: vos,
      estimateMethodOrdinal: "rule_based_declared",
      estimateSummary: "Store fixture disease-state estimate.",
      limitations: [
        "Inferred estimate is not observed fact.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const applicability = draftModelApplicabilityCheck({
      id: "hsi-pcrm-app-store-1",
      researchSpec: spec,
      applicabilityOutcome: "out_of_scope_outside_validated_population",
      applicabilitySummary: "Store fixture out-of-scope applicability check.",
      limitations: [
        "Out-of-scope outside validated population.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const missing = draftMissingInformationAssessment({
      id: "hsi-pcrm-mis-store-1",
      researchSpec: spec,
      versionedObservationSet: vos,
      missingInfoStatus: "material_gaps_declared",
      missingDomainsDeclared: ["longitudinal organ outcomes"],
      assessmentSummary: "Store fixture missing-information assessment.",
      limitations: [
        "Missing values must not be invented.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const uncertainty = draftUncertaintyEstimation({
      id: "hsi-pcrm-unc-store-1",
      researchSpec: spec,
      diseaseStateEstimation: estimation,
      uncertaintyOrdinal: "moderate_declared",
      uncertaintySummary: "Store fixture uncertainty estimation.",
      sourcesOfUncertainty: ["limited follow-up coverage"],
      limitations: [
        "Uncertainty is research framing only.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const applicableOk = draftModelApplicabilityCheck({
      id: "hsi-pcrm-app-store-ok",
      researchSpec: spec,
      applicabilityOutcome: "partial_with_limitations",
      applicabilitySummary: "Store fixture partial applicability.",
      limitations: [
        "Partial applicability is not clinical care.",
        "Store fixture research only.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const interpretation = draftResearchOnlyInterpretation({
      id: "hsi-pcrm-int-store-1",
      researchSpec: spec,
      diseaseStateEstimation: estimation,
      modelApplicabilityCheck: applicableOk,
      missingInformationAssessment: missing,
      uncertaintyEstimation: uncertainty,
      interpretationSummary: "Store fixture research-only interpretation.",
      limitations: [
        "Research-only interpretation.",
        "Not a treatment recommendation.",
      ],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    const audit = draftAuditHistoryRecord({
      id: "hsi-pcrm-aud-store-1",
      researchSpec: spec,
      subjectRecordId: interpretation.id,
      subjectRecordKind: "research_only_interpretation",
      action: "created",
      actionSummary: "Store fixture audit history record.",
      performedByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });

    const draftBundle = draftPatientContextualisedResearchBundle({
      id: "hsi-pcrm-bnd-store-1",
      displayName: "Fixture store patient-contextualised research bundle",
      researchSpec: spec,
      bundleVersion: "0.1.0",
      limitations: [
        "Fixture store bundle — research decision support only.",
        "Not a complete biological replica.",
        "Not a treatment recommendation.",
        "Out-of-scope outside validated domain is preserved.",
      ],
      authorisedLongitudinalInputs: [ali],
      versionedObservationSets: [vos],
      diseaseStateEstimations: [estimation],
      modelApplicabilityChecks: [applicability, applicableOk],
      missingInformationAssessments: [missing],
      uncertaintyEstimations: [uncertainty],
      researchOnlyInterpretations: [interpretation],
      auditHistoryRecords: [audit],
      authoredByPrincipalId: "agent-hsi-pcrm-1",
      createdAt: asOf,
    });
    expect(draftBundle.outOfScopeApplicabilityIds).toContain(applicability.id);
    expect(draftBundle.notDigitalTwinProduct).toBe(true);

    const underReview = transitionPatientContextualisedResearchBundle({
      bundle: draftBundle,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-pcrm-1", actorKind: "ai_agent"},
    });
    const bundle = transitionPatientContextualisedResearchBundle({
      bundle: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(bundle.lifecycle).toBe("accepted_with_limitations");
    expect(fingerprintPatientContextualisedResearchBundle(bundle)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const store = createMemoryPatientContextualisedResearchModelsStore();
    store.upsertSpec(spec);
    store.upsertAuthorisedLongitudinalInput(ali);
    store.upsertVersionedObservationSet(vos);
    store.upsertDiseaseStateEstimation(estimation);
    store.upsertModelApplicabilityCheck(applicability);
    store.upsertModelApplicabilityCheck(applicableOk);
    store.upsertMissingInformationAssessment(missing);
    store.upsertUncertaintyEstimation(uncertainty);
    store.upsertResearchOnlyInterpretation(interpretation);
    store.upsertAuditHistoryRecord(audit);
    store.upsertBundle(bundle);

    expect(store.listSpecs(spec.diseaseContextId)).toHaveLength(1);
    expect(
      store.listAuthorisedLongitudinalInputs(spec.diseaseContextId),
    ).toHaveLength(1);
    expect(
      store.listModelApplicabilityChecks(spec.diseaseContextId),
    ).toHaveLength(2);
    expect(store.listBundles(spec.diseaseContextId)).toHaveLength(1);

    const lines = projectPatientContextualisedResearchModelsPersistenceLines({
      specs: [spec],
      authorisedLongitudinalInputs: [ali],
      versionedObservationSets: [vos],
      diseaseStateEstimations: [estimation],
      modelApplicabilityChecks: [applicability, applicableOk],
      missingInformationAssessments: [missing],
      uncertaintyEstimations: [uncertainty],
      researchOnlyInterpretations: [interpretation],
      auditHistoryRecords: [audit],
      bundles: [bundle],
    });
    expect(lines).toContain("notCompleteBiologicalReplica=true");
    expect(lines).toContain("notTreatmentRecommendation=true");
    expect(lines).toContain("outOfScopeOutsideValidatedDomain=true");
    expect(lines).toContain("capabilityKindCount=8");
    expect(lines).toContain("outOfScopeApplicabilityChecks=1");
    expect(lines).toContain("neon=red-wave-only");

    const pack = buildPatientContextualisedResearchModelsPack({
      specs: [spec],
      authorisedLongitudinalInputs: [ali],
      versionedObservationSets: [vos],
      diseaseStateEstimations: [estimation],
      modelApplicabilityChecks: [applicability, applicableOk],
      missingInformationAssessments: [missing],
      uncertaintyEstimations: [uncertainty],
      researchOnlyInterpretations: [interpretation],
      auditHistoryRecords: [audit],
      bundles: [bundle],
      asOf,
    });
    expect(pack.capabilityKindCount).toBe(8);
    expect(pack.outOfScopeApplicabilityCount).toBe(1);
    expect(pack.honesty.notDigitalTwinProduct).toBe(true);
  });
});
