import {useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {addTargetPick} from "../../../src/investigation/hypothesisLedger";
import type {TargetCandidate} from "../../../src/investigation/targetProfile";
import {formatRetryAfterHint} from "../lib/retryAfter";
import {fetchTargets,type TargetOutcome} from "../lib/targetEvidenceClient";
import {useLedger} from "../lib/useLedger";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const DISEASES=[{id:"MONDO_0005100",label:"Systemic sclerosis"},{id:"MONDO_0008383",label:"Rheumatoid arthritis"},{id:"MONDO_0007915",label:"Systemic lupus erythematosus"},{id:"MONDO_0005148",label:"Type 2 diabetes mellitus"}];
const WHY:Record<string,string>={not_found:"Open Targets does not recognise that disease id.",invalid:"Enter an id such as MONDO_0005100 or EFO_0000384.",unavailable:"Open Targets could not be reached, so no targets are shown. Nothing was generated."};
function whyMessage(out:Exclude<TargetOutcome,{kind:"ok"}>):string{
 if(out.kind==="limited")return`Too many requests. ${formatRetryAfterHint(out.retryAfterSeconds,"Try again in a few minutes.")}`;
 return WHY[out.kind];
}
const pct=(n:number)=>n.toFixed(2);

function Row({c,hyps,onPick}:{c:TargetCandidate;hyps:{id:string;statement:string}[];onPick:(hyp:string,c:TargetCandidate,reason:string)=>string}){
 const [hyp,setHyp]=useState(hyps[0]?.id??""),[reason,setReason]=useState(""),[msg,setMsg]=useState("");
 return (
  <li className="rh-card tw-row">
   <header><h3>{c.rank}. {c.symbol}</h3><span className="tw-score" title="Association score 0 to 1. Not causation, efficacy or validation.">score {pct(c.score)}</span></header>
   <p className="tw-chips" aria-label="Evidence types">{c.evidence.map(e=><span key={e.id} data-on={e.score!==null}>{e.label}{e.score!==null?` ${pct(e.score)}`:" none"}</span>)}</p>
   {c.observations.length>0&&<ul className="tw-obs">{c.observations.map(o=><li key={o}>{o}</li>)}</ul>}
   <p className="rh-note"><a href={`https://platform.opentargets.org/target/${c.ensemblId}`} target="_blank" rel="noreferrer noopener">View {c.symbol} on Open Targets</a> (external)</p>
   <details><summary>Shortlist for a hypothesis</summary>
    {hyps.length===0?<p className="rh-note">You have no hypotheses yet. <Link to="/research/ledger">Add one in the ledger</Link> first.</p>:<div className="tw-pick">
     <label htmlFor={`h-${c.ensemblId}`}>Hypothesis</label><select id={`h-${c.ensemblId}`} className="gr-note" value={hyp} onChange={e=>setHyp(e.target.value)}>{hyps.map(h=><option key={h.id} value={h.id}>{h.statement.slice(0,90)}</option>)}</select>
     <label htmlFor={`r-${c.ensemblId}`}>Why is this target worth investigating for it? (at least 10 characters)</label><input id={`r-${c.ensemblId}`} className="gr-note" maxLength={300} value={reason} onChange={e=>setReason(e.target.value)}/>
     <div className="rh-row"><button type="button" className="rh-ghost" onClick={()=>setMsg(onPick(hyp,c,reason))}>Shortlist {c.symbol}</button></div>
     <div role="status" aria-live="polite">{msg&&<p className="rh-note">{msg}</p>}</div></div>}
   </details>
  </li>
 );
}

export function TargetWorkflowPage(){
 const [params]=useSearchParams(),ledger=useLedger(),[disease,setDisease]=useState(DISEASES[0]!.id),[custom,setCustom]=useState(""),[busy,setBusy]=useState(false),[out,setOut]=useState<TargetOutcome|null>(null);
 const hyps=Object.values(ledger.ledger).filter(h=>h.status!=="retired").map(h=>({id:h.id,statement:h.statement})),pre=params.get("hypothesis");
 const ordered=pre?[...hyps.filter(h=>h.id===pre),...hyps.filter(h=>h.id!==pre)]:hyps;
 const run=async()=>{setBusy(true);setOut(null);setOut(await fetchTargets((custom.trim()||disease).trim()));setBusy(false)};
 const pick=(hypId:string,c:TargetCandidate,reason:string):string=>{
  if(out?.kind!=="ok")return "No target profile is loaded.";const e=ledger.ledger[hypId];if(!e)return "Choose a hypothesis.";
  const r=addTargetPick(e,{ensemblId:c.ensemblId,symbol:c.symbol,diseaseId:out.profile.diseaseId,diseaseName:out.profile.diseaseName,score:c.score,retrievedAt:out.profile.retrievedAt,reason},new Date().toISOString());
  if(!r.ok)return r.error;ledger.update(e.id,()=>r.entry);return `Shortlisted ${c.symbol} for your hypothesis. It is a candidate to investigate, not a recommendation, and it did not change the hypothesis status.`;
 };
 return (
  <ResearchAppShell where="Candidate targets" whereIcon="flask" active="targets">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <p className="co-banner" role="note"><b>Candidates to investigate, not recommendations.</b> Public association metadata from Open Targets. A score is not causation, efficacy or target validation. Nothing here is clinical or treatment advice.</p>
    <section className="rh-card" aria-labelledby="tw-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="flask" size={22}/></span><div><h1 id="tw-h">Candidate targets for a disease</h1><p className="rh-sub">See which targets have recorded evidence for a disease, which evidence types are present and which are missing, and shortlist candidates against a hypothesis in your ledger.</p></div></header>
     <form className="tw-form" onSubmit={e=>{e.preventDefault();void run()}}>
      <label htmlFor="tw-d">Disease</label>
      <select id="tw-d" className="gr-note" value={disease} onChange={e=>setDisease(e.target.value)}>{DISEASES.map(d=><option key={d.id} value={d.id}>{d.label} ({d.id})</option>)}</select>
      <label htmlFor="tw-c">Or enter a MONDO or EFO id (optional)</label>
      <input id="tw-c" className="gr-note" value={custom} placeholder="MONDO_0005100" maxLength={20} onChange={e=>setCustom(e.target.value)}/>
      <div className="rh-row"><button type="submit" className="rh-primary" disabled={busy}>{busy?"Reading Open Targets…":"Find candidate targets"}</button></div>
     </form>
     <div role="status" aria-live="polite">
      {out&&out.kind!=="ok"&&<p className="rh-err" role="alert">{whyMessage(out)}</p>}
      {out?.kind==="ok"&&<p className="rh-note">{out.profile.diseaseName} ({out.profile.diseaseId}): showing the top {out.profile.shown} of {out.profile.totalAssociations} direct associations, read {out.profile.retrievedAt.slice(0,10)}. {out.caveat}</p>}
     </div>
    </section>
    {out?.kind==="ok"&&<ul className="gr-list" aria-label="Candidate targets">{out.profile.candidates.map(c=><Row key={c.ensemblId} c={c} hyps={ordered} onPick={pick}/>)}</ul>}
    <p className="rh-note">Related: <Link to="/research/ledger">Hypothesis Ledger</Link> · <Link to="/research/gaps">Gap Register</Link></p>
   </main>
  </ResearchAppShell>
 );
}
