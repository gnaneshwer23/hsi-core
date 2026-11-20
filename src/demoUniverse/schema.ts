import type {
  DemoEvidenceClaim,
  DemoMechanismEdge,
  DemoPublication,
  DemoProvenanceClass,
  DemoUniverseBundle,
} from "./types";
import { DEMO_HONESTY, DEMO_UNIVERSE_SCHEMA } from "./types";

export type DemoIntegrityIssue = {
  code: string;
  message: string;
  recordId?: string;
};

function requireIds(
  ids: readonly string[],
  known: Set<string>,
  code: string,
  ownerId: string,
  issues: DemoIntegrityIssue[],
) {
  for (const id of ids) {
    if (!known.has(id)) {
      issues.push({ code, message: `Missing reference ${id}`, recordId: ownerId });
    }
  }
}

function assertProvenanceRules(
  publication: DemoPublication,
  issues: DemoIntegrityIssue[],
) {
  if (publication.provenance === "verified_public_source") {
    if (!publication.pmid && !publication.doi) {
      issues.push({
        code: "verified_source_missing_identifier",
        message: "Verified public sources must carry a real PMID or DOI",
        recordId: publication.id,
      });
    }
  } else if (publication.pmid || publication.doi) {
    issues.push({
      code: "synthetic_must_not_use_real_identifiers",
      message: "Non-verified records must not carry PMID/DOI (no fake identifiers)",
      recordId: publication.id,
    });
  }
  if (publication.abstractReproduced !== false) {
    issues.push({
      code: "abstract_reproduced",
      message: "Demo publications must not reproduce abstracts",
      recordId: publication.id,
    });
  }
}

function assertClaimProvenance(claim: DemoEvidenceClaim, issues: DemoIntegrityIssue[]) {
  if (claim.honesty.canWriteToProductionGraph !== false) {
    issues.push({
      code: "write_flag_unsafe",
      message: "Demo claims must set canWriteToProductionGraph=false",
      recordId: claim.id,
    });
  }
  if (
    claim.provenance !== "fully_synthetic_fixture" &&
    (claim.simulatedResultLabel || claim.simulatedResultDirection)
  ) {
    issues.push({
      code: "simulated_result_on_non_synthetic",
      message: "Simulated numeric results are only allowed on fully synthetic fixtures",
      recordId: claim.id,
    });
  }
}

function assertEdgeHonesty(edge: DemoMechanismEdge, issues: DemoIntegrityIssue[]) {
  if (edge.honesty.scientificApproval !== false) {
    issues.push({
      code: "edge_claims_approval",
      message: "Demo edges must not claim scientificApproval",
      recordId: edge.id,
    });
  }
}

const ALLOWED_PROVENANCE: readonly DemoProvenanceClass[] = [
  "verified_public_source",
  "curated_demonstration_interpretation",
  "fully_synthetic_fixture",
];

