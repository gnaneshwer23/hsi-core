import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">HSI</div>
          <p className="muted" style={{ maxWidth: "22rem", fontSize: "1rem" }}>
            Evidence and provenance backbone for immune-science discovery.
            Powers ISI research exploration. Not clinical decision support.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li>
              <Link to="/discovery">Discovery</Link>
            </li>
            <li>
              <Link to="/evidence">Evidence & Gate C</Link>
            </li>
            <li>
              <Link to="/for-isi">ISI workspace</Link>
            </li>
            <li>
              <Link to="/docs">Technical docs</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Collaborators</h4>
          <ul>
            <li>
              <Link to="/roadmap">Development status</Link>
            </li>
            <li>
              <Link to="/alignment">Repo alignment</Link>
            </li>
            <li>
              <Link to="/curator">Curator</Link>
            </li>
            <li>
              <a
                href="https://github.com/gnaneshwer23/hsi-core"
                target="_blank"
                rel="noreferrer"
              >
                Repository ↗
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Boundaries</h4>
          <ul>
            <li>
              <span className="muted">Research intelligence ≠ CDS</span>
            </li>
            <li>
              <span className="muted">Human Gate C only</span>
            </li>
            <li>
              <Link to="/for-aksh">Aksh (separate / gated)</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>HSI Core · evidence backbone for ISI</span>
        <span>No PHI · no invented grades</span>
      </div>
    </footer>
  );
}
