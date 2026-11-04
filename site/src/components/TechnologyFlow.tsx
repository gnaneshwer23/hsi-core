import { useState } from "react";
import "./TechnologyFlow.css";

const stages = [
  { title: "Data sources", subtitle: "Authorised & governed", rows: [{name:"Akeno Health",description:"EHR · diagnostics · imaging · medications"},{name:"Aksh Health",description:"Symptoms · wearables · metabolic health"},{name:"Immune Super Intelligence",description:"Cells · pathways · omics · mechanisms"}] },
  { title: "Knowledge building", subtitle: "Harmonise · link · contextualise", rows: [{name:"Ingest & harmonise",description:"Multimodal, rights-cleared inputs"},{name:"Validate & protect",description:"Identity · permissions · provenance"},{name:"Living knowledge layers",description:"Patient · biology · gut–immune · evidence"}] },
  { title: "HSI NEXUS", subtitle: "Connected intelligence", rows: [{name:"Context Engine",description:"Longitudinal understanding"},{name:"Biology Engine",description:"Cells, tissues, pathways"},{name:"Evidence Engine",description:"Research and source tracing"},{name:"Reasoning Engine",description:"Gaps and hypotheses"},{name:"Discovery Engine",description:"Targets and in-silico models"},{name:"Governance Engine",description:"Permissions and human review"}] },
  { title: "Intelligence outputs", subtitle: "Reviewable research directions", rows: [{name:"Patient & disease matching",description:"Cohorts and phenotype comparisons"},{name:"Clinical trial intelligence",description:"Criteria and investigator pre-screening"},{name:"In-silico drug discovery",description:"Target and compound hypotheses"},{name:"Precision medicine research",description:"Mechanisms and biomarkers"},{name:"Research insights",description:"Contradictions and knowledge gaps"}] },
  { title: "Potential impact", subtitle: "Health · research · therapy", rows: [{name:"Personalised care",description:"Better contextual understanding"},{name:"Faster research",description:"Traceable evidence synthesis"},{name:"Therapeutic candidates",description:"Prioritised for further validation"},{name:"Inclusive trials",description:"Better-informed screening"},{name:"Safer treatments",description:"Through independent evaluation"}] },
] as const;
export function TechnologyFlow() {
  const [selected,setSelected] = useState<number|null>(null);
  return <div className="tf">
    <div className="tf-heading"><p className="tf-eyebrow">THE HSI TECHNOLOGY ARCHITECTURE / CONCEPTUAL FLOW</p><h2>From data to <em>discovery.</em></h2><p>How governed healthcare, patient and biological knowledge could become evidence-grounded intelligence and research opportunities.</p></div>
    <div className="tf-motion" aria-hidden="true">
      <span className="tf-motion-label">PERMISSIONED DATA</span>
      <svg viewBox="0 0 1000 90" preserveAspectRatio="none" focusable="false">
        {Array.from({length:9},(_,i)=><path key={i} className="tf-motion-wave" d={`M 0 ${30+i*3} C 110 ${-2+i*3}, 160 ${72+i*2}, 250 ${40+i*2} S 400 ${10+i*2}, 500 ${40+i*2} S 650 ${70+i*2}, 750 ${40+i*2} S 900 ${10+i*2}, 1000 ${40+i*2}`} />)}
        <path className="tf-motion-path" d="M 0 43 C 110 11, 160 83, 250 53 S 400 23, 500 53 S 650 83, 750 53 S 900 23, 1000 53" />
        <circle className="tf-motion-particle" r="5"><animateMotion dur="8s" repeatCount="indefinite" path="M 0 43 C 110 11, 160 83, 250 53 S 400 23, 500 53 S 650 83, 750 53 S 900 23, 1000 53" /></circle>
        <circle className="tf-motion-particle tf-motion-particle-alt" r="3"><animateMotion dur="8s" begin="-4s" repeatCount="indefinite" path="M 0 43 C 110 11, 160 83, 250 53 S 400 23, 500 53 S 650 83, 750 53 S 900 23, 1000 53" /></circle>
      </svg>
      <span className="tf-motion-label">REVIEWABLE INSIGHTS</span>
    </div>
    <div className="tf-flow" aria-label="Five stages from governed data sources to potential research and care impact">
      {stages.map((stage,i)=><div className={"tf-stage "+(i===2?"tf-stage-core":"")+(selected===i?" tf-stage-active":"")} key={stage.title}>
        <button type="button" className="tf-stage-heading" aria-pressed={selected===i} onClick={()=>setSelected(selected===i?null:i)}><span className="tf-stage-number">{i+1}</span><span><strong>{stage.title}</strong><small>{stage.subtitle}</small></span></button>
        <div className="tf-stage-items">{stage.rows.map((row,j)=><div className="tf-stage-item" key={row.name}><span className="tf-item-index">{String(j+1).padStart(2,"0")}</span><div><strong>{row.name}</strong><small>{row.description}</small></div></div>)}</div>
        {i<4&&<span className="tf-stage-arrow" aria-hidden="true"><span className="tf-arrow-beam" /><span className="tf-arrow-pulse" />→</span>}
      </div>)}
    </div>
    {selected!==null&&<div className="tf-selected" aria-live="polite"><strong>{String(selected+1).padStart(2,"0")} / {stages[selected].title}</strong><span>{selected===0?"Data remains under the source system's authorisation and access controls.":selected===1?"Logical knowledge layers do not require copying all data into one database.":selected===2?"The six functions are a target architecture, not a claim of live automated processing.":selected===3?"Matching, trials and computational outputs require validation and professional review.":"Potential benefits are research ambitions, not established clinical outcomes."}</span><button type="button" onClick={()=>setSelected(null)} aria-label="Close stage explanation">×</button></div>}
    <div className="tf-trust"><strong>GOVERNANCE & TRUST</strong><span>Privacy & permissions</span><span>Provenance & traceability</span><span>Human scientific review</span><span>Uncertainty & limitations</span><span>Evidence updates</span></div>
    <p className="tf-disclaimer">Illustrative future-facing architecture. No claim of live patient integrations, confirmed trial eligibility, validated drug discovery or clinical efficacy.</p>
  </div>;
}
