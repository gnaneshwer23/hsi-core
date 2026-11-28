import {useMemo,useRef,useState} from "react";
import {LABEL_FONT_PX,placeLabels} from "../../../src/graphWorkspace/labels";

export type GNode={id:string;label:string;group:string;degree:number};
export type GEdge={id:string;s:string;o:string;negated:boolean;kind:"assertion"|"gap";pair?:boolean;reading?:string};
export type Pos=ReadonlyMap<string,readonly [number,number]>;

const W=1000,H=620;
type Props={
 nodes:readonly GNode[];edges:readonly GEdge[];positions:Pos;colourOf:(group:string)=>string;
 selected:string|null;selectedEdge:string|null;onSelectNode:(id:string|null)=>void;onSelectEdge:(id:string)=>void;
 focus:boolean;traced:{nodes:ReadonlySet<string>;edges:ReadonlySet<string>};
};

/** The graph as SVG: every concept is a real button, so it works with a keyboard and a screen reader. */
export function Graph2D({nodes,edges,positions,colourOf,selected,selectedEdge,onSelectNode,onSelectEdge,focus,traced}:Props){
 const [view,setView]=useState({k:1,x:0,y:0});
 const [hover,setHover]=useState<string|null>(null);
 const drag=useRef<{x:number;y:number;vx:number;vy:number;moved:boolean}|null>(null);
 const svg=useRef<SVGSVGElement>(null);
 const P=(id:string)=>{const p=positions.get(id);return p?[p[0]*W,p[1]*H] as const:[W/2,H/2] as const};

 const near=useMemo(()=>{
  if(!selected)return null;
  const s=new Set<string>([selected]);
  for(const e of edges){if(e.s===selected)s.add(e.o);if(e.o===selected)s.add(e.s)}
  return s;
 },[selected,edges]);
 const tracing=traced.nodes.size>0;
 const dimNode=(id:string)=>tracing?!traced.nodes.has(id):focus&&near?!near.has(id):false;
 const dimEdge=(e:GEdge)=>tracing?!traced.edges.has(e.id):focus&&selected?!(e.s===selected||e.o===selected):false;

 const zoom=(f:number)=>setView(v=>{const k=Math.min(4,Math.max(.6,v.k*f));return {k,x:v.x*(k/v.k),y:v.y*(k/v.k)}});
 const down=(e:React.PointerEvent)=>{if(e.target!==svg.current&&(e.target as Element).tagName!=="rect")return;drag.current={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y,moved:false};(e.currentTarget as Element).setPointerCapture(e.pointerId)};
 const move=(e:React.PointerEvent)=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>3)d.moved=true;setView(v=>({...v,x:d.vx+dx,y:d.vy+dy}))};
 const up=()=>{const d=drag.current;drag.current=null;if(d&&!d.moved)onSelectNode(null)};

 const r=(n:GNode)=>4+Math.min(9,Math.sqrt(n.degree)*2.2);
 /* Labels never overlap: most important first, each at the first free spot around its dot. Zooming in makes room. */
 const labels=useMemo(()=>placeLabels(nodes.map(n=>{const [x,y]=P(n.id);return {id:n.id,label:n.label,x,y,r:r(n),degree:n.degree,
  priority:n.id===selected?4:n.id===hover?3:traced.nodes.has(n.id)?2:near?.has(n.id)?1:0}}),view.k,view.k>=1.5?1:3)
 ,[nodes,positions,view.k,selected,hover,traced,near]);

 return (
  <div className="gw-canvas">
   <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Graph of ${nodes.length} concepts and ${edges.length} relationships. A table of the same relationships is available.`}
    onPointerDown={down} onPointerMove={move} onPointerUp={up} style={{touchAction:"none"}}>
    <rect width={W} height={H} fill="transparent"/>
    <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{transformOrigin:"0 0"}}>
     {edges.map(e=>{
      const [x1,y1]=P(e.s),[x2,y2]=P(e.o),dim=dimEdge(e),sel=selectedEdge===e.id,tr=traced.edges.has(e.id);
      const gap=e.kind==="gap";
      return (
       <g key={e.id}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} className="gw-edge" data-kind={e.kind} data-pair={e.pair||undefined} data-reading={e.reading} data-selected={sel||tr||undefined}
         strokeDasharray={gap?"3 6":e.negated?"7 5":undefined} opacity={dim?.1:1}/>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={14} onClick={ev=>{ev.stopPropagation();onSelectEdge(e.id)}} style={{cursor:"pointer"}}/>
       </g>
      );
     })}
     {nodes.map(n=>{
      const [x,y]=P(n.id),sel=selected===n.id,dim=dimNode(n.id),c=colourOf(n.group);
      return (
       <g key={n.id} role="button" tabIndex={0} aria-pressed={sel} aria-label={`${n.label}, ${n.degree} relationships`} className="gw-node" opacity={dim?.18:1}
        onClick={ev=>{ev.stopPropagation();onSelectNode(sel?null:n.id)}}
        onKeyDown={ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();onSelectNode(sel?null:n.id)}}}
        onPointerEnter={()=>setHover(n.id)} onPointerLeave={()=>setHover(null)} onFocus={()=>setHover(n.id)} onBlur={()=>setHover(null)}>
        <circle cx={x} cy={y} r={sel?r(n)+4:r(n)} fill={c} fillOpacity={.88} stroke={sel?"#F4F6F5":traced.nodes.has(n.id)?"#D8B477":c} strokeWidth={sel||traced.nodes.has(n.id)?2.5:1}/>
       </g>
      );
     })}
     <g aria-hidden="true">{labels.map(l=><text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor} className="gw-label" style={{fontSize:LABEL_FONT_PX/view.k,strokeWidth:3/view.k}} opacity={dimNode(l.id)?.25:1}>{l.text}</text>)}</g>
    </g>
   </svg>
   <div className="gw-zoom" role="group" aria-label="Zoom">
    <button type="button" onClick={()=>zoom(1.25)} aria-label="Zoom in">+</button>
    <button type="button" onClick={()=>zoom(.8)} aria-label="Zoom out">−</button>
    <button type="button" onClick={()=>setView({k:1,x:0,y:0})} aria-label="Reset view">⟲</button>
   </div>
  </div>
 );
}
