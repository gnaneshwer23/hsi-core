import {useCallback} from "react";
import {ArrowIcon} from "../components/ArrowIcon";
import {Link,useSearchParams} from "react-router-dom";
import {EditorialCTA} from "../components/editorial/Editorial";
import {HomeEcosystem} from "../components/editorial/HomeEcosystem";
import {HomeHeroPreview} from "../components/editorial/HomeHeroPreview";
import {HomeJourneyEntries} from "../components/editorial/HomeJourneyEntries";
import {HomeProductDemo} from "../components/editorial/HomeProductDemo";
import {DEFAULT_HOME_SCENARIO_ID,getHomeScenario,HOME_RESEARCH_SCENARIOS} from "../components/editorial/homeResearchScenarios";
import {PUBLIC_PRIMARY_CTA,PUBLIC_SECONDARY_CTA} from "../lib/ctaPolicy";
import {contactAccessHref,parseScenarioId,RESEARCH_CONTEXT_KEYS} from "../lib/researchContext";

const AVAILABLE_TODAY=[
  "Explore biological relationships in curated graphs",
  "Review source-linked evidence states with context labels",
  "Compare supporting and conflicting candidates in demos",
  "Identify named research gaps in illustrative briefs",
  "Assemble traceable research-brief structure for review",
];

const UNDER_DEVELOPMENT=[
  "Broader biological coverage across tissues and systems",
  "Expanded therapeutic and trial intelligence",
  "Collaborative research workflows with shared briefs",
  "Live clinical-data integrations (not authorised today)",
];

const DOES_NOT=[
  "Diagnose disease",
  "Recommend treatment",
  "Replace scientific judgement",
  "Validate therapeutic targets",
  "Guarantee research outcomes",
  "Automatically approve scientific claims",
  "Provide patient-specific clinical advice",
  "Infer eligibility from association evidence",
];

export function Home(){
  const [params,setParams]=useSearchParams();
  const knownIds=HOME_RESEARCH_SCENARIOS.map(s=>s.id);
  const scenarioId=parseScenarioId(params.get(RESEARCH_CONTEXT_KEYS.scenario),knownIds)??DEFAULT_HOME_SCENARIO_ID;
  const setScenarioId=useCallback((id:string)=>{
    setParams(prev=>{
      const next=new URLSearchParams(prev);
      if(id===DEFAULT_HOME_SCENARIO_ID)next.delete(RESEARCH_CONTEXT_KEYS.scenario);
      else next.set(RESEARCH_CONTEXT_KEYS.scenario,id);
      return next;
    },{replace:true});
  },[setParams]);
  const scenario=getHomeScenario(scenarioId);
  return <div className="ed-home">
    <header className="ed-home-hero ed-home-hero-product ed-home-hero-instrument">
      <div className="ed-hero-copy">
        <p className="ed-kicker">Connecting human biology</p>
        <p className="ed-tagline">Connecting human biology. Advancing scientific discovery. Transforming our understanding of health.</p>
        <h1>Investigate biological mechanisms<br/><em>across human systems.</em></h1>
        <p className="ed-lead">Immunology, microbiome, neuroimmune biology, metabolism, molecular science, clinical knowledge and trials — one evidence-grounded research workbench. Disease context is optional. Systemic sclerosis is a validation case, not the product boundary.</p>

        <div className="ed-actions">
          <Link className="ed-button" to={contactAccessHref({scenarioId})}>{PUBLIC_PRIMARY_CTA.label} <span aria-hidden="true"><ArrowIcon/></span></Link>
          <Link className="ed-text-link" to={PUBLIC_SECONDARY_CTA.to}>{PUBLIC_SECONDARY_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
          <Link className="ed-text-link" to="/demo">See an investigation <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
        </div>
        <p className="ed-hero-note">Evidence, contradictions and gaps stay visible. Human review stays required. Coverage depth is unequal across domains — not universal biology.</p>
      </div>
      <HomeHeroPreview scenario={scenario}/>
    </header>

    <HomeProductDemo scenarioId={scenarioId} onScenarioChange={setScenarioId}/>
    <HomeJourneyEntries/>
    <HomeEcosystem/>

    <section className="ed-intro ed-today ed-section-compact" aria-labelledby="today-heading">
      <p className="ed-kicker">WHAT HSI DOES TODAY</p>
      <h2 id="today-heading">Available capabilities.<br/><em>Honest development status.</em></h2>
      <div className="ed-today-columns">
        <div>
          <h3>Available today</h3>
          <ul>{AVAILABLE_TODAY.map(item=><li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h3>Under development</h3>
          <ul>{UNDER_DEVELOPMENT.map(item=><li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </section>

    <section className="ed-does-not" aria-labelledby="does-not-heading">
      <div>
        <p className="ed-kicker">SCIENTIFIC INTEGRITY</p>
        <h2 id="does-not-heading">What HSI does not do</h2>
        <p>Ambition without these limits would not be credible. Keeping them visible is part of the product.</p>
      </div>
      <ul>{DOES_NOT.map(item=><li key={item}>{item}</li>)}</ul>
      <Link className="ed-text-link" to="/evidence-safety">Explore Evidence Intelligence <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
    </section>

    <section className="ed-ecosystem ed-foundation-system" aria-labelledby="foundation-heading">
      <div>
        <p className="ed-kicker">ONE RESEARCH FOUNDATION</p>
        <h2 id="foundation-heading">One platform.<br/><em>Four governed modules.</em></h2>
        <p className="ed-foundation-note">Aksh Health, HSI Clinical, ISI and HSI Trials share the Living Health Knowledge Graph. Each module keeps its own permissions. Private clinical information does not auto-enter the research knowledge graph.</p>

      </div>
      <div className="ed-product-rows ed-product-system">
        <Link to="/modules/aksh-health">
          <span className="ed-product-system-index">01</span>
          <span>PATIENT INTELLIGENCE</span>
          <h3>Aksh Health</h3>
          <p>Symptoms, medications, labs, wearables and metabolic context.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
        <div className="ed-product-system-rail" aria-hidden="true"/>
        <Link to="/modules/clinical">
          <span className="ed-product-system-index">02</span>
          <span>CLINICAL INTELLIGENCE</span>
          <h3>HSI Clinical</h3>
          <p>Longitudinal history and the information that is still missing.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
        <div className="ed-product-system-rail" aria-hidden="true"/>
        <Link to="/modules/isi">
          <span className="ed-product-system-index">03</span>
          <span>SCIENTIFIC DISCOVERY</span>
          <h3>Immune Super Intelligence</h3>
          <p>Immune, nervous, microbiome, metabolic and molecular evidence.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
        <div className="ed-product-system-rail" aria-hidden="true"/>
        <Link to="/modules/trials">
          <span className="ed-product-system-index">04</span>
          <span>TRIAL INTELLIGENCE</span>
          <h3>HSI Trials</h3>
          <p>Studies, biomarkers and pre-screening that leaves unknowns unknown.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
      </div>
    </section>
    <EditorialCTA/>
  </div>;
}
