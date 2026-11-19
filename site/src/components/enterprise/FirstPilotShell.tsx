import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/pilot", label: "Pilot design", end: true },
  { to: "/research/home", label: "Research home · §H metrics", end: true },
  { to: "/research/workspace", label: "Live investigation", end: true },
  { to: "/research/journey", label: "Research journey", end: true },
  { to: "/workspaces", label: "Multi-workspace hub", end: true },
  { to: "/academic", label: "Academic shells", end: true },
] as const;

/** Shared-engine chrome for First Researcher Pilot Stage 4 shell I. */
export function FirstPilotShell({
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
      <aside className="ent-sidebar" aria-label="First researcher pilot navigation">
        <Link className="ent-brand" to="/enterprise/pilot">
          <strong>Human Super Intelligence</strong>
          <span>First researcher pilot · design only</span>
        </Link>
        <nav className="ent-nav" aria-label="Pilot design dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Pilot ready always false. No invented conversion. Stage 2 journey is the
          build centre.
        </p>
      </aside>
      <div className="ent-main">
        <header className="ent-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="ent-badge">Design · not ready</span>
        </header>
        <div className="ent-body">{children}</div>
      </div>
    </div>
  );
}
