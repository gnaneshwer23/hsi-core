import {useState} from "react";
import {GAP_STATUSES,type GapStatus,type GapTracking} from "../../../../src/knowledgeGraph/gapRegister";
import type {RunGap,RunGapScope} from "../../../../src/investigation/runGaps";

const LABEL:Record<GapStatus,string>={open:"Open",investigating:"Investigating",resolved:"Resolved",deferred:"Deferred"};
const SCOPE:Record<RunGapScope,{name:string;note:string}>={
 scientific:{name:"Scientific gaps",note:"Something the retrieved evidence shows. Still candidates, unreviewed."},
 retrieval:{name:"Limits of this search",note:"What this retrieval did not cover. Not findings about the science."},
 assessment:{name:"Checks that did not run",note:"Capability limits of this deployment, not gaps in knowledge."},
};
function One({g,track,onSet}:{g:RunGap;track:GapTracking;onSet:(id:string,s:GapStatus,note:string)=>void}){
 const [note,setNote]=useState(""),t=track[g.id],status=t?.status??"open";
 return (
  <li className="gr-run" data-status={status}>
   <h4>{g.title}<span className="gr-status" data-s={status}>{LABEL[status]}</span></h4>
   <p>{g.detail}</p>
   <p className="rh-note"><b>Next step.</b> {g.nextStep}{g.candidateIds.length>0&&<> · {g.candidateIds.length} claim{g.candidateIds.length===1?"":"s"} from {g.sourceIds.length} source{g.sourceIds.length===1?"":"s"}</>}</p>
   <div className="rh-choices gr-filter" role="group" aria-label={`Status for: ${g.title}`}>{GAP_STATUSES.map(s=><button key={s} type="button" aria-pressed={status===s} onClick={()=>onSet(g.id,s,note)}>{LABEL[s]}</button>)}</div>
   <label className="rh-note" htmlFor={"rn-"+g.id}>Optional note with the next status change</label>
   <input id={"rn-"+g.id} className="gr-note" value={note} maxLength={300} onChange={e=>setNote(e.target.value)}/>
   {t&&t.history.length>0&&<details><summary>History ({t.history.length})</summary><ol className="gr-hist">{[...t.history].reverse().map((h,i)=><li key={i}>{h.at.slice(0,10)} · {LABEL[h.status]}{h.note?` · ${h.note}`:""}</li>)}</ol></details>}
  </li>
 );
}
/** Gaps derived from one run, grouped by scope so a search limit is never read as a scientific gap. */
export function RunGapList({gaps,track,onSet}:{gaps:RunGap[];track:GapTracking;onSet:(id:string,s:GapStatus,note:string)=>void}){
 if(gaps.length===0)return <p className="rh-empty">No gaps were derived from this run.</p>;
 return <>{(["scientific","retrieval","assessment"] as const).map(sc=>{
  const items=gaps.filter(g=>g.scope===sc);if(items.length===0)return null;
  return <section key={sc} className="gr-scope" aria-label={SCOPE[sc].name}><h3>{SCOPE[sc].name} <small>({items.length})</small></h3><p className="rh-note">{SCOPE[sc].note}</p><ul className="gr-runlist">{items.map(g=><One key={g.id} g={g} track={track} onSet={onSet}/>)}</ul></section>;
 })}</>;
}
