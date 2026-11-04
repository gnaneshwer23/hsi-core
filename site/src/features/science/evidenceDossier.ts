import type {EvidenceRecord,ScientificEdge,TypedGraph} from "./typedGraphSchema";
export type EvidenceAssessment={edgeId:string;sourceId:string;scope:"background"|"direct_claim";stance:"supports"|"contradicts"|"mentions"|"unclear";notes:string;curator:string;assessedAt:string;reviewedBy?:string;reviewedAt?:string};
export type EvidenceDossier={edge:ScientificEdge;records:Array<{evidence:EvidenceRecord;assessment?:EvidenceAssessment}>;warnings:string[];readyForReview:boolean};
/** Evidence registry and edge-to-source assessments are kept distinct. Linking a URL is not evidence of a biological assertion. */
export function buildEvidenceDossier(graph:TypedGraph,edgeId:string,assessments:EvidenceAssessment[]=[]):EvidenceDossier|null{
 const edge=graph.edges.find(e=>e.id===edgeId);if(!edge)return null;
 const records=edge.evidenceIds.map(id=>{const evidence=graph.evidence.find(e=>e.id===id);return evidence?{evidence,assessment:assessments.find(a=>a.edgeId===edgeId&&a.sourceId===id)}:null}).filter((r):r is {evidence:EvidenceRecord;assessment:EvidenceAssessment|undefined}=>r!==null);
 const warnings:string[]=[];
 if(!records.length)warnings.push("No source records linked to this relationship.");
 if(records.some(r=>r.evidence.assessment!=="supported"))warnings.push("Source-level evidence has not been marked supported.");
 if(records.some(r=>!r.assessment))warnings.push("Some sources have not been assessed against this specific relationship.");
 if(records.some(r=>r.assessment?.scope==="background"))warnings.push("Background sources do not establish claim-level support.");
 if(records.some(r=>r.assessment?.stance==="contradicts"))warnings.push("Contradictory evidence must be reviewed.");
 const direct=records.filter(r=>r.assessment?.scope==="direct_claim"&&r.assessment.stance==="supports"&&r.assessment.reviewedBy&&r.assessment.reviewedAt&&r.evidence.assessment==="supported");
 if(!direct.length)warnings.push("No independently reviewed, directly supporting evidence.");
 return {edge,records,warnings,readyForReview:direct.length>0&&warnings.length===0};
}
export function validateEvidenceAssessments(graph:TypedGraph,assessments:EvidenceAssessment[]):string[]{
 const errors:string[]=[];const keys=new Set<string>();
 for(const a of assessments){
  const key=a.edgeId+":"+a.sourceId;
  if(keys.has(key))errors.push("Duplicate assessment "+key);keys.add(key);
  const edge=graph.edges.find(e=>e.id===a.edgeId);
  if(!edge||!edge.evidenceIds.includes(a.sourceId)||!graph.evidence.some(e=>e.id===a.sourceId))errors.push("Unlinked assessment "+key);
  if(!a.curator||!a.assessedAt||!a.notes.trim())errors.push("Incomplete assessment "+key);
  if(Boolean(a.reviewedBy)!==Boolean(a.reviewedAt))errors.push("Incomplete independent review "+key);
  if(a.scope==="background"&&a.stance==="supports")errors.push("Background source cannot directly support claim "+key);
 }
 return errors;
}
export function edgeEvidenceSummary(graph:TypedGraph,edgeId:string,assessments:EvidenceAssessment[]=[]){
 const d=buildEvidenceDossier(graph,edgeId,assessments);
 return d?{linked:d.records.length,directReviewed:d.records.filter(r=>r.assessment?.scope==="direct_claim"&&r.assessment.stance==="supports"&&r.assessment.reviewedBy).length,contradictions:d.records.filter(r=>r.assessment?.stance==="contradicts").length,warnings:d.warnings}:null;
}
