import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {LEDGER_OUTCOMES,LEDGER_STATUSES,LIMITS,createEntry,edit,missingForTest,recordOutcome,setStatus,type LedgerEntry,type LedgerOutcome,type LedgerStatus} from "../../../src/investigation/hypothesisLedger";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {useLedger} from "../lib/useLedger";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const SL:Record<LedgerStatus,string>={proposed:"Proposed",planning:"Planning a test",testing:"Testing",parked:"Parked",retired:"Retired"};
const OL:Record<LedgerOutcome,string>={none:"No outcome recorded",consistent:"Consistent with my observation",inconsistent:"Inconsistent with my observation",inconclusive:"Inconclusive"};
const download=(name:string,text:string)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"application/json"}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};

function Card({e,gaps,update}:{e:LedgerEntry;gaps:Map<string,string>;update:(id:string,fn:(x:LedgerEntry)=>LedgerEntry)=>void}){
 const [err,setErr]=useState(""),[note,setNote]=useState(""),[oc,setOc]=useState<LedgerOutcome>("inconclusive"),[plan,setPlan]=useState({prediction:e.prediction,experiment:e.experiment,falsifier:e.falsifier,limits:e.limits}),missing=missingForTest(e);
 const at=()=>new Date().toISOString();
 const go=(s:LedgerStatus)=>{const r=setStatus(e,s,at());if(!r.ok){setErr(r.error);return}setErr("");update(e.id,()=>r.entry)};
 return (
  <li className="rh-card hl-entry" data-status={e.status}>
   <header><h3>{e.statement}</h3><span className="gr-status" data-s={e.status==="testing"?"investigating":e.status}>{SL[e.status]}</span></header>
   <p className="hl-tags"><span>Unvalidated hypothesis</span><span>{e.origin.kind==="model_proposal"?`Model proposal · ${e.origin.proposedBy}`:"Written by you"}</span>{e.outcome!=="none"&&<span>{OL[e.outcome]}</span>}</p>
   {missing.length>0&&<p className="rh-note" role="status">Not yet testable: needs {missing.join(", ")}.</p>}
   {e.rationale&&<p><b>Why.</b> {e.rationale}</p>}
   <dl className="hl-dl">{e.prediction&&<><dt>Prediction if true</dt><dd>{e.prediction}</dd></>}{e.experiment&&<><dt>Experiment</dt><dd>{e.experiment}</dd></>}{e.falsifier&&<><dt>Would be falsified by</dt><dd>{e.falsifier}</dd></>}{e.limits&&<><dt>Limits</dt><dd>{e.limits}</dd></>}</dl>
   {(e.citedClaimIds.length>0||e.linkedGapIds.length>0)&&<p className="rh-note">{e.citedClaimIds.length>0&&<>Rests on {e.citedClaimIds.length} cited claim{e.citedClaimIds.length===1?"":"s"} from {e.citedSourceIds.length} source{e.citedSourceIds.length===1?"":"s"}. </>}{e.linkedGapIds.length>0&&<>Linked gaps: {e.linkedGapIds.map(g=>gaps.get(g)??g).join("; ")}.</>}</p>}
   <div className="rh-choices gr-filter" role="group" aria-label={`Status for: ${e.statement.slice(0,60)}`}>{LEDGER_STATUSES.map(s=><button key={s} type="button" aria-pressed={e.status===s} onClick={()=>go(s)}>{SL[s]}</button>)}</div>
   {err&&<p className="rh-err" role="alert">{err}</p>}
   <details><summary>Edit the test plan</summary>
    {(["prediction","experiment","falsifier","limits"] as const).map(k=><div key={k} className="hl-field"><label htmlFor={`${e.id}-${k}`}>{k==="falsifier"?"What result would show it is false":k==="prediction"?"Prediction if true":k==="experiment"?"A feasible experiment":"Limits"}</label><textarea id={`${e.id}-${k}`} rows={2} maxLength={LIMITS.field} value={plan[k]} onChange={x=>setPlan(p=>({...p,[k]:x.target.value}))}/></div>)}
    <div className="rh-row"><button type="button" className="rh-ghost" onClick={()=>{update(e.id,x=>edit(x,plan,at()));setErr("")}}>Save test plan</button></div>
   </details>
   {e.status==="testing"&&<fieldset className="hl-outcome"><legend>Record what you observed</legend>
    <div className="rh-choices gr-filter" role="radiogroup" aria-label="Outcome">{LEDGER_OUTCOMES.filter(o=>o!=="none").map(o=><button key={o} type="button" role="radio" aria-checked={oc===o} onClick={()=>setOc(o)}>{OL[o]}</button>)}</div>
    <label htmlFor={e.id+"-note"} className="rh-note">What did you observe? (at least 10 characters). This is your observation, not a validation.</label>
    <input id={e.id+"-note"} className="gr-note" maxLength={LIMITS.note} value={note} onChange={x=>setNote(x.target.value)}/>
    <div className="rh-row"><button type="button" className="rh-primary" onClick={()=>{const r=recordOutcome(e,oc,note,at());if(!r.ok){setErr(r.error);return}setErr("");setNote("");update(e.id,()=>r.entry)}}>Record outcome</button></div>
   </fieldset>}
   <p className="rh-note"><Link to="/research/cohort">Explore a related phenotype on the synthetic cohort</Link> (illustrative, synthetic data only).</p>
   <details><summary>History ({e.history.length})</summary><ol className="gr-hist">{[...e.history].reverse().map((h,i)=><li key={i}>{h.at.slice(0,10)} · {h.type} · {h.detail}</li>)}</ol></details>
  </li>
 );
}

