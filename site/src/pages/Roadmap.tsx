import { PageHero } from "../components/PageHero";

const phases = [
  {
    id: "P0",
    status: "DONE",
    active: false,
    title: "Schema, seeds, first exports",
    body: "Evidence grades, edge/claim schema, ~25 T2D immuno-metabolic seeds, validation CLI, ISI/Aksh exports, gap report, safety criteria v0.",
  },
  {
    id: "P1",
    status: "ACTIVE",
    active: true,
    title: "Research pilot first",
    body: "One disease + one question with a partner (research intelligence). Durable aksh: maps, HITL stubs, Gate C — no broad platform before the pilot proves value.",
  },
  {
    id: "P2",
    status: "PLANNED",
    active: false,
    title: "Richer exports / curator UX",
    body: "Deeper artifacts after pilot learning. Product apps bind published packages — they stay consumers.",
  },
  {
    id: "P3",
    status: "DEFERRED",
    active: false,
    title: "Optional bio-stack plugins",
    body: "AF3, Boltz, ESM, OpenMM, RDKit, REINVENT4, TDC — only after RFC + license sign-off. Never flip grades or enter clinic CDS.",
  },
];

export function Roadmap() {
  return (
    <>
      <PageHero
        eyebrow="Development status · secondary"
        title={
          <>
            Build phases.
            <br />
            <span className="accent">Not the product story.</span>
          </>
        }
        lede="P0–P3 detail for contributors. The homepage leads with what HSI Core enables now — evidence backbone for immune-science discovery. Pilot-first: one research workflow before more platform."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="phase-grid">
            {phases.map((p) => (
              <article
                key={p.id}
                className={`phase-card${p.active ? " active" : ""}`}
              >
                <span className="mono">
                  {p.id} · {p.status}
                </span>
                <h3 className="display" style={{ fontSize: "1.45rem" }}>
                  {p.title}
                </h3>
                <p className="muted" style={{ marginTop: "0.65rem" }}>
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">
              NEXT ACTIONS
            </span>
            <h2 className="display display-md">Stay inside hsi-core</h2>
          </div>
          <ul className="checklist">
            <li>Outreach + lock one disease/question per docs/ISI_PILOT_BRIEF.md</li>
            <li>Feed the pilot from bun run outputs — evidence, provenance, uncertainty</li>
            <li>Harden Aksh HITL stub without opening CDS; keep Akeno out of patient-level decisions</li>
            <li>Grow ISI REL maps for the pilot question; never auto-approve into a product KG</li>
            <li>Do not vendor AF3/Boltz until a written P3 plugin RFC lands here</li>
          </ul>
        </div>
      </section>
    </>
  );
}
