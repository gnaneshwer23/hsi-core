import {useId, useState} from "react";
import "../../styles/relationship-diagram.css";

const LENSES = [
 {id:"source",label:"Evidence",title:"Which study supports this relationship?",fields:["Publication and version","Passage or source locator","Source-use status"],note:"A citation identifies a source. It does not establish that the claim is supported."},
 {id:"context",label:"Context",title:"Under which experimental conditions?",fields:["Species, tissue and cell state","Model, dose and timing","Assay, population and endpoint"],note:"Missing fields stay visible. Different experimental contexts may explain different findings."},
 {id:"review",label:"Review",title:"What has actually been checked?",fields:["Extracted claim or hypothesis","Verification and uncertainty","Human decision and version"],note:"The published graph contains unreviewed candidates. Scientific approval is a separate human decision."},
] as const;

/** Explanatory schema, never presented as a biological finding or live agent run. */
export function RelationshipDiagram(){
 const [lens,setLens]=useState(0); const uid=useId(); const active=LENSES[lens]!;
 return <figure className="relationship-diagram" aria-labelledby={`${uid}-caption`}>
  <figcaption id={`${uid}-caption`}>Inside a graph relationship</figcaption>
  <div className="relationship-layout">
   <div className="relationship-drawing">
    <svg viewBox="0 0 600 310" role="img" aria-label="Two biological entities connected by a candidate relationship, linked to evidence, experimental context and review">
     <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M135 110H465" className="relationship-edge"/>
      <path d="M300 110V220M300 220H105M300 220H495"/>
      <path d="m450 104 10 6-10 6"/>
     </g>
     <circle cx="105" cy="110" r="31" className="relationship-entity"/>
     <circle cx="495" cy="110" r="31" className="relationship-entity"/>
     <circle cx="300" cy="110" r="7" className="relationship-junction"/>
     <text x="105" y="54" textAnchor="middle">Entity</text><text x="495" y="54" textAnchor="middle">Entity</text>
     <text x="300" y="87" textAnchor="middle">Candidate relationship</text>
     {LENSES.map((item,i)=><g key={item.id} className={i===lens?"relationship-branch is-selected":"relationship-branch"}>
      <circle cx={105+i*195} cy="220" r="7"/>
      <text x={105+i*195} y="259" textAnchor="middle">{item.label}</text>
     </g>)}
    </svg>
    <p>Structure illustration · select a lens to inspect</p>
   </div>
   <div className="relationship-inspector">
    <div className="relationship-lenses" role="group" aria-label="Relationship lenses">
     {LENSES.map((item,i)=><button key={item.id} type="button" aria-pressed={i===lens} onClick={()=>setLens(i)}>{item.label}</button>)}
    </div>
    <div aria-live="polite" aria-atomic="true">
     <h3>{active.title}</h3>
     <ul>{active.fields.map(field=><li key={field}>{field}</li>)}</ul>
     <p>{active.note}</p>
    </div>
   </div>
  </div>
 </figure>;
}
