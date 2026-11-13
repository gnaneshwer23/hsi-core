import { useEffect, useMemo, useState } from 'react';
import type { DomainBundle } from '../../../src/knowledgeGraph/domainGraph';
import { networkProjection, connectionGroups } from '../../../src/knowledgeGraph/networkExplorer';
import { GraphVisual, type CanvasGraph } from '../features/science/GraphVisual';
import '../styles/research-network.css';
const pretty = (s: string) => s.replaceAll('_', ' ');
export const NETWORK_KEYS = [
  'netQuery',
  'netKind',
  'netDomain',
  'netPredicate',
  'netPolarity',
  'netGaps',
  'netOrphans',
  'netScope',
  'netDepth',
] as const;
export function ResearchNetworkExplorer({
  bundle,
  selected,
  params,
  update,
  inspectEdge,
}: {
  bundle: DomainBundle;
  selected: string;
  params: URLSearchParams;
  update: (v: Record<string, string>) => void;
  inspectEdge: (id: string) => void;
}) {
  const [history, setHistory] = useState({ ids: [selected], index: 0 }),
    [list, setList] = useState(false);
  useEffect(() => {
    setHistory({ ids: [selected], index: 0 });
  }, [bundle.version]);
  useEffect(() => {
    setHistory((h) =>
      h.ids[h.index] === selected
        ? h
        : {
            ids: [...h.ids.slice(0, h.index + 1), selected].slice(-40),
            index: Math.min(h.index + 1, 39),
          },
    );
  }, [selected]);
  const f = {
    query: params.get('netQuery') ?? '',
    kind: params.get('netKind') ?? '',
    domain: params.get('netDomain') ?? '',
    predicate: params.get('netPredicate') ?? '',
    polarity: params.get('netPolarity') ?? '',
    gaps: params.get('netGaps') !== 'hide',
    orphans: params.get('netOrphans') === 'show',
    scope: params.get('netScope') ?? 'global',
    depth: Number(params.get('netDepth') ?? 1),
    model: params.get('model') ?? '',
  };
  const valid =
    (!f.kind || bundle.nodes.some((n) => n.kind === f.kind)) &&
    (!f.domain || bundle.nodes.some((n) => n.domains.includes(f.domain))) &&
    (!f.predicate || bundle.edges.some((e) => e.predicate === f.predicate)) &&
    ['', 'negative', 'nonnegative'].includes(f.polarity) &&
    ['local', 'global'].includes(f.scope) &&
    [1, 2].includes(f.depth) &&
    f.query.length <= 200 &&
    (!params.has('netGaps') || ['hide', 'show'].includes(params.get('netGaps')!)) &&
    (!params.has('netOrphans') || ['hide', 'show'].includes(params.get('netOrphans')!));
  const slice = useMemo(
    () => (valid ? networkProjection(bundle, selected, f) : { nodes: [], edges: [] }),
    [bundle, selected, params.toString(), valid],
  );
  const graph: CanvasGraph = {
    version: bundle.version,
    generatedFrom: 'Versioned candidate snapshot; filtered navigation only',
    reviewed: false,
    nodes: slice.nodes.map((n) => ({
      id: n.id,
      label: n.name,
      kind: n.kind,
      system: n.domains[0],
      description: n.aliases.join(', '),
      reviewState: 'draft',
      sourceRefs: [],
    })),
    edges: slice.edges.map((e) => ({
      id: e.id,
      subjectId: e.subjectId,
      objectId: e.objectId,
      predicate: e.predicate,
      assertionType: e.kind,
      evidenceRefs: e.sourceId ? [e.sourceId] : [],
      reviewState: 'draft',
    })),
  };
  const name = (id: string) => bundle.nodes.find((n) => n.id === id)?.name ?? id;
  const groups = connectionGroups(slice.edges, selected);
  const visit = (id: string) => update({ node: id, edge: '' });
  function move(index: number) {
    const id = history.ids[index];
    if (!id) return;
    setHistory((h) => ({ ...h, index }));
    visit(id);
  }
  const reset = () => update(Object.fromEntries(NETWORK_KEYS.map((k) => [k, ''])));
  const facet = (label: string, key: string, value: string, options: string[]) => (
    <label>
      {label}
      <select value={value} onChange={(e) => update({ [key]: e.target.value })}>
        <option value="">All</option>
        {options.sort().map((v) => (
          <option key={v} value={v}>
            {pretty(v)}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="rn-explorer" aria-label="Research network explorer">
      <nav className="rn-navigation" aria-label="Graph exploration history">
        <button disabled={history.index === 0} onClick={() => move(history.index - 1)}>
          Back
        </button>
        <button
          disabled={history.index === history.ids.length - 1}
          onClick={() => move(history.index + 1)}
        >
          Forward
        </button>
        <span>
          Exploring <strong>{name(selected)}</strong>
        </span>
        <button onClick={() => update({ netScope: f.scope === 'local' ? 'global' : 'local' })}>
          {f.scope === 'local' ? 'Open global graph' : 'Focus local graph'}
        </button>
      </nav>
      <div className="rn-layout">
        <aside className="rn-filters" aria-label="Network filters">
          <h2>Explore the network</h2>
          <p>Filter the same snapshot. Follow connections without losing the source.</p>
          <label>
            Search network
            <input
              type="search"
              maxLength={200}
              value={f.query}
              placeholder="Concept, alias or identifier"
              onChange={(e) => update({ netQuery: e.target.value })}
            />
          </label>
          <div className="rn-scope" role="group" aria-label="Network scope">
            {['global', 'local'].map((s) => (
              <button key={s} aria-pressed={f.scope === s} onClick={() => update({ netScope: s })}>
                {pretty(s)}
              </button>
            ))}
          </div>
          {f.scope === 'local' && (
            <label>
              Local depth
              <select value={f.depth} onChange={(e) => update({ netDepth: e.target.value })}>
                <option value="1">One hop</option>
                <option value="2">Two hops</option>
              </select>
            </label>
          )}
          {facet('Entity type', 'netKind', f.kind, [...new Set(bundle.nodes.map((n) => n.kind))])}
          {facet('Biological domain', 'netDomain', f.domain, [
            ...new Set(bundle.nodes.flatMap((n) => n.domains)),
          ])}
          {facet('Relationship', 'netPredicate', f.predicate, [
            ...new Set(bundle.edges.map((e) => e.predicate)),
          ])}
          <label>
            Finding direction
            <select value={f.polarity} onChange={(e) => update({ netPolarity: e.target.value })}>
              <option value="">All findings and gaps</option>
              <option value="negative">Negative findings</option>
              <option value="nonnegative">Non-negated candidates</option>
            </select>
          </label>
          <label className="rn-check">
            <input
              type="checkbox"
              checked={f.gaps}
              onChange={(e) => update({ netGaps: e.target.checked ? 'show' : 'hide' })}
            />
            Show research gaps
          </label>
          <label className="rn-check">
            <input
              type="checkbox"
              checked={f.orphans}
              onChange={(e) => update({ netOrphans: e.target.checked ? 'show' : 'hide' })}
            />
            Show unconnected concepts
          </label>
          <button onClick={reset}>Reset network filters</button>
          <details>
            <summary>Visible concepts ({slice.nodes.length})</summary>
            <div className="rn-concepts">
              {slice.nodes.map((n) => (
                <button key={n.id} aria-pressed={n.id === selected} onClick={() => visit(n.id)}>
                  {n.name}
                  <small>{pretty(n.kind)}</small>
                </button>
              ))}
            </div>
          </details>
        </aside>
        <div className="rn-network">
          <header>
            <div>
              <h2>{f.scope === 'global' ? 'Global research network' : 'Local connections'}</h2>
              <p role="status">
                {slice.nodes.length} of {bundle.nodes.length} concepts · {slice.edges.length} of{' '}
                {bundle.edges.length} relationships
              </p>
            </div>
            <button aria-pressed={list} onClick={() => setList((v) => !v)}>
              {list ? 'Show graph' : 'Show relationship list'}
            </button>
          </header>
          {!valid ? (
            <div className="rn-empty" role="alert">
              <h3>Network filter unavailable</h3>
              <p>This filter does not match the pinned snapshot. Reset filters to continue.</p>
              <button onClick={reset}>Reset network filters</button>
            </div>
          ) : !slice.nodes.length ? (
            <div className="rn-empty" role="status">
              <h3>No concepts match these filters.</h3>
              <p>This is a filtered view, not evidence of biological absence.</p>
              <button onClick={reset}>Reset network filters</button>
            </div>
          ) : (
            <>
              {!slice.nodes.some((n) => n.id === selected) && (
                <p className="rn-filter-note">
                  The inspected concept is outside these filters. Its evidence remains in the
                  inspector.
                </p>
              )}
              <div hidden={list}>
                <GraphVisual
                  graph={graph}
                  selected={selected}
                  onSelect={visit}
                  onSelectEdge={inspectEdge}
                  edgeDetails={Object.fromEntries(
                    slice.edges.map((e) => [
                      e.id,
                      {
                        negated: e.negated,
                        contextual: e.kind === 'research_gap' || e.predicate === 'studied_in',
                        label:
                          pretty(e.predicate) +
                          ' · ' +
                          (e.kind === 'research_gap'
                            ? 'Research gap'
                            : e.negated
                              ? 'Negative finding'
                              : 'Unreviewed candidate'),
                      },
                    ]),
                  )}
                  caption="Candidate network · proximity is layout, not biological evidence"
                  exportMetadata={{
                    scope: 'filtered_candidate_network',
                    graphVersion: bundle.version,
                  }}
                />
              </div>
              {list && (
                <ul className="rn-edge-list" aria-label="Visible network relationships">
                  {slice.edges.map((e) => (
                    <li key={e.id}>
                      <button onClick={() => inspectEdge(e.id)}>
                        {name(e.subjectId)} → {pretty(e.predicate)} → {name(e.objectId)}
                        <small>
                          {e.kind === 'research_gap'
                            ? 'Research gap'
                            : e.negated
                              ? 'Negative finding'
                              : 'Unreviewed candidate'}{' '}
                          · {pretty(e.model)}
                        </small>
                      </button>
                    </li>
                  ))}
                  {!slice.edges.length && <li>No relationships in this filtered view.</li>}
                </ul>
              )}
            </>
          )}
          <p className="rn-legend">
            Solid: source candidate. Dashed: negative finding. Dotted: research gap or study
            context. No relationship is independently approved in this snapshot.
          </p>
          <section className="rn-links" aria-label="Navigate connected concepts">
            <h3>Connections for {name(selected)}</h3>
            <p>
              Connections below follow the active filters. Incoming and outgoing describe recorded
              assertion direction.
            </p>
            {(['incoming', 'outgoing'] as const).map((direction) => (
              <div key={direction}>
                <h4>
                  {pretty(direction)} ({groups[direction].length})
                </h4>
                {groups[direction].map((e) => (
                  <div className="rn-link" key={e.id}>
                    <button
                      onClick={() => visit(direction === 'incoming' ? e.subjectId : e.objectId)}
                    >
                      {name(direction === 'incoming' ? e.subjectId : e.objectId)}
                    </button>
                    <button onClick={() => inspectEdge(e.id)}>
                      Inspect {pretty(e.predicate)}
                      <small>
                        {e.kind === 'research_gap'
                          ? 'Research gap'
                          : e.negated
                            ? 'Negative finding'
                            : 'Unreviewed candidate'}
                      </small>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </section>
  );
}
