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
import "../styles/premium-public.css";

const GROUP_CAPS: { title: string; maturity: LandingMaturityLevel }[] = [
  { title: "Shared investigation path", maturity: "available" },
  { title: "PI / professor overview", maturity: "demonstration" },
  { title: "Researcher workspace", maturity: "demonstration" },
  { title: "Organisation roles and seats", maturity: "planned" },
];

/**
 * Research Groups marketing landing.
 * Professor/student shells remain labelled demonstrations — no org writes, no PHI,
 * and supervisors do not auto-access private student work.
 */
export function EnterpriseLandingPage() {
  return (
    <LandingPage>
      <LandingHero
        title="Research groups: connected work for principal investigators and teams."
        description="Questions, evidence, gaps and briefs on one path — private work stays private until sharing is explicitly enabled."
      >
        <LandingPrimaryCta to="/contact">Get Access</LandingPrimaryCta>
        <LandingSecondaryCta to="/research/workspace">Open live investigation</LandingSecondaryCta>
      </LandingHero>

      <LandingSection title="What a research group needs from HSI.">
        <AudienceFlowDiagram variant="groups" capabilities={GROUP_CAPS} ariaLabel="Research group flow" />
        <ul className="s2-role-list" aria-label="Research group demonstration shells">
          <li>
            <Link to="/enterprise/professor">
              <span>Professor / PI workspace</span>
              <small>Demonstration — private student notes stay inaccessible</small>
            </Link>
          </li>
          <li>
            <Link to="/enterprise/student">
              <span>Student / researcher workspace</span>
              <small>Demonstration — links into live investigation tools</small>
            </Link>
          </li>
        </ul>
        <p className="s2-section-note" role="note">
          Supervisors do not receive automatic access to private student work. Sharing requires an explicit,
          governed path that is not enabled in this preview.
        </p>
        <ul className="s2-boundary-list">
          <li>No production organisation writes or durable group tables in this preview.</li>
          <li>No automatic IP bleed; Gate C remains human for collaborative reviews.</li>
          <li>No PHI and no live clinical decision support on this scientific plane.</li>
        </ul>
        <p className="s2-section-note">
          Related:{" "}
          <Link to="/biotech">Biotech</Link>
          {" · "}
          <Link to="/clinical">Clinical</Link>
          {" · "}
          <Link to="/laboratories">Laboratories</Link>
          {" · "}
          <Link to="/research-community">Community</Link>
          {" · "}
          <Link to="/workspaces">Multi-workspace hub</Link>
        </p>
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/contact">Discuss a group pilot</LandingPrimaryCta>
          <LandingSecondaryCta to="/how-it-works">Explore Platform</LandingSecondaryCta>
        </div>
      </LandingSection>
    </LandingPage>
  );
}
