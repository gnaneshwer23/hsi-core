/** Authenticated read-only staging; no graph publication and no DB write. */
import {authenticateHsiNeonSession} from "../db/neonAuthResearchActor";
import {assertHsiNeonDatabaseUrl} from "../db/neonGuard";
import {verifyPinnedIsiRelease,type IsiPinnedRelease} from "./isiPinnedRelease";
export async function authenticatedIsiGraphStaging(input:{sessionToken:string|null;databaseUrl:string;neonProjectId?:string|null;manifest:IsiPinnedRelease;bytes:string}){
 if(!input.sessionToken)throw Error("Authenticated research session required");
 if(!assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId}).ok)throw Error("HSI database isolation required");
 const actor=await authenticateHsiNeonSession({sessionToken:input.sessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor||!actor.roles.some(r=>r==="researcher"||r==="scientific_reviewer"||r==="research_admin"))throw Error("Research grant required");
 const staged=verifyPinnedIsiRelease({manifest:input.manifest,bytes:input.bytes});
 return {actorPrincipal:actor.principalId,staged,reviewRequired:true as const,persisted:false as const};
}
