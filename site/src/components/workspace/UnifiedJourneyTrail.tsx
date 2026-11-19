import type { UnifiedJourneyStep } from "@hsi/investigation/unifiedJourneyTrail";
import { UNIFIED_JOURNEY_HONESTY } from "@hsi/investigation/unifiedJourneyTrail";

/** Primary Stage 2 product trail — one continuous Ask → … → Save path. */
export function UnifiedJourneyTrail({
  steps,
  onSelect,
}: {
  steps: readonly UnifiedJourneyStep[];
  onSelect: (id: UnifiedJourneyStep["id"]) => void;
}) {
  return (
    <nav className="ws-usp-trail ws-unified-trail" aria-label="Scientific investigation journey">
      <p className="ws-usp-trail-kicker">
        Scientific investigation journey · Stage 2 spine · journey complete claimed:{" "}
        {String(UNIFIED_JOURNEY_HONESTY.researcherJourneyCompleteClaimed)} · scientific approval:{" "}
        {String(UNIFIED_JOURNEY_HONESTY.scientificApproval)} · production writes:{" "}
        {String(UNIFIED_JOURNEY_HONESTY.productionWritesEnabled)}
      </p>
      <ol className="ws-usp-trail-list ws-unified-trail-list">
        {steps.map((s, i) => (
          <li key={s.id} data-state={s.state}>
            {i > 0 ? <span className="ws-usp-trail-join" aria-hidden="true" /> : null}
            <button
              type="button"
              className="ws-usp-trail-step"
              aria-current={s.state === "active" ? "step" : undefined}
              title={s.detail}
              onClick={() => onSelect(s.id)}
            >
              <span className="ws-usp-trail-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="ws-usp-trail-copy">
                <b>{s.label}</b>
                <small>{s.detail}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
