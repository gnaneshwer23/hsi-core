import { Link } from "react-router-dom";
import { JourneySteps, KIND } from "../components/home/JourneySteps";
import "../styles/research-home.css";
import "../styles/premium-public.css";

const WORKFLOW = [
  {
    title: "Research question",
    text: "Define the biological scope and what decision the investigation must inform.",
  },
  {
    title: "Permitted evidence",
    text: "Retrieve bibliographic records from configured public sources with provenance intact.",
  },
  {
    title: "Experimental context",
    text: "Keep model, tissue, dose, population and endpoint visible — including fields that are not stated.",
  },
  {
    title: "Conflicting findings",
    text: "Compare studies before declaring contradiction; abstain when contexts are incompatible.",
  },
  {
    title: "Mechanism graph",
    text: "Inspect candidate relationships on the published graph with source and review status.",
  },
  {
    title: "Uncertainty",
    text: "Separate missing extraction, weak support and unresolved disagreement.",
  },
  {
    title: "Candidate gaps",
    text: "Surface what the graph does not yet connect; leave scientific priority to human review.",
  },
  {
    title: "Reviewable brief",
    text: "Export a structured brief that preserves limitations — not an auto-approved conclusion.",
  },
] as const;

const RUNS: [string, string][] = [
  [
    "Evidence services",
    "Europe PMC, OpenAlex and Open Targets can be queried when you ask. Questions are not stored with retrievals in this preview.",
  ],
  [
    "Knowledge graph",
    "Published, digest-verified snapshot. Every relationship is a candidate with source, context and review status.",
  ],
  [
    "Your records",
    "Gaps, hypotheses, methods and many saved runs stay in this browser until a server store is enabled under fail-closed gates.",
  ],
  [
    "Clinical plane",
    "Separate governed environment. This preview holds synthetic patients only; the release gate refuses anything else.",
  ],
  [
    "Model checks",
    "Off unless separately configured. Surfaces that need them say so; nothing pretends a check ran.",
  ],
  [
    "Accounts",
    "Sign-in and email verification work. Creating an account does not grant research or reviewer permissions.",
  ],
];

const LABELS: [keyof typeof KIND, string][] = [
  ["live", "Queried from a public source when you ask. Nothing is stored with your question."],
  ["published", "Read from the published graph snapshot. Every relationship is a candidate with its review status."],
  ["synthetic", "Generated patient data. No real person is represented."],
  ["derived", "Computed from the graph or from your own records, not written by a model."],
  ["manual", "Written by you. Nothing is proposed or filled in for you."],
  ["local", "Kept in this browser. Server storage is not enabled."],
];

const GATES = [
  "Approval of the two-plane architecture decision (done)",
  "An independent security review of the account-storage design",
  "A named clinical safety officer and a clinical safety case",
  "A data protection impact assessment and a lawful basis",
  "A data-sharing agreement with a data controller",
];

export function HowItWorksPage() {
  return (
    <div className="pg-page pg-sub">
      <header className="pg-phero">
        <h1>From research question to evidence-grounded decision.</h1>
        <div>
          <p className="pg-lead">
            One scientific workflow: retrieve permitted evidence, compare experimental context, inspect candidate
            mechanisms, surface uncertainty and leave a reviewable brief. Outputs that are illustrative or unreviewed
            are labelled as such.
          </p>
          <p className="pg-micro" role="note">
            Former “Platform” marketing URLs redirect here. HSI is one scientific intelligence product — not a
            portfolio of separate platforms.
          </p>
          <div className="pg-cta">
            <Link className="pg-btn" to="/research/journey">
              Explore Workflow <span aria-hidden="true">→</span>
            </Link>
            <Link className="pg-link" to="/welcome">
              Set up your research home <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="pg-block" aria-labelledby="hw-flow-h">
        <h2 id="hw-flow-h">The scientific investigation path.</h2>
        <p className="pg-sub-p">
          This is the product spine. Later audience pages reuse the same path with different entry points — not
          separate engines.
        </p>
        <ol className="hw-flow" aria-label="Platform workflow stages">
          {WORKFLOW.map((step, i) => (
            <li key={step.title}>
              <span className="hw-flow-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-block" aria-labelledby="hw-labels-h">
        <h2 id="hw-labels-h">How to read maturity labels.</h2>
        <p className="pg-sub-p">
          Every step carries one of six labels so live evidence is not confused with a snapshot, synthetic data or
          your own notes.
        </p>
        <dl className="hw-labels">
          {LABELS.map(([k, t]) => (
            <div key={k}>
              <dt>{KIND[k]}</dt>
              <dd>{t}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pg-block" aria-labelledby="hw-steps-h">
        <h2 id="hw-steps-h" className="pg-vh">
          Working screens in the app
        </h2>
        <p className="pg-sub-p">
          Representative product preview from existing capabilities. Simulated or local-only steps stay labelled.
        </p>
        <JourneySteps headingLevel={3} />
      </section>

      <section className="pg-block pg-two" aria-labelledby="hw-runs-h">
        <div>
          <h2 id="hw-runs-h">What runs where.</h2>
          <p className="pg-sub-p">Each subsystem and its status in this research preview.</p>
        </div>
        <div className="pg-tablewrap" tabIndex={0} role="region" aria-label="What runs where, scrollable">
          <table className="pg-table">
            <caption className="pg-vh">What each part of HSI does and its status</caption>
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col">Today</th>
              </tr>
            </thead>
            <tbody>
              {RUNS.map(([a, b]) => (
                <tr key={a}>
                  <th scope="row">{a}</th>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pg-block pg-two" aria-labelledby="hw-gate-h">
        <div>
          <h2 id="hw-gate-h">Before any real patient data.</h2>
          <p className="pg-sub-p">
            These gates are not all closed. Until they are, patient steps stay synthetic and the release gate refuses
            anything else.
          </p>
          <p>
            <Link className="pg-link" to="/trust">
              Read governance and privacy information <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
        <ul className="pg-gates" aria-label="Gates before real patient data">
          {GATES.map((g) => {
            const done = /\(done\)/.test(g);
            return (
              <li key={g} data-done={done}>
                <span className="hw-state">{done ? "Done" : "Not in place"}</span>
                {g.replace(/\s*\(done\)/, "")}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="pg-block pg-two" aria-labelledby="hw-deeper-h">
        <div>
          <h2 id="hw-deeper-h">Inspect working research surfaces.</h2>
        </div>
        <ul className="pg-gates">
          <li>
            <Link to="/evidence-intelligence">Evidence intelligence</Link>: source, passage, context and missing
            fields before comparison.
          </li>
          <li>
            <Link to="/context-conflict-audit">Context-Conflict Audit</Link>: whether apparently conflicting findings
            share experimental context.
          </li>
          <li>
            <Link to="/research/knowledge-graph">Claim-level knowledge graph</Link>: each relationship with
            publication, passage and gaps.
          </li>
        </ul>
      </section>

      <section className="pg-close" aria-labelledby="hw-close-h">
        <div>
          <h2 id="hw-close-h">Ready to try the workflow?</h2>
          <p>Open the guided walkthrough, or request access for a research pilot conversation.</p>
        </div>
        <div className="pg-cta">
          <Link className="pg-btn pg-btn-light" to="/research/journey">
            Explore Workflow <span aria-hidden="true">→</span>
          </Link>
          <Link className="pg-link pg-link-light" to="/contact">
            Get Access
          </Link>
        </div>
      </section>
    </div>
  );
}
