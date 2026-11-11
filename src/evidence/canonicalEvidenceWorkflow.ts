/**
 * P0.1.3 canonical comparison entrypoint, disease-agnostic.
 * Draft-only: no review, persistence, or scientific promotion.
 */
import {compareCanonicalEdges,validateCanonicalEdge,type CanonicalEvidenceEdge} from "./canonicalContextualEdge";
import {fromMechanismLead,fromContextualCandidate,fromTypedGraphEdge,
  type AdapterOverrides,type SourceProof,type LegacyScientificEdge,type LegacyEvidenceRecord} from "./canonicalEdgeAdapters";
import type {MechanismEvidenceLead} from "./contextualMechanismComparison";
import type {ContextualCandidateRelationship} from "./contextualCandidateRelationships";
export type EvidenceInput =
 | {kind:"canonical";edge:CanonicalEvidenceEdge}
 | {kind:"mechanism";lead:MechanismEvidenceLead;proof:SourceProof;overrides?:AdapterOverrides}
 | {kind:"candidate";candidate:ContextualCandidateRelationship;proof:SourceProof;overrides?:AdapterOverrides}
 | {kind:"typed_graph";edge:LegacyScientificEdge;source:LegacyEvidenceRecord;proof:SourceProof;overrides?:AdapterOverrides};
export function canonicaliseEvidence(input:EvidenceInput):CanonicalEvidenceEdge {
  switch(input.kind) {
    case "canonical": {
      const errors=validateCanonicalEdge(input.edge);
      if(errors.length) throw new Error("Invalid canonical edge: "+errors.join(","));
      return input.edge;
    }
    case "mechanism":return fromMechanismLead(input.lead,input.proof,input.overrides);
    case "candidate":return fromContextualCandidate(input.candidate,input.proof,input.overrides);
    case "typed_graph":return fromTypedGraphEdge(input.edge,input.source,input.proof,input.overrides);
  }
}
export function compareEvidenceInputs(left:EvidenceInput,right:EvidenceInput) {
  const a=canonicaliseEvidence(left),b=canonicaliseEvidence(right);
  if(a.id===b.id) throw new Error("Cannot compare the same evidence edge");
  const result=compareCanonicalEdges(a,b);
  return {...result,leftId:a.id,rightId:b.id,
    needsHumanReview:true as const,needsSourceVerification:true as const,
    scientificConclusion:false as const,
    limitations:[...new Set([...a.limitations,...b.limitations])]};
}
