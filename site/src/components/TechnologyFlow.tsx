import { useState } from "react";
import "./TechnologyFlow.css";

const stages = [
  { title: "Data sources", subtitle: "Authorised & governed", rows: [
    {name:"Authorised care systems",description:"Healthcare systems & clinical context",details:["EHR encounters, diagnoses & procedures","Laboratory results, diagnostics & imaging","Medications, prescriptions & treatment outcomes","FHIR / HL7 / LIS / DICOM interfaces"]},
    {name:"Aksh Health",description:"Longitudinal patient intelligence",details:["Symptoms, history & patient-reported outcomes","Wearables, glucose & cardiometabolic trends","Medication adherence, lifestyle & follow-ups","Personalised journeys and care coordination"]},
    {name:"Immune Super Intelligence",description:"Biological & research intelligence",details:["Immune cells, tissues, pathways & mechanisms","Genomics, proteomics & other multi-omics","Microbiome, metabolites & host responses","Disease evidence, biomarkers & publications"]},
  ] },
  { title: "Knowledge building", subtitle: "Harmonise · link · contextualise", rows: [
    {name:"Ingest & harmonise",description:"Prepare permitted multimodal information",details:["Connect approved clinical and research sources","Normalise FHIR, lab, omics & terminology","Check data quality, timestamps & lineage","Preserve source-specific access controls"]},
    {name:"Validate & protect",description:"Establish trusted, lawful context",details:["Verify identity, permissions & purpose","Apply minimisation and de-identification where appropriate","Resolve records without unsafe assumptions","Record provenance, versions & audit trails"]},
    {name:"Living knowledge layers",description:"Connect meaning across governed graphs",details:["Patient context: encounters → outcomes","Human biology: organs → cells → pathways","Gut–immune–metabolic relationships","Biomedical evidence, uncertainty & hypotheses"]},
  ] },
  { title: "HSI NEXUS", subtitle: "Connected intelligence", rows: [{name:"Context Engine",description:"Longitudinal understanding",details:["Longitudinal clinical timelines","Source-specific permissions","Missing information and contradictions"]},{name:"Biology Engine",description:"Cells, tissues, pathways",details:["Organs, tissues, cells and pathways","Biomarker-to-phenotype relationships","Association versus mechanism"]},{name:"Evidence Engine",description:"Research and source tracing",details:["Cited publications and datasets","Evidence provenance and versions","Conflicting findings and uncertainty"]},{name:"Reasoning Engine",description:"Gaps and hypotheses",details:["Cross-domain evidence comparisons","Research gaps and alternative explanations","Scientist-reviewed hypotheses"]},{name:"Discovery Engine",description:"Targets and in-silico models",details:["Evidence-ranked therapeutic targets","Docking and virtual screening models","Experimental validation requirements"]},{name:"Governance Engine",description:"Permissions and human review",details:["Purpose-specific access controls","Auditable decisions and model versions","Accountable human approval"]}] },
  { title: "Intelligence outputs", subtitle: "Reviewable research directions", rows: [{name:"Patient & disease matching",description:"Cohorts and phenotype comparisons",details:["Authorised phenotype comparisons","Potential research cohort identification","Missing evidence and review flags"]},{name:"Clinical trial intelligence",description:"Criteria and investigator pre-screening",details:["Inclusion and exclusion criteria","Investigator-led eligibility pre-screen","Missing eligibility evidence"]},{name:"In-silico drug discovery",description:"Target and compound hypotheses",details:["Candidate targets and structures","Virtual screening and molecular docking","Predictions are not proven efficacy"]},{name:"Precision medicine research",description:"Mechanisms and biomarkers",details:["Biomarker and subgroup investigation","Disease mechanism comparisons","Independent clinical validation"]},{name:"Research insights",description:"Contradictions and knowledge gaps",details:["Evidence synthesis with citations","Contradictions and research gaps","Reproducible scientific questions"]}] },
  { title: "Potential impact", subtitle: "Health · research · therapy", rows: [{name:"Personalised care",description:"Better contextual understanding",details:["Permissioned clinical context","Longitudinal care summaries","Clinician-led decisions"]},{name:"Faster research",description:"Traceable evidence synthesis",details:["Less repetitive evidence navigation","Reproducible investigation trails","Research quality evaluation"]},{name:"Therapeutic candidates",description:"Prioritised for further validation",details:["Target prioritisation","Computational candidate evaluation","Laboratory validation required"]},{name:"Inclusive trials",description:"Better-informed screening",details:["Transparent screening criteria","Missing eligibility information","Fairness and access evaluation"]},{name:"Safer treatments",description:"Through independent evaluation",details:["Treatment response research","Potential safety signal investigation","Prospective clinical validation"]}] },
] as const;
const stageVisuals = [
  { label:"Clinical, patient and biomedical sources", nodes:[[16,46],[44,22],[44,70],[77,46]], lines:[[16,46,44,22],[16,46,44,70],[44,22,77,46],[44,70,77,46]] },
  { label:"Linked and governed knowledge layers", nodes:[[16,25],[16,68],[48,46],[82,25],[82,68]], lines:[[16,25,48,46],[16,68,48,46],[48,46,82,25],[48,46,82,68]] },
  { label:"Six collaborating intelligence functions", nodes:[[16,25],[16,68],[48,18],[48,75],[82,25],[82,68]], lines:[[16,25,48,18],[16,68,48,75],[48,18,82,25],[48,75,82,68],[48,18,48,75],[16,25,16,68],[82,25,82,68]] },
  { label:"Evidence-grounded research outputs", nodes:[[16,46],[45,20],[45,72],[82,20],[82,72]], lines:[[16,46,45,20],[16,46,45,72],[45,20,82,20],[45,72,82,72]] },
  { label:"Potential research and care impact", nodes:[[16,46],[46,46],[80,46]], lines:[[16,46,46,46],[46,46,80,46]] },
] as const;
function StageVisual({index}:{index:number}) {
  const visual=stageVisuals[index];
  return <div className="tf-stage-visual" role="img" aria-label={visual.label}>
    <svg viewBox="0 0 100 92" aria-hidden="true" focusable="false">
      <defs><linearGradient id={`tf-glow-${index}`} x1="0" x2="1"><stop stopColor="#2d9588"/><stop offset="1" stopColor="#f08a6a"/></linearGradient></defs>
      <circle cx="49" cy="46" r="35" className="tf-visual-halo"/>
      {visual.lines.map(([x1,y1,x2,y2],i)=><line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="tf-visual-line"/>)}
      {visual.nodes.map(([cx,cy],i)=><g key={i}><circle cx={cx} cy={cy} r="8.5" className="tf-visual-node"/><circle cx={cx} cy={cy} r="3" className="tf-visual-dot"/></g>)}
    </svg>
    <span>{["MULTIMODAL INPUTS","TRUSTED CONNECTIONS","COORDINATED INTELLIGENCE","REVIEWABLE OUTPUTS","VALIDATED PATHWAYS"][index]}</span>
  </div>;
}
export function TechnologyFlow() {
  const [selected,setSelected] = useState<number|null>(null);
  return <div className="tf">
    <div className="tf-heading"><p className="tf-eyebrow">01 / THE HSI TECHNOLOGY ARCHITECTURE</p><h2>From data to <em>discovery.</em></h2><p>A connected architecture for bringing authorised health data and biomedical evidence into supervised research — from source systems to testable scientific questions.</p></div>
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
        <StageVisual index={i}/><div className="tf-stage-items">{stage.rows.map((row,j)=><div className="tf-stage-item" key={row.name}><span className="tf-item-index">{String(j+1).padStart(2,"0")}</span><div><strong>{row.name}</strong><small>{row.description}</small><ul className="tf-detail-list">{row.details.map(detail=><li key={detail}>{detail}</li>)}</ul></div></div>)}</div>
        {i<4&&<span className="tf-stage-arrow" aria-hidden="true"><span className="tf-arrow-beam" /><span className="tf-arrow-pulse" />→</span>}
      </div>)}
    </div>
    {selected!==null&&<div className="tf-selected" aria-live="polite"><strong>{String(selected+1).padStart(2,"0")} / {stages[selected].title}</strong><span>{selected===0?"Data remains under the source system's authorisation and access controls.":selected===1?"Logical knowledge layers do not require copying all data into one database.":selected===2?"The six functions are a target architecture, not a claim of live automated processing.":selected===3?"Matching, trials and computational outputs require validation and professional review.":"Potential benefits are research ambitions, not established clinical outcomes."}</span><button type="button" onClick={()=>setSelected(null)} aria-label="Close stage explanation">×</button></div>}
    <div className="tf-trust"><strong>GOVERNANCE & TRUST</strong><span>Privacy & permissions</span><span>Provenance & traceability</span><span>Human scientific review</span><span>Uncertainty & limitations</span><span>Evidence updates</span></div>
    <p className="tf-disclaimer">Illustrative future-facing architecture. No claim of live patient integrations, confirmed trial eligibility, validated drug discovery or clinical efficacy.</p>
  </div>;
}
