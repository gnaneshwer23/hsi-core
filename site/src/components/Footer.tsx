import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "../lib/brand";
import { PRIMARY_NAV_LINKS } from "../lib/primaryNav";
const PRODUCT_LINKS = [
  { to: "/products", label: "All products" },
  { to: "/for-aksh", label: "Aksh Health" },
  { to: "/for-isi", label: "ISI Research" },
  { to: "/for-trials", label: "HSI Trials" },
] as const;
const PROGRESS_LINKS = [
  { to: "/roadmap", label: "Roadmap" },
  { to: "/status", label: "Status" },
  { to: "/docs", label: "Docs" },
] as const;
const INFORMATION_LINKS=[{to:"/technology",label:"Technology"},{to:"/science",label:"Science"},{to:"/how-it-works",label:"How it works"},{to:"/pricing",label:"Access & pilots"},{to:"/contact",label:"Contact"}];
export function Footer() {
  return <footer className="footer site-footer" aria-label="Site footer">
    <div className="footer-wrap footer-grid">
      <div className="footer-brand-col"><Link to="/" className="footer-brand" aria-label={`${PRODUCT_NAME} home`}><span className="footer-mark" aria-hidden="true">H</span><span>{PRODUCT_NAME}</span></Link><p className="footer-tagline">{PRODUCT_TAGLINE}</p><p className="footer-honesty">Science is an educational experience. Research tools support human review; they do not provide diagnosis or treatment advice.</p><Link to="/contact" className="footer-contact">Contact the team <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.5"/></svg></Link></div>
      <nav aria-label="Footer explore"><h2>Explore</h2><ul>{PRIMARY_NAV_LINKS.map(l=><li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul></nav>
      <nav aria-label="Footer products"><h2>Products</h2><ul>{PRODUCT_LINKS.map(l=><li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul></nav>
      <nav aria-label="Footer information"><h2>Information</h2><ul>{INFORMATION_LINKS.map(l=><li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul></nav>
    </div>
    <div className="footer-wrap footer-bottom"><span>© {new Date().getFullYear()} {PRODUCT_NAME}</span><span className="footer-scope">Research use · Human oversight</span><nav aria-label="Project information">{PROGRESS_LINKS.map(l=><Link key={l.to} to={l.to}>{l.label}</Link>)}</nav></div>
  </footer>;
}
