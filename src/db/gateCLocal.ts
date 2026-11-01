/**
 * Thin local Gate C path → HSI Neon placeholders.
 *
 * 1. Upserts full pack-derived seed claims/edges/markers (RA + dual-track packs)
 *    so Neon density tracks publish artifacts — not only Gate C–mapped rows.
 * 2. Upserts checklist rows into `hsi_gate_c_reviews` as pending / not auto-approved.
 *
 * Human curators must set status to human_approved|human_rejected|deferred —
 * this path never auto-approves.
 *
 * ISI product Neon Gate C approve+supports (autumn-snow) remains a separate
 * human action outside this workspace.
 */
import { SQL } from "bun";
import {
  buildGateCChecklist,
  type GateCChecklistBundle,
  type GateCChecklistRow,
} from "../gateCChecklist";
import {
  HSI_MARKERS,
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "../seed/t2dImmunoMetabolic";
import type { HsiClaim, HsiEdge, HsiMarker } from "../schema";
import { assertHsiNeonDatabaseUrl, maskDatabaseUrl } from "./neonGuard";
import { resolveDatabaseUrl, type ResolveDatabaseUrlOptions } from "./resolveDatabaseUrl";

/** Minimal Bun SQL client surface used by local Gate C sync. */
type HsiSql = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
};

export type GateCLocalSyncResult = {
  ok: true;
  upserted: number;
  skippedUnmapped: number;
  seedClaimsUpserted: number;
  seedEdgesUpserted: number;
  markersUpserted: number;
  host: string;
  databaseUrlMasked: string;
  source: "env" | "neonctl";
  autoApprove: false;
};

export type GateCLocalSyncOptions = ResolveDatabaseUrlOptions & {
  checklist?: GateCChecklistBundle;
  /** When true, upsert full pack seed claims/edges/markers. Default true. */
  ensureSeedRows?: boolean;
};

function claimFromSeed(c: HsiClaim) {
  return {
    id: c.id,
    assertion: c.assertion,
    domain: c.domain,
    isiRelationshipId: c.isiRelationshipId ?? null,
    akshNodeId: c.akshNodeId ?? null,
  };
}

function edgeFromSeed(e: HsiEdge) {
  return {
    id: e.id,
    edgeType: e.edgeType,
    subjectId: e.subjectId,
    subjectLabel: e.subjectLabel,
    objectId: e.objectId,
    objectLabel: e.objectLabel,
    claimId: e.claimId,
    curationReview: e.curationReview,
    hsiGrade: e.hsiGrade,
    teachingStatus: e.teachingStatus,
    domain: e.domain,
    pmid: e.provenance.pmid ?? null,
    doi: e.provenance.doi ?? null,
    citationLabel: e.provenance.citationLabel ?? null,
    sourceUrl: e.provenance.sourceUrl ?? null,
    provenanceNotes: e.provenance.notes ?? null,
    bridgeCandidate: e.bridgeCandidate ?? false,
    seedKind: e.seedKind ?? "placeholder",
  };
}

function claimStub(claimId: string) {
  const c = HSI_T2D_IMMUNO_SEED_CLAIMS.find((x) => x.id === claimId);
  return {
    id: claimId,
    assertion: c?.assertion ?? `(placeholder) ${claimId}`,
    domain: c?.domain ?? "general",
    isiRelationshipId: c?.isiRelationshipId ?? null,
    akshNodeId: c?.akshNodeId ?? null,
  };
}

