import { Link } from "react-router-dom";
import { EvidenceGradesMock, GateCQueueMock } from "../components/Mocks";

/** Published RA / anti-TNF pack rows — illustrative of live Discovery, not invented. */
const raExampleClaims = [
  {
    claimId: "HSI-C-RA-001",
    subject: "TNF-α",
    relationship: "contributes_to",
    object: "Rheumatoid arthritis",
    grade: "uncertain",
    review: "source-verified",
    pmid: "11244034",
    claimText:
      "TNF-α contributes to synovial inflammation in rheumatoid arthritis (scope-locked pathway seed — not a partner-signed lock).",
  },
  {
    claimId: "HSI-C-RA-002",
    subject: "Anti-CCP antibodies",
    relationship: "biomarker_of",
    object: "Rheumatoid arthritis",
    grade: "uncertain",
    review: "source-verified",
    pmid: "10662881",
    claimText:
      "Anti-CCP (ACPA) antibodies are a serologic biomarker used in rheumatoid arthritis workup (scope-locked — not partner-signed / not CDS).",
  },
  {
    claimId: "HSI-C-RA-007",
    subject: "Anti-drug antibodies to anti-TNF (ADA)",
    relationship: "associated_with",
    object: "Anti-TNF refractory RA phenotype",
    grade: "uncertain",
    review: "source-verified",
    pmid: "16508927",
    claimText:
      "Development of anti-infliximab antibodies is associated with reduced clinical response to infliximab in rheumatoid arthritis (immunogenicity competing frame).",
  },
];

const workflow = [
  {
    n: "01",
    title: "Start from a cell or disease",
    body: "Open a question about an immune cell subset, mechanism or disease — not a blank chat.",
  },
  {
    n: "02",
    title: "Follow contextual relationships",
    body: "Traverse linked cells, tissues, molecules, biomarkers and studies. Context (subset, state, tissue, assay) stays attached.",
  },
  {
    n: "03",
    title: "Inspect evidence and conflict",
    body: "Read provenance, grades and competing explanations. See what supports, contradicts or remains uncertain.",
  },
  {
    n: "04",
    title: "Save a research brief",
    body: "Keep a reproducible slice of mechanisms, gaps and citations ready for expert challenge.",
  },
];

const mapSteps = [
  { n: "1", label: "Question", detail: "RA · anti-TNF response heterogeneity" },
  { n: "2", label: "Entities", detail: "TNF, ACPA, ADA, LOINC markers, studies" },
  { n: "3", label: "Claims", detail: "Typed relations + context + PMID" },
  { n: "4", label: "Review", detail: "Gate C human approve / revise / reject" },
  { n: "5", label: "Export", detail: "Versioned pack → ISI Discovery" },
];

const trust = [
  {
    title: "Provenance",
    body: "Claims carry source locators (PMID / DOI / dataset pointers), licence or reuse scope where recorded, and access limits.",
  },
  {
    title: "Qualified claims",
    body: "Relationships keep typed relation, context, evidence type, limitations and uncertainty — not a flattened universal role for “CD4 T cell.”",
  },
  {
    title: "Uncertainty & conflict",
    body: "Competing explanations and gaps stay visible. Hypotheses stay labelled until evaluated.",
  },
  {
    title: "Accountable review",
    body: "Agents may propose. Gate C is human-only. Only reviewed claims enter the approved export graph.",
  },
];

