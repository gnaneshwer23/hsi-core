/** P1 scientific discovery candidate analysis. Read-only, deterministic and non-clinical.
 * Draft graph relationships are never interpreted as approved biological facts.
 */
export type DiscoveryEdge={id:string;subjectId:string;objectId:string;predicate:string;reviewState:string;sourceEvidenceIds:string[];context?:{studyContext?:string;limitations?:string;sourceLocator?:string}};
export type DiscoveryClaim={id:string;pmid:string;support:string;locator:string;claimType:string;limitation:string};
export type DiscoveryDisagreement={id:string;claimIds:string[];description:string;interpretation:string;requiresReview:string[]};
export type DiscoveryInput={edges:DiscoveryEdge[];claims:DiscoveryClaim[];disagreements:DiscoveryDisagreement[]};
export type DiscoveryFinding={id:string;kind:"contextual_tension"|"missing_provenance"|"evidence_gap"|"hypothesis_candidate";title:string;explanation:string;sourceIds:string[];reviewRequired:true;status:"unvalidated_candidate"};
const opposites:Record<string,string>={activates:"inhibits",inhibits:"activates",promotes:"suppresses",suppresses:"promotes",increased_in:"decreased_in",decreased_in:"increased_in"};
export function investigateDiscoveryCandidates(input:DiscoveryInput):DiscoveryFinding[]{
 if(!Array.isArray(input.edges)||!Array.isArray(input.claims)||!Array.isArray(input.disagreements))throw Error("Invalid scientific discovery input");
 const out:DiscoveryFinding[]=[];
 for(const d of input.disagreements){
  out.push({id:"disagreement:"+d.id,kind:"contextual_tension",title:"Methodological disagreement "+d.id,explanation:d.description+" "+d.interpretation+" Required checks: "+d.requiresReview.join("; "),sourceIds:d.claimIds,reviewRequired:true,status:"unvalidated_candidate"});
 }
 for(const e of input.edges){
  const sources=e.sourceEvidenceIds??[];
  if(!sources.length||!e.context?.sourceLocator?.trim())out.push({id:"provenance:"+e.id,kind:"missing_provenance",title:"Missing provenance for "+e.id,explanation:"Source identifiers or precise source locator are absent; do not promote this relationship.",sourceIds:sources,reviewRequired:true,status:"unvalidated_candidate"});
 }
 for(let i=0;i<input.edges.length;i++)for(let j=i+1;j<input.edges.length;j++){
  const a=input.edges[i]!,b=input.edges[j]!;
  if(a.subjectId===b.subjectId&&a.objectId===b.objectId&&opposites[a.predicate.toLowerCase()]===b.predicate.toLowerCase())
   out.push({id:"direction:"+[a.id,b.id].sort().join(":"),kind:"contextual_tension",title:"Opposing candidate directions",explanation:"Opposing predicates are present. Study models, assays, disease stage and denominators must be compared before classifying a contradiction.",sourceIds:[...new Set([...a.sourceEvidenceIds,...b.sourceEvidenceIds])],reviewRequired:true,status:"unvalidated_candidate"});
 }
 const verified=new Set(input.claims.map(c=>c.id));
 for(const d of input.disagreements)for(const id of d.claimIds)if(!verified.has(id))out.push({id:"claim-gap:"+d.id+":"+id,kind:"evidence_gap",title:"Claim extraction missing: "+id,explanation:"The disagreement references a claim without a matching verification record.",sourceIds:[id],reviewRequired:true,status:"unvalidated_candidate"});
 for(const c of input.claims)if(c.support!=="abstract_consistent")out.push({id:"claim-support:"+c.id,kind:"evidence_gap",title:"Claim needs evidence: "+c.id,explanation:"The supplied verification status is not abstract-consistent; inspect the source passage and methods.",sourceIds:[c.pmid],reviewRequired:true,status:"unvalidated_candidate"});
 return out.sort((a,b)=>a.id.localeCompare(b.id));
}
