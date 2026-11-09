import {useEffect,useState} from "react";
import {Link,useLocation,useSearchParams} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {PUBLIC_GRAPH_CTA,PUBLIC_PRIMARY_CTA,PUBLIC_SECONDARY_CTA} from "../../lib/ctaPolicy";
import {RESEARCH_CONTEXT_KEYS,resolveDemoPanel,type DemoPanel} from "../../lib/researchContext";
import {
  DEFAULT_HOME_SCENARIO_ID,
  getHomeScenario,
  HOME_DEMO,
  HOME_RESEARCH_SCENARIOS,
  type HomeResearchScenario,
} from "./homeResearchScenarios";

export {HOME_DEMO,HOME_RESEARCH_SCENARIOS,getHomeScenario,DEFAULT_HOME_SCENARIO_ID};
export type {HomeResearchScenario};

type Panel=DemoPanel;

function EvidenceRails({demo}:{demo:HomeResearchScenario}){
  return <div className="ed-evidence-rails" aria-label="Illustrative evidence panels">
    <article className="ed-rail-panel">
      <p className="ed-kicker">Supporting candidates</p>
      <ul>
        {demo.supporting_rows.map(row=><li key={row.label}><strong>{row.label}</strong><span>{row.context}</span></li>)}
      </ul>
    </article>
    <article className="ed-rail-panel ed-rail-panel-conflict">
      <p className="ed-kicker">Conflicting / opposing</p>
      <ul>
        {demo.conflicting_rows.map(row=><li key={row.label}><strong>{row.label}</strong><span>{row.context}</span></li>)}
      </ul>
      <p className="ed-scope-line">Missing: {demo.missing}</p>
    </article>
  </div>;
}

