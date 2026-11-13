import {InvestigationGraphEntry} from "./InvestigationGraphEntry";
import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  illustrativeAuditOutcome,
  AUDIT_TEACHING_OUTCOMES,
  type AuditTeachingOutcome,
} from "../../lib/publicAuditDemo";
export { AUDIT_TEACHING_OUTCOMES } from "../../lib/publicAuditDemo";
export function PublicAction({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`hsi-action${secondary ? " hsi-action-secondary" : ""}`} to={to}>
      {children}
    </Link>
  );
}
export function PublicSection({
  id,
  title,
  description,
  children,
  dark = false,
}: {
  id?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`hsi-section${dark ? " hsi-dark" : ""}`}>
      <div className="hsi-content">
        <div className="hsi-section-intro">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
export function PublicHero({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="hsi-page-hero hsi-content">
      <p className="hsi-product-name">Human Super Intelligence</p>
      <h1>{title}</h1>
      <p className="hsi-lead">{description}</p>
      {children}
    </header>
  );
}
export function Maturity({
  children,
}: {
  children: "Available" | "Restricted" | "Demonstration" | "Planned";
}) {
  return <span className="hsi-maturity">{children}</span>;
}
export const PUBLIC_WORKFLOW = [
  { title: "Ask", text: "Define the research question and biological scope." },
  {
    title: "Retrieve",
    text: "Identify relevant, permitted scientific evidence and preserve source provenance.",
  },
  { title: "Connect", text: "Map entities, relationships and experimental context." },
  { title: "Investigate", text: "Examine mechanisms, competing explanations and research gaps." },
  { title: "Verify", text: "Check whether proposed claims are supported, limited or unresolved." },
  { title: "Review", text: "Prepare a versioned research brief for independent human assessment." },
];
export function ResearchWorkflow() {
  const [step, setStep] = useState(0);
  return (
    <div className="hsi-workflow">
      <div role="group" aria-label="Investigation steps">
        {PUBLIC_WORKFLOW.map((s, n) => (
          <button key={s.title} aria-pressed={step === n} onClick={() => setStep(n)}>
            <span>{String(n + 1).padStart(2, "0")}</span>
            {s.title}
          </button>
        ))}
      </div>
      <div className="hsi-workflow-detail" aria-live="polite">
        <h3>{PUBLIC_WORKFLOW[step]!.title}</h3>
        <p>{PUBLIC_WORKFLOW[step]!.text}</p>
        <p>
          Illustrative workflow. Hypotheses remain unvalidated; independent review and graph publication are
          separate decisions.
        </p>
      </div>
    </div>
  );
}
const contextOptions = {
  species: ["Human", "Mouse"],
  tissue: ["Skin", "Lung"],
  cellState: ["Activated B cell", "Resting B cell"],
  stage: ["Early disease", "Established disease"],
  assay: ["Flow cytometry", "RNA sequencing"],
  outcome: ["Cell activation", "Gene expression"],
} as const;
type ContextKey = keyof typeof contextOptions;
const contextLabels: Record<ContextKey, string> = {
  species: "Species",
  tissue: "Tissue",
  cellState: "Cell state",
  stage: "Disease stage",
  assay: "Assay",
  outcome: "Outcome",
};
type Study = { context: Record<ContextKey, string>; finding: "Increase" | "Decrease" };
const baseline = (): Study => ({
  context: {
    species: "Human",
    tissue: "Skin",
    cellState: "Activated B cell",
    stage: "Early disease",
    assay: "Flow cytometry",
    outcome: "Cell activation",
  },
  finding: "Increase",
});
export function ContextAuditInstrument({ id = "public-audit" }: { id?: string }) {
  const uid = useId(),
    [a, setA] = useState<Study>(baseline),
    [b, setB] = useState<Study>(() => ({
      ...baseline(),
      context: { ...baseline().context, species: "Mouse" },
      finding: "Decrease",
    })),
    [complete, setComplete] = useState(true),
    [controlled, setControlled] = useState(false),
    [preset, setPreset] = useState<AuditTeachingOutcome | null>("Not directly comparable");
  const result = illustrativeAuditOutcome(a, b, complete, controlled);
  function load(outcome: AuditTeachingOutcome) {
    const left = baseline(),
      right = { ...baseline(), context: { ...baseline().context }, finding: "Decrease" as const };
    if (outcome === "Not directly comparable") right.context.species = "Mouse";
    if (outcome === "Contextual difference") right.context.tissue = "Lung";
    setA(left);
    setB(right);
    setComplete(outcome !== "Insufficient evidence");
    setControlled(outcome === "Genuine contradiction");
    setPreset(outcome);
  }
  const cards = [
    { name: "Study A", value: a, set: setA },
    { name: "Study B", value: b, set: setB },
  ];
  return (
    <div className="hsi-audit-instrument" id={id}>
      <div className="hsi-instrument-caption">
        <Maturity children={"Demonstration"} />
        <p>Synthetic studies. No real study, live audit or scientific approval.</p>
      </div>
      <div className="hsi-audit-studies">
        {cards.map((card, n) => (
          <fieldset key={card.name}>
            <legend>{card.name}</legend>
            <p className="hsi-example-id">Example {n === 0 ? "A" : "B"} · fictional source record</p>
            <div className="hsi-context-fields">
              {(Object.keys(contextOptions) as ContextKey[]).map((k) => (
                <label key={k} htmlFor={`${uid}-${n}-${k}`}>
                  {contextLabels[k]}
                  <select
                    id={`${uid}-${n}-${k}`}
                    aria-label={`${card.name} ${contextLabels[k].toLowerCase()}`}
                    value={card.value.context[k]}
                    onChange={(e) => {
                      card.set({ ...card.value, context: { ...card.value.context, [k]: e.target.value } });
                      setControlled(false);
                      setPreset(null);
                    }}
                  >
                    {contextOptions[k].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="hsi-finding-label">
              Observed direction
              <select
                aria-label={`${card.name} observed direction`}
                value={card.value.finding}
                onChange={(e) => {
                  card.set({ ...card.value, finding: e.target.value as Study["finding"] });
                  setControlled(false);
                  setPreset(null);
                }}
              >
                <option>Increase</option>
                <option>Decrease</option>
              </select>
            </label>
          </fieldset>
        ))}
      </div>
      <label className="hsi-completeness">
        <input
          type="checkbox"
          checked={complete}
          onChange={(e) => {
            setComplete(e.target.checked);
            setControlled(false);
            setPreset(null);
          }}
        />{" "}
        Required context supplied in this example
      </label>
      <div className="hsi-audit-result" aria-live="polite">
        <span>Illustrative evidence relationship</span>
        <h3>{result.outcome ?? "No opposing findings in this example"}</h3>
        <p>{result.reason}</p>
        <p>
          <strong>Next decision:</strong> inspect source versions, sample size, dose, timing, controls and
          uncertainty before making a research claim.
        </p>
      </div>
      <div className="hsi-preset-list" role="group" aria-label="Explore the five teaching outcomes">
        {AUDIT_TEACHING_OUTCOMES.map((o) => (
          <button
            key={o}
            aria-label={`Load ${o} example`}
            aria-pressed={preset === o}
            onClick={() => load(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <details>
        <summary>How to read this demonstration</summary>
        <p>
          The labels teach possible evidence relationships. Backend research reporting separately retains
          consistent, potential conflict, context-dependent, methodological difference and
          insufficient-evidence states. A potential conflict is never automatically a genuine contradiction.
          Equal directions do not establish consensus. No real sources, source permissions or reviewers are
          simulated.
        </p>
        <p>
          Only six context dimensions are selectable here. Research records use a richer passage-linked
          contract, with explicit missingness and independent review.
        </p>
      </details>
    </div>
  );
}
export function CandidateMechanism() {
  return (
    <figure className="hsi-mechanism">
      <svg
        role="img"
        aria-label="Illustrative candidate chain: T follicular helper cell, IL-21 signalling and B-cell response; arrows are unvalidated candidate relationships"
        viewBox="0 0 880 260"
      >
        <defs>
          <marker
            id="candidate-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10" fill="#297e80" />
          </marker>
        </defs>
        <path
          d="M180 120h180M500 120h180"
          fill="none"
          stroke="#297e80"
          strokeWidth="2"
          strokeDasharray="5 6"
          markerEnd="url(#candidate-arrow)"
        />
        <circle cx="110" cy="120" r="64" fill="#d9e7df" stroke="#297e80" />
        <circle cx="95" cy="112" r="29" fill="#93b8b3" />
        <g fill="#297e80">
          {[0, 1, 2, 3, 4].map((n) => (
            <circle key={n} cx={400 + (n % 2) * 20} cy={95 + n * 12} r="7" />
          ))}
        </g>
        <circle cx="755" cy="120" r="64" fill="#e7ede5" stroke="#297e80" />
        <path d="M735 100q45-20 40 30t-42 3z" fill="#9ebeb6" />
        <g fill="#182d38" fontSize="19" textAnchor="middle" fontFamily="sans-serif">
          <text x="110" y="224">
            Tfh cell state
          </text>
          <text x="440" y="224">
            IL-21 signalling
          </text>
          <text x="755" y="224">
            B-cell response
          </text>
        </g>
      </svg>
      <figcaption>
        Illustrative candidate relationships—not established SSc mechanisms. Inspect tissue, receptor context,
        intervention, timing and source evidence for each link.
      </figcaption>
    </figure>
  );
}
export const BRIEF_SECTIONS = [
  {
    title: "Research question and scope",
    text: "What evidence connects T follicular helper cells, IL-21 signalling and B-cell responses in systemic sclerosis? This is an illustrative research question, not a clinical recommendation.",
  },
  {
    title: "Evidence inventory and provenance",
    text: "No source-cleared study packet is attached to this public example. A real brief must retain source identifiers, versions, passage locations and permitted use. No citations are invented.",
  },
  {
    title: "Mechanism and context map",
    text: "Tfh state → IL-21 signalling → B-cell response is a candidate chain. Each arrow needs its own supporting evidence and experimental context.",
  },
  {
    title: "Contradictions and comparability",
    text: "Species, tissue, cell state, dose, timing, assay and outcome must be aligned before interpreting opposing results. Unmatched studies remain non-comparable.",
  },
  {
    title: "Uncertainty and research gaps",
    text: "Causal direction, disease-stage effects and transportability between tissue and blood remain unassessed in this source-free example.",
  },
  {
    title: "Candidate experiments and next decision",
    text: "Proposed, unvalidated: compare matched cell systems and readouts, specify controls and uncertainty, and test competing explanations before advancing a mechanistic claim.",
  },
  {
    title: "Independent review status",
    text: "Not reviewed. No independent scientific assessment, source clearance or graph publication is implied. An evidence-brief decision does not approve later changed content.",
  },
];
export function ResearchBriefPreview({ expanded = false }: { expanded?: boolean }) {
  return (
    <article className="hsi-brief-preview">
      <header>
        <div>
          <p>Scientific Investigation Brief</p>
          <h3>Tfh, IL-21 and B-cell responses</h3>
        </div>
        <Maturity children={"Demonstration"} />
      </header>
      <p className="hsi-brief-meta">Illustrative · Version 1 · Independent review: not reviewed</p>
      {BRIEF_SECTIONS.map((s, n) => (
        <details key={s.title} open={expanded || n === 0}>
          <summary>
            <span>{String(n + 1).padStart(2, "0")}</span>
            {s.title}
          </summary>
          <p>{s.text}</p>
        </details>
      ))}
      <footer>
        Working hypothesis remains unvalidated. Research use only. Publication approval is separate.
      </footer>
    </article>
  );
}
const architecture = [
  {
    title: "Research experience",
    items: "Investigation · Evidence · Mechanisms · Briefs",
    detail:
      "A question, comparable observations, uncertainty and a versioned outcome for a researcher to examine.",
  },
  {
    title: "Scientific intelligence foundation",
    items: "Knowledge graph · Context · Reasoning · Verification",
    detail:
      "Three core logical roles coordinate an investigation: orchestrator, evidence/context investigator and scientific verifier. The graph retains provenance and review state.",
  },
  {
    title: "Governed biomedical sources",
    items: "Publications · Datasets · Ontologies · Research metadata",
    detail:
      "Source identity, current permissions, passage versions and correction/retraction checks must be verified before use.",
  },
];
export function PlatformLayers() {
  const [active, setActive] = useState(0);
  return (
    <div className="hsi-platform-layers">
      <div role="group" aria-label="Platform architecture layers">
        {architecture.map((l, n) => (
          <button key={l.title} aria-pressed={active === n} onClick={() => setActive(n)}>
            <span>{l.title}</span>
            <small>{l.items}</small>
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <h3>{architecture[active]!.title}</h3>
        <p>{architecture[active]!.detail}</p>
        <p>
          Architecture describes the foundation; independent service and scientific acceptance remain
          required.
        </p>
      </div>
    </div>
  );
}
export const BIOLOGY_DOMAINS = [
  {
    name: "Immunology & inflammation",
    detail: "Immune cells, cytokines, tolerance and disease mechanisms.",
    status: "Demonstration",
  },
  {
    name: "Microbiome & metabolism",
    detail: "Microbial metabolites and host–immune interactions.",
    status: "Planned",
  },
  {
    name: "Neuroscience & neuroimmune biology",
    detail: "Neural compartments and immune signalling.",
    status: "Planned",
  },
  {
    name: "Genomics & molecular pathways",
    detail: "Genes, proteins and contextual molecular relationships.",
    status: "Demonstration",
  },
  {
    name: "Organ & tissue biology",
    detail: "Place immune observations in tissue and organ context.",
    status: "Demonstration",
  },
  {
    name: "Disease & translational research",
    detail: "Study mechanisms and research implications without clinical advice.",
    status: "Restricted",
  },
] as const;
export function BiologyDomains() {
  const [selected, setSelected] = useState(0);
  return (
    <>
    <div className="hsi-domain-map">
      <div role="group" aria-label="Biological research domains">
        {BIOLOGY_DOMAINS.map((d, n) => (
          <button key={d.name} aria-pressed={selected === n} onClick={() => setSelected(n)}>
            <span>{d.name}</span>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div className="hsi-domain-detail" aria-live="polite">
        <Maturity>{BIOLOGY_DOMAINS[selected]!.status}</Maturity>

        <h3>{BIOLOGY_DOMAINS[selected]!.name}</h3>
        <p>{BIOLOGY_DOMAINS[selected]!.detail}</p>
        <p>
          Educational connections and planned coverage do not establish independently validated scientific
          capability.
        </p>
        <Link className="hsi-text-link" to="/science/graph">
          Inspect biological connections
        </Link>
      </div>
    </div>
    <InvestigationGraphEntry/>
    </>
  );
}
export function GovernanceChain() {
  return (
    <ol className="hsi-governance-chain">
      {[
        {
          title: "Study observation",
          detail: "What a source reports, with its version, passage and conditions.",
        },
        {
          title: "Computational interpretation",
          detail: "An inference to examine; uncertainty stays attached.",
        },
        {
          title: "Independent verification",
          detail: "Check support, context, source rights and missing evidence.",
        },
        {
          title: "Human scientific review",
          detail: "A scoped independent decision on an immutable version.",
        },
        {
          title: "Separate publication decision",
          detail: "No automatic promotion into reviewed graph knowledge.",
        },
      ].map((s) => (
        <li key={s.title}>
          <h3>{s.title}</h3>
          <p>{s.detail}</p>
        </li>
      ))}
    </ol>
  );
}
