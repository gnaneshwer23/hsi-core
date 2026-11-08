import {useState, type FormEvent} from "react";
import {Link} from "react-router-dom";
import {ArrowIcon} from "../components/ArrowIcon";
import {LandingVisual} from "../components/editorial/LandingVisual";
import {EvidenceLegend} from "../components/Experience";
import {
  DISCUSSION_TOPICS,
  addLocalResearchComment,
  exportLocalResearchDiscussion,
  type LocalResearchComment,
} from "../../../src/researchDiscussionPreview";

function downloadText(content: string, filename: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const researchPillars = [
  {
    title: "Investigate what is known",
    text: "Explore published findings, relevant datasets, biological relationships and available experimental context.",
  },
  {
    title: "Challenge what appears established",
    text: "Compare studies reporting different outcomes. Examine differences in species, tissue, disease stage, assays and interventions.",
  },
  {
    title: "Identify what remains uncertain",
    text: "Separate absent local evidence, incomplete search coverage and potentially unresolved scientific questions.",
  },
  {
    title: "Determine what to investigate next",
    text: "Develop testable hypotheses, identify missing measurements and outline experiments that could distinguish competing explanations.",
  },
] as const;

const applications = [
  {
    name: "Autoimmunity and inflammation",
    title: "Investigate immune dysregulation and treatment response.",
    description:
      "Explore cellular interactions, disease heterogeneity and reported treatment responses with source context kept visible.",
    tools: ["Immune dysregulation", "Cellular interactions", "Treatment-response context"],
  },
  {
    name: "Fibrosis and tissue remodelling",
    title: "Explore immune–stromal interactions and translational uncertainty.",
    description:
      "Connect inflammatory signalling, tissue-specific mechanisms and the evidence limits of translational claims.",
    tools: ["Immune–stromal interactions", "Tissue-specific mechanisms", "Translational uncertainty"],
  },
  {
    name: "Cancer immunology",
    title: "Investigate tumour–immune interactions and resistance context.",
    description:
      "Examine immune-cell states, resistance mechanisms and therapeutic context without inventing efficacy claims.",
    tools: ["Tumour–immune interactions", "Immune-cell states", "Therapeutic context"],
  },
  {
    name: "Gut–immune–metabolic biology",
    title: "Connect microbial functions, metabolites and host immunity.",
    description:
      "Explore relationships between microbial functions, metabolites, host immunity and metabolic phenotypes.",
    tools: ["Microbial functions", "Metabolites", "Host immunity"],
  },
  {
    name: "Neuroimmune research",
    title: "Examine immune signalling across neural tissues.",
    description:
      "Investigate interactions between immune signalling, neural tissues and inflammatory disease mechanisms.",
    tools: ["Immune signalling", "Neural tissues", "Inflammatory mechanisms"],
  },
  {
    name: "Biomarkers and precision research",
    title: "Investigate features linked to progression and reported response.",
    description:
      "Explore biological features associated with disease progression, patient subgroups and reported treatment responses.",
    tools: ["Progression features", "Patient subgroups", "Reported responses"],
  },
] as const;

const principles = [
  ["Traceability", "Scientific claims should be linked to identifiable evidence."],
  ["Context", "Species, tissues, methods and disease states matter."],
  ["Uncertainty", "Conflicting and incomplete evidence must remain visible."],
  ["Reproducibility", "Research outputs should preserve relevant sources, versions and methods."],
  ["Human oversight", "Scientific review is essential before unvalidated findings are treated as established knowledge."],
  ["Responsible data use", "Biomedical and clinical data must be accessed and processed under appropriate permissions."],
] as const;

export function ResearchLanding() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Scientific investigation</p>
          <h1>
            Go beyond
            <br />
            <em>literature search.</em>
          </h1>
          <p className="ed-lead">
            Finding relevant publications is the beginning of a scientific investigation—not the conclusion. HSI is
            designed to help researchers move from evidence retrieval toward contextual biological interpretation.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/sign-in">
              Start an investigation <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/contact">
              Request research access <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
          <p className="ed-hero-note">
            Public overview versus authorised research workspace: sign-in and permissions are required for governed
            investigations.
          </p>
        </div>
        <LandingVisual kind="signalling" priority />
      </header>
      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Research Intelligence</p>
          <h2>
            From retrieval to
            <br />
            <em>investigation.</em>
          </h2>
        </div>
        <ol className="ed-approach-grid">
          {researchPillars.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function Solutions() {
  const [index, setIndex] = useState(0);
  const a = applications[index]!;
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Cross-domain discovery</p>
          <h1>
            Different diseases.
            <br />
            <em>Shared biological questions.</em>
          </h1>
          <p className="ed-lead">
            Research applications across immune, fibrotic, oncologic, metabolic and neuroimmune domains—framed as
            investigation opportunities, not validated clinical products.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/contact">
              Discuss a research application <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/biology">
              Explore Biology <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
        </div>
        <LandingVisual kind="immunometabolic" priority />
      </header>
      <section className="ed-research-section">
        <div className="ed-feature-tabs">
          <div className="ed-feature-tablist" role="tablist" aria-label="Research applications">
            {applications.map((item, i) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                id={`app-tab-${i}`}
                aria-selected={index === i}
                aria-controls="app-panel"
                tabIndex={index === i ? 0 : -1}
                onClick={() => setIndex(i)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <article id="app-panel" role="tabpanel" aria-labelledby={`app-tab-${index}`}>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
            <ul className="ed-plain-list">
              {a.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}

export function EvidenceSafety() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Scientific integrity</p>
          <h1>
            Scientific intelligence
            <br />
            <em>must be open to scrutiny.</em>
          </h1>
          <p className="ed-lead">
            A plausible explanation is not necessarily a validated biological mechanism. A missing publication in a
            search result does not establish a research gap. An association does not demonstrate causality.
          </p>
          <p className="ed-lead ed-lead-secondary">HSI is being developed around these distinctions.</p>
          <div className="ed-actions">
            <Link className="ed-button" to="/science">
              Explore our scientific approach <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
          </div>
        </div>
        <LandingVisual kind="knowledge" priority />
      </header>
      <section className="ed-approach">
        <div className="ed-approach-heading">
          <p className="ed-kicker">Our scientific principles</p>
          <h2>
            Distinctions that
            <br />
            <em>keep research honest.</em>
          </h2>
        </div>
        <ol className="ed-approach-grid">
          {principles.map(([title, text], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="ed-intro">
        <p className="ed-kicker">Development and validation status</p>
        <h2>
          Engineering readiness is not
          <br />
          <em>scientific performance.</em>
        </h2>
        <div>
          <p>
            HSI is an evolving research platform. Some capabilities are implemented, while others remain under scientific
            validation, data-access review or operational testing. We distinguish engineering readiness from demonstrated
            scientific performance.
          </p>
          <p>
            HSI supports research investigation and educational exploration. It does not diagnose, prescribe or confirm
            trial eligibility. Integrity checks establish which content was used; they do not establish scientific truth.
          </p>
        </div>
      </section>
      <section className="ed-research-section">
        <p className="ed-kicker">Evidence states</p>
        <h2>Understand the finding.</h2>
        <EvidenceLegend />
      </section>
    </div>
  );
}

export function Pricing() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Research access</p>
          <h1>
            Start with the question.
            <br />
            <em>Find the right access path.</em>
          </h1>
          <p className="ed-lead">
            Explore public science, create a research account or discuss collaboration. Account creation does not grant
            research write or reviewer permissions.
          </p>
        </div>
      </header>
      <section className="ed-approach">
        <ol className="ed-approach-grid">
          {[
            ["Explore the science", "Browse educational biology and the draft knowledge graph without an account.", "/science", "Explore science"],
            ["Research workspace", "Verify email and wait for provisioned research permissions before governed tools.", "/contact", "Collaborate"],
            ["Platform overview", "Understand the connected investigation environment and honesty boundaries.", "/platform", "Explore the Platform"],
          ].map(([title, text, to, cta], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link className="ed-text-link" to={to}>
                {cta} <span aria-hidden="true"><ArrowIcon direction="right" /></span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="ed-scope-line">
          Research access is permissioned. Registration does not automatically grant source access or reviewer authority.
        </p>
      </section>
    </div>
  );
}

export function Contact() {
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero ed-home-hero-visual">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Collaborate</p>
          <h1>
            Discuss a research
            <br />
            <em>collaboration.</em>
          </h1>
          <p className="ed-lead">
            Create your HSI account to begin the access process, or reach out about evaluating connected evidence in real
            research decisions. Researcher, source and scientific-review permissions are provisioned independently.
          </p>
          <div className="ed-actions">
            <Link className="ed-button" to="/sign-up">
              Create an account <span aria-hidden="true"><ArrowIcon /></span>
            </Link>
            <Link className="ed-text-link" to="/sign-in">
              Sign in <span aria-hidden="true"><ArrowIcon direction="right" /></span>
            </Link>
          </div>
        </div>
        <LandingVisual kind="network" priority />
      </header>
      <section className="ed-intro">
        <p className="ed-kicker">Getting started</p>
        <h2>
          One account.
          <br />
          <em>Clear responsibilities.</em>
        </h2>
        <div>
          <ol className="ed-plain-list ed-numbered-plain">
            <li>Register with your email and complete verification through the configured authentication provider.</li>
            <li>An administrator provisions the appropriate permissions for research tools.</li>
            <li>Once access is confirmed, open the research workspace to create or reopen a source-bound investigation.</li>
          </ol>
          <Link className="ed-text-link" to="/research/account">
            Check your research account <span aria-hidden="true"><ArrowIcon direction="right" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export function Community() {
  const [topic, setTopic] = useState<string>(DISCUSSION_TOPICS[0]!.id);
  const [comments, setComments] = useState<LocalResearchComment[]>([]);
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [parent, setParent] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const selected = DISCUSSION_TOPICS.find((t) => t.id === topic)!;
  const visible = comments.filter((c) => c.topicId === topic);
  function add(e: FormEvent) {
    e.preventDefault();
    try {
      setComments(
        addLocalResearchComment(comments, {topicId: topic, text, sourceUrl: source, parentId: parent}),
      );
      setText("");
      setSource("");
      setParent(null);
      setMessage("Added to this local discussion rehearsal. Nothing has been published or saved to a server.");
    } catch {
      setMessage(
        "Use 12–1,000 characters of non-identifying research discussion and an optional public research-source URL. No clinical records or credentials.",
      );
    }
  }
  return (
    <div className="ed-home ed-subpage">
      <header className="ed-home-hero">
        <div className="ed-hero-copy">
          <p className="ed-kicker">Community</p>
          <h1>
            Better questions.
            <br />
            <em>More careful conversations.</em>
          </h1>
          <p className="ed-lead">
            An evidence-led discussion rehearsal for challenging context and preparing review. Public posting and private
            research groups are not enabled.
          </p>
        </div>
      </header>
      <section className="ed-research-section">
        <div className="xp-community">
          <nav aria-label="Research discussion topics">
            {DISCUSSION_TOPICS.map((t) => (
              <button
                type="button"
                key={t.id}
                aria-pressed={topic === t.id}
                onClick={() => {
                  setTopic(t.id);
                  setParent(null);
                  setMessage("");
                }}
              >
                {t.title}
              </button>
            ))}
          </nav>
          <div>
            <span className="xp-badge xp-badge-slate">Local rehearsal · not published</span>
            <h3>{selected.title}</h3>
            <p>{selected.prompt}</p>
            <p>
              Drafts stay in this tab&apos;s memory and clear on reload. References are links to inspect, not verified
              support.
            </p>
            {visible.length === 0 && (
              <p className="xp-empty">No local comments yet. Add a research question or a source-context challenge below.</p>
            )}
            {visible.map((c) => (
              <article className="xp-comment" key={c.id}>
                <p className="xp-eyebrow">
                  LOCAL PARTICIPANT / UNREVIEWED {c.parentId ? " / REPLY" : ""}
                </p>
                <p>{c.text}</p>
                {c.sourceUrl && (
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Inspect attached source reference ↗
                  </a>
                )}
                <div className="xp-comment-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setParent(c.id);
                      document.getElementById("community-comment")?.focus();
                    }}
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setComments(comments.map((x) => (x.id === c.id ? {...x, flagged: !x.flagged} : x)))
                    }
                  >
                    {c.flagged ? "Remove local flag" : "Flag for review"}
                  </button>
                </div>
                {c.flagged && <p>Flagged locally. No moderator has been notified.</p>}
              </article>
            ))}
            <form className="xp-form" onSubmit={add}>
              <label htmlFor="community-comment">
                {parent ? "Reply to " + parent : "Research question or claim challenge"}
              </label>
              <textarea
                id="community-comment"
                required
                minLength={12}
                maxLength={1000}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <label htmlFor="community-source">Optional source URL</label>
              <input
                id="community-source"
                type="url"
                maxLength={2000}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="https://pubmed.ncbi.nlm.nih.gov/…"
              />
              <p className="xp-small">
                PubMed, Europe PMC, DOI, Reactome or ClinicalTrials.gov. No personal medical advice or identifying health
                data.
              </p>
              <button className="ed-button" type="submit" disabled={comments.length >= 30}>
                Add local comment
              </button>
              {parent && (
                <button type="button" className="ed-text-link" onClick={() => setParent(null)}>
                  Cancel reply
                </button>
              )}
            </form>
            {message && <p role="status">{message}</p>}
            <div className="ed-actions">
              <button
                className="ed-button"
                type="button"
                disabled={!comments.length}
                onClick={() =>
                  downloadText(
                    JSON.stringify(exportLocalResearchDiscussion(comments), null, 2) + "\n",
                    "hsi-local-research-discussion.json",
                  )
                }
              >
                Export discussion draft
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
