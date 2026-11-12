/** Trusted server resolver boundary. Never resolve sources from request/LLM declarations. */
import {verifyPassageClaim,isGroundedPassageResult,type VerifiedSourceEnvelope,type EvidenceClaim,type PassageResult} from "./passageVerification";
export interface EvaluationGroundingVerifier {
 authorize(binding:{sourceVersion:string;claim:EvidenceClaim;passage:string;receipt:PassageResult}):Promise<boolean>;
}
export function createEvaluationGroundingVerifier(resolve:(sourceId:string,version:string)=>Promise<{sourceVersion:string;source:VerifiedSourceEnvelope}|null>):EvaluationGroundingVerifier {
 if(typeof resolve!=="function")throw Error("Trusted source resolver required");
 return {async authorize(input){
  try{
   const b=structuredClone(input);
   const resolved=structuredClone(await resolve(b.claim.sourceId,b.sourceVersion));
   if(!resolved||!b.sourceVersion||resolved.sourceVersion!==b.sourceVersion||resolved.source.sourceId!==b.claim.sourceId||resolved.source.passage?.text!==b.passage)return false;
   const actual=await verifyPassageClaim(resolved.source,b.claim);
   return isGroundedPassageResult(actual)&&isGroundedPassageResult(b.receipt)&&Object.keys(actual.checks).every(k=>actual.checks[k as keyof typeof actual.checks]===b.receipt.checks[k as keyof typeof actual.checks]);
  }catch{return false;}
 }};
}
