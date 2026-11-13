import { useState } from "react";
import { Maturity } from "./ResearchPublic";
const examples = [
  {
    id: "A",
    title: "Example A",
    version: "Synthetic A · version 1",
    observation:
      "In fictional condition A, the selected activation readout increases after a model intervention.",
    species: "Human",
    tissue: "Skin",
    state: "Activated B cell",
    assay: "Flow cytometry",
  },
  {
    id: "B",
    title: "Example B",
    version: "Synthetic B · version 1",
    observation:
      "In fictional condition B, a gene-expression readout decreases in a different experimental system.",
    species: "Mouse",
    tissue: "Lung",
    state: "Resting B cell",
    assay: "RNA sequencing",
  },
  {
    id: "missing",
    title: "Missing source",
    version: "No source version available",
    observation: null,
    species: "Not reported",
    tissue: "Not reported",
    state: "Not reported",
    assay: "Not reported",
  },
];
const tabs = ["Source", "Passage", "Context", "Permissions"] as const;
export function EvidenceExplorer() {
  const [record, setRecord] = useState(0),
    [tab, setTab] = useState<(typeof tabs)[number]>("Source");
  const active = examples[record]!;
  return (
    <section className="hsi-evidence-explorer" aria-label="Illustrative evidence explorer">
      <header>
        <Maturity children={"Demonstration"} />
        <p>Original synthetic records. No real publication, quotation or clearance is represented.</p>
      </header>
      <div className="hsi-evidence-body">
        <div className="hsi-evidence-list" role="group" aria-label="Choose an illustrative evidence record">
          {examples.map((r, n) => (
            <button key={r.id} aria-pressed={record === n} onClick={() => setRecord(n)}>
              <strong>{r.title}</strong>
              <span>{r.observation ? "Synthetic observation" : "Evidence unavailable"}</span>
            </button>
          ))}
        </div>
        <div className="hsi-evidence-inspector">
          <div role="group" aria-label="Inspect evidence dimensions">
            {tabs.map((t) => (
              <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <article aria-live="polite">
            <h3>
              {active.title}: {tab.toLowerCase()}
            </h3>
            {tab === "Source" && (
              <>
                <dl>
                  <dt>Identity</dt>
                  <dd>
                    {active.id === "missing"
                      ? "Unknown—do not fabricate a citation"
                      : "Fictional teaching record; no DOI or PMID"}
                  </dd>
                  <dt>Version</dt>
                  <dd>{active.version}</dd>
                  <dt>Study family</dt>
                  <dd>{active.id === "missing" ? "Unresolved" : "Synthetic demonstration only"}</dd>
                  <dt>Correction/retraction check</dt>
                  <dd>No real publication to check. Current checks are required for actual sources.</dd>
                </dl>
                <p>
                  A citation or retrieved title alone does not establish source identity, permitted use or
                  support.
                </p>
              </>
            )}
            {tab === "Passage" && (
              <>
                <p className="hsi-passage">
                  {active.observation ??
                    "No passage is available. Abstain from attributing a claim to this record."}
                </p>
                <p>
                  {active.observation
                    ? "Authored fictional text, not a quotation from a publication. A real record must bind the exact span to its source version."
                    : "A failed or empty search must remain visible. It is not proof that opposing evidence does not exist."}
                </p>
              </>
            )}
            {tab === "Context" && (
              <>
                <dl>
                  {[
                    ["Species", active.species],
                    ["Tissue", active.tissue],
                    ["Cell state", active.state],
                    ["Assay", active.assay],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  Dose, timing, cohort, controls, uncertainty and estimand are not supplied. Do not infer
                  comparability from these abbreviated examples.
                </p>
              </>
            )}
            {tab === "Permissions" && (
              <>
                <h4>No real source-use approval</h4>
                <p>
                  This record contains only original fictional teaching text. For actual sources, storage,
                  display, comparison, export and model transmission each require current permitted-use
                  checks.
                </p>
                <p>
                  Unknown, expired, corrected, retracted, withdrawn or conflicting identifiers must block the
                  relevant operations and flag dependent work for re-review.
                </p>
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
