/**
 * Public audience pages: Researchers (PR3), Biotech / Clinical / Laboratories (PR4), Validation.
 * Honesty: no fake metrics, no live CDS, no invented pilots or gold-standard claims.
 */
import { Link } from "react-router-dom";
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
        title="Researchers: personal scientific intelligence with context, not just citations."
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
    <LandingPage>
      <LandingHero
        title="Biotech and pharma: assess R&D evidence with provenance you can inspect."
        description="For biotech and translational teams, HSI keeps source, experimental context and review status attached to each candidate relationship — so disagreement can be checked before it becomes a decision narrative."
      >
        <LandingPrimaryCta to="/contact">Discuss a research pilot</LandingPrimaryCta>
        <LandingSecondaryCta to="/evidence-intelligence">Inspect Evidence Intelligence</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Where HSI helps an R&D workflow."
        description="Capabilities that already exist as research surfaces — not separate products or guaranteed outcomes."
      >
        <div className="s2-card-grid">
          <LandingEvidenceCard
            maturity="available"
            title="Evidence Intelligence"
            body="Inspect source provenance, passage-linked context and missing fields before interpreting a claim."
          />
          <LandingEvidenceCard
            maturity="available"
            title="Mechanism Explorer"
            body="Traverse candidate graph relationships with disease and department filters. Approved edges remain rare by design."
          />
          <LandingEvidenceCard
            maturity="restricted"
            title="Scientific Verification"
            body="Directional checks and review queues stay separate from graph publication. No auto-approve path."
          />
          <LandingEvidenceCard
            maturity="demonstration"
            title="R&D dashboard shell"
            body="A labelled demonstration chrome for portfolio orientation. Demo metrics are not pipeline truth."
          />
        </div>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/biotech">Open R&D dashboard preview</LandingPrimaryCta>
          <LandingSecondaryCta to="/context-conflict-audit">Context-Conflict Audit</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Pilot discussions stay honest."
        description="Contact prepares a browser draft and, when configured, can notify the HSI operator. No MoU, partnership or performance claim is implied by this page."
      >
        <p className="s2-prose">
          Do not send patient data, unpublished case material or credentials through a public form. Pilot scope,
          data-sharing and review authority are agreed separately.
        </p>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Contact HSI</LandingPrimaryCta>
          <LandingSecondaryCta to="/validation">Read validation methodology</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

export function ClinicalPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Clinical research: evidence-grounded translation — not clinical decision support."
        description="HSI supports literature-linked mechanism investigation for clinical research programmes. Patient-level work stays on a separate governed plane. This preview uses synthetic patients only; nothing here is live CDS or clinical advice."
      >
        <LandingPrimaryCta to="/contact">Discuss clinical research access</LandingPrimaryCta>
        <LandingSecondaryCta to="/trust">Read governance boundaries</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="What this landing covers."
        description="Translational evidence inspection on the scientific plane — with clinical-plane boundaries stated up front."
      >
        <div className="s2-card-grid">
          <LandingEvidenceCard
            maturity="available"
            title="Literature and mechanism context"
            body="Retrieve permitted public evidence and inspect experimental context before interpreting disagreement."
          />
          <LandingEvidenceCard
            maturity="demonstration"
            title="Clinical research shell"
            body="Synthetic demonstration chrome for cohort and trial-oriented workflows. Not a clinical decision-making tool."
          />
          <LandingEvidenceCard
            maturity="restricted"
            title="Two-plane architecture"
            body="Patient identifiers and records never enter this scientific repository. Enabling real clinical data requires closed gates and explicit owner approval."
          />
          <LandingEvidenceCard
            maturity="planned"
            title="Governed clinical integration"
            body="EHR write-back, live CDS and PHI→LLM paths are out of scope for hsi-core. They are not implied by this page."
          />
        </div>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/clinical">Open clinical demo shell</LandingPrimaryCta>
          <LandingSecondaryCta to="/how-it-works">Explore Platform</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Governance copy that stays visible."
        description="These constraints are product doctrine, not marketing fine print."
      >
        <ul className="s2-boundary-list">
          <li>No PHI and no live clinical decision support on this scientific plane.</li>
          <li>Synthetic patients only in this preview; the release gate refuses non-synthetic clinical data.</li>
          <li>No eligibility claims that hide unknowns; pre-screen surfaces report what is missing.</li>
          <li>Do not submit patient data, case material or credentials through a public form.</li>
        </ul>
        <p className="s2-section-note">
          Related:{" "}
          <Link to="/trust">Trust and governance</Link>
          {" · "}
          <Link to="/validation">Validation methodology</Link>
          {" · "}
          <Link to="/research/prescreen">Trial pre-screen (synthetic)</Link>
        </p>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Request a conversation</LandingPrimaryCta>
          <LandingSecondaryCta to="/biotech">Biotech & Pharma landing</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

