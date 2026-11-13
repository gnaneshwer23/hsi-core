/**
 * Live-mode readiness gate. Pure and offline: it inspects a config object and the *names* of environment variables
 * (never their values) and reports exactly what is still missing and who must provide it. It cannot grant, sign or
 * approve anything, and a "ready" result does not authorise a run: approvals are still verified per request by the
 * signed-receipt verifiers. Items held by people are never satisfied by engineering work.
 */
import {validateProviderConfig} from "./researchV2/providerReliability";

export type ReadinessOwner="founder"|"source-policy owner"|"security signer"|"model owner"|"scientist"|"operator"|"engineering";
export type ReadinessItem={id:string;requirement:string;heldBy:ReadinessOwner;status:"met"|"missing"|"invalid";detail:string};
export type LiveReadiness={ready:boolean;items:ReadinessItem[];blocking:ReadinessItem[];byOwner:Record<string,ReadinessItem[]>};
export type LiveRunConfig={
 environment:"isolated_staging"|"local";
 sourcePolicy:{ownerRef:string;termsRef:string;policyRef:string;allowedHosts:string[]};
 sourceAuthority:{issuer:string;keyIds:string[]};
 deploymentApproval:{issuer:string;keyId:string;publicKeyEnv:string};
 extractor:LiveDeploymentConfig;
 verifiers:LiveDeploymentConfig[];
 limits:{maxArticlesPerIntent:number;maxHitsPerIntent:number;maxModelCallsPerRun:number;maxRunsPerDay:number;killSwitchEnv:string};
 review:{normalizerReviewRef:string;questionReviewRef:string};
 operationStore:{path:string};
};
export type LiveDeploymentConfig={
 deploymentId:string;providerId:string;modelId:string;endpoint:string;timeoutMs:number;maxResponseBytes:number;
 termsRef:string;sourcePolicyRef:string;maxOutputTokens:number;budgetUnits:number;credentialEnv:string;
};
/** Hosts a live run may contact. Anything else is invalid; this list changes only through code and security review. */
export const LIVE_ALLOWED_HOSTS:readonly string[]=Object.freeze(["www.ebi.ac.uk","reactome.org"]);
export const LIVE_HARD_LIMITS=Object.freeze({maxArticlesPerIntent:5,maxHitsPerIntent:8,maxModelCallsPerRun:60,maxRunsPerDay:20});
/** Engineering gaps found while preparing live mode. Flip a flag only together with the code and tests that close it. */
export const ENGINEERING_GAPS:Readonly<Record<"sourceAuthorityService"|"extractionTask"|"liveRunPath",{implemented:boolean;detail:string}>>=Object.freeze({
 sourceAuthorityService:{implemented:false,detail:"Only the SourceAuthorityAdapter interface and the receipt verifier exist. A service or offline signing tool that lets an independent person issue signed clearance receipts (Ed25519) has not been built."},
 extractionTask:{implemented:false,detail:"createStagingProviderOperations supports the entailment schema only. A strict extraction schema for the approved providers needs security review and a provider smoke run."},
 liveRunPath:{implemented:false,detail:"The CLI composes live search and provider runners only after the items above exist; fixture mode is the only executable path."},
});
const ID=/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,255}$/,ENV=/^[A-Z][A-Z0-9_]{2,63}$/;
const isObj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
const present=(env:Record<string,string|undefined>,name:unknown)=>typeof name==="string"&&ENV.test(name)&&typeof env[name]==="string"&&env[name]!.trim().length>0;

