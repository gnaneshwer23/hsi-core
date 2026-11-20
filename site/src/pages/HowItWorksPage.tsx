import { Link } from "react-router-dom";
import { JourneySteps, KIND } from "../components/home/JourneySteps";
import { PlatformPathFlow } from "../components/landing/PlatformPathFlow";
import "../styles/research-home.css";
import "../styles/premium-public.css";

const RUNS: [string, string][] = [
  ["Evidence services", "Europe PMC, OpenAlex and Open Targets when you ask. Questions are not stored with retrievals."],
  ["Knowledge graph", "Published, digest-verified snapshot. Every relationship is a candidate."],
  ["Your records", "Gaps, hypotheses and many saves stay in this browser until a server store is enabled."],
  ["Clinical plane", "Separate environment. Synthetic patients only; release gate refuses anything else."],
  ["Model checks", "Off unless configured. Surfaces that need them say so."],
  ["Accounts", "Sign-in works. An account does not grant research or reviewer permissions."],
];

const LABELS: [keyof typeof KIND, string][] = [
  ["live", "Queried from a public source when you ask."],
  ["published", "Read from the published graph snapshot."],
  ["synthetic", "Generated patient data. No real person is represented."],
  ["derived", "Computed from the graph or your own records."],
  ["manual", "Written by you."],
  ["local", "Kept in this browser. Server storage is not enabled."],
];

const GATES = [
  "Approval of the two-plane architecture decision (done)",
  "An independent security review of the account-storage design",
  "A named clinical safety officer and a clinical safety case",
  "A data protection impact assessment and a lawful basis",
  "A data-sharing agreement with a data controller",
];

/**
 * Hero: full-bleed process spine (diagram-first).
 * Toggle in DevTools: document.querySelector('.pg-phero').dataset.heroStyle = 'a'|'c'
 */
export function HowItWorksPage() {
  return (
    <div className="pg-page pg-sub">
      <header className="pg-phero pg-phero-spine" data-hero-style="b" aria-labelledby="hw-title">
        <div className="pg-phero-intro">
          <h1 id="hw-title">From research question to evidence-grounded decision.</h1>
          <p className="pg-lead">
            Retrieve evidence, compare context, inspect candidates, surface uncertainty, leave a brief.
          </p>
          <p className="pg-micro" role="note">
            One scientific intelligence product — not a portfolio. Illustrative or unreviewed outputs stay labelled.
          </p>
          <div className="pg-cta">
            <Link className="pg-btn" to="/research/journey">
              Explore Workflow <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="pg-phero-figure">
          <PlatformPathFlow />
          <p className="pg-phero-figure-note">
            One product spine. Audience pages reuse it — not separate engines.
          </p>
        </div>
      </header>

      <section className="pg-block" aria-labelledby="hw-labels-h">
        <h2 id="hw-labels-h">How to read maturity labels.</h2>
        <p className="pg-sub-p">Six labels so live evidence is not confused with a snapshot, synthetic data or notes.</p>
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
          Representative product preview. Simulated or local-only steps stay labelled.
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
            These gates are not all closed. Until they are, patient steps stay synthetic.
          </p>
          <p>
            <Link className="pg-link" to="/trust">
              Read governance and privacy information <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
        <ul className="pg-gates" data-compact aria-label="Gates before real patient data">
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
        <ul className="pg-gates" data-compact>
          <li>
            <Link to="/evidence-intelligence">Evidence intelligence</Link>: source, passage, context and missing
            fields.
          </li>
          <li>
            <Link to="/context-conflict-audit">Context-Conflict Audit</Link>: whether findings share experimental
            context.
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
