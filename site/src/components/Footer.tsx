import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "../lib/brand";
import { PRIMARY_NAV_LINKS, PRIMARY_NAV_CTA } from "../lib/primaryNav";

const PRODUCT_LINKS = [
  { to: "/modules", label: "All modules" },
  { to: "/modules/aksh-health", label: "Aksh Health" },
  { to: "/modules/clinical", label: "HSI Clinical" },
  { to: "/modules/isi", label: "ISI Research" },
  { to: "/modules/trials", label: "HSI Trials" },
] as const;

const RESEARCH_LINKS = [
  { to: "/evidence-safety", label: "Evidence & safety" },
  { to: "/contact", label: "Research access" },
] as const;

const INFORMATION_LINKS = [
  { to: "/technology", label: "Technology" },
  { to: "/evidence-safety", label: "Evidence & safety" },
  { to: "/pricing", label: "Access options" },
  { to: "/contact", label: "Research access" },
] as const;

export function Footer() {
  return <footer className="footer site-footer" aria-label="Site footer">
    <div className="footer-wrap footer-grid">
      <div className="footer-brand-col">
        <Link to="/" className="footer-brand" aria-label={`${PRODUCT_NAME} home`}>
          <span className="footer-mark" aria-hidden="true">H</span>
          <span>{PRODUCT_NAME}</span>
        </Link>
        <p className="footer-tagline">{PRODUCT_TAGLINE}</p>
        <p className="footer-honesty">For research and education. Clinical decisions remain with qualified professionals in the appropriate care setting.</p>
        <Link to={PRIMARY_NAV_CTA.to} className="footer-contact">{PRIMARY_NAV_CTA.label} <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.5"/></svg></Link>
      </div>
      <nav aria-label="Footer explore"><h2>Explore</h2><ul>{PRIMARY_NAV_LINKS.map(l=><li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul></nav>
      <nav aria-label="Footer products"><h2>Modules</h2><ul>{PRODUCT_LINKS.map(l=><li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul></nav>
      <nav aria-label="Footer information"><h2>Information</h2><ul>{INFORMATION_LINKS.map(l=><li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul></nav>
    </div>
    <div className="footer-wrap footer-bottom">
      <span>© {new Date().getFullYear()} {PRODUCT_NAME}</span>
      <span className="footer-scope">Research use · Human oversight</span>
      <nav aria-label="Research information">
        {RESEARCH_LINKS.map(l=><Link key={l.to} to={l.to}>{l.label}</Link>)}
      </nav>
    </div>
  </footer>;
}
