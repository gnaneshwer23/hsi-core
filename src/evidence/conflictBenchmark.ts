/**
 * Conflict benchmark (HSI-BENCH-CONFLICT). Measures the claim HSI is built on: that it can tell a true contradiction
 * from a difference in biological context and from a disagreement whose context is not reported.
 *
 * Experts label each case blind. HSI's context-conflict classifier labels the same records. Other tools (for example
 * Scite, Elicit or a general chatbot) are run by hand on the same cases and their answers recorded as predictions.
 * Every system is scored against the expert reference label.
 *
 * Rules this module enforces:
 * - Expert labels are never generated here. With too few expert-curated reference cases the report says so.
 * - Synthetic fixture cases exist to test the harness. They are never mixed with expert cases and never publishable.
 * - Reports carry aggregate metrics and case identifiers only, never case content or reference labels.
 */
import type {DomainBundle,DomainEdge,DomainModel} from "../knowledgeGraph/domainGraph";
import {DOMAIN_MODELS} from "../knowledgeGraph/domainGraph";
import {breakdownForPair} from "../knowledgeGraph/contextBreakdown";
import {assessConflict,type ConflictClass} from "../knowledgeGraph/contextConflict";

export const CONFLICT_LABELS=["true_contradiction","context_dependent","insufficient_context","no_disagreement"] as const;
export type ConflictLabel=(typeof CONFLICT_LABELS)[number];

/** How HSI's classifier output maps onto the expert label set. */
export const CLASS_TO_LABEL:Readonly<Record<ConflictClass,ConflictLabel>>=Object.freeze({
 same_context_disagreement:"true_contradiction",
 context_separated_disagreement:"context_dependent",
 disagreement_context_unknown:"insufficient_context",
 no_disagreement:"no_disagreement",
});

export type CaseRecord={sourceId:string;citation:string;model:DomainModel;tissue:string|null;population:string|null;design:string|null;negated:boolean};
export type RaterLabel={raterId:string;label:ConflictLabel};
export type ConflictCase={
 id:string;question:string;provenance:"expert_curated"|"synthetic_fixture";
 records:CaseRecord[];labels:RaterLabel[];adjudicated:ConflictLabel|null;
};
export type SystemPredictions={system:string;method:string;predictions:{caseId:string;label:ConflictLabel|"no_answer"}[]};

export const PROTOCOL=Object.freeze({
 benchmark:"HSI-BENCH-CONFLICT",version:"1.0.0",
 minimumReferenceCases:50,minimumKappa:0.6,
 /** Proposed floors. They bind only once the owner approves them, and must be fixed before the first scored run. */
 proposedFloors:{accuracy:0.8,trueContradictionRecall:0.7,insufficientContextRecall:0.9},
 floorsOwnerApproved:false,
});

const ID=/^[A-Za-z0-9._-]{1,80}$/;
const fail=(why:string):never=>{throw Error(`Invalid conflict case: ${why}`)};
const str=(v:unknown,max=2000):v is string=>typeof v==="string"&&v.trim().length>0&&v.length<=max;
const strOrNull=(v:unknown)=>v===null||str(v,300);
const isLabel=(v:unknown):v is ConflictLabel=>CONFLICT_LABELS.includes(v as ConflictLabel);
const keys=(o:object,want:string[])=>Object.keys(o).sort().join("|")===[...want].sort().join("|");

