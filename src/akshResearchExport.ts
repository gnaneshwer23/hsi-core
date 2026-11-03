/** Public, read-only research context for the separate Aksh application. */
import { buildAkshHitlStubBundle } from "./akshHitl";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "./seed/t2dImmunoMetabolic";

export const AKSH_RESEARCH_SCHEMA = "hsi-aksh-research-1" as const;

export function buildAkshResearchExport(revision: string, generatedAt = new Date().toISOString(), workingTree: "clean" | "includes_local_changes" = "includes_local_changes") {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error("A full HSI source revision is required.");
  if (!Number.isFinite(Date.parse(generatedAt))) throw new Error("Invalid generation timestamp.");
  const edges = new Map(HSI_T2D_IMMUNO_SEED_EDGES.map((edge) => [edge.id, edge]));
  const cards = buildAkshHitlStubBundle().cards.filter((card) => card.akshNodeId !== null).map((card) => {
    const edge = edges.get(card.edgeId);
    if (!edge) throw new Error(`Missing source edge ${card.edgeId}`);
    return {
      claimId: card.claimId,
      edgeId: card.edgeId,
      assertion: card.claimAssertion,
      akshNodeId: card.akshNodeId!,
      loinc: card.loinc,
      grade: card.hsiGrade,
      review: card.curationReview,
      pmid: edge.provenance.pmid,
      doi: edge.provenance.doi,
      provenanceNote: edge.provenance.notes,
      sourceSupport: "not_verified_for_clinical_use" as const,
    };
  });
  return {
    schemaVersion: AKSH_RESEARCH_SCHEMA,
    producer: { repository: "gnaneshwer23/hsi-core" as const, revision, workingTree },
    generatedAt,
    containsPhi: false as const,
    notCds: true as const,
    autoApplyToEhr: false as const,
    cards,
  };
}

export type AkshResearchExport = ReturnType<typeof buildAkshResearchExport>;
