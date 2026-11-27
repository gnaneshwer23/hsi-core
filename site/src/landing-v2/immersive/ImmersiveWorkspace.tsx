import {lazy,Suspense,useEffect,useMemo,useRef,useState} from "react";
import {Link} from "../router";
import {Logo} from "../components/site/Header";
import {applySeo} from "../../lib/seo/applySeo";
import {STATUS_META,entityById} from "../components/atlas/atlasData";
import {deriveWorkspacePlan,PERSONA_LABEL,personaOf} from "../../../../src/onboarding/scientificOnboarding";
import {Status} from "../onboarding/ui";
import {useOnboarding} from "../onboarding/store";
import {EvidenceTag} from "../workspace/Frame";
import {
 COMPANION,ENV_ENTITIES,LAYERS,MEMORY_TIMELINE,RECENT_INVESTIGATIONS,SCALES,emphasis,evidenceLandscape,gapEdges,initialView,relationsIn,scaleOf,weakestInEnv,
 type CompanionTurn,type Emphasis,type Layer,type Scale,
} from "./environment";
import {Map2D} from "./Map2D";
import "./immersive.css";

const Canvas3D=lazy(()=>import("./Canvas3D"));

function useCapable(){
 const [ok,setOk]=useState(false);
 useEffect(()=>{
  try{
   const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   const c=document.createElement("canvas");
   const gl=!!(c.getContext("webgl2")||c.getContext("webgl"));
   setOk(gl&&!reduce&&window.innerWidth>=900);
  }catch{setOk(false)}
 },[]);
 return ok;
}

const NAV:{label:string;layer?:Layer;anchor?:string;planned?:boolean}[]=[
 {label:"Overview",anchor:"im-canvas"},{label:"Biological atlas",anchor:"im-canvas"},{label:"Mechanisms",layer:"mechanisms"},{label:"Evidence",layer:"evidence"},
 {label:"Conflicts",layer:"conflicts"},{label:"Research gaps",layer:"gaps"},{label:"Scientific memory",anchor:"im-memory"},
 {label:"Investigations",planned:true},{label:"Hypotheses",planned:true},{label:"Experiments",planned:true},{label:"Collaboration",planned:true},
];

