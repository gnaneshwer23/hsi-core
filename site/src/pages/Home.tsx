import { Link } from "react-router-dom";
import { EvidenceGradesMock, GateCQueueMock } from "../components/Mocks";

const workflow = [
  {
    n: "01",
    title: "Explore a cell or disease",
    body: "Start from an immune cell, pathway, or disease question — not a blank chat.",
  },
  {
    n: "02",
    title: "Follow contextual relationships",
    body: "Move through connected mechanisms, biomarkers, treatments and studies while context stays attached.",
  },
  {
    n: "03",
    title: "Inspect supporting evidence",
    body: "Open provenance, PMIDs and grades for each link. See what is established, uncertain or still unexplored.",
  },
  {
    n: "04",
    title: "Save a research brief",
    body: "Keep a reproducible slice — competing explanations, gaps and citations — ready for expert challenge.",
  },
];

const trust = [
  {
    title: "Source provenance",
    body: "Claims carry locators (PMID / DOI / dataset pointers). Presence of a citation never invents clinic truth.",
  },
  {
    title: "Evidence grades",
    body: "established · uncertain · unexplored stay separate from curation lifecycle and teaching status.",
  },
  {
    title: "Uncertainty, named",
    body: "Gaps and competing explanations stay visible. Models propose; they do not erase doubt.",
  },
  {
    title: "Accountable review",
    body: "Gate C is human-only. Nothing auto-approves into the knowledge graph or a care path.",
  },
];

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="hero-content container">
          <p className="hero-brand">HSI Core</p>
          <h1 className="display display-xl">
            The evidence and provenance backbone for immune-science discovery.
          </h1>
          <p className="lede hero-lede">
            Connect immune cells, mechanisms, diseases and research evidence —
            while preserving context, uncertainty and human review.
          </p>
          <div className="hero-actions">
            <Link to="/discovery" className="btn btn-primary">
              Open Discovery <span className="arrow">↗</span>
            </Link>
            <Link to="/evidence" className="btn btn-ghost">
              Evidence &amp; Gate C
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-grid-light">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">PRODUCT WORKFLOW</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                From a question to a{" "}
                <span className="text-cobalt">reproducible brief.</span>
              </h2>
            </div>
            <p className="lede">
              Researcher-facing discovery runs on ISI. HSI Core supplies the graded
              evidence layer underneath — connect, inspect, challenge.
            </p>
          </div>
          <ol className="workflow-rail">
            {workflow.map((step) => (
              <li key={step.n} className="workflow-step">
                <span className="workflow-n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "2rem" }}>
            <Link to="/for-isi" className="btn btn-ink">
              How ISI consumes HSI <span className="arrow">↗</span>
            </Link>
            <Link to="/discovery" className="btn btn-ghost">
              Try ASK → MAP → REVIEW
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">TRUST</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Traceable evidence.
                <br />
                <span className="accent">Human accountability.</span>
              </h2>
            </div>
            <p className="lede">
              Research intelligence connects several data points to find better
              healthcare technology and future treatment strategy — not bedside care.
            </p>
          </div>
          <div className="trust-grid">
            {trust.map((item) => (
              <article key={item.title} className="trust-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="trust-mocks">
            <div>
              <p className="mono trust-mock-label">Evidence grades</p>
              <EvidenceGradesMock />
            </div>
            <div>
              <p className="mono trust-mock-label">Gate C — human review</p>
              <GateCQueueMock />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-grid-light">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">ROLES</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Backbone and discovery.
                <br />
                <span className="text-cobalt">Clinic stays gated.</span>
              </h2>
            </div>
            <p className="lede">
              Clear ownership so research packs never get confused with clinical
              decision support.
            </p>
          </div>
          <div className="roles-grid">
            <article className="role-card role-primary">
              <span className="role-kicker">Primary · discovery</span>
              <h3>ISI</h3>
              <p>
                Researcher-facing exploration: ask a disease or cell question,
                traverse relationships, inspect evidence, save a brief.
              </p>
              <Link to="/for-isi" className="text-link">
                For ISI teams →
              </Link>
            </article>
            <article className="role-card role-primary">
              <span className="role-kicker">Substrate</span>
              <h3>HSI Core</h3>
              <p>
                Evidence and provenance backbone — graded edges, Gate C checklists,
                versioned exports. Sole edit target for the shared graph.
              </p>
              <Link to="/docs" className="text-link">
                How to use hsi-core →
              </Link>
            </article>
            <article className="role-card role-secondary">
              <span className="role-kicker">Secondary · gated</span>
              <h3>Aksh / clinical HITL</h3>
              <p>
                Separate clinician-safe plane. HITL suggestion paths stay closed
                until established + approved + product governance. Not this Discovery release.
              </p>
              <Link to="/for-aksh" className="text-link">
                Aksh boundary →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">IN PLAIN TERMS</span>
            <h2 className="display display-md">What HSI Core enables now.</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>What is HSI Core?</summary>
              <p>
                The shared evidence layer for immune-science discovery: graded
                edges, provenance, uncertainty labels, and human Gate C review.
                ISI is the researcher-facing experience that consumes it.
              </p>
            </details>
            <details>
              <summary>Is this clinical intelligence?</summary>
              <p>
                No. HSI / ISI is research intelligence — connecting evidence for
                healthcare technology and future treatment strategy. It is not
                diagnosis, therapy selection, or clinical decision support.
              </p>
            </details>
            <details>
              <summary>Where does the build roadmap live?</summary>
              <p>
                P0–P3 phase detail stays in project documentation and a secondary{" "}
                <Link to="/roadmap">Development status</Link> page — not the main
                product story on this homepage.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="section section-bone cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2 className="display display-md">Start from the evidence backbone.</h2>
            <p className="lede">
              Explore Discovery, read Gate C docs, or pull published exports into ISI.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/discovery" className="btn btn-ink">
              Discovery Centre <span className="arrow">↗</span>
            </Link>
            <Link to="/docs" className="btn btn-ghost">
              How to use
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
