import { HsiIdentity } from "./HsiIdentity";
import { Link } from "react-router-dom";
import "../styles/chrome-redesign.css";

const groups = [
  {
    name: "Product",
    links: [
      { to: "/welcome", label: "Set up your research home" },
      { to: "/research/home", label: "Research app" },
      { to: "/demo/universe", label: "Demonstration workspace" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/knowledge-graph", label: "Knowledge graph" },
      { to: "/validation", label: "Scientific Validation" },
      { to: "/contact", label: "Pricing & Access" },
    ],
  },
  {
    name: "Audiences",
    links: [
      { to: "/researchers", label: "Researchers" },
      { to: "/enterprise", label: "Research Groups" },
      { to: "/biotech", label: "Biotech & Pharma" },
      { to: "/clinical", label: "Clinical Research" },
      { to: "/laboratories", label: "Laboratories" },
      { to: "/research-community", label: "Research Community" },
    ],
  },
  {
    name: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/about#collaboration", label: "Collaboration" },
    ],
  },
  {
    name: "Trust",
    links: [
      { to: "/trust", label: "Governance" },
      { to: "/validation", label: "Validation methodology" },
      { to: "/trust#privacy", label: "Privacy information" },
      { to: "/trust#terms", label: "Research use information" },
      { to: "/trust#accessibility", label: "Accessibility" },
      { to: "/trust#security", label: "Security information" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="hsi-footer" aria-label="Site footer">
      <ul className="hsi-footer-status" aria-label="Current status">
        <li>Research preview</li>
        <li>Candidate-only graph, nothing scientifically approved</li>
        <li>No clinical advice. Patient data in this preview is synthetic</li>
      </ul>
      <div className="hsi-footer-grid">
        <div className="hsi-footer-brand">
          <Link className="hsi-wordmark" to="/">
            <HsiIdentity />
          </Link>
          <p>Biological relationships. Evidence. Experimental context.</p>
          <Link className="hsi-text-link" to="/contact">
            Request research access
          </Link>
        </div>
        {groups.map((g) => (
          <nav aria-label={`Footer ${g.name.toLowerCase()}`} key={g.name}>
            <h2>{g.name}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={`${g.name}-${l.to}`}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="hsi-footer-bottom">
        <span>© {new Date().getFullYear()} Human Super Intelligence</span>
        <p>
          For research and education. No clinical decision support is offered here, and no real patient data is held.
        </p>
      </div>
    </footer>
  );
}
