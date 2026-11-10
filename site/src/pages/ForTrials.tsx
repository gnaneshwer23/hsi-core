import { HeroArtwork } from "../components/editorial/HeroArtwork";
import { BlueprintSection, ExperienceCTA, ExperienceHero, ExperienceLink } from "../components/Experience";
import { JOURNEY_BY_PATH, MarketingPage } from "../components/marketing/MarketingPage";

export function ForTrials() {
  return (
    <MarketingPage>
      <ExperienceHero
        eyebrow="HSI TRIALS"
        title="A relevant study"
        emphasis="starts with better questions."
        description="The HSI Trials programme focuses on transparent trial research: understanding study context, examining criteria and making the missing information clear."
        visual={<HeroArtwork kind="trials" />}
      >
        <div className="xp-actions">
          <ExperienceLink to="/contact">Research access</ExperienceLink>
          <ExperienceLink to="/evidence-safety" secondary>
            Evidence &amp; safety
          </ExperienceLink>
        </div>
        <p className="ed-scope-line">
          HSI Trials is a planned product. Live matching and enrolment are not currently offered.
        </p>
      </ExperienceHero>
      <BlueprintSection kicker="TRANSPARENT TRIAL RESEARCH" title="Show the basis for relevance.">
        <div className="ed-principle-rows">
          {(
            [
              [
                "Understand the study",
                "Keep the registry record, intervention, population, endpoints and source version in view.",
              ],
              [
                "Examine the criteria",
                "Separate documented criteria from missing, ambiguous or unverified information.",
              ],
              [
                "Keep the investigator in control",
                "Trial relevance is a research question. Eligibility and participation require investigator confirmation and an appropriate clinical process.",
              ],
            ] as const
          ).map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </BlueprintSection>
      <ExperienceCTA journey={JOURNEY_BY_PATH["/modules/trials"]} />
    </MarketingPage>
  );
}
