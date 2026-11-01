/**
 * Human Systems Intelligence (HSI) Phase 0 substrate.
 * Shared evidence grades + edge schema for Aksh Health + Immune Super Intelligence.
 */
export {
  HSI_CURATION_LABELS,
  HSI_CURATION_REVIEWS,
  HSI_GRADE_INFO,
  HSI_GRADES,
  HSI_TEACHING_STATUSES,
  hsiGradeFromCuration,
  hsiGradeFromTeaching,
  isHsiCurationReview,
  isHsiGrade,
  isHsiTeachingStatus,
  type HsiCurationReview,
  type HsiGrade,
  type HsiTeachingStatus,
} from "./grades";

export {
  HSI_DOMAINS,
  HSI_EDGE_TYPES,
  isHsiDomain,
  isHsiEdgeType,
  type HsiActionStub,
  type HsiClaim,
  type HsiDomain,
  type HsiEdge,
  type HsiEdgeType,
  type HsiMarker,
  type HsiPatientObservationStub,
  type HsiProvenance,
  type HsiTranslationCard,
} from "./schema";

export {
  DISEASE_VERTICAL_STUBS,
  IMMUNE_CELL_LAYERS,
  IMMUNE_CELL_SPINE_NODES,
  IMMUNE_CELL_SPINE_SCHEMA,
  ISI_CONTROLLED_RELATIONSHIP_TYPES,
  ISI_RELATIONSHIP_TO_HSI_EDGE,
  buildImmuneCellSpineBundle,
  getDiseaseVertical,
  isIsiControlledRelationshipType,
  listImmuneCellLineages,
  type DiseaseVerticalRole,
  type DiseaseVerticalStub,
  type ImmuneCellLayer,
  type ImmuneCellSpineBundle,
  type ImmuneCellSpineNode,
  type IsiControlledRelationshipType,
} from "./immuneCellSpine";

export {
  AI_FUTURE_TECH_CAPABILITIES,
  AI_FUTURE_TECH_HARD_BANS,
  DISEASE_TISSUE_BIOMARKER_LAYERS,
  DISEASE_TISSUE_BIOMARKER_STUBS,
  EDGE_EMBEDDING_SLOT_SCHEMA,
  EXTERNAL_GENOME_POINTER_SCHEMA,
  FUTURE_TECH_ADAPTER_STUBS,
  GUT_MICROBIOME_ENTITY_CLASSES,
  GUT_MICROBIOME_ENTITY_STUBS,
  MODEL_EVAL_HARNESS_STUB,
  MODEL_PROPOSAL_ARTIFACT_SCHEMA,
  NEUROIMMUNE_ENTITY_STUBS,
  NEUROIMMUNE_ENTITY_TYPES,
  PATIENT_DATA_PLANE_RULES,
  SYSTEMS_CROSS_AXIS_PREDICATES,
  SYSTEMS_DOMAIN_OWNERSHIP,
  SYSTEMS_GRAPH_DOMAINS,
  SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES,
  SYSTEMS_PREDICATE_TO_HSI_EDGE,
  SYSTEMS_STAGE_GATES,
  SYSTEMS_VISION_SCHEMA,
  buildSystemsVisionBundle,
  isSystemsCrossAxisPredicate,
  listGutMicrobiomeEntitiesByClass,
  listNeuroimmuneEntitiesByType,
  serializeSystemsVision,
  type AiFutureTechCapability,
  type AiFutureTechHardBan,
  type DiseaseTissueBiomarkerLayer,
  type DiseaseTissueBiomarkerStub,
  type EdgeEmbeddingSlotSchema,
  type ExternalGenomePointerSchema,
  type FutureTechAdapterStatus,
  type FutureTechAdapterStub,
  type GutMicrobiomeEntityClass,
  type GutMicrobiomeEntityStub,
  type ModelEvalHarnessStub,
  type ModelProposalArtifactSchema,
  type NeuroimmuneEntityStub,
  type NeuroimmuneEntityType,
  type PatientDataPlaneRule,
  type SystemsCrossAxisPredicate,
  type SystemsDomainOwnership,
  type SystemsGraphDomain,
  type SystemsOwner,
  type SystemsStageGate,
  type SystemsVisionBundle,
} from "./systemsAxes";

export {
  gradeForSeed,
  isCdsSurfacable,
  isDiscoverySurfacable,
  summarizeGradeCounts,
  validateHsiEdge,
  validateProvenancePmid,
  validateTranslationCard,
  type HsiValidationIssue,
  type HsiValidationResult,
} from "./validate";

