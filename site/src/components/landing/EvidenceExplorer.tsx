import { useState } from "react";
import { Link } from "react-router-dom";

type Node = [string, number, number, string, string];

type Case = {
  name: string;
  q: string;
  sources: string[];
  nodes: Node[];
};

const CASES: Case[] = [
  {
    name: "Persistent inflammation",
    q: "Why might inflammation remain elevated over time?",
    sources: ["Immune cells", "Tissue biology", "Scientific literature", "Temporal context"],
    nodes: [
      [
        "Inflammation",
        50,
        49,
        "A coordinated biological response involving immune cells, tissue signals and regulatory processes.",
        "Inflammation varies by tissue, cause and time. No single pathway explains every persistent inflammatory state.",
      ],
      [
        "Innate immunity",
        19,
        23,
        "Innate immune cells recognise perturbations and can initiate inflammatory responses.",
        "The specific cells and activation states require evidence in the relevant tissue.",
      ],
      [
        "Cytokines",
        76,
        22,
        "Cytokines help coordinate communication between immune and non-immune cells.",
        "A cytokine association alone does not establish a causal driver.",
      ],
      [
        "Tissue signals",
        18,
        77,
        "Local tissue context influences immune activation, recruitment and resolution.",
        "Different organs and disease states have different regulatory environments.",
      ],
      [
        "Immune regulation",
        78,
        77,
        "Regulatory mechanisms can limit, redirect or resolve immune activity.",
        "Impaired resolution is a hypothesis to investigate, not an automatic conclusion.",
      ],
      [
        "Metabolism",
        51,
        88,
        "Metabolic state and inflammatory signalling can influence one another.",
        "Bidirectional associations should not be presented as proven causation.",
      ],
    ],
  },
  {
    name: "Metabolic dysfunction",
    q: "How do metabolism and immune signalling interact?",
    sources: ["Metabolic physiology", "Adipose biology", "Immune pathways", "Microbiome research"],
    nodes: [
      [
        "Metabolic state",
        50,
        49,
        "Metabolic regulation involves coordinated signals across tissues and organs.",
        "Clinical relevance depends on the patient or experimental context.",
      ],
      [
        "Adipose tissue",
        19,
        23,
        "Adipose tissue participates in endocrine and immune communication.",
        "Tissue-specific findings may not generalise to other populations.",
      ],
      [
        "Insulin signalling",
        76,
        22,
        "Insulin signalling helps regulate energy utilisation and glucose homeostasis.",
        "Changes in biomarkers alone do not identify a single mechanism.",
      ],
      [
        "Immune cells",
        18,
        77,
        "Immune cell states contribute to tissue homeostasis and inflammatory responses.",
        "Cell identity and activation state require context-specific evidence.",
      ],
      [
        "Gut ecosystem",
        78,
        77,
        "Microbial communities and their metabolites may interact with host physiology.",
        "Associations are common; mechanistic and interventional evidence varies.",
      ],
      [
        "Inflammatory signals",
        51,
        88,
        "Inflammatory mediators can intersect with metabolic signalling networks.",
        "The strength and direction of effects depend on the study model.",
      ],
    ],
  },
  {
    name: "Trial research",
    q: "How might a biological mechanism inform trial research?",
    sources: ["Disease definitions", "Mechanistic studies", "Biomarker evidence", "Trial registries"],
    nodes: [
      [
        "Research hypothesis",
        50,
        49,
        "A biological hypothesis proposes a testable relationship or intervention target.",
        "Mechanistic plausibility is not evidence of clinical efficacy.",
      ],
      [
        "Disease context",
        19,
        23,
        "The population, phenotype and disease stage determine relevance.",
        "Definitions and inclusion criteria must be explicit.",
      ],
      [
        "Biomarker",
        76,
        22,
        "A biomarker may support stratification or measurement of response.",
        "Analytical and clinical validation are distinct requirements.",
      ],
      [
        "Pathway",
        18,
        77,
        "Pathways provide a structured representation of molecular interactions.",
        "Pathway membership does not prove that an intervention will work.",
      ],
      [
        "Intervention",
        78,
        77,
        "An intervention tests a specific therapeutic or diagnostic strategy.",
        "Safety and efficacy require appropriately designed studies.",
      ],
      [
        "Trial criteria",
        51,
        88,
        "Eligibility requirements determine whether a study may be relevant.",
        "Official registry data and investigator review are required.",
      ],
    ],
  },
];

const ICONS = ["◈", "⬡", "◎", "◇"];

type Props = {
  /** Use h1 on dedicated `/explore`; h2 when embedded on Home. */
  headingLevel?: 1 | 2;
};

