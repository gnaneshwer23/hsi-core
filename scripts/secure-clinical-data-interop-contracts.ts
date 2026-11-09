/**
 * Milestone 14 / PR2 — secure clinical data interoperability pack check.
 * Offline contracts only — no live PHI, connectors, or fabricated results.
 */
import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {
  buildSecureClinicalInteropPack,
  draftDataQualityValidation,
  draftDataSourceRegistration,
  draftDataUsePermission,
  draftInteropGovernance,
  draftRetentionDeletion,
  draftSchemaMapping,
  draftSourceProvenance,
  draftTemporalAlignment,
  draftTerminologyMapping,
  draftUnitNormalisation,
  enforceAccess,
  projectSecureClinicalInteropPersistenceLines,
  SECURE_CLINICAL_INTEROP_METHOD,
  SECURE_CLINICAL_INTEROP_SCHEMA,
  SECURE_CLINICAL_INTEROP_VERSION,
  transitionDataSourceRegistration,
} from "../src/secureClinicalDataInteropContracts";

const asOf = "2026-11-09T20:00:00.000Z";
const outDir = "evaluation/secure-clinical-data-interop";

function fixturePack() {
  const blocked = draftDataSourceRegistration({
    id: "hsi-scdi-src-blocked-demo",
    displayName: "Blocked authorised clinical dataset source",
    sourceKind: "research_dataset_schema",
    schemaProfile: "Authorised research dataset — not supplied",
    connectorStatus: "blocked_no_authorised_dataset",
    permittedPurposes: ["awaiting_authorised_dataset"],
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });

  const fhirDraft = draftDataSourceRegistration({
    id: "hsi-scdi-src-fhir-r4-demo",
    displayName: "Fixture HL7 FHIR R4 Observation mapping source",
    sourceKind: "hl7_fhir_r4",
    schemaProfile: "FHIR R4 Observation contract mapping (fixture)",
    connectorStatus: "fixture_mapping",
    permittedPurposes: ["engineering_fixture_mapping"],
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
    orgId: "org-fixture-1",
    rweStudyId: "hsi-rwe-study-fixture-demo",
  });
  const fhir = transitionDataSourceRegistration({
    source: fhirDraft,
    to: "registered",
    updatedAt: asOf,
    actor: {principalId: "fixture-researcher", actorKind: "human"},
  });

  const omop = draftDataSourceRegistration({
    id: "hsi-scdi-src-omop-cdm-demo",
    displayName: "Fixture OMOP CDM mapping source",
    sourceKind: "omop_cdm",
    schemaProfile: "OMOP CDM v5.4 contract mapping (fixture)",
    connectorStatus: "contract_only",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });

  const permission = draftDataUsePermission({
    id: "hsi-scdi-perm-fixture-demo",
    dataSource: fhir,
    legalBasis: "fixture_engineering",
    purpose: "Fixture interop mapping exercise",
    purposeLimitation: "Engineering fixtures only",
    permissions: [
      "register_source",
      "map_schema",
      "map_terminology",
      "normalise_units",
      "align_temporal",
      "validate_quality",
      "read_provenance",
      "retain_or_delete",
    ],
    dataMinimisationStatement: "Pseudonymous/fixture refs only",
    exportRestrictions: "Fixture JSON only; no PHI export",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });

  const schemaMap = draftSchemaMapping({
    id: "hsi-scdi-sch-fixture-demo",
    dataSource: fhir,
    sourceFieldPath: "Observation.valueQuantity.value",
    targetModel: "hsi_rwe_observation",
    targetFieldPath: "measurementValue",
    mappingConfidence: "narrower",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const termMap = draftTerminologyMapping({
    id: "hsi-scdi-trm-fixture-demo",
    dataSource: fhir,
    sourceSystem: "loinc",
    sourceCode: "1988-5",
    targetSystem: "hsi_concept",
    targetCode: "concept.crp.fixture",
    mappingConfidence: "exact",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const unit = draftUnitNormalisation({
    id: "hsi-scdi-unt-fixture-demo",
    dataSource: fhir,
    sourceUnit: "mg/dL",
    targetUnit: "mg/L",
    conversionFactorDeclared: "10",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const temporal = draftTemporalAlignment({
    id: "hsi-scdi-tmp-fixture-demo",
    dataSource: fhir,
    sourceTimezone: "UTC",
    targetTimezone: "UTC",
    eventTimeField: "Observation.effectiveDateTime",
    observationTimeField: "observationTime",
    alignmentRule: "Map effectiveDateTime to observationTime when present",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const quality = draftDataQualityValidation({
    id: "hsi-scdi-qty-fixture-demo",
    dataSource: fhir,
    checksPerformed: [
      "required_fields_present",
      "no_identifiable_phi_fields",
      "connector_status_honest",
    ],
    qualityStatus: "passed_declared_checks",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const provenance = draftSourceProvenance({
    id: "hsi-scdi-prv-fixture-demo",
    dataSource: fhir,
    provenanceSummary: "Fixture FHIR Observation mapping pack provenance",
    upstreamSystem: "engineering_fixture_pack",
    capturedAt: asOf,
    lineageRefs: ["fixture-pack-v0"],
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const access = enforceAccess({
    id: "hsi-scdi-acs-fixture-demo",
    dataSource: fhir,
    permission,
    requestedPermission: "map_schema",
    actor: {principalId: "fixture-researcher", actorKind: "human"},
    createdAt: asOf,
  });
  const retention = draftRetentionDeletion({
    id: "hsi-scdi-rtn-fixture-demo",
    dataSource: fhir,
    retentionPolicyRef: "policy-fixture-engineering-v0",
    retentionAction: "retain_under_policy",
    retainUntil: "2027-11-09T20:00:00.000Z",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
  });
  const governance = draftInteropGovernance({
    id: "hsi-scdi-gov-fixture-demo",
    dataSource: fhir,
    legalBasis: "fixture_engineering",
    controllerRole: "fixture_only",
    processorRole: "fixture_only",
    controllerName: "HSI fixture controller",
    processorName: "HSI fixture processor",
    purposeLimitation: "Engineering mapping contracts only",
    accessPermissions: [
      "map_schema",
      "map_terminology",
      "read_provenance",
      "retain_or_delete",
    ],
    dataMinimisationStatement:
      "No identifiable patient fields; pseudonymised may still be personal data",
    exportRestrictions: "No unrestricted clinical export",
    retentionPolicyRef: "policy-fixture-engineering-v0",
    authoredByPrincipalId: "fixture-agent-scdi",
    createdAt: asOf,
    auditHistory: ["governance draft created", "fixture honesty asserted"],
  });

  const pack = buildSecureClinicalInteropPack({
    dataSources: [blocked, fhir, omop],
    permissions: [permission],
    schemaMappings: [schemaMap],
    terminologyMappings: [termMap],
    unitNormalisations: [unit],
    temporalAlignments: [temporal],
    qualityValidations: [quality],
    provenance: [provenance],
    accessEnforcements: [access],
    retentions: [retention],
    governance: [governance],
    asOf,
  });
  const persistenceLines = projectSecureClinicalInteropPersistenceLines({
    dataSource: fhir,
    permissions: [permission],
    schemaMappings: [schemaMap],
    terminologyMappings: [termMap],
    unitNormalisations: [unit],
    temporalAlignments: [temporal],
    qualityValidations: [quality],
    provenance: [provenance],
    accessEnforcements: [access],
    retentions: [retention],
    governance: [governance],
  });

  return {pack, persistenceLines, blocked, access};
}

function writeOutputs() {
  mkdirSync(outDir, {recursive: true});
  const {pack, persistenceLines, blocked, access} = fixturePack();
  writeFileSync(
    join(outDir, "secure-clinical-data-interop-pack.v1.json"),
    `${JSON.stringify(pack, null, 2)}\n`,
  );
  writeFileSync(
    join(outDir, "STATUS.json"),
    `${JSON.stringify(
      {
        schema: SECURE_CLINICAL_INTEROP_SCHEMA,
        method: SECURE_CLINICAL_INTEROP_METHOD,
        version: SECURE_CLINICAL_INTEROP_VERSION,
        asOf,
        status: "engineering_fixture_ok",
        scientificApproval: false,
        liveConnectorOperational: false,
        federationOperational: false,
        authorisedDatasetBlocked: blocked.connectorStatus,
        unrestrictedCentralPatientDatabase: false,
        livePhiIngestion: false,
        ehrWriteBackOrCds: false,
        pseudonymisedMayStillBePersonalData: true,
        fabricatedClinicalResults: false,
        workbenchUi: false,
        accessDecision: access.decision,
        neonProjectPolicy: "red-wave-only",
        migration: "deferred",
        dependsOnPr1: "#111",
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
  const {pack, blocked, access} = fixturePack();
  if (pack.dataSourceCount !== 3 || pack.governanceCount !== 1) {
    throw new Error("Secure clinical data interop pack check failed");
  }
  if (pack.honesty.noLivePhiIngestion !== true) {
    throw new Error("Honesty gate failed");
  }
  if (pack.honesty.noLiveConnectorClaimWithoutVerification !== true) {
    throw new Error("Live connector honesty gate failed");
  }
  if (blocked.connectorStatus !== "blocked_no_authorised_dataset") {
    throw new Error("Dataset blocker must remain declared");
  }
  if (access.decision !== "permit") {
    throw new Error("Fixture access permit expected");
  }
  console.log(
    `secure-clinical-data-interop-contracts check ok (${pack.dataSourceCount} sources, ${pack.schemaMappingCount} schema maps, ${pack.terminologyMappingCount} term maps; live connectors=false)`,
  );
} else {
  writeOutputs();
  console.log(`Wrote ${outDir}/secure-clinical-data-interop-pack.v1.json`);
}
