import {useEffect,useMemo,useState} from "react";
import {Link} from "../landing-v2/router";
import {Logo} from "../landing-v2/components/site/Header";
import {applySeo} from "../lib/seo/applySeo";
import {useSharedBundle} from "../lib/useSharedBundle";
import {useOnboarding} from "../landing-v2/onboarding/store";
import {
 EMPTY_FILTERS,HSI_DOMAINS,MODES,READINESS_LABEL,applyFilters,buildGraphModel,comparablePairs,crossDomainSlice,domainCoverage,domainLabel,expand,facets,finishSlice,isFiltered,isOpenable,modeById,tracePaths,
 type Filters,type GraphAssertionView,type GraphModel,type HsiDomain,type ModeId,type TracedPath,
} from "../../../src/graphWorkspace";
import {layoutGraph} from "../../../src/graphWorkspace/layout";
import {Graph2D,type GEdge,type GNode} from "./Graph2D";
import {AssertionTable,FilterPanel,Inspector} from "./Panels";
import "./graph.css";

/** Modes with a working view in this phase. The rest are listed with why they cannot open yet. */
const BUILT:readonly ModeId[]=["atlas","mechanism","evidence","contradiction","gap"];
const PALETTE=["#83B8AD","#D8B477","#7FA6B8","#B7A8D0","#C9CED2","#5FA58F","#E0A96D","#8A9BA8"];