export default function ImmersiveWorkspace(){
 const [s]=useOnboarding();
 const plan=useMemo(()=>deriveWorkspacePlan(s),[s]);
 const start=useMemo(()=>initialView(s.primaryDomain,s.objectives),[s.primaryDomain,s.objectives]);
 const capable=useCapable();
 const [layer,setLayer]=useState<Layer>(start.layer);
 const [scale,setScale]=useState<Scale|null>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const [hover,setHover]=useState<string|null>(null);
 const [pinned,setPinned]=useState<Emphasis|null>(null);
 const [view,setView]=useState<"auto"|"3d"|"2d">("auto");
 const [dock,setDock]=useState(true);
 const [turns,setTurns]=useState<{q:string;a:string[]}[]>([]);
 const live=useRef<HTMLParagraphElement>(null);
 useEffect(()=>{applySeo("/workspace/immersive")},[]);
 useEffect(()=>{setLayer(start.layer)},[start.layer]);

 const use3d=view==="3d"||(view==="auto"&&capable);
 const emph=useMemo(()=>emphasis(layer,scale,selected,pinned),[layer,scale,selected,pinned]);
 const select=(id:string|null)=>{setSelected(id);setPinned(null)};
 const detail=selected?entityById[selected]:null;
 const rels=selected?relationsIn(selected):[];
 const landscape=evidenceLandscape();
 const max=Math.max(...landscape.map(l=>l.count),1);
 const persona=personaOf(s);
 const tools=plan?.tools.slice(0,4)??[];

 const ask=(t:CompanionTurn)=>{
  const r=t.build(selected);
  setTurns(x=>[...x.slice(-3),{q:t.question,a:r.answer}]);
  if(r.layer)setLayer(r.layer);
  setPinned(r.highlight.entities.size||r.highlight.edges.size?r.highlight:null);
  if(live.current)live.current.textContent=`Companion answered: ${t.question}`;
 };
 const hoverEntity=hover?entityById[hover]:null;

 return (
  <div className="lv2 im" data-layer={layer}>
   <a href="#im-canvas" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to the environment</a>
   <p ref={live} className="sr-only" role="status" aria-live="polite"/>
   <header className="im-top">
    <Logo/>
    <div className="im-search"><label><span className="sr-only">Find a scientific entity</span>
     <select aria-label="Find a scientific entity" value={selected??""} onChange={e=>select(e.target.value||null)}>
      <option value="">Find an entity…</option>
      {ENV_ENTITIES.map(e=><option key={e.id} value={e.id}>{e.label}</option>)}
     </select></label></div>
    <nav className="im-top-links" aria-label="Workspace"><Link to="/workspace/preview" className="ws-link">Role previews</Link><Link to="/settings/scientific-profile" className="ws-link">Profile</Link></nav>
   </header>
   <div className="im-banner" role="note"><strong>Illustrative environment.</strong> Sample biology from the illustrative atlas, not verified findings. No model is connected and nothing is saved or granted. Inferred relationships are candidates, not established mechanisms.</div>

   <div className="im-shell">
    <nav className="im-nav" aria-label="Sections">
     <ul>{NAV.map(n=>(
      <li key={n.label}>
       {n.planned?<span className="im-planned" aria-disabled="true">{n.label} <Status s="Planned"/></span>
        :n.layer?<button type="button" aria-pressed={layer===n.layer} onClick={()=>setLayer(n.layer!)}>{n.label}</button>
        :<a href={`#${n.anchor}`}>{n.label}</a>}
      </li>))}
     </ul>
     {plan&&<div className="im-you"><p className="ws-eyebrow">Your setup</p><p>{plan.primaryRoleLabel}</p><p className="ws-sub">{PERSONA_LABEL[persona!]} tools</p><ul>{tools.map(t=><li key={t.id}>{t.name} <Status s={t.status}/></li>)}</ul></div>}
    </nav>

    <main id="im-canvas" className="im-main" tabIndex={-1}>
     <div className="im-heading">
      <p className="ws-eyebrow">Active biological environment</p>
      <h1>Gut–immune–brain axis</h1>
      {!start.matchesDomain&&<p className="ws-note">Your primary domain’s environment is planned. This is the one environment built so far.</p>}
      {start.matchesDomain&&s.primaryDomain&&<p className="ws-sub">Opened for your domain and goals: the {LAYERS.find(l=>l.id===start.layer)!.label.toLowerCase()} layer.</p>}
     </div>

     <div className="im-controls">
      <div role="radiogroup" aria-label="Layer" className="ws-seg">{LAYERS.map(l=><button key={l.id} type="button" role="radio" aria-checked={layer===l.id} onClick={()=>{setLayer(l.id);setPinned(null)}}>{l.label}</button>)}</div>
      <div role="radiogroup" aria-label="Biological scale" className="ws-seg">
       <button type="button" role="radio" aria-checked={scale===null} onClick={()=>setScale(null)}>All scales</button>
       {SCALES.map(sc=><button key={sc.id} type="button" role="radio" aria-checked={scale===sc.id} onClick={()=>{setScale(sc.id);setPinned(null)}}>{sc.label}</button>)}
      </div>
      <div role="radiogroup" aria-label="View" className="ws-seg">
       {(["auto","3d","2d"] as const).map(v=><button key={v} type="button" role="radio" aria-checked={view===v} onClick={()=>setView(v)}>{v==="auto"?"Auto":v==="3d"?"3D":"2D map"}</button>)}
      </div>
     </div>
     <p className="ws-sub im-layer-note">{LAYERS.find(l=>l.id===layer)!.note}</p>

     <div className="im-stage">
      {use3d?(
       <Suspense fallback={<p role="status" className="im-wait">Loading the 3D environment…</p>}>
        <Canvas3D layer={layer} scale={scale} selected={selected} emphasis={emph} onSelect={select} onHover={setHover}/>
       </Suspense>
      ):<Map2D layer={layer} selected={selected} emphasis={emph} onSelect={select} onHover={setHover}/>}
      <p className="im-caption" aria-hidden="true">{hoverEntity?`${hoverEntity.label} · ${hoverEntity.kind} · ${scaleOf(hoverEntity.id)} scale`:use3d?"Drag to rotate. Select a node to inspect it.":"Select a node to inspect it."}</p>
      <Legend/>
     </div>
     {use3d&&<p className="ws-sub">Prefer a keyboard or screen reader? Use “Find an entity” above, or switch to the 2D map.</p>}

     <section className="im-bottom" aria-label="Intelligence panels">
      <section className="im-card" aria-labelledby="im-land"><h2 id="im-land">Evidence landscape</h2>
       <ul className="im-bars">{landscape.map(l=><li key={l.status}><EvidenceTag s={l.status}/><span className="im-bar" aria-hidden="true"><i style={{width:`${(l.count/max)*100}%`,background:`var(--bar-${l.status})`}}/></span><b>{l.count}</b><span className="sr-only"> relations</span></li>)}</ul>
       <p className="ws-sub">Counts of candidate relations in this sample environment. Not a count of studies.</p>
      </section>
      <section className="im-card" aria-labelledby="im-gaps"><h2 id="im-gaps">Research gaps</h2>
       <ul className="im-rows">{gapEdges().slice(0,4).map(e=><li key={e.id}><button type="button" onClick={()=>{setLayer("gaps");select(e.from)}}>{entityById[e.from]!.label} → {entityById[e.to]!.label}</button><EvidenceTag s={e.status}/></li>)}</ul>
      </section>
      <section id="im-memory" className="im-card" aria-labelledby="im-mem"><h2 id="im-mem">Scientific memory</h2>
       <p className="ws-badge">Sample timeline · private by default · off until an account is connected</p>
       <ol className="im-time">{MEMORY_TIMELINE.map(m=><li key={m.when}><b>{m.when}</b><span>{m.kind}: {m.text}</span></li>)}</ol>
      </section>
      <section className="im-card" aria-labelledby="im-rec"><h2 id="im-rec">Recent investigations</h2>
       <ul className="im-plain">{RECENT_INVESTIGATIONS.map(r=><li key={r}>{r}</li>)}</ul>
       <p className="ws-sub">Sample entries. No authorised history exists for you.</p>
      </section>
     </section>
    </main>

    <aside className="im-side" aria-label="Contextual intelligence">
     <section className="im-card" aria-labelledby="im-insp">
      <h2 id="im-insp">{detail?detail.label:"Inspector"}</h2>
      {!detail?<p className="ws-sub">Select an entity in the environment to see what is known, what conflicts and what is unresolved.</p>:<>
       <p className="ws-sub">{detail.kind} · {scaleOf(detail.id)} scale · {detail.domain}</p>
       <p>{detail.note}</p>
       <dl className="ws-dl">
        <div><dt>Weakest evidence</dt><dd>{weakestInEnv(detail.id)?<EvidenceTag s={weakestInEnv(detail.id)!}/>:"No relation in this environment"}</dd></div>
        <div><dt>Review status</dt><dd>Unreviewed candidate. Nothing here is approved.</dd></div>
        <div><dt>Authorised investigation history</dt><dd>None. No account is connected.</dd></div>
       </dl>
       <h3 className="ws-h3">Relations</h3>
       <ul className="im-rows">{rels.map(r=><li key={r.edge.id}><button type="button" onClick={()=>select(r.other.id)}>{r.direction==="out"?"→":"←"} {r.other.label}</button><EvidenceTag s={r.edge.status}/><span className="ws-sub">{r.edge.basis}{r.edge.unresolved?` Unresolved: ${r.edge.unresolved}`:""}</span></li>)}</ul>
       <p className="ws-sub">Status key: {Object.values(STATUS_META).map(m=>m.short).join(", ")}.</p>
      </>}
     </section>

     <section className="im-card" aria-labelledby="im-nex">
      <div className="im-nex-head"><h2 id="im-nex">NEXUS companion</h2><button type="button" className="ws-btn" aria-expanded={dock} onClick={()=>setDock(!dock)}>{dock?"Collapse":"Expand"}</button></div>
      <p className="ws-badge">Illustrative · scripted from the atlas · no model is connected</p>
      {dock&&<>
       <ul className="im-asks">{COMPANION.map(t=><li key={t.id}><button type="button" className="ws-btn" disabled={t.needs==="selection"&&!selected} title={t.needs==="selection"&&!selected?"Select an entity first":undefined} onClick={()=>ask(t)}>{t.question}</button></li>)}</ul>
       {turns.length>0&&<ol className="im-turns" aria-label="Conversation">{turns.map((t,i)=><li key={i}><p className="im-q">{t.q}</p>{t.a.map(a=><p key={a}>{a}</p>)}</li>)}</ol>}
       {pinned&&<button type="button" className="ws-btn" onClick={()=>setPinned(null)}>Clear highlight</button>}
      </>}
     </section>
    </aside>
   </div>
  </div>
 );
}

function Legend(){
 return (
  <ul className="im-legend" aria-label="Legend">
   {(["supported","association","hypothesis","contested"] as const).map(s=><li key={s}><EvidenceTag s={s}/></li>)}
  </ul>
 );
}
