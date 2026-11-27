import {useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import * as THREE from "three";
import {ENV_EDGES,ENV_ENTITIES,centroidOfScale,posOf,weakestInEnv,type Emphasis,type Layer,type Scale} from "./environment";
import {entityById,type AtlasStatus} from "../components/atlas/atlasData";

// WebGL cannot read CSS variables, so the canvas colours mirror the design tokens.
const STATUS_COLOUR:Record<AtlasStatus,string>={supported:"#83B8AD",association:"#D8B477",hypothesis:"#7FA6B8",contested:"#E07A7A"};
const DOMAIN_COLOUR:Record<string,string>={microbiome:"#83B8AD",immunology:"#7FA6B8",neuroscience:"#D8B477",disease:"#C9CED2",organ:"#A7B6BF",genomics:"#B7A8D0"};

type Props={layer:Layer;scale:Scale|null;selected:string|null;emphasis:Emphasis;onSelect:(id:string|null)=>void;onHover:(id:string|null)=>void};

function Node({id,props,dim}:{id:string;props:Props;dim:boolean}){
 const e=entityById[id]!,sel=props.selected===id;
 const colour=useMemo(()=>{
  if(props.layer==="evidence"||props.layer==="conflicts"||props.layer==="gaps"){const w=weakestInEnv(id);return STATUS_COLOUR[w??"supported"]}
  return DOMAIN_COLOUR[e.domain]??"#A7B6BF";
 },[props.layer,id,e.domain]);
 const ref=useRef<THREE.Mesh>(null);
 useFrame((_,d)=>{
  const m=ref.current;if(!m)return;
  const target=sel?1.7:dim?0.55:1;
  m.scale.lerp(new THREE.Vector3(target,target,target),1-Math.exp(-8*Math.min(d,.05)));
 });
 const p=posOf(id);
 return (
  <mesh ref={ref} position={p}
   onClick={ev=>{ev.stopPropagation();props.onSelect(sel?null:id)}}
   onPointerOver={ev=>{ev.stopPropagation();props.onHover(id);document.body.style.cursor="pointer"}}
   onPointerOut={()=>{props.onHover(null);document.body.style.cursor=""}}>
   <sphereGeometry args={[0.2,28,28]}/>
   <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={sel?0.9:dim?0.05:0.35} roughness={0.4} metalness={0.1} transparent opacity={dim?0.28:1}/>
  </mesh>
 );
}

function Edge({id,from,to,status,dim}:{id:string;from:string;to:string;status:AtlasStatus;dim:boolean}){
 const line=useMemo(()=>{
  const a=new THREE.Vector3(...posOf(from)),b=new THREE.Vector3(...posOf(to));
  const mid=a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0,0,0.55));
  const pts=new THREE.QuadraticBezierCurve3(a,mid,b).getPoints(28);
  const g=new THREE.BufferGeometry().setFromPoints(pts);
  const dashed=status==="contested"||status==="hypothesis";
  const m=dashed?new THREE.LineDashedMaterial({color:STATUS_COLOUR[status],dashSize:.12,gapSize:.09,transparent:true,opacity:dim?.12:.9}):new THREE.LineBasicMaterial({color:STATUS_COLOUR[status],transparent:true,opacity:dim?.12:.9});
  const l=new THREE.Line(g,m);if(dashed)l.computeLineDistances();
  return l;
 },[from,to,status,dim]);
 useEffect(()=>()=>{line.geometry.dispose();(line.material as THREE.Material).dispose()},[line]);
 return <primitive object={line} key={id}/>;
}

function Scene(props:Props){
 const group=useRef<THREE.Group>(null);
 const rot=useRef({x:-0.15,y:0.3,vy:0,drag:false,moved:0,lx:0,ly:0});
 const {gl,camera}=useThree();
 useEffect(()=>{
  const el=gl.domElement,r=rot.current;
  const down=(e:PointerEvent)=>{r.drag=true;r.moved=0;r.lx=e.clientX;r.ly=e.clientY};
  const move=(e:PointerEvent)=>{if(!r.drag)return;const dx=e.clientX-r.lx,dy=e.clientY-r.ly;r.moved+=Math.abs(dx)+Math.abs(dy);r.y+=dx*0.006;r.x=Math.max(-0.9,Math.min(0.9,r.x+dy*0.004));r.lx=e.clientX;r.ly=e.clientY};
  const up=()=>{r.drag=false};
  const bg=(e:MouseEvent)=>{if(r.moved<4&&e.target===el)props.onSelect(null)};
  el.addEventListener("pointerdown",down);window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);el.addEventListener("click",bg);
  return()=>{el.removeEventListener("pointerdown",down);window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);el.removeEventListener("click",bg)};
 },[gl,props]);
 useFrame((_,d)=>{
  const g=group.current;if(!g)return;const r=rot.current,k=1-Math.exp(-3*Math.min(d,.05));
  if(!r.drag&&!props.selected)r.y+=d*0.08;
  g.rotation.y+=(r.y-g.rotation.y)*Math.min(1,k*3);g.rotation.x+=(r.x-g.rotation.x)*Math.min(1,k*3);
  const c=centroidOfScale(props.scale),want=props.scale?new THREE.Vector3(-c[0]*0.6,-c[1]*0.6,-c[2]*0.3):new THREE.Vector3();
  g.position.lerp(want,k);
  const z=props.scale?5.3:7;camera.position.z+=(z-camera.position.z)*k;
 });
 return (
  <group ref={group}>
   {ENV_EDGES.map(e=><Edge key={e.id} id={e.id} from={e.from} to={e.to} status={e.status} dim={!props.emphasis.edges.has(e.id)}/>)}
   {ENV_ENTITIES.map(e=><Node key={e.id} id={e.id} props={props} dim={!props.emphasis.entities.has(e.id)}/>)}
  </group>
 );
}

/** The 3D environment. Lazy-loaded; the 2D map and the entity list carry the same data without it. */
export default function Canvas3D(props:Props){
 return (
  <Canvas camera={{position:[0,0,7],fov:42}} dpr={[1,1.75]} gl={{antialias:true,alpha:true}} style={{touchAction:"pan-y"}} aria-hidden="true">
   <ambientLight intensity={0.7}/>
   <pointLight position={[4,4,6]} intensity={60}/>
   <pointLight position={[-5,-3,3]} intensity={25} color="#D8B477"/>
   <Scene {...props}/>
  </Canvas>
 );
}
