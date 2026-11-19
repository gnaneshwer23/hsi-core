import { useState } from "react";
import { Link } from "react-router-dom";
import {
  demoLandingAllowsProductionWrite,
  getDemoLandingPreviewPack,
  type DemoLandingPreviewCard,
} from "../../demo";
import { Maturity, PublicAction } from "../public/ResearchPublic";
import "../../styles/demo-universe.css";

/** PR6 — pack-backed Demo Universe product previews for public landing pages. */
export function DemoLandingPreviewPanel() {
  const pack = getDemoLandingPreviewPack();
  const [activeId, setActiveId] = useState(pack.cards[0]?.scenarioId ?? "");
  const active: DemoLandingPreviewCard | undefined =
    pack.cards.find((c) => c.scenarioId === activeId) ?? pack.cards[0];

  if (!active) {
    return null;
  }

  return (
    <div className="hsi-demo-landing-preview" aria-labelledby="demo-landing-preview-heading">
      <div className="hsi-instrument-caption">
        <Maturity children="Demonstration" />
        <p id="demo-landing-preview-heading">
          Demo Research Universe product previews · schema {pack.schemaVersion} · production write:{" "}
          {String(demoLandingAllowsProductionWrite())} · staging verified:{" "}
          {String(pack.stagingVerified)}.
        </p>
      </div>
      <p className="hsi-demo-landing-note" role="status">
        Pack-backed conflict pairs from seeded Demo Universe scenarios. Not scientific approval. Not a
        live investigation.
      </p>
      <div className="hsi-demo-landing-tabs" role="tablist" aria-label="Demo Universe landing scenarios">
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
      <article className="hsi-demo-landing-card" aria-live="polite">
        <p className="hsi-small-label">
          {active.domain} · {active.investigationId} · coverage={active.coverage}
        </p>
        <h3>{active.title}</h3>
        <p>{active.question}</p>
        <div className="hsi-demo-landing-sides">
          <div>
            <p className="hsi-kicker">Supporting / left</p>
            <p>{active.conflictLeft}</p>
          </div>
          <div>
            <p className="hsi-kicker">Conflicting / right</p>
            <p>{active.conflictRight}</p>
          </div>
        </div>
        <p className="hsi-demo-landing-abstention">
          <strong>Abstention:</strong> {active.abstention}
        </p>
        <dl className="hsi-demo-landing-counts">
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
        <div className="hsi-actions">
          <PublicAction to={active.href}>Open full comparison desk</PublicAction>
          <Link className="hsi-text-link" to="/demo/universe">
            All Demo Universe scenarios
          </Link>
        </div>
      </article>
    </div>
  );
}