const maturity = [
  {
    status: "Implemented",
    items: [
      "Graded evidence edges + claim→marker stubs",
      "Scope-locked RA / anti-TNF pilot pack + Discovery ASK→MAP→REVIEW",
      "SSc / gut / neuro secondary packs (honest uncertain grades)",
      "Gate C checklists + curator UX; versioned `bun run outputs`",
      "ISI consume contract / flip-readiness exports",
    ],
  },
  {
    status: "Planned / partial",
    items: [
      "Real named research partner + one confirmed pilot question",
      "Deeper ontology binds beyond curator-confirmed CL/MONDO starters",
      "Broader cell-state / tissue / trial-metadata coverage",
      "Public cite Check→supports→Approve on Gate C–approved handoffs",
    ],
  },
  {
    status: "Future concept (not live)",
    items: [
      "Patient-level or partner PHI plane",
      "Automated disease prediction or trial eligibility",
      "Live Aksh CDS / Akeno clinical product paths",
      "Commercial structure / generative adapters as clinic tools",
    ],
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
            An evidence backbone for immune-science discovery.
          </h1>
          <p className="lede hero-lede">
            HSI Core connects immune-science claims to their sources, context,
            uncertainty and review status — and publishes versioned evidence for{" "}
            <strong>Immune Super Intelligence (ISI)</strong>, the researcher-facing
            workspace.
          </p>
          <div className="hero-actions">
            <Link to="/discovery" className="btn btn-primary">
              Enter Discovery <span className="arrow">↗</span>
            </Link>
            <Link to="/for-isi" className="btn btn-ghost">
              ISI research workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-grid-light">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">FROM QUESTION TO MAP</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                How a research question becomes an{" "}
                <span className="text-cobalt">evidence map.</span>
              </h2>
            </div>
            <p className="lede">
              Collect permitted sources → normalize entities → represent
              context-rich claims → human review → versioned export into ISI.
              Agents assist; they never invent sources or auto-publish facts.
            </p>
          </div>
          <ol className="map-flow" aria-label="Question to evidence map">
            {mapSteps.map((step, i) => (
              <li key={step.n} className="map-flow-step">
                <span className="map-flow-n">{step.n}</span>
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
                {i < mapSteps.length - 1 ? (
                  <span className="map-flow-arrow" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <ol className="workflow-rail" style={{ marginTop: "2.75rem" }}>
            {workflow.map((step) => (
              <li key={step.n} className="workflow-step">
                <span className="workflow-n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-ink">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">WORKED EXAMPLE</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Rheumatoid arthritis · anti-TNF response.
              </h2>
            </div>
            <p className="lede">
              Scope-locked Stage 1 slice from published HSI packs. Grades stay{" "}
              <em>uncertain</em> until accountable review promotes them — not a
              claim of clinical readiness.
            </p>
          </div>
          <p className="example-question">
            <span className="mono">ASK</span>
            Why do some patients with RA respond differently to anti-TNF therapy,
            and which biomarkers or mechanisms best define those subgroups?
          </p>
          <div className="example-claims">
            {raExampleClaims.map((c) => (
              <article key={c.claimId} className="example-claim">
                <div className="example-claim-meta">
                  <code>{c.claimId}</code>
                  <span className="grade-chip grade-uncertain-chip">{c.grade}</span>
                  <span className="mono">{c.review}</span>
                </div>
                <p className="example-spo">
                  <strong>{c.subject}</strong>
                  <span className="mono"> {c.relationship} </span>
                  <strong>{c.object}</strong>
                </p>
                <p>{c.claimText}</p>
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link-on-ink"
                >
                  PMID {c.pmid} ↗
                </a>
              </article>
            ))}
          </div>
          <p className="example-note">
            Competing frames in the same pack include TNF-centric vs multi-cytokine /
            IL-6 explanations — both kept visible. Open the live loop to inspect the
            full map.
          </p>
          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: "1.5rem" }}>
            <Link to="/discovery" className="btn btn-primary">
              Open this map in Discovery <span className="arrow">↗</span>
            </Link>
            <Link to="/evidence" className="btn btn-ghost">
              Evidence grades &amp; Gate C
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-grid-light">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">TRUST</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                Provenance, grades, uncertainty,{" "}
                <span className="text-cobalt">review.</span>
              </h2>
            </div>
            <p className="lede">
              Research intelligence connects several data points for better
              healthcare technology and future treatment strategy — not bedside care.
            </p>
          </div>
          <div className="trust-grid trust-grid-light">
            {trust.map((item) => (
              <article key={item.title} className="trust-card trust-card-light">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="trust-mocks trust-mocks-light">
            <div>
              <p className="mono trust-mock-label-light">Evidence grades</p>
              <EvidenceGradesMock />
            </div>
            <div>
              <p className="mono trust-mock-label-light">Gate C — human review</p>
              <GateCQueueMock />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="split-headline">
            <div>
              <span className="section-num">ROLES</span>
              <h2 className="display display-lg" style={{ marginTop: "0.75rem" }}>
                What HSI Core provides to ISI.
              </h2>
            </div>
            <p className="lede">
              ISI is the discovery experience. HSI Core is its evidence backbone.
              Clinical products stay separate.
            </p>
          </div>
          <div className="roles-grid">
            <article className="role-card role-primary">
              <span className="role-kicker">Researcher-facing</span>
              <h3>ISI</h3>
              <p>
                Explore how immune cells, states, tissues, mechanisms, diseases and
                evidence relate. Start from a cell or disease; inspect support,
                conflict and gaps; save a brief.
              </p>
              <Link to="/for-isi" className="text-link">
                ISI workspace →
              </Link>
            </article>
            <article className="role-card role-primary">
              <span className="role-kicker">Evidence backbone</span>
              <h3>HSI Core</h3>
              <p>
                Evidence model, provenance, validation, Gate C rules and versioned
                exports. Sole edit target for the shared graded graph.
              </p>
              <Link to="/docs" className="text-link">
                Technical docs →
              </Link>
            </article>
            <article className="role-card role-secondary">
              <span className="role-kicker">Separate · not this workflow</span>
              <h3>Aksh Health</h3>
              <p>
                Clinical HITL product. Not the user or purpose of ISI discovery.
                Akeno / patient-level planes are later concepts requiring separate
                rights, governance and evaluation — not live here.
              </p>
              <Link to="/for-aksh" className="text-link">
                Clinical boundary →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">MATURITY</span>
            <h2 className="display display-md">What is live vs planned.</h2>
          </div>
          <div className="maturity-grid">
            {maturity.map((col) => (
              <article key={col.status} className="maturity-card">
                <h3>{col.status}</h3>
                <ul>
                  {col.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="maturity-foot">
            Phase detail for collaborators:{" "}
            <Link to="/roadmap">Development status</Link>
            {" · "}
            <a
              href="https://github.com/gnaneshwer23/hsi-core/blob/main/docs/BUILD_STATUS_AND_NEXT.md"
              target="_blank"
              rel="noreferrer"
            >
              BUILD_STATUS_AND_NEXT.md ↗
            </a>
          </p>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">IN PLAIN TERMS</span>
            <h2 className="display display-md">Boundaries we keep.</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>Is ISI clinical decision support?</summary>
              <p>
                No. ISI is research intelligence. It does not diagnose, select
                therapies at the bedside, score patient risk, or decide trial
                eligibility.
              </p>
            </details>
            <details>
              <summary>Can the graph represent every immune entity listed in the vision?</summary>
              <p>
                Not yet. The target vocabulary includes cells, tissues, diseases,
                mechanisms, molecules, biomarkers, publications and trial metadata.
                Today’s live packs are strongest on the RA / anti-TNF slice plus
                secondary SSc / gut / neuro seeds. Broader coverage is planned —
                not claimed as complete.
              </p>
            </details>
            <details>
              <summary>Where do patient records fit?</summary>
              <p>
                Not in the current discovery plane. Identifiable or sensitive
                patient data must not enter the general research graph or an LLM by
                default. Any later patient plane needs separate lawful basis,
                governance, security and clinical validation.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="section section-bone cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2 className="display display-md">Start from a real evidence map.</h2>
            <p className="lede">
              Open Discovery on the RA / anti-TNF question, or pull versioned exports into ISI.
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
