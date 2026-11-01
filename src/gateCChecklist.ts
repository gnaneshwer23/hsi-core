/**
 * Gate C human checklist — curated REL list for ISI product handoff.
 * HSI Neon is red-wave only; ISI Gate C approve (if any) is autumn-snow — separate DBs.
 *
 * Not Neon approval. Rows with evidence stay `gateCStatus: pending` until a
 * human runs Check → claim_support=supports → Approve in the consuming product.
 *
 * Phase 8: also lists translation (Akeno) candidates — human-only HITL;
 * autoApprove always false; clinicalUse=not_for_clinical_use.
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
import {
  buildTranslationHandoffPack,
  type TranslationHandoffCandidate,
} from "./translationHandoff";
import {
  buildGateCModelProposalRows,
  toGateCModelProposalRow,
  type GateCModelProposalRow,
} from "./modelProposal";
import { buildRdkitAdapterProposals } from "./adapters/rdkitAdapter";
import { buildOpenmmAdapterProposals } from "./adapters/openmmAdapter";
import { buildReinvent4AdapterProposals } from "./adapters/reinvent4Adapter";
import { buildEsmAdapterProposals } from "./adapters/esmAdapter";
import { buildAf3AdapterProposals } from "./adapters/af3Adapter";
import { buildTdcAdapterProposals } from "./adapters/tdcAdapter";
import { buildBoltzAdapterProposals } from "./adapters/boltzAdapter";
import { buildIsiAgentsAdapterProposals } from "./adapters/isiAgentsAdapter";

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

/** Phase 8 translation candidate row — human HITL only; never auto-approved. */
export type GateCTranslationCandidateRow = {
  candidateId: string;
  claimId: string;
  edgeId: string;
  akshNodeId: string | null;
  clinicLabel: string | null;
  loinc: string | null;
  hsiGrade: string;
  teachingStatus: string;
  curationReview: string;
  cdsSurfacable: false;
  status: "deferred_until_hitl";
  clinicalUse: "not_for_clinical_use";
  hitlRequired: true;
  autoApprove: false;
  intendedConsumer: "akeno_hsi_core";
  pmid: string | null;
  spoNote: string;
  assertion: string;
  axesNote: "teachingStatus ≠ hsiGrade ≠ CDS — never collapse";
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
    /** Phase 8 translation candidates awaiting human HITL. */
    translationCandidates: number;
    translationHitlRequired: number;
    translationCdsSurfacable: 0;
    /** P1.5 model-proposal drafts → Gate C pending only. */
    modelProposals: number;
    modelProposalsPending: number;
    modelProposalsAutoApprove: 0;
  };
  /** Curated / suggested REL rows awaiting human Neon Gate C. */
  rows: GateCChecklistRow[];
  /** Phase 8 clinic-facing handoff candidates (Akeno = future; not clinical). */
  translationCandidates: GateCTranslationCandidateRow[];
  /**
   * Typed ModelProposalArtifact drafts (autoApprove=false).
   * Never graded KG edges; never Neon auto-approve; mayFlipEvidenceGrade=false.
   */
  modelProposals: GateCModelProposalRow[];
  instructions: string[];
};

