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
          <PublicAction to="/how-it-works" secondary>
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
          <PublicAction to="/how-it-works">See how HSI works</PublicAction>
        </div>
        <p>The contact page prepares a local browser draft; no message or access request is delivered.</p>
      </PublicSection>
    </div>
  );
}
