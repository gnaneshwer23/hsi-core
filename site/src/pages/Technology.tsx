import {HeroArtwork} from "../components/editorial/HeroArtwork";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/technology.css";
import { ExperienceHero } from "../components/Experience";
import { DataToDiscoveryArchitecture } from "../components/DataToDiscoveryArchitecture";
import { TechnologyFlow } from "../components/TechnologyFlow";

const sourceSystems = [
  { id:"akeno", name:"Authorised care systems", type:"Clinical systems", state:"Ecosystem vision", detail:"Hospital encounters, laboratory results, medication records and imaging metadata remain in their authorised systems.", interfaces:"FHIR R4 · HL7 v2 · LIS · DICOM", boundary:"Patient identity, purpose and record-level access checked at source", route:"/modules" },
  { id:"aksh", name:"Aksh Health", type:"Patient-generated context", state:"Product development", detail:"Symptoms, glucose trends, wearables and patient-reported outcomes can contribute time-stamped longitudinal observations.", interfaces:"Patient observations · Device data · PROs", boundary:"Consent and purpose-specific sharing; not automatically public research data", route:"/modules/aksh-health" },
  { id:"isi", name:"Immune Super Intelligence", type:"Biological knowledge", state:"Research development", detail:"Immune cells, tissues, pathways, biomarkers and disease mechanisms are linked to traceable research evidence.", interfaces:"Cell atlas · Pathways · Biomarkers · Literature", boundary:"Source licensing, evidence grading and scientific review", route:"/modules/isi" },
  { id:"evidence", name:"External research & trials", type:"Approved research sources", state:"Integration direction", detail:"Rights-cleared publications, approved omics datasets and trial registries may be indexed with source and version metadata.", interfaces:"Literature · Omics · Trial criteria · Registries", boundary:"Dataset permissions, provenance, updates and reproducibility", route:"/science" },
] as const;
const graphLayers = [
  { title:"Patient context", path:"Encounter → diagnosis → laboratory result → treatment → outcome", note:"Permissioned, longitudinal and separate from public biomedical evidence" },
  { title:"Human biology", path:"Organ → tissue → cell → pathway → biomarker → disease", note:"Biological relationships anchored to reviewed sources" },
  { title:"Gut–immune–metabolic", path:"Microbiome → metabolite → host pathway → immune response", note:"Associations remain distinct from established causality" },
  { title:"Biomedical evidence", path:"Study → finding → confidence → contradiction → hypothesis", note:"Versioned claims, uncertainty and explicit scientific review states" },
] as const;
const engine = [
  { name:"Context", role:"Establish permitted scope", detail:"Define the research question, permitted datasets and relevant clinical or biological context before retrieval.", input:"Question + purpose + authorised context", output:"Scoped investigation brief", guard:"Access and identity boundaries" },
  { name:"Biology", role:"Trace mechanisms", detail:"Connect phenotypes to tissues, immune cells, pathways and biomarkers through reviewable biological relationships.", input:"Phenotype + curated biological graph", output:"Mechanism map with evidence links", guard:"Association is not causation" },
  { name:"Evidence", role:"Retrieve and compare", detail:"Gather rights-cleared studies and approved datasets, including supporting and contradictory findings with provenance.", input:"Scoped queries + licensed sources", output:"Versioned evidence dossier", guard:"Citations, dates and source rights" },
  { name:"Reasoning", role:"Investigate uncertainty", detail:"Compare observations and claims, surface contradictions and gaps, and propose clearly labelled, testable hypotheses.", input:"Evidence dossier + biology map", output:"Draft hypotheses and unresolved questions", guard:"Inference is not an approved fact" },
  { name:"Discovery", role:"Design next research", detail:"Suggest supervised analyses, candidate biomarkers or experimental follow-ups; computational screening remains a future validated capability.", input:"Reviewed gaps + suitable methods", output:"Proposed research plan", guard:"No efficacy or safety claims" },
  { name:"Governance", role:"Require accountable review", detail:"Record methods, source versions, uncertainty and human scientific decisions before any claim can enter approved knowledge.", input:"Draft outputs + analysis provenance", output:"Approved, revised or rejected decision", guard:"Agents never self-approve claims" },
] as const;
const nexusJourney = ["Question & authorisation","Evidence retrieval","Biological investigation","Reasoned proposals","Scientific review"] as const;
const applications = [
  { title:"Evidence-led immune research", stage:"Research foundation", focus:"Researcher", description:"Investigate systemic sclerosis immune mechanisms using literature, graph relationships and contradictory evidence.", inputs:["Reviewed literature","Immune cell and pathway graph"], deliverable:"Cited mechanism brief with gaps and uncertainty", boundary:"Research interpretation; not a validated clinical recommendation", route:"/modules/isi" },
  { title:"Longitudinal clinical intelligence", stage:"Future clinical evaluation", focus:"Clinician", description:"Reconstruct a permissioned timeline of encounters, medications, laboratory trends and missing information for professional review.", inputs:["Authorised encounters","Laboratory and medication history"], deliverable:"Traceable patient context summary", boundary:"Patient-level processing requires access controls, safety evaluation and clinical oversight", route:"/modules" },
  { title:"Clinical trial pre-screening", stage:"Planned governed workflow", focus:"Investigator", description:"Translate registry criteria into structured checks, surface missing evidence and prepare an investigator review queue.", inputs:["Versioned trial criteria","Permitted phenotype data"], deliverable:"Criteria-by-criteria pre-screen dossier", boundary:"Not confirmation of eligibility or enrolment", route:"/modules/trials" },
  { title:"Biomarker and therapeutic discovery", stage:"Exploratory research direction", focus:"Scientist", description:"Prioritise research hypotheses and potential targets; computational modelling or docking requires separately validated methods.", inputs:["Biological pathways","Evidence and approved datasets"], deliverable:"Candidate research hypotheses and experimental plan", boundary:"Predicted binding or association is not evidence of safety or efficacy", route:"/science" },
] as const;
const steps = [
  { title:"Frame the SSc question", actor:"Researcher", detail:"Investigate which immune mechanisms might be associated with fibrotic disease features in systemic sclerosis (SSc). Define phenotype, tissues, timeframe and exclusions.", evidence:"Documented question and scope", limitation:"No patient-specific diagnosis or mechanistic conclusion" },
  { title:"Select governed evidence", actor:"Evidence function", detail:"Identify permitted publications, approved datasets and curated immune relationships. Record publication dates, identifiers, access rights and dataset versions.", evidence:"Source register and provenance", limitation:"A source list is not a quality assessment" },
  { title:"Trace cells and pathways", actor:"Biology function", detail:"Explore candidate connections among immune cell states, cytokine signalling, vascular injury and fibroblast activation, with each relationship tied to evidence.", evidence:"Traceable biological relationship map", limitation:"Biological plausibility does not establish causation" },
  { title:"Compare conflicting findings", actor:"Evidence + Reasoning", detail:"Separate supporting, opposing and missing findings across study designs, tissues and cohorts. Note potential confounders and methodological differences.", evidence:"Contradiction and uncertainty register", limitation:"No automated consensus or fabricated confidence score" },
  { title:"Draft testable hypotheses", actor:"Research investigator", detail:"Propose follow-up measurements or analyses, such as comparing cell-state signatures across suitably governed cohorts, with explicit falsification criteria.", evidence:"Unvalidated hypothesis and proposed experiment", limitation:"A hypothesis is not an approved graph fact" },
  { title:"Review and decide", actor:"Accountable scientist", detail:"A human reviewer evaluates source quality, analysis reproducibility, interpretation and limitations before approving, revising or rejecting proposed claims.", evidence:"Recorded review decision and audit trail", limitation:"No autonomous clinical or therapeutic decision" },
] as const;
const governanceControls = [
  { title:"Identity, purpose and access", owner:"Clinical data steward", evidence:"Verified role, lawful basis, purpose limitation and source-level access decision", gate:"No permitted scope → no patient data retrieval" },
  { title:"Source rights and provenance", owner:"Evidence curator", evidence:"Licence, source identifier, publication or dataset version, retrieval timestamp and citation", gate:"Unlicensed or untraceable material → excluded" },
  { title:"Reproducible analysis", owner:"Research scientist", evidence:"Approved dataset snapshot, methods, parameters, quality checks and run record", gate:"Non-reproducible result → draft only" },
  { title:"Uncertainty and claim status", owner:"Scientific reviewer", evidence:"Separated patient fact, published finding, association, inference and hypothesis", gate:"Unvalidated hypothesis → never an approved fact" },
  { title:"Clinical safety and validation", owner:"Clinical safety lead", evidence:"Risk assessment, intended use, evaluation, human oversight and incident handling", gate:"No validated clinical use → no autonomous decisions" },
  { title:"Accountable publication decision", owner:"Authorised scientific approver", evidence:"Approve, revise or reject decision, rationale, reviewer identity and audit trail", gate:"No approval → cannot enter the approved knowledge layer" },
] as const;
export function Technology() {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [engineIndex, setEngineIndex] = useState(0);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [applicationIndex, setApplicationIndex] = useState(0);
  const [governanceIndex, setGovernanceIndex] = useState(0);
  const source = sourceSystems[sourceIndex];
  return <div className="nx-page xp-page"><ExperienceHero eyebrow="TECHNOLOGY" title="Connected knowledge." emphasis="Accountable reasoning." visual={<HeroArtwork kind="technology"/>} description="Explore the shared research technology behind HSI: source-aware connections, evidence inspection and independent human review. Product data and permissions remain separate."/>
    <section className="nx-flow-hero" aria-label="Human Super Intelligence data flow to discovery">
      <div className="nx-wrap">
        <TechnologyFlow />
        <div id="data-to-discovery-status">
          <DataToDiscoveryArchitecture />
        </div>
        <div className="nx-flow-actions"><a className="nx-cta" href="#nexus">Explore HSI NEXUS <span aria-hidden="true">↗</span></a><a className="nx-text-link" href="#data-to-discovery-status">Inspect connection status <span aria-hidden="true">↗</span></a><a className="nx-text-link" href="#sources">Explore the data sources <span aria-hidden="true">↗</span></a></div>
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

    <section className="nx-section nx-engine nx-nexus-lab" id="nexus">
      <div className="nx-wrap">
        <div className="nx-section-head"><div><p className="nx-kicker">03 / INSIDE HSI NEXUS</p><h2>Six engines.<br/><em>One supervised investigation.</em></h2></div><p>NEXUS is the proposed coordination layer: specialised functions investigate a question, exchange traceable outputs and prepare findings for accountable human review.</p></div>
        <div className="nx-nexus-layout">
          <div className="nx-nexus-map" aria-label="Conceptual six-engine NEXUS collaboration diagram">
            <div className="nx-nexus-orbit">
              <svg viewBox="0 0 420 420" role="img" aria-label="Six connected intelligence engines surrounding the HSI NEXUS orchestrator">
                <circle cx="210" cy="210" r="151" className="nx-nexus-ring"/>
                {engine.map((_,i)=>{const theta=(i*60-90)*Math.PI/180;const x=210+151*Math.cos(theta);const y=210+151*Math.sin(theta);return <g key={i}><line x1="210" y1="210" x2={x} y2={y} className={engineIndex===i?"nx-nexus-link active":"nx-nexus-link"}/><circle cx={x} cy={y} r={engineIndex===i?17:12} className={engineIndex===i?"nx-nexus-point active":"nx-nexus-point"}/><text x={x} y={y+4} textAnchor="middle" className="nx-nexus-point-label">{i+1}</text></g>})}
                <circle cx="210" cy="210" r="77" className="nx-nexus-center"/>
                <text x="210" y="199" textAnchor="middle" className="nx-nexus-center-small">HSI</text><text x="210" y="225" textAnchor="middle" className="nx-nexus-center-title">NEXUS</text><text x="210" y="243" textAnchor="middle" className="nx-nexus-center-small">ORCHESTRATION</text>
              </svg>
            </div>
            <p className="nx-nexus-map-caption">Conceptual architecture · Agent proposals remain separate from approved evidence</p>
            <div className="nx-nexus-workflow" aria-label="Supervised investigation workflow">{nexusJourney.map((step,i)=><div key={step}><span>0{i+1}</span><strong>{step}</strong></div>)}</div>
          </div>
          <div className="nx-nexus-console">
            <p className="nx-kicker">SELECT AN INTELLIGENCE FUNCTION</p>
            <div className="nx-nexus-tabs" role="group" aria-label="NEXUS intelligence functions">{engine.map((item,i)=><button key={item.name} type="button" aria-pressed={engineIndex===i} onClick={()=>setEngineIndex(i)}><span>0{i+1}</span>{item.name}</button>)}</div>
            <article className="nx-nexus-detail" aria-live="polite"><p className="nx-kicker">ENGINE 0{engineIndex+1} / {engine[engineIndex].role}</p><h3>{engine[engineIndex].name}</h3><p>{engine[engineIndex].detail}</p><div className="nx-nexus-contract"><div><span>INPUT</span><strong>{engine[engineIndex].input}</strong></div><div><span>REVIEWABLE OUTPUT</span><strong>{engine[engineIndex].output}</strong></div><div><span>SAFETY BOUNDARY</span><strong>{engine[engineIndex].guard}</strong></div></div></article>
          </div>
        </div>
        <p className="nx-nexus-note">This diagram describes the intended NEXUS orchestration model, not verified deployment of all six engines. Human scientists retain authority over claims and consequential decisions.</p>
      </div>
    </section>

    <section className="nx-section nx-outcomes nx-applications" id="outcomes">
      <div className="nx-wrap">
        <div className="nx-section-head"><div><p className="nx-kicker">04 / SCIENTIFIC & CLINICAL INTELLIGENCE APPLICATIONS</p><h2>From connected knowledge<br/><em>to reviewable work.</em></h2></div><p>Four distinct use cases, with explicit evidence requirements, expected research outputs and development maturity. Select an application to examine its intended workflow.</p></div>
        <div className="nx-application-layout">
          <div className="nx-application-menu" role="group" aria-label="Scientific and clinical applications">{applications.map((item,i)=><button key={item.title} type="button" aria-pressed={applicationIndex===i} onClick={()=>setApplicationIndex(i)}><span>0{i+1} / {item.focus}</span><strong>{item.title}</strong><small>{item.stage}</small></button>)}</div>
          <article className="nx-application-detail" aria-live="polite">
            <div className="nx-application-topline"><span>APPLICATION 0{applicationIndex+1}</span><span>{applications[applicationIndex].stage}</span></div>
            <h3>{applications[applicationIndex].title}</h3><p className="nx-application-summary">{applications[applicationIndex].description}</p>
            <div className="nx-application-pipeline" aria-label="Conceptual application flow">
              <div><span>01 / INPUT EVIDENCE</span>{applications[applicationIndex].inputs.map(item=><strong key={item}>{item}</strong>)}</div>
              <div className="nx-application-arrow" aria-hidden="true">→</div>
              <div><span>02 / REVIEWABLE OUTPUT</span><strong>{applications[applicationIndex].deliverable}</strong></div>
            </div>
            <div className="nx-application-boundary"><strong>Interpretation boundary</strong><p>{applications[applicationIndex].boundary}</p></div>
            <Link to={applications[applicationIndex].route} className="nx-text-link">Explore related HSI domain <span aria-hidden="true">↗</span></Link>
          </article>
        </div>
        <p className="nx-application-disclaimer">These are capability directions, not a claim of live clinical integrations, approved diagnostic software, validated trial matching or therapeutic efficacy. Actual availability and scientific validation must be verified independently.</p>
      </div>
    </section>

    <section className="nx-section nx-journey nx-ssc-investigation" id="journey">
      <div className="nx-wrap">
        <div className="nx-section-head"><div><p className="nx-kicker">05 / RESEARCH INVESTIGATION · SYSTEMIC SCLEROSIS</p><h2>One disease question.<br/><em>A traceable investigation.</em></h2></div><p>Follow the structure of a supervised systemic sclerosis investigation: define the question, inspect the evidence and keep the source context attached to the review.</p></div>
        <div className="nx-ssc-layout">
          <div className="nx-ssc-left">
            <div className="nx-ssc-question"><span>ILLUSTRATIVE RESEARCH QUESTION</span><h3>Which immune mechanisms merit investigation in systemic sclerosis–associated fibrosis?</h3><p>Scope: immune cell states · tissue context · fibrotic pathways · conflicting evidence</p></div>
            <div className="nx-ssc-steps" role="group" aria-label="Systemic sclerosis investigation stages">{steps.map((item,index)=><button key={item.title} type="button" aria-pressed={journeyIndex===index} onClick={()=>setJourneyIndex(index)}><span>0{index+1}</span><strong>{item.title}</strong><small>{item.actor}</small></button>)}</div>
          </div>
          <article className="nx-ssc-detail" aria-live="polite">
            <div className="nx-ssc-detail-top"><span>INVESTIGATION STAGE 0{journeyIndex+1} / 06</span><span>SUPERVISED WORKFLOW</span></div>
            <div className="nx-ssc-visual" role="img" aria-label="Conceptual immune research connections between immune cells, signalling, tissue responses and fibrotic processes">
              <svg viewBox="0 0 560 170" preserveAspectRatio="xMidYMid meet"><path d="M90 85 H190 M280 85 H380" stroke="#75b6a4" strokeWidth="3" strokeDasharray="5 6"/><path d="M470 85 H520" stroke="#75b6a4" strokeWidth="3" strokeDasharray="5 6"/><circle cx="70" cy="85" r="37" fill="#286e66"/><circle cx="235" cy="85" r="43" fill="#367e73"/><circle cx="425" cy="85" r="43" fill="#f3b59c"/><text x="70" y="80" fill="white" textAnchor="middle" fontSize="12" fontWeight="700">Immune</text><text x="70" y="95" fill="white" textAnchor="middle" fontSize="12">cells</text><text x="235" y="80" fill="white" textAnchor="middle" fontSize="12" fontWeight="700">Signalling</text><text x="235" y="95" fill="white" textAnchor="middle" fontSize="11">pathways</text><text x="425" y="80" fill="#693d31" textAnchor="middle" fontSize="12" fontWeight="700">Tissue</text><text x="425" y="95" fill="#693d31" textAnchor="middle" fontSize="11">fibrosis</text></svg>
              <span>Conceptual relationships — not validated causal links</span>
            </div>
            <p className="nx-ssc-actor">{steps[journeyIndex].actor}</p><h3>{steps[journeyIndex].title}</h3><p className="nx-ssc-description">{steps[journeyIndex].detail}</p>
            <div className="nx-ssc-review"><div><span>REVIEWABLE ARTIFACT</span><strong>{steps[journeyIndex].evidence}</strong></div><div><span>INTERPRETATION LIMIT</span><strong>{steps[journeyIndex].limitation}</strong></div></div>
            <div className="nx-journey-actions"><button type="button" disabled={journeyIndex===0} onClick={()=>setJourneyIndex(i=>Math.max(0,i-1))}>Previous</button><button type="button" disabled={journeyIndex===steps.length-1} onClick={()=>setJourneyIndex(i=>Math.min(steps.length-1,i+1))}>Next stage →</button></div>
          </article>
        </div>
        <p className="nx-ssc-disclaimer">Illustrative workflow only. No patient data, actual study results, computed biomarker predictions or trial eligibility decisions are presented. Proposed mechanisms require source-level evidence, independent validation and scientific review.</p>
      </div>
    </section>

    <section className="nx-section nx-guardrails nx-governance" id="governance">
      <div className="nx-wrap">
        <div className="nx-section-head"><div><p className="nx-kicker">06 / GOVERNANCE, VALIDATION & SCIENTIFIC REVIEW</p><h2>Trust is not a label.<br/><em>It is a decision trail.</em></h2></div><p>Every investigation must preserve who supplied the evidence, what an agent inferred, which controls applied and who approved the resulting claim.</p></div>
        <div className="nx-governance-flow" aria-label="Proposed evidence approval process"><div><span>01</span><strong>Source and permissions</strong><small>Access and provenance</small></div><div><span>02</span><strong>Agent investigation</strong><small>Traceable draft outputs</small></div><div><span>03</span><strong>Human scientific review</strong><small>Approve · revise · reject</small></div><div><span>04</span><strong>Approved knowledge</strong><small>Versioned and auditable</small></div></div>
        <div className="nx-governance-layout">
          <div className="nx-governance-controls" role="group" aria-label="Governance controls">{governanceControls.map((control,i)=><button key={control.title} type="button" aria-pressed={governanceIndex===i} onClick={()=>setGovernanceIndex(i)}><span>0{i+1}</span><strong>{control.title}</strong><small>{control.owner}</small></button>)}</div>
          <article className="nx-governance-detail" aria-live="polite">
            <div className="nx-governance-detail-top"><span>CONTROL 0{governanceIndex+1} / 06</span><span>REVIEW GATE</span></div>
            <h3>{governanceControls[governanceIndex].title}</h3><p>Accountable role: <strong>{governanceControls[governanceIndex].owner}</strong></p>
            <div className="nx-governance-evidence"><span>REQUIRED REVIEW RECORD</span><strong>{governanceControls[governanceIndex].evidence}</strong></div>
            <div className="nx-governance-gate"><span>STOP CONDITION</span><strong>{governanceControls[governanceIndex].gate}</strong></div>
            <p className="nx-governance-note">Agents may retrieve, compare and propose. They cannot grant data access, validate clinical performance or approve their own scientific claims.</p>
          </article>
        </div>
        <div className="nx-governance-classes"><h3>Evidence classes must remain distinct</h3><div><span>Patient fact</span><span>Published finding</span><span>Population association</span><span>Computational inference</span><span>Unvalidated hypothesis</span></div></div>
        <p className="nx-governance-disclaimer">This is the intended governance model, not certification of a deployed clinical system. UK GDPR, applicable clinical safety standards, research ethics, MHRA software requirements and independent evaluation must be assessed for each intended use. Trial pre-screening does not confirm eligibility. No autonomous diagnosis or prescribing.</p>
      </div>
    </section>
    <section className="nx-section nx-end"><div className="nx-wrap"><p className="nx-kicker">EXPLORE THE CONNECTED ECOSYSTEM</p><h2>One ambition.<br/><em>Many governed pathways.</em></h2><div className="nx-actions"><Link className="nx-cta" to="/platform">Explore the platform <span aria-hidden="true">↗</span></Link><Link className="nx-text-link" to="/modules/isi">Explore immune research <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>;
}
