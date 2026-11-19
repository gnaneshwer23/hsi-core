import { Link } from "react-router-dom";
import {
  BLOCKED_JOURNEY_STEPS_HONESTY,
  type BlockedJourneyStepsPack,
} from "@hsi/investigation/blockedJourneyStepsHonesty";

/** Journey steps 12–13 — explicitly blocked; no invented sharing or live re-review. */
export function BlockedJourneyStepsPanel({
  pack,
  onOpenLibrary,
}: {
  pack: BlockedJourneyStepsPack;
  onOpenLibrary: () => void;
}) {
  return (
    <section className="ws-card ws-blocked-steps" aria-labelledby="ws-b12-h">
      <header>
        <h2 id="ws-b12-h">Steps 12–13 (blocked)</h2>
      </header>
      <p className="ws-muted">
        Beyond Stage 2 exit · org sharing: {String(BLOCKED_JOURNEY_STEPS_HONESTY.orgSharingEnabled)} ·
        collaborator links: {String(BLOCKED_JOURNEY_STEPS_HONESTY.collaboratorLinksEnabled)} · live
        source refresh accepted:{" "}
        {String(BLOCKED_JOURNEY_STEPS_HONESTY.liveSourceRefreshAccepted)} · prior approvals
        transfer: {String(BLOCKED_JOURNEY_STEPS_HONESTY.priorApprovalsTransfer)} · invents sharing
        authority: {String(BLOCKED_JOURNEY_STEPS_HONESTY.inventsSharingAuthority)} · production
        writes: {String(BLOCKED_JOURNEY_STEPS_HONESTY.productionWritesEnabled)} · journey complete
        claimed: {String(BLOCKED_JOURNEY_STEPS_HONESTY.journeyCompleteClaimed)}
      </p>
      <p className="ws-warn" role="status">
        {pack.note}
      </p>

      <ul className="ws-b12-list">
        {pack.steps.map((step) => (
          <li key={step.id}>
            <p className="ws-tagline">
              Step {step.stepNumber} · {step.status}
            </p>
            <b>{step.title}</b>
            <p className="ws-muted">
              <b>Why blocked:</b> {step.whyBlocked}
            </p>
            <p className="ws-muted">
              <b>Available instead:</b> {step.availableInstead}
            </p>
            <p className="ws-muted">
              <b>Authority needed:</b> {step.authorityNeeded}
            </p>
          </li>
        ))}
      </ul>

      <div className="ws-row-actions">
        <button type="button" className="ws-btn" onClick={onOpenLibrary}>
          {pack.browserReopenAvailable
            ? "Open browser library / reopen path"
            : "Open connected save panel"}
        </button>
        <Link className="ws-btn" to="/research/home">
          Research Home
        </Link>
      </div>
      {pack.briefHash ? (
        <p className="ws-muted">
          Current briefHash <code>{pack.briefHash.slice(0, 12)}…</code> · browser library entries:{" "}
          {pack.libraryCount}
        </p>
      ) : (
        <p className="ws-muted">No briefHash yet — run and save before reopen continuity applies.</p>
      )}
    </section>
  );
}
