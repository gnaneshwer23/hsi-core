import type {TypedGraph,ScientificEdge,ScientificNode,GraphEntityKind} from "./typedGraphSchema";
import {SCIENCE_TYPED_GRAPH} from "./typedGraphData";
export type TraversalDirection="outgoing"|"incoming"|"both";
export type GraphPath={nodes:ScientificNode[];edges:ScientificEdge[]};
export type TraversalOptions={direction?:TraversalDirection;maxHops?:number;allowedKinds?:GraphEntityKind[];includeDraft?:boolean;maxPaths?:number};
export function findGraphPaths(graph:TypedGraph,startId:string,endId:string,options:TraversalOptions={}):GraphPath[]{
 const {direction="both",maxHops=5,allowedKinds,includeDraft=false,maxPaths=30}=options;
 const lookup=new Map(graph.nodes.map(n=>[n.id,n]));const start=lookup.get(startId),end=lookup.get(endId);
 if(!start||!end||maxHops<1||maxHops>8||maxPaths<1)return [];
 const paths:GraphPath[]=[];const queue:GraphPath[]=[{nodes:[start],edges:[]}];
 while(queue.length&&paths.length<maxPaths){
  const path=queue.shift()!;const current=path.nodes[path.nodes.length-1]!;
  if(current.id===endId){if(path.edges.length)paths.push(path);continue}
  if(path.edges.length>=maxHops)continue;
  for(const edge of graph.edges){
   if(!includeDraft&&edge.reviewStatus!=="approved")continue;
   const forward=edge.subjectId===current.id,reverse=edge.objectId===current.id;
   if(direction==="outgoing"&&!forward||direction==="incoming"&&!reverse||!forward&&!reverse)continue;
   const next=lookup.get(forward?edge.objectId:edge.subjectId);
   if(!next||path.nodes.some(n=>n.id===next.id)||allowedKinds&&!allowedKinds.includes(next.kind)&&next.id!==endId)continue;
   queue.push({nodes:[...path.nodes,next],edges:[...path.edges,edge]});
  }
 }
 return paths.sort((a,b)=>a.edges.length-b.edges.length);
}
export function graphCoverage(graph:TypedGraph=SCIENCE_TYPED_GRAPH){
 const kinds=new Map<GraphEntityKind,number>();
 for(const node of graph.nodes)kinds.set(node.kind,(kinds.get(node.kind)??0)+1);
 return {nodeCount:graph.nodes.length,edgeCount:graph.edges.length,approvedEdges:graph.edges.filter(e=>e.reviewStatus==="approved").length,kinds:[...kinds].map(([kind,count])=>({kind,count}))};
}
