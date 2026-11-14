import {HsiIdentity} from "./HsiIdentity";
import { Link } from "react-router-dom";
import {RESEARCH_NAV_LINKS} from "../lib/primaryNav";
import {departments,departmentPath} from "../lib/departments";
import "../styles/scientific-footer.css";
const groups = [
  {name:"Science",links:departments.map(d=>({to:departmentPath(d.slug),label:d.name}))},
  {name:"Research",links:[{to:"/research/knowledge-graph",label:"Knowledge Graph"},...RESEARCH_NAV_LINKS]},
  {name:"Technology",links:[
    {to:"/platform",label:"Platform overview"},
    {to:"/how-it-works",label:"How it works"},
    {to:"/technology",label:"Technology"},
    {to:"/intelligence",label:"Intelligence Collective"},
  ]},
  {name:"Trust",links:[
    {to:"/trust",label:"Scientific governance"},
    {to:"/trust#privacy",label:"Privacy information"},
    {to:"/trust#terms",label:"Research use information"},
    {to:"/trust#accessibility",label:"Accessibility"},
    {to:"/trust#security",label:"Security information"},
  ]},
];
export function Footer() {
  return (
    <footer className="hsi-footer" aria-label="Site footer">
      <div className="hsi-footer-grid">
        <div className="hsi-footer-brand">
          <Link className="hsi-wordmark" to="/">
            <HsiIdentity/>
          </Link>
          <p className="hsi-footer-principle">Understand the connections.<br/>Preserve the differences.</p>
          <p>Evidence-grounded intelligence for connected human biology.</p>
          <Link className="hsi-text-link" to="/contact">
            Research access options
          </Link>
          <Link className="hsi-footer-about" to="/about">About HSI</Link>
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
