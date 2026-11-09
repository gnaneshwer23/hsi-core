import type {GraphDataset} from './knowledgeGraph';
export type ExplorerFilters={query:string;kind:string;domain:string;review:string;evidence:string};
/** Filter both endpoints before rendering links. Empty evidence slices are not evidence of absence. */
export function filterExplorerGraph(graph:GraphDataset,filters:ExplorerFilters,statuses:ReadonlyMap<string,string>):GraphDataset{
 const query=filters.query.trim().toLowerCase();
 let nodes=graph.nodes.filter(n=>(!query||[n.label,n.id,n.description].some(t=>t.toLowerCase().includes(query)))&&(filters.kind==='all'||n.kind===filters.kind)&&(filters.domain==='all'||n.system===filters.domain)&&(filters.review==='all'||n.reviewState===filters.review));
 const ids=new Set(nodes.map(n=>n.id));
 const edges=graph.edges.filter(e=>ids.has(e.subjectId)&&ids.has(e.objectId)&&(filters.evidence==='all'||statuses.get(e.id)===filters.evidence));
 if(filters.evidence!=='all'){const linked=new Set(edges.flatMap(e=>[e.subjectId,e.objectId]));nodes=nodes.filter(n=>linked.has(n.id))}
 return {...graph,nodes,edges};
}
export const GRAPH_KIND_COLOURS:Record<string,string>={organ:'#62c6c0',tissue:'#d4b376',cell:'#a4a1ee',molecule:'#f197ab',pathway:'#86c69d',process:'#91b5e5',disease:'#ef9d69'};
function hash(s:string){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
/** Bounded deterministic force layout: visual proximity never asserts a scientific relationship. */
export function forceGraphPositions(graph:{nodes:readonly {id:string;kind:string;system?:string}[];edges:readonly {subjectId:string;objectId:string}[]}):Map<string,{x:number;y:number}>{
 if(graph.nodes.length>500)throw Error('Graph view exceeds local layout budget');
 const domains=[...new Set(graph.nodes.map(n=>n.system??n.kind))].sort();
 const crowded=graph.nodes.length>40;
 const points=graph.nodes.map(n=>{const a=domains.indexOf(n.system??n.kind)/Math.max(1,domains.length)*Math.PI*2;return {id:n.id,x:450+(crowded?290:210)*Math.cos(a)+(hash(n.id)%151)-75,y:310+(crowded?230:170)*Math.sin(a)+(hash(n.id+'y')%151)-75,vx:0,vy:0}});
 const byId=new Map(points.map(p=>[p.id,p]));
 // Crowded canvases need more separation so wrapped labels around a selection stay readable.
 const minSep=crowded?190:80,repulse=crowded?4800:1900,idealEdge=crowded?138:85;
 for(let tick=0;tick<(crowded?220:180);tick++){
  const cooling=1-tick/(crowded?240:200);
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i]!,b=points[j]!;const dx=a.x-b.x||.1,dy=a.y-b.y||.1,d2=Math.max(minSep,dx*dx+dy*dy),f=Math.min(4.2,repulse/d2)*cooling,d=Math.sqrt(d2);a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f}
  for(const e of graph.edges){const a=byId.get(e.subjectId),b=byId.get(e.objectId);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-idealEdge)*.01*cooling;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f}
  for(const p of points){p.vx=(p.vx+(450-p.x)*.0014)*.72;p.vy=(p.vy+(310-p.y)*.0014)*.72;p.x=Math.max(40,Math.min(860,p.x+p.vx));p.y=Math.max(40,Math.min(590,p.y+p.vy))}
 }
 if(!points.length)return new Map();
 const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
 const scale=Math.min(720/Math.max(1,maxX-minX),450/Math.max(1,maxY-minY));
 return new Map(points.map(p=>[p.id,{x:450+(p.x-(minX+maxX)/2)*scale,y:310+(p.y-(minY+maxY)/2)*scale}]));
}
