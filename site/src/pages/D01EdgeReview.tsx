import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import sheetJson from "../../../research/domain-graph/context-completions.v1.json";
import {
  DECISION_DONE,
  DECISION_LABEL,
  REASON_LIMITS,
  acceptSheetForReview,
  browserStore,
  exportDecisions,
  history,
  latestDecisions,
  recordDecision,
  verifyDecisions,
  type D01EdgeDecision,
  type D01EdgeReviewDecision,
  type D01EdgeReviewRow,
  type D01EdgeReviewSheet,
} from "../../../src/knowledgeGraph/d01EdgeReview";
import "../styles/ontology-review.css";

const LABEL = DECISION_LABEL;
const DONE = DECISION_DONE;

function download(value: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2) + "\n"], {type: "application/json"}));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Card({
  row,
  latest,
  count,
  reviewer,
  onSave,
}: {
  row: D01EdgeReviewRow;
  latest: D01EdgeDecision | undefined;
  count: number;
  reviewer: string;
  onSave: (row: D01EdgeReviewRow, decision: D01EdgeReviewDecision, reason: string) => Promise<string>;
}) {
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const headingId = "d01-" + row.edgeId.replace(/[^a-z0-9]+/gi, "-");
  async function go(d: D01EdgeReviewDecision) {
    setMsg(await onSave(row, d, reason));
  }
  return (
    <article className="mr-card" aria-labelledby={headingId}>
      <header>
        <h3 id={headingId}>
          {row.subject} → {row.object}
        </h3>
        {latest ? (
          <span
            className={
              "mr-chip " +
              (latest.decision === "accept_candidate"
                ? "mr-ok"
                : latest.decision === "reject_candidate"
                  ? "mr-no"
                  : "mr-wait")
            }
          >
            {DONE[latest.decision]}
          </span>
        ) : (
          <span className="mr-chip">Awaiting review</span>
        )}
      </header>
      <p>
        <code>{row.predicate}</code>
        {row.sourceId ? (
          <>
            {" "}
            · source <code>{row.sourceId}</code>
          </>
        ) : null}
      </p>
      <p className="mr-hint">
        Edge <code>{row.edgeId}</code> · model {row.model}
        {row.conditions.length ? ` · ${row.conditions.join(", ")}` : ""}
      </p>
      <p className="mr-hint">
        Current tissue: {row.current.tissue ?? "—"} · population: {row.current.population ?? "—"} · design:{" "}
        {row.current.design || "—"}
      </p>
      <label className="mr-field">
        Reason for your recommendation
        <textarea
          rows={2}
          maxLength={REASON_LIMITS.max}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-describedby={headingId + "-hint"}
        />
      </label>
      <p id={headingId + "-hint"} className="mr-hint">
        {REASON_LIMITS.min}–{REASON_LIMITS.max} characters. Describe the edge only; do not enter personal or patient
        information.
      </p>
      <div className="mr-actions" role="group" aria-label={"Decision for " + row.subject + " to " + row.object}>
        {(Object.keys(LABEL) as D01EdgeReviewDecision[]).map((d) => (
          <button
            key={d}
            type="button"
            className={d === "accept_candidate" ? "mr-btn mr-btn-primary" : "mr-btn"}
            disabled={!reviewer.trim()}
            onClick={() => go(d)}
          >
            {LABEL[d]}
          </button>
        ))}
      </div>
      {!reviewer.trim() && <p className="mr-hint">Enter a reviewer label above to record a decision.</p>}
      {msg && (
        <p className="mr-error" role="alert">
          {msg}
        </p>
      )}
      {latest && (
        <p className="mr-hint">
          Latest: {DONE[latest.decision]} by {latest.reviewerLabel} (unverified), revision {latest.revision} of {count}.
          “{latest.reason}” · scientificClaimAllowed=false · graphPromotion=false
        </p>
      )}
    </article>
  );
}

let sheetLoad: {sheet: D01EdgeReviewSheet; error: ""} | {sheet: null; error: string};
try {
  sheetLoad = {sheet: acceptSheetForReview(sheetJson), error: ""};
} catch {
  sheetLoad = {
    sheet: null,
    error: "The sealed D-01 context sheet could not be accepted for review. No queue is shown.",
  };
}

