/**
 * ISI-compatible JSON export — graded edges for Immune City / Ask / Radar ingest.
 * Discovery-only; not CDS. No PHI.
 */
import type { HsiEdge, HsiClaim, HsiMarker } from "./schema";
import { HSI_GRADES } from "./grades";
import { summarizeGradeCounts } from "./validate";
import { HSI_T2D_IMMUNO_SEED_CLAIMS, HSI_T2D_IMMUNO_SEED_EDGES, HSI_MARKERS } from "./seed/t2dImmunoMetabolic";
import { seedClaimLoincMap, loincCoverageSummary } from "./markers";
import { HSI_SAFETY_RELEASE_CRITERIA_V0 } from "./releaseCriteria";
import {
  summarizeIsiRelMappings,
  type IsiRelMappingSummary,
} from "./mappings/isiRelSuggestions";
import {
  summarizeAkshNodeMappings,
  type AkshNodeMappingSummary,
} from "./mappings/akshNodeSuggestions";
import { claimsWithProductMappings } from "./mappings/productMappings";

export type IsiHsiExportBundle = {
  schemaVersion: "hsi-isi-export-1";
  productLabel: "immune-super-intelligence";
  notCds: true;
  generatedAt: string;
  grades: typeof HSI_GRADES;
  gradeCounts: Record<(typeof HSI_GRADES)[number], number>;
  loincCoverage: ReturnType<typeof loincCoverageSummary>;
  edges: HsiEdge[];
  claims: HsiClaim[];
  markers: HsiMarker[];
  claimLoincLinks: ReturnType<typeof seedClaimLoincMap>;
  safetyCriteriaIds: string[];
  /** Suggested REL-* pointers only — never Gate C approval. */
  isiRelMapping: IsiRelMappingSummary;
  /** Suggested Aksh node pointers — never CDS / EHR write-back. */
  akshNodeMapping: AkshNodeMappingSummary;
};

export function buildIsiExportBundle(opts?: {
  edges?: readonly HsiEdge[];
  claims?: readonly HsiClaim[];
  markers?: readonly HsiMarker[];
  generatedAt?: string;
}): IsiHsiExportBundle {
  const edges = [...(opts?.edges ?? HSI_T2D_IMMUNO_SEED_EDGES)];
  const claims = [...(opts?.claims ?? claimsWithProductMappings(HSI_T2D_IMMUNO_SEED_CLAIMS))];
  const markers = [...(opts?.markers ?? HSI_MARKERS)];

  return {
    schemaVersion: "hsi-isi-export-1",
    productLabel: "immune-super-intelligence",
    notCds: true,
    generatedAt: opts?.generatedAt ?? new Date().toISOString(),
    grades: HSI_GRADES,
    gradeCounts: summarizeGradeCounts(edges),
    loincCoverage: loincCoverageSummary(edges),
    edges,
    claims,
    markers,
    claimLoincLinks: seedClaimLoincMap(),
    safetyCriteriaIds: HSI_SAFETY_RELEASE_CRITERIA_V0.map((c) => c.id),
    isiRelMapping: summarizeIsiRelMappings(),
    akshNodeMapping: summarizeAkshNodeMappings(),
  };
}

export function serializeIsiExport(bundle: IsiHsiExportBundle = buildIsiExportBundle()): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
