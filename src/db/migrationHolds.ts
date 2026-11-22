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
  "20261111_p1_4_evidence_review_staging",
] as const;

/**
 * Ids already on the normal migrate path as of the 22 Nov 2026 audit.
 * 020's earlier hold was released after review of the role split.
 * A new SQL file must be added here or to HELD_MIGRATION_IDS before migrate can apply it.
 */
export const APPROVED_MIGRATION_IDS = [
  "001_hsi_substrate",
  "002_hsi_evidence_ownership",
  "003_hsi_scientific_review_guardrails",
  "004_hsi_research_investigations",
  "005_hsi_reviewer_authority",
  "006_hsi_research_access",
  "007_hsi_interrogative_contracts",
  "008_hsi_interrogative_review_audit",
  "009_hsi_agent_durable_checkpoints",
  "010_hsi_agent_fenced_artifacts",
  "011_hsi_lhkg_governed_graph",
  "012_hsi_lhkg_evidence_dossiers",
  "013_hsi_lhkg_isolated_security_hardening",
  "014_hsi_investigation_graph_context",
  "015_hsi_review_delivery",
  "016_hsi_evidence_ledger",
  "017_hsi_experiment_ledger",
  "018_hsi_dynamic_evidence_persistence",
  "019_hsi_isi_research_review",
  "020_hsi_lhkg_rls_policies",
  "021_hsi_hitl_questions_outbox",
] as const;

export type MigrationDisposition = "approved" | "held" | "unlisted";

export function migrationDisposition(id: string): MigrationDisposition {
  if ((HELD_MIGRATION_IDS as readonly string[]).includes(id)) return "held";
  if ((APPROVED_MIGRATION_IDS as readonly string[]).includes(id)) return "approved";
  return "unlisted";
}
