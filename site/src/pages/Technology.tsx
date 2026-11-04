import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/technology.css";
import { TechnologyFlow } from "../components/TechnologyFlow";

const sourceSystems = [
  { id:"akeno", name:"Akeno Health", type:"Clinical systems", state:"Ecosystem vision", detail:"Hospital encounters, laboratory results, medication records and imaging metadata remain in their authorised systems.", interfaces:"FHIR R4 · HL7 v2 · LIS · DICOM", boundary:"Patient identity, purpose and record-level access checked at source", route:"/akeno" },
  { id:"aksh", name:"Aksh Health", type:"Patient-generated context", state:"Product development", detail:"Symptoms, glucose trends, wearables and patient-reported outcomes can contribute time-stamped longitudinal observations.", interfaces:"Patient observations · Device data · PROs", boundary:"Consent and purpose-specific sharing; not automatically public research data", route:"/for-aksh" },
  { id:"isi", name:"Immune Super Intelligence", type:"Biological knowledge", state:"Research development", detail:"Immune cells, tissues, pathways, biomarkers and disease mechanisms are linked to traceable research evidence.", interfaces:"Cell atlas · Pathways · Biomarkers · Literature", boundary:"Source licensing, evidence grading and scientific review", route:"/for-isi" },
  { id:"evidence", name:"External research & trials", type:"Approved research sources", state:"Integration direction", detail:"Rights-cleared publications, approved omics datasets and trial registries may be indexed with source and version metadata.", interfaces:"Literature · Omics · Trial criteria · Registries", boundary:"Dataset permissions, provenance, updates and reproducibility", route:"/science" },
] as const;
const graphLayers = [
  { title:"Patient context", path:"Encounter → diagnosis → laboratory result → treatment → outcome", note:"Permissioned, longitudinal and separate from public biomedical evidence" },
  { title:"Human biology", path:"Organ → tissue → cell → pathway → biomarker → disease", note:"Biological relationships anchored to reviewed sources" },
  { title:"Gut–immune–metabolic", path:"Microbiome → metabolite → host pathway → immune response", note:"Associations remain distinct from established causality" },
  { title:"Biomedical evidence", path:"Study → finding → confidence → contradiction → hypothesis", note:"Versioned claims, uncertainty and explicit scientific review states" },
] as const;
const engine = [
  { name: "Context", detail: "Resolve the question and permitted data context. Identity, purpose and authorisation are checked at source boundaries." },
  { name: "Biology", detail: "Relate phenotypes to organs, tissues, immune cells, pathways, biomarkers and molecular targets." },
  { name: "Evidence", detail: "Retrieve permitted source material, preserve citations, versioning, provenance and contradictory findings." },
  { name: "Reasoning", detail: "Coordinate bounded analyses, surface missing evidence and propose testable hypotheses with uncertainty." },
  { name: "Discovery", detail: "Support supervised target prioritisation and future computational screening, docking and model evaluation workflows." },
  { name: "Governance", detail: "Keep patient facts, literature associations, computational predictions and human-approved scientific claims distinct." },
] as const;
const outcomes = [
  { title: "Patient and cohort matching", description: "Compare permitted phenotypes, biomarkers and research cohort criteria. Patient-level matching requires validated models and authorised access.", status: "Future clinical research capability" },
  { title: "Clinical trial intelligence", description: "Structure eligibility criteria, identify missing evidence and support investigator-led pre-screening. Never imply confirmed eligibility or enrolment.", status: "Planned governed workflow" },
  { title: "In-silico drug discovery", description: "Explore targets, candidate molecules, docking, structure-based predictions and computational evaluation. Predicted binding is not proof of efficacy or safety.", status: "Research direction — not a validated drug-discovery service" },
  { title: "Precision medicine research", description: "Connect disease mechanisms and stratification hypotheses to supporting and conflicting evidence for expert assessment.", status: "Research-led development" },
] as const;
const steps = [
  { title: "A clinical or scientific question", detail: "Example: Which immune pathways merit investigation for a systemic sclerosis phenotype?" },
  { title: "Permissioned context", detail: "Select authorised patient or research context without merging private records into a public graph." },
  { title: "Evidence and biology", detail: "Retrieve rights-cleared evidence, trace biological pathways and distinguish association from causation." },
  { title: "NEXUS investigation", detail: "Compare evidence, identify gaps and generate hypotheses labelled as unvalidated." },
  { title: "Discovery options", detail: "Consider trial criteria, candidate targets or computational experiments where suitable data and models exist." },
  { title: "Human scientific review", detail: "Scientists and clinicians assess outputs before any consequential use; no autonomous clinical decisions." },
] as const;

