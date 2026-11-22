/**
 * Public audience pages: Researchers, Biotech / Clinical / Laboratories / Community, Validation.
 * Honesty: no fake metrics, no live CDS, no invented pilots or gold-standard claims.
 * One process infographic per page — not card grids or layered chrome.
 */
import { Link } from "react-router-dom";
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
        title="Spend less time connecting the literature. More time investigating the question."
        description="Whether you are a doctoral researcher, postdoctoral fellow, principal investigator or computational scientist, complex questions often require evidence from multiple scientific fields. HSI aims to bring that evidence and biological context into one research experience."
        proof={
          <AudienceFlowDiagram
            variant="researchers"
            capabilities={RESEARCHER_CAPS}
            ariaLabel="Researcher investigation path"
          />
        }
      >
        <LandingPrimaryCta to="/research/workspace">Explore the Research Workbench</LandingPrimaryCta>
        <LandingSecondaryCta to="/how-it-works">Open an example investigation</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Continue the investigation."
        description="One question. Multiple scientific perspectives. Explore source-linked evidence, candidate biological relationships, contradictions and research briefs."
      >
        <ul className="s2-boundary-list">
          <li>Doctoral researchers: explore the scientific landscape, understand mechanisms and identify potential gaps.</li>
          <li>Postdoctoral fellows: investigate competing findings, develop hypotheses and explore complementary expertise.</li>
          <li>Principal investigators: assess research directions, examine unresolved questions and support evidence-informed project planning.</li>
          <li>Computational and omics researchers: connect molecular findings with biological pathways, experimental context and relevant literature.</li>
        </ul>
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
        description="Research access is provisioned separately; creating an account does not automatically grant access. Registration does not grant research writes. Graph edges remain candidates. Nothing here is clinical advice."
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
        description="See what the evidence supports, why two studies disagree, and which question is worth testing next."
        proof={<AudienceFlowDiagram variant="biotech" capabilities={BIOTECH_CAPS} ariaLabel="Biotech R&D flow" />}
      >
        <LandingPrimaryCta to="/contact">Request a pilot conversation</LandingPrimaryCta>
        <LandingSecondaryCta to="/how-it-works">Inspect an example investigation</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="Questions an R&D team could bring."
        description="Two example questions, shown with what HSI can do with them today and what it cannot. Illustrative, not a validated result."
      >
        <ul className="s2-boundary-list">
          <li><strong>Mechanism:</strong> why do two studies disagree on the role of a cytokine in a cell population? HSI can place the source passages side by side with species, tissue and assay context, and mark where the studies are not comparable. It does not decide which study is right.</li>
          <li><strong>Translational:</strong> which candidate mechanism has the thinnest human evidence? HSI can list recorded gaps and the evidence behind each. Gap detection is deterministic and based on a published snapshot, not a live literature search, and nothing here is a target recommendation.</li>
        </ul>
        <p className="s2-section-note">Every relationship in the published graph is a candidate and none has been scientifically reviewed.</p>
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
          <LandingPrimaryCta to="/enterprise/biotech">Open R&D dashboard preview</LandingPrimaryCta>
          <LandingSecondaryCta to="/context-conflict-audit">Context-Conflict Audit</LandingSecondaryCta>
        </div>
      </LandingSection>

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
        description="No patient data on this site. No live clinical decision support. No clinical advice."
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
        description="Assay context stays visible. Live instruments are not connected."
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
        title="Where it fits a laboratory workflow."
        description="Before an experiment, a lab needs to know what has been measured, in which system and with which assay."
      >
        <ul className="s2-boundary-list">
          <li><strong>Check the context first:</strong> compare published findings by species, tissue, cell state and assay before treating a result as a baseline for your own system.</li>
          <li><strong>Trace a claim to its passage:</strong> follow a candidate relationship back to the source passage and see what the study did and did not test.</li>
          <li><strong>See what is unreplicated:</strong> recorded gaps show where a relationship rests on few sources or one model.</li>
        </ul>
        <p className="s2-section-note">Your own readouts cannot be uploaded in this preview. Private dataset integration is planned, not available.</p>
      </LandingSection>

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
        title="Great science rarely happens in isolation."
        description="The next useful perspective may come from another discipline, institution or laboratory. HSI’s future Research Network aims to connect scientific questions with relevant people, expertise, organisations and verified opportunities. Discussion stays attached to a source. Public posting is not enabled."
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
        title="What a future Research Network could offer."
        description="Planned, not built. No collaborators, institutions or matches are shown because none exist yet."
      >
        <ul className="s2-boundary-list">
          <li><strong>Planned:</strong> finding people whose published work bears on an open question, starting from the evidence rather than a profile.</li>
          <li><strong>Planned:</strong> shared investigations that several researchers can inspect, each keeping private notes private.</li>
          <li><strong>Planned:</strong> verified participant identity, so a contribution can be attributed.</li>
          <li><strong>Not planned:</strong> automatic sharing of anyone&apos;s unpublished work, or ranking people by activity.</li>
        </ul>
        <p className="s2-section-note">Today the Research Network is a design conversation. Joining the conversation does not create an account or a profile.</p>
      </LandingSection>

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

    </LandingPage>
  );
}

