/** Read-only account access. No role provisioning, evidence creation or publication. */
import {SQL} from "bun";
import {authenticateHsiNeonIdentity} from "./neonAuthResearchActor";
import {parseResearchAccountAccess,type ResearchAccountAccess} from "../researchAccount";
export async function loadResearchAccount(input:{serverSessionToken:string|null;databaseUrl:string;neonProjectId?:string|null}):Promise<ResearchAccountAccess|null>{
 const actor=await authenticateHsiNeonIdentity({...input,sessionToken:input.serverSessionToken});
 if(!actor)return null;
 const researcher=actor.roles.some(r=>r==="researcher"||r==="research_admin");
 const scientificReviewer=actor.roles.includes("scientific_reviewer");
 if(!researcher&&!scientificReviewer)return {principalId:actor.principalId,researcher:false,scientificReviewer:false,investigations:[]};
 // Authentication above validates the HSI database target before opening this connection.
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const rows=await sql`SELECT id,state,actor_principal FROM hsi_interrogative_investigations
   WHERE actor_principal=${actor.principalId}
    OR (${scientificReviewer} AND state='awaiting_scientific_review' AND actor_principal<>${actor.principalId})
   ORDER BY created_at DESC,id DESC LIMIT 50`;
  return parseResearchAccountAccess({principalId:actor.principalId,researcher,scientificReviewer,
   investigations:rows.map((r:{id:unknown;state:unknown;actor_principal:unknown})=>({id:String(r.id),state:String(r.state),canReview:scientificReviewer&&r.state==="awaiting_scientific_review"&&String(r.actor_principal)!==actor.principalId}))},actor.principalId);
 }finally{await sql.close()}
}
