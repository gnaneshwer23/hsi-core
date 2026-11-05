/** Phase 3.3: research-workbench projection of an authorised Phase 3.2 graph result.
 * The server must authenticate, authorise and execute readGovernedGraph first.
 * This projection is not a browser-side permission check or a live data transport.
 */
import {GOVERNED_GRAPH_READ_VERSION,type GraphReadResult} from "./governedGraphRead";
export const WORKBENCH_GRAPH_PROJECTION_VERSION="hsi-workbench-governed-projection-1" as const;
export type WorkbenchMechanism={id:string;subjectId:string;subject:string;predicate:string;objectId:string;object:string;reviewState:string;epistemicType:string;sourceEvidenceIds:string[];studyContext:string|null;sourceLocator:string|null;limitations:string|null;gaps:string[]};
export type WorkbenchGraphProjection={schemaVersion:typeof WORKBENCH_GRAPH_PROJECTION_VERSION;sourceVersion:string;readOnly:true;truncated:boolean;concepts:Array<{id:string;label:string;kind:string;reviewState:string}>;mechanisms:WorkbenchMechanism[];warning:string};
export function projectGovernedGraphForWorkbench(result:GraphReadResult):WorkbenchGraphProjection{
 if(!result||result.schemaVersion!==GOVERNED_GRAPH_READ_VERSION||result.readOnly!==true||!/^\d+\.\d+\.\d+$/.test(result.version)||!Array.isArray(result.nodes)||!Array.isArray(result.relationships)||result.nodes.length>500||result.relationships.length>120)throw Error("Untrusted graph query result");
 const nodes=new Map(result.nodes.map(n=>[n.id,n]));if(nodes.size!==result.nodes.length)throw Error("Duplicate graph nodes");
 const mechanisms=result.relationships.map(e=>{
  const a=nodes.get(e.subjectId),b=nodes.get(e.objectId);
  if(!a||!b)throw Error("Unresolved graph endpoint");
  if(a.visibility==="restricted_clinical"||b.visibility==="restricted_clinical"||e.visibility==="restricted_clinical")throw Error("Clinical data cannot enter scientific projection");
  const gaps:string[]=[];
  if(!e.sourceEvidenceIds.length)gaps.push("No evidence identifier");
  if(!e.context.sourceLocator?.trim())gaps.push("No precise source locator");
  if(!e.context.studyContext?.trim())gaps.push("No study context");
  if(e.reviewState!=="approved")gaps.push("Independent scientific approval pending");
  return {id:e.id,subjectId:e.subjectId,subject:a.preferredLabel,predicate:e.predicate,objectId:e.objectId,object:b.preferredLabel,reviewState:e.reviewState,epistemicType:e.epistemicType,sourceEvidenceIds:[...e.sourceEvidenceIds],studyContext:e.context.studyContext??null,sourceLocator:e.context.sourceLocator??null,limitations:e.context.limitations??null,gaps};
 }).sort((a,b)=>a.id.localeCompare(b.id));
 return {schemaVersion:WORKBENCH_GRAPH_PROJECTION_VERSION,sourceVersion:result.version,readOnly:true,truncated:result.truncated,concepts:result.nodes.map(n=>({id:n.id,label:n.preferredLabel,kind:n.kind,reviewState:n.reviewState})),mechanisms,warning:"Research-only evidence view. Associations, inferences and drafts are not validated causal or clinical claims."};
}
