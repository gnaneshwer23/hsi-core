/**
 * Temporal mode: what changed between a published graph version and its parent. Both versions are verified by
 * digest before they are compared. A change is a change in the record, not a change in the science: an added
 * relationship is a new candidate, a removed one was withdrawn from the candidate set, and neither is a finding.
 */
import type {DomainBundle,DomainEdge} from "../knowledgeGraph/domainGraph";

export type VersionDiff={
 from:string;to:string;
 added:string[];changed:string[];removed:{id:string;assertion:string}[];
 addedSources:number;removedSources:number;
};
const sig=(e:DomainEdge)=>JSON.stringify([e.subjectId,e.objectId,e.predicate,e.sourceId,e.assertion,e.negated,e.model,e.timepoint,e.intervention,e.outcome]);

export function diffVersions(parent:DomainBundle,current:DomainBundle):VersionDiff{
 if(current.parentVersion!==parent.version)throw Error("These two versions are not parent and child");
 const before=new Map(parent.edges.map(e=>[e.id,e])),after=new Map(current.edges.map(e=>[e.id,e]));
 const added:string[]=[],changed:string[]=[],removed:{id:string;assertion:string}[]=[];
 for(const [id,e] of after){const b=before.get(id);if(!b)added.push(id);else if(sig(b)!==sig(e))changed.push(id)}
 for(const [id,e] of before)if(!after.has(id))removed.push({id,assertion:e.assertion});
 const ps=new Set(parent.sources.map(s=>s.id)),cs=new Set(current.sources.map(s=>s.id));
 return{from:parent.version,to:current.version,added:added.sort(),changed:changed.sort(),removed:removed.sort((a,b)=>a.id.localeCompare(b.id)),
  addedSources:[...cs].filter(s=>!ps.has(s)).length,removedSources:[...ps].filter(s=>!cs.has(s)).length};
}
