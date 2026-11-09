import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {PUBLIC_GRAPH_CTA} from "../../lib/ctaPolicy";

const NODES=[
  {id:"immune",label:"Immune activation",x:80,y:160,kind:"process"},
  {id:"cyto",label:"Cytokine signalling",x:260,y:90,kind:"pathway"},
  {id:"fibro",label:"Fibroblast activation",x:440,y:160,kind:"cell"},
  {id:"matrix",label:"Matrix remodelling",x:620,y:90,kind:"process"},
  {id:"fibrosis",label:"Tissue fibrosis",x:800,y:160,kind:"disease"},
] as const;
const EDGES=[
  ["immune","cyto"],
  ["cyto","fibro"],
  ["fibro","matrix"],
  ["matrix","fibrosis"],
  ["immune","fibro"],
] as const;
const DETAIL:Record<string,{title:string;text:string;status:string}>={
  immune:{title:"Immune activation",text:"Entry concept for the illustrative SSc path. Candidate edges require source inspection before interpretation.",status:"Research preview"},
  cyto:{title:"Cytokine signalling",text:"Intermediate signalling step. Model organism and tissue context must stay attached to any claim.",status:"Context-limited"},
  fibro:{title:"Fibroblast activation",text:"Bridge toward fibrosis biology. Not a validated therapeutic target claim.",status:"Research preview"},
  matrix:{title:"Matrix remodelling",text:"Extracellular-matrix change is listed as a mechanism step, not a measured clinical endpoint.",status:"Illustrative"},
  fibrosis:{title:"Tissue fibrosis",text:"Outcome concept for the curated demonstration. No scientific approval is inferred.",status:"Not reviewed"},
};

export function HomeKnowledgeGraph(){
  const [selected,setSelected]=useState<string>("fibro");
  const detail=DETAIL[selected]??DETAIL.fibro!;
  return <section className="ed-home-graph" aria-labelledby="home-graph-heading">
    <div className="ed-home-graph-copy">
      <p className="ed-kicker">KNOWLEDGE GRAPH ON THE HOMEPAGE</p>
      <h2 id="home-graph-heading">Inspect a connection.<br/><em>Then open the full graph.</em></h2>
      <p>This is a bounded illustrative map of the systemic sclerosis demonstration path. The full research graph keeps neighbourhood filters, source candidates and evidence gaps.</p>
      <p className="ed-demo-banner" role="note">Illustrative research demonstration · Not a live investigation · Uses curated example data</p>
    </div>
    <div className="ed-home-graph-stage">
      <svg viewBox="0 0 900 260" role="group" aria-label="Illustrative knowledge graph for systemic sclerosis fibrosis path">
        <rect width="900" height="260" rx="12" fill="#122826"/>
        {EDGES.map(([a,b])=>{
          const from=NODES.find(n=>n.id===a)!,to=NODES.find(n=>n.id===b)!;
          const active=selected===a||selected===b;
          return <line key={a+b} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active?"#b7e4d8":"#6f958c"} strokeWidth={active?2.4:1.4} strokeOpacity={active?.9:.5}/>;
        })}
        {NODES.map(n=>{
          const active=selected===n.id;
          return <g key={n.id} role="button" tabIndex={0} aria-pressed={active} aria-label={`Select ${n.label}`} onClick={()=>setSelected(n.id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(n.id)}}}>
            <circle cx={n.x} cy={n.y} r={active?16:11} fill={active?"#BD1C1D":"#9bcac0"} stroke={active?"#fff6df":"#0f2421"} strokeWidth={active?2.5:1.5}/>
            <text x={n.x} y={n.y+36} textAnchor="middle" fill="#e7f3ef" fontSize="13" fontFamily="Arial,sans-serif">{n.label}</text>
          </g>;
        })}
      </svg>
      <aside className="ed-home-graph-inspector" aria-live="polite">
        <p className="ed-kicker">Inspect before interpreting</p>
        <h3>{detail.title}</h3>
        <p className="ed-status-chip" data-status="research_preview">{detail.status}</p>
        <p>{detail.text}</p>
        <Link className="ed-button" to={PUBLIC_GRAPH_CTA.to}>{PUBLIC_GRAPH_CTA.label} <span aria-hidden="true"><ArrowIcon/></span></Link>
      </aside>
    </div>
  </section>;
}