function toTranslationChecklistRow(
  c: TranslationHandoffCandidate,
): GateCTranslationCandidateRow {
  return {
    candidateId: c.id,
    claimId: c.claimId,
    edgeId: c.edgeId,
    akshNodeId: c.akshNodeId,
    clinicLabel: c.clinicLabel,
    loinc: c.loinc,
    hsiGrade: c.hsiGrade,
    teachingStatus: c.teachingStatus,
    curationReview: c.curationReview,
    cdsSurfacable: false,
    status: "deferred_until_hitl",
    clinicalUse: "not_for_clinical_use",
    hitlRequired: true,
    autoApprove: false,
    intendedConsumer: "akeno_hsi_core",
    pmid: c.pmid,
    spoNote: c.spoNote,
    assertion: c.assertion,
    axesNote: "teachingStatus ≠ hsiGrade ≠ CDS — never collapse",
  };
}

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
 * Phase 8 adds translationCandidates (HITL-required; autoApprove=false).
 * P1.5 adds modelProposals (typed ModelProposalArtifact; autoApprove=false).
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

  const translationPack = buildTranslationHandoffPack({ generatedAt });
  const translationCandidates = translationPack.candidates.map(toTranslationChecklistRow);
  const exampleProposals = buildGateCModelProposalRows({ createdAt: generatedAt });
  // P3.0–P3.3 spike proposals (forceStub for deterministic Gate C / publish).
  const rdkitProposals = buildRdkitAdapterProposals({
    createdAt: generatedAt,
    forceStub: true,
  }).map(toGateCModelProposalRow);
  const openmmProposals = buildOpenmmAdapterProposals({
    createdAt: generatedAt,
    forceStub: true,
  }).map(toGateCModelProposalRow);
  const reinvent4Proposals = buildReinvent4AdapterProposals({
    createdAt: generatedAt,
    forceStub: true,
  }).map(toGateCModelProposalRow);
  const esmProposals = buildEsmAdapterProposals({
    createdAt: generatedAt,
    forceStub: true,
  }).map(toGateCModelProposalRow);
  const af3Proposals = buildAf3AdapterProposals({
    createdAt: generatedAt,
  }).map(toGateCModelProposalRow);
  const tdcProposals = buildTdcAdapterProposals({
    createdAt: generatedAt,
  }).map(toGateCModelProposalRow);
  const boltzProposals = buildBoltzAdapterProposals({
    createdAt: generatedAt,
  }).map(toGateCModelProposalRow);
  const isiAgentsProposals = buildIsiAgentsAdapterProposals({
    createdAt: generatedAt,
  }).map(toGateCModelProposalRow);
  const modelProposals = [
    ...exampleProposals,
    ...rdkitProposals,
    ...openmmProposals,
    ...reinvent4Proposals,
    ...esmProposals,
    ...af3Proposals,
    ...tdcProposals,
    ...boltzProposals,
    ...isiAgentsProposals,
  ];

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
      translationCandidates: translationCandidates.length,
      translationHitlRequired: translationCandidates.filter((t) => t.hitlRequired).length,
      translationCdsSurfacable: 0,
      modelProposals: modelProposals.length,
      modelProposalsPending: modelProposals.filter((p) => p.gateCStatus === "pending")
        .length,
      modelProposalsAutoApprove: 0,
    },
    rows,
    translationCandidates,
    modelProposals,
    instructions: [
      "Human-only Neon path: Check → claim_support=supports → Approve on the REL.",
      "Do not auto-approve from this checklist into any product KG.",
      "Re-check S-P-O: HSI spoNote is a curator hint; ISI REL endpoints may differ on related_axis maps.",
      "Unmapped rows must not receive invented REL-* ids.",
      "CDS stays closed until curationReview=approved AND hsiGrade=established.",
      "Phase 8 translationCandidates: human HITL only (autoApprove=false); clinicalUse=not_for_clinical_use; Akeno = future consumer — not live CDS.",
      "teachingStatus ≠ hsiGrade ≠ CDS — never collapse axes when reviewing translation candidates.",
      "P1.5 modelProposals: typed ModelProposalArtifact drafts only (autoApprove=false; mayFlipEvidenceGrade=false). Never write hsiGrade/curationReview from a model. Not Neon auto-approve — human Gate C only.",
      "P2.2 embedding sidecars (hsi-embedding-sidecars.json): hash/ref metadata only; doesNotSetHsiGrade=true; autoApprove=false — never treat similarity as Gate C pass or grade flip.",
      "P2.3 offline eval harness (hsi-model-eval-harness.*): scores proposals/sidecars against frozen packs only; mayUseLivePhi=false; never flips grades; never auto-approves into KG.",
      "P2.4 ClinVar/TCGA pointers (hsi-external-genome-pointers.json): citation/ref only (accession + URL + disease/gene context + optional edgeIds); reviewRequired=true; doesNotSetHsiGrade; no bulk genome dump / PHI — Gate C still required.",
      "P2.5 P3 adapters (docs/P3_ADAPTER_RFC.md + hsi-p3-adapter-license-matrix.json): emit ModelProposalArtifacts only; license gate before run (blockedUntilSignOff); mayFlipEvidenceGrade=false; vendorsModelWeights=false; never claim commercial signed without evidence.",
      "P3.0 RDKit thin adapter spike (hsi-rdkit-adapter-proposals.*): sourceAdapterOrAgent=adapter-rdkit; runtime stub|rdkit; ModelProposalArtifacts only → pending; autoApprove=false; does not set hsiGrade; refuse blockedUntilSignOff adapters.",
      "P3.1 OpenMM thin adapter spike (hsi-openmm-adapter-proposals.*): sourceAdapterOrAgent=adapter-openmm; runtime stub|openmm; ModelProposalArtifacts only → pending; autoApprove=false; does not set hsiGrade; MD ≠ Gate C evidence alone; refuse blockedUntilSignOff adapters.",
      "P3.2 REINVENT4 thin adapter spike (hsi-reinvent4-adapter-proposals.*): sourceAdapterOrAgent=adapter-reinvent4; runtime stub|reinvent; ModelProposalArtifacts only → pending; autoApprove=false; does not set hsiGrade; never clinic recommendation path; no multi-GB weights; refuse blockedUntilSignOff adapters.",
      "P3.3 FAIR ESM-2 thin embedding stub (hsi-esm-adapter-proposals.*): sourceAdapterOrAgent=adapter-esm; runtime stub|esm; ModelProposalArtifacts + embedding sidecar refs → pending; autoApprove=false; does not set hsiGrade; no weight vendoring / PHI sequences.",
      "AF3/TDC/ISI research sign-off fixtures + Boltz weights policy: stub proposals → pending; AF3 notCommercial / NOT commercial rights; Boltz requires WEIGHTS_POLICY_ACK; never vendor multi-GB weights (docs/P3_WEIGHTS_AND_LICENSE_POLICY.md).",
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
    "**Not CDS. autoApproveIntoKg=false.** Neon approve+supports is human-only in ISI product Neon (autumn-snow) — never HSI red-wave.",
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

  lines.push(
    "",
    "## Phase 8 translation candidates (HITL · not for clinical use)",
    "",
    `Candidates: ${checklist.summary.translationCandidates} · hitlRequired=${checklist.summary.translationHitlRequired} · cdsSurfacable=${checklist.summary.translationCdsSurfacable}`,
    "",
    "| Candidate | Clinic | LOINC | Grade | Teaching | Status | autoApprove |",
    "|-----------|--------|-------|-------|----------|--------|-------------|",
  );
  for (const t of checklist.translationCandidates) {
    lines.push(
      `| \`${t.candidateId}\` | ${t.clinicLabel ?? "—"} (\`${t.akshNodeId ?? "—"}\`) | ${t.loinc ?? "—"} | ${t.hsiGrade} | ${t.teachingStatus} | **${t.status}** | \`${t.autoApprove}\` |`,
    );
  }

  lines.push(
    "",
    "## P1.5 model proposals (pending · never auto-approve)",
    "",
    `Proposals: ${checklist.summary.modelProposals} · pending=${checklist.summary.modelProposalsPending} · autoApprove=${checklist.summary.modelProposalsAutoApprove}`,
    "",
    "| Proposal | S — P — O | Teaching (suggested) | Evidence hints | Status | autoApprove |",
    "|----------|-----------|----------------------|----------------|--------|-------------|",
  );
  for (const p of checklist.modelProposals) {
    const hints = p.evidenceHints.slice(0, 3).join("; ");
    lines.push(
      `| \`${p.proposalId}\` | ${p.proposedSubject} — ${p.proposedPredicate} — ${p.proposedObject} | ${p.suggestedTeachingStatus} | ${hints} | **${p.gateCStatus}** | \`${p.autoApprove}\` |`,
    );
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
