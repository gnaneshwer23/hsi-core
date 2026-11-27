import {lazy,Suspense,useCallback,useEffect,useMemo,useState} from "react";
import {Link} from "../landing-v2/router";
import {Logo} from "../landing-v2/components/site/Header";
import {applySeo} from "../lib/seo/applySeo";
import {useSharedBundle} from "../lib/useSharedBundle";
import {useOnboarding} from "../landing-v2/onboarding/store";
import {personaOf} from "../../../src/onboarding/scientificOnboarding";
import {
 DEFAULT_OPENING,EMPTY_FILTERS,HSI_DOMAINS,WORKSPACE_SCOPES,openingView,NEXT_STUDY_NOTE,gapView,questionPathAssertions,questionView,questionsInView,SCALE_BANDS,bandLabel,bandOf,crossScaleLinks,placedShare,scaleCoverage,MODES,READINESS_LABEL,applyFilters,buildGraphModel,comparisonUnits,crossDomainSlice,disagreements,domainCoverage,domainLabel,expand,facets,finishSlice,isFiltered,isOpenable,modeById,tracePaths,
 type Filters,type GraphAssertionView,type ScaleBand,type GraphModel,type ModeId,type TracedPath,
} from "../../../src/graphWorkspace";
import {layoutGraph} from "../../../src/graphWorkspace/layout";
import {layout3D} from "../../../src/graphWorkspace/scale";
import {Graph2D,type GEdge,type GNode} from "./Graph2D";
import {AssertionTable,FilterPanel,Inspector} from "./Panels";
import {ComparePanel} from "./Compare";
import {QuestionsPanel} from "./Investigate";
import {NexusDock} from "./NexusDock";
import "./graph.css";

const Graph3D=lazy(()=>import("./Graph3D"));

/** 3D needs WebGL. Without it the 3D option is disabled with the reason; the graph and table carry the same data. */
function useWebGL(){
 const [s,setS]=useState<{gl:boolean|null;reduce:boolean}>({gl:null,reduce:false});
 useEffect(()=>{
  let gl=false,reduce=false;
  try{reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const c=document.createElement("canvas");gl=!!(c.getContext("webgl2")||c.getContext("webgl"))}catch{gl=false}
  setS({gl,reduce});
 },[]);
 return s;
}

/** Modes with a working view in this phase. The rest are listed with why they cannot open yet. */
const BUILT:readonly ModeId[]=["atlas","mechanism","evidence","contradiction","gap","hypothesis","experimental"];
const PALETTE=["#83B8AD","#D8B477","#7FA6B8","#B7A8D0","#C9CED2","#5FA58F","#E0A96D","#8A9BA8"];

const SCOPES=WORKSPACE_SCOPES;
const MAX_VIEW=400;

export default function GraphWorkspace(){
 const {bundle,failed}=useSharedBundle();
 useEffect(()=>{applySeo("/workspace/graph")},[]);
 const model=useMemo(()=>bundle?buildGraphModel(bundle):null,[bundle]);
 return (
  <div className="lv2 gw">
   <a href="#gw-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to the graph</a>
   <header className="gw-top"><Logo/><nav className="gw-toplinks" aria-label="Workspace"><Link to="/workspace/immersive" className="gw-link">Immersive preview</Link><Link to="/knowledge-graph" className="gw-link">Knowledge graph</Link><Link to="/settings/scientific-profile" className="gw-link">Profile</Link></nav></header>
   {failed&&<main id="gw-main" className="gw-state" tabIndex={-1}><h1>Graph unavailable</h1><p role="status">Snapshot unavailable. No substitute graph is shown.</p><p>The published graph could not be loaded and verified. Reload to try again.</p><button type="button" className="gw-btn" onClick={()=>window.location.reload()}>Reload</button></main>}
   {!failed&&!model&&<main id="gw-main" className="gw-state" tabIndex={-1}><h1>Living Intelligence Graph</h1><p role="status">Verifying the published snapshot…</p></main>}
   {model&&<Loaded model={model}/>}
  </div>
 );
}

