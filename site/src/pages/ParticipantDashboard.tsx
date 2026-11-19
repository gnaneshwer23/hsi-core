import { Link } from "react-router-dom";
import { ParticipantShell } from "../components/enterprise/ParticipantShell";
import { participantDashboardDemo } from "@hsi/enterprise/participantDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Research Participant shell — synthetic contribution chrome; not CDS; no PHI. */
export function ParticipantDashboard() {
  const demo = participantDashboardDemo();

  return (
    <ParticipantShell
      title={demo.programmeName}
      subtitle="Consent · contribution · updates — separate governed path preview"
    >
      <p className="ent-banner" role="status">
        {demo.governanceNote}
      </p>

      <section className="ent-stats" aria-label="Participant summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.consentSlotCount}</strong>
          <span>Consent sketches</span>
          <em>Disabled</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.contributionChannelCount}</strong>
          <span>Contribution channels</span>
          <em>Off</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.updateSketchCount}</strong>
          <span>Update sketches</span>
          <em>Proposed</em>
        </article>
        <article className="ent-stat">
          <strong>0</strong>
          <span>PHI records</span>
          <em>Always zero here</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="part-consent-heading">
          <h2 id="part-consent-heading">Consent sketches</h2>
          <p className="ent-lead">
            Illustrative steps only. No identifiers, signatures or preferences are
            stored in this repository.
          </p>
          <ul>
            {demo.consentSlots.map((slot) => (
              <li key={slot.id}>
                <strong>{slot.label}</strong> · {slot.status.replaceAll("_", " ")} ·
                PHI collected: {String(slot.phiCollected)}. {slot.note}
              </li>
            ))}
          </ul>
        </section>

        <section className="ent-panel" aria-labelledby="part-chan-heading">
          <h2 id="part-chan-heading">Contribution channels</h2>
          <p className="ent-lead">
            All channels stay disabled. This is not a scientific dashboard and not
            CDS.
          </p>
          <ul>
            {demo.contributionChannels.map((ch) => (
              <li key={ch.id}>
                <strong>{ch.label}</strong> · enabled: {String(ch.enabled)}. {ch.note}
                <div className="ent-actions">
                  <Link className="ent-btn ent-btn-secondary" to={ch.nextSurface}>
                    Related surface
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="part-upd-heading">
        <h2 id="part-upd-heading">Study update sketches</h2>
        <p className="ent-lead">
          No invented enrollment, conversion or safety percentages.
        </p>
        <ul>
          {demo.updateSketches.map((u) => (
            <li key={u.id}>
              <strong>{u.title}</strong> · {u.status.replaceAll("_", " ")} · invented
              enrollment %: {String(u.inventedEnrollmentPercent)}. {u.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="ent-panel" aria-labelledby="part-boundary-heading">
        <h2 id="part-boundary-heading">Plane boundary</h2>
        <p className="ent-lead">
          Scientific investigation stays on the research plane (
          <Link to="/research/workspace">live workspace</Link>
          ). Clinical research shells remain synthetic (
          <Link to="/enterprise/clinical">clinical demo</Link>
          ). Real participant pathways require the clinical plane after ADR-0010
          gates — never auto-wired from this preview.
        </p>
        <div className="ent-actions">
          <Link className="ent-btn ent-btn-secondary" to="/workspaces">
            Multi-workspace hub
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/enterprise/clinical">
            Clinical research shell
          </Link>
          <Link className="ent-btn ent-btn-secondary" to="/docs">
            Docs
          </Link>
        </div>
      </section>
    </ParticipantShell>
  );
}
