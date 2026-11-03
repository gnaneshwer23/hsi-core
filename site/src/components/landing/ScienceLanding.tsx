import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME, PRODUCT_SHORT } from "../../lib/brand";
import "../../styles/hsi-editorial.css";
import "../../styles/science.css";

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
    summary: "Innate and adaptive mechanisms coordinate detection, response, regulation and memory.",
    nodes: [
      {
        name: "Innate immunity",
        description: "Rapid detection and early defence involve barriers, receptors and diverse immune cells.",
        relationship: "Connects sensing to early inflammatory signals.",
      },
      {
        name: "Adaptive immunity",
        description: "B and T lymphocytes support antigen-specific responses and immune memory.",
        relationship: "Interacts with innate signals and antigen presentation.",
      },
      {
        name: "Cytokines",
        description: "Soluble signals coordinate immune-cell behaviour in context-dependent ways.",
        relationship: "Connects cells, tissues and timing.",
      },
      {
        name: "Resolution",
        description: "Active regulatory and repair mechanisms help restore tissue function.",
        relationship: "Links inflammation with repair and homeostasis.",
      },
    ],
  },
  {
    id: "metabolic",
    label: "Metabolism",
    center: "METABOLISM",
    question: "How is energy balance regulated?",
    summary: "Hormonal signals, organs and cellular pathways jointly regulate energy use and storage.",
    nodes: [
      {
        name: "Glucose handling",
        description: "Cells and organs coordinate glucose uptake, release and utilisation.",
        relationship: "Interacts with insulin and glucagon signalling.",
      },
      {
        name: "Insulin signalling",
        description: "Insulin affects nutrient uptake and metabolic processes in multiple tissues.",
        relationship: "Links endocrine signalling with cellular metabolism.",
      },
      {
        name: "Liver function",
        description: "The liver helps regulate nutrient processing and circulating glucose.",
        relationship: "Connects storage, production and systemic energy balance.",
      },
      {
        name: "Adipose tissue",
        description: "Adipose tissue stores energy and participates in endocrine and immune signalling.",
        relationship: "Connects metabolic and inflammatory biology.",
      },
    ],
  },
  {
    id: "microbiome",
    label: "Microbiome",
    center: "MICROBIOME",
    question: "How do microbes interact with the host?",
    summary: "Microbial communities, metabolites, barrier function and host responses form a dynamic ecosystem.",
    nodes: [
      {
        name: "Microbial ecology",
        description: "Microbial communities vary with diet, environment, medication and host factors.",
        relationship: "Community composition is not equivalent to function.",
      },
      {
        name: "Metabolites",
        description: "Microbial metabolic products may interact with host physiology.",
        relationship: "Effects depend on production, exposure and host context.",
      },
      {
        name: "Gut barrier",
        description: "The intestinal barrier mediates interactions between luminal contents and host tissues.",
        relationship: "Connects epithelial biology and immune surveillance.",
      },
      {
        name: "Host immunity",
        description: "Host immune mechanisms influence and respond to microbial communities.",
        relationship: "Associations alone do not establish causality.",
      },
    ],
  },
];

const PHASES = [
  {
    title: "Detect",
    detail: "Pattern-recognition mechanisms and barriers help identify potential threats or disturbances.",
  },
  {
    title: "Recognise",
    detail: "Receptors and antigen-presentation processes provide information about what is being encountered.",
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
    detail: "Feedback and regulatory mechanisms shape response intensity and duration.",
  },
  {
    title: "Resolve",
    detail: "Clearance, repair and active resolution pathways help restore tissue function.",
  },
  {
    title: "Remember",
    detail: "Some responses establish immunological memory that influences future encounters.",
  },
] as const;

const PILLARS = [
  {
    n: "01",
    title: "Molecules to organisms",
    body: "Understand how molecular interactions shape cellular behaviour, tissue function and whole-body physiology.",
  },
  {
    n: "02",
    title: "Change over time",
    body: "Learn how feedback, adaptation, regulation and environmental signals influence biological states.",
  },
  {
    n: "03",
    title: "Why context matters",
    body: "Explore why the same signal may have different consequences depending on cell type, tissue, timing and physiological state.",
  },
] as const;

