import { Link } from "react-router-dom";
import {
  USP_C_TRAIL_HONESTY,
} from "@hsi/investigation/uspCConnectedTrail";
import type { LiveRunLibraryEntry } from "@hsi/investigation/liveRunLibrary";
import type { Profile } from "../../lib/researchHome";
import { departmentBySlug } from "../../lib/departments";
import { liveInvestigationHref } from "../../lib/workbenchPrimary";

/** Personal connected path: profile handoff, browser library, blocked org sharing. */
export function UspCConnectedPanel({
  profile,
  library,
  savedThisSession,
  reopenedThisSession,
  hasRun,
  onSave,
  onReopen,
  onOpenBrief,
}: {
  profile: Profile;
  library: readonly LiveRunLibraryEntry[];
  savedThisSession: boolean;
  reopenedThisSession: boolean;
  hasRun: boolean;
  onSave: () => void;
  onReopen: (id: string) => void;
  onOpenBrief: () => void;
}) {
  const interestNames = profile.interests.map(
    (i) => departmentBySlug(i)?.name ?? i,
  );

  return (
    <section className="ws-card ws-connected" aria-labelledby="ws-conn-h">
      <header>
        <h2 id="ws-conn-h">Connected research (personal)</h2>
      </header>
      <p className="ws-muted">
        USP C personal path: profile → live workspace → browser save/reopen → brief continuity.
        Production writes: {String(USP_C_TRAIL_HONESTY.productionWritesEnabled)}. Durable server
        profile claimed: {String(USP_C_TRAIL_HONESTY.serverProfileDurableClaimed)}. Org sharing:{" "}
        blocked. Alerts are preferences, not live delivery.
      </p>

      <div className="ws-conn-grid">
        <div className="ws-conn-block">
          <h3>Profile handoff</h3>
          {!profile.onboarded ? (
            <p className="ws-muted">
              No onboarding profile yet.{" "}
              <Link to="/welcome">Tell us what you work on</Link>, then return via Research Home.
            </p>
          ) : (
            <>
              <p>
                <b>{profile.question.trim() || "No research question stored"}</b>
              </p>
              <p className="ws-muted">
                {interestNames.length
                  ? `Interests: ${interestNames.slice(0, 6).join(", ")}`
                  : "No interests selected yet"}
                {profile.role ? ` · ${profile.role}` : ""}
              </p>
              <p className="ws-warn" role="status">
                Update cadence: {profile.cadence}. This is a preference only — live alert delivery
                is not enabled.
              </p>
              <div className="ws-row-actions">
                <Link className="ws-btn" to="/research/home">
                  Open Research Home
                </Link>
                <Link className="ws-btn" to="/welcome">
                  Edit setup
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="ws-conn-block">
          <h3>Browser investigation library</h3>
          <p className="ws-muted">
            Saves stay on this device. Same briefHash version can be reopened. Not a server store;
            not shareable with collaborators yet.
          </p>
          {library.length === 0 ? (
            <p className="ws-muted">No browser-saved live runs yet.</p>
          ) : (
            <ul className="ws-conn-list">
              {library.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <b>{entry.question}</b>
                    <span className="ws-muted">
                      {entry.checked} checked · {entry.supporting} supporting ·{" "}
                      {entry.opposing} opposing · {entry.candidateCount} candidates · saved{" "}
                      {new Date(entry.savedAt).toLocaleString("en-GB", {
                        timeZone: "Europe/London",
                      })}{" "}
                      (Europe/London)
                    </span>
                  </div>
                  <button type="button" className="ws-btn" onClick={() => onReopen(entry.id)}>
                    Reopen
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="ws-row-actions">
            <button
              type="button"
              className="ws-run"
              onClick={onSave}
              disabled={!hasRun}
            >
              {savedThisSession ? "Saved to browser library" : "Save to browser library"}
            </button>
            <Link className="ws-btn" to={liveInvestigationHref({ reopen: true })}>
              Reopen current slot
            </Link>
            <button type="button" className="ws-btn" onClick={onOpenBrief} disabled={!hasRun}>
              Open decision brief
            </button>
          </div>
          {reopenedThisSession ? (
            <p className="ws-muted" role="status">
              Reopened from this browser’s library for this session.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
