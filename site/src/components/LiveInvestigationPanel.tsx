import {useEffect,useState} from "react";
import {useLocation} from "react-router-dom";
import {LIVE_RUN_KEY} from "../lib/researchHome";
import {renderLiveBriefMarkdown} from "../../../src/investigation/liveBrief";
import "../styles/live-investigation.css";

/** Live mode: real public-literature retrieval through the server route. Curated examples below stay separate and labelled. */
type Search={provider:string;context:string;status:"ok"|"failed";count:number;error:string|null};
type Verdict={verifier:string;model:string;direction:string;evidenceSpan:string|null;reason:string};
type Candidate={id:string;subject:string;object:string;contexts:string[];species:string|null;sourceId:string;sourceUrl:string;sentence:string;lexicalPolarity:string;direction:string;priority?:{score:number;reasons:string[]};polarity:"supporting"|"opposing"|"uncertain";polarityBasis:string;verification:string;verdicts:Verdict[];retraction:string};
type Rec={sourceId:string;title:string;doi:string|null;pmid:string|null;publicationDate:string|null;sourceUrl:string;retrievedAt:string;provider:string;hasAbstract?:boolean;retraction:string};
type Result={question:string;scenarioId:string;version:number;briefHash:string;searches:Search[];records:Rec[];candidates:Candidate[];targets:{context:string;disease:string|null;rows:{symbol:string;score:number}[];error:string|null}[];
 byContext:Record<string,{label:string;records:number;supporting:string[];opposing:string[];uncertain:string[]}>;
 verification:{status:string;reason:string|null;checked:number;independence:string|null};gaps:string[];events:{stage:string;at:string;status:string;detail:string}[];budget:unknown};
const SCENARIO="il21-autoimmune";

const DIRLABEL:Record<string,string>={positive:"Positive: rise or act together, or promotes",negative:"Negative: inverse, or suppresses",none:"No relationship stated",association_only:"Linked, direction not stated",unresolved:"Unresolved: the checks disagreed or could not tell",not_assessed:"Not assessed"};
const STORE=LIVE_RUN_KEY;

