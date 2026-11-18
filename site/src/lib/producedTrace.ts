/**
 * Pure builders for the “How this was produced” panel.
 * Steps come only from a real run / radar / related-works record — never invented progress.
 */
import type {LiveInvestigation} from "../../../src/investigation/liveRun";
import type {RadarResult} from "../../../src/investigation/radar";
import type {RelatedWorksResult} from "../../../src/evidence/openAlexRelatedWorks";
import type {AskTrace} from "./askClient";

export type ProducedCapabilityLink={id:string;label:string;href:string};
export type ProducedTraceView={
 title:string;
 generatedAt:string|null;
 steps:string[];
 note:string|null;
 capabilities:ProducedCapabilityLink[];
 empty:boolean;
};

const F12:ProducedCapabilityLink={id:"F-12",label:"Live retrieval and verification (engineering status)",href:"/status"};
const PUB:ProducedCapabilityLink={id:"STATUS",label:"Product maturity on /status",href:"/status"};

export type ProducedTraceSource=
 |{kind:"live";run:LiveInvestigation}
 |{kind:"ask";trace:AskTrace;run:LiveInvestigation}
 |{kind:"radar";run:RadarResult;fromCache?:boolean}
 |{kind:"related-works";run:RelatedWorksResult}
 |{kind:"running"}
 |{kind:"none"};

function emptyTrace(reason:string):ProducedTraceView{
 return{title:"How this was produced",generatedAt:null,steps:[reason],note:null,capabilities:[PUB],empty:true};
}

function liveSteps(run:LiveInvestigation):string[]{
 const steps:string[]=[];
 for(const e of run.events){
  const when=typeof e.at==="string"&&e.at.length>=19?e.at.slice(11,19)+" UTC":"";
  steps.push(`${e.stage} · ${e.status}${when?` · ${when}`:""}: ${e.detail}`);
 }
 const failed=run.searches.filter(s=>s.status==="failed");
 const ok=run.searches.filter(s=>s.status==="ok");
 if(run.searches.length)steps.push(`Searches recorded: ${ok.length} ok, ${failed.length} failed across ${new Set(run.searches.map(s=>s.provider)).size} providers.`);
 steps.push(`Verification: ${run.verification.status}${run.verification.reason?` — ${run.verification.reason}`:""}.`);
 if(run.flags.scientificApproval===false)steps.push("Scientific approval: false. Candidates stay unreviewed and are not graph-promotable.");
 return steps;
}

/** Build panel copy from a real record. Fail-closed when there is no run. */
export function buildProducedTrace(source:ProducedTraceSource|null|undefined):ProducedTraceView{
 if(!source||source.kind==="none")return emptyTrace("No run record. Nothing was generated.");
 if(source.kind==="running")return{
  title:"How this was produced",
  generatedAt:null,
  steps:["Running on the server — steps appear when the run record returns. No intermediate progress is invented."],
  note:null,
  capabilities:[F12,PUB],
  empty:false,
 };
 if(source.kind==="live"){
  if(!source.run.events.length)return emptyTrace("The run record has no events.");
  return{
   title:"How this was produced",
   generatedAt:source.run.events[0]?.at??null,
   steps:liveSteps(source.run),
   note:"Steps are taken from the live investigation run record. They are not a progress animation.",
   capabilities:[F12,PUB],
   empty:false,
  };
 }
 if(source.kind==="ask"){
  const t=source.trace;
  const steps=[
   `Your question was matched to a curated investigation by ${t.matchedBy||"the router"}. It was not sent to a model as free text.`,
   `Evidence was retrieved from ${t.sources.join(", ")||"public sources"}.`,
   `Model check: ${t.modelCheck==="not_configured"?"did not run on this deployment":t.modelCheck}.`,
   ...liveSteps(source.run).slice(0,8),
   "Nothing was saved to a server. Opening the workspace keeps the run in this browser only.",
  ];
  return{
   title:"How this was produced",
   generatedAt:source.run.events[0]?.at??null,
   steps,
   note:"Ask routing plus the live run record. Agent product names are not part of this trace.",
   capabilities:[F12,PUB],
   empty:false,
  };
 }
 if(source.kind==="radar"){
  const r=source.run;
  const steps=[
   `Radar generated at ${r.generatedAt}${source.fromCache?" (restored from this device)":""}.`,
   `Window: papers first published ${r.window.from} to ${r.window.to} (${r.window.days} days).`,
   ...r.topics.map(t=>t.status==="failed"
    ?`Topic “${t.topic}”: search failed (${t.error??"error"}). Absence of results is not evidence of absence.`
    :`Topic “${t.topic}”: ${t.newCount} new · ${t.papers.length} listed${t.trendError?` · trend unavailable (${t.trendError})`:""}.`),
   r.own.status==="not_requested"?"Own papers: not requested."
    :r.own.status==="failed"?`Own papers: lookup failed (${r.own.error??"error"}).`
    :`Own papers: ${r.own.papers.length} found · ${r.own.unresolved.length} unresolved.`,
  ];
  return{
   title:"How this was produced",
   generatedAt:r.generatedAt,
   steps,
   note:r.note,
   capabilities:[PUB],
   empty:false,
  };
 }
 if(source.kind==="related-works"){
  const r=source.run;
  if(r.status==="failed")return emptyTrace(r.error??"Related works lookup failed. Nothing was generated.");
  if(r.status==="seed_not_found")return emptyTrace(r.error??"Seed work not found in OpenAlex.");
  const steps=[
   r.seed?`Seed resolved: ${r.seed.title} (${r.seed.sourceId}).`:"Seed metadata missing after ok status.",
   `OpenAlex related_works returned ${r.related.length} neighbour${r.related.length===1?"":"s"}${r.unresolvedRelatedIds.length?` · ${r.unresolvedRelatedIds.length} unresolved`:""}.`,
   "Neighbours are bibliographic relatives as defined by OpenAlex — not an HSI co-citation graph or claim support.",
  ];
  return{
   title:"How this was produced",
   generatedAt:null,
   steps,
   note:r.note,
   capabilities:[PUB],
   empty:false,
  };
 }
 const _x:never=source;
 return emptyTrace(String(_x));
}
