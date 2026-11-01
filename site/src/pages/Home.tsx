import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AgentWorkflowDiagram,
  DualConsumerDiagram,
  IsometricProcess,
  MiniSystemDiagram,
  TerrainClimb,
  TriggersFlowDiagram,
} from "../components/Diagrams";
import {
  AkshCoworkerMock,
  AkshHitlMock,
  ClaimMarkerMock,
  EvidenceGradesMock,
  GateCQueueMock,
  IsiCoworkerMock,
} from "../components/Mocks";

const pillars = [
  { to: "/systems", label: "Human Systems", sub: "Intelligence", icon: "◎" },
  { to: "/evidence", label: "Evidence grades", sub: "& Gate C", icon: "▣" },
  { to: "/discovery", label: "Discovery Centre", sub: "ASK→MAP→REVIEW", icon: "◇" },
  { to: "/for-aksh", label: "Aksh clinician", sub: "safe HITL", icon: "⬡" },
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

const steps = [
  {
    n: "01",
    title: "Gate C queue",
    accent: "queue",
    body: "Evidence-linked RELs with verified PMIDs — still pending until a human approves.",
    tags: ["PMID linked", "human only", "no auto-approve", "checklists", "S-P-O re-read"],
    mock: "gatec" as const,
  },
  {
    n: "02",
    title: "Evidence grades",
    accent: "grades",
    body: "Three axes stay independent. Established never arrives from citation alone.",
    tags: ["hsiGrade", "curationReview", "teachingStatus", "risk tier", "export only"],
    mock: "grades" as const,
    flip: true,
  },
  {
    n: "03",
    title: "Aksh HITL stub",
    accent: "HITL",
    body: "Weekly ships leave something running — map ids, gates, suggestion stubs. No write-back.",
    tags: ["isCdsSurfacable", "aksh: ids", "no PHI", "no write-back", "HITL required"],
    mock: "aksh" as const,
  },
  {
    n: "04",
    title: "Claim → marker",
    accent: "marker",
    body: "Claim to LOINC marker to observation stub — grounded language without inventing clinic truth.",
    tags: ["LOINC", "obs stub", "gap report", "export:isi", "export:aksh-map"],
    mock: "claim" as const,
    flip: true,
  },
];

const systems = [
  {
    n: "01",
    title: "Outcomes, published",
    body: "What ISI and Aksh see after Gate C — honest grades, maps, and gap reports.",
    kind: "outcomes" as const,
  },
  {
    n: "02",
    title: "Act, inside the graph",
    body: "Score confidence, route to discovery or HITL, write only through published exports.",
    kind: "act" as const,
  },
  {
    n: "03",
    title: "Build and prove",
    body: "Context, evaluation, and governance before anything is clinic-adjacent.",
    kind: "build" as const,
  },
  {
    n: "04",
    title: "Foundations",
    body: "Identity, permissions, and the data layer — one substrate, separate axes.",
    kind: "foundations" as const,
  },
];

const stackLayers = [
  {
    id: "05",
    tone: "light" as const,
    eyebrow: "05 OUTCOMES · WHAT SURFACES SEE",
    title: "Honest grades on every face",
    body: "Pipeline exports, hours of curator clarity, decisions with evidence, and a team that runs Gate C.",
    pills: [
      { t: "ISI Ask / Radar", s: "discovery only" },
      { t: "Aksh HITL cards", s: "established + approved" },
      { t: "Gap reports", s: "named unknowns" },
      { t: "Curator docs", s: "in hsi-core" },
    ],
  },
  {
    id: "04",
    tone: "dark" as const,
    eyebrow: "04 APPLIED · ACT",
    title: "Agents and workflows, inside the substrate",
    body: "Plan → typed tools → score confidence → route to a human below threshold → write back only via exports.",
    flow: ["Plan", "Typed tools", "Score", "Human below θ", "Export"],
  },
  {
    id: "03",
    tone: "light" as const,
    eyebrow: "03 BUILD AND PROVE",
    badge: "FORWARD-CURATED",
    title: "Context, evaluation and governance",
    body: "Retrieval with citations, test sets of real RELs, risk tiers and release gates, audit log.",
    tags: [
      "Retrieval with PMIDs",
      "Gate C checklists",
      "Risk tiers",
      "Cost per task",
      "Audit log",
      "Model-change playbook",
    ],
  },
  {
    id: "02",
    tone: "light" as const,
    eyebrow: "02 FOUNDATIONS",
    badge: "FORWARD-CURATED",
    title: "Identity, permissions and the data layer",
    body: "Consumers inherit published access. One definition per grade. Lineage. Error queues stay explicit.",
    tags: [
      "Consumers pull",
      "One ID scheme",
      "One grade definition",
      "Lineage",
      "Error queues",
    ],
  },
];

function StepMock({ kind }: { kind: "gatec" | "grades" | "aksh" | "claim" }) {
  if (kind === "gatec") return <GateCQueueMock />;
  if (kind === "grades") return <EvidenceGradesMock />;
  if (kind === "aksh") return <AkshHitlMock />;
  return <ClaimMarkerMock />;
}

export function Home() {
  const [active, setActive] = useState(altitudes[1].id);
  const panel = altitudes.find((a) => a.id === active) ?? altitudes[0];
  const [flowIdx, setFlowIdx] = useState(0);
  const flows = [
    { title: "Gate C release path", node: <AgentWorkflowDiagram /> },
    { title: "Triggers → grades", node: <TriggersFlowDiagram /> },
    { title: "Two consumers", node: <DualConsumerDiagram /> },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="hero-content container">
          <span className="eyebrow">Shared substrate · Aksh + ISI</span>
          <h1 className="display display-xl">
            Evidence-graded edges,
            <br />
            engineered for clinic and discovery.
          </h1>
          <div className="hero-deep">
            {pillars.map((p) => (
              <Link key={p.to} to={p.to} className="hero-deep-card">
                <span className="hero-deep-icon" aria-hidden>
                  {p.icon}
                </span>
                <span>
                  <strong>{p.label}</strong>
                  <em>{p.sub}</em>
                </span>
              </Link>
            ))}
          </div>
          <div className="hero-actions">
            <Link to="/docs" className="btn btn-primary">
              Use hsi-core <span className="arrow">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-climb">
        <div className="container">
          <div className="climb-head">
            <span className="eyebrow eyebrow-on-blue">THE CLIMB</span>
            <h2 className="display display-lg">
              We know the terrain
              <br />
              at every altitude.
            </h2>
          </div>
          <TerrainClimb active={active} onSelect={setActive} />
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

      <section className="section section-grid-light">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">WHY GRADES STAY SEPARATE</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Axes don&apos;t{" "}
                <span className="text-cobalt">collapse themselves.</span>
              </h2>
            </div>
            <p className="lede">
              HSI keeps curation lifecycle, evidence grade, and teaching status
              as separate axes. Established never arrives from a PMID alone —
              Gate C is human.
            </p>
          </div>
          <div className="iso-shell">
            <IsometricProcess />
          </div>
          <div className="grade-row" style={{ marginTop: "2rem" }}>
            <div className="grade-cell grade-established">
              <div className="label" style={{ color: "var(--cobalt)" }}>
                established
              </div>
              <h3>Surfacable path</h3>
              <p>Requires curationReview=approved. Only then can Aksh consider HITL CDS cards.</p>
            </div>
            <div className="grade-cell grade-uncertain">
              <div className="label" style={{ color: "var(--amber)" }}>
                uncertain
              </div>
              <h3>Honest gap</h3>
              <p>Visible to discovery. Never auto-promoted. Never silently treated as clinic truth.</p>
            </div>
            <div className="grade-cell grade-unexplored">
              <div className="label" style={{ color: "var(--slate)" }}>
                unexplored
              </div>
              <h3>Frontier label</h3>
              <p>Named unknown. Useful for ISI radar — forbidden as diagnosis support.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-grid-light section-tight-top">
        <div className="container">
          <div className="split-headline">
            <h2 className="display display-lg">
              From audit to a system{" "}
              <span className="text-cobalt">your team runs.</span>
            </h2>
            <p className="lede">Four steps. Each one leaves something running in hsi-core.</p>
          </div>
        </div>
        {steps.map((s) => (
          <div key={s.n} className={`step-block${s.flip ? " flip" : ""}`}>
            <div className="container step-inner">
              <div className="step-copy">
                <span className="step-n">STEP {s.n}</span>
                <h3 className="display display-md">
                  {s.title.split(s.accent)[0]}
                  <span className="text-cobalt">{s.accent}</span>
                  {s.title.split(s.accent)[1] ?? ""}
                </h3>
                <p>{s.body}</p>
                <div className="tag-row">
                  {s.tags.map((t) => (
                    <span key={t} className="tag tag-light">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="step-visual">
                <StepMock kind={s.mock} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="section section-dark-band">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num" style={{ color: "rgba(255,255,255,0.65)" }}>
                HOW IT&apos;S DEPLOYED
              </span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem", color: "#fff" }}>
                Four systems. Engineered, not invented.
              </h2>
            </div>
            <p className="lede" style={{ color: "rgba(255,255,255,0.72)" }}>
              Outcomes, act, build, foundations — mapped to HSI layers. Mini
              diagrams are original SVGs for this substrate.
            </p>
          </div>
          <div className="sys-grid">
            {systems.map((s) => (
              <article key={s.n} className="sys-card">
                <div className="sys-card-visual">
                  <MiniSystemDiagram kind={s.kind} />
                  <div className="sys-card-meta">
                    <span>{s.n}</span>
                    <span aria-hidden>↗</span>
                  </div>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">ENGINEERING WORKFLOWS</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                The engines we publish,{" "}
                <span className="accent">end to end.</span>
              </h2>
            </div>
            <p className="lede">
              Real workflow maps for claim/evidence/Gate C — original HSI
              schematics, not third-party dumps.
            </p>
          </div>
          <div className="flow-carousel">
            <button
              type="button"
              className="flow-nav"
              aria-label="Previous workflow"
              onClick={() => setFlowIdx((i) => (i + flows.length - 1) % flows.length)}
            >
              ‹
            </button>
            <div className="flow-stage">
              <div className="flow-label">{flows[flowIdx].title}</div>
              {flows[flowIdx].node}
            </div>
            <button
              type="button"
              className="flow-nav"
              aria-label="Next workflow"
              onClick={() => setFlowIdx((i) => (i + 1) % flows.length)}
            >
              ›
            </button>
          </div>
          <div className="flow-dots" role="tablist" aria-label="Workflow maps">
            {flows.map((f, i) => (
              <button
                key={f.title}
                type="button"
                className={i === flowIdx ? "active" : undefined}
                aria-label={f.title}
                onClick={() => setFlowIdx(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-grid-light">
        <div className="container">
          <h2 className="display display-lg" style={{ marginBottom: "2rem" }}>
            The HSI stack
          </h2>
          <div className="stack-rail">
            {stackLayers.map((layer, idx) => (
              <div key={layer.id}>
                {idx > 0 && (
                  <div className="stack-connector">
                    <span>
                      {idx === 1
                        ? "MEASURED OUTCOMES"
                        : idx === 2
                          ? "EVALUATED, GATED RELEASES"
                          : "PERMISSIONED CONTEXT"}
                    </span>
                  </div>
                )}
                <article className={`stack-card stack-${layer.tone}`}>
                  <div className="stack-card-top">
                    <span className="stack-eyebrow">{layer.eyebrow}</span>
                    {"badge" in layer && layer.badge ? (
                      <span className="stack-badge">{layer.badge}</span>
                    ) : null}
                  </div>
                  <div className="stack-card-body">
                    <div>
                      <h3 className="display display-md">{layer.title}</h3>
                      <p>{layer.body}</p>
                    </div>
                    {"pills" in layer && layer.pills ? (
                      <div className="stack-outcome-grid">
                        {layer.pills.map((p) => (
                          <div key={p.t}>
                            <strong>{p.t}</strong>
                            <span>{p.s}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {"flow" in layer && layer.flow ? (
                      <div className="stack-flow">
                        {layer.flow.map((f, i) => (
                          <span key={f}>
                            {f}
                            {i < layer.flow!.length - 1 ? <i>→</i> : null}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {"tags" in layer && layer.tags ? (
                      <div className="tag-row">
                        {layer.tags.map((t) => (
                          <span key={t} className="tag tag-light">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-ink-dots">
        <div className="container">
          <div className="split-headline">
            <h2 className="display display-lg">
              Discovery and HITL,{" "}
              <span className="accent">side by side.</span>
            </h2>
            <p className="lede">
              Illustrative co-worker cards — fake demo metrics labeled clearly.
              Not live product telemetry.
            </p>
          </div>
          <div className="coworker-grid">
            <IsiCoworkerMock />
            <AkshCoworkerMock />
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
                Only this repository. immunecity and Aksh product apps consume
                published artifacts. DeliverX / swift-deliveries is ignored.
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

      <section className="section section-bone cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2 className="display display-md">Start from the substrate.</h2>
            <p className="lede">
              Validate seeds, export maps, read Gate C docs — all inside hsi-core.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/docs" className="btn btn-ink">
              How to use <span className="arrow">↗</span>
            </Link>
            <Link to="/systems" className="btn btn-ghost">
              Systems overview
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
