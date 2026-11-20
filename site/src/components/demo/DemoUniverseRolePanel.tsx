import { Link } from "react-router-dom";
import {
  demoUniverseSliceForRole,
  type DemoDashboardRoleId,
} from "../../demo";
import "../../styles/demo-universe.css";

/** Shared panel: role dashboard → Demo Research Universe scenarios (PR4). */
export function DemoUniverseRolePanel({ roleId }: { roleId: DemoDashboardRoleId }) {
  const slice = demoUniverseSliceForRole(roleId);
  return (
    <section className="ent-panel du-role-panel" aria-labelledby={`du-role-${roleId}`}>
      <h2 id={`du-role-${roleId}`}>Demo Research Universe</h2>
      <p className="ent-lead">{slice.summary}</p>
      <p className="ent-banner" role="status">
        Adapter schema {slice.schemaVersion} · catalog duplication:{" "}
        {String(slice.duplicatesCatalog)} · production write:{" "}
        {String(slice.canWriteToProductionGraph)} · scientific approval:{" "}
        {String(slice.honesty.scientificApproval)}
      </p>
      <ul className="du-role-cards">
        {slice.cards.map((card) => (
          <li key={card.scenarioId}>
            <Link to={card.href}>
              <strong>{card.title}</strong>
              <span>
                {card.domain} · {card.investigationId}
              </span>
              <span className="du-role-q">{card.question}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="ent-lead">
        Shared nodes in this slice: {slice.sharedNodeIds.length}.{" "}
        <Link to={slice.comparisonSurface}>Open full comparison UI</Link>
      </p>
    </section>
  );
}
