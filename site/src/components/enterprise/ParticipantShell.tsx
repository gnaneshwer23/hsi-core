import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/participant", label: "Participant overview", end: true },
  { to: "/research/cohort", label: "Synthetic cohort tools", end: true },
  { to: "/contact", label: "Contact", end: true },
  { to: "/workspaces", label: "Multi-workspace hub", end: true },
  { to: "/enterprise/clinical", label: "Clinical research shell", end: true },
  { to: "/academic", label: "Academic shells", end: true },
] as const;

/** Shared-engine chrome for Research Participant Stage 4 shell G (not CDS / no PHI). */
export function ParticipantShell({
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
      <aside className="ent-sidebar" aria-label="Research participant navigation">
        <Link className="ent-brand" to="/enterprise/participant">
          <strong>Human Super Intelligence</strong>
          <span>Participant contribution · demonstration UI</span>
        </Link>
        <nav className="ent-nav" aria-label="Participant dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Not a scientific dashboard. Not CDS. No PHI. Real participant paths stay
          on the clinical plane after ADR-0010 gates.
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
