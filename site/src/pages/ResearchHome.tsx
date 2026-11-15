import {useEffect,useMemo,useRef,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {matchScenario} from "../../../src/investigation/scenarios";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {departments} from "../lib/departments";
import {NetworkView} from "../components/graph/GraphCharts";
import {HsiIdentity} from "../components/HsiIdentity";
import {DEPT_ICON,HeroNetwork,Icon} from "../components/home/AppIcons";
import {EMPTY_PROFILE,LIVE_RUN_KEY,summariseSavedLiveRun,type SavedLiveRun,classifyIntent,focusNetwork,GOALS,INVESTIGATION_STATUS,loadProfile,looksLikeTrialId,recommend,resetProfile,ROLES,saveProfile,searchEntities,type Profile} from "../lib/researchHome";
import "../styles/research-home.css";

type Saved={id:string;question:string;createdAt:string;state:string};
type SavedState={kind:"loading"}|{kind:"ok";items:Saved[]}|{kind:"blocked";message:string}|{kind:"error"};
const graphHref=(q:string)=>"/research/knowledge-graph?netQuery="+encodeURIComponent(q);
const investigateHref=(q:string)=>"/research/dashboard?q="+encodeURIComponent(q.slice(0,500))+"#dashboard-workspace";
const deptIcon=(slug:string)=>DEPT_ICON[slug]??"graph";
const n=(x:number)=>x.toLocaleString("en-GB");

function useBundle(){
 const [bundle,setBundle]=useState<DomainBundle|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{if(!c.signal.aborted)setFailed(true)}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 return {bundle,failed};
}
function useSaved():SavedState{
 const [s,setS]=useState<SavedState>({kind:"loading"});
 useEffect(()=>{
  const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);
  fetch("/api/research/investigations",{credentials:"same-origin",cache:"no-store",redirect:"error",signal:c.signal,headers:{Accept:"application/json"}}).then(async r=>{
   if(r.status===401)return setS({kind:"blocked",message:"Sign in with a verified research account to see your saved investigations."});
   if(r.status===403)return setS({kind:"blocked",message:"Research access has not been confirmed for this account."});
   if(!r.ok||!(r.headers.get("content-type")??"").includes("json"))return setS({kind:"error"});
   const b=await r.json() as {items?:Saved[]};
   setS({kind:"ok",items:Array.isArray(b.items)?b.items.filter(i=>i&&typeof i.id==="string"&&typeof i.question==="string").slice(0,50):[]});
  }).catch(()=>{if(!c.signal.aborted)setS({kind:"error"})}).finally(()=>clearTimeout(t));
  return()=>{c.abort();clearTimeout(t)};
 },[]);
 return s;
}

