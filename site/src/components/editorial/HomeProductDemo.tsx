import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {PUBLIC_GRAPH_CTA,PUBLIC_PRIMARY_CTA,PUBLIC_SECONDARY_CTA} from "../../lib/ctaPolicy";

/** Mirrors docs/research-demonstrations/demo_ssc_fibrosis_001.json — keep live_backend false until verified. */
export const HOME_DEMO={
  demonstration_id:"demo_ssc_fibrosis_001",
  live_backend:false as const,
  review_status:"not_reviewed",
  disease:"Systemic sclerosis",
  question:"How might immune activation contribute to fibrosis?",
  mechanism_path:[
    "Immune activation",
    "Cytokine signalling",
    "Fibroblast activation",
    "Extracellular-matrix remodelling",
    "Tissue fibrosis",
  ],
  supporting:4,
  conflicting:1,
  missing:"Longitudinal human tissue data",
  gaps:[
    "Live literature retrieval not bound in this demonstration",
    "No independent scientific review of this illustrative path",
  ],
  disclaimer:"Illustrative demonstration; not a live research investigation. Uses curated example data.",
  /** Curated example rows — no PMIDs or live retrieval claimed. */
  supporting_rows:[
    {label:"Immune → cytokine axis",context:"Curated example · context-limited"},
    {label:"Cytokine → fibroblast signalling",context:"Curated example · tissue not specified"},
    {label:"Fibroblast activation → matrix",context:"Curated example · model-dependent"},
    {label:"Matrix remodelling → fibrosis",context:"Curated example · association only"},
  ],
  conflicting_rows:[
    {label:"Immune activation without fibrotic progression",context:"Curated counter-example · population differs"},
  ],
} as const;

const NODES=[
  {id:"immune",label:"Immune activation",x:70,y:120},
  {id:"cyto",label:"Cytokines",x:220,y:55},
  {id:"fibro",label:"Fibroblasts",x:370,y:120},
  {id:"matrix",label:"Matrix",x:520,y:55},
  {id:"fibrosis",label:"Fibrosis",x:670,y:120},
] as const;
const EDGES=[["immune","cyto"],["cyto","fibro"],["fibro","matrix"],["matrix","fibrosis"],["immune","fibro"]] as const;

type Panel="mechanism"|"graph"|"brief";

function EvidenceRails(){
  return <div className="ed-evidence-rails" aria-label="Illustrative evidence panels">
    <article className="ed-rail-panel">
      <p className="ed-kicker">Supporting candidates</p>
      <ul>
        {HOME_DEMO.supporting_rows.map(row=><li key={row.label}><strong>{row.label}</strong><span>{row.context}</span></li>)}
      </ul>
    </article>
    <article className="ed-rail-panel ed-rail-panel-conflict">
      <p className="ed-kicker">Conflicting / opposing</p>
      <ul>
        {HOME_DEMO.conflicting_rows.map(row=><li key={row.label}><strong>{row.label}</strong><span>{row.context}</span></li>)}
      </ul>
      <p className="ed-scope-line">Missing: {HOME_DEMO.missing}</p>
    </article>
  </div>;
}

