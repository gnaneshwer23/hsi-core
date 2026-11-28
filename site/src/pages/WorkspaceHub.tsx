import { Link } from "react-router-dom";
import { listWorkspaceDefinitions } from "@hsi/enterprise/workspaceDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Interactive concept hub — select among eight connected HSI workspaces (Stage 4 shell F). */
export function WorkspaceHubPage() {
  const workspaces = listWorkspaceDefinitions();

  return (
    <div className="ent-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="ent-landing ws-hub">
        <h1>HSI Research Intelligence</h1>
        <p className="ws-hub-kicker">Workspaces by role</p>
        <p className="ent-banner" role="status">
          Each workspace below shows how HSI could look for one kind of
          researcher. Their numbers, profiles, investigations and alerts are
          illustrative, not real data. The graph workspace further down runs on
          the published graph.
        </p>

        <h2 className="ws-hub-select">Select workspace</h2>
        <div className="ent-role-cards ws-hub-cards">
          {workspaces.map((w) => (
            <article key={w.id} className="ent-role-card">
              <h2>{w.label}</h2>
              <p>{w.tagline}</p>
              <p className="ent-lead" style={{ margin: "0.5rem 0 0" }}>
                {w.audience}.
              </p>
              <div className="ent-actions" style={{ marginTop: "0.85rem" }}>
                <Link className="ent-btn" to={`/workspaces/${w.id}`}>
                  Open the {w.shortLabel} workspace
                </Link>
                {w.stage4ShellPath ? (
                  <Link className="ent-btn ent-btn-secondary" to={w.stage4ShellPath}>
                    Earlier version
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <section className="ent-panel" aria-labelledby="ws-graph-heading">
          <h2 id="ws-graph-heading">Living Intelligence Graph</h2>
          <p className="ent-lead">
            Unlike the illustrative workspaces above, this runs on the published
            candidate graph: real sources, every relationship unreviewed. It
            offers 2D, 3D and table views, an evidence inspector, contradiction
            and hypothesis modes, and deterministic NEXUS checks.
          </p>
          <div className="ent-actions">
            <Link className="ent-btn" to="/workspace/graph">Open the graph workspace</Link>
          </div>
        </section>

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
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/pilot">
            Pilot design (I)
          </Link>
        </div>
      </div>
    </div>
  );
}
