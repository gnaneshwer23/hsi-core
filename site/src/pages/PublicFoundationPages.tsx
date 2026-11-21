import {
  CandidateMechanism,
  GovernanceChain,
  PublicAction,
  PublicHero,
  PublicSection,
} from "../components/public/ResearchPublic";
import { PublicNotices } from "../components/public/PublicNotices";
export function TrustPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="How HSI separates evidence from approval."
        description="A statement extracted from a paper is not an approved fact, and a relationship proposed by a model is not a validated mechanism. Each moves through separate, recorded steps."
      >
        <PublicAction to="/trust#validation">Read the methodology</PublicAction>
        <PublicAction to="/contact" secondary>
          Request a pilot conversation
        </PublicAction>
      </PublicHero>
      <PublicSection
        id="scientific-governance"
        title="Five states, each change recorded with a reason."
        description="Study observation, computational interpretation, independent verification, scientific review and publication are different states. Nothing moves between them without a recorded decision."
      >
        <GovernanceChain />
        <div className="hsi-trust-statements">
          <p>A missing search result is not proof that evidence does not exist.</p>
          <p>Model agreement is not independent scientific validation.</p>
          <p>Human review and graph publication require separate governance.</p>
        </div>
      </PublicSection>
      <PublicSection
        title="Source permissions and provenance."
        description="A source title, a model answer or a merged change does not replace current, independently verified evidence."
      >
        <div className="hsi-principles">
          {[
            {
              title: "Source use",
              text: "Each use is tied to the exact passage and version, with attribution and the current identity and retraction status. Unknown or revoked clearance blocks that use.",
            },
            {
              title: "Scoped review",
              text: "Independent reviewers assess a fixed version within a stated scope of expertise. Self-review and decisions outside that scope are refused.",
            },
            {
              title: "Honest uncertainty",
              text: "Missing context, failed or empty searches and unsupported causal steps stay visible. A bounded demonstration is not reported as cross-domain readiness.",
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
        id="validation"
        title="Validation is a methodology, not a scoreboard."
        description="Former /validation addresses land here. Benchmarks and evaluation harnesses exist as frameworks. Public pages do not invent accuracy percentages, and expert-labelled gold cases are not claimed."
      >
        <p>
          The workflow-rehearsal surface at /research/validation is a different page. It is not this methodology,
          and it is not clinical validation.
        </p>
        <p>
          HSI is not an NHS service, not a medical device, and not clinical decision support. UK research context
          does not imply an institutional partnership.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/how-it-works">See what runs today</PublicAction>
          <PublicAction to="/contact" secondary>
            Request a pilot conversation
          </PublicAction>
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
          <PublicAction to="/how-it-works">See what runs today</PublicAction>
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
        title="What HSI is for."
        description="HSI helps researchers see what is known, what conflicts and what to investigate next across published biomedical evidence, keeping the experimental context and uncertainty of each finding."
      >
        <PublicAction to="/about#collaboration">Contact HSI</PublicAction>
      </PublicHero>
      <PublicSection
        title="Why it exists."
        description="Publications, experiments and biological relationships are spread across disciplines. HSI connects them and keeps each finding's source, context and review status."
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
        title="Who is responsible."
        description="Scientific ownership is identified as Dr. Gnaneshwer Jadav. Independent domain reviewers, security and operational release authorities remain distinct roles."
      >
        <p>
          No institutional affiliations, research partnerships, expert appointments or clinical readiness are
          claimed without evidence. Public demonstrations are not completed source-cleared investigations.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/trust">Scientific principles</PublicAction>
          <PublicAction to="/how-it-works" secondary>
            What runs today
          </PublicAction>
        </div>
      </PublicSection>
      <PublicSection
        id="collaboration"
        title="Collaboration and expert review."
        description="Independent expert review is being arranged across immunology, disease mechanisms, experimental context and evidence methodology."
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
          <PublicAction to="/contact">Contact HSI</PublicAction>
          <PublicAction to="/how-it-works">See how HSI works</PublicAction>
        </div>
        <p>The contact page prepares a local browser draft; no message or access request is delivered.</p>
      </PublicSection>
    </div>
  );
}