function Onboarding({profile,onDone}:{profile:Profile;onDone:(p:Profile)=>void}){
 const [step,setStep]=useState(0),[draft,setDraft]=useState(profile);
 const toggle=(k:"goals"|"interests",v:string)=>setDraft(d=>({...d,[k]:d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]}));
 const finish=(skip:boolean)=>onDone({...(skip?profile:draft),onboarded:true});
 const steps=["Your role","Research interests","Research goals"];
 return (
  <section className="rh-card rh-onboard" aria-labelledby="rh-ob-h">
   <div className="rh-card-head"><div><h2 id="rh-ob-h">Tailor your research home</h2><p className="rh-sub">Optional. Interests tune suggestions and never limit what you can search.</p></div><span className="rh-badge">Step {step+1} of 3</span></div>
   <ol className="rh-steps" aria-label="Setup steps">{steps.map((t,i)=><li key={t} aria-current={i===step?"step":undefined} data-done={i<step}><span>{i<step?<Icon name="check" size={14}/>:i+1}</span>{t}</li>)}</ol>
   {step===0&&<fieldset><legend>What best describes your work?</legend><div className="rh-choices">{ROLES.map(r=><button key={r} type="button" aria-pressed={draft.role===r} onClick={()=>setDraft(d=>({...d,role:d.role===r?null:r}))}><i aria-hidden="true"/>{r}</button>)}</div></fieldset>}
   {step===1&&<fieldset><legend>Which areas of biology interest you?</legend><div className="rh-choices">{departments.map(d=><button key={d.slug} type="button" aria-pressed={draft.interests.includes(d.slug)} onClick={()=>toggle("interests",d.slug)}><i aria-hidden="true"/>{d.name}</button>)}</div></fieldset>}
   {step===2&&<fieldset><legend>What are you trying to do?</legend><div className="rh-choices">{GOALS.map(g=><button key={g} type="button" aria-pressed={draft.goals.includes(g)} onClick={()=>toggle("goals",g)}><i aria-hidden="true"/>{g}</button>)}</div></fieldset>}
   <div className="rh-row rh-onboard-actions">
    {step>0&&<button type="button" className="rh-ghost" onClick={()=>setStep(step-1)}>Back</button>}
    {step<2?<button type="button" className="rh-primary" onClick={()=>setStep(step+1)}>Next <Icon name="arrow" size={16}/></button>:<button type="button" className="rh-primary" onClick={()=>finish(false)}>Save and continue <Icon name="arrow" size={16}/></button>}
    <button type="button" className="rh-ghost" onClick={()=>finish(true)}>Skip for now</button>
    <span className="rh-note">Saved on this device only.</span>
   </div>
  </section>
 );
}

function SearchHero({bundle,profile,follow,inputRef}:{bundle:DomainBundle|null;profile:Profile;follow:(id:string,name:string)=>void;inputRef:React.RefObject<HTMLInputElement|null>}){
 const nav=useNavigate(),[q,setQ]=useState("");
 const hits=useMemo(()=>bundle?searchEntities(bundle.nodes,q):[],[bundle,q]);
 const intent=classifyIntent(q,hits),trial=looksLikeTrialId(q);
 const followed=new Set(profile.followed.map(f=>f.id)),live=matchScenario(q);
 return (
  <section className="rh-hero" aria-labelledby="rh-search-h">
   <HeroNetwork/>
   <div className="rh-hero-copy">
    <h1 id="rh-title">{profile.onboarded&&(profile.interests.length||profile.followed.length)?"Welcome back. What would you like to investigate?":"What would you like to investigate?"}</h1>
    <h2 id="rh-search-h" className="rh-vh">Search and investigate</h2>
    <label htmlFor="rh-q" className="rh-vh">Investigate a gene, pathway, disease, mechanism or research question</label>
    <div className="rh-searchbar">
     <Icon name="search" size={22}/>
     <input id="rh-q" ref={inputRef} type="search" value={q} maxLength={500} autoComplete="off" onChange={e=>setQ(e.target.value)} placeholder="Investigate a gene, pathway, disease, biological mechanism or research question…" aria-describedby="rh-q-help"/>
     <button type="button" className="rh-go" onClick={()=>{const t=q.trim();if(!t){inputRef.current?.focus();return}nav(live?"/research/investigate#live-investigation":investigateHref(intent==="investigation"?t:`What does the evidence say about ${t}?`))}}><Icon name="spark" size={18}/> Investigate</button>
    </div>
    <p id="rh-q-help" className="rh-note">{bundle?`Searching ${n(bundle.nodes.length)} concepts in the published graph (candidates, unreviewed). Entities outside it are not searched yet.`:"Verifying the published graph…"}</p>
    <div role="status" aria-live="polite" className="rh-results">
     {intent!=="empty"&&<div className="rh-panel">
      {hits.length>0&&<ul className="rh-hits" aria-label="Matching concepts">{hits.map(h=>(
       <li key={h.id}><span className="rh-ico-tile" aria-hidden="true"><Icon name="graph" size={18}/></span><div><b>{h.name}</b><span>{h.kind}{h.matchedOn!==h.name?` · matched “${h.matchedOn}”`:""}</span><small>Graph concept {h.id.replace(/^concept:/,"").slice(0,40)}</small></div>
        <div className="rh-row"><Link to={graphHref(h.name)}>Open in graph</Link><button type="button" className="rh-ghost" aria-pressed={followed.has(h.id)} onClick={()=>follow(h.id,h.name)}>{followed.has(h.id)?"Following":"Follow"}</button><Link to={investigateHref(`What does the evidence say about ${h.name}, and in which contexts?`)}>Investigate</Link></div></li>))}</ul>}
      {hits.length===0&&bundle&&<p>No concept in the published graph matches “{q.trim()}”. {trial?"This looks like a clinical trial identifier; trial records are not searched from here yet. ":""}Try a broader term or an alternative name, or start an investigation from it.</p>}
      <div className="rh-intent">
       <p>{intent==="investigation"?"This reads as a research question. Choose how to work on it:":"You can also treat this as a question:"}</p>
       <div className="rh-row">
        <Link className="rh-ghost" to={graphHref(q.trim())}>Quick Explore in the graph</Link>
        {live&&<Link className="rh-primary" to="/research/investigate#live-investigation"><Icon name="spark" size={16}/> Deep Investigate: run live</Link>}
        <Link className={live?"rh-ghost":"rh-primary"} to={investigateHref(intent==="investigation"?q.trim():`What does the evidence say about ${q.trim()}?`)}>{live?"Save question for review":"Deep Investigate (saved question)"}</Link>
       </div>
       <p className="rh-note">{live?"This matches a curated scenario, so a live run is available: it searches Europe PMC, OpenAlex and Open Targets now, then two models check the direction of the best claims. Nothing starts until you press Run on the next page.":"Live runs cover curated scenarios only (currently IL-21 across autoimmune diseases). Your question can be saved for scientific review, which needs a research account."} Quick Explore reads the published graph.</p>
      </div>
     </div>}
    </div>
   </div>
  </section>
 );
}