export {
  HSI_ALLOWED_AGENT_SURFACES_V0,
  HSI_SAFETY_RELEASE_CRITERIA_V0,
  criterionIds,
  type HsiReleaseCriterion,
} from "./releaseCriteria";

export {
  HSI_EXAMPLE_TRANSLATION_CARDS,
  HSI_MARKERS,
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
  hasEvidenceLocator,
  listBridgeCandidates,
} from "./seed/t2dImmunoMetabolic";

export {
  hsiEvidenceHandoff,
  type HsiEvidenceHandoff,
  type HsiEvidenceLinkStatus,
  type HsiGateCHandoffStatus,
} from "./evidenceHandoff";

export {
  linkClaimToMarker,
  loincCoverageSummary,
  markerByNodeId,
  markersWithLoinc,
  seedClaimLoincMap,
  type HsiClaimMarkerLink,
} from "./markers";

export {
  buildIsiExportBundle,
  serializeIsiExport,
  type IsiHsiExportBundle,
} from "./exportIsi";

export {
  buildSchemaGapReport,
  serializeGapReport,
  type HsiMappingGap,
  type HsiSchemaGapReport,
} from "./gapReport";

export {
  GATE_C_CHECKLIST_SCHEMA,
  buildGateCChecklist,
  serializeGateCChecklist,
  serializeGateCChecklistMarkdown,
  type GateCChecklistBundle,
  type GateCChecklistRow,
  type GateCTranslationCandidateRow,
} from "./gateCChecklist";

export {
  MODEL_PROPOSAL_RUNTIME_SCHEMA,
  assertSafeModelProposal,
  buildExampleModelProposals,
  buildGateCModelProposalRows,
  toGateCModelProposalRow,
  type GateCModelProposalRow,
  type ModelProposalArtifact,
} from "./modelProposal";

export {
  EMBEDDING_SIDECARS_EXPORT_SCHEMA,
  EMBEDDING_SIDECAR_RUNTIME_SCHEMA,
  assertSafeEmbeddingSidecar,
  buildEmbeddingSidecarsBundle,
  buildExampleEmbeddingSidecars,
  contentHashOfPayload,
  serializeEmbeddingSidecars,
  type EdgeEmbeddingSidecar,
  type EmbeddingSidecarMapping,
  type EmbeddingSidecarsBundle,
} from "./embeddingSidecar";

export {
  MODEL_EVAL_CHECK_DEFINITIONS,
  MODEL_EVAL_CHECK_IDS,
  MODEL_EVAL_HARNESS_EXPORT_SCHEMA,
  MODEL_EVAL_HARNESS_RUNTIME_SCHEMA,
  buildDemoModelEvalCases,
  buildFrozenPublicPackFixtures,
  buildModelEvalHarnessBundle,
  detectClinicalPhiClaims,
  extractCitedEdgeIds,
  fixtureIndex,
  runOfflineModelEvalHarness,
  scoreModelEvalSubject,
  serializeModelEvalHarness,
  serializeModelEvalHarnessMarkdown,
  type FrozenPackEdgeFixture,
  type ModelEvalCaseResult,
  type ModelEvalCheckDefinition,
  type ModelEvalCheckId,
  type ModelEvalCheckResult,
  type ModelEvalHarnessBundle,
  type ModelEvalSubjectKind,
  type ScoreModelEvalSubjectInput,
} from "./modelEvalHarness";

export {
  EXTERNAL_GENOME_POINTERS_EXPORT_SCHEMA,
  EXTERNAL_GENOME_POINTER_RUNTIME_SCHEMA,
  assertSafeExternalGenomePointer,
  buildExampleExternalGenomePointers,
  buildExternalGenomePointersBundle,
  resolveGenomePointerUrl,
  serializeExternalGenomePointers,
  type ExternalGenomePointer,
  type ExternalGenomePointersBundle,
  type GenomePointerSource,
} from "./externalGenomePointers";

export {
  SSC_CELL_CARD_SCHEMA,
  SSC_NEIGHBOURHOOD_CARDS,
  listSscNeighbourhoodCards,
  sscCellCardByNodeId,
  type SscNeighbourhoodCard,
  type SscOntologyHint,
} from "./sscCellCards";

export {
  OUTPUTS_MANIFEST_SCHEMA,
  publishOutputs,
  serializeGapReportMarkdown,
  type PublishOutputsOptions,
  type PublishOutputsResult,
} from "./publishOutputs";

