/**
 * P1 live investigation: question -> real public sources -> candidate relationships -> optional two-model challenge -> brief.
 * Everything produced is `extracted_candidate`: unreviewed, not graph-promotable, not scientific approval. A failed search is
 * recorded as failed and is never read as "no evidence". Model steps run only when two distinct providers are configured.
 * Abstract-level only: no full text, no stored passages, no PHI, no persistence, no clinical advice.
 */
import {createHash} from "node:crypto";
import type {FetchLike} from "../fetchLike";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {searchEuropePmc,searchOpenAlex,type LiveEvidenceRecord} from "../evidence/liveSources";
import {openTargetsAdapter} from "../researchV2/sourceAdapters";
import {combineDirections,runDirectionalChallenge,type DirectionalVerdict} from "./directionalChallenge";
import type {Budget,ModelRunner} from "../modelProviders";
import {findingsFor,proposeHypotheses,type HypothesisOutcome} from "./hypotheses";
import {buildLiveStructuredComparison} from "./liveRunComparison";

export type LiveScenario={schemaVersion:"hsi-live-scenario-1";id:string;title:string;question:string;
 entities:{key:string;label:string;terms:string[]}[];relations:{id:string;subject:string;object:string}[];
 contexts:{key:string;label:string;terms:string[];openTargetsId?:string}[]};
export type RunEvent={stage:"scoped"|"searched"|"retrieved"|"mapped"|"compared"|"challenged"|"hypothesised"|"brief";at:string;status:"ok"|"partial"|"failed"|"skipped";detail:string};
export type SearchOutcome={provider:string;context:string;status:"ok"|"failed";count:number;error:string|null;query:string};
export type VerifierVerdict=DirectionalVerdict;
export type Priority={score:number;reasons:string[]};
export type Candidate={id:string;relationId:string;subject:string;object:string;contexts:string[];species:string|null;sourceId:string;sourceUrl:string;
 sentence:string;state:"extracted_candidate";lexicalPolarity:"supporting"|"opposing"|"uncertain";polarity:"supporting"|"opposing"|"uncertain";
 polarityBasis:"not_assessed"|"two_model_challenge";direction:"not_assessed"|"positive"|"negative"|"none"|"association_only"|"unresolved";priority:Priority;verification:"not_run"|"agree_directional"|"agree_association_only"|"disputed"|"insufficient_abstain"|"check_failed";verdicts:VerifierVerdict[];retraction:LiveEvidenceRecord["retraction"]};
export type VerifierSlot={verifierId:string;modelId:string;runner:ModelRunner;/** Provider behind the runner. Defaults to verifierId. */providerId?:string};
export type LiveRunInput={scenario:LiveScenario;fetcher?:FetchLike;now?:()=>string;signal?:AbortSignal;mailto?:string;
 verifiers?:readonly [VerifierSlot,VerifierSlot]|null;/** Hypotheses are skipped when the run has already used this many ms. Default 15000. */hypothesisBeforeMs?:number;verifierReason?:string;budget?:Budget;perSearch?:number;maxVerified?:number};

