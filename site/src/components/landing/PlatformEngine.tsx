import { useState } from "react";
import { Link } from "react-router-dom";

type UnitId =
  | "clinical"
  | "biology"
  | "evidence"
  | "policy"
  | "graph"
  | "timeline"
  | "retrieve"
  | "reason"
  | "verify"
  | "research"
  | "clinicalOut"
  | "trials";

type UnitInfo = {
  tag: string;
  name: string;
  desc: string;
};

/** Copy from founder Downloads/index.html §01 — honesty language preserved. */
const INFO: Record<UnitId, UnitInfo> = {
  clinical: {
    tag: "01 / CONNECT",
    name: "Clinical & personal",
    desc: "With the necessary permissions and integrations, clinical observations and personal health data can contribute to a longitudinal investigation. This prototype does not access patient records.",
  },
  biology: {
    tag: "01 / CONNECT",
    name: "Human biology",
    desc: "Connect organ systems, immune cells, tissue states, molecular pathways, microbiome and multi-omics with explicit context and evidence.",
  },
  evidence: {
    tag: "01 / CONNECT",
    name: "Scientific evidence",
    desc: "Curated studies and official trial sources contribute evidence with traceable citations, dates, populations and limitations.",
  },
  policy: {
    tag: "02 / CONTEXTUALISE",
    name: "Governed access",
    desc: "Protected clinical data remain permission-bound and isolated from public biomedical knowledge. Identity, purpose and lawful access determine retrieval.",
  },
  graph: {
    tag: "02 / CONTEXTUALISE",
    name: "Knowledge relationships",
    desc: "A federated semantic graph relates cells, pathways, biomarkers, disease states and interventions, with provenance and uncertainty attached.",
  },
  timeline: {
    tag: "02 / CONTEXTUALISE",
    name: "Time & trajectory",
    desc: "Represent longitudinal observations and biological states while avoiding unsupported causal claims from temporal ordering.",
  },
  retrieve: {
    tag: "03 / INTELLIGENCE",
    name: "Retrieve & connect",
    desc: "Hybrid retrieval and graph traversal bring together only relevant, permitted evidence and context.",
  },
  reason: {
    tag: "03 / INTELLIGENCE",
    name: "Reason & analyse",
    desc: "Explore mechanistic explanations and candidate hypotheses while distinguishing established evidence from computational inference.",
  },
  verify: {
    tag: "03 / INTELLIGENCE",
    name: "Verify & explain",
    desc: "Expose supporting sources, contradictory findings, unknowns and review requirements. Do not present unvalidated hypotheses as conclusions.",
  },
  research: {
    tag: "04 / APPLY",
    name: "ISI Research",
    desc: "Explore immune mechanisms, scientific evidence and research hypotheses in a researcher-facing environment.",
  },
  clinicalOut: {
    tag: "04 / APPLY",
    name: "HSI Clinical + Aksh",
    desc: "Support different clinical and personal health workflows using shared governed intelligence, without conflating their access permissions.",
  },
  trials: {
    tag: "04 / APPLY",
    name: "HSI Trials + human review",
    desc: "Explore trials and evidence-linked criteria, leaving eligibility determinations and consequential decisions to qualified humans.",
  },
};

type Cluster = {
  title: string;
  kind?: "core" | "outcomes";
  units: { id: UnitId; title: string; sub: string }[];
};

const CLUSTERS: Cluster[] = [
  {
    title: "01 / CONNECT",
    units: [
      {
        id: "clinical",
        title: "Clinical & personal",
        sub: "Authorised health context · labs · monitoring",
      },
      {
        id: "biology",
        title: "Human biology",
        sub: "Cells · tissues · pathways · multi-omics",
      },
      {
        id: "evidence",
        title: "Scientific evidence",
        sub: "Publications · trials · curated datasets",
      },
    ],
  },
  {
    title: "02 / CONTEXTUALISE",
    units: [
      {
        id: "policy",
        title: "Governed access",
        sub: "Identity · purpose · permissions",
      },
      {
        id: "graph",
        title: "Knowledge relationships",
        sub: "Concepts · ontology · provenance",
      },
      {
        id: "timeline",
        title: "Time & trajectory",
        sub: "Longitudinal states · observations",
      },
    ],
  },
  {
    title: "03 / INTELLIGENCE",
    kind: "core",
    units: [
      {
        id: "retrieve",
        title: "Retrieve & connect",
        sub: "Hybrid search · graph exploration",
      },
      {
        id: "reason",
        title: "Reason & analyse",
        sub: "Mechanisms · comparison · hypotheses",
      },
      {
        id: "verify",
        title: "Verify & explain",
        sub: "Citations · contradictions · uncertainty",
      },
    ],
  },
  {
    title: "04 / APPLY & REVIEW",
    kind: "outcomes",
    units: [
      {
        id: "research",
        title: "ISI Research",
        sub: "Explore biology and research questions",
      },
      {
        id: "clinicalOut",
        title: "HSI Clinical + Aksh",
        sub: "Professional and personal context",
      },
      {
        id: "trials",
        title: "HSI Trials + human review",
        sub: "Research screening · expert oversight",
      },
    ],
  },
];

