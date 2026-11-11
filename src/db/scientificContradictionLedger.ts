/** P0.2 immutable snapshot contract; persistence is deliberately not activated. */
import {canonicaliseEvidence,type EvidenceInput} from "../evidence/canonicalEvidenceWorkflow";
import {compareCanonicalEdges,CANONICAL_EDGE_SCHEMA_VERSION,type ContextComparison} from "../evidence/canonicalContextualEdge";
export type ContradictionSnapshot = {
 id:string;tenantId:string;submittedBy:string;schemaVersion:typeof CANONICAL_EDGE_SCHEMA_VERSION;
 leftEdgeId:string;rightEdgeId:string;classification:ContextComparison["classification"];
 missing:ContextComparison["missing"];mismatched:ContextComparison["mismatched"];
 sourceEvidenceIds:string[];sourceLocators:string[];
 left:ReturnType<typeof canonicaliseEvidence>;right:ReturnType<typeof canonicaliseEvidence>;
 reviewStatus:"pending";scientificConclusion:false;
};
const nonempty=(s:string)=>typeof s==="string"&&s.trim().length>0;
export function prepareContradictionSnapshot(args:{
 id:string;tenantId:string;submittedBy:string;left:EvidenceInput;right:EvidenceInput
}):ContradictionSnapshot {
 for(const key of ["id","tenantId","submittedBy"] as const)
  if(!nonempty(args[key]))throw new Error("Missing "+key);
 const left=canonicaliseEvidence(args.left),right=canonicaliseEvidence(args.right);
 if(left.id===right.id)throw new Error("Self comparison prohibited");
 if(left.submitterId!==args.submittedBy||right.submitterId!==args.submittedBy)
  throw new Error("Submitter identity mismatch");
 if(left.synthetic||right.synthetic)throw new Error("Synthetic records cannot enter persistent evidence ledger");
 const result=compareCanonicalEdges(left,right);
 return {id:args.id,tenantId:args.tenantId,submittedBy:args.submittedBy,
  schemaVersion:CANONICAL_EDGE_SCHEMA_VERSION,leftEdgeId:left.id,rightEdgeId:right.id,
  classification:result.classification,missing:result.missing,mismatched:result.mismatched,
  sourceEvidenceIds:[...new Set([...left.provenance.evidenceRecordIds,...right.provenance.evidenceRecordIds])],
  sourceLocators:[left.provenance.sourceLocator,right.provenance.sourceLocator],
  left,right,reviewStatus:"pending",scientificConclusion:false};
}
export function validateIndependentContradictionReview(args:{
 submittedBy:string;reviewerPrincipal:string;decision:"approved"|"rejected"|"needs_evidence";
 rationale:string;sourceLocator:string
}):void {
 if(!nonempty(args.submittedBy)||!nonempty(args.reviewerPrincipal)||
  args.submittedBy===args.reviewerPrincipal)throw new Error("Independent reviewer required");
 if(!["approved","rejected","needs_evidence"].includes(args.decision)||
  !nonempty(args.rationale)||!nonempty(args.sourceLocator))
  throw new Error("Review decision requires rationale and source locator");
}
