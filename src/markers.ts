/**
 * Claim → LOINC marker mapping for bench↔bedside translation.
 * Seeds wire subject/object node ids to curated markers when available.
 */
import type { HsiClaim, HsiEdge, HsiMarker } from "./schema";
import { HSI_MARKERS, HSI_T2D_IMMUNO_SEED_CLAIMS, HSI_T2D_IMMUNO_SEED_EDGES } from "./seed/t2dImmunoMetabolic";

export type HsiClaimMarkerLink = {
  claimId: string;
  edgeId: string;
  marker: HsiMarker;
  /** How the marker was attached to the claim/edge. */
  linkKind: "subject_node" | "object_node" | "explicit_card";
};

const MARKER_BY_ID = new Map(HSI_MARKERS.map((m) => [m.id, m]));

/** Look up a marker by HSI node id (e.g. HSI-N-hba1c). */
export function markerByNodeId(nodeId: string): HsiMarker | undefined {
  return MARKER_BY_ID.get(nodeId);
}

/** Markers that already carry a LOINC code. */
export function markersWithLoinc(markers: readonly HsiMarker[] = HSI_MARKERS): HsiMarker[] {
  return markers.filter((m) => Boolean(m.loinc?.trim()));
}

/**
 * Resolve claim → LOINC-capable marker via seed edges (subject or object node).
 * Prefer subject when both ends are markers.
 */
export function linkClaimToMarker(
  claimId: string,
  edges: readonly HsiEdge[] = HSI_T2D_IMMUNO_SEED_EDGES,
): HsiClaimMarkerLink | null {
  const edge = edges.find((e) => e.claimId === claimId);
  if (!edge) return null;

  const subjectMarker = markerByNodeId(edge.subjectId);
  if (subjectMarker) {
    return {
      claimId,
      edgeId: edge.id,
      marker: subjectMarker,
      linkKind: "subject_node",
    };
  }

  const objectMarker = markerByNodeId(edge.objectId);
  if (objectMarker) {
    return {
      claimId,
      edgeId: edge.id,
      marker: objectMarker,
      linkKind: "object_node",
    };
  }

  return null;
}

/** All seed claims that resolve to a LOINC-coded marker. */
export function seedClaimLoincMap(): Array<HsiClaimMarkerLink & { claim: HsiClaim; loinc: string }> {
  const out: Array<HsiClaimMarkerLink & { claim: HsiClaim; loinc: string }> = [];
  for (const claim of HSI_T2D_IMMUNO_SEED_CLAIMS) {
    const link = linkClaimToMarker(claim.id);
    if (!link?.marker.loinc) continue;
    out.push({ ...link, claim, loinc: link.marker.loinc });
  }
  return out;
}

export function loincCoverageSummary(edges: readonly HsiEdge[] = HSI_T2D_IMMUNO_SEED_EDGES): {
  edgeCount: number;
  claimsWithLoincMarker: number;
  markersWithLoinc: number;
  markersMissingLoinc: number;
} {
  const linked = new Set<string>();
  for (const edge of edges) {
    const link = linkClaimToMarker(edge.claimId, edges);
    if (link?.marker.loinc) linked.add(edge.claimId);
  }
  const withLoinc = markersWithLoinc();
  return {
    edgeCount: edges.length,
    claimsWithLoincMarker: linked.size,
    markersWithLoinc: withLoinc.length,
    markersMissingLoinc: HSI_MARKERS.length - withLoinc.length,
  };
}