export function assessLiveReadiness(config:unknown,env:Record<string,string|undefined>=process.env):LiveReadiness{
 const items:ReadinessItem[]=[];
 const add=(id:string,requirement:string,heldBy:ReadinessOwner,ok:boolean|"missing",detail:string)=>items.push({id,requirement,heldBy,status:ok===true?"met":ok==="missing"?"missing":"invalid",detail});
 const c=isObj(config)?config:{};
 if(!isObj(config)){add("config","A live run configuration file","founder","missing","No configuration object was provided.")}
 const sp=isObj(c.sourcePolicy)?c.sourcePolicy:{};
 add("environment","Isolated staging or local only; never production","operator",c.environment==="isolated_staging"||c.environment==="local"?(env.NODE_ENV!=="production"):(c.environment===undefined?"missing":false),
  c.environment===undefined?"environment not set":env.NODE_ENV==="production"?"NODE_ENV is production":String(c.environment));
 add("source-policy-owner","A named source-policy owner with terms and policy references","source-policy owner",
  [sp.ownerRef,sp.termsRef,sp.policyRef].every(v=>typeof v==="string"&&ID.test(v))?true:[sp.ownerRef,sp.termsRef,sp.policyRef].every(v=>v===undefined)?"missing":false,
  "ownerRef, termsRef and policyRef must be identifiers issued by the owner");
 const hosts=Array.isArray(sp.allowedHosts)?sp.allowedHosts:null;
 add("source-hosts","Allowed hosts are a non-empty subset of the code-reviewed list","source-policy owner",hosts===null?"missing":hosts.length>0&&hosts.every(h=>typeof h==="string"&&LIVE_ALLOWED_HOSTS.includes(h)),
  hosts===null?"allowedHosts not set":`permitted: ${LIVE_ALLOWED_HOSTS.join(", ")}`);
 const sa=isObj(c.sourceAuthority)?c.sourceAuthority:{};
 add("source-authority-identity","An independent clearance authority issuer and key ids","security signer",
  typeof sa.issuer==="string"&&ID.test(sa.issuer)&&Array.isArray(sa.keyIds)&&sa.keyIds.length>0&&sa.keyIds.every(k=>typeof k==="string"&&ID.test(k))?true:sa.issuer===undefined?"missing":false,"issuer and at least one Ed25519 key id");
 const da=isObj(c.deploymentApproval)?c.deploymentApproval:{};
 add("deployment-approval-authority","A deployment approval issuer, key id and public key (environment variable name)","security signer",
  typeof da.issuer==="string"&&ID.test(da.issuer)&&typeof da.keyId==="string"&&ID.test(da.keyId)&&present(env,da.publicKeyEnv)?true:da.issuer===undefined?"missing":false,
  typeof da.publicKeyEnv==="string"?(present(env,da.publicKeyEnv)?`${da.publicKeyEnv} is set`:`${da.publicKeyEnv} is not set`):"publicKeyEnv not set");
 const deployment=(label:string,d:unknown):ReadinessItem[]=>{
  const out:ReadinessItem[]=[],mk=(suffix:string,req:string,ok:boolean|"missing",detail:string)=>out.push({id:`${label}-${suffix}`,requirement:`${label}: ${req}`,heldBy:"model owner",status:ok===true?"met":ok==="missing"?"missing":"invalid",detail});
  if(!isObj(d)){mk("deployment","an approved model deployment","missing","not configured");return out}
  let configOk=true,why="provider, model and endpoint match the code-reviewed list";
  try{validateProviderConfig({providerId:String(d.providerId),modelId:String(d.modelId),endpoint:String(d.endpoint),timeoutMs:Number(d.timeoutMs),maxResponseBytes:Number(d.maxResponseBytes)})}catch(e){configOk=false;why=e instanceof Error?e.message:"invalid"}
  mk("provider","a provider configuration on the approved endpoint list",configOk,why);
  mk("terms","terms and source-policy references",[d.deploymentId,d.termsRef,d.sourcePolicyRef].every(v=>typeof v==="string"&&ID.test(v))&&d.sourcePolicyRef===sp.policyRef,"termsRef and sourcePolicyRef issued by the owner; sourcePolicyRef must equal the source policy");
  const n=(v:unknown,max:number)=>Number.isSafeInteger(v)&&(v as number)>0&&(v as number)<=max;
  mk("budget","a token and unit budget",n(d.maxOutputTokens,4096)&&n(d.budgetUnits,1e12),"maxOutputTokens up to 4096 and a positive budgetUnits");
  mk("credential","a credential in the environment (name only, value never read)",present(env,d.credentialEnv),typeof d.credentialEnv==="string"?d.credentialEnv+(present(env,d.credentialEnv)?" is set":" is not set"):"credentialEnv not set");
  return out;
 };
 items.push(...deployment("extractor",c.extractor));
 const verifiers=Array.isArray(c.verifiers)?c.verifiers:[];
 const ids=verifiers.map(v=>isObj(v)?v.deploymentId:null);
 add("verifiers-independent","At least two distinct verifier deployments, none the extractor","model owner",verifiers.length===0?"missing":verifiers.length>=2&&new Set(ids).size===ids.length&&!ids.includes(isObj(c.extractor)?c.extractor.deploymentId:undefined),
  `${verifiers.length} configured`);
 for(const [i,v] of verifiers.entries())items.push(...deployment(`verifier-${i+1}`,v));
 const l=isObj(c.limits)?c.limits:{};
 const within=(k:keyof typeof LIVE_HARD_LIMITS)=>Number.isInteger(l[k])&&(l[k] as number)>=1&&(l[k] as number)<=LIVE_HARD_LIMITS[k];
 add("limits","Per-run and daily limits within the hard maxima, and a kill switch variable","operator",c.limits===undefined?"missing":(Object.keys(LIVE_HARD_LIMITS) as (keyof typeof LIVE_HARD_LIMITS)[]).every(within)&&typeof l.killSwitchEnv==="string"&&ENV.test(l.killSwitchEnv)&&env[l.killSwitchEnv]!=="true",
  `hard maxima: ${JSON.stringify(LIVE_HARD_LIMITS)}${typeof l.killSwitchEnv==="string"&&env[l.killSwitchEnv]==="true"?"; kill switch is engaged":""}`);
 const rv=isObj(c.review)?c.review:{};
 add("normalizer-review","A scientist's review of the context normalizer registry","scientist",typeof rv.normalizerReviewRef==="string"&&ID.test(rv.normalizerReviewRef)?true:rv.normalizerReviewRef===undefined?"missing":false,"normalizerReviewRef");
 add("question-review","A scientist's review of the question wording and pathway terms","scientist",typeof rv.questionReviewRef==="string"&&ID.test(rv.questionReviewRef)?true:rv.questionReviewRef===undefined?"missing":false,"questionReviewRef");
 const os=isObj(c.operationStore)?c.operationStore:{};
 add("operation-store","A path for the append-only operation and receipt store","operator",typeof os.path==="string"&&os.path.trim().length>0&&os.path.length<=512?true:os.path===undefined?"missing":false,"operationStore.path");
 for(const [key,gap] of Object.entries(ENGINEERING_GAPS))add(`engineering-${key}`,key,"engineering",gap.implemented?true:"missing",gap.detail);
 const blocking=items.filter(i=>i.status!=="met"),byOwner:Record<string,ReadinessItem[]>={};
 for(const i of blocking){const list=byOwner[i.heldBy]??[];list.push(i);byOwner[i.heldBy]=list}
 return {ready:blocking.length===0,items,blocking,byOwner};
}

export function renderReadiness(r:LiveReadiness):string{
 const lines=[r.ready?"LIVE READINESS: all items met. This still does not authorise a run; signed approvals are checked per request.":`LIVE READINESS: NOT READY (${r.blocking.length} of ${r.items.length} items open)`,""];
 for(const [owner,list] of Object.entries(r.byOwner)){lines.push(`## ${owner}`);for(const i of list)lines.push(`- [${i.status}] ${i.requirement} (${i.id}): ${i.detail}`);lines.push("")}
 return lines.join("\n");
}
