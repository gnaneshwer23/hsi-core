import {useEffect,useMemo,useRef,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {matchScenario} from "../../../src/investigation/scenarios";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {departments} from "../lib/departments";
import {ResearchAppShell} from "../components/home/ResearchAppShell";
import {RadarCard} from "../components/home/RadarCard";
import {GapCard} from "../components/home/GapCard";
import {AskCard} from "../components/home/AskCard";
import {Overview} from "../components/home/Overview";
import {Program} from "../components/home/Program";
import {ProfileWorkspaceHandoffCard} from "../components/home/ProfileWorkspaceHandoffCard";
import {AlertPreferenceCard} from "../components/home/AlertPreferenceCard";
import {ActivationMilestoneCard} from "../components/home/ActivationMilestoneCard";
import {FirstUsefulInvestigationCard} from "../components/home/FirstUsefulInvestigationCard";
import {PilotReadinessHonestyCard} from "../components/home/PilotReadinessHonestyCard";
import {RepeatUsageMilestoneCard} from "../components/home/RepeatUsageMilestoneCard";
import {WillingnessToPayMilestoneCard} from "../components/home/WillingnessToPayMilestoneCard";
import {programView} from "../lib/program";
import {DEPT_ICON,Icon} from "../components/home/AppIcons";
import {EMPTY_PROFILE,LIVE_RUN_KEY,summariseSavedLiveRun,type SavedLiveRun,classifyIntent,GOALS,INVESTIGATION_STATUS,looksLikeTrialId,recommend,resetProfile,ROLES,searchEntities,type Profile} from "../lib/researchHome";
import {
  loadLiveRunLibrary,
  migrateLegacyLiveRunIntoLibrary,
  reopenLiveRunFromLibrary,
  type LiveRunLibraryEntry,
} from "../../../src/investigation/liveRunLibrary";
import {buildProfileWorkspaceHandoff} from "../../../src/investigation/profileWorkspaceHandoff";
import {buildHomeLocalMetricsSummary} from "../../../src/investigation/homeLocalMetricsSummary";
import {loadOnboardingProfile,pathHonestyLabel,resolveOnboardingProfileMode,saveOnboardingProfile,type OnboardingProfileClientMode,type OnboardingProfileStatus} from "../lib/onboardingProfileClient";
import {LIVE_INVESTIGATION_PATH,liveInvestigationHref} from "../lib/workbenchPrimary";
import "../styles/research-home.css";


/** A collapsed region that opens for any link or anchor that targets it. */
function Fold({id,ids,title,sub,force=false,initial=false,children}:{id:string;ids:string[];title:string;sub:string;force?:boolean;initial?:boolean;children:React.ReactNode}){
 const {hash}=useLocation(),h=hash.slice(1),wanted=h===id||ids.includes(h),[open,setOpen]=useState(wanted||initial);
 useEffect(()=>{if(force)setOpen(true)},[force]);
 useEffect(()=>{if(wanted){setOpen(true);requestAnimationFrame(()=>document.getElementById(h)?.scrollIntoView({block:"start"}))}},[wanted,h]);
 return <details className="rh-setup" id={id} open={open} onToggle={e=>setOpen((e.currentTarget as HTMLDetailsElement).open)}><summary><span><b>{title}</b> <small>{sub}</small></span></summary>{children}</details>;
}

type Saved={id:string;question:string;createdAt:string;state:string};
type SavedState={kind:"loading"}|{kind:"ok";items:Saved[]}|{kind:"blocked";message:string}|{kind:"error"};
const graphHref=(q:string)=>"/research/knowledge-graph?netQuery="+encodeURIComponent(q);
/** The Living Intelligence Graph workspace, searching the whole published graph for this text. */
const workspaceHref=(q:string)=>"/workspace/graph?q="+encodeURIComponent(q.slice(0,200));
/** Auth/dashboard path for saving a question for review — not the primary live investigate path. */
const saveQuestionHref=(q:string)=>"/research/dashboard?q="+encodeURIComponent(q.slice(0,500))+"#dashboard-workspace";
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

function SearchHero({bundle,profile,follow,inputRef,ready}:{bundle:DomainBundle|null;profile:Profile;follow:(id:string,name:string)=>void;inputRef:React.RefObject<HTMLInputElement|null>;ready:boolean}){
 const nav=useNavigate(),[q,setQ]=useState("");
 const hits=useMemo(()=>bundle?searchEntities(bundle.nodes,q):[],[bundle,q]);
 const intent=classifyIntent(q,hits),trial=looksLikeTrialId(q);
 const followed=new Set(profile.followed.map(f=>f.id)),live=matchScenario(q);
 return (
  <section className="rh-hero" aria-labelledby="rh-search-h">
   <div className="rh-hero-copy">
    <h1 id="rh-title">{profile.onboarded&&profile.question.trim()?profile.question.trim().slice(0,160):profile.onboarded&&(profile.interests.length||profile.followed.length)?"Your research":"What would you like to investigate?"}</h1>
    {profile.onboarded&&profile.question.trim()&&<p className="rh-focus">Your research question{profile.interests.filter(i=>!departments.some(d=>d.slug===i)).length>0?<> · focus on {profile.interests.filter(i=>!departments.some(d=>d.slug===i)).slice(0,4).join(", ")}</>:null}</p>}
    <h2 id="rh-search-h" className="rh-vh">Search and investigate</h2>
    <label htmlFor="rh-q" className="rh-vh">Investigate a gene, pathway, disease, mechanism or research question</label>
    <div className="rh-searchbar">
     <Icon name="search" size={22}/>
     <input id="rh-q" ref={inputRef} type="search" value={q} maxLength={500} autoComplete="off" onChange={e=>setQ(e.target.value)} placeholder="Investigate a gene, pathway, disease, biological mechanism or research question…" aria-describedby="rh-q-help"/>
     <button type="button" className="rh-go" onClick={()=>{const t=q.trim();if(!t){inputRef.current?.focus();return}nav(liveInvestigationHref({scenarioId:live}))}}>Investigate <Icon name="arrow" size={16}/></button>
    </div>
    {ready&&!profile.onboarded&&<p className="rh-note"><Link to="/welcome">Tell us about your research</Link> (2 minutes) so your home is built around your area.</p>}
    <p id="rh-q-help" className="rh-note">{bundle?`Searching ${n(bundle.nodes.length)} concepts in the published graph (candidates, unreviewed). Entities outside it are not searched yet.`:"Verifying the published graph…"}</p>
    <div role="status" aria-live="polite" className="rh-results">
     {intent!=="empty"&&<div className="rh-panel">
      {hits.length>0&&<ul className="rh-hits" aria-label="Matching concepts">{hits.map(h=>(
       <li key={h.id}><span className="rh-ico-tile" aria-hidden="true"><Icon name="graph" size={18}/></span><div><b>{h.name}</b><span>{h.kind}{h.matchedOn!==h.name?` · matched “${h.matchedOn}”`:""}</span><small>Graph concept {h.id.replace(/^concept:/,"").slice(0,40)}</small></div>
        <div className="rh-row"><Link to={workspaceHref(h.name)}>Open in the graph workspace</Link><Link to={graphHref(h.name)}>Open in graph</Link><button type="button" className="rh-ghost" aria-pressed={followed.has(h.id)} onClick={()=>follow(h.id,h.name)}>{followed.has(h.id)?"Following":"Follow"}</button><Link to={liveInvestigationHref({scenarioId:live})}>Investigate</Link></div></li>))}</ul>}
      {hits.length===0&&bundle&&<p>No concept in the published graph matches “{q.trim()}”. {trial?"This looks like a clinical trial identifier; trial records are not searched from here yet. ":""}Try a broader term or an alternative name, or start an investigation from it.</p>}
      <div className="rh-intent">
       <p>{intent==="investigation"?"This reads as a research question. Choose how to work on it:":"You can also treat this as a question:"}</p>
       <div className="rh-row">
        <Link className="rh-ghost" to={graphHref(q.trim())}>Quick Explore in the graph</Link>
        <Link className="rh-ghost" to={workspaceHref(q.trim())}>Explore in the graph workspace</Link>
        <Link className="rh-primary" to={liveInvestigationHref({scenarioId:live})}>{live?"Deep Investigate: run live":"Open live investigation"}</Link>
        <Link className="rh-ghost" to={saveQuestionHref(intent==="investigation"?q.trim():`What does the evidence say about ${q.trim()}?`)}>Save question for review</Link>
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
 const [profile,setProfile]=useState<Profile>(EMPTY_PROFILE),[ready,setReady]=useState(false),[noStore,setNoStore]=useState(false),[adding,setAdding]=useState(false),[topic,setTopic]=useState("");
 const [profileMode,setProfileMode]=useState<OnboardingProfileClientMode>("local");
 const [profileStatus,setProfileStatus]=useState<OnboardingProfileStatus|null>(null);
 const [profileSyncNote,setProfileSyncNote]=useState("");
 const [metricsTick,setMetricsTick]=useState(0);
 const {bundle,failed}=useBundle(),saved=useSaved(),inputRef=useRef<HTMLInputElement|null>(null);
 const [liveRun,setLiveRun]=useState<SavedLiveRun|null>(null);
 const [liveLibrary,setLiveLibrary]=useState<readonly LiveRunLibraryEntry[]>([]);
 const loc=useLocation(),goto=useNavigate(),fresh=(loc.state as {fresh?:boolean}|null)?.fresh===true;
 /** Only the first view after setup shows recommendations open; a reload or later visit starts folded again. */
 useEffect(()=>{if(fresh)goto(loc.pathname+loc.search+loc.hash,{replace:true,state:null})},[fresh]); // eslint-disable-line react-hooks/exhaustive-deps
 // Read device storage after mount so server and client render the same first frame.
 useEffect(()=>{
  let cancelled=false;
  (async()=>{
   const resolved=await resolveOnboardingProfileMode();
   if(cancelled)return;
   setProfileMode(resolved.mode);
   setProfileStatus(resolved.status);
   const loaded=await loadOnboardingProfile(resolved.mode);
   if(cancelled)return;
   setProfile(loaded.profile);
   setProfileSyncNote(pathHonestyLabel(resolved.mode,resolved.status));
   setReady(true);
   try{
    setLiveRun(summariseSavedLiveRun(localStorage.getItem(LIVE_RUN_KEY)));
    const lib=migrateLegacyLiveRunIntoLibrary(localStorage);
    setLiveLibrary(lib.entries);
   }catch{
    setLiveRun(null);
    setLiveLibrary(loadLiveRunLibrary(null).entries);
   }
  })();
  return()=>{cancelled=true};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  void(async()=>{
   const result=await saveOnboardingProfile(profileMode,profile);
   if(!result.ok)setNoStore(true);
   if(result.error)setProfileSyncNote(result.error);
   else setProfileSyncNote(pathHonestyLabel(result.path,profileStatus));
  })();
 },[profile,ready,profileMode,profileStatus]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();inputRef.current?.focus()}};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[]);
 useEffect(()=>{
  const onFocus=()=>setMetricsTick(n=>n+1);
  window.addEventListener("focus",onFocus);
  return()=>window.removeEventListener("focus",onFocus);
 },[]);
 const update=(fn:(p:Profile)=>Profile)=>setProfile(p=>fn(p));
 const follow=(id:string,name:string)=>update(p=>p.followed.some(f=>f.id===id)?{...p,followed:p.followed.filter(f=>f.id!==id)}:{...p,followed:[...p.followed,{id,name}].slice(-50)});
 const recs=useMemo(()=>bundle?recommend(profile,bundle):[],[bundle,profile]);
 const toggleInterest=(slug:string)=>update(p=>({...p,interests:p.interests.includes(slug)?p.interests.filter(x=>x!==slug):[...p.interests,slug]}));
 const addTopic=()=>{const t=topic.trim().slice(0,80);if(t)update(p=>p.interests.includes(t)?p:{...p,interests:[...p.interests,t].slice(0,20)});setTopic("");setAdding(false)};
 const custom=profile.interests.filter(i=>!departments.some(d=>d.slug===i));
 const myView=useMemo(()=>{const v=bundle&&profile.onboarded?programView(profile,bundle,1):null;return v&&v.anchors.length?v:null},[bundle,profile]);
 const savedItems=saved.kind==="ok"?saved.items:[];
 const profileHandoff=useMemo(()=>buildProfileWorkspaceHandoff({
  onboarded:profile.onboarded,
  question:profile.question,
  interests:profile.interests,
  role:profile.role,
  cadence:profile.cadence,
  matchedScenarioId:profile.question.trim()?matchScenario(profile.question):null,
 }),[profile]);
 const metricsSummary=useMemo(()=>{
  void metricsTick;
  let storage:Storage|null=null;
  try{storage=typeof localStorage==="undefined"?null:localStorage}catch{storage=null}
  return buildHomeLocalMetricsSummary({storage,cadence:profile.cadence});
 },[profile.cadence,metricsTick,ready]);
 return (
  <ResearchAppShell where="Research Home" active="home" onSearch={()=>inputRef.current?.focus()}>
    <main className="rh-main" id="rh-main" tabIndex={-1}>
     <SearchHero bundle={bundle} profile={profile} follow={follow} inputRef={inputRef} ready={ready}/>
     {failed&&<p className="rh-err" role="alert">The published graph could not be loaded, so concept search and suggestions are unavailable. No substitute results are shown.</p>}
     {noStore&&<p className="rh-err" role="status">This browser blocked local storage, so preferences will not be kept.</p>}
     {ready&&!profile.onboarded&&<Onboarding profile={profile} onDone={p=>setProfile(p)}/>}
     {ready&&profileHandoff.ready&&(
      <ProfileWorkspaceHandoffCard handoff={profileHandoff} highlight={fresh}/>
     )}
     {ready&&(
      <Fold
       id="rh-metrics"
       ids={["rh-pilot-h","rh-alert-h","rh-act-h","rh-fu-h","rh-ru-h","rh-wtp-h"]}
       title="Your progress"
       sub={metricsSummary.subtitle}
      >
       <PilotReadinessHonestyCard/>
       <AlertPreferenceCard profile={profile} onProfile={setProfile}/>
       <ActivationMilestoneCard/>
       <FirstUsefulInvestigationCard/>
       <RepeatUsageMilestoneCard/>
       <WillingnessToPayMilestoneCard/>
      </Fold>
     )}

     <Overview bundle={bundle} view={myView} profile={profile}>{ready&&<Program profile={profile} bundle={bundle} onProfile={setProfile}/>}</Overview>
     <RadarCard profile={profile} ready={ready}/>
     {ready&&<GapCard profile={profile} bundle={bundle}/>}

     <Fold id="rh-more" force={saved.kind==="error"} initial={fresh} ids={["rh-cont-h","rh-rec-h","rh-ask"]} title="More from your research" sub="Saved work, recommendations and asking the graph">
     <div className="rh-grid">
      <section className="rh-card" aria-labelledby="rh-cont-h">
       <header className="rh-card-top"><span className="rh-tile rh-t-teal"><Icon name="layers" size={22}/></span><div><h2 id="rh-cont-h">Continue researching</h2><p className="rh-sub">Pick up where you left off.</p></div><Link className="rh-arrow" to={LIVE_INVESTIGATION_PATH} aria-label="Open live investigation"><Icon name="chevron" size={18}/></Link></header>
       {liveLibrary.length>0?(
        <ul className="rh-rows rh-live" aria-label="Browser-saved live investigations">
         {liveLibrary.slice(0,4).map((entry)=>(
          <li key={entry.id}>
           <div>
            <b>{entry.question}</b>
            <span>Live investigation · browser library (not a server store)</span>
            <small>{entry.checked} checked · {entry.supporting} supporting · {entry.opposing} opposing · {entry.candidateCount} candidates, unreviewed · scientific approval false</small>
           </div>
           <Link to={liveInvestigationHref({reopen:true})} onClick={()=>{reopenLiveRunFromLibrary(localStorage,entry.id)}}>Reopen</Link>
          </li>
         ))}
        </ul>
       ):liveRun?(
        <ul className="rh-rows rh-live"><li><div><b>{liveRun.question}</b><span>Live investigation · saved in this browser</span><small>{liveRun.checked} claims checked by two models · {liveRun.supporting} supporting · {liveRun.opposing} opposing · {liveRun.candidates} candidates, all unreviewed</small></div><Link to={liveInvestigationHref({reopen:true})}>Reopen</Link></li></ul>
       ):null}
       {saved.kind==="loading"&&<div className="rh-skel" aria-hidden="true"/>}
       {saved.kind==="blocked"&&<p className="rh-empty">{saved.message} <Link to="/sign-in">Sign in</Link></p>}
       {saved.kind==="error"&&<p className="rh-empty">Saved investigations are temporarily unavailable.</p>}
       {saved.kind==="ok"&&savedItems.length===0&&!liveRun&&liveLibrary.length===0&&<p className="rh-empty">No saved investigations yet. Start with a question above.</p>}
       {savedItems.length>0&&<ul className="rh-rows">{savedItems.slice(0,4).map(i=>(
        <li key={i.id}><div><b>{i.question}</b><span>{INVESTIGATION_STATUS[i.state]??i.state}</span><small>Created {new Date(i.createdAt).toLocaleDateString("en-GB")}</small></div><Link to={"/research/decision-workbench?investigation="+encodeURIComponent(i.id)}>Resume</Link></li>))}</ul>}
       {saved.kind==="ok"&&<p className="rh-strip"><Icon name="check" size={16}/>{savedItems.length} saved in your account{liveLibrary.length?` · ${liveLibrary.length} live run(s) in this browser`:liveRun?" · 1 live run in this browser":""} · org sharing blocked</p>}
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

     </div>

      <AskCard/>
     </Fold>
     <Fold id="rh-setup" ids={["rh-interests","rh-library"]} title="My setup" sub={`Interests and followed concepts${profile.followed.length>0?` · ${profile.followed.length} followed`:""}`}>
     <section className="rh-interests" id="rh-interests" aria-labelledby="rh-int-h">
      <div className="rh-line"><h2 id="rh-int-h">Research interests</h2><span className="rh-note">On this device only</span></div>
      <div className="rh-pills">
       {departments.map(d=><button key={d.slug} type="button" aria-pressed={profile.interests.includes(d.slug)} onClick={()=>toggleInterest(d.slug)}><Icon name={deptIcon(d.slug)} size={16}/>{d.name}</button>)}
       {custom.map(c=><button key={c} type="button" aria-pressed="true" onClick={()=>toggleInterest(c)} aria-label={`Remove topic ${c}`}><Icon name="spark" size={16}/>{c} <Icon name="x" size={14}/></button>)}
       {adding?<form className="rh-add" onSubmit={e=>{e.preventDefault();addTopic()}}><label className="rh-vh" htmlFor="rh-topic">New research topic</label><input id="rh-topic" autoFocus value={topic} maxLength={80} onChange={e=>setTopic(e.target.value)} placeholder="Gene, pathway, disease…"/><button type="submit" className="rh-primary">Add</button><button type="button" className="rh-ghost" onClick={()=>{setAdding(false);setTopic("")}}>Cancel</button></form>:<button type="button" className="rh-addbtn" onClick={()=>setAdding(true)}><Icon name="plus" size={16}/>Add interest</button>}
      </div>
      <p className="rh-note">Interests only tune suggestions. Every area stays searchable. {profile.onboarded&&<button type="button" className="rh-link" onClick={()=>setProfile(resetProfile())}>Reset personalisation</button>}</p>
      {ready&&profileSyncNote&&<p className="rh-note" role="status" data-profile-path={profileMode}>{profileSyncNote}</p>}
     </section>

     <section className="rh-card rh-wide" id="rh-library" aria-labelledby="rh-lib-h">
      <header className="rh-card-top"><span className="rh-tile rh-t-blue"><Icon name="book" size={22}/></span><div><h2 id="rh-lib-h">Research library</h2><p className="rh-sub">Followed concepts are stored on this device.</p></div></header>
      {profile.followed.length===0?<p className="rh-empty">Concepts you follow appear here.</p>:<ul className="rh-follows">{profile.followed.map(f=><li key={f.id}><Link to={graphHref(f.name)}>{f.name}</Link><button type="button" className="rh-ghost" onClick={()=>follow(f.id,f.name)}>Unfollow</button></li>)}</ul>}
      <p className="rh-note"><Link to="/workspace/graph">Living Intelligence Graph</Link> · <Link to="/research/dashboard?view=briefs">Research briefs</Link> · <Link to="/research/dashboard#dashboard-workspace">Saved investigations</Link></p>
     </section>
     </Fold>
    </main>
  </ResearchAppShell>
 );
}