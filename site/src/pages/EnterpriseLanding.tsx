import { Link } from "react-router-dom";
import "../styles/enterprise-dashboard.css";

/** Role picker for HSI Enterprise dashboard shells (PR1). */
export function EnterpriseLandingPage() {
  return (
    <div className="ent-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="ent-landing">
        <span className="ent-badge">Enterprise preview · not a separate product</span>
        <h1>Research intelligence for groups and individual researchers</h1>
        <p className="ent-banner" role="status">
          HSI is disease-agnostic scientific intelligence. These shells preview
          professor and student workspaces on the existing substrate. People,
          metrics and any autoimmune / SSc scenario below are labelled demonstration
          data — not the product boundary. They do not enable production writes, PHI,
          or durable organisation tables.
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
          <Link className="ent-btn ent-btn-secondary" to="/research/dashboard">
            Existing research dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
