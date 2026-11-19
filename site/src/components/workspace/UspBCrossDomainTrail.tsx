import type { UspBTrailStep } from "@hsi/investigation/uspBCrossDomainTrail";

/** Visual USP B product trail — Ask → Domains → Pathways → Gaps → Brief. */
export function UspBCrossDomainTrail({
  steps,
  onSelect,
}: {
  steps: readonly UspBTrailStep[];
  onSelect: (id: UspBTrailStep["id"]) => void;
}) {
  return (
    <nav className="ws-usp-trail ws-usp-b-trail" aria-label="USP B cross-domain journey">
      <p className="ws-usp-trail-kicker">
        USP B · Cross-domain scientific investigation · published graph candidates only
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
