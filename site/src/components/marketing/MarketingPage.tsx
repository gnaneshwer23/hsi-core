import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  PUBLIC_PLATFORM_CTA,
  PUBLIC_PRIMARY_CTA,
  PUBLIC_SECONDARY_CTA,
} from "../../lib/ctaPolicy";

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

export type JourneyLink = { to: string; label: string; note?: string };

/** Shared marketing page root — premium homepage tokens + optional xp bridge for legacy sections. */
export function MarketingPage({
  children,
  className = "",
  bridgeExperience = true,
}: {
  children: ReactNode;
  className?: string;
  bridgeExperience?: boolean;
}) {
  return (
    <div className={`mp-page cl-page${bridgeExperience ? " xp-page" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

export function MarketingHero({
  eyebrow,
  title,
  emphasis,
  description,
  children,
  visual,
  id = "page-title",
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  description: string;
  children?: ReactNode;
  visual?: ReactNode;
  id?: string;
}) {
  return (
    <header className="mp-hero cl-hero">
      <div className={`mp-hero-frame${visual ? " mp-hero-frame-split" : ""}`}>
        <div className="mp-hero-copy">
          <p className="mp-eyebrow">
            <span aria-hidden="true" />
            Human Super Intelligence / {eyebrow}
          </p>
          <h1 id={id}>
            {title}
            {emphasis ? (
              <>
                <br />
                <em>{emphasis}</em>
              </>
            ) : null}
          </h1>
          <p className="mp-lead">{description}</p>
          {children}
        </div>
        {visual ? <div className="mp-hero-visual">{visual}</div> : null}
      </div>
    </header>
  );
}

export function MarketingSection({
  kicker,
  title,
  description,
  children,
  dark = false,
  id,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: ReactNode;
  dark?: boolean;
  id?: string;
}) {
  const cleanKicker = kicker.replace(/^\d+\s*\/\s*/, "");
  return (
    <section id={id} className={`mp-section cl-chapter${dark ? " mp-section-dark" : ""}`}>
      <div className="mp-wrap cl-chapter-inner">
        <div className="mp-section-heading">
          <div>
            <p className="mp-eyebrow">{cleanKicker}</p>
            <h2>{title}</h2>
          </div>
          {description ? <p className="cl-chapter-lead">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Closing CTA band — always real destinations from ctaPolicy. */
export function MarketingCTA({
  title = "Connecting human biology. Advancing scientific discovery.",
  body = "Explore how source context, living knowledge-graph relationships, contradictions, gaps and independent review connect in the research workflow.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="mp-cta cl-cta cl-chapter cl-chapter-cta" aria-labelledby="mp-cta-title">
      <div className="cl-chapter-inner">
        <p className="mp-eyebrow mp-eyebrow-on-deep">Human Super Intelligence</p>
        <h2 id="mp-cta-title">{title}</h2>
        <p>{body}</p>
        <div className="cl-actions">
          <Link className="cl-arrow-link cl-arrow-link-solid" to={PUBLIC_PRIMARY_CTA.to}>
            {PUBLIC_PRIMARY_CTA.label} <Arrow />
          </Link>
          <Link className="cl-text-link cl-text-link-on-deep" to={PUBLIC_PLATFORM_CTA.to}>
            {PUBLIC_PLATFORM_CTA.label}
          </Link>
          <Link className="cl-text-link cl-text-link-on-deep" to={PUBLIC_SECONDARY_CTA.to}>
            {PUBLIC_SECONDARY_CTA.label}
          </Link>
        </div>
        <p className="mp-cta-honesty" role="note">
          For research use. Clinical decisions belong with qualified professionals in the appropriate care setting.
        </p>
      </div>
    </section>
  );
}

/** Related-page strip — one job: connect the journey without inventing destinations. */
export function MarketingJourney({
  title = "Continue the journey",
  links,
}: {
  title?: string;
  links: readonly JourneyLink[];
}) {
  if (!links.length) return null;
  return (
    <nav className="mp-journey cl-chapter" aria-label={title}>
      <div className="mp-wrap cl-chapter-inner">
        <p className="mp-eyebrow">{title}</p>
        <ul className="mp-journey-list">
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>
                <span>{link.label}</span>
                {link.note ? <small>{link.note}</small> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function MarketingActions({ children }: { children: ReactNode }) {
  return <div className="mp-actions cl-actions">{children}</div>;
}

export function MarketingButton({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      className={secondary ? "cl-text-link" : "cl-arrow-link cl-arrow-link-solid"}
      to={to}
    >
      {children}
      {secondary ? null : <Arrow />}
    </Link>
  );
}

/** Canonical related links for the five primary destinations + evidence/contact. */
export const JOURNEY_BY_PATH: Record<string, JourneyLink[]> = {
  "/platform": [
    { to: "/science", label: "Science", note: "Biology entry" },
    { to: "/how-it-works", label: "How it works", note: "Investigation steps" },
    { to: "/modules", label: "Modules", note: "Four products" },
    { to: "/technology", label: "Technology", note: "Architecture" },
    { to: "/contact", label: "Research access", note: "Research collaboration" },
  ],
  "/research": [
    { to: "/how-it-works", label: "How it works", note: "Workflow" },
    { to: "/evidence-safety", label: "Evidence & safety", note: "Integrity" },
    { to: "/science", label: "Science", note: "Biology context" },
    { to: "/platform", label: "Platform", note: "Shared technology" },
    { to: "/contact", label: "Research access", note: "Browser draft only" },
  ],
  "/modules": [
    { to: "/platform", label: "Platform", note: "Shared foundation" },
    { to: "/solutions", label: "Solutions", note: "Who it serves" },
    { to: "/science", label: "Science", note: "Biology" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/science": [
    { to: "/science/body", label: "Human body", note: "Educational explorer" },
    { to: "/science/graph", label: "Knowledge graph", note: "Relationships" },
    { to: "/research", label: "Research", note: "Investigations" },
    { to: "/how-it-works", label: "How it works", note: "Workflow" },
    { to: "/evidence-safety", label: "Evidence & safety", note: "Boundaries" },
  ],
  "/how-it-works": [
    { to: "/research", label: "Research", note: "Investigation narrative" },
    { to: "/platform", label: "Platform", note: "Capabilities" },
    { to: "/evidence-safety", label: "Evidence & safety", note: "Integrity" },
    { to: "/demo", label: "Illustrative walkthrough", note: "Guided story" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/solutions": [
    { to: "/research", label: "Research", note: "Investigations" },
    { to: "/modules", label: "Modules", note: "Products" },
    { to: "/platform", label: "Platform", note: "Technology" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/technology": [
    { to: "/platform", label: "Platform", note: "Product view" },
    { to: "/science", label: "Science", note: "Biology" },
    { to: "/modules", label: "Modules", note: "Ecosystem" },
    { to: "/how-it-works", label: "How it works", note: "Workflow" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/evidence-safety": [
    { to: "/how-it-works", label: "How it works", note: "Workflow" },
    { to: "/research", label: "Research", note: "Investigations" },
    { to: "/science", label: "Science", note: "Biology" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/pricing": [
    { to: "/science", label: "Explore science", note: "No account needed" },
    { to: "/contact", label: "Research access", note: "Does not grant writes" },
    { to: "/platform", label: "Platform", note: "Shared technology" },
    { to: "/how-it-works", label: "How it works", note: "Workflow" },
  ],
  "/contact": [
    { to: "/evidence-safety", label: "Evidence & safety", note: "Boundaries" },
    { to: "/research", label: "Research", note: "What access enables" },
    { to: "/platform", label: "Platform", note: "Technology" },
    { to: "/how-it-works", label: "How it works", note: "Workflow" },
  ],
  "/modules/aksh-health": [
    { to: "/modules", label: "All modules", note: "Ecosystem" },
    { to: "/platform", label: "Platform", note: "Shared technology" },
    { to: "/evidence-safety", label: "Evidence & safety", note: "Data boundaries" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/modules/clinical": [
    { to: "/modules", label: "All modules", note: "Ecosystem" },
    { to: "/platform", label: "Platform", note: "Shared technology" },
    { to: "/evidence-safety", label: "Evidence & safety", note: "Boundaries" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/modules/isi": [
    { to: "/modules", label: "All modules", note: "Ecosystem" },
    { to: "/research", label: "Research at HSI", note: "Investigations" },
    { to: "/science", label: "Science", note: "Biology" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
  "/modules/trials": [
    { to: "/modules", label: "All modules", note: "Ecosystem" },
    { to: "/evidence-safety", label: "Evidence & safety", note: "Boundaries" },
    { to: "/solutions", label: "Solutions", note: "Who it serves" },
    { to: "/contact", label: "Research access", note: "Collaboration" },
  ],
};
