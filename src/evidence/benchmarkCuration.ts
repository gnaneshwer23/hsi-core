/** Private benchmark review contract. No accounts, outreach, storage deployment or scientific approval. */
import {DETAILED_CONTEXT_FIELDS} from "./passageLinkedContext";
import {benchmarkDigest,buildImmunoProtocol,CONFLICT_CLASSES,type ImmunoDomain,type PrivateGold} from "./immunoBenchmark";
export type CurationAssessment=Pick<PrivateGold,"conflict"|"answerability"|"rationale"|"expectedBehavior"|"provenanceCriteria"|"safetyCriteria">;
export type CurationGrant={principalRef:string;active:boolean;consented:boolean;domains:ImmunoDomain[];conflictFreeCaseHashes:string[]};
export type CurationSubmission={principalRef:string;requestId:string;caseHash:string;assessment:CurationAssessment;assessmentHash:string};
export type CurationRecord={
 schemaVersion:"hsi-private-benchmark-curation-1";id:string;slotId:string;version:number;caseHash:string;domain:ImmunoDomain;authorRef:string;
 assessors:[string,string];adjudicatorRef:string;sourcePacketRef:string;sourceClearanceHash:string;
 assessments:CurationSubmission[];
 adjudication:null|{principalRef:string;requestId:string;caseHash:string;assessmentHashes:[string,string];decision:"agreed"|"resolved";rationale:string;decisionHash:string};
};
export interface PrivateCurationStore{
 load(id:string):Promise<{revision:string;record:CurationRecord}|null>;
 /** Compare-and-swap must be atomic, immutable/versioned and tenant-bound in the real protected store. */
 compareAndSwap(id:string,expectedRevision:string,next:CurationRecord):Promise<boolean>;
}
const ref=(x:unknown):x is string=>typeof x==="string"&&/^[A-Za-z0-9][A-Za-z0-9:_.\/-]{0,255}$/.test(x);
const hex=(x:unknown):x is string=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
function assessment(input:CurationAssessment):CurationAssessment{
 const a=structuredClone(input);
 if(!a||Object.keys(a).sort().join(",")!=="answerability,conflict,expectedBehavior,provenanceCriteria,rationale,safetyCriteria"||!CONFLICT_CLASSES.includes(a.conflict)||!["answer","abstain"].includes(a.answerability)||typeof a.rationale!=="string"||!a.rationale.trim()||a.rationale.length>8000||[a.expectedBehavior,a.provenanceCriteria,a.safetyCriteria].some(v=>!Array.isArray(v)||!v.length||v.length>32||v.some(s=>typeof s!=="string"||!s.trim()||s.length>2000)))throw Error("Invalid independent assessment");
 return a;
}
export function validateCurationRecord(r:CurationRecord){
 const slot=buildImmunoProtocol().slots.find(s=>s.slotId===r.slotId);
 if(r.schemaVersion!=="hsi-private-benchmark-curation-1"||!ref(r.id)||!slot||slot.domain!==r.domain||!Number.isSafeInteger(r.version)||r.version<1||!hex(r.caseHash)||!hex(r.sourceClearanceHash)||!ref(r.sourcePacketRef)||![r.authorRef,r.adjudicatorRef,...r.assessors].every(ref)||r.assessors.length!==2||new Set([r.authorRef,r.adjudicatorRef,...r.assessors]).size!==4||!Array.isArray(r.assessments)||r.assessments.length>2||new Set(r.assessments.map(a=>a.principalRef)).size!==r.assessments.length)throw Error("Invalid private case assignment");
 for(const a of r.assessments)if(!r.assessors.includes(a.principalRef)||!ref(a.requestId)||a.caseHash!==r.caseHash||benchmarkDigest(assessment(a.assessment))!==a.assessmentHash)throw Error("Unbound assessment");
 if(r.adjudication){
  const a=r.adjudication,{decisionHash,...body}=a;
  if(r.assessments.length!==2||a.principalRef!==r.adjudicatorRef||a.caseHash!==r.caseHash||!ref(a.requestId)||!["agreed","resolved"].includes(a.decision)||typeof a.rationale!=="string"||!a.rationale.trim()||a.rationale.length>8000||a.assessmentHashes.length!==2||a.assessmentHashes.some((h,n)=>h!==r.assessments.find(x=>x.principalRef===r.assessors[n])!.assessmentHash)||benchmarkDigest(body)!==decisionHash)throw Error("Unbound adjudication");
  if(a.decision==="agreed"&&new Set(r.assessments.map(s=>JSON.stringify([s.assessment.conflict,s.assessment.answerability]))).size!==1)throw Error("Different assessments require resolved adjudication");
 }
}
/** Session identity and current scope/COI grants come only from trusted server adapters. */
export function createBenchmarkCurationService(deps:{enabled?:boolean;timeoutMs?:number;store:PrivateCurationStore;authenticate:(session:string)=>Promise<string|null>;grant:(principalRef:string)=>Promise<CurationGrant|null>;sourceCurrent:(binding:Readonly<Pick<CurationRecord,"id"|"version"|"caseHash"|"domain"|"sourcePacketRef"|"sourceClearanceHash">>)=>Promise<boolean>}){
 const enabled=deps.enabled===true,store={load:deps.store.load.bind(deps.store),compareAndSwap:deps.store.compareAndSwap.bind(deps.store)},authenticate=deps.authenticate,grant=deps.grant,sourceCurrent=deps.sourceCurrent;
 const timeoutMs=deps.timeoutMs??5000;
 if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000)throw Error("Invalid curation deadline");
 async function bounded<T>(operation:()=>Promise<T>):Promise<T>{let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([operation(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error("Curation operation deadline; reconcile unknown writes")),timeoutMs);})]);}finally{if(timer)clearTimeout(timer);}}
 async function access(session:string,id:string){
  if(!enabled)throw Error("Private curation disabled");
  if(!ref(id))throw Error("Private curation unavailable");
  const actor=await bounded(()=>authenticate(session));if(!actor)throw Error("Private curation unavailable");
  const loaded=await bounded(()=>store.load(id));if(!loaded)throw Error("Private curation unavailable");
  const r=structuredClone(loaded.record);validateCurationRecord(r);if(r.id!==id)throw Error("Private curation unavailable");
  if(![r.authorRef,r.adjudicatorRef,...r.assessors].includes(actor))throw Error("Private curation unavailable");
  const g=await bounded(()=>grant(actor));
  if(!g||g.principalRef!==actor||!g.active||!g.consented||!g.domains.includes(r.domain)||!g.conflictFreeCaseHashes.includes(r.caseHash)||await bounded(()=>sourceCurrent({id:r.id,version:r.version,caseHash:r.caseHash,domain:r.domain,sourcePacketRef:r.sourcePacketRef,sourceClearanceHash:r.sourceClearanceHash}))!==true)throw Error("Private curation unavailable");
  return {actor,r,revision:loaded.revision};
 }
 return {
  async view(session:string,id:string){
   const {actor,r}=await access(session,id);
   return {id:r.id,slotId:r.slotId,version:r.version,caseHash:r.caseHash,sourcePacketRef:r.sourcePacketRef,sourceClearanceHash:r.sourceClearanceHash,role:r.assessors.includes(actor)?"assessor":actor===r.adjudicatorRef?"adjudicator":"author",ownAssessmentSubmitted:r.assessments.some(a=>a.principalRef===actor),assessmentCount:r.assessments.length,adjudicationRecorded:!!r.adjudication,scientificApproval:false as const};
  },
  async readAssessment(session:string,id:string,assessorRef:string){
   const {actor,r}=await access(session,id);
   if(actor!==assessorRef&&(actor!==r.adjudicatorRef||r.assessments.length!==2))throw Error("Blind assessment access denied");
   const a=r.assessments.find(x=>x.principalRef===assessorRef);if(!a)throw Error("Blind assessment access denied");return structuredClone(a);
  },
  async submit(session:string,id:string,input:{caseHash:string;requestId:string;assessment:CurationAssessment}){
   input=structuredClone(input);const {actor,r,revision}=await access(session,id);
   if(!r.assessors.includes(actor)||input.caseHash!==r.caseHash||!ref(input.requestId))throw Error("Independent assigned assessor required");
   const a=assessment(input.assessment),hash=benchmarkDigest(a),old=r.assessments.find(x=>x.principalRef===actor);
   if(old){if(old.requestId===input.requestId&&old.assessmentHash===hash)return {assessmentHash:hash,immutable:true as const};throw Error("Assessment already locked; create a new case version");}
   if(r.adjudication)throw Error("Case version adjudicated");
   r.assessments.push({principalRef:actor,requestId:input.requestId,caseHash:r.caseHash,assessment:a,assessmentHash:hash});
   // Revalidate current membership/source after asynchronous work; durable adapter must enforce transaction isolation.
   await access(session,id);
   if(!await bounded(()=>store.compareAndSwap(id,revision,r)))throw Error("Concurrent update; reload and reconcile");
   return {assessmentHash:hash,immutable:true as const};
  },
  async adjudicate(session:string,id:string,input:{caseHash:string;requestId:string;decision:"agreed"|"resolved";rationale:string}){
   input=structuredClone(input);const {actor,r,revision}=await access(session,id);
   if(actor!==r.adjudicatorRef||r.assessments.length!==2||input.caseHash!==r.caseHash||!ref(input.requestId))throw Error("Independent adjudicator and two locked assessments required");
   const body={principalRef:actor,caseHash:input.caseHash,requestId:input.requestId,decision:input.decision,rationale:input.rationale,assessmentHashes:r.assessors.map(p=>r.assessments.find(a=>a.principalRef===p)!.assessmentHash) as [string,string]};
   const decisionHash=benchmarkDigest(body);
   if(r.adjudication){if(r.adjudication.decisionHash===decisionHash)return {decisionHash,scientificApproval:false as const,freezeApproved:false as const};throw Error("Adjudication immutable; create a new version");}
   r.adjudication={...body,decisionHash};validateCurationRecord(r);await access(session,id);
   if(!await bounded(()=>store.compareAndSwap(id,revision,r)))throw Error("Concurrent update; reload and reconcile");
   return {decisionHash,scientificApproval:false as const,freezeApproved:false as const};
  },
 };
}

