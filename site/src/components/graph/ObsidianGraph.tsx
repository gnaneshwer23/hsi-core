import {useCallback,useEffect,useMemo,useRef,useState} from "react";

export type OGNode={id:string;label:string;kind:string;domain:string};
export type OGGap={id:string;a:string;b:string;score:number};
export type OGEdge={id:string;s:string;o:string;predicate:string;negated:boolean;contextual:boolean;model:string};
type GroupBy="domain"|"kind"|"model";
type Settings={text:number;size:number;link:number;center:number;repel:number;strength:number;dist:number;arrows:boolean;animate:boolean;groupBy:GroupBy;gaps:boolean};
const DEFAULTS:Settings={text:.5,size:1,link:1,center:.55,repel:.45,strength:.5,dist:.45,arrows:false,animate:true,groupBy:"domain",gaps:true};
const PALETTE=["#65CEE6","#A4A1EE","#E8A0B0","#D4B376","#8FD9A8","#F2A65A","#7FB2F0","#C9A0DC","#9AA5B8"];
const MAX_NODES=500,pretty=(s:string)=>s.replaceAll("_"," ");
type Sim={x:Float64Array;y:Float64Array;vx:Float64Array;vy:Float64Array;pin:Uint8Array;alpha:number};
const hash=(s:string)=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,17);

/** An Obsidian-style graph: live force simulation, drag nodes, pan and zoom, hover to isolate a neighbourhood, labels that appear as you zoom.
 *  Colour is a scientific choice (department, concept type or evidence model); dashed lines are findings recorded as not holding. */
