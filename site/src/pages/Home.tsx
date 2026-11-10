import { useState } from "react";
import { Link } from "react-router-dom";
import { HomeBiologyNetwork } from "../components/editorial/HomeBiologyNetwork";
import { HomeHero } from "../components/editorial/HomeHero";
import {
  CROSS_DOMAIN_JOURNEY_ENTRIES,
  contactAccessHref,
  homeDemoHref,
  withResearchContext,
} from "../lib/researchContext";

const MODULES = [
  { name: "Aksh Health", role: "Patient intelligence", text: "Everyday health context stays in its own permission boundary." },
  { name: "HSI Clinical", role: "Longitudinal context", text: "Authorised history is reviewed with the gaps left visible." },
  { name: "Immune Super Intelligence", role: "Scientific discovery", text: "ISI investigates mechanisms without depending on the patient module." },
  { name: "HSI Trials", role: "Governed pre-screening", text: "A planned module. Live matching and enrolment are not offered." },
] as const;

const STEPS = [
  { n: "01", title: "Understand", text: "Parse the question into biological entities and the disease context that must stay distinct." },
  { n: "02", title: "Retrieve", text: "Collect source-linked evidence. A missing source stays missing." },
  { n: "03", title: "Connect", text: "Trace candidate mechanisms across the Living Health Knowledge Graph." },
  { n: "04", title: "Evaluate", text: "Separate association, computational inference, and established evidence." },
  { n: "05", title: "Gaps", text: "Name contradictions and the information the record does not contain." },
  { n: "06", title: "Hypotheses", text: "Label every new proposal as unvalidated." },
  { n: "07", title: "Research brief", text: "Write an evidence-linked brief for a person to review." },
  { n: "08", title: "Reviewed knowledge", text: "Only an approved review can version the graph that later questions read." },
] as const;

const DIFFERENT = [
  { title: "Connected biology", text: "Immune, nervous, microbiome, metabolic and molecular context stay on one graph." },
  { title: "Evidence-traced claims", text: "A statement keeps its source, or it is not presented as evidence." },
  { title: "Living reviewed graph", text: "The knowledge graph changes only through a versioned human review." },
  { title: "Contradiction and gap discovery", text: "Opposing findings and missing measurements stay attached to the question." },
  { title: "Human scientific governance", text: "People approve, reject, or leave a claim unreviewed. Nothing auto-approves." },
  { title: "Patient-data barrier", text: "Private clinical information does not auto-enter the research knowledge graph." },
  { title: "Translation toward trials", text: "Study criteria can be inspected. Eligibility is never confirmed here." },
] as const;

const LIFECYCLE = ["Patient context", "Clinical history", "Research question", "Trial criteria", "Discovery hypothesis"] as const;

