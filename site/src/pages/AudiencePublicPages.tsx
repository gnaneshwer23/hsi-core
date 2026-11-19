/**
 * Public audience pages: Researchers (Stage 2 PR3), Biotech, Validation.
 * Honesty: no fake metrics, no live CDS, no invented pilots or gold-standard claims.
 */
import { Link } from "react-router-dom";
import {
  PublicAction,
  PublicHero,
  PublicSection,
} from "../components/public/ResearchPublic";
import { PublicNotices } from "../components/public/PublicNotices";
import {
  LandingEvidenceCard,
  LandingHero,
  LandingPage,
  LandingPrimaryCta,
  LandingSecondaryCta,
  LandingSection,
} from "../components/landing/LandingPrimitives";
import "../styles/stage2-landing.css";

const RESEARCHER_CAPABILITIES = [
  {
    title: "Live public literature retrieval",
    body: "Europe PMC, OpenAlex and Open Targets can be queried for curated scenarios. Abstracts are not redistributed; licence and reuse stay unassessed until checked.",
    maturity: "available" as const,
  },
  {
    title: "Evidence Context Passport",
    body: "Tissue, dose, species and assay fields stay Not stated or Not extracted when the abstract does not carry them. Absence is not invented.",
    maturity: "available" as const,
  },
  {
    title: "Context-aware disagreement",
    body: "Compare findings by experimental context before treating them as contradiction. Incompatible contexts produce an abstention, not a forced narrative.",
    maturity: "available" as const,
  },
  {
    title: "Two-model directional checks",
    body: "When configured, two models challenge direction on a passage. Agreement is not scientific proof; unverified independence is stated.",
    maturity: "restricted" as const,
  },
  {
    title: "Reviewable research brief",
    body: "Export a structured brief that preserves limitations. Briefs are not auto-approved graph updates.",
    maturity: "available" as const,
  },
  {
    title: "On-device hypotheses and gaps",
    body: "Many personal ledgers stay in this browser until a server store is enabled under fail-closed gates.",
    maturity: "restricted" as const,
  },
] as const;

export function ResearchersPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        eyebrow="Researchers"
        title="Personal scientific intelligence — with context, not just citations."
        description="HSI connects published evidence to experimental context and uncertainty so you can see what is known, what conflicts, and what to investigate next — without treating a model answer as approved biology."
      >
        <LandingPrimaryCta to="/welcome">Apply for the research preview</LandingPrimaryCta>
        <LandingSecondaryCta to="/how-it-works">Explore Platform</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="What a research investigation looks like."
        description="One path from a question through evidence, relationships and a brief — with missing context kept explicit."
      >
        <ol className="s2-flow-list" aria-label="Researcher investigation path">
          <li>
            <h3>Frame the question</h3>
            <p>Match genes, cells, diseases and interventions to concepts on the published graph.</p>
          </li>
          <li>
            <h3>Retrieve permitted evidence</h3>
            <p>Query configured public sources with a trace of what ran and what failed.</p>
          </li>
          <li>
            <h3>Compare experimental context</h3>
            <p>Separate genuine disagreement from differences in model, tissue, dose or endpoint.</p>
          </li>
          <li>
            <h3>Leave a reviewable brief</h3>
            <p>State what is supported, what is missing and what a human reviewer must still decide.</p>
          </li>
        </ol>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/research/workspace">Open the investigation workspace</LandingPrimaryCta>
          <LandingSecondaryCta to="/knowledge-graph">Explore the knowledge graph</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Capabilities you can inspect today."
        description="Each item links to a real surface. Maturity labels distinguish available tools from restricted or demonstration features."
      >
        <div className="s2-card-grid">
          {RESEARCHER_CAPABILITIES.map((c) => (
            <LandingEvidenceCard
              key={c.title}
              title={c.title}
              body={c.body}
              maturity={c.maturity}
            />
          ))}
        </div>
        <p className="s2-section-note">
          Related tools:{" "}
          <Link to="/context-conflict-audit">Context-Conflict Audit</Link>
          {" · "}
          <Link to="/evidence-intelligence">Evidence intelligence</Link>
          {" · "}
          <Link to="/research/gaps">Gap Register</Link>
        </p>
      </LandingSection>

      <LandingSection
        title="What this preview is not."
        description="Registration does not grant research writes. Graph edges remain candidates until human review. Nothing here is clinical advice."
      >
        <p className="s2-prose">
          Preferences and many saved runs stay on this device until a server store is enabled under fail-closed
          gates. Dual-provider verification and adjudicated gold sets require separate acceptance.
        </p>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Request research access</LandingPrimaryCta>
          <LandingSecondaryCta to="/trust">Read governance boundaries</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