function edgeStub(edgeId: string, claimId: string) {
  const e = HSI_T2D_IMMUNO_SEED_EDGES.find((x) => x.id === edgeId);
  return {
    id: edgeId,
    edgeType: e?.edgeType ?? "associated_with",
    subjectId: e?.subjectId ?? "unknown",
    subjectLabel: e?.subjectLabel ?? "unknown",
    objectId: e?.objectId ?? "unknown",
    objectLabel: e?.objectLabel ?? "unknown",
    claimId: e?.claimId ?? claimId,
    curationReview: e?.curationReview ?? "unreviewed",
    hsiGrade: e?.hsiGrade ?? "unexplored",
    teachingStatus: e?.teachingStatus ?? "unknown",
    domain: e?.domain ?? "general",
    pmid: e?.provenance.pmid ?? null,
    doi: e?.provenance.doi ?? null,
    citationLabel: e?.provenance.citationLabel ?? null,
    sourceUrl: e?.provenance.sourceUrl ?? null,
    provenanceNotes: e?.provenance.notes ?? null,
    bridgeCandidate: e?.bridgeCandidate ?? false,
    seedKind: e?.seedKind ?? "placeholder",
  };
}

async function upsertClaim(sql: HsiSql, claim: ReturnType<typeof claimFromSeed>): Promise<void> {
  await sql`
    INSERT INTO hsi_claims (id, assertion, domain, isi_relationship_id, aksh_node_id)
    VALUES (
      ${claim.id},
      ${claim.assertion},
      ${claim.domain},
      ${claim.isiRelationshipId},
      ${claim.akshNodeId}
    )
    ON CONFLICT (id) DO UPDATE SET
      assertion = EXCLUDED.assertion,
      domain = EXCLUDED.domain,
      isi_relationship_id = COALESCE(EXCLUDED.isi_relationship_id, hsi_claims.isi_relationship_id),
      aksh_node_id = COALESCE(EXCLUDED.aksh_node_id, hsi_claims.aksh_node_id),
      updated_at = now()
  `;
}

async function upsertEdge(sql: HsiSql, edge: ReturnType<typeof edgeFromSeed>): Promise<void> {
  await sql`
    INSERT INTO hsi_edges (
      id, edge_type, subject_id, subject_label, object_id, object_label,
      claim_id, curation_review, hsi_grade, teaching_status, domain,
      pmid, doi, citation_label, source_url, provenance_notes,
      bridge_candidate, seed_kind
    )
    VALUES (
      ${edge.id},
      ${edge.edgeType},
      ${edge.subjectId},
      ${edge.subjectLabel},
      ${edge.objectId},
      ${edge.objectLabel},
      ${edge.claimId},
      ${edge.curationReview},
      ${edge.hsiGrade},
      ${edge.teachingStatus},
      ${edge.domain},
      ${edge.pmid},
      ${edge.doi},
      ${edge.citationLabel},
      ${edge.sourceUrl},
      ${edge.provenanceNotes},
      ${edge.bridgeCandidate},
      ${edge.seedKind}
    )
    ON CONFLICT (id) DO UPDATE SET
      edge_type = EXCLUDED.edge_type,
      subject_label = EXCLUDED.subject_label,
      object_label = EXCLUDED.object_label,
      curation_review = EXCLUDED.curation_review,
      hsi_grade = EXCLUDED.hsi_grade,
      teaching_status = EXCLUDED.teaching_status,
      pmid = COALESCE(EXCLUDED.pmid, hsi_edges.pmid),
      doi = COALESCE(EXCLUDED.doi, hsi_edges.doi),
      citation_label = COALESCE(EXCLUDED.citation_label, hsi_edges.citation_label),
      source_url = COALESCE(EXCLUDED.source_url, hsi_edges.source_url),
      provenance_notes = COALESCE(EXCLUDED.provenance_notes, hsi_edges.provenance_notes),
      bridge_candidate = EXCLUDED.bridge_candidate,
      seed_kind = EXCLUDED.seed_kind,
      updated_at = now()
  `;
}

async function upsertMarker(sql: HsiSql, m: HsiMarker): Promise<void> {
  await sql`
    INSERT INTO hsi_markers (id, name, loinc, unit, description)
    VALUES (
      ${m.id},
      ${m.name},
      ${m.loinc ?? null},
      ${m.unit ?? null},
      ${m.description ?? ""}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      loinc = COALESCE(EXCLUDED.loinc, hsi_markers.loinc),
      unit = COALESCE(EXCLUDED.unit, hsi_markers.unit),
      description = EXCLUDED.description
  `;
}

