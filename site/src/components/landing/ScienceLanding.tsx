import { useState } from "react";
import { Link } from "react-router-dom";

type SystemId = "immune" | "metabolic" | "microbiome";

type SystemNode = {
  name: string;
  description: string;
  relationship: string;
};

type SystemDef = {
  id: SystemId;
  label: string;
  center: string;
  question: string;
  summary: string;
  nodes: SystemNode[];
};

/** Copy + interactions from founder Downloads/HSI_Science_FIXED.html — educational only. */
const SYSTEMS: SystemDef[] = [
  {
    id: "immune",
    label: "Immune system",
    center: "IMMUNE SYSTEM",
    question: "How does immune defence begin?",
    summary:
      "Innate and adaptive mechanisms coordinate detection, response, regulation and memory.",
    nodes: [
      {
        name: "Innate immunity",
        description:
          "Rapid detection and early defence involve barriers, receptors and diverse immune cells.",
        relationship: "Connects sensing to early inflammatory signals.",
      },
      {
        name: "Adaptive immunity",
        description:
          "B and T lymphocytes support antigen-specific responses and immune memory.",
        relationship: "Interacts with innate signals and antigen presentation.",
      },
      {
        name: "Cytokines",
        description:
          "Soluble signals coordinate immune-cell behaviour in context-dependent ways.",
        relationship: "Connects cells, tissues and timing.",
      },
      {
        name: "Resolution",
        description:
          "Active regulatory and repair mechanisms help restore tissue function.",
        relationship: "Links inflammation with repair and homeostasis.",
      },
    ],
  },
  {
    id: "metabolic",
    label: "Metabolism",
    center: "METABOLISM",
    question: "How is energy balance regulated?",
    summary:
      "Hormonal signals, organs and cellular pathways jointly regulate energy use and storage.",
    nodes: [
      {
        name: "Glucose handling",
        description:
          "Cells and organs coordinate glucose uptake, release and utilisation.",
        relationship: "Interacts with insulin and glucagon signalling.",
      },
      {
        name: "Insulin signalling",
        description:
          "Insulin affects nutrient uptake and metabolic processes in multiple tissues.",
        relationship: "Links endocrine signalling with cellular metabolism.",
      },
      {
        name: "Liver function",
        description:
          "The liver helps regulate nutrient processing and circulating glucose.",
        relationship: "Connects storage, production and systemic energy balance.",
      },
      {
        name: "Adipose tissue",
        description:
          "Adipose tissue stores energy and participates in endocrine and immune signalling.",
        relationship: "Connects metabolic and inflammatory biology.",
      },
    ],
  },
  {
    id: "microbiome",
    label: "Microbiome",
    center: "MICROBIOME",
    question: "How do microbes interact with the host?",
    summary:
      "Microbial communities, metabolites, barrier function and host responses form a dynamic ecosystem.",
    nodes: [
      {
        name: "Microbial ecology",
        description:
          "Microbial communities vary with diet, environment, medication and host factors.",
        relationship: "Community composition is not equivalent to function.",
      },
      {
        name: "Metabolites",
        description: "Microbial metabolic products may interact with host physiology.",
        relationship: "Effects depend on production, exposure and host context.",
      },
      {
        name: "Gut barrier",
        description:
          "The intestinal barrier mediates interactions between luminal contents and host tissues.",
        relationship: "Connects epithelial biology and immune surveillance.",
      },
      {
        name: "Host immunity",
        description:
          "Host immune mechanisms influence and respond to microbial communities.",
        relationship: "Associations alone do not establish causality.",
      },
    ],
  },
];

const NODE_POSITIONS: [number, number][] = [
  [20, 22],
  [80, 22],
  [18, 79],
  [82, 79],
];

const PHASES = [
  {
    title: "Detect",
    detail:
      "Pattern-recognition mechanisms and barriers help identify potential threats or disturbances.",
  },
  {
    title: "Recognise",
    detail:
      "Receptors and antigen-presentation processes provide information about what is being encountered.",
  },
  {
    title: "Signal",
    detail: "Immune mediators communicate local and systemic context to relevant cells.",
  },
  {
    title: "Respond",
    detail: "Effector cells and molecules act to contain or address a challenge.",
  },
  {
    title: "Regulate",
    detail:
      "Feedback and regulatory mechanisms shape response intensity and duration.",
  },
  {
    title: "Resolve",
    detail:
      "Clearance, repair and active resolution pathways help restore tissue function.",
  },
  {
    title: "Remember",
    detail:
      "Some responses establish immunological memory that influences future encounters.",
  },
] as const;

