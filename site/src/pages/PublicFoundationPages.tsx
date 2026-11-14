import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BiologyDomains,
  CandidateMechanism,
  GovernanceChain,
  Maturity,
  PlatformLayers,
  PublicAction,
  PublicHero,
  PublicSection,
  ResearchBriefPreview,
  ResearchWorkflow,
} from "../components/public/ResearchPublic";
import { PublicNotices } from "../components/public/PublicNotices";
export function PlatformPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="The intelligence behind connected biomedical research."
        description="Understand how HSI connects evidence, biological relationships, contextual reasoning and scientific governance."
      >
        <PublicAction to="/research">Explore the Research Workflow</PublicAction>
      </PublicHero>
      <PublicSection
        title="Connect the work without losing its evidence."
        description="A shared foundation joins the research experience to governed biological knowledge and permitted source material."
      >
        <PlatformLayers />
      </PublicSection>
      <PublicSection
        title="Context belongs in every scientific relationship."
        description="The knowledge graph is infrastructure for a research question—not a substitute for the source or a validated mechanism."
      >
        <div className="hsi-principles">
          {[
            {
              title: "Governed evidence",
              text: "Ingestion must preserve source identity, version, passage and permitted actions. Corrections and retractions require versioned re-review.",
            },
            {
              title: "Context-aware investigation",
              text: "Species, tissue, cell state, intervention, dose, timing, assay and estimand determine whether findings can be compared.",
            },
            {
              title: "Independent scrutiny",
              text: "Claim verification, uncertainty and human scientific review remain distinct from automated retrieval or model agreement.",
            },
          ].map((s) => (
            <article key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <PublicAction to="/evidence-intelligence">Inspect Evidence Intelligence</PublicAction>
      </PublicSection>
      <PublicSection
        title="Three core roles. One accountable investigation."
        description="The orchestrator coordinates scope and budgets; the evidence/context investigator gathers and compares; the scientific verifier checks support and uncertainty."
        dark
      >
        <GovernanceChain />
        <p><Link to="/intelligence">Meet the Intelligence Collective →</Link> — proposed specialist capabilities, responsibilities and current maturity.</p>
        <p>
          Specialist biological tools support these roles. An optional planner remains restricted until an
          independently reviewed comparison demonstrates benefit. More agents are not a substitute for better
          evidence.
        </p>
      </PublicSection>
      <PublicSection
        title="Interoperable research. Separate responsibilities."
        description="The scientific, clinical, patient-reported and study-related capabilities retain their own governance, data and interfaces."
      >
        <p>
          The shared foundation connects governed research artifacts, not patient-record transfers. Scientific
          research does not depend on a live care system. No live matching, eligibility confirmation or
          enrolment is offered here.
        </p>
        <p>
          Engineering preparation, deployment success and scientific validation are different states. Live
          provider operations, source rights, staging isolation and independent scientific acceptance remain
          separately gated.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/applications">Explore Applications</PublicAction>
          <PublicAction to="/connected-intelligence" secondary>
            See how capabilities connect
          </PublicAction>
          <PublicAction to="/trust" secondary>
            Review the Boundaries
          </PublicAction>
        </div>
      </PublicSection>
    </div>
  );
}
export function ResearchPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="One workspace for deeper scientific investigation."
        description="Move from a biological question to source-linked mechanisms, research gaps and a reviewable decision brief."
      >
        <div className="hsi-actions">
          <PublicAction to="/research#research-walkthrough">Explore an Investigation</PublicAction>
          <PublicAction to="/sign-in" secondary>
            Research Sign In
          </PublicAction>
        </div>
      </PublicHero>
      <PublicSection
        id="research-walkthrough"
        title="Keep one question at the centre."
        description="Evidence retrieval, mechanism investigation, context comparison and independent verification should contribute to the same versioned research outcome."
      >
        <ResearchWorkflow />
      </PublicSection>
      <PublicSection
        title="Follow a concrete research question."
        description="What evidence connects T follicular helper cells, IL-21 signalling and B-cell responses in systemic sclerosis?"
      >
        <div className="hsi-example-layout">
          <div>
            <Maturity children={"Demonstration"} />
            <p>
              Illustrative SSc research question. This is an initial validation example, not the product
              boundary or a completed independent validation.
            </p>
            <p>
              Retrieve permitted support and opposing evidence. Extract the experimental conditions, align the
              estimand, identify unresolved links and state what should be investigated next.
            </p>
            <PublicAction to="/research/investigate">
              Open the Existing Illustrative Investigation
            </PublicAction>
          </div>
          <CandidateMechanism />
        </div>
      </PublicSection>
      <PublicSection
        title="A disagreement belongs in the outcome."
        description="Investigate alternatives and research gaps without smoothing away conflict or claiming that an empty search establishes consensus."
        dark
      >
        <div className="hsi-actions">
          <PublicAction to="/context-conflict-audit">Explore the Context-Conflict Audit</PublicAction>
          <PublicAction to="/evidence-intelligence" secondary>
            Inspect the Evidence
          </PublicAction>
        </div>
        <p>
          Proposed hypotheses and experiments remain unvalidated. Every material conclusion in an actual brief
          requires passage-linked evidence, source permission and review.
        </p>
      </PublicSection>
      <PublicSection
        title="Prepare a brief another scientist can challenge."
        description="Question, provenance, mechanism, context, uncertainty, gaps, next experiments and independent review status stay together."
      >
        <ResearchBriefPreview />
        <div className="hsi-actions">
          <PublicAction to="/research-briefs">Examine the Research Brief</PublicAction>
          <PublicAction to="/contact" secondary>
            Request Research Access
          </PublicAction>
        </div>
        <p>
          Public examples are demonstrations. Authenticated saved research, source/model operations and
          reviewer scopes require separately verified access. A website account does not grant those
          permissions.
        </p>
      </PublicSection>
    </div>
  );
}
const levels = [
  {
    name: "Organs & tissues",
    examples: "Skin, lung and connective tissue",
    detail: "Sampling location and tissue compartment constrain what a result can explain.",
  },
  {
    name: "Cells & states",
    examples: "Tfh cells and B-cell states",
    detail: "Cell identity, activation, abundance and measurement are different aspects of the evidence.",
  },
  {
    name: "Molecules & pathways",
    examples: "IL-21, receptor context and signalling",
    detail: "Expression, engagement and demonstrated downstream mechanism must be distinguished.",
  },
  {
    name: "Processes & disease",
    examples: "Immune responses, fibrosis and SSc",
    detail: "Associations across scales remain candidate relationships until supported in context.",
  },
];
function BiologicalScales() {
  const [active, setActive] = useState(0);
  return (
    <div className="hsi-scale-explorer">
      <div role="group" aria-label="Explore biological scales">
        {levels.map((l, n) => (
          <button key={l.name} aria-pressed={active === n} onClick={() => setActive(n)}>
            <span>{l.name}</span>
            <small>{l.examples}</small>
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <h3>{levels[active]!.name}</h3>
        <p>{levels[active]!.detail}</p>
        <CandidateMechanism />
        <p>Illustrative candidate links connect scales; they do not establish a causal disease mechanism.</p>
      </div>
    </div>
  );
}
export function SciencePublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="Explore the biological context behind disease mechanisms."
        description="Connect cells, tissues, pathways, diseases, evidence and experimental conditions while preserving scientific uncertainty."
      >
        <PublicAction to="/science#biological-connections">Explore Biological Connections</PublicAction>
      </PublicHero>
      <PublicSection
        id="biological-connections"
        title="Move between scales. Keep the context."
        description="A molecular observation in one cell system cannot silently become a claim about an organ or a disease."
      >
        <BiologicalScales />
      </PublicSection>
      <PublicSection
        title="Cross-domain questions need explicit boundaries."
        description="Immune responses interact with microbial, metabolic, neural and molecular systems. Evidence quality and coverage are unequal across those domains."
      >
        <BiologyDomains />
      </PublicSection>
      <PublicSection
        title="Explore the graph as an investigator."
        description="Follow candidate connections, inspect the evidence state and keep missing support visible."
        dark
      >
        <div className="hsi-actions">
          <PublicAction to="/science/graph">Open the Biological Graph Explorer</PublicAction>
          <PublicAction to="/science/body" secondary>
            Explore Organ and Tissue Context
          </PublicAction>
        </div>
        <p>
          These are educational and research demonstrations, not a validated causal or clinical graph. Source
          catalogues are not evidence clearance.
        </p>
      </PublicSection>
      <PublicSection
        title="Turn a connection into a question worth testing."
        description="Ask which experimental systems, sources and observations would support or challenge the relationship."
      >
        <div className="hsi-actions">
          <PublicAction to="/context-conflict-audit">Examine Comparability</PublicAction>
          <PublicAction to="/research" secondary>
            Follow the Research Workflow
          </PublicAction>
        </div>
      </PublicSection>
    </div>
  );
}
export function ApplicationsPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="One research foundation. Three connected applications."
        description="Explore biomedical discovery, clinical research intelligence and trial/translational research—with maturity clearly identified."
      >
        <PublicAction to="/applications#research-applications">Explore Applications</PublicAction>
      </PublicHero>
      <PublicSection
        id="research-applications"
        title="Start with the research decision."
        description="The near-term wedge is evidence-grounded mechanism investigation. Longer-term applications retain distinct responsibilities."
      >
        <div className="hsi-application-scenarios">
          <article>
            <Maturity children={"Demonstration"} />
            <h3>Biomedical discovery</h3>
            <p>
              Two experimental papers report different effects. Inspect the biological context, compare the
              estimand and identify the evidence that would resolve the disagreement.
            </p>
            <p>
              Public instruments demonstrate the workflow. Authorised live research and independently
              validated performance remain restricted.
            </p>
            <Link className="hsi-text-link" to="/context-conflict-audit">
              Compare the observations
            </Link>
          </article>
          <article>
            <Maturity children={"Planned"} />
            <h3>Clinical research intelligence</h3>
            <p>
              A research team wants to understand a longitudinal study outcome. The intended application
              connects authorised research context with biological evidence, under separately governed data
              access.
            </p>
            <p>
              No live patient-level integration, clinical decision support or hospital record feed is offered
              here.
            </p>
            <Link className="hsi-text-link" to="/connected-intelligence">
              Inspect the clinical context boundary
            </Link>
          </article>
          <article>
            <Maturity children={"Restricted"} />
            <h3>Trial and translational intelligence</h3>
            <p>
              Investigate how a biological claim relates to trial metadata, biomarkers, study design and
              translational uncertainty. Registry metadata is research context, not efficacy evidence.
            </p>
            <p>
              Governed metadata attachment has engineering support. Live matching, eligibility confirmation
              and enrolment are not available.
            </p>
            <Link className="hsi-text-link" to="/connected-intelligence">
              Inspect study intelligence scope
            </Link>
          </article>
        </div>
      </PublicSection>
      <PublicSection
        title="Shared foundations do not erase data boundaries."
        description="The clinical, patient-reported and study-related capabilities are independently governed."
        dark
      >
        <p>
          HSI’s public research experience does not ingest private care records. Source rights, investigator
          access and independent review remain purpose-specific.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/platform">Explore the Platform</PublicAction>
          <PublicAction to="/trust" secondary>
            Understand the Governance
          </PublicAction>
        </div>
      </PublicSection>
      <PublicSection
        title="Discuss the question before the integration."
        description="Start with biological scope, source permissions, expected research output and the evidence needed to evaluate it."
      >
        <PublicAction to="/contact">Prepare a Research Access Enquiry</PublicAction>
        <p>The contact page saves a browser-only draft. It does not send an application or confirm access.</p>
      </PublicSection>
    </div>
  );
}
export function TrustPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="No silent promotion."
        description="An extracted statement is not an approved fact. An AI-generated relationship is not a validated mechanism."
      >
        <PublicAction to="/trust#scientific-governance">Understand Our Approach</PublicAction>
      </PublicHero>
      <PublicSection
        id="scientific-governance"
        title="Every change in certainty needs a reason."
        description="Evidence, computational inference, unvalidated hypothesis, independent assessment and publication approval are different states."
      >
        <GovernanceChain />
        <div className="hsi-trust-statements">
          <p>A missing search result is not proof that evidence does not exist.</p>
          <p>Model agreement is not independent scientific validation.</p>
          <p>Human review and graph publication require separate governance.</p>
        </div>
      </PublicSection>
      <PublicSection
        title="Permission and provenance are part of the science."
        description="A source title, a model response or a merged change is not a substitute for current, independently verified evidence."
      >
        <div className="hsi-principles">
          {[
            {
              title: "Source use",
              text: "Bind permitted actions, attribution and current identity/retraction state to the exact passage and version. Unknown or revoked clearance blocks the relevant use.",
            },
            {
              title: "Scoped review",
              text: "Independent reviewers assess immutable versions within explicit expertise and authority. Self-review and wrong-scope decisions are denied.",
            },
            {
              title: "Honest uncertainty",
              text: "Preserve missing context, failed/empty searches and unsupported causal bridges. Do not report a bounded demonstration as cross-domain readiness.",
            },
          ].map((s) => (
            <article key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </PublicSection>
      <PublicSection
        title="Implementation is not independent validation."
        description="The 120-case immunology protocol is an authoring and evaluation framework. It is not 120 expert-adjudicated scientific results."
        dark
      >
        <p>
          External source/provider operation, researcher isolation, real scientific gold, independent results
          and operational release evidence require their own acceptance. Public examples do not run live
          models or enable research writes.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/status">Read the Capability Status</PublicAction>
          <PublicAction to="/evidence-intelligence" secondary>
            Inspect Evidence Intelligence
          </PublicAction>
        </div>
      </PublicSection>
      <PublicNotices />
    </div>
  );
}
export function AboutPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="Building a more connected understanding of human health."
        description="Connect scientific evidence, biological context and human judgement so researchers can understand what is known, what conflicts and what to investigate next."
      >
        <PublicAction to="/about#collaboration">Connect With HSI</PublicAction>
      </PublicHero>
      <PublicSection
        title="Biology crosses disciplines. Research should be able to follow."
        description="HSI exists to help investigators connect fragmented publications, experiments and biological relationships without losing context or uncertainty."
      >
        <p>
          The long-term vision spans human biology, biomedical discovery, clinical research and translational
          intelligence. The initial research focus is understanding evidence conflict and preparing testable,
          reviewable research decisions.
        </p>
        <p>
          Systemic sclerosis is a validation example, not the platform boundary. Broad scientific coverage
          must be earned through independently evaluated evidence and scoped expertise.
        </p>
        <CandidateMechanism />
      </PublicSection>
      <PublicSection
        title="Evidence first. Human scientific responsibility."
        description="Scientific ownership is identified as Dr. Gnaneshwer Jadav. Independent domain reviewers, security and operational release authorities remain distinct roles."
      >
        <p>
          No institutional affiliations, research partnerships, expert appointments or clinical readiness are
          claimed without evidence. Public demonstrations are not completed source-cleared investigations.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/trust">Our Scientific Principles</PublicAction>
          <PublicAction to="/applications" secondary>
            Research Applications
          </PublicAction>
        </div>
      </PublicSection>
      <PublicSection
        id="collaboration"
        title="Build the evidence with us."
        description="We are preparing independent expert review across immunology, disease mechanisms, experimental context and evidence methodology."
        dark
      >
        <p>
          Expert recruitment, compensation, confidentiality and a restricted review workspace require separate
          agreement. No expert panel or institution is represented as recruited or approved.
        </p>
        <p>
          For collaboration, begin with your research scope and relevant expertise. Do not send unpublished
          case material, patient data, private benchmark answers or credentials through a public
          demonstration.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/contact">Connect With HSI</PublicAction>
          <PublicAction to="/research">Explore the Research Workflow</PublicAction>
        </div>
        <p>The contact page prepares a local browser draft; no message or access request is delivered.</p>
      </PublicSection>
    </div>
  );
}
