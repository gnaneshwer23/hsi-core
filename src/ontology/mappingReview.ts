/**
 * Curator recommendations on candidate ontology mappings. A recommendation is NOT an approved mapping: the reviewer is
 * self-declared and unverified here, so every record carries exactMappingApproved:false. Records are append-only and
 * digest-chained per concept, kept on one device, and exported for the formal review process. Nothing here changes the
 * graph or the ontology registry.
 */
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {canonicalEvidenceJson} from "../evidence/researchEvidenceCorpus";
import {looksIdentifying} from "../identifyingText";
import {browserStore as baseBrowserStore,memoryStore,type KeyValueStore} from "../knowledgeGraph/investigationStore";
import type {ConceptMapping} from "./conceptMapping";

export type CandidateMappingsFile={schemaVersion:"hsi-ontology-candidate-mappings-1";ontologies:{prefix:string;release:string}[];conceptCount:number;summary:Record<string,number>;mappings:ConceptMapping[]};
export type {KeyValueStore};
export {memoryStore};
export type ReviewDecision="accept_candidate"|"reject_candidate"|"defer";
export type CuratorDecision={schemaVersion:"hsi-curator-decision-1";conceptId:string;conceptName:string;decision:ReviewDecision;ontologyId:string|null;reason:string;reviewerLabel:string;reviewerVerified:false;decidedAt:string;revision:number;previousDigest:string|null;digest:string;mappingsDigest:string;status:"curator_recommendation_unverified";exactMappingApproved:false};
export type DecisionInput={conceptId:string;decision:ReviewDecision;ontologyId:string|null;reason:string;reviewerLabel:string};
export const REASON_LIMITS=Object.freeze({min:10,max:500});

const PREFIX="hsi-map:";
const keyOf=(conceptId:string,rev:number)=>`${PREFIX}${conceptId}:${String(rev).padStart(6,"0")}`;
const sha=async(text:string)=>[...new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,"0")).join("");
export const mappingsDigest=(f:CandidateMappingsFile)=>sha(canonicalEvidenceJson(f.mappings));
const parse=(raw:string|null):CuratorDecision|null=>{if(!raw)return null;try{const v=JSON.parse(raw) as CuratorDecision;return v&&v.schemaVersion==="hsi-curator-decision-1"?v:null}catch{return null}};
const withoutDigest=(d:CuratorDecision)=>{const {digest:_d,...rest}=d;return rest};

