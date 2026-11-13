/** Versioned audit artifacts over the existing comparison engine. No provider, review or write activation defaults. */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {compareEvidenceUnits,compareContextualCandidatePairs,assessContradictionInvestigation,type ComparableEvidenceUnit,type StructuredEvidenceComparison} from "./structuredEvidenceComparison";
import type {OpposingSearchExecutionStatus} from "./opposingEvidenceSearch";
import type {ResearchSource,ResearchPassage} from "../researchContracts";
import {requiresScientificException} from "../researchV2/passageVerification";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {buildPassageLinkedContext,validatePassageLinkedContext} from "./passageLinkedContext";
export type ContextConflictClass="consistent"|"potential_conflict"|"context_dependent"|"methodological_difference"|"insufficient_evidence";
const hash=(v:unknown)=>createHash("sha256").update(canonicalEvidenceJson(v)).digest("hex");
export function reportContextConflict(comparison:StructuredEvidenceComparison):{classification:ContextConflictClass;comparisonId:string;reasons:string[];scientificApproval:false;graphPromotable:false}{
 const incomplete=comparison.trace.contextDepth!=="passage_linked"||!comparison.trace.detailedComparability||["insufficient_evidence","not_comparable"].includes(comparison.trace.detailedComparability.status);
 const causal=requiresScientificException(comparison.left.predicate)||requiresScientificException(comparison.right.predicate);
 const classification:ContextConflictClass=incomplete||causal||comparison.outcome==="insufficient_comparability"||comparison.outcome==="insufficient_evidence"?"insufficient_evidence":comparison.outcome==="potential_contradiction"?"potential_conflict":comparison.outcome;
 return {classification,comparisonId:comparison.id,reasons:[...(incomplete?["Detailed context/estimand is missing, unresolved or not comparable"]:[]),...(causal?["Causal or therapeutic bridge requires independent evidence and review"]:[]),comparison.rationale],scientificApproval:false,graphPromotable:false};
}
export type ContextAuditHit={id:string;source:ResearchSource;passage:ResearchPassage;clearanceReceiptId:string};
export type ContextAuditSearch={intent:"support"|"oppose";status:OpposingSearchExecutionStatus;queriedAt:string;queryHash:string;sourceIds:string[];hits:ContextAuditHit[]};
export type ContextConflictAudit={
 schemaVersion:"hsi-context-conflict-audit-1";id:string;auditHash:string;investigationId:string;diseaseScope:"ssc"|"ra";question:string;
 release:{id:string;version:string;manifestHash:string};version:number;parentAuditHash:string|null;
 searches:Omit<ContextAuditSearch,"hits">[];units:ComparableEvidenceUnit[];comparisons:StructuredEvidenceComparison[];
 report:ReturnType<typeof reportContextConflict>[];gaps:string[];blockedReason:string|null;
 verifier:{status:"checked_with_limitations"|"needs_evidence"|"failed"|"not_executed";receiptId:string|null};
 humanReview:{status:"required"};consensusEstablished:false;scientificApproval:false;graphPromotable:false;
};
export type ContextAuditTarget={investigationId:string;diseaseScope:"ssc"|"ra";question:string;release:ContextConflictAudit["release"]};
export function createContextConflictAuditRunner(deps:{
 enabled?:boolean;
 search:(target:Readonly<ContextAuditTarget>,intent:"support"|"oppose",signal:AbortSignal)=>Promise<ContextAuditSearch>;
 authorizePassage:(hit:Readonly<ContextAuditHit>,actions:readonly ["storage","display","comparison","export"],signal:AbortSignal)=>Promise<boolean>;
 extract:(hit:Readonly<ContextAuditHit>,target:Readonly<ContextAuditTarget>,signal:AbortSignal)=>Promise<ComparableEvidenceUnit>;
 verify:(material:Readonly<{target:ContextAuditTarget;comparisons:StructuredEvidenceComparison[];gaps:string[]}>,signal:AbortSignal)=>Promise<ContextConflictAudit["verifier"]>;
 /** Append must atomically compare the previous hash and retain immutable versions. */
 append:(artifact:Readonly<ContextConflictAudit>,expectedPrevious:string|null,signal:AbortSignal)=>Promise<void>;
 approvedNormalizerHashes?:readonly string[];
 timeoutMs?:number;now?:()=>string;
}){
 const {search,authorizePassage,extract,verify,append}=deps,enabled=deps.enabled===true,timeoutMs=deps.timeoutMs??30000,now=deps.now??(()=>new Date().toISOString());
 const normalizers=new Set([hash({version:"hsi-basic-units-taxa-1",aliases:[]}),...(deps.approvedNormalizerHashes??[])]);
 if([search,authorizePassage,extract,verify,append].some(fn=>typeof fn!=="function")||!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>120000)throw Error("Trusted bounded audit dependencies required");
 return {async run(input:ContextAuditTarget,previous?:Pick<ContextConflictAudit,"auditHash"|"version"|"investigationId"|"diseaseScope"|"release">,signal?:AbortSignal):Promise<ContextConflictAudit>{
  if(!enabled)throw Error("Context-conflict audit execution disabled");
  const target=structuredClone(input),parent=previous?structuredClone(previous):null;
  if(!target.investigationId?.trim()||target.investigationId.length>128||!target.question?.trim()||target.question.length>500||!["ssc","ra"].includes(target.diseaseScope)||!target.release?.id?.trim()||!target.release.version?.trim()||!/^[a-f0-9]{64}$/.test(target.release.manifestHash)||parent&&(!/^[a-f0-9]{64}$/.test(parent.auditHash)||!Number.isSafeInteger(parent.version)||parent.version<1||parent.investigationId!==target.investigationId||parent.diseaseScope!==target.diseaseScope||canonicalEvidenceJson(parent.release)!==canonicalEvidenceJson(target.release))||!rejectPhiPayload({textBlobs:[target.question]}).ok)throw Error("Invalid research audit target");
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener("abort",abort,{once:true});
  let timer:ReturnType<typeof setTimeout>|undefined;
  const checkpoint=()=>{if(controller.signal.aborted)throw Error("Audit cancelled");};
  const operation=async()=>{
   const searched=await Promise.allSettled((["support","oppose"] as const).map(async intent=>{checkpoint();return search(structuredClone(target),intent,controller.signal)}));
   checkpoint();
   const searches:ContextAuditSearch[]=searched.map((result,n)=>result.status==="fulfilled"?structuredClone(result.value):{intent:n===0?"support":"oppose",status:"provider_unavailable",queriedAt:now(),queryHash:hash({question:target.question,intent:n}),sourceIds:[],hits:[]});
   for(let n=0;n<searches.length;n++){
    const s=searches[n]!;
    if(s.intent!==(n===0?"support":"oppose")||!["completed_bounded","partial","provider_unavailable","successful_empty","skipped_budget","not_executed","invalid_query"].includes(s.status)||!Number.isFinite(Date.parse(s.queriedAt))||!/^[a-f0-9]{64}$/.test(s.queryHash)||!Array.isArray(s.hits)||s.hits.length>16||!Array.isArray(s.sourceIds)||s.sourceIds.length>32||new Set(s.sourceIds).size!==s.sourceIds.length||s.hits.some(h=>!s.sourceIds.includes(h.source.id))||!["completed_bounded","partial"].includes(s.status)&&s.hits.length)throw Error("Invalid search execution receipt");
   }
   const hits=new Map<string,ContextAuditHit>();let blockedReason:string|null=null;
   for(const s of searches)for(const hit of s.hits){
    if(!hit.id?.trim()||!hit.clearanceReceiptId?.trim()||hit.source.id!==hit.passage.sourceId||hit.source.provenance.version!==hit.passage.sourceVersion)throw Error("Unbound audit hit");
    buildPassageLinkedContext({source:hit.source,passage:hit.passage,clearanceReceiptId:hit.clearanceReceiptId,extractions:{}});
    const key=JSON.stringify([hit.source.id,hit.passage.sourceVersion,hit.passage.id]),old=hits.get(key);
    if(old&&hash(old)!==hash(hit))throw Error("Conflicting source versions in audit batch");hits.set(key,hit);
   }
   if(hits.size>16)throw Error("Audit evidence budget exceeded");
   // Preauthorize the entire batch before any extraction/model dispatch.
   for(const hit of hits.values()){
    checkpoint();
    try{if(await authorizePassage(structuredClone(hit),["storage","display","comparison","export"],controller.signal)!==true)blockedReason="Source use is not currently authorized";}catch{blockedReason="Source clearance is unavailable";}
    checkpoint();
   }
   const units:ComparableEvidenceUnit[]=[];
   if(!blockedReason)for(const hit of hits.values()){
    if(controller.signal.aborted)throw Error("Audit cancelled");
    const unit=structuredClone(await extract(structuredClone(hit),structuredClone(target),controller.signal)),c=unit.detailedContext;checkpoint();
    if(!c||c.sourceId!==hit.source.id||c.sourceVersion!==hit.passage.sourceVersion||c.passageId!==hit.passage.id||c.passageText!==hit.passage.text||c.clearanceReceiptId!==hit.clearanceReceiptId||!unit.evidenceSourceIds.includes(hit.source.id)||!normalizers.has(hash(c.normalizationRegistry)))throw Error("Extraction changed source provenance or approved normalization");validatePassageLinkedContext(c);units.push(unit);
   }
   if(new Set(units.map(u=>u.id)).size!==units.length)throw Error("Duplicate extracted claim identity");
   const comparisons:StructuredEvidenceComparison[]=[];
   for(let a=0;a<units.length;a++)for(let b=a+1;b<units.length;b++)comparisons.push(compareEvidenceUnits({left:units[a]!,right:units[b]!}));
   const report=comparisons.map(reportContextConflict),gaps=[...new Set([...(blockedReason?[blockedReason]:[]),...searches.filter(s=>s.status!=="completed_bounded").map(s=>`${s.intent}: ${s.status}; search completeness and consensus are not established`),...(units.length<2?["Fewer than two evidence units; pairwise conflict is not assessed"]:[]),...units.flatMap(u=>Object.entries(u.detailedContext!.fields).filter(([,v])=>!["reported","not_applicable"].includes(v.status)||v.status==="reported"&&!v.normalized).map(([k,v])=>u.id+": "+k+" "+v.status)),...report.flatMap(r=>r.classification==="insufficient_evidence"?r.reasons:[])])];
   let verifier:ContextConflictAudit["verifier"]={status:"not_executed",receiptId:null};
   if(units.length&&!blockedReason){
    try{verifier=structuredClone(await verify({target:structuredClone(target),comparisons:structuredClone(comparisons),gaps:[...gaps]},controller.signal));}
    catch{verifier={status:"failed",receiptId:null};}
    if(!["checked_with_limitations","needs_evidence","failed","not_executed"].includes(verifier.status)||verifier.status==="checked_with_limitations"&&!verifier.receiptId?.trim())throw Error("Invalid verifier receipt");
   }
   if(controller.signal.aborted)throw Error("Audit cancelled");
   for(const hit of blockedReason?[]:hits.values()){
    checkpoint();if(await authorizePassage(structuredClone(hit),["storage","display","comparison","export"],controller.signal)!==true)throw Error("Source clearance changed before artifact storage");
   }
   const body={schemaVersion:"hsi-context-conflict-audit-1" as const,...target,version:(parent?.version??0)+1,parentAuditHash:parent?.auditHash??null,searches:searches.map(({hits:_,...metadata})=>metadata),units,comparisons,report,gaps,blockedReason,verifier,humanReview:{status:"required" as const},consensusEstablished:false as const,scientificApproval:false as const,graphPromotable:false as const};
   checkpoint();
   if(new TextEncoder().encode(canonicalEvidenceJson(body)).byteLength>2_000_000)throw Error("Audit artifact budget exceeded");
   const auditHash=hash(body),artifact={...body,id:"context-audit-"+auditHash.slice(0,32),auditHash};
   validateContextConflictAudit(artifact);
   await append(structuredClone(artifact),parent?.auditHash??null,controller.signal);
   checkpoint();return artifact;
  };
  try{
   if(signal?.aborted)throw Error("Audit cancelled");
   return await Promise.race([operation(),new Promise<never>((_,reject)=>{
    timer=setTimeout(()=>{controller.abort();reject(Error("Audit deadline exceeded"))},timeoutMs);
    controller.signal.addEventListener("abort",()=>reject(Error("Audit cancelled")),{once:true});
   })]);
  }finally{if(timer)clearTimeout(timer);signal?.removeEventListener("abort",abort);controller.abort();}
 }};
}
export function validateContextConflictAudit(value:ContextConflictAudit):void{
 if(!value||value.schemaVersion!=="hsi-context-conflict-audit-1"||value.scientificApproval!==false||value.graphPromotable!==false||value.consensusEstablished!==false||value.humanReview?.status!=="required"||!Number.isSafeInteger(value.version)||value.version<1||value.version===1&&value.parentAuditHash!==null||value.version>1&&!/^[a-f0-9]{64}$/.test(value.parentAuditHash??"")||!Array.isArray(value.units)||value.units.length>16||new Set(value.units.map(u=>u.id)).size!==value.units.length)throw Error("Invalid context audit artifact");
 if(!value.investigationId?.trim()||value.investigationId.length>128||!value.question?.trim()||value.question.length>500||!["ssc","ra"].includes(value.diseaseScope)||!value.release?.id?.trim()||!value.release.version?.trim()||!/^[a-f0-9]{64}$/.test(value.release.manifestHash)||!rejectPhiPayload({textBlobs:[value.question]}).ok)throw Error("Invalid audit target binding");
 if(!Array.isArray(value.searches)||value.searches.length!==2||value.searches.some((s,n)=>s.intent!==(n===0?"support":"oppose")||!["completed_bounded","partial","provider_unavailable","successful_empty","skipped_budget","not_executed","invalid_query"].includes(s.status)||!Number.isFinite(Date.parse(s.queriedAt))||!/^[a-f0-9]{64}$/.test(s.queryHash)||!Array.isArray(s.sourceIds)||s.sourceIds.length>32||new Set(s.sourceIds).size!==s.sourceIds.length||s.sourceIds.some(id=>typeof id!=="string"||!id.trim())))throw Error("Invalid audit search metadata");
 if(!Array.isArray(value.gaps)||value.gaps.some(g=>typeof g!=="string"||g.length>2000)||value.blockedReason!==null&&(typeof value.blockedReason!=="string"||!value.blockedReason.trim())||!value.verifier||!["checked_with_limitations","needs_evidence","failed","not_executed"].includes(value.verifier.status)||value.verifier.receiptId!==null&&(typeof value.verifier.receiptId!=="string"||!value.verifier.receiptId.trim())||value.verifier.status==="checked_with_limitations"&&!value.verifier.receiptId)throw Error("Invalid audit limits or verifier receipt");
 const {auditHash,id,...body}=value;
 if(hash(body)!==auditHash||id!=="context-audit-"+auditHash.slice(0,32)||new TextEncoder().encode(canonicalEvidenceJson(body)).byteLength>2_000_000)throw Error("Context audit content hash mismatch");
 const comparisons:StructuredEvidenceComparison[]=[];
 for(const unit of value.units){if(!unit.detailedContext)throw Error("Detailed context required in audit");validatePassageLinkedContext(unit.detailedContext);}
 for(let a=0;a<value.units.length;a++)for(let b=a+1;b<value.units.length;b++)comparisons.push(compareEvidenceUnits({left:value.units[a]!,right:value.units[b]!}));
 if(canonicalEvidenceJson(comparisons)!==canonicalEvidenceJson(value.comparisons)||canonicalEvidenceJson(comparisons.map(reportContextConflict))!==canonicalEvidenceJson(value.report))throw Error("Context audit comparison was not derived from its evidence");
 if(value.blockedReason&&value.units.length)throw Error("Blocked source text cannot enter an audit artifact");
}
export function renderContextConflictAudit(audit:ContextConflictAudit,format:"json"|"markdown"):string{
 validateContextConflictAudit(audit);return renderValidatedContextConflictAudit(audit,format);
}
/** Serialization only; callers must first verify the audit or its authenticated outcome receipt. */
export function renderValidatedContextConflictAudit(audit:ContextConflictAudit,format:"json"|"markdown"):string{
 if(format==="json")return JSON.stringify(audit,null,2)+"\n";
 const md=(s:string)=>s.replace(/[\\<>\[\]*_`#|]/g,c=>"\\"+c).replace(/[\r\n]/g," ");
 const lines=["# Context-Conflict Audit",md(audit.question),`Version ${audit.version}; SHA-256 ${audit.auditHash}; parent ${audit.parentAuditHash??"none"}.`,"Research use only; independent human review required. No scientific approval or graph promotion.","## Search coverage",...audit.searches.map(s=>`- ${s.intent}: ${s.status}. No consensus is inferred.`),"## Candidate comparison",...audit.report.map(r=>`- ${r.classification}: ${md(r.comparisonId)}. ${r.reasons.map(md).join(" ")}`),"## Passage-linked context"];
 for(const unit of audit.units){const c=unit.detailedContext;if(!c)continue;lines.push(`### ${md(unit.id)}`,`Source ${md(c.sourceId)}; version ${md(c.sourceVersion)}; passage ${md(c.passageId)}; digest ${c.passageSha256}; clearance ${md(c.clearanceReceiptId)}.`);for(const [field,v] of Object.entries(c.fields))lines.push(`- ${field}: ${v.status}; ${md(v.originalText??v.missingReason??"unknown")}${v.span?` [${v.span.start},${v.span.end})`:""}; normalized: ${md(v.normalized?JSON.stringify(v.normalized):"unresolved")}`);}
 lines.push("## Coverage and context gaps",...audit.gaps.map(g=>"- "+md(g)),`Verifier: ${audit.verifier.status}; receipt ${md(audit.verifier.receiptId??"none")}.`);
 return lines.join("\n")+"\n";
}

/** Reuse the existing contradiction-to-gap adapter; do not introduce another gap engine. */
export function contextAuditInvestigation(audit:ContextConflictAudit){
 validateContextConflictAudit(audit);
 const pack=compareContextualCandidatePairs({relationships:[],generatedAt:audit.searches[0]!.queriedAt});
 const names={consistent:"consistent",potential_contradiction:"potentialContradiction",context_dependent:"contextDependent",methodological_difference:"methodologicalDifference",insufficient_comparability:"insufficientComparability",insufficient_evidence:"insufficientEvidence"} as const;
 for(const comparison of audit.comparisons)pack.summary[names[comparison.outcome]]++;
 return assessContradictionInvestigation({pack:{...pack,comparisons:audit.comparisons},searchRecordHash:hash(audit.searches)});
}
