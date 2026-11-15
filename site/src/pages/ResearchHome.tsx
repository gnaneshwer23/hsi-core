import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {departments} from "../lib/departments";
import {NetworkView} from "../components/graph/GraphCharts";
import {matchScenario} from "../../../src/investigation/scenarios";
import {EMPTY_PROFILE,LIVE_RUN_KEY,summariseSavedLiveRun,type SavedLiveRun,classifyIntent,focusNetwork,GOALS,INVESTIGATION_STATUS,loadProfile,looksLikeTrialId,recommend,resetProfile,ROLES,saveProfile,searchEntities,type Profile} from "../lib/researchHome";
import "../styles/research-home.css";

type Saved={id:string;question:string;createdAt:string;state:string};
type SavedState={kind:"loading"}|{kind:"ok";items:Saved[]}|{kind:"blocked";message:string}|{kind:"error"};
const graphHref=(q:string)=>"/research/knowledge-graph?netQuery="+encodeURIComponent(q);
const investigateHref=(q:string)=>"/research/dashboard?q="+encodeURIComponent(q.slice(0,500))+"#dashboard-workspace";

function useBundle(){
 const [bundle,setBundle]=useState<DomainBundle|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{if(!c.signal.aborted||true)setFailed(true)}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
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
  }).catch(()=>setS({kind:"error"})).finally(()=>clearTimeout(t));
  return()=>{c.abort();clearTimeout(t)};
 },[]);
 return s;
}

function Onboarding({profile,onDone}:{profile:Profile;onDone:(p:Profile)=>void}){
 const [step,setStep]=useState(0),[draft,setDraft]=useState(profile);
 const toggle=(k:"goals"|"interests",v:string)=>setDraft(d=>({...d,[k]:d[k].includes(v)?d[k].filter(x=>x!==v):[...d[k],v]}));
 const finish=(skip:boolean)=>onDone({...(skip?profile:draft),onboarded:true});
 return (
  <section className="rh-card rh-onboard" aria-labelledby="rh-ob-h">
   <div className="rh-card-head"><h2 id="rh-ob-h">Tailor your research home</h2><span>Step {step+1} of 3 · every question is optional</span></div>
   {step===0&&<fieldset><legend>What best describes your work?</legend><div className="rh-chips">{ROLES.map(r=><button key={r} type="button" aria-pressed={draft.role===r} onClick={()=>setDraft(d=>({...d,role:d.role===r?null:r}))}>{r}</button>)}</div></fieldset>}
   {step===1&&<fieldset><legend>Which areas of biology interest you?</legend><div className="rh-chips">{departments.map(d=><button key={d.slug} type="button" aria-pressed={draft.interests.includes(d.slug)} onClick={()=>toggle("interests",d.slug)}>{d.name}</button>)}</div><p className="rh-note">Interests personalise suggestions. They never restrict what you can search or open.</p></fieldset>}
   {step===2&&<fieldset><legend>What are you trying to do?</legend><div className="rh-chips">{GOALS.map(g=><button key={g} type="button" aria-pressed={draft.goals.includes(g)} onClick={()=>toggle("goals",g)}>{g}</button>)}</div></fieldset>}
   <div className="rh-row">
    {step>0&&<button type="button" className="rh-ghost" onClick={()=>setStep(step-1)}>Back</button>}
    {step<2?<button type="button" className="rh-primary" onClick={()=>setStep(step+1)}>Next</button>:<button type="button" className="rh-primary" onClick={()=>finish(false)}>Save and continue</button>}
    <button type="button" className="rh-ghost" onClick={()=>finish(true)}>Skip for now</button>
   </div>
   <p className="rh-note">Saved on this device only. Account-level profile storage is not enabled.</p>
  </section>
 );
}