/** §03 explore-the-evidence workbench (founder HTML). */
export function EvidenceExplorer({ headingLevel = 2 }: Props) {
  const [activeCase, setActiveCase] = useState(0);
  const [activeNode, setActiveNode] = useState(0);
  const s = CASES[activeCase];
  const node = s.nodes[activeNode];
  const positions = s.nodes.map((n) => [n[1] * 6, n[2] * 3.65] as const);
  const TitleTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="land-explore section section-bone" id="explore" aria-labelledby="explore-title">
      <div className="container">
        <div className="land-explore-header">
          <div>
            <span className="section-num">03 / EXPLORE THE EVIDENCE</span>
            <TitleTag className="display display-xl" id="explore-title" style={{ marginTop: "0.75rem" }}>
              Don&apos;t just find an answer.
              <br />
              Follow the science.
            </TitleTag>
          </div>
          <p className="lede">
            Trace a question through biology, context and scientific evidence. Explore
            relationships, inspect what is known, and see where uncertainty remains.
          </p>
        </div>

        <section className="land-lab" aria-label="Interactive scientific investigation demonstration">
          <header className="land-lab-header">
            <div className="land-lab-brand">HSI / SCIENTIFIC INTELLIGENCE WORKBENCH</div>
            <div className="land-lab-live">INTERACTIVE CONCEPT DEMONSTRATION</div>
          </header>

          <nav className="land-scenario-row" aria-label="Choose an investigation">
            {CASES.map((c, i) => (
              <button
                key={c.name}
                type="button"
                className="land-scenario"
                aria-pressed={i === activeCase}
                onClick={() => {
                  setActiveCase(i);
                  setActiveNode(0);
                }}
              >
                {c.name}
              </button>
            ))}
          </nav>

          <div className="land-workspace">
            <aside className="land-module">
              <div className="land-module-head">
                <span className="land-micro">01 / Investigation</span>
                <span className="land-index">QUESTION</span>
              </div>
              <h3 className="land-question">{s.q}</h3>
              <p className="land-source-label land-micro">Connected domains</p>
              {s.sources.map((x, i) => (
                <div key={x} className="land-source">
                  <span aria-hidden>{ICONS[i]}</span>
                  <span>{x}</span>
                  <em>CONTEXT</em>
                </div>
              ))}
            </aside>

            <div className="land-module">
              <div className="land-graph-top">
                <span className="land-micro">02 / Biological relationships</span>
                <span>SELECT A CONCEPT TO EXPLORE</span>
              </div>
              <div className="land-graph-area">
                <svg viewBox="0 0 600 365" preserveAspectRatio="none" aria-hidden>
                  <g stroke="currentColor" strokeWidth="1.3" opacity=".45" fill="none">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <path
                        key={i}
                        d={`M${positions[0][0]} ${positions[0][1]} Q300 ${positions[i][1]} ${positions[i][0]} ${positions[i][1]}`}
                      />
                    ))}
                    <path
                      d={`M${positions[1][0]} ${positions[1][1]} Q300 15 ${positions[2][0]} ${positions[2][1]}`}
                      opacity=".3"
                    />
                  </g>
                </svg>
                {s.nodes.map((n, i) => (
                  <button
                    key={n[0]}
                    type="button"
                    className={`land-node${i === activeNode ? " active" : ""}`}
                    style={{ left: `${n[1]}%`, top: `${n[2]}%` }}
                    aria-pressed={i === activeNode}
                    onClick={() => setActiveNode(i)}
                  >
                    {n[0]}
                  </button>
                ))}
              </div>
              <div className="land-graph-foot">
                <span className="land-small">Illustrative conceptual connections, not validated graph output</span>
                <span className="land-micro">{s.nodes.length} CONCEPTS</span>
              </div>
            </div>

            <aside className="land-module land-detail-module">
              <div className="land-module-head">
                <span className="land-micro">03 / Interpretation</span>
                <span className="land-index">CONTEXT</span>
              </div>
              <div className="land-detail-body">
                <span className="land-micro">SELECTED CONCEPT</span>
                <h3>{node[0]}</h3>
                <p>{node[3]}</p>
                <div className="land-evidence-box">
                  <div className="land-micro">Evidence &amp; uncertainty</div>
                  <p>{node[4]}</p>
                </div>
                <div className="land-divider" />
                <span className="land-tag">Illustrative explanation</span>
                <button
                  type="button"
                  className="land-next"
                  onClick={() => setActiveNode((n) => (n + 1) % s.nodes.length)}
                >
                  Explore next concept <span aria-hidden>↗</span>
                </button>
              </div>
            </aside>
          </div>

          <footer className="land-lab-footer">
            <span>
              <strong>HSI PRINCIPLE</strong> Every finding needs context, provenance and appropriate
              review.
            </span>
            <span>NO LIVE PATIENT DATA · NO GENERATED CITATIONS</span>
          </footer>
        </section>

        <div className="land-explore-bottom">
          <p>
            Designed to demonstrate HSI&apos;s investigation experience. Production retrieval uses
            versioned scientific sources with claim-level citations and human review.
          </p>
          <Link to="/discovery" className="text-link">
            Open live Discovery ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
