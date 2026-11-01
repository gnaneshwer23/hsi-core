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
} from "./gateCChecklist";

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
  PILOT_REVIEW_RUBRIC_SCHEMA,
  buildPilotReviewRubric,
  serializePilotReviewRubric,
  serializePilotReviewRubricMarkdown,
  type PilotReviewRubric,
  type RubricCheckItem,
  type RubricCheckStatus,
} from "./pilotReviewRubric";

export {
  HSI_DISCOVERY_LOOP_STEPS,
  HSI_ILLUSTRATIVE_DISEASE_CONTEXTS,
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
