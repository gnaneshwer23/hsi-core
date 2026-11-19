import {useEffect,useMemo,useRef,useState} from "react";
import {Link,useNavigate,useSearchParams} from "react-router-dom";
import {HsiIdentity} from "../components/HsiIdentity";
import {Icon} from "../components/home/AppIcons";
import {departments} from "../lib/departments";
import {loadDomainGraph} from "../lib/claimGraphClient";
import {DEMO_PROFILE,detectTopics} from "../lib/program";
import {ACCEPT,MAX_FILES,readEvidenceFile,refsFrom,type EvidenceFile} from "../lib/evidenceFiles";
import type {DomainBundle} from "../../../src/knowledgeGraph/domainGraph";
import {ACCENTS,DEFAULT_APPEARANCE,loadAppearance,saveAppearance,type Appearance} from "../lib/appearance";
import {CADENCES,EMPTY_PROFILE,GOALS,loadProfile,parseOrcid,parsePaperIds,ROLES,saveProfile,STAGES,type Profile} from "../lib/researchHome";
import {beginRun,finishRun,loadFunnel,reach,saveFunnel,summarize,type Funnel} from "../lib/onboardingFunnel";
import {matchScenario} from "../../../src/investigation/scenarios";
import {buildProfileWorkspaceHandoff} from "../../../src/investigation/profileWorkspaceHandoff";
import "../styles/research-home.css";
import "../styles/welcome.css";
import "../styles/premium-app.css";

