/** Disease-agnostic research-domain navigation; not a claim of validated coverage. */
import type {CanonicalEvidenceEdge} from "./canonicalContextualEdge";
export const RESEARCH_DOMAINS=["immunity","microbiome","neurobiology","metabolism"] as const;
export type ResearchDomain=typeof RESEARCH_DOMAINS[number];
export type DomainCapability="available_verified"|"research_preview"|"in_development"|"unavailable";
export type DomainInvestigation={
 domain:ResearchDomain;question:string;edges:CanonicalEvidenceEdge[];
 capability:DomainCapability;researchGap:string|null;
};
export function buildDomainInvestigation(input:DomainInvestigation){
 if(!RESEARCH_DOMAINS.includes(input.domain))throw Error("Unknown research domain");
 if(!input.question.trim())throw Error("Research question required");
 const edges=input.edges.map(edge=>({
  edgeId:edge.id,context:edge.context,provenance:edge.provenance,
  reviewState:edge.review.state,synthetic:edge.synthetic,
  evidenceStatus:edge.review.state==="approved"&&!edge.synthetic
   ?"reviewed_evidence" as const:"unverified_research" as const
 }));
 if(input.capability==="available_verified"&&
    (edges.length===0||edges.some(edge=>edge.evidenceStatus!=="reviewed_evidence")))
  throw Error("Verified capability requires reviewed non-synthetic evidence");
 return {domain:input.domain,question:input.question,capability:input.capability,
  researchGap:input.researchGap,edges,scientificConclusion:false as const};
}
