/**
 * Live preflight: an OFFLINE checklist run before the first live investigation. It makes no network call, calls no model,
 * writes nothing and never prints a secret. It answers one question: what is still missing, and who holds it? A passing
 * preflight does not start a run and approves nothing; it only says the configured pieces exist and verify.
 */
import {createPublicKey,type KeyObject} from "node:crypto";
import {existsSync,lstatSync,readFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {assessLiveReadiness,type LiveRunConfig} from "./liveReadiness";
import {assessSourceIntegrityReadiness,type SourceIntegrityConfig} from "./sourceIntegrityReadiness";
import {verifyPolicyApproval} from "./researchV2/clearancePolicy";

export type PreflightCheck={id:string;ok:boolean;heldBy:string;detail:string};
export type PreflightReport={ready:boolean;checks:PreflightCheck[];blocking:PreflightCheck[]};
const isObj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);

export async function runLivePreflight(input:{config:unknown;integrityConfig:unknown;env:Record<string,string|undefined>;now?:()=>number}):Promise<PreflightReport>{
 const checks:PreflightCheck[]=[],add=(id:string,ok:boolean,heldBy:string,detail:string)=>checks.push({id,ok,heldBy,detail});
 const live=assessLiveReadiness(input.config,input.env),integ=assessSourceIntegrityReadiness(input.integrityConfig,input.env);
 add("live-readiness",live.ready,"see items",live.ready?"all live readiness items are met":"open: "+live.blocking.map(i=>`${i.id} (${i.heldBy})`).join(", "));
 add("integrity-readiness",integ.ready,"see items",integ.ready?"all source integrity items are met":"open: "+integ.blocking.map(i=>`${i.id} (${i.heldBy})`).join(", "));
 const cfg=isObj(input.config)?input.config as Partial<LiveRunConfig>:{},icfg=isObj(input.integrityConfig)?input.integrityConfig as Partial<SourceIntegrityConfig>:{};
 const kill=cfg.limits?.killSwitchEnv;
 add("kill-switch-clear",typeof kill==="string"&&!input.env[kill]?.trim(),"operator",typeof kill==="string"?(input.env[kill]?.trim()?"kill switch is ENGAGED":"kill switch variable is clear"):"no kill switch variable configured");
 const store=cfg.operationStore?.path;let storeOk=false,storeDetail="no operation store path configured";
 if(typeof store==="string"){try{const d=lstatSync(dirname(resolve(store)));storeOk=d.isDirectory()&&!d.isSymbolicLink()&&(d.mode&0o077)===0&&d.uid===process.geteuid?.();storeDetail=storeOk?"private operation store directory exists":"operation store directory must be a private (0700) directory owned by this user, not a symlink"}catch{storeDetail="operation store directory does not exist"}}
 add("operation-store",storeOk,"operator",storeDetail);
 let policyOk=false,policyDetail="no policy file configured",policyRef:string|null=null;
 if(typeof icfg.policyFile==="string"){
  try{
   if(!existsSync(icfg.policyFile))policyDetail="policy file does not exist";
   else{
    const pa=icfg.policyApprover,pem=pa?.publicKeyEnv?input.env[pa.publicKeyEnv]:undefined;
    if(!pa||!pem)policyDetail="approver public key is not in the environment";
    else{
     const key:KeyObject=createPublicKey(pem);
     const v=await verifyPolicyApproval(JSON.parse(readFileSync(icfg.policyFile,"utf8")),{authorities:[{issuer:pa.issuer,keyId:pa.keyId,publicKey:key}],now:(input.now??Date.now)()});
     policyOk=v.ok;if(v.ok)policyRef=`${v.policy.policyId}:v${v.policy.version}`;policyDetail=v.ok?`policy ${v.policy.policyId} v${v.policy.version} verifies against the pinned approver and is in its window`:`policy does not verify: ${v.code}`;
    }
   }
  }catch{policyDetail="policy file could not be read or verified"}
 }
 add("policy-verifies",policyOk,"source-policy owner",policyDetail);
 const refs=[cfg.extractor,...(cfg.verifiers??[])].filter(Boolean).map(d=>d!.sourcePolicyRef);
 add("deployments-bind-policy",policyRef!==null&&refs.length>0&&refs.every(r=>r===policyRef),"model owner",policyRef===null?"needs a verified policy to compare against":refs.every(r=>r===policyRef)?`every deployment's sourcePolicyRef is ${policyRef}`:`every deployment's sourcePolicyRef must equal the signed policy's id and version (${policyRef}); a mismatch makes provider operations refuse every source`);
 const creds=[cfg.extractor,...(cfg.verifiers??[])].filter(Boolean).map(d=>d!.credentialEnv);
 add("credentials-present",creds.length>=2&&creds.every(n=>typeof n==="string"&&!!input.env[n]?.trim()),"security signer",creds.length>=2?"credential variables present (values never read or printed)":"extractor and at least one verifier needed");
 add("distinct-verifiers",(()=>{const ids=(cfg.verifiers??[]).map(v=>v.deploymentId),models=(cfg.verifiers??[]).map(v=>v.modelId);return ids.length>=2&&new Set(ids).size===ids.length&&new Set(models).size===models.length&&!models.includes(cfg.extractor?.modelId??"")})(),"model owner","at least two verifiers with distinct deployments and models, none the extractor's model");
 const blocking=checks.filter(c=>!c.ok);
 return {ready:blocking.length===0,checks,blocking};
}
export function renderPreflight(r:PreflightReport):string{
 return ["# Live preflight (offline; no network, no model, nothing written)",...r.checks.map(c=>`- [${c.ok?"x":" "}] ${c.id}: ${c.detail}${c.ok?"":` (held by ${c.heldBy})`}`),"",r.ready?"All checks pass. This does not start a run and approves nothing.":`NOT READY: ${r.blocking.length} check(s) open.`].join("\n");
}
