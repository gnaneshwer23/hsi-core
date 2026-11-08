/** HSI-only append-once context store. No automatic migration, role grants or graph writes. */
import {SQL} from "bun";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {loadAuthenticatedInterrogativeInvestigation} from "./authenticatedInterrogativeStore";
import {loadInvestigationReleasedEvidence} from "./investigationReleasedEvidence";
import {createInvestigationGraphContextService} from "../server/investigationGraphContextService";
import {WORKING_EVIDENCE_INDEX} from "../evidence/generatedWorkingEvidenceIndex";
import type {TrustedResearchActor} from "./researchInvestigationStore";
import type {InvestigationGraphContext} from "../investigationGraphContext";
import {canonicalGraphContext} from "../investigationGraphContext";
import {assertHsiNeonDatabaseUrl,HSI_STAGING_HOST_PREFIX} from "./neonGuard";
export async function loadOrCaptureInvestigationGraphContext(input:{serverSessionToken:string|null;investigationId:string;capture:boolean;databaseUrl:string;neonProjectId?:string|null;writesEnabled?:boolean;raComparisonReleaseId?:string}){
 let actor:TrustedResearchActor|null=null;
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});if(!guard.ok)throw Error("HSI database target required");
 if(input.capture&&(!input.writesEnabled||new URL(input.databaseUrl).hostname.split(".")[0]?.replace(/-pooler$/,"")!==HSI_STAGING_HOST_PREFIX))throw Error("Context capture requires approved HSI staging writes");
 let sql:SQL|null=null;
 function db(){return sql??=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10})}
 const handler=createInvestigationGraphContextService({writesEnabled:input.writesEnabled===true,workingIndex:WORKING_EVIDENCE_INDEX,
  authenticate:async token=>actor=await authenticateHsiNeonSession({...input,sessionToken:token}),
  investigation:(token,id)=>loadAuthenticatedInterrogativeInvestigation({...input,serverSessionToken:token,investigationId:id}),
  evidence:(release,question,disease)=>loadInvestigationReleasedEvidence({...input,actor:actor!,release,question,disease}),
  comparison:async question=>{
   if(!input.raComparisonReleaseId)return null;
   const rows=await db()`SELECT id,release_version,manifest_hash FROM hsi_evidence_graph_releases WHERE id=${input.raComparisonReleaseId} AND state='published' LIMIT 1`;
   if(rows.length!==1)throw Error("Configured comparison release unavailable");
   const r=rows[0]!;
   return loadInvestigationReleasedEvidence({...input,actor:actor!,question,disease:"rheumatoid_arthritis",release:{id:String(r.id),version:String(r.release_version),manifestHash:String(r.manifest_hash)}});
  },
  load:async id=>{
   const rows=await db()`SELECT payload,content_hash FROM hsi_investigation_graph_contexts WHERE investigation_id=${id} LIMIT 1`;
   if(!rows.length)return null;
   const c=rows[0]!.payload as InvestigationGraphContext;if(c.contentHash!==String(rows[0]!.content_hash))throw Error("Context integrity failure");return c;
  },
  save:async(principal,record,value)=>db().begin(async tx=>{
   const own=await tx`SELECT id FROM hsi_interrogative_investigations WHERE id=${record.id} AND actor_principal=${principal.principalId} AND state='draft' AND release_id=${value.primary.release.id} AND release_manifest_hash=${value.primary.release.manifestHash} FOR UPDATE`;
   if(own.length!==1)throw Error("Context capture ownership or state changed");
   const release=await tx`SELECT id FROM hsi_evidence_graph_releases WHERE id=${value.primary.release.id} AND manifest_hash=${value.primary.release.manifestHash} AND state='published' FOR SHARE`;
   if(release.length!==1)throw Error("Pinned release unavailable");
   await tx`INSERT INTO hsi_investigation_graph_contexts (investigation_id,actor_principal,release_id,release_manifest_hash,content_hash,payload,captured_at)
    VALUES (${record.id},${principal.principalId},${value.primary.release.id},${value.primary.release.manifestHash},${value.contentHash},${value},${value.capturedAt}) ON CONFLICT (investigation_id) DO NOTHING`;
   const rows=await tx`SELECT payload,content_hash FROM hsi_investigation_graph_contexts WHERE investigation_id=${record.id} AND actor_principal=${principal.principalId} LIMIT 1`;
   const saved=rows[0]?.payload as InvestigationGraphContext;
   if(!saved||saved.contentHash!==String(rows[0]?.content_hash)||canonicalGraphContext(saved.workingEvidence)!==canonicalGraphContext(value.workingEvidence))throw Error("Context save conflict");return saved;
  })
 });
 try{return await handler(input)}finally{if(sql)await (sql as SQL).close()}
}
