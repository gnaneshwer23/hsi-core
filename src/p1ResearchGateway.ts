/** Server-only orchestration. Authentication and authoritative snapshot verification
 * are mandatory dependencies; this module never trusts client-supplied identities or graphs.
 */
import {randomUUID} from "node:crypto";
import {investigatePublishedEvidence,type ResearchInvestigation} from "./researchWorkbench";
import type {GraphQuery,PublishedReleaseSnapshot} from "./graphRelease";
import type {TrustedResearchActor} from "./db/researchInvestigationStore";

export type GatewayRequest={question:string;releaseVersion:string;query?:GraphQuery;
 dataClass:"public_biomedical"|"licensed_partner"};
export type VerifiedRelease={snapshot:PublishedReleaseSnapshot;verifiedBy:"hsi_authoritative_store"};
export type GatewayDependencies={
 authenticate:()=>Promise<TrustedResearchActor|null>;
 loadVerifiedRelease:(version:string,actor:TrustedResearchActor)=>Promise<VerifiedRelease>;
 saveRun:(input:{actor:TrustedResearchActor;investigation:ResearchInvestigation;
   runId:string;dataClass:GatewayRequest["dataClass"]})=>Promise<{id:string;stored:true}>;
};
export async function executeResearchGateway(request:GatewayRequest,deps:GatewayDependencies){
 const actor=await deps.authenticate();
 if(!actor?.authenticated||!actor.principalId.trim()||
  !actor.roles.some(r=>["researcher","scientific_reviewer","research_admin"].includes(r)))
  throw Error("Authenticated researcher role required");
 if(!/^\d+\.\d+\.\d+$/.test(request.releaseVersion))throw Error("Invalid release version");
 if(!request.question.trim()||request.question.length>500)throw Error("Invalid question");
 if(request.dataClass!=="public_biomedical"&&request.dataClass!=="licensed_partner")
  throw Error("Research data class forbidden");
 const release=await deps.loadVerifiedRelease(request.releaseVersion,actor);
 if(release.verifiedBy!=="hsi_authoritative_store"||
  release.snapshot.manifest.status!=="published"||
  release.snapshot.manifest.releaseVersion!==request.releaseVersion)
  throw Error("Authoritative published release required");
 const investigation=investigatePublishedEvidence(request.question,release.snapshot,request.query??{});
 const runId="hsi-run-"+randomUUID();
 const stored=await deps.saveRun({actor,investigation,runId,dataClass:request.dataClass});
 if(!stored.stored||stored.id!==runId)throw Error("Investigation persistence failed");
 return {runId,investigation};
}
