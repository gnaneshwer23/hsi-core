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
    title: "Durable maps & Gate C",
    body: "Durable aksh: ids, HITL read-only stubs, Gate C checklists, bridge shortlist, ISI REL suggestions without auto-approve.",
  },
  {
    id: "P2",
    status: "PLANNED",
    active: false,
    title: "Richer exports / curator UX",
    body: "Deeper artifacts and curator ergonomics inside hsi-core. Product apps bind published packages — they stay consumers.",
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
        eyebrow="Roadmap · phases"
        title={
          <>
            Same climb.
            <br />
            <span className="accent">Clear altitudes.</span>
          </>
        }
        lede="P0 is done. P1 is active. Everything later still ships from hsi-core — never by editing consumer repos."
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
            <span className="section-num" style={{ color: "var(--teal-mid)" }}>
              NEXT ACTIONS
            </span>
            <h2 className="display display-md">Stay inside hsi-core</h2>
          </div>
          <ul className="checklist">
            <li>Expand T2D / immuno-metabolic bridge seeds + verified PMID Gate C checklists</li>
            <li>Harden Aksh HITL stub + exports/hsi-aksh-node-map.json without opening CDS on seeds</li>
            <li>Grow ISI export / REL suggestion maps; never auto-approve into a product KG</li>
            <li>Document future ClinVar/TCGA pointer fields as optional metadata — still Gate C</li>
            <li>Do not vendor AF3/Boltz until a written P3 plugin RFC lands here</li>
          </ul>
        </div>
      </section>
    </>
  );
}
