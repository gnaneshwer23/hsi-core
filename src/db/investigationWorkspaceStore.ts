/** HSI-only workspace adapter. Existing save enforces immutable payload/release membership. */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {loadAuthenticatedInterrogativeInvestigation,saveAuthenticatedInterrogativeInvestigation} from "./authenticatedInterrogativeStore";
import {createInvestigationWorkspaceService,type WorkspaceRepository} from "../server/investigationWorkspaceService";
import type {InvestigationSummary,InvestigationCursor,InvestigationRelease} from "../interrogativeWorkspace";

export function createNeonInvestigationWorkspace(config:{databaseUrl:string;neonProjectId?:string|null;writesEnabled?:boolean;sscReleaseId?:string}){
 return createInvestigationWorkspaceService({
  writesEnabled:config.writesEnabled===true,
  authenticate:token=>authenticateHsiNeonSession({...config,sessionToken:token}),
  repository(token):WorkspaceRepository{
   const guard=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});
   if(!guard.ok)throw Error("HSI database guard rejected workspace");
   const sql=new SQL(config.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
   return {
    async releases(){
     // This explicit deployment binding supplies disease scope absent from the release table.
     // A client cannot select arbitrary RA/other releases for the SSc planner.
     if(!config.sscReleaseId)return [];
     const rows=await sql`SELECT id,release_version,manifest_hash FROM hsi_evidence_graph_releases WHERE id=${config.sscReleaseId} AND state='published' LIMIT 1`;
     return rows.map((r:Record<string,unknown>):InvestigationRelease=>({id:String(r.id),version:String(r.release_version),manifestHash:String(r.manifest_hash)}));
    },
    async listOwn(principal,cursor){
     const rows=await sql`SELECT id,state,payload->>'question' AS question,payload->'release' AS release,
       to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time,
       payload->>'createdAt' AS planned_at
      FROM hsi_interrogative_investigations WHERE actor_principal=${principal}
       AND (${cursor?.createdAt??null}::timestamptz IS NULL OR (created_at,id)<(${cursor?.createdAt??null}::timestamptz,${cursor?.id??null}::text))
      ORDER BY created_at DESC,id DESC LIMIT 26`;
     const page=rows.slice(0,25);
     const items=page.map((r:Record<string,unknown>):InvestigationSummary=>({id:String(r.id),state:r.state as InvestigationSummary["state"],question:String(r.question),createdAt:String(r.planned_at),release:r.release as InvestigationRelease}));
     const last=page[page.length-1];
     const nextCursor:InvestigationCursor|null=rows.length>25&&last?{createdAt:String(last.cursor_time),id:String(last.id)}:null;
     return {items,nextCursor};
    },
    async findOwn(principal,id){
     const rows=await sql`SELECT id FROM hsi_interrogative_investigations WHERE id=${id} AND actor_principal=${principal} LIMIT 1`;
     if(!rows.length)return null;
     return loadAuthenticatedInterrogativeInvestigation({...config,serverSessionToken:token,investigationId:id});
    },
    save:investigation=>saveAuthenticatedInterrogativeInvestigation({...config,serverSessionToken:token,investigation}),
    close:()=>sql.close()
   };
  }
 });
}
