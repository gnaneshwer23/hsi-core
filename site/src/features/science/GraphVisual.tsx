import {useMemo,useRef,useState,useEffect,useId,type PointerEvent as ReactPointerEvent} from "react";
import type {GraphDataset} from "./knowledgeGraph";
import {forceGraphPositions,GRAPH_KIND_COLOURS} from './graphExplorer';
export type CanvasGraph=Omit<GraphDataset,"nodes"|"edges">&{nodes:Array<Omit<GraphDataset["nodes"][number],"kind">&{kind:string}>;edges:Array<Omit<GraphDataset["edges"][number],"assertionType">&{assertionType:string}>};

function fitGraphView(points:Map<string,{x:number;y:number}>){
 if(!points.size)return {zoom:1,pan:{x:0,y:0}};
 const xs=[...points.values()].map(p=>p.x),ys=[...points.values()].map(p=>p.y);
 // Extra vertical pad so node labels under the hull stay inside the viewBox.
 const minX=Math.min(...xs)-36,maxX=Math.max(...xs)+36,minY=Math.min(...ys)-28,maxY=Math.max(...ys)+48;
 const width=Math.max(80,maxX-minX),height=Math.max(80,maxY-minY);
 const zoom=Math.max(.5,Math.min(1.55,Math.min(760/width,500/height)*.88));
 const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 return {zoom:Math.round(zoom*100)/100,pan:{x:-(cx-450)*zoom,y:-(cy-325)*zoom}};
}

function wrapLabel(label:string,maxChars=20,maxLines=2):string[]{
 const words=label.trim().split(/\s+/).filter(Boolean);
 if(!words.length)return [label];
 const lines:string[]=[];
 let current="";
 for(const word of words){
  const next=current?`${current} ${word}`:word;
  if(next.length<=maxChars){current=next;continue}
  if(current)lines.push(current);
  current=word.length>maxChars?`${word.slice(0,maxChars-1)}…`:word;
  if(lines.length>=maxLines-1)break;
 }
 if(lines.length<maxLines&&current)lines.push(current);
 if(lines.length===maxLines&&words.join(" ").length>lines.join(" ").length){
  const last=lines[maxLines-1]??"";
  lines[maxLines-1]=last.endsWith("…")?last:`${last.replace(/…$/,"").slice(0,Math.max(4,maxChars-1))}…`;
 }
 return lines.slice(0,maxLines);
}

/** Push neighbour labels outward from the focus node so chips do not stack on the same point. */
function labelAnchor(id:string,index:number,point:{x:number;y:number},focusPoint:{x:number;y:number}|null,active:boolean):{dy:number;anchor:"middle"|"start"|"end";dx:number}{
 if(active)return {dy:32,anchor:"middle",dx:0};
 if(focusPoint){
  const dx=point.x-focusPoint.x,dy=point.y-focusPoint.y;
  const angle=Math.atan2(dy||0.01,dx||0.01);
  const outward=28;
  const ox=Math.cos(angle)*outward,oy=Math.sin(angle)*outward;
  const anchor: "middle"|"start"|"end"=ox>10?"start":ox<-10?"end":"middle";
  return {anchor,dx:anchor==="middle"?0:ox*0.45,dy:oy+(Math.abs(oy)<8?24:12)};
 }
 const slot=Math.abs(index+id.length)%4;
 if(slot===0)return {dy:28,anchor:"middle",dx:0};
 if(slot===1)return {dy:-20,anchor:"middle",dx:0};
 if(slot===2)return {dy:12,anchor:"start",dx:16};
 return {dy:12,anchor:"end",dx:-16};
}

