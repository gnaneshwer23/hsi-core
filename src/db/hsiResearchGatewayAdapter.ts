/** Server-side composition for HSI Neon. Not a public route.
 * The caller MUST provide real identity and reviewer-authority verification.
 */
import {executeResearchGateway,type GatewayRequest} from "../p1ResearchGateway";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import {loadHsiPublishedRelease} from "./authoritativeReleaseStore";
import {persistResearchInvestigation,type TrustedResearchActor} from "./researchInvestigationStore";
export async function executeHsiNeonResearch(input:{
 request:GatewayRequest;databaseUrl:string;neonProjectId?:string|null;
 authenticate:()=>Promise<TrustedResearchActor|null>;
 verifyReviewer:(principal:string,reviewedAt:string)=>Promise<boolean>;
}){
 return executeResearchGateway(input.request,{
  authenticate:input.authenticate,
  loadVerifiedRelease:async(version,actor)=>({
   snapshot:await loadHsiPublishedRelease({
    actor,version,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,
    verifyReviewer:input.verifyReviewer,
   }),
   verifiedBy:"hsi_authoritative_store",
  }),
  saveRun:async({actor,investigation,runId,dataClass})=>
   persistResearchInvestigation({
    actor,investigation,runId,dataClass,databaseUrl:input.databaseUrl,
    neonProjectId:input.neonProjectId,
   }),
 });
}

/** Production-oriented composition: the caller must supply a server-extracted secure
 * Better Auth session cookie, never a client-supplied principal or role.
 * The function fails closed until a verified user and HSI grants exist.
 */
export async function executeHsiAuthenticatedResearch(input:{
 request:GatewayRequest;databaseUrl:string;neonProjectId?:string|null;
 serverSessionToken:string|null|undefined;
}){
 return executeHsiNeonResearch({
  request:input.request,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,
  authenticate:()=>authenticateHsiNeonSession({
   sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,
  }),
  verifyReviewer:(principal,reviewedAt)=>verifyHsiReviewerAuthority({
   principal,reviewedAt,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId,
  }),
 });
}
