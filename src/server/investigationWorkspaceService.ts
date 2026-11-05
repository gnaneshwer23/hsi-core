/** Trusted orchestration. No caller-supplied identity, evidence, scientific status or release hashes. */
import {createHash} from "node:crypto";
import {planSscInterrogation} from "../interrogativeQuestionEngine";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {parseCreateInvestigation,parseInvestigationCursor,parseInvestigationWorkspace,validateWorkspaceRelease,
 type InvestigationCursor,type InvestigationRelease,type InvestigationSummary} from "../interrogativeWorkspace";
import type {InterrogativeInvestigation} from "../interrogativeContracts";
import type {TrustedResearchActor} from "../db/researchInvestigationStore";

export class InvestigationWorkspaceError extends Error{
 constructor(public status:number,public code:string,public publicMessage:string){super(publicMessage)}
}
export type WorkspaceRepository={
 releases:()=>Promise<InvestigationRelease[]>;
 listOwn:(principal:string,cursor:InvestigationCursor|null)=>Promise<{items:InvestigationSummary[];nextCursor:InvestigationCursor|null}>;
 findOwn:(principal:string,id:string)=>Promise<InterrogativeInvestigation|null>;
 save:(investigation:InterrogativeInvestigation)=>Promise<unknown>;
 close:()=>Promise<void>;
};
export function createInvestigationWorkspaceService(deps:{
 authenticate:(token:string|null)=>Promise<TrustedResearchActor|null>;
 repository:(token:string)=>WorkspaceRepository;writesEnabled:boolean;now?:()=>string;
}){
 async function authorise(token:string|null,write=false){
  const actor=await deps.authenticate(token);
  if(!token||!actor?.authenticated||!actor.principalId.trim()||!actor.roles.some(r=>["researcher","research_admin","scientific_reviewer"].includes(r)))throw new InvestigationWorkspaceError(403,"RESEARCH_ACCESS_REQUIRED","Verified research access is required.");
  if(write&&(!actor.roles.some(r=>["researcher","research_admin"].includes(r))||!deps.writesEnabled))throw new InvestigationWorkspaceError(403,"RESEARCH_WRITES_DISABLED","Creating investigations requires researcher access and enabled research writes.");
  return actor;
 }
 return {
  async list(input:{serverSessionToken:string|null;cursor:InvestigationCursor|null}){
   const cursor=parseInvestigationCursor(input.cursor);
   const actor=await authorise(input.serverSessionToken);
   const repo=deps.repository(input.serverSessionToken!);
   try{
    const [page,releases]=await Promise.all([repo.listOwn(actor.principalId,cursor),repo.releases()]);
    return parseInvestigationWorkspace({...page,releases,writesEnabled:deps.writesEnabled,canCreate:deps.writesEnabled&&releases.length>0&&actor.roles.some(r=>["researcher","research_admin"].includes(r))});
   }finally{await repo.close()}
  },
  async create(input:{serverSessionToken:string|null;request:unknown}){
   const request=parseCreateInvestigation(input.request);
   if(!rejectPhiPayload({textBlobs:[request.question]}).ok)throw new InvestigationWorkspaceError(400,"RESEARCH_QUESTION_REQUIRED","Use a non-identifying biomedical research question. Patient information is not permitted.");
   const actor=await authorise(input.serverSessionToken,true);
   const repo=deps.repository(input.serverSessionToken!);
   try{
    const release=(await repo.releases()).find(r=>r.id===request.releaseId);
    if(!release)throw new InvestigationWorkspaceError(409,"PUBLISHED_RELEASE_REQUIRED","The selected SSc research release is unavailable. Refresh the workspace or contact the research administrator.");
    validateWorkspaceRelease(release);
    const id="hsi-interrogative-"+createHash("sha256").update(JSON.stringify([actor.principalId,request.requestId])).digest("hex").slice(0,32);
    function reusable(existing:InterrogativeInvestigation){
     if(existing.actorPrincipal!==actor!.principalId||existing.id!==id||existing.question!==request.question||existing.release.id!==release!.id||existing.release.version!==release!.version||existing.release.manifestHash!==release!.manifestHash)throw new InvestigationWorkspaceError(409,"REQUEST_CONFLICT","This request was already used for a different investigation. Start a new draft.");
     return {id:existing.id,created:false};
    }
    const existing=await repo.findOwn(actor.principalId,id);
    if(existing)return reusable(existing);
    const investigation={...planSscInterrogation({question:request.question,actorPrincipal:actor.principalId,createdAt:deps.now?.()??new Date().toISOString(),dataClass:"public_biomedical",focus:"systemic_sclerosis",release}),id};
    try{await repo.save(investigation)}catch(error){
     // Retried/concurrent requests may have committed an identical request already.
     const committed=await repo.findOwn(actor.principalId,id);
     if(committed)return reusable(committed);
     throw error;
    }
    return {id,created:true};
   }finally{await repo.close()}
  }
 };
}
