import {useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import * as THREE from "three";
import {BAND_HEIGHT,SCALE_BANDS,type ScaleBand} from "../../../src/graphWorkspace/scale";
import type {GEdge,GNode} from "./Graph2D";

/* WebGL cannot read CSS variables, so these mirror the workspace tokens in graph.css. */
const EDGE="#7E8A90",EDGE_SEL="#F4F6F5",TRACE="#D8B477",GAP="#C9CED2";
const READING:Record<string,string>={potential_contradiction:"#E07A7A",context_dependence:"#D8B477",insufficient_context:"#8A9BA8"};

export type Pos3=ReadonlyMap<string,readonly [number,number,number]>;
export type Graph3DProps={
 nodes:readonly GNode[];edges:readonly GEdge[];positions:Pos3;colourOf:(group:string)=>string;bandOf:(id:string)=>ScaleBand;
 selected:string|null;selectedEdge:string|null;onSelectNode:(id:string|null)=>void;onSelectEdge:(id:string)=>void;onHover:(id:string|null)=>void;
 focus:boolean;traced:{nodes:ReadonlySet<string>;edges:ReadonlySet<string>};
 /** The band the view is centred on; others recede. Null shows every band. */
 band:ScaleBand|null;
 /** Camera distance factor from the zoom buttons. */
 zoom:number;
 reduceMotion:boolean;
};

const radius=(n:GNode)=>0.07+Math.min(0.11,Math.sqrt(n.degree)*0.03);

function Node({n,p,colour,sel,dim,traced,reduce,onSelect,onHover}:{n:GNode;p:readonly [number,number,number];colour:string;sel:boolean;dim:boolean;traced:boolean;reduce:boolean;onSelect:(id:string|null)=>void;onHover:(id:string|null)=>void}){
 const ref=useRef<THREE.Mesh>(null);
 const target=sel?1.6:dim?0.7:1;
 useFrame((_,d)=>{const m=ref.current;if(!m)return;if(reduce){m.scale.setScalar(target);return}m.scale.lerp(new THREE.Vector3(target,target,target),1-Math.exp(-8*Math.min(d,.05)))});
 return (
  <mesh ref={ref} position={p as [number,number,number]}
   onClick={ev=>{ev.stopPropagation();onSelect(sel?null:n.id)}}
   onPointerOver={ev=>{ev.stopPropagation();onHover(n.id);document.body.style.cursor="pointer"}}
   onPointerOut={()=>{onHover(null);document.body.style.cursor=""}}>
   <sphereGeometry args={[radius(n),20,20]}/>
   <meshStandardMaterial color={colour} emissive={traced?TRACE:colour} emissiveIntensity={sel?0.9:traced?0.6:dim?0.04:0.3} roughness={0.45} metalness={0.05} transparent opacity={dim?0.2:1}/>
  </mesh>
 );
}

function Edge({e,a,b,dim,sel,traced,onSelect}:{e:GEdge;a:readonly [number,number,number];b:readonly [number,number,number];dim:boolean;sel:boolean;traced:boolean;onSelect:(id:string)=>void}){
 const line=useMemo(()=>{
  const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);
  const colour=sel?EDGE_SEL:traced?TRACE:e.kind==="gap"?GAP:(e.reading&&READING[e.reading])||EDGE;
  const opacity=dim?.08:sel||traced?1:.7;
  const dashed=e.kind==="gap"||e.negated;
  const m=dashed?new THREE.LineDashedMaterial({color:colour,dashSize:e.kind==="gap"?.04:.09,gapSize:.07,transparent:true,opacity}):new THREE.LineBasicMaterial({color:colour,transparent:true,opacity});
  const l=new THREE.Line(g,m);if(dashed)l.computeLineDistances();
  return l;
 },[a,b,e.kind,e.negated,e.reading,dim,sel,traced]);
 useEffect(()=>()=>{line.geometry.dispose();(line.material as THREE.Material).dispose()},[line]);
 return <primitive object={line} onClick={(ev:{stopPropagation:()=>void})=>{ev.stopPropagation();onSelect(e.id)}}/>;
}

/** A faint plane per band, so the level a concept sits at is visible without reading a label. */
function BandPlane({band,active,dimmed}:{band:ScaleBand;active:boolean;dimmed:boolean}){
 const unplaced=band==="not_recorded"||band==="not_biological";
 return (
  <mesh position={[0,BAND_HEIGHT[band]-0.02,0]} rotation={[-Math.PI/2,0,0]}>
   <planeGeometry args={[6.6,4.6]}/>
   <meshBasicMaterial color={unplaced?"#5C666C":"#83B8AD"} transparent opacity={active?0.14:dimmed?0.025:0.06} side={THREE.DoubleSide} depthWrite={false}/>
  </mesh>
 );
}

