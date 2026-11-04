/** HSI typed biomedical graph v2. Schema is ready for curation; example assertions are NOT approved evidence. */
export const PREDICATES=["RELATED_TOPIC","PART_OF","LOCATED_IN","PRODUCES","EXPRESSES","ACTIVATES","INHIBITS","REGULATES","PARTICIPATES_IN","ASSOCIATED_WITH","CONTRIBUTES_TO","MEASURED_BY","TREATS","INDICATED_FOR","TARGETS","EVALUATED_IN","HAS_BIOMARKER","HAS_PHENOTYPE","INTERACTS_WITH"] as const;
export type Predicate=typeof PREDICATES[number];
export type ScientificAssertion="established_mechanism"|"reported_association"|"inference"|"hypothesis";
export type EvidenceStatus="unassessed"|"supported"|"contested"|"context_limited"|"not_curated";
export type ReviewStatus="draft"|"in_review"|"approved"|"rejected"|"retired";
export type GraphEntityKind="organ"|"tissue"|"cell"|"cell_state"|"gene"|"protein"|"molecule"|"pathway"|"process"|"biomarker"|"disease"|"phenotype"|"drug"|"therapy"|"trial"|"publication"|"dataset"|"microbe"|"metabolite"|"lifestyle_factor";
export type EvidenceContext={tissue?:string;cellState?:string;disease?:string;diseaseStage?:string;species?:string;assay?:string;experimentalSetting?:string;population?:string;directionality?:string};
export type EvidenceRecord={id:string;sourceType:"publication"|"dataset"|"trial"|"ontology"|"curated_resource";sourceId:string;url:string;passage?:string;retrievedAt:string;version?:string;context?:EvidenceContext;assessment:EvidenceStatus};
export type ScientificNode={id:string;label:string;kind:GraphEntityKind;aliases?:string[];ontologyId?:string;definition?:string;reviewStatus:ReviewStatus;version:string};
export type ScientificEdge={id:string;subjectId:string;predicate:Predicate;objectId:string;assertionType:ScientificAssertion;context:EvidenceContext;reviewStatus:ReviewStatus;evidenceStatus:EvidenceStatus;evidenceIds:string[];confidence?:number;reviewer?:string;reviewedAt?:string;version:string;qualifiers?:Record<string,string>};
export type TypedGraph={schemaVersion:"2.0.0";nodes:ScientificNode[];edges:ScientificEdge[];evidence:EvidenceRecord[];description:string};
const PREDICATE_RULES:Partial<Record<Predicate,{subjects:GraphEntityKind[];objects:GraphEntityKind[]}>>={
 PRODUCES:{subjects:["cell","cell_state","tissue","microbe"],objects:["protein","molecule","metabolite"]},
 ACTIVATES:{subjects:["protein","molecule","pathway","process","cell_state"],objects:["pathway","process","cell_state","protein"]},
 INHIBITS:{subjects:["drug","therapy","protein","molecule"],objects:["protein","pathway","process","molecule"]},
 EVALUATED_IN:{subjects:["drug","therapy"],objects:["trial"]},
 INDICATED_FOR:{subjects:["drug","therapy"],objects:["disease"]},
 LOCATED_IN:{subjects:["cell","cell_state","tissue"],objects:["organ","tissue"]},
 HAS_BIOMARKER:{subjects:["disease","phenotype"],objects:["biomarker","protein","molecule"]}
};
export function validateTypedGraph(graph:TypedGraph):string[]{
 const errors:string[]=[];
 const nodeIds=new Set<string>(),edgeIds=new Set<string>(),evidenceIds=new Set<string>();
 for(const n of graph.nodes){if(!n.id||!n.label||!n.version)errors.push("Incomplete node");if(nodeIds.has(n.id))errors.push("Duplicate node: "+n.id);nodeIds.add(n.id)}
 for(const e of graph.evidence){if(evidenceIds.has(e.id))errors.push("Duplicate evidence: "+e.id);evidenceIds.add(e.id);if(!e.sourceId||!e.url.startsWith("https://")||!e.retrievedAt)errors.push("Incomplete evidence: "+e.id)}
 const byId=new Map(graph.nodes.map(n=>[n.id,n]));
 for(const e of graph.edges){
  if(edgeIds.has(e.id))errors.push("Duplicate edge: "+e.id);edgeIds.add(e.id);
  const a=byId.get(e.subjectId),b=byId.get(e.objectId);
  if(!a||!b){errors.push("Dangling edge: "+e.id);continue}
  const rule=PREDICATE_RULES[e.predicate];
  if(rule&&(!rule.subjects.includes(a.kind)||!rule.objects.includes(b.kind)))errors.push("Invalid predicate types: "+e.id);
  if(e.confidence!==undefined&&(e.confidence<0||e.confidence>1||!Number.isFinite(e.confidence)))errors.push("Invalid confidence: "+e.id);
  for(const id of e.evidenceIds)if(!evidenceIds.has(id))errors.push("Unknown evidence: "+e.id+" -> "+id);
  if(e.reviewStatus==="approved"&&(!e.reviewer?.trim()||!e.reviewedAt||!e.evidenceIds.length||e.evidenceStatus!=="supported"||e.assertionType==="hypothesis"||e.predicate==="RELATED_TOPIC"||e.evidenceIds.some(id=>!graph.evidence.some(source=>source.id===id&&source.assessment==="supported"))))errors.push("Invalid approved assertion: "+e.id);
 }
 return errors;
}