export function LaboratoriesPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Laboratories and omics: connect readouts to evidence without inventing QC scores."
        description="HSI helps laboratory and multi-omics teams inspect how assay context, literature and candidate mechanisms relate. Live instruments, private datasets and invented feature counts are not claimed on this page."
      >
        <LandingPrimaryCta to="/contact">Discuss laboratory access</LandingPrimaryCta>
        <LandingSecondaryCta to="/knowledge-graph">Explore the knowledge graph</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="How laboratory work meets the scientific path."
        description="Same investigation spine as other audiences. Omics-specific chrome remains demonstration-labelled."
      >
        <div className="s2-card-grid">
          <LandingEvidenceCard
            maturity="available"
            title="Evidence with assay context"
            body="Keep model, tissue, assay and endpoint fields visible — including Not stated / Not extracted — before interpreting a finding."
          />
          <LandingEvidenceCard
            maturity="available"
            title="Cross-domain mechanism links"
            body="Follow candidate relationships across immunology, metabolism, genomics and tissue biology on the published graph."
          />
          <LandingEvidenceCard
            maturity="demonstration"
            title="Lab / omics dashboard shell"
            body="Demonstration chrome for assay metadata and multi-omics orientation. Demo panels are not live instrument feeds."
          />
          <LandingEvidenceCard
            maturity="planned"
            title="Private dataset integration"
            body="Durable private assay stores and live instrument connectors are not enabled. Nothing here claims real-time QC telemetry."
          />
        </div>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/lab">Open lab demo shell</LandingPrimaryCta>
          <LandingSecondaryCta to="/evidence-intelligence">Evidence intelligence</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="What this page does not claim."
        description="Laboratory marketing must stay honest about instruments, datasets and scores."
      >
        <ul className="s2-boundary-list">
          <li>No live instrument connections or real-time QC dashboards in this preview.</li>
          <li>No invented accuracy percentages, feature counts or validated assay performance claims.</li>
          <li>No automatic promotion of omics candidates into the governed graph.</li>
          <li>Private human samples and PHI remain out of this scientific plane.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Get Access</LandingPrimaryCta>
          <LandingSecondaryCta to="/clinical">Clinical Research landing</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

export function CommunityPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Research community: evidence-grounded discussion without automatic IP bleed."
        description="HSI is built for scientific conversation that keeps source, context and uncertainty attached. Public posting, Circles durable store and automatic sharing of private drafts are not enabled in this preview."
      >
        <LandingPrimaryCta to="/contact">Discuss community access</LandingPrimaryCta>
        <LandingSecondaryCta to="/enterprise/community">Open community demo shell</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="What community collaboration means here."
        description="Same scientific engine as individual investigation. Collaboration features stay demonstration-labelled until Gate C and sharing contracts are accepted."
      >
        <div className="s2-card-grid">
          <LandingEvidenceCard
            maturity="available"
            title="Shared investigation vocabulary"
            body="Questions, evidence, gaps and briefs stay on one path so discussion can point at inspectable artefacts."
          />
          <LandingEvidenceCard
            maturity="demonstration"
            title="Community dashboard shell"
            body="Demonstration chrome for network orientation. Shared challenges are not public by default."
          />
          <LandingEvidenceCard
            maturity="planned"
            title="Circles and durable collaboration"
            body="Durable Circles store remains held. Human Gate C is required for collaborative reviews — nothing auto-publishes."
          />
          <LandingEvidenceCard
            maturity="planned"
            title="Verified participant identity"
            body="Public posting and participant identity verification are not enabled on the retired /community redirect path."
          />
        </div>
        <p className="s2-section-note" role="note">
          The path <code>/community</code> still redirects to the research home. This marketing page is the public
          Community entry — not a revival of that redirect as a discussion product.
        </p>
      </LandingSection>

      <LandingSection
        title="Boundaries that stay in place."
        description="Community marketing must not invent testimonials, member counts or open IP sharing."
      >
        <ul className="s2-boundary-list">
          <li>No automatic IP bleed between collaborators.</li>
          <li>No invented testimonials, member counts or engagement metrics.</li>
          <li>No PHI and no live clinical decision support.</li>
          <li>Gate C remains human for collaborative scientific reviews.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Get Access</LandingPrimaryCta>
          <LandingSecondaryCta to="/enterprise">Research Groups landing</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

export function ValidationPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Validation: how evidence quality is separated from approval."
        description="Validation here means methodology and governance: how HSI keeps observation, interpretation, verification and publication apart. It is not a claim of superiority over peers or that gold standards are complete."
      >
        <LandingPrimaryCta to="/validation#methodology">View methodology</LandingPrimaryCta>
        <LandingSecondaryCta to="/trust">Full trust and governance</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        id="methodology"
        title="Methodology, not scoreboard."
        description="Benchmarks, conflict labels and evaluation harnesses exist as frameworks. Public pages never invent accuracy percentages or adjudicated case counts."
      >
        <div className="s2-card-grid">
          <LandingEvidenceCard
            maturity="available"
            title="States stay separate"
            body="Study observation, computational interpretation, independent verification, scientific review and publication are different states with recorded transitions."
          />
          <LandingEvidenceCard
            maturity="available"
            title="Context before contradiction"
            body="Opposite findings under different tissue, species or assay are not collapsed into proven contradiction without human review."
          />
          <LandingEvidenceCard
            maturity="restricted"
            title="Gold sets are human-gated"
            body="Expert-adjudicated cases require recruited reviewers and private vaults. A protocol is not 120 completed scientific results."
          />
          <LandingEvidenceCard
            maturity="available"
            title="Provenance on every candidate"
            body="Source, experimental context and review status stay attached. Candidate relationships are not scientifically approved by default."
          />
        </div>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/how-it-works">See what runs today</LandingPrimaryCta>
          <LandingSecondaryCta to="/context-conflict-audit">Open Context-Conflict Audit</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Synthetic lab is a different surface."
        description="The research tool at /research/validation holds synthetic patient fixtures for workflow rehearsal. It is not this public methodology page and not clinical validation."
      >
        <p className="s2-prose">
          Small-group suppression, synthetic-only gates and audit trails there demonstrate controls — they do not
          enrol real people or establish disease prevalence.
        </p>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/trust">Governance model</LandingPrimaryCta>
          <LandingSecondaryCta to="/contact">Ask about evaluation scope</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}
