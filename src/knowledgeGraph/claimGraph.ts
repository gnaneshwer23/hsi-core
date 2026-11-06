/** Claim-centric inspection contract. This working graph cannot approve or publish science. */
import {canonicalEvidenceJson,parseResearchEvidenceCorpus,verifyResearchEvidenceCorpus,type ResearchEvidenceCorpus} from '../evidence/researchEvidenceCorpus';
export const CLAIM_PREDICATES=['produces','regulates','inhibits','activates','suppresses','differentiates_into','associated_with','causes','contributes_to','biomarker_for','treats','contraindicated_with','measured_in','expressed_in','part_of','located_in','studied_in','promotes_in_vitro','increased_in','contributes_to_in_model','increased_or_imbalanced_in'] as const;
export type ClaimPredicate=typeof CLAIM_PREDICATES[number];
export type ClaimEntity={id:string;kind:'cell'|'cell_state'|'molecule'|'gene'|'protein'|'pathway'|'tissue'|'organ'|'microbe'|'metabolite'|'biomarker'|'disease'|'phenotype'|'medication'|'intervention'|'trial'|'biological_context';name:string;aliases:string[];externalIds:{system:string;value:string;mapping:'unreviewed'}[];description:string;domains:string[];definitionSourceIds:string[];status:'draft'};
export type EntityMention={id:string;entityId:string;passageId:string;text:string;start:number;end:number;resolution:'candidate_exact_alias'};
export type ClaimBinding={id:string;claimId:string;subjectId:string;predicate:ClaimPredicate;objectId:string;relationshipType:'associative'|'experimental'|'contextual';negated:boolean;hedged:boolean;dataClass:'public_source_candidate';evidenceStatus:'not_curated';confidence:'not_calibrated';reviewStatus:'draft';originalPredicate:string};
export type ClaimComparison={id:string;claimIds:string[];classification:'context_comparison_required';reason:string;confirmedContradiction:false};
export type ClaimGraph={schemaVersion:'hsi-claim-graph-1';version:string;parentVersion:string|null;method:{adapter:'hsi-working-corpus-graph';version:'1.0.0';entityMentions:'exact_dictionary_offsets';relationships:'explicit_source_candidate_mapping';model:null;promptVersion:null};corpus:ResearchEvidenceCorpus;entities:ClaimEntity[];mentions:EntityMention[];edges:ClaimBinding[];comparisons:ClaimComparison[];containsPhi:false;clinicalAdvice:false;graphPromotable:false;status:'working_draft'};
const SHA=/^[a-f0-9]{64}$/;
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{1,150}$/;
const entityKinds=['cell','cell_state','molecule','gene','protein','pathway','tissue','organ','microbe','metabolite','biomarker','disease','phenotype','medication','intervention','trial','biological_context'];
function fail():never{throw Error('Invalid claim graph snapshot')}
function exact(v:unknown,keys:string[]){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).sort().join('|')!==[...keys].sort().join('|'))fail()}
function text(v:unknown,max=4000):v is string{return typeof v==='string'&&v.trim().length>0&&v.length<=max}
function strings(v:unknown,max:number){if(!Array.isArray(v)||v.length>max||v.some(s=>!text(s,250))||new Set(v).size!==v.length)fail()}
export function parseClaimGraph(value:unknown):ClaimGraph{
 exact(value,['schemaVersion','version','parentVersion','method','corpus','entities','mentions','edges','comparisons','containsPhi','clinicalAdvice','graphPromotable','status']);
 const g=value as ClaimGraph;
 if(g.schemaVersion!=='hsi-claim-graph-1'||!SHA.test(g.version)||g.parentVersion!==null&&!SHA.test(g.parentVersion)||g.parentVersion===g.version||g.status!=='working_draft'||g.containsPhi!==false||g.clinicalAdvice!==false||g.graphPromotable!==false)fail();
 exact(g.method,['adapter','version','entityMentions','relationships','model','promptVersion']);
 if(g.method.adapter!=='hsi-working-corpus-graph'||g.method.version!=='1.0.0'||g.method.entityMentions!=='exact_dictionary_offsets'||g.method.relationships!=='explicit_source_candidate_mapping'||g.method.model!==null||g.method.promptVersion!==null)fail();
 parseResearchEvidenceCorpus(g.corpus);
 if(!Array.isArray(g.entities)||g.entities.length<1||g.entities.length>500||!Array.isArray(g.mentions)||g.mentions.length>2000||!Array.isArray(g.edges)||g.edges.length>1000||!Array.isArray(g.comparisons)||g.comparisons.length>100)fail();
 const entities=new Map<string,ClaimEntity>(),sources=new Map(g.corpus.sources.map(s=>[s.id,s])),claims=new Map(g.corpus.claims.map(c=>[c.id,c]));
 for(const n of g.entities){
  exact(n,['id','kind','name','aliases','externalIds','description','domains','definitionSourceIds','status']);
  if(!ID.test(n.id)||entities.has(n.id)||!entityKinds.includes(n.kind)||!text(n.name,250)||!text(n.description)||n.status!=='draft')fail();
  strings(n.aliases,30);strings(n.domains,8);strings(n.definitionSourceIds,20);
  if(!n.definitionSourceIds.length||n.definitionSourceIds.some(id=>!sources.has(id))||!Array.isArray(n.externalIds)||n.externalIds.length>15)fail();
  for(const x of n.externalIds){exact(x,['system','value','mapping']);if(!text(x.system,50)||!text(x.value,100)||x.mapping!=='unreviewed')fail()}
  entities.set(n.id,n);
 }
 const mentionIds=new Set<string>();
 for(const m of g.mentions){
  exact(m,['id','entityId','passageId','text','start','end','resolution']);const p=g.corpus.passages.find(p=>p.id===m.passageId),n=entities.get(m.entityId);
  if(!ID.test(m.id)||mentionIds.has(m.id)||!n||!p?.text||!p.sha256||!p.sourceVersion||!n.definitionSourceIds.includes(p.sourceId)||!Number.isSafeInteger(m.start)||!Number.isSafeInteger(m.end)||m.start<0||m.end<=m.start||p.text.slice(m.start,m.end)!==m.text||![n.name,...n.aliases].some(a=>normalise(a)===normalise(m.text))||m.resolution!=='candidate_exact_alias')fail();
  mentionIds.add(m.id);
 }
 const edges=new Set<string>();
 for(const e of g.edges){
  exact(e,['id','claimId','subjectId','predicate','objectId','relationshipType','negated','hedged','dataClass','evidenceStatus','confidence','reviewStatus','originalPredicate']);
  const c=claims.get(e.claimId),a=entities.get(e.subjectId),b=entities.get(e.objectId);
  if(!ID.test(e.id)||edges.has(e.id)||!c||!a||!b||a.id===b.id||!a.definitionSourceIds.includes(c.sourceId)||!b.definitionSourceIds.includes(c.sourceId)||!CLAIM_PREDICATES.includes(e.predicate)||!['associative','experimental','contextual'].includes(e.relationshipType)||typeof e.negated!=='boolean'||typeof e.hedged!=='boolean'||e.dataClass!=='public_source_candidate'||e.evidenceStatus!=='not_curated'||e.reviewStatus!=='draft'||e.confidence!=='not_calibrated'||!text(e.originalPredicate,100))fail();
  if(e.predicate==='causes'||e.predicate==='treats'||e.predicate==='contraindicated_with')fail(); // No clinical/causal promotion via a working-set adapter.
  if(e.relationshipType==='contextual'&&e.predicate!=='studied_in')fail();
  edges.add(e.id);
 }
 const comparisons=new Set<string>();for(const c of g.comparisons){exact(c,['id','claimIds','classification','reason','confirmedContradiction']);strings(c.claimIds,10);if(!ID.test(c.id)||comparisons.has(c.id)||c.claimIds.length<2||c.claimIds.some(id=>!claims.has(id))||c.classification!=='context_comparison_required'||c.confirmedContradiction!==false||!text(c.reason))fail();comparisons.add(c.id)}
 return g;
}
export async function verifyClaimGraph(value:unknown,digest:(text:string)=>Promise<string>,expectedVersion?:string):Promise<ClaimGraph>{
 const g=parseClaimGraph(value);const {version,...body}=g;
 if(expectedVersion&&version!==expectedVersion||await digest(canonicalEvidenceJson(body))!==version)fail();
 await verifyResearchEvidenceCorpus(g.corpus,digest);return g;
}
export function normalise(v:string){return v.normalize('NFKC').toLowerCase().replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').trim()}
export function resolveClaimEntity(g:ClaimGraph,query:string,externalId?:{system:string;value:string}):{decision:'same'|'different'|'unresolved';candidates:string[];basis:string}{
 if(!text(query,250))return {decision:'unresolved',candidates:[],basis:'empty_query'};
 const q=normalise(query);let matches=externalId?g.entities.filter(n=>n.externalIds.some(x=>x.system===externalId.system&&x.value===externalId.value)):g.entities.filter(n=>[n.name,...n.aliases].some(s=>normalise(s)===q));
 if(matches.length===1)return {decision:externalId?'unresolved':'same',candidates:matches.map(n=>n.id),basis:externalId?'external_mapping_unreviewed':'unique_label_match_not_scientific_approval'};
 if(!matches.length)matches=g.entities.filter(n=>[n.name,...n.aliases,n.id].some(s=>normalise(s).includes(q)));
 return {decision:'unresolved',candidates:matches.map(n=>n.id),basis:matches.length?'ambiguous_do_not_merge':'no_matching_entity_in_this_snapshot'};
}
export type GraphFilters={query?:string;domain?:string;kind?:string;disease?:string;tissue?:string;species?:string;evidence?:string;review?:string};
export function claimSpecies(model:string):'human'|'mouse'|'mixed'|'unspecified'{const mouse=/\b(mouse|mice|murine)\b/i.test(model),human=/\bhuman\b/i.test(model)&&!/non[- ]human/i.test(model);return mouse&&human?'mixed':mouse?'mouse':human?'human':'unspecified'}
export function filterClaimGraph(g:ClaimGraph,f:GraphFilters):{entities:ClaimEntity[];edges:ClaimBinding[]}{
 const q=normalise(f.query??'');let entities=g.entities.filter(n=>(!q||[n.name,n.id,...n.aliases,...n.externalIds.map(x=>x.value)].some(s=>normalise(s).includes(q)))&&(!f.domain||n.domains.includes(f.domain))&&(!f.kind||n.kind===f.kind)&&(!f.review||n.status===f.review));
 const ids=new Set(entities.map(n=>n.id));const edges=g.edges.filter(e=>{const c=g.corpus.claims.find(c=>c.id===e.claimId)!;return ids.has(e.subjectId)&&ids.has(e.objectId)&&(!f.disease||c.disease===f.disease)&&(!f.tissue||c.context.tissue===f.tissue)&&(!f.species||claimSpecies(c.context.model)===f.species)&&(!f.evidence||e.evidenceStatus===f.evidence)&&(!f.review||e.reviewStatus===f.review)});
 if(f.disease||f.tissue||f.species||f.evidence){const linked=new Set(edges.flatMap(e=>[e.subjectId,e.objectId]));entities=entities.filter(n=>linked.has(n.id))}
 return {entities,edges};
}
export type ClaimPath={nodeIds:string[];edgeIds:string[];sourceIds:string[];warnings:string[];evidenceStatus:'not_curated';causalConclusionAllowed:false;contextKeys:string[]};
/** Bounded simple paths. Direction is respected unless the user explicitly chooses exploratory traversal. */
export function findClaimPaths(g:ClaimGraph,from:string,to:string,options:{maxHops:number;limit:number;direction:'outgoing'|'both'}):{paths:ClaimPath[];truncated:boolean}{
 if(!g.entities.some(n=>n.id===from)||!g.entities.some(n=>n.id===to)||from===to||!Number.isInteger(options.maxHops)||options.maxHops<1||options.maxHops>5||!Number.isInteger(options.limit)||options.limit<1||options.limit>25||!['outgoing','both'].includes(options.direction))throw Error('Invalid bounded graph path query');
 const paths:ClaimPath[]=[];let expanded=0,truncated=false;
 const adjacency=new Map<string,{edge:ClaimBinding;next:string;reversed:boolean}[]>();
 for(const edge of g.edges){adjacency.set(edge.subjectId,[...(adjacency.get(edge.subjectId)??[]),{edge,next:edge.objectId,reversed:false}]);if(options.direction==='both')adjacency.set(edge.objectId,[...(adjacency.get(edge.objectId)??[]),{edge,next:edge.subjectId,reversed:true}])}
 const queue=[{nodes:[from],edges:[] as ClaimBinding[],reversed:false}];
 while(queue.length){const p=queue.shift()!;if(++expanded>5000){truncated=true;break}
  for(const hop of adjacency.get(p.nodes[p.nodes.length-1]!)??[]){if(p.nodes.includes(hop.next))continue;const nodes=[...p.nodes,hop.next],edges=[...p.edges,hop.edge];
   if(hop.next===to){
    const claims=edges.map(e=>g.corpus.claims.find(c=>c.id===e.claimId)!);const contextKeys=[...new Set(claims.map(c=>[claimSpecies(c.context.model),c.disease,c.context.tissue??'unspecified',c.context.model,c.context.population??'unspecified population',c.context.assay??'unspecified assay',c.context.timepoint??'unspecified timepoint',c.context.intervention??'unspecified intervention',c.context.outcome??'unspecified outcome'].join(' | ')))];
    const warnings=['Draft path: no scientific approval or causal conclusion.'];
    if(contextKeys.length>1)warnings.push('Context changes across steps; do not combine studies into an established mechanism.');
    if(edges.some(e=>e.negated))warnings.push('Includes a reported negative finding; it does not support a positive association.');
    if(p.reversed||hop.reversed)warnings.push('Exploratory traversal includes incoming edges; the original assertion direction is unchanged.');
    if(edges.some(e=>e.relationshipType==='contextual'))warnings.push('Includes study-context metadata, not a biological mechanism.');
    if(claims.some(c=>c.passageIds.some(id=>g.corpus.passages.find(p=>p.id===id)?.text===null)))warnings.push('Exact supporting text is missing for at least one step.');
    paths.push({nodeIds:nodes,edgeIds:edges.map(e=>e.id),sourceIds:[...new Set(claims.map(c=>c.sourceId))],warnings,evidenceStatus:'not_curated',causalConclusionAllowed:false,contextKeys});if(paths.length>=options.limit){truncated=true;return {paths,truncated}}
   }else if(edges.length<options.maxHops){if(queue.length<5000)queue.push({nodes,edges,reversed:p.reversed||hop.reversed});else truncated=true}
  }
 }
 return {paths,truncated};
}
export function claimGraphQuality(g:ClaimGraph){return {entities:g.entities.length,mentions:g.mentions.length,claims:g.corpus.claims.length,edges:g.edges.length,sources:g.corpus.sources.length,passages:g.corpus.passages.filter(p=>p.text!==null).length,locatorOnly:g.corpus.passages.filter(p=>p.text===null).length,sourceLinkedEdges:g.edges.filter(e=>g.corpus.claims.some(c=>c.id===e.claimId&&c.passageIds.length>0)).length,humanReviewedEdges:0,calibratedConfidence:false,benchmarksVerified:false};}
