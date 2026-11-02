import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { parseSourceRegistryStructure, revisionPayload, type SourceRegistry } from "../../../src/sourceRegistrySchema";
import { PageHero } from "../components/PageHero";

export function Sources() {
  const [registry, setRegistry] = useState<SourceRegistry | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/research/source-registry.json", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Registry unavailable");
      const raw = await response.text();
      if (new TextEncoder().encode(raw).length > 5_000_000) throw new Error("Registry exceeds size limit");
      const data = parseSourceRegistryStructure(JSON.parse(raw));
      for (const source of data.sources) {
        for (const revision of source.revisions) {
          const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(revisionPayload(revision)));
          const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
          if (hash !== revision.id) throw new Error("Registry content hash mismatch");
        }
      }
      if (!controller.signal.aborted) setRegistry(data);
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
