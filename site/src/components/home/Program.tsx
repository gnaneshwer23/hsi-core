import {useMemo,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import type {DomainBundle} from "../../../../src/knowledgeGraph/domainGraph";
import type {Profile} from "../../lib/researchHome";
import {answerFromGraph,programView,isFiltered,NO_FILTER,DEMO_PROFILE,type GraphFilter,type Reply} from "../../lib/program";
import {DEMO_NOTE,demoDigest,demoEvents,demoOrgs} from "../../lib/demoProgram";
import {ProgramGraph} from "./ProgramGraph";
import {GraphFilters} from "./GraphFilters";
import {Icon} from "./AppIcons";

type Tab="graph"|"focus"|"ask"|"landscape"|"updates";
const TABS:{id:Tab;label:string;icon:string}[]=[
 {id:"graph",label:"Knowledge graph",icon:"graph"},{id:"focus",label:"Gaps and methods",icon:"target"},{id:"ask",label:"Ask the graph",icon:"search"},
 {id:"landscape",label:"Landscape",icon:"users"},{id:"updates",label:"Updates",icon:"bell"},
];
const Demo=()=><span className="pr-demo">Demo</span>;
const SUGGEST=(a:string[])=>[a[0]?`What is ${a[0]} connected to?`:"",a.length>1?`How are ${a[0]} and ${a[1]} connected?`:"",a[0]?`Which methods are used for ${a[0]}?`:""].filter(Boolean);

/** The researcher's own program: everything below is computed from their anchors, not from graph-wide totals. */
export function Program({profile,bundle,onProfile}:{profile:Profile;bundle:DomainBundle|null;onProfile:(p:Profile)=>void}){
 const [params]=useSearchParams(),demo=params.get("demo")==="1";
 const [tab,setTab]=useState<Tab>("graph"),[depth,setDepth]=useState<1|2|3>(1),[cohort,setCohort]=useState(false);
 const [q,setQ]=useState(""),[reply,setReply]=useState<{q:string;r:Reply}|null>(null);
 const [f,setF]=useState<GraphFilter>(NO_FILTER);
 const base=useMemo(()=>bundle?programView(profile,bundle,depth,{...NO_FILTER,extra:f.extra}):null,[bundle,profile,depth,f.extra]);
 const view=useMemo(()=>bundle?programView(profile,bundle,depth,f):null,[bundle,profile,depth,f]);
 const names=view?.anchors.map(a=>a.name)??[];
 if(!bundle)return <section className="pm-card pr" aria-labelledby="pr-h"><h2 id="pr-h">Your knowledge graph</h2><p className="rh-empty">Verifying the published graph…</p></section>;
 if(!view||!view.anchors.length)return (
  <section className="pm-card pr" aria-labelledby="pr-h">
   <header><h2 id="pr-h">Your knowledge graph</h2></header>
   <p className="rh-empty">Add a topic, or follow a concept, and this section becomes yours: your own graph, the gaps and methods around it, a way to ask about it, and updates. To see how it works, load an example autoimmune researcher.</p>
   <div className="rh-row"><Link className="rh-primary" to="/welcome">Set up my program</Link><button type="button" className="rh-ghost" onClick={()=>onProfile(DEMO_PROFILE)}>Load a demo autoimmune profile <Demo/></button></div>
  </section>
 );
 const ask=(text:string)=>{const t=text.trim();if(t)setReply({q:t,r:answerFromGraph(bundle,t)})};
  const topic=names[0]??"your topic";
 return (
  <section className="pm-card pr" aria-labelledby="pr-h">
   <header><div><h2 id="pr-h">Your knowledge graph</h2><p className="pm-note">Built from {view.anchors.length} anchor{view.anchors.length===1?"":"s"}: {view.anchors.map(a=><span key={a.id} className="pr-chip" title={a.why}>{a.name}</span>)}</p></div>
    <div className="pr-depth" role="group" aria-label="How far to expand from your anchors">{([1,2,3] as const).map(d=><button key={d} type="button" aria-pressed={depth===d} onClick={()=>setDepth(d)}>{d} hop{d===1?"":"s"}</button>)}</div>
   </header>
   <p className="pr-sum"><b>{view.hop.size}</b> concepts · <b>{view.edges.length}</b> recorded relationships · <b>{view.gaps.length}</b> gaps touch your area · <b>{view.human}</b> with human evidence. Candidates, none reviewed.</p>
   {demo&&<p className="pr-box" role="note"><Demo/> Demo content is switched on: the Landscape and Updates tabs show illustrative placeholders, not real organisations, events or publications. <Link to="/research/home">Switch it off</Link></p>}
   <div className="pr-tabs" role="group" aria-label="Program sections">{TABS.filter(t=>demo||(t.id!=="landscape"&&t.id!=="updates")).map(t=><button key={t.id} type="button" aria-pressed={tab===t.id} onClick={()=>setTab(t.id)}><Icon name={t.icon} size={16}/>{t.label}</button>)}</div>

   {tab==="graph"&&<div className="pr-pane">
    {base&&<GraphFilters bundle={bundle} base={base} f={f} setF={setF}/>}
    {view.edges.length>0?<ProgramGraph bundle={bundle} view={view}/>:<p className="rh-empty" role="status">{isFiltered(f)?"No relationships match the current filters. That is a filter result, not evidence of absence. Reset or widen them.":"Your anchors have no recorded relationships yet."}</p>}
    <label className="pr-check"><input type="checkbox" checked={cohort} onChange={e=>setCohort(e.target.checked)}/> Connect synthetic patient data <Demo/></label>
    {cohort&&<p className="pr-box">Of the {view.edges.length} recorded relationships in your area, <b>{view.human}</b> already rest on human evidence. A phenotype built from your anchors would be evaluated in the separate, governed cohort plane, which returns only small-group-protected totals after approval, and patient data here is synthetic. This shows the flow, not a clinical result. <Link to="/research/cohort">Open the synthetic cohort</Link></p>}
   </div>}

   {tab==="focus"&&<div className="pr-pane pr-two">
    <div><h3>Gaps recorded around your anchors</h3>
     {view.gaps.length===0?<p className="rh-empty">No recorded gap touches your area at {depth} hop{depth===1?"":"s"}. That is a coverage limit, not a finding. Raise the depth or investigate with live sources.</p>:<ul className="pr-list">{view.gaps.slice(0,4).map(g=><li key={g.id}><b>{g.question}</b><span>Missing: {g.missing}</span><Link to="/research/gaps">Open in the Gap Register</Link></li>)}</ul>}
    </div>
    <div><h3>Methods already used in your area</h3>
     {view.methods.length===0?<p className="rh-empty">No recorded methods yet.</p>:<ul className="pr-list">{view.methods.map(m=><li key={m.model+m.design}><b>{m.model}</b><span>{m.design}</span><small>{m.count} relationship{m.count===1?"":"s"}</small></li>)}</ul>}
     <p className="pm-note"><Link to="/research/methods">Compare research methods</Link></p>
    </div>
   </div>}

   {tab==="ask"&&<div className="pr-pane">
    <p className="pr-box">Answers are read directly from the published graph, with each relationship's model and source. Nothing is generated, so a question outside the graph gets "no match".</p>
    <form className="pr-ask" onSubmit={e=>{e.preventDefault();ask(q)}}><label htmlFor="pr-q" className="rh-vh">Ask about your topic</label><input id="pr-q" value={q} maxLength={200} onChange={e=>setQ(e.target.value)} placeholder={`e.g. How are ${names[0]??"A"} and ${names[1]??"B"} connected?`}/><button className="rh-primary" type="submit">Ask</button></form>
    <div className="pr-sug">{SUGGEST(names).map(s=><button key={s} type="button" className="rh-ghost" onClick={()=>{setQ(s);ask(s)}}>{s}</button>)}</div>
    <div role="status" aria-live="polite">{reply&&<div className="pr-reply"><p className="pr-you">{reply.q}</p><p>{reply.r.text}</p>{reply.r.lines.length>0&&<ul>{reply.r.lines.map((l,i)=><li key={i}>{l}</li>)}</ul>}<div className="rh-row">{reply.r.links.map(l=><Link key={l.to} to={l.to}>{l.label}</Link>)}</div></div>}</div>
   </div>}

   {demo&&tab==="landscape"&&<div className="pr-pane">
    <p className="pr-box"><Demo/> {DEMO_NOTE} In a live version these come from public sources such as trial registries and pipeline data, each linked.</p>
    <div className="pr-two"><div><h3>Organisations in {topic}</h3><ul className="pr-list">{demoOrgs(topic).map(o=><li key={o.id}><b>{o.name}</b><span>What: {o.what}</span><span>How: {o.how}</span><small>Learn: {o.learn}</small></li>)}</ul></div>
    <div><h3>Webinars and opportunities</h3><ul className="pr-list">{demoEvents(topic).map(e=><li key={e.id}><b>{e.title}</b><span>{e.kind} · {e.when}</span><small>{e.who}</small></li>)}</ul></div></div>
   </div>}

   {demo&&tab==="updates"&&<div className="pr-pane">
    <p className="pr-box"><Demo/> An illustration of a {profile.cadence==="daily"?"daily":"weekly"} digest for {names.slice(0,3).join(", ")}. Your real, live literature scan is the Research radar further down this page.</p>
    <ul className="pr-list">{demoDigest(names).map(d=><li key={d.id}><b>{d.title}</b><span>{d.kind} · {d.why}</span></li>)}</ul>
    <div className="pr-depth" role="group" aria-label="Digest cadence">{(["off","weekly","daily"] as const).map(c=><button key={c} type="button" aria-pressed={profile.cadence===c} onClick={()=>onProfile({...profile,cadence:c})}>{c==="off"?"Off":c==="weekly"?"Weekly":"Daily"}</button>)}</div>
   </div>}

  </section>
 );
}
