import { Link } from "react-router-dom";
import { PRODUCT_TAGLINE } from "../../lib/brand";
import { PUBLIC_PLATFORM_CTA, PUBLIC_PRIMARY_CTA } from "../../lib/ctaPolicy";
import {
  HERO_ALT_DESKTOP,
  HERO_ALT_MOBILE,
  homepageHeroDesktopSources,
  homepageHeroMobileSources,
} from "../../lib/homepageAssets";

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
            Human Super Intelligence connects biological systems, molecular mechanisms and scientific
            evidence to help researchers investigate complex disease biology and identify new directions
            for discovery.
          </p>
          <p className="cl-supporting">
            From immunity and the microbiome to neurobiology, metabolism and therapeutic
            research—explore human biology as an interconnected system. Disease context is optional.
            Systemic sclerosis is one scientific validation case used to pressure-test the
            substrate — not a product boundary.
          </p>
          <div className="cl-actions">
            <Link className="cl-arrow-link cl-arrow-link-solid" to={PUBLIC_PLATFORM_CTA.to}>
              Explore the Platform <Arrow />
            </Link>
            <Link className="cl-text-link" to={PUBLIC_PRIMARY_CTA.to}>
              Request Research Access
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
