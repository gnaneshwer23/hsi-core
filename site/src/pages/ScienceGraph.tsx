import {useEffect, useMemo, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {
  SCIENCE_GRAPH,
  getGraphNeighbourhood,
  graphClaims,
  graphSourceDetails,
} from "../features/science/knowledgeGraph";
import {SCIENCE_TYPED_GRAPH, typedGraphNeighbours} from "../features/science/typedGraphData";
import {buildEvidenceDossier} from "../features/science/evidenceDossier";
import {GraphVisual} from "../features/science/GraphVisual";
import {SscGraphVisual} from "../features/science/SscGraphVisual";
import {GovernedResearchPanel} from "../components/GovernedResearchPanel";
import {
  filterExplorerGraph,
  GRAPH_KIND_COLOURS,
  GRAPH_HONESTY,
  graphStartingPoints,
  neighboursGroupedByKind,
  countNodesByKind,
} from "../features/science/graphExplorer";
import "../styles/science-body.css";
import "../styles/science-graph.css";
import "../styles/graph-explorer.css";

type SscNode = {
  id: string;
  preferredLabel: string;
  kind: string;
  sourceIdentifiers: {system: string; value: string; mapping: string}[];
};
type SscEdge = {
  id: string;
  subjectId: string;
  objectId: string;
  predicate: string;
  sourceEvidenceIds: string[];
  context: Record<string, string>;
  reviewState: string;
  epistemicType: string;
};
type SscDraft = {
  release: {id: string; version: string; status: string; graphPromotable: boolean};
  provenance: {reviewedByHuman: boolean; rightsCleared: boolean};
  nodes: SscNode[];
  relationships: SscEdge[];
  comparisonCandidates: {claimIds: string[]; type: string; reason: string}[];
};

const GUIDE_KEY = "hsi-kg-guide-dismissed";
const evidenceStatusMap = new Map(SCIENCE_TYPED_GRAPH.edges.map((e) => [e.id, e.evidenceStatus]));
const kindCounts = countNodesByKind(SCIENCE_GRAPH);
const starters = graphStartingPoints(SCIENCE_GRAPH);

function GraphGuide({onDismiss}: {onDismiss: () => void}) {
  return (
    <aside className="kg-guide kg-guide-banner" aria-label="How to use the knowledge graph">
      <ol>
        <li>
          <b>1</b>
          <span>
            <strong>Find or start</strong> from a concept or domain entry point.
          </span>
        </li>
        <li>
          <b>2</b>
          <span>
            <strong>Select</strong> a node or connection on the canvas.
          </span>
        </li>
        <li>
          <b>3</b>
          <span>
            <strong>Inspect</strong> neighbours, review state, and sources — layout is not biology.
          </span>
        </li>
      </ol>
      <button type="button" className="kg-guide-dismiss" onClick={onDismiss}>
        Got it
      </button>
    </aside>
  );
}

export function ScienceGraph() {
  const [ssc, setSsc] = useState<SscDraft | null>(null);
  const [sscError, setSscError] = useState("");
  const [sscSearch, setSscSearch] = useState("");
  const [sscSelected, setSscSelected] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [surface, setSurface] = useState<"graph" | "list">("graph");

  useEffect(() => {
    const c = new AbortController();
    fetch("/research/ssc-tfh-il21-graph-draft.v1.json", {signal: c.signal, cache: "no-store"})
      .then((r) => {
        if (!r.ok) throw Error("SSc graph draft unavailable");
        return r.json();
      })
      .then((d: SscDraft) => {
        if (d.release.graphPromotable || d.provenance.reviewedByHuman || d.provenance.rightsCleared) {
          throw Error("Unexpected draft graph governance status");
        }
        if (!Array.isArray(d.nodes) || !Array.isArray(d.relationships)) throw Error("Invalid SSc graph");
        if (!c.signal.aborted) setSsc(d);
      })
      .catch((e) => {
        if (!c.signal.aborted) setSscError(e instanceof Error ? e.message : "Graph unavailable");
      });
    return () => c.abort();
  }, []);

  useEffect(() => {
    try {
      setShowGuide(localStorage.getItem(GUIDE_KEY) !== "1");
    } catch {
      setShowGuide(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (window.matchMedia("(max-width: 900px)").matches) setSurface("list");
  }, []);

  const sscNodes =
    ssc?.nodes.filter(
      (n) =>
        n.preferredLabel.toLowerCase().includes(sscSearch.toLowerCase()) ||
        n.id.toLowerCase().includes(sscSearch.toLowerCase()) ||
        n.sourceIdentifiers.some((x) => x.value.toLowerCase().includes(sscSearch.toLowerCase())),
    ) ?? [];
  const sscNode = ssc?.nodes.find((n) => n.id === sscSelected);
  const sscEdges = ssc?.relationships.filter((e) => e.subjectId === sscSelected || e.objectId === sscSelected) ?? [];

  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const kind = params.get("type") ?? "all";
  const domain = params.get("domain") ?? "all";
  const review = params.get("review") ?? "all";
  const evidence = params.get("evidence") ?? "all";
  const view = params.get("view") === "local" ? "local" : "global";
  const depth = [1, 2, 3].includes(Number(params.get("depth"))) ? Number(params.get("depth")) : 1;
  const [inspectedEdge, setInspectedEdge] = useState<string | null>(null);
  const selected = SCIENCE_GRAPH.nodes.find((n) => n.id === params.get("node")) ?? SCIENCE_GRAPH.nodes[0]!;

  function update(key: string, value: string, replace = true) {
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        if (value === "all" || value === "") next.delete(key);
        else next.set(key, value);
        return next;
      },
      {replace},
    );
  }
  const setDepth = (value: number) => update("depth", String(value), false);
  const base = view === "local" ? getGraphNeighbourhood(selected.id, depth) : SCIENCE_GRAPH;
  const graph = filterExplorerGraph(base, {query, kind, domain, review, evidence}, evidenceStatusMap);
  const nodes = graph.nodes;
  const choose = (id: string) => {
    update("node", id, false);
    setInspectedEdge(null);
    setSurface((s) => (s === "list" ? s : "graph"));
  };
  const dossier = inspectedEdge ? buildEvidenceDossier(SCIENCE_TYPED_GRAPH, inspectedEdge) : null;
  const clearFilters = () =>
    setParams((old) => {
      const next = new URLSearchParams();
      next.set("node", old.get("node") ?? selected.id);
      if (view === "local") next.set("view", "local");
      if (depth !== 1) next.set("depth", String(depth));
      return next;
    });
  const hidden = !nodes.some((n) => n.id === selected.id);
  const neighbourRows = typedGraphNeighbours(selected.id);
  const neighbourGroups = useMemo(
    () => neighboursGroupedByKind(selected.id, typedGraphNeighbours(selected.id)),
    [selected.id],
  );
  const dismissGuide = () => {
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* ignore quota */
    }
    setShowGuide(false);
  };

  const filterAside = (
    <aside className="kg-filters" aria-label="Graph search and filters">
      <div className="kg-panel-title">
        <h2>Find a concept</h2>
        <button type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>
      <label>
        Search
        <input
          aria-label="Search"
          type="search"
          placeholder="Name, identifier or context"
          value={query}
          onChange={(e) => update("q", e.target.value)}
        />
      </label>
      {query.trim() && nodes.length === 0 && (
        <p className="kg-find-empty" role="status">
          No concepts match “{query.trim()}”. This is a search miss, not evidence of absence.
        </p>
      )}
      {starters.length > 0 && (
        <div className="kg-starters">
          <h3>Starting points</h3>
          <p className="kg-hint">Highest connectivity per biological system in this educational map — not decorative placeholders.</p>
          <div className="kg-starter-grid">
            {starters.map((s) => (
              <button key={s.id} type="button" className="kg-starter" onClick={() => choose(s.id)}>
                <span className="kg-starter-family">{s.family}</span>
                <span className="kg-starter-name">
                  <i style={{background: GRAPH_KIND_COLOURS[s.kind] ?? "#9bcac0"}} aria-hidden />
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="kg-view-switch" role="group" aria-label="Graph scope">
        <button type="button" aria-pressed={view === "global"} onClick={() => update("view", "global", false)}>
          Global graph
        </button>
        <button type="button" aria-pressed={view === "local"} onClick={() => update("view", "local", false)}>
          Local graph
        </button>
      </div>
      <label>
        Depth
        <select aria-label="Depth" value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
          <option value={1}>1 hop</option>
          <option value={2}>2 hops</option>
          <option value={3}>3 hops</option>
        </select>
      </label>
      <p className="kg-hint">Depth applies to the selected concept in Local graph.</p>
      <div className="kg-type-chips">
        <h3>Entity types</h3>
        <div className="kg-type-list" role="group" aria-label="Entity type filters">
          <button type="button" aria-pressed={kind === "all"} onClick={() => update("type", "all")}>
            All types <span>{SCIENCE_GRAPH.nodes.length}</span>
          </button>
          {[...new Set(SCIENCE_GRAPH.nodes.map((n) => n.kind))].sort().map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => update("type", k)}>
              <i style={{background: GRAPH_KIND_COLOURS[k]}} aria-hidden />
              {k} <span>{kindCounts[k] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <label>
        Domain
        <select aria-label="Domain" value={domain} onChange={(e) => update("domain", e.target.value)}>
          <option value="all">All domains</option>
          {[...new Set(SCIENCE_GRAPH.nodes.map((n) => n.system).filter((s): s is string => !!s))]
            .sort()
            .map((d) => (
              <option key={d}>{d}</option>
            ))}
        </select>
      </label>
      <label>
        Review state
        <select aria-label="Review state" value={review} onChange={(e) => update("review", e.target.value)}>
          <option value="all">All review states</option>
          {[...new Set(SCIENCE_GRAPH.nodes.map((n) => n.reviewState))].sort().map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        Evidence status
        <select aria-label="Evidence status" value={evidence} onChange={(e) => update("evidence", e.target.value)}>
          <option value="all">All evidence states</option>
          {[...new Set(SCIENCE_TYPED_GRAPH.edges.map((e) => e.evidenceStatus))].sort().map((e) => (
            <option key={e} value={e}>
              {e.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </label>
      <details className="kg-legend" open>
        <summary>Node colours</summary>
        {[...new Set(SCIENCE_GRAPH.nodes.map((n) => n.kind))].sort().map((k) => (
          <span key={k}>
            <i style={{background: GRAPH_KIND_COLOURS[k]}} />
            {k}
          </span>
        ))}
      </details>
      <h3>
        Concepts in view <span>{nodes.length}</span>
      </h3>
      <div className="science-graph-nodes kg-search-results" role="group" aria-label="Choose graph entity">
        {nodes.map((n) => (
          <button type="button" key={n.id} aria-pressed={selected.id === n.id} onClick={() => choose(n.id)}>
            <strong>{n.label}</strong>
            <small>
              {n.kind} · {n.system}
            </small>
          </button>
        ))}
      </div>
    </aside>
  );

  const inspector = (
    <aside className="science-graph-detail kg-inspector" aria-label="Concept and evidence inspector">
      <p className="science-body-kicker">
        {selected.kind.toUpperCase()} / {selected.reviewState}
      </p>
      <p className="kg-honesty-chip" role="note">
        Educational topic map · not scientific approval · not clinical advice
      </p>
      <h2>{selected.label}</h2>
      <p>{selected.description}</p>
      <div className="kg-inspector-actions">
        <Link to={"/science/body?organ=" + encodeURIComponent(selected.id)}>Body context</Link>
        <Link to="/science/paths">Explore paths</Link>
        <Link to="/research/knowledge-graph">Research corpus</Link>
        <Link to="/research/dashboard">Research workspace</Link>
      </div>
      <h3>Connected concepts by type</h3>
      {neighbourGroups.length === 0 ? (
        <p className="kg-hint" role="status">
          Empty neighbourhood for this concept — a curation gap in the educational map, not a scientific negative finding.
        </p>
      ) : (
        neighbourGroups.map((group) => (
          <div key={group.kind} className="kg-neighbour-group">
            <h4>
              <i style={{background: GRAPH_KIND_COLOURS[group.kind] ?? "#9bcac0"}} aria-hidden />
              {group.kind}
            </h4>
            <div className="kg-connections">
              {group.items.map((item) => (
                <button key={item.edgeId} type="button" onClick={() => choose(item.id)}>
                  <span>
                    {item.direction === "out" ? "→ " : "← "}
                    {item.label}
                  </span>
                  <small>
                    {item.direction === "out" ? "Outgoing" : "Incoming"} · {item.evidenceStatus}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
      <h3>Typed relationships · schema v{SCIENCE_TYPED_GRAPH.schemaVersion}</h3>
      {neighbourRows.map(({edge, other}) => (
        <div key={edge.id} className="science-graph-edge">
          <strong>
            {edge.subjectId === selected.id ? "Outgoing" : "Incoming"} · {edge.predicate}
          </strong>
          <p>
            {other.label} · {edge.assertionType} · {edge.evidenceStatus} · {edge.reviewStatus}
          </p>
        </div>
      ))}
      <p>
        Typed biomedical predicates are defined in schema v2; existing links remain unreviewed RELATED_TOPIC associations until
        curated. Navigation associations are not validated causality.
      </p>
      <h3>Evidence inspection</h3>
      {neighbourRows.map(({edge, other}) => (
        <button
          type="button"
          key={"inspect:" + edge.id}
          onClick={() => setInspectedEdge(edge.id)}
          aria-pressed={inspectedEdge === edge.id}
          className="science-graph-inspect"
        >
          Inspect evidence · {other.label}
        </button>
      ))}
      {dossier && (
        <section aria-label="Relationship evidence dossier" className="science-graph-dossier">
          <h4>
            {dossier.edge.subjectId} → {dossier.edge.predicate} → {dossier.edge.objectId}
          </h4>
          <p>
            Evidence status: {dossier.edge.evidenceStatus} · Review: {dossier.edge.reviewStatus}
          </p>
          {dossier.records.length === 0 && (
            <p role="status">No relationship-scoped evidence records yet — not recorded, not inferred from node background sources.</p>
          )}
          {dossier.records.map(({evidence, assessment}) => (
            <div key={evidence.id}>
              <a href={evidence.url} target="_blank" rel="noreferrer">
                {evidence.sourceType}: {evidence.sourceId}
              </a>
              <p>
                Assessment: {assessment?.stance ?? "not assessed"} · Scope: {assessment?.scope ?? "unclassified"}
              </p>
              <p>Context: {JSON.stringify(evidence.context ?? {})}</p>
            </div>
          ))}
          {dossier.warnings.map((w) => (
            <p key={w} role="status">
              {w}
            </p>
          ))}
          <p>Independent scientific review required before approval. No evidence is inferred from node-level background references.</p>
        </section>
      )}
      <GovernedResearchPanel focusNodeId={selected.id} />
      <h3>Claim provenance</h3>
      {graphClaims(selected.id).map((c) => (
        <p key={c.id}>
          {c.id} · {c.reviewState} · {c.evidenceScope}
        </p>
      ))}
      {graphSourceDetails(selected.id).map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
          {s.title}
        </a>
      ))}
      <p>Background sources do not validate individual graph relationships.</p>
    </aside>
  );

  return (
    <div className="science-body science-graph kg-page">
      <header className="kg-page-head">
        <div>
          <p className="science-body-kicker">EXPLORE / KNOWLEDGE GRAPH</p>
          <h1>Follow the connections.</h1>
          <p>
            Cross-domain educational map — find a concept, inspect its neighbourhood, then open sources. This is not a
            single-disease atlas and not a governed release.
          </p>
          <p className="kg-honesty-banner" role="note">
            Honesty: {GRAPH_HONESTY.surface.replaceAll("_", " ")} · scientific approval{" "}
            {GRAPH_HONESTY.scientificApproval ? "yes" : "no"} · clinical advice{" "}
            {GRAPH_HONESTY.clinicalAdvice ? "yes" : "no"} · layout distance has no biological meaning
          </p>
        </div>
        <nav aria-label="Graph navigation">
          <Link to="/research/knowledge-graph">Claim-linked research graph</Link>
          <Link to="/research/dashboard">Research</Link>
          <Link to="/science/body">Body Explorer</Link>
          <Link to="/science/disease">Disease mechanisms</Link>
          <Link to="/science/paths">Multi-scale paths</Link>
        </nav>
      </header>

      {showGuide && <GraphGuide onDismiss={dismissGuide} />}

      <div className="kg-surface-toggle" role="group" aria-label="Explorer view">
        <button type="button" aria-pressed={surface === "graph"} onClick={() => setSurface("graph")}>
          Graph
        </button>
        <button type="button" aria-pressed={surface === "list"} onClick={() => setSurface("list")}>
          List &amp; detail
        </button>
      </div>

      {surface === "list" ? (
        <section className="kg-list-mode" aria-label="List and detail view">
          {filterAside}
          {inspector}
        </section>
      ) : (
        <section className="kg-workspace" aria-label="Knowledge graph workspace">
          {filterAside}
          <div className="kg-stage-column">
            <div className="kg-stage-head">
              <div>
                <h2>Living health knowledge graph</h2>
                <p aria-live="polite">
                  {nodes.length} / {SCIENCE_GRAPH.nodes.length} concepts · {graph.edges.length} connections · {view} view ·
                  educational draft
                </p>
              </div>
              <a href={"/science/graph?" + params.toString()}>Bookmark this public graph view ↗</a>
            </div>
            {hidden && nodes.length > 0 && (
              <p className="kg-filter-notice" role="status">
                The inspected concept is outside this filtered view. Select a visible concept or clear filters.
              </p>
            )}
            {nodes.length === 0 ? (
              <div className="kg-empty" role="status">
                <h3>No concepts match these filters.</h3>
                <p>This describes the current dataset and filters, not an absence of biological evidence.</p>
                <button type="button" onClick={clearFilters}>
                  Clear filters and explore
                </button>
              </div>
            ) : (
              <GraphVisual
                graph={graph}
                selected={selected.id}
                onSelect={choose}
                onSelectEdge={(id) => {
                  setInspectedEdge(id);
                  const edge = graph.edges.find((e) => e.id === id);
                  if (edge && edge.subjectId !== selected.id && edge.objectId !== selected.id) {
                    update("node", edge.subjectId, false);
                  }
                }}
                caption="Educational draft · no scientific approval or clinical advice"
              />
            )}
            <p className="kg-scope-note">
              Draft educational topic map · lines indicate recorded topic connections, not validated causality. Layout
              distance has no biological meaning. Evidence states belong to individual relationships. For source-linked
              research candidates and gaps, open the deeper research graph.
            </p>
          </div>
          {inspector}
        </section>
      )}

      <div id="ssc-research-graph" className="kg-research-dataset">
        <details>
          <summary>Systemic sclerosis · separate source-linked research dataset</summary>
          <section aria-label="Versioned systemic sclerosis research graph" className="science-graph-dossier">
            <p className="science-body-kicker">PHASE 3A–3B / SOURCE-LINKED RESEARCH DRAFT</p>
            <h2>Systemic sclerosis · Tfh–IL-21–B-cell evidence map</h2>
            <p>
              This separate versioned graph is an <strong>unreviewed research draft</strong>, not an approved biomedical
              release. Published abstracts support candidate extraction only. No automatic causal inference, clinical
              efficacy claim, or graph promotion. SSc is a validation case within HSI’s cross-domain vision — not the
              whole product.
            </p>
            {sscError && <p role="status">{sscError}</p>}
            {!ssc && !sscError && <p role="status">Loading SSc source-linked graph…</p>}
            {ssc && (
              <>
                <p>
                  Dataset: {ssc.release.id} · v{ssc.release.version} · {ssc.nodes.length} concepts ·{" "}
                  {ssc.relationships.length} candidate relationships · {ssc.release.status}
                </p>
                <label>
                  Find SSc entities and identifiers{" "}
                  <input
                    type="text"
                    value={sscSearch}
                    onChange={(e) => setSscSearch(e.target.value)}
                    placeholder="Tfh, fibrosis, IL-21…"
                  />
                </label>
                <SscGraphVisual
                  nodes={sscNodes}
                  edges={ssc.relationships.filter(
                    (e) => sscNodes.some((n) => n.id === e.subjectId) && sscNodes.some((n) => n.id === e.objectId),
                  )}
                  selected={sscSelected}
                  onSelect={setSscSelected}
                />
                <div className="science-graph-nodes" role="group" aria-label="SSc research concepts">
                  {sscNodes.map((n) => (
                    <button
                      type="button"
                      key={n.id}
                      aria-pressed={sscSelected === n.id}
                      onClick={() => setSscSelected(n.id)}
                    >
                      <strong>{n.preferredLabel}</strong>
                      <small>{n.kind} · draft</small>
                    </button>
                  ))}
                </div>
                {sscNode && (
                  <aside className="science-graph-detail">
                    <h3>{sscNode.preferredLabel}</h3>
                    <p>Canonical draft ID: {sscNode.id}</p>
                    <p>
                      Ontology identifiers:{" "}
                      {sscNode.sourceIdentifiers.length
                        ? sscNode.sourceIdentifiers
                            .map((x) => x.system + ":" + x.value + " (" + x.mapping + ")")
                            .join(", ")
                        : "Not yet curated; no equivalence inferred"}
                    </p>
                    <h4>Candidate relationships and source context</h4>
                    {sscEdges.map((e) => (
                      <article key={e.id} className="science-graph-edge">
                        <strong>
                          {e.id} · {e.predicate.replaceAll("_", " ")}
                        </strong>
                        <p>
                          {ssc.nodes.find((n) => n.id === e.subjectId)?.preferredLabel} →{" "}
                          {ssc.nodes.find((n) => n.id === e.objectId)?.preferredLabel}
                        </p>
                        <p>{e.context.studyContext}</p>
                        <p>
                          Model: {e.context.model} · {e.epistemicType} · {e.reviewState}
                        </p>
                        <p>Limitations: {e.context.limitations}</p>
                        <p>Locator: {e.context.sourceLocator}</p>
                        {e.sourceEvidenceIds.map((id) => (
                          <p key={id}>
                            <a
                              href={"https://pubmed.ncbi.nlm.nih.gov/" + encodeURIComponent(id.replace("PMID:", "")) + "/"}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Source {id}
                            </a>
                          </p>
                        ))}
                      </article>
                    ))}
                  </aside>
                )}
                <h3>Comparisons requiring scientific adjudication</h3>
                {ssc.comparisonCandidates.map((c, i) => (
                  <p key={i}>
                    {c.claimIds.join(" / ")} · {c.reason}
                  </p>
                ))}
                <p>
                  <strong>Governance:</strong> source reuse rights, exact ontology mappings, independent review and
                  claim-level release approval remain pending. This public dataset contains research candidates only, not
                  patient information.
                </p>
              </>
            )}
          </section>
        </details>
      </div>
    </div>
  );
}
