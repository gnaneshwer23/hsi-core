import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  DOMAIN_SCENARIO_HINT,
  homeDemoHref,
  RESEARCH_CONTEXT_KEYS,
  withResearchContext,
} from "../../lib/researchContext";
import {
  BIOLOGY_NETWORK_ALT,
  homepageBiologyNetworkSources,
} from "../../lib/homepageAssets";
import { HOME_DOMAINS, STATUS_LABEL } from "./homeDomains";

/** Deeper ontology labels — narrative only; do not invent graph edges. */
export const DEEPER_BIOLOGY_DOMAINS = [
  "Immunology",
  "Neuroimmunology",
  "Gut microbiome",
  "Metabolism",
  "Genomics and omics",
  "Cellular and molecular biology",
  "Organ physiology",
  "Disease mechanisms",
  "Therapeutics",
  "Clinical and translational research",
] as const;

/** Section 2 — eight-domain taxonomy with context-preserving navigation. */
export function HomeBiologyNetwork() {
  const [params, setParams] = useSearchParams();
  const domainFromUrl = params.get(RESEARCH_CONTEXT_KEYS.domain);
  const initial = HOME_DOMAINS.some((d) => d.id === domainFromUrl) ? domainFromUrl! : "biology";
  const [active, setActiveState] = useState(initial);
  const domain = HOME_DOMAINS.find((d) => d.id === active) ?? HOME_DOMAINS[2]!;
  const connected = new Set(domain.connected);
  const scenarioHint = DOMAIN_SCENARIO_HINT[domain.id];

  function setActive(id: string) {
    setActiveState(id);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(RESEARCH_CONTEXT_KEYS.domain, id);
        return next;
      },
      { replace: true },
    );
  }

  useEffect(() => {
    if (domainFromUrl && HOME_DOMAINS.some((d) => d.id === domainFromUrl)) {
      setActiveState(domainFromUrl);
    }
  }, [domainFromUrl]);

  return (
    <section className="cl-network cl-chapter" aria-labelledby="network-title">
      <div className="cl-chapter-inner cl-network-layout">
        <div className="cl-network-copy">
          <h2 id="network-title">Human biology is connected. Research should be too.</h2>
          <p className="cl-chapter-lead">
            Select a governed research domain. Related systems highlight without inventing scientific
            edges. Navigation keeps domain context for the illustrative demonstration and public tools.
          </p>
          <p className="cl-network-deeper-label">Deeper ontology (illustrative framing)</p>
          <ul className="cl-network-deeper" aria-label="Deeper biological disciplines">
            {DEEPER_BIOLOGY_DOMAINS.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
        <figure className="cl-network-figure">
          <picture>
            <source
              type="image/webp"
              srcSet={homepageBiologyNetworkSources.webpSrcSet}
              sizes="(min-width: 901px) 42vw, 92vw"
            />
            <source
              type="image/jpeg"
              srcSet={homepageBiologyNetworkSources.jpegSrcSet}
              sizes="(min-width: 901px) 42vw, 92vw"
            />
            <img
              src={homepageBiologyNetworkSources.fallback}
              width={homepageBiologyNetworkSources.width}
              height={homepageBiologyNetworkSources.height}
              alt={BIOLOGY_NETWORK_ALT}
              decoding="async"
              loading="lazy"
            />
          </picture>
          <figcaption>Illustrative multi-scale biology composition — not a live graph render.</figcaption>
        </figure>
      </div>
      <div className="cl-chapter-inner cl-network-board">
        <div className="cl-network-chooser" role="toolbar" aria-label="Research domains">
          {HOME_DOMAINS.map((d) => {
            const related = connected.has(d.id);
            return (
              <button
                key={d.id}
                type="button"
                className={
                  "cl-network-domain" +
                  (related && active !== d.id ? " cl-network-domain-related" : "")
                }
                aria-pressed={active === d.id}
                onClick={() => setActive(d.id)}
              >
                <strong>{d.label}</strong>
                <span>{STATUS_LABEL[d.status]}</span>
              </button>
            );
          })}
        </div>
        <article className="cl-network-detail" aria-live="polite">
          <p className="cl-network-status">{STATUS_LABEL[domain.status]}</p>
          <h3>{domain.label}</h3>
          <p>{domain.blurb}</p>
          <p className="cl-network-meta">
            Connected domains (curated links):{" "}
            {domain.connected
              .map((id) => HOME_DOMAINS.find((d) => d.id === id)?.label ?? id)
              .join(" · ")}
          </p>
          <ol className="cl-network-path" aria-label={`${domain.label} illustrative path`}>
            {domain.path.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="cl-network-meta">{domain.visualNote}</p>
          <div className="cl-network-actions">
            <Link to={homeDemoHref({ scenarioId: scenarioHint, domain: domain.id, panel: "mechanism" })}>
              View demonstration
            </Link>
            {domain.to && domain.cta ? (
              <Link
                to={withResearchContext(domain.to, {
                  domain: domain.id,
                  scenario: scenarioHint,
                })}
              >
                {domain.cta}
              </Link>
            ) : (
              <p role="status">No live destination yet — {STATUS_LABEL[domain.status].toLowerCase()}.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
