import {useState} from "react";
import {useSearchParams,Link} from "react-router-dom";
import {SCIENCE_GRAPH,getGraphNeighbourhood,graphClaims,graphSourceDetails} from "../features/science/knowledgeGraph";
import "../styles/science-body.css";
import {GraphVisual} from "../features/science/GraphVisual";
import "../styles/science-graph.css";
export function ScienceGraph(){
 const [params,setParams]=useSearchParams();
 const [query,setQuery]=useState("");
 const [depth,setDepth]=useState(1);
 const selected=SCIENCE_GRAPH.nodes.find(n=>n.id===params.get("node"))??SCIENCE_GRAPH.nodes[0]!;
 const graph=getGraphNeighbourhood(selected.id,depth);
 const nodes=graph.nodes.filter(n=>n.label.toLowerCase().includes(query.toLowerCase()));
 const choose=(id:string)=>setParams({node:id});
 return <div className="science-body science-graph"><header className="science-body-hero"><div className="science-body-wrap"><p className="science-body-kicker">HSI SCIENCE / GRAPH EXPLORER</p><h1>Connected biology.<br/><em>Visible evidence.</em></h1><p>Explore draft biological associations and their provenance. This is not a validated mechanistic graph.</p><div className="science-body-actions"><Link to="/science/body">Body Explorer</Link><Link to="/science/disease">Disease mechanisms</Link></div></div></header><section className="science-body-wrap science-graph-content"><h2>Scientific knowledge graph</h2><p>{SCIENCE_GRAPH.nodes.length} entities · {SCIENCE_GRAPH.edges.length} draft connections · version {SCIENCE_GRAPH.version}</p><div className="science-graph-controls"><label>Search<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Depth<select value={depth} onChange={e=>setDepth(Number(e.target.value))}><option value={1}>1 hop</option><option value={2}>2 hops</option><option value={3}>3 hops</option></select></label><button type="button" onClick={()=>{setQuery("");setDepth(1);choose("pancreas")}}>Reset</button></div><div className="science-graph-layout"><div><GraphVisual graph={{...graph,nodes,edges:graph.edges.filter(e=>nodes.some(n=>n.id===e.subjectId)&&nodes.some(n=>n.id===e.objectId))}} selected={selected.id} onSelect={choose}/><div className="science-graph-nodes" role="group" aria-label="Choose graph entity">{nodes.map(n=><button type="button" key={n.id} aria-pressed={selected.id===n.id} onClick={()=>choose(n.id)}><strong>{n.label}</strong><small>{n.kind} · {n.system}</small></button>)}</div><h3>Draft graph connections</h3>{graph.edges.map(e=><p key={e.id} className="science-graph-edge">{e.subjectId} — {e.predicate} — {e.objectId}</p>)}</div><aside className="science-graph-detail"><p className="science-body-kicker">{selected.kind.toUpperCase()} / {selected.reviewState}</p><h2>{selected.label}</h2><p>{selected.description}</p><h3>Claim provenance</h3>{graphClaims(selected.id).map(c=><p key={c.id}>{c.id} · {c.reviewState} · {c.evidenceScope}</p>)}{graphSourceDetails(selected.id).map(s=><a key={s.id} href={s.url} target="_blank" rel="noreferrer">{s.title}</a>)}<p>Background sources do not validate individual graph relationships.</p></aside></div></section></div>;
}