export function parseConflictCase(value:unknown):ConflictCase{
 if(!value||typeof value!=="object"||Array.isArray(value))fail("not an object");
 const c=value as Record<string,unknown>;
 if(!keys(c,["id","question","provenance","records","labels","adjudicated"]))fail("unexpected or missing fields");
 if(!str(c.id,80)||!ID.test(c.id))fail("id");
 if(!str(c.question))fail(`question (${c.id})`);
 if(c.provenance!=="expert_curated"&&c.provenance!=="synthetic_fixture")fail(`provenance (${c.id})`);
 if(!Array.isArray(c.records)||c.records.length<1||c.records.length>40)fail(`records (${c.id})`);
 const records=(c.records as unknown[]).map(r=>{
  if(!r||typeof r!=="object"||!keys(r,["sourceId","citation","model","tissue","population","design","negated"]))fail(`record fields (${c.id})`);
  const x=r as Record<string,unknown>;
  if(!str(x.sourceId,120)||!str(x.citation,500)||!DOMAIN_MODELS.includes(x.model as DomainModel)||!strOrNull(x.tissue)||!strOrNull(x.population)||!strOrNull(x.design)||typeof x.negated!=="boolean")fail(`record values (${c.id})`);
  return x as CaseRecord;
 });
 if(!Array.isArray(c.labels)||c.labels.length>5)fail(`labels (${c.id})`);
 const labels=(c.labels as unknown[]).map(l=>{
  if(!l||typeof l!=="object"||!keys(l,["raterId","label"]))fail(`label fields (${c.id})`);
  const x=l as Record<string,unknown>;
  if(!str(x.raterId,80)||!isLabel(x.label))fail(`label values (${c.id})`);
  return x as RaterLabel;
 });
 if(new Set(labels.map(l=>l.raterId)).size!==labels.length)fail(`a rater labelled twice (${c.id})`);
 if(!(c.adjudicated===null||isLabel(c.adjudicated)))fail(`adjudicated (${c.id})`);
 if(c.provenance==="expert_curated"&&labels.length<2&&c.adjudicated===null)fail(`expert case needs two blind labels or an adjudicated label (${c.id})`);
 return {id:c.id as string,question:c.question as string,provenance:c.provenance as ConflictCase["provenance"],records,labels,adjudicated:c.adjudicated as ConflictLabel|null};
}

/** The reference label: the adjudicated label, else the label every rater agreed on, else none (needs adjudication). */
export function referenceLabel(c:ConflictCase):ConflictLabel|null{
 if(c.adjudicated)return c.adjudicated;
 const set=new Set(c.labels.map(l=>l.label));
 return c.labels.length>=2&&set.size===1?c.labels[0]!.label:null;
}

/** Runs HSI's own context-conflict classifier on a case's records. Deterministic; no network, no model. */
export function classifyWithHsi(c:ConflictCase):ConflictLabel{
 const a="case:subject",b="case:object";
 const edges:DomainEdge[]=c.records.map((r,i)=>({
  id:`${c.id}-r${i}`,subjectId:a,objectId:b,predicate:"associated_with",kind:"source_candidate",sourceId:r.sourceId,
  assertion:c.question,domains:[],conditions:[],model:r.model,design:r.design??"unspecified design",tissue:r.tissue,population:r.population,
  assay:null,timepoint:null,intervention:null,outcome:null,limitations:"",contextStatus:"editorial_annotation_pending_source_verification",
  negated:r.negated,scopeWarnings:[],reviewStatus:"unreviewed",confidence:"not_calibrated",scientificClaimAllowed:false,
 }));
 const g={version:"conflict-benchmark",nodes:[{id:a,name:"subject",kind:"concept",aliases:[],domains:[]},{id:b,name:"object",kind:"concept",aliases:[],domains:[]}],edges} as unknown as DomainBundle;
 return CLASS_TO_LABEL[assessConflict(breakdownForPair(g,a,b)).classification];
}

/** Cohen's kappa for the first two raters on each case that has at least two labels. Null when undefined. */
export function cohensKappa(cases:readonly ConflictCase[]):{kappa:number|null;pairs:number}{
 const pairs=cases.filter(c=>c.labels.length>=2).map(c=>[c.labels[0]!.label,c.labels[1]!.label] as const);
 if(pairs.length===0)return {kappa:null,pairs:0};
 const n=pairs.length,po=pairs.filter(([x,y])=>x===y).length/n;
 const pe=CONFLICT_LABELS.reduce((s,l)=>s+(pairs.filter(([x])=>x===l).length/n)*(pairs.filter(([,y])=>y===l).length/n),0);
 return {kappa:pe===1?null:(po-pe)/(1-pe),pairs:n};
}

type Confusion=Record<ConflictLabel,Record<ConflictLabel|"no_answer",number>>;
export type SystemScore={
 system:string;method:string;answered:number;scored:number;accuracy:number|null;
 recall:Record<ConflictLabel,number|null>;precision:Record<ConflictLabel,number|null>;confusion:Confusion;
};

