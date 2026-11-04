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

type MechanismStep = {
  title: string;
  detail: string;
};

type MechanismDepth = "deep" | "overview";

type MechanismPath = {
  id: SystemId;
  label: string;
  depth: MechanismDepth;
  depthLabel: string;
  headingLead: string;
  headingEm: string;
  intro: string;
  artLabel: string;
  artFoot: string;
  note: string;
  steps: readonly MechanismStep[];
};

/** Immune is the deep teaching sequence; metabolism and microbiome stay overview-depth. */
const MECHANISM_PATHS: readonly MechanismPath[] = [
  {
    id: "immune",
    label: "Immune response",
    depth: "deep",
    depthLabel: "Deep teaching sequence · 7 stages",
    headingLead: "From recognition",
    headingEm: "to resolution—and memory.",
    intro:
      "Follow a simplified immune response—the deep teaching sequence on this page. In living systems, these processes overlap and vary with the trigger, tissue and type of response.",
    artLabel: "Deep teaching sequence · stages overlap in living systems",
    artFoot: "Not a fixed timetable · memory is not inevitable in every response",
    note: "A teaching sequence, not a fixed biological timetable. Memory is a feature of some responses, rather than the inevitable final step of every immune event.",
    steps: [
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
    ],
  },
  {
    id: "metabolic",
    label: "Metabolism",
    depth: "overview",
    depthLabel: "Overview depth · 4 steps",
    headingLead: "From fuel availability",
    headingEm: "to energy balance.",
    intro:
      "A short overview path—not a seven-stage clone of the immune sequence. These steps sketch how tissues coordinate energy use and storage in educational terms only.",
    artLabel: "Overview path · illustrative energy coordination",
    artFoot: "Simplified teaching view · not a clinical metabolic assessment",
    note: "Overview depth only. This sketch does not diagnose metabolic disease, interpret labs or recommend diet or treatment.",
    steps: [
      {
        title: "Sense",
        detail: "Tissues register circulating nutrients and energy stores, shaping what the body can use next.",
      },
      {
        title: "Signal",
        detail: "Hormones and related messengers communicate fuel availability across organs—without implying a single master switch.",
      },
      {
        title: "Allocate",
        detail: "Organs and cells partition energy toward use, storage or production depending on context and demand.",
      },
      {
        title: "Adapt",
        detail: "Feedback over time adjusts supply and demand; the same signal can mean different things in different states.",
      },
    ],
  },
  {
    id: "microbiome",
    label: "Microbiome",
    depth: "overview",
    depthLabel: "Overview depth · 4 steps",
    headingLead: "From community",
    headingEm: "to host interaction.",
    intro:
      "A short overview path—not a deep immune-style sequence. These steps introduce host–microbe interaction as a dynamic ecosystem, not a fixed pipeline or clinical protocol.",
    artLabel: "Overview path · illustrative host–microbe ecology",
    artFoot: "Associations are not causation · composition is not the same as function",
    note: "Overview depth only. Community patterns alone do not prove causality, diagnose disease or justify clinical decisions.",
    steps: [
      {
        title: "Colonise",
        detail: "Microbial communities occupy niches shaped by diet, environment, medication and host factors.",
      },
      {
        title: "Metabolise",
        detail: "Microbes transform dietary and host substrates into metabolites that may reach host tissues.",
      },
      {
        title: "Interface",
        detail: "Barrier surfaces and local immune surveillance mediate contact between luminal contents and the host.",
      },
      {
        title: "Coexist",
        detail: "Host and microbes continually influence each other; coexistence is dynamic, not a single steady state.",
      },
    ],
  },
];

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

const SCALE_STRIP = [
  { label: "Molecules", note: "Signals & receptors" },
  { label: "Cells", note: "Behaviour in context" },
  { label: "Tissues", note: "Local coordination" },
  { label: "Systems", note: "Whole-body links" },
] as const;

const READING: Record<SystemId, { label: string; href: string }> = {
  immune: { label: "Immunobiology · NCBI Bookshelf", href: "https://www.ncbi.nlm.nih.gov/books/NBK10757/" },
  metabolic: { label: "Insulin resistance & prediabetes · NIDDK", href: "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance" },
  microbiome: { label: "Microbiome · National Human Genome Research Institute", href: "https://www.genome.gov/genetics-glossary/Microbiome" },
};