async function ensureClaimAndEdge(
  sql: HsiSql,
  row: GateCChecklistRow,
): Promise<void> {
  await upsertClaim(sql, claimStub(row.claimId));
  await upsertEdge(sql, edgeStub(row.edgeId, row.claimId));
}

/**
 * Sync all pack seed claims/edges/markers into HSI Neon, then Gate C checklist
 * as human-pending rows. Skips unmapped checklist rows for reviews. Never sets
 * auto_approve or human_approved.
 */
export async function syncGateCChecklistToHsiNeon(
  opts?: GateCLocalSyncOptions,
): Promise<GateCLocalSyncResult> {
  const resolved = resolveDatabaseUrl(opts);
  const check = assertHsiNeonDatabaseUrl(resolved.databaseUrl, {
    neonProjectId: resolved.neonProjectId,
  });
  if (!check.ok) {
    throw new Error(`Refusing Gate C local sync: ${check.reason}`);
  }

  const checklist = opts?.checklist ?? buildGateCChecklist();
  const ensureSeedRows = opts?.ensureSeedRows !== false;
  const sql = new SQL(resolved.databaseUrl);

  let upserted = 0;
  let skippedUnmapped = 0;
  let seedClaimsUpserted = 0;
  let seedEdgesUpserted = 0;
  let markersUpserted = 0;

  try {
    if (ensureSeedRows) {
      for (const c of HSI_T2D_IMMUNO_SEED_CLAIMS) {
        await upsertClaim(sql, claimFromSeed(c));
        seedClaimsUpserted += 1;
      }
      for (const e of HSI_T2D_IMMUNO_SEED_EDGES) {
        await upsertEdge(sql, edgeFromSeed(e));
        seedEdgesUpserted += 1;
      }
      for (const m of HSI_MARKERS) {
        await upsertMarker(sql, m);
        markersUpserted += 1;
      }
    }

    for (const row of checklist.rows) {
      if (row.gateCStatus === "unmapped" || !row.isiRelationshipId) {
        skippedUnmapped += 1;
        continue;
      }

      if (ensureSeedRows) {
        // Refresh any checklist-linked claim/edge (covers model-proposal stubs too).
        await ensureClaimAndEdge(sql, row);
      }

      // Always pending / auto_approve=false — never promote to human_approved here.
      await sql`
        INSERT INTO hsi_gate_c_reviews (
          edge_id, claim_id, isi_relationship_id, pmid, doi, spo_note,
          status, auto_approve
        )
        VALUES (
          ${row.edgeId},
          ${row.claimId},
          ${row.isiRelationshipId},
          ${row.pmid},
          ${row.doi},
          ${row.spoNote},
          ${"pending"},
          ${false}
        )
        ON CONFLICT (edge_id) DO UPDATE SET
          claim_id = EXCLUDED.claim_id,
          isi_relationship_id = EXCLUDED.isi_relationship_id,
          pmid = COALESCE(EXCLUDED.pmid, hsi_gate_c_reviews.pmid),
          doi = COALESCE(EXCLUDED.doi, hsi_gate_c_reviews.doi),
          spo_note = EXCLUDED.spo_note,
          -- Preserve human decisions; only refresh metadata when still pending/in_review
          status = CASE
            WHEN hsi_gate_c_reviews.status IN ('human_approved', 'human_rejected', 'deferred')
              THEN hsi_gate_c_reviews.status
            ELSE 'pending'
          END,
          auto_approve = false,
          updated_at = now()
      `;
      upserted += 1;
    }
  } finally {
    await sql.close();
  }

  return {
    ok: true,
    upserted,
    skippedUnmapped,
    seedClaimsUpserted,
    seedEdgesUpserted,
    markersUpserted,
    host: check.host,
    databaseUrlMasked: maskDatabaseUrl(resolved.databaseUrl),
    source: resolved.source,
    autoApprove: false,
  };
}
