/** P1.12.4: guarded server-only HTTP handler, not mounted in Vercel.
 * Authentication, tenant membership, database and deployment gates are
 * injected by trusted server code; browser JSON never supplies identity.
 */
import {createHash} from "node:crypto";
import type {AuthenticatedEvidenceService} from "../evidence/authenticatedEvidenceService";
import type {StagedEvidenceSnapshot} from "../evidence/governedEvidenceStaging";

export type EvidenceApiDependencies={
  authenticate:(request:Request)=>Promise<string|null>;
  service:AuthenticatedEvidenceService;
  enabled:boolean;
  allowedOrigin:string;
};
function json(body:unknown,status:number){return Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
function record(value:unknown):value is Record<string,unknown>{
 return !!value&&typeof value==="object"&&!Array.isArray(value);
}
function validSnapshot(value:unknown):value is StagedEvidenceSnapshot{
 if(!record(value)||value.schemaVersion!=="hsi-evidence-snapshot-1"||
   value.state!=="pending_independent_review"||value.visibility!=="governed_research"||
   value.persisted!==false||value.scientificApproval!==false||
   typeof value.contentSha256!=="string"||!/^([a-f0-9]{64})$/.test(value.contentSha256)||
   value.snapshotId!==`evidence.sha256.${value.contentSha256}`||
   !Array.isArray(value.sourceIds)||!Array.isArray(value.sourceUrls)||
   !Array.isArray(value.retrievedAt)||!Array.isArray(value.nodes))return false;
 // Verify the canonical staging payload, not just the client-provided digest.
 const payload={schemaVersion:value.schemaVersion,sourceIds:value.sourceIds,
   sourceUrls:value.sourceUrls,retrievedAt:value.retrievedAt,nodes:value.nodes};
 return createHash("sha256").update(JSON.stringify(payload)).digest("hex")===value.contentSha256;
}
export async function handleGovernedEvidenceApi(request:Request,deps:EvidenceApiDependencies):Promise<Response>{
 if(!deps.enabled)return json({code:"EVIDENCE_API_DISABLED"},503);
 const url=new URL(request.url);
 if(url.origin!==deps.allowedOrigin||request.headers.get("origin")!==deps.allowedOrigin)
   return json({code:"INVALID_ORIGIN"},403);
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED"},405);
 const action=url.pathname;
 if(action!=="/api/research/evidence/submit"&&action!=="/api/research/evidence/review")
   return json({code:"NOT_FOUND"},404);
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")??""))
   return json({code:"JSON_REQUIRED"},415);
 if(Number(request.headers.get("content-length")??0)>65536)return json({code:"PAYLOAD_TOO_LARGE"},413);
 let body:unknown;
 try{
  const raw=await request.text();
  if(raw.length>65536)return json({code:"PAYLOAD_TOO_LARGE"},413);
  body=JSON.parse(raw);
 }catch{return json({code:"INVALID_JSON"},400)}
 if(!record(body))return json({code:"INVALID_REQUEST"},400);
 if(action.endsWith("/submit")){
  if(!validSnapshot(body.snapshot)||typeof body.idempotencyKey!=="string"||
     !/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(body.idempotencyKey))
   return json({code:"INVALID_EVIDENCE"},400);
 }else if(typeof body.snapshotId!=="string"||
   !/^evidence\.sha256\.[a-f0-9]{64}$/.test(body.snapshotId)||
   !["accepted","rejected","needs_revision"].includes(String(body.decision))||
   typeof body.decisionId!=="string"||
   !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.decisionId)||
   typeof body.notes!=="string"||!body.notes.trim()||body.notes.length>4000)
   return json({code:"INVALID_REVIEW"},400);
 try{
  const sessionToken=await deps.authenticate(request);
  if(!sessionToken)return json({code:"AUTH_REQUIRED"},401);
  if(action.endsWith("/submit")){
   const result=await deps.service.submit({sessionToken,
     snapshot:body.snapshot as StagedEvidenceSnapshot,idempotencyKey:body.idempotencyKey as string});
   return json({snapshotId:result.snapshotId,created:result.created,status:result.status},result.created?201:200);
  }
  const result=await deps.service.review({sessionToken,snapshotId:body.snapshotId as string,
   decision:body.decision as "accepted"|"rejected"|"needs_revision",
   decisionId:body.decisionId as string,notes:body.notes as string});
  return json({snapshotId:result.snapshotId,status:result.status,
   reviewDecisionId:result.reviewDecisionId},200);
 }catch{
  // Do not leak tenant existence, reviewer identity, SQL or credentials.
  return json({code:"EVIDENCE_REQUEST_REJECTED"},403);
 }
}