function BriefArtefact(){
  return <article className="ed-brief-artefact" aria-label="Illustrative research brief">
    <header className="ed-brief-artefact-head">
      <span>Research brief · curated example</span>
      <span className="ed-status-chip" data-status="research_preview">Hypothesis · not reviewed</span>
    </header>
    <h3>The reasoning stays with the result.</h3>
    <p className="ed-brief-artefact-q"><span>Question</span>{HOME_DEMO.question}</p>
    <div className="ed-brief-artefact-grid">
      <div>
        <p className="ed-kicker">Mechanism chain</p>
        <ol className="ed-mechanism-path ed-mechanism-path-compact">
          {HOME_DEMO.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
        </ol>
      </div>
      <div>
        <p className="ed-kicker">Evidence snapshot</p>
        <dl className="ed-evidence-status">
          <div><dt>Supporting</dt><dd>{HOME_DEMO.supporting} candidates</dd></div>
          <div><dt>Conflicting</dt><dd>{HOME_DEMO.conflicting} candidate</dd></div>
          <div><dt>Gaps</dt><dd>{HOME_DEMO.gaps.length} named</dd></div>
          <div><dt>Hypothesis</dt><dd>Requires scientific review</dd></div>
        </dl>
        <ul className="ed-brief-points">
          <li>Question &amp; research scope</li>
          <li>Mechanism path with context labels</li>
          <li>{HOME_DEMO.supporting} supporting · {HOME_DEMO.conflicting} conflicting · gaps named</li>
          <li>Status: research hypothesis — requires scientific review</li>
        </ul>
      </div>
    </div>
    <p className="ed-scope-line">{HOME_DEMO.disclaimer}</p>
    <div className="ed-actions ed-brief-artefact-actions">
      <Link className="ed-button" to={PUBLIC_SECONDARY_CTA.to}>Open brief workflow <span aria-hidden="true"><ArrowIcon/></span></Link>
      <Link className="ed-text-link" to={PUBLIC_GRAPH_CTA.to}>{PUBLIC_GRAPH_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
    </div>
  </article>;
}

export function HomeProductDemo(){
  const [panel,setPanel]=useState<Panel>("mechanism");
  const [selected,setSelected]=useState("fibro");
  const selectedNode=NODES.find(n=>n.id===selected)??NODES[2]!;
  return <section className="ed-product-demo" id="product-demo" aria-labelledby="product-demo-heading">
    <div className="ed-workbench-head">
      <p className="ed-kicker">PRODUCT DEMONSTRATION</p>
      <h2 id="product-demo-heading">From question to research decision.</h2>
      <p>Turn investigation into a research brief — mechanism, evidence states and gaps stay attached to the same curated example.</p>
      <p className="ed-demo-banner" role="note">Illustrative research demonstration · Not a live investigation · live_backend={String(HOME_DEMO.live_backend)}</p>
    </div>
    <div className="ed-demo-shell ed-demo-desk">
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
        <h3 className="ed-question-bar-value" id="demo-question">{HOME_DEMO.question}</h3>
        <p className="ed-workbench-meta">{HOME_DEMO.disease} · curated example · {HOME_DEMO.review_status.replaceAll("_"," ")}</p>
      </div>
      {panel==="brief"?<div id="demo-panel-brief" role="tabpanel" aria-labelledby="demo-tab-brief"><BriefArtefact/></div>:<div className="ed-demo-desk-grid">
        <div className="ed-demo-stage">
          {panel==="mechanism"&&<article id="demo-panel-mechanism" role="tabpanel" aria-labelledby="demo-tab-mechanism" className="ed-workbench-card">
            <p className="ed-kicker">Mechanism map</p>
            <h3 className="ed-visually-quiet">See the mechanism. Decide what to test next.</h3>
            <ol className="ed-mechanism-path" aria-label="Illustrative mechanism path">
              {HOME_DEMO.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
            </ol>
            <dl className="ed-evidence-status">
              <div><dt>Evidence status</dt><dd>Context-limited</dd></div>
              <div><dt>Supporting</dt><dd>{HOME_DEMO.supporting} candidates</dd></div>
              <div><dt>Conflicting</dt><dd>{HOME_DEMO.conflicting} candidate</dd></div>
              <div><dt>Missing</dt><dd>{HOME_DEMO.missing}</dd></div>
            </dl>
          </article>}
          {panel==="graph"&&<article id="demo-panel-graph" role="tabpanel" aria-labelledby="demo-tab-graph" className="ed-workbench-card ed-demo-graph-panel">
            <p className="ed-kicker">Illustrative path</p>
            <svg viewBox="0 0 740 180" role="group" aria-label="Illustrative knowledge-graph path">
              <rect width="740" height="180" rx="10" fill="#122826"/>
              {EDGES.map(([a,b])=>{
                const from=NODES.find(n=>n.id===a)!,to=NODES.find(n=>n.id===b)!;
                const active=selected===a||selected===b;
                return <line key={a+b} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active?"#b7e4d8":"#6f958c"} strokeWidth={active?2.4:1.4} strokeOpacity={active?0.9:0.5}/>;
              })}
              {NODES.map(n=>{
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
        <EvidenceRails/>
      </div>}
      <div className="ed-actions">
        <Link className="ed-button" to={PUBLIC_SECONDARY_CTA.to}>Explore the Research Workflow <span aria-hidden="true"><ArrowIcon/></span></Link>
        <Link className="ed-text-link" to={PUBLIC_GRAPH_CTA.to}>{PUBLIC_GRAPH_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
        <Link className="ed-text-link" to={PUBLIC_PRIMARY_CTA.to}>{PUBLIC_PRIMARY_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
      </div>
    </div>
  </section>;
}