export function ObsidianGraph({nodes,edges,selected,highlight,onSelect,onSelectEdge,caption,exportName="hsi-graph",gaps=[],gapSel=null,onGap,focusIds,focusTick=0,picked=[],onPick,pathEdges,showcase=false,preset}:{nodes:OGNode[];edges:OGEdge[];selected:string;highlight?:ReadonlySet<string>;onSelect:(id:string)=>void;onSelectEdge:(id:string)=>void;caption:string;exportName?:string;gaps?:OGGap[];gapSel?:string|null;onGap?:(id:string)=>void;focusIds?:string[];focusTick?:number;picked?:string[];onPick?:(ids:string[])=>void;pathEdges?:ReadonlySet<string>;showcase?:boolean;preset?:Partial<Settings>}){
 const wrap=useRef<HTMLDivElement|null>(null),cv=useRef<HTMLCanvasElement|null>(null);
 const [cfg,setCfg]=useState<Settings>({...DEFAULTS,...preset}),[panel,setPanel]=useState(false),[hidden,setHidden]=useState<string[]>([]),[paused,setPaused]=useState(false),[zoomPct,setZoomPct]=useState(100),[msg,setMsg]=useState("");
 const cfgRef=useRef(cfg);cfgRef.current=cfg;
 const nodeModel=useMemo(()=>{const m=new Map<string,Map<string,number>>();for(const e of edges)for(const id of [e.s,e.o]){const c=m.get(id)??new Map<string,number>();c.set(e.model,(c.get(e.model)??0)+1);m.set(id,c)}return new Map([...m].map(([id,c])=>[id,[...c].sort((a,b)=>b[1]-a[1])[0]![0]]))},[edges]);
 const groupOf=useCallback((n:OGNode)=>cfg.groupBy==="domain"?(n.domain||"untagged"):cfg.groupBy==="kind"?n.kind:pretty(nodeModel.get(n.id)??"no relationships"),[cfg.groupBy,nodeModel]);
 const groups=useMemo(()=>{const c=new Map<string,number>();for(const n of nodes)c.set(groupOf(n),(c.get(groupOf(n))??0)+1);return [...c].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))},[nodes,groupOf]);
 const colour=useMemo(()=>new Map(groups.map(([g],i)=>[g,PALETTE[i%PALETTE.length]!])),[groups]);
 const shown=useMemo(()=>nodes.filter(n=>!hidden.includes(groupOf(n))),[nodes,hidden,groupOf]);
 const shownIds=useMemo(()=>new Set(shown.map(n=>n.id)),[shown]);
 const links=useMemo(()=>edges.filter(e=>shownIds.has(e.s)&&shownIds.has(e.o)),[edges,shownIds]);
 const deg=useMemo(()=>{const d=new Map<string,number>();for(const e of links){d.set(e.s,(d.get(e.s)??0)+1);d.set(e.o,(d.get(e.o)??0)+1)}return d},[links]);
 const idx=useMemo(()=>new Map(shown.map((n,i)=>[n.id,i])),[shown]);
 const sig=shown.map(n=>n.id).join("|")+";"+links.length;
 const st=useRef({sim:null as Sim|null,k:1,tx:0,ty:0,w:900,h:640,dpr:1,hover:-1,box:null as null|[number,number,number,number],touched:false,refit:false,drag:null as null|{mode:"node"|"pan"|"box";i:number;sx:number;sy:number;tx:number;ty:number;moved:boolean;multi?:boolean},raf:0,dirty:true,running:false,fitFor:""});
 const gapsShown=useMemo(()=>gaps.filter(g=>idx.has(g.a)&&idx.has(g.b)),[gaps,idx]);
 const data=useRef({shown,links,deg,idx,colour,groupOf,selected,highlight,cfg,gaps:gapsShown,gapSel,hoverGap:-1,picked,pathEdges,box:null as null|[number,number,number,number]});
 data.current={...data.current,shown,links,deg,idx,colour,groupOf,selected,highlight,cfg,gaps:gapsShown,gapSel,picked,pathEdges};
 const radius=(i:number)=>{const d=data.current;return (3+Math.sqrt(d.deg.get(d.shown[i]!.id)??0)*1.6)*d.cfg.size};

 const fit=useCallback(()=>{
  const s=st.current,sim=s.sim;if(!sim||!sim.x.length)return;
  const xs=[...sim.x].sort((p,q)=>p-q),ys=[...sim.y].sort((p,q)=>p-q),lo=Math.floor(xs.length*.04),hi=Math.max(lo,Math.ceil(xs.length*.96)-1);const a=xs[lo]!,b=xs[hi]!,c=ys[lo]!,d=ys[hi]!;
  const bw=Math.max(60,b-a),bh=Math.max(60,d-c);s.k=Math.max(.2,Math.min(2.2,Math.min((s.w-90)/bw,(s.h-90)/bh)));
  s.tx=s.w/2-((a+b)/2)*s.k;s.ty=s.h/2-((c+d)/2)*s.k;s.dirty=true;setZoomPct(Math.round(s.k*100));
 },[]);
 const kick=useCallback((a=1)=>{const s=st.current;if(s.sim)s.sim.alpha=Math.max(s.sim.alpha,a);s.dirty=true;if(!s.running&&!reduce())loop()},[]); // eslint-disable-line react-hooks/exhaustive-deps
 function reduce(){return typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches}

 function step(){
  const s=st.current,sim=s.sim,d=data.current;if(!sim)return;
  const n=sim.x.length,c=d.cfg,a=sim.alpha,rep=30+c.repel*420,L=28+c.dist*110,k=.01+c.strength*.12,g=.002+c.center*.03;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
   let dx=sim.x[j]!-sim.x[i]!,dy=sim.y[j]!-sim.y[i]!,q=dx*dx+dy*dy;if(q>160000)continue;if(q<.01){dx=(i-j)*.1;dy=.1;q=dx*dx+dy*dy}
   const dist=Math.sqrt(q),f=rep/dist*a,fx=dx/dist*f,fy=dy/dist*f;
   sim.vx[i]!-=fx;sim.vy[i]!-=fy;sim.vx[j]!+=fx;sim.vy[j]!+=fy;
   const min=radius(i)+radius(j)+6;if(dist<min){const p=(min-dist)*.25,px=dx/dist*p,py=dy/dist*p;sim.vx[i]!-=px;sim.vy[i]!-=py;sim.vx[j]!+=px;sim.vy[j]!+=py}
  }
  for(const e of d.links){const i=d.idx.get(e.s)!,j=d.idx.get(e.o)!,dx=sim.x[j]!-sim.x[i]!,dy=sim.y[j]!-sim.y[i]!,dist=Math.hypot(dx,dy)||1,f=(dist-L)*k*a,fx=dx/dist*f,fy=dy/dist*f;sim.vx[i]!+=fx;sim.vy[i]!+=fy;sim.vx[j]!-=fx;sim.vy[j]!-=fy}
  for(let i=0;i<n;i++){
   sim.vx[i]!-=sim.x[i]!*g;sim.vy[i]!-=sim.y[i]!*g;sim.vx[i]!*=.62;sim.vy[i]!*=.62;
   if(!sim.pin[i]){sim.x[i]!+=sim.vx[i]!;sim.y[i]!+=sim.vy[i]!}
  }
  sim.alpha*=.985;
 }
 function loop(){
  const s=st.current;s.running=true;
  const tick=()=>{
   const sim=s.sim;
   if(sim&&(sim.alpha>.02)&&cfgRef.current.animate){step();step();s.dirty=true}
   if(sim&&sim.alpha<=.03&&!s.refit&&!s.touched){s.refit=true;fit()}
   if(s.dirty){draw();s.dirty=false}
   if(sim&&sim.alpha>.02&&cfgRef.current.animate)s.raf=requestAnimationFrame(tick);else s.running=false;
  };
  cancelAnimationFrame(s.raf);s.raf=requestAnimationFrame(tick);
 }

 function draw(){
  const s=st.current,canvas=cv.current,sim=s.sim,d=data.current;if(!canvas||!sim)return;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  ctx.setTransform(s.dpr,0,0,s.dpr,0,0);ctx.clearRect(0,0,s.w,s.h);
  const focus=s.hover>=0?s.hover:(d.idx.get(d.selected)??-1),near=new Set<number>();
  if(focus>=0){near.add(focus);for(const e of d.links){const i=d.idx.get(e.s)!,j=d.idx.get(e.o)!;if(i===focus)near.add(j);if(j===focus)near.add(i)}}
  const hl=d.highlight&&d.highlight.size?d.highlight:null,hoverOn=s.hover>=0;
  const X=(i:number)=>sim.x[i]!*s.k+s.tx,Y=(i:number)=>sim.y[i]!*s.k+s.ty;
  // links
  for(const e of d.links){
   const i=d.idx.get(e.s)!,j=d.idx.get(e.o)!,on=focus>=0&&(i===focus||j===focus),dim=(hoverOn&&!on)||(hl&&!(hl.has(e.s)&&hl.has(e.o)));
   ctx.beginPath();ctx.moveTo(X(i),Y(i));ctx.lineTo(X(j),Y(j));
   const path=!!d.pathEdges?.has(e.id);
   ctx.strokeStyle=path?"#7DF0C8":on?"rgba(190,175,255,.95)":e.negated?"rgba(240,150,150,.5)":"rgba(150,160,185,.30)";
   if(dim&&!path)ctx.globalAlpha=.12;ctx.lineWidth=(path?3.4:on?1.8:.9)*d.cfg.link;ctx.setLineDash(e.negated?[6,4]:e.contextual?[1.5,4]:[]);ctx.stroke();ctx.globalAlpha=1;ctx.setLineDash([]);
   if(d.cfg.arrows&&!dim){const x1=X(i),y1=Y(i),x2=X(j),y2=Y(j),ang=Math.atan2(y2-y1,x2-x1),r=radius(j)*s.k+3;const ax=x2-Math.cos(ang)*r,ay=y2-Math.sin(ang)*r;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-Math.cos(ang-.45)*7,ay-Math.sin(ang-.45)*7);ctx.lineTo(ax-Math.cos(ang+.45)*7,ay-Math.sin(ang+.45)*7);ctx.closePath();ctx.fillStyle=ctx.strokeStyle as string;ctx.fill()}
  }
  // research gaps: amber dashed arcs with a marker; endpoints of the selected gap are ringed
  if(d.cfg.gaps)d.gaps.forEach((g,gi)=>{
   const i=d.idx.get(g.a)!,j=d.idx.get(g.b)!,x1=X(i),y1=Y(i),x2=X(j),y2=Y(j),mx=(x1+x2)/2-(y2-y1)*.12,my=(y1+y2)/2+(x2-x1)*.12,on=g.id===d.gapSel,hov=gi===d.hoverGap;
   ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(mx,my,x2,y2);ctx.strokeStyle=on?"#FFD58A":"rgba(242,180,90,.75)";ctx.lineWidth=(on?3:1.4)+g.score/70;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([]);
   if(on)for(const k of [i,j]){ctx.beginPath();ctx.arc(X(k),Y(k),Math.max(2.5,radius(k)*Math.sqrt(s.k))+7,0,7);ctx.strokeStyle="rgba(255,213,138,.9)";ctx.lineWidth=2;ctx.stroke()}
   ctx.beginPath();ctx.arc(mx,my,on||hov?12:9,0,7);ctx.fillStyle=on?"#FFD58A":"#F2B45A";ctx.fill();ctx.fillStyle="#1a1405";ctx.font="700 12px system-ui,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("?",mx,my+.5);
   if(hov||on){ctx.font="600 12px 'Host Grotesk Variable',system-ui,sans-serif";const t=`Research gap · triage ${g.score}`,w=ctx.measureText(t).width+14;ctx.fillStyle="rgba(14,17,24,.94)";ctx.fillRect(mx-w/2,my-34,w,20);ctx.fillStyle="#FFD58A";ctx.fillText(t,mx,my-24)}
  });
  // nodes
  const order=d.shown.map((_,i)=>i).sort((a,b)=>Number(near.has(a))-Number(near.has(b)));
  for(const i of order){
   const n=d.shown[i]!,dim=(hoverOn&&!near.has(i))||(hl&&!hl.has(n.id)),r=Math.max(2.5,radius(i)*Math.sqrt(s.k)),sel=n.id===d.selected;
   ctx.globalAlpha=dim?.18:1;
   if(hl?.has(n.id)){ctx.beginPath();ctx.arc(X(i),Y(i),r+6,0,7);ctx.fillStyle="rgba(255,255,255,.14)";ctx.fill()}
   ctx.beginPath();ctx.arc(X(i),Y(i),r,0,7);ctx.fillStyle=d.colour.get(d.groupOf(n))??"#9AA5B8";ctx.fill();
   if(sel||i===s.hover){ctx.lineWidth=2.4;ctx.strokeStyle="#ffffff";ctx.stroke()}
   if(d.picked.includes(n.id)){ctx.globalAlpha=1;ctx.beginPath();ctx.arc(X(i),Y(i),r+5,0,7);ctx.strokeStyle="#7DF0C8";ctx.lineWidth=2.4;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([])}
   ctx.globalAlpha=1;
  }
  if(s.box){const [a,b,c,e]=s.box;ctx.fillStyle="rgba(125,240,200,.10)";ctx.strokeStyle="rgba(125,240,200,.9)";ctx.lineWidth=1.2;ctx.fillRect(a,b,c-a,e-b);ctx.strokeRect(a,b,c-a,e-b)}
  // labels, greedy collision avoidance, most important first
  const fade=Math.min(1,Math.max(0,(s.k+d.cfg.text*1.4-1.2)/.7));
  ctx.font="600 12px 'Host Grotesk Variable',system-ui,sans-serif";ctx.textAlign="center";ctx.textBaseline="top";ctx.lineJoin="round";
  const placed:[number,number,number,number][]=[];
  const pri=d.shown.map((n,i)=>({i,p:(n.id===d.selected?1e6:0)+(i===s.hover?1e6:0)+(near.has(i)?1e4:0)+(hl?.has(n.id)?5e3:0)+(d.deg.get(n.id)??0)}))
   .sort((a,b)=>b.p-a.p);
  for(const {i,p} of pri){
   const forced=p>=1e4,alpha=forced?1:Math.min(1,fade+Math.min(.5,(d.deg.get(d.shown[i]!.id)??0)*.05));
   if(alpha<.08||(hoverOn&&!near.has(i)))continue;
   const label=d.shown[i]!.label.length>34?d.shown[i]!.label.slice(0,33)+"…":d.shown[i]!.label,w=ctx.measureText(label).width+6,x=X(i),y=Y(i)+Math.max(2.5,radius(i)*Math.sqrt(s.k))+4;
   if(x<-60||x>s.w+60||y<-20||y>s.h+20)continue;
   const box:[number,number,number,number]=[x-w/2,y,x+w/2,y+16];
   if(!forced&&placed.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]))continue;
   placed.push(box);ctx.globalAlpha=alpha;ctx.lineWidth=4;ctx.strokeStyle="rgba(14,17,24,.92)";ctx.strokeText(label,x,y);ctx.fillStyle=p>=1e6?"#ffffff":"#dfe6f3";ctx.fillText(label,x,y);ctx.globalAlpha=1;
  }
 }

 // (re)build the simulation when the visible graph changes
 useEffect(()=>{
  const s=st.current,n=shown.length;
  const prev=s.sim,old=new Map<string,[number,number]>();
  if(prev)for(const [id,i] of idxPrev.current)if(i<prev.x.length)old.set(id,[prev.x[i]!,prev.y[i]!]);
  const sim:Sim={x:new Float64Array(n),y:new Float64Array(n),vx:new Float64Array(n),vy:new Float64Array(n),pin:new Uint8Array(n),alpha:1};
  const ring=new Map<string,number>();
  shown.forEach((nd,i)=>{
   const o=old.get(nd.id);if(o){sim.x[i]=o[0];sim.y[i]=o[1];return}
   const g=nd.domain||nd.kind,gi=ring.get(g)??(ring.set(g,ring.size),ring.size-1),a=((hash(g)%360)+(hash(nd.id)%40))*Math.PI/180,rr=90+(hash(nd.id)%140)+gi*6;
   sim.x[i]=Math.cos(a)*rr;sim.y[i]=Math.sin(a)*rr;
  });
  s.sim=sim;s.refit=false;idxPrev.current=idx;
  if(reduce()||!cfgRef.current.animate){for(let t=0;t<260;t++)step();sim.alpha=0}
  if(s.fitFor!==sig){s.fitFor=sig;if(!reduce()&&cfgRef.current.animate){for(let t=0;t<60;t++)step()}fit()}
  s.dirty=true;if(!reduce()&&cfgRef.current.animate)loop();else draw();
  return()=>cancelAnimationFrame(s.raf);
 },[sig]); // eslint-disable-line react-hooks/exhaustive-deps
 const idxPrev=useRef(idx);

 useEffect(()=>{st.current.dirty=true;draw()},[selected,highlight,cfg.size,cfg.link,cfg.text,cfg.arrows,cfg.groupBy,hidden]); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(()=>{st.current.dirty=true;draw()},[gapSel,gapsShown,cfg.gaps,picked,pathEdges]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{
  const s=st.current,sim=s.sim;if(!focusTick||!focusIds?.length||!sim)return;
  const pts=focusIds.map(id=>idx.get(id)).filter((i):i is number=>i!==undefined).map(i=>[sim.x[i]!,sim.y[i]!]);if(!pts.length)return;
  const xs=pts.map(p=>p[0]!),ys=pts.map(p=>p[1]!),a=Math.min(...xs),b=Math.max(...xs),c=Math.min(...ys),d=Math.max(...ys);
  const nk=Math.max(.4,Math.min(2.4,Math.min((s.w-260)/Math.max(80,b-a),(s.h-200)/Math.max(80,d-c)))),ntx=s.w/2-((a+b)/2)*nk,nty=s.h/2-((c+d)/2)*nk,k0=s.k,x0=s.tx,y0=s.ty,t0=performance.now();s.touched=true;
  const go=(t:number)=>{const u=Math.min(1,(t-t0)/380),e=1-Math.pow(1-u,3);s.k=k0+(nk-k0)*e;s.tx=x0+(ntx-x0)*e;s.ty=y0+(nty-y0)*e;s.dirty=true;draw();if(u<1)requestAnimationFrame(go);else setZoomPct(Math.round(s.k*100))};
  if(reduce()){s.k=nk;s.tx=ntx;s.ty=nty;draw();setZoomPct(Math.round(nk*100))}else requestAnimationFrame(go);
 },[focusTick]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{kick(.5)},[cfg.center,cfg.repel,cfg.strength,cfg.dist]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(!cfg.animate||paused){cancelAnimationFrame(st.current.raf);st.current.running=false}else kick(.3)},[cfg.animate,paused]); // eslint-disable-line react-hooks/exhaustive-deps

 // size, pixel ratio and wheel zoom
 useEffect(()=>{
  const el=wrap.current,canvas=cv.current;if(!el||!canvas)return;
  const size=()=>{const s=st.current,r=el.getBoundingClientRect();s.w=Math.max(280,r.width);s.h=r.height;if(!s.touched&&s.sim)fit();s.dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(s.w*s.dpr);canvas.height=Math.round(s.h*s.dpr);s.dirty=true;draw()};
  size();const ro=new ResizeObserver(size);ro.observe(el);
  const wheel=(e:WheelEvent)=>{e.preventDefault();zoomAt(e.clientX-canvas.getBoundingClientRect().left,e.clientY-canvas.getBoundingClientRect().top,e.deltaY<0?1.12:1/1.12)};
  canvas.addEventListener("wheel",wheel,{passive:false});
  return()=>{ro.disconnect();canvas.removeEventListener("wheel",wheel)};
 },[]); // eslint-disable-line react-hooks/exhaustive-deps
 function zoomAt(px:number,py:number,f:number){const s=st.current;s.touched=true;const nk=Math.max(.15,Math.min(4,s.k*f)),r=nk/s.k;s.tx=px-(px-s.tx)*r;s.ty=py-(py-s.ty)*r;s.k=nk;s.dirty=true;setZoomPct(Math.round(nk*100));draw()}

 function pick(px:number,py:number){
  const s=st.current,sim=s.sim;if(!sim)return -1;let best=-1,bd=1e9;
  for(let i=0;i<sim.x.length;i++){const dx=sim.x[i]!*s.k+s.tx-px,dy=sim.y[i]!*s.k+s.ty-py,d=Math.hypot(dx,dy),r=Math.max(2.5,radius(i)*Math.sqrt(s.k))+5;if(d<r&&d<bd){bd=d;best=i}}
  return best;
 }
 function pickEdge(px:number,py:number){
  const s=st.current,sim=s.sim,d=data.current;if(!sim)return null;
  for(const e of d.links){const i=d.idx.get(e.s)!,j=d.idx.get(e.o)!,x1=sim.x[i]!*s.k+s.tx,y1=sim.y[i]!*s.k+s.ty,x2=sim.x[j]!*s.k+s.tx,y2=sim.y[j]!*s.k+s.ty,l2=(x2-x1)**2+(y2-y1)**2||1,t=Math.max(0,Math.min(1,((px-x1)*(x2-x1)+(py-y1)*(y2-y1))/l2));if(Math.hypot(px-(x1+t*(x2-x1)),py-(y1+t*(y2-y1)))<5)return e.id}
  return null;
 }
 function pickGap(px:number,py:number){
  const s=st.current,sim=s.sim,d=data.current;if(!sim||!d.cfg.gaps)return -1;
  for(let gi=0;gi<d.gaps.length;gi++){const g=d.gaps[gi]!,i=d.idx.get(g.a)!,j=d.idx.get(g.b)!,x1=sim.x[i]!*s.k+s.tx,y1=sim.y[i]!*s.k+s.ty,x2=sim.x[j]!*s.k+s.tx,y2=sim.y[j]!*s.k+s.ty,mx=(x1+x2)/2-(y2-y1)*.12,my=(y1+y2)/2+(x2-x1)*.12;if(Math.hypot(px-mx,py-my)<14)return gi}
  return -1;
 }
 const local=(e:React.PointerEvent)=>{const r=cv.current!.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
 function down(e:React.PointerEvent<HTMLCanvasElement>){
  if(e.button!==0)return;const p=local(e),gi=pickGap(p.x,p.y),i=gi>=0?-1:pick(p.x,p.y),s=st.current;
  if(gi>=0){onGap?.(data.current.gaps[gi]!.id);return}
  const multi=e.shiftKey||e.ctrlKey||e.metaKey;
  s.drag={mode:i>=0?"node":multi?"box":"pan",i,sx:p.x,sy:p.y,tx:s.tx,ty:s.ty,moved:false,multi};e.currentTarget.setPointerCapture(e.pointerId);
 }
 function move(e:React.PointerEvent<HTMLCanvasElement>){
  const s=st.current,p=local(e),dr=s.drag,sim=s.sim;
  if(!dr){const gi=pickGap(p.x,p.y),i=gi>=0?-1:pick(p.x,p.y);if(i!==s.hover||gi!==data.current.hoverGap){s.hover=i;data.current.hoverGap=gi;cv.current!.style.cursor=i>=0||gi>=0?"pointer":"grab";s.dirty=true;if(!s.running)draw()}return}
  if(Math.hypot(p.x-dr.sx,p.y-dr.sy)>4)dr.moved=true;
  if(dr.mode==="node"&&sim&&dr.moved){sim.x[dr.i]=(p.x-s.tx)/s.k;sim.y[dr.i]=(p.y-s.ty)/s.k;sim.pin[dr.i]=1;sim.vx[dr.i]=0;sim.vy[dr.i]=0;kick(.35);s.dirty=true;if(!s.running)draw()}
  else if(dr.mode==="box"){s.box=[Math.min(dr.sx,p.x),Math.min(dr.sy,p.y),Math.max(dr.sx,p.x),Math.max(dr.sy,p.y)];s.dirty=true;draw()}
  else if(dr.mode==="pan"){s.touched=true;s.tx=dr.tx+(p.x-dr.sx);s.ty=dr.ty+(p.y-dr.sy);s.dirty=true;draw()}
 }
 function up(e:React.PointerEvent<HTMLCanvasElement>){
  const s=st.current,dr=s.drag,p=local(e);s.drag=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(!dr)return;
  if(dr.mode==="box"){const b=s.box;s.box=null;s.dirty=true;if(b&&dr.moved&&s.sim){const ids=data.current.shown.filter((_,i)=>{const x=s.sim!.x[i]!*s.k+s.tx,y=s.sim!.y[i]!*s.k+s.ty;return x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]}).map(n=>n.id);onPick?.([...new Set([...data.current.picked,...ids])])}draw();return}
  if(dr.mode==="node"){if(s.sim)s.sim.pin[dr.i]=0;if(!dr.moved){const id=data.current.shown[dr.i]!.id;if(dr.multi){const cur=data.current.picked;onPick?.(cur.includes(id)?cur.filter(x=>x!==id):[...cur,id])}else onSelect(id)}}
  else if(!dr.moved){const ed=pickEdge(p.x,p.y);if(ed)onSelectEdge(ed)}
 }
 function key(e:React.KeyboardEvent<HTMLCanvasElement>){
  const s=st.current,d:Record<string,[number,number]>={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};
  if(d[e.key]){e.preventDefault();s.touched=true;s.tx+=d[e.key]![0];s.ty+=d[e.key]![1];s.dirty=true;draw();setMsg(`View offset ${Math.round(s.tx)}, ${Math.round(s.ty)}`)}
  else if(e.key==="+"||e.key==="="){e.preventDefault();zoomAt(s.w/2,s.h/2,1.25)}
  else if(e.key==="-"){e.preventDefault();zoomAt(s.w/2,s.h/2,.8)}
  else if(e.key==="0"){e.preventDefault();s.touched=false;fit()}
 }
 const exportPng=()=>{const c=cv.current;if(!c)return;draw();c.toBlob(b=>{if(!b){setMsg("The image could not be produced.");return}const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=exportName+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);setMsg("PNG prepared · candidate network, unreviewed")})};
 const set=<K extends keyof Settings>(k:K,v:Settings[K])=>setCfg(c=>({...c,[k]:v}));
 const slider=(k:"text"|"size"|"link"|"center"|"repel"|"strength"|"dist",label:string,min:number,max:number,step:number)=>(
  <label className="og-row" key={k}><span>{label}</span><input type="range" min={min} max={max} step={step} value={cfg[k]} onChange={e=>set(k,Number(e.target.value))} aria-label={label}/></label>);
 if(nodes.length>MAX_NODES)return <p role="status">This view supports up to {MAX_NODES} concepts. Narrow the filters to draw it; use the relationship list to inspect connections.</p>;
 return (
  <div className={"og-wrap"+(showcase?" og-showcase":"")}><div className="og" ref={wrap}>
   <canvas ref={cv} role="group" tabIndex={0} aria-label="Interactive graph of biological entities" aria-description={`${shown.length} concepts and ${links.length} recorded relationships. Drag a concept to move it, drag the background to pan, scroll to zoom, arrow keys pan, plus and minus zoom. Shift-click a concept or shift-drag the background to select several. Every concept is also in the concept list.`} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={()=>{const s=st.current;if(!s.drag&&s.hover>=0){s.hover=-1;s.dirty=true;draw()}}} onDoubleClick={fit}/>
   <ul className="og-sr" aria-label="Concepts in the graph">{shown.map((n,i)=><li key={n.id}><button type="button" data-graph-node={n.id} aria-pressed={n.id===selected} onFocus={()=>{st.current.hover=i;st.current.dirty=true;draw()}} onBlur={()=>{st.current.hover=-1;st.current.dirty=true;draw()}} onClick={()=>onSelect(n.id)}>Select {n.label}</button></li>)}</ul>
   <div className="og-tools" role="group" aria-label="Graph view controls">
    <button type="button" aria-label="Zoom in graph" onClick={()=>{const s=st.current;zoomAt(s.w/2,s.h/2,1.25)}}>+</button>
    <button type="button" aria-label="Zoom out graph" onClick={()=>{const s=st.current;zoomAt(s.w/2,s.h/2,.8)}}>−</button>
    <button type="button" onClick={()=>{st.current.touched=false;fit()}}>Fit network</button>
    {!showcase&&<><button type="button" aria-pressed={paused||!cfg.animate} onClick={()=>setPaused(p=>!p)}>{paused?"Resume":"Freeze"}</button>
    <button type="button" aria-expanded={panel} onClick={()=>setPanel(p=>!p)}>Display</button>
    <button type="button" onClick={exportPng}>PNG</button></>}
    <span data-testid="graph-zoom-pct">{zoomPct}%</span>
   </div>
   {panel&&!showcase&&<div className="og-panel" role="group" aria-label="Display and forces">
    <h3>Display</h3>
    <label className="og-row"><span>Colour by</span><select value={cfg.groupBy} onChange={e=>{setHidden([]);set("groupBy",e.target.value as GroupBy)}} aria-label="Colour concepts by"><option value="domain">Department</option><option value="kind">Concept type</option><option value="model">Evidence model</option></select></label>
    {slider("text","Labels appear",0,1,.05)}{slider("size","Node size",.5,2.2,.05)}{slider("link","Link thickness",.4,3,.05)}
    <label className="og-row og-check"><input type="checkbox" checked={cfg.arrows} onChange={e=>set("arrows",e.target.checked)}/> Arrows</label>
    <label className="og-row og-check"><input type="checkbox" checked={cfg.gaps} onChange={e=>set("gaps",e.target.checked)}/> Research gap markers</label>
    <label className="og-row og-check"><input type="checkbox" checked={cfg.animate} onChange={e=>set("animate",e.target.checked)}/> Animate</label>
    <h3>Forces</h3>
    {slider("center","Centre force",0,1,.05)}{slider("repel","Repel force",0,1,.05)}{slider("strength","Link force",0,1,.05)}{slider("dist","Link distance",0,1,.05)}
    <button type="button" className="og-reset" onClick={()=>{setCfg(DEFAULTS);setHidden([])}}>Restore defaults</button>
   </div>}
   {!showcase&&<ul className="og-legend" aria-label="Groups. Select to hide or show">{groups.map(([g,n])=><li key={g}><button type="button" aria-pressed={!hidden.includes(g)} onClick={()=>setHidden(h=>h.includes(g)?h.filter(x=>x!==g):[...h,g])}><i style={{background:colour.get(g)}} aria-hidden="true"/>{pretty(g)} <span>{n}</span></button></li>)}
    {hidden.map(g=>!groups.some(([x])=>x===g)?<li key={g}><button type="button" aria-pressed="false" onClick={()=>setHidden(h=>h.filter(x=>x!==g))}>{pretty(g)} (hidden)</button></li>:null)}</ul>}
  </div>
   <p className="og-cap" role="status">{caption}{msg?` · ${msg}`:""}</p>
  </div>
 );
}
