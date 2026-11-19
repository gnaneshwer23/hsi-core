import { useState } from "react";
import { Link } from "react-router-dom";
import { EnterpriseShell } from "../components/enterprise/EnterpriseShell";
import { DemoUniverseRolePanel } from "../components/demo/DemoUniverseRolePanel";
import {
  enterpriseProfessorDemo,
  type EnterpriseTreeNode,
} from "@hsi/enterprise/enterpriseDashboardDemo";

const ROLE_LABEL: Record<string, string> = {
  postdoctoral: "Postdoctoral",
  phd: "PhD",
  masters: "Master’s",
  principal_investigator: "PI",
};

/** Professor / PI enterprise shell — demonstration fixtures only (PR1). */
export function EnterpriseProfessorDashboard() {
  const demo = enterpriseProfessorDemo();
  const [selected, setSelected] = useState<EnterpriseTreeNode>(demo.treeNodes[0]!);
  const [domainFilter, setDomainFilter] = useState("all");

  const nodes =
    domainFilter === "all"
      ? demo.treeNodes
      : demo.treeNodes.filter((n) => n.domain === domainFilter);

  const domains = ["all", ...new Set(demo.treeNodes.map((n) => n.domain))];

  return (
    <EnterpriseShell
      role="professor"
      title={demo.groupName}
      subtitle={`Group lead (demonstration): ${demo.groupLead}`}
    >
      <p className="ent-banner" role="status">
        Demonstration scenario (autoimmune / SSc unit) — not HSI’s disease scope.
        Do not treat researcher counts or opportunity totals as live institutional
        metrics. Private student notes and unpublished findings are not accessible
        here.
      </p>

      <section className="ent-stats" aria-label="Group summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.researcherCount}</strong>
          <span>Group researchers</span>
          <em>Demonstration</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.topicCount}</strong>
          <span>Research topics</span>
          <em>Demonstration</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.candidateGapCount}</strong>
          <span>Candidate evidence gaps</span>
          <em>Not live gap ledger</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.crossDomainOpportunityCount}</strong>
          <span>Cross-domain opportunities</span>
          <em>Candidate questions only</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="ent-tree-heading">
          <h2 id="ent-tree-heading">Research intelligence tree</h2>
          <p className="ent-lead">
            Schematic SSc-centred map. Layout is not biology. Unverified mechanistic
            hypotheses are not causal relationships. Select a node to inspect honesty
            fields; open the live knowledge graph for real edges and Context Passport.
          </p>
          <label>
            Filter by domain{" "}
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              aria-label="Filter tree by scientific domain"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All domains" : d}
                </option>
              ))}
            </select>
          </label>
          <div className="ent-tree" role="list" style={{ marginTop: "0.85rem" }}>
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className="ent-node"
                role="listitem"
                aria-pressed={selected.id === node.id}
                onClick={() => setSelected(node)}
              >
                <strong>{node.label}</strong>
                <span>{node.domain}</span>
                <span>
                  {node.reviewStatus} · uncertainty {node.uncertainty}
                </span>
              </button>
            ))}
          </div>
          <div className="ent-panel" style={{ marginTop: "0.85rem", boxShadow: "none" }}>
            <h2>Selected relationship context</h2>
            <p className="ent-lead">
              <strong>{selected.label}</strong> — review status{" "}
              <em>{selected.reviewStatus}</em>; uncertainty{" "}
              <em>{selected.uncertainty}</em>. Evidence provenance and Context Passport
              load from the live graph, not this demonstration tile.
            </p>
            <div className="ent-actions">
              <Link className="ent-btn" to="/research/knowledge-graph">
                Open knowledge graph
              </Link>
              <Link className="ent-btn ent-btn-secondary" to="/research/workspace">
                Open investigation
              </Link>
            </div>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="ent-team-heading">
          <h2 id="ent-team-heading">Research team</h2>
          <p className="ent-lead">
            Seven illustrative members. Invite / assign actions stay disabled until
            authorised persistence is approved.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="ent-table">
              <thead>
                <tr>
                  <th scope="col">Researcher</th>
                  <th scope="col">Role</th>
                  <th scope="col">Topic</th>
                </tr>
              </thead>
              <tbody>
                {demo.members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{ROLE_LABEL[m.role] ?? m.role}</td>
                    <td>{m.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ent-actions">
            <button type="button" className="ent-btn" disabled aria-disabled="true">
              Invite researcher (blocked)
            </button>
            <button type="button" className="ent-btn ent-btn-secondary" disabled>
              Create project (blocked)
            </button>
            <Link className="ent-btn ent-btn-secondary" to="/research/governance">
              Request review hand-off
            </Link>
          </div>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="ent-radar-heading">
        <h2 id="ent-radar-heading">AI cross-domain opportunity radar</h2>
        <p className="ent-lead">
          Evidence-aware question templates. Supporting evidence is not invented here —
          each card states what is missing and links into existing investigation tools.
        </p>
        <div className="ent-opp">
          {demo.opportunities.map((opp) => (
            <article key={opp.id}>
              <h3>{opp.question}</h3>
              <dl>
                <dt>Entities</dt>
                <dd>{opp.entities.join(" · ")}</dd>
                <dt>Supporting evidence</dt>
                <dd>{opp.supportingEvidence}</dd>
                <dt>Experimental context</dt>
                <dd>{opp.experimentalContext}</dd>
                <dt>Conflicting evidence</dt>
                <dd>{opp.conflictingEvidence}</dd>
                <dt>Uncertainty</dt>
                <dd>{opp.uncertainty}</dd>
                <dt>Review status</dt>
                <dd>{opp.reviewStatus}</dd>
              </dl>
              <div className="ent-actions">
                <Link className="ent-btn ent-btn-secondary" to={opp.nextInvestigation}>
                  Candidate next investigation
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ent-panel" aria-labelledby="ent-opp-intel-heading">
        <h2 id="ent-opp-intel-heading">Research opportunity intelligence</h2>
        <p className="ent-lead">
          Structured placeholders for related groups, public researchers, industry,
          trials, funding and collaborators. Empty or demonstration until authorised
          sources are wired.
        </p>
        <ul>
          <li>Related university research groups — empty (not invented)</li>
          <li>Publicly documented researchers — use live graph / literature tools</li>
          <li>Biotech and pharmaceutical companies — not listed in this shell</li>
          <li>
            Clinical trials — see{" "}
            <Link to="/science/clinical-trials">science clinical trials explorer</Link>
          </li>
          <li>Funding opportunities — empty (not invented)</li>
          <li>Potential collaborators — requires sharing grants (blocked)</li>
        </ul>
      </section>

      <section
        className="ent-panel ent-disabled"
        aria-labelledby="ent-cohort-heading"
        aria-disabled="true"
      >
        <h2 id="ent-cohort-heading">{demo.cohortPanel.title}</h2>
        <p className="ent-lead">{demo.cohortPanel.explanation}</p>
        <div className="ent-actions">
          <button type="button" className="ent-btn" disabled>
            Enable cohorts (requires separate approval)
          </button>
          <Link className="ent-btn ent-btn-secondary" to="/research/cohort">
            Synthetic cohort demonstration
          </Link>
        </div>
      </section>

      <DemoUniverseRolePanel roleId="professor" />
    </EnterpriseShell>
  );
}
