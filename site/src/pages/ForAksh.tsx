import { HeroArtwork } from "../components/editorial/HeroArtwork";
import { ArrowIcon } from "../components/ArrowIcon";
import { BlueprintSection, ExperienceCTA, ExperienceHero, ExperienceLink } from "../components/Experience";
import { JOURNEY_BY_PATH, MarketingPage } from "../components/marketing/MarketingPage";

export function ForAksh() {
  let appUrl = "https://www.akshhealth.com/";
  try {
    const u = new URL(import.meta.env.VITE_AKSH_APP_URL ?? appUrl);
    if (u.protocol === "https:" && !u.username && !u.password) appUrl = u.href;
  } catch {
    /* Invalid configuration is not turned into a link. */
  }
  return (
    <MarketingPage>
      <ExperienceHero
        eyebrow="AKSH HEALTH"
        title="Personal health context."
        emphasis="Care in the right setting."
        description="Aksh Health is the separate personal health and care product in the HSI ecosystem, with a scoped diabetes and metabolic-health focus. Its interface, records and clinical decisions remain within Aksh."
        visual={<HeroArtwork kind="aksh" />}
      >
        <div className="xp-actions">
          <a className="xp-button" href={appUrl} target="_blank" rel="noopener noreferrer">
            Visit Aksh Health <span aria-hidden="true"><ArrowIcon /></span>
          </a>
          <ExperienceLink to="/modules" secondary>
            Explore the ecosystem
          </ExperienceLink>
        </div>
      </ExperienceHero>
      <BlueprintSection kicker="01 / DISTINCT RESPONSIBILITIES" title="Shared research technology. Separate care records.">
        <div className="xp-card-grid xp-three">
          {(
            [
              [
                "Everyday context",
                "Personal observations and health trends belong to the appropriate consented product workflow.",
              ],
              [
                "Professional review",
                "Care decisions remain with the authorised product and professionals, inside Aksh’s own clinical boundaries.",
              ],
              [
                "Scoped research exchange",
                "Versioned research artifacts can be consumed without moving patient-identifiable data into HSI.",
              ],
            ] as const
          ).map(([t, d]) => (
            <article className="xp-card" key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </BlueprintSection>
      <BlueprintSection kicker="02 / EXPLORE SAFELY" title="Understand the context before the claim.">
        <div className="xp-actions">
          <ExperienceLink to="/platform">Explore the shared technology</ExperienceLink>
          <ExperienceLink to="/evidence-safety" secondary>
            Understand the data boundaries
          </ExperienceLink>
        </div>
        <p>This HSI site does not retrieve Aksh patient records or provide live clinical decision support.</p>
      </BlueprintSection>
      <ExperienceCTA journey={JOURNEY_BY_PATH["/modules/aksh-health"]} />
    </MarketingPage>
  );
}
