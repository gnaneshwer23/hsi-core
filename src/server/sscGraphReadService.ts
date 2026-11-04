import {authenticateHsiNeonSession} from "../db/neonAuthResearchActor";
import {createHsiNeonGraphReadRepository} from "../db/hsiNeonGraphReadRepository";
import {queryHsiGovernedGraph,type HsiGraphActor} from "../hsiGovernedGraphQuery";
/** Trusted, authenticated, read-only SSc graph service. No graph writes or promotion. */
export async function loadSscResearchGraph(input:{serverSessionToken:string|null;nodeId:string;databaseUrl:string;neonProjectId?:string|null}){
 const actor=await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor)throw Error("Verified research access required");
 const trusted:HsiGraphActor={principalId:actor.principalId,authenticated:true,roles:actor.roles.filter((r):r is "researcher"|"scientific_reviewer"|"research_admin"=>r==="researcher"||r==="scientific_reviewer"||r==="research_admin"),clinicalPurposeVerified:false};
 if(!trusted.roles.length)throw Error("Research role required");
 return queryHsiGovernedGraph({actor:trusted,scope:"governed_research",query:{nodeId:input.nodeId,limit:50},repository:createHsiNeonGraphReadRepository({databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId})});
}
