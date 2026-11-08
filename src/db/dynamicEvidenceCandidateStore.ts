/**
 * Neon R/W helper for PR 3 dynamic evidence persistence (migration 018).
 * Fail-closed: ledgerNeonWriteGate + staging-only writes.
 * Upserts permitted metadata into hsi_evidence_sources; preserves search records + identity links.
 * Never invents claim support, Gate C approval, graph promotion, or autumn-snow writes.
 */
import {SQL} from "bun";
import type {
  DynamicCandidateBinding,
  DynamicCandidateSource,
  DynamicEvidencePersistStore,
  DynamicPersistencePlan,
  EvidenceIdentityLink,
} from "../evidence/dynamicEvidencePersistence";
import type {DynamicSearchRecord} from "../evidence/dynamicEvidenceRetrieval";
import {
  assertLedgerNeonReadable,
  assertLedgerNeonWritable,
  type LedgerNeonStoreConfig,
} from "./ledgerNeonWriteGate";

export type DynamicEvidenceCandidateStoreConfig = LedgerNeonStoreConfig;

function openSql(databaseUrl: string): SQL {
  return new SQL(databaseUrl, {tls: {rejectUnauthorized: true}, connectionTimeout: 10});
}

export function createDynamicEvidenceCandidateStore(
  config: DynamicEvidenceCandidateStoreConfig,
): DynamicEvidencePersistStore {
  assertLedgerNeonReadable(config);

  return {
    async upsertSearchRecord(plan: DynamicPersistencePlan) {
      assertLedgerNeonWritable(config);
      const record = plan.searchRecord;
      if (!record.searchRecordHash) {
        throw new Error("Search record hash required");
      }
      if (
        plan.honesty.scientificApproval !== false ||
        plan.honesty.graphPromotable !== false ||
        plan.honesty.gateCAutoApprove !== false ||
        plan.honesty.claimSupport !== "not_assessed"
      ) {
        throw new Error("Dynamic search record Neon insert refuses approval / graph / claim-support flips");
      }
      const sql = openSql(config.databaseUrl);
      try {
        await sql`
          INSERT INTO hsi_dynamic_search_records (
            id, search_record_hash, question, method, overall_outcome, record,
            claim_support, content_access, scientific_approval, graph_promotable,
            gate_c_auto_approve, started_at, completed_at
          ) VALUES (
            ${plan.searchRecordId},
            ${record.searchRecordHash},
            ${record.question},
            ${record.method},
            ${record.coverage.overallOutcome},
            ${JSON.stringify(record)}::jsonb,
            'not_assessed',
            'metadata',
            false,
            false,
            false,
            ${record.timestamps.startedAt}::timestamptz,
            ${record.timestamps.completedAt}::timestamptz
          )
          ON CONFLICT (id) DO UPDATE SET
            record = EXCLUDED.record,
            overall_outcome = EXCLUDED.overall_outcome,
            completed_at = EXCLUDED.completed_at
          WHERE hsi_dynamic_search_records.completed_at <= EXCLUDED.completed_at
        `;
        return {id: plan.searchRecordId};
      } finally {
        await sql.close();
      }
    },

    async upsertCandidate(candidate: DynamicCandidateSource) {
      assertLedgerNeonWritable(config);
      if (
        candidate.scientificApproval !== false ||
        candidate.graphPromotable !== false ||
        candidate.claimSupport !== "not_assessed" ||
        candidate.licenceStatus !== "metadata_only" ||
        candidate.passageImported !== false
      ) {
        throw new Error("Dynamic candidate Neon insert refuses approval / passages / claim support");
      }
      if (candidate.axes.curationReview !== "draft" || candidate.axes.hsiGrade !== "unexplored") {
        throw new Error("Dynamic candidates must remain draft / unexplored");
      }
      const sql = openSql(config.databaseUrl);
      try {
        const metadataJson = JSON.stringify(candidate.metadata);
        await sql`
          INSERT INTO hsi_evidence_sources (
            id, source_kind, external_id, title, source_url, doi, pmid,
            licence_status, retraction_status, retrieved_at, metadata
          ) VALUES (
            ${candidate.id},
            ${candidate.sourceKind},
            ${candidate.externalId},
            ${candidate.title},
            ${candidate.sourceUrl},
            ${candidate.doi},
            ${candidate.pmid},
            ${candidate.licenceStatus},
            ${candidate.retractionStatus},
            ${candidate.retrievedAt}::timestamptz,
            ${metadataJson}::jsonb
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            source_url = EXCLUDED.source_url,
            doi = EXCLUDED.doi,
            pmid = EXCLUDED.pmid,
            retraction_status = EXCLUDED.retraction_status,
            retrieved_at = EXCLUDED.retrieved_at,
            metadata = EXCLUDED.metadata
          WHERE hsi_evidence_sources.retrieved_at <= EXCLUDED.retrieved_at
        `;
      } finally {
        await sql.close();
      }
    },

    async upsertBinding(searchRecordId: string, binding: DynamicCandidateBinding) {
      assertLedgerNeonWritable(config);
      const responseIdentity = binding.responseIdentity ?? "";
      const bindingId = [
        searchRecordId,
        binding.sourceId,
        binding.role,
        responseIdentity,
      ].join("|");
      const sql = openSql(config.databaseUrl);
      try {
        await sql`
          INSERT INTO hsi_dynamic_candidate_bindings (
            id, search_record_id, source_id, role, response_identity, pmid, provider
          ) VALUES (
            ${bindingId},
            ${searchRecordId},
            ${binding.sourceId},
            ${binding.role},
            ${responseIdentity},
            ${binding.pmid},
            ${binding.provider}
          )
          ON CONFLICT (search_record_id, source_id, role, response_identity) DO UPDATE SET
            pmid = EXCLUDED.pmid,
            provider = EXCLUDED.provider
        `;
      } finally {
        await sql.close();
      }
    },

    async upsertIdentityLink(searchRecordId: string, link: EvidenceIdentityLink) {
      assertLedgerNeonWritable(config);
      const sql = openSql(config.databaseUrl);
      try {
        await sql`
          INSERT INTO hsi_evidence_identity_links (
            id, search_record_id, from_identity, to_identity, from_layer, to_layer,
            relation, counts_as_independent_evidence, rationale, provenance
          ) VALUES (
            ${link.id},
            ${searchRecordId},
            ${link.fromIdentity},
            ${link.toIdentity},
            ${link.fromLayer},
            ${link.toLayer},
            ${link.relation},
            ${link.countsAsIndependentEvidence},
            ${link.rationale},
            ${JSON.stringify(link.provenance)}::jsonb
          )
          ON CONFLICT (search_record_id, from_identity, to_identity, relation) DO UPDATE SET
            counts_as_independent_evidence = EXCLUDED.counts_as_independent_evidence,
            rationale = EXCLUDED.rationale,
            provenance = EXCLUDED.provenance
        `;
      } finally {
        await sql.close();
      }
    },

    async getSearchRecord(id: string): Promise<DynamicSearchRecord | null> {
      assertLedgerNeonReadable(config);
      const sql = openSql(config.databaseUrl);
      try {
        const rows = await sql`
          SELECT record FROM hsi_dynamic_search_records WHERE id = ${id} LIMIT 1
        `;
        if (!rows.length) return null;
        return rows[0].record as DynamicSearchRecord;
      } finally {
        await sql.close();
      }
    },
  };
}
