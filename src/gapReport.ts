/**
 * Phase 0 backlog b2 — gap report: how far Aksh / ISI graphs are from the shared schema.
 * Seed inventory + mapping slots (isiRelationshipId / akshNodeId). No invented science.
 */
import type { HsiGrade } from "./grades";
import type { HsiClaim, HsiDomain, HsiEdge } from "./schema";
import { HSI_DOMAINS, HSI_EDGE_TYPES } from "./schema";
import { summarizeGradeCounts } from "./validate";
import {
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
  listBridgeCandidates,
} from "./seed/t2dImmunoMetabolic";
import { linkClaimToMarker, loincCoverageSummary } from "./markers";

export type HsiMappingGap = {
  claimId: string;
  edgeId: string;
  assertion: string;
  domain: HsiDomain;
  hsiGrade: HsiGrade;
  missing: Array<
    | "isi_relationship_id"
    | "aksh_node_id"
    | "durable_locator"
    | "loinc_marker"
    | "gate_c_approved"
  >;
};

export type HsiSchemaGapReport = {
  schemaVersion: "hsi-gap-report-1";
  generatedAt: string;
  summary: {
    seedEdges: number;
    bridgeCandidates: number;
    gradeCounts: Record<HsiGrade, number>;
    claimsMappedToIsi: number;
    claimsMappedToAksh: number;
    claimsWithDurableLocator: number;
    loinc: ReturnType<typeof loincCoverageSummary>;
    edgeTypesInUse: string[];
    domainsInUse: string[];
    unusedEdgeTypes: string[];
    unusedDomains: string[];
  };
  gaps: HsiMappingGap[];
  /** Highest-leverage unmapped bridge candidates for P1 shortlist work. */
  bridgeShortlist: Array<{
    edgeId: string;
    claimId: string;
    assertion: string;
    subjectLabel: string;
    objectLabel: string;
  }>;
  nextActions: string[];
};

function hasDurableLocator(edge: HsiEdge): boolean {
  return Boolean(
    edge.provenance.pmid?.trim() ||
      edge.provenance.doi?.trim() ||
      edge.provenance.citationLabel?.trim(),
  );
}

function gapsForClaim(claim: HsiClaim, edge: HsiEdge): HsiMappingGap["missing"] {
  const missing: HsiMappingGap["missing"] = [];
  if (!claim.isiRelationshipId) missing.push("isi_relationship_id");
  if (!claim.akshNodeId) missing.push("aksh_node_id");
  if (!hasDurableLocator(edge)) missing.push("durable_locator");
  const link = linkClaimToMarker(claim.id);
  if (!link?.marker.loinc) missing.push("loinc_marker");
  if (edge.curationReview !== "approved") missing.push("gate_c_approved");
  return missing;
}

export function buildSchemaGapReport(opts?: {
  edges?: readonly HsiEdge[];
  claims?: readonly HsiClaim[];
  generatedAt?: string;
}): HsiSchemaGapReport {
  const edges = opts?.edges ?? HSI_T2D_IMMUNO_SEED_EDGES;
  const claims = opts?.claims ?? HSI_T2D_IMMUNO_SEED_CLAIMS;
  const claimById = new Map(claims.map((c) => [c.id, c]));

  const domainsInUse = [...new Set(edges.map((e) => e.domain))];
  const edgeTypesInUse = [...new Set(edges.map((e) => e.edgeType))];

  let claimsMappedToIsi = 0;
  let claimsMappedToAksh = 0;
  let claimsWithDurableLocator = 0;
  const gaps: HsiMappingGap[] = [];

  for (const edge of edges) {
    const claim = claimById.get(edge.claimId);
    if (!claim) continue;
    if (claim.isiRelationshipId) claimsMappedToIsi += 1;
    if (claim.akshNodeId) claimsMappedToAksh += 1;
    if (hasDurableLocator(edge)) claimsWithDurableLocator += 1;

    const missing = gapsForClaim(claim, edge);
    if (missing.length > 0) {
      gaps.push({
        claimId: claim.id,
        edgeId: edge.id,
        assertion: claim.assertion,
        domain: claim.domain,
        hsiGrade: edge.hsiGrade,
        missing,
      });
    }
  }

  const bridges = listBridgeCandidates().map((e) => {
    const claim = claimById.get(e.claimId);
    return {
      edgeId: e.id,
      claimId: e.claimId,
      assertion: claim?.assertion ?? "",
      subjectLabel: e.subjectLabel,
      objectLabel: e.objectLabel,
    };
  });

  const nextActions = [
    "Map ISI REL-* ids into claim.isiRelationshipId for discovery edges already in Immune City.",
    "Map Aksh clinical KG node / rule ids into claim.akshNodeId for T2D HITL CDS candidates.",
    "Evidence sprint: replace citationLabel placeholders with PMID/DOI and Gate C review.",
    "Extend LOINC coverage beyond HbA1c / FPG / hs-CRP / IL-6 for bridge markers.",
    "Do not mark CDS-surfacable until curationReview=approved and hsiGrade=established.",
  ];

  return {
    schemaVersion: "hsi-gap-report-1",
    generatedAt: opts?.generatedAt ?? new Date().toISOString(),
    summary: {
      seedEdges: edges.length,
      bridgeCandidates: bridges.length,
      gradeCounts: summarizeGradeCounts(edges),
      claimsMappedToIsi,
      claimsMappedToAksh,
      claimsWithDurableLocator,
      loinc: loincCoverageSummary(edges),
      edgeTypesInUse: edgeTypesInUse.sort(),
      domainsInUse: domainsInUse.sort(),
      unusedEdgeTypes: HSI_EDGE_TYPES.filter((t) => !edgeTypesInUse.includes(t)),
      unusedDomains: HSI_DOMAINS.filter((d) => !domainsInUse.includes(d)),
    },
    gaps,
    bridgeShortlist: bridges,
    nextActions,
  };
}

export function serializeGapReport(report: HsiSchemaGapReport = buildSchemaGapReport()): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