/**
 * §01 “Connected by design” — interactive four-stage fabric from founder
 * Downloads/index.html, adapted to HSI cobalt tokens. Shared by `/` and `/platform`.
 */
export function PlatformEngine() {
  const [active, setActive] = useState<UnitId>("clinical");
  const detail = INFO[active];

  return (
    <section
      className="land-platform section section-bone"
      id="platform"
      aria-labelledby="platform-title"
    >
      <div className="container">
        <div className="land-platform-hero">
          <span className="section-num">THE PLATFORM / 01 — CONNECTED BY DESIGN</span>
          <div className="land-platform-headline">
            <h1 className="display display-xl" id="platform-title">
              One foundation.
              <br />
              <em>Every layer of health.</em>
            </h1>
            <p className="lede">
              Health data, biology and research are not separate stories. HSI is designed to
              connect them through one governed intelligence foundation.
            </p>
          </div>
          <div className="hero-actions land-platform-ctas">
            <a href="#ecosystem" className="btn btn-ink">
              Explore the platform <span className="arrow">↗</span>
            </a>
            <Link to="/status" className="btn btn-ghost land-btn-on-light">
              What&apos;s available
            </Link>
          </div>
        </div>

        <div className="land-fabric-stage" aria-label="Interactive HSI living intelligence fabric">
          <div className="land-fabric-top">
            <span>HSI / THE LIVING INTELLIGENCE FABRIC</span>
            <span>FOLLOW THE FLOW · SELECT A COMPONENT</span>
          </div>

          <div className="land-fabric-flow">
            <svg
              className="land-fabric-wires"
              viewBox="0 0 1200 445"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                id="land-w1"
                className="land-wire"
                d="M265 83 C305 83 302 83 344 83 S550 83 595 83 S830 83 880 83"
              />
              <path
                id="land-w2"
                className="land-wire"
                d="M265 198 C310 198 305 198 344 198 S550 198 595 198 S830 198 880 198"
              />
              <path
                id="land-w3"
                className="land-wire"
                d="M265 316 C310 316 305 316 344 316 S550 316 595 316 S830 316 880 316"
              />
              <path
                className="land-wire land-wire-dashed"
                d="M265 315 Q310 420 350 315 M535 315 Q565 410 610 315 M805 315 Q842 410 885 315"
              />
              <circle r="4" className="land-particle">
                <animateMotion dur="7s" repeatCount="indefinite">
                  <mpath href="#land-w1" />
                </animateMotion>
              </circle>
              <circle r="4" className="land-particle">
                <animateMotion dur="9s" repeatCount="indefinite">
                  <mpath href="#land-w2" />
                </animateMotion>
              </circle>
              <circle r="4" className="land-particle">
                <animateMotion dur="11s" repeatCount="indefinite">
                  <mpath href="#land-w3" />
                </animateMotion>
              </circle>
            </svg>

            <div className="land-fabric-columns">
              {CLUSTERS.map((cluster) => {
                const isActiveCluster = cluster.units.some((u) => u.id === active);
                return (
                  <div
                    key={cluster.title}
                    className={`land-cluster${cluster.kind ? ` land-cluster-${cluster.kind}` : ""}${
                      isActiveCluster ? " land-cluster-active" : ""
                    }`}
                  >
                    <div className="land-cluster-title">{cluster.title}</div>
                    {cluster.units.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        className="land-unit"
                        aria-pressed={active === unit.id}
                        onClick={() => setActive(unit.id)}
                      >
                        <b>{unit.title}</b>
                        <span>{unit.sub}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="land-fabric-detail" aria-live="polite">
            <div>
              <small>{detail.tag}</small>
              <h2>{detail.name}</h2>
            </div>
            <p>{detail.desc}</p>
          </div>

          <div className="land-fabric-foot">
            <span>Permission-bound access · Source provenance · Human oversight</span>
            <span>Conceptual architecture, not a live data feed</span>
          </div>
        </div>

        <div className="land-go-deeper">
          <a href="#ecosystem">GO DEEPER ↓</a>
        </div>
      </div>
    </section>
  );
}
