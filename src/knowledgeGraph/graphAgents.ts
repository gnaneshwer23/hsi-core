/**
 * Graph-scoped agent binding. A selection in the graph becomes an explicit, validated context (investigation id, graph
 * version, department, filters, node and edge ids, evidence ids, question). The collective's DETERMINISTIC capabilities
 * run over exactly that context and nothing else:
 *   PARALLAX  distinguishes comparable disagreement from non-comparable or insufficiently described experiments,
 *   VANTAGE   separates a recorded research question from a graph coverage gap,
 *   HELIX     lists candidate mechanism chains from the graph (association only). A model-backed interpretation is NOT
 *             enabled here; the response says so rather than pretending.
 * Every response is a candidate finding: scientificApproval and graphPromotable are false, no graph change is made, an
 * agent can only PROPOSE a change, and a proposal can never be applied without independent review. Nothing here calls a
 * model, a network or a database.
 */
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {looksIdentifying} from "../identifyingText";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {compareDomainEvidence,domainPaths,type DomainBundle,type DomainEdge} from "./domainGraph";
import {crossDepartmentPaths,isDepartmentSlug,type DepartmentSlug,projectDepartment} from "./departments";

export const SELECTION_LIMITS=Object.freeze({maxNodes:12,maxEdges:12,minQuestion:5,maxQuestion:500});
export type GraphSelectionContext={
 schemaVersion:"hsi-graph-selection-1";investigationId:string;graphVersion:string;question:string;
 department:DepartmentSlug|null;filters:{condition?:string;model?:string;sourceBasis?:string};
 nodeIds:string[];edgeIds:string[];
 /** Derived from the selected edges' source records; never supplied by the caller. */
 evidenceIds:string[];
};
export type GraphSelectionInput={investigationId:string;graphVersion:string;question:string;department?:string|null;filters?:GraphSelectionContext["filters"];nodeIds?:readonly string[];edgeIds?:readonly string[]};

/** Heuristic only (the repository's own guard is a marker list, not a de-identification engine): an email address, a UK NHS-number
 * shape, a phone-like digit run, a day/month/year date or a UK postcode in a free-text question is refused outright. */