function BriefArtefact({demo}:{demo:HomeResearchScenario}){
  return <article className="ed-brief-artefact" aria-label="Illustrative research brief">
    <header className="ed-brief-artefact-head">
      <span>Research brief · curated example</span>
      <span className="ed-status-chip" data-status="research_preview">Hypothesis · not reviewed</span>
    </header>
    <h3>The reasoning stays with the result.</h3>
    <p className="ed-brief-artefact-q"><span>Question</span>{demo.question}</p>
    <div className="ed-brief-artefact-grid">
      <div>
        <p className="ed-kicker">Mechanism chain</p>
        <ol className="ed-mechanism-path ed-mechanism-path-compact">
          {demo.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
        </ol>
      </div>
      <div>
        <p className="ed-kicker">Evidence snapshot</p>
        <dl className="ed-evidence-status">
          <div><dt>Supporting</dt><dd>{demo.supporting} candidates</dd></div>
          <div><dt>Conflicting</dt><dd>{demo.conflicting} candidate{demo.conflicting===1?"":"s"}</dd></div>
          <div><dt>Gaps</dt><dd>{demo.gaps.length} named</dd></div>
          <div><dt>Hypothesis</dt><dd>Requires scientific review</dd></div>
        </dl>
        <ul className="ed-brief-points">
          <li>Question &amp; research scope</li>
          <li>Mechanism path with context labels</li>
          <li>{demo.supporting} supporting · {demo.conflicting} conflicting · gaps named</li>
          <li>Status: research hypothesis — requires scientific review</li>
        </ul>
      </div>
    </div>
    <p className="ed-scope-line">{demo.disclaimer}</p>
    <div className="ed-actions ed-brief-artefact-actions">
      <Link className="ed-button" to={PUBLIC_SECONDARY_CTA.to}>{PUBLIC_SECONDARY_CTA.label} <span aria-hidden="true"><ArrowIcon/></span></Link>
      <Link className="ed-text-link" to={PUBLIC_GRAPH_CTA.to}>{PUBLIC_GRAPH_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
    </div>
  </article>;
}

function contextLine(demo:HomeResearchScenario):string{
  const disease=demo.disease??"Disease-independent";
  return `${disease} · ${demo.coverage} · ${demo.review_status.replaceAll("_"," ")}`;
}

type HomeProductDemoProps={
  scenarioId?:string;
  onScenarioChange?:(id:string)=>void;
};

export function HomeProductDemo({scenarioId,onScenarioChange}:HomeProductDemoProps={}){
  const location=useLocation();
  const [,setParams]=useSearchParams();
  const [internalId,setInternalId]=useState(scenarioId??DEFAULT_HOME_SCENARIO_ID);
  const activeId=scenarioId??internalId;
  const demo=getHomeScenario(activeId);
  const panelFromUrl=resolveDemoPanel(location.search,location.hash);
  const [panel,setPanelState]=useState<Panel>(panelFromUrl??"mechanism");
  const [selected,setSelected]=useState(demo.default_node);

  function setPanel(next:Panel){
    setPanelState(next);
    setParams(prev=>{
      const updated=new URLSearchParams(prev);
      if(next==="mechanism")updated.delete(RESEARCH_CONTEXT_KEYS.panel);
      else updated.set(RESEARCH_CONTEXT_KEYS.panel,next);
      return updated;
    },{replace:true});
  }

  useEffect(()=>{
    if(scenarioId!==undefined)setInternalId(scenarioId);
  },[scenarioId]);

  useEffect(()=>{
    setSelected(demo.default_node);
    if(!panelFromUrl)setPanelState("mechanism");
  },[demo.id,demo.default_node,panelFromUrl]);

  useEffect(()=>{
    if(panelFromUrl)setPanelState(panelFromUrl);
  },[panelFromUrl]);

  const selectedNode=demo.nodes.find(n=>n.id===selected)??demo.nodes.find(n=>n.id===demo.default_node)??demo.nodes[0]!;

  function selectScenario(id:string){
    if(onScenarioChange)onScenarioChange(id);
    else setInternalId(id);
  }

  return <section className="ed-product-demo" id="product-demo" aria-labelledby="product-demo-heading">
    <div className="ed-workbench-head">
      <p className="ed-kicker">PRODUCT DEMONSTRATION</p>
      <h2 id="product-demo-heading">From question to research decision.</h2>
      <p>One workbench across immunology, microbiome, metabolism, neuroimmune biology and more — disease context is optional. Coverage depth is unequal; labels stay honest.</p>
      <p className="ed-demo-banner" role="note">Illustrative research demonstration · Not a live investigation · live_backend={String(demo.live_backend)} · coverage={demo.coverage}</p>
    </div>
    <div className="ed-demo-shell ed-demo-desk">
      <div className="ed-scenario-toolbar" role="tablist" aria-label="Research scenario">
        {HOME_RESEARCH_SCENARIOS.map(s=>(
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`scenario-tab-${s.id}`}
            aria-selected={activeId===s.id}
            aria-controls="demo-question"
            tabIndex={activeId===s.id?0:-1}
            onClick={()=>selectScenario(s.id)}
          >{s.short_label}</button>
        ))}
      </div>
      <div className="ed-demo-toolbar" role="tablist" aria-label="Research demonstration panels">
        {([["mechanism","Mechanism"],["graph","Graph"],["brief","Research brief"]] as const).map(([id,label])=>(
          <button key={id} type="button" role="tab" id={`demo-tab-${id}`} aria-selected={panel===id} aria-controls={`demo-panel-${id}`} tabIndex={panel===id?0:-1} onClick={()=>setPanel(id)} onKeyDown={e=>{
            const order:Panel[]=["mechanism","graph","brief"];
            const i=order.indexOf(panel);
            let next:Panel|undefined;
            if(e.key==="ArrowRight")next=order[(i+1)%order.length];
            if(e.key==="ArrowLeft")next=order[(i+order.length-1)%order.length];
            if(e.key==="Home")next="mechanism";
            if(e.key==="End")next="brief";
            if(next){e.preventDefault();setPanel(next);document.getElementById(`demo-tab-${next}`)?.focus()}
          }}>{label}</button>
        ))}
      </div>
      <div className="ed-question-bar">
        <span>Research question</span>
        <h3 className="ed-question-bar-value" id="demo-question">{demo.question}</h3>
        <p className="ed-workbench-meta">{contextLine(demo)} · domains: {demo.domains.join(", ")}</p>
      </div>
      {panel==="brief"?<div id="demo-panel-brief" role="tabpanel" aria-labelledby="demo-tab-brief"><BriefArtefact demo={demo}/></div>:<div className="ed-demo-desk-grid">
        <div className="ed-demo-stage">
          {panel==="mechanism"&&<article id="demo-panel-mechanism" role="tabpanel" aria-labelledby="demo-tab-mechanism" className="ed-workbench-card">
            <p className="ed-kicker">Mechanism map</p>
            <h3 className="ed-visually-quiet">See the mechanism. Decide what to test next.</h3>
            <ol className="ed-mechanism-path" aria-label="Illustrative mechanism path">
              {demo.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
            </ol>
            <dl className="ed-evidence-status">
              <div><dt>Evidence status</dt><dd>Context-limited</dd></div>
              <div><dt>Supporting</dt><dd>{demo.supporting} candidates</dd></div>
              <div><dt>Conflicting</dt><dd>{demo.conflicting} candidate{demo.conflicting===1?"":"s"}</dd></div>
              <div><dt>Missing</dt><dd>{demo.missing}</dd></div>
            </dl>
          </article>}
          {panel==="graph"&&<article id="demo-panel-graph" role="tabpanel" aria-labelledby="demo-tab-graph" className="ed-workbench-card ed-demo-graph-panel">
            <p className="ed-kicker">Illustrative path</p>
            <svg viewBox="0 0 740 180" role="group" aria-label="Illustrative knowledge-graph path">
              <rect width="740" height="180" rx="10" fill="#122826"/>
              {demo.edges.map(([a,b])=>{
                const from=demo.nodes.find(n=>n.id===a)!,to=demo.nodes.find(n=>n.id===b)!;
                const active=selected===a||selected===b;
                return <line key={a+b} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active?"#b7e4d8":"#6f958c"} strokeWidth={active?2.4:1.4} strokeOpacity={active?0.9:0.5}/>;
              })}
              {demo.nodes.map(n=>{
                const active=selected===n.id;
                return <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={active?14:10}
                    fill={active?"#BD1C1D":"#9bcac0"}
                    stroke={active?"#fff6df":"#0f2421"}
                    strokeWidth={active?2.5:1.5}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    aria-label={`Select ${n.label}`}
                    onClick={()=>setSelected(n.id)}
                    onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(n.id)}}}
                  />
                  <text x={n.x} y={n.y+34} textAnchor="middle" fill="#e7f3ef" fontSize="12" fontFamily="Arial,sans-serif" aria-hidden="true">{n.label}</text>
                </g>;
              })}
            </svg>
            <p className="ed-scope-line">Selected: <strong>{selectedNode.label}</strong>. Inspect before interpreting — this map is illustrative.</p>
          </article>}
        </div>
        <EvidenceRails demo={demo}/>
      </div>}
      <div className="ed-actions">
        <Link className="ed-button" to={PUBLIC_SECONDARY_CTA.to}>Explore the Research Workflow <span aria-hidden="true"><ArrowIcon/></span></Link>
        <Link className="ed-text-link" to={PUBLIC_GRAPH_CTA.to}>{PUBLIC_GRAPH_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
        <Link className="ed-text-link" to={PUBLIC_PRIMARY_CTA.to}>{PUBLIC_PRIMARY_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
      </div>
    </div>
  </section>;
}
