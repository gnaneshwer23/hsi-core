/**
 * Public audience pages: Researchers, Biotech / Clinical / Laboratories / Community, Validation.
 * Honesty: no fake metrics, no live CDS, no invented pilots or gold-standard claims.
 * Diagram-first: role flow + maturity chips, not essay card grids.
 */
import { Link } from "react-router-dom";
import { PublicNotices } from "../components/public/PublicNotices";
import { AudienceFlowDiagram } from "../components/landing/AudienceFlowDiagram";
import {
  LandingHero,
  LandingPage,
  LandingPrimaryCta,
  LandingProofChrome,
  LandingSecondaryCta,
  LandingSection,
  type LandingMaturityLevel,
} from "../components/landing/LandingPrimitives";
import "../styles/stage2-landing.css";
import "../styles/premium-public.css";

const RESEARCHER_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "Live public literature retrieval", maturity: "available" },
  { title: "Evidence Context Passport", maturity: "available" },
  { title: "Context-aware disagreement", maturity: "available" },
  { title: "Two-model directional checks", maturity: "restricted" },
  { title: "Reviewable research brief", maturity: "available" },
  { title: "On-device hypotheses and gaps", maturity: "restricted" },
];

export function ResearchersPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Researchers: personal scientific intelligence with context, not just citations."
        description="Published evidence, experimental context and uncertainty — without treating a model answer as approved biology."
        proof={
          <LandingProofChrome title="Investigation path" badge="Research preview · candidate-only">
            <AudienceFlowDiagram variant="researchers" ariaLabel="Researcher investigation flow" />
          </LandingProofChrome>
        }
      >
        <LandingPrimaryCta to="/welcome">Apply for the research preview</LandingPrimaryCta>
        <LandingSecondaryCta to="/how-it-works">Explore Platform</LandingSecondaryCta>
      </LandingHero>

      <LandingSection title="What a research investigation looks like.">
        <AudienceFlowDiagram
          variant="researchers"
          capabilities={RESEARCHER_CAPS}
          ariaLabel="Researcher investigation path"
        />
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/research/workspace">Open the investigation workspace</LandingPrimaryCta>
          <LandingSecondaryCta to="/knowledge-graph">Explore the knowledge graph</LandingSecondaryCta>
        </div>
        <p className="s2-section-note">
          Related:{" "}
          <Link to="/context-conflict-audit">Context-Conflict Audit</Link>
          {" · "}
          <Link to="/evidence-intelligence">Evidence intelligence</Link>
          {" · "}
          <Link to="/research/gaps">Gap Register</Link>
        </p>
      </LandingSection>

      <LandingSection
        title="What this preview is not."
        description="Registration does not grant research writes. Graph edges remain candidates. Nothing here is clinical advice."
      >
        <ul className="s2-boundary-list">
          <li>Many saved runs stay on this device until a server store is enabled.</li>
          <li>Dual-provider verification and gold sets require separate acceptance.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Request research access</LandingPrimaryCta>
          <LandingSecondaryCta to="/trust">Read governance boundaries</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

const BIOTECH_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "Evidence Intelligence", maturity: "available" },
  { title: "Mechanism Explorer", maturity: "available" },
  { title: "Scientific Verification", maturity: "restricted" },
  { title: "R&D dashboard shell", maturity: "demonstration" },
];

export function BiotechPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Biotech and pharma: assess R&D evidence with provenance you can inspect."
        description="Source, experimental context and review status stay attached — so disagreement can be checked before it becomes a narrative."
      >
        <LandingPrimaryCta to="/contact">Discuss a research pilot</LandingPrimaryCta>
        <LandingSecondaryCta to="/evidence-intelligence">Inspect Evidence Intelligence</LandingSecondaryCta>
      </LandingHero>

      <LandingSection title="Where HSI helps an R&D workflow.">
        <AudienceFlowDiagram variant="biotech" capabilities={BIOTECH_CAPS} ariaLabel="Biotech R&D flow" />
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/biotech">Open R&D dashboard preview</LandingPrimaryCta>
          <LandingSecondaryCta to="/context-conflict-audit">Context-Conflict Audit</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Pilot discussions stay honest."
        description="Contact prepares a browser draft. No MoU, partnership or performance claim is implied."
      >
        <ul className="s2-boundary-list">
          <li>Do not send patient data, unpublished case material or credentials through a public form.</li>
          <li>Pilot scope, data-sharing and review authority are agreed separately.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Contact HSI</LandingPrimaryCta>
          <LandingSecondaryCta to="/validation">Read validation methodology</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

const CLINICAL_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "Literature and mechanism context", maturity: "available" },
  { title: "Clinical research shell", maturity: "demonstration" },
  { title: "Two-plane architecture", maturity: "restricted" },
  { title: "Governed clinical integration", maturity: "planned" },
];

