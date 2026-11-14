import {HsiIdentity} from "./HsiIdentity";
import { Link } from "react-router-dom";
import { RESEARCH_NAV_LINKS } from "../lib/primaryNav";
import "../styles/chrome-redesign.css";
const groups = [
  {
    name: "Explore",
    links: [
      { to: "/knowledge-graph", label: "Knowledge graph" },
      { to: "/platform", label: "Platform" },
      { to: "/science", label: "Science" },
      { to: "/applications", label: "Applications" },
      {to:"/intelligence",label:"Intelligence Collective"},
      {to:"/how-it-works",label:"How it works"},
    ],
  },
  { name: "Research", links: RESEARCH_NAV_LINKS },
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
        <li>No clinical advice or patient data</li>
      </ul>
      <div className="hsi-footer-grid">
        <div className="hsi-footer-brand">
          <Link className="hsi-wordmark" to="/">
            <HsiIdentity/>
          </Link>
          <p>Connecting human biology through evidence, context and independent scientific judgement.</p>
          <Link className="hsi-text-link" to="/contact">
            Request research access
          </Link>
        </div>
        {groups.map((g) => (
          <nav aria-label={`Footer ${g.name.toLowerCase()}`} key={g.name}>
            <h2>{g.name}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={l.to}>
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
          For research and education. No clinical decision support or patient-level integration is offered
          here.
        </p>
        <Link to="/status">Capability status</Link>
      </div>
    </footer>
  );
}
