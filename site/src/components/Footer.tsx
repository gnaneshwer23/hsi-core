import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "../lib/brand";

const PLATFORM_LINKS = [
  { to: "/platform", label: "Platform" },
  { to: "/products", label: "Products" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/explore", label: "Explore" },
  { to: "/discovery", label: "Discovery" },
] as const;

const PRODUCT_LINKS = [
  { to: "/for-aksh", label: "For Aksh" },
  { to: "/for-trials", label: "For Trials" },
  { to: "/for-isi", label: "For ISI research" },
] as const;

const PROGRESS_LINKS = [
  { to: "/status", label: "Status" },
  { to: "/roadmap", label: "Roadmap" },
] as const;

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div className="footer-brand">{PRODUCT_NAME}</div>
          <p className="footer-tagline">{PRODUCT_TAGLINE}</p>
          <p className="footer-honesty">
            No PHI · no invented MoU.
          </p>
          <Link to="/status" className="footer-status-link">
            What&apos;s available <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div>
          <h4>Platform</h4>
          <ul>
            {PLATFORM_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Products</h4>
          <ul>
            {PRODUCT_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Progress</h4>
          <ul>
            {PROGRESS_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>{PRODUCT_NAME} · four-product ecosystem</span>
        <Link to="/status">Available · In development · Planned</Link>
      </div>
    </footer>
  );
}
