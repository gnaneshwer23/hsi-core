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
import {runModelEntailment} from "../researchV2/modelEntailment";
import type {EntailmentModelRunner} from "../researchV2/modelEntailment";
import type {EvidenceClaim} from "../researchV2/passageVerification";
import type {Budget} from "../modelProviders";

export type LiveScenario={schemaVersion:"hsi-live-scenario-1";id:string;title:string;question:string;
 entities:{key:string;label:string;terms:string[]}[];relations:{id:string;subject:string;object:string}[];
 contexts:{key:string;label:string;terms:string[];openTargetsId?:string}[]};
export type RunEvent={stage:"scoped"|"searched"|"retrieved"|"mapped"|"compared"|"challenged"|"brief";at:string;status:"ok"|"partial"|"failed"|"skipped";detail:string};
export type SearchOutcome={provider:string;context:string;status:"ok"|"failed";count:number;error:string|null;query:string};
export type VerifierVerdict={verifier:string;model:string;verdict:"supports"|"contradicts"|"insufficient"|"not_assessed";evidenceSpan:string|null;reason:string};
export type Candidate={id:string;relationId:string;subject:string;object:string;contexts:string[];species:string|null;sourceId:string;sourceUrl:string;
 sentence:string;state:"extracted_candidate";lexicalPolarity:"supporting"|"opposing"|"uncertain";polarity:"supporting"|"opposing"|"uncertain";
 polarityBasis:"not_assessed"|"two_model_challenge";verification:"not_run"|"both_support"|"disputed"|"insufficient_abstain"|"check_failed";verdicts:VerifierVerdict[];retraction:LiveEvidenceRecord["retraction"]};
export type VerifierSlot={verifierId:string;modelId:string;runner:EntailmentModelRunner};
export type LiveRunInput={scenario:LiveScenario;fetcher?:FetchLike;now?:()=>string;signal?:AbortSignal;mailto?:string;
 verifiers?:readonly [VerifierSlot,VerifierSlot]|null;verifierReason?:string;budget?:Budget;perSearch?:number;maxVerified?:number};

