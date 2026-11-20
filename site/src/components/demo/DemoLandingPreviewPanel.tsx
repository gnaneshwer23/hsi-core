import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getDemoLandingPreviewPack,
  type DemoLandingPreviewCard,
} from "../../demo";

/** PR6 — pack-backed Demo Universe product previews for the premium public homepage. */
export function DemoLandingPreviewPanel() {
  const pack = getDemoLandingPreviewPack();
  const [activeId, setActiveId] = useState(pack.cards[0]?.scenarioId ?? "");
  const active: DemoLandingPreviewCard | undefined =
    pack.cards.find((c) => c.scenarioId === activeId) ?? pack.cards[0];

  if (!active) {
    return null;
  }

  return (
    <div className="pg-demo-preview">
      <p className="pg-conflict-honesty" role="status">
        Demonstration workspace · scenario data · not independently validated.
      </p>
      <div className="pg-demo-tabs" role="tablist" aria-label="Demo Universe landing scenarios">
        {pack.cards.map((card) => (
          <button
            key={card.scenarioId}
            type="button"
            role="tab"
            aria-selected={card.scenarioId === active.scenarioId}
            onClick={() => setActiveId(card.scenarioId)}
          >
            {card.shortLabel}
          </button>
        ))}
      </div>
      <article className="pg-demo-card" aria-live="polite">
        <p className="pg-chip">
          {active.domain}
        </p>
        <h3>{active.title}</h3>
        <p>{active.question}</p>
        <div className="pg-conflict-pair" role="group" aria-label="Conflict pair preview">
          <article>
            <h3>Finding A</h3>
            <p>{active.conflictLeft}</p>
          </article>
          <article>
            <h3>Finding B</h3>
            <p>{active.conflictRight}</p>
          </article>
        </div>
        <p>
          <strong>What remains unresolved:</strong> {active.abstention}
        </p>
        <dl className="pg-demo-counts">
          <div>
            <dt>Supporting</dt>
            <dd>{active.supportingCount}</dd>
          </div>
          <div>
            <dt>Conflicting</dt>
            <dd>{active.conflictingCount}</dd>
          </div>
          <div>
            <dt>Gaps</dt>
            <dd>{active.gapCount}</dd>
          </div>
          <div>
            <dt>Brief limits</dt>
            <dd>{active.briefLimitationCount}</dd>
          </div>
        </dl>
        <div className="pg-cta">
          <Link className="pg-btn" to={active.href}>
            Explore this scenario <span aria-hidden="true">→</span>
          </Link>
          <Link className="pg-link" to="/demo/universe">
            All scenarios <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
