import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

export type EnterpriseShellRole = "professor" | "student";

const NAV: Record<
  EnterpriseShellRole,
  readonly { to: string; label: string; end?: boolean }[]
> = {
  professor: [
    { to: "/enterprise/professor", label: "Group overview", end: true },
    { to: "/research/knowledge-graph", label: "Knowledge graph", end: true },
    { to: "/research/workspace", label: "Investigations", end: true },
    { to: "/research/governance", label: "Review hand-off", end: true },
    { to: "/enterprise/biotech", label: "Biotech shell", end: true },
    { to: "/enterprise/clinical", label: "Clinical shell", end: true },
    { to: "/enterprise/lab", label: "Lab / Omics shell", end: true },
    { to: "/enterprise/community", label: "Community shell", end: true },
    { to: "/academic", label: "Academic home", end: true },
  ],
  student: [
    { to: "/enterprise/student", label: "My research", end: true },
    { to: "/research/workspace", label: "Investigation", end: true },
    { to: "/research/home", label: "Research home", end: true },
    { to: "/research/gaps", label: "Gaps", end: true },
    { to: "/enterprise/biotech", label: "Biotech shell", end: true },
    { to: "/enterprise/clinical", label: "Clinical shell", end: true },
    { to: "/enterprise/lab", label: "Lab / Omics shell", end: true },
    { to: "/enterprise/community", label: "Community shell", end: true },
    { to: "/academic", label: "Academic home", end: true },
  ],
};

export function EnterpriseShell({
  role,
  title,
  subtitle,
  children,
}: {
  role: EnterpriseShellRole;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="ent-shell">
      <aside className="ent-sidebar" aria-label="Academic research navigation">
        <Link className="ent-brand" to="/academic">
          <strong>Human Super Intelligence</strong>
          <span>Academic Research Dashboard · demonstration UI</span>
        </Link>
        <nav className="ent-nav" aria-label={`${role} dashboard`}>
          {NAV[role].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Sign-in does not grant research writes. Demonstration counts are not live
          evidence. Private student notes stay inaccessible to professors in this
          shell.
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