/** Platform/Products-weight hero panel — educational scales, not a live workspace. */
function ScienceHeroArt() {
  return (
    <aside
      className="hsi-science-hero-art"
      role="img"
      aria-label="Educational biology across scales: molecules, cells, tissues and systems. Illustrative teaching view only — not clinical decision support, not a research workspace, and not a live knowledge graph."
    >
      <p className="hsi-science-hero-art-label">Biology across scales · teaching view</p>
      <div className="hsi-science-hero-art-core">
        <span className="hsi-science-hero-symbol" aria-hidden="true">
          {PRODUCT_SHORT[0]}
        </span>
        <div>
          <strong>{PRODUCT_SHORT} Science</strong>
          <span>Educational mechanisms · not a live knowledge graph</span>
        </div>
      </div>
      <ul className="hsi-science-hero-strip">
        {SCALE_STRIP.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <small>{item.note}</small>
          </li>
        ))}
      </ul>
      <p className="hsi-science-hero-art-foot">
        Learning surface · not CDS · not research workspace access
      </p>
    </aside>
  );
}

/** Biology explorer section art — schematic cell / signal composition (conceptual map, not a live KG). */
function ExplorerSectionArt() {
  return (
    <svg className="hsi-science-explorer-art" viewBox="0 0 520 280" role="img" aria-labelledby="explorer-art-title explorer-art-desc">
      <title id="explorer-art-title">Connected systems schematic</title>
      <desc id="explorer-art-desc">Illustrative molecules, a cell and neighbouring cells — conceptual map only; not to scale and not a live knowledge graph.</desc>
      <defs>
        <radialGradient id="sci-explorer-fill">
          <stop stopColor="#f3eee8" stopOpacity=".85" />
          <stop offset="1" stopColor="#91bfae" stopOpacity=".12" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="140" r="118" fill="none" stroke="#17645f" strokeOpacity=".12" />
      <circle cx="250" cy="140" r="86" fill="none" stroke="#17645f" strokeOpacity=".18" strokeDasharray="2 7" />
      <g stroke="#17645f" strokeOpacity=".4">
        <path d="m72 96 150 44 128-58m-128 58 42 92" fill="none" />
        {[[72, 96], [110, 72], [88, 48], [48, 78], [118, 128]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5.5" fill={i === 1 ? "#ff6845" : "#17645f"} fillOpacity={i === 1 ? 1 : 0.55} stroke="none" />
        ))}
      </g>
      <circle cx="250" cy="140" r="54" fill="url(#sci-explorer-fill)" stroke="#17645f" strokeOpacity=".55" />
      <circle cx="250" cy="140" r="34" fill="none" stroke="#17645f" strokeOpacity=".28" />
      <circle cx="242" cy="146" r="16" fill="#ff6845" />
      <g stroke="#17645f" strokeOpacity=".45" fill="url(#sci-explorer-fill)">
        {[[390, 72], [428, 98], [396, 122], [358, 100]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="18" />
            <circle cx={x} cy={y} r="6" fill="#17645f" stroke="none" />
          </g>
        ))}
      </g>
      <g fill="#466d67" fontSize="9" fontFamily="var(--font-mono, monospace)" letterSpacing="1.4">
        <text x="36" y="168">MOLECULE</text>
        <text x="228" y="214">CELL</text>
        <text x="368" y="156">TISSUE</text>
        <text x="28" y="268">CONCEPTUAL MAP · NOT TO SCALE · NOT A LIVE KG</text>
      </g>
    </svg>
  );
}

/** Mechanisms section art — deep or overview teaching arc. */
function MechanismsSectionArt({ path, active }: { path: MechanismPath; active: number }) {
  const step = path.steps[active];
  const total = path.steps.length;
  const depthWord = path.depth === "deep" ? "Deep teaching" : "Overview";
  return (
    <div
      className={"hsi-science-mech-art" + (path.depth === "overview" ? " is-overview" : "")}
      role="img"
      aria-label={`${depthWord} sequence step ${active + 1} of ${total}: ${step.title}. Educational simplification only.`}
    >
      <p className="hsi-science-mech-art-label">{path.artLabel}</p>
      <div
        className="hsi-science-mech-track"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {path.steps.map((s, i) => (
          <span key={s.title} className={"hsi-science-mech-node" + (i === active ? " is-active" : "")}>
            <b>0{i + 1}</b>
            <small>{s.title}</small>
          </span>
        ))}
      </div>
      <p className="hsi-science-mech-art-foot">{path.artFoot}</p>
    </div>
  );
}

/** Wider-lens section art — scales reminder. */
function WiderLensArt() {
  return (
    <div
      className="hsi-science-lens-art"
      role="img"
      aria-label="A wider lens: connect scales, follow change over time, and keep context visible when interpreting signals."
    >
      <div className="hsi-science-lens-art-core">
        <span aria-hidden="true">◎</span>
        <div>
          <strong>Keep asking why</strong>
          <span>Scale · time · context</span>
        </div>
      </div>
      <ul>
        <li>Connect molecular detail to whole-body physiology</li>
        <li>Follow feedback and adaptation across time</li>
        <li>Treat context as part of the explanation</li>
      </ul>
    </div>
  );
}

