/** Draft-only bridge from UniProt metadata to the existing HSI graph contract. */
import type {HsiGraphNode} from "../livingHealthKnowledgeGraph";
import {resolveHsiOntologyIdentity} from "../hsiOntologyRegistry";
import type {UniProtProteinMetadata} from "./uniProtProteinLookup";

export function uniProtProteinDraftNode(protein: UniProtProteinMetadata): HsiGraphNode {
  if (protein.provider !== "uniprotkb" || protein.reviewState !== "unreviewed" ||
      protein.scientificApproval !== false || protein.graphPromotable !== false) {
    throw new Error("Only unreviewed UniProt metadata can be mapped");
  }
  return {
    schemaVersion:"hsi-lhkg-node-1",
    id:`protein.uniprot.${protein.accession}`,
    layer:"human_biology", kind:"protein",
    preferredLabel:protein.proteinName,
    aliases:protein.geneNames,
    sourceIdentifiers:[{system:"UniProt",value:protein.accession,mapping:"unreviewed"}],
    version:"1.0.0",visibility:"governed_research",reviewState:"draft",
    sourceProvenance:[`uniprot:metadata:${protein.accession}:${protein.retrievedAt}`],
  };
}

export function resolveUniProtProteinDraft(protein: UniProtProteinMetadata, existingNodes:readonly HsiGraphNode[]) {
  const draft = uniProtProteinDraftNode(protein);
  const resolution = resolveHsiOntologyIdentity({
    system:"UniProt",value:protein.accession,nodes:existingNodes,
  });
  return {draft,resolution,needsHumanReview:true as const,graphPromotable:false as const};
}
