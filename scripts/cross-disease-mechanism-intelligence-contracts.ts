/**
 * Milestone 16 / PR2 — cross-disease mechanism intelligence pack check.
 * Offline contracts only — no PHI, auto-transfer, causal proof, or UI.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  CDMI_MECHANISM_CLASSIFICATIONS,
  CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
  CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
  CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
  buildCrossDiseaseMechanismIntelligencePack,
  draftApprovedMechanismRetrieval,
  draftCellTissueContextComparison,
  draftComparativeMechanismProfile,
  draftDirectionalityEvaluation,
  draftDiseaseComparisonDefinition,
  draftDiseaseIdentifierResolution,
  draftDiseaseSpecificDifferenceIdentification,
  draftOpposingEvidenceRetrieval,
  draftSharedMolecularOverlap,
  draftSupportingEvidenceRetrieval,
  projectCrossDiseaseMechanismIntelligencePersistenceLines,
  transitionComparativeMechanismProfile,
} from "../src/crossDiseaseMechanismIntelligenceContracts";

const asOf = "2026-11-09T15:00:00.000Z";
const outDir = "evaluation/cross-disease-mechanism-intelligence";

const fixtureContext = {
  species: "Homo sapiens",
  tissue: "synovial tissue",
  cellState: "activated fibroblast-like synoviocyte fixture state",
  diseaseStage: "established disease fixture stage",
  experimentalContext: "fixture bulk RNA-seq association context",
};

function fixturePack() {
  const blockedComparison = draftDiseaseComparisonDefinition({
    id: "hsi-cdmi-def-blocked-demo",
    displayName: "Blocked comparison until authorised dataset",
    scientificQuestion:
      "Blocked scientific path until an authorised research dataset is supplied.",
    investigationId: "hsi-hsys-inv-blocked-demo",
    diseaseContextIds: [
      "hsi-hdi-ctx-blocked-a",
      "hsi-hdi-ctx-blocked-b",
    ],
    datasetAvailability: "blocked_no_authorised_clinical_dataset",
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const comparison = draftDiseaseComparisonDefinition({
    id: "hsi-cdmi-def-ssc-ra-demo",
    displayName: "Fixture SSc–RA mechanism comparison",
    scientificQuestion:
      "Which fixture shared molecular associations and disease-specific differences can be reviewed without claiming shared causal mechanisms or auto-transfer?",
    investigationId: "hsi-hsys-inv-ssc-ra-fixture",
    diseaseContextIds: [
      "hsi-hdi-ctx-ssc-fixture",
      "hsi-hdi-ctx-ra-fixture",
    ],
    datasetAvailability: "fixture_only",
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const resSsc = draftDiseaseIdentifierResolution({
    id: "hsi-cdmi-res-ssc-demo",
    comparison,
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    resolvedIdentifier: "ontology:disease:SSC-FIXTURE",
    resolutionStatus: "resolved_fixture",
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });
  const resRa = draftDiseaseIdentifierResolution({
    id: "hsi-cdmi-res-ra-demo",
    comparison,
    diseaseContextId: "hsi-hdi-ctx-ra-fixture",
    resolvedIdentifier: "ontology:disease:RA-FIXTURE",
    resolutionStatus: "resolved_fixture",
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const mechSsc = draftApprovedMechanismRetrieval({
    id: "hsi-cdmi-mech-il6-ssc-demo",
    comparison,
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    mechanismLabel: "Fixture IL6 signalling association in SSc context",
    approvalScope: "fixture_approved_declared",
    experimentalContext: fixtureContext,
    optionalPr1MechanismRelationshipId: "hsi-hsys-cmr-gene-fixture",
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });
  const mechRa = draftApprovedMechanismRetrieval({
    id: "hsi-cdmi-mech-il6-ra-demo",
    comparison,
    diseaseContextId: "hsi-hdi-ctx-ra-fixture",
    mechanismLabel: "Fixture IL6 signalling association in RA context",
    approvalScope: "fixture_approved_declared",
    experimentalContext: {
      ...fixtureContext,
      tissue: "peripheral blood",
    },
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const geneOverlap = draftSharedMolecularOverlap({
    id: "hsi-cdmi-mol-ifn-gene-demo",
    comparison,
    diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
    diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
    entityKind: "gene",
    entityLabel: "FIXTURE_IFN_GENE",
    mechanismClassification: "shared_molecular_association",
    experimentalContext: fixtureContext,
    approvedMechanisms: [mechSsc, mechRa],
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });
  const pathwayOverlap = draftSharedMolecularOverlap({
    id: "hsi-cdmi-mol-jak-stat-demo",
    comparison,
    diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
    diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
    entityKind: "pathway",
    entityLabel: "Fixture JAK-STAT pathway involvement",
    mechanismClassification: "shared_pathway_involvement",
    experimentalContext: fixtureContext,
    approvedMechanisms: [mechSsc, mechRa],
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const context = draftCellTissueContextComparison({
    id: "hsi-cdmi-ctx-synovium-blood-demo",
    comparison,
    diseaseContextIdA: "hsi-hdi-ctx-ssc-fixture",
    diseaseContextIdB: "hsi-hdi-ctx-ra-fixture",
    contextSummary:
      "Fixture SSc synovial vs RA blood contexts differ — context-dependent, not auto-transferable.",
    contextA: fixtureContext,
    contextB: {
      ...fixtureContext,
      tissue: "peripheral blood",
      cellState: "circulating immune cell fixture state",
    },
    contextsComparable: false,
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const support = draftSupportingEvidenceRetrieval({
    id: "hsi-cdmi-sup-ifn-demo",
    comparison,
    relatedOverlapOrMechanismId: geneOverlap.id,
    evidenceSummary:
      "Fixture supporting association for shared interferon gene label — not causal proof.",
    evidenceRef: "fixture:evidence:support:ifn-demo",
    experimentalContext: fixtureContext,
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });
  const oppose = draftOpposingEvidenceRetrieval({
    id: "hsi-cdmi-opp-ifn-demo",
    comparison,
    relatedOverlapOrMechanismId: geneOverlap.id,
    evidenceSummary:
      "Fixture opposing association in alternate tissue context — polarity preserved.",
    evidenceRef: "fixture:evidence:oppose:ifn-demo",
    experimentalContext: {
      ...fixtureContext,
      tissue: "skin biopsy",
    },
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const direction = draftDirectionalityEvaluation({
    id: "hsi-cdmi-dir-mixed-demo",
    comparison,
    directionalityOrdinal: "context_dependent_direction_declared",
    evaluationSummary:
      "Fixture directionality is context-dependent across tissues — not proven causation.",
    supportingEvidence: [support],
    opposingEvidence: [oppose],
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const difference = draftDiseaseSpecificDifferenceIdentification({
    id: "hsi-cdmi-diff-ssc-fibrosis-demo",
    comparison,
    diseaseContextId: "hsi-hdi-ctx-ssc-fixture",
    differenceSummary:
      "Fixture SSc-specific fibrosis-associated difference — not auto-transferred to RA.",
    mechanismClassification: "disease_specific",
    experimentalContext: {
      ...fixtureContext,
      tissue: "dermal fibroblast niche",
      diseaseStage: "fibrotic stage fixture",
    },
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const draft = draftComparativeMechanismProfile({
    id: "hsi-cdmi-cmp-ssc-ra-demo",
    displayName: "Fixture SSc–RA comparative mechanism profile",
    comparison,
    identifierResolutions: [resSsc, resRa],
    approvedMechanisms: [mechSsc, mechRa],
    sharedOverlaps: [geneOverlap, pathwayOverlap],
    contextComparisons: [context],
    supportingEvidence: [support],
    opposingEvidence: [oppose],
    directionalityEvaluations: [direction],
    diseaseSpecificDifferences: [difference],
    primaryMechanismClassification: "shared_molecular_association",
    profileVersion: "0.1.0",
    limitations: [
      "Shared gene association is not a shared causal mechanism.",
      "Pathway enrichment is not pathway activation.",
      "Auto-transfer of mechanisms across diseases is forbidden.",
      "Species, tissue, cell state, disease stage, and experimental context are preserved.",
      "Fixture profile only — not scientific validation.",
    ],
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });
  const underReview = transitionComparativeMechanismProfile({
    profile: draft,
    to: "under_review",
    updatedAt: asOf,
    actor: {principalId: "fixture-agent-cdmi", actorKind: "ai_agent"},
  });
  const accepted = transitionComparativeMechanismProfile({
    profile: underReview,
    to: "accepted_with_limitations",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const blockedProfile = draftComparativeMechanismProfile({
    id: "hsi-cdmi-cmp-blocked-demo",
    displayName: "Blocked comparative mechanism profile",
    comparison: blockedComparison,
    identifierResolutions: [],
    approvedMechanisms: [],
    sharedOverlaps: [],
    contextComparisons: [],
    supportingEvidence: [],
    opposingEvidence: [],
    directionalityEvaluations: [],
    diseaseSpecificDifferences: [],
    primaryMechanismClassification: "unvalidated_mechanistic_hypothesis",
    profileVersion: "0.1.0",
    limitations: [
      "Blocked awaiting authorised research dataset — not scientific validation.",
      "Shared gene association is not a shared causal mechanism.",
      "Auto-transfer of mechanisms across diseases is forbidden.",
    ],
    authoredByPrincipalId: "fixture-agent-cdmi",
    createdAt: asOf,
  });

  const comparisonDefinitions = [blockedComparison, comparison];
  const pack = buildCrossDiseaseMechanismIntelligencePack({
    comparisonDefinitions,
    identifierResolutions: [resSsc, resRa],
    approvedMechanismRetrievals: [mechSsc, mechRa],
    sharedMolecularOverlaps: [geneOverlap, pathwayOverlap],
    cellTissueContextComparisons: [context],
    supportingEvidenceRetrievals: [support],
    opposingEvidenceRetrievals: [oppose],
    directionalityEvaluations: [direction],
    diseaseSpecificDifferences: [difference],
    comparativeMechanismProfiles: [blockedProfile, accepted],
    asOf,
  });
  const persistenceLines =
    projectCrossDiseaseMechanismIntelligencePersistenceLines({
      comparisonDefinitions,
      identifierResolutions: [resSsc, resRa],
      approvedMechanismRetrievals: [mechSsc, mechRa],
      sharedMolecularOverlaps: [geneOverlap, pathwayOverlap],
      cellTissueContextComparisons: [context],
      supportingEvidenceRetrievals: [support],
      opposingEvidenceRetrievals: [oppose],
      directionalityEvaluations: [direction],
      diseaseSpecificDifferences: [difference],
      comparativeMechanismProfiles: [blockedProfile, accepted],
    });

  return {pack, persistenceLines, blockedComparison};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blockedComparison} = fixturePack();
  writeFileSync(
    join(outDir, "cross-disease-mechanism-intelligence-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: CROSS_DISEASE_MECHANISM_INTELLIGENCE_SCHEMA,
        method: CROSS_DISEASE_MECHANISM_INTELLIGENCE_METHOD,
        version: CROSS_DISEASE_MECHANISM_INTELLIGENCE_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        datasetAvailabilityBlocked:
          blockedComparison.datasetAvailability ===
          "blocked_no_authorised_clinical_dataset",
        scientificPathBlockedNoAuthorisedDataset: true,
        sharedGeneIsNotSharedCausalMechanism: true,
        pathwayEnrichmentIsNotActivation: true,
        noAutoTransferOfMechanismsAcrossDiseases: true,
        experimentalContextMustBePreserved: true,
        mechanismClassificationCount: CDMI_MECHANISM_CLASSIFICATIONS.length,
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
  const {pack, blockedComparison} = fixturePack();
  if (
    pack.comparisonDefinitionCount !== 2 ||
    pack.identifierResolutionCount !== 2 ||
    pack.approvedMechanismRetrievalCount !== 2 ||
    pack.sharedMolecularOverlapCount !== 2 ||
    pack.cellTissueContextComparisonCount !== 1 ||
    pack.supportingEvidenceRetrievalCount !== 1 ||
    pack.opposingEvidenceRetrievalCount !== 1 ||
    pack.directionalityEvaluationCount !== 1 ||
    pack.diseaseSpecificDifferenceCount !== 1 ||
    pack.comparativeMechanismProfileCount !== 2 ||
    pack.mechanismClassificationCount !== 7
  ) {
    throw new Error("Cross-disease mechanism intelligence pack check failed");
  }
  if (pack.honesty.sharedGeneIsNotSharedCausalMechanism !== true) {
    throw new Error("Shared gene≠causal honesty gate failed");
  }
  if (pack.honesty.pathwayEnrichmentIsNotActivation !== true) {
    throw new Error("Pathway enrichment≠activation honesty gate failed");
  }
  if (pack.honesty.noAutoTransferOfMechanismsAcrossDiseases !== true) {
    throw new Error("No auto-transfer honesty gate failed");
  }
  if (pack.honesty.experimentalContextMustBePreserved !== true) {
    throw new Error("Experimental context preservation honesty gate failed");
  }
  if (
    blockedComparison.datasetAvailability !==
    "blocked_no_authorised_clinical_dataset"
  ) {
    throw new Error("Dataset blocker must remain declared");
  }
  console.log(
    `cross-disease-mechanism-intelligence-contracts check ok (${pack.comparisonDefinitionCount} comparisons, ${pack.comparativeMechanismProfileCount} profiles, ${pack.mechanismClassificationCount} classifications; dataset blocked declared)`,
  );
} else {
  writeOutputs();
  console.log(
    `Wrote ${outDir}/cross-disease-mechanism-intelligence-pack.v1.json`,
  );
}
