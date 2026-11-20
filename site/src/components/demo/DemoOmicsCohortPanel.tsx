import { Link } from "react-router-dom";
import {
  demoOmicsAllowsRealData,
  getDemoOmicsCohortPack,
  listDemoAssaysForScenario,
  listDemoCohortsForScenario,
  listDemoOmicsForScenario,
  presentDemoCohortCounts,
} from "../../demo";
import "../../styles/demo-universe.css";

/** PR5 — assay / omics / synthetic cohort sketches for a Demo Universe scenario. */
export function DemoOmicsCohortPanel({ scenarioId }: { scenarioId: string }) {
  const pack = getDemoOmicsCohortPack();
  const assays = listDemoAssaysForScenario(scenarioId);
  const omics = listDemoOmicsForScenario(scenarioId);
  const cohorts = listDemoCohortsForScenario(scenarioId);

  return (
    <section className="ent-panel du-omics-panel" aria-labelledby="du-omics">
      <h2 id="du-omics">Omics, assays &amp; synthetic cohorts</h2>
      <p className="ent-lead">
        Aggregate and metadata sketches linked to this scenario. Real data enabled:{" "}
        {String(demoOmicsAllowsRealData())}. Clinical-plane shards are not loaded (
        {String(pack.loadsClinicalPlaneShards)}).
      </p>
      <p className="ent-banner" role="status">
        Schema {pack.schemaVersion} · production write:{" "}
        {String(pack.canWriteToProductionGraph)} · can enable real data:{" "}
        {String(pack.canEnableRealData)} · not clinical advice.
      </p>

      {assays.length === 0 && omics.length === 0 && cohorts.length === 0 ? (
        <p className="ent-lead">
          No PR5 assay or cohort sketches are attached to this scenario yet. Open the{" "}
          <Link to="/enterprise/lab">lab shell</Link> for modality chrome, or pick a
          linked scenario (single-cell, tissue, gut–immune, inflammation, neuroimmune,
          comparative disease).
        </p>
      ) : null}

      {assays.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.95rem" }}>Assay metadata sketches</h3>
          <ul className="du-omics-list">
            {assays.map((a) => (
              <li key={a.id}>
                <strong>
                  {a.name} · {a.modality}
                </strong>
                <span>Fake QC score: {String(a.fakeQcScore)}</span>
                <ul>
                  {a.fields.map((f) => (
                    <li key={f.label}>
                      {f.label}: {f.value ?? "null (missing explicit)"}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {omics.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.95rem" }}>Omics candidates (unreviewed)</h3>
          <ul className="du-omics-list">
            {omics.map((o) => (
              <li key={o.id}>
                <strong>{o.label}</strong>
                <span>
                  {o.domains.join(" · ")} · {o.reviewStatus}
                </span>
                <span>{o.note}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {cohorts.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.95rem" }}>Synthetic cohort aggregates</h3>
          <ul className="du-omics-list">
            {cohorts.map((c) => {
              const presented = presentDemoCohortCounts(c);
              return (
                <li key={c.id}>
                  <strong>{c.title}</strong>
                  <span>
                    dataClass={c.dataClass} · threshold {c.smallCellThreshold} · small
                    cells withheld: {String(c.smallCellsWithheld)}
                  </span>
                  <span>
                    evaluated: {presented.evaluated ?? "withheld"} · matched:{" "}
                    {presented.matched ?? "withheld"} · excluded:{" "}
                    {presented.excluded ?? "withheld"}
                    {presented.withheldKeys.length
                      ? ` · withheld: ${presented.withheldKeys.join(", ")}`
                      : ""}
                  </span>
                  <span>{c.note}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <p className="ent-lead">
        Pack totals: {pack.assays.length} assays · {pack.omicsCandidates.length} omics ·{" "}
        {pack.cohorts.length} cohorts.{" "}
        <Link to="/research/cohort">Synthetic cohort demonstration</Link>
        {" · "}
        <Link to="/enterprise/lab">Lab &amp; omics shell</Link>
      </p>
    </section>
  );
}
