/** Independent authority adapter: consumes signed decisions, never grants rights itself. */
import {createHash} from "node:crypto";
import type {SourceClearanceVerifier,ClearanceBinding,SourceClearanceReceipt} from "./sourceClearanceReceipt";
import type {StagingOperationStore} from "./stagingOperationStore";
export type SourceDecisionState="cleared"|"unknown"|"expired"|"corrected"|"retracted"|"withdrawn"|"identifier_conflict"|"revoked";
export type SourceAuthorityAdapter={lookup:(binding:{sourceId:string;sourceVersion:string;passageSha256:string},signal:AbortSignal)=>Promise<{state:SourceDecisionState;policyRef:string;receipt?:unknown}>};
const id=(v:unknown):v is string=>typeof v==="string"&&/^[A-Za-z0-9][A-Za-z0-9:_.\/-]{0,255}$/.test(v);
export function createOperationalSourceClearance(config:{authority:SourceAuthorityAdapter;verifier:SourceClearanceVerifier;store:StagingOperationStore;now?:()=>number;timeoutMs?:number;onInvalidation?:(event:Readonly<{sourceId:string;sourceVersion:string;state:SourceDecisionState;policyRef:string}>,signal:AbortSignal)=>Promise<void>}){
 const authority={lookup:config.authority.lookup.bind(config.authority)},verifier={authorize:config.verifier.authorize.bind(config.verifier)},store={append:config.store.append.bind(config.store),read:config.store.read.bind(config.store)},onInvalidation=config.onInvalidation,now=config.now??Date.now,timeoutMs=config.timeoutMs??2000;
 if(!authority||typeof authority.lookup!=="function"||!verifier||typeof verifier.authorize!=="function"||!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>10000)throw Error("Invalid source authority configuration");
 async function notifyInvalidation(event:{sourceId:string;sourceVersion:string;state:SourceDecisionState;policyRef:string}){
  if(!onInvalidation)return;const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  try{await Promise.race([onInvalidation(structuredClone(event),controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("Source invalidation persistence deadline"))},timeoutMs)})])}finally{if(timer)clearTimeout(timer);controller.abort()}
 }
 async function flags(sourceId:string,state:SourceDecisionState){
  const rows=store.read();
  for(const dependency of rows.filter(e=>e.type==="source_dependency"&&e.sourceId===sourceId)){
   if(rows.some(e=>e.type==="artifact_clearance_flag"&&e.artifactId===dependency.artifactId&&e.sourceId===sourceId&&e.state===state))continue;
   await store.append({type:"artifact_clearance_flag",sourceId,artifactId:dependency.artifactId,state,at:new Date(now()).toISOString(),scientificApproval:false,graphPromotable:false});
  }
 }
 async function lookupDecision(binding:{sourceId:string;sourceVersion:string;passageSha256:string}){
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  let decision:{state:SourceDecisionState;policyRef:string;receipt?:unknown};
  try{decision=structuredClone(await Promise.race([authority.lookup(binding,controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error("Source authority deadline")),timeoutMs)})]));}
  catch{decision={state:"unknown",policyRef:"authority-unavailable"};}
  finally{if(timer)clearTimeout(timer);controller.abort();}
  const states:SourceDecisionState[]=["cleared","unknown","expired","corrected","retracted","withdrawn","identifier_conflict","revoked"];
  if(!decision||!states.includes(decision.state)||!id(decision.policyRef))return {state:"unknown" as SourceDecisionState,policyRef:"invalid-authority-decision"};
  return decision;
 }
 async function decide(input:ClearanceBinding):Promise<{state:SourceDecisionState;receipt:SourceClearanceReceipt|null;policyRef:string}>{
  const binding=structuredClone(input);
  if(!id(binding.sourceId)||!id(binding.sourceVersion)||typeof binding.passage!=="string"||!binding.passage.trim()||binding.passage.length>3000)throw Error("Invalid source binding");
  const passageSha256=createHash("sha256").update(binding.passage).digest("hex");
  const decision=await lookupDecision({sourceId:binding.sourceId,sourceVersion:binding.sourceVersion,passageSha256});
  let state=decision.state,receipt:SourceClearanceReceipt|null=null;
  if(state==="cleared"){
   const r=decision.receipt as SourceClearanceReceipt|undefined;
   if(!r||r.sourceId!==binding.sourceId||r.sourceVersion!==binding.sourceVersion||r.passageSha256!==passageSha256)state="identifier_conflict";
   else if(Date.parse(r.expiresAt)<=now())state="expired";
   else {
    const declared=binding.receipt as Partial<SourceClearanceReceipt>|null;
    if(declared&&(declared.id!==r.id||declared.issuer!==r.issuer||declared.canonicalId!==r.canonicalId))state="identifier_conflict";
    else try{if(await verifier.authorize({...binding,receipt:r})===true)receipt=structuredClone(r);else state="unknown";}catch{state="unknown";}
   }
  }
  await store.append({type:"source_decision",sourceId:binding.sourceId,sourceVersion:binding.sourceVersion,passageSha256,state,policyRef:decision.policyRef,at:new Date(now()).toISOString(),scientificApproval:false,graphPromotable:false});
  if(receipt)await store.append({type:"source_receipt",sourceId:binding.sourceId,sourceVersion:binding.sourceVersion,passageSha256,receipt});
  else {await flags(binding.sourceId,state);await notifyInvalidation({sourceId:binding.sourceId,sourceVersion:binding.sourceVersion,state,policyRef:decision.policyRef});}
  return {state,receipt,policyRef:decision.policyRef};
 }
 return {
  decide,
  async refresh(sourceId:string){
   if(!id(sourceId))throw Error("Invalid source refresh");
   const event=store.read().filter(e=>e.type==="source_receipt"&&e.sourceId===sourceId).at(-1);
   if(!event)throw Error("Stored source receipt required");
   const r=event.receipt as SourceClearanceReceipt;
   const decision=await lookupDecision({sourceId,sourceVersion:r.sourceVersion,passageSha256:r.passageSha256});
   let state=decision.state;
   if(state==="cleared"){
    const latest=decision.receipt as Partial<SourceClearanceReceipt>|undefined;
    if(!latest||latest.sourceId!==r.sourceId||latest.sourceVersion!==r.sourceVersion||latest.canonicalId!==r.canonicalId||latest.passageSha256!==r.passageSha256)state="identifier_conflict";
    else if(Date.parse(r.expiresAt)<=now())state="expired";
   }
   if(state!=="cleared"){
    await store.append({type:"source_decision",sourceId,sourceVersion:r.sourceVersion,passageSha256:r.passageSha256,state,policyRef:decision.policyRef,at:new Date(now()).toISOString(),scientificApproval:false,graphPromotable:false});
    await flags(sourceId,state);await notifyInvalidation({sourceId,sourceVersion:r.sourceVersion,state,policyRef:decision.policyRef});
   }
   return {state,automaticArtifactReapproval:false as const};
  },
  async authorize(binding:ClearanceBinding){return (await decide(binding)).state==="cleared";},
  async registerDependency(sourceId:string,artifactId:string){
   if(!id(sourceId)||!id(artifactId))throw Error("Invalid source dependency");
   if(!store.read().some(e=>e.type==="source_receipt"&&e.sourceId===sourceId))throw Error("Stored trusted clearance required before dependency registration");
   await store.append({type:"source_dependency",sourceId,artifactId,at:new Date(now()).toISOString()});
   const latest=store.read().filter(e=>e.type==="source_decision"&&e.sourceId===sourceId).at(-1);
   if(latest&&latest.state!=="cleared")await flags(sourceId,latest.state as SourceDecisionState);
  },
 };
}
