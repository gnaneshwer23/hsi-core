import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type LandingMaturityLevel =
  | "available"
  | "restricted"
  | "demonstration"
  | "planned";

const MATURITY_LABEL: Record<LandingMaturityLevel, string> = {
  available: "Available",
  restricted: "Restricted",
  demonstration: "Demonstration",
  planned: "Planned",
};

/** Transparent maturity chip for demos and future features. */
export function LandingMaturityLabel({
  level,
}: {
  level: LandingMaturityLevel;
}) {
  return (
    <span className="s2-maturity" data-level={level}>
      {MATURITY_LABEL[level]}
    </span>
  );
}

export function LandingHero({
  eyebrow,
  title,
  description,
  children,
  id = "page-title",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <header className="s2-hero">
      <div className="s2-wrap">
        {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
        <h1 id={id}>{title}</h1>
        <p className="s2-lead">{description}</p>
        {children ? <div className="s2-cta-row">{children}</div> : null}
      </div>
    </header>
  );
}

export function LandingSection({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="s2-section s2-landing">
      <div className="s2-wrap">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function LandingEvidenceCard({
  title,
  body,
  maturity = "demonstration",
}: {
  title: string;
  body: string;
  maturity?: LandingMaturityLevel;
}) {
  return (
    <article className="s2-card-evidence">
      <LandingMaturityLabel level={maturity} />
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

export function LandingPrimaryCta({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="s2-btn" to={to}>
      {children}
    </Link>
  );
}

export function LandingSecondaryCta({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="s2-btn s2-btn-secondary" to={to}>
      {children}
    </Link>
  );
}

export function LandingPage({ children }: { children: ReactNode }) {
  return <div className="s2-landing">{children}</div>;
}
