/**
 * Milestone 15 / PR2 — clinical and biological context pack check.
 * Offline contracts only — no PHI, live twin, graph promotion of patient
 * facts, or population→individual inference collapse.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
  CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
  CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
  KNOWLEDGE_LAYER_KINDS,
  buildClinicalBiologicalContextPack,
  draftAuthorisedResearchContextResolution,
  draftBiologicalKnowledgeRetrieval,
  draftClinicalBiologicalConceptMapping,
  draftDataQualityAssessment,
  draftIntegratedDiseaseContext,
  draftMissingMeasurementIdentification,
  draftPermittedClinicalObservationRetrieval,
  draftSupportedRelationshipRecord,
  draftTemporalObservationAlignment,
  draftUnsupportedUncertainMappingPreservation,
  projectClinicalBiologicalContextPersistenceLines,
  transitionIntegratedDiseaseContext,
} from "../src/clinicalBiologicalContextContracts";

const asOf = "2026-11-09T23:00:00.000Z";
const outDir = "evaluation/clinical-biological-context";

function fixturePack() {
  const blockedResolution = draftAuthorisedResearchContextResolution({
    id: "hsi-cbc-res-blocked-demo",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    displayName: "Blocked clinical↔biology context until authorised dataset",
    resolutionStatus: "blocked_no_authorised_dataset",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const resolution = draftAuthorisedResearchContextResolution({
    id: "hsi-cbc-res-ssc-demo",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    displayName: "Fixture SSc clinical↔biology research context resolution",
    resolutionStatus: "resolved_fixture",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    longitudinalAnalysisSpecId: "hsi-lce-spec-lab-trend-demo",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const clinical = draftPermittedClinicalObservationRetrieval({
    id: "hsi-cbc-clr-crp-demo",
    researchContext: resolution,
    retrievalScope: "fixture_longitudinal",
    clinicalConcept: "Fixture CRP laboratory concept",
    subjectOrCohortRef: "pseudo-subj-cbc-demo",
    observedAt: "2024-03-10T12:00:00.000Z",
    hdiObservationId: "hsi-hdi-obs-crp-demo",
    rweObservationId: "hsi-rwe-obs-fixture-demo",
    longitudinalSeriesId: "hsi-lce-ser-lab-demo",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const biologySupported = draftBiologicalKnowledgeRetrieval({
    id: "hsi-cbc-bio-il6-demo",
    researchContext: resolution,
    retrievalScope: "public_biomedical_fixture",
    biologicalConcept: "Fixture IL6 signalling public concept",
    knowledgeLayer: "established_mechanism",
    publicGraphNodeId: "bio:il6-signalling-demo",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const biologyUncertain = draftBiologicalKnowledgeRetrieval({
    id: "hsi-cbc-bio-hyp-demo",
    researchContext: resolution,
    retrievalScope: "public_biomedical_fixture",
    biologicalConcept: "Fixture unvalidated hypothesis concept",
    knowledgeLayer: "unvalidated_hypothesis",
    publicGraphNodeId: "bio:hyp-demo",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const supportedMapping = draftClinicalBiologicalConceptMapping({
    id: "hsi-cbc-map-supported-demo",
    researchContext: resolution,
    clinicalObservation: clinical,
    biologicalKnowledge: biologySupported,
    mappingOutcome: "supported",
    mappingConfidence: "low",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const uncertainMapping = draftClinicalBiologicalConceptMapping({
    id: "hsi-cbc-map-uncertain-demo",
    researchContext: resolution,
    clinicalObservation: clinical,
    biologicalKnowledge: biologyUncertain,
    mappingOutcome: "uncertain",
    mappingConfidence: "insufficient",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const alignment = draftTemporalObservationAlignment({
    id: "hsi-cbc-tmp-crp-demo",
    researchContext: resolution,
    clinicalObservations: [clinical],
    alignmentRule: "Fixture temporal envelope for CRP observation",
    alignedWindowStart: "2024-03-01T00:00:00.000Z",
    alignedWindowEnd: "2024-03-31T23:59:59.000Z",
    interopTemporalAlignmentId: "hsi-scdi-tmp-fixture-demo",
    longitudinalSeriesId: "hsi-lce-ser-lab-demo",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const quality = draftDataQualityAssessment({
    id: "hsi-cbc-qlt-demo-1",
    researchContext: resolution,
    checksPerformed: [
      "timestamp_present",
      "concept_declared",
      "missingness_declared",
    ],
    qualityOrdinal: "adequate_for_fixture_engineering",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const missing = draftMissingMeasurementIdentification({
    id: "hsi-cbc-mis-fvc-demo",
    researchContext: resolution,
    missingConcept: "Fixture FVC measurement",
    missingnessKind: "measurement_absent",
    rationale:
      "FVC absent in permitted longitudinal window — gap recorded without inventing a value.",
    relatedClinicalObservationRetrievalId: clinical.id,
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const supported = draftSupportedRelationshipRecord({
    id: "hsi-cbc-rel-crp-il6-demo",
    researchContext: resolution,
    conceptMapping: supportedMapping,
    relationshipSummary:
      "Fixture supported CRP↔IL6 research relationship — population association is not individual inference.",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const preserved = draftUnsupportedUncertainMappingPreservation({
    id: "hsi-cbc-unc-hyp-demo",
    researchContext: resolution,
    conceptMapping: uncertainMapping,
    preservationReason:
      "Uncertain mapping preserved for review — not discarded or invented as support.",
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const draft = draftIntegratedDiseaseContext({
    id: "hsi-cbc-idc-ssc-demo",
    displayName: "Fixture integrated SSc clinical↔biology disease context",
    researchContext: resolution,
    clinicalObservations: [clinical],
    biologicalKnowledge: [biologySupported, biologyUncertain],
    conceptMappings: [supportedMapping, uncertainMapping],
    temporalAlignments: [alignment],
    qualityAssessments: [quality],
    missingMeasurements: [missing],
    supportedRelationships: [supported],
    unsupportedUncertainMappings: [preserved],
    contextVersion: "0.1.0",
    limitations: [
      "Fixture integrated context only — not a diagnosis.",
      "Not a live twin product; research envelopes only.",
      "Restricted patient observations stay outside the public biomedical graph.",
      "Population association is not individual inference.",
    ],
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });
  const underReview = transitionIntegratedDiseaseContext({
    context: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-cbc", actorKind: "ai_agent"},
  });
  const integrated = transitionIntegratedDiseaseContext({
    context: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedIntegrated = draftIntegratedDiseaseContext({
    id: "hsi-cbc-idc-blocked-demo",
    displayName: "Blocked integrated disease context",
    researchContext: blockedResolution,
    clinicalObservations: [],
    biologicalKnowledge: [],
    conceptMappings: [],
    temporalAlignments: [],
    qualityAssessments: [],
    missingMeasurements: [],
    supportedRelationships: [],
    unsupportedUncertainMappings: [],
    contextVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Population association is not individual inference.",
    ],
    authoredByPrincipalId: "fixture-agent-cbc",
    createdAt: asOf,
  });

  const researchContextResolutions = [blockedResolution, resolution];
  const pack = buildClinicalBiologicalContextPack({
    researchContextResolutions,
    clinicalObservationRetrievals: [clinical],
    biologicalKnowledgeRetrievals: [biologySupported, biologyUncertain],
    conceptMappings: [supportedMapping, uncertainMapping],
    temporalAlignments: [alignment],
    qualityAssessments: [quality],
    missingMeasurements: [missing],
    supportedRelationships: [supported],
    unsupportedUncertainMappings: [preserved],
    integratedDiseaseContexts: [blockedIntegrated, integrated],
    asOf,
  });
  const persistenceLines = projectClinicalBiologicalContextPersistenceLines({
    researchContextResolutions,
    clinicalObservationRetrievals: [clinical],
    biologicalKnowledgeRetrievals: [biologySupported, biologyUncertain],
    conceptMappings: [supportedMapping, uncertainMapping],
    temporalAlignments: [alignment],
    qualityAssessments: [quality],
    missingMeasurements: [missing],
    supportedRelationships: [supported],
    unsupportedUncertainMappings: [preserved],
    integratedDiseaseContexts: [blockedIntegrated, integrated],
  });

  return {pack, persistenceLines, blockedResolution};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedResolution} = fixturePack();
  writeFileSync(
    join(outDir, "clinical-biological-context-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
        method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
        version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked: blockedResolution.datasetAvailabilityBlocked,
        scientificPathBlockedNoAuthorisedDataset: true,
        knowledgeLayersMustNotCollapse: true,
        populationAssociationIsNotIndividualInference: true,
        restrictedPatientObservationsMustNotPromoteToPublicGraph: true,
        knowledgeLayerCount: KNOWLEDGE_LAYER_KINDS.length,
        phiIngestion: false,
        liveTwinOrMultiscale: false,
        autonomousDiagnosisOrPrescribing: false,
        fabricatedDiseaseTimelines: false,
        workbenchUi: false,
        graphPromotable: false,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        persistenceLineCount: persistenceLines.length,
        persistenceLines,
      },
      null,
      2,
    )}\n`,
  );
}

const checkOnly = process.argv.includes("--check");
if (checkOnly) {
  const {pack, blockedResolution} = fixturePack();
  if (
    pack.researchContextResolutionCount < 2 ||
    pack.clinicalObservationRetrievalCount !== 1 ||
    pack.biologicalKnowledgeRetrievalCount !== 2 ||
    pack.conceptMappingCount !== 2 ||
    pack.temporalAlignmentCount !== 1 ||
    pack.qualityAssessmentCount !== 1 ||
    pack.missingMeasurementCount !== 1 ||
    pack.supportedRelationshipCount !== 1 ||
    pack.unsupportedUncertainMappingCount !== 1 ||
    pack.integratedDiseaseContextCount !== 2
  ) {
    throw new Error("Clinical biological context pack check failed");
  }
  if (pack.honesty.populationAssociationIsNotIndividualInference !== true) {
    throw new Error("Population≠individual honesty gate failed");
  }
  if (
    pack.honesty.restrictedPatientObservationsMustNotPromoteToPublicGraph !==
    true
  ) {
    throw new Error("Restricted observation promotion honesty gate failed");
  }
  if (pack.honesty.noLiveTwinOrMultiscaleClaim !== true) {
    throw new Error("Live twin / multiscale honesty gate failed");
  }
  if (!blockedResolution.datasetAvailabilityBlocked) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `clinical-biological-context-contracts check ok (${pack.researchContextResolutionCount} resolutions, ${pack.integratedDiseaseContextCount} integrated contexts, ${pack.conceptMappingCount} mappings; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/clinical-biological-context-pack.v1.json`);
}