const STEPS=["About you","Your research","Your work","Preferences"] as const;
const CAD:Record<string,string>={off:"Off",weekly:"Weekly",daily:"Daily"};
/** First-run flow. Role, a short background and one research focus are required: they are what the personal program is built from. The rest is optional. Saved on this device only. */
const BG_MIN=20,MAX_TOPICS=5,MAX_AREAS=2,MAX_GOALS=3;
const orcBad0=(o:string)=>!!o.trim()&&!parseOrcid(o);
export function WelcomePage(){
 const nav=useNavigate();
 const funnel=useRef<{f:Funnel;i:number}|null>(null),[params]=useSearchParams(),showFunnel=params.get("funnel")==="1",[stats,setStats]=useState<ReturnType<typeof summarize>|null>(null);
 useEffect(()=>{const b=beginRun(loadFunnel(),new Date().toISOString().slice(0,10));funnel.current={f:b.funnel,i:b.index};saveFunnel(b.funnel);if(showFunnel)setStats(summarize(b.funnel))},[showFunnel]);
 const [step,setStep]=useState(0),[p,setP]=useState<Profile>(EMPTY_PROFILE),[ap,setAp]=useState<Appearance>(DEFAULT_APPEARANCE);
 const [topic,setTopic]=useState(""),[orcid,setOrcid]=useState(""),[papers,setPapers]=useState(""),[note,setNote]=useState("");
 const [files,setFiles]=useState<EvidenceFile[]>([]),[linked,setLinked]=useState(""),[busy,setBusy]=useState(false);
 const [bundle,setBundle]=useState<DomainBundle|null>(null);
 useEffect(()=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);loadDomainGraph(null,c.signal).then(setBundle).catch(()=>{}).finally(()=>clearTimeout(t));return()=>{c.abort();clearTimeout(t)}},[]);
 useEffect(()=>{const x=loadProfile();setP(x);setOrcid(x.orcid??"");setPapers(x.papers.map(i=>i.replace(/^(doi|pmid):/,"")).join("\n"));setAp(loadAppearance())},[]);
 const set=<K extends keyof Profile>(k:K,v:Profile[K])=>setP(x=>({...x,[k]:v}));
 const isArea=(i:string)=>departments.some(d=>d.slug===i);
 const custom=p.interests.filter(i=>!isArea(i)),areas=p.interests.filter(isArea);
 /** Small caps keep the profile focused: a few specific topics, two broad areas, three goals. */
 const toggle=(k:"goals"|"interests",v:string)=>setP(x=>{
  if(x[k].includes(v))return {...x,[k]:x[k].filter(y=>y!==v)};
  if(k==="goals")return x.goals.length>=MAX_GOALS?x:{...x,goals:[...x.goals,v]};
  const group=x.interests.filter(i=>isArea(i)===isArea(v)).length;
  return group>=(isArea(v)?MAX_AREAS:MAX_TOPICS)?x:{...x,interests:[...x.interests,v]};
 });
 /** One topic per entry: "IL-2, T cells and cytomegalovirus" becomes three topics. */
 const addTopic=()=>{
  const parts=topic.split(/,|;|\band\b/i).map(t=>t.trim().slice(0,80)).filter(Boolean);
  setP(x=>{const next=[...x.interests];for(const t of parts)if(!next.some(i=>i.toLowerCase()===t.toLowerCase())&&next.filter(i=>!isArea(i)).length<MAX_TOPICS)next.push(t);return {...x,interests:next}});
  setTopic("");
 };
 const orc=orcid.trim()?parseOrcid(orcid):null,orcBad=!!orcid.trim()&&!orc;
 const pp=parsePaperIds(papers);
 const found=useMemo(()=>bundle?detectTopics(bundle.nodes,p.background+" "+p.question):[],[bundle,p.background,p.question]);
 const docText=files.map(f=>f.text).join("\n")+"\n"+linked;
 const foundDocs=useMemo(()=>bundle?detectTopics(bundle.nodes,docText,8).filter(f=>!found.some(g=>g.id===f.id)):[],[bundle,docText,found]);
 const ok0=!!p.role&&p.background.trim().length>=BG_MIN,ok1=custom.length>0,evChars=files.reduce((a,f)=>a+f.chars,0)+linked.trim().length,ok2=(!!orc||pp.ids.length>0||evChars>=200)&&!orcBad0(orcid),ok3=p.goals.length>0,can=[ok0,ok1,ok2,ok3][step]!;
 useEffect(()=>{const c=funnel.current;if(!c)return;c.f=reach(c.f,c.i,step+1);saveFunnel(c.f);if(showFunnel)setStats(summarize(c.f))},[step,showFunnel]);
 function finish(dest:"home"|"workspace"="home"){
  const next:Profile={...p,orcid:orc,papers:pp.ids,onboarded:true};
  if(!saveProfile(next)){setNote("This browser blocked local storage, so your answers will not be kept.");return}
  if(funnel.current){funnel.current.f=finishRun(funnel.current.f,funnel.current.i);saveFunnel(funnel.current.f)}
  if(dest==="workspace"){
   const handoff=buildProfileWorkspaceHandoff({
    onboarded:true,
    question:next.question,
    interests:next.interests,
    role:next.role,
    cadence:next.cadence,
    matchedScenarioId:next.question.trim()?matchScenario(next.question):null,
   });
   nav(handoff.workspaceHref);
   return;
  }
  nav("/research/home",{state:{fresh:true}});
 }
 const canFinishInvestigate=ok0&&ok1&&ok2&&ok3;
 async function addFiles(list:FileList|null){
  if(!list)return;setBusy(true);
  const read:EvidenceFile[]=[];for(const f of [...list].slice(0,MAX_FILES-files.length))read.push(await readEvidenceFile(f));
  setFiles(x=>[...x,...read].slice(0,MAX_FILES));
  const refs=refsFrom(read.map(r=>r.text).join("\n"));
  if(refs.length)setPapers(cur=>{const have=new Set(parsePaperIds(cur).ids.map(i=>i.replace(/^(doi|pmid):/,"")));const add=refs.filter(r=>!have.has(r));return [cur.trim(),...add].filter(Boolean).join("\n")});
  setBusy(false);
 }
 const changeAp=(a:Appearance)=>{setAp(a);saveAppearance(a)};
 return (
  <div className="rh-app wl" data-theme={ap.theme} data-accent={ap.accent}>
   <header className="wl-top"><Link to="/" className="rh-brand" aria-label="Human Super Intelligence, public site"><HsiIdentity/></Link><button type="button" className="rh-ghost" onClick={()=>{setP(x=>({...x,...DEMO_PROFILE,onboarded:false,question:"Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?",interests:["IL-21","Systemic sclerosis"],background:"Immunologist studying T follicular helper cells and IL-21 in autoimmune disease.",orcid:null,papers:["doi:10.1186/s13075-015-0660-z"]}));setPapers("10.1186/s13075-015-0660-z")}}>Fill in an example</button></header>
   <main className="wl-main wl-split" id="main-content" tabIndex={-1}>
    <aside className="wl-aside" aria-label="Your research home, as set up so far">
     <h1>Tell us what you work on, so your home starts useful.</h1>
     <p className="wl-lead">Two minutes. Every step is needed: together they build your own graph, gaps and updates. It stays on this device. No health information is asked for.</p>
     <ol className="rh-steps wl-steps" aria-label="Setup steps">{STEPS.map((t,i)=><li key={t} aria-current={i===step?"step":undefined} data-done={i<step}><span>{i<step?<Icon name="check" size={14}/>:i+1}</span>{t}</li>)}</ol>
     <div className="wl-preview" aria-live="polite">
      <b>Your home will start with</b>
      <ul>
       <li>{p.interests.length?`A radar for ${p.interests.slice(0,3).map(i=>departments.find(d=>d.slug===i)?.name??i).join(", ")}${p.interests.length>3?` and ${p.interests.length-3} more`:""}`:"A radar once you add a topic"}</li>
       <li>{p.goals.length?`Suggestions tuned to ${p.goals.length} goal${p.goals.length===1?"":"s"}`:"General suggestions from the published graph"}</li>
       <li>{custom.length?`A knowledge graph around ${custom.slice(0,3).join(", ")}${custom.length>3?` and ${custom.length-3} more`:""}`:"A knowledge graph around the topics you add"}</li>
       <li>{orc||pp.ids.length||files.length?`Your own work${orc?" from your ORCID iD":""}${pp.ids.length?`, ${pp.ids.length} paper${pp.ids.length===1?"":"s"}`:""}${files.length?`, ${files.length} document${files.length===1?"":"s"} read on this device`:""}`:"Your own papers, once you add an ORCID iD, a paper or a document"}</li>
      </ul>
     </div>
    </aside>
    <div className="wl-formcol">
    <section className="wl-card" aria-labelledby="wl-step">
     <h2 id="wl-step">{STEPS[step]}</h2>
     {step===0&&<>
      <fieldset><legend>What best describes your work? <small>Required.</small></legend><div className="rh-chips2">{ROLES.map(r=><button key={r} type="button" aria-pressed={p.role===r} onClick={()=>set("role",p.role===r?null:r)}>{r}</button>)}</div></fieldset>
      <fieldset><legend>Career stage</legend><div className="rh-chips2">{STAGES.map(r=><button key={r} type="button" aria-pressed={p.stage===r} onClick={()=>set("stage",p.stage===r?null:r)}>{r}</button>)}</div></fieldset>
      <label className="wl-f" htmlFor="wl-bg">A short background <small>Required. Field, training, current focus (at least 20 characters).</small></label>
      <textarea id="wl-bg" required aria-required="true" rows={4} maxLength={600} value={p.background} onChange={e=>set("background",e.target.value)} placeholder="For example: immunologist studying T follicular helper cells in autoimmune disease."/>
      {found.length>0&&<p className="wl-note" role="status">We recognise in your description: {found.map(f=>f.name).join(", ")}. You can add them to your research focus next.</p>}
     </>}
     {step===1&&<>
      {found.length>0&&<fieldset><legend>Found in what you wrote <small>Select to add to your focus.</small></legend><div className="rh-chips2">{found.map(f=><button key={f.id} type="button" aria-pressed={p.interests.includes(f.name)} disabled={!p.interests.includes(f.name)&&custom.length>=MAX_TOPICS} onClick={()=>toggle("interests",f.name)}>{f.name}</button>)}</div></fieldset>}
      <label className="wl-f" htmlFor="wl-q">What are you researching, or trying to answer? <small>One or two sentences.</small></label>
      <textarea id="wl-q" rows={3} maxLength={600} value={p.question} onChange={e=>set("question",e.target.value)} placeholder="For example: why does IL-21 signalling differ between lupus and systemic sclerosis?"/>
      <fieldset><legend>Topics, genes, pathways or diseases <small>Required. {custom.length} of {MAX_TOPICS}. Separate with commas or press Enter.</small></legend>
       <div className="wl-add"><label className="rh-vh" htmlFor="wl-topic">Add a topic</label><input id="wl-topic" value={topic} maxLength={80} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTopic()}}} placeholder="e.g. IL-21, Tfh cells, systemic sclerosis"/><button type="button" className="rh-primary" onClick={addTopic}>Add</button></div>
       <div className="rh-chips2">{custom.map(c=><button key={c} type="button" aria-pressed="true" aria-label={`Remove ${c}`} onClick={()=>toggle("interests",c)}>{c} <Icon name="x" size={14}/></button>)}</div></fieldset>
      <fieldset><legend>Broad areas <small>Optional, up to {MAX_AREAS}. {areas.length} chosen.</small></legend><div className="rh-chips2">{departments.map(d=><button key={d.slug} type="button" aria-pressed={p.interests.includes(d.slug)} disabled={!p.interests.includes(d.slug)&&areas.length>=MAX_AREAS} onClick={()=>toggle("interests",d.slug)}>{d.name}</button>)}</div></fieldset>
     </>}
     {step===2&&<>
      <p className="wl-note">Required: an ORCID iD, a paper, or an uploaded document. This lets HSI find your own papers and suggest what is new around them. Your ORCID iD and paper IDs are used only to query public sources (OpenAlex, Europe PMC) and are not stored on our servers.</p>
      <label className="wl-f" htmlFor="wl-orcid">ORCID iD</label>
      <input id="wl-orcid" className="wl-in" value={orcid} maxLength={40} onChange={e=>setOrcid(e.target.value)} placeholder="0000-0000-0000-0000" aria-invalid={orcBad} aria-describedby="wl-orcid-h"/>
      <p id="wl-orcid-h" className={orcBad?"wl-bad":"wl-note"} role={orcBad?"alert":undefined}>{orcBad?"That is not a valid ORCID iD (check the digits).":orc?"Valid ORCID iD.":"Find yours at orcid.org."}</p>
      <label className="wl-f" htmlFor="wl-papers">Papers <small>Paste DOIs or PubMed IDs, one per line. Up to 20.</small></label>
      <textarea id="wl-papers" rows={4} value={papers} onChange={e=>setPapers(e.target.value)} placeholder={"10.1186/s13075-015-0660-z\n26055806"}/>
      <fieldset className="wl-up"><legend>Evidence of your work <small>Papers, a CV, or your LinkedIn profile saved as PDF. Up to {MAX_FILES} files, 10 MB each.</small></legend>
       <label className="rh-ghost wl-file" htmlFor="wl-files">{busy?"Reading…":"Choose files"}<input id="wl-files" className="rh-vh" type="file" multiple accept={ACCEPT} disabled={busy||files.length>=MAX_FILES} onChange={e=>{void addFiles(e.target.files);e.target.value=""}}/></label>
       <p className="wl-note">Files are read in your browser and never uploaded. We keep only the DOIs and concept names you choose to save, on this device. PDF reading is best effort.</p>
       {files.length>0&&<ul className="wl-files">{files.map(f=><li key={f.name}><b>{f.name}</b><span>{f.chars?`${f.chars.toLocaleString("en-GB")} characters read`:"Nothing read"}{f.note?`. ${f.note}`:""}</span><button type="button" className="rh-ghost" aria-label={`Remove ${f.name}`} onClick={()=>setFiles(x=>x.filter(y=>y!==f))}>Remove</button></li>)}</ul>}
       <label className="wl-f" htmlFor="wl-li">LinkedIn <small>LinkedIn does not allow automated reading. Paste your About and Experience text here, or upload the PDF from More, then Save to PDF.</small></label>
       <textarea id="wl-li" rows={3} maxLength={6000} value={linked} onChange={e=>setLinked(e.target.value)} placeholder="Paste text from your LinkedIn profile"/>
       {foundDocs.length>0&&<><p className="wl-note" role="status">Concepts recognised in your documents. Select to add to your focus.</p><div className="rh-chips2">{foundDocs.map(f=><button key={f.id} type="button" aria-pressed={p.interests.includes(f.name)} disabled={!p.interests.includes(f.name)&&custom.length>=MAX_TOPICS} onClick={()=>toggle("interests",f.name)}>{f.name}</button>)}</div></>}
      </fieldset>
      <p className="wl-note" role="status">{pp.ids.length?`${pp.ids.length} paper${pp.ids.length===1?"":"s"} recognised.`:""}{pp.rejected.length?` Not recognised: ${pp.rejected.join(", ")}.`:""}</p>
     </>}
     {step===3&&<>
      <fieldset><legend>What do you want from HSI? <small>Required. Choose up to {MAX_GOALS}; {p.goals.length} chosen.</small></legend><div className="rh-chips2">{GOALS.map(g=><button key={g} type="button" aria-pressed={p.goals.includes(g)} disabled={!p.goals.includes(g)&&p.goals.length>=MAX_GOALS} onClick={()=>toggle("goals",g)}>{g}</button>)}</div></fieldset>
      <fieldset><legend>Research updates <small>How often your Radar should refresh.</small></legend><div className="rh-chips2">{CADENCES.map(c=><button key={c} type="button" aria-pressed={p.cadence===c} onClick={()=>set("cadence",c)}>{CAD[c]}</button>)}</div>
       <p className="wl-note">Your Radar updates when you open HSI. Email delivery is not available yet, so this records your preference for when it is.</p></fieldset>
      <fieldset><legend>Look</legend><div className="rh-seg wl-seg">{(["light","dark"] as const).map(t=><button key={t} type="button" aria-pressed={ap.theme===t} onClick={()=>changeAp({...ap,theme:t})}>{t==="light"?"Light":"Dark"}</button>)}</div>
       <div className="rh-swatches">{ACCENTS.map(a=><button key={a.id} type="button" aria-pressed={ap.accent===a.id} aria-label={a.label} title={a.label} style={{background:a.swatch}} onClick={()=>changeAp({...ap,accent:a.id})}>{ap.accent===a.id&&<Icon name="check" size={14}/>}</button>)}</div></fieldset>
     </>}
     {note&&<p className="wl-bad" role="alert">{note}</p>}
     <div className="rh-row wl-actions">
      {step>0&&<button type="button" className="rh-ghost" onClick={()=>setStep(step-1)}>Back</button>}
      {step<3?<button type="button" className="rh-primary" onClick={()=>setStep(step+1)} disabled={!can}>Next <Icon name="arrow" size={16}/></button>:<>
        <button type="button" className="rh-primary" onClick={()=>finish("home")} disabled={!can}>Finish and open my home <Icon name="arrow" size={16}/></button>
        <button type="button" className="rh-ghost" onClick={()=>finish("workspace")} disabled={!canFinishInvestigate}>Finish and open live investigation</button>
      </>}
            {!can&&<span className="wl-note" role="status">{[ "Choose your role and write a short background to continue.","Add at least one specific topic, gene or disease to continue.","Add an ORCID iD, a paper ID, or upload a document to continue.","Choose at least one goal to continue."][step]}</span>}
            {step===3&&can&&<span className="wl-note" role="status">Profile stays on this device. Durable server profile is not claimed. Live investigation does not auto-run.</span>}
     </div>
    </section>
    </div>
    {showFunnel&&stats&&<aside className="wl-funnel" aria-label="Setup runs on this browser">
     <h2>Setup runs on this browser</h2>
     <p>Kept only here: the day and the furthest step. No answers, no identifiers. {stats.runs} run{stats.runs===1?"":"s"}, {stats.done} finished.</p>
     <ol>{stats.byStep.map((n,i)=><li key={i}>Reached step {i+1}: <b>{n}</b></li>)}</ol>
    </aside>}
   </main>
  </div>
 );
}
