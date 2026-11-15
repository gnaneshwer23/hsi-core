import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {GAP_STATUSES,buildGapRegister,evidenceChangedSince,parseTracking,recordStatus,type GapRegisterEntry,type GapStatus,type GapTracking} from "../../../src/knowledgeGraph/gapRegister";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {deriveRunGaps} from "../../../src/investigation/runGaps";
import {RunGapList} from "../components/home/RunGapList";
import {useRunGapTracking} from "../lib/useRunGapTracking";
import {LIVE_RUN_KEY} from "../lib/researchHome";
import type {Run} from "../lib/workspaceView";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const KEY="hsi-gap-register-v1";
const LABEL:Record<GapStatus,string>={open:"Open",investigating:"Investigating",resolved:"Resolved",deferred:"Deferred"};
function load():GapTracking{try{return parseTracking(localStorage.getItem(KEY))}catch{return {}}}

function Entry({e,track,onSet}:{e:GapRegisterEntry;track:GapTracking;onSet:(s:GapStatus,note:string)=>void}){
 const [note,setNote]=useState(""),t=track[e.id],status=t?.status??"open",ch=evidenceChangedSince(track,e);
 const models=Object.entries(e.evidenceModels).map(([m,n])=>`${m.replace(/_/g," ")} ${n}`).join(", ");
 return (
  <li className="rh-card gr-entry" data-status={status}>
   <header><h3>{e.question}</h3><span className="gr-status" data-s={status}>{LABEL[status]}</span></header>
   <p className="rh-sub"><b>{e.subject.name}</b> and <b>{e.object.name}</b>{e.conditions.length>0&&<> · {e.conditions.join(", ")}</>} · {e.domains.join(", ")}</p>
   <p><b>What is missing.</b> {e.missing}</p>
   <p><b>A candidate next study.</b> {e.candidateExperiments[0]}</p>
   {ch.changed&&<p className="rh-err" role="status">The graph now records {ch.to} touching relationships; it recorded {ch.from} when you last set a status (graph {ch.sinceVersion?.slice(0,8)}).</p>}
   <details><summary>Uncertainty: {e.uncertainty.level}</summary><ul>{e.uncertainty.reasons.map(r=><li key={r}>{r}</li>)}</ul></details>
   <details><summary>Priority {e.priority.score} (ordering aid)</summary><ul>{e.priority.factors.map(f=><li key={f.label}>{f.label}: +{f.points}</li>)}</ul><p className="rh-note">{e.priority.note}</p></details>
   <details><summary>Touching evidence ({e.touching.length}{e.opposing.length>0?`, ${e.opposing.length} opposing`:""})</summary>
    {e.touching.length+e.opposing.length===0?<p className="rh-note">No candidate relationship in the graph touches these concepts.</p>:<ul className="gr-ev">{[...e.touching,...e.opposing].map(x=><li key={x.edgeId}><b>{e.opposing.includes(x)?"Opposing":"Candidate"}</b> · {x.model.replace(/_/g," ")} · {x.design}<br/>{x.assertion}<br/><small>Limits: {x.limitations} Review: {x.reviewStatus}.</small></li>)}</ul>}
    {models&&<p className="rh-note">Models: {models}</p>}
   </details>
   <fieldset className="gr-track"><legend>Your status for this gap</legend>
    <div className="rh-choices">{GAP_STATUSES.map(s=><button key={s} type="button" aria-pressed={status===s} onClick={()=>onSet(s,note)}>{LABEL[s]}</button>)}</div>
    <label htmlFor={"n-"+e.id}>Optional note with the next status change</label>
    <input id={"n-"+e.id} value={note} maxLength={300} onChange={x=>setNote(x.target.value)}/>
   </fieldset>
   {t&&t.history.length>0&&<details><summary>History ({t.history.length})</summary><ol className="gr-hist">{[...t.history].reverse().map((h,i)=><li key={i}>{h.at.slice(0,10)} · {LABEL[h.status]} · graph {h.graphVersion.slice(0,8)} · {h.touchingCount} touching{h.note?` · ${h.note}`:""}</li>)}</ol></details>}
  </li>
 );
}

