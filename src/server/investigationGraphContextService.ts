/** Trusted context capture/read orchestration. Existing investigation ownership is rechecked first. */
import {createHash} from "node:crypto";
import {canonicalGraphContext,verifyInvestigationGraphContext,validateReleasedEvidence,type ReleasedEvidenceBundle,type InvestigationGraphContext} from "../investigationGraphContext";
import type {InterrogativeInvestigation} from "../interrogativeValidation";
import type {TrustedResearchActor} from "../db/researchInvestigationStore";
import type {InvestigationRelease} from "../interrogativeWorkspace";
export const graphContextHash=(text:string)=>createHash("sha256").update(text).digest("hex");
export type GraphContextDependencies={
 authenticate:(token:string|null)=>Promise<TrustedResearchActor|null>;
 investigation:(token:string,id:string)=>Promise<InterrogativeInvestigation>;
 evidence:(release:InvestigationRelease,question:string,disease:ReleasedEvidenceBundle["disease"])=>Promise<ReleasedEvidenceBundle>;
 comparison:(question:string)=>Promise<ReleasedEvidenceBundle|null>;
 load:(id:string)=>Promise<InvestigationGraphContext|null>;
 save:(actor:TrustedResearchActor,record:InterrogativeInvestigation,value:InvestigationGraphContext)=>Promise<InvestigationGraphContext>;
 workingIndex:{version:string;claims:readonly {id:string;pmid:string;disease:string}[]};
 writesEnabled:boolean;now?:()=>string;
};
export function createInvestigationGraphContextService(deps:GraphContextDependencies){
 return async function context(input:{serverSessionToken:string|null;investigationId:string;capture:boolean}){
  const actor=await deps.authenticate(input.serverSessionToken);
  if(!input.serverSessionToken||!actor?.authenticated||!actor.roles.some(r=>["researcher","research_admin","scientific_reviewer"].includes(r)))throw Error("Verified research access required");
  const record=await deps.investigation(input.serverSessionToken,input.investigationId);
  const canCapture=deps.writesEnabled&&record.actorPrincipal===actor.principalId&&record.state==="draft"&&actor.roles.some(r=>["researcher","research_admin"].includes(r));
  if(input.capture&&!canCapture)throw Error("Context capture denied");
  const existing=await deps.load(record.id);
  if(!existing&&!input.capture)return {status:"not_captured" as const,canCapture,context:null};
  const primary=await deps.evidence(record.release,record.question,"systemic_sclerosis");validateReleasedEvidence(primary);
  async function verifyCurrent(value:InvestigationGraphContext){
   await verifyInvestigationGraphContext(value,record,async text=>graphContextHash(text));
   if(canonicalGraphContext(value.primary)!==canonicalGraphContext(primary))throw Error("Pinned release evidence changed or unavailable");
   if(value.comparison){const current=await deps.evidence(value.comparison.release,value.comparison.bundle.context.question,"rheumatoid_arthritis");if(canonicalGraphContext(current)!==canonicalGraphContext(value.comparison))throw Error("Comparison release evidence changed or unavailable")}
   return value;
  }
  if(existing)return {status:"saved" as const,canCapture:false,context:await verifyCurrent(existing)};
  const comparison=await deps.comparison(record.question);if(comparison)validateReleasedEvidence(comparison);
  const publications=new Set([primary,comparison].flatMap(e=>e?e.bundle.sources.map(s=>JSON.stringify([e.disease,s.pmid])):[]));
  const body={schemaVersion:"hsi-investigation-graph-context-1" as const,investigationId:record.id,question:record.question,capturedAt:deps.now?.()??new Date().toISOString(),primary,comparison,
   workingEvidence:{version:deps.workingIndex.version,claimIds:deps.workingIndex.claims.filter(c=>publications.has(JSON.stringify([c.disease,c.pmid]))).map(c=>c.id),relation:"bibliographic_context_only" as const},clinicalAdvice:false as const,graphPromotable:false as const};
  const value={...body,contentHash:graphContextHash(canonicalGraphContext(body))};
  await verifyInvestigationGraphContext(value,record,async text=>graphContextHash(text));
  const saved=await deps.save(actor,record,value);
  return {status:"saved" as const,canCapture:false,context:await verifyCurrent(saved)};
 };
}