export {
  PILOT_EVIDENCE_PACK_SCHEMA,
  buildPilotEvidencePack,
  serializePilotEvidencePack,
  serializePilotEvidencePackMarkdown,
  type PilotEvidenceMapRow,
  type PilotEvidencePack,
  type PilotEntityRef,
  type PilotEntitySlice,
  type PilotExpertItem,
  type PilotExplanationSlot,
  type PilotQuestionProject,
  type PilotScopeField,
} from "./pilotEvidencePack";

export {
  PARTNER_LOCK_SCHEMA,
  HSI_SCOPE_LOCKED_PARTNER_LOCK,
  HSI_PROVISIONAL_PARTNER_LOCK,
  getPartnerLock,
  isProvisionalPartnerLock,
  isScopeLockedPartnerLock,
  hasWorkingPilotScope,
  partnerLockExportPointer,
  type HsiPartnerLock,
  type HsiPartnerRef,
  type PartnerLockStatus,
} from "./partnerLock";

export {
  VERTICAL_DECISION_SCHEMA,
  HSI_VERTICAL_DECISION,
  getVerticalDecision,
  verticalDecisionExportPointer,
  type HsiVerticalDecision,
  type VerticalDecisionOption,
  type VerticalStrategy,
} from "./verticalDecision";

export {
  HSI_SSC_SEED_CLAIMS,
  HSI_SSC_SEED_EDGES,
  SSC_PATHWAY_ID,
  SSC_PATHWAY_META,
  sscDeepSeedsLanded,
} from "./seed/sscTfhBIl21";

export {
  GUT_PATHWAY_ID,
  GUT_PATHWAY_META,
  HSI_GUT_SEED_CLAIMS,
  HSI_GUT_SEED_EDGES,
  HSI_GUT_SEED_SYSTEMS_PREDICATES,
  gutDeepSeedsLanded,
} from "./seed/gutScfaMucosal";

export {
  NI_PATHWAY_ID,
  NI_PATHWAY_META,
  HSI_NI_SEED_CLAIMS,
  HSI_NI_SEED_EDGES,
  HSI_NI_SEED_SYSTEMS_PREDICATES,
  neuroDeepSeedsLanded,
} from "./seed/neuroVagusCholinergic";

export {
  SSC_PATHWAY_PACK_SCHEMA,
  buildSscPathwayPack,
  serializeSscPathwayPack,
  serializeSscPathwayPackMarkdown,
  type SscPathwayExplanation,
  type SscPathwayPack,
} from "./sscPathwayPack";

export {
  GUT_IMMUNE_PACK_SCHEMA,
  buildGutImmunePack,
  serializeGutImmunePack,
  serializeGutImmunePackMarkdown,
  type GutImmunePack,
  type GutPathwayExplanation,
} from "./gutImmunePack";

export {
  NEURO_IMMUNE_PACK_SCHEMA,
  buildNeuroImmunePack,
  serializeNeuroImmunePack,
  serializeNeuroImmunePackMarkdown,
  type NeuroImmunePack,
  type NeuroPathwayExplanation,
} from "./neuroImmunePack";

export {
  PILOT_REVIEW_RUBRIC_SCHEMA,
  buildPilotReviewRubric,
  serializePilotReviewRubric,
  serializePilotReviewRubricMarkdown,
  type PilotReviewRubric,
  type RubricCheckItem,
  type RubricCheckStatus,
} from "./pilotReviewRubric";

export {
  PILOT_ACCEPTANCE_SCHEMA,
  buildPilotAcceptancePack,
  serializePilotAcceptance,
  serializePilotAcceptanceMarkdown,
  serializePilotWalkthroughMarkdown,
  type AcceptanceCriterion,
  type AcceptanceStatus,
  type PilotAcceptancePack,
} from "./pilotAcceptance";

export {
  R2_VALIDATION_SCHEMA,
  buildR2ValidationBundle,
  serializeR2Validation,
  serializeR2ValidationMarkdown,
  type R2HypothesisCard,
  type R2LiteratureTest,
  type R2LiteratureTestKind,
  type R2RankedGap,
  type R2ValidationBundle,
  type R2ValidationStatus,
} from "./r2Validation";

export {
  TRANSLATION_HANDOFF_SCHEMA,
  buildTranslationHandoffPack,
  serializeTranslationHandoff,
  serializeTranslationHandoffMarkdown,
  type TranslationClinicalUse,
  type TranslationHandoffCandidate,
  type TranslationHandoffPack,
  type TranslationHandoffStatus,
} from "./translationHandoff";