function scoreSystem(system:string,method:string,gold:Map<string,ConflictLabel>,pred:Map<string,ConflictLabel|"no_answer">):SystemScore{
 const confusion=Object.fromEntries(CONFLICT_LABELS.map(t=>[t,Object.fromEntries([...CONFLICT_LABELS,"no_answer"].map(p=>[p,0]))])) as Confusion;
 let correct=0,answered=0;
 for(const [id,truth] of gold){const p=pred.get(id)??"no_answer";confusion[truth][p]++;if(p!=="no_answer")answered++;if(p===truth)correct++}
 const ratio=(a:number,b:number)=>b===0?null:a/b;
 const recall=Object.fromEntries(CONFLICT_LABELS.map(l=>[l,ratio(confusion[l][l],Object.values(confusion[l]).reduce((s,v)=>s+v,0))])) as Record<ConflictLabel,number|null>;
 const precision=Object.fromEntries(CONFLICT_LABELS.map(l=>[l,ratio(confusion[l][l],CONFLICT_LABELS.reduce((s,t)=>s+confusion[t][l],0))])) as Record<ConflictLabel,number|null>;
 return {system,method,answered,scored:gold.size,accuracy:ratio(correct,gold.size),recall,precision,confusion};
}

export type ConflictBenchmarkReport={
 benchmark:string;version:string;provenance:"expert_curated"|"synthetic_fixture";
 status:"harness_only"|"insufficient_reference_cases"|"rater_agreement_too_low"|"ready";
 publishable:boolean;
 cases:{total:number;withReference:number;awaitingAdjudication:string[]};
 raterAgreement:{kappa:number|null;pairs:number;minimum:number};
 systems:SystemScore[];
 floors:{proposed:typeof PROTOCOL.proposedFloors;ownerApproved:boolean;hsiMeetsProposed:boolean|null};
 notes:string[];
};

export function runConflictBenchmark(cases:readonly ConflictCase[],external:readonly SystemPredictions[]=[]):ConflictBenchmarkReport{
 if(cases.length===0)throw Error("No cases supplied");
 const kinds=new Set(cases.map(c=>c.provenance));
 if(kinds.size>1)throw Error("Expert-curated and synthetic fixture cases cannot be scored together");
 if(new Set(cases.map(c=>c.id)).size!==cases.length)throw Error("Duplicate case id");
 const provenance=cases[0]!.provenance;
 const gold=new Map<string,ConflictLabel>();const awaiting:string[]=[];
 for(const c of cases){const r=referenceLabel(c);if(r)gold.set(c.id,r);else awaiting.push(c.id)}
 const known=new Set(cases.map(c=>c.id));
 const systems=[scoreSystem("HSI context-conflict classifier","deterministic, records only",gold,new Map(cases.map(c=>[c.id,classifyWithHsi(c)])))];
 for(const s of external){
  for(const p of s.predictions){if(!known.has(p.caseId))throw Error(`${s.system}: prediction for unknown case ${p.caseId}`);if(!(p.label==="no_answer"||isLabel(p.label)))throw Error(`${s.system}: bad label for ${p.caseId}`)}
  systems.push(scoreSystem(s.system,s.method,gold,new Map(s.predictions.map(p=>[p.caseId,p.label]))));
 }
 const {kappa,pairs}=cohensKappa(cases);
 const status:ConflictBenchmarkReport["status"]=provenance==="synthetic_fixture"?"harness_only"
  :gold.size<PROTOCOL.minimumReferenceCases?"insufficient_reference_cases"
  :kappa===null||kappa<PROTOCOL.minimumKappa?"rater_agreement_too_low":"ready";
 const hsi=systems[0]!,f=PROTOCOL.proposedFloors;
 const meets=hsi.accuracy===null?null:hsi.accuracy>=f.accuracy&&(hsi.recall.true_contradiction??0)>=f.trueContradictionRecall&&(hsi.recall.insufficient_context??0)>=f.insufficientContextRecall;
 const notes=[
  "HSI is scored on the context fields recorded for each case. It does not read the papers in this benchmark.",
  "Reference labels come from blind expert raters; disagreements without an adjudicated label are excluded and listed.",
 ];
 if(status==="harness_only")notes.unshift("Synthetic fixture cases: this report tests the harness and says nothing about scientific accuracy.");
 if(status==="insufficient_reference_cases")notes.unshift(`Only ${gold.size} of the ${PROTOCOL.minimumReferenceCases} reference cases needed. Do not publish these numbers as a result.`);
 if(status==="rater_agreement_too_low")notes.unshift(`Rater agreement (kappa ${kappa===null?"undefined":kappa.toFixed(2)}) is below ${PROTOCOL.minimumKappa}. Fix the labelling guidelines before scoring.`);
 if(!PROTOCOL.floorsOwnerApproved)notes.push("Floors are proposed and not yet approved by the scientific release owner.");
 return {benchmark:PROTOCOL.benchmark,version:PROTOCOL.version,provenance,status,publishable:status==="ready"&&PROTOCOL.floorsOwnerApproved,
  cases:{total:cases.length,withReference:gold.size,awaitingAdjudication:awaiting},
  raterAgreement:{kappa,pairs,minimum:PROTOCOL.minimumKappa},systems,
  floors:{proposed:f,ownerApproved:PROTOCOL.floorsOwnerApproved,hsiMeetsProposed:meets},notes};
}

