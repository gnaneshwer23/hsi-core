import { Link } from "react-router-dom";
import {
  DEPARTMENT_SLUGS,
  type DepartmentSlug,
} from "@hsi/knowledgeGraph/departments";
import type { DomainBundle } from "@hsi/knowledgeGraph/domainGraph";
import {
  USP_B_EVIDENCE_STATUS_LABEL,
  USP_B_TRAIL_HONESTY,
  type UspBNodeMatch,
  type UspBPathView,
} from "@hsi/investigation/uspBCrossDomainTrail";
import { departmentBySlug } from "../../lib/departments";

type CoverageRow = {
  department: DepartmentSlug;
  concepts: number;
  status: "candidate_coverage" | "no_graph_coverage";
};

/** Cross-domain panel: department coverage, candidate pathways, demoted AI hypotheses. */
export function UspBCrossDomainPanel({
  bundle,
  coverage,
  matches,
  startId,
  targetDepartment,
  pathStatus,
  paths,
  selectedPathIndex,
  gapCount,
  hypothesisCount,
  graphError,
  onSelectStart,
  onSelectTarget,
  onSelectPath,
  onOpenGaps,
  onOpenBrief,
}: {
  bundle: DomainBundle | null;
  coverage: readonly CoverageRow[];
  matches: readonly UspBNodeMatch[];
  startId: string | null;
  targetDepartment: DepartmentSlug;
  pathStatus: string | null;
  paths: readonly UspBPathView[];
  selectedPathIndex: number | null;
  gapCount: number;
  hypothesisCount: number;
  graphError: string | null;
  onSelectStart: (id: string) => void;
  onSelectTarget: (slug: DepartmentSlug) => void;
  onSelectPath: (index: number | null) => void;
  onOpenGaps: () => void;
  onOpenBrief: () => void;
}) {
  const selected =
    selectedPathIndex !== null
      ? (paths.find((p) => p.index === selectedPathIndex) ?? null)
      : null;

  return (
    <section className="ws-card ws-cross" aria-labelledby="ws-cross-h">
      <header>
        <h2 id="ws-cross-h">Cross-domain mechanisms</h2>
      </header>
      <p className="ws-muted">
        USP B: follow candidate relationships across scientific departments on the published
        research graph. Paths are association chains, not established causal mechanisms.
        Causal conclusion allowed:{" "}
        {String(USP_B_TRAIL_HONESTY.causalConclusionAllowed)}. Scientific approval:{" "}
        {String(USP_B_TRAIL_HONESTY.scientificApproval)}.
      </p>
      {graphError ? (
        <p className="ws-err" role="alert">
          {graphError} No partial graph is shown.
        </p>
      ) : !bundle ? (
        <p className="ws-muted" role="status">
          Loading the published cross-domain graph…
        </p>
      ) : (
        <>
          <div className="ws-dept-rail" role="list" aria-label="Department coverage">
            {coverage.map((row) => {
              const info = departmentBySlug(row.department);
              return (
                <div
                  key={row.department}
                  role="listitem"
                  className="ws-dept-chip"
                  data-status={row.status}
                >
                  <b>{info?.name ?? row.department}</b>
                  <small>
                    {row.status === "no_graph_coverage"
                      ? "No graph coverage yet"
                      : `${row.concepts} candidate concept(s)`}
                  </small>
                </div>
              );
            })}
          </div>

          <div className="ws-cross-controls">
            <label className="ws-field">
              Start concept (matched from this run when possible)
              <select
                value={startId ?? ""}
                onChange={(e) => {
                  if (e.target.value) onSelectStart(e.target.value);
                }}
              >
                <option value="" disabled>
                  {matches.length ? "Select a matched concept" : "No run label matched yet"}
                </option>
                {matches.map((m) => (
                  <option key={m.nodeId} value={m.nodeId}>
                    {m.nodeName}
                    {m.departments.length
                      ? ` · ${m.departments.join(", ")}`
                      : " · untagged"}
                    {m.score !== "exact" ? ` (${m.score})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="ws-field">
              Into department
              <select
                value={targetDepartment}
                onChange={(e) => onSelectTarget(e.target.value as DepartmentSlug)}
              >
                {DEPARTMENT_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {departmentBySlug(slug)?.name ?? slug}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!matches.length ? (
            <p className="ws-muted">
              No entity label from this live run matched a published graph concept. Open the{" "}
              <Link to="/research/knowledge-graph">knowledge graph</Link> to pick a start, or
              re-run with entities present in the snapshot. Nothing is inferred to fill the gap.
            </p>
          ) : null}

          {startId && pathStatus === "target_has_no_graph_coverage" ? (
            <p className="ws-warn" role="status">
              Target department has no concept in the published graph yet. This is a coverage
              gap, not evidence of biological absence.
            </p>
          ) : null}
          {startId && pathStatus === "no_path_within_bound" ? (
            <p className="ws-warn" role="status">
              No path of four hops or fewer connects this concept to that department in the
              current graph. That reflects coverage, not proof that no connection exists.
            </p>
          ) : null}

          {paths.length > 0 ? (
            <ul className="ws-cross-paths">
              {paths.map((path) => (
                <li key={path.index}>
                  <button
                    type="button"
                    className="ws-cross-path"
                    aria-pressed={selectedPathIndex === path.index}
                    onClick={() =>
                      onSelectPath(selectedPathIndex === path.index ? null : path.index)
                    }
                  >
                    <b>
                      Path {path.index + 1} · {path.hopCount} hop
                      {path.hopCount === 1 ? "" : "s"} · {path.evidenceChain.replaceAll("_", " ")}
                    </b>
                    <span>{path.departmentsTraversed.join(" → ")}</span>
                    <span className="ws-muted">
                      {path.warnings[0] ?? "Candidate path only"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {selected ? <PathDetail path={selected} /> : null}

          <div className="ws-cross-next">
            <p className="ws-muted">
              Run gaps: {gapCount}. Unvalidated AI hypotheses (demoted): {hypothesisCount}. AI
              proposals are not findings and are not reviewed.
            </p>
            <div className="ws-row-actions">
              <button type="button" className="ws-btn" onClick={onOpenGaps}>
                Open gaps in this run
              </button>
              <button type="button" className="ws-btn" onClick={onOpenBrief}>
                Open decision brief
              </button>
              <Link className="ws-btn" to="/research/knowledge-graph">
                Open full graph explorer
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function PathDetail({ path }: { path: UspBPathView }) {
  return (
    <div className="ws-cross-detail" aria-label="Selected candidate pathway">
      <p className="ws-warn" role="status">
        Causal conclusion allowed: false. Evidence chain:{" "}
        {path.evidenceChain.replaceAll("_", " ")}.
        {path.boundaries.length
          ? ` Evidence stops at hop(s) ${path.boundaries.join(", ")}.`
          : ""}
      </p>
      <ol className="ws-cross-hops">
        {path.hops.map((hop, i) => (
          <li key={`${hop.edgeId}-${i}`} data-stops={hop.evidenceStops ? "1" : "0"}>
            <b>
              {hop.fromName} → {hop.toName}
            </b>
            <span>
              {hop.predicate} · {USP_B_EVIDENCE_STATUS_LABEL[hop.evidenceStatus]}
              {hop.tissue ? ` · tissue ${hop.tissue}` : " · tissue not stated"} · model{" "}
              {hop.model}
            </span>
          </li>
        ))}
      </ol>
      <ul className="ws-muted">
        {path.warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
