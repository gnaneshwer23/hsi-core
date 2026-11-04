import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/science-body.css";

type System = "all" | "endocrine" | "cardiovascular" | "digestive" | "immune" | "nervous" | "respiratory" | "urinary";
type Organ = { id: string; name: string; system: Exclude<System,"all">; x: number; y: number; description: string; connections: string[]; next: string; source: string };
const ORGANS: Organ[] = [
 {id:"brain",name:"Brain",system:"nervous",x:150,y:57,description:"Coordinates neural signalling, sensory processing and physiological regulation through connected neural and endocrine pathways.",connections:["heart","pancreas"],next:"Neurons and neuroendocrine signalling",source:"https://www.ncbi.nlm.nih.gov/books/NBK10799/"},
 {id:"lungs",name:"Lungs",system:"respiratory",x:184,y:143,description:"Exchange oxygen and carbon dioxide through the alveoli and pulmonary circulation.",connections:["heart"],next:"Alveoli and gas exchange",source:"https://openstax.org/books/anatomy-and-physiology-2e/pages/22-introduction"},
 {id:"heart",name:"Heart",system:"cardiovascular",x:137,y:158,description:"Pumps blood through the pulmonary and systemic circulation, supporting oxygen and nutrient delivery.",connections:["lungs","kidneys"],next:"Cardiac muscle and circulation",source:"https://openstax.org/books/anatomy-and-physiology-2e/pages/19-introduction"},
 {id:"liver",name:"Liver",system:"digestive",x:116,y:218,description:"Processes nutrients, stores glycogen and helps regulate circulating glucose and lipids.",connections:["pancreas","intestine"],next:"Hepatocytes and glucose metabolism",source:"https://openstax.org/books/anatomy-and-physiology-2e/pages/23-introduction"},
 {id:"pancreas",name:"Pancreas",system:"endocrine",x:168,y:244,description:"Its endocrine islets release insulin, glucagon and other hormones. Exocrine tissue produces digestive enzymes.",connections:["liver","intestine","muscle","adipose"],next:"Islets → beta cells → insulin secretion",source:"https://www.ncbi.nlm.nih.gov/books/NBK279144/"},
 {id:"kidneys",name:"Kidneys",system:"urinary",x:196,y:267,description:"Filter blood, regulate fluid and electrolyte balance, and contribute to blood pressure and endocrine control.",connections:["heart"],next:"Nephrons and filtration",source:"https://openstax.org/books/anatomy-and-physiology-2e/pages/25-introduction"},
 {id:"intestine",name:"Intestine",system:"digestive",x:150,y:321,description:"Absorbs nutrients and interfaces with microbial communities, epithelial barriers and mucosal immunity.",connections:["liver","pancreas","spleen"],next:"Intestinal epithelium and microbiome",source:"https://openstax.org/books/anatomy-and-physiology-2e/pages/23-introduction"},
 {id:"spleen",name:"Spleen",system:"immune",x:205,y:225,description:"Filters blood and contributes to immune surveillance and responses to blood-borne antigens.",connections:["intestine"],next:"Immune cells and splenic tissue",source:"https://www.ncbi.nlm.nih.gov/books/NBK10757/"},
 {id:"muscle",name:"Skeletal muscle",system:"endocrine",x:91,y:369,description:"Supports movement and is a major site of insulin-stimulated glucose disposal.",connections:["pancreas"],next:"Myocytes and glucose transport",source:"https://www.ncbi.nlm.nih.gov/books/NBK279144/"},
 {id:"adipose",name:"Adipose tissue",system:"endocrine",x:209,y:365,description:"Stores energy and releases signals that interact with metabolic and immune regulation.",connections:["pancreas"],next:"Adipocytes and endocrine signalling",source:"https://www.ncbi.nlm.nih.gov/books/NBK279144/"}
];
const SYSTEMS: {id:System;label:string}[] = [{id:"all",label:"All systems"},{id:"endocrine",label:"Endocrine / metabolic"},{id:"cardiovascular",label:"Cardiovascular"},{id:"digestive",label:"Digestive"},{id:"immune",label:"Immune"},{id:"nervous",label:"Nervous"},{id:"respiratory",label:"Respiratory"},{id:"urinary",label:"Urinary"}];