export {
  AKENO_CONSUMER_SCHEMA,
  buildAkenoConsumerBundle,
  evaluateAkenoConsumerSafety,
  recordAkenoHitlReview,
  serializeAkenoConsumer,
  type AkenoConsumerBundle,
  type AkenoHitlAction,
  type AkenoHitlReviewDecision,
  type AkenoSafetyEvaluation,
} from "./akenoConsumer";

export {
  AKSH_AGENT_ALIASES,
  AKSH_AGENT_CATALOG_SCHEMA,
  AKSH_AGENT_DIRECTORY,
  AKSH_AGENT_PROVENANCE,
  AKSH_AGENT_REGISTER,
  AKSH_OUT_OF_REGISTRY,
  buildAkshAgentCatalog,
  canonicalAkshAgentId,
  listAkshDirectoryNames,
  listAkshRegisterIds,
  listAllAkshAgentNames,
  serializeAkshAgentCatalog,
  type AkshAgentCatalog,
  type AkshDirectoryAgentName,
  type AkshDirectoryEntry,
  type AkshRegisterAgentId,
  type AkshRegisterEntry,
} from "./akshAgents";

export {
  HSI_DISCOVERY_LOOP_STEPS,
  HSI_ILLUSTRATIVE_DISEASE_CONTEXTS,
  HSI_SYSTEMS_SECONDARY_AXES,
  buildDiscoveryCentreMeta,
  type HsiDiscoveryCentreMeta,
  type HsiDiscoveryLoopStepId,
  type HsiIllustrativeDiseaseId,
} from "./discoveryCentreMeta";

export {
  ISI_REL_SUGGESTIONS,
  claimsWithIsiMappings,
  listIsiRelSuggestions,
  suggestionForClaim,
  suggestionForEdge,
  summarizeIsiRelMappings,
  type IsiRelMatchKind,
  type IsiRelMappingSummary,
  type IsiRelSuggestion,
  type IsiRelSuggestionStatus,
} from "./mappings/isiRelSuggestions";

export {
  AKSH_CLINIC_BY_ID,
  AKSH_CLINIC_CONCEPTS,
  PROVISIONAL_AKSH_TO_DURABLE,
  akshClinicConcept,
  isDurableAkshClinicId,
  isProvisionalAkshId,
  listAkshClinicConcepts,
  migrateAkshNodeId,
  type AkshClinicConcept,
  type AkshClinicKind,
} from "./mappings/akshClinicIds";

export {
  AKSH_NODE_SUGGESTIONS,
  akshMapImpliesCds,
  akshNodeIdMap,
  akshSuggestionForClaim,
  akshSuggestionForEdge,
  assertSeedEdgesNotCdsSurfacable,
  claimsWithAkshMappings,
  listAkshNodeSuggestions,
  summarizeAkshNodeMappings,
  type AkshNodeMatchKind,
  type AkshNodeMappingSummary,
  type AkshNodeSuggestion,
  type AkshNodeSuggestionStatus,
} from "./mappings/akshNodeSuggestions";

export { claimsWithProductMappings } from "./mappings/productMappings";

export {
  FORBIDDEN_NEON_MARKERS,
  HSI_NEON_BRANCH_ID,
  HSI_NEON_DATABASE,
  HSI_NEON_HOST_PREFIX,
  HSI_NEON_PROJECT_ID,
  assertHsiNeonDatabaseUrl,
  isForbiddenNeonTarget,
  isHsiNeonHost,
  maskDatabaseUrl,
  type NeonUrlCheck,
} from "./db/neonGuard";

export {
  applyHsiMigrations,
  type MigrateOptions,
  type MigrateResult,
} from "./db/migrate";

export {
  syncGateCChecklistToHsiNeon,
  type GateCLocalSyncOptions,
  type GateCLocalSyncResult,
} from "./db/gateCLocal";

export {
  AKSH_HITL_MAP_SCHEMA,
  AKSH_HITL_STUB_SCHEMA,
  assertHitlStubCdsClosed,
  buildAkshHitlCard,
  buildAkshHitlCardViewModel,
  buildAkshHitlStubBundle,
  listAkshHitlCards,
  listAkshHitlReadOnlyCards,
  listCdsEligibleAkshHitlCards,
  loadAkshHitlMapFromExport,
  loadAkshHitlMapFromObject,
  loadAkshHitlMapInMemory,
  loadAkshHitlStubFromExport,
  normalizeAkshHitlMap,
  parseAkshNodeMapExport,
  summarizeAkshHitlCards,
  type AkshHitlCardViewModel,
  type AkshHitlMapPayload,
  type AkshHitlStubBundle,
  type ListAkshHitlCardsOptions,
  type ParsedAkshNodeMap,
} from "./akshHitl";
