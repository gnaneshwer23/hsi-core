import {ArrowIcon} from "../components/ArrowIcon";
import {Link} from "react-router-dom";
import {BiologyArtwork,EditorialCTA} from "../components/editorial/Editorial";
import {HomeEcosystem} from "../components/editorial/HomeEcosystem";
import {HomeWorkbench} from "../components/editorial/HomeWorkbench";
import {HomeKnowledgeGraph} from "../components/editorial/HomeKnowledgeGraph";
import {PUBLIC_PLATFORM_CTA,PUBLIC_PRIMARY_CTA,PUBLIC_SECONDARY_CTA} from "../lib/ctaPolicy";

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
  return <div className="ed-home">
    <header className="ed-home-hero">
      <div className="ed-hero-copy">
        <p className="ed-kicker">CONNECTED BIOMEDICAL INTELLIGENCE</p>
        <h1>Investigate disease mechanisms<br/><em>with evidence you can trace.</em></h1>
        <p className="ed-lead">Explore biological relationships, examine supporting and conflicting evidence, identify research gaps, and develop the next scientific question.</p>
        <div className="ed-actions">
          <Link className="ed-button" to={PUBLIC_PRIMARY_CTA.to}>{PUBLIC_PRIMARY_CTA.label} <span aria-hidden="true"><ArrowIcon/></span></Link>
          <Link className="ed-text-link" to={PUBLIC_SECONDARY_CTA.to}>{PUBLIC_SECONDARY_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
        </div>
        <p className="ed-hero-note">Built for researchers. Grounded in evidence. Reviewed by people. The anatomical figure is supporting context — the product is the research workflow.</p>
      </div>
      <BiologyArtwork/>
    </header>

    <HomeWorkbench/>
    <HomeEcosystem/>
    <HomeKnowledgeGraph/>

    <section className="ed-intro ed-today" aria-labelledby="today-heading">
      <p className="ed-kicker">WHAT HSI DOES TODAY</p>
      <h2 id="today-heading">A research instrument.<br/><em>Not a regenerative-medicine brochure.</em></h2>
      <div>
        <p>HSI helps researchers move from a biological question to an inspectable brief: mechanism context, source-linked candidates, contradictions, gaps and human review requirements.</p>
        <p>Authenticated workspace writes remain gated. Public pages show truthful capability status and clearly labelled illustrative demonstrations.</p>
        <Link className="ed-text-link" to={PUBLIC_PLATFORM_CTA.to}>{PUBLIC_PLATFORM_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
      </div>
    </section>

    <section className="ed-does-not" aria-labelledby="does-not-heading">
      <div>
        <p className="ed-kicker">SCIENTIFIC INTEGRITY</p>
        <h2 id="does-not-heading">What HSI does not do</h2>
        <p>Ambition without these limits would not be credible. Keeping them visible is part of the product.</p>
      </div>
      <ul>{DOES_NOT.map(item=><li key={item}>{item}</li>)}</ul>
      <Link className="ed-text-link" to="/evidence-safety">Evidence &amp; safety <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
    </section>

    <section className="ed-ecosystem">
      <div>
        <p className="ed-kicker">ONE FOUNDATION. DISTINCT EXPERIENCES.</p>
        <h2>Start with the work<br/>you need to do.</h2>
      </div>
      <div className="ed-product-rows">
        <Link to="/for-aksh"><span>PERSONAL HEALTH CONTEXT</span><h3>Aksh Health</h3><p>Everyday health context within its own care and data setting.</p><b aria-hidden="true"><ArrowIcon/></b></Link>
        <Link to="/for-isi"><span>IMMUNE-SCIENCE RESEARCH</span><h3>Immune Super Intelligence</h3><p>Explore immune biology and the evidence behind the connections.</p><b aria-hidden="true"><ArrowIcon/></b></Link>
        <Link to="/platform"><span>SHARED RESEARCH TECHNOLOGY</span><h3>Human Super Intelligence</h3><p>Source-aware investigations, inspectable reasoning and accountable review.</p><b aria-hidden="true"><ArrowIcon/></b></Link>
      </div>
    </section>
    <EditorialCTA/>
  </div>;
}
