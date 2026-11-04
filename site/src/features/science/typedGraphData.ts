import {BIOLOGY_ENTITIES,BIOLOGY_RELATIONS} from "./biologyCatalogue";
import {validateTypedGraph,type TypedGraph,type ScientificEdge,type ScientificNode} from "./typedGraphSchema";
/** Lossless migration of legacy editorial navigation records. Never upgrades evidence status. */
export const SCIENCE_TYPED_GRAPH:TypedGraph={
 schemaVersion:"2.0.0",
 description:"Draft public educational graph. No reviewed mechanistic claims are asserted.",
 nodes:BIOLOGY_ENTITIES.map((n):ScientificNode=>({id:n.id,label:n.preferredLabel,kind:n.kind,aliases:n.aliases,definition:n.definition,reviewStatus:n.reviewState,version:n.version})),
 edges:BIOLOGY_RELATIONS.map((r):ScientificEdge=>({
  id:r.id,subjectId:r.subjectId,objectId:r.objectId,predicate:"RELATED_TOPIC",
  assertionType:"inference",context:r.context??{},reviewStatus:"draft",evidenceStatus:"not_curated",
  evidenceIds:[],version:"0.1.0"
 })),
 evidence:[]
};
export const SCIENCE_TYPED_GRAPH_VALIDATION=validateTypedGraph(SCIENCE_TYPED_GRAPH);
export function typedGraphNeighbours(nodeId:string,graph:TypedGraph=SCIENCE_TYPED_GRAPH){
 return graph.edges.filter(e=>e.subjectId===nodeId||e.objectId===nodeId).map(edge=>({edge,other:graph.nodes.find(n=>n.id===(edge.subjectId===nodeId?edge.objectId:edge.subjectId))})).filter((item):item is {edge:ScientificEdge;other:ScientificNode}=>Boolean(item.other));
}