const ID=/^[A-Za-z0-9][A-Za-z0-9:_.-]{2,120}$/,INV=/^[A-Za-z0-9][A-Za-z0-9:_-]{2,80}$/;
export function buildSelectionContext(g:DomainBundle,input:GraphSelectionInput):GraphSelectionContext{
 if(!INV.test(input.investigationId??""))throw Error("Invalid investigation id");
 if(input.graphVersion!==g.version)throw Error("Stale graph version: the selection was made on a different graph snapshot");
 const question=(input.question??"").trim();
 if(question.length<SELECTION_LIMITS.minQuestion||question.length>SELECTION_LIMITS.maxQuestion)throw Error("Question must be 5-500 characters");
 if(!rejectPhiPayload({textBlobs:[question]}).ok||looksIdentifying(question))throw Error("The question appears to contain personal or clinical identifiers and cannot be used");
 const nodeIds=[...new Set(input.nodeIds??[])].sort(),edgeIds=[...new Set(input.edgeIds??[])].sort();
 if(!nodeIds.length&&!edgeIds.length)throw Error("Select at least one concept or relationship");
 if(nodeIds.length>SELECTION_LIMITS.maxNodes||edgeIds.length>SELECTION_LIMITS.maxEdges)throw Error("Selection is too large");
 for(const id of [...nodeIds,...edgeIds])if(!ID.test(id))throw Error("Invalid identifier in selection");
 for(const id of nodeIds)if(!g.nodes.some(n=>n.id===id))throw Error(`Unknown concept: ${id}`);
 for(const id of edgeIds)if(!g.edges.some(e=>e.id===id))throw Error(`Unknown relationship: ${id}`);
 const department=input.department==null?null:isDepartmentSlug(input.department)?input.department:(()=>{throw Error("Unknown department")})();
 const evidenceIds=[...new Set(edgeIds.flatMap(id=>{const s=g.edges.find(e=>e.id===id)!.sourceId;return s?[s]:[]}))].sort();
 return {schemaVersion:"hsi-graph-selection-1",investigationId:input.investigationId,graphVersion:g.version,question,department,filters:{...input.filters},nodeIds,edgeIds,evidenceIds};
}
export async function contextDigest(ctx:GraphSelectionContext):Promise<string>{
 const bytes=new TextEncoder().encode(canonicalEvidenceJson(ctx)),hash=await globalThis.crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

export type AgentName="PARALLAX"|"VANTAGE"|"HELIX";
export type Finding={kind:string;title:string;detail:string;refs:{nodeIds:string[];edgeIds:string[];sourceIds:string[]};class?:string;boundaries?:number[]};
export type AgentResponse={
 schemaVersion:"hsi-graph-agent-response-1";agent:AgentName;graphVersion:string;investigationId:string;
 status:"completed"|"abstained"|"disabled";abstentionReason:string|null;
 findings:Finding[];scope:{nodeIds:string[];edgeIds:string[];evidenceIds:string[]};uncertainty:string[];
 deterministic:true;modelBacked:false;reviewState:"candidate_finding";scientificApproval:false;graphPromotable:false;proposedGraphChange:null;
};
const base=(agent:AgentName,ctx:GraphSelectionContext)=>({schemaVersion:"hsi-graph-agent-response-1" as const,agent,graphVersion:ctx.graphVersion,investigationId:ctx.investigationId,deterministic:true as const,modelBacked:false as const,reviewState:"candidate_finding" as const,scientificApproval:false as const,graphPromotable:false as const,proposedGraphChange:null});
const abstain=(agent:AgentName,ctx:GraphSelectionContext,reason:string,status:"abstained"|"disabled"="abstained"):AgentResponse=>({...base(agent,ctx),status,abstentionReason:reason,findings:[],scope:{nodeIds:[...ctx.nodeIds],edgeIds:[...ctx.edgeIds],evidenceIds:[...ctx.evidenceIds]},uncertainty:["No conclusion is offered."]});

/** Comparability of two source-candidate findings. Never a confirmed contradiction. */
export type ComparabilityClass="not_comparable"|"insufficient_context"|"potential_disagreement"|"consistent_context";
const CRITICAL=new Set(["model","tissue","population","intervention","outcome measurement","subject","outcome entity","predicate"]);
export function classifyComparability(g:DomainBundle,leftId:string,rightId:string):{class:ComparabilityClass;reason:string;differing:string[];missing:string[]}|null{
 const c=compareDomainEvidence(g,leftId,rightId);if(!c)return null;
 const missing=c.missingContext.filter(m=>m!=="dose"),differing=c.differences.map(d=>d.dimension).filter(d=>CRITICAL.has(d));
 if(!c.sameEntityPair)return {class:"not_comparable",reason:"The two findings concern different concept pairs, so they cannot disagree with each other.",differing,missing};
 if(missing.length)return {class:"insufficient_context",reason:`Context is not recorded for ${missing.join(", ")}, so comparability cannot be judged. This is not evidence of agreement or disagreement.`,differing,missing};
 if(differing.length)return {class:"not_comparable",reason:`The experiments differ in ${differing.join(", ")}; a difference in result may reflect the difference in context.`,differing,missing};
 if(c.left.negated!==c.right.negated)return {class:"potential_disagreement",reason:"Same concept pair, same recorded context, opposite findings. This needs independent review; it is not a confirmed contradiction.",differing,missing};
 return {class:"consistent_context",reason:"Same concept pair and recorded context with the same direction of finding. Agreement between two candidate records is not validation.",differing,missing};
}

function parallax(g:DomainBundle,ctx:GraphSelectionContext):AgentResponse{
 const edges=ctx.edgeIds.map(id=>g.edges.find(e=>e.id===id)!).filter(e=>e.kind==="source_candidate");
 if(edges.length<2)return abstain("PARALLAX",ctx,"Select at least two source-candidate relationships to compare. Unresolved gaps carry no finding to compare.");
 const findings:Finding[]=[];
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const l=edges[i]!,r=edges[j]!,k=classifyComparability(g,l.id,r.id);if(!k)continue;
  findings.push({kind:"comparability",class:k.class,title:`${l.id} and ${r.id}: ${k.class.replaceAll("_"," ")}`,detail:k.reason,refs:{nodeIds:[...new Set([l.subjectId,l.objectId,r.subjectId,r.objectId])],edgeIds:[l.id,r.id],sourceIds:[l.sourceId,r.sourceId].filter((x):x is string=>!!x)}});
 }
 return {...base("PARALLAX",ctx),status:"completed",abstentionReason:null,findings,scope:{nodeIds:[...ctx.nodeIds],edgeIds:[...ctx.edgeIds],evidenceIds:[...ctx.evidenceIds]},
  uncertainty:["Comparability is judged only from context fields the graph records; unrecorded context is reported as missing, not assumed equal.","No pair is confirmed as a contradiction."]};
}

