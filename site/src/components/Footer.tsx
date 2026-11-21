import { HsiIdentity } from "./HsiIdentity";
import { Link } from "react-router-dom";
import "../styles/chrome-redesign.css";

const groups = [
  {
    name: "Product",
    links: [
      { to: "/", label: "Home" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/knowledge-graph", label: "Knowledge Graph" },
      { to: "/intelligence", label: "Scientific Intelligence" },
      { to: "/researchers", label: "For Researchers" },
      { to: "/research-community", label: "Community" },
      { to: "/demo/universe", label: "Example investigation" },
      { to: "/research/home", label: "Research app" },
    ],
  },
  {
    name: "Audiences",
    links: [
      { to: "/researchers", label: "Researchers" },
      { to: "/enterprise", label: "Research groups" },
      { to: "/biotech", label: "Biotech teams" },
      { to: "/clinical", label: "Clinical research" },
      { to: "/laboratories", label: "Laboratories" },
      { to: "/research-community", label: "Research community" },
      { to: "/research-gaps", label: "Research Gaps" },
      { to: "/scientific-companion", label: "Scientific Companion" },
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
      { to: "/validation", label: "Validation" },
      { to: "/trust", label: "Trust" },
      { to: "/trust#validation", label: "Validation methodology" },
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
        <li>No clinical advice. No patient data on this site</li>
      </ul>
      <div className="hsi-footer-grid">
        <div className="hsi-footer-brand">
          <Link className="hsi-wordmark" to="/">
            <HsiIdentity />
          </Link>
          <p>Human Super Intelligence is developing evidence-grounded scientific intelligence for exploring biological mechanisms, evaluating research findings and identifying questions worth investigating.</p>
          <p>Research preview. Not clinical decision support. AI-generated interpretations and candidate relationships are not automatically scientifically validated.</p>
          <Link className="hsi-text-link" to="/contact">
            Request Research Access
          </Link>
        </div>
        {groups.map((g) => (
          <nav aria-label={`Footer ${g.name.toLowerCase()}`} key={g.name}>
            <h2>{g.name}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={`${g.name}-${l.to}-${l.label}`}>
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
