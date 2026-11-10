/**
 * Conservative Reactome -> HSI ontology bridge.
 * Produces a draft graph node only. No cross-ontology equivalence or approved
 * scientific relationship is inferred from a Reactome pathway lookup.
 */
import type {HsiGraphNode} from "../livingHealthKnowledgeGraph";
import {HSI_ONTOLOGY_NAMESPACES, resolveHsiOntologyIdentity, validateHsiOntologyIdentifier} from "../hsiOntologyRegistry";
import type {ReactomePathwayMetadata} from "./reactomePathwayLookup";

export function reactomePathwayDraftNode(pathway: ReactomePathwayMetadata): HsiGraphNode {
  if (pathway.provider !== "reactome" || pathway.reviewState !== "unreviewed" ||
      pathway.scientificApproval !== false || pathway.graphPromotable !== false) {
    throw new Error("Only unreviewed, non-promotable Reactome metadata may be mapped");
  }
  validateHsiOntologyIdentifier("Reactome", pathway.stableId, HSI_ONTOLOGY_NAMESPACES);
  return {
    schemaVersion: "hsi-lhkg-node-1",
    id: `pathway.reactome.${pathway.stableId}`,
    kind: "pathway",
    layer: "biomedical_evidence",
    preferredLabel: pathway.displayName,
    aliases: [],
    sourceIdentifiers: [{system:"Reactome", value:pathway.stableId, mapping:"exact"}],
    version: "1.0.0",
    visibility: "governed_research",
    reviewState: "draft",
    sourceProvenance: [`reactome:metadata:${pathway.stableId}:${pathway.retrievedAt}`],
  };
}

/** Detect collisions; do not persist or promote candidate nodes. */
export function resolveReactomePathwayDraft(
  pathway: ReactomePathwayMetadata,
  existingNodes: readonly HsiGraphNode[],
) {
  const draft = reactomePathwayDraftNode(pathway);
  const resolution = resolveHsiOntologyIdentity({
    system:"Reactome", value:pathway.stableId, nodes:existingNodes,
  });
  return {draft, resolution, needsHumanReview:true as const, graphPromotable:false as const};
}
