import { HomeProductDemo } from "./HomeProductDemo";

/**
 * Section 4 — public research workspace presentation.
 * Reuses the curated illustrative workbench; authenticated APIs stay out of the public page.
 */
export function HomeWorkspacePreview() {
  return (
    <section className="cl-workspace cl-chapter" aria-labelledby="workspace-heading">
      <div className="cl-chapter-inner cl-workspace-intro">
        <h2 id="workspace-heading">From a scientific question to an evidence-backed investigation.</h2>
        <p className="cl-chapter-lead">
          The panels below mirror the research interface using approved, non-sensitive curated examples. They are not a
          live investigation and do not expose private research records.
        </p>
      </div>
      <div className="cl-workspace-demo">
        <HomeProductDemo />
      </div>
    </section>
  );
}
