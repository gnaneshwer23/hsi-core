import {createHash} from 'node:crypto';
import {canonicalEvidenceJson,parseResearchEvidenceCorpus,type ResearchEvidenceCorpus} from '../evidence/researchEvidenceCorpus';
import {parseClaimGraph,type ClaimGraph,type ClaimEntity,type ClaimBinding,type EntityMention,type ClaimPredicate} from './claimGraph';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
/** Offline deterministic adapter. No LLM extraction, entity merge, confidence calibration or graph publication. */
export function buildClaimGraph(corpusValue:unknown,ssc:{nodes:{id:string;kind:string;preferredLabel:string;sourceProvenance:string[]}[];relationships:{id:string;subjectId:string;predicate:string;objectId:string;sourceEvidenceIds:string[]}[]},parentVersion:string|null=null):ClaimGraph{
 const corpus=parseResearchEvidenceCorpus(corpusValue),sscSources=corpus.sources.filter(s=>s.disease==='systemic_sclerosis').map(s=>s.id),raSources=corpus.sources.filter(s=>s.disease==='rheumatoid_arthritis').map(s=>s.id);
 const entities:ClaimEntity[]=ssc.nodes.map(n=>({id:n.id,kind:['cell_state','phenotype'].includes(n.kind)?n.kind as 'cell_state'|'phenotype':'biological_context',name:n.preferredLabel,aliases:[],externalIds:[],description:'Source-linked candidate concept. Context-specific names remain distinct until independently resolved.',domains:['immune'],definitionSourceIds:ssc.relationships.filter(e=>e.subjectId===n.id||e.objectId===n.id).flatMap(e=>e.sourceEvidenceIds.map(id=>'pmid:'+id.replace('PMID:',''))).filter((id,i,a)=>a.indexOf(id)===i&&sscSources.includes(id)),status:'draft'}));
 entities.push(
  {id:'ra:rheumatoid-factor',kind:'biomarker',name:'Rheumatoid factor',aliases:['RF'],externalIds:[],description:'Serology term mentioned in the imported RA studies; predictive value requires context-specific review.',domains:['immune'],definitionSourceIds:raSources,status:'draft'},
  {id:'ra:anti-ccp',kind:'biomarker',name:'Anti-CCP antibodies',aliases:['anti-CCP','anti-cyclic citrullinated peptide'],externalIds:[],description:'Source-reported antibody-status term. Not an individual treatment selection rule.',domains:['immune'],definitionSourceIds:raSources,status:'draft'},
  {id:'ra:anti-tnf-response',kind:'phenotype',name:'Anti-TNF treatment response',aliases:['response to anti-TNF','anti-TNF treatment response'],externalIds:[],description:'Study-specific response outcome; DAS28, population and timing remain attached to each claim.',domains:['immune'],definitionSourceIds:raSources,status:'draft'}
 );
 for(const [id,name,sources] of [['disease:ra','Rheumatoid arthritis',raSources],['disease:ssc','Systemic sclerosis',sscSources]] as const)entities.push({id,name,kind:'disease',aliases:id==='disease:ra'?['RA']:['SSc'],externalIds:[],description:'Disease context in the cited research; not a patient record.',domains:['immune'],definitionSourceIds:[...sources],status:'draft'});
 const edges:ClaimBinding[]=[];
 const add=(claimId:string,subjectId:string,predicate:ClaimPredicate,objectId:string,relationshipType:ClaimBinding['relationshipType'],negated:boolean,originalPredicate:string)=>edges.push({id:'binding:'+claimId+':'+hash([subjectId,predicate,objectId].join('|')).slice(0,12),claimId,subjectId,predicate,objectId,relationshipType,negated,hedged:false,dataClass:'public_source_candidate',evidenceStatus:'not_curated',confidence:'not_calibrated',reviewStatus:'draft',originalPredicate});
 for(const c of corpus.claims){
  if(c.disease==='systemic_sclerosis'){
   const binding=ssc.relationships.find(e=>e.id===c.id);if(!binding)throw Error('Missing source-linked SSc binding');
   if(c.assertion!==entities.find(n=>n.id===binding.subjectId)?.name+' → '+binding.predicate.toLowerCase()+' → '+entities.find(n=>n.id===binding.objectId)?.name)throw Error('Graph assertion differs from source candidate');
   add(c.id,binding.subjectId,binding.predicate.toLowerCase() as ClaimPredicate,binding.objectId,binding.predicate==='ASSOCIATED_WITH'||binding.predicate.includes('INCREASED')?'associative':'experimental',false,binding.predicate);
   add(c.id,binding.subjectId,'studied_in','disease:ssc','contextual',false,'source_disease_context');
  }else{
   const negative=c.id==='HSI-C-RA-SEROLOGY-META-RESULTS';
   if(!negative&&c.id!=='HSI-C-RA-SEROLOGY-COHORT-RESULTS')throw Error('Unmapped RA claim; explicit extraction review required');
   for(const id of ['ra:rheumatoid-factor','ra:anti-ccp'])add(c.id,id,'associated_with','ra:anti-tnf-response','associative',negative,negative?'source_reports_no_significant_association':'source_reports_association');
   add(c.id,'ra:anti-tnf-response','studied_in','disease:ra','contextual',false,'source_disease_context');
  }
 }
 const mentions:EntityMention[]=[];
 for(const p of corpus.passages){if(!p.text)continue;for(const n of entities){if(!n.definitionSourceIds.includes(p.sourceId))continue;const seen=new Set<string>();for(const alias of [n.name,...n.aliases]){
  const needle=alias.toLowerCase(),hay=p.text.toLowerCase();let offset=0;
  while((offset=hay.indexOf(needle,offset))!==-1){const start=offset,end=start+alias.length;offset=end;if(/[\p{L}\p{N}]/u.test(p.text[start-1]??'')||/[\p{L}\p{N}]/u.test(p.text[end]??'')||seen.has(start+':'+end))continue;seen.add(start+':'+end);mentions.push({id:'mention:'+p.id+':'+hash([n.id,start,end].join('|')).slice(0,12),entityId:n.id,passageId:p.id,text:p.text.slice(start,end),start,end,resolution:'candidate_exact_alias'});
  }
 }}}
 const body:Omit<ClaimGraph,'version'>={schemaVersion:'hsi-claim-graph-1',parentVersion,method:{adapter:'hsi-working-corpus-graph',version:'1.0.0',entityMentions:'exact_dictionary_offsets',relationships:'explicit_source_candidate_mapping',model:null,promptVersion:null},corpus,entities,mentions,edges,comparisons:[
  {id:'comparison:ra-serology',claimIds:['HSI-C-RA-SEROLOGY-COHORT-RESULTS','HSI-C-RA-SEROLOGY-META-RESULTS'],classification:'context_comparison_required',reason:'A cohort reports serology-associated response differences; a meta-analysis reports no significant pooled association. Compare design, response definitions, heterogeneity and intervals before adjudication.',confirmedContradiction:false},
  {id:'comparison:ssc-tfh',claimIds:['HSI-C-SSC-001','HSI-C-SSC-006'],classification:'context_comparison_required',reason:'Total cTfh counts and proportions versus a Tfh1 subset are different measurements. Compare gating, denominators, cohort and treatment; do not infer a confirmed contradiction.',confirmedContradiction:false}
 ],containsPhi:false,clinicalAdvice:false,graphPromotable:false,status:'working_draft'};
 const graph={...body,version:hash(canonicalEvidenceJson(body))};parseClaimGraph(graph);return graph;
}
