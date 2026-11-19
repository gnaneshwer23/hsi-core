import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/funding", label: "Funding overview", end: true },
  { to: "/research/gaps", label: "Gaps / next questions", end: true },
  { to: "/enterprise/community", label: "Community shell", end: true },
  { to: "/enterprise/biotech", label: "Biotech shell", end: true },
  { to: "/academic", label: "Academic shells", end: true },
  { to: "/workspaces", label: "Multi-workspace hub", end: true },
] as const;

/** Shared-engine chrome for Funding & Careers Stage 4 shell H. */
export function FundingCareersShell({
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
      <aside className="ent-sidebar" aria-label="Funding and careers navigation">
        <Link className="ent-brand" to="/enterprise/funding">
          <strong>Human Super Intelligence</strong>
          <span>Funding &amp; Careers Dashboard · demonstration UI</span>
        </Link>
        <nav className="ent-nav" aria-label="Funding and careers dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Illustrative only. No invented award rates. Durable funding store held.
          Not CDS; no PHI.
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
