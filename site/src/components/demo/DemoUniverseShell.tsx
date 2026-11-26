import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import "../../styles/enterprise-dashboard.css";
import "../../styles/demo-universe.css";

const NAV = [
  { to: "/demo/universe", label: "Demo universe", end: true },
  { to: "/science/study-comparison", label: "Study comparison", end: true },
  { to: "/platform/contradiction-analysis", label: "Context-conflict audit", end: true },
  { to: "/research/workspace", label: "Investigations", end: true },
  { to: "/research/journey", label: "Guided walkthrough", end: true },
  { to: "/enterprise/lab", label: "Lab shell", end: true },
] as const;

/** Chrome for Demo Research Universe comparison + brief UI (PR3). */
export function DemoUniverseShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="ent-shell du-shell">
      <aside className="ent-sidebar" aria-label="Demo research universe navigation">
        <Link className="ent-brand" to="/demo/universe">
          <strong>Human Super Intelligence</strong>
          <span>Demo Research Universe · comparison &amp; brief</span>
        </Link>
        <nav className="ent-nav" aria-label="Demo universe">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="ent-sidebar-foot">
          Synthetic fixtures and verified bibliographic metadata only. Not scientific
          approval. Cannot write to the production graph.
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
