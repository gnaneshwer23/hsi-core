import { Link } from "react-router-dom";
import {
  PROFILE_WORKSPACE_HANDOFF_HONESTY,
  type ProfileWorkspaceHandoff,
} from "@hsi/investigation/profileWorkspaceHandoff";
import { Icon } from "./AppIcons";

/** Activation card: Welcome interests → continue into the live workspace. */
export function ProfileWorkspaceHandoffCard({
  handoff,
  highlight,
}: {
  handoff: ProfileWorkspaceHandoff;
  highlight?: boolean;
}) {
  if (!handoff.ready) return null;

  return (
    <section
      className="rh-card rh-handoff"
      aria-labelledby="rh-handoff-h"
      data-highlight={highlight ? "true" : undefined}
    >
      <header className="rh-card-top">
        <span className="rh-tile rh-t-teal">
          <Icon name="flask" size={22} />
        </span>
        <div>
          <h2 id="rh-handoff-h">Continue to live investigation</h2>
          <p className="rh-sub">
            Profile → Research Home → workspace. Device-local only. Durable server profile:{" "}
            {String(PROFILE_WORKSPACE_HANDOFF_HONESTY.serverProfileDurableClaimed)}. Production
            writes: {String(PROFILE_WORKSPACE_HANDOFF_HONESTY.productionWritesEnabled)}.
          </p>
        </div>
      </header>
      {handoff.question ? (
        <p>
          <b>{handoff.question}</b>
        </p>
      ) : (
        <p className="rh-note">No research question stored — interests still hand off for continuity.</p>
      )}
      {handoff.interestLabels.length > 0 ? (
        <p className="rh-note">Focus: {handoff.interestLabels.join(", ")}</p>
      ) : null}
      <p className="rh-note" role="status">
        {handoff.note}
      </p>
      <div className="rh-row">
        <Link className="rh-primary" to={handoff.workspaceHref}>
          {handoff.liveRunAvailable
            ? "Open live investigation"
            : "Open workspace with this profile"}{" "}
          <Icon name="arrow" size={16} />
        </Link>
        <Link className="rh-ghost" to="/welcome">
          Edit setup
        </Link>
      </div>
    </section>
  );
}
