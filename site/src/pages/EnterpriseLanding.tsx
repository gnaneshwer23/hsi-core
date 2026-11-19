import { Link } from "react-router-dom";
import {
  LandingEvidenceCard,
  LandingHero,
  LandingPage,
  LandingPrimaryCta,
  LandingSecondaryCta,
  LandingSection,
} from "../components/landing/LandingPrimitives";
import "../styles/stage2-landing.css";

/**
 * Research Groups marketing landing (Stage 2 PR3).
 * Professor/student shells remain labelled demonstrations — no org writes, no PHI,
 * and supervisors do not auto-access private student work.
 */
export function EnterpriseLandingPage() {
  return (
    <LandingPage>
      <LandingHero
        eyebrow="Research Groups"
        title="Connected research for principal investigators and teams."
        description="Keep questions, evidence, gaps and briefs on one scientific path across a group — while private work stays private until sharing is explicitly enabled under fail-closed gates."
      >
        <LandingPrimaryCta to="/contact">Get Access</LandingPrimaryCta>
        <LandingSecondaryCta to="/research/workspace">Open live investigation</LandingSecondaryCta>
      </LandingHero>

      <LandingSection
        title="What a research group needs from HSI."
        description="Same scientific engine as individual researchers. Group chrome is demonstration-labelled until organisation features are accepted."
      >
        <div className="s2-card-grid">
          <LandingEvidenceCard
            maturity="available"
            title="Shared investigation path"
            body="Question → permitted evidence → experimental context → disagreement → mechanism graph → uncertainty → gaps → reviewable brief."
          />
          <LandingEvidenceCard
            maturity="demonstration"
            title="PI / professor overview"
            body="Group overview, intelligence tree and opportunity radar shells preview how a lead might orient work. Metrics are demonstration data, not institutional truth."
          />
          <LandingEvidenceCard
            maturity="demonstration"
            title="Researcher workspace"
            body="Personal dashboard chrome that deep-links into live investigation tools. Profile persistence stays fail-closed."
          />
          <LandingEvidenceCard
            maturity="planned"
            title="Organisation roles and seats"
            body="Durable organisation tables, seat licensing and confidential science unlocks are not enabled. Roles never become subscriptions that bypass review."
          />
        </div>
      </LandingSection>

      <LandingSection
        title="Demonstration shells you can open."
        description="These previews reuse the shared science engine. They do not enable production writes, PHI or durable group stores."
      >
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
        <div className="s2-cta-row">
          <LandingPrimaryCta to="/research/home">Open research home</LandingPrimaryCta>
          <LandingSecondaryCta to="/research/gaps">Gap Register</LandingSecondaryCta>
        </div>
      </LandingSection>

      <LandingSection
        title="Boundaries that stay in place."
        description="Research Groups marketing is not a separate product and not an organisation control plane."
      >
        <ul className="s2-boundary-list">
          <li>No production organisation writes or durable group tables in this preview.</li>
          <li>No automatic IP bleed between collaborators; Gate C remains human for collaborative reviews.</li>
          <li>No PHI and no live clinical decision support on this scientific plane.</li>
          <li>Other audience shells (biotech, clinical, lab, community) remain separately labelled demonstrations.</li>
        </ul>
        <p className="s2-section-note">
          Related:{" "}
          <Link to="/enterprise/biotech">Biotech shell</Link>
          {" · "}
          <Link to="/enterprise/clinical">Clinical shell</Link>
          {" · "}
          <Link to="/enterprise/lab">Lab shell</Link>
          {" · "}
          <Link to="/enterprise/community">Community shell</Link>
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
