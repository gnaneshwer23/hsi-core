import { Link } from "react-router-dom";
import { EnterpriseShell } from "../components/enterprise/EnterpriseShell";
import { enterpriseStudentDemo } from "@hsi/enterprise/enterpriseDashboardDemo";

const FEED_KIND_LABEL = {
  publication_demo: "Publication (demonstration)",
  hypothesis_demo: "AI-generated hypothesis (not reviewed)",
  programme_demo: "Public programme (demonstration)",
} as const;

/** Student / researcher enterprise shell — demonstration fixtures only (PR1). */
export function EnterpriseStudentDashboard() {
  const demo = enterpriseStudentDemo();

  return (
    <EnterpriseShell
      role="student"
      title={`${demo.roleLabel} — ${demo.title}`}
      subtitle={`${demo.researcherName} · supervisor ${demo.supervisor} · ${demo.groupName}`}
    >
      <p className="ent-banner" role="status">
        Personal research dashboard shell. Profile edits here are not persisted.
        Activate your own identity via the research account path; a professor
        provisioned membership is not automatic access.
      </p>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="ent-student-overview">
          <h2 id="ent-student-overview">Research overview</h2>
          <p className="ent-lead">
            <strong>Question:</strong> {demo.researchQuestion}
          </p>
          <p className="ent-lead">
            <strong>Interests:</strong> {demo.interests.join(" · ")}
          </p>
          <p className="ent-lead">
            <strong>Assigned projects (demonstration):</strong>{" "}
            {demo.projects.join(", ")}
          </p>
          <h3 style={{ fontSize: "0.95rem", margin: "1rem 0 0.4rem" }}>
            Saved investigations
          </h3>
          <ul>
            {demo.savedInvestigations.map((inv) => (
              <li key={inv.id}>
                {inv.title} — <em>{inv.status}</em>
              </li>
            ))}
          </ul>
          <h3 style={{ fontSize: "0.95rem", margin: "1rem 0 0.4rem" }}>
            Candidate evidence gaps
          </h3>
          <ul>
            {demo.candidateGaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <div className="ent-actions">
            <Link className="ent-btn" to="/research/workspace">
              Continue investigation
            </Link>
            <Link className="ent-btn ent-btn-secondary" to="/research/account">
              Research account / activation
            </Link>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="ent-profile-heading">
          <h2 id="ent-profile-heading">Personalised research profile</h2>
          <p className="ent-lead">
            Editable fields will reuse the existing onboarding profile store. Server
            sync stays fail-closed (migration 023 held). This shell shows read-only
            demonstration values.
          </p>
          <dl className="ent-opp" style={{ display: "grid", gap: "0.35rem" }}>
            <div>
              <strong>Research title</strong>
              <p className="ent-lead">{demo.title}</p>
            </div>
            <div>
              <strong>Disease focus</strong>
              <p className="ent-lead">Systemic sclerosis</p>
            </div>
            <div>
              <strong>Methods / models</strong>
              <p className="ent-lead">Not stated in demonstration fixtures</p>
            </div>
            <div>
              <strong>Profile visibility</strong>
              <p className="ent-lead">Group-visible pending activation — not live</p>
            </div>
          </dl>
          <button type="button" className="ent-btn" disabled>
            Edit profile (persistence blocked)
          </button>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="ent-feed-heading">
        <h2 id="ent-feed-heading">Personalised scientific feed</h2>
        <p className="ent-lead">
          Items explain why they match interests. Publications, AI hypotheses and
          reviewed findings stay labelled differently. No invented DOIs.
        </p>
        <ul className="ent-feed">
          {demo.feedItems.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <small>
                {FEED_KIND_LABEL[item.kind]} — {item.whyMatches}
              </small>
            </li>
          ))}
        </ul>
        <ul>
          {demo.alerts.map((a) => (
            <li key={a.id}>
              Alert ({a.kind}): {a.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="ent-panel" aria-labelledby="ent-assistant-heading">
        <h2 id="ent-assistant-heading">AI scientific research assistant</h2>
        <p className="ent-lead">
          Reuses the existing investigation infrastructure — no second orchestration
          stack.
        </p>
        <div className="ent-actions">
          <Link className="ent-btn" to="/research/workspace">
            Compare evidence in workspace
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/research/knowledge-graph">
            Explore mechanisms
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/research/gaps">
            Candidate gaps
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/research/governance">
            Request supervisor review
          </Link>
        </div>
      </section>

      <section className="ent-panel" aria-labelledby="ent-circles-heading">
        <h2 id="ent-circles-heading">Research Circles</h2>
        <p className="ent-lead">
          Collaboration for group discussions, shared literature and supervisor
          feedback. Private group spaces stay separate from public community.
          Persistence blocked pending sharing grants.
        </p>
        <button type="button" className="ent-btn" disabled>
          Open circle (blocked)
        </button>
      </section>

      <section className="ent-panel" aria-labelledby="ent-pub-heading">
        <h2 id="ent-pub-heading">Scientific publication workspace</h2>
        <p className="ent-lead">
          Planned integration for evidence organisation, methodology review,
          citation verification and unsupported-claim detection. AI must not fabricate
          results, references, ethics approvals or authorship.
        </p>
        <div className="ent-actions">
          <Link className="ent-btn ent-btn-secondary" to="/research/methods">
            Methods notebook
          </Link>
          <button type="button" className="ent-btn" disabled>
            Publication workspace (planned)
          </button>
        </div>
      </section>
    </EnterpriseShell>
  );
}
