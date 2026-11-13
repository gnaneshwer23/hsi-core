/**
 * Readiness items for enabling source integrity automation in a real environment. Offline and pure, like the live readiness gate
 * (same item and owner types): it reports what a named human or an operator must still provide, never reads secret values, and
 * cannot approve anything. Folding these items into the combined live gate follows once the in-flight live-mode changes land.
 */
import type {LiveReadiness,ReadinessItem,ReadinessOwner} from "./liveReadiness";

export type SourceIntegrityConfig={
 policyFile:string;policyApprovalRef:string;
 policyApprover:{issuer:string;keyId:string;publicKeyEnv:string};
 signer:{serviceRef:string;issuer:string;keyId:string};
 requestedUses:string[];
};
export const INTEGRITY_ENGINEERING_GAPS=Object.freeze({
 managedSigningAdapter:{implemented:true,detail:"Built: src/researchV2/managedSigner.ts adapts a provider sign function to ReceiptSigner and verifies each signature against the pinned public key. The signing service itself, its key and the pinned public key are provisioned by the security signer (see the managed-signer item)."},
});
const ID=/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,255}$/,ENV=/^[A-Z][A-Z0-9_]{2,63}$/;
const isObj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);

export function assessSourceIntegrityReadiness(config:unknown,env:Record<string,string|undefined>=process.env):LiveReadiness{
 const items:ReadinessItem[]=[];
 const add=(id:string,requirement:string,heldBy:ReadinessOwner,ok:boolean|"missing",detail:string)=>items.push({id,requirement,heldBy,status:ok===true?"met":ok==="missing"?"missing":"invalid",detail});
 const c=isObj(config)?config:{};
 add("policy-approval","A source clearance policy signed by a named human, with an approval reference","source-policy owner",typeof c.policyFile==="string"&&c.policyFile.length>0&&typeof c.policyApprovalRef==="string"&&ID.test(c.policyApprovalRef)?true:c.policyFile===undefined?"missing":false,"policyFile and policyApprovalRef; the signature is verified on every call, so a file alone is never trusted");
 const pa=isObj(c.policyApprover)?c.policyApprover:{};
 add("policy-approver-key","A pinned approver identity: issuer, key id and public key (environment variable name)","security signer",typeof pa.issuer==="string"&&ID.test(pa.issuer)&&typeof pa.keyId==="string"&&ID.test(pa.keyId)&&typeof pa.publicKeyEnv==="string"&&ENV.test(pa.publicKeyEnv)&&!!env[pa.publicKeyEnv]?.trim()?true:pa.issuer===undefined?"missing":false,typeof pa.publicKeyEnv==="string"?pa.publicKeyEnv+(env[pa.publicKeyEnv]?" is set":" is not set"):"publicKeyEnv not set");
 const sg=isObj(c.signer)?c.signer:{};
 add("managed-signer","A managed signing service reference with issuer and key id; no private key in the application, prompts, logs or repository","security signer",[sg.serviceRef,sg.issuer,sg.keyId].every(v=>typeof v==="string"&&ID.test(v))?true:sg.serviceRef===undefined?"missing":false,"serviceRef, issuer and keyId");
 add("requested-uses","An explicit list of the uses this deployment will request","source-policy owner",Array.isArray(c.requestedUses)&&c.requestedUses.length>0?true:c.requestedUses===undefined?"missing":false,"CLEAR is possible only for uses the approved policy authorises for the licence");
 for(const [k,g] of Object.entries(INTEGRITY_ENGINEERING_GAPS))add(`engineering-${k}`,k,"engineering",g.implemented?true:"missing",g.detail);
 const blocking=items.filter(i=>i.status!=="met"),byOwner:Record<string,ReadinessItem[]>={};
 for(const i of blocking){const list=byOwner[i.heldBy]??[];list.push(i);byOwner[i.heldBy]=list}
 return {ready:blocking.length===0,items,blocking,byOwner};
}
