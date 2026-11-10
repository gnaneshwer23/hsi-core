import { HeroArtwork } from "../components/editorial/HeroArtwork";
import { BlueprintSection, ExperienceCTA, ExperienceHero, ExperienceLink } from "../components/Experience";
import { JOURNEY_BY_PATH, MarketingPage } from "../components/marketing/MarketingPage";

export function ClinicalModule() {
  return (
    <MarketingPage>
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

      <BlueprintSection kicker="INTENDED DIRECTION" title="History you can inspect. Gaps you can see.">
        <div className="ed-principle-rows">
          {(
            [
              [
                "Authorised chronology",
                "Organise encounters, laboratory trends and treatments when integrations are validated and purpose-limited.",
              ],
              [
                "Missing information stays visible",
                "Unknowns, provenance gaps and unverified fields remain explicit for professional review.",
              ],
              [
                "Separate from research PHI barrier",
                "Private clinical information does not automatically enter the research knowledge graph.",
              ],
            ] as const
          ).map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="xp-actions">
          <ExperienceLink to="/platform" secondary>
            Shared platform
          </ExperienceLink>
          <ExperienceLink to="/how-it-works" secondary>
            How it works
          </ExperienceLink>
        </div>
      </BlueprintSection>

      <ExperienceCTA journey={JOURNEY_BY_PATH["/modules/clinical"]} />
    </MarketingPage>
  );
}
