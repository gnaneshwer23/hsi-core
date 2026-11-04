/** ARCH-002 Phase 3.4: access-scoped, read-only canonical graph query boundary.
 * Authentication is mandatory; callers cannot assert their own role or scope.
 * A trusted server resolves the actor and injects the repository implementation.
 * This is NOT an HTTP route or a replacement for published graph release checks.
 */
import type {HsiGraphNode,HsiGraphRelationship,HsiGraphVisibility} from "./livingHealthKnowledgeGraph";
import {validateHsiLogicalGraph} from "./livingHealthKnowledgeGraph";
export type HsiGraphActor={principalId:string;authenticated:true;roles:readonly ("researcher"|"scientific_reviewer"|"research_admin"|"clinician")[];clinicalPurposeVerified:boolean};
export type HsiGraphQuery={nodeId?:string;predicate?:string;layer?:HsiGraphNode["layer"];limit?:number};
export type HsiGraphReadScope="public_biomedical"|"governed_research"|"restricted_clinical";
export type HsiGraphPage={nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[];limit:number;scope:HsiGraphReadScope};
export interface HsiGraphReadRepository{
 list(input:{scope:HsiGraphReadScope;query:HsiGraphQuery;limit:number;principalId:string}):Promise<{nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[]}>;
}
export function authoriseHsiGraphRead(actor:HsiGraphActor|null,scope:HsiGraphReadScope):void{
 if(!actor?.authenticated||!actor.principalId.trim())throw Error("Authenticated graph access required");
 if(scope==="governed_research"&&!actor.roles.some(r=>["researcher","scientific_reviewer","research_admin"].includes(r)))throw Error("Research graph role required");
 if(scope==="restricted_clinical"&&(!actor.roles.includes("clinician")||!actor.clinicalPurposeVerified))throw Error("Verified clinical role and purpose required");
}
export async function queryHsiGovernedGraph(input:{actor:HsiGraphActor|null;scope:HsiGraphReadScope;query:HsiGraphQuery;repository:HsiGraphReadRepository}):Promise<HsiGraphPage>{
 authoriseHsiGraphRead(input.actor,input.scope);
 const limit=input.query.limit??25;
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error("Invalid graph query limit");
 if(input.query.nodeId!==undefined&&!/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(input.query.nodeId))throw Error("Invalid node ID");
 if(input.query.predicate!==undefined&&(!/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(input.query.predicate)))throw Error("Invalid predicate");
 if(input.scope!=="restricted_clinical"&&input.query.layer==="patient_context")throw Error("Patient context access denied");
 const actor=input.actor!;
 const page=await input.repository.list({scope:input.scope,query:input.query,limit,principalId:actor.principalId});
 if(page.relationships.length>limit)throw Error("Repository exceeded query limit");
 validateHsiLogicalGraph(page.nodes,page.relationships);
 const allowed:readonly HsiGraphVisibility[]=input.scope==="public_biomedical"?["public_biomedical"]:input.scope==="governed_research"?["public_biomedical","governed_research"]:["restricted_clinical"];
 if(page.nodes.some(n=>!allowed.includes(n.visibility))||page.relationships.some(e=>!allowed.includes(e.visibility)))throw Error("Repository scope leakage");
 if(page.relationships.some(e=>input.query.nodeId!==undefined&&e.subjectId!==input.query.nodeId&&e.objectId!==input.query.nodeId))throw Error("Repository query mismatch");
 return {...page,scope:input.scope,limit};
}
