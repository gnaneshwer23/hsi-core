import { useState } from "react";
import { Link } from "react-router-dom";

const pillars = [
  { to: "/systems", label: "Human Systems Intelligence" },
  { to: "/evidence", label: "Evidence grades & Gate C" },
  { to: "/for-isi", label: "ISI discovery surface" },
  { to: "/for-aksh", label: "Aksh clinician-safe HITL" },
];

const altitudes = [
  {
    id: "p0",
    label: "01 · P0",
    title: "Schema foundation",
    body: "Evidence grades, edge/claim schema, T2D immuno-metabolic seeds, validation CLI, and first ISI/Aksh exports. Done.",
    build: ["Grades + axes that do not collapse", "Seed edges with honest uncertainty", "validate / export / gap-report"],
  },
  {
    id: "p1",
    label: "02 · P1",
    title: "Durable maps · active",
    body: "Durable aksh: clinic ids, HITL read-only stubs, Gate C checklists, and the immuno-metabolic bridge shortlist.",
    build: ["aksh: node map without opening CDS", "ISI REL suggestions — never auto-approve", "Curator markdown stays in hsi-core"],
  },
  {
    id: "p2",
    label: "03 · P2",
    title: "Richer exports",
    body: "Curator UX and richer published artifacts inside this repo. Product apps bind what we ship — they do not become edit targets.",
    build: ["Export depth", "Curator ergonomics", "Consumers pull, never invent grades"],
  },
  {
    id: "p3",
    label: "04 · P3",
    title: "Optional bio plugins",
    body: "Structure, docking, and generative chem stay deferred behind licenses. They never flip Gate C or clinical grades.",
    build: ["Plugin RFCs first", "License sign-off", "Discovery-only adapters"],
  },
];

export function Home() {
  const [active, setActive] = useState(altitudes[1].id);
  const panel = altitudes.find((a) => a.id === active) ?? altitudes[0];

  return (
    <>
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="hero-content container">
          <span className="eyebrow">Shared substrate · Aksh + ISI</span>
          <div className="hero-brand" aria-hidden>
            HSI
          </div>
          <h1 className="display display-xl">
            Human Systems
            <br />
            <span className="line-soft">Intelligence.</span>
          </h1>
          <p className="lede" style={{ textAlign: "center" }}>
            Evidence-graded edges for clinic-safe HITL and honest discovery.
            Graph before agents. No PHI. No invented PMIDs.
          </p>
          <div className="hero-pills">
            {pillars.map((p) => (
              <Link key={p.to} to={p.to} className="hero-pill">
                {p.label}
              </Link>
            ))}
          </div>
          <div className="hero-actions">
            <Link to="/docs" className="btn btn-primary">
              Use hsi-core <span className="arrow">↗</span>
            </Link>
            <Link to="/alignment" className="btn btn-ghost">
              Repo alignment
            </Link>
          </div>
        </div>
        <div className="hero-corners">
          <span>Evidence · Gate C · Exports</span>
          <span>P1 active</span>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="split-headline">
            <h2 className="display display-lg">
              Grades without
              <br />
              collapsing axes.
            </h2>
            <p className="lede">
              HSI keeps curation lifecycle, evidence grade, and teaching status
              as separate axes. Established never arrives from a PMID alone —
              Gate C is human.
            </p>
          </div>
          <div className="grade-row" style={{ marginTop: "2.5rem" }}>
            <div className="grade-cell grade-established" style={{ background: "rgba(4,18,16,0.04)", borderColor: "rgba(4,18,16,0.1)" }}>
              <div className="label" style={{ color: "#1a6b5c" }}>established</div>
              <h3>Surfacable path</h3>
              <p style={{ color: "rgba(4,18,16,0.62)" }}>
                Requires curationReview=approved. Only then can Aksh consider HITL CDS cards.
              </p>
            </div>
            <div className="grade-cell grade-uncertain" style={{ background: "rgba(4,18,16,0.04)", borderColor: "rgba(4,18,16,0.1)" }}>
              <div className="label" style={{ color: "#a8742e" }}>uncertain</div>
              <h3>Honest gap</h3>
              <p style={{ color: "rgba(4,18,16,0.62)" }}>
                Visible to discovery. Never auto-promoted. Never silently treated as clinic truth.
              </p>
            </div>
            <div className="grade-cell grade-unexplored" style={{ background: "rgba(4,18,16,0.04)", borderColor: "rgba(4,18,16,0.1)" }}>
              <div className="label" style={{ color: "#5a6b64" }}>unexplored</div>
              <h3>Frontier label</h3>
              <p style={{ color: "rgba(4,18,16,0.62)" }}>
                Named unknown. Useful for ISI radar — forbidden as diagnosis support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-ink">
        <div className="container">
          <div className="section-head">
            <span className="section-num">THE CLIMB</span>
            <h2 className="display display-lg">We know the phase at every altitude.</h2>
            <p className="lede">
              Same method from schema to optional bio plugins: publish from
              hsi-core, let products consume, keep humans on Gate C.
            </p>
          </div>
          <div className="stage-tabs" role="tablist" aria-label="Roadmap phases">
            {altitudes.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={active === a.id}
                className={`stage-tab${active === a.id ? " active" : ""}`}
                onClick={() => setActive(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="stage-panel" role="tabpanel">
            <span className="status-pill">{panel.label}</span>
            <h3 style={{ marginTop: "1rem" }}>{panel.title}</h3>
            <p className="muted" style={{ marginTop: "0.65rem", maxWidth: "40rem" }}>
              {panel.body}
            </p>
            <ul className="checklist">
              {panel.build.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-teal">
        <div className="container">
          <div className="section-head center">
            <span className="section-num">TWO CONSUMERS</span>
            <h2 className="display display-lg">
              One graph.
              <br />
              Two safe faces.
            </h2>
            <p className="lede" style={{ textAlign: "center" }}>
              ISI explores with honest grades. Aksh surfaces HITL suggestions only
              when edges clear Gate C and established. Neither invents evidence.
            </p>
          </div>
          <div className="link-strip">
            <Link to="/for-isi">
              <span className="idx">01</span>
              <span className="title">For ISI — discovery, Ask, Radar</span>
              <span className="arrow">↗</span>
            </Link>
            <Link to="/for-aksh">
              <span className="idx">02</span>
              <span className="title">For Aksh — clinician-safe HITL</span>
              <span className="arrow">↗</span>
            </Link>
            <Link to="/alignment">
              <span className="idx">03</span>
              <span className="title">Hub and spokes — edit only hsi-core</span>
              <span className="arrow">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">IN PLAIN TERMS</span>
            <h2 className="display display-md">What HSI is — and is not.</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>What does hsi-core hold?</summary>
              <p>
                The shared evidence layer: graded edges, claim → LOINC marker →
                observation → action stubs, Gate C curator checklists, and published
                exports for ISI and Aksh. No live PHI. No EHR write-back.
              </p>
            </details>
            <details>
              <summary>Is this a clinical decision engine?</summary>
              <p>
                No. Aksh may show HITL suggestion cards only when isCdsSurfacable
                passes. Mapping an akshNodeId never opens CDS by itself. ISI is
                discovery — never diagnosis support.
              </p>
            </details>
            <details>
              <summary>Where do we edit?</summary>
              <p>
                Only this repository. immunecity, Aksh product apps, and
                swift-deliveries consume published artifacts or stay reference-only.
              </p>
            </details>
            <details>
              <summary>What about structure / generative bio tools?</summary>
              <p>
                P3 optional plugins after license review. They must not flip
                hsiGrade or Gate C. Discovery sandbox — never clinic path.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
