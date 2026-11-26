/**
 * LEA-04C: a deterministic force-directed layout for bounded graph slices. Same input, same output, so a view is
 * reproducible and testable. Fine for a few hundred concepts; a worker or a different engine is a measured future decision.
 */
export type LayoutNode={id:string;group:string};
export type LayoutEdge={s:string;o:string};
export type LayoutOptions={seed?:number;iterations?:number;anchors?:Readonly<Record<string,readonly [number,number]>>;groupPull?:number};

function rng(seed:number){let s=seed>>>0||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};

/** Positions in [0.06, 0.94] on both axes. Concepts of one group are drawn towards their group's anchor. */
export function layoutGraph(nodes:readonly LayoutNode[],edges:readonly LayoutEdge[],opts:LayoutOptions={}):Map<string,[number,number]>{
 const n=nodes.length,out=new Map<string,[number,number]>();
 if(!n)return out;
 if(n===1){out.set(nodes[0]!.id,[0.5,0.5]);return out}
 const iterations=opts.iterations??160,pull=opts.groupPull??0.9;
 const ids=[...nodes].sort((a,b)=>a.id<b.id?-1:1);
 const idx=new Map(ids.map((x,i)=>[x.id,i]));
 const groups=[...new Set(ids.map(x=>x.group))].sort();
 const anchor=new Map<string,[number,number]>();
 groups.forEach((g,i)=>{const a=opts.anchors?.[g];if(a)anchor.set(g,[a[0],a[1]]);else{const t=(i/groups.length)*Math.PI*2;anchor.set(g,[0.5+0.28*Math.cos(t),0.5+0.28*Math.sin(t)])}});
 const r=rng((opts.seed??7)^hash(ids.map(x=>x.id).join("|")));
 const x=new Float64Array(n),y=new Float64Array(n);
 ids.forEach((nd,i)=>{const a=anchor.get(nd.group)!;x[i]=a[0]+(r()-.5)*0.2;y[i]=a[1]+(r()-.5)*0.2});
 const pairs=edges.map(e=>[idx.get(e.s),idx.get(e.o)] as const).filter((p):p is readonly [number,number]=>p[0]!==undefined&&p[1]!==undefined&&p[0]!==p[1]);
 const k=Math.sqrt(1/n)*0.9;
 let temp=0.12;
 const dx=new Float64Array(n),dy=new Float64Array(n);
 for(let it=0;it<iterations;it++){
  dx.fill(0);dy.fill(0);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
   let ex=x[i]!-x[j]!,ey=y[i]!-y[j]!,d2=ex*ex+ey*ey;
   if(d2<1e-9){ex=(r()-.5)*1e-3;ey=(r()-.5)*1e-3;d2=ex*ex+ey*ey}
   const d=Math.sqrt(d2),f=(k*k)/d,fx=(ex/d)*f,fy=(ey/d)*f;
   dx[i]=dx[i]!+fx;dy[i]=dy[i]!+fy;dx[j]=dx[j]!-fx;dy[j]=dy[j]!-fy;
  }
  for(const [a,b] of pairs){
   const ex=x[a]!-x[b]!,ey=y[a]!-y[b]!,d=Math.sqrt(ex*ex+ey*ey)||1e-6,f=(d*d)/k,fx=(ex/d)*f,fy=(ey/d)*f;
   dx[a]=dx[a]!-fx;dy[a]=dy[a]!-fy;dx[b]=dx[b]!+fx;dy[b]=dy[b]!+fy;
  }
  for(let i=0;i<n;i++){
   const a=anchor.get(ids[i]!.group)!;dx[i]=dx[i]!+(a[0]-x[i]!)*pull*0.35;dy[i]=dy[i]!+(a[1]-y[i]!)*pull*0.35;
   const mag=Math.sqrt(dx[i]!*dx[i]!+dy[i]!*dy[i]!)||1e-9,lim=Math.min(mag,temp);
   x[i]=x[i]!+(dx[i]!/mag)*lim;y[i]=y[i]!+(dy[i]!/mag)*lim;
  }
  temp*=0.97;
 }
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(let i=0;i<n;i++){minX=Math.min(minX,x[i]!);maxX=Math.max(maxX,x[i]!);minY=Math.min(minY,y[i]!);maxY=Math.max(maxY,y[i]!)}
 const sx=maxX-minX||1,sy=maxY-minY||1;
 ids.forEach((nd,i)=>out.set(nd.id,[0.06+((x[i]!-minX)/sx)*0.88,0.06+((y[i]!-minY)/sy)*0.88]));
 return out;
}
