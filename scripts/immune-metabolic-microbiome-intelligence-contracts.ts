/**
 * Milestone 16 / PR4 — immune–metabolic–microbiome intelligence pack check.
 * Offline contracts only — no PHI, composition→causality, animal→human auto
 * translation, unsupported complete chains, or UI.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  IMMI_AXIS_BANDS,
  IMMI_CAPABILITY_KINDS,
  IMMI_EVIDENCE_DISTINCTIONS,
  IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
  IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
  IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
  buildImmuneMetabolicMicrobiomeIntelligencePack,
  draftDiseaseContextComparison,
  draftEvidenceContradictionAnalysis,
  draftGutImmuneMetabolicGraphScope,
  draftImmuneMetabolicMicrobiomeProfile,
  draftImmuneVsMetabolicPathwayComparison,
  draftInflammationMetabolicPhenotypeRelationship,
  draftMetaboliteHostInteraction,
  draftMicrobialFunctionHostPathwayMapping,
  projectImmuneMetabolicMicrobiomeIntelligencePersistenceLines,
  transitionImmuneMetabolicMicrobiomeProfile,
} from "../src/immuneMetabolicMicrobiomeIntelligenceContracts";

const asOf = "2026-11-09T17:00:00.000Z";
const outDir = "evaluation/immune-metabolic-microbiome-intelligence";

const immunePathway = {
  id: "hsi-immi-ent-il6-pathway-demo",
  label: "Fixture IL6 immune pathway association",
  axisBand: "immune" as const,
  ontologySystem: "ontology:pathway",
  ontologyValue: "IL6-IMMUNE-FIXTURE",
  note: "",
};

const metabolicPathway = {
  id: "hsi-immi-ent-scfa-pathway-demo",
  label: "Fixture SCFA metabolic pathway association",
  axisBand: "metabolic" as const,
  ontologySystem: "ontology:pathway",
  ontologyValue: "SCFA-METABOLIC-FIXTURE",
  note: "",
};

const metabolite = {
  id: "hsi-immi-ent-butyrate-demo",
  label: "Fixture butyrate metabolite",
  axisBand: "metabolic" as const,
  ontologySystem: "ontology:metabolite",
  ontologyValue: "BUTYRATE-FIXTURE",
  note: "",
};

const hostTreg = {
  id: "hsi-immi-ent-colonic-treg-demo",
  label: "Fixture colonic Treg host response",
  axisBand: "immune" as const,
  ontologySystem: "ontology:cell",
  ontologyValue: "TREG-FIXTURE",
  note: "",
};

const microbialTaxon = {
  id: "hsi-immi-ent-clostridia-demo",
  label: "Fixture Clostridia taxonomic association",
  axisBand: "microbiome" as const,
  ontologySystem: "ontology:taxon",
  ontologyValue: "CLOSTRIDIA-FIXTURE",
  note: "",
};

const hostPathway = {
  id: "hsi-immi-ent-foxp3-pathway-demo",
  label: "Fixture Foxp3 host pathway",
  axisBand: "host_pathway" as const,
  ontologySystem: "ontology:pathway",
  ontologyValue: "FOXP3-HOST-FIXTURE",
  note: "",
};

const inflammation = {
  id: "hsi-immi-ent-colonic-inflam-demo",
  label: "Fixture colonic inflammation phenotype",
  axisBand: "inflammation_phenotype" as const,
  ontologySystem: "ontology:phenotype",
  ontologyValue: "COLONIC-INFLAM-FIXTURE",
  note: "",
};

function fixturePack() {
  const blockedScope = draftGutImmuneMetabolicGraphScope({
    id: "hsi-immi-scp-blocked-demo",
    displayName: "Blocked gut–immune–metabolic scope until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    coveredAxisBands: ["immune", "metabolic", "microbiome"],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const scope = draftGutImmuneMetabolicGraphScope({
    id: "hsi-immi-scp-gut-immune-metabolic-demo",
    displayName: "Fixture gut–immune–metabolic graph scope",
    scientificQuestion:
      "Which fixture immune–metabolic–microbiome associations can be reviewed without equating composition correlations with causality, auto-translating animal evidence to human, or completing unsupported gut–immune–metabolic chains?",
    coveredAxisBands: [
      "immune",
      "metabolic",
      "microbiome",
      "inflammation_phenotype",
      "host_pathway",
    ],
    diseaseContextIds: [
      "hsi-hdi-ctx-ibd-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    optionalCsbrScopeId: "hsi-csbr-scp-physio-fixture",
    optionalHsysOrganSystemRelationshipId: "hsi-hsys-osr-gut-immune",
    optionalCdmiComparativeProfileId: "hsi-cdmi-cmp-ibd-ra-fixture",
    optionalGutImmunePackSchema: "hsi-gut-immune-pack-1",
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const comparison = draftImmuneVsMetabolicPathwayComparison({
    id: "hsi-immi-ipc-il6-scfa-demo",
    scope,
    immunePathwayEntity: immunePathway,
    metabolicPathwayEntity: metabolicPathway,
    comparisonOutcome: "context_dependent_declared",
    evidenceDistinction: "host_molecular_response",
    comparisonSummary:
      "Fixture IL6 vs SCFA pathway comparison — overlap is context-dependent and not causal from composition alone.",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const interaction = draftMetaboliteHostInteraction({
    id: "hsi-immi-mhi-butyrate-treg-demo",
    scope,
    metaboliteEntity: metabolite,
    hostEntity: hostTreg,
    interactionKind: "experimental_effect_declared",
    evidenceDistinction: "experimental_causal_evidence",
    translationStatus: "animal_only_declared",
    interactionSummary:
      "Fixture butyrate→colonic Treg experimental association in animal models — not automatic human translation.",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const mapping = draftMicrobialFunctionHostPathwayMapping({
    id: "hsi-immi-mfm-scfa-foxp3-demo",
    scope,
    microbialEntity: microbialTaxon,
    hostPathwayEntity: hostPathway,
    mappingOutcome: "supported",
    evidenceDistinction: "microbial_functional_evidence",
    chainStatus: "chain_partial_supported_links_only",
    mappingSummary:
      "Fixture microbial functional evidence linked to host Foxp3 pathway — partial chain only.",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const inflamMet = draftInflammationMetabolicPhenotypeRelationship({
    id: "hsi-immi-imp-inflam-scfa-demo",
    scope,
    inflammationEntity: inflammation,
    metabolicPhenotypeEntity: metabolicPathway,
    mappingOutcome: "uncertain",
    evidenceDistinction: "human_observational_association",
    relationshipSummary:
      "Fixture inflammation–metabolic phenotype observational association — composition correlation is not causality.",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const diseaseCmp = draftDiseaseContextComparison({
    id: "hsi-immi-dcc-ibd-ra-demo",
    scope,
    diseaseContextIds: [
      "hsi-hdi-ctx-ibd-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    comparisonOutcome: "divergence_declared",
    evidenceDistinction: "human_observational_association",
    comparisonSummary:
      "Fixture IBD vs RA gut–immune–metabolic disease-context comparison — no auto-transfer.",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const contradiction = draftEvidenceContradictionAnalysis({
    id: "hsi-immi-eca-th17-competing-demo",
    scope,
    relatedRecordIds: [comparison.id, inflamMet.id],
    contradictionStatus: "competing_evidence_declared",
    evidenceDistinctionsCompared: [
      "experimental_causal_evidence",
      "human_observational_association",
    ],
    analysisSummary:
      "Fixture competing evidence retained as distinct distinctions — not collapsed.",
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  const blockedProfile = draftImmuneMetabolicMicrobiomeProfile({
    id: "hsi-immi-prf-blocked-demo",
    displayName: "Blocked immune–metabolic–microbiome profile",
    scope: blockedScope,
    immuneVsMetabolicPathwayComparisons: [],
    metaboliteHostInteractions: [],
    microbialFunctionHostPathwayMappings: [],
    inflammationMetabolicPhenotypeRelationships: [],
    diseaseContextComparisons: [],
    evidenceContradictionAnalyses: [],
    profileVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Composition correlations are not causality.",
      "Animal evidence is not automatic human translation.",
    ],
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });

  let accepted = draftImmuneMetabolicMicrobiomeProfile({
    id: "hsi-immi-prf-reviewable-demo",
    displayName: "Reviewable immune–metabolic–microbiome profile",
    scope,
    immuneVsMetabolicPathwayComparisons: [comparison],
    metaboliteHostInteractions: [interaction],
    microbialFunctionHostPathwayMappings: [mapping],
    inflammationMetabolicPhenotypeRelationships: [inflamMet],
    diseaseContextComparisons: [diseaseCmp],
    evidenceContradictionAnalyses: [contradiction],
    profileVersion: "0.1.0",
    limitations: [
      "Fixtures are not scientific validation.",
      "Composition correlations are not causality.",
      "Animal evidence is not automatic human translation.",
      "Unsupported links must not complete gut–immune–metabolic chains.",
      "Evidence distinctions must not collapse.",
    ],
    authoredByPrincipalId: "fixture-agent-immi",
    createdAt: asOf,
  });
  accepted = transitionImmuneMetabolicMicrobiomeProfile({
    profile: accepted,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-human-reviewer", actorKind: "human"},
  });
  accepted = transitionImmuneMetabolicMicrobiomeProfile({
    profile: accepted,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-human-reviewer", actorKind: "human"},
  });

  const gutImmuneMetabolicGraphScopes = [blockedScope, scope];
  const pack = buildImmuneMetabolicMicrobiomeIntelligencePack({
    gutImmuneMetabolicGraphScopes,
    immuneVsMetabolicPathwayComparisons: [comparison],
    metaboliteHostInteractions: [interaction],
    microbialFunctionHostPathwayMappings: [mapping],
    inflammationMetabolicPhenotypeRelationships: [inflamMet],
    diseaseContextComparisons: [diseaseCmp],
    evidenceContradictionAnalyses: [contradiction],
    profiles: [blockedProfile, accepted],
    asOf,
  });
  const persistenceLines =
    projectImmuneMetabolicMicrobiomeIntelligencePersistenceLines({
      gutImmuneMetabolicGraphScopes,
      immuneVsMetabolicPathwayComparisons: [comparison],
      metaboliteHostInteractions: [interaction],
      microbialFunctionHostPathwayMappings: [mapping],
      inflammationMetabolicPhenotypeRelationships: [inflamMet],
      diseaseContextComparisons: [diseaseCmp],
      evidenceContradictionAnalyses: [contradiction],
      profiles: [blockedProfile, accepted],
    });

  return {pack, persistenceLines, blockedScope};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedScope} = fixturePack();
  writeFileSync(
    join(outDir, "immune-metabolic-microbiome-intelligence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_SCHEMA,
        method: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_METHOD,
        version: IMMUNE_METABOLIC_MICROBIOME_INTELLIGENCE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedScope.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        compositionCorrelationIsNotCausality: true,
        animalEvidenceIsNotAutomaticHumanTranslation: true,
        unsupportedLinksDoNotCompleteGutImmuneMetabolicChains: true,
        evidenceDistinctionsMustNotCollapse: true,
        axisBandCount: IMMI_AXIS_BANDS.length,
        capabilityKindCount: IMMI_CAPABILITY_KINDS.length,
        evidenceDistinctionCount: IMMI_EVIDENCE_DISTINCTIONS.length,
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
    pack.gutImmuneMetabolicGraphScopeCount !== 2 ||
    pack.immuneVsMetabolicPathwayComparisonCount !== 1 ||
    pack.metaboliteHostInteractionCount !== 1 ||
    pack.microbialFunctionHostPathwayMappingCount !== 1 ||
    pack.inflammationMetabolicPhenotypeRelationshipCount !== 1 ||
    pack.diseaseContextComparisonCount !== 1 ||
    pack.evidenceContradictionAnalysisCount !== 1 ||
    pack.profileCount !== 2 ||
    pack.axisBandCount !== 5 ||
    pack.capabilityKindCount !== 6 ||
    pack.evidenceDistinctionCount !== 6
  ) {
    throw new Error(
      "Immune–metabolic–microbiome intelligence pack check failed",
    );
  }
  if (pack.honesty.compositionCorrelationIsNotCausality !== true) {
    throw new Error("Composition≠causality honesty gate failed");
  }
  if (pack.honesty.animalEvidenceIsNotAutomaticHumanTranslation !== true) {
    throw new Error("Animal≠human translation honesty gate failed");
  }
  if (
    pack.honesty.unsupportedLinksDoNotCompleteGutImmuneMetabolicChains !==
    true
  ) {
    throw new Error("Unsupported-chain honesty gate failed");
  }
  if (pack.honesty.evidenceDistinctionsMustNotCollapse !== true) {
    throw new Error("Evidence distinction honesty gate failed");
  }
  if (pack.honesty.completeUnsupportedChainClaimed !== false) {
    throw new Error("Complete unsupported chain honesty gate failed");
  }
  if (
    blockedScope.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `immune-metabolic-microbiome-intelligence-contracts check ok (${pack.gutImmuneMetabolicGraphScopeCount} scopes, ${pack.profileCount} profiles, ${pack.axisBandCount} axes, ${pack.capabilityKindCount} capabilities, ${pack.evidenceDistinctionCount} distinctions; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/immune-metabolic-microbiome-intelligence-pack.v1.json`,
  );
}
