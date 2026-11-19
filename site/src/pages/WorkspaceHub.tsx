import { Link } from "react-router-dom";
import { listWorkspaceDefinitions } from "@hsi/enterprise/workspaceDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Interactive concept hub — select among eight connected HSI workspaces (Stage 4 shell F). */
export function WorkspaceHubPage() {
  const workspaces = listWorkspaceDefinitions();

  return (
    <div className="ent-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="ent-landing ws-hub">
        <span className="ent-badge">
          Multi-workspace hub · Stage 4 shell F · shared scientific engine
        </span>
        <h1>HSI Research Intelligence</h1>
        <p className="ws-hub-kicker">Connected scientific ecosystem</p>
        <p className="ent-banner" role="status">
          Switch between roles, explore modules and inspect how researchers,
          organisations, evidence and scientific opportunities connect. All
          numbers, profiles, investigations, alerts and opportunities are
          illustrative — not a connected HSI deployment or evidence-validation
          result. Soft-landed Stage 4 audience shells (A–E) stay linked below;
          this hub does not fork the science engine.
        </p>

        <h2 className="ws-hub-select">Select workspace</h2>
        <div className="ent-role-cards ws-hub-cards">
          {workspaces.map((w) => (
            <article key={w.id} className="ent-role-card">
              <h2>{w.label}</h2>
              <p>{w.tagline}</p>
              <p className="ent-lead" style={{ margin: "0.5rem 0 0" }}>
                {w.audience}. Build priority {w.buildPriority}.
              </p>
              <div className="ent-actions" style={{ marginTop: "0.85rem" }}>
                <Link className="ent-btn" to={`/workspaces/${w.id}`}>
                  Open {w.shortLabel} concept
                </Link>
                {w.stage4ShellPath ? (
                  <Link className="ent-btn ent-btn-secondary" to={w.stage4ShellPath}>
                    Stage 4 shell
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <section className="ent-panel" aria-labelledby="ws-connect-heading">
          <h2 id="ws-connect-heading">How the dashboards connect</h2>
          <p className="ent-lead">
            Individual researchers, academic groups (professor and students),
            biotech, clinical research, laboratories, research networks and
            enterprise administration all call the same investigation engine —
            living knowledge graph, evidence verification and cross-domain
            intelligence — then feed research decisions, briefs and authorised
            collaborations.
          </p>
          <ul>
            <li>Reusable navigation, domain map, evidence cards and AI panels</li>
            <li>
              Clinical cohorts stay disabled until governance; PHI stays out of
              this plane
            </li>
            <li>
              Roles ≠ subscriptions — enterprise seats do not unlock confidential
              science
            </li>
          </ul>
        </section>

        <div className="ent-actions">
          <Link className="ent-btn ent-btn-secondary" to="/research/workspace">
            Open live investigation
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/academic">
            Academic shells (A)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/biotech">
            Biotech shell (B)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/clinical">
            Clinical shell (C)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/lab">
            Lab shell (D)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/community">
            Community shell (E)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/participant">
            Participant shell (G)
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/funding">
            Funding shell (H)
          </Link>
        </div>
      </div>
    </div>
  );
}