export function BiotechPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="Assess R&D evidence with provenance you can inspect."
        description="For biotech and translational teams, HSI keeps source, experimental context and review status attached to each candidate relationship — so disagreement can be checked before it becomes a decision narrative."
      >
        <PublicAction to="/contact">Discuss a research pilot</PublicAction>
        <PublicAction to="/evidence-intelligence" secondary>
          Inspect Evidence Intelligence
        </PublicAction>
        <PublicAction to="/enterprise/biotech" secondary>
          Open R&D dashboard preview
        </PublicAction>
      </PublicHero>
      <PublicSection
        title="Where HSI helps an R&D workflow."
        description="Presentation labels for capabilities that already exist as research surfaces — not separate products or guaranteed outcomes."
      >
        <div className="hsi-principles">
          {[
            {
              title: "Evidence Intelligence",
              text: "Inspect source provenance, passage-linked context and missing fields before interpreting a claim.",
            },
            {
              title: "Mechanism Explorer",
              text: "Traverse candidate graph relationships with disease and department filters. Approved edges remain rare by design.",
            },
            {
              title: "Scientific Verification",
              text: "Directional checks and review queues stay separate from graph publication. No auto-approve path.",
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
        title="Pilot discussions stay honest."
        description="Contact prepares a browser draft and, when configured, can notify the HSI operator. No MoU, partnership or performance claim is implied by this page."
        dark
      >
        <p>
          Do not send patient data, unpublished case material or credentials through a public form. Pilot scope,
          data-sharing and review authority are agreed separately.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/contact">Contact HSI</PublicAction>
          <PublicAction to="/validation" secondary>
            Read validation methodology
          </PublicAction>
        </div>
      </PublicSection>
      <PublicNotices />
    </div>
  );
}

export function ValidationPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="How evidence quality is separated from approval."
        description="Validation here means methodology and governance: how HSI keeps observation, interpretation, verification and publication apart. It is not a claim that HSI outperforms peers or that gold standards are complete."
      >
        <PublicAction to="/validation#methodology">View methodology</PublicAction>
        <PublicAction to="/trust" secondary>
          Full trust and governance
        </PublicAction>
      </PublicHero>
      <PublicSection
        id="methodology"
        title="Methodology, not scoreboard."
        description="Benchmarks, conflict labels and evaluation harnesses exist as frameworks. Public pages never invent accuracy percentages or adjudicated case counts."
      >
        <div className="hsi-principles">
          {[
            {
              title: "States stay separate",
              text: "Study observation, computational interpretation, independent verification, scientific review and publication are different states with recorded transitions.",
            },
            {
              title: "Context before contradiction",
              text: "Opposite findings under different tissue, species or assay are not collapsed into proven contradiction without human review.",
            },
            {
              title: "Gold sets are human-gated",
              text: "Expert-adjudicated cases require recruited reviewers and private vaults. A protocol is not 120 completed scientific results.",
            },
          ].map((s) => (
            <article key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <div className="hsi-actions">
          <PublicAction to="/how-it-works">See what runs today</PublicAction>
          <PublicAction to="/context-conflict-audit" secondary>
            Open Context-Conflict Audit
          </PublicAction>
        </div>
      </PublicSection>
      <PublicSection
        title="Synthetic lab is a different surface."
        description="The research tool at /research/validation holds synthetic patient fixtures for workflow rehearsal. It is not this public methodology page and not clinical validation."
        dark
      >
        <p>
          Small-group suppression, synthetic-only gates and audit trails there demonstrate controls — they do not
          enrol real people or establish disease prevalence.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/trust">Governance model</PublicAction>
          <PublicAction to="/contact" secondary>
            Ask about evaluation scope
          </PublicAction>
        </div>
      </PublicSection>
      <PublicNotices />
    </div>
  );
}