function download(name:string,text:string,type:string){
 const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);
}
export function LiveInvestigationPanel(){
 const [state,setState]=useState<"idle"|"running"|"error">("idle");
 const [result,setResult]=useState<Result|null>(null);
 const [error,setError]=useState("");
 const [ctx,setCtx]=useState("all");
 const [sel,setSel]=useState<string|null>(null);
 const [saved,setSaved]=useState<string>(()=>{try{return localStorage.getItem(STORE)?"A saved run is available in this browser.":""}catch{return""}});

 async function run(){
  setState("running");setError("");setSel(null);
  try{
   const res=await fetch("/api/research/live-investigation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scenarioId:SCENARIO})});
   if(!res.ok){const b=await res.json().catch(()=>null) as {error?:string}|null;throw Error(b?.error??"The investigation could not run (HTTP "+res.status+").")}
   setResult(await res.json() as Result);setState("idle");
  }catch(e){setError(e instanceof Error?e.message:"The investigation could not run.");setState("error")}
 }
 function saveLocal(){if(!result)return;try{localStorage.setItem(STORE,JSON.stringify(result));setSaved("Saved in this browser only. It is not stored on a server.")}catch{setSaved("This browser blocked local saving.")}}
 function reopen(){try{const t=localStorage.getItem(STORE);if(t){setResult(JSON.parse(t) as Result);setSaved("Reopened the browser-saved run.")}}catch{setSaved("Could not reopen the saved run.")}}
 const loc=useLocation();
 // Deep links from Research Home: scroll to the panel; "reopen" restores the run saved in this browser. A run never starts without a click.
 useEffect(()=>{
  if(new URLSearchParams(loc.search).get("reopen")==="1")reopen();
  if(loc.hash==="#live-investigation")requestAnimationFrame(()=>document.getElementById("live-investigation")?.scrollIntoView({block:"start"}));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[loc.search,loc.hash]);
 const cands=(result?.candidates??[]).filter(c=>ctx==="all"||c.contexts.includes(ctx));
 const assessed=result?.verification.status==="completed"||result?.verification.status==="partial";
 const picked=result?.candidates.find(c=>c.id===sel)??null;
 const rec=picked?result?.records.find(r=>r.sourceId===picked.sourceId)??null:null;

 return (
  <section className="li-panel" id="live-investigation" aria-labelledby="li-h">
   <div className="li-head">
    <div>
     <h2 id="li-h">Live investigation</h2>
     <p>Searches Europe PMC, OpenAlex and Open Targets now. Everything returned is a candidate: unreviewed, abstract-level, not scientific approval and not clinical advice.</p>
     <p className="li-q"><b>Question:</b> Why might IL-21 signalling have different biological consequences across rheumatoid arthritis, lupus and systemic sclerosis?</p>
    </div>
    <div className="li-actions">
     <button type="button" className="li-run" onClick={run} disabled={state==="running"}>{state==="running"?"Searching sources…":result?"Run again":"Run live investigation"}</button>
     {saved.startsWith("A saved")&&!result&&<button type="button" className="li-ghost" onClick={reopen}>Reopen saved run</button>}
    </div>
   </div>
   <p className="li-mode">Mode: <b>Live</b> (real sources). The curated example below is a separate, scripted demonstration.</p>
   <div role="status" aria-live="polite">{state==="error"&&<p className="li-err">{error} No findings were generated.</p>}</div>

   {result&&(<div className="li-body">
    <ol className="li-events" aria-label="What this run actually did">
     {result.events.map(e=><li key={e.stage} data-status={e.status}><b>{e.stage}</b><span>{e.status}</span><p>{e.detail}</p></li>)}
    </ol>

    <div className="li-cols">
     <div>
      <h3>Evidence by disease context</h3>
      <div className="li-chips" role="group" aria-label="Filter by disease context">
       <button type="button" aria-pressed={ctx==="all"} onClick={()=>setCtx("all")}>All</button>
       {Object.entries(result.byContext).map(([k,v])=><button key={k} type="button" aria-pressed={ctx===k} onClick={()=>setCtx(k)}>{v.label} ({v.supporting.length+v.opposing.length+v.uncertain.length})</button>)}
      </div>
      {(["supporting","opposing","abstained","unchecked"] as const).map(p=>{
       const list=cands.filter(c=>p==="abstained"?c.polarity==="uncertain"&&c.verification!=="not_run":p==="unchecked"?c.verification==="not_run":c.polarity===p&&c.verification!=="not_run");
       if(p==="unchecked"&&!list.length)return null;
       if(p==="abstained"&&!assessed)return null;
       const title=p==="supporting"?"Supporting":p==="opposing"?"Opposing":p==="abstained"?"Checked, no direction established":assessed?"Not checked (ranked lower)":"Direction not assessed";
       return <div key={p} className={"li-group li-"+(p==="supporting"?"supporting":p==="opposing"?"opposing":"uncertain")}><h4>{title} <span>({list.length})</span></h4>
        {list.length===0?<p className="li-none">{p==="opposing"?(assessed?"None found in these sources. This does not establish consensus.":"Not assessed: the model challenge did not run."):p==="supporting"&&!assessed?"Not assessed: the model challenge did not run.":"None in this view."}</p>:
         <ul>{list.map(c=><li key={c.id}><button type="button" aria-pressed={sel===c.id} onClick={()=>setSel(c.id)}><b>{c.subject} ~ {c.object}{c.direction!=="not_assessed"&&<em className="li-dir"> · {(DIRLABEL[c.direction]??c.direction).split(":")[0]}</em>}</b><span>{c.sentence}</span></button></li>)}</ul>}
       </div>;
      })}
     </div>

     <aside className="li-detail" aria-label="Selected claim" tabIndex={-1}>
      <h3>Evidence inspector</h3>
      {!picked?<p className="li-none">Select a claim to read its source, context and how its direction was assessed.</p>:<div>
       <p className="li-claim">{picked.subject} ~ {picked.object}</p>
       <p>“{picked.sentence}”</p>
       <dl>
        <dt>Disease context</dt><dd>{picked.contexts.map(k=>result.byContext[k]?.label).join(", ")||"Not stated in the abstract"}</dd>
        <dt>Species cue</dt><dd>{picked.species??"Not stated"}</dd>
        <dt>Direction basis</dt><dd>{picked.polarityBasis==="two_model_challenge"?`${DIRLABEL[picked.direction]??picked.direction} (two-model check: ${picked.verification.replaceAll("_"," ")})`:`Not assessed. A keyword hint says “${picked.lexicalPolarity}” but it is not a finding.`}</dd>
        <dt>Why it was prioritised</dt><dd>{picked.priority?.reasons.join("; ")||"Not ranked"}</dd>
        <dt>Source</dt><dd><a href={picked.sourceUrl} target="_blank" rel="noreferrer noopener">{rec?.title??picked.sourceId}</a>{rec&&<><br/>{rec.provider} · {rec.doi?`DOI ${rec.doi} · `:""}{rec.pmid?`PMID ${rec.pmid} · `:""}{rec.publicationDate??"date not given"}<br/>Retrieved {rec.retrievedAt} · retraction: {rec.retraction.replaceAll("_"," ")} · licence not assessed</>}</dd>
       </dl>
       {picked.verdicts.length>0&&<div className="li-verdicts"><h4>Verifier challenges</h4>{picked.verdicts.map(v=><p key={v.verifier}><b>{v.verifier}</b> ({v.model}): {v.direction.replaceAll("_"," ")}. {v.reason}{v.evidenceSpan&&<><br/>Span: “{v.evidenceSpan}”</>}</p>)}</div>}
       <p className="li-state">Candidate · unreviewed · not promotable to the graph</p>
      </div>}
     </aside>
    </div>

    <div className="li-cols li-sub">
     <div><h3>Searches</h3><ul className="li-searches">{result.searches.map((s,i)=><li key={i} data-status={s.status}>{s.provider} · {result.byContext[s.context]?.label??s.context}: {s.status==="ok"?`${s.count} records`:`failed (${s.error})`}</li>)}</ul></div>
     <div><h3>Open Targets associations (not causality)</h3>{result.targets.map(t=><p key={t.context}><b>{result.byContext[t.context]?.label}</b>{t.disease?` (${t.disease})`:""}: {t.error?`unavailable (${t.error})`:t.rows.slice(0,5).map(r=>`${r.symbol} ${r.score.toFixed(2)}`).join(", ")||"no rows"}</p>)}</div>
    </div>

    <div className="li-gaps"><h3>Missing evidence and limits</h3><ul>{result.gaps.map(g=><li key={g}>{g}</li>)}</ul>
     <p className="li-verif">Model challenge: {result.verification.status==="not_configured"?`not run. ${result.verification.reason}`:`${result.verification.checked} claims checked. ${result.verification.independence==="separate_providers_unverified"?"Separate providers, independence unverified.":"Independent execution only."} Agreement is not scientific proof.`}</p></div>

    <div className="li-export">
     <button type="button" onClick={()=>download("hsi-live-brief.md",renderLiveBriefMarkdown(result as never),"text/markdown")}>Export brief (Markdown)</button>
     <button type="button" onClick={()=>download("hsi-live-investigation.json",JSON.stringify(result,null,2),"application/json")}>Export JSON</button>
     <button type="button" onClick={saveLocal}>Save in this browser</button>
     <span>Version {result.version} · {result.briefHash.slice(0,12)}</span>
     {saved&&<span role="status">{saved}</span>}
    </div>
   </div>)}
  </section>
 );
}
