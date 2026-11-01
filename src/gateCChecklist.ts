/**
 * Gate C human checklist — curated REL list for ISI Neon handoff.
 *
 * Not Neon approval. Rows with evidence stay `gateCStatus: pending` until a
 * human runs Check → claim_support=supports → Approve in the consuming product.
 */
import { hsiEvidenceHandoff } from "./evidenceHandoff";
import {
  ISI_REL_SUGGESTIONS,
  type IsiRelMatchKind,
  type IsiRelSuggestionStatus,
} from "./mappings/isiRelSuggestions";
import {
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "./seed/t2dImmunoMetabolic";

export const GATE_C_CHECKLIST_SCHEMA = "hsi-gate-c-checklist-1" as const;

export type GateCChecklistRow = {
  claimId: string;
  edgeId: string;
  isiRelationshipId: string | null;
  matchKind: IsiRelMatchKind;
  mappingStatus: IsiRelSuggestionStatus;
  /** Human Neon Gate C — always pending/not_started here; never auto-passed. */
  gateCStatus: "pending" | "not_started" | "unmapped";
  pmid: string | null;
  doi: string | null;
  /** Subject — predicate — object note from HSI seed (curator S-P-O check). */
  spoNote: string;
  assertion: string;
  rationale: string;
  autoApprove: false;
};

export type GateCChecklistBundle = {
  schemaVersion: typeof GATE_C_CHECKLIST_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  summary: {
    totalRows: number;
    curatedWithRel: number;
    pendingGateC: number;
    unmapped: number;
    withPmid: number;
  };
  /** Curated / suggested REL rows awaiting human Neon Gate C. */
  rows: GateCChecklistRow[];
  instructions: string[];
};

function spoNoteForEdge(edgeId: string): string {
  const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === edgeId);
  if (!edge) return "(unknown edge)";
  return `${edge.subjectLabel} — ${edge.edgeType} — ${edge.objectLabel}`;
}

function assertionForClaim(claimId: string): string {
  return HSI_T2D_IMMUNO_SEED_CLAIMS.find((c) => c.id === claimId)?.assertion ?? "";
}

/**
 * Build Gate C human checklist from ISI REL suggestions + seed provenance.
 * Curated rows with PMIDs are listed as `gateCStatus: pending`.
 */
export function buildGateCChecklist(opts?: {
  generatedAt?: string;
}): GateCChecklistBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const rows: GateCChecklistRow[] = ISI_REL_SUGGESTIONS.map((s) => {
    const edge = HSI_T2D_IMMUNO_SEED_EDGES.find((e) => e.id === s.edgeId);
    const handoff = edge ? hsiEvidenceHandoff(edge) : null;

    let gateCStatus: GateCChecklistRow["gateCStatus"];
    if (!s.suggestedIsiRelationshipId || s.status === "unmapped" || s.matchKind === "none") {
      gateCStatus = "unmapped";
    } else if (handoff?.gateC === "pending" || handoff?.gateC === "hsi_passed") {
      // Even hsi_passed still needs Neon — surface as pending for human product action.
      gateCStatus = "pending";
    } else {
      gateCStatus = "not_started";
    }

    return {
      claimId: s.claimId,
      edgeId: s.edgeId,
      isiRelationshipId: s.suggestedIsiRelationshipId,
      matchKind: s.matchKind,
      mappingStatus: s.status,
      gateCStatus,
      pmid: handoff?.pmid ?? edge?.provenance.pmid ?? null,
      doi: handoff?.doi ?? edge?.provenance.doi ?? null,
      spoNote: spoNoteForEdge(s.edgeId),
      assertion: assertionForClaim(s.claimId),
      rationale: s.rationale,
      autoApprove: false,
    };
  });

  const curatedWithRel = rows.filter(
    (r) => r.isiRelationshipId && (r.mappingStatus === "curated" || r.mappingStatus === "accepted_for_curation"),
  ).length;
  const pendingGateC = rows.filter((r) => r.gateCStatus === "pending").length;
  const unmapped = rows.filter((r) => r.gateCStatus === "unmapped").length;
  const withPmid = rows.filter((r) => Boolean(r.pmid)).length;

  return {
    schemaVersion: GATE_C_CHECKLIST_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    generatedAt,
    summary: {
      totalRows: rows.length,
      curatedWithRel,
      pendingGateC,
      unmapped,
      withPmid,
    },
    rows,
    instructions: [
      "Human-only Neon path: Check → claim_support=supports → Approve on the REL.",
      "Do not auto-approve from this checklist into any product KG.",
      "Re-check S-P-O: HSI spoNote is a curator hint; ISI REL endpoints may differ on related_axis maps.",
      "Unmapped rows must not receive invented REL-* ids.",
      "CDS stays closed until curationReview=approved AND hsiGrade=established.",
    ],
  };
}

/** Markdown table for curator handoff (pending REL rows first). */
export function serializeGateCChecklistMarkdown(
  checklist: GateCChecklistBundle = buildGateCChecklist(),
): string {
  const pending = checklist.rows.filter((r) => r.gateCStatus === "pending");
  const unmapped = checklist.rows.filter((r) => r.gateCStatus === "unmapped");

  const lines: string[] = [
    "# Gate C human checklist",
    "",
    `Schema: \`${checklist.schemaVersion}\` · generated ${checklist.generatedAt}`,
    "",
    "**Not CDS. autoApproveIntoKg=false.** Neon approve+supports is human-only in the consuming product.",
    "",
    "## Summary",
    "",
    `- Curated/accepted with REL: ${checklist.summary.curatedWithRel}`,
    `- Gate C status pending: ${checklist.summary.pendingGateC}`,
    `- Unmapped (no invented REL): ${checklist.summary.unmapped}`,
    `- Rows with PMID: ${checklist.summary.withPmid}`,
    "",
    "## Pending Gate C (curated REL + evidence)",
    "",
    "| Edge | ISI REL | PMID | S-P-O note | Status |",
    "|------|---------|------|------------|--------|",
  ];

  for (const r of pending) {
    lines.push(
      `| \`${r.edgeId}\` | \`${r.isiRelationshipId ?? "—"}\` | ${r.pmid ?? "—"} | ${r.spoNote} | **pending** |`,
    );
  }

  lines.push("", "## Honest unmapped gaps", "", "| Edge | Reason |", "|------|--------|");
  for (const r of unmapped) {
    const short = r.rationale.length > 80 ? `${r.rationale.slice(0, 77)}…` : r.rationale;
    lines.push(`| \`${r.edgeId}\` | ${short} |`);
  }

  lines.push("", "## Instructions", "");
  for (const i of checklist.instructions) {
    lines.push(`- ${i}`);
  }
  lines.push("");

  return lines.join("\n");
}

export function serializeGateCChecklist(
  checklist: GateCChecklistBundle = buildGateCChecklist(),
): string {
  return `${JSON.stringify(checklist, null, 2)}\n`;
}
