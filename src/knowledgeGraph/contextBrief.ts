/** Server-only, offline curation composition. Never a search, independent review or publication receipt. */
import {createHash} from 'node:crypto';
import {canonicalEvidenceJson} from '../evidence/researchEvidenceCorpus';
import {compareEvidenceUnits,type ComparableEvidenceUnit,type StructuredEvidenceComparison} from '../evidence/structuredEvidenceComparison';
import {reportContextConflict} from '../evidence/contextConflictAudit';
import {createGraphEvidencePreparationService,type GraphCurationPacket,type GraphPassageInput} from './evidencePreparation';
import type {SourceClearanceVerifier} from '../researchV2/sourceClearanceReceipt';
import type {DomainBundle} from './domainGraph';
import {rejectPhiPayload} from '../cdsPhiBoundary';
import {validatePassageLinkedContext} from '../evidence/passageLinkedContext';

const digest=(v:unknown)=>createHash('sha256').update(canonicalEvidenceJson(v)).digest('hex');
export type CuratedGraphFinding={edgeId:string;start:number;end:number;polarity:'supporting'|'opposing'|'uncertain'};
export type GraphContextBrief={schemaVersion:'hsi-graph-context-brief-1';investigationId:string;question:string;graphVersion:string;packetHash:string;preparationHash:string;version:number;parentBriefHash:string|null;units:ComparableEvidenceUnit[];findings:readonly CuratedGraphFinding[];comparisons:StructuredEvidenceComparison[];report:ReturnType<typeof reportContextConflict>[];searchStatus:'not_executed';verifierStatus:'not_executed';humanReview:'required';annotationBasis:'curator_unreviewed';clearanceMustBeRechecked:true;consensusEstablished:false;scientificApproval:false;graphPromotable:false;gaps:string[];briefHash:string};
export type GraphContextBriefInput={investigationId:string;question:string;bundle:DomainBundle;packet:GraphCurationPacket;passages:readonly GraphPassageInput[];findings:readonly CuratedGraphFinding[];previous?:GraphContextBrief};
export function createGraphContextBriefService(deps:{enabled?:boolean;clearance:SourceClearanceVerifier}){
 const preparation=createGraphEvidencePreparationService(deps);
 const create=async(input:GraphContextBriefInput):Promise<GraphContextBrief>=>{
  const i=structuredClone(input);
  if(!/^[A-Za-z0-9][A-Za-z0-9:_-]{2,127}$/.test(i.investigationId)||!i.question?.trim()||i.question.length>500||!rejectPhiPayload({textBlobs:[i.question]}).ok)throw Error('Invalid research brief target');
  if(i.findings.length!==i.passages.length||new Set(i.findings.map(f=>f.edgeId)).size!==i.findings.length)throw Error('Finding selection mismatch');
  // Validate every curator span before preparation can contact a clearance authority.
  for(const f of i.findings){
   const p=i.passages.find(p=>p.edgeId===f.edgeId)?.passage;
   if(!p||!['supporting','opposing','uncertain'].includes(f.polarity)||!Number.isSafeInteger(f.start)||!Number.isSafeInteger(f.end)||f.start<0||f.end<=f.start||f.end>p.text.length||!p.text.slice(f.start,f.end).trim()||f.end-f.start>500)throw Error('Unbound finding passage span');
  }
  const previous=i.previous;
  if(previous){validateGraphContextBrief(previous);if(previous.investigationId!==i.investigationId||previous.question!==i.question||previous.graphVersion!==i.bundle.version)throw Error('Previous brief belongs to another investigation or snapshot');}
  const prepared=await preparation.prepare(i.bundle,i.packet,i.passages);
  const units:ComparableEvidenceUnit[]=prepared.records.map(r=>{
   const edge=i.bundle.edges.find(e=>e.id===r.edgeId)!,finding=i.findings.find(f=>f.edgeId===r.edgeId)!;
   return {id:r.edgeId,label:r.context.passageText.slice(finding.start,finding.end),subject:{system:'hsi-snapshot-local',value:edge.subjectId,label:null},object:{system:'hsi-snapshot-local',value:edge.objectId,label:null},predicate:edge.predicate,findingPolarity:finding.polarity,
    biologicalContext:{diseasePhenotype:[],organTissueCellState:[],genesProteinsPathways:[],experimentalSystemsSpecies:[],interventionsTargets:[]},evidenceSourceIds:[r.context.sourceId],sourceProvider:'curator-supplied-cleared-passage',responseIdentity:r.context.sourceVersion,methodologicalNote:null,detailedContext:r.context};
  });
  const comparisons=units.flatMap((left,n)=>units.slice(n+1).map(right=>compareEvidenceUnits({left,right})));
  const body={schemaVersion:'hsi-graph-context-brief-1' as const,investigationId:i.investigationId,question:i.question,graphVersion:prepared.graphVersion,packetHash:prepared.packetHash,preparationHash:prepared.preparationHash,
   version:previous?previous.version+1:1,parentBriefHash:previous?.briefHash??null,units,findings:i.findings,comparisons,report:comparisons.map(reportContextConflict),
   searchStatus:'not_executed' as const,verifierStatus:'not_executed' as const,humanReview:'required' as const,annotationBasis:'curator_unreviewed' as const,
   clearanceMustBeRechecked:true as const,consensusEstablished:false as const,scientificApproval:false as const,graphPromotable:false as const,
   gaps:[...(units.length<2?['Fewer than two findings; conflict is not assessed']:[]),'No support or oppose search was executed; completeness and consensus are not established',...prepared.records.flatMap(r=>Object.entries(r.context.fields).filter(([,v])=>!['reported','not_applicable'].includes(v.status)||v.status==='reported'&&!v.normalized).map(([k])=>r.edgeId+': '+k+' unresolved'))]};
  return {...body,briefHash:digest(body)};
 };
 return {create,async export(input:GraphContextBriefInput,format:'json'|'markdown'){
  // Do not accept a previously cleared artifact as reusable export permission.
  return renderGraphContextBrief(await create(input),format);
 }};
}
export function validateGraphContextBrief(brief:GraphContextBrief){
 const {briefHash,...body}=brief;
 if(brief.schemaVersion!=='hsi-graph-context-brief-1'||digest(body)!==briefHash||!Number.isSafeInteger(brief.version)||brief.version<1||brief.scientificApproval!==false||brief.graphPromotable!==false||brief.consensusEstablished!==false||brief.humanReview!=='required'||brief.annotationBasis!=='curator_unreviewed'||brief.searchStatus!=='not_executed'||brief.verifierStatus!=='not_executed'||brief.clearanceMustBeRechecked!==true||brief.units.length<1||brief.units.length>12||brief.findings.length!==brief.units.length||new Set(brief.units.map(u=>u.id)).size!==brief.units.length)throw Error('Invalid graph context brief');
 for(const u of brief.units){const f=brief.findings.find(f=>f.edgeId===u.id),c=u.detailedContext;if(!f||!c||!Number.isSafeInteger(f.start)||!Number.isSafeInteger(f.end)||f.start<0||f.end<=f.start||f.end>c.passageText.length||f.end-f.start>500||c.passageText.slice(f.start,f.end)!==u.label||f.polarity!==u.findingPolarity||!['supporting','opposing','uncertain'].includes(f.polarity)||u.evidenceSourceIds.length!==1||u.evidenceSourceIds[0]!==c.sourceId)throw Error('Unbound brief finding');validatePassageLinkedContext(c);}
 const comparisons=brief.units.flatMap((left,n)=>brief.units.slice(n+1).map(right=>compareEvidenceUnits({left,right})));
 if(digest(comparisons)!==digest(brief.comparisons)||digest(comparisons.map(reportContextConflict))!==digest(brief.report))throw Error('Unreproducible brief comparisons');
}
/** Caller must reauthorize current display/export rights; this renderer grants no permission. */
export function renderGraphContextBrief(brief:GraphContextBrief,format:'json'|'markdown'){
 if(!['json','markdown'].includes(format))throw Error('Unknown brief format');
 validateGraphContextBrief(brief);if(format==='json')return JSON.stringify(brief,null,2);
 const safe=(s:string)=>s.replace(/[<>&`*_\[\]#]/g,c=>'&#'+c.charCodeAt(0)+';').replace(/[\r\n]+/g,' ');
 return ['# Context comparison brief',safe(brief.question),`Version ${brief.version} · ${brief.briefHash}`,`Snapshot ${brief.graphVersion}`,'Curator annotations; independent verification and human review have not occurred. No scientific approval or graph promotion.',
  ...brief.units.map(u=>`- ${safe(u.id)}: ${safe(u.label)} (${u.findingPolarity}); source ${safe(u.detailedContext!.sourceId)} / ${safe(u.detailedContext!.sourceVersion)} / passage ${safe(u.detailedContext!.passageId)}`),
  ...brief.report.map(r=>`- ${safe(r.comparisonId)}: ${r.classification}. ${r.reasons.map(safe).join(' ')}`),'## Missing evidence and limits',...brief.gaps.map(g=>'- '+safe(g)),'Current source permissions must be rechecked before display or export.'].join('\n');
}
