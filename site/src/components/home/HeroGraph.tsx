import {Link} from "react-router-dom";
import {useGraphSnapshot} from "./useGraphSnapshot";

const W=800,H=540,CX=W/2,CY=H/2,RX=230,RY=186;
const TONES=["mint","lav","peach","sky"] as const;
const clip=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;
const href=(name:string)=>"/research/knowledge-graph?netQuery="+encodeURIComponent(name);

/** The published graph around one concept, drawn large for the landing hero. Every node links to the explorer. Layout is schematic, not biology. */
export function HeroGraph(){
 const {snapshot:s,failed}=useGraphSnapshot();
 if(!s)return <div className="pg-hero-graph pg-wait" role="status">{failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying the published snapshot…"}</div>;
 const n=s.network,others=n.nodes.filter(x=>x.id!==n.center),centre=n.nodes.find(x=>x.id===n.center)!;
 const pos=new Map<string,{x:number;y:number}>([[n.center,{x:CX,y:CY}]]);
 others.forEach((x,i)=>{const a=(-90+360*i/others.length)*Math.PI/180;pos.set(x.id,{x:CX+RX*Math.cos(a),y:CY+RY*Math.sin(a)})});
 return (
  <div className="pg-hero-graph">
   <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`The published graph around ${centre.name}: ${n.nodes.length} concepts and ${n.edges.length} recorded relationships. Each concept opens in the knowledge graph.`}>
    {n.edges.map((e,i)=>{const a=pos.get(e.s),b=pos.get(e.o);if(!a||!b)return null;return <line key={e.id} className={"pg-edge"+(e.negated?" pg-neg":"")} style={{animationDelay:`${i*60}ms`}} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>})}
    {n.nodes.map((x,i)=>{
     const p=pos.get(x.id)!,c=x.id===n.center,tone=TONES[i%TONES.length];
     const right=p.x>CX+8,left=p.x<CX-8;
     const lx=c?p.x:p.x+(right?24:left?-24:0),ly=c?p.y+5:p.y+(p.y<CY?-26:34),anchor=c?"middle":right?"start":left?"end":"middle";
     const tw=Math.min(clip(x.name,c?14:26).length*8.6,230);
     const hx1=c?p.x-46:Math.min(p.x-26,lx-(anchor==="end"?tw:anchor==="middle"?tw/2:0)-4),hx2=c?p.x+46:Math.max(p.x+26,lx+(anchor==="start"?tw:anchor==="middle"?tw/2:0)+4);
     const hy1=c?p.y-46:Math.min(p.y-26,ly-20),hy2=c?p.y+46:Math.max(p.y+26,ly+8);
     return (
      <Link key={x.id} to={href(x.name)} aria-label={`${x.name}: open in the knowledge graph`}>
       <g className="pg-node" data-c={c} data-tone={tone} style={{animationDelay:`${i*70+200}ms`}}>
        <rect className="pg-hit" x={hx1} y={hy1} width={hx2-hx1} height={hy2-hy1} rx={14}/>
        <circle className="pg-dot" cx={p.x} cy={p.y} r={c?46:15}/>
        <text className="pg-label" x={lx} y={ly} textAnchor={anchor} data-c={c}>{clip(x.name,c?14:26)}</text>
       </g>
      </Link>
     );
    })}
   </svg>
   <p className="pg-cap">Live from the published snapshot (version {s.version}): <b>{centre.name}</b> and the concepts research records it as connected to. Every line is a candidate and unreviewed.</p>
  </div>
 );
}