function UniversalSearch({bundle,profile,follow}:{bundle:DomainBundle|null;profile:Profile;follow:(id:string,name:string)=>void}){
 const [q,setQ]=useState("");
 const hits=useMemo(()=>bundle?searchEntities(bundle.nodes,q):[],[bundle,q]);
 const intent=classifyIntent(q,hits),trial=looksLikeTrialId(q);
 const followed=new Set(profile.followed.map(f=>f.id)),live=matchScenario(q);
 return (
  <section className="rh-search" aria-labelledby="rh-search-h">
   <h2 id="rh-search-h" className="rh-vh">Search and investigate</h2>
   <label htmlFor="rh-q" className="rh-vh">Investigate a gene, pathway, disease, mechanism or research question</label>
   <input id="rh-q" type="search" value={q} maxLength={500} autoComplete="off" onChange={e=>setQ(e.target.value)} placeholder="Investigate a gene, pathway, disease, biological mechanism or research question…" aria-describedby="rh-q-help"/>
   <p id="rh-q-help" className="rh-note">{bundle?`Searching ${bundle.nodes.length.toLocaleString("en-GB")} concepts in the published graph (candidates, unreviewed). Entities outside it are not searched yet.`:"Verifying the published graph…"}</p>
   <div role="status" aria-live="polite" className="rh-results">
    {intent!=="empty"&&<>
     {hits.length>0&&<ul className="rh-hits" aria-label="Matching concepts">{hits.map(h=>(
      <li key={h.id}><div><b>{h.name}</b><span>{h.kind}{h.matchedOn!==h.name?` · matched “${h.matchedOn}”`:""}</span><small>Graph concept {h.id.replace(/^concept:/,"").slice(0,40)}</small></div>
       <div className="rh-row"><Link to={graphHref(h.name)}>Open in graph</Link><button type="button" className="rh-ghost" aria-pressed={followed.has(h.id)} onClick={()=>follow(h.id,h.name)}>{followed.has(h.id)?"Following":"Follow"}</button><Link to={investigateHref(`What does the evidence say about ${h.name}, and in which contexts?`)}>Investigate</Link></div></li>))}</ul>}
     {hits.length===0&&bundle&&<p>No concept in the published graph matches “{q.trim()}”. {trial?"This looks like a clinical trial identifier; trial records are not searched from here yet. ":""}Try a broader term or an alternative name, or start an investigation from it.</p>}
     <div className="rh-intent">
      {intent==="investigation"&&<p>This reads as a research question. Choose how to work on it:</p>}
      {intent!=="investigation"&&<p>You can also treat this as a question:</p>}
      <div className="rh-row">
       <Link className="rh-primary" to={graphHref(q.trim())}>Quick Explore in the graph</Link>
       {live&&<Link className="rh-primary" to="/research/investigate#live-investigation">Deep Investigate: run live</Link>}
       <Link className={live?"rh-ghost":"rh-primary"} to={investigateHref(intent==="investigation"?q.trim():`What does the evidence say about ${q.trim()}?`)}>{live?"Save question for review":"Deep Investigate (saved question)"}</Link>
      </div>
      <p className="rh-note">{live?"This matches a curated scenario, so a live run is available: it searches Europe PMC, OpenAlex and Open Targets now, then two models check the direction of the best claims. Nothing starts until you press Run on the next page.":"Live runs cover curated scenarios only (currently IL-21 across autoimmune diseases). Your question can be saved for scientific review, which needs a research account."} Quick Explore reads the published graph.</p>
     </div>
    </>}
   </div>
  </section>
 );
}

