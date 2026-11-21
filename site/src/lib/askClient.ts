import type {Run} from "./workspaceView";
import {parseRetryAfterSeconds} from "./retryAfter";
/** Browser client for POST /api/ask. Maps every outcome to a state the UI can show honestly; never invents an answer. */
export type AskTrace={matchedBy:string;question:string;sources:string[];modelCheck:string};
export type AskOutcome=
 |{kind:"routed";scenarioId:string;trace:AskTrace;run:Run}
 |{kind:"unrouted";message:string;available:{id:string;title:string;question:string}[]}
 |{kind:"signed-out"}|{kind:"unverified"}|{kind:"limited";retryAfterSeconds?:number}|{kind:"unavailable"}|{kind:"invalid"}|{kind:"error"};
export const ASK_MIN=8,ASK_MAX=500;
export const askLengthOk=(q:string)=>{const n=q.trim().length;return n>=ASK_MIN&&n<=ASK_MAX};
const rec=(v:unknown):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&!Array.isArray(v);
export async function askQuestion(question:string,request:typeof fetch=fetch):Promise<AskOutcome>{
 if(!askLengthOk(question))return {kind:"invalid"};
 let res:Response;
 try{res=await request("/api/ask",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:question.trim()})})}catch{return {kind:"error"}}
 if(res.status===401)return {kind:"signed-out"};
 if(res.status===403){const b=await res.json().catch(()=>null);return rec(b)&&b.code==="EMAIL_NOT_VERIFIED"?{kind:"unverified"}:{kind:"error"}}
 if(res.status===429){
  const retryAfterSeconds=parseRetryAfterSeconds(res);
  return retryAfterSeconds===undefined?{kind:"limited"}:{kind:"limited",retryAfterSeconds};
 }
 if(res.status===503)return {kind:"unavailable"};
 if(res.status===400)return {kind:"invalid"};
 if(!res.ok)return {kind:"error"};
 const b=await res.json().catch(()=>null);
 if(!rec(b))return {kind:"error"};
 if(b.routed===false)return {kind:"unrouted",message:typeof b.message==="string"?b.message:"Nothing was run.",available:Array.isArray(b.available)?(b.available as unknown[]).filter(rec).map(a=>({id:String(a.id),title:String(a.title),question:String(a.question)})).slice(0,10):[]};
 if(b.routed===true&&typeof b.scenarioId==="string"&&rec(b.trace)&&rec(b.result)&&Array.isArray((b.result as Record<string,unknown>).candidates)){
  const t=b.trace;
  return {kind:"routed",scenarioId:b.scenarioId,trace:{matchedBy:String(t.matchedBy??""),question:String(t.question??""),sources:Array.isArray(t.sources)?t.sources.map(String):[],modelCheck:String(t.modelCheck??"unknown")},run:b.result as unknown as Run};
 }
 return {kind:"error"};
}
