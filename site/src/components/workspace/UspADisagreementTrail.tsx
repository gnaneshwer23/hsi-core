import type { UspATrailStep } from "@hsi/investigation/uspADisagreementTrail";

/** Visual USP A product trail — Ask → Evidence → Passport → Why differ → Brief. */
export function UspADisagreementTrail({
  steps,
  onSelect,
}: {
  steps: readonly UspATrailStep[];
  onSelect: (id: UspATrailStep["id"]) => void;
}) {
  return (
    <nav className="ws-usp-trail" aria-label="USP A disagreement journey">
      <p className="ws-usp-trail-kicker">
        USP A · Explain scientific disagreement · demonstration of the product trail
      </p>
      <ol className="ws-usp-trail-list">
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