function NodeLabel({label,x,y,active,near,compact,index,id,focusPoint}:{label:string;x:number;y:number;active:boolean;near:boolean;compact:boolean;index:number;id:string;focusPoint:{x:number;y:number}|null}){
 const maxChars=active?22:compact?16:18;
 const maxLines=active?3:compact?1:2;
 const lines=wrapLabel(label,maxChars,maxLines);
 const place=labelAnchor(id,index,{x,y},near||active?focusPoint:null,active);
 const lineHeight=active?13:12;
 const blockHeight=lines.length*lineHeight;
 const top=place.dy<0?y+place.dy-blockHeight+lineHeight:y+place.dy;
 const width=Math.max(...lines.map(l=>l.length))*6.2+10;
 const left=place.anchor==="middle"?x+place.dx-width/2:place.anchor==="start"?x+place.dx-2:x+place.dx-width+2;
 const showChip=active||(near&&!compact);
 return <g className={active?"kg-node-label kg-node-label-active":near?"kg-node-label kg-node-label-near":"kg-node-label"} pointerEvents="none">
  {showChip&&<rect x={left} y={top-10} width={width} height={blockHeight+8} rx="4" fill="#0f2421" fillOpacity={active?".88":".72"} stroke={active?"#fff6df":"#2a524a"} strokeOpacity=".55"/>}
  <text x={x+place.dx} y={top} textAnchor={place.anchor} fontSize={active?"12.5":compact?"10":"11"} fontFamily="Arial,sans-serif" fill={active?"#fff8f0":"#e7f3ef"} stroke={showChip?"none":"#122826"} strokeWidth={showChip?0:2.5} paintOrder="stroke" fontWeight={active?"700":"500"}>
   {lines.map((line,i)=><tspan key={i} x={x+place.dx} dy={i===0?0:lineHeight}>{line}</tspan>)}
  </text>
 </g>;
}

