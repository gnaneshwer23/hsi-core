import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { DualConsumerDiagram, GateCDiagram } from "../components/Diagrams";

export function ForAksh() {
  return (
    <>
      <PageHero
        eyebrow="For Aksh · clinician-safe"
        title={
          <>
            HITL suggestions,
            <br />
            <span className="accent">not write-back.</span>
          </>
        }
        lede="Aksh Health is the clinician-safe half of HSI: human-in-the-loop cards only when edges clear established + approved. Mapping never opens CDS by itself."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="section-head">
            <span className="section-num">RULES</span>
            <h2 className="display display-md">isCdsSurfacable is the door.</h2>
          </div>
          <div className="diagram-plane" style={{ marginBottom: "2rem" }}>
            <GateCDiagram title="Every HITL card passes these gates" />
          </div>
          <ul className="checklist">
            <li>
              Surfacable only when curationReview === approved and hsiGrade ===
              established
            </li>
            <li>Filling claim.akshNodeId never flips CDS eligibility</li>
            <li>No EHR / patient-record write-back from map presence alone</li>
            <li>No PHI in seeds or exports</li>
            <li>IO discovery seeds stay unmapped unless a clinic pathway needs them</li>
          </ul>
          <div className="diagram-plane" style={{ marginTop: "2.5rem" }}>
            <DualConsumerDiagram title="Aksh is the clinic-safe face of the same graph" />
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">
              IDS
            </span>
            <h2 className="display display-md">Durable aksh: scheme</h2>
            <p className="lede">
              Clinic concepts are namespaced in hsi-core as aksh:&lt;kind&gt;:&lt;slug&gt;
              — condition, finding, medicine, risk, pathway, interaction, watch.
            </p>
          </div>
          <div className="code-block" style={{ background: "rgba(11,15,36,0.92)", color: "var(--phosphor)" }}>
            {`aksh:finding:hba1c
aksh:condition:t2dm
aksh:medicine:metformin
aksh:interaction:inflammation-insulin-resistance
aksh:watch:irae-hyperglycemia`}
          </div>
          <p style={{ marginTop: "1.25rem", color: "rgba(19,25,48,0.65)" }}>
            Export schema hsi-aksh-node-map-2 includes provisional → durable
            migration. Seeds keep cdsSurfacable false until Gate C clears.
          </p>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">CONSUME</span>
            <h2 className="display display-md">P1 HITL stub</h2>
          </div>
          <div className="code-block">
            {`import {
  isCdsSurfacable,
  claimsWithAkshMappings,
  loadAkshHitlMapFromExport,
  listAkshHitlCards,
} from "hsi-core";

// bun run export:aksh-map
// → exports/hsi-aksh-node-map.json`}
          </div>
          <p style={{ marginTop: "1.5rem" }}>
            <Link to="/docs" className="btn btn-ghost">
              Full install path <span className="arrow">↗</span>
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
