/**
 * Milestone 14 PR2 — secure clinical data interoperability contract honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  buildSecureClinicalInteropPack,
  checkDataUsePermission,
  createMemorySecureClinicalDataInteropStore,
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
  fingerprintDataSourceRegistration,
  projectSecureClinicalInteropPersistenceLines,
  transitionDataSourceRegistration,
  type DataSourceRegistration,
} from "../src/secureClinicalDataInteropContracts";

const asOf = "2026-11-09T20:00:00.000Z";

function seedFhirFixtureSource(
  overrides?: Partial<Parameters<typeof draftDataSourceRegistration>[0]>,
): DataSourceRegistration {
  return draftDataSourceRegistration({
    id: "hsi-scdi-src-fhir-r4-fixture",
    displayName: "Fixture HL7 FHIR R4 Observation mapping source",
    sourceKind: "hl7_fhir_r4",
    schemaProfile: "FHIR R4 Observation / Condition contract mapping (fixture)",
    connectorStatus: "fixture_mapping",
    permittedPurposes: ["engineering_fixture_mapping", "schema_contract_exercise"],
    authoredByPrincipalId: "agent-hsi-scdi-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    orgId: "org-hsi-fixture-1",
    rweStudyId: "hsi-rwe-study-fixture-demo",
    ...overrides,
  });
}

function seedBlockedSource(): DataSourceRegistration {
  return draftDataSourceRegistration({
    id: "hsi-scdi-src-blocked-clinical",
    displayName: "Blocked authorised clinical dataset source",
    sourceKind: "research_dataset_schema",
    schemaProfile: "Authorised research dataset schema — not supplied",
    connectorStatus: "blocked_no_authorised_dataset",
    permittedPurposes: ["awaiting_authorised_dataset"],
    authoredByPrincipalId: "agent-hsi-scdi-1",
    createdAt: asOf,
  });
}

describe("secure clinical data interop contracts (M14 PR2)", () => {
  test("registers FHIR/OMOP/terminology sources without live connector claims", () => {
    const fhir = seedFhirFixtureSource();
    expect(fhir.liveConnectorOperational).toBe(false);
    expect(fhir.containsIdentifiablePhi).toBe(false);
    expect(fhir.honesty.noLiveConnectorClaimWithoutVerification).toBe(true);
    expect(fhir.honesty.federationNotOperationalUnlessVerified).toBe(true);
    expect(fhir.honesty.pseudonymisedMayStillBePersonalData).toBe(true);
    expect(fhir.honesty.neonProjectPolicy).toBe("red-wave-only");
    expect(fhir.rweStudyId).toBe("hsi-rwe-study-fixture-demo");
    expect(fingerprintDataSourceRegistration(fhir)).toMatch(/^[a-f0-9]{64}$/);

    const omop = draftDataSourceRegistration({
      id: "hsi-scdi-src-omop-cdm-fixture",
      displayName: "Fixture OMOP CDM person/observation contract",
      sourceKind: "omop_cdm",
      schemaProfile: "OMOP CDM v5.4 contract mapping (fixture)",
      connectorStatus: "contract_only",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(omop.lifecycle).toBe("draft");
    expect(omop.connectorStatus).toBe("contract_only");

    expect(() =>
      seedFhirFixtureSource({
        displayName: "Live FHIR connector operational for hospital EHR",
      }),
    ).toThrow(/must not claim live connectors/);
  });

  test("data-use permissions fail closed without legal basis or authorised dataset", () => {
    const blocked = seedBlockedSource();
    const denied = draftDataUsePermission({
      id: "hsi-scdi-perm-blocked-1",
      dataSource: blocked,
      legalBasis: "not_established",
      purpose: "Engineering honesty demonstration",
      purposeLimitation: "No clinical analysis until authorised",
      permissions: ["map_schema", "read_provenance"],
      dataMinimisationStatement: "No identifiable fields accepted",
      exportRestrictions: "No export of clinical rows",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(denied.permitted).toBe(false);
    expect(denied.denyReason).toMatch(/Authorised clinical dataset|Legal basis/);

    const check = checkDataUsePermission({
      permission: denied,
      requestedPermission: "map_schema",
    });
    expect(check.allowed).toBe(false);

    const fhir = seedFhirFixtureSource();
    const permitted = draftDataUsePermission({
      id: "hsi-scdi-perm-fixture-1",
      dataSource: fhir,
      legalBasis: "fixture_engineering",
      purpose: "Fixture schema and terminology mapping exercise",
      purposeLimitation: "Engineering fixtures only — not live care",
      permissions: [
        "register_source",
        "map_schema",
        "map_terminology",
        "normalise_units",
        "align_temporal",
        "validate_quality",
        "read_provenance",
      ],
      dataMinimisationStatement: "Pseudonymous/fixture refs only",
      exportRestrictions: "Fixture JSON only; no PHI export",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(permitted.permitted).toBe(true);
    expect(
      checkDataUsePermission({
        permission: permitted,
        requestedPermission: "export_restricted",
      }).allowed,
    ).toBe(false);
  });

  test("schema, terminology, unit, and temporal mappings stay non-operational", () => {
    const source = seedFhirFixtureSource();
    const schemaMap = draftSchemaMapping({
      id: "hsi-scdi-sch-obs-value",
      dataSource: source,
      sourceFieldPath: "Observation.valueQuantity.value",
      targetModel: "hsi_rwe_observation",
      targetFieldPath: "measurementValue",
      mappingConfidence: "narrower",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(schemaMap.liveTransformOperational).toBe(false);

    const termMap = draftTerminologyMapping({
      id: "hsi-scdi-trm-crp-loinc",
      dataSource: source,
      sourceSystem: "loinc",
      sourceCode: "1988-5",
      targetSystem: "hsi_concept",
      targetCode: "concept.crp.fixture",
      mappingConfidence: "exact",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(termMap.liveLookupOperational).toBe(false);

    const unit = draftUnitNormalisation({
      id: "hsi-scdi-unt-mg-l",
      dataSource: source,
      sourceUnit: "mg/dL",
      targetUnit: "mg/L",
      conversionFactorDeclared: "10",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(unit.conversionVerified).toBe(false);

    const temporal = draftTemporalAlignment({
      id: "hsi-scdi-tmp-obs-event",
      dataSource: source,
      sourceTimezone: "UTC",
      targetTimezone: "UTC",
      eventTimeField: "Observation.effectiveDateTime",
      observationTimeField: "observationTime",
      alignmentRule: "Map effectiveDateTime to observationTime when present",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(temporal.liveAlignmentOperational).toBe(false);
  });

  test("quality validation, provenance, retention, and governance encode privacy honesty", () => {
    const source = seedFhirFixtureSource();
    const quality = draftDataQualityValidation({
      id: "hsi-scdi-qty-fixture-1",
      dataSource: source,
      checksPerformed: [
        "required_fields_present",
        "no_identifiable_phi_fields",
        "connector_status_honest",
      ],
      qualityStatus: "passed_declared_checks",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(quality.fabricatedResults).toBeNull();

    const provenance = draftSourceProvenance({
      id: "hsi-scdi-prv-fixture-1",
      dataSource: source,
      provenanceSummary: "Fixture FHIR Observation mapping pack provenance",
      upstreamSystem: "engineering_fixture_pack",
      capturedAt: asOf,
      lineageRefs: ["fixture-pack-v0"],
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(provenance.lineageRefs).toContain("fixture-pack-v0");

    const retention = draftRetentionDeletion({
      id: "hsi-scdi-rtn-fixture-1",
      dataSource: source,
      retentionPolicyRef: "policy-fixture-engineering-v0",
      retentionAction: "retain_under_policy",
      retainUntil: "2027-11-09T20:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    expect(retention.deletionCompletedAt).toBeNull();

    const governance = draftInteropGovernance({
      id: "hsi-scdi-gov-fixture-1",
      dataSource: source,
      legalBasis: "fixture_engineering",
      controllerRole: "fixture_only",
      processorRole: "fixture_only",
      controllerName: "HSI fixture controller",
      processorName: "HSI fixture processor",
      purposeLimitation: "Engineering mapping contracts only",
      accessPermissions: ["map_schema", "map_terminology", "read_provenance"],
      dataMinimisationStatement:
        "No identifiable patient fields; pseudonymised may still be personal data",
      exportRestrictions: "No unrestricted clinical export",
      retentionPolicyRef: "policy-fixture-engineering-v0",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
      auditHistory: ["governance draft created", "fixture honesty asserted"],
    });
    expect(governance.pseudonymisedMayStillBePersonalData).toBe(true);
    expect(governance.honesty.noUnrestrictedCentralPatientDatabase).toBe(true);
  });

  test("access enforcement denies blocked sources and ungranted permissions", () => {
    const blocked = seedBlockedSource();
    const deniedPerm = draftDataUsePermission({
      id: "hsi-scdi-perm-access-deny",
      dataSource: blocked,
      legalBasis: "not_established",
      purpose: "Blocked path",
      purposeLimitation: "No access",
      permissions: ["read_provenance"],
      dataMinimisationStatement: "None",
      exportRestrictions: "All exports denied",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const denial = enforceAccess({
      id: "hsi-scdi-acs-deny-1",
      dataSource: blocked,
      permission: deniedPerm,
      requestedPermission: "read_provenance",
      actor: {principalId: "principal-researcher", actorKind: "human"},
      createdAt: asOf,
    });
    expect(denial.decision).toBe("deny");
    expect(denial.denyReason).toBeTruthy();

    const source = seedFhirFixtureSource();
    const permitted = draftDataUsePermission({
      id: "hsi-scdi-perm-access-ok",
      dataSource: source,
      legalBasis: "fixture_engineering",
      purpose: "Fixture access exercise",
      purposeLimitation: "Fixture only",
      permissions: ["read_provenance"],
      dataMinimisationStatement: "Fixture refs",
      exportRestrictions: "No PHI",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const allow = enforceAccess({
      id: "hsi-scdi-acs-permit-1",
      dataSource: source,
      permission: permitted,
      requestedPermission: "read_provenance",
      actor: {principalId: "principal-researcher", actorKind: "human"},
      createdAt: asOf,
    });
    expect(allow.decision).toBe("permit");

    const exportDenied = enforceAccess({
      id: "hsi-scdi-acs-export-deny",
      dataSource: source,
      permission: permitted,
      requestedPermission: "export_restricted",
      actor: {principalId: "principal-researcher", actorKind: "human"},
      createdAt: asOf,
    });
    expect(exportDenied.decision).toBe("deny");
  });

  test("memory store round-trips and persistence lines stay honest", () => {
    const source = seedFhirFixtureSource();
    const permission = draftDataUsePermission({
      id: "hsi-scdi-perm-store",
      dataSource: source,
      legalBasis: "fixture_engineering",
      purpose: "Store fixture",
      purposeLimitation: "Fixture only",
      permissions: ["map_schema", "read_provenance"],
      dataMinimisationStatement: "Fixture",
      exportRestrictions: "No PHI",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const schemaMap = draftSchemaMapping({
      id: "hsi-scdi-sch-store",
      dataSource: source,
      sourceFieldPath: "Observation.code",
      targetModel: "hl7_fhir_r4",
      targetFieldPath: "Observation.code",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const termMap = draftTerminologyMapping({
      id: "hsi-scdi-trm-store",
      dataSource: source,
      sourceSystem: "snomed_ct",
      sourceCode: "55342001",
      targetSystem: "hsi_concept",
      targetCode: "concept.ssc.fixture",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const unit = draftUnitNormalisation({
      id: "hsi-scdi-unt-store",
      dataSource: source,
      sourceUnit: "g/L",
      targetUnit: "mg/L",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const temporal = draftTemporalAlignment({
      id: "hsi-scdi-tmp-store",
      dataSource: source,
      sourceTimezone: "Europe/London",
      targetTimezone: "UTC",
      eventTimeField: "effectiveDateTime",
      observationTimeField: "observationTime",
      alignmentRule: "Normalise to UTC",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const quality = draftDataQualityValidation({
      id: "hsi-scdi-qty-store",
      dataSource: source,
      checksPerformed: ["fixture_shape"],
      qualityStatus: "not_assessed",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const provenance = draftSourceProvenance({
      id: "hsi-scdi-prv-store",
      dataSource: source,
      provenanceSummary: "Store fixture provenance",
      upstreamSystem: "fixture",
      capturedAt: asOf,
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const access = enforceAccess({
      id: "hsi-scdi-acs-store",
      dataSource: source,
      permission,
      requestedPermission: "map_schema",
      actor: {principalId: "principal-researcher", actorKind: "human"},
      createdAt: asOf,
    });
    const retention = draftRetentionDeletion({
      id: "hsi-scdi-rtn-store",
      dataSource: source,
      retentionPolicyRef: "policy-store",
      retentionAction: "schedule_deletion",
      retainUntil: "2027-01-01T00:00:00.000Z",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });
    const governance = draftInteropGovernance({
      id: "hsi-scdi-gov-store",
      dataSource: source,
      legalBasis: "fixture_engineering",
      controllerRole: "fixture_only",
      processorRole: "unassigned",
      controllerName: "Fixture controller",
      processorName: "Unassigned",
      purposeLimitation: "Fixture",
      accessPermissions: ["map_schema", "read_provenance"],
      dataMinimisationStatement: "Fixture only",
      exportRestrictions: "None beyond fixture",
      retentionPolicyRef: "policy-store",
      authoredByPrincipalId: "agent-hsi-scdi-1",
      createdAt: asOf,
    });

    const store = createMemorySecureClinicalDataInteropStore();
    store.upsertDataSource(source);
    store.upsertPermission(permission);
    store.upsertSchemaMapping(schemaMap);
    store.upsertTerminologyMapping(termMap);
    store.upsertUnitNormalisation(unit);
    store.upsertTemporalAlignment(temporal);
    store.upsertQualityValidation(quality);
    store.upsertProvenance(provenance);
    store.upsertAccessEnforcement(access);
    store.upsertRetention(retention);
    store.upsertGovernance(governance);

    expect(store.listDataSources()).toHaveLength(1);
    expect(store.listPermissions(source.id)).toHaveLength(1);
    expect(store.listSchemaMappings(source.id)).toHaveLength(1);
    expect(store.listTerminologyMappings(source.id)).toHaveLength(1);
    expect(store.listUnitNormalisations(source.id)).toHaveLength(1);
    expect(store.listTemporalAlignments(source.id)).toHaveLength(1);
    expect(store.listQualityValidations(source.id)).toHaveLength(1);
    expect(store.listProvenance(source.id)).toHaveLength(1);
    expect(store.listAccessEnforcements(source.id)).toHaveLength(1);
    expect(store.listRetentions(source.id)).toHaveLength(1);
    expect(store.listGovernance(source.id)).toHaveLength(1);

    const lines = projectSecureClinicalInteropPersistenceLines({
      dataSource: source,
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
    expect(lines).toContain("liveConnectorOperational=false");
    expect(lines).toContain("noLivePhiIngestion=true");
    expect(lines).toContain("pseudonymisedMayStillBePersonalData=true");
    expect(lines).toContain("fabricatedClinicalResults=false");

    const pack = buildSecureClinicalInteropPack({
      dataSources: [source],
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
    expect(pack.dataSourceCount).toBe(1);
    expect(pack.honesty.noEhrWriteBackOrCds).toBe(true);
  });

  test("only humans may register sources; blocked sources cannot register", () => {
    const source = seedFhirFixtureSource();
    expect(source.lifecycle).toBe("draft");
    expect(() =>
      transitionDataSourceRegistration({
        source,
        to: "registered",
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-scdi-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only humans may register/);

    const registered = transitionDataSourceRegistration({
      source,
      to: "registered",
      updatedAt: asOf,
      actor: {principalId: "principal-researcher", actorKind: "human"},
    });
    expect(registered.lifecycle).toBe("registered");

    const blocked = seedBlockedSource();
    expect(blocked.lifecycle).toBe("permission_blocked");
    expect(() =>
      transitionDataSourceRegistration({
        source: blocked,
        to: "registered",
        updatedAt: asOf,
        actor: {principalId: "principal-researcher", actorKind: "human"},
      }),
    ).toThrow(/Illegal data-source transition|Cannot register source/);
  });
});
