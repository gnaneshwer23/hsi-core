import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import type {DomainBundle,DomainEdge} from "../../../../src/knowledgeGraph/domainGraph";
import type {ProgramView} from "../../lib/program";

const W=800,H=520,CX=400,CY=260,RX=[0,225,320,375],RY=[0,145,205,238],MAX_NODES=26;
const TONES=["mint","lav","peach","sky"] as const;
const hash=(s:string)=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const toneOf=(d?:string)=>d?TONES[hash(d)%4]:"none";
const HUMAN=/^human/;
type P={id:string;name:string;kind:string;domain:string;hop:number;deg:number;x:number;y:number;r:number;anchor:boolean};
const wrap=(s:string,n=17):string[]=>{
 const out:string[]=[];let line="";
 for(const w of s.split(" ")){if((line+" "+w).trim().length>n&&line){out.push(line);line=w}else line=(line+" "+w).trim()}
 if(line)out.push(line);
 return out.length>2?[out[0]!,out.slice(1).join(" ").slice(0,n-1)+"…"]:out;
};

/** Deterministic relaxation: labels push each other apart, linked concepts attract, every node is pulled back to its ring so the structure stays readable. */
function relax(nodes:P[],edges:DomainEdge[]){
 const home=new Map(nodes.map(n=>[n.id,{x:n.x,y:n.y}])),idx=new Map(nodes.map((n,i)=>[n.id,i]));
 for(let it=0;it<420;it++){
  const fx=nodes.map(()=>0),fy=nodes.map(()=>0),cool=1-it/480;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i]!,b=nodes[j]!,dx=b.x-a.x,dy=b.y-a.y,rx=a.anchor||b.anchor?100:84,ry=a.anchor||b.anchor?70:58;
   const d=Math.hypot(dx/rx,dy/ry);
   if(d<1){const k=(1-d)*70,l=Math.hypot(dx,dy)||1;fx[i]!-=dx/l*k;fy[i]!-=dy/l*k;fx[j]!+=dx/l*k;fy[j]!+=dy/l*k}
  }
  for(const e of edges){
   const i=idx.get(e.subjectId)!,j=idx.get(e.objectId)!,a=nodes[i]!,b=nodes[j]!,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,k=(l-170)*0.0012;
   fx[i]!+=dx/l*k;fy[i]!+=dy/l*k;fx[j]!-=dx/l*k;fy[j]!-=dy/l*k;
  }
  nodes.forEach((n,i)=>{
   const h=home.get(n.id)!,g=n.anchor?0.12:0.012;
   fx[i]!+=(h.x-n.x)*g;fy[i]!+=(h.y-n.y)*g;
   n.x=Math.min(Math.max(n.x+fx[i]!*cool,60),W-60);n.y=Math.min(Math.max(n.y+fy[i]!*cool,40),H-62);
  });
 }
}
function layout(b:DomainBundle,v:ProgramView){
 const byId=new Map(b.nodes.map(n=>[n.id,n])),deg=new Map<string,number>();
 for(const e of v.edges){deg.set(e.subjectId,(deg.get(e.subjectId)??0)+1);deg.set(e.objectId,(deg.get(e.objectId)??0)+1)}
 const anchorIds=v.anchors.map(a=>a.id),keep=new Set(anchorIds);
 const rest=[...v.hop].filter(([id])=>!keep.has(id)).sort((a,c)=>(a[1]-c[1])||((deg.get(c[0])??0)-(deg.get(a[0])??0)));
 for(const [id] of rest){if(keep.size>=MAX_NODES)break;keep.add(id)}
 const nodes:P[]=[];
 anchorIds.forEach((id,i)=>{
  const n=byId.get(id)!,a=anchorIds.length===1?0:-90+360*i/anchorIds.length,off=anchorIds.length===1?0:anchorIds.length===2?58:52;
  const ax=anchorIds.length===2?(i===0?-1:1)*off:off*Math.cos(a*Math.PI/180),ay=anchorIds.length===2?0:off*Math.sin(a*Math.PI/180);
  nodes.push({id,name:n.name,kind:n.kind,domain:n.domains[0]??"",hop:0,deg:deg.get(id)??0,x:CX+ax,y:CY+ay,r:34,anchor:true});
 });
 const anchorIdx=(id:string)=>{const e=v.edges.find(x=>(x.subjectId===id&&anchorIds.includes(x.objectId))||(x.objectId===id&&anchorIds.includes(x.subjectId)));const o=e?(e.subjectId===id?e.objectId:e.subjectId):"";return Math.max(0,anchorIds.indexOf(o))};
 for(const h of [1,2,3]){
  const ring=[...keep].filter(id=>v.hop.get(id)===h&&!anchorIds.includes(id)).sort((a,c)=>anchorIdx(a)-anchorIdx(c)||(byId.get(a)!.name.localeCompare(byId.get(c)!.name)));
  ring.forEach((id,i)=>{
   const n=byId.get(id)!,a=(-90+360*(i+0.5)/ring.length)*Math.PI/180,d=deg.get(id)??0;
   nodes.push({id,name:n.name,kind:n.kind,domain:n.domains[0]??"",hop:h,deg:d,x:CX+RX[h]!*Math.cos(a),y:CY+RY[h]!*Math.sin(a),r:Math.min(20,10+d*2),anchor:false});
  });
 }
 const edges=v.edges.filter(e=>keep.has(e.subjectId)&&keep.has(e.objectId)).slice(0,90);
 relax(nodes,edges);
 return {nodes,edges,total:v.hop.size};
}