function Loaded({model}:{model:GraphModel}){
 const [onb]=useOnboarding();
 const opening=useMemo(()=>openingView({persona:personaOf(onb),objectives:onb.objectives,primaryDomain:onb.primaryDomain,secondaryDomains:onb.secondaryDomains,level:onb.methods.level}),[onb]);
 const start:ModeId=opening.mode;
 const [mode,setMode]=useState<ModeId>(start);
 const [scopeId,setScopeId]=useState(opening.scopeId);
 const [view,setView]=useState<"graph"|"table"|"3d">("graph");
 const webgl=useWebGL();
 const [hover3d,setHover3d]=useState<string|null>(null);
 const [zoom3d,setZoom3d]=useState(1);
 const [filters,setFilters]=useState<Filters>(EMPTY_FILTERS);
 const [depth,setDepth]=useState(0);
 const [entity,setEntity]=useState<string|null>(null);
 const [assertionId,setAssertionId]=useState<string|null>(null);
 const [focus,setFocus]=useState(false);
 const [path,setPath]=useState<TracedPath|null>(null);
 const [from,setFrom]=useState("");const [to,setTo]=useState("");
 const [gapId,setGapId]=useState<string|null>(null);
 const [compareIds,setCompareIds]=useState<string[]>([]);
 const [activeUnit,setActiveUnit]=useState<string|null>(null);

 const m=modeById[mode];
 const scope=SCOPES.find(s=>s.id===scopeId)!;

 /* scope -> neighbours -> mode, then filters. Layout is computed before filters so positions stay put while filtering. */
 const slice=useMemo(()=>scope.pair?crossDomainSlice(model,scope.pair[0],scope.pair[1]):finishSlice(model,model.assertions),[model,scope]);
 const expanded=useMemo(()=>depth>0?expand(model,slice.nodeIds,depth,MAX_VIEW,slice.assertions):{assertions:slice.assertions,added:0,truncated:false},[model,slice,depth]);
 const scopeGaps=useMemo(()=>{const ids=new Set(expanded.assertions.flatMap(a=>[a.subject.id,a.object.id]));return model.gaps.filter(g=>ids.has(g.subjectId)||ids.has(g.objectId))},[model,expanded]);
 const units=useMemo(()=>comparisonUnits(model,expanded.assertions),[model,expanded]);
 const globalCount=useMemo(()=>disagreements(comparisonUnits(model,model.assertions)).length,[model]);
 /* A pair's own reading is the most specific, so it wins; a concept-level reading colours only records no pair covers. */
 const readingOf=useMemo(()=>{
  const r=new Map<string,string>();
  const ds=disagreements(units);
  for(const u of ds.filter(x=>x.kind==="pair"))for(const id of u.assertionIds)if(!r.has(id))r.set(id,u.reading);
  for(const u of ds.filter(x=>x.kind==="concept"))for(const id of u.assertionIds)if(!r.has(id))r.set(id,u.reading);
  return r;
 },[units]);
 const base=useMemo<readonly GraphAssertionView[]>(()=>{
  if(m.select==="comparable_pairs"){return expanded.assertions.filter(a=>readingOf.has(a.id))}
  if(m.select==="question_paths")return questionPathAssertions(model,expanded.assertions);
  if(m.select==="gap_records"){const ids=new Set(scopeGaps.flatMap(g=>[g.subjectId,g.objectId]));return expanded.assertions.filter(a=>ids.has(a.subject.id)||ids.has(a.object.id))}
  return expanded.assertions;
 },[m,expanded,scopeGaps,readingOf]);
 const visible=useMemo(()=>applyFilters(base,filters),[base,filters]);
 const fac=useMemo(()=>facets(base),[base]);

 const showGaps=m.select==="gap_records";
 const questionViews=useMemo(()=>m.select==="question_paths"?questionsInView(model,expanded.assertions).map(q=>questionView(model,q,expanded.assertions)):[],[model,m.select,expanded]);
 const gapEdges=useMemo(()=>showGaps?scopeGaps:[],[showGaps,scopeGaps]);

 const layoutIds=useMemo(()=>{const s=new Set(base.flatMap(a=>[a.subject.id,a.object.id]));for(const g of gapEdges){s.add(g.subjectId);s.add(g.objectId)}return s},[base,gapEdges]);
 const groupOf=useMemo(()=>{
  const touching=new Map<string,GraphAssertionView[]>();
  for(const a of base)for(const id of [a.subject.id,a.object.id]){const l=touching.get(id)??[];l.push(a);touching.set(id,l)}
  return (id:string)=>{
   const n=model.nodes.get(id);
   if(m.nodeEncoding==="kind")return n?.kind??"unknown";
   if(m.nodeEncoding==="evidence_model"){
    const l=touching.get(id)??[];const c=new Map<string,number>();
    for(const a of l){const s=a.context.species.state==="stated"?a.context.species.value:"Not stated";c.set(s,(c.get(s)??0)+1)}
    return [...c].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0]))[0]?.[0]??"Not stated";
   }
   if(m.nodeEncoding==="context_completeness"){const l=touching.get(id)??[];const avg=l.length?l.reduce((s,a)=>s+a.contextCompleteness.stated,0)/l.length:0;return avg<2?"Little context stated":avg<4?"Some context stated":"More context stated"}
   const d=model.nodeDomains.get(id)?.domains[0];return d?domainLabel(d):"Unmapped";
  };
 },[model,m,base]);
 const kindOf=useCallback((id:string)=>model.nodes.get(id)?.kind??"unknown",[model]);
 const bandOfId=useCallback((id:string)=>bandOf(kindOf(id)),[kindOf]);
 const positions=useMemo(()=>layoutGraph([...layoutIds].map(id=>({id,group:groupOf(id)})),[...base.map(a=>({s:a.subject.id,o:a.object.id})),...gapEdges.map(g=>({s:g.subjectId,o:g.objectId}))]),[layoutIds,groupOf,base,gapEdges]);
 const positions3d=useMemo(()=>view==="3d"?layout3D(positions,bandOfId):new Map<string,[number,number,number]>(),[view,positions,bandOfId]);
 const scaleCounts=useMemo(()=>scaleCoverage(base),[base]);
 const crossing=useMemo(()=>crossScaleLinks(visible),[visible]);
 const placed=useMemo(()=>placedShare(visible),[visible]);
 const navBand:ScaleBand|null=filters.scales.length===1?filters.scales[0]!:null;
 const setBand=(b:ScaleBand|null)=>{setFilters({...filters,scales:b?[b]:[]});setPath(null)};
 const groups=useMemo(()=>[...new Set([...layoutIds].map(groupOf))].sort(),[layoutIds,groupOf]);
 const colourOf=(g:string)=>PALETTE[groups.indexOf(g)%PALETTE.length]??PALETTE[0]!;

 const visIds=useMemo(()=>{const s=new Set(visible.flatMap(a=>[a.subject.id,a.object.id]));for(const g of gapEdges){if(s.has(g.subjectId)||s.has(g.objectId)||!isFiltered(filters)){s.add(g.subjectId);s.add(g.objectId)}}if(entity)s.add(entity);return s},[visible,gapEdges,entity,filters]);
 const degree=useMemo(()=>{const d=new Map<string,number>();for(const a of visible)for(const id of [a.subject.id,a.object.id])d.set(id,(d.get(id)??0)+1);return d},[visible]);
 const nodes:GNode[]=useMemo(()=>[...visIds].map(id=>({id,label:model.nodes.get(id)?.name??id,group:groupOf(id),degree:degree.get(id)??0})),[visIds,model,groupOf,degree]);
 const edges:GEdge[]=useMemo(()=>[
  ...visible.map(a=>({id:a.id,s:a.subject.id,o:a.object.id,negated:a.negated,kind:"assertion" as const,pair:m.select==="comparable_pairs"&&readingOf.has(a.id),reading:m.select==="comparable_pairs"?readingOf.get(a.id):undefined})),
  ...gapEdges.filter(g=>visIds.has(g.subjectId)&&visIds.has(g.objectId)).map(g=>({id:`gap:${g.id}`,s:g.subjectId,o:g.objectId,negated:false,kind:"gap" as const})),
 ],[visible,gapEdges,visIds,readingOf,m.select]);

 const traced=useMemo(()=>({nodes:new Set(path?.nodeIds??[]),edges:new Set(path?.assertionIds??[])}),[path]);
 const assertion=assertionId?model.assertions.find(a=>a.id===assertionId)??null:null;
 const related=entity?model.assertions.filter(a=>a.subject.id===entity||a.object.id===entity):[];
 const traces=useMemo(()=>from&&to&&from!==to?tracePaths(visible,from,to,5,5):[],[visible,from,to]);

 const selectNode=(id:string|null)=>{setEntity(id);setAssertionId(null)};
 const selectEdge=(id:string)=>{if(id.startsWith("gap:")){const g=model.gaps.find(x=>`gap:${x.id}`===id);if(g){setGapId(g.id);selectNode(g.subjectId)}return}setAssertionId(id);setEntity(null)};
 const changeMode=(id:ModeId)=>{setMode(id);setPath(null);setGapId(null)};
 const reset=()=>setFilters(EMPTY_FILTERS);
 const chosenName=(id:string)=>model.nodes.get(id)?.name??id;

 const exportView=()=>{
  const blob=new Blob([JSON.stringify({exportedFrom:"HSI Living Intelligence Graph",graphVersion:model.version,mode,scope:scope.label,note:"Every relationship is a candidate: unreviewed, confidence not calibrated, source not verified. Missing context is marked not stated.",assertions:visible},null,2)+"\n"],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`hsi-graph-${model.version.slice(0,8)}-${mode}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };

 const coverage=useMemo(()=>domainCoverage(model,HSI_DOMAINS.map(d=>d.key)),[model]);
 const ctxHist=useMemo(()=>{const h=Array.from({length:9},()=>0);for(const a of visible)h[a.contextCompleteness.stated]!++;return h},[visible]);
 const maxH=Math.max(...ctxHist,1);
 const statusSummary=`${visible.length} candidate relationship${visible.length===1?"":"s"} in view. All are unreviewed, with confidence not calibrated and sources not verified.`;
 const unavailable=!isOpenable(m)||!BUILT.includes(mode);

 return (
  <>
   <div className="gw-banner" role="note"><strong>Published candidate graph, version {model.version.slice(0,8)}.</strong> Every relationship is a candidate: unreviewed, confidence not calibrated, source not verified. Nothing here is an established finding. Missing context is shown as missing.</div>
   <div className="gw-bar" role="toolbar" aria-label="Graph controls">
    <label className="gw-field gw-search"><span className="sr-only">Search concepts and relationships</span><input type="search" placeholder="Search concepts…" value={filters.query} onChange={e=>setFilters({...filters,query:e.target.value})}/></label>
    <label className="gw-field"><span>Mode</span>
     <select aria-label="Mode" value={mode} onChange={e=>changeMode(e.target.value as ModeId)}>
      {MODES.map(x=>{const ok=isOpenable(x)&&BUILT.includes(x.id);return <option key={x.id} value={x.id} disabled={!ok}>{x.label}{ok?"":` — ${isOpenable(x)?"next phase":READINESS_LABEL[x.readiness]}`}</option>})}
     </select></label>
    <label className="gw-field"><span>Scope</span>
     <select aria-label="Scope" value={scopeId} onChange={e=>{setScopeId(e.target.value);setPath(null);setDepth(0)}}>{SCOPES.map(s=>{const c=s.pair?crossDomainSlice(model,s.pair[0],s.pair[1]).assertions.length:model.assertions.length;return <option key={s.id} value={s.id}>{s.label} ({c})</option>})}</select></label>
    <div className="gw-seg" role="radiogroup" aria-label="View"><button type="button" role="radio" aria-checked={view==="graph"} onClick={()=>setView("graph")}>Graph</button><button type="button" role="radio" aria-checked={view==="table"} onClick={()=>setView("table")}>Table</button><button type="button" role="radio" aria-checked={view==="3d"} disabled={webgl.gl===false} title={webgl.gl===false?"3D needs WebGL, which this browser does not provide. The graph and table show the same data.":undefined} onClick={()=>setView("3d")}>3D</button></div>
    <label className="gw-toggle"><input type="checkbox" checked={focus} onChange={e=>setFocus(e.target.checked)}/> Focus on selection</label>
    <button type="button" className="gw-btn" onClick={exportView}>Export this view</button>
   </div>

   <div className="gw-shell">
    <FilterPanel filters={filters} set={setFilters} facets={fac} filtered={isFiltered(filters)} onReset={reset} depth={depth} setDepth={setDepth} added={expanded.added} truncated={expanded.truncated} coverage={coverage}/>

    <main id="gw-main" className="gw-main" tabIndex={-1}>
     <div className="gw-heading">
      <p className="gw-eyebrow">{m.label} · {scope.label}</p>
      <h1>Living Intelligence Graph</h1>
      <p className="gw-hint">{m.summary} {m.readinessNote}</p>
      {opening.personalised&&<details className="gw-why"><summary>Why the workspace opened here</summary><ul className="gw-list">{opening.reasons.map(r=><li key={r}>{r}</li>)}</ul><p className="gw-hint">Every other mode, including conflicts, stays one click away.</p><button type="button" className="gw-btn" onClick={()=>{changeMode(DEFAULT_OPENING.mode);setScopeId(DEFAULT_OPENING.scopeId);setDepth(0)}}>Open the default view</button></details>}
      {opening.guidance&&<div className="gw-guide" role="note"><p><strong>Reading this graph.</strong> Each dot is a concept, such as a cell type, a molecule or a disease. Each line is a relationship that a published source reported between two concepts. A dashed line is a finding recorded as not holding.</p><p>Nothing here is established knowledge: every relationship is an unreviewed candidate. Select a dot or a line to see what the source stated, what it did not, and where it came from.</p></div>}
      {webgl.gl===false&&<p className="gw-hint">3D is unavailable in this browser because WebGL is not provided. The graph and the table show the same concepts and relationships.</p>}
      <div className="gw-scales">
       <div className="gw-seg" role="radiogroup" aria-label="Biological scale">
        <button type="button" role="radio" aria-checked={!filters.scales.length} onClick={()=>setBand(null)}>All scales</button>
        {scaleCounts.filter(c=>c.relationships>0).map(c=><button key={c.band} type="button" role="radio" aria-checked={navBand===c.band} onClick={()=>setBand(c.band)}>{bandLabel(c.band)} <small>({c.concepts})</small></button>)}
       </div>
       <p className="gw-hint">Scale comes from each concept’s type through a stated map; the published graph records no scale of its own. A scale keeps the relationships that touch it, so links to the levels above and below stay in view.</p>
      </div>
     </div>

     {unavailable?<p className="gw-empty" role="status">{m.label} has no view yet. {m.needs??""}</p>
      :m.select==="question_paths"&&!visible.length?<p className="gw-empty" role="status">No relationship in this view touches a recorded question. The questions below still stand on their recorded gaps.</p>
      :m.select==="comparable_pairs"&&!visible.length?<p className="gw-empty" role="status">No relationship in this view records a disagreement. That describes this slice, not the science. The panel below says where disagreements are recorded.</p>
      :view==="3d"&&webgl.gl?<>
       <div className="gw-canvas gw-3d" id="gw-3d">
        <Suspense fallback={<p role="status" className="gw-empty">Loading the 3D view…</p>}>
         <Graph3D nodes={nodes} edges={edges} positions={positions3d} colourOf={colourOf} bandOf={bandOfId} selected={entity} selectedEdge={assertionId} onSelectNode={selectNode} onSelectEdge={selectEdge} onHover={setHover3d} focus={focus} traced={traced} band={navBand} zoom={zoom3d} reduceMotion={webgl.reduce}/>
        </Suspense>
        <div className="gw-zoom" role="group" aria-label="Zoom">
         <button type="button" onClick={()=>setZoom3d(z=>Math.min(2.5,z*1.2))} aria-label="Zoom in">+</button>
         <button type="button" onClick={()=>setZoom3d(z=>Math.max(.6,z/1.2))} aria-label="Zoom out">−</button>
         <button type="button" onClick={()=>setZoom3d(1)} aria-label="Reset view">⟲</button>
        </div>
        <p className="gw-caption" aria-hidden="true">{hover3d?`${model.nodes.get(hover3d)?.name??hover3d} · ${bandLabel(bandOfId(hover3d))}`:webgl.reduce?"Drag to turn the view. Height is biological scale.":"Drag to rotate. Height is biological scale; select a concept to inspect it."}</p>
       </div>
       <ul className="gw-legend" aria-label="Colour key">{groups.map(g=><li key={g}><i style={{background:colourOf(g)}} aria-hidden="true"/>{g}</li>)}<li><i className="gw-dash" aria-hidden="true"/>Recorded as not holding</li>{showGaps&&<li><i className="gw-dot" aria-hidden="true"/>Recorded gap</li>}</ul>
       <nav className="gw-levels" aria-label="Concepts in the 3D view by scale">
        {SCALE_BANDS.map(b=>{const ns=nodes.filter(n=>bandOfId(n.id)===b.key);if(!ns.length)return null;return (
         <details key={b.key} open={navBand===b.key||undefined}><summary>{b.label} <small>({ns.length})</small></summary>
          <ul>{ns.map(n=><li key={n.id}><button type="button" aria-pressed={entity===n.id} onClick={()=>selectNode(entity===n.id?null:n.id)}>{n.label}</button></li>)}</ul>
         </details>)})}
       </nav>
      </>
      :view==="table"?<AssertionTable rows={visible} selected={assertionId} onSelect={id=>{setAssertionId(id);setEntity(null)}} compare={{ids:compareIds,max:6,toggle:id=>{setActiveUnit(null);setCompareIds(compareIds.includes(id)?compareIds.filter(x=>x!==id):[...compareIds,id])}}}/>
      :visible.length||gapEdges.length?<>
       <Graph2D nodes={nodes} edges={edges} positions={positions} colourOf={colourOf} selected={entity} selectedEdge={assertionId} onSelectNode={selectNode} onSelectEdge={selectEdge} focus={focus} traced={traced}/>
       <ul className="gw-legend" aria-label="Colour key">{groups.map(g=><li key={g}><i style={{background:colourOf(g)}} aria-hidden="true"/>{g}</li>)}<li><i className="gw-dash" aria-hidden="true"/>Recorded as not holding</li>{m.select==="comparable_pairs"&&<><li><i style={{background:"#E07A7A"}} aria-hidden="true"/>Potential contradiction</li><li><i style={{background:"#D8B477"}} aria-hidden="true"/>Possible context dependence</li><li><i style={{background:"#8A9BA8"}} aria-hidden="true"/>Insufficient context</li></>}{showGaps&&<li><i className="gw-dot" aria-hidden="true"/>Recorded gap</li>}</ul>
      </>:<p className="gw-empty" role="status">No relationships match these filters. That is a filter result, not evidence of absence.</p>}

     <section className="gw-bottom" aria-label="Intelligence panels">
      {m.select==="question_paths"&&<QuestionsPanel model={model} questions={questionViews} experimental={mode==="experimental"} activePath={path} onTrace={p=>{setPath(p);if(p){setFrom(p.nodeIds[0]!);setTo(p.nodeIds.at(-1)!);if(view==="table")setView("graph")}}} onSelectConcept={selectNode} onSelectGap={(gid,sid)=>{setGapId(gid);selectNode(sid)}}/>}
      <section className="gw-card" aria-labelledby="gw-land"><h2 id="gw-land">Evidence landscape</h2>
       <p className="gw-hint">How many of the 8 recordable context fields each relationship states.</p>
       <ul className="gw-hist">{ctxHist.map((n,i)=><li key={i}><span>{i}</span><span className="gw-bar-track" aria-hidden="true"><i style={{width:`${(n/maxH)*100}%`}}/></span><b>{n}<span className="sr-only"> relationships state {i}</span></b></li>)}</ul>
       <p className="gw-hint">{statusSummary}</p>
      </section>
      <section className="gw-card" aria-labelledby="gw-scale"><h2 id="gw-scale">Across biological scales</h2>
       <p className="gw-hint">Of {placed.total} relationship{placed.total===1?"":"s"} in view, {placed.bothPlaced} join two concepts with a recorded scale, {placed.onePlaced} have one, and {placed.nonePlaced} have none. A scale view can only place what is recorded.</p>
       {crossing.length?<ul className="gw-list" aria-label="Relationships that cross scales">{crossing.map(r=><li key={`${r.from}-${r.to}`}>{bandLabel(r.from)} ↔ {bandLabel(r.to)}: <b>{r.relationships}</b></li>)}</ul>:<p className="gw-hint">No relationship in view joins two different recorded scales.</p>}
       <p className="gw-hint">A relationship across scales is a reported association between levels, not a demonstrated mechanism that spans them.</p>
      </section>
      <section className="gw-card" aria-labelledby="gw-gaps"><h2 id="gw-gaps">Recorded research gaps ({scopeGaps.length})</h2>
       {scopeGaps.length?<ul className="gw-list">{scopeGaps.map(g=>{const v=gapView(model,g);return <li key={g.id} data-active={gapId===g.id}><button type="button" onClick={()=>{setGapId(g.id);selectNode(g.subjectId)}}>{g.question}</button><small>Missing: {g.missing}</small>{m.select==="gap_records"&&<small>Candidate next study: {v.nextStudy.text}{v.questionIds.length?` · Cited by ${v.questionIds.length} recorded question${v.questionIds.length>1?"s":""}`:""}</small>}</li>})}</ul>:<p className="gw-hint">No recorded gaps touch this view.</p>}
       <p className="gw-hint">Gaps are recorded as gaps, not findings. {NEXT_STUDY_NOTE}</p>
      </section>
      <ComparePanel model={model} units={units} showUnits={m.select==="comparable_pairs"} compareIds={compareIds} setCompareIds={setCompareIds} activeUnit={activeUnit} setActiveUnit={setActiveUnit} globalCount={globalCount} inWhole={scopeId==="all"} onWhole={()=>{setScopeId("all");setDepth(0)}}/>
      <NexusDock model={model} mode={mode} entity={entity} assertionId={assertionId} compareIds={compareIds} path={path} onSelectAssertion={id=>{setAssertionId(id);setEntity(null)}} onSelectConcept={selectNode}/>
      <section className="gw-card gw-wide" aria-labelledby="gw-path"><h2 id="gw-path">Pathway tracing</h2>
       <div className="gw-trace">
        <label className="gw-field"><span>From</span><select aria-label="From" value={from} onChange={e=>{setFrom(e.target.value);setPath(null)}}><option value="">Choose a concept…</option>{nodes.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
        <label className="gw-field"><span>To</span><select aria-label="To" value={to} onChange={e=>{setTo(e.target.value);setPath(null)}}><option value="">Choose a concept…</option>{nodes.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
       </div>
       {from&&to&&from!==to&&(traces.length?<ol className="gw-list" aria-label="Association chains">{traces.map((t,i)=><li key={i} data-active={path===t||undefined}><button type="button" onClick={()=>{setPath(path===t?null:t);if(view==="table")setView("graph")}}>{t.nodeIds.map(chosenName).join(" → ")} <small>({t.hops} hop{t.hops>1?"s":""})</small></button></li>)}</ol>:<p className="gw-hint" role="status">No chain of up to 5 relationships connects these in this view.</p>)}
       <p className="gw-hint">A chain is a sequence of reported associations. It is not a mechanism and not a causal claim.</p>
      </section>
     </section>
    </main>

    <Inspector model={model} assertion={assertion} entityId={entity} onSelectEntity={id=>{selectNode(id)}} onSelectAssertion={id=>{setAssertionId(id);setEntity(null)}} related={related} statusSummary={statusSummary}/>
   </div>
  </>
 );
}
