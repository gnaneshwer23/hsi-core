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
        description="Private work stays private until sharing is explicitly enabled."
      >
        <LandingPrimaryCta to="/researchers">Researchers and design partners</LandingPrimaryCta>
        <LandingSecondaryCta to="/biotech">Biotech teams</LandingSecondaryCta>
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
              <small>Demonstration — links into the investigation tools</small>
            </Link>
          </li>
        </ul>
        <p className="s2-section-note" role="note">
          Supervisors do not receive automatic access to private student work. Sharing requires an explicit,
          governed path that is not enabled in this preview.
        </p>
        <ul className="s2-boundary-list">
          <li>No production organisation writes or durable group tables in this preview.</li>
          <li>No automatic IP bleed. Collaborative scientific review stays with a person.</li>
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
          <LandingPrimaryCta to="/contact">Request a pilot conversation</LandingPrimaryCta>
          <LandingSecondaryCta to="/how-it-works">Open an example investigation</LandingSecondaryCta>
        </div>
      </LandingSection>
    </LandingPage>
  );
}