export function ResearchHome(){
 const [profile,setProfile]=useState<Profile>(EMPTY_PROFILE),[ready,setReady]=useState(false);
 const [noStore,setNoStore]=useState(false);
 const {bundle,failed}=useBundle(),saved=useSaved();
 // Read device storage after mount so server and client render the same first frame.
 useEffect(()=>{setProfile(loadProfile());setReady(true)},[]);
 useEffect(()=>{if(!ready)return;if(!saveProfile(profile))setNoStore(true)},[profile,ready]);
 const update=(fn:(p:Profile)=>Profile)=>setProfile(p=>fn(p));
 const follow=(id:string,name:string)=>update(p=>p.followed.some(f=>f.id===id)?{...p,followed:p.followed.filter(f=>f.id!==id)}:{...p,followed:[...p.followed,{id,name}].slice(-50)});
 const recs=useMemo(()=>bundle?recommend(profile,bundle):[],[bundle,profile]);
 const centre=profile.followed[0]?.id??recs[0]?.id??null;
 const net=useMemo(()=>bundle&&centre?focusNetwork(bundle,centre):null,[bundle,centre]);
 const toggleInterest=(slug:string)=>update(p=>({...p,interests:p.interests.includes(slug)?p.interests.filter(x=>x!==slug):[...p.interests,slug]}));
 const [liveRun,setLiveRun]=useState<SavedLiveRun|null>(null);
 useEffect(()=>{try{setLiveRun(summariseSavedLiveRun(localStorage.getItem(LIVE_RUN_KEY)))}catch{setLiveRun(null)}},[]);
 const hasSaved=saved.kind==="ok"&&saved.items.length>0;
 return (
  <div className="rh-page">
   <aside className="rh-side" aria-label="Research navigation">
    <nav aria-label="Primary"><h2>Research</h2><ul>
     <li><Link to="/research/home" aria-current="page">Home</Link></li>
     <li><Link to="/research/dashboard#dashboard-workspace">Investigations</Link></li>
     <li><Link to="/research/knowledge-graph">Knowledge Graph</Link></li>
     <li><Link to="/evidence-intelligence">Evidence Intelligence</Link></li>
     <li><a href="#rh-library">Research Library</a></li>
     <li><a href="#rh-updates">Scientific Updates</a></li></ul></nav>
    <nav aria-label="Explore science"><h2>Explore science</h2><ul>{departments.map(d=><li key={d.slug}><Link to={"/research/knowledge-graph?netDepartment="+d.slug}>{d.name}</Link></li>)}</ul></nav>
    <nav aria-label="Account"><h2>Account</h2><ul><li><Link to="/research/account">Profile and access</Link></li><li><a href="#rh-interests">Preferences</a></li></ul></nav>
   </aside>

   <main className="rh-main" id="main">
    <header className="rh-welcome">
     <h1>{profile.onboarded&&(hasSaved||profile.interests.length||profile.followed.length)?"Welcome back. What would you like to investigate?":"What would you like to investigate?"}</h1>
     <p>{hasSaved?`${(saved as {items:Saved[]}).items.length} saved investigation${(saved as {items:Saved[]}).items.length===1?"":"s"} in your account.`:"Search the published graph or start with a question. Nothing here is clinical advice, and every relationship is a candidate until reviewed."}</p>
    </header>

    <UniversalSearch bundle={bundle} profile={profile} follow={follow}/>
    {failed&&<p className="rh-err" role="alert">The published graph could not be loaded, so concept search and suggestions are unavailable. No substitute results are shown.</p>}
    {noStore&&<p className="rh-err" role="status">This browser blocked local storage, so preferences will not be kept.</p>}

    {ready&&!profile.onboarded&&<Onboarding profile={profile} onDone={p=>setProfile(p)}/>}

    <section className="rh-card" id="rh-interests" aria-labelledby="rh-int-h">
     <div className="rh-card-head"><h2 id="rh-int-h">Research interests</h2><span>On this device only</span></div>
     <div className="rh-chips">{departments.map(d=><button key={d.slug} type="button" aria-pressed={profile.interests.includes(d.slug)} onClick={()=>toggleInterest(d.slug)}>{d.name}</button>)}</div>
     <p className="rh-note">Interests only tune suggestions. Every area stays searchable. {profile.onboarded&&<button type="button" className="rh-link" onClick={()=>{setProfile(resetProfile());}}>Reset personalisation</button>}</p>
    </section>

    <section className="rh-card" aria-labelledby="rh-cont-h">
     <div className="rh-card-head"><h2 id="rh-cont-h">Continue researching</h2><Link to="/research/dashboard#dashboard-workspace">All investigations</Link></div>
     {liveRun&&<ul className="rh-cards rh-live"><li><b>{liveRun.question}</b><span>Live investigation · saved in this browser</span><small>{liveRun.checked} claims checked by two models · {liveRun.supporting} supporting · {liveRun.opposing} opposing · {liveRun.candidates} candidates, all unreviewed</small><Link to="/research/investigate?reopen=1#live-investigation">Reopen</Link></li></ul>}
     {saved.kind==="loading"&&<div className="rh-skel" aria-hidden="true"/>}
     {saved.kind==="blocked"&&<p>{saved.message} <Link to="/sign-in">Sign in</Link></p>}
     {saved.kind==="error"&&<p>Saved investigations are temporarily unavailable.</p>}
     {saved.kind==="ok"&&saved.items.length===0&&<p>No saved investigations yet. Start with a question above.</p>}
     {saved.kind==="ok"&&saved.items.length>0&&<ul className="rh-cards">{saved.items.slice(0,5).map(i=>(
      <li key={i.id}><b>{i.question}</b><span>{INVESTIGATION_STATUS[i.state]??i.state}</span><small>Created {new Date(i.createdAt).toLocaleDateString("en-GB")}</small><Link to={"/research/decision-workbench?investigation="+encodeURIComponent(i.id)}>Resume</Link></li>))}</ul>}
    </section>

    <section className="rh-card" aria-labelledby="rh-rec-h">
     <div className="rh-card-head"><h2 id="rh-rec-h">Recommended research</h2><span>Matched to your interests and follows, no model call</span></div>
     {!bundle&&!failed&&<div className="rh-skel" aria-hidden="true"/>}
     {bundle&&recs.length===0&&<p>Pick interests or follow a concept to get suggestions. Each one is a real concept in the published graph.</p>}
     {recs.length>0&&<ul className="rh-cards">{recs.map(r=>(
      <li key={r.id}><b>{r.name}</b><span>{r.kind} · {r.relationships} recorded relationship{r.relationships===1?"":"s"}</span><small>{r.reason}</small>
       <div className="rh-row"><Link to={graphHref(r.name)}>Open in graph</Link><button type="button" className="rh-ghost" onClick={()=>follow(r.id,r.name)}>Follow</button><button type="button" className="rh-ghost" onClick={()=>update(p=>({...p,dismissed:[...p.dismissed,r.id].slice(-200)}))}>Not interested</button></div></li>))}</ul>}
    </section>

    <section className="rh-card" aria-labelledby="rh-prev-h">
     <div className="rh-card-head"><h2 id="rh-prev-h">Knowledge graph preview</h2><Link to={centre&&bundle?graphHref(bundle.nodes.find(n=>n.id===centre)?.name??""):"/research/knowledge-graph"}>Open full graph</Link></div>
     {net?<NetworkView n={net} uid="rh"/>:<p>{bundle?"Follow a concept or choose an interest to see its neighbourhood here.":failed?"Graph unavailable.":"Verifying published graph…"}</p>}
    </section>

    <section className="rh-card" id="rh-updates" aria-labelledby="rh-upd-h">
     <div className="rh-card-head"><h2 id="rh-upd-h">Scientific updates</h2></div>
     <p>No update feed is connected, so there is nothing to show. New publications, corrections and retractions for followed topics need a monitored source feed, which is not enabled. Nothing is simulated here.</p>
    </section>

    <section className="rh-card" id="rh-library" aria-labelledby="rh-lib-h">
     <div className="rh-card-head"><h2 id="rh-lib-h">Research library</h2><span>Followed concepts are stored on this device</span></div>
     {profile.followed.length===0?<p>Concepts you follow appear here.</p>:<ul className="rh-follows">{profile.followed.map(f=><li key={f.id}><Link to={graphHref(f.name)}>{f.name}</Link><button type="button" className="rh-ghost" onClick={()=>follow(f.id,f.name)}>Unfollow</button></li>)}</ul>}
     <p className="rh-note"><Link to="/research/dashboard?view=briefs">Research briefs</Link> · <Link to="/research/dashboard#dashboard-workspace">Saved investigations</Link></p>
    </section>
   </main>
  </div>
 );
}
