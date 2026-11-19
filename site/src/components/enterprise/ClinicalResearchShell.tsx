import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/clinical", label: "Clinical overview", end: true },
  { to: "/research/cohort", label: "Synthetic cohort", end: true },
  { to: "/research/prescreen", label: "Trial pre-screening", end: true },
  { to: "/research/workspace", label: "Investigations", end: true },
  { to: "/research/gaps", label: "Gaps", end: true },
  { to: "/enterprise/biotech", label: "Biotech shell", end: true },
  { to: "/academic", label: "Academic shells", end: true },
] as const;

/** Shared-engine chrome for Clinical Research Stage 4 shell (synthetic / not CDS). */
export function ClinicalResearchShell({
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
      <aside className="ent-sidebar" aria-label="Clinical research navigation">
        <Link className="ent-brand" to="/enterprise/clinical">
          <strong>Human Super Intelligence</strong>
          <span>Clinical Research Dashboard · synthetic demonstration</span>
        </Link>
        <nav className="ent-nav" aria-label="Clinical research dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Not CDS. No PHI. Synthetic plane only. Demonstration counts are not
          enrollment, conversion or safety truth.
        </p>
      </aside>
      <div className="ent-main">
        <header className="ent-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="ent-badge">Synthetic · not CDS</span>
        </header>
        <div className="ent-body">{children}</div>
      </div>
    </div>
  );
}
