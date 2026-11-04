import {BIOLOGY_ENTITIES,BIOLOGY_RELATIONS,BIOLOGY_CLAIMS,SCIENCE_SOURCES,type BiologyEntity,type BiologyRelation} from "./biologyCatalogue";
export type GraphNode={id:string;label:string;kind:BiologyEntity["kind"];system?:string;reviewState:BiologyEntity["reviewState"];description:string;sourceRefs:string[]};
export type GraphEdge=BiologyRelation;
export type GraphDataset={version:string;nodes:GraphNode[];edges:GraphEdge[];generatedFrom:string;reviewed:boolean};
export const SCIENCE_GRAPH:GraphDataset={
 version:"0.1.0",generatedFrom:"Public editorial biology catalogue",reviewed:false,
 nodes:BIOLOGY_ENTITIES.map(e=>({id:e.id,label:e.preferredLabel,kind:e.kind,system:e.system,reviewState:e.reviewState,description:e.definition,sourceRefs:e.sourceRefs})),
 edges:BIOLOGY_RELATIONS
};
export function getGraphNeighbourhood(id:string,depth=1,graph=SCIENCE_GRAPH):GraphDataset{
 const selected=new Set([id]);
 for(let i=0;i<depth;i++){const frontier=new Set(selected);for(const e of graph.edges)if(frontier.has(e.subjectId)||frontier.has(e.objectId)){selected.add(e.subjectId);selected.add(e.objectId)}}
 return {...graph,nodes:graph.nodes.filter(n=>selected.has(n.id)),edges:graph.edges.filter(e=>selected.has(e.subjectId)&&selected.has(e.objectId))};
}
export function graphSourceDetails(id:string){const n=SCIENCE_GRAPH.nodes.find(n=>n.id===id);return n?.sourceRefs.map(ref=>SCIENCE_SOURCES.find(s=>s.id===ref)).filter((s):s is NonNullable<typeof s>=>Boolean(s))??[]}
export function graphClaims(id:string){return BIOLOGY_CLAIMS.filter(c=>c.entityId===id)}
export function validateGraph(graph=SCIENCE_GRAPH):string[]{
 const errors:string[]=[];const ids=new Set(graph.nodes.map(n=>n.id));const sources=new Set(SCIENCE_SOURCES.map(s=>s.id));
 if(ids.size!==graph.nodes.length)errors.push("Duplicate node identifiers");
 for(const n of graph.nodes){if(!n.id||!n.label)errors.push("Incomplete graph node");for(const ref of n.sourceRefs)if(!sources.has(ref))errors.push("Unknown source "+ref)}
 const edges=new Set<string>();
 for(const e of graph.edges){if(edges.has(e.id))errors.push("Duplicate edge "+e.id);edges.add(e.id);if(!ids.has(e.subjectId)||!ids.has(e.objectId))errors.push("Dangling edge "+e.id);if(e.reviewState==="approved"&&(!e.evidenceRefs.length||e.assertionType==="hypothesis"))errors.push("Invalid approved edge "+e.id)}
 return errors;
}
