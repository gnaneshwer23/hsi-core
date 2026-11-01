import { PageHero } from "../components/PageHero";

export function Docs() {
  return (
    <>
      <PageHero
        eyebrow="Docs · how to use"
        title={
          <>
            Run the substrate
            <br />
            <span className="accent">from hsi-core.</span>
          </>
        }
        lede="Install with Bun, validate seeds, publish exports. Product apps import the package or pull JSON from exports/."
      />

      <section className="section section-ink">
        <div className="container">
          <div className="section-head">
            <span className="section-num">INSTALL</span>
            <h2 className="display display-md">Clone and check</h2>
          </div>
          <div className="code-block">
            {`git clone git@github.com:gnaneshwer23/hsi-core.git
cd hsi-core
bun install
bun test
bun run validate
bun run export:isi
bun run export:isi-map
bun run export:aksh-map
bun run gap-report`}
          </div>
          <p className="muted" style={{ marginTop: "1rem" }}>
            Requires Bun. <code>bun run build</code> emits dist/ for TypeScript
            consumers.
          </p>
        </div>
      </section>

      <section className="section section-bone">
        <div className="container">
          <div className="section-head">
            <span className="section-num">
              IMPORT
            </span>
            <h2 className="display display-md">Package surface</h2>
          </div>
          <div
            className="code-block"
            style={{ background: "rgba(11,15,36,0.92)" }}
          >
            {`import {
  HSI_T2D_IMMUNO_SEED_EDGES,
  isCdsSurfacable,
  validateHsiEdge,
  buildIsiExportBundle,
  listAkshHitlCards,
} from "hsi-core";`}
          </div>
          <table className="axis-table" style={{ marginTop: "2rem" }}>
            <thead>
              <tr>
                <th>Script</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>validate</code>
                </td>
                <td>Schema / seed validation CLI</td>
              </tr>
              <tr>
                <td>
                  <code>export:isi</code>
                </td>
                <td>ISI discovery export bundle</td>
              </tr>
              <tr>
                <td>
                  <code>export:isi-map</code>
                </td>
                <td>REL suggestion map for Gate C</td>
              </tr>
              <tr>
                <td>
                  <code>export:aksh-map</code>
                </td>
                <td>Durable aksh: node map + HITL pointers</td>
              </tr>
              <tr>
                <td>
                  <code>gap-report</code>
                </td>
                <td>Mapping slots + bridge shortlist</td>
              </tr>
              <tr>
                <td>
                  <code>site:dev</code>
                </td>
                <td>This marketing site (Vite)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <div className="section-head">
            <span className="section-num">DOCS IN REPO</span>
            <h2 className="display display-md">Read next</h2>
          </div>
          <div className="link-strip">
            <a href="https://github.com/gnaneshwer23/hsi-core/blob/main/docs/ISI_PILOT_BRIEF.md">
              <span className="idx">01</span>
              <span className="title">ISI_PILOT_BRIEF.md</span>
              <span className="arrow">↗</span>
            </a>
            <a href="https://github.com/gnaneshwer23/hsi-core/blob/main/docs/ISI_PILOT_PARTNER_SHORTLIST.md">
              <span className="idx">02</span>
              <span className="title">ISI_PILOT_PARTNER_SHORTLIST.md</span>
              <span className="arrow">↗</span>
            </a>
            <a href="https://github.com/gnaneshwer23/hsi-core/blob/main/docs/VISION_REPO_ALIGNMENT.md">
              <span className="idx">03</span>
              <span className="title">VISION_REPO_ALIGNMENT.md</span>
              <span className="arrow">↗</span>
            </a>
            <a href="https://github.com/gnaneshwer23/hsi-core/blob/main/docs/AKSH_HITL_CONSUMPTION.md">
              <span className="idx">04</span>
              <span className="title">AKSH_HITL_CONSUMPTION.md</span>
              <span className="arrow">↗</span>
            </a>
            <a href="https://github.com/gnaneshwer23/hsi-core/blob/main/docs/IMMUNECITY_GATE_C_COMMIT_MANUAL.md">
              <span className="idx">05</span>
              <span className="title">Gate C curator checklist</span>
              <span className="arrow">↗</span>
            </a>
            <a href="https://github.com/gnaneshwer23/hsi-core">
              <span className="idx">06</span>
              <span className="title">README · Pilot + active codebase</span>
              <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
