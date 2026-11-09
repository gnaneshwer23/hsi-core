/**
 * Milestone 16 / PR3 — cross-scale biological relationships pack check.
 * Offline contracts only — no PHI, whole-body claims, causal edge collapse, or UI.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  CSBR_BIOLOGICAL_SCALES,
  CSBR_CAPABILITY_KINDS,
  CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
  CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
  CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
  buildCrossScaleBiologicalRelationshipsPack,
  draftAlternativeExplanationRecord,
  draftBiologicalUncertaintyRecord,
  draftContextDependentRelationshipRecord,
  draftCrossScaleDirectionalityRecord,
  draftCrossScaleEntityMappingRecord,
  draftCrossScaleRelationshipProfile,
  draftMechanismProvenanceRecord,
  draftPhysiologyGraphScope,
  draftTemporalRelationshipRecord,
  projectCrossScaleBiologicalRelationshipsPersistenceLines,
  transitionCrossScaleRelationshipProfile,
} from "../src/crossScaleBiologicalRelationshipsContracts";

const asOf = "2026-11-09T16:00:00.000Z";
const outDir = "evaluation/cross-scale-biological-relationships";

const molecularEntity = {
  id: "hsi-csbr-ent-il6-demo",
  label: "Fixture IL6 molecular association",
  scale: "molecular" as const,
  ontologySystem: "ontology:gene",
  ontologyValue: "IL6-FIXTURE",
  note: "",
};

const tissueEntity = {
  id: "hsi-csbr-ent-synovium-demo",
  label: "Fixture synovial tissue state",
  scale: "tissue" as const,
  ontologySystem: "ontology:tissue",
  ontologyValue: "SYNOVIUM-FIXTURE",
  note: "",
};

const organEntity = {
  id: "hsi-csbr-ent-joint-demo",
  label: "Fixture joint organ phenotype association",
  scale: "organ" as const,
  ontologySystem: "ontology:organ",
  ontologyValue: "JOINT-FIXTURE",
  note: "",
};

function fixturePack() {
  const blockedScope = draftPhysiologyGraphScope({
    id: "hsi-csbr-scp-blocked-demo",
    displayName: "Blocked physiology scope until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    coveredScales: ["molecular", "organ", "disease_outcome"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const scope = draftPhysiologyGraphScope({
    id: "hsi-csbr-scp-physio-demo",
    displayName: "Fixture physiology graph cross-scale scope",
    scientificQuestion:
      "Which fixture cross-scale associations can be reviewed without claiming organ outcomes from molecular edges or converting all edges into causal links?",
    coveredScales: [
      "molecular",
      "cellular",
      "tissue",
      "organ",
      "organ_system",
      "clinical_phenotype",
      "disease_outcome",
    ],
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    optionalCsolSpecId: "hsi-csol-spec-ssc-fixture",
    optionalHsysOrganSystemRelationshipId: "hsi-hsys-osr-immune-vascular",
    optionalCdmiComparativeProfileId: "hsi-cdmi-cmp-ssc-ra-fixture",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const mapMolTissue = draftCrossScaleEntityMappingRecord({
    id: "hsi-csbr-map-mol-tissue-demo",
    scope,
    sourceEntity: molecularEntity,
    targetEntity: tissueEntity,
    mappingOutcome: "supported",
    edgeKind: "association_edge",
    evidenceMode: "association_only",
    relationshipSummary:
      "Fixture molecular→tissue association — not an organ causal claim.",
    optionalCsolMappingId: "hsi-csol-map-il6-synovium",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const mapMolOrgan = draftCrossScaleEntityMappingRecord({
    id: "hsi-csbr-map-mol-organ-demo",
    scope,
    sourceEntity: molecularEntity,
    targetEntity: organEntity,
    mappingOutcome: "supported",
    edgeKind: "mechanistic_edge_declared",
    evidenceMode: "direct_mechanistic_evidence",
    intermediateStatus: "intermediates_validated_declared",
    relationshipSummary:
      "Fixture molecular→organ mapping with declared validated tissue/cellular intermediates — still not whole-body physiology.",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const provenance = draftMechanismProvenanceRecord({
    id: "hsi-csbr-prv-indirect-demo",
    scope,
    mapping: mapMolTissue,
    provenanceKind: "cdmi_mechanism_ref",
    evidenceMode: "association_only",
    provenanceSummary:
      "Fixture provenance composed with CDMI mechanism ref — indirect/association mode preserved.",
    evidenceRef: "fixture:provenance:cdmi:demo",
    optionalCdmiMechanismId: "hsi-cdmi-mech-il6-ssc",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const context = draftContextDependentRelationshipRecord({
    id: "hsi-csbr-ctx-synovium-demo",
    scope,
    mapping: mapMolTissue,
    contextSummary:
      "Fixture relationship holds in synovial tissue context and may not transfer to blood.",
    contextLabel: "synovial tissue fixture context",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const direction = draftCrossScaleDirectionalityRecord({
    id: "hsi-csbr-dir-forward-demo",
    scope,
    mapping: mapMolTissue,
    directionalityOrdinal: "context_dependent_direction_declared",
    evaluationSummary:
      "Fixture context-dependent directionality — not proven causation.",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const temporal = draftTemporalRelationshipRecord({
    id: "hsi-csbr-tmp-precedes-demo",
    scope,
    mapping: mapMolTissue,
    temporalKind: "precedes_declared",
    temporalSummary:
      "Fixture temporal precedence declared — temporal does not imply causal.",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const uncertainty = draftBiologicalUncertaintyRecord({
    id: "hsi-csbr-unc-moderate-demo",
    scope,
    mapping: mapMolOrgan,
    uncertaintyOrdinal: "moderate_declared",
    uncertaintySummary:
      "Fixture moderate biological uncertainty on organ-band mapping.",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const alternative = draftAlternativeExplanationRecord({
    id: "hsi-csbr-alt-competing-demo",
    scope,
    mapping: mapMolOrgan,
    alternativeStatus: "competing_explanations_declared",
    alternativeSummary:
      "Fixture competing explanation via tissue inflammation confounder — primary not collapsed.",
    alternativeLabel: "tissue inflammation confounder fixture",
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  const blockedProfile = draftCrossScaleRelationshipProfile({
    id: "hsi-csbr-prf-blocked-demo",
    displayName: "Blocked cross-scale relationship profile",
    scope: blockedScope,
    entityMappings: [],
    mechanismProvenances: [],
    contextDependentRelationships: [],
    directionalities: [],
    temporalRelationships: [],
    biologicalUncertainties: [],
    alternativeExplanations: [],
    profileVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Molecular association is not an organ or disease outcome.",
      "Graph edges are not causal links.",
    ],
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });

  let accepted = draftCrossScaleRelationshipProfile({
    id: "hsi-csbr-prf-reviewable-demo",
    displayName: "Reviewable cross-scale relationship profile",
    scope,
    entityMappings: [mapMolTissue, mapMolOrgan],
    mechanismProvenances: [provenance],
    contextDependentRelationships: [context],
    directionalities: [direction],
    temporalRelationships: [temporal],
    biologicalUncertainties: [uncertainty],
    alternativeExplanations: [alternative],
    profileVersion: "0.1.0",
    limitations: [
      "Fixtures are not scientific validation.",
      "Molecular association is not an organ or disease outcome.",
      "Graph edges are not causal links.",
      "Direct mechanistic evidence stays distinct from indirect inference.",
      "Organ/disease-outcome inference requires validated intermediates.",
    ],
    authoredByPrincipalId: "fixture-agent-csbr",
    createdAt: asOf,
  });
  accepted = transitionCrossScaleRelationshipProfile({
    profile: accepted,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-human-reviewer", actorKind: "human"},
  });
  accepted = transitionCrossScaleRelationshipProfile({
    profile: accepted,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-human-reviewer", actorKind: "human"},
  });

  const physiologyGraphScopes = [blockedScope, scope];
  const pack = buildCrossScaleBiologicalRelationshipsPack({
    physiologyGraphScopes,
    entityMappings: [mapMolTissue, mapMolOrgan],
    mechanismProvenances: [provenance],
    contextDependentRelationships: [context],
    directionalities: [direction],
    temporalRelationships: [temporal],
    biologicalUncertainties: [uncertainty],
    alternativeExplanations: [alternative],
    relationshipProfiles: [blockedProfile, accepted],
    asOf,
  });
  const persistenceLines =
    projectCrossScaleBiologicalRelationshipsPersistenceLines({
      physiologyGraphScopes,
      entityMappings: [mapMolTissue, mapMolOrgan],
      mechanismProvenances: [provenance],
      contextDependentRelationships: [context],
      directionalities: [direction],
      temporalRelationships: [temporal],
      biologicalUncertainties: [uncertainty],
      alternativeExplanations: [alternative],
      relationshipProfiles: [blockedProfile, accepted],
    });

  return {pack, persistenceLines, blockedScope};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedScope} = fixturePack();
  writeFileSync(
    join(outDir, "cross-scale-biological-relationships-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
        method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
        version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedScope.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        directMechanisticEvidenceDistinctFromIndirectInference: true,
        molecularAssociationIsNotOrganOrDiseaseOutcome: true,
        organOutcomeRequiresValidatedIntermediates: true,
        graphEdgeIsNotCausalLink: true,
        wholeBodyPhysiologyClaimed: false,
        biologicalScaleCount: CSBR_BIOLOGICAL_SCALES.length,
        capabilityKindCount: CSBR_CAPABILITY_KINDS.length,
        phiIngestion: false,
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
  const {pack, blockedScope} = fixturePack();
  if (
    pack.physiologyGraphScopeCount !== 2 ||
    pack.entityMappingCount !== 2 ||
    pack.mechanismProvenanceCount !== 1 ||
    pack.contextDependentRelationshipCount !== 1 ||
    pack.directionalityCount !== 1 ||
    pack.temporalRelationshipCount !== 1 ||
    pack.biologicalUncertaintyCount !== 1 ||
    pack.alternativeExplanationCount !== 1 ||
    pack.relationshipProfileCount !== 2 ||
    pack.biologicalScaleCount !== 7 ||
    pack.capabilityKindCount !== 7
  ) {
    throw new Error("Cross-scale biological relationships pack check failed");
  }
  if (
    pack.honesty.directMechanisticEvidenceDistinctFromIndirectInference !==
    true
  ) {
    throw new Error("Direct vs indirect evidence honesty gate failed");
  }
  if (pack.honesty.molecularAssociationIsNotOrganOrDiseaseOutcome !== true) {
    throw new Error("Molecular≠organ/disease-outcome honesty gate failed");
  }
  if (pack.honesty.organOutcomeRequiresValidatedIntermediates !== true) {
    throw new Error("Validated intermediates honesty gate failed");
  }
  if (pack.honesty.graphEdgeIsNotCausalLink !== true) {
    throw new Error("Graph edge≠causal honesty gate failed");
  }
  if (pack.honesty.wholeBodyPhysiologyClaimed !== false) {
    throw new Error("Whole-body physiology honesty gate failed");
  }
  if (
    blockedScope.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `cross-scale-biological-relationships-contracts check ok (${pack.physiologyGraphScopeCount} scopes, ${pack.relationshipProfileCount} profiles, ${pack.biologicalScaleCount} scales, ${pack.capabilityKindCount} capabilities; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/cross-scale-biological-relationships-pack.v1.json`,
  );
}