/** Fail-closed referential integrity + provenance rules for a universe bundle. */
export function validateDemoUniverseBundle(bundle: DemoUniverseBundle): DemoIntegrityIssue[] {
  const issues: DemoIntegrityIssue[] = [];
  if (bundle.schemaVersion !== DEMO_UNIVERSE_SCHEMA) {
    issues.push({
      code: "schema_mismatch",
      message: `Expected ${DEMO_UNIVERSE_SCHEMA}, got ${bundle.schemaVersion}`,
    });
  }
  if (bundle.honesty.canWriteToProductionGraph !== false) {
    issues.push({ code: "bundle_write_unsafe", message: "Bundle must remain read-only vs production graph" });
  }
  for (const key of Object.keys(DEMO_HONESTY) as (keyof typeof DEMO_HONESTY)[]) {
    if (bundle.honesty[key] !== DEMO_HONESTY[key]) {
      issues.push({ code: "honesty_drift", message: `Honesty flag ${key} drifted from DEMO_HONESTY` });
    }
  }

  const pubIds = new Set(bundle.publications.map((p) => p.id));
  const ctxIds = new Set(bundle.contexts.map((c) => c.id));
  const claimIds = new Set(bundle.claims.map((c) => c.id));
  const nodeIds = new Set(bundle.nodes.map((n) => n.id));
  const edgeIds = new Set(bundle.edges.map((e) => e.id));
  const comparisonIds = new Set(bundle.comparisons.map((c) => c.id));
  const gapIds = new Set(bundle.gaps.map((g) => g.id));
  const hypIds = new Set(bundle.hypotheses.map((h) => h.id));
  const briefIds = new Set(bundle.briefs.map((b) => b.id));
  const orgIds = new Set(bundle.organisations.map((o) => o.id));
  const researcherIds = new Set(bundle.researchers.map((r) => r.id));
  const projectIds = new Set(bundle.projects.map((p) => p.id));

  for (const p of bundle.publications) assertProvenanceRules(p, issues);
  for (const c of bundle.claims) {
    if (!ALLOWED_PROVENANCE.includes(c.provenance)) {
      issues.push({ code: "unknown_provenance", message: c.provenance, recordId: c.id });
    }
    assertClaimProvenance(c, issues);
    if (c.publicationId) requireIds([c.publicationId], pubIds, "missing_publication", c.id, issues);
    requireIds([c.contextId], ctxIds, "missing_context", c.id, issues);
    requireIds([c.subjectNodeId, c.objectNodeId], nodeIds, "missing_claim_node", c.id, issues);
  }
  for (const e of bundle.edges) {
    assertEdgeHonesty(e, issues);
    requireIds([e.fromNodeId, e.toNodeId], nodeIds, "missing_edge_node", e.id, issues);
    requireIds(e.evidenceClaimIds, claimIds, "missing_edge_claim", e.id, issues);
  }
  for (const cmp of bundle.comparisons) {
    requireIds([cmp.leftClaimId, cmp.rightClaimId], claimIds, "missing_comparison_claim", cmp.id, issues);
  }
  for (const h of bundle.hypotheses) {
    requireIds(h.supportingClaimIds, claimIds, "missing_hyp_support", h.id, issues);
    requireIds(h.opposingClaimIds, claimIds, "missing_hyp_oppose", h.id, issues);
  }
  for (const b of bundle.briefs) {
    requireIds([b.investigationId], new Set([bundle.investigation.id]), "brief_investigation", b.id, issues);
    requireIds(b.evidenceClaimIds, claimIds, "brief_claim", b.id, issues);
    requireIds(b.mechanismEdgeIds, edgeIds, "brief_edge", b.id, issues);
    requireIds(b.comparisonIds, comparisonIds, "brief_comparison", b.id, issues);
    requireIds(b.gapIds, gapIds, "brief_gap", b.id, issues);
    requireIds(b.hypothesisIds, hypIds, "brief_hyp", b.id, issues);
  }
  for (const r of bundle.researchers) {
    requireIds([r.organisationId], orgIds, "researcher_org", r.id, issues);
  }
  for (const p of bundle.projects) {
    requireIds([p.organisationId], orgIds, "project_org", p.id, issues);
    requireIds([p.leadResearcherId], researcherIds, "project_lead", p.id, issues);
    requireIds(p.investigationIds, new Set([bundle.investigation.id]), "project_investigation", p.id, issues);
  }

  const inv = bundle.investigation;
  requireIds([inv.ownerId], researcherIds, "inv_owner", inv.id, issues);
  requireIds([inv.projectId], projectIds, "inv_project", inv.id, issues);
  requireIds(inv.evidenceClaimIds, claimIds, "inv_claim", inv.id, issues);
  requireIds(inv.mechanismNodeIds, nodeIds, "inv_node", inv.id, issues);
  requireIds(inv.mechanismEdgeIds, edgeIds, "inv_edge", inv.id, issues);
  requireIds(inv.comparisonIds, comparisonIds, "inv_comparison", inv.id, issues);
  requireIds(inv.gapIds, gapIds, "inv_gap", inv.id, issues);
  requireIds(inv.hypothesisIds, hypIds, "inv_hyp", inv.id, issues);
  requireIds([inv.briefId], briefIds, "inv_brief", inv.id, issues);
  requireIds(bundle.scenario.investigationIds, new Set([inv.id]), "scenario_investigation", bundle.scenario.id, issues);
  requireIds(bundle.scenario.sharedNodeIds, nodeIds, "scenario_node", bundle.scenario.id, issues);

  if (inv.question.trim().length < 20) {
    issues.push({ code: "question_too_short", message: "Investigation question is too short", recordId: inv.id });
  }
  if (inv.evidenceClaimIds.length < 2) {
    issues.push({ code: "need_claims", message: "Core demo needs at least two evidence claims", recordId: inv.id });
  }
  if (inv.comparisonIds.length < 1) {
    issues.push({ code: "need_comparison", message: "Core demo needs a conflicting-findings comparison", recordId: inv.id });
  }
  if (inv.hypothesisIds.length < 1 || inv.briefId.length < 1) {
    issues.push({ code: "need_hypothesis_brief", message: "Core demo needs hypothesis and brief", recordId: inv.id });
  }

  return issues;
}

export function assertValidDemoUniverseBundle(bundle: DemoUniverseBundle): void {
  const issues = validateDemoUniverseBundle(bundle);
  if (issues.length) {
    throw new Error(
      `Demo universe integrity failed (${issues.length}): ${issues
        .slice(0, 8)
        .map((i) => `${i.code}${i.recordId ? `@${i.recordId}` : ""}`)
        .join("; ")}`,
    );
  }
}
