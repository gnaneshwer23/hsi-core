import type {ComparisonRow} from "../../../src/methods/extract";
import {parseRetryAfterSeconds} from "./retryAfter";
export type ComparePaper={id:string;title:string;url:string;licence:string;methodsFound:boolean;parameters:number};
export type CompareOutcome={kind:"ok";query:string;papers:ComparePaper[];rows:ComparisonRow[];notes:string[];source:string}|{kind:"limited";retryAfterSeconds?:number}|{kind:"invalid"}|{kind:"unavailable"};
const rec=(v:unknown):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&!Array.isArray(v);
export async function compareMethodsApi(query:string,request:typeof fetch=fetch):Promise<CompareOutcome>{
 let res:Response;
 try{res=await request("/api/research/methods-compare",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})})}catch{return {kind:"unavailable"}}
 if(res.status===429){
  const retryAfterSeconds=parseRetryAfterSeconds(res);
  return retryAfterSeconds===undefined?{kind:"limited"}:{kind:"limited",retryAfterSeconds};
 }
 if(res.status===400)return {kind:"invalid"};if(!res.ok)return {kind:"unavailable"};
 const b=await res.json().catch(()=>null);
 if(!rec(b)||!Array.isArray(b.papers)||!Array.isArray(b.rows)||!Array.isArray(b.notes))return {kind:"unavailable"};
 return {kind:"ok",query:String(b.query??query),papers:b.papers as ComparePaper[],rows:b.rows as ComparisonRow[],notes:(b.notes as unknown[]).map(String),source:String(b.source??"")};
}