export function Home() {
  const [step, setStep] = useState(0);
  const active = STEPS[step] ?? STEPS[0];
  return (
    <div className="cl-page">
      <HomeHero />
      <HomeBiologyNetwork />

      <section className="cl-mission cl-chapter" aria-labelledby="mission-title">
        <h2 id="mission-title">Investigate biological mechanisms across human systems.</h2>
        <p>
          Human Super Intelligence connects <strong>patient context</strong>, <strong>clinical history</strong>,{" "}
          <strong>scientific evidence</strong> and <strong>trial questions</strong> without copying private records
          into research. The graph records provenance, uncertainty and review state. An illustrative question can be
          followed through the walkthrough. This is not a clinical service and not a commercial product.
        </p>
      </section>

      <section className="cl-modules cl-chapter cl-chapter-instrument" aria-labelledby="modules-title">
        <div className="cl-chapter-inner">
          <h2 id="modules-title">One platform. Four governed modules.</h2>
          <p className="cl-chapter-lead">
            Independently governed products share one Living Health Knowledge Graph. Coverage across domains is unequal
            by design.
          </p>
          <ol className="cl-module-list">
            {MODULES.map((item, index) => (
              <li key={item.name}>
                <span className="cl-module-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="cl-module-role">{item.role}</p>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cl-different cl-chapter" aria-labelledby="different-title">
        <h2 id="different-title">What makes HSI different</h2>
        <ul className="cl-different-list">
          {DIFFERENT.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="cl-steps cl-chapter" id="product-demo" aria-labelledby="steps-title">
        <div className="cl-steps-intro">
          <h2 id="steps-title">How an investigation proceeds</h2>
          <p>
            Eight steps through an illustrative research workbench. New proposals stay unvalidated until a person
            reviews them. Coverage is illustrative, not a completed literature review.
          </p>
          <p className="cl-step-detail" aria-live="polite">
            <strong>
              {active.n} {active.title}.
            </strong>{" "}
            {active.text}
          </p>
        </div>
        <div className="cl-step-grid" role="group" aria-label="Investigation steps">
          {STEPS.map((item, index) => (
            <button
              key={item.n}
              type="button"
              aria-pressed={index === step}
              onClick={() => setStep(index)}
            >
              <span>{item.n}</span>
              {item.title}
            </button>
          ))}
        </div>
      </section>

      <section className="cl-journeys cl-chapter" aria-labelledby="journeys-title">
        <h2 id="journeys-title">Start from a real question</h2>
        <p className="cl-chapter-lead">
          Explore biology, review evidence framing, then request research access — each path stays labelled
          live_backend=false.
        </p>
        <ul className="cl-journey-list">
          {CROSS_DOMAIN_JOURNEY_ENTRIES.map((journey) => (
            <li key={journey.id}>
              <h3>{journey.label}</h3>
              <p className="cl-journey-meta">
                scenario={journey.scenarioId} · domain={journey.domain} · live_backend=false
              </p>
              <div className="cl-journey-actions">
                <Link
                  to={homeDemoHref({
                    scenarioId: journey.scenarioId,
                    panel: "mechanism",
                    domain: journey.domain,
                  })}
                >
                  Investigate
                </Link>
                <Link
                  to={withResearchContext(journey.exploreTo, {
                    domain: journey.domain,
                    scenario: journey.scenarioId,
                  })}
                >
                  Explore Biology
                </Link>
                <Link
                  to={withResearchContext(journey.evidenceTo, {
                    domain: journey.domain,
                    scenario: journey.scenarioId,
                  })}
                >
                  Evidence
                </Link>
                <Link to={contactAccessHref({ scenarioId: journey.scenarioId, domain: journey.domain })}>
                  Access
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="cl-life cl-chapter" aria-labelledby="life-title">
        <h2 id="life-title">From a question to a governed handoff</h2>
        <div className="cl-life-track" aria-hidden="true">
          <div className="cl-life-marquee">
            {[...LIFECYCLE, ...LIFECYCLE].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
        <ol className="cl-life-list">
          {LIFECYCLE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="cl-limits cl-chapter" aria-labelledby="limits-title">
        <h2 id="limits-title">What HSI does not do</h2>
        <ul>
          <li>Diagnose disease or recommend treatment</li>
          <li>Claim clinical validation, regulatory approval, or commercial availability</li>
          <li>Treat association as a causal mechanism</li>
          <li>Confirm trial eligibility</li>
          <li>Let private clinical information auto-enter the research graph</li>
        </ul>
        <p>
          Private clinical information does not auto-enter the research knowledge graph. Evidence, contradictions and
          gaps stay visible. Human review stays required.
        </p>
      </section>

      <section className="cl-cta cl-chapter cl-chapter-cta" aria-labelledby="cta-title">
        <div className="cl-chapter-inner">
          <h2 id="cta-title">Advance research through connected scientific intelligence.</h2>
          <p>
            HSI is developing an evidence-grounded environment for researchers investigating complex human biology.
            Request access, or explore how the platform works.
          </p>
          <div className="cl-actions">
            <Link className="cl-arrow-link cl-arrow-link-solid" to="/contact">
              Request Research Access <Arrow />
            </Link>
            <Link className="cl-text-link cl-text-link-on-deep" to="/how-it-works">
              Explore How HSI Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

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