export function ResearchHome(){
 const [profile,setProfile]=useState<Profile>(EMPTY_PROFILE),[ready,setReady]=useState(false),[noStore,setNoStore]=useState(false),[menu,setMenu]=useState(false),[adding,setAdding]=useState(false),[topic,setTopic]=useState("");
 const {bundle,failed}=useBundle(),saved=useSaved(),inputRef=useRef<HTMLInputElement|null>(null);
 const [liveRun,setLiveRun]=useState<SavedLiveRun|null>(null);
 // Read device storage after mount so server and client render the same first frame.
 useEffect(()=>{setProfile(loadProfile());setReady(true);try{setLiveRun(summariseSavedLiveRun(localStorage.getItem(LIVE_RUN_KEY)))}catch{setLiveRun(null)}},[]);
 useEffect(()=>{if(!ready)return;if(!saveProfile(profile))setNoStore(true)},[profile,ready]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();inputRef.current?.focus()}};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[]);
 const update=(fn:(p:Profile)=>Profile)=>setProfile(p=>fn(p));
 const follow=(id:string,name:string)=>update(p=>p.followed.some(f=>f.id===id)?{...p,followed:p.followed.filter(f=>f.id!==id)}:{...p,followed:[...p.followed,{id,name}].slice(-50)});
 const recs=useMemo(()=>bundle?recommend(profile,bundle):[],[bundle,profile]);
 const centre=profile.followed[0]?.id??recs[0]?.id??null;
 const net=useMemo(()=>bundle&&centre?focusNetwork(bundle,centre):null,[bundle,centre]);
 const toggleInterest=(slug:string)=>update(p=>({...p,interests:p.interests.includes(slug)?p.interests.filter(x=>x!==slug):[...p.interests,slug]}));
 const addTopic=()=>{const t=topic.trim().slice(0,80);if(t)update(p=>p.interests.includes(t)?p:{...p,interests:[...p.interests,t].slice(0,20)});setTopic("");setAdding(false)};
 const custom=profile.interests.filter(i=>!departments.some(d=>d.slug===i));
 const savedItems=saved.kind==="ok"?saved.items:[];
 const edges=bundle?bundle.edges.filter(e=>e.kind==="source_candidate").length:0;
 return (
  <div className="rh-app">
   <a className="rh-skip" href="#rh-main">Skip to the research home</a>
   <header className="rh-top">
    <button type="button" className="rh-menu" aria-expanded={menu} aria-controls="rh-nav" onClick={()=>setMenu(m=>!m)}><Icon name={menu?"x":"menu"} size={20}/><span className="rh-vh">Menu</span></button>
    <Link to="/" className="rh-brand" aria-label="Human Super Intelligence, public site"><HsiIdentity/></Link>
    <span className="rh-sep" aria-hidden="true"/>
    <span className="rh-where"><Icon name="home" size={18}/> Research Home</span>
    <button type="button" className="rh-kbd" onClick={()=>inputRef.current?.focus()} aria-label="Focus search (Command K)"><Icon name="search" size={16}/> Search <kbd>⌘K</kbd></button>
    <a className="rh-iconbtn" href="#rh-updates" aria-label="Scientific updates: none connected"><Icon name="bell" size={19}/></a>
    <Link className="rh-iconbtn" to="/research/account" aria-label="Profile and access"><Icon name="user" size={19}/></Link>
   </header>
   <div className="rh-body">
    <aside className="rh-nav" id="rh-nav" data-open={menu} aria-label="Research navigation">
     <nav aria-label="Primary"><ul>
      <li><Link to="/research/home" aria-current="page"><Icon name="home"/>Home</Link></li>
      <li><Link to="/research/dashboard#dashboard-workspace"><Icon name="flask"/>Investigations</Link></li>
      <li><Link to="/research/knowledge-graph"><Icon name="graph"/>Knowledge Graph</Link></li>
      <li><Link to="/evidence-intelligence"><Icon name="layers"/>Evidence Intelligence</Link></li>
      <li><a href="#rh-library"><Icon name="book"/>Research Library</a></li>
      <li><a href="#rh-updates"><Icon name="bell"/>Scientific Updates</a></li></ul></nav>
     <nav aria-label="Explore science"><h2>Explore science</h2><ul>{departments.map(d=><li key={d.slug}><Link to={"/research/knowledge-graph?netDepartment="+d.slug}><Icon name={deptIcon(d.slug)}/>{d.name}</Link></li>)}</ul></nav>
     <nav aria-label="Account"><h2>Account</h2><ul><li><Link to="/research/account"><Icon name="user"/>Profile and access</Link></li><li><a href="#rh-interests"><Icon name="spark"/>Preferences</a></li></ul></nav>
     <div className="rh-status"><b>Research preview</b><span>Candidate-only graph. Nothing is scientifically approved. No clinical advice.</span></div>
    </aside>

    <main className="rh-main" id="rh-main" tabIndex={-1}>
     <SearchHero bundle={bundle} profile={profile} follow={follow} inputRef={inputRef}/>
     {failed&&<p className="rh-err" role="alert">The published graph could not be loaded, so concept search and suggestions are unavailable. No substitute results are shown.</p>}
     {noStore&&<p className="rh-err" role="status">This browser blocked local storage, so preferences will not be kept.</p>}
     {ready&&!profile.onboarded&&<Onboarding profile={profile} onDone={p=>setProfile(p)}/>}

     <section className="rh-interests" id="rh-interests" aria-labelledby="rh-int-h">
      <div className="rh-line"><h2 id="rh-int-h">Research interests</h2><span className="rh-note">On this device only</span></div>
      <div className="rh-pills">
       {departments.map(d=><button key={d.slug} type="button" aria-pressed={profile.interests.includes(d.slug)} onClick={()=>toggleInterest(d.slug)}><Icon name={deptIcon(d.slug)} size={16}/>{d.name}</button>)}
       {custom.map(c=><button key={c} type="button" aria-pressed="true" onClick={()=>toggleInterest(c)} aria-label={`Remove topic ${c}`}><Icon name="spark" size={16}/>{c} <Icon name="x" size={14}/></button>)}
       {adding?<form className="rh-add" onSubmit={e=>{e.preventDefault();addTopic()}}><label className="rh-vh" htmlFor="rh-topic">New research topic</label><input id="rh-topic" autoFocus value={topic} maxLength={80} onChange={e=>setTopic(e.target.value)} placeholder="Gene, pathway, disease…"/><button type="submit" className="rh-primary">Add</button><button type="button" className="rh-ghost" onClick={()=>{setAdding(false);setTopic("")}}>Cancel</button></form>:<button type="button" className="rh-addbtn" onClick={()=>setAdding(true)}><Icon name="plus" size={16}/>Add interest</button>}
      </div>
      <p className="rh-note">Interests only tune suggestions. Every area stays searchable. {profile.onboarded&&<button type="button" className="rh-link" onClick={()=>setProfile(resetProfile())}>Reset personalisation</button>}</p>
     </section>

     <div className="rh-grid">
      <section className="rh-card" aria-labelledby="rh-cont-h">
       <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="layers" size={22}/></span><div><h2 id="rh-cont-h">Continue researching</h2><p className="rh-sub">Pick up where you left off.</p></div><Link className="rh-arrow" to="/research/dashboard#dashboard-workspace" aria-label="All investigations"><Icon name="chevron" size={18}/></Link></header>
       {liveRun&&<ul className="rh-rows rh-live"><li><div><b>{liveRun.question}</b><span>Live investigation · saved in this browser</span><small>{liveRun.checked} claims checked by two models · {liveRun.supporting} supporting · {liveRun.opposing} opposing · {liveRun.candidates} candidates, all unreviewed</small></div><Link to="/research/investigate?reopen=1#live-investigation">Reopen</Link></li></ul>}
       {saved.kind==="loading"&&<div className="rh-skel" aria-hidden="true"/>}
       {saved.kind==="blocked"&&<p className="rh-empty">{saved.message} <Link to="/sign-in">Sign in</Link></p>}
       {saved.kind==="error"&&<p className="rh-empty">Saved investigations are temporarily unavailable.</p>}
       {saved.kind==="ok"&&savedItems.length===0&&!liveRun&&<p className="rh-empty">No saved investigations yet. Start with a question above.</p>}
       {savedItems.length>0&&<ul className="rh-rows">{savedItems.slice(0,4).map(i=>(
        <li key={i.id}><div><b>{i.question}</b><span>{INVESTIGATION_STATUS[i.state]??i.state}</span><small>Created {new Date(i.createdAt).toLocaleDateString("en-GB")}</small></div><Link to={"/research/decision-workbench?investigation="+encodeURIComponent(i.id)}>Resume</Link></li>))}</ul>}
       {saved.kind==="ok"&&<p className="rh-strip"><Icon name="check" size={16}/>{savedItems.length} saved in your account{liveRun?" · 1 live run in this browser":""}</p>}
      </section>

      <section className="rh-card" aria-labelledby="rh-rec-h">
       <header className="rh-card-top"><span className="rh-tile rh-t-violet"><Icon name="spark" size={22}/></span><div><h2 id="rh-rec-h">Recommended research</h2><p className="rh-sub">Matched to your interests and follows. No model call.</p></div></header>
       {!bundle&&!failed&&<div className="rh-skel" aria-hidden="true"/>}
       {bundle&&recs.length===0&&<p className="rh-empty">Pick interests or follow a concept to get suggestions. Each one is a real concept in the published graph.</p>}
       {recs.length>0&&<ul className="rh-rows">{recs.slice(0,4).map(r=>(
        <li key={r.id}><div><b>{r.name}</b><span>{r.kind} · {r.relationships} recorded relationship{r.relationships===1?"":"s"}</span><small>{r.reason}</small></div>
         <div className="rh-row"><Link to={graphHref(r.name)}>Open in graph</Link><button type="button" className="rh-ghost" onClick={()=>follow(r.id,r.name)}>Follow</button><button type="button" className="rh-ghost" onClick={()=>update(p=>({...p,dismissed:[...p.dismissed,r.id].slice(-200)}))}>Not interested</button></div></li>))}</ul>}
       {recs.length>0&&<p className="rh-strip"><Icon name="trend" size={16}/>Personalised for your interests</p>}
      </section>

      <section className="rh-card" id="rh-updates" aria-labelledby="rh-upd-h">
       <header className="rh-card-top"><span className="rh-tile rh-t-blue"><Icon name="bell" size={22}/></span><div><h2 id="rh-upd-h">Scientific updates</h2><p className="rh-sub">New evidence for topics you follow.</p></div></header>
       <p className="rh-empty">No update feed is connected, so there is nothing to show. New publications, corrections and retractions for followed topics need a monitored source feed, which is not enabled. Nothing is simulated here.</p>
       <p className="rh-strip rh-strip-muted">Feed not connected</p>
      </section>

      <section className="rh-card" aria-labelledby="rh-kg-h">
       <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="graph" size={22}/></span><div><h2 id="rh-kg-h">Knowledge Graph Explorer</h2><p className="rh-sub">Biological entities and relationships, each with its source.</p></div><Link className="rh-arrow" to="/research/knowledge-graph" aria-label="Open the knowledge graph"><Icon name="chevron" size={18}/></Link></header>
       {bundle?<dl className="rh-facts"><div><dt>Concepts</dt><dd>{n(bundle.nodes.length)}</dd></div><div><dt>Recorded relationships</dt><dd>{n(edges)}</dd></div><div><dt>Scientifically reviewed</dt><dd>{n(bundle.edges.filter(e=>(e.reviewStatus as string)!=="unreviewed").length)}</dd></div></dl>:<div className="rh-skel" aria-hidden="true"/>}
       <p className="rh-strip"><Link to="/research/knowledge-graph"><Icon name="graph" size={16}/>Explore the published graph</Link></p>
      </section>
     </div>

     <section className="rh-card rh-wide" aria-labelledby="rh-prev-h">
      <header className="rh-card-top"><span className="rh-tile rh-t-violet"><Icon name="graph" size={22}/></span><div><h2 id="rh-prev-h">Knowledge graph preview</h2><p className="rh-sub">{net?"A neighbourhood of a concept you follow or a suggestion.":"Follow a concept or choose an interest to see its neighbourhood."}</p></div><Link className="rh-arrow" to={centre&&bundle?graphHref(bundle.nodes.find(x=>x.id===centre)?.name??""):"/research/knowledge-graph"} aria-label="Open full graph"><Icon name="chevron" size={18}/></Link></header>
      {net?<NetworkView n={net} uid="rh"/>:<p className="rh-empty">{bundle?"Nothing selected yet.":failed?"Graph unavailable.":"Verifying published graph…"}</p>}
     </section>

     <section className="rh-card rh-wide" id="rh-library" aria-labelledby="rh-lib-h">
      <header className="rh-card-top"><span className="rh-tile rh-t-blue"><Icon name="book" size={22}/></span><div><h2 id="rh-lib-h">Research library</h2><p className="rh-sub">Followed concepts are stored on this device.</p></div></header>
      {profile.followed.length===0?<p className="rh-empty">Concepts you follow appear here.</p>:<ul className="rh-follows">{profile.followed.map(f=><li key={f.id}><Link to={graphHref(f.name)}>{f.name}</Link><button type="button" className="rh-ghost" onClick={()=>follow(f.id,f.name)}>Unfollow</button></li>)}</ul>}
      <p className="rh-note"><Link to="/research/dashboard?view=briefs">Research briefs</Link> · <Link to="/research/dashboard#dashboard-workspace">Saved investigations</Link></p>
     </section>
    </main>
   </div>
  </div>
 );
}