export function HypothesisLedgerPage(){
 const {ledger,ready,blocked,add,update}=useLedger(),[bundle,setBundle]=useState<DomainBundle|null>(null),[filter,setFilter]=useState<LedgerStatus|"all">("all"),[msg,setMsg]=useState("");
 const [f,setF]=useState({statement:"",prediction:"",experiment:"",falsifier:"",limits:""}),[picked,setPicked]=useState<string[]>([]);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 const gaps=useMemo(()=>new Map((bundle?.gaps??[]).map(g=>[g.id,g.question])),[bundle]);
 const entries=Object.values(ledger).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).filter(e=>filter==="all"||e.status===filter);
 const submit=()=>{
  const r=createEntry({...f,origin:{kind:"researcher"},linkedGapIds:picked},new Date().toISOString());
  if(!r.ok){setMsg(r.error);return}
  const a=add(r.entry);setMsg(a.added?"Added to your ledger.":a.error??"That hypothesis is already in your ledger.");if(a.added){setF({statement:"",prediction:"",experiment:"",falsifier:"",limits:""});setPicked([])}
 };
 return (
  <ResearchAppShell where="Hypothesis Ledger" whereIcon="flask" active="ledger">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <section className="rh-card" aria-labelledby="hl-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="flask" size={22}/></span><div><h1 id="hl-h">Hypothesis Ledger</h1><p className="rh-sub">The hypotheses you carry, whether you wrote them or added a model proposal from an investigation. Nothing here is validated. A hypothesis needs a stated falsifier before you can test it, and outcomes are your own recorded observations.</p></div></header>
     <p className="rh-note">{ready?`${Object.keys(ledger).length} in your ledger. Kept in this browser only.`:"Loading…"}</p>
     {blocked&&<p className="rh-err" role="status">This browser blocked local storage, so your ledger was not kept.</p>}
     <div className="rh-row"><button type="button" className="rh-ghost" disabled={Object.keys(ledger).length===0} onClick={()=>download("hsi-hypothesis-ledger.json",JSON.stringify(ledger,null,2))}>Export ledger (JSON)</button></div>
    </section>

    <section className="rh-card" aria-labelledby="hl-add-h">
     <h2 id="hl-add-h">Add a hypothesis</h2>
     <form className="hl-form" onSubmit={e=>{e.preventDefault();submit()}}>
      <div className="hl-field"><label htmlFor="hl-st">Hypothesis (one sentence)</label><textarea id="hl-st" rows={2} maxLength={LIMITS.statement} value={f.statement} onChange={e=>setF({...f,statement:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="hl-pr">Prediction if true</label><textarea id="hl-pr" rows={2} maxLength={LIMITS.field} value={f.prediction} onChange={e=>setF({...f,prediction:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="hl-ex">A feasible experiment</label><textarea id="hl-ex" rows={2} maxLength={LIMITS.field} value={f.experiment} onChange={e=>setF({...f,experiment:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="hl-fa">What result would show it is false</label><textarea id="hl-fa" rows={2} maxLength={LIMITS.field} value={f.falsifier} onChange={e=>setF({...f,falsifier:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="hl-li">Limits (species, disease context)</label><textarea id="hl-li" rows={2} maxLength={LIMITS.field} value={f.limits} onChange={e=>setF({...f,limits:e.target.value})}/></div>
      {bundle&&bundle.gaps.length>0&&<fieldset className="hl-gaps"><legend>Link to gaps in the published graph (optional)</legend>{bundle.gaps.map(g=><label key={g.id}><input type="checkbox" checked={picked.includes(g.id)} onChange={e=>setPicked(p=>e.target.checked?[...p,g.id].slice(0,LIMITS.gaps):p.filter(x=>x!==g.id))}/> {g.question}</label>)}</fieldset>}
      <div className="rh-row"><button type="submit" className="rh-primary">Add to ledger</button></div>
     </form>
     <div role="status" aria-live="polite">{msg&&<p className="rh-note">{msg}</p>}</div>
    </section>

    <div className="rh-choices gr-filter" role="group" aria-label="Filter by status">{(["all",...LEDGER_STATUSES] as const).map(s=><button key={s} type="button" aria-pressed={filter===s} onClick={()=>setFilter(s)}>{s==="all"?"All":SL[s]}</button>)}</div>
    {ready&&entries.length===0&&<p className="rh-empty">{Object.keys(ledger).length===0?"Your ledger is empty. Add a hypothesis above, or add a model proposal from an investigation in the workspace.":"No hypotheses with this status."}</p>}
    <ul className="gr-list" aria-label="Hypotheses">{entries.map(e=><Card key={e.id} e={e} gaps={gaps} update={update}/>)}</ul>
    <p className="rh-note">Related: <Link to="/research/gaps">Gap Register</Link> · <Link to="/research/workspace">Investigation workspace</Link></p>
   </main>
  </ResearchAppShell>
 );
}
