import { Link } from "react-router-dom";
import { PRODUCT_TAGLINE } from "../../lib/brand";
import { PUBLIC_PRIMARY_CTA } from "../../lib/ctaPolicy";
import {
  HERO_ALT_DESKTOP,
  HERO_ALT_MOBILE,
  homepageHeroDesktopSources,
  homepageHeroMobileSources,
} from "../../lib/homepageAssets";
import { DOMAIN_SCENARIO_HINT, withResearchContext } from "../../lib/researchContext";

/** Compact domain entry points — routes mirror discipline / HOME_DOMAINS destinations. */
const HERO_DOMAIN_CHIPS = [
  {
    id: "immunity",
    label: "Immunity",
    to: withResearchContext("/modules/isi", {
      domain: "immunity",
      scenario: DOMAIN_SCENARIO_HINT.immunity,
    }),
  },
  {
    id: "microbiome",
    label: "Microbiome",
    to: withResearchContext("/research/knowledge-graph", {
      domain: "microbiome",
      scenario: DOMAIN_SCENARIO_HINT.microbiome,
    }),
  },
  {
    id: "neurobiology",
    label: "Neurobiology",
    to: "/science/graph?q=neuro",
  },
  {
    id: "metabolism",
    label: "Metabolism",
    to: withResearchContext("/science/body", {
      domain: "clinical",
      scenario: DOMAIN_SCENARIO_HINT.clinical,
    }),
  },
  {
    id: "therapeutics",
    label: "Therapeutics",
    to: withResearchContext("/modules/trials", {
      domain: "trials",
      scenario: DOMAIN_SCENARIO_HINT.trials,
    }),
  },
] as const;

function Arrow() {
  return (
    <span className="cl-arrow" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="16" height="16">
        <path
          d="M4 10h12M11 5l5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Section 1 — brand-first hero; desktop panorama / mobile portrait via `<picture>`. */
export function HomeHero() {
  return (
    <section className="cl-hero cl-chapter cl-hero-premium" aria-labelledby="home-title">
      <div className="cl-hero-frame">
        <div className="cl-hero-copy">
          <p className="cl-brand">Human Super Intelligence</p>
          <p className="cl-tagline">{PRODUCT_TAGLINE}</p>
          <h1 id="home-title">Explore the connections behind human health and disease.</h1>
          <p className="cl-lead">
            Investigate biological mechanisms across human systems — connected evidence, not isolated
            claims.
          </p>
          <nav className="cl-hero-domains" aria-label="Research domains">
            {HERO_DOMAIN_CHIPS.map((chip) => (
              <Link key={chip.id} className="cl-hero-domain" to={chip.to}>
                {chip.label}
              </Link>
            ))}
          </nav>
          <p className="cl-hero-scope">
            Systemic sclerosis is our first scientific investigation — not a product boundary.
          </p>
          <div className="cl-actions">
            <Link className="cl-arrow-link cl-arrow-link-solid" to="/research/investigate">
              See a curated investigation <Arrow />
            </Link>
            <Link className="cl-text-link" to={PUBLIC_PRIMARY_CTA.to}>
              {PUBLIC_PRIMARY_CTA.label}
            </Link>
          </div>
        </div>
        <div className="cl-hero-visual">
          <div className="cl-hero-stage cl-hero-stage-photo">
            <picture className="cl-hero-picture cl-hero-picture-desktop">
              <source
                type="image/webp"
                srcSet={homepageHeroDesktopSources.webpSrcSet}
                sizes="(min-width: 901px) 46vw, 100vw"
              />
              <source
                type="image/jpeg"
                srcSet={homepageHeroDesktopSources.jpegSrcSet}
                sizes="(min-width: 901px) 46vw, 100vw"
              />
              <img
                src={homepageHeroDesktopSources.fallback}
                width={homepageHeroDesktopSources.width}
                height={homepageHeroDesktopSources.height}
                alt={HERO_ALT_DESKTOP}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
            <picture className="cl-hero-picture cl-hero-picture-mobile">
              <source
                type="image/webp"
                srcSet={homepageHeroMobileSources.webpSrcSet}
                sizes="(max-width: 900px) 92vw, 0px"
              />
              <source
                type="image/jpeg"
                srcSet={homepageHeroMobileSources.jpegSrcSet}
                sizes="(max-width: 900px) 92vw, 0px"
              />
              <img
                src={homepageHeroMobileSources.fallback}
                width={homepageHeroMobileSources.width}
                height={homepageHeroMobileSources.height}
                alt={HERO_ALT_MOBILE}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
