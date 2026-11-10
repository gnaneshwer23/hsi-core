import { HeroArtwork } from "../components/editorial/HeroArtwork";
import { BlueprintSection, ExperienceCTA, ExperienceHero, ExperienceLink } from "../components/Experience";
import { JOURNEY_BY_PATH, MarketingPage } from "../components/marketing/MarketingPage";

export function Science() {
  return (
    <MarketingPage>
      <ExperienceHero
        eyebrow="SCIENCE"
        title="Understand the biology."
        emphasis="Keep asking better questions."
        description="Explore organs, tissues and biological relationships as a starting point for evidence-led research. Context matters at every scale."
        visual={<HeroArtwork kind="science" />}
      >
        <div className="xp-actions">
          <ExperienceLink to="/science/body">Explore the human body</ExperienceLink>
          <ExperienceLink to="/research" secondary>
            Research at HSI
          </ExperienceLink>
        </div>
      </ExperienceHero>

      <BlueprintSection kicker="FROM BIOLOGY TO A RESEARCH QUESTION" title="Look beyond a single system.">
        <div className="ed-principle-rows">
          {(
            [
              ["Human biology", "Move between organs and tissue context in the educational body explorer.", "/science/body"],
              [
                "Connections in context",
                "Explore represented relationships and inspect the evidence state before interpreting a connection.",
                "/science/graph",
              ],
              [
                "Questions worth investigating",
                "Carry a biological question into a source-bound investigation with uncertainty and independent review.",
                "/research",
              ],
            ] as const
          ).map(([title, text, to]) => (
            <article key={title}>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <ExperienceLink to={to} secondary>
                Explore
              </ExperienceLink>
            </article>
          ))}
        </div>
        <p className="ed-scope-line">
          Educational biology and draft relationships are starting points for investigation, not approved scientific
          findings.
        </p>
      </BlueprintSection>

      <BlueprintSection kicker="CONNECTED RESEARCH SURFACE" title="From exploration to a reviewable question.">
        <div className="ed-principle-rows">
          {(
            [
              ["How investigations proceed", "Follow the question → evidence → brief path before opening a workspace.", "/how-it-works"],
              ["Evidence integrity", "Understand source identity, uncertainty and independent review boundaries.", "/evidence-safety"],
              ["Shared platform", "See how evidence, knowledge, investigation and review patterns connect.", "/platform"],
            ] as const
          ).map(([title, text, to]) => (
            <article key={title}>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <ExperienceLink to={to} secondary>
                Continue
              </ExperienceLink>
            </article>
          ))}
        </div>
      </BlueprintSection>

      <ExperienceCTA journey={JOURNEY_BY_PATH["/science"]} />
    </MarketingPage>
  );
}
