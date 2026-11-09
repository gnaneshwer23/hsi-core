import { HeroArtwork } from "../components/editorial/HeroArtwork";
import { ExperienceHero, ExperienceLink } from "../components/Experience";

export function ClinicalModule() {
  return (
    <div className="xp-page">
      <ExperienceHero
        eyebrow="HSI CLINICAL"
        title="Longitudinal context."
        emphasis="With the gaps visible."
        description="HSI Clinical is the longitudinal clinical-intelligence module of Human Super Intelligence. Authorised history, missing information and provenance stay inside a purpose-limited boundary."
        visual={<HeroArtwork kind="platform" />}
      >
        <div className="xp-actions">
          <ExperienceLink to="/modules">All modules</ExperienceLink>
          <ExperienceLink to="/evidence-safety" secondary>
            Evidence and safety
          </ExperienceLink>
        </div>
        <p className="ed-scope-line">
          In development. No live hospital connection, bedside decision support or record write-back is offered.
        </p>
      </ExperienceHero>
    </div>
  );
}