const PILLARS = [
  {
    n: "01 / Multiscale biology",
    title: "Molecules to organisms",
    body: "Understand how molecular interactions shape cellular behaviour, tissue function and whole-body physiology.",
  },
  {
    n: "02 / Dynamic systems",
    title: "Change over time",
    body: "Learn how feedback, adaptation, regulation and environmental signals influence biological states.",
  },
  {
    n: "03 / Mechanism & context",
    title: "Why context matters",
    body: "Explore why the same signal may have different consequences depending on cell type, tissue, timing and physiological state.",
  },
] as const;

/**
 * Founder Downloads/HSI_Science_FIXED.html — HSI Science educational landing.
 * Cobalt/navy/cream tokens; Shell/nav remain product chrome.
 * Illustrative mechanism explorer only — not a live research graph or CDS.
 */
export function ScienceLanding() {
  const [systemId, setSystemId] = useState<SystemId>("immune");
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);

  const system = SYSTEMS.find((s) => s.id === systemId) ?? SYSTEMS[0];
  const node = system.nodes[active] ?? system.nodes[0];

  function selectSystem(id: SystemId) {
    setSystemId(id);
    setActive(0);
  }

  function prevNode() {
    setActive((i) => (i + system.nodes.length - 1) % system.nodes.length);
  }

  function nextNode() {
    setActive((i) => (i + 1) % system.nodes.length);
  }

  return (
    <>
      <section className="land-sci section section-bone" id="top" aria-labelledby="sci-title">
        <div className="container">
          <span className="section-num">HSI Science / the biology behind health</span>
          <div className="land-sci-hero">
            <h1 className="display display-xl" id="sci-title">
              Life is connected.
              <br />
              <em className="land-em">Understand how.</em>
            </h1>
            <p className="lede">
              Explore the biological systems that shape health and disease—from molecular
              signalling and immune responses to metabolism and the microbiome. Understand
              mechanisms before exploring what research is still discovering.
            </p>
          </div>

          <div className="land-sci-hero-actions">
            <a href="#atlas" className="btn btn-ink">
              Explore science atlas <span className="arrow">↗</span>
            </a>
            <Link to="/explore" className="btn btn-ghost land-btn-on-light">
              Explore evidence
            </Link>
          </div>
        </div>
      </section>

      <section
        className="land-sci section section-bone land-sci-atlas-wrap"
        id="atlas"
        aria-label="Interactive science atlas"
      >
        <div className="container">
          <div className="land-sci-atlas">
            <div className="land-sci-topbar">
              <strong>HSI / Interactive science atlas</strong>
              <span>Educational mechanism explorer · illustrative</span>
            </div>

            <div className="land-sci-atlas-intro">
              <div>
                <h2>One body. Interacting systems.</h2>
                <p>Select a biological system, then explore the components that make it work.</p>
              </div>
              <div className="land-sci-tabs" role="group" aria-label="Choose biological system">
                {SYSTEMS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === systemId}
                    onClick={() => selectSystem(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="land-sci-atlas-grid">
              <div className="land-sci-visual">
                <svg
                  className="land-sci-rings"
                  viewBox="0 0 700 490"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <circle cx="350" cy="245" r="110" />
                  <circle cx="350" cy="245" r="205" />
                  <path d="M350 245 L125 105 M350 245 L575 105 M350 245 L105 385 M350 245 L590 385" />
                </svg>
                <div className="land-sci-orbit" aria-hidden>
                  {system.center.split(" ").map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </div>
                {system.nodes.map((n, i) => {
                  const [left, top] = NODE_POSITIONS[i] ?? [50, 50];
                  return (
                    <button
                      key={n.name}
                      type="button"
                      className="land-sci-node"
                      style={{ left: `${left}%`, top: `${top}%` }}
                      aria-pressed={active === i}
                      onClick={() => setActive(i)}
                    >
                      {n.name}
                      <small>Explore component</small>
                    </button>
                  );
                })}
              </div>

              <div className="land-sci-side">
                <div className="land-sci-pane" aria-live="polite">
                  <span className="land-micro">Selected biological component</span>
                  <h3>{node.name}</h3>
                  <p>{node.description}</p>
                  <div className="land-sci-micro">{node.relationship}</div>
                </div>
                <div className="land-sci-pane">
                  <span className="land-micro">Understand the system</span>
                  <h3 className="land-sci-question">{system.question}</h3>
                  <p>{system.summary}</p>
                  <div className="land-sci-controls">
                    <button type="button" onClick={prevNode}>
                      ← Previous
                    </button>
                    <button type="button" className="primary" onClick={nextNode}>
                      Next component →
                    </button>
                  </div>
                  <p className="land-sci-note">
                    Conceptual education only. Not clinical advice or a live research graph.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="land-sci section section-bone"
        id="mechanisms"
        aria-labelledby="sci-mechanisms"
      >
        <div className="container">
          <div className="land-sci-section-head">
            <div>
              <span className="section-num">Science / 02 — mechanisms in motion</span>
              <h2 className="display display-xl" id="sci-mechanisms">
                Watch biology
                <br />
                <em className="land-em">unfold.</em>
              </h2>
            </div>
            <p className="lede">
              Biology is dynamic. Follow a simplified immune response step by step to understand
              the sequence of detection, communication, response and recovery.
            </p>
          </div>

          <div className="land-sci-mechanism">
            <aside>
              <span className="section-num">Mechanism explainer</span>
              <h3>From recognition to resolution</h3>
              <p>
                Select each stage to understand its role in a coordinated immune response. Actual
                immune responses are overlapping, context-dependent and more complex than this
                simplified sequence.
              </p>
              <div className="land-sci-explain" aria-live="polite">
                {PHASES[phase]?.detail}
              </div>
            </aside>
            <div className="land-sci-sequence" role="list">
              {PHASES.map((p, i) => (
                <button
                  key={p.title}
                  type="button"
                  className={`land-sci-phase${i === phase ? " active" : ""}`}
                  aria-pressed={i === phase}
                  onClick={() => setPhase(i)}
                >
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <span>{p.title}</span>
                  <span className="land-sci-phase-mark" aria-hidden>
                    {i === phase ? "●" : "↗"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="land-sci section section-grid-light"
        id="principles"
        aria-labelledby="sci-principles"
      >
        <div className="container">
          <div className="land-sci-section-head">
            <div>
              <span className="section-num">Science / 03 — foundations</span>
              <h2 className="display display-xl" id="sci-principles">
                Understand the
                <br />
                <em className="land-em">whole system.</em>
              </h2>
            </div>
            <p className="lede">
              Scientific understanding needs multiple scales and perspectives. These foundations
              connect the biology taught in HSI Science to the deeper investigations supported by
              HSI Research.
            </p>
          </div>
          <div className="land-sci-pillars">
            {PILLARS.map((p) => (
              <article key={p.n} className="land-sci-pillar">
                <span className="land-sci-pillar-n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="land-sci section section-bone land-sci-last" id="next">
        <div className="container land-sci-last-inner">
          <span className="section-num">From scientific understanding to discovery</span>
          <h2 className="display display-xl">
            Learn the biology. Then investigate the unknown.
          </h2>
          <p className="lede">
            HSI Science explains how living systems work. HSI Research takes the next step:
            evaluating evidence, investigating disagreements and developing testable questions.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <a href="#atlas" className="btn btn-ink">
              Explore the science atlas <span className="arrow">↗</span>
            </a>
            <Link to="/explore" className="btn btn-ghost land-btn-on-light">
              Explore evidence
            </Link>
            <Link to="/discovery" className="btn btn-ghost land-btn-on-light">
              Discovery Centre
            </Link>
          </div>
          <small className="land-sci-foot-note">
            Educational illustration only · not clinical advice · not a live knowledge graph · no
            Gate C auto-approve · no invented MoU
          </small>
        </div>
      </section>
    </>
  );
}
