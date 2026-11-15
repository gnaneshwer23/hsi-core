/** Diagnostic projection of candidate annotations. This is never source clearance or scientific acceptance. */
import {parseDomainBundle,type DomainBundle} from './domainGraph';
export const GRAPH_CONTEXT_FIELDS=['model','design','tissue','population','assay','timepoint','intervention','outcome'] as const;
export const EVIDENCE_BLOCKERS=['passage_binding_unverified','source_clearance_unverified','independent_review_missing','scientific_evaluation_unaccepted'] as const;
export function graphEvidenceReadiness(bundle:DomainBundle,edgeIds?:readonly string[]){
 parseDomainBundle(bundle);
 const ids=edgeIds===undefined?bundle.edges.map(e=>e.id):[...edgeIds];
 if(ids.length>2000||new Set(ids).size!==ids.length||ids.some(id=>!bundle.edges.some(e=>e.id===id)))throw Error('Invalid readiness selection');
 const records=ids.map(id=>{
  const edge=bundle.edges.find(e=>e.id===id)!,source=bundle.sources.find(s=>s.id===edge.sourceId);
  const missingContext=GRAPH_CONTEXT_FIELDS.filter(k=>edge[k]===null||!edge[k]?.trim()||edge[k]==='unspecified');
  return {edgeId:id,kind:edge.kind,sourceId:edge.sourceId,missingContext,
   unrepresentedContext:['dose','cellState','sampleSize','controls','estimand'] as const,
   sourceTextAvailable:!!source?.passages.some(p=>p.text?.trim()),
   blockers:edge.kind==='research_gap'?['research_gap_is_not_evidence']:['passage_binding_unverified','source_clearance_unverified','independent_review_missing','scientific_evaluation_unaccepted',...(missingContext.length?['incomplete_context']:[])],
   annotationBasis:'unverified_graph_annotations' as const,scientificApproval:false as const,graphPromotable:false as const};
 });
 return {schemaVersion:'hsi-graph-evidence-readiness-1' as const,graphVersion:bundle.version,records,
  totals:{selected:records.length,candidates:records.filter(r=>r.kind==='source_candidate').length,gaps:records.filter(r=>r.kind==='research_gap').length,withSourceText:records.filter(r=>r.sourceTextAvailable).length,
   missingContext:Object.fromEntries(GRAPH_CONTEXT_FIELDS.map(k=>[k,records.filter(r=>r.kind==='source_candidate'&&r.missingContext.includes(k)).length]))},
  basis:'repository_snapshot_only' as const,sourceClearanceVerified:false as const,scientificApproval:false as const,graphPromotable:false as const,liveExecutionAllowed:false as const};
}
export function renderEvidenceReadiness(report:ReturnType<typeof graphEvidenceReadiness>){
 return ['## Evidence preparation requirements',`Snapshot: ${report.graphVersion}`,'Diagnostic only. Graph annotations and the presence of source text are not verified passage bindings or source permissions.',
  ...report.records.map(r=>`- ${r.edgeId}: ${r.kind}; missing recorded context: ${r.missingContext.join(', ')||'none'}; additional passage-level context required: ${r.unrepresentedContext.join(', ')}. Blockers: ${r.blockers.join(', ')}.`),
  'No source clearance, independent scientific approval, provider execution or graph promotion is established by this report.'].join('\n');
}
