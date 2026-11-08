import {Link} from "react-router-dom";
import {PRODUCT_NAME, PRODUCT_TAGLINE} from "../lib/brand";
import {PRIMARY_NAV_LINKS} from "../lib/primaryNav";

const COMPANY_LINKS = [
  {to: "/about", label: "About"},
  {to: "/contact", label: "Collaborate"},
  {to: "/contact", label: "Contact"},
] as const;

const TRUST_LINKS = [
  {to: "/evidence-safety", label: "Science & Validation"},
  {to: "/evidence-safety", label: "Privacy"},
  {to: "/evidence-safety", label: "Terms"},
] as const;

export function Footer() {
  return (
    <footer className="footer site-footer" aria-label="Site footer">
      <div className="footer-wrap footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand" aria-label={`${PRODUCT_NAME} home`}>
            <span className="footer-mark" aria-hidden="true">
              H
            </span>
            <span>{PRODUCT_NAME}</span>
          </Link>
          <p className="footer-tagline">{PRODUCT_TAGLINE}</p>
          <p className="footer-honesty">
            HSI is a research intelligence platform under development. Research outputs are not clinical diagnoses,
            treatment recommendations or independently validated discoveries unless explicitly identified as such.
          </p>
          <Link to="/contact" className="footer-contact">
            Collaborate <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.5"/></svg>
          </Link>
        </div>
        <nav aria-label="Footer explore">
          <h2>Explore</h2>
          <ul>
            {PRIMARY_NAV_LINKS.filter((l) => l.to !== "/science").map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer company">
          <h2>Company</h2>
          <ul>
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer trust">
          <h2>Trust</h2>
          <ul>
            {TRUST_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer-wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} {PRODUCT_NAME}
        </span>
        <span className="footer-scope">Research use · Human oversight</span>
        <nav aria-label="Research information">
          <Link to="/evidence-safety">Science &amp; Trust</Link>
          <Link to="/contact">Collaborate</Link>
        </nav>
      </div>
    </footer>
  );
}
