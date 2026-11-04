import { validateHsiLogicalGraph } from "./livingHealthKnowledgeGraph";
import type { HsiGraphNode, HsiGraphRelationship } from "./livingHealthKnowledgeGraph";
import { resolveHsiOntologyIdentity } from "./hsiOntologyRegistry";
import type { HsiOntologyMapping } from "./hsiOntologyRegistry";

export type SscGraphDraft = {
  schemaVersion: string;
  release: { id: string; version: string; graphPromotable: boolean };
  provenance: { reviewedByHuman: boolean; rightsCleared: boolean };
  nodes: HsiGraphNode[];
  relationships: HsiGraphRelationship[];
};

export function validateSscGraphDraft(d: SscGraphDraft): void {
  if (d.schemaVersion !== "hsi-ssc-graph-draft-1" ||
      d.release.graphPromotable || d.provenance.reviewedByHuman || d.provenance.rightsCleared) {
    throw new Error("Expected unreviewed SSc draft");
  }
  validateHsiLogicalGraph(d.nodes, d.relationships);
  if (d.nodes.some(n => n.visibility !== "governed_research" || n.reviewState !== "draft")) {
    throw new Error("Invalid SSc node scope");
  }
  if (d.relationships.some(e => e.visibility !== "governed_research" ||
      e.reviewState !== "draft" || e.causalClaim || !!e.reviewDecisionId ||
      !e.sourceEvidenceIds.length || !e.context.sourceLocator)) {
    throw new Error("Invalid SSc relationship provenance");
  }
}

export function resolveSscDraftIdentity(d: SscGraphDraft, system: string, value: string, mappings: readonly HsiOntologyMapping[] = []) {
  validateSscGraphDraft(d);
  return resolveHsiOntologyIdentity({ system, value, nodes: d.nodes, mappings });
}
