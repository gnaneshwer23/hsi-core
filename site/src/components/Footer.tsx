import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">HSI</div>
          <p className="muted" style={{ maxWidth: "22rem", fontSize: "1rem" }}>
            Human Systems Intelligence — shared evidence substrate for clinic-safe
            HITL and discovery. Graph before agents. No PHI. No invented grades.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/systems">Systems</Link>
            </li>
            <li>
              <Link to="/evidence">Evidence & Gate C</Link>
            </li>
            <li>
              <Link to="/roadmap">Roadmap</Link>
            </li>
            <li>
              <Link to="/docs">Docs</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Consumers</h4>
          <ul>
            <li>
              <Link to="/for-isi">For ISI</Link>
            </li>
            <li>
              <Link to="/for-aksh">For Aksh</Link>
            </li>
            <li>
              <Link to="/alignment">Repo alignment</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Non-negotiables</h4>
          <ul>
            <li>
              <span className="muted">Graph + Gate C before agents</span>
            </li>
            <li>
              <span className="muted">ISI ≠ CDS</span>
            </li>
            <li>
              <span className="muted">Edit only hsi-core</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Human Systems Intelligence</span>
        <span>hsi-core · sole edit target</span>
      </div>
    </footer>
  );
}
