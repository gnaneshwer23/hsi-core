import { Link } from "react-router-dom";
import { HomeProductDemo } from "./HomeProductDemo";

/**
 * Illustrative research workspace tease.
 * Authenticated APIs stay out of the public page; detail lives on How it works / Research.
 */
export function HomeWorkspacePreview() {
  return (
    <section className="cl-workspace cl-chapter" aria-labelledby="workspace-heading">
      <div className="cl-chapter-inner cl-workspace-intro">
        <h2 id="workspace-heading">From a scientific question to an evidence-backed investigation.</h2>
        <p className="cl-chapter-lead">
          Curated, non-sensitive examples — not a live investigation.{" "}
          <Link to="/how-it-works">How it works</Link> covers the full workflow.
        </p>
      </div>
      <div className="cl-workspace-demo">
        <HomeProductDemo />
      </div>
    </section>
  );
}
