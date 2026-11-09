/**
 * Milestone 15 PR4 — cross-scale ontology and model linkage honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  CSOL_BIOLOGICAL_SCALES,
  CSOL_CAPABILITY_KINDS,
  buildCrossScaleOntologyPack,
  createMemoryCrossScaleOntologyStore,
  crossesToOrganOrHigher,
  draftBiologicalContextAnnotation,
  draftCrossScaleEntityMapping,
  draftCrossScaleEvidenceProvenance,
  draftCrossScaleLinkageBundle,
  draftCrossScaleModelLinkage,
  draftCrossScaleOntologySpec,
  draftCrossScaleRelationshipUncertainty,
  draftCrossScaleTemporalContext,
  draftVersionedOntologyMapping,
  fingerprintCrossScaleLinkageBundle,
  projectCrossScaleOntologyPersistenceLines,
  recordUnsupportedCrossScaleCoupling,
  transitionCrossScaleLinkageBundle,
  transitionCrossScaleOntologySpec,
  type CrossScaleEntityRef,
  type CrossScaleOntologySpec,
} from "../src/crossScaleOntologyModelLinkageContracts";

const asOf = "2026-11-09T23:45:00.000Z";

function molecularEntity(
  overrides?: Partial<CrossScaleEntityRef>,
): CrossScaleEntityRef {
  return {
    id: "hsi-csol-ent-tgfb-pathway",
    label: "Fixture TGF-beta pathway node",
    scale: "molecular",
    ontologySystem: "Reactome",
    ontologyValue: "R-HSA-170834",
    note: "Fixture molecular pathway entity",
    ...overrides,
  };
}

function organEntity(
  overrides?: Partial<CrossScaleEntityRef>,
): CrossScaleEntityRef {
  return {
    id: "hsi-csol-ent-lung-fibrosis",
    label: "Fixture lung fibrosis organ concept",
    scale: "organ",
    ontologySystem: "UBERON",
    ontologyValue: "UBERON:0002048",
    note: "Fixture organ-scale entity",
    ...overrides,
  };
}

function seedFixtureSpec(
  overrides?: Partial<Parameters<typeof draftCrossScaleOntologySpec>[0]>,
): CrossScaleOntologySpec {
  return draftCrossScaleOntologySpec({
    id: "hsi-csol-spec-ssc-fixture",
    displayName: "Fixture SSc cross-scale ontology linkage spec",
    scientificQuestion:
      "How can fixture molecular pathway associations be mapped to organ-scale phenotypes without implying organ-level causal effects or live multiscale engines?",
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    integratedDiseaseContextId: "hsi-cbc-idc-ssc-fixture",
    longitudinalModellingSpecId: "hsi-ldsm-spec-ssc-fixture",
    datasetAvailability: "fixture_only",
    accessClassification: "fixture_engineering",
    authoredByPrincipalId: "agent-hsi-csol-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    ...overrides,
  });
}

describe("cross-scale ontology and model linkage contracts (M15 PR4)", () => {
  test("covers all biological scales and capability kinds with HDI/CBC/LDSM links", () => {
    expect(CSOL_BIOLOGICAL_SCALES).toHaveLength(7);
    expect(CSOL_CAPABILITY_KINDS).toHaveLength(7);
    expect(CSOL_BIOLOGICAL_SCALES).toContain("molecular");
    expect(CSOL_BIOLOGICAL_SCALES).toContain("longitudinal_outcome");

    const spec = seedFixtureSpec();
    expect(spec.honesty.molecularAssociationIsNotOrganCausalEffect).toBe(true);
    expect(
      spec.honesty.crossScaleModelLinkageRequiresValidatedCoupling,
    ).toBe(true);
    expect(
      spec.honesty.unsupportedCouplingsMustBeRecordedExplicitly,
    ).toBe(true);
    expect(spec.honesty.noLiveMultiscaleEngineClaim).toBe(true);
    expect(spec.honesty.noInventedSimulationParameters).toBe(true);
    expect(spec.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(spec.diseaseContextId).toBe("hsi-hdi-ctx-ssc-fixture");
    expect(spec.integratedDiseaseContextId).toBe("hsi-cbc-idc-ssc-fixture");
    expect(spec.longitudinalModellingSpecId).toBe(
      "hsi-ldsm-spec-ssc-fixture",
    );
    expect(spec.liveMultiscaleEngineOperational).toBe(false);
    expect(spec.notDigitalTwinProduct).toBe(true);
    expect(spec.capabilityKinds).toHaveLength(7);
  });

  test("molecular pathway association does not imply organ-level causal effect", () => {
    expect(crossesToOrganOrHigher("molecular", "organ")).toBe(true);
    expect(crossesToOrganOrHigher("cellular", "organ_system")).toBe(true);
    expect(crossesToOrganOrHigher("tissue", "organ")).toBe(false);
    expect(crossesToOrganOrHigher("molecular", "cellular")).toBe(false);

    const spec = seedFixtureSpec();
    const associationOnly = draftCrossScaleEntityMapping({
      id: "hsi-csol-map-pathway-lung-assoc",
      ontologySpec: spec,
      sourceEntity: molecularEntity(),
      targetEntity: organEntity(),
      mappingOutcome: "supported",
      couplingStatus: "association_only_not_causal",
      relationshipSummary:
        "Fixture molecular pathway association to organ phenotype — association only, not organ-level causal effect.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(
      associationOnly.molecularPathwayAssociationImpliesOrganCausalEffect,
    ).toBe(false);
    expect(associationOnly.causalClaimKind).toBe("association_only");
    expect(associationOnly.couplingStatus).toBe(
      "association_only_not_causal",
    );

    expect(() =>
      draftCrossScaleEntityMapping({
        id: "hsi-csol-map-bad-validated",
        ontologySpec: spec,
        sourceEntity: molecularEntity(),
        targetEntity: organEntity({
          id: "hsi-csol-ent-lung-bad",
        }),
        mappingOutcome: "uncertain",
        couplingStatus: "validated_coupling",
        relationshipSummary:
          "Uncertain mapping cannot be validated organ coupling.",
        authoredByPrincipalId: "agent-hsi-csol-1",
        createdAt: asOf,
      }),
    ).toThrow(/Uncertain mapping cannot carry validated coupling/);
  });

  test("model linkage across scales requires validated coupling; unsupported couplings recorded", () => {
    const spec = seedFixtureSpec();
    const unsupported = recordUnsupportedCrossScaleCoupling({
      id: "hsi-csol-map-unsupported-coupling",
      ontologySpec: spec,
      sourceEntity: molecularEntity({
        id: "hsi-csol-ent-pathway-unsup",
      }),
      targetEntity: organEntity({
        id: "hsi-csol-ent-organ-unsup",
      }),
      couplingStatus: "unsupported_coupling",
      relationshipSummary:
        "Fixture unsupported molecular→organ coupling recorded explicitly — not invented as validated support.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(unsupported.couplingStatus).toBe("unsupported_coupling");
    expect(unsupported.mappingOutcome).toBe("unsupported");

    expect(() =>
      draftCrossScaleModelLinkage({
        id: "hsi-csol-lnk-refused",
        ontologySpec: spec,
        entityMapping: unsupported,
        sourceModelRef: "fixture-molecular-model-a",
        targetModelRef: "fixture-organ-model-b",
        linkageSummary:
          "Must refuse linking simulation components without validated coupling.",
      limitations: [
        "No validated coupling — linkage refused.",
        "M11 multiscale engine remains absent.",
      ],
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    }),
  ).toThrow(/refused without validated coupling/);

  const validated = draftCrossScaleEntityMapping({
    id: "hsi-csol-map-validated-coupling",
    ontologySpec: spec,
    sourceEntity: molecularEntity({
      id: "hsi-csol-ent-pathway-val",
    }),
    targetEntity: organEntity({
      id: "hsi-csol-ent-organ-val",
    }),
    mappingOutcome: "supported",
    couplingStatus: "validated_coupling",
    relationshipSummary:
      "Fixture validated coupling declared under research limitations — M11 multiscale engine remains absent.",
    authoredByPrincipalId: "agent-hsi-csol-1",
    createdAt: asOf,
  });
  expect(validated.causalClaimKind).toBe("validated_coupling_declared");

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
      longitudinalDiseaseStateModelId: "hsi-ldsm-mdl-ssc-fixture",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(linkage.linkageAllowed).toBe(true);
    expect(linkage.inventedParameters).toBeNull();
    expect(linkage.liveMultiscaleEngineOperational).toBe(false);
    expect(linkage.longitudinalDiseaseStateModelId).toBe(
      "hsi-ldsm-mdl-ssc-fixture",
    );
  });

  test("biological context, evidence provenance, temporal context, and uncertainty stay honest", () => {
    const spec = seedFixtureSpec();
    const entity = molecularEntity();
    const mapping = draftCrossScaleEntityMapping({
      id: "hsi-csol-map-ctx-demo",
      ontologySpec: spec,
      sourceEntity: entity,
      targetEntity: {
        id: "hsi-csol-ent-cell-fibroblast",
        label: "Fixture fibroblast cellular concept",
        scale: "cellular",
        ontologySystem: "CL",
        ontologyValue: "CL:0000057",
        note: "Fixture cellular entity",
      },
      mappingOutcome: "supported",
      couplingStatus: "association_only_not_causal",
      relationshipSummary:
        "Fixture molecular→cellular association without organ causal claim.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });

    const context = draftBiologicalContextAnnotation({
      id: "hsi-csol-ctx-fibroblast",
      ontologySpec: spec,
      entity,
      contextSummary:
        "Fixture biological context annotation for molecular pathway in research framing.",
      speciesOrModelSystem: "Homo sapiens (fixture)",
      tissueOrCompartment: "dermal fibroblast niche (fixture)",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(context.scale).toBe("molecular");
    expect(context.entityId).toBe(entity.id);

    const provenance = draftCrossScaleEvidenceProvenance({
      id: "hsi-csol-prv-map-1",
      ontologySpec: spec,
      subjectRecordId: mapping.id,
      provenanceKind: "fixture_declared",
      sourceRef: "fixture://cross-scale/evidence-1",
      evidenceSummary:
        "Fixture evidence provenance for cross-scale mapping — not invented support.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(provenance.inventedEvidence).toBeNull();

    const temporal = draftCrossScaleTemporalContext({
      id: "hsi-csol-tmp-map-1",
      ontologySpec: spec,
      subjectRecordId: mapping.id,
      temporalContextKind: "interval_declared",
      startTime: "2024-01-15T10:00:00.000Z",
      endTime: "2024-06-15T10:00:00.000Z",
      temporalSummary:
        "Fixture temporal context interval for cross-scale mapping research.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(temporal.fabricatedTimeline).toBeNull();

    expect(() =>
      draftCrossScaleTemporalContext({
        id: "hsi-csol-tmp-bad-order",
        ontologySpec: spec,
        subjectRecordId: mapping.id,
        temporalContextKind: "interval_declared",
        startTime: "2024-06-15T10:00:00.000Z",
        endTime: "2024-01-15T10:00:00.000Z",
        temporalSummary: "Invalid interval order must fail.",
        authoredByPrincipalId: "agent-hsi-csol-1",
        createdAt: asOf,
      }),
    ).toThrow(/startTime must not be after endTime/);

    const uncertainty = draftCrossScaleRelationshipUncertainty({
      id: "hsi-csol-unc-map-1",
      ontologySpec: spec,
      subjectRecordId: mapping.id,
      uncertaintyOrdinal: "high_declared",
      uncertaintySummary:
        "Fixture relationship uncertainty preserved; unsupported organ coupling recorded separately.",
      unsupportedCouplingRecorded: true,
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(uncertainty.unsupportedCouplingRecorded).toBe(true);
  });

  test("versioned ontology mappings require review for exact relation", () => {
    const spec = seedFixtureSpec();
    expect(() =>
      draftVersionedOntologyMapping({
        id: "hsi-csol-ont-exact-no-review",
        ontologySpec: spec,
        fromSystem: "MONDO",
        fromValue: "MONDO:0005100",
        toSystem: "UBERON",
        toValue: "UBERON:0002048",
        relation: "exact",
        mappingVersion: "0.1.0",
        mappingOutcome: "supported",
        sourceRef: "fixture://ontology/mapping-1",
        authoredByPrincipalId: "agent-hsi-csol-1",
        createdAt: asOf,
      }),
    ).toThrow(/requires human reviewDecisionId/);

    const mapping = draftVersionedOntologyMapping({
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
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(mapping.mappingVersion).toBe("0.1.0");
    expect(mapping.reviewDecisionId).toBeNull();

    const exact = draftVersionedOntologyMapping({
      id: "hsi-csol-ont-exact-1",
      ontologySpec: spec,
      fromSystem: "HGNC",
      fromValue: "HGNC:11766",
      toSystem: "UniProt",
      toValue: "P01137",
      relation: "exact",
      mappingVersion: "0.1.0",
      reviewDecisionId: "review-csol-exact-1",
      mappingOutcome: "supported",
      sourceRef: "fixture://ontology/mapping-exact",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(exact.relation).toBe("exact");
    expect(exact.reviewDecisionId).toBe("review-csol-exact-1");
  });

  test("lifecycle transitions and blocked dataset stay fail-closed", () => {
    const blocked = seedFixtureSpec({
      id: "hsi-csol-spec-blocked-demo",
      displayName: "Blocked cross-scale ontology until authorised dataset",
      scientificQuestion:
        "Blocked scientific path for cross-scale ontology until an authorised clinical dataset is supplied.",
      diseaseContextId: "hsi-hdi-ctx-blocked-demo",
      integratedDiseaseContextId: null,
      longitudinalModellingSpecId: null,
      datasetAvailability: "blocked_no_authorised_clinical_dataset",
    });
    expect(blocked.lifecycle).toBe("blocked_awaiting_authorised_dataset");

    expect(() =>
      transitionCrossScaleOntologySpec({
        spec: blocked,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "researcher-1", actorKind: "human"},
      }),
    ).toThrow(/Illegal lifecycle transition|Cannot accept/);

    const fixture = seedFixtureSpec();
    const underReview = transitionCrossScaleOntologySpec({
      spec: fixture,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-csol-1", actorKind: "ai_agent"},
    });
    expect(() =>
      transitionCrossScaleOntologySpec({
        spec: underReview,
        to: "accepted_with_limitations",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-csol-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Human review required/);

    const accepted = transitionCrossScaleOntologySpec({
      spec: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(accepted.lifecycle).toBe("accepted_with_limitations");
    expect(accepted.reviewedBy?.actorKind).toBe("human");

    expect(() =>
      seedFixtureSpec({
        scientificQuestion: "This claims a live multiscale engine incorrectly.",
      }),
    ).toThrow(/must not diagnose\/prescribe|live twin\/multiscale/);
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const spec = seedFixtureSpec();
    const association = draftCrossScaleEntityMapping({
      id: "hsi-csol-map-store-assoc",
      ontologySpec: spec,
      sourceEntity: molecularEntity({id: "hsi-csol-ent-store-mol"}),
      targetEntity: organEntity({id: "hsi-csol-ent-store-org"}),
      mappingOutcome: "supported",
      couplingStatus: "association_only_not_causal",
      relationshipSummary:
        "Store fixture association-only mapping across scales.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const unsupported = recordUnsupportedCrossScaleCoupling({
      id: "hsi-csol-map-store-unsup",
      ontologySpec: spec,
      sourceEntity: molecularEntity({id: "hsi-csol-ent-store-mol-2"}),
      targetEntity: organEntity({id: "hsi-csol-ent-store-org-2"}),
      couplingStatus: "blocked_no_validated_coupling",
      relationshipSummary:
        "Store fixture blocked coupling recorded explicitly.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const validated = draftCrossScaleEntityMapping({
      id: "hsi-csol-map-store-val",
      ontologySpec: spec,
      sourceEntity: molecularEntity({id: "hsi-csol-ent-store-mol-3"}),
      targetEntity: organEntity({id: "hsi-csol-ent-store-org-3"}),
      mappingOutcome: "supported",
      couplingStatus: "validated_coupling",
      relationshipSummary:
        "Store fixture validated coupling for model linkage research.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const context = draftBiologicalContextAnnotation({
      id: "hsi-csol-ctx-store-1",
      ontologySpec: spec,
      entity: molecularEntity({id: "hsi-csol-ent-store-mol"}),
      contextSummary: "Store biological context annotation.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const provenance = draftCrossScaleEvidenceProvenance({
      id: "hsi-csol-prv-store-1",
      ontologySpec: spec,
      subjectRecordId: association.id,
      provenanceKind: "curated_kg_ref_declared",
      sourceRef: "fixture://kg/store-1",
      evidenceSummary: "Store evidence provenance declaration.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const temporal = draftCrossScaleTemporalContext({
      id: "hsi-csol-tmp-store-1",
      ontologySpec: spec,
      subjectRecordId: association.id,
      temporalContextKind: "snapshot_at_time",
      snapshotTime: "2024-03-10T12:00:00.000Z",
      temporalSummary: "Store temporal snapshot context.",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const linkage = draftCrossScaleModelLinkage({
      id: "hsi-csol-lnk-store-1",
      ontologySpec: spec,
      entityMapping: validated,
      sourceModelRef: "fixture-store-mol-model",
      targetModelRef: "fixture-store-organ-model",
      linkageSummary: "Store model linkage after validated coupling.",
      limitations: [
        "Store fixture linkage only.",
        "M11 multiscale engine remains absent.",
      ],
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const uncertainty = draftCrossScaleRelationshipUncertainty({
      id: "hsi-csol-unc-store-1",
      ontologySpec: spec,
      subjectRecordId: unsupported.id,
      uncertaintyOrdinal: "insufficient",
      uncertaintySummary: "Store relationship uncertainty for unsupported coupling.",
      unsupportedCouplingRecorded: true,
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const ontologyMapping = draftVersionedOntologyMapping({
      id: "hsi-csol-ont-store-1",
      ontologySpec: spec,
      fromSystem: "GO",
      fromValue: "GO:0007179",
      toSystem: "Reactome",
      toValue: "R-HSA-170834",
      relation: "related",
      mappingVersion: "0.1.0",
      mappingOutcome: "supported",
      sourceRef: "fixture://ontology/store-1",
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    const draftBundle = draftCrossScaleLinkageBundle({
      id: "hsi-csol-bnd-store-1",
      displayName: "Fixture store cross-scale linkage bundle",
      ontologySpec: spec,
      bundleVersion: "0.1.0",
      limitations: [
        "Fixture store bundle — research decision support only.",
        "Molecular association is not organ causal effect.",
        "Unsupported couplings recorded explicitly.",
      ],
      entityMappings: [association, unsupported, validated],
      biologicalContexts: [context],
      evidenceProvenance: [provenance],
      temporalContexts: [temporal],
      modelLinkages: [linkage],
      relationshipUncertainties: [uncertainty],
      versionedOntologyMappings: [ontologyMapping],
      authoredByPrincipalId: "agent-hsi-csol-1",
      createdAt: asOf,
    });
    expect(draftBundle.unsupportedCouplingIds).toContain(unsupported.id);
    expect(draftBundle.unsupportedCouplingIds).toContain(association.id);
    expect(draftBundle.liveMultiscaleEngineOperational).toBe(false);

    const underReview = transitionCrossScaleLinkageBundle({
      bundle: draftBundle,
      to: "under_review",
      updatedAt: asOf,
      actor: {principalId: "agent-hsi-csol-1", actorKind: "ai_agent"},
    });
    const bundle = transitionCrossScaleLinkageBundle({
      bundle: underReview,
      to: "accepted_with_limitations",
      updatedAt: asOf,
      actor: {principalId: "researcher-1", actorKind: "human"},
    });
    expect(bundle.lifecycle).toBe("accepted_with_limitations");
    expect(fingerprintCrossScaleLinkageBundle(bundle)).toMatch(/^[a-f0-9]{64}$/);

    const store = createMemoryCrossScaleOntologyStore();
    store.upsertSpec(spec);
    store.upsertEntityMapping(association);
    store.upsertEntityMapping(unsupported);
    store.upsertEntityMapping(validated);
    store.upsertBiologicalContext(context);
    store.upsertEvidenceProvenance(provenance);
    store.upsertTemporalContext(temporal);
    store.upsertModelLinkage(linkage);
    store.upsertRelationshipUncertainty(uncertainty);
    store.upsertVersionedOntologyMapping(ontologyMapping);
    store.upsertBundle(bundle);

    expect(store.listSpecs(spec.diseaseContextId)).toHaveLength(1);
    expect(store.listEntityMappings(spec.diseaseContextId)).toHaveLength(3);
    expect(store.listModelLinkages(spec.diseaseContextId)).toHaveLength(1);
    expect(store.listBundles(spec.diseaseContextId)).toHaveLength(1);

    const lines = projectCrossScaleOntologyPersistenceLines({
      specs: [spec],
      entityMappings: [association, unsupported, validated],
      biologicalContexts: [context],
      evidenceProvenance: [provenance],
      temporalContexts: [temporal],
      modelLinkages: [linkage],
      relationshipUncertainties: [uncertainty],
      versionedOntologyMappings: [ontologyMapping],
      bundles: [bundle],
    });
    expect(lines).toContain("molecularAssociationIsNotOrganCausalEffect=true");
    expect(lines).toContain(
      "crossScaleModelLinkageRequiresValidatedCoupling=true",
    );
    expect(lines).toContain(
      "unsupportedCouplingsMustBeRecordedExplicitly=true",
    );
    expect(lines).toContain("noLiveMultiscaleEngineClaim=true");
    expect(lines).toContain("noInventedSimulationParameters=true");
    expect(lines).toContain("neon=red-wave-only");
    expect(lines).toContain("unsupportedCouplingsRecorded=2");

    const pack = buildCrossScaleOntologyPack({
      specs: [spec],
      entityMappings: [association, unsupported, validated],
      biologicalContexts: [context],
      evidenceProvenance: [provenance],
      temporalContexts: [temporal],
      modelLinkages: [linkage],
      relationshipUncertainties: [uncertainty],
      versionedOntologyMappings: [ontologyMapping],
      bundles: [bundle],
      asOf,
    });
    expect(pack.biologicalScaleCount).toBe(7);
    expect(pack.capabilityKindCount).toBe(7);
    expect(pack.unsupportedCouplingCount).toBe(2);
    expect(pack.honesty.notDigitalTwinProduct).toBe(true);
  });
});
