/** ARCH-003 Step 4: evidence interrogation over an authoritative published HSI graph.
 * A branch-to-graph binding must be explicitly curated; no keyword matching,
 * invented pathway links, or inference from absence of records.
 */
import {assessReleaseClaim,type PublishedReleaseSnapshot,type ReleaseClaim} from "./graphRelease";
import {INTERROGATION_LIMITS,validateInterrogativeInvestigation,type InterrogativeInvestigation,type EvidenceTrace,type EvidenceKind} from "./interrogativeContracts";
export type BranchGraphBinding={
 branchId:string;
 subjectIds:readonly string[];
 objectIds:readonly string[];
 predicates:readonly string[];
 context:Readonly<Record<string,string>>;
};
function evidenceKind(type:string):EvidenceKind{
 if(type==="observational_association"||type==="association")return "association";
 if(type==="established_evidence")return "established_evidence";
 if(type==="computational_inference")return "computational_inference";
 throw Error("Unrecognised graph epistemic type; scientific evidence mapping denied");
}
function contextMatches(actual:Record<string,unknown>,required:Readonly<Record<string,string>>):boolean{
 return Object.entries(required).every(([k,v])=>typeof actual[k]==="string"&&actual[k]===v);
}
export function interrogatePublishedSscEvidence(input:{
 plan:InterrogativeInvestigation;
 snapshot:PublishedReleaseSnapshot;
 bindings:readonly BranchGraphBinding[];
}):InterrogativeInvestigation{
 const {plan,snapshot,bindings}=input;
 validateInterrogativeInvestigation(plan);
 if(plan.state!=="draft"||plan.review!==null)throw Error("Only unreviewed plans can be interrogated");
 const m=snapshot.manifest;
 if(m.status!=="published"||m.releaseId!==plan.release.id||m.releaseVersion!==plan.release.version||m.manifestHash!==plan.release.manifestHash)throw Error("Authoritative release mismatch");
 if(new Set(m.claimIds).size!==m.claimIds.length)throw Error("Duplicate release claims");
 if(new Set(bindings.map(b=>b.branchId)).size!==bindings.length||bindings.some(b=>!plan.branches.some(p=>p.id===b.branchId)))throw Error("Invalid branch binding");
 const permitted=new Set(m.claimIds);
 const traces=new Set<string>();
 const branches=plan.branches.map(branch=>{
  const binding=bindings.find(b=>b.branchId===branch.id);
  if(!binding)return {...branch,uncertainty:[...branch.uncertainty,"No curated graph binding for this branch"]};
  if(!binding.subjectIds.length&&!binding.objectIds.length)throw Error("Binding must include an explicit graph entity");
  if(binding.subjectIds.length>30||binding.objectIds.length>30||binding.predicates.length>30||Object.keys(binding.context).length>12)throw Error("Graph binding budget exceeded");
  const supporting:EvidenceTrace[]=[];
  const opposing:EvidenceTrace[]=[];
  const selected=snapshot.claims.filter(c=>permitted.has(c.id)&&assessReleaseClaim(c).eligible)
   .filter(c=>(!binding.subjectIds.length||binding.subjectIds.includes(c.subjectId))&&(!binding.objectIds.length||binding.objectIds.includes(c.objectId))&&(!binding.predicates.length||binding.predicates.includes(c.predicate))&&contextMatches(c.biologicalContext,binding.context))
   .slice(0,INTERROGATION_LIMITS.maxEvidencePerBranch);
  for(const c of selected){
   const review=[...c.reviews].sort((a,b)=>b.reviewedAt.localeCompare(a.reviewedAt)||b.id.localeCompare(a.id))[0];
   if(!review?.id)continue;
   for(const s of c.sources){
    if(s.polarity==="contextualises")continue;
    const e:EvidenceTrace={claimId:c.id,sourceIds:[s.id],reviewDecisionId:review.id,polarity:s.polarity,evidenceKind:evidenceKind(c.epistemicType),context:c.biologicalContext,graphPath:[c.subjectId,c.predicate,c.objectId]};
    if(s.polarity==="supports")supporting.push(e);
    if(s.polarity==="contradicts")opposing.push(e);
    traces.add(c.id+":"+s.id+":"+review.id);
   }
  }
  // Approved graph claims with unresolved contradictory source support cannot pass
  // release eligibility; opposing evidence must be separately curated and reviewed.
  return {...branch,supporting:supporting.slice(0,INTERROGATION_LIMITS.maxEvidencePerBranch),opposing:opposing.slice(0,INTERROGATION_LIMITS.maxEvidencePerBranch),
   missingEvidence:supporting.length?branch.missingEvidence.filter(s=>s!=="Approved source-linked claims for the mechanism"):branch.missingEvidence,
   assessment:"insufficient_evidence" as const,
   uncertainty:[...branch.uncertainty,"Retrieved graph associations do not establish the candidate mechanism","Opposing literature beyond the published release has not been evaluated"]};
 });
 const questions=plan.questions.map(q=>{
  const branch=branches.find(b=>b.questionId===q.id);
  return branch?{...q,status:branch.supporting.length?"answered" as const:"unanswerable" as const}:q;
 });
 const output:InterrogativeInvestigation={...plan,questions,branches,
  conclusion:{text:"Evidence paths retrieved for inspection; competing mechanisms and causal conclusions remain unvalidated.",assessment:"insufficient_evidence",limitations:["Curated graph binding required","Evidence retrieval does not establish causation","Opposing evidence outside the release remains unassessed","Scientific reviewer approval required"]},
  provenance:{...plan.provenance,retrievalIds:[...new Set([...plan.provenance.retrievalIds,...traces])].sort()}};
 validateInterrogativeInvestigation(output);
 return output;
}
