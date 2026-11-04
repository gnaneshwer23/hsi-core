/** ARCH-002 Phase 3.9 — authenticated, evidence-backed research read coordinator.
 * The actor must come from a trusted server-side session resolver.
 * Repository must enforce scope in storage; this coordinator adds fail-closed
 * checks but is not a substitute for database RLS or live reviewer authority.
 */
import {queryHsiGovernedGraph,type HsiGraphActor,type HsiGraphReadRepository} from "./hsiGovernedGraphQuery";
import {buildHsiResearchWorkbench,type HsiWorkbenchResult} from "./hsiResearchGraphWorkbench";
import {assertHsiResearchSnapshot} from "./hsiResearchSnapshotIntegrity";
import type {HsiRelationshipDossier} from "./hsiEvidenceTemporalDossier";
export interface HsiWorkbenchDossierReader{
 readByRelationshipIds(input:{ids:readonly string[];principalId:string}):Promise<readonly HsiRelationshipDossier[]>;
}
export async function queryHsiEvidenceBackedWorkbench(input:{
 actor:HsiGraphActor|null;focusNodeId:string;limit?:number;includeDrafts?:boolean;
 graph:HsiGraphReadRepository;dossiers:HsiWorkbenchDossierReader;
}):Promise<HsiWorkbenchResult>{
 const actor=input.actor;
 if(!actor?.authenticated||!actor.roles.some(r=>r==="researcher"||r==="research_admin"||r==="scientific_reviewer"))throw Error("Authenticated research role required");
 const limit=input.limit??25;
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error("Invalid research workbench limit");
 const page=await queryHsiGovernedGraph({actor,scope:"governed_research",query:{nodeId:input.focusNodeId,limit},repository:input.graph});
 if(!page.nodes.some(n=>n.id===input.focusNodeId))throw Error("Requested focus node missing from scoped graph");
 if(page.nodes.some(n=>n.visibility!=="governed_research")||page.relationships.some(e=>e.visibility!=="governed_research"))throw Error("Research workbench scope mismatch");
 const ids=page.relationships.map(e=>e.id);
 const dossiers=ids.length?await input.dossiers.readByRelationshipIds({ids,principalId:actor.principalId}):[];
 const allowed=new Set(ids);
 if(dossiers.some(d=>!allowed.has(d.relationship.id)))throw Error("Unrequested evidence dossier returned");
 if(new Set(dossiers.map(d=>d.relationship.id)).size!==dossiers.length)throw Error("Duplicate evidence dossier returned");
 assertHsiResearchSnapshot({nodes:page.nodes,relationships:page.relationships,dossiers});
 return buildHsiResearchWorkbench({nodes:page.nodes,relationships:page.relationships,dossiers,query:{focusNodeId:input.focusNodeId,maxRelationships:limit,includeDrafts:input.includeDrafts??true}});
}
