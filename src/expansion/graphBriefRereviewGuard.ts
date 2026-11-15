/** Protected read/export composition only. Does not enable P2 expansion, persistence or reviewer authority. */
import type {TrustedResearchActor} from '../db/researchInvestigationStore';
import {renderGraphContextBrief,validateGraphContextBrief,type GraphContextBrief} from '../knowledgeGraph/contextBrief';
import type {SourceDependency} from './sourceRereview';

export type StoredGraphContextBrief={organizationRef:string;brief:GraphContextBrief;dependencies:readonly SourceDependency[]};
export function createProtectedGraphBriefReader(deps:{
 enabled?:boolean;
 /** Load only from protected server storage. Never accept artifact/dependency hashes from a browser. */
 load:(actor:Readonly<TrustedResearchActor>,investigationId:string)=>Promise<StoredGraphContextBrief|null>;
 /** Independently prove active tenant membership and owned/shared investigation access, including revocation. */
 authorizeScope:(actor:Readonly<TrustedResearchActor>,stored:Readonly<StoredGraphContextBrief>)=>Promise<boolean>;
 /** Existing versioned-source re-review service, with independent current source/action verification. */
 authorizeCurrentArtifactUse:(binding:{artifactHash:string;organizationRef:string;actions:readonly ('display'|'export')[]})=>Promise<boolean>;
}){
 const enabled=deps.enabled===true,{load,authorizeScope,authorizeCurrentArtifactUse}=deps;
 async function read(actor:TrustedResearchActor|null,id:string,action:'display'|'export'){
  if(!enabled||actor?.authenticated!==true||!actor.principalId?.trim()||!actor.roles.some(r=>['researcher','scientific_reviewer','research_admin'].includes(r))||!/^[A-Za-z0-9][A-Za-z0-9:_-]{2,127}$/.test(id))throw Error('Graph brief access unavailable');
  const who=structuredClone(actor);
  try{
   const loaded=await load(structuredClone(who),id);if(!loaded)throw Error();
   const stored=structuredClone(loaded),b=stored.brief;
   if(b.investigationId!==id||!stored.organizationRef?.trim()||await authorizeScope(structuredClone(who),structuredClone(stored))!==true)throw Error();
   validateGraphContextBrief(b);
   // Complete archived source/version/receipt dependencies must be registered for this exact artifact.
   const dependencyKey=(sourceId:string,sourceVersion:string,clearanceRef:string)=>JSON.stringify([sourceId,sourceVersion,clearanceRef]);
   const expected=new Set(b.units.map(u=>dependencyKey(u.detailedContext!.sourceId,u.detailedContext!.sourceVersion,u.detailedContext!.clearanceReceiptId)));
   if(stored.dependencies.length!==expected.size||new Set(stored.dependencies.map(d=>dependencyKey(d.sourceId,d.sourceVersion,d.clearanceRef))).size!==stored.dependencies.length)throw Error();
   for(const u of b.units){const c=u.detailedContext!;if(!stored.dependencies.some(d=>d.sourceId===c.sourceId&&d.sourceVersion===c.sourceVersion&&d.clearanceRef===c.clearanceReceiptId&&d.artifactHash===b.briefHash&&d.artifactVersion===String(b.version)&&d.investigationId===id&&d.organizationRef===stored.organizationRef))throw Error();}
   if(await authorizeCurrentArtifactUse({artifactHash:b.briefHash,organizationRef:stored.organizationRef,actions:[action]})!==true)throw Error();
   return b;
  }catch{throw Error('Graph brief access unavailable');}
 }
 return {
  async view(actor:TrustedResearchActor|null,id:string){return read(actor,id,'display');},
  async export(actor:TrustedResearchActor|null,id:string,format:'json'|'markdown'){
   if(!['json','markdown'].includes(format))throw Error('Unknown brief format');
   return renderGraphContextBrief(await read(actor,id,'export'),format);
  },
 };
}
