/**
 * Versioned research-graph releases produced only after a human approval.
 * Association is not stored as a causal mechanism. Patient rows are not copied in.
 */
import { createHash } from "node:crypto";

export type EpistemicType = "association" | "unvalidated_hypothesis" | "causal_mechanism";

export type ReleaseEdge = {
  id: string;
  source: string;
  target: string;
  epistemicType: EpistemicType;
  biologicalContext: string;
  provenance: readonly string[];
  uncertainty: string;
  reviewState: "unreviewed" | "approved";
  reviewDecisionId: string | null;
};

export type GraphRelease = {
  releaseId: string;
  version: string;
  priorReleaseId: string | null;
  reviewDecisionId: string | null;
  createdAt: string;
  edges: ReleaseEdge[];
  manifestHash: string;
  synthetic: true;
  patientDataIncluded: false;
};

export function manifestHash(edges: readonly ReleaseEdge[]): string {
  return createHash("sha256").update(JSON.stringify(edges)).digest("hex");
}

export function seedRelease(): GraphRelease {
  const edges: ReleaseEdge[] = [
    {
      id: "edge-butyrate-barrier",
      source: "metabolite:butyrate",
      target: "process:intestinal-barrier",
      epistemicType: "association",
      biologicalContext: "gut lumen, microbial metabolite, host epithelium",
      provenance: ["seed:gut-scfa"],
      uncertainty: "direction is reported in models; human effect size is unresolved",
      reviewState: "unreviewed",
      reviewDecisionId: null,
    },
    {
      id: "edge-tnf-inflammation",
      source: "gene:TNF",
      target: "process:systemic-inflammation",
      epistemicType: "association",
      biologicalContext: "immune cytokine signalling; rheumatoid arthritis is one context, not a universal mechanism",
      provenance: ["seed:ra-tnf"],
      uncertainty: "drug response is heterogeneous",
      reviewState: "unreviewed",
      reviewDecisionId: null,
    },
  ];
  return {
    releaseId: "lhkg-demo-1.0.0",
    version: "1.0.0",
    priorReleaseId: null,
    reviewDecisionId: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    edges,
    manifestHash: manifestHash(edges),
    synthetic: true,
    patientDataIncluded: false,
  };
}

export function publishApprovedRelease(input: {
  prior: GraphRelease;
  edges: ReleaseEdge[];
  reviewDecisionId: string;
  createdAt: string;
}): GraphRelease {
  if (input.edges.some((edge) => edge.epistemicType === "causal_mechanism" && edge.reviewState !== "approved")) {
    throw new Error("A causal mechanism edge requires an approved review");
  }
  const version = bumpPatch(input.prior.version);
  return {
    releaseId: `lhkg-demo-${version}`,
    version,
    priorReleaseId: input.prior.releaseId,
    reviewDecisionId: input.reviewDecisionId,
    createdAt: input.createdAt,
    edges: input.edges,
    manifestHash: manifestHash(input.edges),
    synthetic: true,
    patientDataIncluded: false,
  };
}

function bumpPatch(version: string): string {
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  return `${major ?? 1}.${minor ?? 0}.${(patch ?? 0) + 1}`;
}
