/** Server-side composition for HSI Neon. Not a public route.
 * The caller MUST provide real identity and reviewer-authority verification.
 */
import {executeResearchGateway,type GatewayRequest} from "../p1ResearchGateway";
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