export function Technology() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? null;
    document.title = "Technology — Human Super Intelligence";
    meta?.setAttribute("content", "Explore HSI NEXUS: governed health data, biological evidence, research intelligence, trial matching and in-silico discovery.");
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) meta.setAttribute("content", previousDescription);
    };
  }, []);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [engineIndex, setEngineIndex] = useState(0);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const source = sourceSystems[sourceIndex];
  return <main className="nx-page">
    <section className="nx-flow-hero" aria-label="Human Super Intelligence data flow to discovery">
      <div className="nx-wrap">
        <TechnologyFlow />
        <div className="nx-flow-actions"><a className="nx-cta" href="#nexus">Explore HSI NEXUS <span aria-hidden="true">↗</span></a><a className="nx-text-link" href="#sources">Explore the data sources <span aria-hidden="true">↗</span></a></div>
      </div>
    </section>

    <section className="nx-section nx-inputs nx-connected-data" id="sources">
      <div className="nx-wrap">
        <div className="nx-section-head"><div><p className="nx-kicker">02 / CONNECTED DATA & KNOWLEDGE INFRASTRUCTURE</p><h2>Connected meaning.<br/><em>Not a centralised record store.</em></h2></div><p>HSI is designed to connect authorised clinical context with scientific evidence while retaining source ownership, access boundaries and provenance.</p></div>
        <div className="nx-data-architecture" aria-label="Conceptual architecture from governed sources to four knowledge layers">
          <div className="nx-data-source-rail">
            {sourceSystems.map((item,index)=><button key={item.id} type="button" className="nx-data-source-button" aria-pressed={sourceIndex===index} onClick={()=>setSourceIndex(index)}>
              <span className="nx-data-source-index">0{index+1}</span><span><strong>{item.name}</strong><small>{item.type}</small></span><span aria-hidden="true">↗</span>
            </button>)}
          </div>
          <div className="nx-data-spine" aria-hidden="true"><span>PERMISSIONED INTERFACES</span><svg viewBox="0 0 90 240" preserveAspectRatio="none"><path d="M0 25 H28 V120 H90 M0 88 H28 M0 151 H28 M0 215 H28 V120" /></svg><span>CONTEXT, NOT COPIES</span></div>
          <div className="nx-data-graph">
            <p className="nx-kicker">FOUR LOGICAL KNOWLEDGE LAYERS</p>
            <div className="nx-graph-layers">{graphLayers.map((layer,index)=><article key={layer.title} className="nx-graph-layer"><span>0{index+1}</span><div><h3>{layer.title}</h3><p className="nx-graph-path">{layer.path}</p><p>{layer.note}</p></div></article>)}</div>
          </div>
        </div>
        <div className="nx-data-selected" aria-live="polite"><div><span className="nx-data-state">{source.state}</span><h3>{source.name}</h3><p>{source.detail}</p></div><div><span className="nx-data-field">POTENTIAL DATA CONTRACT</span><p>{source.interfaces}</p><span className="nx-data-field">TRUST BOUNDARY</span><p>{source.boundary}</p><Link className="nx-text-link" to={source.route}>Explore this domain <span aria-hidden="true">↗</span></Link></div></div>
        <p className="nx-data-footnote">Conceptual interoperability architecture, not a claim that every source is currently integrated. Patient-identifiable records are not merged into the public research graph; any clinical use requires verified permissions, validation and governance.</p>
      </div>
    </section>

    <section className="nx-section nx-engine" id="nexus">
      <div className="nx-wrap"><div className="nx-section-head"><div><p className="nx-kicker">02 / CONNECTED HEALTH INTELLIGENCE ENGINE</p><h2>Meet <em>HSI NEXUS.</em></h2></div><p>Not a single database or chatbot: a proposed orchestration layer across separately governed data, knowledge, computational models and human review.</p></div>
        <div className="nx-engine-layout"><div className="nx-engine-orbit"><div className="nx-engine-mark"><small>HSI</small><strong>NEXUS</strong><span>CONNECTED INTELLIGENCE</span></div><div className="nx-engine-orbit-label">Federated by design · Evidence grounded · Human supervised</div></div>
          <div className="nx-engine-workbench"><div className="nx-engine-tabs" role="group" aria-label="NEXUS intelligence functions">{engine.map((item,index) => <button key={item.name} type="button" aria-pressed={engineIndex === index} onClick={() => setEngineIndex(index)}>{String(index+1).padStart(2,"0")} <strong>{item.name}</strong></button>)}</div><div className="nx-engine-detail" aria-live="polite"><span>INTELLIGENCE FUNCTION / {String(engineIndex+1).padStart(2,"0")}</span><h3>{engine[engineIndex].name} Engine</h3><p>{engine[engineIndex].detail}</p></div></div>
        </div>
      </div>
    </section>

    <section className="nx-section nx-outcomes" id="outcomes">
      <div className="nx-wrap"><div className="nx-section-head"><div><p className="nx-kicker">03 / FROM INSIGHT TO RESEARCH APPLICATIONS</p><h2>Intelligence that opens<br/><em>new questions.</em></h2></div><p>Potential downstream applications, each requiring independent validation, appropriate rights and expert oversight.</p></div>
        <div className="nx-outcome-grid">{outcomes.map((item,index) => <article key={item.title} className="nx-outcome-card"><span className="nx-card-number">{String(index+1).padStart(2,"0")}</span><h3>{item.title}</h3><p>{item.description}</p><div className="nx-status">{item.status}</div></article>)}</div>
      </div>
    </section>

    <section className="nx-section nx-journey" id="journey">
      <div className="nx-wrap"><div className="nx-section-head"><div><p className="nx-kicker">04 / A QUESTION-TO-DISCOVERY JOURNEY</p><h2>Follow the reasoning.<br/><em>Keep the uncertainty.</em></h2></div><p>Explore an illustrative systemic sclerosis investigation. This is an explanatory workflow, not a live patient analysis or scientific finding.</p></div>
        <div className="nx-journey-layout"><div className="nx-journey-list" role="group" aria-label="Investigation stages">{steps.map((item,index) => <button key={item.title} type="button" aria-pressed={journeyIndex === index} onClick={() => setJourneyIndex(index)}><span>{String(index+1).padStart(2,"0")}</span>{item.title}</button>)}</div><div className="nx-journey-detail" aria-live="polite"><span>STEP {String(journeyIndex+1).padStart(2,"0")} / 06</span><h3>{steps[journeyIndex].title}</h3><p>{steps[journeyIndex].detail}</p><div className="nx-journey-actions"><button type="button" disabled={journeyIndex===0} onClick={() => setJourneyIndex(i => Math.max(0,i-1))}>Previous</button><button type="button" disabled={journeyIndex===steps.length-1} onClick={() => setJourneyIndex(i => Math.min(steps.length-1,i+1))}>Next step →</button></div></div></div>
      </div>
    </section>

    <section className="nx-section nx-guardrails"><div className="nx-wrap nx-guardrails-layout"><div><p className="nx-kicker">05 / TRUST IS PART OF THE ARCHITECTURE</p><h2>Connections need<br/><em>accountability.</em></h2></div><div><p>Patient facts, population associations, model predictions and validated scientific evidence are different classes of information. NEXUS must preserve those distinctions.</p><div className="nx-guardrail-grid"><span>Source rights & provenance</span><span>Identity & access boundaries</span><span>Versioned evidence</span><span>Uncertainty & contradiction</span><span>Reproducible model analysis</span><span>Accountable human review</span></div><p className="nx-smallprint">Trial pre-screening does not confirm eligibility. Computational docking and in-silico predictions do not establish drug efficacy, safety or clinical utility. No autonomous diagnosis or prescribing.</p></div></div></section>
    <section className="nx-section nx-end"><div className="nx-wrap"><p className="nx-kicker">EXPLORE THE CONNECTED ECOSYSTEM</p><h2>One ambition.<br/><em>Many governed pathways.</em></h2><div className="nx-actions"><Link className="nx-cta" to="/platform">Explore the platform <span aria-hidden="true">↗</span></Link><Link className="nx-text-link" to="/for-isi">Explore immune research <span aria-hidden="true">↗</span></Link></div></div></section>
  </main>;
}
