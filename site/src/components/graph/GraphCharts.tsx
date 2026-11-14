import {useGraphSnapshot} from "../home/useGraphSnapshot";
import {departments} from "../../lib/departments";

const clip=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+"…":s;
const R=150,CX=380,CY=222;

/** A real neighbourhood of the published snapshot, drawn as a static diagram with a text list of the same connections. Layout is schematic, not biology. */
export function NeighbourhoodDiagram(){
  const {snapshot:s,failed}=useGraphSnapshot();
  if(!s)return <p className="kg-wait">{failed?"Snapshot unavailable. No substitute figures are shown.":"Verifying snapshot…"}</p>;
  const n=s.network,others=n.nodes.filter(x=>x.id!==n.center);
  const pos=new Map<string,{x:number;y:number;r:number}>([[n.center,{x:CX,y:CY,r:40}]]);
  others.forEach((x,i)=>{const a=(-90+360*i/others.length)*Math.PI/180;pos.set(x.id,{x:CX+R*Math.cos(a),y:CY+R*Math.sin(a),r:28})});
  const name=(id:string)=>n.nodes.find(x=>x.id===id)?.name??id;
  return (
    <div className="kg-net">
      <svg viewBox="0 0 760 444" role="img" aria-labelledby="kg-net-t kg-net-d">
        <title id="kg-net-t">A neighbourhood of the published knowledge graph</title>
        <desc id="kg-net-d">{`${n.nodes.length} concepts and ${n.edges.length} recorded relationships around ${name(n.center)}. Solid lines are recorded relationships; dashed lines are findings recorded as negated. The same connections are listed in text beside the diagram.`}</desc>
        <defs>
          <marker id="kg-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className="kg-arrow"/></marker>
        </defs>
        {n.edges.map(e=>{
          const a=pos.get(e.s),b=pos.get(e.o);if(!a||!b)return null;
          const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
          return <line key={e.id} className={"kg-line"+(e.negated?" kg-neg":"")} x1={a.x+ux*(a.r+2)} y1={a.y+uy*(a.r+2)} x2={b.x-ux*(b.r+6)} y2={b.y-uy*(b.r+6)} markerEnd="url(#kg-arr)"/>;
        })}
        {n.nodes.map(x=>{
          const p=pos.get(x.id)!,center=x.id===n.center;
          const ang=Math.atan2(p.y-CY,p.x-CX),c=Math.cos(ang),sn=Math.sin(ang);
          const lx=center?p.x:p.x+(p.r+10)*c,ly=center?p.y+6:p.y+(p.r+10)*sn+5;
          const anchor=center?"middle":c>0.3?"start":c<-0.3?"end":"middle";
          return (
            <g key={x.id}>
              <circle className={"kg-nd"+(center?" kg-nd-c":"")} cx={p.x} cy={p.y} r={p.r}/>
              <text className={"kg-nl"+(center?" kg-nl-c":"")} x={lx} y={ly} textAnchor={anchor}>{clip(x.name,center?12:24)}</text>
            </g>
          );
        })}
      </svg>
      <div className="kg-net-key">
        <ul className="kg-legend" aria-label="Key">
          <li><i className="kg-k-solid" aria-hidden="true"/>Recorded relationship. The arrow shows direction as annotated.</li>
          <li><i className="kg-k-dash" aria-hidden="true"/>Recorded as negated: a finding that does not support the relationship.</li>
          <li><i className="kg-k-node" aria-hidden="true"/>The concept at the centre.</li>
        </ul>
        <h3>Connections shown</h3>
        <ul className="kg-conn">
          {n.edges.slice(0,10).map(e=><li key={e.id}>{name(e.s)} <span>{e.negated?"does not ":""}{e.predicate}</span> {name(e.o)}{e.negated?" (negated)":""}</li>)}
        </ul>
      </div>
    </div>
  );
}

/** Concepts per department and the most common relationship types, as plain bars. */
export function ChartsPair(){
  const {snapshot:s,failed}=useGraphSnapshot();
  const max=Math.max(...departments.map(d=>d.graphConcepts),1);
  const pmax=s?Math.max(...s.predicates.map(p=>p[1]),1):1;
  return (
    <div className="kg-charts">
      <div>
        <h3>Concepts by department</h3>
        <ul className="kg-bars">
          {departments.map(d=>(
            <li key={d.slug}><span className="kg-bl">{d.name}</span><span className="kg-bar" aria-hidden="true"><i style={{width:`${(d.graphConcepts/max)*100}%`}}/></span><span className="kg-bv">{d.graphConcepts>0?d.graphConcepts:"none yet"}</span></li>
          ))}
        </ul>
        <p className="kg-chart-note">Tagged concepts in the published snapshot. Coverage is unequal, and two departments have none yet.</p>
      </div>
      <div>
        <h3>Most common relationship types</h3>
        {s?(<><ul className="kg-bars">
          {s.predicates.map(([k,v])=>(
            <li key={k}><span className="kg-bl">{k}</span><span className="kg-bar" aria-hidden="true"><i style={{width:`${(v/pmax)*100}%`}}/></span><span className="kg-bv">{v}</span></li>
          ))}
        </ul><p className="kg-chart-note">Names are the vocabulary of the snapshot's annotations. {s.negated} recorded relationships are negated.</p></>):<p className="kg-wait">{failed?"Snapshot unavailable.":"Verifying snapshot…"}</p>}
      </div>
    </div>
  );
}
