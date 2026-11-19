import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import type { EnterpriseTreeNode } from "@hsi/enterprise/enterpriseDashboardDemo";
import {
  academicFixtures,
  assessWorkspaceAccess,
  isWorkspaceId,
  workspaceDemoPacket,
} from "@hsi/enterprise/workspaceDashboardDemo";
import { WorkspaceShell } from "../components/workspaces/WorkspaceShell";
import {
  WorkspaceAiPanel,
  WorkspaceDomainMap,
  WorkspaceModuleTabs,
  WorkspaceOpportunityList,
  WorkspaceStatStrip,
} from "../components/workspaces/WorkspacePanels";

/** Role-specific workspace dashboard — demonstration fixtures only. */
export function WorkspaceDashboardPage() {
  const { pathname } = useLocation();
  const workspaceId = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const valid = isWorkspaceId(workspaceId);
  const packet = valid ? workspaceDemoPacket(workspaceId) : null;
  const access = valid ? assessWorkspaceAccess(workspaceId) : null;
  const academic = academicFixtures();
  const [moduleId, setModuleId] = useState("overview");
  const [domainFilter, setDomainFilter] = useState("all");
  const [selected, setSelected] = useState<EnterpriseTreeNode | null>(null);

  if (!valid || !packet || !access) {
    return <Navigate to="/workspaces" replace />;
  }

  const activeNode = selected ?? packet.treeNodes[0]!;
  const activeModule =
    packet.workspace.modules.some((m) => m.id === moduleId)
      ? moduleId
      : (packet.workspace.modules[0]?.id ?? "overview");

  const showMap =
    activeModule === "overview" ||
    activeModule === "tree" ||
    activeModule === "omics" ||
    activeModule === "experiments" ||
    activeModule === "targets" ||
    activeModule === "phenotypes";

  return (
    <WorkspaceShell
      activeId={workspaceId}
      title={packet.workspace.label}
      subtitle={packet.workspace.tagline}
      moduleNav={
        <WorkspaceModuleTabs
          modules={packet.workspace.modules}
          activeId={activeModule}
          onSelect={setModuleId}
        />
      }
    >
      <p className="ent-banner" role="status">
        {packet.governanceNote} Access: demo shell{" "}
        {access.canViewDemoShell ? "allowed" : "blocked"}; clinical cohorts{" "}
        {access.canEnableClinicalCohorts ? "enabled" : "disabled"}; confidential
        auto-unlock {access.canAutoUnlockConfidentialScience ? "on" : "off"};
        production org writes {access.canWriteProductionOrgData ? "on" : "off"}.
      </p>

      <WorkspaceStatStrip stats={packet.stats} />

      {workspaceId === "clinical" && activeModule === "cohorts" ? (
        <section className="ent-panel" aria-labelledby="ws-cohort-heading">
          <h2 id="ws-cohort-heading">Patient research cohorts (disabled)</h2>
          <p className="ent-lead">
            Approved, pseudonymised datasets could eventually connect laboratory
            findings to phenotypes. Identifiable uploads, live clinical records and PHI
            processing stay off until separate governance, security and ethics
            approval. This workspace is not CDS.
          </p>
        </section>
      ) : null}

      {workspaceId === "enterprise" && activeModule === "subscriptions" ? (
        <section className="ent-panel" aria-labelledby="ws-sub-heading">
          <h2 id="ws-sub-heading">Subscriptions vs roles</h2>
          <p className="ent-lead">
            Seat counts and plan names shown here are illustrations. A subscription
            never substitutes for research grants, dual review or project sharing
            permissions.
          </p>
        </section>
      ) : null}

      {workspaceId === "professor" && activeModule === "team" ? (
        <section className="ent-panel" aria-labelledby="ws-team-heading">
          <h2 id="ws-team-heading">Team roster (demonstration)</h2>
          <ul>
            {academic.professor.members.map((m) => (
              <li key={m.id}>
                {m.name} — {m.role} · {m.topic}
              </li>
            ))}
          </ul>
          <p className="ent-lead">
            Private student notes remain inaccessible (
            {String(!access.studentPrivateNotesVisibleToProfessor)}).
          </p>
        </section>
      ) : null}

      {workspaceId === "student" && activeModule === "feed" ? (
        <section className="ent-panel" aria-labelledby="ws-feed-heading">
          <h2 id="ws-feed-heading">Personalised feed (placeholders)</h2>
          <ul>
            {academic.student.feedItems.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <p className="ent-lead">{item.whyMatches}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="ent-grid-2">
        {showMap ? (
          <WorkspaceDomainMap
            domains={packet.domains}
            nodes={packet.treeNodes}
            selected={activeNode}
            domainFilter={domainFilter}
            onDomainFilter={setDomainFilter}
            onSelect={setSelected}
          />
        ) : (
          <section className="ent-panel">
            <h2>
              {packet.workspace.modules.find((m) => m.id === activeModule)?.label}
            </h2>
            <p className="ent-lead">{packet.collaborationNote}</p>
            <div className="ent-actions">
              <Link className="ent-btn" to={packet.workspace.investigationPath}>
                Continue in shared engine
              </Link>
            </div>
          </section>
        )}
        <WorkspaceAiPanel cards={packet.aiCards} />
      </div>

      {(activeModule === "overview" ||
        activeModule === "gaps" ||
        activeModule === "opportunities" ||
        activeModule === "landscape") && (
        <WorkspaceOpportunityList opportunities={packet.opportunities} />
      )}

      <p className="ent-lead" style={{ marginTop: "1.25rem" }}>
        Audience: {packet.workspace.audience}. Disease-agnostic platform — any
        autoimmune / SSc / CD40 labels in linked academic fixtures are demonstration
        scenarios only.
      </p>

      {packet.workspace.stage4ShellPath ? (
        <div className="ent-actions" style={{ marginTop: "1rem" }}>
          <Link className="ent-btn ent-btn-secondary" to={packet.workspace.stage4ShellPath}>
            Open soft-landed Stage 4 shell
          </Link>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}