export function ScienceBody() {
 const [selected,setSelected]=useState("pancreas");
 const [system,setSystem]=useState<System>("all");
 const [query,setQuery]=useState("");
 const organ=ORGANS.find(o=>o.id===selected) ?? ORGANS[4]!;
 const filtered=useMemo(()=>ORGANS.filter(o=>(system==="all"||o.system===system)&&o.name.toLowerCase().includes(query.toLowerCase().trim())),[system,query]);
 const visible=new Set(filtered.map(o=>o.id));
 const select=(id:string)=>{setSelected(id);};
 return <main className="science-body">
  <header className="science-body-hero"><div className="science-body-wrap">
   <p className="science-body-kicker">HSI SCIENCE / EXPERIENCE 01</p>
   <h1>Explore the human body.<br/><em>Follow the connections.</em></h1>
   <p>Discover how organs, tissues and biological systems work together. Select an organ to reveal its function, related systems and a path into deeper biology.</p>
   <div className="science-body-actions"><a href="#body-explorer">Explore anatomy ↓</a><Link to="/science">Back to Science ↗</Link></div>
   <small>Interactive anatomical schematic for education; positions are illustrative, not anatomically precise. No patient data or clinical assessment.</small>
  </div></header>
  <section id="body-explorer" className="science-body-wrap science-body-workspace" aria-labelledby="body-explorer-heading">
   <div className="science-body-section-heading"><div><p className="science-body-kicker">01 / HUMAN BODY EXPLORER</p><h2 id="body-explorer-heading">One body. Connected systems.</h2></div><p>Choose a system, search for an organ, or select a point on the anatomical schematic.</p></div>
   <div className="science-body-filters"><label htmlFor="science-body-system">Biological system<select id="science-body-system" value={system} onChange={e=>setSystem(e.target.value as System)}>{SYSTEMS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label htmlFor="science-body-search">Find an organ<input id="science-body-search" type="search" placeholder="e.g. pancreas" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
   <div className="science-body-grid">
    <div className="science-body-diagram"><div className="science-body-diagram-head"><strong>ANATOMICAL OVERVIEW</strong><span>Illustrative · front view</span></div>
     <svg viewBox="0 0 300 465" role="img" aria-label="Simplified human outline with selectable organ locations; an accessible organ list follows.">
      <defs><linearGradient id="body-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dcece6"/><stop offset="1" stopColor="#9cc9bd"/></linearGradient></defs>
      <path d="M150 18 C122 18 118 44 128 67 L133 83 123 98 94 105 67 136 46 227 60 239 84 171 95 149 100 260 115 293 112 435 135 441 150 318 165 441 188 435 185 293 200 260 205 149 216 171 240 239 254 227 233 136 206 105 177 98 167 83 172 67 C182 44 178 18 150 18Z" fill="url(#body-fill)" stroke="#17645f" strokeWidth="2" opacity=".75"/>
      <path d="M150 94 V298 M108 187 Q150 211 192 187 M110 277 Q150 290 190 277" stroke="#17645f" strokeOpacity=".22" strokeDasharray="4 6" fill="none"/>
      {ORGANS.map(o=><g key={o.id} opacity={visible.has(o.id)?1:.18}><circle cx={o.x} cy={o.y} r={selected===o.id?14:10} fill={selected===o.id?"#ff6845":"#17645f"} stroke="#fffaf4" strokeWidth="3"/><circle cx={o.x} cy={o.y} r="3" fill="white"/></g>)}
     </svg>
     <p>Use the searchable list to select an organ. Markers are orientation cues, not medical imaging.</p>
    </div>
    <div className="science-body-organ-list"><h3>Organs and tissues <span>{filtered.length}</span></h3><div role="group" aria-label="Choose an organ">{filtered.map(o=><button key={o.id} type="button" aria-pressed={selected===o.id} className={selected===o.id?"is-selected":""} onClick={()=>select(o.id)}><span><strong>{o.name}</strong><small>{SYSTEMS.find(s=>s.id===o.system)?.label}</small></span><span aria-hidden="true">↗</span></button>)}{filtered.length===0&&<p>No matching organs. Try another search or system.</p>}</div></div>
    <article className="science-body-detail" aria-live="polite"><p className="science-body-kicker">SELECTED ORGAN / {organ.system.toUpperCase()}</p><h2>{organ.name}</h2><p>{organ.description}</p><h3>Connected biology</h3><div className="science-body-chips">{organ.connections.map(id=><button type="button" key={id} onClick={()=>{setSystem("all");setQuery("");select(id);}}>{ORGANS.find(o=>o.id===id)?.name} ↗</button>)}</div><h3>Explore next</h3><p>{organ.next}</p><a href={organ.source} target="_blank" rel="noreferrer">Read background reference ↗</a><div className="science-body-context"><strong>Next in Science 2.0</strong><p>Biology Zoom will connect this organ to reviewed tissues, cells, molecules and pathways. This is a planned next phase, not a live deep-zoom feature.</p></div></article>
   </div>
  </section>
  <section className="science-body-outro"><div className="science-body-wrap"><p className="science-body-kicker">SCIENCE 2.0 / CONNECTED LEARNING</p><h2>From anatomy to mechanisms.</h2><p>Human Body Explorer is the entry point. The next phases will connect organ selection to biological zoom, evidence-aware relationships and disease mechanisms.</p><Link to="/science">Continue exploring Science ↗</Link></div></section>
 </main>;
}
