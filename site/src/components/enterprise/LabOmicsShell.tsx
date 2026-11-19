import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/lab", label: "Lab overview", end: true },
  { to: "/research/methods", label: "Methods", end: true },
  { to: "/science/study-comparison", label: "Study comparison", end: true },
  { to: "/science/paths", label: "Pathways", end: true },
  { to: "/research/workspace", label: "Investigations", end: true },
  { to: "/research/knowledge-graph", label: "Knowledge graph", end: true },
  { to: "/enterprise/clinical", label: "Clinical shell", end: true },
  { to: "/enterprise/community", label: "Community shell", end: true },
  { to: "/academic", label: "Academic shells", end: true },
] as const;

/** Shared-engine chrome for Laboratory & Omics Stage 4 shell. */
export function LabOmicsShell({
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
      <aside className="ent-sidebar" aria-label="Laboratory and omics navigation">
        <Link className="ent-brand" to="/enterprise/lab">
          <strong>Human Super Intelligence</strong>
          <span>Laboratory &amp; Omics Dashboard · demonstration UI</span>
        </Link>
        <nav className="ent-nav" aria-label="Lab omics dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Lab chrome on the shared engine. No fake QC scores or invented feature
          counts. Missing assay fields stay explicit.
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
