/**
 * Scientific reviewer preview: pure review logic over synthetic claims.
 * A decision here is local and illustrative. Nothing is promoted, approved or recorded on a server.
 */
import {edgeById,entityById,type AtlasStatus} from "../components/atlas/atlasData";

export type Decision="approve"|"revise"|"reject"|"abstain";
export type Verdict="supports"|"disagrees"|"insufficient";
export const CONTEXT_FIELDS=["Model system","Dose or exposure","Assay","Timepoint","Outcome measure"] as const;

export type ReviewClaim={
 id:string;edgeId:string;statement:string;status:AtlasStatus;
 /** Synthetic context as extracted: a missing entry is an honest gap, never filled in. */
 context:Partial<Record<(typeof CONTEXT_FIELDS)[number],string>>;
 assessments:{assessor:string;verdict:Verdict;note:string}[];
 versions:{v:number;change:string}[];
 corrections:"none flagged"|"check not connected";
};

const claim=(id:string,edgeId:string,context:ReviewClaim["context"],assessments:ReviewClaim["assessments"],versions:ReviewClaim["versions"]):ReviewClaim=>{
 const e=edgeById[edgeId]!;
 return {id,edgeId,statement:`${entityById[e.from]!.label} → ${entityById[e.to]!.label}: ${e.basis}`,status:e.status,context,assessments,versions,corrections:"check not connected"};
};

/** Synthetic review queue built from the illustrative atlas. Assessors are placeholders, not real models. */
export const QUEUE:readonly ReviewClaim[]=[
 claim("RC-1","e-but-bar",{"Model system":"Mouse","Assay":"Barrier permeability"},[
  {assessor:"Assessor A",verdict:"supports",note:"Reads the finding as strengthening."},
  {assessor:"Assessor B",verdict:"disagrees",note:"Reads a different study as impairing."},
  {assessor:"Assessor C",verdict:"insufficient",note:"Dose and timing are not stated."},
 ],[{v:1,change:"Extracted from two studies"},{v:2,change:"Marked as an unresolved conflict"}]),
 claim("RC-2","e-bar-il6",{"Model system":"Human cohort","Timepoint":"Cross-sectional"},[
  {assessor:"Assessor A",verdict:"supports",note:"Association is reported."},
  {assessor:"Assessor B",verdict:"insufficient",note:"Direction cannot be told from a cross-section."},
  {assessor:"Assessor C",verdict:"insufficient",note:"No intervention."},
 ],[{v:1,change:"Extracted"}]),
 claim("RC-3","e-ni-pd",{"Model system":"Human post-mortem","Assay":"Immunohistochemistry","Outcome measure":"Glial activation"},[
  {assessor:"Assessor A",verdict:"supports",note:"Observed in tissue."},
  {assessor:"Assessor B",verdict:"supports",note:"Observed in tissue."},
  {assessor:"Assessor C",verdict:"disagrees",note:"Observation does not show cause."},
 ],[{v:1,change:"Extracted"},{v:2,change:"Downgraded from supported to association after a context check"}]),
 claim("RC-4","e-il6-bbb",{"Model system":"Mouse"},[
  {assessor:"Assessor A",verdict:"insufficient",note:"Preclinical only."},
  {assessor:"Assessor B",verdict:"insufficient",note:"Mechanism proposed, not tested."},
  {assessor:"Assessor C",verdict:"insufficient",note:"No human data."},
 ],[{v:1,change:"Extracted as a hypothesis"}]),
 claim("RC-5","e-but-treg",{"Model system":"Mouse and in vitro","Dose or exposure":"Dose range","Assay":"Flow cytometry","Timepoint":"Several days","Outcome measure":"FOXP3+ fraction"},[
  {assessor:"Assessor A",verdict:"supports",note:"Consistent across models."},
  {assessor:"Assessor B",verdict:"supports",note:"Consistent across models."},
  {assessor:"Assessor C",verdict:"supports",note:"Human interventional data are limited."},
 ],[{v:1,change:"Extracted"},{v:2,change:"Context completed by the extractor"}]),
];
export const claimById=Object.fromEntries(QUEUE.map(c=>[c.id,c])) as Record<string,ReviewClaim>;

export const contextGaps=(c:ReviewClaim)=>CONTEXT_FIELDS.filter(f=>!c.context[f]);
export const completeness=(c:ReviewClaim)=>({have:CONTEXT_FIELDS.length-contextGaps(c).length,of:CONTEXT_FIELDS.length});
export const hasDisagreement=(c:ReviewClaim)=>c.assessments.some(a=>a.verdict==="disagrees");
export const needsAttention=(c:ReviewClaim)=>hasDisagreement(c)||contextGaps(c).length>0;

export type Draft={decision:Decision|null;rationale:string;ackGaps:boolean;ackDisagreement:boolean};
export const EMPTY_DRAFT:Draft={decision:null,rationale:"",ackGaps:false,ackDisagreement:false};
export const MIN_RATIONALE=20;

/** What stops a decision from being recorded. An approval needs more than a revision or an abstention. */
export function blockers(c:ReviewClaim,d:Draft):string[]{
 const out:string[]=[];
 if(!d.decision)return ["Choose a decision."];
 if(d.decision!=="abstain"&&d.rationale.trim().length<MIN_RATIONALE)out.push(`Write a rationale of at least ${MIN_RATIONALE} characters.`);
 if(d.decision==="approve"){
  if(contextGaps(c).length&&!d.ackGaps)out.push(`Context is incomplete (${contextGaps(c).join(", ")}). Acknowledge it to approve.`);
  if(hasDisagreement(c)&&!d.ackDisagreement)out.push("Independent assessments disagree. Acknowledge it to approve.");
 }
 return out;
}

export type LogEntry={n:number;claimId:string;decision:Decision;rationale:string;gaps:string[];disagreement:boolean;version:number};
/** Append-only: the only operation is to add. There is no edit and no delete. */
export function record(log:readonly LogEntry[],c:ReviewClaim,d:Draft):readonly LogEntry[]{
 if(blockers(c,d).length||!d.decision)return log;
 return [...log,{n:log.length+1,claimId:c.id,decision:d.decision,rationale:d.rationale.trim(),gaps:[...contextGaps(c)],disagreement:hasDisagreement(c),version:c.versions.at(-1)!.v}];
}
export const decided=(log:readonly LogEntry[],id:string)=>[...log].reverse().find(l=>l.claimId===id)?.decision??null;
export const pendingCount=(log:readonly LogEntry[])=>QUEUE.filter(c=>!decided(log,c.id)).length;
export const disagreementCount=()=>QUEUE.filter(hasDisagreement).length;
export const sourceCheckCount=()=>QUEUE.filter(c=>c.corrections==="check not connected").length;

export const LIFECYCLE=[
 {id:"candidate",label:"Candidate",note:"Extracted, unreviewed."},
 {id:"review",label:"In review",note:"Assigned to a reviewer."},
 {id:"adjudicated",label:"Adjudicated",note:"A reviewer decision with a rationale."},
 {id:"promoted",label:"Promoted",note:"Not available: needs an approved backend and review policy."},
] as const;
