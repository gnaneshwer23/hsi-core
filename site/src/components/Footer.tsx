import { Link } from "react-router-dom";
import { ENGINEERING_LINKS } from "../lib/productMaturity";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">HSI</div>
          <p className="muted" style={{ maxWidth: "22rem", fontSize: "1rem" }}>
            One ecosystem, four products. Evidence backbone for immune-science discovery.
            Not clinical decision support.
          </p>
        </div>
        <div>
          <h4>Products</h4>
          <ul>
            <li>
              <Link to="/products">Four products</Link>
            </li>
            <li>
              <Link to="/status">Status (Available / In-dev / Planned)</Link>
            </li>
            <li>
              <Link to="/for-isi">ISI (research · Available)</Link>
            </li>
            <li>
              <Link to="/for-aksh">Aksh (scoped · Available)</Link>
            </li>
            <li>
              <Link to="/discovery">Discovery Centre</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Trust</h4>
          <ul>
            <li>
              <Link to="/evidence">Evidence &amp; Gate C</Link>
            </li>
            <li>
              <span className="muted">Research intelligence ≠ CDS</span>
            </li>
            <li>
              <span className="muted">Human Gate C only</span>
            </li>
            <li>
              <span className="muted">Never “confirmed eligible”</span>
            </li>
          </ul>
        </div>
        <div>
          <h4>Engineering (secondary)</h4>
          <ul>
            {ENGINEERING_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
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
      </div>
      <div className="container footer-bottom">
        <span>HSI · four-product ecosystem honesty</span>
        <span>No PHI · no invented MoU · no fake Available chips</span>
      </div>
    </footer>
  );
}
