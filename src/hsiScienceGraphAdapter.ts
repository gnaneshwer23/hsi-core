/** ARCH-002 Phase 3.5: loss-aware adapter for existing ISI/HSI editorial science graph.
 * Importing an educational graph NEVER grants approval, scientific authority or
 * publication eligibility. It produces governed research drafts only.
 */
/** Structural compatibility with the site graph; avoids importing site files into the server tsconfig rootDir. */
export type EditorialTypedGraph={
 schemaVersion:"2.0.0";description:string;
 nodes:{id:string;label:string;kind:string;aliases?:string[];ontologyId?:string;version:string;reviewStatus:string}[];
 edges:{id:string;subjectId:string;objectId:string;predicate:string;assertionType:"established_mechanism"|"reported_association"|"inference"|"hypothesis";context:Record<string,string|undefined>;reviewStatus:string;evidenceIds:string[];version:string}[];
 evidence:{id:string}[];
};
function validateEditorialGraph(graph:EditorialTypedGraph):string[]{
 const errors:string[]=[];const ids=new Set<string>();const evidence=new Set(graph.evidence.map(e=>e.id));const edgeIds=new Set<string>();
 for(const n of graph.nodes){if(!n.id||!n.label||ids.has(n.id))errors.push("Invalid or duplicate node");ids.add(n.id)}
 for(const e of graph.edges){if(!e.id||edgeIds.has(e.id)||!ids.has(e.subjectId)||!ids.has(e.objectId))errors.push("Invalid or dangling edge");edgeIds.add(e.id);if(e.evidenceIds.some(id=>!evidence.has(id)))errors.push("Unknown evidence")}
 return errors;
}
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
export type HsiScienceGraphImport={nodes:HsiGraphNode[];relationships:HsiGraphRelationship[];warnings:string[];sourceSchema:"2.0.0"};
const semantic=(v:string):string=>/^[0-9]+\.[0-9]+\.[0-9]+$/.test(v)?v:"0.0.0";
const mapping=(assertion:EditorialTypedGraph["edges"][number]["assertionType"]):HsiGraphRelationship["epistemicType"]=>({
 established_mechanism:"computational_inference",reported_association:"association",inference:"computational_inference",hypothesis:"unvalidated_hypothesis"
} as const)[assertion];
/** No claims from this bridge are publishable; independent authoritative review
 * and evidence release must happen through the existing HSI trusted workflow.
 */
export function importHsiEditorialScienceGraph(graph:EditorialTypedGraph):HsiScienceGraphImport{
 const errors=validateEditorialGraph(graph);
 if(errors.length)throw Error("Invalid source science graph: "+errors.join("; "));
 const nodes:HsiGraphNode[]=graph.nodes.map(n=>({
  schemaVersion:"hsi-lhkg-node-1",id:n.id,layer:"human_biology",kind:n.kind,preferredLabel:n.label,
  aliases:n.aliases??[],sourceIdentifiers:n.ontologyId?[{system:"source_unverified",value:n.ontologyId,mapping:"unreviewed" as const}]:[],
  version:semantic(n.version),visibility:"governed_research",reviewState:"draft",sourceProvenance:["editorial_science_graph_v2"]
 }));
 const relationships:HsiGraphRelationship[]=graph.edges.map(e=>({
  schemaVersion:"hsi-lhkg-edge-1",id:e.id,subjectId:e.subjectId,predicate:e.predicate,objectId:e.objectId,
  layer:"human_biology",epistemicType:mapping(e.assertionType),visibility:"governed_research",
  reviewState:"draft",sourceEvidenceIds:e.evidenceIds,version:semantic(e.version),
  context:Object.fromEntries(Object.entries(e.context).filter((x):x is [string,string]=>typeof x[1]==="string")),
  causalClaim:false
 }));
 validateHsiLogicalGraph(nodes,relationships);
 const warnings=[
  "Educational science graph imported as unapproved governed research drafts",
  "Ontology identifiers require registry validation and curator mapping before canonical identity resolution",
  "Source evidence, reviewer status and scientific certainty are not promoted by this adapter"
 ];
 if(graph.edges.some(e=>e.reviewStatus==="approved"))warnings.push("Source-approved assertions require separate HSI review and release validation");
 if(graph.edges.some(e=>e.assertionType==="established_mechanism"))warnings.push("Mechanism labels downgraded to inference pending authoritative evidence review");
 return {nodes,relationships,warnings,sourceSchema:"2.0.0"};
}
