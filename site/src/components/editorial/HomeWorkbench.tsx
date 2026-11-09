import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {PUBLIC_PRIMARY_CTA} from "../../lib/ctaPolicy";

/** Mirrors docs/research-demonstrations/demo_ssc_fibrosis_001.json — keep live_backend false until verified. */
const DEMO={
  demonstration_id:"demo_ssc_fibrosis_001",
  live_backend:false,
  review_status:"not_reviewed",
  question:"How might immune activation contribute to fibrosis?",
  mechanism_path:[
    "Immune activation",
    "Cytokine signalling",
    "Fibroblast activation",
    "Extracellular-matrix remodelling",
    "Tissue fibrosis",
  ],
  disclaimer:"Illustrative demonstration; not a live research investigation. Uses curated example data. Evidence and workflow are illustrative.",
  ui_labels:[
    "Illustrative research demonstration",
    "Not a live investigation",
    "Uses curated example data",
    "Evidence and workflow are illustrative",
  ],
} as const;

export function HomeWorkbench(){
  return <section className="ed-workbench" aria-labelledby="workbench-heading">
    <div className="ed-workbench-head">
      <p className="ed-kicker">FROM QUESTION TO RESEARCH DECISION</p>
      <h2 id="workbench-heading">Start with a biological question.<br/><em>Follow the mechanism.</em></h2>
      <p>Examine the evidence. See what remains uncertain. Decide what to investigate next.</p>
      <p className="ed-demo-banner" role="note">{DEMO.ui_labels.join(" · ")}</p>
    </div>
    <div className="ed-workbench-grid">
      <article className="ed-workbench-card">
        <p className="ed-kicker">Research question</p>
        <h3>{DEMO.question}</h3>
        <p className="ed-workbench-meta">Systemic sclerosis · curated example · {DEMO.review_status.replaceAll("_"," ")}</p>
        <ol className="ed-mechanism-path" aria-label="Illustrative mechanism path">
          {DEMO.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
        </ol>
      </article>
      <article className="ed-workbench-card">
        <p className="ed-kicker">Evidence panel</p>
        <ul className="ed-evidence-stats">
          <li><strong>4</strong><span>Supporting candidates in related packs</span></li>
          <li><strong>1</strong><span>Context conflict to inspect</span></li>
          <li><strong>—</strong><span>Longitudinal human tissue gap</span></li>
        </ul>
        <dl className="ed-evidence-status">
          <div><dt>Evidence status</dt><dd>Context-limited</dd></div>
          <div><dt>Review status</dt><dd>Not independently reviewed</dd></div>
          <div><dt>Mode</dt><dd>Illustrative · live_backend={String(DEMO.live_backend)}</dd></div>
        </dl>
        <p className="ed-scope-line">{DEMO.disclaimer}</p>
      </article>
    </div>
    <div className="ed-actions">
      <Link className="ed-button" to="/how-it-works">Explore the workflow <span aria-hidden="true"><ArrowIcon/></span></Link>
      <Link className="ed-text-link" to={PUBLIC_PRIMARY_CTA.to}>{PUBLIC_PRIMARY_CTA.label} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
      <Link className="ed-text-link" to="/research/knowledge-graph">Open knowledge graph <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
    </div>
  </section>;
}