const READING: Record<SystemId, { label: string; href: string }> = {
  immune: { label: "Immunobiology · NCBI Bookshelf", href: "https://www.ncbi.nlm.nih.gov/books/NBK10757/" },
  metabolic: { label: "Insulin resistance & prediabetes · NIDDK", href: "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance" },
  microbiome: { label: "Microbiome · National Human Genome Research Institute", href: "https://www.genome.gov/genetics-glossary/Microbiome" },
};

function BiologyIllustration() {
  return (
    <svg className="hsi-science-hero-art" viewBox="0 0 520 420" role="img" aria-labelledby="science-art-title science-art-desc">
      <title id="science-art-title">Biology across scales</title>
      <desc id="science-art-desc">An illustrative view of molecular signals, a cell and an interacting group of cells.</desc>
      <defs>
        <radialGradient id="sci-cell-fill">
          <stop stopColor="#f3eee8" stopOpacity=".8" />
          <stop offset="1" stopColor="#91bfae" stopOpacity=".08" />
        </radialGradient>
      </defs>
      <circle cx="260" cy="207" r="160" fill="none" stroke="#f3eee8" strokeOpacity=".12" />
      <circle cx="260" cy="207" r="122" fill="none" stroke="#f3eee8" strokeOpacity=".18" strokeDasharray="2 7" />
      <g stroke="#f3eee8" strokeOpacity=".35">
        <path d="m100 150 160 57 142-77m-142 77 54 129" />
        <path d="M78 178 121 141 92 107 52 136l26 42 44 18" fill="none" />
        {[[78, 178], [121, 141], [92, 107], [52, 136], [122, 196]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" fill={i === 1 ? "#ff6845" : "#f3eee8"} />
        ))}
      </g>
      <circle cx="260" cy="207" r="72" fill="url(#sci-cell-fill)" stroke="#f3eee8" strokeOpacity=".65" />
      <circle cx="260" cy="207" r="48" fill="none" stroke="#f3eee8" strokeOpacity=".3" />
      <circle cx="250" cy="213" r="22" fill="#ff6845" />
      <g stroke="#f3eee8" strokeOpacity=".5" fill="url(#sci-cell-fill)">
        {[[385, 100], [425, 126], [390, 148], [347, 130]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="22" />
            <circle cx={x} cy={y} r="7" fill="#17645f" />
          </g>
        ))}
      </g>
      <g fill="#f3eee8" fontSize="10" fontFamily="monospace" letterSpacing="1.5">
        <text x="40" y="236">MOLECULE</text>
        <text x="241" y="303">CELL</text>
        <text x="363" y="196">TISSUE</text>
      </g>
      <g fill="#f3eee8" fontSize="9" fontFamily="monospace" letterSpacing="1">
        <text x="25" y="32">THE BIOLOGY BEHIND HEALTH</text>
        <text x="25" y="394">SCHEMATIC VIEW / NOT TO SCALE</text>
      </g>
    </svg>
  );
}