function vantage(g:DomainBundle,ctx:GraphSelectionContext):AgentResponse{
 const nodeIds=new Set(ctx.nodeIds);for(const id of ctx.edgeIds){const e=g.edges.find(x=>x.id===id)!;nodeIds.add(e.subjectId);nodeIds.add(e.objectId)}
 const findings:Finding[]=[];
 for(const gap of g.gaps.filter(x=>nodeIds.has(x.subjectId)||nodeIds.has(x.objectId)))
  findings.push({kind:"recorded_research_question",class:"research_gap",title:gap.question,detail:`Recorded unresolved question. Missing: ${gap.missing} Suggested next research: ${gap.nextStudy}`,refs:{nodeIds:[gap.subjectId,gap.objectId],edgeIds:[],sourceIds:[]}});
 for(const e of g.edges.filter(x=>x.kind==="research_gap"&&(nodeIds.has(x.subjectId)||nodeIds.has(x.objectId))))
  findings.push({kind:"recorded_research_question",class:"research_gap",title:`Unresolved connection ${e.id}`,detail:`The graph records a question here, not a finding: ${e.assertion}`,refs:{nodeIds:[e.subjectId,e.objectId],edgeIds:[e.id],sourceIds:[]}});
 for(const id of nodeIds){
  const n=g.nodes.find(x=>x.id===id)!,candidates=g.edges.filter(e=>e.kind==="source_candidate"&&(e.subjectId===id||e.objectId===id));
  if(!candidates.length)findings.push({kind:"graph_coverage_gap",class:"coverage",title:`${n.name}: no source candidate recorded`,detail:"This concept has no source-linked relationship in the graph. That is a coverage limit of this graph, not a statement that the literature is silent.",refs:{nodeIds:[id],edgeIds:[],sourceIds:[]}});
 }
 if(ctx.department){const p=projectDepartment(g,ctx.department);if(p.status==="no_graph_coverage")findings.push({kind:"graph_coverage_gap",class:"coverage",title:`${ctx.department}: no concept tagged in the graph`,detail:p.note,refs:{nodeIds:[],edgeIds:[],sourceIds:[]}})}
 return {...base("VANTAGE",ctx),status:"completed",abstentionReason:null,findings,scope:{nodeIds:[...ctx.nodeIds],edgeIds:[...ctx.edgeIds],evidenceIds:[...ctx.evidenceIds]},
  uncertainty:["A recorded research question is a question the graph keeps; a coverage gap is something this graph has not captured. Neither shows what the wider literature contains.","Literature coverage is not assessed here."]};
}

