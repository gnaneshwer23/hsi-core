import {useCallback} from "react";
import {ArrowIcon} from "../components/ArrowIcon";
import {Link,useSearchParams} from "react-router-dom";
import {EditorialCTA} from "../components/editorial/Editorial";
import {HomeEcosystem} from "../components/editorial/HomeEcosystem";
import {HomeHeroPreview} from "../components/editorial/HomeHeroPreview";
import {HomeProductDemo} from "../components/editorial/HomeProductDemo";
import {DEFAULT_HOME_SCENARIO_ID,getHomeScenario,HOME_RESEARCH_SCENARIOS} from "../components/editorial/homeResearchScenarios";
import {PUBLIC_PRIMARY_CTA,PUBLIC_SECONDARY_CTA} from "../lib/ctaPolicy";
import {parseScenarioId,RESEARCH_CONTEXT_KEYS} from "../lib/researchContext";

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
        <p className="ed-kicker">Connected biomedical intelligence</p>
        <h1>Investigate biological mechanisms<br/><em>across human systems.</em></h1>
        <p className="ed-lead">Immunology, microbiome, neuroimmune biology, metabolism, omics, evidence and trials — one research workbench. Disease context is optional. Systemic sclerosis is a validation case, not the product boundary.</p>
        <div className="ed-actions">
          <Link className="ed-button" to={PUBLIC_PRIMARY_CTA.to}>{PUBLIC_PRIMARY_CTA.label} <span aria-hidden="true"><ArrowIcon/></span></Link>
          <Link className="ed-text-link" to={PUBLIC_SECONDARY_CTA.to}>{PUBLIC_SECONDARY_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
        </div>
        <p className="ed-hero-note">Built for researchers. Grounded in evidence. Reviewed by people. Coverage depth is unequal across domains.</p>
      </div>
      <HomeHeroPreview scenario={scenario}/>
    </header>

    <HomeProductDemo scenarioId={scenarioId} onScenarioChange={setScenarioId}/>
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
        <h2 id="foundation-heading">Three ways to investigate.<br/><em>One connected system.</em></h2>
        <p className="ed-foundation-note">Turn investigation into a research brief. Entry points share technology while keeping governance and audience boundaries clear — not three pricing tiers.</p>
      </div>
      <div className="ed-product-rows ed-product-system">
        <Link to="/for-aksh">
          <span className="ed-product-system-index">01</span>
          <span>PERSONAL HEALTH CONTEXT</span>
          <h3>Aksh Health</h3>
          <p>Everyday health context within its own care and data setting.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
        <div className="ed-product-system-rail" aria-hidden="true"/>
        <Link to="/for-isi">
          <span className="ed-product-system-index">02</span>
          <span>IMMUNE-SCIENCE RESEARCH</span>
          <h3>Immune Super Intelligence</h3>
          <p>Explore immune biology and the evidence behind the connections.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
        <div className="ed-product-system-rail" aria-hidden="true"/>
        <Link to="/platform">
          <span className="ed-product-system-index">03</span>
          <span>SHARED RESEARCH TECHNOLOGY</span>
          <h3>Human Super Intelligence</h3>
          <p>Source-aware investigations, inspectable reasoning and accountable review.</p>
          <b aria-hidden="true"><ArrowIcon/></b>
        </Link>
      </div>
    </section>
    <EditorialCTA/>
  </div>;
}