type Scope={id:string;label:string;pair:[HsiDomain,HsiDomain]|null};
const SCOPES:Scope[]=[
 {id:"imm-mic",label:"Immunology × Microbiome",pair:["immunology","microbiome"]},
 {id:"imm-neu",label:"Immunology × Neuroscience",pair:["immunology","neuroscience"]},
 {id:"mic-neu",label:"Microbiome × Neuroscience",pair:["microbiome","neuroscience"]},
 {id:"all",label:"Whole published graph",pair:null},
];
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
 const start:ModeId=onb.objectives.includes("conflicts")?"contradiction":onb.objectives.includes("gaps")||onb.objectives.includes("hypotheses")?"gap":"mechanism";
 const [mode,setMode]=useState<ModeId>(start);
 const [scopeId,setScopeId]=useState("imm-mic");
 const [view,setView]=useState<"graph"|"table">("graph");
 const [filters,setFilters]=useState<Filters>(EMPTY_FILTERS);
 const [depth,setDepth]=useState(0);
 const [entity,setEntity]=useState<string|null>(null);
 const [assertionId,setAssertionId]=useState<string|null>(null);
 const [focus,setFocus]=useState(false);
 const [path,setPath]=useState<TracedPath|null>(null);
 const [from,setFrom]=useState("");const [to,setTo]=useState("");
 const [gapId,setGapId]=useState<string|null>(null);

 const m=modeById[mode];
 const scope=SCOPES.find(s=>s.id===scopeId)!;

 /* scope -> neighbours -> mode, then filters. Layout is computed before filters so positions stay put while filtering. */
 const slice=useMemo(()=>scope.pair?crossDomainSlice(model,scope.pair[0],scope.pair[1]):finishSlice(model,model.assertions),[model,scope]);
 const expanded=useMemo(()=>depth>0?expand(model,slice.nodeIds,depth,MAX_VIEW,slice.assertions):{assertions:slice.assertions,added:0,truncated:false},[model,slice,depth]);
 const scopeGaps=useMemo(()=>{const ids=new Set(expanded.assertions.flatMap(a=>[a.subject.id,a.object.id]));return model.gaps.filter(g=>ids.has(g.subjectId)||ids.has(g.objectId))},[model,expanded]);
 const base=useMemo<readonly GraphAssertionView[]>(()=>{
  if(m.select==="comparable_pairs"){const keep=new Set(comparablePairs(expanded.assertions).flatMap(p=>p.assertionIds));return expanded.assertions.filter(a=>keep.has(a.id))}
  if(m.select==="gap_records"){const ids=new Set(scopeGaps.flatMap(g=>[g.subjectId,g.objectId]));return expanded.assertions.filter(a=>ids.has(a.subject.id)||ids.has(a.object.id))}
  return expanded.assertions;
 },[m,expanded,scopeGaps]);
 const visible=useMemo(()=>applyFilters(base,filters),[base,filters]);
 const fac=useMemo(()=>facets(base),[base]);
 const pairKeys=useMemo(()=>new Set(comparablePairs(visible).flatMap(p=>p.assertionIds)),[visible]);

 const showGaps=m.select==="gap_records";
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
 const positions=useMemo(()=>layoutGraph([...layoutIds].map(id=>({id,group:groupOf(id)})),[...base.map(a=>({s:a.subject.id,o:a.object.id})),...gapEdges.map(g=>({s:g.subjectId,o:g.objectId}))]),[layoutIds,groupOf,base,gapEdges]);
 const groups=useMemo(()=>[...new Set([...layoutIds].map(groupOf))].sort(),[layoutIds,groupOf]);
 const colourOf=(g:string)=>PALETTE[groups.indexOf(g)%PALETTE.length]??PALETTE[0]!;

 const visIds=useMemo(()=>{const s=new Set(visible.flatMap(a=>[a.subject.id,a.object.id]));for(const g of gapEdges){if(s.has(g.subjectId)||s.has(g.objectId)||!isFiltered(filters)){s.add(g.subjectId);s.add(g.objectId)}}if(entity)s.add(entity);return s},[visible,gapEdges,entity,filters]);
 const degree=useMemo(()=>{const d=new Map<string,number>();for(const a of visible)for(const id of [a.subject.id,a.object.id])d.set(id,(d.get(id)??0)+1);return d},[visible]);
 const nodes:GNode[]=useMemo(()=>[...visIds].map(id=>({id,label:model.nodes.get(id)?.name??id,group:groupOf(id),degree:degree.get(id)??0})),[visIds,model,groupOf,degree]);
 const edges:GEdge[]=useMemo(()=>[
  ...visible.map(a=>({id:a.id,s:a.subject.id,o:a.object.id,negated:a.negated,kind:"assertion" as const,pair:pairKeys.has(a.id)&&m.select==="comparable_pairs"})),
  ...gapEdges.filter(g=>visIds.has(g.subjectId)&&visIds.has(g.objectId)).map(g=>({id:`gap:${g.id}`,s:g.subjectId,o:g.objectId,negated:false,kind:"gap" as const})),
 ],[visible,gapEdges,visIds,pairKeys,m.select]);

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
    <div className="gw-seg" role="radiogroup" aria-label="View"><button type="button" role="radio" aria-checked={view==="graph"} onClick={()=>setView("graph")}>Graph</button><button type="button" role="radio" aria-checked={view==="table"} onClick={()=>setView("table")}>Table</button><button type="button" role="radio" aria-checked={false} disabled title="Arrives in the next phase">3D</button></div>
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
      {onb.objectives.length>0&&<p className="gw-hint">Opened on this mode for your goals. Every other mode, including conflicts, stays one click away.</p>}
     </div>

     {unavailable?<p className="gw-empty" role="status">{m.label} has no view yet. {m.needs??""}</p>
      :m.select==="comparable_pairs"&&!visible.length?<p className="gw-empty" role="status">In this view, no two relationships concern the same pair of concepts, so there is nothing to compare. That is a property of this slice, not a finding that nothing conflicts.</p>
      :view==="table"?<AssertionTable rows={visible} selected={assertionId} onSelect={id=>{setAssertionId(id);setEntity(null)}}/>
      :visible.length||gapEdges.length?<>
       <Graph2D nodes={nodes} edges={edges} positions={positions} colourOf={colourOf} selected={entity} selectedEdge={assertionId} onSelectNode={selectNode} onSelectEdge={selectEdge} focus={focus} traced={traced}/>
       <ul className="gw-legend" aria-label="Colour key">{groups.map(g=><li key={g}><i style={{background:colourOf(g)}} aria-hidden="true"/>{g}</li>)}<li><i className="gw-dash" aria-hidden="true"/>Recorded as not holding</li>{showGaps&&<li><i className="gw-dot" aria-hidden="true"/>Recorded gap</li>}</ul>
      </>:<p className="gw-empty" role="status">No relationships match these filters. That is a filter result, not evidence of absence.</p>}

     <section className="gw-bottom" aria-label="Intelligence panels">
      <section className="gw-card" aria-labelledby="gw-land"><h2 id="gw-land">Evidence landscape</h2>
       <p className="gw-hint">How many of the 8 recordable context fields each relationship states.</p>
       <ul className="gw-hist">{ctxHist.map((n,i)=><li key={i}><span>{i}</span><span className="gw-bar-track" aria-hidden="true"><i style={{width:`${(n/maxH)*100}%`}}/></span><b>{n}<span className="sr-only"> relationships state {i}</span></b></li>)}</ul>
       <p className="gw-hint">{statusSummary}</p>
      </section>
      <section className="gw-card" aria-labelledby="gw-gaps"><h2 id="gw-gaps">Recorded research gaps ({scopeGaps.length})</h2>
       {scopeGaps.length?<ul className="gw-list">{scopeGaps.slice(0,6).map(g=><li key={g.id} data-active={gapId===g.id}><button type="button" onClick={()=>{setGapId(g.id);selectNode(g.subjectId)}}>{g.question}</button><small>Missing: {g.missing}</small></li>)}</ul>:<p className="gw-hint">No recorded gaps touch this view.</p>}
       <p className="gw-hint">Gaps are recorded as gaps, not findings. A suggested next study is a candidate, not a validated protocol.</p>
      </section>
      <section className="gw-card gw-wide" aria-labelledby="gw-path"><h2 id="gw-path">Pathway tracing</h2>
       <div className="gw-trace">
        <label className="gw-field"><span>From</span><select aria-label="From" value={from} onChange={e=>{setFrom(e.target.value);setPath(null)}}><option value="">Choose a concept…</option>{nodes.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
        <label className="gw-field"><span>To</span><select aria-label="To" value={to} onChange={e=>{setTo(e.target.value);setPath(null)}}><option value="">Choose a concept…</option>{nodes.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
       </div>
       {from&&to&&from!==to&&(traces.length?<ol className="gw-list" aria-label="Association chains">{traces.map((t,i)=><li key={i} data-active={path===t||undefined}><button type="button" onClick={()=>{setPath(path===t?null:t);setView("graph")}}>{t.nodeIds.map(chosenName).join(" → ")} <small>({t.hops} hop{t.hops>1?"s":""})</small></button></li>)}</ol>:<p className="gw-hint" role="status">No chain of up to 5 relationships connects these in this view.</p>)}
       <p className="gw-hint">A chain is a sequence of reported associations. It is not a mechanism and not a causal claim.</p>
      </section>
     </section>
    </main>

    <Inspector model={model} assertion={assertion} entityId={entity} onSelectEntity={id=>{selectNode(id)}} onSelectAssertion={id=>{setAssertionId(id);setEntity(null)}} related={related} statusSummary={statusSummary}/>
   </div>
  </>
 );
}
