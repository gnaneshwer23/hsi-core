import { useState } from "react";
import { Link } from "react-router-dom";
import { LabOmicsShell } from "../components/enterprise/LabOmicsShell";
import { DemoUniverseRolePanel } from "../components/demo/DemoUniverseRolePanel";
import { DemoOmicsCohortPanel } from "../components/demo/DemoOmicsCohortPanel";
import {
  labOmicsDashboardDemo,
  type LabAssayDemo,
  type LabOmicsCandidate,
} from "@hsi/enterprise/labOmicsDashboardDemo";
import "../styles/enterprise-dashboard.css";

/** Laboratory & Omics shell — demonstration fixtures; shared science engine. */
export function LabOmicsDashboard() {
  const demo = labOmicsDashboardDemo();
  const [selectedAssay, setSelectedAssay] = useState<LabAssayDemo>(demo.assays[0]!);
  const [selectedOmics, setSelectedOmics] = useState<LabOmicsCandidate>(
    demo.omicsCandidates[0]!,
  );

  return (
    <LabOmicsShell
      title={demo.programmeName}
      subtitle="Experimental scientists · core facilities · bioinformatics preview"
    >
      <p className="ent-banner" role="status">
        {demo.governanceNote} UMAP / heatmap / gene-table widgets are lab chrome only —
        this shell does not invent QC scores or integration quality percentages.
      </p>

      <section className="ent-stats" aria-label="Lab omics summary demonstration">
        <article className="ent-stat">
          <strong>{demo.summary.assayCount}</strong>
          <span>Assay sketches</span>
          <em>Missing fields explicit</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.comparisonCount}</strong>
          <span>Comparisons</span>
          <em>Verification-bound</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.omicsCandidateCount}</strong>
          <span>Omics candidates</span>
          <em>Unreviewed</em>
        </article>
        <article className="ent-stat">
          <strong>{demo.summary.pathwayMapCount}</strong>
          <span>Pathway maps</span>
          <em>Demo / source-linked</em>
        </article>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="lab-assay-heading">
          <h2 id="lab-assay-heading">Assay metadata</h2>
          <p className="ent-lead">
            Passport experimental fields and methods honesty — nulls stay visible.
          </p>
          <div className="ent-tree" role="group" aria-label="Assays">
            {demo.assays.map((a) => (
              <button
                key={a.id}
                type="button"
                className="ent-node"
                aria-pressed={selectedAssay.id === a.id}
                onClick={() => setSelectedAssay(a)}
              >
                <strong>{a.name}</strong>
                <span>{a.modalityHint}</span>
                <span>{a.methodsHonesty}</span>
              </button>
            ))}
          </div>
          <div className="ent-inspect" style={{ marginTop: "1rem" }}>
            <h3 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem" }}>
              Inspect: {selectedAssay.name}
            </h3>
            <ul>
              {selectedAssay.fields.map((f) => (
                <li key={f.id}>
                  <strong>{f.label}</strong>:{" "}
                  {f.missingExplicit || f.value === null
                    ? "missing (explicit)"
                    : f.value}
                </li>
              ))}
            </ul>
            <div className="ent-actions">
              <Link className="ent-btn" to="/research/methods">
                Methods honesty
              </Link>
              <Link className="ent-btn ent-btn-secondary" to="/research/workspace">
                Open brief / passport
              </Link>
            </div>
          </div>
        </section>

        <section className="ent-panel" aria-labelledby="lab-cmp-heading">
          <h2 id="lab-cmp-heading">Experiment comparisons</h2>
          <p className="ent-lead">Verification-bound — no unverified delta claims.</p>
          <ul>
            {demo.comparisons.map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong> — verification-bound:{" "}
                {String(c.verificationBound)}. {c.note}
                <div className="ent-actions">
                  <Link className="ent-btn ent-btn-secondary" to={c.nextSurface}>
                    Open comparison surface
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="lab-omics-heading">
        <h2 id="lab-omics-heading">Multi-omics interpretation</h2>
        <p className="ent-lead">
          Domain KG / cross-domain candidates — review status stays unreviewed.
        </p>
        <div className="ent-tree" role="group" aria-label="Omics candidates">
          {demo.omicsCandidates.map((o) => (
            <button
              key={o.id}
              type="button"
              className="ent-node"
              aria-pressed={selectedOmics.id === o.id}
              onClick={() => setSelectedOmics(o)}
            >
              <strong>{o.label}</strong>
              <span>{o.domains.join(" · ")}</span>
              <span>{o.reviewStatus.replaceAll("_", " ")}</span>
            </button>
          ))}
        </div>
        <div className="ent-inspect" style={{ marginTop: "1rem" }}>
          <p className="ent-lead" style={{ margin: 0 }}>
            {selectedOmics.note} Not scientific gold.
          </p>
          <div className="ent-actions" style={{ marginTop: "0.75rem" }}>
            <Link className="ent-btn ent-btn-secondary" to="/research/knowledge-graph">
              Explore knowledge graph
            </Link>
          </div>
        </div>
      </section>

      <div className="ent-grid-2">
        <section className="ent-panel" aria-labelledby="lab-rep-heading">
          <h2 id="lab-rep-heading">Reproducibility checks</h2>
          <p className="ent-lead">
            Verification status, dual-model availability, retraction flags — never fake
            QC scores.
          </p>
          <ul>
            {demo.reproducibility.map((r) => (
              <li key={r.id}>
                <strong>{r.label}</strong> · {r.status.replaceAll("_", " ")}. Fake QC
                score: {String(r.fakeQcScore)}. {r.note}
              </li>
            ))}
          </ul>
        </section>

        <section className="ent-panel" aria-labelledby="lab-path-heading">
          <h2 id="lab-path-heading">Pathway mapping</h2>
          <p className="ent-lead">
            GSEA-style research views — demo or source-linked only.
          </p>
          <ul>
            {demo.pathways.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong> · {p.honesty.replaceAll("_", " ")}.
                <div className="ent-actions">
                  <Link className="ent-btn ent-btn-secondary" to={p.nextSurface}>
                    Science paths
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="ent-panel" aria-labelledby="lab-ev-heading">
        <h2 id="lab-ev-heading">Biological evidence integration</h2>
        <ul>
          {demo.evidenceIntegration.map((e) => (
            <li key={e.id}>
              <strong>{e.title}</strong> — integration quality %:{" "}
              {e.integrationQualityPercent === null
                ? "not measured (null)"
                : String(e.integrationQualityPercent)}
              ; invented feature count: {String(e.inventedFeatureCount)}. {e.note}
              <div className="ent-actions">
                <Link className="ent-btn" to={e.nextSurface}>
                  Open Stage 2 workspace
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ent-panel" aria-labelledby="lab-gaps-heading">
        <h2 id="lab-gaps-heading">Lab research questions</h2>
        <ul>
          {demo.opportunities.map((g) => (
            <li key={g.id}>
              <strong>{g.question}</strong>
              <p className="ent-lead">
                {g.entities.join(" · ")}. Uncertainty: {g.uncertainty}. Review:{" "}
                {g.reviewStatus}.
              </p>
              <div className="ent-actions">
                <Link className="ent-btn ent-btn-secondary" to={g.nextInvestigation}>
                  Next surface
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <DemoUniverseRolePanel roleId="lab" />
      <DemoOmicsCohortPanel scenarioId="single-cell-omics" />
    </LabOmicsShell>
  );
}
