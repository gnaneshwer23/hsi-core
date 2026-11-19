import { Link } from "react-router-dom";
import { FirstPilotShell } from "../components/enterprise/FirstPilotShell";
import { firstPilotDashboardDemo } from "@hsi/enterprise/firstPilotDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** First researcher pilot design shell — never claims pilot ready. */
export function FirstPilotDashboard() {
  const demo = firstPilotDashboardDemo();

  return (
    <FirstPilotShell
      title={demo.programmeName}
      subtitle="Audit §I · invite-only · Stage 2 journey is the build centre"
    >
      <p className="ent-banner" role="status">
        {demo.governanceNote}
      </p>

      <section className="ent-stats" aria-label="Pilot design summary">
        <article className="ent-stat">
          <strong>{demo.summary.proposedResearcherCount}</strong>
          <span>Proposed invitees</span>
          <em>Not invented users</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.prerequisiteCount}</strong>
          <span>Owner gates</span>
          <em>Blocked</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.successSignalCount}</strong>
          <span>Success signals</span>
          <em>No conversion %</em>
        </article>
        <article className="ent-stat">
          <strong>0</strong>
          <span>Pilot ready claimed</span>
          <em>Always false</em>
        </article>
      </section>

      <section className="ent-panel" aria-labelledby="pilot-proposal-heading">
        <h2 id="pilot-proposal-heading">Proposed pilot</h2>
        <dl className="ent-opp">
          <div>
            <dt>Size</dt>
            <dd>{demo.proposal.size}</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>{demo.proposal.scope}</dd>
          </div>
          <div>
            <dt>Success</dt>
            <dd>{demo.proposal.success}</dd>
          </div>
          <div>
            <dt>Forbidden</dt>
            <dd>{demo.proposal.forbidden}</dd>
          </div>
        </dl>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="pilot-prereq-heading">
          <h2 id="pilot-prereq-heading">Prerequisites (owner-gated)</h2>
          <p className="ent-lead">
            All remain blocked until the owner closes them — soft-land green ≠ pilot
            ready.
          </p>
          <ul>
            {demo.prerequisites.map((p) => (
              <li key={p.id}>
                <strong>{p.label}</strong> · {p.status.replaceAll("_", " ")}. {p.note}
                <div className="ent-actions">
                  <Link className="ent-btn ent-btn-secondary" to={p.nextSurface}>
                    Related surface
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="ent-panel" aria-labelledby="pilot-success-heading">
          <h2 id="pilot-success-heading">Success signals (measure; do not invent)</h2>
          <ul>
            {demo.successSignals.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong> · {s.measure}. Conversion invented:{" "}
                {String(s.inventsConversion)}. {s.note}
              </li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn" to="/research/home">
              Open §H local metrics
            </Link>
            <Link className="ent-btn ent-btn-secondary" to="/research/workspace">
              Live investigation
            </Link>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="pilot-oos-heading">
        <h2 id="pilot-oos-heading">Not in this pilot</h2>
        <ul>
          {demo.outOfScope.map((o) => (
            <li key={o.id}>
              <strong>{o.label}</strong> — {o.reason}
            </li>
          ))}
        </ul>
        <div className="ent-actions">
          <Link className="ent-btn ent-btn-secondary" to="/workspaces">
            Multi-workspace hub (demo)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/funding">
            Funding shell (demo)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/participant">
            Participant shell (demo)
          </Link>
        </div>
      </section>
    </FirstPilotShell>
  );
}
