/**
 * ARBITER packet: assembles what a human reviewer needs from a context-conflict audit, flags what needs attention, and
 * checks that a proposed reviewer is eligible. It never decides, approves or promotes: the packet is read-only data with a
 * content hash, and review decisions are recorded elsewhere (contextAuditReview) by an authenticated, scoped human.
 */
import {createHash} from "node:crypto";
import type {ContextConflictAudit} from "./evidence/contextConflictAudit";
import type {IndependentChallenge} from "./researchV2/scientificEntailment";
import type {ExtractionRejection} from "./evidence/modelEvidenceExtraction";
import {reviewerScopeFor} from "./investigationScope";

export type AttentionFlag={code:"insufficient_evidence"|"potential_conflict"|"verifier_disagreement"|"verifier_not_supporting"|"extraction_rejected"|"audit_gap"|"no_reviewer_authority";detail:string;ref:string|null};
export type ReviewPacket={
 schemaVersion:"hsi-review-packet-1";packetHash:string;auditHash:string;investigationId:string;diseaseScope:string;question:string;
 units:{id:string;label:string;polarity:string;subject:string;object:string;sourceIds:readonly string[]}[];
 comparisons:{id:string;classification:string;reasons:readonly string[]}[];
 entailments:{claimId:string;verifierId:string;verdict:string;evidenceSpan:string|null}[];
 flags:AttentionFlag[];reviewerScopeAvailable:boolean;
 humanReview:"required";builtBy:"arbiter";scientificApproval:false;graphPromotable:false;
};
const sha=(t:string)=>createHash("sha256").update(t).digest("hex");
const stable=(v:unknown):string=>Array.isArray(v)?"["+v.map(stable).join(",")+"]":v&&typeof v==="object"?"{"+Object.keys(v as object).sort().map(k=>JSON.stringify(k)+":"+stable((v as Record<string,unknown>)[k])).join(",")+"}":JSON.stringify(v)??"null";

export function buildReviewPacket(input:{audit:ContextConflictAudit;entailments?:readonly IndependentChallenge[];rejections?:readonly ExtractionRejection[]}):ReviewPacket{
 const {audit}=input,ents=input.entailments??[],rej=input.rejections??[];
 const flags:AttentionFlag[]=[];
 for(const r of audit.report){
  if(r.classification==="insufficient_evidence")flags.push({code:"insufficient_evidence",detail:"A comparison could not be completed: "+(r.reasons[0]??"context incomplete"),ref:r.comparisonId});
  if(r.classification==="potential_conflict")flags.push({code:"potential_conflict",detail:"Possible conflict between findings in comparable contexts. Needs scientist judgement.",ref:r.comparisonId});
 }
 const byClaim=new Map<string,IndependentChallenge[]>();for(const e of ents)byClaim.set(e.claimId,[...(byClaim.get(e.claimId)??[]),e]);
 for(const [claimId,list] of byClaim){
  if(new Set(list.map(e=>e.verdict)).size>1)flags.push({code:"verifier_disagreement",detail:"Independent verifiers returned different verdicts.",ref:claimId});
  else if(list.some(e=>e.verdict!=="supports"))flags.push({code:"verifier_not_supporting",detail:"Verifiers did not find the claim supported by the passage.",ref:claimId});
 }
 for(const x of rej)flags.push({code:"extraction_rejected",detail:`${x.field}: ${x.reason}`,ref:x.hitId});
 for(const g of audit.gaps)flags.push({code:"audit_gap",detail:g,ref:null});
 const scopeOk=reviewerScopeFor(audit.diseaseScope)!==null;
 if(!scopeOk)flags.push({code:"no_reviewer_authority",detail:"No accepted reviewer authority exists for this scope; the packet cannot be routed until one is appointed.",ref:null});
 const body={
  schemaVersion:"hsi-review-packet-1" as const,auditHash:audit.auditHash,investigationId:audit.investigationId,diseaseScope:audit.diseaseScope,question:audit.question,
  units:audit.units.map(u=>({id:u.id,label:u.label,polarity:u.findingPolarity,subject:u.subject.label??u.subject.value,object:u.object.label??u.object.value,sourceIds:u.evidenceSourceIds})),
  comparisons:audit.report.map(r=>({id:r.comparisonId,classification:r.classification,reasons:r.reasons})),
  entailments:ents.map(e=>({claimId:e.claimId,verifierId:e.verifierId,verdict:e.verdict,evidenceSpan:e.evidenceSpan??null})),
  flags,reviewerScopeAvailable:scopeOk,humanReview:"required" as const,builtBy:"arbiter" as const,scientificApproval:false as const,graphPromotable:false as const,
 };
 return {...body,packetHash:sha(stable(body))};
}

/** Eligibility only: returns refusal reasons (empty = may be offered the packet). Never records a decision. */
export function checkReviewerEligibility(packet:ReviewPacket,reviewer:{principal:string;scopes:readonly string[];authenticated:boolean;declaredConflict:boolean;principalsInvolved:readonly string[]}):string[]{
 const reasons:string[]=[];
 if(!reviewer.authenticated)reasons.push("reviewer is not authenticated");
 if(!packet.reviewerScopeAvailable)reasons.push("no reviewer authority exists for this scope");
 if(!reviewer.scopes.includes(packet.diseaseScope))reasons.push("reviewer is not scoped to "+packet.diseaseScope);
 if(reviewer.principalsInvolved.includes(reviewer.principal))reasons.push("reviewer was involved in producing this audit");
 if(reviewer.declaredConflict)reasons.push("reviewer declared a conflict of interest");
 if(reviewer.principal==="arbiter"||reviewer.principal.startsWith("system:"))reasons.push("a system principal cannot review");
 return reasons;
}

export function renderReviewPacket(p:ReviewPacket):string{
 return ["# Review packet (data for a human reviewer; not an approval)",`Packet ${p.packetHash.slice(0,12)} for audit ${p.auditHash.slice(0,12)} - scope ${p.diseaseScope}`,"",`Question: ${p.question}`,"",
  "## Needs attention",...(p.flags.length?p.flags.map(f=>`- [${f.code}] ${f.detail}${f.ref?" ("+f.ref+")":""}`):["- nothing flagged (a reviewer must still read the evidence)"]),"",
  "## Findings",...p.units.map(u=>`- ${u.label}: ${u.subject} -> ${u.object} (${u.polarity})`),"",
  "## Comparisons",...p.comparisons.map(c=>`- ${c.id}: ${c.classification}`),"","Not approved. Not promotable. Human decision required."].join("\n");
}
