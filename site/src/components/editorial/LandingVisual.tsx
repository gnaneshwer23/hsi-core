import type {ReactNode} from "react";
import {LANDING_VISUALS, type LandingVisualKey} from "../../lib/landingVisuals";

type Props = {
  kind: LandingVisualKey;
  priority?: boolean;
  className?: string;
  caption?: string;
};

/** Dominant section / hero visual using approved reference stills. */
export function LandingVisual({kind, priority = false, className = "", caption}: Props) {
  const visual = LANDING_VISUALS[kind];
  return (
    <figure className={`ed-landing-visual ${className}`.trim()}>
      <img
        src={visual.src}
        alt={visual.alt}
        width={1600}
        height={900}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
      <figcaption>{caption ?? visual.caption}</figcaption>
    </figure>
  );
}

type BleedProps = {
  kind: LandingVisualKey;
  eyebrow: string;
  title: string;
  children: ReactNode;
  cta?: ReactNode;
};

/** Full-bleed dark visual band for mid-page anchors inside cream editorial pages. */
export function LandingBleedBand({kind, eyebrow, title, children, cta}: BleedProps) {
  const visual = LANDING_VISUALS[kind];
  return (
    <section className="ed-bleed-band" aria-labelledby="ed-bleed-title">
      <img className="ed-bleed-band-media" src={visual.src} alt="" width={1600} height={900} loading="lazy" decoding="async" />
      <div className="ed-bleed-band-copy">
        <p className="ed-kicker ed-kicker-on-dark">{eyebrow}</p>
        <h2 id="ed-bleed-title">{title}</h2>
        <div className="ed-bleed-band-body">{children}</div>
        {cta}
      </div>
    </section>
  );
}
