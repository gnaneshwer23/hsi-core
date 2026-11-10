import { useState } from "react";
import { Link } from "react-router-dom";
import { HomeAccess } from "../components/editorial/HomeAccess";
import { HomeEcosystemProducts } from "../components/editorial/HomeEcosystemProducts";
import { HomeHero } from "../components/editorial/HomeHero";
import { HomeIntegrity } from "../components/editorial/HomeIntegrity";
import { HomeIntelligenceFlow } from "../components/editorial/HomeIntelligenceFlow";
import { HomeKnowledgeGraph } from "../components/editorial/HomeKnowledgeGraph";
import { HomeWorkspacePreview } from "../components/editorial/HomeWorkspacePreview";

const STEPS = [
  { n: "01", title: "Define", text: "Frame the scientific question; keep disease context optional but distinct." },
  { n: "02", title: "Retrieve", text: "Collect source-linked evidence. A missing source stays missing." },
  { n: "03", title: "Resolve", text: "Resolve biological entities before treating names as interchangeable." },
  { n: "04", title: "Mechanisms", text: "Explore candidate mechanisms across the Living Health Knowledge Graph." },
  { n: "05", title: "Compare", text: "Compare findings without collapsing disagreement." },
  { n: "06", title: "Gaps", text: "Name contradictions and information the record does not contain." },
  { n: "07", title: "Hypotheses", text: "Label every new proposal as unvalidated until a person reviews it." },
  { n: "08", title: "Brief", text: "Produce an evidence-linked research brief for human review." },
  { n: "09", title: "Reviewed knowledge", text: "Only approved review can version the graph." },
] as const;

const DIFFERENT = [
  {
    title: "Connected biology",
    text: "Immune, nervous, microbiome, metabolic and molecular context stay on one graph.",
  },
  {
    title: "Evidence-traced claims",
    text: "A statement keeps its source, or it is not presented as evidence.",
  },
  {
    title: "Human scientific governance",
    text: "People approve, reject, or leave a claim unreviewed. Nothing auto-approves.",
  },
  {
    title: "Patient-data barrier",
    text: "Private clinical information does not auto-enter the research knowledge graph.",
  },
] as const;

export function Home() {
  const [step, setStep] = useState(0);
  const active = STEPS[step] ?? STEPS[0];
  return (
    <div className="cl-page">
      <HomeHero />
      <HomeKnowledgeGraph />
      <HomeIntelligenceFlow />
      <HomeWorkspacePreview />

      <section className="cl-steps cl-chapter" id="investigation-workflow" aria-labelledby="steps-title">
        <div className="cl-steps-intro">
          <h2 id="steps-title">Follow the evidence. Understand the mechanism. Investigate what comes next.</h2>
          <p className="cl-chapter-lead cl-steps-lead">
            Illustrative steps through a research workbench. Detail lives on{" "}
            <Link to="/how-it-works">How it works</Link>.
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

      <HomeIntegrity />
      <HomeEcosystemProducts />

      <section className="cl-limits cl-chapter" aria-labelledby="limits-title">
        <h2 id="limits-title">What HSI does not do</h2>
        <ul>
          <li>Diagnose disease or recommend treatment</li>
          <li>Replace scientific judgement</li>
          <li>Validate therapeutic targets or guarantee research outcomes</li>
          <li>Automatically approve scientific claims</li>
          <li>Provide patient-specific clinical advice</li>
          <li>Confirm trial eligibility from association evidence</li>
          <li>Let private clinical information auto-enter the research graph</li>
        </ul>
        <p>
          Evidence, contradictions and gaps stay visible. Human review stays required. This is not a clinical service.
        </p>
      </section>

      <HomeAccess />
    </div>
  );
}