function helix(g:DomainBundle,ctx:GraphSelectionContext):AgentResponse{
 const note="Model-backed mechanism interpretation is not enabled: it needs an approved model deployment. These are deterministic candidate chains from the graph.";
 const findings:Finding[]=[];
 if(ctx.nodeIds.length===2){
  const [a,b]=ctx.nodeIds as [string,string];
  const paths=[...domainPaths(g,a,b,5),...domainPaths(g,b,a,5)].slice(0,6);
  for(const p of paths)findings.push({kind:"candidate_chain",class:"association_only",title:`Candidate chain of ${p.edgeIds.length} ${p.edgeIds.length===1?"hop":"hops"}`,detail:`${p.warnings.join(" ")}`,refs:{nodeIds:p.nodeIds,edgeIds:p.edgeIds,sourceIds:p.edgeIds.flatMap(id=>{const s=g.edges.find(e=>e.id===id)?.sourceId;return s?[s]:[]})}});
  if(!paths.length)return {...abstain("HELIX",ctx,`No directed candidate chain of five hops or fewer connects these two concepts in the current graph. ${note}`)};
 }else if(ctx.department&&ctx.nodeIds.length===1){
  const r=crossDepartmentPaths(g,ctx.nodeIds[0]!,ctx.department,{maxHops:4,maxPaths:6});
  if(r.status==="target_has_no_graph_coverage")return abstain("HELIX",ctx,`The ${ctx.department} department has no concept in the graph. ${note}`);
  for(const p of r.paths)findings.push({kind:"candidate_chain",class:p.boundaries.length?"association_with_evidence_boundary":"association_only",title:`Candidate chain into ${ctx.department}: ${p.hops.length} ${p.hops.length===1?"hop":"hops"}`,detail:p.warnings.join(" "),boundaries:p.boundaries,refs:{nodeIds:p.nodeIds,edgeIds:p.reconstruct.edgeIds,sourceIds:p.hops.flatMap(h=>h.sourceId?[h.sourceId]:[])}});
  if(!findings.length)return abstain("HELIX",ctx,`No chain of four hops or fewer connects this concept to ${ctx.department} in the current graph. ${note}`);
 }else return abstain("HELIX",ctx,`Select exactly two concepts, or one concept with a target department, to list candidate chains. ${note}`);
 const edgeIds=[...new Set(findings.flatMap(f=>f.refs.edgeIds))],nodeIds=[...new Set(findings.flatMap(f=>f.refs.nodeIds))];
 return {...base("HELIX",ctx),status:"completed",abstentionReason:null,findings,scope:{nodeIds:[...new Set([...ctx.nodeIds,...nodeIds])].sort(),edgeIds:[...new Set([...ctx.edgeIds,...edgeIds])].sort(),evidenceIds:[...new Set([...ctx.evidenceIds,...findings.flatMap(f=>f.refs.sourceIds)])].sort()},
  uncertainty:[note,"A chain is an association path; it does not establish that one step causes the next."]};
}

/** Runs one agent over exactly the selected context. Deterministic: the same context and graph give the same response. */
export function investigateSelection(g:DomainBundle,ctx:GraphSelectionContext,agent:AgentName):AgentResponse{
 if(ctx.graphVersion!==g.version)throw Error("Stale graph version: the selection was made on a different graph snapshot");
 const r=agent==="PARALLAX"?parallax(g,ctx):agent==="VANTAGE"?vantage(g,ctx):agent==="HELIX"?helix(g,ctx):(()=>{throw Error("Unknown agent")})();
 assertResponseInvariants(g,r);return r;
}

/** Enforces what every response must satisfy: scoped to the snapshot, candidate-only, no approval and no change. */
export function assertResponseInvariants(g:DomainBundle,r:AgentResponse):void{
 if(r.scientificApproval!==false||r.graphPromotable!==false||r.proposedGraphChange!==null||r.reviewState!=="candidate_finding"||r.modelBacked!==false)throw Error("Agent response violates the candidate-only contract");
 if(r.graphVersion!==g.version)throw Error("Agent response is not bound to this graph snapshot");
 const nodes=new Set(g.nodes.map(n=>n.id)),edges=new Set(g.edges.map(e=>e.id)),sources=new Set(g.sources.map(s=>s.id));
 const sn=new Set(r.scope.nodeIds),se=new Set(r.scope.edgeIds),ss=new Set(r.scope.evidenceIds);
 for(const id of sn)if(!nodes.has(id))throw Error("Scope names a concept that is not in the snapshot");
 for(const id of se)if(!edges.has(id))throw Error("Scope names a relationship that is not in the snapshot");
 for(const id of ss)if(!sources.has(id))throw Error("Scope names a source that is not in the snapshot");
 for(const f of r.findings){
  for(const id of f.refs.nodeIds)if(!nodes.has(id))throw Error("A finding cites a concept that is not in the snapshot");
  for(const id of f.refs.edgeIds)if(!edges.has(id))throw Error("A finding cites a relationship that is not in the snapshot");
  for(const id of f.refs.sourceIds)if(!sources.has(id))throw Error("A finding cites a source that is not in the snapshot");
 }
}

