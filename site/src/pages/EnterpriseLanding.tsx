import { Link } from "react-router-dom";
import "../styles/enterprise-dashboard.css";

/** Academic Research Dashboard — role picker (Stage 4 shell; shared science engine). */
export function EnterpriseLandingPage() {
  return (
    <div className="ent-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="ent-landing">
        <span className="ent-badge">Academic Research Dashboard · demonstration · not a separate product</span>
        <h1>Academic Research Dashboard</h1>
        <p className="ent-banner" role="status">
          HSI is disease-agnostic scientific intelligence. These shells preview
          professor and student academic workspaces on the shared substrate —
          profiles, group intelligence trees, cross-domain discoveries, evidence
          gaps, publications, and supervision. People, metrics and any autoimmune /
          SSc scenario below are labelled demonstration data — not the product
          boundary. They do not enable production writes, PHI, or durable
          organisation tables.
        </p>
        <div className="ent-role-cards">
          <Link className="ent-role-card" to="/enterprise/professor">
            <h2>Professor / PI workspace</h2>
            <p>
              Group overview, research intelligence tree, team roster and
              cross-domain opportunity radar — all demonstration-labelled.
            </p>
            <span className="ent-btn">Open professor shell</span>
          </Link>
          <Link className="ent-role-card" to="/enterprise/student">
            <h2>Student / researcher workspace</h2>
            <p>
              Personal research dashboard, interests, feed honesty and links into
              the live investigation workspace.
            </p>
            <span className="ent-btn">Open student shell</span>
          </Link>
        </div>
        <div className="ent-actions">
          <Link className="ent-btn ent-btn-secondary" to="/research/workspace">
            Open live investigation
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/research/home">
            Research home
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/research/gaps">
            Gap register
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/biotech">
            Biotech / Pharma shell
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/clinical">
            Clinical research shell
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/lab">
            Lab / Omics shell
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/community">
            Community shell
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/workspaces">
            Multi-workspace hub (F)
          </Link>
        </div>
        <section className="ent-panel" aria-labelledby="ent-workspaces-heading">
          <h2 id="ent-workspaces-heading" style={{ margin: 0, fontSize: "1.05rem" }}>
            Stage 4 shells A–E + hub F (same engine)
          </h2>
          <p className="ent-lead">
            Audience shells A–E and the multi-workspace hub (F) preview chrome on the
            shared substrate — they must reuse the shared scientific engine, not fork
            it. Content contracts:{" "}
            <code>docs/strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md</code>. Clinical
            research is not CDS; patient participation stays a future governed path.
            Circles durable store remains held.
          </p>
          <ul>
            <li>Academic research — this preview</li>
            <li>
              Biotech / pharma R&amp;D —{" "}
              <Link to="/enterprise/biotech">demonstration shell</Link>
            </li>
            <li>
              Clinical research —{" "}
              <Link to="/enterprise/clinical">synthetic demonstration</Link> (not CDS;
              PHI gated)
            </li>
            <li>
              Laboratory &amp; omics —{" "}
              <Link to="/enterprise/lab">demonstration shell</Link>
            </li>
            <li>
              Research community —{" "}
              <Link to="/enterprise/community">demonstration shell</Link>
            </li>
            <li>
              Multi-workspace hub —{" "}
              <Link to="/workspaces">eight-role concept</Link> (researcher +
              enterprise admin + deep-links to A–E)
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
