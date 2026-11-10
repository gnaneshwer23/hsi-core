import { Link } from "react-router-dom";
import { withResearchContext } from "../../lib/researchContext";
import { disciplineScenario, HOME_DISCIPLINE_CARDS } from "./disciplineCardRegistry";

/** Section 5 — interconnected scientific disciplines. */
export function HomeDisciplineCards() {
  return (
    <section className="cl-disciplines cl-chapter" aria-labelledby="disciplines-title">
      <div className="cl-chapter-inner">
        <h2 id="disciplines-title">One platform. Interconnected scientific disciplines.</h2>
        <p className="cl-chapter-lead">
          Cards navigate to existing science and research surfaces. Coverage is unequal; unavailable capabilities stay
          labelled on destination pages.
        </p>
        <ul className="cl-discipline-grid">
          {HOME_DISCIPLINE_CARDS.map((card) => {
            const scenario = disciplineScenario(card);
            return (
              <li key={card.id}>
                <h3>{card.label}</h3>
                <p>{card.blurb}</p>
                <p className="cl-discipline-meta">Connected: {card.connected.join(" · ")}</p>
                <Link
                  to={withResearchContext(card.to, {
                    domain: card.domainHint,
                    scenario,
                  })}
                >
                  {card.cta}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
