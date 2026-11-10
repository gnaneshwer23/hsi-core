/**
 * Optimised homepage imagery — responsive `<picture>` sources.
 * Alt text stays scientific; assets are illustrative compositions, not clinical photos.
 */

export const HERO_ALT_MOBILE =
  "Scientific illustration of a translucent human figure showing interconnected biological systems, including the nervous system, internal organs, DNA structures, and immune cells, in a soft ivory and burgundy palette.";

export const HERO_ALT_DESKTOP =
  "Panoramic scientific illustration of a translucent human anatomy network with organ systems, neural pathways, and multi-scale biological domain nodes on an ivory background.";

export const BIOLOGY_NETWORK_ALT =
  "Wide scientific illustration of luminous interconnected human biology spanning immune, neural, microbial, metabolic, and molecular systems.";

export const homepageHeroMobileSources = {
  webpSrcSet:
    "/images/homepage/hero-mobile-portrait-768.webp 768w, /images/homepage/hero-mobile-portrait-1200.webp 1200w",
  jpegSrcSet:
    "/images/homepage/hero-mobile-portrait-768.jpg 768w, /images/homepage/hero-mobile-portrait-1200.jpg 1200w",
  fallback: "/images/homepage/hero-mobile-portrait-1200.jpg",
  width: 576,
  height: 1024,
} as const;

export const homepageHeroDesktopSources = {
  webpSrcSet:
    "/images/homepage/hero-desktop-panorama-1024.webp 1024w, /images/homepage/hero-desktop-panorama-1600.webp 1600w",
  jpegSrcSet:
    "/images/homepage/hero-desktop-panorama-1024.jpg 1024w, /images/homepage/hero-desktop-panorama-1600.jpg 1600w",
  fallback: "/images/homepage/hero-desktop-panorama-1600.jpg",
  width: 1024,
  height: 576,
} as const;

export const homepageBiologyNetworkSources = {
  webpSrcSet:
    "/images/homepage/biology-network-1024.webp 1024w, /images/homepage/biology-network-1600.webp 1600w",
  jpegSrcSet:
    "/images/homepage/biology-network-1024.jpg 1024w, /images/homepage/biology-network-1600.jpg 1600w",
  fallback: "/images/homepage/biology-network-1600.jpg",
  width: 1024,
  height: 576,
} as const;