export function GapRegisterPage(){
 const [bundle,setBundle]=useState<DomainBundle|null>(null),[failed,setFailed]=useState(false),[track,setTrack]=useState<GapTracking>({}),[filter,setFilter]=useState<GapStatus|"all">("all"),[noStore,setNoStore]=useState(false);
 useEffect(()=>{setTrack(load());const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{if(!c.signal.aborted)setFailed(true)}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 const [savedRun,setSavedRun]=useState<Run|null>(null),rg=useRunGapTracking(savedRun?.briefHash??"");
 useEffect(()=>{try{const raw=localStorage.getItem(LIVE_RUN_KEY);const x=raw&&raw.length<2_000_000?JSON.parse(raw):null;if(x&&typeof x.scenarioId==="string"&&Array.isArray(x.candidates)&&x.byContext&&Array.isArray(x.searches)&&x.verification)setSavedRun(x as Run)}catch{setSavedRun(null)}},[]);
 const runGaps=useMemo(()=>savedRun?deriveRunGaps(savedRun):[],[savedRun]);
 const entries=useMemo(()=>bundle?buildGapRegister(bundle):[],[bundle]);
 const set=(e:GapRegisterEntry,s:GapStatus,note:string)=>{const next=recordStatus(track,e,s,new Date().toISOString(),note);setTrack(next);try{localStorage.setItem(KEY,JSON.stringify(next));setNoStore(false)}catch{setNoStore(true)}};
 const shown=entries.filter(e=>filter==="all"||(track[e.id]?.status??"open")===filter);
 return (
  <ResearchAppShell where="Gap Register" whereIcon="layers" active="gaps">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <section className="rh-card" aria-labelledby="gr-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="layers" size={22}/></span><div><h1 id="gr-h">Gap Register</h1><p className="rh-sub">Where the published graph records missing or contested knowledge, with the evidence that touches each gap. Candidates only; nothing here is reviewed, and priority is an ordering aid.</p></div></header>
     {bundle&&<p className="rh-note">{entries.length} gaps in graph {bundle.version.slice(0,8)}. Your statuses and notes are kept in this browser only.</p>}
     {failed&&<p className="rh-err" role="alert">The published graph could not be loaded. No substitute gaps are shown.</p>}
     {noStore&&<p className="rh-err" role="status">This browser blocked local storage, so your status was not kept.</p>}
     <div className="rh-choices gr-filter" role="group" aria-label="Filter by your status">{(["all",...GAP_STATUSES] as const).map(s=><button key={s} type="button" aria-pressed={filter===s} onClick={()=>setFilter(s)}>{s==="all"?"All":LABEL[s]}</button>)}</div>
    </section>
    {!bundle&&!failed&&<div className="rh-skel" aria-hidden="true"/>}
    <ul className="gr-list" aria-label="Gaps">{shown.map(e=><Entry key={e.id} e={e} track={track} onSet={(s,n)=>set(e,s,n)}/>)}</ul>
    {bundle&&shown.length===0&&<p className="rh-empty">No gaps with this status.</p>}
    <section className="rh-card" aria-labelledby="gr-run-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="flask" size={22}/></span><div><h2 id="gr-run-h">From your latest investigation</h2><p className="rh-sub">Derived from the run saved in this browser. Run a question in the workspace to refresh it.</p></div></header>
     {!savedRun?<p className="rh-empty">No saved investigation in this browser yet. <Link to="/research/workspace">Run one in the workspace</Link>.</p>:<>
      <p className="rh-note">{savedRun.question} <Link to="/research/workspace?reopen=1">Reopen the run</Link></p>
      <RunGapList gaps={runGaps} track={rg.track} onSet={(id,s,n)=>rg.set(id,s,n,runGaps.find(x=>x.id===id)?.candidateIds.length??0)}/></>}
    </section>
    <p className="rh-note">To see how a gap fits the wider graph, <Link to="/research/knowledge-graph">open the knowledge graph</Link>.</p>
   </main>
  </ResearchAppShell>
 );
}