const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const has=(text:string,terms:readonly string[])=>terms.some(t=>new RegExp("(^|[^A-Za-z0-9])"+esc(t)+"($|[^A-Za-z0-9])","i").test(text));
const OPPOSE=/\b(no (significant |statistically significant )?(effect|association|difference|change|correlation)|did not|does not|failed to|not (associated|elevated|increased|required)|unchanged|independent of)\b/i;
const SUPPORT=/\b(increase[ds]?|elevated|higher|promote[ds]?|induce[ds]?|drive[ns]?|enhance[ds]?|associated with|correlat(e|ed|es) with|expand(s|ed)?|required for|contribute[ds]? to)\b/i;
const species=(t:string)=>/\b(mice|mouse|murine)\b/i.test(t)?"mouse":/\b(patients?|human|humans)\b/i.test(t)?"human":null;
const sentences=(t:string)=>t.split(/(?<=[.!?])\s+(?=[A-Z0-9(])/).map(s=>s.trim()).filter(s=>s.length>=30&&s.length<=700);
const digest=(v:unknown)=>createHash("sha256").update(JSON.stringify(v)).digest("hex");
const safeErr=(e:unknown)=>(e instanceof Error?e.message:"failed").replace(/https?:\/\/\S+/g,"[url]").slice(0,120);

export function extractCandidates(records:readonly LiveEvidenceRecord[],s:LiveScenario,max=24):Candidate[]{
 const ent=new Map(s.entities.map(e=>[e.key,e]));const out:Candidate[]=[];
 for(const r of records){
  const whole=r.title+". "+(r.abstract??"");
  const ctx=s.contexts.filter(c=>has(whole,c.terms)).map(c=>c.key);
  for(const sent of sentences(whole)){
   for(const rel of s.relations){
    const a=ent.get(rel.subject)!,b=ent.get(rel.object)!;
    if(!has(sent,a.terms)||!has(sent,b.terms))continue;
    const lex=OPPOSE.test(sent)?"opposing":SUPPORT.test(sent)?"supporting":"uncertain";
    out.push({id:"c"+digest([r.sourceId,rel.id,sent]).slice(0,12),relationId:rel.id,subject:a.label,object:b.label,contexts:ctx,species:species(sent)??species(whole),sourceId:r.sourceId,sourceUrl:r.sourceUrl,
     sentence:sent,state:"extracted_candidate",lexicalPolarity:lex,polarity:"uncertain",polarityBasis:"not_assessed",verification:"not_run",verdicts:[],retraction:r.retraction});
   }
  }
 }
 // Round-robin across disease contexts so one context cannot fill the cap.
 const buckets=new Map<string,Candidate[]>();
 for(const c of out){const k=c.contexts[0]??"none";(buckets.get(k)??buckets.set(k,[]).get(k)!).push(c)}
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
 const s=input.scenario,now=input.now??(()=>new Date().toISOString()),f=input.fetcher??fetch,events:RunEvent[]=[];
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
  for(const c of candidates.slice(0,input.maxVerified??6)){
   if(input.signal?.aborted)break;
   const claim:EvidenceClaim={id:c.id,sourceId:c.sourceId,exactQuote:c.sentence,subjectId:c.subject,predicate:"is associated with",objectId:c.object,context:{diseaseIds:c.contexts,species:c.species,tissueId:null,cellId:null,method:null}};
   const res=await Promise.allSettled(v.map(x=>runModelEntailment({claim,passage:c.sentence,sourceId:c.sourceId},x.verifierId,x.modelId,x.runner)));
   res.forEach((r,i)=>{
    const slot=v[i]!;
    if(r.status==="fulfilled")c.verdicts.push({verifier:slot.verifierId,model:slot.modelId,verdict:r.value.verdict,evidenceSpan:r.value.evidenceSpan,reason:r.value.reason});
    else{errors++;c.verdicts.push({verifier:slot.verifierId,model:slot.modelId,verdict:"not_assessed",evidenceSpan:null,reason:safeErr(r.reason)})}
   });
   const vs=c.verdicts.map(x=>x.verdict);
   c.verification=vs.includes("not_assessed")?"check_failed":vs.every(x=>x==="supports")?"both_support":vs.includes("contradicts")?"disputed":"insufficient_abstain";
   c.polarityBasis="two_model_challenge";
   c.polarity=c.verification==="both_support"?"supporting":c.verification==="disputed"?"opposing":"uncertain";
   checked++;
  }
  const distinct=v[0].verifierId!==v[1].verifierId;
  verification={status:errors?"partial":"completed",reason:null,checked,independence:distinct?"separate_providers_unverified":"independent_execution_only"};
  ev("challenged",errors?"partial":"ok",`${checked} candidates checked by two models; model agreement is not scientific proof. ${errors} model calls failed.`);
 }
 const byContext=Object.fromEntries(s.contexts.map(c=>[c.key,{label:c.label,records:records.filter(r=>(r as any).__ctx===c.key).length,
  supporting:candidates.filter(x=>x.contexts.includes(c.key)&&x.polarity==="supporting").map(x=>x.id),
  opposing:candidates.filter(x=>x.contexts.includes(c.key)&&x.polarity==="opposing").map(x=>x.id),
  uncertain:candidates.filter(x=>x.contexts.includes(c.key)&&x.polarity==="uncertain").map(x=>x.id)}]));
 const gaps=[
  ...searches.filter(x=>x.status==="failed").map(x=>`Search failed: ${x.provider} for ${x.context} (${x.error}). Absence of results there is not evidence of absence.`),
  ...s.contexts.filter(c=>!candidates.some(x=>x.contexts.includes(c.key))).map(c=>`No candidate sentence was found for ${c.label} in the retrieved abstracts. This is a limit of this retrieval, not a finding.`),
  ...(verification.status==="not_configured"?[]:s.contexts.filter(c=>!candidates.some(x=>x.contexts.includes(c.key)&&x.polarity==="opposing")).map(c=>`No opposing finding was identified for ${c.label} in these sources. This does not establish consensus.`)),
  ...(verification.status==="not_configured"?["Supporting and opposing directions were not assessed. A dedicated search for opposing evidence was not run."]:[]),
  ...(verification.status==="not_configured"?["The independent model challenge did not run, so no claim direction is assessed."]:[]),
  "Abstract-level evidence only: no full text, passage rights or retraction status beyond provider flags were checked.",
  "Mechanistic interpretation and testable hypotheses are not generated in this version."
 ];
 const body={schemaVersion:"hsi-live-investigation-1" as const,mode:"live" as const,scenarioId:s.id,question:s.question,version:1,
  entities:s.entities.map(e=>e.label),searches,records:records.map(r=>{const {__ctx,...rest}=r as any;return rest}),targets,candidates,byContext,verification,gaps,
  budget:input.budget?.usage()??null,
  flags:{scientificApproval:false as const,graphPromotable:false as const,consensusEstablished:false as const,humanReview:"required" as const,clinicalAdvice:false as const,containsPhi:false as const}};
 ev("brief","ok",`Brief assembled: ${candidates.length} candidates, ${gaps.length} stated gaps.`);
 const brief={...body,events};
 return {...brief,briefHash:digest({...body,events:events.map(e=>[e.stage,e.status])})};
}
export type LiveInvestigation=Awaited<ReturnType<typeof runLiveInvestigation>>;
export function renderLiveBriefMarkdown(b:LiveInvestigation){
 const safe=(s:string)=>s.replace(/[<>&`*_\[\]#]/g,c=>"&#"+c.charCodeAt(0)+";").replace(/[\r\n]+/g," ");
 return ["# Live investigation brief (unreviewed)",safe(b.question),`Version ${b.version} · ${b.briefHash.slice(0,16)}`,
  "Candidate-only. Not reviewed, not scientific approval, not graph-promotable, no clinical advice.",
  "## Searches",...b.searches.map(x=>`- ${x.provider} / ${x.context}: ${x.status}, ${x.count} records${x.error?` (${safe(x.error)})`:""}`),
  "## Candidates",...b.candidates.map(c=>`- [${c.polarity}] ${safe(c.subject)} ~ ${safe(c.object)} (${c.contexts.join(", ")||"context not stated"}): ${safe(c.sentence)} ${c.sourceUrl}`),
  "## Missing evidence and limits",...b.gaps.map(g=>"- "+safe(g)),
  "## Execution",...b.events.map(e=>`- ${e.at} ${e.stage}: ${e.status}. ${safe(e.detail)}`)].join("\n");
}
