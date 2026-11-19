/**
 * Public audience pages for the Stage 1 IA (PR-E2E-09): Researchers, Biotech, Validation.
 * Honesty: no fake metrics, no live CDS, no invented pilots or gold-standard claims.
 */
import {
  PublicAction,
  PublicHero,
  PublicSection,
} from "../components/public/ResearchPublic";
import { PublicNotices } from "../components/public/PublicNotices";

export function ResearchersPublicPage() {
  return (
    <div className="hsi-public">
      <PublicHero
        title="Built for researchers who need context, not just citations."
        description="HSI connects published evidence to experimental context and uncertainty so you can see what is known, what conflicts, and what to investigate next — without treating a model answer as approved biology."
      >
        <PublicAction to="/welcome">Apply for the research preview</PublicAction>
        <PublicAction to="/how-it-works" secondary>
          See how it works
        </PublicAction>
      </PublicHero>
      <PublicSection
        title="What a research investigation looks like."
        description="One path from a question through evidence, relationships, verification and a brief — with missing context kept explicit."
      >
        <div className="hsi-principles">
          {[
            {
              title: "Ask with live public sources",
              text: "Europe PMC, OpenAlex and Open Targets can be queried for curated scenarios. Abstracts are not redistributed; licence and reuse stay unassessed until checked.",
            },
            {
              title: "Evidence Context Passport",
              text: "Tissue, dose, species and other experimental fields stay Not stated or Not extracted when the abstract does not carry them. Absence is not invented.",
            },
            {
              title: "Two-model checks, labelled honestly",
              text: "When configured, two models challenge direction on a passage. Agreement is not scientific proof; unverified independence is stated.",
            },
          ].map((s) => (
            <article key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <div className="hsi-actions">
          <PublicAction to="/research/workspace">Open the investigation workspace</PublicAction>
          <PublicAction to="/knowledge-graph" secondary>
            Explore the knowledge graph
          </PublicAction>
        </div>
      </PublicSection>
      <PublicSection
        title="What this preview is not."
        description="Registration does not grant research writes. Graph edges remain candidates until human review. Nothing here is clinical advice."
        dark
      >
        <p>
          Preferences and many saved runs stay on this device until a server store is enabled under fail-closed
          gates. Dual-provider verification and adjudicated gold sets require separate acceptance.
        </p>
        <div className="hsi-actions">
          <PublicAction to="/contact">Request research access</PublicAction>
          <PublicAction to="/trust" secondary>
            Read governance boundaries
          </PublicAction>
        </div>
      </PublicSection>
      <PublicNotices />
    </div>
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