export const EXAMPLE_HARNESS_FOCI=["species","tissue","endpoint_or_method","dose","population","true_contradiction","apparent_conflict","no_disagreement"] as const;
export type ExampleHarnessFocus=(typeof EXAMPLE_HARNESS_FOCI)[number];
export type ExampleHarnessRow={id:string;focus:ExampleHarnessFocus;expected:ConflictLabel;classifier:ConflictLabel;match:boolean};

/** Local Example rows. Labels are harness expectations, not expert adjudication and not a published score. */
export function exampleHarnessRows(cases:readonly ConflictCase[],focusById:Readonly<Record<string,string>>):ExampleHarnessRow[]{
 if(cases.length===0)throw Error("No example cases supplied");
 if(cases.some(c=>c.provenance!=="synthetic_fixture"))throw Error("Example harness refuses non-synthetic provenance");
 const rows=cases.map(c=>{
  const focus=focusById[c.id];
  if(!EXAMPLE_HARNESS_FOCI.includes(focus as ExampleHarnessFocus))throw Error(`Example case ${c.id} has no harness focus`);
  if(!c.question.includes("EXAMPLE")||!c.question.includes("harness_only"))throw Error(`Example case ${c.id} must say EXAMPLE and harness_only`);
  const expected=referenceLabel(c);
  if(!expected)throw Error(`Example case ${c.id} needs an agreed expected label`);
  const classifier=classifyWithHsi(c);
  return {id:c.id,focus:focus as ExampleHarnessFocus,expected,classifier,match:classifier===expected};
 });
 const seen=new Set(rows.map(r=>r.focus));
 for(const focus of EXAMPLE_HARNESS_FOCI)if(!seen.has(focus))throw Error(`Example harness is missing focus ${focus}`);
 if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error("Duplicate example case id");
 return rows;
}

/** Case listing for a local run. No accuracy figure: this is not a scientific result. */
export function renderExampleHarnessReport(rows:readonly ExampleHarnessRow[]):string{
 const body=rows.map(r=>`| ${r.id} | ${r.focus} | ${r.expected} | ${r.classifier} | ${r.match?"yes":"no"} |`);
 return [
  "# HSI-BENCH-CONFLICT example harness",
  "",
  "Status: **harness_only**. Publishable: **no**. Label: **Example**. Provenance: synthetic_fixture.",
  "These rows check the harness against agreed Example labels. This listing is not a scientific result.",
  "",
  "| Case | Focus | Expected label | Classifier label | Match |",
  "| --- | --- | --- | --- | --- |",
  ...body,
  "",
 ].join("\n");
}

const pct=(v:number|null)=>v===null?"n/a":`${(v*100).toFixed(0)}%`;
export function renderConflictReport(r:ConflictBenchmarkReport):string{
 const rows=r.systems.map(s=>`| ${s.system} | ${s.answered}/${s.scored} | ${pct(s.accuracy)} | ${pct(s.recall.true_contradiction)} | ${pct(s.recall.context_dependent)} | ${pct(s.recall.insufficient_context)} | ${pct(s.recall.no_disagreement)} |`);
 return [`# ${r.benchmark} v${r.version} report`,"",`Status: **${r.status}** · Publishable: **${r.publishable?"yes":"no"}** · Provenance: ${r.provenance}`,"",
  ...r.notes.map(n=>`- ${n}`),"",
  `Cases: ${r.cases.total} total, ${r.cases.withReference} with a reference label, ${r.cases.awaitingAdjudication.length} awaiting adjudication.`,
  `Rater agreement: kappa ${r.raterAgreement.kappa===null?"n/a":r.raterAgreement.kappa.toFixed(2)} over ${r.raterAgreement.pairs} double-labelled cases (minimum ${r.raterAgreement.minimum}).`,"",
  "| System | Answered | Accuracy | Recall: true contradiction | Recall: context-dependent | Recall: insufficient context | Recall: no disagreement |",
  "| --- | --- | --- | --- | --- | --- | --- |",...rows,""].join("\n");
}
