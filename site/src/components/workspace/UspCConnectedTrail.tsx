import type { UspCTrailStep } from "@hsi/investigation/uspCConnectedTrail";

/** Visual USP C product trail — Profile → Workspace → Save → Reopen → Brief. */
export function UspCConnectedTrail({
  steps,
  onSelect,
}: {
  steps: readonly UspCTrailStep[];
  onSelect: (id: UspCTrailStep["id"]) => void;
}) {
  return (
    <nav className="ws-usp-trail ws-usp-c-trail" aria-label="USP C connected research journey">
      <p className="ws-usp-trail-kicker">
        USP C · Connected research intelligence · personal path · browser-local
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