export function GraphVisual({graph,selected,onSelect,onSelectEdge,edgeDetails,caption="Educational draft · no scientific approval or clinical advice",exportMetadata}:{graph:CanvasGraph;selected:string;onSelect:(id:string)=>void;onSelectEdge?:(id:string)=>void;edgeDetails?:Record<string,{negated:boolean;contextual:boolean;label:string}>;caption?:string;exportMetadata?:Record<string,string>}){
 const markerId=useId().replaceAll(':','')+'-arrow';
 const [zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[message,setMessage]=useState(""),ref=useRef<SVGSVGElement|null>(null);
 const dense=graph.nodes.length>36;
 const [positions,setPositions]=useState<Record<string,{x:number;y:number}>>({});
 const [hover,setHover]=useState<string|null>(null);
 // Dense graphs default to focus labels only; "All labels" still works but uses collision-safe wrapping.
 const [labels,setLabels]=useState(!dense);
 const drag=useRef<{id:string|null;x:number;y:number;startX:number;startY:number;moved:boolean}|null>(null),moved=useRef(false);
 const fittedFor=useRef("");
 const signature=graph.nodes.map(n=>n.id).join('|')+';'+graph.edges.map(e=>e.id).join('|');
 const oversized=graph.nodes.length>500;
 const initial=useMemo(()=>oversized?new Map<string,{x:number;y:number}>():forceGraphPositions(graph),[signature,oversized]);
 const points=new Map([...initial].map(([id,p])=>[id,positions[id]??p]));
 // Fit once per graph membership. Do not re-fit after the user zooms/pans.
 useEffect(()=>{
  if(fittedFor.current===signature)return;
  fittedFor.current=signature;
  setPositions({});
  setLabels(graph.nodes.length<=36);
  if(oversized){setZoom(1);setPan({x:0,y:0});return}
  const next=fitGraphView(initial);
  setZoom(next.zoom);
  setPan(next.pan);
 },[signature,oversized,initial,graph.nodes.length]);
 const focus=hover??selected,neighbours=new Set([focus,...graph.edges.filter(e=>e.subjectId===focus||e.objectId===focus).flatMap(e=>[e.subjectId,e.objectId])]);
 const hasFocus=points.has(focus);
 const focusPoint=points.get(focus)??null;
 const changeZoom=(delta:number)=>setZoom(z=>Math.max(.4,Math.min(3,Math.round((z+delta)*10)/10)));
 useEffect(()=>{const svg=ref.current;if(!svg)return;const wheel=(e:WheelEvent)=>{e.preventDefault();setZoom(z=>Math.max(.4,Math.min(3,Math.round((z+(e.deltaY<0?.1:-.1))*10)/10)))};svg.addEventListener("wheel",wheel,{passive:false});return()=>svg.removeEventListener("wheel",wheel)},[oversized]);
 function pointerPoint(e:ReactPointerEvent<SVGSVGElement>){const matrix=e.currentTarget.getScreenCTM();return matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()):{x:0,y:0}}
 function start(e:ReactPointerEvent<SVGSVGElement>){if(e.button!==0)return;const target=(e.target as Element).closest('[data-graph-node]'),edge=(e.target as Element).closest('[data-graph-edge]');if(edge)return;const p=pointerPoint(e);moved.current=false;drag.current={id:target?.getAttribute('data-graph-node')??null,...p,startX:p.x,startY:p.y,moved:false};e.currentTarget.setPointerCapture(e.pointerId)}
 function move(e:ReactPointerEvent<SVGSVGElement>){const d=drag.current;if(!d)return;const p=pointerPoint(e),dx=p.x-d.x,dy=p.y-d.y;if(Math.hypot(p.x-d.startX,p.y-d.startY)>4)d.moved=true;if(d.id){const at=points.get(d.id);if(at)setPositions(old=>({...old,[d.id!]:{x:at.x+dx/zoom,y:at.y+dy/zoom}}))}else setPan(old=>({x:old.x+dx,y:old.y+dy}));d.x=p.x;d.y=p.y}
 function end(e:ReactPointerEvent<SVGSVGElement>){const d=drag.current;drag.current=null;moved.current=!!d?.moved;if(d?.id&&!d.moved)onSelect(d.id);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}
 function blobDownload(blob:Blob,extension:string){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(exportMetadata?"hsi-claim-graph.":"hsi-editorial-graph.")+extension;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 async function download(format:"svg"|"png"|"json"){
  setMessage("");try{
   if(format==="json"){blobDownload(new Blob([JSON.stringify({scope:exportMetadata?.scope??"public_educational_draft",scientificApproval:false,clinicalAdvice:false,selected,zoom,pan,exportMetadata:exportMetadata??null,edgeDetails:edgeDetails??null,layout:{method:"bounded_force_v1",positions:Object.fromEntries(points)},graph},null,2)+"\n"],{type:"application/json"}),"json");return}
   if(!ref.current)throw Error();const svg=ref.current.cloneNode(true) as SVGSVGElement;svg.setAttribute("xmlns","http://www.w3.org/2000/svg");svg.setAttribute("width","1800");svg.setAttribute("height","1300");const title=document.createElementNS("http://www.w3.org/2000/svg","title");title.textContent=caption;const metadata=document.createElementNS("http://www.w3.org/2000/svg","metadata");metadata.textContent=JSON.stringify({scientificApproval:false,exportMetadata:exportMetadata??null,edgeDetails:edgeDetails??null});svg.prepend(metadata);svg.prepend(title);const xml=new XMLSerializer().serializeToString(svg),blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
   if(format==="svg"){blobDownload(blob,"svg");return}
   const url=URL.createObjectURL(blob);try{const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error());img.src=url});const canvas=document.createElement("canvas");canvas.width=1800;canvas.height=1300;const ctx=canvas.getContext("2d");if(!ctx)throw Error();ctx.fillStyle="#122826";ctx.fillRect(0,0,1800,1300);ctx.drawImage(img,0,0);const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error()),"image/png"));blobDownload(png,"png")}finally{URL.revokeObjectURL(url)}
  }catch{setMessage("The graph export could not be produced. Try JSON or retry the view.")}
 }
 const shift=(x:number,y:number)=>setPan(p=>({x:p.x+x,y:p.y+y}));
 const resetView=()=>{setPositions({});const next=fitGraphView(initial);setZoom(next.zoom);setPan(next.pan)};
 if(oversized)return <p role="status">This view supports up to 500 nodes. Narrow the graph filters to view a smaller network; use the text view to inspect connections.</p>;
 return <div className="xp-graph-frame kg-canvas"><div className="xp-graph-toolbar" role="group" aria-label="Graph view controls"><button type="button" aria-label="Zoom in graph" disabled={zoom>=3} onClick={()=>changeZoom(.2)}>+</button><button type="button" aria-label="Zoom out graph" disabled={zoom<=.4} onClick={()=>changeZoom(-.2)}>−</button><span data-testid="graph-zoom-pct">{Math.round(zoom*100)}%</span>{[["Pan graph left",-25,0],["Pan graph right",25,0],["Pan graph up",0,-25],["Pan graph down",0,25]].map(([label,x,y],i)=><button type="button" key={label} aria-label={String(label)} onClick={()=>shift(Number(x),Number(y))}>{["←","→","↑","↓"][i]}</button>)}<button type="button" onClick={resetView}>Fit network</button><button type="button" aria-pressed={labels} aria-label={dense?"Toggle all concept labels. Dense networks wrap and stagger labels.":"Toggle all concept labels"} onClick={()=>setLabels(v=>!v)}>{labels?(dense?"Focus labels":"Fewer labels"):"All labels"}</button></div>
 <svg ref={ref} viewBox="0 0 900 650" role="group" aria-label="Interactive graph of biological entities" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{drag.current=null}}>
 <defs>
  <marker id={markerId} viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#9fd6cb"/></marker>
  <radialGradient id={markerId+'-glow'} cx="50%" cy="45%" r="65%"><stop offset="0%" stopColor="#1d4a43"/><stop offset="100%" stopColor="#122826"/></radialGradient>
  <pattern id={markerId+'-dots'} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="#2a524a" fillOpacity=".55"/></pattern>
 </defs>
 <rect width="900" height="650" fill={'url(#'+markerId+'-glow)'}/>
 <rect width="900" height="650" fill={'url(#'+markerId+'-dots)'}/>
 <g transform={"translate("+pan.x+" "+pan.y+") translate(450 325) scale("+zoom+") translate(-450 -325)"}>
 {graph.edges.map(e=>{const a=points.get(e.subjectId),b=points.get(e.objectId);if(!a||!b)return null;const active=e.subjectId===focus||e.objectId===focus,detail=edgeDetails?.[e.id];return <g key={e.id} data-graph-edge={e.id} role="button" tabIndex={0} aria-label={'Inspect connection '+graph.nodes.find(n=>n.id===e.subjectId)?.label+' to '+graph.nodes.find(n=>n.id===e.objectId)?.label+(detail?' · '+detail.label:'')} onClick={()=>onSelectEdge?.(e.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelectEdge?.(e.id)}}}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} markerEnd={detail?'url(#'+markerId+')':undefined} strokeDasharray={detail?.negated?'6 4':detail?.contextual?'2 5':undefined} stroke={detail?.negated?'#f3ad9c':active?'#b7e4d8':'#6f958c'} strokeOpacity={active ? .92 : hasFocus ? .28 : .55} strokeWidth={active?2.2:1.35}/><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="16"/><title>{detail?.label??"Draft topic connection · inspect evidence"}</title></g>})}
 {graph.nodes.map((n,index)=>{
  const p=points.get(n.id)!;
  const active=n.id===selected;
  const near=neighbours.has(n.id)&&!active;
  // Dense focus mode labels only the selection (+ hovered neighbour). Names stay in the inspector instead of stacking.
  // "All labels" on a dense canvas: selection chip + compact outward neighbour names + tiny far labels.
  const hovered=hover===n.id;
  const show=active||labels||(!dense&&near)||!hasFocus||(dense&&!labels&&hovered);
  const compact=(dense&&labels&&near)||(dense&&!labels&&hovered&&!active);
  const tiny=dense&&labels&&!active&&!near;
  return <g key={n.id} data-graph-node={n.id} role="button" tabIndex={0} aria-label={"Select "+n.label} aria-pressed={active} onPointerEnter={()=>{if(!drag.current)setHover(n.id)}} onPointerLeave={()=>setHover(null)} onClick={event=>{if(event.detail===0&&!moved.current)onSelect(n.id)}} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(n.id)}}} opacity={!hasFocus||active||near?1:.34}>
   <circle cx={p.x} cy={p.y} r={active?18:11} fill={(GRAPH_KIND_COLOURS[n.kind]??'#9bcac0')} fillOpacity=".22"/>
   <circle cx={p.x} cy={p.y} r={active?13:9} fill={GRAPH_KIND_COLOURS[n.kind]??'#9bcac0'} stroke={active?'#fff6df':'#0f2421'} strokeWidth={active?2.5:1.6}/>
   {active&&<circle cx={p.x} cy={p.y} r="22" fill="none" stroke="#d8efe8" strokeOpacity=".45"/>}
   {show&&!tiny&&<NodeLabel label={n.label} x={p.x} y={p.y} active={active} near={near||active} compact={compact} index={index} id={n.id} focusPoint={focusPoint}/>}
   {show&&tiny&&<text x={p.x} y={p.y+22} textAnchor="middle" fontSize="9" fontFamily="Arial,sans-serif" fill="#b7cfc7" fillOpacity=".7">{wrapLabel(n.label,12,1)[0]}</text>}
   <title>{n.label} · {n.kind} · {n.reviewState}</title>
  </g>;
 })}</g>
 <text x="450" y="636" textAnchor="middle" fontSize="10" fontFamily="Arial,sans-serif" fill="#a8c4bc">{caption}</text></svg>
 <div className="kg-canvas-bottom"><span>{dense?"Dense network · selection labelled · hover or inspect for neighbour names · Fit network recentres":"Drag a node to arrange · drag space to pan · scroll to zoom · Fit network recentres the current view"}</span><div className="xp-graph-toolbar">{(["svg","png","json"] as const).map(f=><button key={f} type="button" onClick={()=>void download(f)}>Download graph {f.toUpperCase()}</button>)}</div></div>{message&&<p role="status">{message}</p>}</div>;
}
