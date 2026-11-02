import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SourceRegistry } from "../../../src/sourceRegistry";
import { PageHero } from "../components/PageHero";

function validRegistry(data: unknown): data is SourceRegistry {
  if (!data || typeof data !== "object") return false;
  const root = data as SourceRegistry;
  return root.schemaVersion === "hsi-source-registry-1" && root.notCds === true && root.containsPhi === false && root.claimSupport === "not_assessed" && Array.isArray(root.sources) && root.sources.every((source) =>
    source && typeof source.pmid === "string" && /^\d{1,9}$/.test(source.pmid) && source.id === `pmid:${source.pmid}` && Array.isArray(source.claimIds) && Array.isArray(source.revisions) && source.revisions.every((revision) =>
      revision && typeof revision.id === "string" && typeof revision.retrievedAt === "string" && ["manual_metadata", "europe_pmc"].includes(revision.provider) && revision.metadata && typeof revision.metadata.title === "string" && ["retracted", "corrected", "not_checked"].includes(revision.metadata.retractionStatus) && [revision.metadata.licence, revision.metadata.publishedAt].every((field) => field === null || typeof field === "string")));
}

export function Sources() {
  const [registry, setRegistry] = useState<SourceRegistry | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/research/source-registry.json", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Registry unavailable");
      const data = await response.json();
      if (!validRegistry(data)) throw new Error("Invalid registry");
      setRegistry(data);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  return <>
    <PageHero eyebrow="Research · source registry" title="Know what sits behind a citation." lede="Track source locators and versioned metadata. A linked paper is not proof that it supports the exact claim." />
    <section className="section section-ink"><div className="container">
      <p className="dc-banner dc-banner-warn">Research only. Metadata is imported, not independently verified here. Publication dates and reuse rights may be unknown. No clinical approval is implied.</p>
      {error ? <p role="alert">Source registry unavailable. No unvalidated records are displayed.</p> : !registry ? <p role="status">Loading source registry…</p> : <>
        <p>{registry.sources.length} source locators · {registry.sources.filter((s) => s.revisions.length).length} with imported metadata.</p>
        <div className="dc-explain-grid">{registry.sources.map((source) => {
          const latest = source.revisions.at(-1);
          return <article className="dc-card" key={source.id}>
            <h2>{latest?.metadata.title ?? `PMID ${source.pmid}`}</h2>
            <p>{latest ? `Imported metadata · ${latest.metadata.retractionStatus.replaceAll("_", " ")}` : "Locator only · source metadata not imported"}</p>
            {latest ? <><p>Publication date: {latest.metadata.publishedAt ?? "Unknown"} · Licence: {latest.metadata.licence ?? "Unknown; reuse not cleared"}</p><p>Provider: {latest.provider} · retrieved {latest.retrievedAt}</p><details><summary>{source.revisions.length} metadata version(s)</summary><ul>{source.revisions.map((revision, index) => <li key={`${revision.id}-${index}`}>{revision.retrievedAt} · {revision.metadata.retractionStatus} · {revision.id.slice(0, 12)}</li>)}</ul></details></> : null}
            <p>Referenced by {source.claimIds.length} pack claim(s). Exact support: not assessed.</p>
            <a href={`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`} target="_blank" rel="noreferrer">Inspect source ↗</a>
          </article>;
        })}</div>
      </>}
      <p style={{ marginTop: "2rem" }}><Link to="/discovery">Return to the research workspace →</Link></p>
    </div></section>
  </>;
}
