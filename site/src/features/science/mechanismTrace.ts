/** Read-only projection of ISI-derived SSc draft relationships already present in HSI.
 * This is NOT a live ISI query, approved evidence or a clinical mechanism claim.
 */
export type MechanismDraftNode={id:string;preferredLabel:string;kind:string};
export type MechanismDraftEdge={id:string;subjectId:string;objectId:string;predicate:string;reviewState:string;sourceEvidenceIds:string[];context:{studyContext?:string;limitations?:string;sourceLocator?:string;model?:string}};
export type MechanismDraftClaim={id:string;pmid:string;support:string;locator:string;limitation:string};
export type MechanismTrace={id:string;subject:string;predicate:string;object:string;model:string;studyContext:string;limitations:string;sourceLocator:string;sourceIds:string[];claimIds:string[];gaps:string[];reviewState:"unvalidated_candidate"};
export function projectMechanismTraces(nodes:MechanismDraftNode[],edges:MechanismDraftEdge[],claims:MechanismDraftClaim[],selectedId?:string|null):MechanismTrace[]{
 const byId=new Map(nodes.map(n=>[n.id,n]));
 if(byId.size!==nodes.length)throw Error("Duplicate mechanism nodes");
 return edges.filter(e=>!selectedId||e.subjectId===selectedId||e.objectId===selectedId).map(e=>{
  const subject=byId.get(e.subjectId),object=byId.get(e.objectId);
  if(!subject||!object)throw Error("Unresolved mechanism endpoint");
  const sourceIds=[...new Set(e.sourceEvidenceIds||[])];
  const pmids=new Set(sourceIds.filter(s=>/^PMID:[1-9]\\d*$/.test(s)).map(s=>s.slice(5)));
  const claimIds=claims.filter(c=>pmids.has(c.pmid)).map(c=>c.id);
  const gaps:string[]=[];
  if(!sourceIds.length)gaps.push("No source identifier");
  if(!e.context?.sourceLocator?.trim())gaps.push("No precise source locator");
  if(!e.context?.studyContext?.trim())gaps.push("No study context");
  if(!claimIds.length)gaps.push("No linked verification claims for source PMID");
  if(e.reviewState!=="approved")gaps.push("Relationship has not received independent approval");
  return {id:e.id,subject:subject.preferredLabel,predicate:e.predicate,object:object.preferredLabel,model:e.context?.model||"Not specified",studyContext:e.context?.studyContext||"Not supplied",limitations:e.context?.limitations||"Not documented",sourceLocator:e.context?.sourceLocator||"Missing",sourceIds,claimIds,gaps,reviewState:"unvalidated_candidate" as const};
 }).sort((a,b)=>a.id.localeCompare(b.id));
}
