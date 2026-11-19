import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/biotech", label: "Biotech overview", end: true },
  { to: "/research/targets", label: "Target tools", end: true },
  { to: "/research/workspace", label: "Investigations", end: true },
  { to: "/research/knowledge-graph", label: "Knowledge graph", end: true },
  { to: "/research/gaps", label: "Gaps", end: true },
  { to: "/enterprise/clinical", label: "Clinical shell", end: true },
  { to: "/academic", label: "Academic shells", end: true },
  { to: "/biotech", label: "Public biotech page", end: true },
] as const;

/** Shared-engine chrome for Biotech / Pharma Stage 4 shell. */
export function BiotechShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="ent-shell">
      <aside className="ent-sidebar" aria-label="Biotech research navigation">
        <Link className="ent-brand" to="/enterprise/biotech">
          <strong>Human Super Intelligence</strong>
          <span>Biotech &amp; Pharma Dashboard · demonstration UI</span>
        </Link>
        <nav className="ent-nav" aria-label="Biotech dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          One scientific engine with Academic. Confidential programmes stay gated.
          Demonstration counts are not live evidence or portfolio truth.
        </p>
      </aside>
      <div className="ent-main">
        <header className="ent-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="ent-badge">Demonstration data</span>
        </header>
        <div className="ent-body">{children}</div>
      </div>
    </div>
  );
}
