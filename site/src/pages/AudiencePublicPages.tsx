/**
 * Public audience pages: Researchers, Biotech / Clinical / Laboratories / Community, Validation.
 * Honesty: no fake metrics, no live CDS, no invented pilots or gold-standard claims.
 * One process infographic per page — not card grids or layered chrome.
 */
import { Link } from "react-router-dom";
import { PublicNotices } from "../components/public/PublicNotices";
import { AudienceFlowDiagram } from "../components/landing/AudienceFlowDiagram";
import {
  LandingHero,
  LandingPage,
  LandingPrimaryCta,
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
        title="Be a design partner in the investigation, not another reader of citations."
        description="Published evidence, experimental context and uncertainty, in one path you can reopen. A model answer is never treated as approved biology."
        proof={
          <AudienceFlowDiagram
            variant="researchers"
            capabilities={RESEARCHER_CAPS}
            ariaLabel="Researcher investigation path"
          />
        }
      >
        <LandingPrimaryCta to="/contact">Join as a design partner</LandingPrimaryCta>
        <LandingSecondaryCta to="/how-it-works">Open an example investigation</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Continue the investigation."
        description="Open the workspace, graph or audit surfaces that back the path above."
      >
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
        description="Registration does not grant research writes. Private work stays private until sharing is explicitly enabled. Graph edges remain candidates. Nothing here is clinical advice."
      >
        <ul className="s2-boundary-list">
          <li>Many saved runs stay on this device until a server store is enabled.</li>
          <li>Supervisors do not receive automatic access to private student work.</li>
          <li>Dual-provider verification and gold sets require separate acceptance.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Join as a design partner</LandingPrimaryCta>
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
        title="A reproducible investigation for a small R&D team."
        description="For biotech and funded translational groups who need to see what the evidence supports, why two studies disagree, and which question is worth testing next — with the source and context still attached."
        proof={<AudienceFlowDiagram variant="biotech" capabilities={BIOTECH_CAPS} ariaLabel="Biotech R&D flow" />}
      >
        <LandingPrimaryCta to="/contact">Request a pilot conversation</LandingPrimaryCta>
        <LandingSecondaryCta to="/how-it-works">Inspect an example investigation</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Pilot discussions stay honest."
        description="Contact prepares a browser draft. No MoU, partnership or performance claim is implied."
      >
        <ul className="s2-boundary-list">
          <li>Do not send patient data, unpublished case material or credentials through a public form.</li>
          <li>Pilot scope, data-sharing and review authority are agreed separately.</li>
        </ul>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/biotech">Open R&D dashboard preview</LandingPrimaryCta>
          <LandingSecondaryCta to="/context-conflict-audit">Context-Conflict Audit</LandingSecondaryCta>
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
        description="Literature-linked mechanism investigation on the scientific plane. No patient data on this site, no live clinical decision support, and no clinical advice."
        proof={
          <AudienceFlowDiagram variant="clinical" capabilities={CLINICAL_CAPS} ariaLabel="Clinical research flow" />
        }
      >
        <LandingPrimaryCta to="/contact">Discuss clinical research access</LandingPrimaryCta>
        <LandingSecondaryCta to="/trust">Read governance boundaries</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Scientific plane, clinical boundary."
        description="Patient work stays separate. Real patient records are not accepted on this site."
      >
        <ul className="s2-boundary-list">
          <li>No PHI and no live clinical decision support on this scientific plane.</li>
          <li>No patient data on this site. The release gate refuses clinical records.</li>
          <li>Do not submit patient data or credentials through a public form.</li>
        </ul>
        <p className="s2-section-note">
          Related:{" "}
          <Link to="/trust">Trust and governance</Link>
          {" · "}
          <Link to="/trust#validation">Validation methodology</Link>
          {" · "}
          <Link to="/research/prescreen">Trial pre-screen</Link>
        </p>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/enterprise/clinical">Open clinical demo shell</LandingPrimaryCta>
          <LandingSecondaryCta to="/how-it-works">Open an example investigation</LandingSecondaryCta>
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
        proof={
          <AudienceFlowDiagram
            variant="laboratories"
            capabilities={LAB_CAPS}
            ariaLabel="Laboratory investigation flow"
          />
        }
      >
        <LandingPrimaryCta to="/contact">Discuss laboratory access</LandingPrimaryCta>
        <LandingSecondaryCta to="/knowledge-graph">Explore the knowledge graph</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Boundaries for laboratory work."
        description="Assay context stays visible. Private samples and live instruments are not claimed."
      >
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
        proof={
          <AudienceFlowDiagram
            variant="community"
            capabilities={COMMUNITY_CAPS}
            ariaLabel="Community collaboration flow"
          />
        }
      >
        <LandingPrimaryCta to="/contact">Discuss community access</LandingPrimaryCta>
        <LandingSecondaryCta to="/enterprise/community">Open community demo shell</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="What community collaboration means here."
        description="Shared vocabulary for inspectable artefacts. Durable Circles storage is not enabled."
      >
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
          <LandingPrimaryCta to="/contact">Request a pilot conversation</LandingPrimaryCta>
          <LandingSecondaryCta to="/enterprise">Research Groups landing</LandingSecondaryCta>
        </div>
      </LandingSection>

      <PublicNotices />
    </LandingPage>
  );
}