export function ClinicalPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Clinical research: evidence-grounded translation — not clinical decision support."
        description="Literature-linked mechanism investigation on the scientific plane. Synthetic patients only; no live CDS or clinical advice."
      >
        <LandingPrimaryCta to="/contact">Discuss clinical research access</LandingPrimaryCta>
        <LandingSecondaryCta to="/trust">Read governance boundaries</LandingSecondaryCta>
      </LandingHero>

      <LandingSection title="Scientific plane, clinical boundary.">
        <AudienceFlowDiagram variant="clinical" capabilities={CLINICAL_CAPS} ariaLabel="Clinical research flow" />
        <ul className="s2-boundary-list">
          <li>No PHI and no live clinical decision support on this scientific plane.</li>
          <li>Synthetic patients only; the release gate refuses non-synthetic clinical data.</li>
          <li>Do not submit patient data or credentials through a public form.</li>
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
          <LandingPrimaryCta to="/enterprise/clinical">Open clinical demo shell</LandingPrimaryCta>
          <LandingSecondaryCta to="/how-it-works">Explore Platform</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

const LAB_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "Evidence with assay context", maturity: "available" },
  { title: "Cross-domain mechanism links", maturity: "available" },
  { title: "Lab / omics dashboard shell", maturity: "demonstration" },
  { title: "Private dataset integration", maturity: "planned" },
];

export function LaboratoriesPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Laboratories and omics: connect readouts to evidence without inventing QC scores."
        description="Assay context, literature and candidate mechanisms. Live instruments and private datasets are not claimed here."
      >
        <LandingPrimaryCta to="/contact">Discuss laboratory access</LandingPrimaryCta>
        <LandingSecondaryCta to="/knowledge-graph">Explore the knowledge graph</LandingSecondaryCta>
      </LandingHero>

      <LandingSection title="How laboratory work meets the scientific path.">
        <AudienceFlowDiagram variant="laboratories" capabilities={LAB_CAPS} ariaLabel="Laboratory investigation flow" />
        <ul className="s2-boundary-list">
          <li>No live instrument connections or real-time QC dashboards in this preview.</li>
          <li>No invented accuracy percentages or validated assay performance claims.</li>
          <li>Private human samples and PHI remain out of this scientific plane.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/lab">Open lab demo shell</LandingPrimaryCta>
          <LandingSecondaryCta to="/evidence-intelligence">Evidence intelligence</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

const COMMUNITY_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "Shared investigation vocabulary", maturity: "available" },
  { title: "Community dashboard shell", maturity: "demonstration" },
  { title: "Circles and durable collaboration", maturity: "planned" },
  { title: "Verified participant identity", maturity: "planned" },
];

export function CommunityPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Research community: evidence-grounded discussion without automatic IP bleed."
        description="Scientific conversation with source, context and uncertainty attached. Public posting and Circles durable store are not enabled."
      >
        <LandingPrimaryCta to="/contact">Discuss community access</LandingPrimaryCta>
        <LandingSecondaryCta to="/enterprise/community">Open community demo shell</LandingSecondaryCta>
      </LandingHero>

      <LandingSection title="What community collaboration means here.">
        <AudienceFlowDiagram variant="community" capabilities={COMMUNITY_CAPS} ariaLabel="Community collaboration flow" />
        <p className="s2-section-note" role="note">
          The path <code>/community</code> still redirects to the research home. This page is the public Community
          entry — not a revival of that redirect as a discussion product.
        </p>
        <ul className="s2-boundary-list">
          <li>No automatic IP bleed between collaborators.</li>
          <li>No invented testimonials, member counts or engagement metrics.</li>
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

const VALIDATION_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "States stay separate", maturity: "available" },
  { title: "Context before contradiction", maturity: "available" },
  { title: "Gold sets are human-gated", maturity: "restricted" },
  { title: "Provenance on every candidate", maturity: "available" },
];

export function ValidationPublicPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Validation: how evidence quality is separated from approval."
        description="Methodology and governance — not a claim of superiority, and not that gold standards are complete."
      >
        <LandingPrimaryCta to="/validation#methodology">View methodology</LandingPrimaryCta>
        <LandingSecondaryCta to="/trust">Full trust and governance</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        id="methodology"
        title="Methodology, not scoreboard."
        description="Benchmarks and evaluation harnesses exist as frameworks. Public pages never invent accuracy percentages."
      >
        <AudienceFlowDiagram variant="validation" capabilities={VALIDATION_CAPS} ariaLabel="Validation methodology flow" />
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/how-it-works">See what runs today</LandingPrimaryCta>
          <LandingSecondaryCta to="/context-conflict-audit">Open Context-Conflict Audit</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Synthetic lab is a different surface."
        description="/research/validation holds synthetic fixtures for workflow rehearsal — not this methodology page, and not clinical validation."
      >
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/trust">Governance model</LandingPrimaryCta>
          <LandingSecondaryCta to="/contact">Ask about evaluation scope</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}
