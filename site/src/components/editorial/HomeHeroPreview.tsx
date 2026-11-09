import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {DOMAIN_SCENARIO_HINT,homeDemoHref,withResearchContext} from "../../lib/researchContext";
import {HOME_DOMAINS,STATUS_LABEL} from "./homeDomains";
import {getHomeScenario,type HomeResearchScenario} from "./homeResearchScenarios";

type HomeHeroPreviewProps={
  scenario?:HomeResearchScenario;
};

/** Product-led hero instrument: workbench primary, eight-domain ecosystem supporting. */
export function HomeHeroPreview({scenario}:HomeHeroPreviewProps={}){
  const demo=scenario??getHomeScenario("ssc_fibrosis");
  const [active,setActive]=useState("biology");
  const domain=HOME_DOMAINS.find(d=>d.id===active)??HOME_DOMAINS[2]!;
  const connected=new Set(domain.connected);
  const diseaseLabel=demo.disease??"Disease-independent";
  return <aside className="ed-hero-instrument" aria-label="Research instrument preview">
    <div className="ed-hero-instrument-grid">
      <section className="ed-hero-ecosystem" aria-label="Biological ecosystem">
        <header className="ed-desk-chrome">
          <span>Biological ecosystem</span>
          <span className="ed-desk-chrome-note">Supporting layer · not equal-weight navigation</span>
        </header>
        <ul className="ed-hero-domain-grid" role="list">
          {HOME_DOMAINS.map(d=>{
            const pressed=active===d.id;
            const related=connected.has(d.id);
            return <li key={d.id}>
              <button
                type="button"
                className={"ed-hero-domain"+(pressed?" ed-instrument-selected":"")+(related&&!pressed?" ed-hero-domain-related":"")}
                aria-pressed={pressed}
                onClick={()=>setActive(d.id)}
              >
                <strong>{d.label}</strong>
                <small>{STATUS_LABEL[d.status]}</small>
              </button>
            </li>;
          })}
        </ul>
        <article className="ed-hero-domain-panel" aria-live="polite">
          <p className="ed-status-chip" data-status={domain.status}>{STATUS_LABEL[domain.status]}</p>
          <h3>{domain.label}</h3>
          <p>{domain.blurb}</p>
          <p className="ed-scope-line">Connected: {domain.connected.map(id=>HOME_DOMAINS.find(d=>d.id===id)?.label??id).join(" · ")}</p>
          <ol className="ed-mechanism-path ed-mechanism-path-compact" aria-label={`${domain.label} example path`}>
            {domain.path.slice(0,4).map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
          </ol>
          {domain.to&&domain.cta
            ?<Link className="ed-text-link" to={withResearchContext(domain.to,{domain:domain.id,scenario:DOMAIN_SCENARIO_HINT[domain.id]})}>{domain.cta} <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
            :<p className="ed-scope-line" role="status">{domain.action}</p>}
        </article>
      </section>

      <section className="ed-hero-workbench ed-demo-shell" aria-label="Research workbench">
        <header className="ed-desk-chrome">
          <span>Research workbench</span>
          <span className="ed-desk-chrome-note">Illustrative · {demo.short_label} · live_backend=false</span>
        </header>
        <div className="ed-question-bar ed-question-bar-instrument">
          <span>Research question</span>
          <p className="ed-question-bar-value">{demo.question}</p>
          <p className="ed-workbench-meta">{diseaseLabel} · {demo.coverage}</p>
        </div>
        <div className="ed-hero-workbench-body">
          <div>
            <p className="ed-kicker">Mechanism map</p>
            <ol className="ed-mechanism-path ed-mechanism-path-compact" aria-label="Preview mechanism path">
              {demo.mechanism_path.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong></li>)}
            </ol>
          </div>
          <div className="ed-hero-side-rail">
            <div className="ed-evidence-badges" aria-label="Illustrative evidence status">
              <span data-kind="support" data-evidence="supported"><strong>{demo.supporting}</strong> supporting</span>
              <span data-kind="conflict" data-evidence="contested"><strong>{demo.conflicting}</strong> conflicting</span>
              <span data-kind="gap" data-evidence="context_limited">Gap named</span>
            </div>
            <p className="ed-scope-line">Contradictions and gaps stay attached to the same question.</p>
            <p className="ed-scope-line">Status: research hypothesis · {demo.review_status.replaceAll("_"," ")}</p>
            <Link className="ed-text-link ed-hero-open-evidence" to={homeDemoHref({scenarioId:demo.id,panel:"brief"})}>Open research brief <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
            <Link className="ed-text-link" to="/evidence-safety">Evidence approach <span aria-hidden="true"><ArrowIcon direction="right"/></span></Link>
          </div>
        </div>
      </section>
    </div>
  </aside>;
}
