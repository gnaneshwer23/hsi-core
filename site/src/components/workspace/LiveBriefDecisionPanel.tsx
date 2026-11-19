import { PassportEvidenceTable } from "../PassportEvidenceTable";
import {
  LIVE_BRIEF_PREVIEW_HONESTY,
  type LiveBriefPreview,
} from "@hsi/investigation/liveBriefPreview";
import { renderLiveBriefMarkdown } from "@hsi/investigation/liveBrief";
import {
  exportLiveBriefV2,
  renderLiveBriefV2Markdown,
} from "@hsi/investigation/liveBriefV2";
import type { DomainEdge, DomainSource } from "@hsi/knowledgeGraph/domainGraph";
import type { Run } from "../../lib/workspaceView";

function download(name: string, text: string, type: string) {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  URL.revokeObjectURL(u);
}

/** Decision brief with passport columns + limitations always visible. */
export function LiveBriefDecisionPanel({
  run,
  preview,
  passportEdges,
  passportSources,
  markdownOpen,
  onToggleMarkdown,
  onInspectEdge,
  onSave,
}: {
  run: Run;
  preview: LiveBriefPreview;
  passportEdges: readonly DomainEdge[];
  passportSources: readonly DomainSource[];
  markdownOpen: boolean;
  onToggleMarkdown: () => void;
  onInspectEdge: (edgeId: string) => void;
  onSave: () => void;
}) {
  return (
    <section className="ws-card ws-brief-panel" id="ws-brief-panel" aria-labelledby="ws-brief-h">
      <header>
        <h2 id="ws-brief-h">Research decision brief</h2>
      </header>
      <p className="ws-muted">
        Evidence-linked draft with passport columns and limitations always visible. Abstracts are
        not included. briefAccepted: {String(LIVE_BRIEF_PREVIEW_HONESTY.briefAccepted)}. Scientific
        approval: {String(LIVE_BRIEF_PREVIEW_HONESTY.scientificApproval)}. Verification gate passed:{" "}
        {String(LIVE_BRIEF_PREVIEW_HONESTY.verificationGatePassed)}.
      </p>

      <div className="ws-brief-limits" aria-labelledby="ws-brief-limits-h">
        <h3 id="ws-brief-limits-h">Limitations (always visible)</h3>
        <ul>
          {preview.limitations.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
        <p className="ws-warn" role="status">
          {preview.conflictNote} Reviewed edges: {preview.reviewedEdgeCount}. Unreviewed
          candidates: {preview.unreviewedCandidateCount}. Locators (PMID/DOI) are not proof of
          support.
        </p>
      </div>

      <div className="ws-brief-passport" aria-label="Brief passport columns">
        <PassportEvidenceTable
          edges={passportEdges}
          sources={passportSources}
          heading="Passport columns for this brief"
          onInspect={onInspectEdge}
        />
        <p className="ws-muted">
          {preview.passportRowCount} passport row
          {preview.passportRowCount === 1 ? "" : "s"} in this draft. Missing biological fields stay
          explicit — they are not invented.
        </p>
      </div>

      <button
        type="button"
        className="ws-run ws-wide"
        onClick={onToggleMarkdown}
        aria-expanded={markdownOpen}
      >
        {markdownOpen ? "Hide markdown preview" : "Open markdown preview"}
      </button>
      {markdownOpen ? (
        <pre className="ws-brief" tabIndex={0} aria-label="Research brief text">
          {renderLiveBriefMarkdown(run)}
        </pre>
      ) : null}

      <div className="ws-export">
        <button
          type="button"
          className="ws-btn"
          onClick={() =>
            download("hsi-live-brief.md", renderLiveBriefMarkdown(run), "text/markdown")
          }
        >
          Export brief (Markdown)
        </button>
        <button
          type="button"
          className="ws-btn"
          onClick={() =>
            download(
              "hsi-live-investigation.json",
              JSON.stringify(run, null, 2),
              "application/json",
            )
          }
        >
          Export JSON
        </button>
        <button
          type="button"
          className="ws-btn"
          onClick={() => {
            const b = exportLiveBriefV2(run);
            download("hsi-live-brief-v2.json", JSON.stringify(b, null, 2), "application/json");
          }}
        >
          Export Brief v2 (JSON)
        </button>
        <button
          type="button"
          className="ws-btn"
          onClick={() => {
            const b = exportLiveBriefV2(run);
            download("hsi-live-brief-v2.md", renderLiveBriefV2Markdown(b), "text/markdown");
          }}
        >
          Export Brief v2 (Markdown)
        </button>
        <button type="button" className="ws-btn" onClick={onSave}>
          Save to browser library
        </button>
      </div>
      <p className="ws-muted">
        Export is a draft preview only. Owner export acceptance is still required before treating
        this as an accepted brief.
      </p>
    </section>
  );
}
