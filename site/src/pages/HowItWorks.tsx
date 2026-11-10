import { HeroArtwork } from "../components/editorial/HeroArtwork";
import { BlueprintSection, ExperienceCTA, ExperienceHero, ExperienceLink, ResearchJourney } from "../components/Experience";
import { EvidenceProcess } from "../components/editorial/Editorial";
import { JOURNEY_BY_PATH, MarketingPage } from "../components/marketing/MarketingPage";

export function HowItWorks() {
  return (
    <MarketingPage>
      <ExperienceHero
        eyebrow="HOW IT WORKS"
        title="Question to brief."
        emphasis="Investigate, do not merely search."
        description="Understand the question, retrieve evidence, connect mechanisms, evaluate support and conflict, surface gaps, label hypotheses, produce a reviewable brief—and feed approved knowledge back to the governed graph. Public walkthroughs stay illustrative until writes are staging-verified."
        visual={<HeroArtwork kind="workflow" />}
      >
        <div className="xp-actions">
          <ExperienceLink to="/contact">Research access</ExperienceLink>
          <ExperienceLink to="/research" secondary>
            Research at HSI
          </ExperienceLink>
        </div>
      </ExperienceHero>

      <BlueprintSection kicker="THE RESEARCH WORKFLOW" title="A connected way to investigate.">
        <ResearchJourney />
      </BlueprintSection>

      <BlueprintSection kicker="FROM INFORMATION TO INTERPRETATION" title="Keep the evidence behind the explanation.">
        <div className="ed-research-grid">
          <EvidenceProcess />
          <div className="ed-reading">
            <h3>A clear question is a better starting point.</h3>
            <p>
              Define the research scope and the context that matters. Inspect sources and represented relationships,
              compare competing explanations and make the missing evidence explicit.
            </p>
            <h3>Another scientist should be able to follow the work.</h3>
            <p>
              Keep the research brief bound to its source versions. Independent review records a decision, its
              limitations and the version examined, so a revision has a clear starting point. Association is not
              causation; human review is not optional.
            </p>
            <div className="xp-actions">
              <ExperienceLink to="/evidence-safety" secondary>
                Evidence &amp; safety
              </ExperienceLink>
              <ExperienceLink to="/platform" secondary>
                Explore the platform
              </ExperienceLink>
            </div>
          </div>
        </div>
      </BlueprintSection>

      <ExperienceCTA journey={JOURNEY_BY_PATH["/how-it-works"]} />
    </MarketingPage>
  );
}
