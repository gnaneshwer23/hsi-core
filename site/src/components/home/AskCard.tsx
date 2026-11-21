import {useId,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ASK_MAX,askLengthOk} from "../../lib/askClient";
import {useAsk} from "../../lib/useAsk";
import {HowProducedPanel} from "../HowProducedPanel";
import {Icon} from "./AppIcons";

 const FAIL:Record<string,string>={
 unavailable:"Ask is not available on this deployment yet. Nothing was run.",
 invalid:"Ask a question between 8 and 500 characters.",
 error:"The question could not be answered. No findings were generated.",
};
function limitedMessage(retryAfterSeconds?:number):string{
 if(retryAfterSeconds===undefined)return"You have reached the hourly limit for questions. Try again later.";
 const minutes=Math.max(1,Math.ceil(retryAfterSeconds/60));
 return`You have reached the hourly limit for questions. Try again in about ${minutes} minute${minutes===1?"":"s"}.`;
}
/** Signed-in question box. Routes to curated investigations only, and says so. No agent names; the trace shows how the answer was produced. */
export function AskCard(){
 const {access,busy,outcome,saveNote,submit,saveRun}=useAsk(),nav=useNavigate(),[q,setQ]=useState(""),id=useId();
 const ok=askLengthOk(q);
 return (
  <section className="rh-card rh-ask" aria-labelledby={id+"-h"}>
   <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="spark" size={22}/></span><div><h2 id={id+"-h"}>Ask a question</h2><p className="rh-sub">Answers come from curated investigations over live public sources. Questions outside them are not answered.</p></div></header>
   {access==="checking"&&<div className="rh-skel" aria-hidden="true"/>}
   {access==="signed-out"&&<p className="rh-empty"><Link to="/sign-in">Sign in</Link> to ask a question. <Link to="/sign-up">Create an account</Link> if you do not have one.</p>}
   {access==="unverified"&&<p className="rh-empty">Verify your email to ask a question. <Link to="/research/account">Verify now</Link></p>}
   {access==="ready"&&<form className="rh-ask-form" onSubmit={e=>{e.preventDefault();if(ok&&!busy)void submit(q)}}>
    <label htmlFor={id+"-q"}>Your question</label>
    <textarea id={id+"-q"} value={q} maxLength={ASK_MAX} rows={3} onChange={e=>setQ(e.target.value)} aria-describedby={id+"-n"} placeholder="For example: does IL-21 signalling drive T follicular helper cells in autoimmune disease?"/>
    <div className="rh-row"><button type="submit" className="rh-primary" disabled={!ok||busy}><Icon name="spark" size={16}/>{busy?"Running…":"Ask"}</button><span id={id+"-n"} className="rh-note">{q.trim().length}/{ASK_MAX}. Sent to the server; the run can take up to half a minute.</span></div>
   </form>}
   <div role="status" aria-live="polite" className="rh-ask-out">
    {busy&&<p className="rh-note">Searching Europe PMC, OpenAlex and Open Targets…</p>}
    {outcome?.kind==="limited"&&<p className="rh-err" role="alert">{limitedMessage(outcome.retryAfterSeconds)}</p>}
    {outcome&&outcome.kind in FAIL&&<p className="rh-err" role="alert">{FAIL[outcome.kind]}</p>}
    {outcome?.kind==="unrouted"&&<div className="rh-panel"><p>{outcome.message}</p>{outcome.available.length>0&&<><b>What can be asked today</b><ul className="rh-ask-list">{outcome.available.map(a=><li key={a.id}><button type="button" className="rh-link" onClick={()=>setQ(a.question)}>{a.question}</button></li>)}</ul></>}</div>}
    {outcome?.kind==="routed"&&<div className="rh-panel rh-ask-result">
     <p><b>{outcome.run.question}</b></p>
     <p className="rh-note">{outcome.run.candidates.length} candidate claims from {outcome.run.records.length} sources. All unreviewed; candidates, not findings.{outcome.run.verification.status==="not_configured"?" The model check did not run: "+(outcome.run.verification.reason??"not configured")+".":""}</p>
     <HowProducedPanel source={{kind:"ask",trace:outcome.trace,run:outcome.run}}/>
     <div className="rh-row"><button type="button" className="rh-primary" onClick={()=>{if(saveRun())nav("/research/workspace?reopen=1")}}>Open in workspace</button></div>
     {saveNote&&<p className="rh-note">{saveNote}</p>}
    </div>}
   </div>
  </section>
 );
}
