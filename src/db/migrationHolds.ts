/**
 * Committed migrations that must not run until an explicit security review.
 * These ids are skipped by normal migration execution until separately reviewed.
 * Repository holds are not a statement about an observed remote database ledger.
 */
export const HELD_MIGRATION_IDS = [
  "022_hsi_scientific_investigation_records",
  "023_hsi_researcher_workspace_community",
  "024_hsi_scientific_contradiction_ledger",
  "025_hsi_contradiction_tenant_isolation",
  "026_hsi_contradiction_review_integrity",
  "027_hsi_contradiction_authenticated_procedures",
  "028_hsi_contradiction_restricted_api",
  "029_hsi_contradiction_scoped_read_integrity",
  "030_hsi_live_evidence_investigations",
  "031_hsi_graph_workspace_storage",
  "032_hsi_graph_workspace_procedures",
  "033_hsi_ontology_import_role",
] as const;