function revisionsOf(store:KeyValueStore,conceptId:string):number[]{
 const head=`${PREFIX}${conceptId}:`;
 return store.keys().filter(k=>k.startsWith(head)&&/^\d{6}$/.test(k.slice(head.length))).map(k=>Number(k.slice(head.length))).sort((a,b)=>a-b);
}
export function validateDecision(f:CandidateMappingsFile,i:DecisionInput):ConceptMapping{
 const m=f.mappings.find(x=>x.conceptId===i.conceptId);if(!m)throw Error("Unknown concept");
 if(!["accept_candidate","reject_candidate","defer"].includes(i.decision))throw Error("Unknown decision");
 const reason=i.reason.trim();
 if(reason.length<REASON_LIMITS.min||reason.length>REASON_LIMITS.max)throw Error(`A reason of ${REASON_LIMITS.min} to ${REASON_LIMITS.max} characters is required`);
 if(!rejectPhiPayload({textBlobs:[reason]}).ok||looksIdentifying(reason))throw Error("The reason appears to contain personal or clinical identifiers and cannot be recorded");
 if(!/^[\p{L}\p{N} .'_-]{2,60}$/u.test(i.reviewerLabel.trim()))throw Error("Enter a reviewer label of 2 to 60 letters, numbers or . ' _ - characters");
 if(i.decision==="defer"){if(i.ontologyId!==null)throw Error("A deferral does not name a candidate")}
 else{
  if(!i.ontologyId||!m.candidates.some(c=>c.id===i.ontologyId))throw Error("The decision must name one of this concept's candidates");
 }
 if(m.candidates.length===0)throw Error("This concept has no candidate to review");
 return m;
}
/** Pure step shared by every store: validate and build the next decision revision (or report it unchanged). */
export async function composeDecision(f:CandidateMappingsFile,i:DecisionInput,last:CuratorDecision|null,now:()=>Date=()=>new Date()):Promise<{status:"saved"|"unchanged";decision:CuratorDecision}>{
 const m=validateDecision(f,i),reason=i.reason.trim(),label=i.reviewerLabel.trim();
 if(last&&last.decision===i.decision&&last.ontologyId===i.ontologyId&&last.reason===reason&&last.reviewerLabel===label)return {status:"unchanged",decision:last};
 const base:Omit<CuratorDecision,"digest">={schemaVersion:"hsi-curator-decision-1",conceptId:i.conceptId,conceptName:m.conceptName,decision:i.decision,ontologyId:i.ontologyId,reason,reviewerLabel:label,reviewerVerified:false,decidedAt:now().toISOString(),revision:(last?.revision??0)+1,previousDigest:last?.digest??null,mappingsDigest:await mappingsDigest(f),status:"curator_recommendation_unverified",exactMappingApproved:false};
 const decision:CuratorDecision={...base,digest:await sha(canonicalEvidenceJson(base))};
 return {status:"saved",decision};
}
export async function recordDecision(f:CandidateMappingsFile,store:KeyValueStore,i:DecisionInput,now:()=>Date=()=>new Date()):Promise<{status:"saved"|"unchanged";decision:CuratorDecision}>{
 validateDecision(f,i);
 const revs=revisionsOf(store,i.conceptId),last=revs.length?parse(store.get(keyOf(i.conceptId,revs[revs.length-1]!))):null;
 if(revs.length&&!last)throw Error("The latest recorded decision is unreadable; refusing to extend the history");
 const r=await composeDecision(f,i,last,now);
 if(r.status==="saved")store.create(keyOf(i.conceptId,r.decision.revision),JSON.stringify(r.decision));
 return r;
}
export function history(store:KeyValueStore,conceptId:string):CuratorDecision[]{
 return revisionsOf(store,conceptId).map(r=>parse(store.get(keyOf(conceptId,r)))).filter((d):d is CuratorDecision=>d!==null);
}
export const latestDecisions=(f:CandidateMappingsFile,store:KeyValueStore):Map<string,CuratorDecision>=>{
 const out=new Map<string,CuratorDecision>();
 for(const m of f.mappings){const h=history(store,m.conceptId);if(h.length)out.set(m.conceptId,h[h.length-1]!)}
 return out;
};
/** Checks content digests, the revision chain and that every decision still refers to a real candidate. */
export async function verifyDecisions(f:CandidateMappingsFile,store:KeyValueStore):Promise<string[]>{
 const problems:string[]=[];
 for(const m of f.mappings){
  const h=history(store,m.conceptId);let prev:string|null=null;
  for(const [i,d] of h.entries()){
   if(d.revision!==i+1)problems.push(`${m.conceptName}: revision numbering is not contiguous`);
   if(await sha(canonicalEvidenceJson(withoutDigest(d)))!==d.digest)problems.push(`${m.conceptName}: revision ${d.revision} does not match its digest`);
   if(d.previousDigest!==prev)problems.push(`${m.conceptName}: revision ${d.revision} breaks the chain`);
   if(d.exactMappingApproved!==false||d.status!=="curator_recommendation_unverified")problems.push(`${m.conceptName}: revision ${d.revision} claims approval`);
   if(d.ontologyId&&!m.candidates.some(c=>c.id===d.ontologyId))problems.push(`${m.conceptName}: revision ${d.revision} names a term that is no longer a candidate`);
   prev=d.digest;
  }
 }
 return problems;
}
export type DecisionExport={schemaVersion:"hsi-curator-decisions-export-1";exportedAt:string;mappingsDigest:string;ontologies:CandidateMappingsFile["ontologies"];counts:{concepts:number;withCandidates:number;decided:number;accept_candidate:number;reject_candidate:number;defer:number;pending:number};decisions:CuratorDecision[];statement:string};
export async function exportDecisions(f:CandidateMappingsFile,store:KeyValueStore,now:()=>Date=()=>new Date()):Promise<DecisionExport>{
 const problems=await verifyDecisions(f,store);if(problems.length)throw Error("Decisions failed verification: "+problems.join("; "));
 const reviewable=f.mappings.filter(m=>m.candidates.length>0),latest=latestDecisions(f,store),all=f.mappings.flatMap(m=>history(store,m.conceptId));
 const n=(d:ReviewDecision)=>[...latest.values()].filter(x=>x.decision===d).length;
 return {schemaVersion:"hsi-curator-decisions-export-1",exportedAt:now().toISOString(),mappingsDigest:await mappingsDigest(f),ontologies:f.ontologies,
  counts:{concepts:f.mappings.length,withCandidates:reviewable.length,decided:latest.size,accept_candidate:n("accept_candidate"),reject_candidate:n("reject_candidate"),defer:n("defer"),pending:reviewable.length-latest.size},
  decisions:all,statement:"Curator recommendations by self-declared, unverified reviewers. None is an approved mapping; each still needs independent human review before it can be used as an exact mapping."};
}
/** Device-local storage under this module's own key prefix; null when the browser blocks it. */
export const browserStore=(storage?:Storage):KeyValueStore|null=>baseBrowserStore(storage,PREFIX);
