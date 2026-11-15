/** Server-only bridge from a pinned graph candidate to the existing clearance and detailed-context contracts. */
import {createHash} from 'node:crypto';
import {canonicalEvidenceJson} from '../evidence/researchEvidenceCorpus';
import {DETAILED_CONTEXT_FIELDS,buildPassageLinkedContext,comparePassageLinkedContexts,type ContextExtraction,type PassageLinkedContext} from '../evidence/passageLinkedContext';
import {type ResearchSource,type ResearchPassage} from '../researchContracts';
import {type SourceClearanceVerifier} from '../researchV2/sourceClearanceReceipt';
import {verifyDomainBundle,type DomainBundle} from './domainGraph';
import {graphEvidenceReadiness} from './evidenceReadiness';
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export type GraphCurationPacket=Awaited<ReturnType<typeof createGraphCurationPacket>>;
export async function createGraphCurationPacket(bundle:DomainBundle,edgeIds:readonly string[]){
 bundle=structuredClone(bundle);const ids=[...edgeIds];
 await verifyDomainBundle(bundle,async value=>hash(value));
 if(!ids.length||ids.length>12)throw Error('Select 1-12 relationships for curation');
 const readiness=graphEvidenceReadiness(bundle,ids);
 const records=readiness.records.map(r=>{
  const edge=bundle.edges.find(e=>e.id===r.edgeId)!,source=bundle.sources.find(s=>s.id===edge.sourceId);
  return {edgeId:edge.id,sourceId:edge.sourceId,canonicalId:source?.pmid?'PMID:'+source.pmid:source?.doi?'DOI:'+source.doi:null,
   annotation:{subjectId:edge.subjectId,objectId:edge.objectId,predicate:edge.predicate,model:edge.model,tissue:edge.tissue,assay:edge.assay,population:edge.population,reviewStatus:edge.reviewStatus},
   sourceVersion:null,passageId:null,clearanceReceiptId:null,
   fields:Object.fromEntries(DETAILED_CONTEXT_FIELDS.map(field=>[field,{status:'not_extracted' as const,reason:'Requires exact source-version and passage-linked extraction'}])),
   independentAssessments:[],adjudication:null,status:'authoring_only' as const};
 });
 const body={schemaVersion:'hsi-graph-curation-packet-1' as const,graphVersion:bundle.version,edgeIds:ids,readiness,records,
  sourceClearanceVerified:false as const,scientificApproval:false as const,graphPromotable:false as const};
 return {...body,packetHash:hash(canonicalEvidenceJson(body))};
}
export type GraphPassageInput={edgeId:string;source:ResearchSource;passage:ResearchPassage;receipt:unknown;clearanceReceiptId:string;extractions:Partial<Record<(typeof DETAILED_CONTEXT_FIELDS)[number],ContextExtraction>>};
export function createGraphEvidencePreparationService(deps:{enabled?:boolean;clearance:SourceClearanceVerifier}){
 if(typeof deps.clearance?.authorize!=='function')throw Error('Trusted clearance verifier required');
 const enabled=deps.enabled===true,authorize=deps.clearance.authorize.bind(deps.clearance);
 return {async prepare(bundle:DomainBundle,packet:GraphCurationPacket,inputs:readonly GraphPassageInput[]){
  if(!enabled)throw Error('Graph evidence preparation disabled');
  // Snapshot everything before the first asynchronous authority call.
  bundle=structuredClone(bundle);packet=structuredClone(packet);inputs=structuredClone(inputs);
  const expected=await createGraphCurationPacket(bundle,packet.edgeIds);
  if(canonicalEvidenceJson(expected)!==canonicalEvidenceJson(packet))throw Error('Stale or modified curation packet');
  if(inputs.length!==packet.edgeIds.length||new Set(inputs.map(i=>i.edgeId)).size!==inputs.length||inputs.some(i=>!packet.edgeIds.includes(i.edgeId)))throw Error('Curation batch does not match the selected relationships');
  const contexts:PassageLinkedContext[]=[];
  // Validate the ENTIRE batch, including source identity, before any revocation lookup/egress.
  for(const input of inputs){
   const edge=bundle.edges.find(e=>e.id===input.edgeId)!,source=bundle.sources.find(s=>s.id===edge.sourceId);
   const receipt=input.receipt as {id?:unknown;canonicalId?:unknown};
   const canonicalId=source?.pmid?'PMID:'+source.pmid:source?.doi?'DOI:'+source.doi:null;
   if(edge.kind!=='source_candidate'||!source||!canonicalId||input.source.id!==source.id||input.passage.sourceId!==source.id||input.source.provenance.version!==input.passage.sourceVersion||receipt?.id!==input.clearanceReceiptId||receipt?.canonicalId!==canonicalId)throw Error('Unbound graph source, passage or clearance identity');
   contexts.push(buildPassageLinkedContext({...input,extractions:input.extractions}));
  }
  for(const input of inputs){
   try{if(await authorize({receipt:input.receipt,sourceId:input.source.id,sourceVersion:input.passage.sourceVersion,passage:input.passage.text,requiredActions:['storage','display','comparison','export']})!==true)throw Error();}catch{throw Error('Source use is not currently authorized');}
  }
  const body={schemaVersion:'hsi-prepared-graph-evidence-1' as const,graphVersion:bundle.version,packetHash:packet.packetHash,
   records:inputs.map((input,i)=>({edgeId:input.edgeId,context:contexts[i]!})),
   comparisonInputs:contexts.flatMap((left,i)=>contexts.slice(i+1).map((right,j)=>({leftEdgeId:inputs[i]!.edgeId,rightEdgeId:inputs[i+j+1]!.edgeId,contextComparison:(()=>{const a=bundle.edges.find(e=>e.id===inputs[i]!.edgeId)!,b=bundle.edges.find(e=>e.id===inputs[i+j+1]!.edgeId)!;return a.subjectId===b.subjectId&&a.objectId===b.objectId&&a.predicate===b.predicate?comparePassageLinkedContexts(left,right):{status:'not_comparable' as const,missing:[],differences:[],estimandAligned:false,reason:'Different subject, outcome entity or predicate'};})()}))),
   clearanceCheckedFor:['storage','display','comparison','export'] as const,
   /** Fresh authority checks are required again at every later use; this artifact grants no reusable permissions. */
   clearanceMustBeRechecked:true as const,modelExecution:false as const,scientificApproval:false as const,graphPromotable:false as const,independentReview:'required' as const};
  return {...body,preparationHash:hash(canonicalEvidenceJson(body))};
 }};
}
