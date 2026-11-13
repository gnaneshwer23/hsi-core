import { Link } from "react-router-dom";
import { HomeIntelligenceCollective } from "../components/editorial/HomeIntelligenceCollective";
import { withResearchContext } from "../lib/researchContext";
import {
  BiologyDomains,
  CandidateMechanism,
  ContextAuditInstrument,
  GovernanceChain,
  PlatformLayers,
  PublicAction,
  PublicSection,
  ResearchBriefPreview,
  ResearchWorkflow,
} from "../components/public/ResearchPublic";
const problems = [
  { title: "Disconnected evidence", text: "Relevant findings are scattered across sources and formats." },
  {
    title: "Hidden relationships",
    text: "Links between cells, pathways, tissues and diseases are difficult to reconstruct.",
  },
  {
    title: "Conflicting findings",
    text: "Differences in methods and biological context can change interpretation.",
  },
  {
    title: "Unanswered questions",
    text: "Missing evidence and unresolved mechanisms are hard to turn into testable decisions.",
  },
];
export function Home() {
  return (
    <div className="hsi-public hsi-home">
      <section className="hsi-home-hero" aria-labelledby="home-title">
        <picture>
          <source
            srcSet="/images/research/tissue-context-640.webp 640w, /images/research/tissue-context-960.webp 960w, /images/research/tissue-context-1600.webp 1600w"
            sizes="100vw"
            type="image/webp"
          />
          <img
            src="/images/research/tissue-context-1600.webp"
            alt="Conceptual scientific illustration of immune cells in a layered tissue matrix beside a molecular structure; not an experimental image"
            width="1600"
            height="900"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="hsi-hero-shade" />
        <div className="hsi-content hsi-hero-content">
          <p className="hsi-product-name">HUMAN SUPER INTELLIGENCE</p>
          <h1 id="home-title">Understand the connections behind human biology.</h1>
          <p className="hsi-hero-lead">
            Explore biological mechanisms across human systems with evidence you can trace, context you can
            inspect, and uncertainty you can evaluate.
          </p>
          <p>
            HSI connects biomedical research, biological relationships and scientific reasoning to help
            researchers move from fragmented findings toward clearer, testable research decisions.
          </p>
          <div className="hsi-actions">
            <PublicAction to="/research">Explore Scientific Research</PublicAction>
            <PublicAction to="/research" secondary>
              See How It Works
            </PublicAction>
          </div>
          <p className="hsi-hero-note">
            One connected biomedical intelligence platform for evidence-grounded scientific discovery.
          </p>
        </div>
      </section>
      <HomeIntelligenceCollective />
      <PublicSection
        id="fragmented-evidence"
        title="Biology is connected. Its evidence is fragmented."
        description="Biomedical discoveries rarely exist in isolation. Yet research findings are distributed across publications, datasets, experimental models and biological contexts."
      >
        <p>
          Understanding a mechanism means more than finding relevant papers. Researchers need to determine
          which observations are comparable, why results differ and what the evidence actually supports.
        </p>
        <div className="hsi-problem-grid">
          {problems.map((p, n) => (
            <article key={p.title}>
              <svg width="58" height="44" viewBox="0 0 58 44" role="img" aria-label={p.title + " concept"}>
                <path
                  d={
                    n === 0
                      ? "M3 8h18v26H3zM35 3h18v26H35zM24 15h7M24 25h7"
                      : n === 1
                        ? "M8 8 46 34M8 34 46 8M8 8 8 34M46 8v26"
                        : n === 2
                          ? "M4 10h17v13h13V8h20M4 34h20V20h14v14h16"
                          : "M4 30h14V12h14M42 12h12v18H42M30 30h4"
                  }
                  fill="none"
                  stroke="#297e80"
                  strokeWidth="1.5"
                />
                {n === 1 && (
                  <>
                    <circle cx="8" cy="8" r="4" fill="#c8d7d3" />
                    <circle cx="46" cy="34" r="4" fill="#c8d7d3" />
                  </>
                )}
              </svg>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </PublicSection>
      <PublicSection
        id="product-demo"
        title="Turn conflicting evidence into a research decision."
        description="Two studies can report different findings without necessarily contradicting each other."
        dark
      >
        <p>
          HSI’s Context-Conflict Audit is designed to examine the biological and experimental conditions
          behind research findings, distinguish meaningful disagreement from contextual differences and
          identify what remains unresolved.
        </p>
        <ContextAuditInstrument id="home-audit" />
        <PublicAction to="/context-conflict-audit" secondary>
          Explore the Audit
        </PublicAction>
      </PublicSection>
      <PublicSection
        id="investigation-workflow"
        title="From scientific question to research decision."
        description="HSI brings evidence retrieval, biological context, mechanism investigation and scientific verification into one connected workflow."
      >
        <ResearchWorkflow />
        <PublicAction to="/research">Explore the Research Workflow</PublicAction>
      </PublicSection>
      <PublicSection
        title="One biological question. Multiple layers of evidence."
        description="What evidence connects T follicular helper cells, IL-21 signalling and B-cell responses in systemic sclerosis?"
      >
        <div className="hsi-example-layout">
          <div>
            <p className="hsi-small-label">Illustrative research question</p>
            <p>
              Explore how immune-cell states, cytokine signalling, B-cell function and disease-specific
              observations may relate—and where evidence remains incomplete or context-dependent.
            </p>
            <p>
              This is HSI’s initial scientific validation example, not the limit of the platform’s scope.
              Independent validation remains pending. The runnable investigation opens on a cross-domain
              question (gut microbial metabolites and neuroinflammation).
            </p>
            <PublicAction to={withResearchContext("/research/investigate", { question: "gut-neuro", domain: "microbiome" })}>
              Explore the Investigation
            </PublicAction>
          </div>
          <CandidateMechanism />
        </div>
      </PublicSection>
      <PublicSection
        title="A plausible explanation is not a validated mechanism."
        description="HSI is designed to preserve the distinction between what a study reports, what evidence supports, what AI infers and what remains an unvalidated hypothesis."
        dark
      >
        <p>
          Every material scientific conclusion should be traceable to its source, biological context,
          uncertainty and review status.
        </p>
        <div className="hsi-principles">
          {[
            {
              title: "Evidence remains evidence.",
              text: "Extracted observations retain their source and experimental context.",
            },
            {
              title: "Inference remains inference.",
              text: "Computational interpretations are not presented as established scientific facts.",
            },
            {
              title: "Approval requires governance.",
              text: "Independent verification and human review are separate from automated analysis.",
            },
          ].map((p) => (
            <article key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
        <GovernanceChain />
        <PublicAction to="/trust" secondary>
          Explore Scientific Governance
        </PublicAction>
      </PublicSection>
      <PublicSection
        title="From investigation to a research brief you can examine."
        description="Bring the question, evidence, biological mechanism, contextual disagreements, uncertainty and proposed next experiments into one structured research output."
      >
        <div className="hsi-brief-layout">
          <div>
            <p>
              A research brief is not just a summary. It should show the reasoning, supporting sources,
              limitations and decisions that led to its conclusions.
            </p>
            <p>
              The example is illustrative, source-free and not scientifically reviewed. A real brief requires
              source permissions and an independently reviewed investigation.
            </p>
            <PublicAction to="/research-briefs">See an Example Brief</PublicAction>
          </div>
          <ResearchBriefPreview />
        </div>
      </PublicSection>
      <PublicSection
        title="Biology does not happen in isolation."
        description="Disease mechanisms often span immune responses, metabolism, microbial ecosystems, neural signalling and molecular pathways."
      >
        <p>
          HSI is being developed as a cross-domain scientific intelligence foundation, beginning with
          immunology and expanding through independently evaluated biological research areas.
        </p>
        <BiologyDomains />
        <PublicAction to="/science">Explore the Science</PublicAction>
      </PublicSection>
      <PublicSection
        title="One research foundation. Connected scientific intelligence."
        description="HSI brings together evidence, biological knowledge, context-aware investigation and scientific governance through a shared intelligence foundation."
      >
        <p>
          Its knowledge graph connects biological relationships with their provenance and experimental
          conditions. The research experience uses this foundation to explore mechanisms, disagreements and
          testable questions.
        </p>
        <PlatformLayers />
        <PublicAction to="/platform">Explore the Platform</PublicAction>
      </PublicSection>
      <PublicSection
        id="research-access"
        title="See the biology. Question the evidence."
        description="Explore a more connected approach to understanding disease mechanisms and deciding what to investigate next."
        dark
      >
        <div className="hsi-actions">
          <PublicAction to="/contact">Request Research Access</PublicAction>
          <PublicAction to="/context-conflict-audit" secondary>
            Explore the Audit
          </PublicAction>
        </div>
        <p className="hsi-access-note">
          Access is provisioned separately. The contact page prepares a browser-only draft; it does not
          deliver a request.
        </p>
        <Link className="hsi-text-link" to="/trust">
          Research, privacy and governance boundaries
        </Link>
      </PublicSection>
    </div>
  );
}