/** Validates preparation artifacts, never upgrades model drafts into scientific cases. */
export function validatePrivateDraftWorkbook(input:unknown){
 const d=structuredClone(input) as {schemaVersion:string;canonicalProtocolHash:string;status:string;caseCount:number;adjudicatedCount:number;clearedSourceCount:number;scientificApproval:boolean;approvedWorkspace:unknown;holdoutEligible:boolean;cases:{slotId:string;layer:string;domain:string;status:string;draftQuestion:string;gold:unknown;expertAssessments:unknown[];adjudication:unknown;eligibleForLockedEvaluation:boolean;contextFieldsToExtract:string[];sources:unknown[];clearanceReceipts:unknown[]}[]};
 const p=buildImmunoProtocol();
 if(!d||d.schemaVersion!=="hsi-immuno-authoring-drafts-1"||d.canonicalProtocolHash!==p.protocolHash||d.status!=="DRAFT_AUTHORING_ONLY"||d.caseCount!==120||d.adjudicatedCount!==0||d.clearedSourceCount!==0||d.scientificApproval!==false||d.approvedWorkspace!==null||d.holdoutEligible!==false||!Array.isArray(d.cases)||d.cases.length!==120||new Set(d.cases.map(c=>c.slotId)).size!==120||new Set(d.cases.map(c=>c.draftQuestion?.trim().toLowerCase())).size!==120)throw Error("Invalid private draft workbook");
 for(const c of d.cases){
  const slot=p.slots.find(s=>s.slotId===c.slotId);
  if(!slot||slot.layer!==c.layer||slot.domain!==c.domain||c.status!=="MODEL_AUTHORED_DRAFT_NOT_GOLD"||typeof c.draftQuestion!=="string"||!c.draftQuestion.trim()||c.draftQuestion.length>4000||c.gold!==null||c.adjudication!==null||c.eligibleForLockedEvaluation!==false||!Array.isArray(c.expertAssessments)||c.expertAssessments.length||!Array.isArray(c.sources)||c.sources.length||!Array.isArray(c.clearanceReceipts)||c.clearanceReceipts.length||!Array.isArray(c.contextFieldsToExtract)||[...c.contextFieldsToExtract].sort().join(",")!==[...DETAILED_CONTEXT_FIELDS].sort().join(","))throw Error("Draft content is incomplete or misrepresented as accepted science");
 }
 return {draftTasks:120,adjudicatedCases:0,clearedSources:0,holdoutEligible:false as const,scientificApproval:false as const};
}
