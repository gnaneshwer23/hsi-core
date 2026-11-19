import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import {
  listWorkspaceDefinitions,
  type WorkspaceId,
} from "@hsi/enterprise/workspaceDashboardDemo";
import "../../styles/enterprise-dashboard.css";

const ENGINE_LINKS = [
  { to: "/research/workspace", label: "Live investigation", end: true },
  { to: "/research/knowledge-graph", label: "Knowledge graph", end: true },
  { to: "/research/dashboard", label: "Research dashboard", end: true },
] as const;

export function WorkspaceShell({
  activeId,
  title,
  subtitle,
  moduleNav,
  children,
}: {
  activeId: WorkspaceId;
  title: string;
  subtitle: string;
  moduleNav?: ReactNode;
  children: ReactNode;
}) {
  const workspaces = listWorkspaceDefinitions();

  return (
    <div className="ent-shell ws-shell">
      <aside className="ent-sidebar" aria-label="Workspace navigation">
        <Link className="ent-brand" to="/workspaces">
          <strong>HSI Research Intelligence</strong>
          <span>Connected scientific ecosystem · interactive concept</span>
        </Link>

        <div className="ws-switcher" role="navigation" aria-label="Select workspace">
          <p className="ws-switcher-label">Select workspace</p>
          <div className="ws-switcher-grid">
            {workspaces.map((w) => (
              <NavLink
                key={w.id}
                to={`/workspaces/${w.id}`}
                end
                className={({ isActive }) =>
                  "ws-switcher-chip" + (isActive || activeId === w.id ? " is-active" : "")
                }
              >
                {w.shortLabel}
              </NavLink>
            ))}
          </div>
        </div>

        <nav className="ent-nav" aria-label="Shared scientific engine">
          {ENGINE_LINKS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/workspaces" end>
            All workspaces
          </NavLink>
        </nav>

        <p className="ent-sidebar-foot">
          One scientific engine. Roles decide authorised actions; subscriptions decide
          commercial limits. Demonstration counts are not live evidence.
        </p>
      </aside>

      <div className="ent-main">
        <header className="ent-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="ent-badge">Demo data</span>
        </header>
        {moduleNav}
        <div className="ent-body">{children}</div>
      </div>
    </div>
  );
}
