import type {TargetProfile} from "../../../src/investigation/targetProfile";
export type TargetOutcome={kind:"ok";profile:TargetProfile;caveat:string}|{kind:"not_found"}|{kind:"limited"}|{kind:"invalid"}|{kind:"unavailable"};
const rec=(v:unknown):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&!Array.isArray(v);
export async function fetchTargets(diseaseId:string,request:typeof fetch=fetch):Promise<TargetOutcome>{
 let res:Response;
 try{res=await request("/api/research/target-evidence",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({diseaseId})})}catch{return {kind:"unavailable"}}
 if(res.status===404)return {kind:"not_found"};if(res.status===429)return {kind:"limited"};if(res.status===400)return {kind:"invalid"};if(!res.ok)return {kind:"unavailable"};
 const b=await res.json().catch(()=>null);
 if(!rec(b)||!rec(b.profile)||!Array.isArray(b.profile.candidates)||typeof b.caveat!=="string")return {kind:"unavailable"};
 return {kind:"ok",profile:b.profile as unknown as TargetProfile,caveat:b.caveat};
}
