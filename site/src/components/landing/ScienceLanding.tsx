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

/** Mechanisms section art — teaching sequence arc. */
function MechanismsSectionArt({ active }: { active: number }) {
  const labels = ["Detect", "Recognise", "Signal", "Respond", "Regulate", "Resolve", "Remember"] as const;
  return (
    <div
      className="hsi-science-mech-art"
      role="img"
      aria-label={`Teaching sequence stage ${active + 1} of 7: ${labels[active]}. Overlapping biological processes simplified for learning.`}
    >
      <p className="hsi-science-mech-art-label">Teaching sequence · stages overlap in living systems</p>
      <div className="hsi-science-mech-track" aria-hidden="true">
        {labels.map((label, i) => (
          <span key={label} className={"hsi-science-mech-node" + (i === active ? " is-active" : "")}>
            <b>0{i + 1}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>
      <p className="hsi-science-mech-art-foot">Not a fixed timetable · memory is not inevitable in every response</p>
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
                Follow an immune response ↓
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
                From recognition<br />
                <em>to resolution—and memory.</em>
              </h2>
            </div>
            <p>Follow a simplified immune response. In living systems, these processes overlap and vary with the trigger, tissue and type of response.</p>
          </div>

          <MechanismsSectionArt active={phase} />

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
