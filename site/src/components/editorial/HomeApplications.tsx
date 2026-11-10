import { Link } from "react-router-dom";
import {
  CROSS_DOMAIN_JOURNEY_ENTRIES,
  contactAccessHref,
  homeDemoHref,
  withResearchContext,
} from "../../lib/researchContext";

const APPLICATION_BLURBS: Record<string, { title: string; text: string }> = {
  immunology_tcell: {
    title: "Immune mechanisms",
    text: "Explore immune-cell states, signalling pathways and disease biology as research questions.",
  },
  gut_brain_immune: {
    title: "Gut–brain–immune axis",
    text: "Investigate connections among microbial metabolites, host immunity and neuroinflammation.",
  },
  metabolic_immunology: {
    title: "Metabolic inflammation",
    text: "Explore relationships between metabolic pathways, immune activation and tissue responses.",
  },
};

/** Section 8 — applications without a single-disease product wall. */
export function HomeApplications() {
  return (
    <section className="cl-applications cl-chapter" aria-labelledby="applications-title">
      <div className="cl-chapter-inner">
        <h2 id="applications-title">Turn connected biological knowledge into actionable research decisions.</h2>
        <p className="cl-chapter-lead">
          Representative research areas with context-preserving entry points. Systemic sclerosis remains one scientific
          validation case — not the product boundary.
        </p>
        <ul className="cl-application-list">
          {CROSS_DOMAIN_JOURNEY_ENTRIES.map((journey) => {
            const blurb = APPLICATION_BLURBS[journey.id] ?? {
              title: journey.label,
              text: journey.label,
            };
            return (
              <li key={journey.id}>
                <h3>{blurb.title}</h3>
                <p>{blurb.text}</p>
                <p className="cl-journey-meta">
                  scenario={journey.scenarioId} · domain={journey.domain} · live_backend=false
                </p>
                <div className="cl-journey-actions">
                  <Link
                    to={homeDemoHref({
                      scenarioId: journey.scenarioId,
                      panel: "mechanism",
                      domain: journey.domain,
                    })}
                  >
                    Investigate
                  </Link>
                  <Link
                    to={withResearchContext(journey.exploreTo, {
                      domain: journey.domain,
                      scenario: journey.scenarioId,
                    })}
                  >
                    Explore Biology
                  </Link>
                  <Link
                    to={withResearchContext(journey.evidenceTo, {
                      domain: journey.domain,
                      scenario: journey.scenarioId,
                    })}
                  >
                    Evidence
                  </Link>
                  <Link to={contactAccessHref({ scenarioId: journey.scenarioId, domain: journey.domain })}>
                    Access
                  </Link>
                </div>
              </li>
            );
          })}
          <li>
            <h3>Therapeutic discovery</h3>
            <p>
              Investigate target biology, treatment mechanisms, biomarkers and evidence gaps — never confirm trial
              eligibility here.
            </p>
            <div className="cl-journey-actions">
              <Link to="/modules/trials">Read Trials scope</Link>
              <Link to="/solutions">Applications overview</Link>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