export function D01EdgeReviewPage() {
  const sheet = sheetLoad.sheet;
  const store = useMemo(() => browserStore(), []);
  const [tick, setTick] = useState(0);
  const [reviewer, setReviewer] = useState("");
  const [filter, setFilter] = useState<"pending" | "decided" | "all">("pending");
  const [problems, setProblems] = useState<string[]>([]);
  const [exportMsg, setExportMsg] = useState("");
  const [notice, setNotice] = useState("");

  const latest = useMemo(
    () => (sheet && store ? latestDecisions(sheet, store) : new Map<string, D01EdgeDecision>()),
    [sheet, store, tick],
  );

  useEffect(() => {
    if (sheet && store) verifyDecisions(sheet, store).then(setProblems);
  }, [sheet, store, tick]);

  if (!sheet) {
    return (
      <div className="mr-page">
        <header className="mr-hero">
          <p className="mr-kicker">HUMAN SUPER INTELLIGENCE / CURATOR WORKSPACE</p>
          <h1>D-01 edge review</h1>
          <p role="alert">{sheetLoad.error}</p>
        </header>
      </div>
    );
  }

  // Narrow for nested handlers — closures do not keep the early-return type guard.
  const sealed: D01EdgeReviewSheet = sheet;
  const shown = sealed.rows.filter((r) => filter === "all" || (filter === "decided") === latest.has(r.edgeId));

  async function save(row: D01EdgeReviewRow, decision: D01EdgeReviewDecision, reason: string) {
    if (!store) return "This browser is blocking local storage, so decisions cannot be recorded here.";
    try {
      const r = await recordDecision(sealed, store, {edgeId: row.edgeId, decision, reason, reviewerLabel: reviewer});
      setTick((t) => t + 1);
      setNotice(
        `${row.subject} → ${row.object}: ${
          r.status === "unchanged"
            ? "already recorded, no change"
            : DONE[decision].toLowerCase() + ", recorded on this device as an unreviewed recommendation"
        }. The published graph is unchanged.`,
      );
      return "";
    } catch (e) {
      return e instanceof Error ? e.message : "Could not record the decision";
    }
  }

  async function exportAll() {
    if (!store) return;
    try {
      const out = await exportDecisions(sealed, store);
      download(out, "hsi-d01-edge-decisions.json");
      setExportMsg(`Exported ${out.decisions.length} recorded decisions (${out.counts.decided} edges).`);
    } catch (e) {
      setExportMsg(e instanceof Error ? e.message : "Export failed");
    }
  }

  return (
    <div className="mr-page">
      <header className="mr-hero">
        <p className="mr-kicker">HUMAN SUPER INTELLIGENCE / CURATOR WORKSPACE</p>
        <h1>D-01 edge review</h1>
        <p>
          Record accept, reject, revise or insufficient recommendations on {sheet.rows.length} D-01 source-candidate
          edges from the sealed context sheet. Mapped against{" "}
          <code>{sheet.mappedAgainst.slice(0, 12)}…</code>.
        </p>
        <p className="mr-banner" role="note">
          <strong>These are recommendations, not graph promotions.</strong> They stay on this device, the reviewer label
          is self-declared and unverified, scientificClaimAllowed stays false, and the published graph does not change.
          Dual independent review is still required before any release.
        </p>
      </header>
      <div className="mr-wrap">
        <section aria-label="Reviewer and progress" className="mr-bar">
          <label className="mr-field">
            Reviewer label
            <input value={reviewer} maxLength={60} onChange={(e) => setReviewer(e.target.value)} autoComplete="off" />
          </label>
          <p className="mr-progress" aria-live="polite">
            <strong>{latest.size}</strong> of {sheet.rows.length} reviewed · {sheet.rows.length - latest.size} pending
          </p>
          <div role="group" aria-label="Filter edges" className="mr-filters">
            {(["pending", "decided", "all"] as const).map((f) => (
              <button key={f} type="button" className="mr-btn" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === "pending" ? "Pending" : f === "decided" ? "Reviewed" : "All"}
              </button>
            ))}
          </div>
          <button type="button" className="mr-btn" onClick={exportAll} disabled={!store || latest.size === 0}>
            Export recommendations
          </button>
        </section>
        {!store && (
          <p className="mr-error" role="alert">
            Local storage is not available in this browser, so recommendations cannot be recorded.
          </p>
        )}
        {problems.length > 0 && (
          <p className="mr-error" role="alert">
            Stored decisions failed verification: {problems.join("; ")}
          </p>
        )}
        <div aria-live="polite">
          {notice && (
            <p className="mr-msg" role="status">
              {notice}
            </p>
          )}
          {exportMsg && (
            <p className="mr-msg" role="status">
              {exportMsg}
            </p>
          )}
        </div>
        {shown.length === 0 ? (
          <p className="mr-empty">Nothing in this view.</p>
        ) : (
          shown.map((row) => (
            <Card
              key={row.edgeId}
              row={row}
              latest={latest.get(row.edgeId)}
              count={store ? history(store, row.edgeId).length : 0}
              reviewer={reviewer}
              onSave={save}
            />
          ))
        )}
        <p className="mr-foot">
          <Link to="/research/knowledge-graph">Back to the knowledge graph</Link>
          {" · "}
          <Link to="/research/ontology-review">Ontology mapping review</Link>
        </p>
      </div>
    </div>
  );
}