/** Public educational mechanism explorer; independent of research and patient data. */
export function ScienceLanding() {
  const [systemId, setSystemId] = useState<SystemId>("immune");
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);
  const system = SYSTEMS.find((s) => s.id === systemId) ?? SYSTEMS[0];
  const node = system.nodes[active];
  const reading = READING[system.id];

  function selectSystem(id: SystemId) {
    setSystemId(id);
    setActive(0);
  }

  return (
    <div className="hsi-editorial">
      <section className="hsi-science-hero" aria-labelledby="science-title">
        <div className="hsi-editorial-wrap hsi-science-hero-grid">
          <div>
            <p className="hsi-editorial-kicker">
              <span className="hsi-coral-dot" /> {PRODUCT_NAME} / SCIENCE
            </p>
            <h1 id="science-title">
              Life is connected.<br />
              <em>Understand how.</em>
            </h1>
            <p className="hsi-editorial-lede">
              Explore the biology behind health—from immune responses and cellular signals to metabolism and the microbiome. Start with the mechanisms. Keep the context.
            </p>
            <div className="hsi-editorial-actions">
              <a className="hsi-editorial-button" href="#science-atlas">
                Explore the science atlas <span aria-hidden="true">↗</span>
              </a>
              <a className="hsi-editorial-textlink" href="#science-mechanisms">
                Follow an immune response ↓
              </a>
            </div>
            <p className="hsi-science-hero-note">An educational experience for curious minds.</p>
          </div>
          <div className="hsi-science-art-frame">
            <BiologyIllustration />
          </div>
        </div>
        <div className="hsi-editorial-wrap hsi-science-hero-foot">
          <span>
            MOLECULES <b>→</b> CELLS <b>→</b> TISSUES <b>→</b> SYSTEMS
          </span>
          <span>Illustrative biology · not clinical advice</span>
        </div>
      </section>

      <section className="hsi-rebuild-stack hsi-science-atlas" id="science-atlas" aria-labelledby="atlas-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-rebuild-heading">
            <div>
              <p className="hsi-editorial-kicker">01 / THE BIOLOGY EXPLORER</p>
              <h2 id="atlas-title">
                ONE BODY.<br />
                <em>INTERACTING SYSTEMS.</em>
              </h2>
            </div>
            <p>Select a system, then a component. Explore how the pieces relate without treating a simplified diagram as the whole story.</p>
          </div>

          <div className="hsi-science-system-selector" role="group" aria-label="Choose biological system">
            {SYSTEMS.map((s, i) => (
              <button
                type="button"
                key={s.id}
                className={"hsi-research-step" + (s.id === systemId ? " is-active" : "")}
                aria-pressed={s.id === systemId}
                aria-controls="science-system"
                onClick={() => selectSystem(s.id)}
              >
                <span className="hsi-research-step-index">0{i + 1}</span>
                <span className="hsi-research-step-copy">
                  <strong>{s.label}</strong>
                  <small>{s.center}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className="hsi-science-system" id="science-system">
            <div className="hsi-science-map">
              <div className="hsi-science-map-heading">
                <span>CONCEPTUAL SYSTEM MAP</span>
                <span>0{active + 1} / 04</span>
              </div>
              <div className="hsi-science-central">
                <span aria-hidden="true">+</span>
                <strong>{system.label}</strong>
                <small>Four connected perspectives</small>
              </div>
              <div className="hsi-science-components" role="group" aria-label={`${system.label} components`}>
                {system.nodes.map((n, i) => (
                  <button
                    type="button"
                    key={n.name}
                    className={"hsi-research-step" + (active === i ? " is-active" : "")}
                    aria-pressed={active === i}
                    aria-controls="science-component"
                    onClick={() => setActive(i)}
                  >
                    <span className="hsi-research-step-index">0{i + 1}</span>
                    <span className="hsi-research-step-copy">
                      <strong>{n.name}</strong>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
              <p className="hsi-science-map-note">Illustrative relationships · not a live knowledge graph</p>
            </div>

            <div className="hsi-science-explanation">
              <div className="hsi-research-insight" id="science-component" aria-live="polite" aria-atomic="true">
                <span className="hsi-editorial-kicker">SELECTED COMPONENT</span>
                <h3>{node.name}</h3>
                <p>{node.description}</p>
                <p className="hsi-science-relationship">{node.relationship}</p>
              </div>
              <div className="hsi-science-overview">
                <h4>{system.question}</h4>
                <p>{system.summary}</p>
                <div className="hsi-science-node-controls">
                  <button type="button" onClick={() => setActive((i) => (i + system.nodes.length - 1) % system.nodes.length)}>
                    ← Previous component
                  </button>
                  <button type="button" onClick={() => setActive((i) => (i + 1) % system.nodes.length)}>
                    Next component →
                  </button>
                </div>
                <a className="hsi-science-reading" href={reading.href} target="_blank" rel="noreferrer">
                  <span>FURTHER READING</span>
                  {reading.label} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>

          <p className="hsi-science-atlas-note">
            Educational summaries simplify complex biology. They do not represent patient analysis, evidence grading or conclusions from a new study.
          </p>
        </div>
      </section>

      <section className="hsi-rebuild-story hsi-science-mechanisms" id="science-mechanisms" aria-labelledby="mechanisms-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-rebuild-heading hsi-science-mechanisms-heading">
            <div>
              <p className="hsi-editorial-kicker">02 / MECHANISMS IN CONTEXT</p>
              <h2 id="mechanisms-title">
                From recognition<br />
                <em>to resolution—and memory.</em>
              </h2>
            </div>
            <p>Follow a simplified immune response. In living systems, these processes overlap and vary with the trigger, tissue and type of response.</p>
          </div>

          <div className="hsi-science-phases" role="group" aria-label="Immune response stages">
            {PHASES.map((p, i) => (
              <button
                type="button"
                key={p.title}
                className={"hsi-research-step" + (phase === i ? " is-active" : "")}
                aria-pressed={phase === i}
                aria-controls="science-phase-detail"
                onClick={() => setPhase(i)}
              >
                <span className="hsi-research-step-index">0{i + 1}</span>
                <span className="hsi-research-step-copy">
                  <strong>{p.title}</strong>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <div className="hsi-science-phase-detail" id="science-phase-detail" aria-live="polite" aria-atomic="true">
            <div>
              <p className="hsi-editorial-kicker">STAGE 0{phase + 1} / 07</p>
              <h3>{PHASES[phase].title}</h3>
            </div>
            <div>
              <p>{PHASES[phase].detail}</p>
              <div className="hsi-science-phase-controls">
                <button type="button" disabled={phase === 0} onClick={() => setPhase((i) => Math.max(0, i - 1))}>
                  ← Previous stage
                </button>
                <button type="button" disabled={phase === PHASES.length - 1} onClick={() => setPhase((i) => Math.min(PHASES.length - 1, i + 1))}>
                  Next stage →
                </button>
              </div>
            </div>
          </div>

          <p className="hsi-science-mechanism-note">
            A teaching sequence, not a fixed biological timetable. Memory is a feature of some responses, rather than the inevitable final step of every immune event.
          </p>
        </div>
      </section>

      <section className="hsi-editorial-connection" aria-labelledby="principles-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-editorial-sectionhead hsi-science-principles-head">
            <div>
              <p className="hsi-editorial-kicker">03 / A WIDER LENS</p>
              <h2 id="principles-title">
                Understand the system.<br />
                <em>Keep asking why.</em>
              </h2>
            </div>
            <p>A useful explanation connects scales, follows change and recognises where context alters the meaning of a signal.</p>
          </div>
          <div className="hsi-science-pillars">
            {PILLARS.map((p) => (
              <article key={p.n}>
                <span>{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hsi-editorial-outro">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">04 / FROM LEARNING TO INVESTIGATION</p>
          <h2>
            Understand a mechanism.<br />
            <em>Then examine the evidence.</em>
          </h2>
          <p>
            {PRODUCT_SHORT} Science introduces biological concepts. ISI Research is the specialist experience for exploring scientific evidence and open research questions.
          </p>
          <p className="hsi-science-outro-note">
            Neither an educational diagram nor a research hypothesis is a diagnosis, a treatment decision or confirmed trial eligibility.
          </p>
          <div className="hsi-editorial-actions">
            <Link className="hsi-editorial-button" to="/for-isi">
              Meet ISI Research <span aria-hidden="true">↗</span>
            </Link>
            <Link className="hsi-editorial-textlink" to="/platform">
              Explore the technology ↗
            </Link>
          </div>
          <small>
            Educational biology only. Not clinical advice, clinical decision support or a substitute for peer-reviewed study findings.
          </small>
        </div>
      </section>
    </div>
  );
}
