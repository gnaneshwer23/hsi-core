import {Link} from "react-router-dom";
import {ArrowIcon} from "../ArrowIcon";
import {
  CROSS_DOMAIN_JOURNEY_ENTRIES,
  contactAccessHref,
  homeDemoHref,
  withResearchContext,
} from "../../lib/researchContext";

/** Public entry paths for the three cross-domain acceptance journeys — navigable, not live-backend. */
export function HomeJourneyEntries(){
  return <section className="ed-journey-entries ed-section-compact" aria-labelledby="journey-entries-heading">
    <p className="ed-kicker">CROSS-DOMAIN ENTRY PATHS</p>
    <h2 id="journey-entries-heading">Start from a real question.<br/><em>Stay on a continuous path.</em></h2>
    <p>Aligned with the HSI investigation vision: open an illustrative demonstration, explore biology, review evidence framing, then request research access — without claiming a live write-spine.</p>
    <ul className="ed-journey-entry-list">
      {CROSS_DOMAIN_JOURNEY_ENTRIES.map(j=>(
        <li key={j.id}>
          <article className="ed-journey-entry" aria-labelledby={`journey-${j.id}`}>
            <h3 id={`journey-${j.id}`}>{j.label}</h3>
            <p className="ed-scope-line">scenario={j.scenarioId} · domain={j.domain} · live_backend=false</p>
            <div className="ed-actions">
              <Link className="ed-button" to={homeDemoHref({scenarioId:j.scenarioId,panel:"mechanism",domain:j.domain})}>
                Open demonstration <span aria-hidden="true"><ArrowIcon/></span>
              </Link>
              <Link className="ed-text-link" to={withResearchContext(j.exploreTo,{domain:j.domain,scenario:j.scenarioId})}>
                Explore biology <span aria-hidden="true"><ArrowIcon direction="right"/></span>
              </Link>
              <Link className="ed-text-link" to={withResearchContext(j.evidenceTo,{domain:j.domain,scenario:j.scenarioId})}>
                Review evidence approach <span aria-hidden="true"><ArrowIcon direction="right"/></span>
              </Link>
              <Link className="ed-text-link" to={contactAccessHref({scenarioId:j.scenarioId,domain:j.domain})}>
                Research access options <span aria-hidden="true"><ArrowIcon direction="right"/></span>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  </section>;
}