/** Public educational mechanism explorer; independent of research and patient data. */
export function ScienceLanding() {
  const [systemId, setSystemId] = useState<SystemId>("immune");
  const [active, setActive] = useState(0);
  const [pathId, setPathId] = useState<SystemId>("immune");
  const [phase, setPhase] = useState(0);
  const system = SYSTEMS.find((s) => s.id === systemId) ?? SYSTEMS[0];
  const path = MECHANISM_PATHS.find((p) => p.id === pathId) ?? MECHANISM_PATHS[0];
  const node = system.nodes[active];
  const reading = READING[system.id];
  const step = path.steps[phase] ?? path.steps[0];
  const stepTotal = path.steps.length;
  const stagePad = String(phase + 1).padStart(2, "0");
  const totalPad = String(stepTotal).padStart(2, "0");

  function selectSystem(id: SystemId) {
    setSystemId(id);
    setActive(0);
  }

  function selectPath(id: SystemId) {
    setPathId(id);
    setPhase(0);
  }

  return (
    <div className="hsi-editorial">
      <section className="hsi-science-hero" aria-labelledby="science-title">
        <div className="hsi-editorial-wrap hsi-science-hero-grid">
          <div className="hsi-science-hero-copy">
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
              <a className="hsi-editorial-button" href="#biology-explorer">
                Open the biology explorer <span aria-hidden="true">↗</span>
              </a>
              <a className="hsi-editorial-textlink" href="#science-mechanisms">
                Follow a mechanism path ↓
              </a>
            </div>
            <p className="hsi-science-hero-note">An educational experience for curious minds — not clinical advice.</p>
          </div>
          <ScienceHeroArt />
        </div>
        <div className="hsi-editorial-wrap hsi-science-hero-foot">
          <span>
            MOLECULES <b>→</b> CELLS <b>→</b> TISSUES <b>→</b> SYSTEMS
          </span>
          <span>Illustrative biology · not clinical advice · not a live KG</span>
        </div>
      </section>

      <section className="hsi-rebuild-stack hsi-science-explorer" id="biology-explorer" aria-labelledby="explorer-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-science-explorer-head">
            <div className="hsi-rebuild-heading">
              <div>
                <p className="hsi-editorial-kicker">01 / BIOLOGY EXPLORER · CONCEPTUAL MAP</p>
                <h2 id="explorer-title">
                  ONE BODY.<br />
                  <em>INTERACTING SYSTEMS.</em>
                </h2>
              </div>
              <p>Select a system, then a component. This is a conceptual systems overview—not a live knowledge graph. Explore how the pieces relate without treating a simplified diagram as the whole story.</p>
            </div>
            <figure className="hsi-science-explorer-figure">
              <ExplorerSectionArt />
              <figcaption>Conceptual map · educational only · not a live KG</figcaption>
            </figure>
          </div>

          <p className="hsi-science-depth-note" role="note">
            <strong>Depth by design.</strong> Immune gets the deep teaching sequence below. Metabolism and Microbiome stay overview-depth in this explorer—honest summaries, not parallel seven-stage clones.
          </p>

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

          <p className="hsi-science-explorer-note">
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
                {path.headingLead}
                <br />
                <em>{path.headingEm}</em>
              </h2>
            </div>
            <p>{path.intro}</p>
          </div>

          <div className="hsi-science-path-selector" role="group" aria-label="Choose mechanism path">
            {MECHANISM_PATHS.map((p, i) => (
              <button
                type="button"
                key={p.id}
                className={"hsi-research-step" + (p.id === pathId ? " is-active" : "")}
                aria-pressed={p.id === pathId}
                aria-controls="science-phase-detail"
                onClick={() => selectPath(p.id)}
              >
                <span className="hsi-research-step-index">0{i + 1}</span>
                <span className="hsi-research-step-copy">
                  <strong>{p.label}</strong>
                  <small>{p.depthLabel}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>

          <MechanismsSectionArt path={path} active={phase} />

          <div
            className={"hsi-science-phases" + (path.depth === "overview" ? " is-overview" : "")}
            role="group"
            aria-label={`${path.label} ${path.depth === "deep" ? "stages" : "overview steps"}`}
          >
            {path.steps.map((p, i) => (
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
              <p className="hsi-editorial-kicker">
                {path.depth === "deep" ? "STAGE" : "OVERVIEW STEP"} {stagePad} / {totalPad}
              </p>
              <h3>{step.title}</h3>
            </div>
            <div>
              <p>{step.detail}</p>
              <div className="hsi-science-phase-controls">
                <button type="button" disabled={phase === 0} onClick={() => setPhase((i) => Math.max(0, i - 1))}>
                  ← Previous {path.depth === "deep" ? "stage" : "step"}
                </button>
                <button
                  type="button"
                  disabled={phase === stepTotal - 1}
                  onClick={() => setPhase((i) => Math.min(stepTotal - 1, i + 1))}
                >
                  Next {path.depth === "deep" ? "stage" : "step"} →
                </button>
              </div>
            </div>
          </div>

          <p className="hsi-science-mechanism-note">{path.note}</p>
        </div>
      </section>

      <section className="hsi-editorial-connection hsi-science-wider" aria-labelledby="principles-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-science-wider-head">
            <div>
              <p className="hsi-editorial-kicker">03 / A WIDER LENS</p>
              <h2 id="principles-title">
                Understand the system.<br />
                <em>Keep asking why.</em>
              </h2>
            </div>
            <p>A useful explanation connects scales, follows change and recognises where context alters the meaning of a signal.</p>
          </div>

          <div className="hsi-science-wider-body">
            <div className="hsi-science-pillars">
              {PILLARS.map((p) => (
                <article key={p.n}>
                  <span>{p.n}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </article>
              ))}
            </div>
            <WiderLensArt />
          </div>
        </div>
      </section>

      <section className="hsi-science-bridge" id="science-bridge" aria-labelledby="bridge-title">
        <div className="hsi-editorial-wrap">
          <div className="hsi-science-bridge-head">
            <div>
              <p className="hsi-editorial-kicker">04 / LEARNING VS INVESTIGATION</p>
              <h2 id="bridge-title">
                Learn the mechanism.<br />
                <em>Investigate the evidence.</em>
              </h2>
            </div>
            <p>
              {PRODUCT_SHORT} Science is for learning biology. ISI Research and the {PRODUCT_SHORT} platform are for investigation and technology—separate experiences with different purposes.
            </p>
          </div>

          <div className="hsi-science-bridge-grid">
            <article className="hsi-science-bridge-card is-learning">
              <p className="hsi-editorial-kicker">This page · Learning</p>
              <h3>{PRODUCT_SHORT} Science</h3>
              <p>
                Educational summaries and teaching diagrams that introduce immune, metabolic and microbiome mechanisms without claiming new findings.
              </p>
              <ul>
                <li>Biology across scales</li>
                <li>Simplified mechanism sequences</li>
                <li>Context kept visible</li>
              </ul>
              <a className="hsi-editorial-textlink" href="#biology-explorer">
                Stay with the biology explorer ↓
              </a>
            </article>

            <article className="hsi-science-bridge-card is-investigation">
              <p className="hsi-editorial-kicker">Elsewhere · Investigation &amp; technology</p>
              <h3>ISI Research · Platform</h3>
              <p>
                Specialist research exploration and the shared technology foundation—evidence, knowledge patterns and human review—outside this educational surface.
              </p>
              <ul>
                <li>Research questions and evidence context</li>
                <li>Shared capability patterns</li>
                <li>Product-owned data boundaries</li>
              </ul>
              <div className="hsi-editorial-actions">
                <Link className="hsi-editorial-button" to="/for-isi">
                  Meet ISI Research <span aria-hidden="true">↗</span>
                </Link>
                <Link className="hsi-editorial-textlink" to="/platform">
                  Explore the technology ↗
                </Link>
              </div>
            </article>
          </div>

          <p className="hsi-science-bridge-note">
            Neither an educational diagram nor a research hypothesis is a diagnosis, a treatment decision or confirmed trial eligibility.
          </p>
        </div>
      </section>

      <section className="hsi-editorial-outro">
        <div className="hsi-editorial-wrap">
          <p className="hsi-editorial-kicker">05 / KEEP THE BOUNDARY CLEAR</p>
          <h2>
            Curious minds welcome.<br />
            <em>Clinical claims stay out.</em>
          </h2>
          <p>
            {PRODUCT_SHORT} Science introduces biological concepts. It is not clinical decision support, not a substitute for peer-reviewed findings and not access to a research workspace.
          </p>
          <div className="hsi-editorial-actions">
            <a className="hsi-editorial-button" href="#biology-explorer">
              Return to the biology explorer <span aria-hidden="true">↗</span>
            </a>
            <Link className="hsi-editorial-textlink" to="/for-isi">
              Continue to ISI Research ↗
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
