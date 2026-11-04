import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BIOLOGY_ENTITIES, BIOLOGY_RELATIONS, SCIENCE_SOURCES, SYSTEM_OPTIONS, getEntity, type SystemId } from "../features/science/biologyCatalogue";
import { Link } from "react-router-dom";
import "../styles/science-body.css";
import { AnatomyModel } from "../features/science/AnatomyModel";

export function ScienceBody() {
 const [params,setParams]=useSearchParams();
 const selected=getEntity(params.get("organ") ?? "")?.id ?? "pancreas";
 const [depth,setDepth]=useState(0);
 const [system,setSystem]=useState<SystemId>("all");
 const [query,setQuery]=useState("");
 const organ=getEntity(selected) ?? BIOLOGY_ENTITIES[4]!;
 const source=SCIENCE_SOURCES.find(s=>s.id===organ.sourceRefs[0]);
 const connections=BIOLOGY_RELATIONS.filter(r=>r.subjectId===organ.id).map(r=>getEntity(r.objectId)).filter((e):e is NonNullable<typeof e>=>Boolean(e));
 const filtered=useMemo(()=>BIOLOGY_ENTITIES.filter(o=>(system==="all"||o.system===system)&&o.preferredLabel.toLowerCase().includes(query.toLowerCase().trim())),[system,query]);
 const visible=new Set(filtered.map(o=>o.id));
 const select=(id:string)=>{setParams({organ:id});setDepth(0);};
 return <main className="science-body">
  <header className="science-body-hero"><div className="science-body-wrap">
   <p className="science-body-kicker">HSI SCIENCE / EXPERIENCE 01</p>
   <h1>Explore the human body.<br/><em>Follow the connections.</em></h1>
   <p>Discover how organs, tissues and biological systems work together. Select an organ to reveal its function, related systems and a path into deeper biology.</p>
   <div className="science-body-actions"><a href="#body-explorer">Explore anatomy ↓</a><Link to="/science">Back to Science ↗</Link></div>
   <small>Interactive anatomical schematic for education; positions are illustrative, not anatomically precise. No patient data or clinical assessment.</small>
  </div></header>
  <section id="body-explorer" className="science-body-wrap science-body-workspace" aria-labelledby="body-explorer-heading">
   <div className="science-body-section-heading"><div><p className="science-body-kicker">01 / HUMAN BODY EXPLORER</p><h2 id="body-explorer-heading">One body. Connected systems.</h2></div><p>Choose a system, search for an organ, or select a marker on the anatomical schematic.</p></div>
   <div className="science-body-filters"><label htmlFor="science-body-system">Biological system<select id="science-body-system" value={system} onChange={e=>setSystem(e.target.value as SystemId)}>{SYSTEM_OPTIONS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label htmlFor="science-body-search">Find an organ<input id="science-body-search" type="search" placeholder="e.g. pancreas" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
   <div className="science-body-grid">
    <div className="science-body-diagram"><div className="science-body-diagram-head"><strong>ANATOMICAL OVERVIEW</strong><span>Procedural spatial model · 2D fallback</span></div>
     <AnatomyModel selected={selected} visible={visible} onSelect={select}/>
     
    </div>
    <div className="science-body-organ-list"><h3>Organs and tissues <span>{filtered.length}</span></h3><div role="group" aria-label="Choose an organ">{filtered.map(o=><button key={o.id} type="button" aria-pressed={selected===o.id} className={selected===o.id?"is-selected":""} onClick={()=>select(o.id)}><span><strong>{o.preferredLabel}</strong><small>{SYSTEM_OPTIONS.find(s=>s.id===o.system)?.label}</small></span><span aria-hidden="true">↗</span></button>)}{filtered.length===0&&<p>No matching organs. Try another search or system.</p>}</div></div>
    <article className="science-body-detail" aria-live="polite"><p className="science-body-kicker">SELECTED ORGAN / {(organ.system ?? "other").toUpperCase()}</p><h2>{organ.preferredLabel}</h2><p>{organ.definition}</p><h3>Related biology topics</h3><p className="science-body-review">Curated navigation links; relationships are not independently evidence-graded.</p><div className="science-body-chips">{connections.map(o=><button type="button" key={o.id} onClick={()=>{setSystem("all");setQuery("");select(o.id);}}>{o.preferredLabel} ↗</button>)}</div><p className="science-body-review">Content version {organ.version} · Editorial review pending · General background source, not claim-level verification.</p><h3>Explore next</h3><p>{organ.next}</p><Link to={`/science/zoom?organ=${["pancreas","heart","intestine"].includes(organ.id)?organ.id:"pancreas"}`}>Open Biology Zoom ↗</Link><a href={source?.url ?? "#"} target="_blank" rel="noreferrer">{source?.title ?? "Reference unavailable"} ↗</a>{organ.id==="pancreas"&&<div className="science-body-pancreas"><h3>Pancreas learning pathway</h3><div className="science-body-chips">{["Pancreas","Islet","Beta cell","Insulin secretion"].map((label,i)=><button key={label} type="button" aria-pressed={depth===i} onClick={()=>setDepth(i)}>{label}</button>)}</div><p>{["The pancreas contains endocrine islets and exocrine tissue.","Pancreatic islets contain several endocrine cell types, including alpha and beta cells.","Beta cells detect metabolic changes and secrete insulin through regulated cellular processes.","Glucose metabolism, membrane electrical activity and calcium entry participate in regulated insulin granule release."][depth]}</p><small>Educational overview · draft content awaiting scientific review. Not a molecular simulation or live graph.</small></div>}<div className="science-body-context"><strong>Next in Science 2.0</strong><p>Explore the available curated Biology Zoom pathway and Connections Explorer. Content is educational and remains in editorial review; no live approved knowledge graph is asserted.</p></div></article>
   </div>
  </section>
  <section className="science-body-outro"><div className="science-body-wrap"><p className="science-body-kicker">SCIENCE 2.0 / CONNECTED LEARNING</p><h2>From anatomy to mechanisms.</h2><p>Human Body Explorer is the entry point. Continue into the available Biology Zoom and Connections Explorer experiences. Evidence review and scientifically validated anatomical assets remain ongoing work.</p><div className="science-body-actions"><Link to="/science/zoom?organ=pancreas">Biology Zoom ↗</Link><Link to="/science/connections">Connections Explorer ↗</Link><Link to="/science">Science overview ↗</Link></div></div></section>
 </main>;
}
