import {Link} from "react-router-dom";
import sheetJson from "../../../research/domain-graph/context-completions.v1.json";
import {
  acceptSealedSheetForUi,
  summarizeContextCompletionProgress,
} from "../../../src/knowledgeGraph/contextCompletionProgress";
import "../styles/science-body.css";

export function ContextCompletionStatusPage() {
  let progress = null as ReturnType<typeof summarizeContextCompletionProgress> | null;
  let error = "";
  try {
    // Browser-safe accept only — digest sealing stays on CLI/Node (node:crypto).
    progress = summarizeContextCompletionProgress(acceptSealedSheetForUi(sheetJson));
  } catch {
    error = "The sealed D-01 context completion sheet could not be verified. No fill progress is shown.";
  }

  return (
    <div className="science-body">
      <header className="science-body-hero">
        <div className="science-body-wrap">
          <p className="science-body-kicker">HSI / CURATOR SHEET</p>
          <h1>
            D-01 context completion.
            <br />
            <em>Fill progress only.</em>
          </h1>
          <p>
            Tissue, population and design proposals for D-01 source-candidate edges. This page never applies edits,
            never reviews edges, and never promotes relationships to the graph.
          </p>
          <div className="science-body-actions">
            <Link to="/research/knowledge-graph">Claim-linked graph</Link>
            <Link to="/research/evidence-readiness">Evidence catalogue</Link>
          </div>
        </div>
      </header>
      <div className="science-body-wrap">
        {error ? (
          <p role="alert">{error}</p>
        ) : progress ? (
          <>
            <section aria-label="Context completion fill progress">
              <p>
                Slice <strong>{progress.slice}</strong> · mapped against{" "}
                <code>{progress.mappedAgainst.slice(0, 12)}…</code>
              </p>
              <ul>
                <li>
                  <strong>{progress.rowCount}</strong> candidate edges on the sheet
                </li>
                <li>
                  <strong>{progress.rowsWithAnyProposal}</strong> rows with any proposed value
                </li>
                <li>
                  <strong>{progress.rowsUntouched}</strong> rows still untouched
                </li>
                <li>
                  Proposed tissue <strong>{progress.tissueProposed}</strong> · population{" "}
                  <strong>{progress.populationProposed}</strong> · design{" "}
                  <strong>{progress.designProposed}</strong>
                </li>
              </ul>
            </section>
            <p role="note">
              autoPromotion={String(progress.autoPromotion)} · scientificApproval=
              {String(progress.scientificApproval)}. Use{" "}
              <code>bun run context-sheet:merge-csv</code> and{" "}
              <code>bun run context-sheet:apply</code> offline; apply still refuses promotion.
            </p>
            <p>
              Sheet artifact: <code>research/domain-graph/context-completions.v1.json</code> (and CSV twin). Filling
              proposals does not review or promote edges.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
