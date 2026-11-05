/** Research-only SSc graph visualisation. No inferred edges or automatic approval. */
export type SscVisualNode={id:string;preferredLabel:string;kind:string};
export type SscVisualEdge={id:string;subjectId:string;objectId:string;reviewState:string;epistemicType:string};
export function SscGraphVisual({nodes,edges,selected,onSelect}:{nodes:readonly SscVisualNode[];edges:readonly SscVisualEdge[];selected:string|null;onSelect:(id:string)=>void}){
 const visible=nodes.slice(0,60);
 const points=new Map(visible.map((n,i)=>[n.id,{x:350+260*Math.cos(2*Math.PI*i/Math.max(visible.length,1)),y:240+175*Math.sin(2*Math.PI*i/Math.max(visible.length,1))}]));
 return <div><svg viewBox="0 0 700 490" style={{width:"100%",maxHeight:550,background:"#f6f9fa",borderRadius:14}} role="group" aria-label="Interactive systemic sclerosis candidate relationship graph">
 <title>Unreviewed systemic sclerosis research graph</title>
 {edges.filter(e=>points.has(e.subjectId)&&points.has(e.objectId)).map(e=>{const a=points.get(e.subjectId)!,b=points.get(e.objectId)!;return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.reviewState==="approved"?"#23775f":"#a2aab4"} strokeDasharray={e.reviewState==="approved"?undefined:"5 5"} strokeWidth={selected&&(e.subjectId===selected||e.objectId===selected)?3:1.5}><title>{e.epistemicType} · {e.reviewState}</title></line>})}
 {visible.map(n=>{const p=points.get(n.id)!;return <g key={n.id} role="button" tabIndex={0} aria-pressed={selected===n.id} aria-label={"Select "+n.preferredLabel} onClick={()=>onSelect(n.id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(n.id)}}}><circle cx={p.x} cy={p.y} r={selected===n.id?22:17} fill={selected===n.id?"#df694c":"#175f66"} stroke="#fff" strokeWidth="3"/><text x={p.x} y={p.y+30} fontSize="11" textAnchor="middle" fill="#243d43">{n.preferredLabel.length>24?n.preferredLabel.slice(0,21)+"…":n.preferredLabel}</text></g>})}
 </svg><p style={{fontSize:13}}>Dashed edges indicate candidate research relationships. Select a node to inspect its sources and limitations. {nodes.length>60?"Showing the first 60 nodes for readability.":""}</p></div>;
}
