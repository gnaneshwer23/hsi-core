import {Link} from "react-router-dom";
import {Icon} from "./AppIcons";
import {renderDigestMarkdown,type RadarResult} from "../../../../src/investigation/radar";
import type {Profile} from "../../lib/researchHome";
import {useRadar} from "../../lib/useRadar";
import {RelatedWorksPanel} from "../RelatedWorksPanel";

function Spark({trend,topic}:{trend:{year:number;count:number}[];topic:string}){
 const w=160,h=44,max=Math.max(...trend.map(t=>t.count),1),pts=trend.map((t,i)=>[i*(w-8)/(trend.length-1)+4,h-4-(t.count/max)*(h-10)] as const);
 const first=trend[0]!,last=trend[trend.length-1]!;
 return (
  <svg className="rh-spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${topic}: publications per year from ${first.year} (${first.count.toLocaleString("en-GB")}) to ${last.year} (${last.count.toLocaleString("en-GB")}, partial year)`}>
   <polyline points={pts.map(p=>p.join(",")).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
   <circle cx={pts[pts.length-1]![0]} cy={pts[pts.length-1]![1]} r="3.5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2"/>
  </svg>
 );
}
function download(r:RadarResult){const u=URL.createObjectURL(new Blob([renderDigestMarkdown(r)],{type:"text/markdown"}));const a=document.createElement("a");a.href=u;a.download=`hsi-digest-${r.generatedAt.slice(0,10)}.md`;a.click();URL.revokeObjectURL(u)}
const ago=(iso:string)=>{const m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/60000));return m<1?"just now":m<60?`${m} min ago`:`${Math.round(m/60)} h ago`};
const WINDOWS:[1|2|7|30,string][]=[[2,"2 days"],[7,"7 days"],[30,"30 days"]];

/** Research Radar: new papers and activity for the researcher's own topics, with their own papers. Visual first, details expand. */
export function RadarCard({profile,ready}:{profile:Profile;ready:boolean}){
 const {state,want,days,setWindow,refresh}=useRadar(profile,ready);
 const d=state.data;
 return (
  <section className="rh-card rh-wide rh-radar" id="rh-radar" aria-labelledby="rh-radar-h">
   <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="trend" size={22}/></span>
    <div><h2 id="rh-radar-h">Research radar</h2><p className="rh-sub">{d?`Updated ${ago(d.generatedAt)}${state.fromCache?" (saved on this device)":""} · papers first published ${d.window.from} to ${d.window.to}`:"New papers and activity for your topics."}</p></div>
    {want&&<div className="rh-radar-tools"><div className="rh-seg" role="group" aria-label="Time window">{WINDOWS.map(([v,l])=><button key={v} type="button" aria-pressed={days===v} onClick={()=>setWindow(v)}>{l}</button>)}</div>
     <button type="button" className="rh-ghost" onClick={refresh} disabled={state.status==="loading"}>Refresh</button>
     {d&&<button type="button" className="rh-ghost" onClick={()=>download(d)}>Download digest</button>}</div>}
   </header>
   {!want&&<div className="rh-radar-empty"><p>Add a few topics, genes or diseases, or your ORCID iD, and the radar shows what is new in your area, how active it is, and your own papers.</p><Link className="rh-primary" to="/welcome">Set up my radar</Link></div>}
   {want&&state.status==="loading"&&!d&&<div className="rh-skel" aria-hidden="true"/>}
   <div role="status" aria-live="polite">{state.status==="loading"&&<p className="rh-note">Checking Europe PMC and OpenAlex…</p>}{state.status==="error"&&<p className="rh-err" role="alert">{state.error} Nothing was generated, so an empty radar here does not mean nothing is new.</p>}</div>
   {d&&<div className="rh-radar-grid">
    {d.topics.map(t=>(
     <article key={t.topic} className="rh-rtile" data-status={t.status}>
      <h3>{t.topic}</h3>
      {t.status==="failed"?<p className="rh-err">Search failed ({t.error}). Absence of results is not evidence of absence.</p>:<>
       <p className="rh-big"><b>{t.newCount.toLocaleString("en-GB")}</b> new in {d.window.days} days</p>
       {t.trend?<Spark trend={t.trend} topic={t.topic}/>:<p className="rh-note">Trend unavailable{t.trendError?` (${t.trendError})`:""}.</p>}
       {t.papers.length>0&&<details><summary>Latest papers ({t.papers.length} of {t.newCount})</summary><ul className="rh-plist">{t.papers.map(p=>(
        <li key={p.sourceId}><a href={p.url} target="_blank" rel="noreferrer noopener">{p.title}</a><span>{p.journal??"journal not given"} · {p.date??"date not given"}{p.preprint?" · preprint":""}{p.retraction==="flagged"?" · flagged retracted":""}</span></li>))}</ul></details>}</>}
     </article>))}
    {d.own.status!=="not_requested"&&<article className="rh-rtile" data-status={d.own.status}>
     <h3>Your papers</h3>
     {d.own.status==="failed"?<p className="rh-err">Lookup failed ({d.own.error}).</p>:<>
      <p className="rh-big"><b>{d.own.papers.length}</b> found</p>
      <details><summary>Show papers{d.own.unresolved.length?` · ${d.own.unresolved.length} not resolved`:""}</summary><ul className="rh-plist">{d.own.papers.map(p=>(
       <li key={p.sourceId}><a href={p.url} target="_blank" rel="noreferrer noopener">{p.title}</a><span>{p.journal??"journal not given"} · {p.date??"date not given"}{p.citedBy!==null?` · cited by ${p.citedBy}`:""}</span></li>))}</ul>
       {d.own.unresolved.length>0&&<p className="rh-note">Not resolved: {d.own.unresolved.join(", ")}</p>}</details></>}
    </article>}
   </div>}
   {d&&d.own.papers[0]&&(
    <RelatedWorksPanel
     doi={d.own.papers[0].doi}
     pmid={d.own.papers[0].pmid}
     openalexSourceId={d.own.papers[0].provider==="openalex"?d.own.papers[0].sourceId:null}
    />
   )}
   {d&&<p className="rh-note">{d.note} Cadence: {profile.cadence==="off"?"manual":profile.cadence}; the radar refreshes when you open HSI. Email delivery is not available yet.</p>}
  </section>
 );
}
