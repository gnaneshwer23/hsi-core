import {useState} from "react";
import {Link} from "react-router-dom";
import {OUTCOMES,createRecord,exportNotebook,summary,type Deviation,type Outcome} from "../../../src/methods/notebook";
import {compareMethodsApi,type CompareOutcome} from "../lib/methodsCompareClient";
import {formatRetryAfterHint} from "../lib/retryAfter";
import {useNotebook} from "../lib/useNotebook";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {Icon} from "../components/home/AppIcons";
import "../styles/research-home.css";

const OL:Record<Outcome,string>={worked:"Worked",partly:"Partly worked",failed:"Failed",unknown:"Not yet known"};
const FAIL={invalid:"Describe the technique in 3 to 120 characters using letters, numbers and simple punctuation.",unavailable:"Open-access text could not be read, so nothing is shown. Nothing was generated."};
function failMessage(out:Exclude<CompareOutcome,{kind:"ok"}>):string{
 if(out.kind==="limited")return`Too many requests. ${formatRetryAfterHint(out.retryAfterSeconds,"Try again in a few minutes.")}`;
 return FAIL[out.kind];
}
const EMPTY_DEV:Deviation={parameter:"",published:"",mine:"",reason:""};
const download=(name:string,text:string)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"application/json"}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};

export function MethodsSharingPage(){
 const nb=useNotebook(),[q,setQ]=useState(""),[busy,setBusy]=useState(false),[out,setOut]=useState<CompareOutcome|null>(null);
 const [f,setF]=useState({technique:"",refTitle:"",doi:"",species:"",tissue:"",cellType:"",reagents:"",instrument:"",outcome:"unknown" as Outcome,note:"",hours:"",cost:""}),[devs,setDevs]=useState<Deviation[]>([{...EMPTY_DEV}]),[msg,setMsg]=useState(""),[impMsg,setImpMsg]=useState("");
 const records=Object.values(nb.notebook).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),sum=summary(nb.notebook);
 const run=async()=>{setBusy(true);setOut(null);setOut(await compareMethodsApi(q.trim()));setBusy(false)};
 const prefill=(label:string,published:string,paper:string)=>{
  setF(x=>({...x,technique:x.technique||(out?.kind==="ok"?out.query:q),refTitle:paper}));
  setDevs(d=>{const first=d.findIndex(x=>!x.parameter&&!x.mine);const nd:Deviation={parameter:label,published,mine:"",reason:""};if(first>=0){const c=[...d];c[first]=nd;return c}return [...d,nd].slice(0,12)});
  setMsg("Filled the form below with that parameter. Add what you did and why.");document.getElementById("mn-h")?.scrollIntoView({block:"start"});
 };
 const save=()=>{
  const r=createRecord({technique:f.technique,reference:{title:f.refTitle,doi:f.doi},deviations:devs,context:{species:f.species,tissue:f.tissue,cellType:f.cellType,reagents:f.reagents,instrument:f.instrument},outcome:f.outcome,outcomeNote:f.note,effort:{hours:f.hours===""?null:Number(f.hours),costGbp:f.cost===""?null:Number(f.cost)}},new Date().toISOString());
  if(!r.ok){setMsg(r.error);return}
  const a=nb.add(r.record);setMsg(a.added?"Saved to your private notebook.":a.error??"Already saved.");
  if(a.added){setF({technique:"",refTitle:"",doi:"",species:"",tissue:"",cellType:"",reagents:"",instrument:"",outcome:"unknown",note:"",hours:"",cost:""});setDevs([{...EMPTY_DEV}])}
 };
 const upd=(i:number,k:keyof Deviation,v:string)=>setDevs(d=>d.map((x,j)=>j===i?{...x,[k]:v}:x));
 return (
  <ResearchAppShell where="Research methods" whereIcon="flask" active="methods">
   <main className="rh-main" id="rh-main" tabIndex={-1}>
    <p className="co-banner" role="note"><b>Private to this browser.</b> You can compare published methods and keep your own notes. Sharing with other researchers is not available yet: it needs accounts, moderation and a biosafety policy. Nothing here is advice on how to run an experiment.</p>
    <section className="rh-card" aria-labelledby="ms-h">
     <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="flask" size={22}/></span><div><h1 id="ms-h">Research methods: paper versus practice</h1><p className="rh-sub">See where open-access papers report different values for the same technique, then record what you actually did, what you changed and what happened. Worked, partly and failed are kept together.</p></div></header>
    </section>

    <section className="rh-card" aria-labelledby="ms-c-h">
     <h2 id="ms-c-h">1. Compare methods across papers</h2>
     <form className="tw-form" onSubmit={e=>{e.preventDefault();void run()}}>
      <label htmlFor="ms-q">Technique and topic</label>
      <input id="ms-q" className="gr-note" maxLength={120} value={q} placeholder="T follicular helper cell differentiation IL-21 in vitro" onChange={e=>setQ(e.target.value)}/>
      <div className="rh-row"><button type="submit" className="rh-primary" disabled={busy||q.trim().length<3}>{busy?"Reading open-access papers…":"Compare open-access papers"}</button></div>
      <p className="rh-note">Reads up to six papers with a CC BY or CC0 licence from Europe PMC. This can take up to half a minute. No model is used.</p>
     </form>
     <div role="status" aria-live="polite">
      {out&&out.kind!=="ok"&&<p className="rh-err" role="alert">{failMessage(out)}</p>}
      {out?.kind==="ok"&&<><p className="rh-note">{out.papers.filter(p=>p.methodsFound).length} papers compared. {out.notes.join(" ")}</p>
       <ul className="ms-papers" aria-label="Papers read">{out.papers.map(p=><li key={p.id}><a href={p.url} target="_blank" rel="noreferrer noopener">{p.title}</a> <small>({p.licence}; {p.methodsFound?`${p.parameters} values found`:"no readable methods"})</small></li>)}</ul></>}
     </div>
     {out?.kind==="ok"&&out.rows.length===0&&<p className="rh-empty">No parameter was reported by at least two of the papers, so there is nothing to compare.</p>}
     {out?.kind==="ok"&&out.rows.length>0&&<ul className="gr-list" aria-label="Where papers differ">{out.rows.map(r=>(
      <li key={r.kind+r.agent+r.label} className="rh-card ms-row">
       <header><h3>{r.label}</h3><span className="gr-status" data-s={r.differs?"investigating":"open"}>{r.differs?"Papers differ":"Papers agree"}</span></header>
       <ul className="ms-vals">{r.byPaper.map(bp=>{const p=out.papers.find(x=>x.id===bp.paperId);return <li key={bp.paperId}><b>{bp.values.map(v=>v.display).join(" · ")}</b> <small>{p?.title.slice(0,70)}</small>
        <details><summary>Quoted sentence</summary>{bp.values.map(v=><blockquote key={v.quote}>{v.quote}</blockquote>)}</details></li>})}</ul>
       <div className="rh-row"><button type="button" className="rh-ghost" onClick={()=>prefill(r.label,r.byPaper[0]?.values[0]?.display??"",out.papers.find(x=>x.id===r.byPaper[0]?.paperId)?.title??"")}>Record what I did for this</button></div>
      </li>))}</ul>}
    </section>

    <section className="rh-card" aria-labelledby="mn-h">
     <h2 id="mn-h">2. My methods notebook</h2>
     <form className="hl-form" onSubmit={e=>{e.preventDefault();save()}}>
      <div className="hl-field"><label htmlFor="mn-t">Technique</label><input id="mn-t" className="gr-note" maxLength={160} value={f.technique} onChange={e=>setF({...f,technique:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="mn-r">Published method you started from (title, optional)</label><input id="mn-r" className="gr-note" maxLength={300} value={f.refTitle} onChange={e=>setF({...f,refTitle:e.target.value})}/></div>
      <div className="hl-field"><label htmlFor="mn-d">DOI (optional)</label><input id="mn-d" className="gr-note" maxLength={120} value={f.doi} onChange={e=>setF({...f,doi:e.target.value})}/></div>
      <fieldset className="hl-gaps"><legend>What you changed from the published method</legend>
       {devs.map((d,i)=><div key={i} className="ms-dev" role="group" aria-label={`Change ${i+1}`}>
        <div className="hl-field"><label htmlFor={`dv-p-${i}`}>Parameter</label><input id={`dv-p-${i}`} className="gr-note" maxLength={80} value={d.parameter} onChange={e=>upd(i,"parameter",e.target.value)}/></div>
        <div className="hl-field"><label htmlFor={`dv-pub-${i}`}>As published</label><input id={`dv-pub-${i}`} className="gr-note" maxLength={120} value={d.published} onChange={e=>upd(i,"published",e.target.value)}/></div>
        <div className="hl-field"><label htmlFor={`dv-m-${i}`}>What I did</label><input id={`dv-m-${i}`} className="gr-note" maxLength={120} value={d.mine} onChange={e=>upd(i,"mine",e.target.value)}/></div>
        <div className="hl-field"><label htmlFor={`dv-r-${i}`}>Why</label><input id={`dv-r-${i}`} className="gr-note" maxLength={300} value={d.reason} onChange={e=>upd(i,"reason",e.target.value)}/></div>
       </div>)}
       <div className="rh-row"><button type="button" className="rh-ghost" disabled={devs.length>=12} onClick={()=>setDevs(d=>[...d,{...EMPTY_DEV}])}>Add another change</button></div>
      </fieldset>
      <div className="ms-ctx">
       {([["species","Species"],["tissue","Tissue"],["cellType","Cell type and state"],["reagents","Reagents (clone, lot or RRID)"],["instrument","Instrument or software version"]] as const).map(([k,l])=><div key={k} className="hl-field"><label htmlFor={"cx-"+k}>{l}</label><input id={"cx-"+k} className="gr-note" maxLength={k==="reagents"?200:120} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}
      </div>
      <div className="hl-field"><label htmlFor="mn-o">What happened</label><select id="mn-o" className="gr-note" value={f.outcome} onChange={e=>setF({...f,outcome:e.target.value as Outcome})}>{OUTCOMES.map(o=><option key={o} value={o}>{OL[o]}</option>)}</select></div>
      <div className="hl-field"><label htmlFor="mn-n">Details (required if it partly worked or failed)</label><textarea id="mn-n" rows={2} maxLength={400} value={f.note} onChange={e=>setF({...f,note:e.target.value})}/></div>
      <div className="ms-ctx"><div className="hl-field"><label htmlFor="mn-h2">Hours spent (optional, self-reported)</label><input id="mn-h2" className="gr-note" inputMode="decimal" value={f.hours} onChange={e=>setF({...f,hours:e.target.value})}/></div><div className="hl-field"><label htmlFor="mn-c">Cost in GBP (optional, self-reported)</label><input id="mn-c" className="gr-note" inputMode="decimal" value={f.cost} onChange={e=>setF({...f,cost:e.target.value})}/></div></div>
      <div className="rh-row"><button type="submit" className="rh-primary">Save to my notebook</button></div>
     </form>
     <div role="status" aria-live="polite">{msg&&<p className="rh-note">{msg}</p>}</div>
    </section>

    <section className="rh-card" aria-labelledby="mr-h">
     <h2 id="mr-h">Saved records</h2>
     {nb.blocked&&<p className="rh-err" role="status">This browser blocked local storage, so your notebook was not kept.</p>}
     <p className="rh-note" role="status">{sum.records===0?"Nothing saved yet.":`${sum.records} records: ${sum.byOutcome.worked} worked, ${sum.byOutcome.partly} partly, ${sum.byOutcome.failed} failed, ${sum.byOutcome.unknown} not yet known. ${sum.effortNote}`}</p>
     <div className="rh-row"><button type="button" className="rh-ghost" disabled={records.length===0} onClick={()=>download("hsi-methods-notebook.json",exportNotebook(nb.notebook))}>Export notebook (JSON)</button>
      <label className="rh-ghost ms-import">Import a notebook file<input type="file" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>1_500_000){setImpMsg("That file is too large.");return}const r=nb.importFrom(await file.text());setImpMsg(`Imported ${r.added}; skipped ${r.skipped}.`);e.target.value=""}}/></label></div>
     <p className="rh-note">Exported files contain your own notes. Check for confidential, unpublished or hazardous material before sharing one.</p>
     <div role="status" aria-live="polite">{impMsg&&<p className="rh-note">{impMsg}</p>}</div>
     <ul className="gr-list" aria-label="Notebook records">{records.map(r=>(
      <li key={r.id} className="rh-card ms-rec"><header><h3>{r.technique}</h3><span className="gr-status" data-s={r.outcome==="worked"?"open":"investigating"}>{OL[r.outcome]}</span></header>
       {r.reference.title&&<p className="rh-note">Started from: {r.reference.doi?<a href={"https://doi.org/"+r.reference.doi} target="_blank" rel="noreferrer noopener">{r.reference.title}</a>:r.reference.title}</p>}
       {r.deviations.length>0&&<ul className="ms-vals">{r.deviations.map((d,i)=><li key={i}><b>{d.parameter}</b>: {d.published||"not stated"} → {d.mine}{d.reason?` (${d.reason})`:""}</li>)}</ul>}
       {r.outcomeNote&&<p>{r.outcomeNote}</p>}
       <p className="rh-note">{[r.context.species,r.context.tissue,r.context.cellType,r.context.reagents,r.context.instrument].filter(Boolean).join(" · ")||"No context recorded."}{r.effort.hours!==null?` · ${r.effort.hours} h (self-reported)`:""}{r.effort.costGbp!==null?` · £${r.effort.costGbp} (self-reported)`:""}</p>
       <div className="rh-row"><button type="button" className="rh-ghost" onClick={()=>nb.remove(r.id)}>Remove this record</button></div></li>))}</ul>
    </section>
    <p className="rh-note">Related: <Link to="/research/ledger">Hypothesis Ledger</Link> · <Link to="/research/journey">Guided walkthrough</Link></p>
   </main>
  </ResearchAppShell>
 );
}