const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const has=(text:string,terms:readonly string[])=>terms.some(t=>new RegExp("(^|[^A-Za-z0-9])"+esc(t)+"($|[^A-Za-z0-9])","i").test(text));
const OPPOSE=/\b(no (significant |statistically significant )?(effect|association|difference|change|correlation)|did not|does not|failed to|not (associated|elevated|increased|required)|unchanged|independent of)\b/i;
const SUPPORT=/\b(increase[ds]?|elevated|higher|promote[ds]?|induce[ds]?|drive[ns]?|enhance[ds]?|associated with|correlat(e|ed|es) with|expand(s|ed)?|required for|contribute[ds]? to)\b/i;
const species=(t:string)=>/\b(mice|mouse|murine)\b/i.test(t)?"mouse":/\b(patients?|human|humans)\b/i.test(t)?"human":null;
const sentences=(t:string)=>t.split(/(?<=[.!?])\s+(?=[A-Z0-9(])/).map(s=>s.trim()).filter(s=>s.length>=30&&s.length<=700);
const digest=(v:unknown)=>createHash("sha256").update(JSON.stringify(v)).digest("hex");
const safeErr=(e:unknown)=>(e instanceof Error?e.message:"failed").replace(/https?:\/\/\S+/g,"[url]").slice(0,120);

const firstAt=(text:string,terms:readonly string[])=>{let best=-1;for(const t of terms){const m=new RegExp("(^|[^A-Za-z0-9])"+esc(t)+"($|[^A-Za-z0-9])","i").exec(text);if(m){const i=m.index+(m[1]?.length??0);if(best<0||i<best)best=i}}return best};
/** Deterministic and explainable: which sentences are worth a (paid) model check first. It never decides a finding. */
export function priorityOf(i:{sentence:string;fromTitle:boolean;a:readonly string[];b:readonly string[];namesContext:boolean;anyContext:boolean;species:string|null;retracted:boolean}):Priority{
 const reasons:string[]=[];let score=0;const add=(n:number,r:string)=>{score+=n;reasons.push(r)};
 if(i.retracted)return {score:-100,reasons:["The provider flags this record as retracted; it is never sent for checking"]};
 if(OPPOSE.test(i.sentence)||SUPPORT.test(i.sentence))add(3,"States an effect or direction");
 const d=Math.abs(firstAt(i.sentence,i.a)-firstAt(i.sentence,i.b));
 if(d<=80)add(2,"Both concepts close together");else if(d<=160)add(1,"Both concepts in the same stretch");
 if(i.namesContext)add(2,"Names the disease in the sentence");else if(!i.anyContext)add(-1,"No disease context found");
 if(i.fromTitle)add(-2,"Title only, no results text");
 if(i.species)add(1,"States species or participants");
 if(i.sentence.length>=80&&i.sentence.length<=400)add(1,"A full sentence of findings");
 return {score,reasons};
}
export function extractCandidates(records:readonly LiveEvidenceRecord[],s:LiveScenario,max=24):Candidate[]{
 const ent=new Map(s.entities.map(e=>[e.key,e]));const found=new Map<string,Candidate>();
 for(const r of records){
  const whole=r.title+". "+(r.abstract??"");
  const recordCtx=s.contexts.filter(c=>has(whole,c.terms)).map(c=>c.key);
  for(const sent of sentences(whole)){
   const inSentence=s.contexts.filter(c=>has(sent,c.terms)).map(c=>c.key);
   for(const rel of s.relations){
    const a=ent.get(rel.subject)!,b=ent.get(rel.object)!;
    if(!has(sent,a.terms)||!has(sent,b.terms))continue;
    const lex=OPPOSE.test(sent)?"opposing":SUPPORT.test(sent)?"supporting":"uncertain";
    const ctx=[...new Set([...inSentence,...recordCtx])];
    const sp=species(sent)??species(whole);
    const c:Candidate={id:"c"+digest([r.sourceId,rel.id,sent]).slice(0,12),relationId:rel.id,subject:a.label,object:b.label,contexts:ctx,species:sp,sourceId:r.sourceId,sourceUrl:r.sourceUrl,
     sentence:sent,state:"extracted_candidate",lexicalPolarity:lex,polarity:"uncertain",polarityBasis:"not_assessed",direction:"not_assessed",
     priority:priorityOf({sentence:sent,fromTitle:r.title.includes(sent.replace(/[.!?]$/,"")),a:a.terms,b:b.terms,namesContext:inSentence.length>0,anyContext:ctx.length>0,species:sp,retracted:r.retraction==="flagged"}),
     verification:"not_run",verdicts:[],retraction:r.retraction};
    // One sentence per paper and relationship, so a paper cannot use up several checks.
    const key=r.sourceId+"|"+rel.id,prev=found.get(key);
    if(!prev||c.priority.score>prev.priority.score)found.set(key,c);
   }
  }
 }
 const ranked=[...found.values()].sort((x,y)=>y.priority.score-x.priority.score||x.id.localeCompare(y.id));
 // Best first within each disease context, then interleave contexts so none crowds out the others.
 const buckets=new Map<string,Candidate[]>();
 for(const c of ranked){const k=c.contexts[0]??"none";(buckets.get(k)??buckets.set(k,[]).get(k)!).push(c)}
 const picked:Candidate[]=[];
 for(let i=0;picked.length<max&&[...buckets.values()].some(b=>i<b.length);i++)for(const b of buckets.values())if(i<b.length&&picked.length<max)picked.push(b[i]!);
 return picked;
}
function dedupe(rs:LiveEvidenceRecord[]){
 const seen=new Set<string>(),out:LiveEvidenceRecord[]=[];
 for(const r of rs){const k=r.doi?.toLowerCase()??(r.pmid?"pmid:"+r.pmid:r.sourceId);if(seen.has(k))continue;seen.add(k);out.push(r)}
 return out;
}
export async function runLiveInvestigation(input:LiveRunInput){
 const t0=Date.now(),s=input.scenario,now=input.now??(()=>new Date().toISOString()),f=input.fetcher??fetch,events:RunEvent[]=[];
 const ev=(stage:RunEvent["stage"],status:RunEvent["status"],detail:string)=>events.push({stage,at:now(),status,detail});
 if(!rejectPhiPayload({textBlobs:[s.question]}).ok||s.question.length>500)throw Error("Invalid investigation question");
 ev("scoped","ok",`${s.entities.length} entities, ${s.contexts.length} disease contexts, ${s.relations.length} relationships to examine (scenario record ${s.id}).`);
 const per=input.perSearch??8,searches:SearchOutcome[]=[],all:LiveEvidenceRecord[]=[];
 const jobs=s.contexts.flatMap(c=>{
  const subj=s.entities.find(e=>e.key==="il21"||e.key===s.relations[0]!.subject)!;
  const q=`("${subj.terms[0]}" OR "${subj.terms[1]??subj.terms[0]}") AND (${c.terms.map(t=>`"${t}"`).join(" OR ")})`;
  const oa=`${subj.terms[0]} ${c.terms[0]}`;
  return [
   {provider:"europe-pmc",context:c.key,query:q,run:()=>searchEuropePmc(q,per,f,now)},
   {provider:"openalex",context:c.key,query:oa,run:()=>searchOpenAlex(oa,per,f,now,{mailto:input.mailto})}
  ];
 });
 const settled=await Promise.allSettled(jobs.map(j=>{if(input.signal?.aborted)throw Error("cancelled");return j.run()}));
 settled.forEach((r,i)=>{
  const j=jobs[i]!;
  if(r.status==="fulfilled"){searches.push({provider:j.provider,context:j.context,status:"ok",count:r.value.length,error:null,query:j.query});all.push(...r.value.map(x=>({...x,__ctx:j.context}) as LiveEvidenceRecord))}
  else searches.push({provider:j.provider,context:j.context,status:"failed",count:0,error:safeErr(r.reason),query:j.query});
 });
 const failed=searches.filter(x=>x.status==="failed").length;
 ev("searched",failed===0?"ok":failed===searches.length?"failed":"partial",`${searches.length-failed} of ${searches.length} literature searches returned; ${failed} failed.`);
 const records=dedupe(all);
 ev("retrieved",records.length?"ok":"failed",`${records.length} unique records after de-duplication by DOI/PMID; ${records.filter(r=>r.abstract).length} include an abstract.`);
 // Open Targets: association scores only. They are not causality.
 const targets:{context:string;disease:string|null;rows:{symbol:string;score:number}[];error:string|null}[]=[];
 for(const c of s.contexts){
  if(!c.openTargetsId)continue;
  try{
   const rs=await openTargetsAdapter(f as never).search([c.openTargetsId],10);
   targets.push({context:c.key,disease:(rs[0]?.metadata.diseaseName as string|null)??null,rows:rs.map(r=>({symbol:String(r.metadata.targetSymbol??""),score:Number(r.metadata.associationScore)})).filter(r=>r.symbol),error:null});
  }catch(e){targets.push({context:c.key,disease:null,rows:[],error:safeErr(e)})}
 }
 ev("mapped",targets.some(t=>t.error)?"partial":"ok",`Entities scoped from the scenario record; Open Targets disease associations read for ${targets.filter(t=>!t.error).length} of ${targets.length} contexts. Ontology identifiers were not independently verified.`);
 const candidates=extractCandidates(records,s);
 ev("compared",candidates.length?"ok":"partial",`${candidates.length} sentence-level candidates where two scenario entities co-occur. Direction is not assessed until the model challenge runs; a keyword hint is kept but never used as a finding.`);
 // Independent challenge: two separately injected models, each shown the exact sentence as untrusted data.
 let verification:{status:"not_configured"|"completed"|"partial"|"failed";reason:string|null;checked:number;independence:"independent_execution_only"|"separate_providers_unverified"|null};
 const v=input.verifiers;
 if(!v){verification={status:"not_configured",reason:input.verifierReason??"Two distinct model providers are not configured.",checked:0,independence:null};ev("challenged","skipped",verification.reason!)}
 else{
  let checked=0,errors=0;
  const toCheck=candidates.filter(c=>c.priority.score>0).slice(0,input.maxVerified??6);
  for(const c of toCheck){
   if(input.signal?.aborted)break;
   const ctxLabel=c.contexts.map(k=>s.contexts.find(x=>x.key===k)?.label).filter(Boolean).join(", ");
   const res=await Promise.allSettled(v.map(x=>runDirectionalChallenge({subject:c.subject,object:c.object,context:ctxLabel,passage:c.sentence,sourceId:c.sourceId},x.verifierId,x.modelId,x.runner)));
   res.forEach((r,i)=>{
    const slot=v[i]!;
    if(r.status==="fulfilled")c.verdicts.push(r.value);
    else{errors++;c.verdicts.push({verifier:slot.verifierId,model:slot.modelId,direction:"not_assessed",evidenceSpan:null,reason:safeErr(r.reason)})}
   });
   const combined=combineDirections(c.verdicts);
   c.direction=combined.direction;c.verification=combined.verification;c.polarity=combined.polarity;c.polarityBasis="two_model_challenge";
   checked++;
  }
  const distinct=(v[0].providerId??v[0].verifierId)!==(v[1].providerId??v[1].verifierId);
  verification={status:errors?"partial":"completed",reason:null,checked,independence:distinct?"separate_providers_unverified":"independent_execution_only"};
  ev("challenged",errors?"partial":"ok",`${checked} highest-priority candidates (of ${candidates.length}) checked by two models for direction; agreement is not scientific proof. ${errors} model calls failed.`);
 }
 // Hypotheses: only from findings both checks agreed on, by one model and challenged by the other. Unvalidated.
 let hypotheses:HypothesisOutcome;
 if(!v){hypotheses={status:"not_configured",reason:"Hypotheses need the two-model check, which did not run.",items:[],dropped:0,basis:{findings:0}};ev("hypothesised","skipped",hypotheses.reason!)}
 else if(Date.now()-t0>(input.hypothesisBeforeMs??15000)||input.signal?.aborted){hypotheses={status:"skipped_time",reason:"The run had little time left, so hypotheses were skipped to stay within the request limit.",items:[],dropped:0,basis:{findings:0}};ev("hypothesised","skipped",hypotheses.reason!)}
 else{
  const recs=new Map(records.map(r=>[r.sourceId,r]));
  const findings=findingsFor(candidates,id=>recs.get(id)?.title??id,id=>recs.get(id)?.publicationDate?.slice(0,4)??"n.d.",k=>s.contexts.find(c=>c.key===k)?.label??k);
  hypotheses=await proposeHypotheses({findings,gen:v[0],critic:v[1],shouldStop:()=>!!input.signal?.aborted});
  ev("hypothesised",hypotheses.status==="generated"?"ok":hypotheses.status==="failed"?"failed":"skipped",hypotheses.status==="generated"?`${hypotheses.items.length} unvalidated hypotheses proposed from ${findings.length} agreed findings; ${hypotheses.items.filter(h=>h.challenge).length} challenged by the second model.`:(hypotheses.reason??hypotheses.status));
 }
 const byContext=Object.fromEntries(s.contexts.map(c=>[c.key,{label:c.label,records:records.filter(r=>(r as any).__ctx===c.key).length,
  supporting:candidates.filter(x=>x.contexts.includes(c.key)&&x.polarity==="supporting").map(x=>x.id),
  opposing:candidates.filter(x=>x.contexts.includes(c.key)&&x.polarity==="opposing").map(x=>x.id),
  uncertain:candidates.filter(x=>x.contexts.includes(c.key)&&x.polarity==="uncertain").map(x=>x.id)}]));
 const contextLabels=Object.fromEntries(s.contexts.map(c=>[c.key,c.label]));
 const structuredComparison=buildLiveStructuredComparison({candidates,contextLabels});
 const gaps=[
  ...searches.filter(x=>x.status==="failed").map(x=>`Search failed: ${x.provider} for ${x.context} (${x.error}). Absence of results there is not evidence of absence.`),
  ...s.contexts.filter(c=>!candidates.some(x=>x.contexts.includes(c.key))).map(c=>`No candidate sentence was found for ${c.label} in the retrieved abstracts. This is a limit of this retrieval, not a finding.`),
  ...(verification.status==="not_configured"?[]:s.contexts.filter(c=>!candidates.some(x=>x.contexts.includes(c.key)&&x.polarity==="opposing")).map(c=>`No opposing finding was identified for ${c.label} in these sources. This does not establish consensus.`)),
  ...(verification.status==="not_configured"?["Supporting and opposing directions were not assessed. A dedicated search for opposing evidence was not run."]:[]),
  ...(verification.status==="not_configured"?["The independent model challenge did not run, so no claim direction is assessed."]:[]),
  "Abstract-level evidence only: no full text, passage rights or retraction status beyond provider flags were checked.",
  "Hypotheses are model proposals, unvalidated and unreviewed. They are not findings and not recommendations.",
  "Structured comparison uses coarse declared context only; potential_contradiction is not a proven contradiction and requires human review.",
 ];
 const body={schemaVersion:"hsi-live-investigation-1" as const,mode:"live" as const,scenarioId:s.id,question:s.question,version:1,
  entities:s.entities.map(e=>e.label),searches,records:records.map(r=>{const {__ctx,abstract,...rest}=r as any;/* Abstracts are used for extraction only and are not redistributed in the brief; licence not assessed. */return {...rest,hasAbstract:!!abstract}}),targets,candidates,byContext,verification,hypotheses,structuredComparison,gaps,
  budget:input.budget?.usage()??null,
  flags:{scientificApproval:false as const,graphPromotable:false as const,consensusEstablished:false as const,humanReview:"required" as const,clinicalAdvice:false as const,containsPhi:false as const}};
 ev("brief","ok",`Brief assembled: ${candidates.length} candidates, ${structuredComparison.pairCount} structured comparison pairs, ${gaps.length} stated gaps.`);
 const brief={...body,events};
 return {...brief,briefHash:digest({...body,events:events.map(e=>[e.stage,e.status])})};
}
export type LiveInvestigation=Awaited<ReturnType<typeof runLiveInvestigation>>;
export {renderLiveBriefMarkdown} from "./liveBrief";