function Scene(p:Graph3DProps){
 const group=useRef<THREE.Group>(null);
 const rot=useRef({x:-0.22,y:0.5,drag:false,moved:0,lx:0,ly:0});
 const {gl,camera,raycaster}=useThree();
 const onSelectNode=p.onSelectNode;
 useEffect(()=>{raycaster.params.Line={threshold:0.06}},[raycaster]);
 useEffect(()=>{
  const el=gl.domElement,r=rot.current;
  const down=(e:PointerEvent)=>{r.drag=true;r.moved=0;r.lx=e.clientX;r.ly=e.clientY};
  const move=(e:PointerEvent)=>{if(!r.drag)return;const dx=e.clientX-r.lx,dy=e.clientY-r.ly;r.moved+=Math.abs(dx)+Math.abs(dy);r.y+=dx*0.006;r.x=Math.max(-1.2,Math.min(0.6,r.x+dy*0.004));r.lx=e.clientX;r.ly=e.clientY};
  const up=()=>{r.drag=false};
  const bg=(e:MouseEvent)=>{if(r.moved<4&&e.target===el)onSelectNode(null)};
  el.addEventListener("pointerdown",down);window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);el.addEventListener("click",bg);
  return()=>{el.removeEventListener("pointerdown",down);window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);el.removeEventListener("click",bg)};
 },[gl,onSelectNode]);

 const bandsPresent=useMemo(()=>{const s=new Set(p.nodes.map(n=>p.bandOf(n.id)));return SCALE_BANDS.map(b=>b.key).filter(b=>s.has(b))},[p.nodes,p.bandOf]);
 const centreY=useMemo(()=>{
  if(p.band)return BAND_HEIGHT[p.band];
  const hs=bandsPresent.map(b=>BAND_HEIGHT[b]);return hs.length?(Math.max(...hs)+Math.min(...hs))/2:0;
 },[p.band,bandsPresent]);

 useFrame((_,d)=>{
  const g=group.current;if(!g)return;const r=rot.current;
  const k=p.reduceMotion?1:1-Math.exp(-4*Math.min(d,.05));
  if(!r.drag&&!p.selected&&!p.reduceMotion)r.y+=d*0.05;
  g.rotation.y+=(r.y-g.rotation.y)*Math.min(1,k*2);g.rotation.x+=(r.x-g.rotation.x)*Math.min(1,k*2);
  g.position.y+=(-centreY-g.position.y)*k;
  const z=(p.band?8:11)/p.zoom;camera.position.z+=(z-camera.position.z)*k;
 });

 const P=(id:string)=>p.positions.get(id)??[0,0,0] as const;
 const near=useMemo(()=>{if(!p.selected)return null;const s=new Set([p.selected]);for(const e of p.edges){if(e.s===p.selected)s.add(e.o);if(e.o===p.selected)s.add(e.s)}return s},[p.selected,p.edges]);
 const tracing=p.traced.nodes.size>0;
 const dimNode=(id:string)=>tracing?!p.traced.nodes.has(id):p.focus&&near?!near.has(id):p.band?p.bandOf(id)!==p.band:false;
 const dimEdge=(e:GEdge)=>tracing?!p.traced.edges.has(e.id):p.focus&&p.selected?!(e.s===p.selected||e.o===p.selected):p.band?p.bandOf(e.s)!==p.band&&p.bandOf(e.o)!==p.band:false;

 return (
  <group ref={group}>
   {bandsPresent.map(b=><BandPlane key={b} band={b} active={p.band===b} dimmed={!!p.band&&p.band!==b}/>)}
   {p.edges.map(e=><Edge key={e.id} e={e} a={P(e.s)} b={P(e.o)} dim={dimEdge(e)} sel={p.selectedEdge===e.id} traced={p.traced.edges.has(e.id)} onSelect={p.onSelectEdge}/>)}
   {p.nodes.map(n=><Node key={n.id} n={n} p={P(n.id)} colour={p.colourOf(n.group)} sel={p.selected===n.id} dim={dimNode(n.id)} traced={p.traced.nodes.has(n.id)} reduce={p.reduceMotion} onSelect={p.onSelectNode} onHover={p.onHover}/>)}
  </group>
 );
}

/**
 * LEA-04D: the 3D view of the same concepts and relationships as the 2D graph and the table. Height is the biological
 * scale band; the plane position comes from the 2D layout. Lazy-loaded; the canvas is hidden from assistive technology
 * because the list beside it, the 2D graph and the table carry the same content.
 */
export default function Graph3D(props:Graph3DProps){
 return (
  <Canvas camera={{position:[0,0,11],fov:42}} dpr={[1,1.75]} gl={{antialias:true,alpha:true}} style={{touchAction:"none"}} aria-hidden="true">
   <ambientLight intensity={0.75}/>
   <pointLight position={[4,5,6]} intensity={55}/>
   <pointLight position={[-5,-3,3]} intensity={20} color="#D8B477"/>
   <Scene {...props}/>
  </Canvas>
 );
}
