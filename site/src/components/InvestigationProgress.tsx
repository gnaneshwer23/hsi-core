import {Link} from "react-router-dom";
import type {InterrogativeInvestigation} from "../../../src/interrogativeValidation";
import {INVESTIGATION_SECTIONS, type InvestigationSectionId} from "../lib/investigationSections";

type Props = {
  record?: InterrogativeInvestigation | null;
  investigationId?: string | null;
  /** When set, highlight the matching 01–06 section (outcome panel scroll target). */
  activeSection?: string | null;
  /** Extra note under the chrome (e.g. mechanism-workflow probe honesty). */
  note?: string | null;
};

function sectionStatus(
  record: InterrogativeInvestigation | null | undefined,
  id: InvestigationSectionId,
): string {
  if (!record) return "Open investigation";
  switch (id) {
    case "01":
      return "Question recorded";
    case "02":
      return record.branches.some((b) => b.supporting.length || b.opposing.length)
        ? "Traces recorded"
        : "Awaiting bindings";
    case "03":
      return record.branches.some((b) => b.missingEvidence.length)
        ? "Gaps recorded"
        : "No gaps listed";
    case "04":
      return "Trials not queried";
    case "05":
      return "Planner fields only";
    case "06":
      return record.state.replaceAll("_", " ");
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function InvestigationProgress({record = null, investigationId = null, activeSection = null, note = null}: Props) {
  const id = record?.id ?? investigationId;
  const workbenchHref = id
    ? `/research/decision-workbench?investigation=${encodeURIComponent(id)}`
    : "/research/decision-workbench";

  return (
    <section className="xp-investigation-progress" aria-label="Investigation progress">
      <div>
        <p className="xp-eyebrow">INVESTIGATION / 01–06</p>
        <h2>One continuous research journey.</h2>
        <p>
          Question → evidence → gaps → translational note → action plan → package. Only saved activity is shown.
          A source selection or graph path does not establish a scientific conclusion.
        </p>
        {note ? <p role="note">{note}</p> : null}
        <p>
          <Link to={workbenchHref}>Decision workbench</Link>
          {" · "}
          <Link to="/research/mechanism-workflow">Connected Ask → export path</Link>
          {" · "}
          <Link to="/research/dashboard">Research workspace</Link>
        </p>
      </div>
      <nav className="xp-progress-grid" aria-label="Investigation sections 01 to 06">
        {INVESTIGATION_SECTIONS.map((section) => {
          const href = id ? `${workbenchHref}#${section.anchor}` : `#${section.anchor}`;
          const pressed = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={href}
              aria-current={pressed ? "step" : undefined}
              className={pressed ? "xp-progress-active" : undefined}
            >
              <strong>
                {section.id} · {section.short}
              </strong>
              <span>{sectionStatus(record, section.id)}</span>
              <p>{section.detail}</p>
            </a>
          );
        })}
      </nav>
      {record ? (
        <details>
          <summary>Inspect recorded methods</summary>
          {record.provenance.agentRuns.length ? (
            record.provenance.agentRuns.map((m, i) => (
              <p key={i}>
                {m.agentId} · version {m.version} · recorded model {m.modelVersion} · prompt {m.promptVersion} ·{" "}
                {m.toolCalls.length} recorded tool calls
              </p>
            ))
          ) : (
            <p>No method records supplied.</p>
          )}
          <p>No unrecorded duration, confidence, provider call or agent progress is inferred.</p>
        </details>
      ) : null}
    </section>
  );
}
