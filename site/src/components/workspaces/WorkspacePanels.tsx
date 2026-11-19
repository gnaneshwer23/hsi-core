import { Link } from "react-router-dom";
import type {
  EnterpriseOpportunity,
  EnterpriseTreeNode,
} from "@hsi/enterprise/enterpriseDashboardDemo";
import type {
  WorkspaceAiCard,
  WorkspaceStat,
} from "@hsi/enterprise/workspaceDashboardDemo";

export function WorkspaceStatStrip({
  stats,
}: {
  stats: readonly WorkspaceStat[];
}) {
  return (
    <section className="ent-stats" aria-label="Demonstration summary">
      {stats.map((s) => (
        <article key={s.id} className="ent-stat">
          <strong>{s.value}</strong>
          <span>{s.label}</span>
          <em>{s.honesty}</em>
        </article>
      ))}
    </section>
  );
}

export function WorkspaceDomainMap({
  domains,
  nodes,
  selected,
  domainFilter,
  onDomainFilter,
  onSelect,
}: {
  domains: readonly string[];
  nodes: readonly EnterpriseTreeNode[];
  selected: EnterpriseTreeNode;
  domainFilter: string;
  onDomainFilter: (value: string) => void;
  onSelect: (node: EnterpriseTreeNode) => void;
}) {
  const visible =
    domainFilter === "all"
      ? nodes
      : nodes.filter((n) => n.domain === domainFilter);

  return (
    <section className="ent-panel" aria-labelledby="ws-map-heading">
      <h2 id="ws-map-heading">Experimental knowledge map</h2>
      <p className="ent-lead">
        Explore related mechanisms, experimental contexts, source-linked evidence and
        possible connections to other research domains. Relationships are conceptual
        until individually supported and reviewed.
      </p>
      <label>
        Domain{" "}
        <select
          value={domainFilter}
          onChange={(e) => onDomainFilter(e.target.value)}
          aria-label="Filter by scientific domain"
        >
          <option value="all">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <p className="ent-lead" style={{ marginTop: "0.75rem" }}>
        Selected scientific domain:{" "}
        <strong>{domainFilter === "all" ? "All domains" : domainFilter}</strong>
      </p>
      <div className="ent-tree" role="list" style={{ marginTop: "0.85rem" }}>
        {visible.map((node) => (
          <button
            key={node.id}
            type="button"
            className="ent-node"
            role="listitem"
            aria-pressed={selected.id === node.id}
            onClick={() => onSelect(node)}
          >
            <strong>{node.label}</strong>
            <span>{node.domain}</span>
            <span>
              {node.reviewStatus} · uncertainty {node.uncertainty}
            </span>
          </button>
        ))}
      </div>
      <div className="ent-inspect" style={{ marginTop: "1rem" }}>
        <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem" }}>
          Inspect: {selected.label}
        </h3>
        <p className="ent-lead" style={{ margin: 0 }}>
          Review status {selected.reviewStatus}. Uncertainty {selected.uncertainty}.
          Open the live knowledge graph for real edges and Context Passport — this map
          is schematic demonstration layout, not biology.
        </p>
        <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
          <Link className="ent-btn" to="/research/knowledge-graph">
            Explore
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WorkspaceAiPanel({ cards }: { cards: readonly WorkspaceAiCard[] }) {
  return (
    <section className="ent-panel" aria-labelledby="ws-ai-heading">
      <h2 id="ws-ai-heading">AI research intelligence</h2>
      <p className="ent-lead">
        Drafts for human review. Nothing here is scientific gold or Gate C approval.
      </p>
      <ul className="ws-ai-list">
        {cards.map((card) => (
          <li key={card.id}>
            <span className="ws-ai-kind">{card.kind.replaceAll("_", " ")}</span>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
          </li>
        ))}
      </ul>
      <div className="ent-actions">
        <Link className="ent-btn" to="/research/workspace">
          Explore scientific intelligence
        </Link>
      </div>
    </section>
  );
}

export function WorkspaceOpportunityList({
  opportunities,
}: {
  opportunities: readonly EnterpriseOpportunity[];
}) {
  return (
    <section className="ent-panel" aria-labelledby="ws-opp-heading">
      <h2 id="ws-opp-heading">Evidence, gaps and opportunities</h2>
      <ul className="ws-opp-list">
        {opportunities.map((opp) => (
          <li key={opp.id}>
            <strong>{opp.question}</strong>
            <p>
              Entities: {opp.entities.join(" · ")}. {opp.uncertainty}
            </p>
            <p className="ent-lead">{opp.supportingEvidence}</p>
            <Link className="ent-btn ent-btn-secondary" to={opp.nextInvestigation}>
              Open investigation path
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkspaceModuleTabs({
  modules,
  activeId,
  onSelect,
}: {
  modules: readonly { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="ws-modules" role="tablist" aria-label="Workspace modules">
      {modules.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={activeId === m.id}
          className={"ws-module-tab" + (activeId === m.id ? " is-active" : "")}
          onClick={() => onSelect(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
