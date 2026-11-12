/** Verify independently issued staging approvals. This module cannot issue approval. */
import {verify,type KeyObject} from "node:crypto";
import type {StagingOperationStore} from "./stagingOperationStore";
export type DeploymentApprovalBinding={deploymentId:string;configurationHash:string;termsRef:string;sourcePolicyRef:string};
export type StagingDeploymentApproval=DeploymentApprovalBinding&{
 schemaVersion:"hsi-staging-deployment-approval-1";id:string;issuer:string;keyId:string;
 environment:"isolated_staging";checkedAt:string;expiresAt:string;signature:string;
};
const fields=["deploymentId","configurationHash","termsRef","sourcePolicyRef","schemaVersion","id","issuer","keyId","environment","checkedAt","expiresAt","signature"];
export function stagingApprovalSigningText(receipt:Omit<StagingDeploymentApproval,"signature">|StagingDeploymentApproval){return JSON.stringify(Object.fromEntries(fields.filter(k=>k!=="signature").sort().map(k=>[k,receipt[k as keyof typeof receipt]])));}
export function createStagingDeploymentApprovalVerifier(config:{
 authorities:readonly {issuer:string;keyId:string;publicKey:KeyObject}[];
 resolveReceipt:(binding:Readonly<DeploymentApprovalBinding>,signal:AbortSignal)=>Promise<unknown>;
 isRevoked:(id:string,issuer:string,signal:AbortSignal)=>Promise<boolean>;
 store:Pick<StagingOperationStore,"append">;
 now?:()=>number;timeoutMs?:number;
}){
 const authorities=config.authorities.map(a=>({...a})),resolveReceipt=config.resolveReceipt,isRevoked=config.isRevoked,record=config.store?.append.bind(config.store),now=config.now??Date.now,timeoutMs=config.timeoutMs??2000;
 if(!authorities.length||authorities.some(a=>!a.issuer||!a.keyId||a.publicKey.type!=="public"||a.publicKey.asymmetricKeyType!=="ed25519")||new Set(authorities.map(a=>JSON.stringify([a.issuer,a.keyId]))).size!==authorities.length||typeof resolveReceipt!=="function"||typeof isRevoked!=="function"||typeof record!=="function"||!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>10000)throw Error("Invalid staging approval authority");
 return {async authorize(input:DeploymentApprovalBinding){
  const binding=structuredClone(input),controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  const verifyApproval=async()=>{
   const r=structuredClone(await resolveReceipt(Object.freeze(binding),controller.signal)) as StagingDeploymentApproval;
   if(!r||typeof r!=="object"||Object.keys(r).sort().join(",")!==[...fields].sort().join(",")||fields.some(k=>typeof r[k as keyof StagingDeploymentApproval]!=="string"||!(r[k as keyof StagingDeploymentApproval] as string).trim()||(r[k as keyof StagingDeploymentApproval] as string).length>256))return false;
   if(r.schemaVersion!=="hsi-staging-deployment-approval-1"||r.environment!=="isolated_staging"||!/^\w[\w:.-]*$/.test(r.id)||!/^[a-f0-9]{64}$/.test(r.configurationHash)||["deploymentId","configurationHash","termsRef","sourcePolicyRef"].some(k=>r[k as keyof DeploymentApprovalBinding]!==binding[k as keyof DeploymentApprovalBinding]))return false;
   const start=Date.parse(r.checkedAt),end=Date.parse(r.expiresAt),current=now();
   if(!Number.isFinite(current)||!Number.isFinite(start)||!Number.isFinite(end)||start>current||end<=current||end<=start||end-start>86400000)return false;
   const authority=authorities.find(a=>a.issuer===r.issuer&&a.keyId===r.keyId);
   if(!authority||!/^[A-Za-z0-9_-]{86}$/.test(r.signature)||!verify(null,Buffer.from(stagingApprovalSigningText(r)),authority.publicKey,Buffer.from(r.signature,"base64url")))return false;
   if(await isRevoked(r.id,r.issuer,controller.signal)!==false)return false;
   const beforeStore=now();if(controller.signal.aborted||!Number.isFinite(beforeStore)||beforeStore<start||beforeStore>=end)return false;
   await record({type:"deployment_approval_receipt",receipt:r});
   const after=now();return !controller.signal.aborted&&Number.isFinite(after)&&after>=start&&after<end;
  };
  try{return await Promise.race([verifyApproval(),new Promise<false>(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(false)},timeoutMs)})]);}
  catch{return false;}finally{if(timer)clearTimeout(timer);controller.abort();}
 }};
}
