import { useMemo, useState } from "react";
import { BIOLOGY_ENTITIES } from "./biologyCatalogue";
import "../styles/science-anatomy.css";

type Props={selected:string;visible:Set<string>;onSelect:(id:string)=>void};
type View="front"|"back";
const depth:Record<string,number>={brain:0,lungs:-16,heart:20,liver:10,pancreas:15,kidneys:-25,intestine:20,spleen:5,muscle:30,adipose:40};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function AnatomyModel({selected,visible,onSelect}:Props){
 const [angle,setAngle]=useState(0);
 const [tilt,setTilt]=useState(0);
 const [mode,setMode]=useState<"spatial"|"flat">("spatial");
 const [dragging,setDragging]=useState<number|null>(null);
 const [start,setStart]=useState({x:0,angle:0});
 const radians=angle*Math.PI/180;
 const points=useMemo(()=>BIOLOGY_ENTITIES.map(o=>{
  const x=(o.position?.x??150)-150;
  const z=depth[o.id]??0;
  const projectedX=150+x*Math.cos(radians)+z*Math.sin(radians);
  const projectedDepth=z*Math.cos(radians)-x*Math.sin(radians);
  return {entity:o,x:mode==="flat"?(o.position?.x??150):projectedX,y:(o.position?.y??230)+Math.sin(tilt*Math.PI/180)*projectedDepth*.2,z:projectedDepth};
 }).sort((a,b)=>a.z-b.z),[angle,tilt,mode]);
 const view:View=Math.cos(radians)>=0?"front":"back";
 return <div className="science-anatomy">
 <div className="science-anatomy-controls" aria-label="Anatomy viewing controls">
  <div className="science-anatomy-mode" role="group" aria-label="Model display mode"><button type="button" aria-pressed={mode==="spatial"} onClick={()=>setMode("spatial")}>Spatial</button><button type="button" aria-pressed={mode==="flat"} onClick={()=>setMode("flat")}>2D fallback</button></div>
  <div className="science-anatomy-rotate"><button type="button" onClick={()=>{setMode("spatial");setAngle(a=>(a-30+360)%360)}} aria-label="Rotate anatomy left">↶</button><button type="button" onClick={()=>{setMode("spatial");setAngle(a=>(a+30)%360)}} aria-label="Rotate anatomy right">↷</button><button type="button" onClick={()=>{setAngle(0);setTilt(0);setMode("spatial")}}>Reset</button></div>
 </div>
 <div className="science-anatomy-viewport" aria-label="Interactive spatial anatomy model" onPointerDown={e=>{if(e.target!==e.currentTarget)return;setDragging(e.pointerId);setStart({x:e.clientX,angle});e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(dragging!==e.pointerId)return;setMode("spatial");setAngle((start.angle+(e.clientX-start.x)*.65+3600)%360)}} onPointerUp={e=>{if(dragging===e.pointerId)setDragging(null)}} onPointerCancel={()=>setDragging(null)}>
  <svg viewBox="0 0 300 465" role="group" aria-label={`Spatial body illustration, ${view} view, rotation ${Math.round(angle)} degrees. Select markers to explore organs.`}>
   <defs><linearGradient id="spatial-body-fill" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b3d6cb" stopOpacity=".75"/><stop offset=".5" stopColor="#e7f3eb" stopOpacity=".55"/><stop offset="1" stopColor="#7ba99d" stopOpacity=".85"/></linearGradient><radialGradient id="spatial-organ-fill"><stop stopColor="#f7bd9b"/><stop offset=".65" stopColor="#e46c51"/><stop offset="1" stopColor="#ac453e"/></radialGradient></defs>
   <g transform={mode==="flat"?undefined:`translate(150 230) scale(${.22+.78*Math.abs(Math.cos(radians))} 1) translate(-150 -230)`}>
    <path d="M150 18 C122 18 118 44 128 67 L133 83 123 98 94 105 67 136 46 227 60 239 84 171 95 149 100 260 115 293 112 435 135 441 150 318 165 441 188 435 185 293 200 260 205 149 216 171 240 239 254 227 233 136 206 105 177 98 167 83 172 67 C182 44 178 18 150 18Z" fill="url(#spatial-body-fill)" stroke="#17645f" strokeWidth="2" opacity=".72"/>
    <path d="M150 95 V290 M108 190 Q150 209 192 190" fill="none" stroke="#17645f" strokeOpacity=".3" strokeDasharray="4 6"/>
   </g>
   {points.map(({entity:o,x,y,z})=><g key={o.id} role="button" tabIndex={visible.has(o.id)?0:-1} aria-label={`Select ${o.preferredLabel}`} aria-pressed={selected===o.id} opacity={visible.has(o.id)?1:.12} onClick={()=>{if(visible.has(o.id))onSelect(o.id)}} onKeyDown={e=>{if(visible.has(o.id)&&(e.key==="Enter"||e.key===" ")){e.preventDefault();onSelect(o.id)}}} className="science-anatomy-marker" style={{cursor:visible.has(o.id)?"pointer":"default"}}>
    <circle cx={x} cy={y} r={selected===o.id?15:clamp(9+z*.025,8,13)} fill={selected===o.id?"url(#spatial-organ-fill)":"#17645f"} stroke="#fffaf4" strokeWidth={selected===o.id?4:3}/>
    <circle cx={x-2} cy={y-2} r="3" fill="#fffaf4" opacity=".9"/>
    {selected===o.id&&<text x={x} y={y-23} textAnchor="middle" className="science-anatomy-marker-label">{o.preferredLabel}</text>}
   </g>)}
  </svg>
 </div>
 <div className="science-anatomy-status"><span aria-live="polite">{mode==="flat"?"2D accessible fallback":`${view} view · ${Math.round(angle)}°`}</span><span>Drag background or use rotation controls</span></div>
 <p className="science-anatomy-disclaimer">Original procedural spatial illustration. Organ markers indicate educational locations, not anatomical shapes or clinical imaging. No third-party 3D asset is used.</p>
 </div>;
}
