/**
 * Step 4: conservative protein-pathway mechanism candidates.
 *
 * A co-mentioned protein/pathway is NOT evidence of a functional relationship.
 * This builder creates a draft hypothesis edge ONLY when an explicit source
 * reference and biological context are supplied. It never promotes to approved.
 * No patient context, clinical recommendations, or causal assertions.
 */
import type {HsiGraphNode,HsiGraphRelationship} from "../livingHealthKnowledgeGraph";
import {validateHsiGraphNode,validateHsiGraphRelationship} from "../livingHealthKnowledgeGraph";
import {validateHsiOntologyIdentifier} from "../hsiOntologyRegistry";

export type ProteinPathwayContext = {
  tissue: string;
  cellType: string;
  disease: string;
  species: string;
  experimentalSystem: string;
};
export type ProteinPathwayCandidate = {
  protein: HsiGraphNode;
  pathway: HsiGraphNode;
  relationship: HsiGraphRelationship;
  status: "unvalidated_hypothesis";
  needsHumanReview: true;
  graphPromotable: false;
  sourceIdentityVerified: false;
};
const nonempty = (v:string) => typeof v === "string" && v.trim().length > 0 && v.length <= 160;
function unreviewedIdentifier(node:HsiGraphNode,system:"UniProt"|"Reactome"):string {
  const ids = node.sourceIdentifiers.filter(x=>x.system===system && x.mapping==="unreviewed");
  if(ids.length!==1)throw new Error(`Expected one unreviewed ${system} identifier`);
  const value=ids[0]!.value;
  validateHsiOntologyIdentifier(system,value);
  return value;
}

/**
 * Source reference is a research lead, NOT verified claim support.
 * Relationship stays a draft hypothesis even if the provider is authoritative.
 */
export function buildProteinPathwayCandidate(input:{
  protein:HsiGraphNode;
  pathway:HsiGraphNode;
  sourceReference:string;
  context:ProteinPathwayContext;
}):ProteinPathwayCandidate {
  const {protein,pathway,context,sourceReference}=input;
  validateHsiGraphNode(protein);
  validateHsiGraphNode(pathway);
  if(protein.kind!=="protein"||pathway.kind!=="pathway"||
    protein.reviewState!=="draft"||pathway.reviewState!=="draft"||
    protein.visibility!=="governed_research"||pathway.visibility!=="governed_research")
    throw new Error("Only governed draft protein and pathway nodes are accepted");
  const accession=unreviewedIdentifier(protein,"UniProt");
  const pathwayId=unreviewedIdentifier(pathway,"Reactome");
  if(!nonempty(sourceReference)||Object.values(context).some(x=>!nonempty(x)))
    throw new Error("Source reference and full biological context required");
  const relationship:HsiGraphRelationship={
    schemaVersion:"hsi-lhkg-edge-1",
    id:`candidate.${accession}.${pathwayId}`,
    subjectId:protein.id,objectId:pathway.id,
    predicate:"hypothesized_involvement_in_pathway",
    layer:"biomedical_evidence",
    epistemicType:"unvalidated_hypothesis",
    visibility:"governed_research",
    reviewState:"draft",
    sourceEvidenceIds:[],
    version:"1.0.0",
    context:{...context,sourceReference,claimStatus:"unverified_research_lead"},
    causalClaim:false,
  };
  validateHsiGraphRelationship(relationship,new Map([[protein.id,protein],[pathway.id,pathway]]));
  return {protein,pathway,relationship,status:"unvalidated_hypothesis",
    needsHumanReview:true,graphPromotable:false,sourceIdentityVerified:false};
}