export type AgentProposal={schemaVersion:"hsi-agent-proposal-1";proposedBy:AgentName;graphVersion:string;kind:"add_relationship"|"flag_gap"|"flag_comparability";summary:string;refs:Finding["refs"];status:"proposed_unreviewed";requiresIndependentReview:true;approved:false};
export function proposeFromFinding(r:AgentResponse,finding:Finding):AgentProposal{
 if(!r.findings.includes(finding))throw Error("The finding does not belong to this response");
 return {schemaVersion:"hsi-agent-proposal-1",proposedBy:r.agent,graphVersion:r.graphVersion,kind:finding.kind==="recorded_research_question"||finding.kind==="graph_coverage_gap"?"flag_gap":finding.kind==="comparability"?"flag_comparability":"add_relationship",summary:finding.title,refs:finding.refs,status:"proposed_unreviewed",requiresIndependentReview:true,approved:false};
}
/** There is deliberately no path from an agent proposal to published knowledge in this module. */
export function applyProposalToGraph(_g:DomainBundle,_p:AgentProposal):never{throw Error("Agent proposals cannot publish knowledge; independent human review is required")}

export type InvestigationRecord={schemaVersion:"hsi-graph-investigation-1";graphVersion:string;context:GraphSelectionContext;responses:AgentResponse[];checks:{scopedToSnapshot:true;candidateOnly:true;deterministicRerunMatches:true};scientificApproval:false};
export function buildInvestigationRecord(g:DomainBundle,ctx:GraphSelectionContext,agents:readonly AgentName[]=["PARALLAX","VANTAGE","HELIX"]):InvestigationRecord{
 const responses=agents.map(a=>investigateSelection(g,ctx,a));
 return {schemaVersion:"hsi-graph-investigation-1",graphVersion:g.version,context:ctx,responses,checks:{scopedToSnapshot:true,candidateOnly:true,deterministicRerunMatches:true},scientificApproval:false};
}
/** Re-derives the record from the graph and the recorded context. Returns the reasons it does not match (empty = reproducible). */
export function verifyInvestigationRecord(g:DomainBundle,rec:InvestigationRecord):string[]{
 const problems:string[]=[];
 if(rec.schemaVersion!=="hsi-graph-investigation-1")problems.push("Unknown record schema");
 if(rec.graphVersion!==g.version||rec.context.graphVersion!==g.version)problems.push("Graph version differs from the snapshot");
 try{
  const ctx=buildSelectionContext(g,{investigationId:rec.context.investigationId,graphVersion:rec.context.graphVersion,question:rec.context.question,department:rec.context.department,filters:rec.context.filters,nodeIds:rec.context.nodeIds,edgeIds:rec.context.edgeIds});
  if(canonicalEvidenceJson(ctx)!==canonicalEvidenceJson(rec.context))problems.push("The recorded context does not match what the selection derives (evidence ids or ordering differ)");
  const again=rec.responses.map(r=>investigateSelection(g,ctx,r.agent));
  if(canonicalEvidenceJson(again)!==canonicalEvidenceJson(rec.responses))problems.push("Re-running the agents does not reproduce the recorded responses");
 }catch(e){problems.push(e instanceof Error?e.message:"Record could not be verified")}
 if(rec.scientificApproval!==false)problems.push("A record may not carry scientific approval");
 return problems;
}
export type {DomainEdge};
