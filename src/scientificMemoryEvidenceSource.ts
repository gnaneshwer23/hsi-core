import type {EvidenceObservation,EvidenceStatus} from "./scientificMemoryEvidenceFreshness";
export interface PublicEvidenceIdentity {sourceId:string;sourceVersion:string}
export interface EvidenceSourceAdapter {
 readonly authority:string;
 readonly transport:"local_fixture"|"external";
 lookup(identity:Readonly<PublicEvidenceIdentity>,signal:AbortSignal):Promise<unknown>;
}
export interface EvidenceNotice extends EvidenceObservation {noticeRef:string}
const statuses:readonly EvidenceStatus[]=["current","corrected","retracted","superseded","expression_of_concern","unknown"];
/** Fixture-only gateway. External transport requires separate approval. */
export function createEvidenceSourceGateway(adapter:EvidenceSourceAdapter,timeoutMs=3000){
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)throw Error("Invalid evidence timeout");
 return {async lookup(identity:PublicEvidenceIdentity,nowMs:number):Promise<EvidenceNotice>{
  if(adapter.transport!=="local_fixture"||adapter.authority!=="synthetic-fixture")throw Error("Evidence source not approved");
  if(!identity||!/^fixture:[A-Za-z0-9._-]{1,120}$/.test(identity.sourceId)||!/^v[1-9][0-9]{0,8}$/.test(identity.sourceVersion)||!Number.isSafeInteger(nowMs)||nowMs<0)throw Error("Invalid evidence identity");
  const request=Object.freeze({sourceId:identity.sourceId,sourceVersion:identity.sourceVersion});
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const raw=await Promise.race([adapter.lookup(request,controller.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error("timeout"));},timeoutMs);})]);
   if(!raw||typeof raw!=="object")throw Error();
   const r=raw as Record<string,unknown>;
   if(r.sourceId!==request.sourceId||r.sourceVersion!==request.sourceVersion||r.authority!=="synthetic-fixture"||!statuses.includes(r.status as EvidenceStatus)||typeof r.checkedAt!=="string"||!Number.isFinite(Date.parse(r.checkedAt))||Date.parse(r.checkedAt)>nowMs||typeof r.noticeRef!=="string"||!/^fixture:[A-Za-z0-9._-]{1,120}$/.test(r.noticeRef))throw Error();
   return {...request,authority:"synthetic-fixture",status:r.status as EvidenceStatus,checkedAt:r.checkedAt,noticeRef:r.noticeRef};
  }catch{throw Error("Evidence source unavailable");}finally{if(timer!==undefined)clearTimeout(timer);}
 }};
}
