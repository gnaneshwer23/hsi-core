import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";

const NAV = [
  { to: "/enterprise/community", label: "Community overview", end: true },
  { to: "/research/community-feed", label: "Feed examples", end: true },
  { to: "/research/gaps", label: "Gaps / challenges", end: true },
  { to: "/research/governance", label: "Review hand-off", end: true },
  { to: "/research/workspace", label: "Investigations", end: true },
  { to: "/enterprise/lab", label: "Lab / Omics shell", end: true },
  { to: "/academic", label: "Academic shells", end: true },
] as const;

/** Shared-engine chrome for Research Community Stage 4 shell. */
export function CommunityShell({
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
      <aside className="ent-sidebar" aria-label="Research community navigation">
        <Link className="ent-brand" to="/enterprise/community">
          <strong>Human Super Intelligence</strong>
          <span>Research Community Dashboard · demonstration UI</span>
        </Link>
        <nav className="ent-nav" aria-label="Community dashboard">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Circles store held. Shared ≠ public. No automatic IP bleed. Not a vanity
          feed. Human Gate C only.
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
