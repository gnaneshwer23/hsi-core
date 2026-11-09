/**
 * Milestone 15 / PR4 — cross-scale ontology and model linkage pack check.
 * Offline contracts only — no PHI, twin, live M11 engine, or invented
 * parameters; molecular association ≠ organ causal effect.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  CSOL_BIOLOGICAL_SCALES,
  CSOL_CAPABILITY_KINDS,
  CROSS_SCALE_ONTOLOGY_METHOD,
  CROSS_SCALE_ONTOLOGY_SCHEMA,
  CROSS_SCALE_ONTOLOGY_VERSION,
  buildCrossScaleOntologyPack,
  draftBiologicalContextAnnotation,
  draftCrossScaleEntityMapping,
  draftCrossScaleEvidenceProvenance,
  draftCrossScaleLinkageBundle,
  draftCrossScaleModelLinkage,
  draftCrossScaleOntologySpec,
  draftCrossScaleRelationshipUncertainty,
  draftCrossScaleTemporalContext,
  draftVersionedOntologyMapping,
  projectCrossScaleOntologyPersistenceLines,
  recordUnsupportedCrossScaleCoupling,
  transitionCrossScaleLinkageBundle,
} from "../src/crossScaleOntologyModelLinkageContracts";

const asOf = "2026-11-09T23:45:00.000Z";
const outDir = "evaluation/cross-scale-ontology";

function fixturePack() {
  const blockedSpec = draftCrossScaleOntologySpec({
    id: "hsi-csol-spec-blocked-demo",
    displayName: "Blocked cross-scale ontology until authorised dataset",
    scientificQuestion:
      "Blocked scientific path for cross-scale ontology until an authorised clinical dataset is supplied.",
    diseaseContextId: "hsi-hdi-ctx-blocked-demo",
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const spec = draftCrossScaleOntologySpec({
    id: "hsi-csol-spec-ssc-demo",
    displayName: "Fixture SSc cross-scale ontology linkage spec",
    scientificQuestion:
      "How can fixture molecular pathway associations be mapped to organ-scale phenotypes without implying organ-level causal effects or live multiscale engines?",
    diseaseContextId: "hsi-hdi-ctx-ssc-demo",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-demo",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-demo",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const association = draftCrossScaleEntityMapping({
    id: "hsi-csol-map-pathway-lung-assoc",
    ontologySpec: spec,
    sourceEntity: {
      id: "hsi-csol-ent-tgfb-pathway",
      label: "Fixture TGF-beta pathway node",
      scale: "molecular",
      ontologySystem: "Reactome",
      ontologyValue: "R-HSA-170834",
      note: "Fixture molecular pathway entity",
    },
    targetEntity: {
      id: "hsi-csol-ent-lung-fibrosis",
      label: "Fixture lung fibrosis organ concept",
      scale: "organ",
      ontologySystem: "UBERON",
      ontologyValue: "UBERON:0002048",
      note: "Fixture organ-scale entity",
    },
    mappingOutcome: "supported",
    couplingStatus: "association_only_not_causal",
    relationshipSummary:
      "Fixture molecular pathway association to organ phenotype — association only, not organ-level causal effect.",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const unsupported = recordUnsupportedCrossScaleCoupling({
    id: "hsi-csol-map-unsupported-coupling",
    ontologySpec: spec,
    sourceEntity: {
      id: "hsi-csol-ent-pathway-unsup",
      label: "Fixture unsupported pathway node",
      scale: "molecular",
      ontologySystem: "Reactome",
      ontologyValue: "R-HSA-170834",
      note: "Fixture unsupported source",
    },
    targetEntity: {
      id: "hsi-csol-ent-organ-unsup",
      label: "Fixture unsupported organ concept",
      scale: "organ",
      ontologySystem: "UBERON",
      ontologyValue: "UBERON:0002048",
      note: "Fixture unsupported target",
    },
    couplingStatus: "unsupported_coupling",
    relationshipSummary:
      "Fixture unsupported molecular→organ coupling recorded explicitly — not invented as validated support.",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const validated = draftCrossScaleEntityMapping({
    id: "hsi-csol-map-validated-coupling",
    ontologySpec: spec,
    sourceEntity: {
      id: "hsi-csol-ent-pathway-val",
      label: "Fixture validated pathway node",
      scale: "molecular",
      ontologySystem: "Reactome",
      ontologyValue: "R-HSA-170834",
      note: "Fixture validated source",
    },
    targetEntity: {
      id: "hsi-csol-ent-organ-val",
      label: "Fixture validated organ concept",
      scale: "organ",
      ontologySystem: "UBERON",
      ontologyValue: "UBERON:0002048",
      note: "Fixture validated target",
    },
    mappingOutcome: "supported",
    couplingStatus: "validated_coupling",
    relationshipSummary:
      "Fixture validated coupling declared under research limitations — M11 multiscale engine remains absent.",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const context = draftBiologicalContextAnnotation({
    id: "hsi-csol-ctx-fibroblast",
    ontologySpec: spec,
    entity: {
      id: "hsi-csol-ent-tgfb-pathway",
      label: "Fixture TGF-beta pathway node",
      scale: "molecular",
      ontologySystem: "Reactome",
      ontologyValue: "R-HSA-170834",
      note: "Fixture molecular pathway entity",
    },
    contextSummary:
      "Fixture biological context annotation for molecular pathway in research framing.",
    speciesOrModelSystem: "Homo sapiens (fixture)",
    tissueOrCompartment: "dermal fibroblast niche (fixture)",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const provenance = draftCrossScaleEvidenceProvenance({
    id: "hsi-csol-prv-map-1",
    ontologySpec: spec,
    subjectRecordId: association.id,
    provenanceKind: "fixture_declared",
    sourceRef: "fixture://cross-scale/evidence-1",
    evidenceSummary:
      "Fixture evidence provenance for cross-scale mapping — not invented support.",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const temporal = draftCrossScaleTemporalContext({
    id: "hsi-csol-tmp-map-1",
    ontologySpec: spec,
    subjectRecordId: association.id,
    temporalContextKind: "interval_declared",
    startTime: "2024-01-15T10:00:00.000Z",
    endTime: "2024-06-15T10:00:00.000Z",
    temporalSummary:
      "Fixture temporal context interval for cross-scale mapping research.",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const linkage = draftCrossScaleModelLinkage({
    id: "hsi-csol-lnk-validated",
    ontologySpec: spec,
    entityMapping: validated,
    sourceModelRef: "fixture-molecular-model-a",
    targetModelRef: "fixture-organ-model-b",
    linkageSummary:
      "Fixture model linkage after validated coupling — contracts only, without invented parameters.",
    limitations: [
      "Validated coupling declared for fixture research only.",
      "M11 multiscale engine remains absent / skipped.",
      "Simulation parameters are not invented.",
    ],
    longitudinalDiseaseStateModelId: "hsi-ldsm-mdl-ssc-demo",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const uncertainty = draftCrossScaleRelationshipUncertainty({
    id: "hsi-csol-unc-map-1",
    ontologySpec: spec,
    subjectRecordId: unsupported.id,
    uncertaintyOrdinal: "high_declared",
    uncertaintySummary:
      "Fixture relationship uncertainty preserved; unsupported organ coupling recorded separately.",
    unsupportedCouplingRecorded: true,
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const ontologyMapping = draftVersionedOntologyMapping({
    id: "hsi-csol-ont-related-1",
    ontologySpec: spec,
    fromSystem: "Reactome",
    fromValue: "R-HSA-170834",
    toSystem: "GO",
    toValue: "GO:0007179",
    relation: "related",
    mappingVersion: "0.1.0",
    mappingOutcome: "uncertain",
    sourceRef: "fixture://ontology/mapping-related",
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const draftBundle = draftCrossScaleLinkageBundle({
    id: "hsi-csol-bnd-ssc-demo",
    displayName: "Fixture SSc cross-scale linkage bundle",
    ontologySpec: spec,
    bundleVersion: "0.1.0",
    limitations: [
      "Fixture cross-scale bundle — research decision support only.",
      "Molecular association is not organ causal effect.",
      "Unsupported couplings recorded explicitly; M11 multiscale engine remains absent.",
    ],
    entityMappings: [association, unsupported, validated],
    biologicalContexts: [context],
    evidenceProvenance: [provenance],
    temporalContexts: [temporal],
    modelLinkages: [linkage],
    relationshipUncertainties: [uncertainty],
    versionedOntologyMappings: [ontologyMapping],
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });
  const underReview = transitionCrossScaleLinkageBundle({
    bundle: draftBundle,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-csol", actorKind: "ai_agent"},
  });
  const bundle = transitionCrossScaleLinkageBundle({
    bundle: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedBundle = draftCrossScaleLinkageBundle({
    id: "hsi-csol-bnd-blocked-demo",
    displayName: "Blocked cross-scale linkage bundle",
    ontologySpec: blockedSpec,
    bundleVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Not a digital twin product; fixtures only.",
    ],
    authoredByPrincipalId: "fixture-agent-csol",
    createdAt: asOf,
  });

  const specs = [blockedSpec, spec];
  const entityMappings = [association, unsupported, validated];
  const pack = buildCrossScaleOntologyPack({
    specs,
    entityMappings,
    biologicalContexts: [context],
    evidenceProvenance: [provenance],
    temporalContexts: [temporal],
    modelLinkages: [linkage],
    relationshipUncertainties: [uncertainty],
    versionedOntologyMappings: [ontologyMapping],
    bundles: [blockedBundle, bundle],
    asOf,
  });
  const persistenceLines = projectCrossScaleOntologyPersistenceLines({
    specs,
    entityMappings,
    biologicalContexts: [context],
    evidenceProvenance: [provenance],
    temporalContexts: [temporal],
    modelLinkages: [linkage],
    relationshipUncertainties: [uncertainty],
    versionedOntologyMappings: [ontologyMapping],
    bundles: [blockedBundle, bundle],
  });

  return {pack, persistenceLines, blockedSpec};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedSpec} = fixturePack();
  writeFileSync(
    join(outDir, "cross-scale-ontology-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
        method: CROSS_SCALE_ONTOLOGY_METHOD,
        version: CROSS_SCALE_ONTOLOGY_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedSpec.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        biologicalScaleCount: CSOL_BIOLOGICAL_SCALES.length,
        capabilityKindCount: CSOL_CAPABILITY_KINDS.length,
        molecularAssociationIsNotOrganCausalEffect: true,
        crossScaleModelLinkageRequiresValidatedCoupling: true,
        unsupportedCouplingsMustBeRecordedExplicitly: true,
        noInventedSimulationParameters: true,
        notClinicalCare: true,
        notDigitalTwinProduct: true,
        phiIngestion: false,
        liveTwinOrMultiscale: false,
        autonomousDiagnosisOrPrescribing: false,
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
  const {pack, blockedSpec} = fixturePack();
  if (
    pack.specCount !== 2 ||
    pack.entityMappingCount !== 3 ||
    pack.biologicalContextCount !== 1 ||
    pack.evidenceProvenanceCount !== 1 ||
    pack.temporalContextCount !== 1 ||
    pack.modelLinkageCount !== 1 ||
    pack.relationshipUncertaintyCount !== 1 ||
    pack.versionedOntologyMappingCount !== 1 ||
    pack.bundleCount !== 2 ||
    pack.unsupportedCouplingCount !== 2 ||
    pack.biologicalScaleCount !== 7 ||
    pack.capabilityKindCount !== 7
  ) {
    throw new Error("Cross-scale ontology pack check failed");
  }
  if (pack.honesty.molecularAssociationIsNotOrganCausalEffect !== true) {
    throw new Error("Molecular≠organ causal honesty gate failed");
  }
  if (pack.honesty.crossScaleModelLinkageRequiresValidatedCoupling !== true) {
    throw new Error("Validated coupling honesty gate failed");
  }
  if (pack.honesty.unsupportedCouplingsMustBeRecordedExplicitly !== true) {
    throw new Error("Unsupported coupling honesty gate failed");
  }
  if (pack.honesty.noLiveMultiscaleEngineClaim !== true) {
    throw new Error("Live multiscale honesty gate failed");
  }
  if (pack.honesty.noInventedSimulationParameters !== true) {
    throw new Error("Invented parameters honesty gate failed");
  }
  if (
    blockedSpec.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `cross-scale-ontology-model-linkage-contracts check ok (${pack.specCount} specs, ${pack.bundleCount} bundles, ${pack.entityMappingCount} mappings, ${pack.unsupportedCouplingCount} unsupported couplings, ${pack.biologicalScaleCount} scales; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/cross-scale-ontology-pack.v1.json`);
}