/** The researcher's own neighbourhood: anchors at the centre, rings by distance, colour by department, thickness by evidence. Layout is schematic, not biology. */
export function ProgramGraph({bundle,view}:{bundle:DomainBundle;view:ProgramView}){
 const {nodes,edges,total}=useMemo(()=>layout(bundle,view),[bundle,view]);
 const [sel,setSel]=useState<string|null>(null),[hov,setHov]=useState<string|null>(null),[z,setZ]=useState<1|1.6|2.4>(1);
 const pos=new Map(nodes.map(n=>[n.id,n])),name=(id:string)=>pos.get(id)?.name??bundle.nodes.find(n=>n.id===id)?.name??id;
 const cur=sel??view.anchors[0]?.id??null,active=hov??sel;
 const touching=(id:string|null)=>id?view.edges.filter(e=>e.subjectId===id||e.objectId===id):[];
 const list=touching(cur),node=cur?bundle.nodes.find(n=>n.id===cur):null;
 const domains=[...new Set(nodes.map(n=>n.domain).filter(Boolean))].slice(0,5);
 const vw=W/z,vh=H/z,focus=sel?pos.get(sel):null,fx=focus?.x??CX,fy=focus?.y??CY;
 const vx=Math.min(Math.max(fx-vw/2,0),W-vw),vy=Math.min(Math.max(fy-vh/2,0),H-vh);
 const rel=(e:DomainEdge)=>!!active&&(e.subjectId===active||e.objectId===active);
 return (
  <div className="pg2">
   <div className="pg2-stage">
    <div className="pg2-tools" role="group" aria-label="Zoom">
     {([1,1.6,2.4] as const).map(k=><button key={k} type="button" aria-pressed={z===k} onClick={()=>setZ(k)}>{k===1?"Fit":`${k}×`}</button>)}
     {sel&&<button type="button" onClick={()=>setSel(null)}>Clear selection</button>}
    </div>
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} role="group" aria-label={`Your knowledge graph: ${nodes.length} of ${total} concepts and ${edges.length} recorded relationships. Select a concept to inspect it; the same connections are listed beside the graph.`}>
     <defs><marker id="pg2-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" className="pg2-arrow"/></marker></defs>
     {[1,2,3].filter(h=>nodes.some(n=>n.hop===h)).map(h=><ellipse key={h} className="pg2-ring" cx={CX} cy={CY} rx={RX[h]} ry={RY[h]}/>)}
     {edges.map(e=>{
      const a=pos.get(e.subjectId)!,b=pos.get(e.objectId)!,on=rel(e),dim=!!active&&!on,human=HUMAN.test(e.model);
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
      return <line key={e.id} className="pg2-edge" data-human={human} data-neg={e.negated} data-on={on} data-dim={dim} x1={a.x+ux*a.r} y1={a.y+uy*a.r} x2={b.x-ux*(b.r+4)} y2={b.y-uy*(b.r+4)} markerEnd={on?"url(#pg2-arr)":undefined}/>;
     })}
     {nodes.map(n=>{
      const lines=wrap(n.name,n.anchor?15:16),on=n.id===active||(!!active&&edges.some(e=>(e.subjectId===active&&e.objectId===n.id)||(e.objectId===active&&e.subjectId===n.id)));
      return (
       <g key={n.id} className="pg2-node" role="button" tabIndex={0} aria-pressed={sel===n.id} aria-label={`${n.name}, ${n.kind}, ${n.deg} recorded relationship${n.deg===1?"":"s"}. Select to inspect.`} data-tone={n.anchor?"anchor":toneOf(n.domain)} data-dim={!!active&&!on} data-active={n.id===active||n.id===sel} onClick={()=>setSel(s=>s===n.id?null:n.id)} onMouseEnter={()=>setHov(n.id)} onMouseLeave={()=>setHov(null)} onFocus={()=>setHov(n.id)} onBlur={()=>setHov(null)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSel(s=>s===n.id?null:n.id)}if(e.key==="Escape")setSel(null)}}>
        <circle cx={n.x} cy={n.y} r={Math.max(n.r,22)} className="pg2-hit"/>
        <circle cx={n.x} cy={n.y} r={n.r} className="pg2-dot"/>
        <text className="pg2-label" x={n.x} y={n.y+n.r+17} textAnchor="middle" data-anchor={n.anchor}>{lines.map((l,i)=><tspan key={i} x={n.x} dy={i?16:0}>{l}</tspan>)}</text>
       </g>
      );
     })}
    </svg>
    <ul className="pg2-chips" aria-label="Concepts in the graph">{[...nodes].sort((a,b)=>a.hop-b.hop||b.deg-a.deg).slice(0,14).map(n=><li key={n.id}><button type="button" aria-pressed={sel===n.id} onClick={()=>setSel(s=>s===n.id?null:n.id)}>{n.name}</button></li>)}</ul>
    <ul className="pg2-key" aria-label="Key">
     <li><i className="pg2-k-human" aria-hidden="true"/>Human evidence</li>
     <li><i className="pg2-k-other" aria-hidden="true"/>Other models</li>
     <li><i className="pg2-k-neg" aria-hidden="true"/>Reported not to hold</li>
     {domains.map(d=><li key={d}><i className="pg2-k-dot" data-tone={toneOf(d)} aria-hidden="true"/>{d}</li>)}
    </ul>
   </div>
   <aside className="pg2-side" aria-label="Selected concept" aria-live="polite">
    <h3>{node?.name??"Select a concept"}</h3>
    {node&&<p className="pg2-meta">{node.kind} · {node.domains.join(", ")||"no department"} · {list.length} relationship{list.length===1?"":"s"} in your area</p>}
    <ul className="pg2-rels">{list.slice(0,8).map(e=>(
     <li key={e.id}><span>{name(e.subjectId)} <em>{e.negated?"does not ":""}{e.predicate.replaceAll("_"," ")}</em> {name(e.objectId)}</span><small>{e.model.replaceAll("_"," ")} · {e.sourceId??"no source"} · unreviewed</small></li>))}</ul>
    {list.length>8&&<p className="pg2-meta">And {list.length-8} more in the full graph.</p>}
    {node&&<Link className="rh-ghost" to={"/research/knowledge-graph?netQuery="+encodeURIComponent(node.name)}>Open in the full graph</Link>}
    <p className="pg2-meta">Showing the {nodes.length} best-connected of {total} concepts. Candidates, none reviewed.</p>
   </aside>
  </div>
 );
}
